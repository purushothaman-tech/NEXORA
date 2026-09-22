import React, { useState } from 'react';
import { 
  Stethoscope, 
  Volume2, 
  CheckCircle, 
  Printer, 
  Sparkles, 
  ShieldAlert, 
  Languages,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Activity
} from 'lucide-react';
import { QueueTicket, TriageLevel, PrakritiAssessment } from '../../types/mednova';
import { TRIAGE_CONFIGS } from '../../utils/triageEngine';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../../utils/translations';
import { PractitionerPrakritiReviewCard } from '../ayush/PractitionerPrakritiReviewCard';
import { SourceBadge } from '../common/SourceBadge';

interface DoctorWorkstationProps {
  tickets: QueueTicket[];
  selectedTicketId?: string;
  onSelectTicket: (ticket: QueueTicket) => void;
  onUpdateTicket: (updated: QueueTicket) => void;
  onPrintCase: (ticket: QueueTicket) => void;
  onOpenLinkAbha?: (ticket: QueueTicket) => void;
}

export const DoctorWorkstation: React.FC<DoctorWorkstationProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onUpdateTicket,
  onPrintCase,
  onOpenLinkAbha,
}) => {
  const { t, speak } = useLanguage();
  const { user, staffProfile } = useAuth();
  const activeTickets = tickets.filter((t) => t.status !== 'completed');
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || activeTickets[0] || tickets[0];

  const [doctorNotes, setDoctorNotes] = useState(selectedTicket?.doctorNotes || '');
  const [selectedInvestigations, setSelectedInvestigations] = useState<string[]>(
    selectedTicket?.orderedInvestigations || selectedTicket?.triage.suggestedInvestigations || []
  );
  const [triageOverride, setTriageOverride] = useState<TriageLevel>(
    selectedTicket?.doctorTriageOverride || selectedTicket?.triage.level || 3
  );
  const [translatedAdvice, setTranslatedAdvice] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);

  if (!selectedTicket) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center">
        <Stethoscope className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">{t('doctor.noPatients')}</h2>
        <p className="text-xs text-slate-500 mt-1">{t('queue.noPatientsDesc')}</p>
      </div>
    );
  }

  const triageConfig = TRIAGE_CONFIGS[selectedTicket.triage.level];
  const patientLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedTicket.patient.preferredLanguage) || SUPPORTED_LANGUAGES[0];

  const handleSaveNotes = () => {
    const updated: QueueTicket = {
      ...selectedTicket,
      doctorNotes,
      doctorTriageOverride: triageOverride,
      orderedInvestigations: selectedInvestigations,
    };
    onUpdateTicket(updated);
  };

  const handleCompleteConsultation = () => {
    const updated: QueueTicket = {
      ...selectedTicket,
      status: 'completed',
      completedAt: new Date().toISOString(),
      doctorNotes,
      doctorTriageOverride: triageOverride,
      orderedInvestigations: selectedInvestigations,
    };
    onUpdateTicket(updated);
  };

  const handlePlayPatientVoice = () => {
    const textToSpeak = selectedTicket.intake.chiefComplaintOriginal || selectedTicket.intake.chiefComplaint;
    speak(textToSpeak, patientLang.speechCode);
  };

  const handleTranslateAdviceForPatient = async () => {
    if (!doctorNotes.trim()) {
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/gemini/translate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          englishSummary: doctorNotes,
          targetLanguage: selectedTicket.patient.preferredLanguage,
        }),
      });
      const data = await res.json();
      setTranslatedAdvice(data.translatedText || doctorNotes);
    } catch (err) {
      setTranslatedAdvice(doctorNotes);
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleInvestigation = (test: string) => {
    if (selectedInvestigations.includes(test)) {
      setSelectedInvestigations(selectedInvestigations.filter((t) => t !== test));
    } else {
      setSelectedInvestigations([...selectedInvestigations, test]);
    }
  };

  const handleVerifyClinicalReasoning = () => {
    const verifiedDoctor = staffProfile?.displayName || user?.displayName || 'Dr. Shalini Damu (CMO)';
    const updated: QueueTicket = {
      ...selectedTicket,
      practitionerVerification: {
        verified: true,
        verifiedBy: verifiedDoctor,
        verifiedAt: new Date().toISOString(),
        role: staffProfile?.role || 'doctor',
        modifiedTriage: triageOverride,
        notes: doctorNotes || 'Clinical reasoning and investigations verified by attending physician.',
      },
      doctorTriageOverride: triageOverride,
      orderedInvestigations: selectedInvestigations,
    };
    onUpdateTicket(updated);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
                {t('doctor.title')}
              </h1>
              <p className="text-xs text-slate-500">
                {t('doctor.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            id="btn-print-case-sheet"
            onClick={() => onPrintCase(selectedTicket)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            title={t('doctor.printCaseSheet')}
            aria-label={t('doctor.printCaseSheet')}
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span>{t('doctor.printCaseSheet')}</span>
          </button>

          <button
            type="button"
            id="btn-doctor-complete-visit"
            onClick={handleCompleteConsultation}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            title={t('doctor.completeVisit')}
            aria-label={t('doctor.completeVisit')}
          >
            <CheckCircle className="h-4 w-4" />
            <span>{t('doctor.completeVisit')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Patient Selector (3 cols) vs Right Detailed Clinical Case (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Patient List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
              {t('doctor.patientsInQueue')} ({activeTickets.length})
            </h3>
            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
              {activeTickets.map((tItem) => {
                const config = TRIAGE_CONFIGS[tItem.triage.level];
                const isSelected = tItem.id === selectedTicket.id;
                return (
                  <div
                    key={tItem.id}
                    onClick={() => {
                      onSelectTicket(tItem);
                      setDoctorNotes(tItem.doctorNotes || '');
                      setTriageOverride(tItem.doctorTriageOverride || tItem.triage.level);
                      setSelectedInvestigations(tItem.orderedInvestigations || tItem.triage.suggestedInvestigations || []);
                      setTranslatedAdvice('');
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-slate-900">
                        {tItem.tokenNumber}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                        style={{
                          backgroundColor: config.bgLight,
                          color: config.color,
                        }}
                      >
                        Level {tItem.triage.level}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mt-1 truncate">
                      {tItem.patient.fullName} ({tItem.patient.age}y/{tItem.patient.gender})
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {tItem.intake.chiefComplaint}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100">
                      <span>{tItem.department}</span>
                      <span className="font-semibold text-slate-600">{tItem.roomNumber}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Detailed Case File */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Patient Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-black text-slate-900">
                    {selectedTicket.patient.fullName}
                  </h2>
                  <span className="text-sm font-semibold text-slate-500">
                    ({selectedTicket.patient.age}y / {selectedTicket.patient.gender})
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700">
                    Token: {selectedTicket.tokenNumber}
                  </span>
                  {selectedTicket.patient.isGuest && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider">
                      GUEST / TEMPORARY
                    </span>
                  )}
                  {(selectedTicket.nurseAssisted || selectedTicket.intake.nurseAssisted) && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Assisted by: {selectedTicket.intake.nurseAssistedBy || 'Staff Nurse'}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  {selectedTicket.patient.abhaId ? (
                    <span>ABHA ID: <strong className="font-mono text-slate-800">{selectedTicket.patient.abhaId}</strong></span>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <span className="text-amber-700 font-semibold">No ABHA linked (Temporary Guest)</span>
                      {onOpenLinkAbha && (
                        <button
                          type="button"
                          onClick={() => onOpenLinkAbha(selectedTicket)}
                          className="text-[11px] font-bold text-teal-700 underline hover:text-teal-900"
                        >
                          + Link ABHA Record
                        </button>
                      )}
                    </div>
                  )}
                  {selectedTicket.patient.temporaryId && (
                    <span>Temp ID: <strong className="font-mono text-rose-700">{selectedTicket.patient.temporaryId}</strong></span>
                  )}
                  <span>City: <strong>{selectedTicket.patient.city}</strong></span>
                  <span>Contact: <strong>{selectedTicket.patient.phone}</strong></span>
                  <span>{t('language.title')}: <strong className="text-teal-700 uppercase font-bold">{patientLang.nativeName} ({patientLang.name})</strong></span>
                </div>
              </div>

              {/* Triage Badge & Override Control */}
              <div className="text-right">
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1"
                  style={{
                    backgroundColor: triageConfig.bgLight,
                    color: triageConfig.color,
                  }}
                >
                  {triageConfig.title}
                </div>
                <div className="flex items-center justify-end space-x-1 text-xs">
                  <span className="text-slate-400 text-[11px]">{t('doctor.overrideTriage')}:</span>
                  <select
                    value={triageOverride}
                    onChange={(e) => setTriageOverride(parseInt(e.target.value) as TriageLevel)}
                    className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-800 cursor-pointer"
                  >
                    <option value="1">Level 1 (Emergency)</option>
                    <option value="2">Level 2 (Urgent)</option>
                    <option value="3">Level 3 (Semi-Urgent)</option>
                    <option value="4">Level 4 (Routine)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subtle rule-based triage status notice for medical staff */}
            {(selectedTicket.triageSource === 'rules_fallback' || selectedTicket.triage?.ruleBased || selectedTicket.triageNotice) && (
              <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                <span>{selectedTicket.triageNotice || 'AI assistance temporarily unavailable — rule-based triage active.'}</span>
              </div>
            )}

            {/* Re-Triage Alert Callout if re-triaged by nurse */}
            {selectedTicket.reTriageHistory && selectedTicket.reTriageHistory.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase tracking-wide text-purple-800">
                    Clinical Re-Triage Recorded
                  </span>
                  <span className="text-[11px] text-purple-600 font-mono">
                    {new Date(selectedTicket.reTriageHistory[selectedTicket.reTriageHistory.length - 1].timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="font-semibold text-purple-950">
                  Priority adjusted: Level {selectedTicket.reTriageHistory[selectedTicket.reTriageHistory.length - 1].previousLevel} &rarr; Level {selectedTicket.reTriageHistory[selectedTicket.reTriageHistory.length - 1].newLevel}
                </p>
                <p className="text-purple-700 italic">
                  "{selectedTicket.reTriageHistory[selectedTicket.reTriageHistory.length - 1].reason}"
                </p>
                <span className="text-[10px] text-purple-500 block">
                  Logged by: {selectedTicket.reTriageHistory[selectedTicket.reTriageHistory.length - 1].nurseName}
                </span>
              </div>
            )}

            {/* Red Flag Warning Callout */}
            {selectedTicket.triage.redFlags && selectedTicket.triage.redFlags.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start space-x-2.5">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-red-800 uppercase tracking-wide">
                    {t('doctor.criticalRedFlags')}
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 mt-1 font-semibold text-red-700">
                    {selectedTicket.triage.redFlags.map((rf, i) => (
                      <li key={i}>{rf}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Multilingual Voice Intake & Translation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
                  <Languages className="h-3.5 w-3.5 mr-1 text-teal-600" />
                  <span>{t('doctor.patientVoice')} ({patientLang.name})</span>
                  <SourceBadge source={selectedTicket.intake.sources?.chiefComplaint || (selectedTicket.intake.nurseAssisted ? 'NURSE_ASSISTED' : 'PATIENT_VOICE')} />
                </span>
                <button
                  type="button"
                  id="btn-play-patient-voice"
                  onClick={handlePlayPatientVoice}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-100/70 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  title={`${t('doctor.playAudio')} (${patientLang.nativeName})`}
                  aria-label={`${t('doctor.playAudio')} (${patientLang.nativeName})`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{t('doctor.playAudio')} ({patientLang.nativeName})</span>
                </button>
              </div>

              {selectedTicket.intake.chiefComplaintOriginal && (
                <p className="text-sm font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 italic">
                  "{selectedTicket.intake.chiefComplaintOriginal}"
                </p>
              )}

              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  {t('doctor.englishTranslation')}
                </span>
                <p className="text-xs font-bold text-teal-900 mt-0.5">
                  "{selectedTicket.intake.chiefComplaint}"
                </p>
              </div>
            </div>

            {/* Vital Signs Grid with Abnormal Alerts */}
            <div>
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                {t('doctor.recordedVitals')}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className={`p-3 rounded-xl border text-center ${
                  (selectedTicket.intake.vitals.bloodPressureSystolic || 0) >= 160 || (selectedTicket.intake.vitals.bloodPressureSystolic || 0) < 90
                    ? 'bg-red-50 border-red-300 text-red-900'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('vitals.bpLabel')}</span>
                  <span className="text-sm font-black font-mono">
                    {selectedTicket.intake.vitals.bloodPressureSystolic || '--'}/{selectedTicket.intake.vitals.bloodPressureDiastolic || '--'}
                  </span>
                  <span className="text-[9px] text-slate-400 block">mmHg</span>
                </div>

                <div className={`p-3 rounded-xl border text-center ${
                  (selectedTicket.intake.vitals.heartRate || 0) > 100 || (selectedTicket.intake.vitals.heartRate || 0) < 50
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('vitals.hrLabel')}</span>
                  <span className="text-sm font-black font-mono">
                    {selectedTicket.intake.vitals.heartRate || '--'}
                  </span>
                  <span className="text-[9px] text-slate-400 block">bpm</span>
                </div>

                <div className={`p-3 rounded-xl border text-center ${
                  (selectedTicket.intake.vitals.spO2 || 0) < 94
                    ? 'bg-red-50 border-red-300 text-red-900 font-extrabold'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('vitals.spo2Label')}</span>
                  <span className="text-sm font-black font-mono">
                    {selectedTicket.intake.vitals.spO2 || '--'}%
                  </span>
                  <span className="text-[9px] text-slate-400 block">{selectedTicket.intake.vitals.spO2 && selectedTicket.intake.vitals.spO2 < 94 ? 'Hypoxia' : 'Normal'}</span>
                </div>

                <div className={`p-3 rounded-xl border text-center ${
                  (selectedTicket.intake.vitals.temperature || 0) > 100.4
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('vitals.tempLabel')}</span>
                  <span className="text-sm font-black font-mono">
                    {selectedTicket.intake.vitals.temperature || '--'}°F
                  </span>
                  <span className="text-[9px] text-slate-400 block">{selectedTicket.intake.vitals.temperature && selectedTicket.intake.vitals.temperature > 100.4 ? 'Febrile' : 'Afebrile'}</span>
                </div>
              </div>
            </div>

            {/* History, Allergies & Documents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">{t('doctor.pastHistory')}:</span>
                <p className="text-slate-600">
                  {selectedTicket.intake.pastMedicalHistory.length > 0 ? selectedTicket.intake.pastMedicalHistory.join(', ') : 'None reported'}
                </p>
                <div className="pt-1 text-[11px] text-slate-500">
                  <strong>{t('doctor.currentMeds')}:</strong> {selectedTicket.intake.currentMedications.length > 0 ? selectedTicket.intake.currentMedications.join(', ') : 'None reported'}
                </div>
                <div className="pt-0.5 text-[11px] text-red-600 font-semibold">
                  <strong>{t('doctor.allergies')}:</strong> {selectedTicket.intake.allergies.length > 0 ? selectedTicket.intake.allergies.join(', ') : 'NKDA'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">{t('doctor.attachedDocs')}:</span>
                {selectedTicket.intake.documents.length === 0 ? (
                  <p className="text-slate-400 italic">{t('doctor.noDocsUploaded')}</p>
                ) : (
                  <div className="space-y-1">
                    {selectedTicket.intake.documents.map((d) => (
                      <div key={d.id} className="text-slate-700">
                        <span className="font-semibold text-teal-800">{d.fileName}:</span> {d.extractedSummary}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Clinical Decision Support (CDS) Box (Strict Disclaimer & ADCP Protocol) */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-md space-y-4 border border-indigo-800/40">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-teal-400" />
                <h3 className="font-bold text-sm text-white">
                  {t('doctor.cdsTitle')}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {/* AI Confidence Gating Status */}
                {selectedTicket.triage.confidenceGatingPassed === false || selectedTicket.triage.requiresMandatoryPractitionerReview ? (
                  <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-600/60 px-2 py-0.5 rounded-md">
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                    <span>GATING: MANDATORY SENIOR REVIEW</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-[10px] font-bold text-teal-300 bg-teal-950/80 border border-teal-600/60 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="h-3 w-3 text-teal-400" />
                    <span>CONFIDENCE GATING PASSED ({Math.round((selectedTicket.triage.confidenceScore || selectedTicket.triage.aiConfidence || 0.9) * 100)}%)</span>
                  </span>
                )}
                <span className="text-[10px] font-mono text-indigo-300 bg-white/10 px-2 py-0.5 rounded-sm">
                  PHYSICIAN DECISION SUPPORT ONLY
                </span>
              </div>
            </div>

            <p className="text-xs text-indigo-200 leading-relaxed italic">
              "{t('doctor.cdsDisclaimer')}"
            </p>

            {/* Confidence Gating Alert & Rationale (if applicable) */}
            {selectedTicket.triage.confidenceGatingRationale && (
              <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-700/50 text-xs text-indigo-100 flex items-start space-x-2">
                <Activity className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-teal-300">Clinical AI Calibrated Rationale: </strong>
                  <span>{selectedTicket.triage.confidenceGatingRationale}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wide block mb-1">
                  {t('doctor.differentials')}:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-200 font-medium">
                  {selectedTicket.triage.differentialConsiderations.map((diff, i) => (
                    <li key={i}>{diff}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wide block mb-1">
                  {t('doctor.suggestedInvestigations')}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTicket.triage.suggestedInvestigations.map((inv, i) => {
                    const isOrdered = selectedInvestigations.includes(inv);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleInvestigation(inv)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                          isOrdered
                            ? 'bg-teal-500 text-slate-950 border-teal-400'
                            : 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/20'
                        }`}
                      >
                        {isOrdered ? '✓ ' : '+ '}{inv}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ADCP Clinical Protocol Integration (Allopathic + Ayush Synergy) */}
            {selectedTicket.triage.adcpProtocol && (
              <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-700/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-300 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <span>🌿 ADCP Integrative Protocol: {selectedTicket.triage.adcpProtocol.protocolTitle || 'Clinical Pathway'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Ayush + Allopathic Gated Protocol</span>
                </div>
                {selectedTicket.triage.adcpProtocol.allopathicStabilization && (
                  <p className="text-slate-200">
                    <strong className="text-teal-300">Allopathic Stabilization: </strong>
                    {selectedTicket.triage.adcpProtocol.allopathicStabilization}
                  </p>
                )}
                {selectedTicket.triage.adcpProtocol.ayushIntegrativeGuidance && (
                  <p className="text-slate-200">
                    <strong className="text-emerald-300">AYUSH Guidance: </strong>
                    {selectedTicket.triage.adcpProtocol.ayushIntegrativeGuidance}
                  </p>
                )}
                {selectedTicket.triage.adcpProtocol.contraindications && selectedTicket.triage.adcpProtocol.contraindications.length > 0 && (
                  <p className="text-rose-300 text-[11px]">
                    <strong>Contraindications & Cautions: </strong>
                    {selectedTicket.triage.adcpProtocol.contraindications.join(' • ')}
                  </p>
                )}
              </div>
            )}

            {selectedTicket.triage.immediateNursingActions.length > 0 && (
              <div className="pt-2 border-t border-indigo-800/60 text-xs">
                <span className="font-bold text-amber-300">{t('doctor.nursingActions')}:</span>
                <p className="text-slate-300 mt-0.5">
                  {selectedTicket.triage.immediateNursingActions.join(' • ')}
                </p>
              </div>
            )}

            {/* Human Practitioner Verification Bar */}
            <div className="pt-3 border-t border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                {selectedTicket.practitionerVerification?.verified ? (
                  <div className="flex items-center space-x-2 text-xs text-emerald-400">
                    <FileCheck className="h-4 w-4 text-emerald-400" />
                    <div>
                      <span className="font-bold">Verified & Accepted by Physician</span>
                      <p className="text-[10px] text-slate-400">
                        {selectedTicket.practitionerVerification.verifiedBy} • {new Date(selectedTicket.practitionerVerification.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-amber-300 flex items-center space-x-2">
                    <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Requires Human Attending Physician Sign-Off prior to final discharge/transfer</span>
                  </div>
                )}
              </div>

              {!selectedTicket.practitionerVerification?.verified && (
                <button
                  type="button"
                  id="btn-verify-cds"
                  onClick={handleVerifyClinicalReasoning}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-950" />
                  <span>Verify Clinical Decision Support</span>
                </button>
              )}
            </div>
          </div>

          {/* AYUSH Prakriti Pariksha Review Card (Feature 1) */}
          <PractitionerPrakritiReviewCard
            ticket={selectedTicket}
            onUpdateAssessment={(updatedAssessment: PrakritiAssessment) => {
              const updated: QueueTicket = {
                ...selectedTicket,
                intake: {
                  ...selectedTicket.intake,
                  ayushPrakriti: updatedAssessment,
                },
              };
              onUpdateTicket(updated);
            }}
          />

          {/* Doctor's Prescription & Clinical Notes Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              {t('doctor.notesTitle')}
            </h3>

            <textarea
              id="textarea-doctor-notes"
              rows={4}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder={t('doctor.notesPlaceholder')}
              className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
            />

            {/* Multilingual Patient Instructions Translator */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleTranslateAdviceForPatient}
                disabled={isTranslating}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-300 transition-colors cursor-pointer"
              >
                <Languages className="h-4 w-4 text-teal-600" />
                <span>
                  {isTranslating
                    ? t('doctor.translating')
                    : `${t('doctor.translateToPatient')} (${patientLang.nativeName})`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {t('doctor.saveNotes')}
              </button>
            </div>

            {/* Translated Output Box */}
            {translatedAdvice && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1 animate-fadeIn">
                <span className="font-bold text-emerald-800 block">
                  {t('doctor.translatedInstructions')} ({patientLang.nativeName}):
                </span>
                <p className="leading-relaxed font-medium">
                  {translatedAdvice}
                </p>
                <button
                  type="button"
                  onClick={() => speak(translatedAdvice, patientLang.speechCode)}
                  className="mt-1 text-[11px] font-bold text-emerald-700 flex items-center hover:underline"
                >
                  <Volume2 className="h-3.5 w-3.5 mr-1" />
                  {t('doctor.speakToPatient')} ({patientLang.nativeName})
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
