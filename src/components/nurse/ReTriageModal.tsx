import React, { useState } from 'react';
import { RefreshCw, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { QueueTicket, TriageLevel, NurseUser } from '../../types/mednova';
import { TRIAGE_CONFIGS } from '../../utils/triageEngine';

interface ReTriageModalProps {
  ticket: QueueTicket | null;
  nurseUser?: NurseUser | null;
  nurseName?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReTriage?: (
    ticketId: string,
    newLevel: TriageLevel,
    reason: string,
    nurseName: string
  ) => void;
  onReTriageSuccess?: (
    updatedTicket: QueueTicket,
    auditEntry: {
      action: string;
      previousValue: string;
      newValue: string;
      reason: string;
    }
  ) => void;
}

export const ReTriageModal: React.FC<ReTriageModalProps> = ({
  ticket,
  nurseUser,
  nurseName,
  isOpen,
  onClose,
  onConfirmReTriage,
  onReTriageSuccess,
}) => {
  if (!isOpen || !ticket) return null;

  const activeNurseName = nurseName || nurseUser?.name || 'Staff Nurse';
  const [selectedLevel, setSelectedLevel] = useState<TriageLevel>(ticket.triage.level);
  const [reason, setReason] = useState('');
  const [newSpO2, setNewSpO2] = useState(ticket.intake.vitals?.spO2 || 98);
  const [newPain, setNewPain] = useState(ticket.intake.vitals?.painScore || 5);
  const [errorMsg, setErrorMsg] = useState('');

  const currentLevelConfig = TRIAGE_CONFIGS[ticket.triage.level];
  const targetLevelConfig = TRIAGE_CONFIGS[selectedLevel];

  const handleApplyReTriage = () => {
    if (!reason.trim()) {
      setErrorMsg('Clinical rationale is required for modifying triage level.');
      return;
    }

    const previousLevel = ticket.triage.level;
    const updatedWaitMinutes = targetLevelConfig.maxWaitTimeMinutes;

    const reTriageRecord = {
      timestamp: new Date().toISOString(),
      previousLevel,
      newLevel: selectedLevel,
      reason: reason.trim(),
      nurseName: activeNurseName,
      updatedWaitMinutes,
    };

    if (onConfirmReTriage) {
      onConfirmReTriage(ticket.id, selectedLevel, reason.trim(), activeNurseName);
    }

    if (onReTriageSuccess) {
      const updatedTicket: QueueTicket = {
        ...ticket,
        triage: {
          ...ticket.triage,
          level: selectedLevel,
          isEmergency: selectedLevel === 1,
          priorityRationale: `[Nurse Re-Triage by ${activeNurseName}]: ${reason.trim()} (Previously Level ${previousLevel})`,
        },
        intake: {
          ...ticket.intake,
          vitals: {
            ...ticket.intake.vitals,
            spO2: Number(newSpO2),
            painScore: Number(newPain),
          },
        },
        estimatedWaitMinutes: updatedWaitMinutes,
        priorityRank: selectedLevel === 1 ? 9999 : selectedLevel === 2 ? 5000 : 1000,
        reTriageHistory: [...(ticket.reTriageHistory || []), reTriageRecord],
      };

      onReTriageSuccess(updatedTicket, {
        action: `Dynamic Re-Triage (Level ${previousLevel} -> Level ${selectedLevel})`,
        previousValue: `Level ${previousLevel} (${currentLevelConfig.title})`,
        newValue: `Level ${selectedLevel} (${targetLevelConfig.title})`,
        reason: reason.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="re-triage-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-amber-200 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Dynamic Nurse Re-Triage</h3>
              <p className="text-xs text-amber-100">
                Patient: <span className="font-semibold">{ticket.patient.fullName}</span> • Token {ticket.tokenNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-retriage"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Current vs Proposed Priority */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Current Priority
              </div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${currentLevelConfig.badgeBg} ${currentLevelConfig.badgeText}`}>
                Level {ticket.triage.level} • {currentLevelConfig.title}
              </span>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-400" />

            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Revised Priority
              </div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${targetLevelConfig.badgeBg} ${targetLevelConfig.badgeText}`}>
                Level {selectedLevel} • {targetLevelConfig.title}
              </span>
            </div>
          </div>

          {/* Quick Vital signs update triggers */}
          <div className="grid grid-cols-2 gap-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Current SpO2 (%)
              </label>
              <input
                type="number"
                id="input-retriage-spo2"
                min={50}
                max={100}
                value={newSpO2}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setNewSpO2(val);
                  if (val < 90 && selectedLevel > 1) setSelectedLevel(1);
                  else if (val < 94 && selectedLevel > 2) setSelectedLevel(2);
                }}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Pain Severity (0 - 10)
              </label>
              <input
                type="number"
                id="input-retriage-pain"
                min={0}
                max={10}
                value={newPain}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setNewPain(val);
                  if (val >= 8 && selectedLevel > 2) setSelectedLevel(2);
                }}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* Level Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Revised Clinical Triage Level
            </label>
            <div className="grid grid-cols-1 gap-2">
              {([1, 2, 3, 4] as TriageLevel[]).map((lvl) => {
                const cfg = TRIAGE_CONFIGS[lvl];
                const isSelected = selectedLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`p-3 text-left rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50 shadow-sm ring-1 ring-amber-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cfg.badgeBg} ${cfg.badgeText}`}>
                          Level {lvl}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{cfg.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{cfg.subTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-600 block">
                        Wait: &le; {cfg.maxWaitTimeMinutes}m
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rationale Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Clinical Justification for Re-Triage <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              id="textarea-retriage-reason"
              placeholder="e.g., Acute deterioration noted: patient became clammy, SpO2 dropped from 97% to 89%, severe chest heaviness escalated to 9/10."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setReason('Patient condition deteriorated in waiting room; increased respiratory distress and cyanosis.')}
                className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
              >
                + Respiratory Distress
              </button>
              <button
                type="button"
                onClick={() => setReason('Severe sudden pain surge reported with diaphoresis.')}
                className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
              >
                + Sudden Pain Surge
              </button>
              <button
                type="button"
                onClick={() => setReason('Patient stable after oral rehydration and rest; pain decreased.')}
                className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
              >
                + Patient Stabilized
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2 font-medium">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Audited by: <span className="font-semibold text-slate-700">{nurseName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-confirm-retriage"
              onClick={handleApplyReTriage}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm & Recalculate Queue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
