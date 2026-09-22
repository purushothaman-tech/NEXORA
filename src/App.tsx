import React, { useState, useEffect } from 'react';
import { QueueTicket, NurseUser, AuditLogEntry, TriageLevel } from './types/mednova';
import { INITIAL_SAMPLE_TICKETS } from './data/samplePatients';
import { INITIAL_SAMPLE_AUDIT_LOGS } from './data/sampleAuditLogs';
import { Header } from './components/common/Header';
import { EmergencyBanner } from './components/common/EmergencyBanner';
import { CaregivingBanner } from './components/nurse/CaregivingBanner';
import { NurseLoginModal } from './components/nurse/NurseLoginModal';
import { ReTriageModal } from './components/nurse/ReTriageModal';
import { AuditTrailModal } from './components/nurse/AuditTrailModal';
import { LinkAbhaModal } from './components/common/LinkAbhaModal';
import { IntakeWizard } from './components/intake/IntakeWizard';
import { QueueDashboard } from './components/queue/QueueDashboard';
import { DoctorWorkstation } from './components/doctor/DoctorWorkstation';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { PublicDisplayModal } from './components/queue/PublicDisplayModal';
import { CaseSummaryPrintModal } from './components/doctor/CaseSummaryPrintModal';
import { LanguageModal } from './components/common/LanguageModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  subscribeToQueueTickets,
  subscribeToAuditLogs,
  saveQueueTicket,
  saveAuditLogInFirestore,
  seedInitialFirestoreDataIfNeeded,
} from './lib/firestoreService';

function MedNovaMain() {
  const [activeTab, setActiveTab] = useState<'intake' | 'queue' | 'doctor' | 'analytics'>('intake');
  const { language, setLanguage, isLanguageModalOpen, closeLanguageModal, t } = useLanguage();
  const { user, staffProfile } = useAuth();
  const [tickets, setTickets] = useState<QueueTicket[]>(INITIAL_SAMPLE_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(INITIAL_SAMPLE_TICKETS[0]?.id || '');
  const [showPublicDisplay, setShowPublicDisplay] = useState(false);
  const [printModalTicket, setPrintModalTicket] = useState<QueueTicket | null>(null);

  // Caregiving & Nurse State (Feature 2 & 3)
  const [nurseUser, setNurseUser] = useState<NurseUser | null>(null);
  const [isNurseLoginOpen, setIsNurseLoginOpen] = useState(false);
  const [linkAbhaTicket, setLinkAbhaTicket] = useState<QueueTicket | null>(null);
  const [reTriageTicket, setReTriageTicket] = useState<QueueTicket | null>(null);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'connected' | 'reconnecting' | 'synced'>('connected');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_SAMPLE_AUDIT_LOGS);

  // Sync authenticated staff with NurseUser if role is nurse
  useEffect(() => {
    if (staffProfile && staffProfile.role === 'nurse') {
      setNurseUser({
        id: staffProfile.id,
        nurseId: staffProfile.id.slice(0, 8).toUpperCase(),
        name: staffProfile.displayName,
        badgeNumber: staffProfile.badgeNumber || 'MED-NURSE-01',
        department: staffProfile.department || 'General Medicine OPD',
        shift: 'morning',
        role: 'nurse',
      });
    }
  }, [staffProfile]);

  // Real-time Firestore synchronization for clinical tickets and ABDM audit logs
  useEffect(() => {
    // Seed initial dataset if Firestore is newly initialized
    seedInitialFirestoreDataIfNeeded(INITIAL_SAMPLE_TICKETS, INITIAL_SAMPLE_AUDIT_LOGS);

    const unsubTickets = subscribeToQueueTickets(
      (liveTickets) => {
        if (liveTickets && liveTickets.length > 0) {
          setTickets(liveTickets);
        }
        setCloudSyncStatus('synced');
      },
      (err) => {
        setCloudSyncStatus('reconnecting');
      }
    );

    const unsubAudit = subscribeToAuditLogs(
      (liveLogs) => {
        if (liveLogs && liveLogs.length > 0) {
          setAuditLogs(liveLogs);
        }
        setCloudSyncStatus('synced');
      },
      (err) => {
        setCloudSyncStatus('reconnecting');
      }
    );

    return () => {
      if (unsubTickets) unsubTickets();
      if (unsubAudit) unsubAudit();
    };
  }, []);

  // High-priority emergency tickets waiting for attention
  const activeEmergencyTickets = tickets.filter(
    (t) => t.triage.level === 1 && t.status !== 'completed'
  );

  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    saveAuditLogInFirestore(newLog).catch((err) =>
      console.warn('ABDM audit log cloud persistence note:', err?.message)
    );
  };

  const handleTicketCreated = (newTicket: QueueTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicketId(newTicket.id);

    // Save ticket to Firestore
    saveQueueTicket(newTicket).catch((err) =>
      console.warn('Queue ticket cloud persistence note:', err?.message)
    );

    // Record in ABDM Audit Log
    addAuditLog({
      userId: nurseUser ? nurseUser.id : (user?.uid || 'PATIENT-KIOSK'),
      userName: nurseUser ? nurseUser.name : (user?.displayName || 'Patient Self-Service'),
      userRole: nurseUser
        ? 'nurse'
        : (staffProfile?.role === 'doctor'
            ? 'doctor'
            : staffProfile?.role === 'admin'
            ? 'admin'
            : 'patient'),
      patientId: newTicket.patient.id,
      patientName: newTicket.patient.fullName,
      action: newTicket.patient.isEmergencyGuest
        ? 'Emergency Guest Fast-Track Admission'
        : 'Clinical Intake Completed',
      previousValue: 'None',
      newValue: `Token ${newTicket.tokenNumber} assigned. Priority Level ${newTicket.triage.level}`,
      source: nurseUser ? 'NURSE_ASSISTED' : (newTicket.intake.inputMode === 'voice' ? 'PATIENT_VOICE' : 'PATIENT_TOUCH'),
    });
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: QueueTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updated: QueueTicket = {
            ...t,
            status: newStatus,
            calledAt: newStatus === 'called' ? new Date().toISOString() : t.calledAt,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : t.completedAt,
          };
          saveQueueTicket(updated).catch((err) =>
            console.warn('Ticket status update note:', err?.message)
          );
          return updated;
        }
        return t;
      })
    );
  };

  const handleUpdateTicket = (updatedTicket: QueueTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );
    saveQueueTicket(updatedTicket).catch((err) =>
      console.warn('Ticket update note:', err?.message)
    );
  };

  const handleSelectTicketForDoctor = (ticket: QueueTicket) => {
    setSelectedTicketId(ticket.id);
    setActiveTab('doctor');
  };

  const handleLinkAbha = (ticketId: string, abhaId: string, verifiedName?: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          addAuditLog({
            userId: nurseUser ? nurseUser.id : (user?.uid || 'STAFF-ADM-01'),
            userName: nurseUser ? nurseUser.name : (user?.displayName || 'Registration Staff'),
            userRole: nurseUser ? 'nurse' : 'admin',
            patientId: t.patient.id,
            patientName: verifiedName || t.patient.fullName,
            action: 'ABHA Identification Linked to Temporary Record',
            previousValue: `Unlinked (Temp ID: ${t.patient.temporaryId || 'None'})`,
            newValue: `ABHA: ${abhaId} (Verified Profile Linked)`,
            source: 'DOCUMENT_OCR',
          });

          const updated: QueueTicket = {
            ...t,
            patient: {
              ...t.patient,
              abhaId,
              abhaLinked: true,
              isGuest: false,
              isEmergencyGuest: false,
              fullName: verifiedName || t.patient.fullName,
            },
          };
          saveQueueTicket(updated).catch((err) =>
            console.warn('Ticket ABHA link note:', err?.message)
          );
          return updated;
        }
        return t;
      })
    );
  };

  const handleReTriage = (ticketId: string, newLevel: TriageLevel, reason: string, nurseName: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const oldLevel = t.triage.level;
          const reTriageEntry = {
            timestamp: new Date().toISOString(),
            previousLevel: oldLevel,
            newLevel,
            reason,
            nurseName,
            updatedWaitMinutes: newLevel === 1 ? 0 : t.estimatedWaitMinutes,
          };

          addAuditLog({
            userId: nurseUser ? nurseUser.id : (user?.uid || 'NURSE-ON-DUTY'),
            userName: nurseName,
            userRole: 'nurse',
            patientId: t.patient.id,
            patientName: t.patient.fullName,
            action: `Dynamic Re-Triage (Level ${oldLevel} -> Level ${newLevel})`,
            previousValue: `Level ${oldLevel}`,
            newValue: `Level ${newLevel} - ${reason}`,
            source: 'NURSE_ASSISTED',
          });

          const updated: QueueTicket = {
            ...t,
            triage: {
              ...t.triage,
              level: newLevel,
              isEmergency: newLevel === 1,
            },
            priorityRank: newLevel === 1 ? 9999 : newLevel === 2 ? 2000 : t.priorityRank,
            reTriageHistory: [...(t.reTriageHistory || []), reTriageEntry],
          };
          saveQueueTicket(updated).catch((err) =>
            console.warn('Ticket retriage note:', err?.message)
          );
          return updated;
        }
        return t;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-teal-500 selection:text-white">
      
      {/* Top Application Header with Navigation & Multilingual Selector */}
      <Header
        currentTab={activeTab}
        onTabChange={setActiveTab}
        waitingCount={tickets.filter(t => t.status === 'waiting' || t.status === 'called').length}
        emergencyCount={activeEmergencyTickets.length}
        audioEnabled={true}
        onToggleAudio={() => {}}
        cloudSyncStatus={cloudSyncStatus}
        isNurseActive={!!nurseUser}
        nurseName={nurseUser?.name}
        onOpenNurseModal={() => setIsNurseLoginOpen(true)}
        onOpenAuditTrail={() => setIsAuditTrailOpen(true)}
      />

      {/* Nurse / Caregiving Active Banner (Feature 3) */}
      {nurseUser && (
        <CaregivingBanner
          nurse={{
            nurseId: nurseUser.nurseId || nurseUser.id,
            nurseName: nurseUser.nurseName || nurseUser.name,
            department: nurseUser.department,
          }}
          assistingPatient={null}
          onSelectPatient={() => setActiveTab('queue')}
          onExitCareMode={() => {
            addAuditLog({
              userId: nurseUser.id,
              userName: nurseUser.name,
              userRole: 'nurse',
              patientId: 'SYSTEM',
              patientName: 'Staff Session',
              action: 'Caregiver Session Ended',
              previousValue: `Nurse-Assisted (${nurseUser.name})`,
              newValue: 'Patient Self-Service Mode Restored',
              source: 'NURSE_ASSISTED',
            });
            setNurseUser(null);
          }}
          onOpenReTriage={() => {
            const firstActive = tickets.find((t) => t.status !== 'completed');
            if (firstActive) {
              setReTriageTicket(firstActive);
            }
          }}
          onOpenAuditTrail={() => setIsAuditTrailOpen(true)}
        />
      )}

      {/* Immediate Emergency Alert Banner for Priority 1 Resuscitation Cases */}
      {activeEmergencyTickets.length > 0 && (
        <EmergencyBanner
          emergencyTickets={activeEmergencyTickets}
          onReviewTicket={handleSelectTicketForDoctor}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1">
        <ErrorBoundary sectionName="MedNova Workspace">
          {activeTab === 'intake' && (
            <IntakeWizard
              language={language}
              onTicketCreated={handleTicketCreated}
              onViewQueue={() => setActiveTab('queue')}
              isNurseMode={!!nurseUser}
              nurseUser={nurseUser}
              onOpenNurseLogin={() => setIsNurseLoginOpen(true)}
            />
          )}

          {activeTab === 'queue' && (
            <QueueDashboard
              tickets={tickets}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onSelectTicketForDoctor={handleSelectTicketForDoctor}
              onOpenPublicDisplay={() => setShowPublicDisplay(true)}
              onOpenLinkAbha={(ticket) => setLinkAbhaTicket(ticket)}
              onOpenReTriage={(ticket) => setReTriageTicket(ticket)}
            />
          )}

          {activeTab === 'doctor' && (
            <DoctorWorkstation
              tickets={tickets}
              selectedTicketId={selectedTicketId}
              onSelectTicket={(t) => setSelectedTicketId(t.id)}
              onUpdateTicket={handleUpdateTicket}
              onPrintCase={(t) => setPrintModalTicket(t)}
              onOpenLinkAbha={(ticket) => setLinkAbhaTicket(ticket)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard tickets={tickets} />
          )}
        </ErrorBoundary>
      </main>

      {/* Nurse Authentication Modal (Feature 3) */}
      <NurseLoginModal
        isOpen={isNurseLoginOpen}
        onClose={() => setIsNurseLoginOpen(false)}
        onLoginSuccess={(nurseData) => {
          const nurse: NurseUser = {
            id: nurseData.nurseId,
            name: nurseData.nurseName,
            nurseId: nurseData.nurseId,
            nurseName: nurseData.nurseName,
            role: 'nurse',
            badgeNumber: nurseData.nurseId,
            department: nurseData.department,
            shift: 'morning',
          };
          setNurseUser(nurse);
          addAuditLog({
            userId: nurse.id,
            userName: nurse.name,
            userRole: 'nurse',
            patientId: 'SYSTEM',
            patientName: 'Staff Session',
            action: 'Caregiver Session Initiated',
            previousValue: 'Patient Self-Service Mode',
            newValue: `Nurse-Assisted Mode Activated (${nurse.department})`,
            source: 'NURSE_ASSISTED',
          });
        }}
      />

      {/* Dynamic Re-Triage Modal (Feature 3) */}
      <ReTriageModal
        isOpen={!!reTriageTicket}
        ticket={reTriageTicket}
        nurseUser={nurseUser}
        onClose={() => setReTriageTicket(null)}
        onConfirmReTriage={(ticketId, newLevel, reason, nurseName) => {
          handleReTriage(ticketId, newLevel, reason, nurseName);
          setReTriageTicket(null);
        }}
      />

      {/* Link ABHA Modal (Feature 2) */}
      {linkAbhaTicket && (
        <LinkAbhaModal
          isOpen={!!linkAbhaTicket}
          ticket={linkAbhaTicket}
          onClose={() => setLinkAbhaTicket(null)}
          onLinkSuccess={(updatedTicket) => {
            handleUpdateTicket(updatedTicket);
            addAuditLog({
              userId: nurseUser ? nurseUser.id : 'STAFF-ADM-01',
              userName: nurseUser ? nurseUser.name : 'Registration Staff',
              userRole: nurseUser ? 'nurse' : 'admin',
              patientId: updatedTicket.patient.id,
              patientName: updatedTicket.patient.fullName,
              action: 'ABHA Identification Linked to Temporary Record',
              previousValue: `Unlinked (Temp ID: ${linkAbhaTicket.patient.temporaryId || 'None'})`,
              newValue: `ABHA: ${updatedTicket.patient.abhaId} (Verified Profile Linked)`,
              source: 'DOCUMENT_OCR',
            });
            setLinkAbhaTicket(null);
          }}
        />
      )}

      {/* ABDM Clinical Audit Trail Modal (Feature 2 & 3) */}
      <AuditTrailModal
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
        logs={auditLogs}
      />

      {/* Fullscreen Waiting Hall TV Display Modal */}
      {showPublicDisplay && (
        <PublicDisplayModal
          tickets={tickets}
          onClose={() => setShowPublicDisplay(false)}
        />
      )}

      {/* Official OPD Case Summary Sheet Printable Modal */}
      {printModalTicket && (
        <CaseSummaryPrintModal
          ticket={printModalTicket}
          onClose={() => setPrintModalTicket(null)}
        />
      )}

      {/* Global Accessible Language Selection Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={closeLanguageModal}
      />

      {/* Hospital Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-800">{t('app.title')}</span>
          <span>•</span>
          <span className="italic">"{t('app.tagline')}"</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-slate-400">
          <span>{t('app.abdmCompliant')}</span>
          <span>•</span>
          <span>{t('app.esiTriage')}</span>
          <span>•</span>
          <span>{t('app.aiDecisionSupport')}</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsAuditTrailOpen(true)}
            className="hover:text-slate-600 underline cursor-pointer"
          >
            Audit Trail
          </button>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MedNovaMain />
    </AuthProvider>
  );
}
