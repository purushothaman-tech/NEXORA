import React from 'react';
import { HeartHandshake, UserCheck, RefreshCw, History, LogOut, AlertOctagon, User } from 'lucide-react';
import { PatientDemographics } from '../../types/mednova';

interface CaregivingBannerProps {
  nurse: { nurseId: string; nurseName: string; department: string };
  assistingPatient: PatientDemographics | null;
  onSelectPatient: () => void;
  onOpenReTriage: () => void;
  onOpenAuditTrail: () => void;
  onExitCareMode: () => void;
}

export const CaregivingBanner: React.FC<CaregivingBannerProps> = ({
  nurse,
  assistingPatient,
  onSelectPatient,
  onOpenReTriage,
  onOpenAuditTrail,
  onExitCareMode,
}) => {
  return (
    <aside 
      aria-label="Caregiving Mode Controls"
      id="caregiving-active-banner"
      className="bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md border-b border-amber-600 flex flex-wrap items-center justify-between gap-3 text-xs"
    >
      <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
        <div className="bg-amber-600/30 text-slate-950 px-2 py-0.5 rounded font-black tracking-wider text-[10px] uppercase border border-amber-600/40 flex items-center space-x-1 shrink-0">
          <HeartHandshake className="w-3.5 h-3.5 text-slate-950" />
          <span>CARE MODE</span>
        </div>

        <div className="flex items-center space-x-1.5 font-medium text-slate-900 shrink-0">
          <UserCheck className="w-4 h-4 text-slate-950" />
          <span className="font-bold truncate max-w-[120px] sm:max-w-xs">{nurse.nurseName}</span>
        </div>

        <span className="text-amber-800 hidden sm:inline">|</span>

        {assistingPatient ? (
          <div className="flex flex-wrap items-center gap-1.5 bg-amber-400/60 px-2.5 py-1 rounded-lg border border-amber-600/30 min-w-0">
            <span className="text-slate-800 text-[11px] shrink-0">Assisting:</span>
            <span className="font-extrabold text-slate-950 underline underline-offset-2 truncate max-w-[150px] sm:max-w-xs">
              {assistingPatient.fullName || 'Unidentified Patient'}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-900 text-white rounded font-mono shrink-0 truncate max-w-[100px]">
              {assistingPatient.temporaryId || assistingPatient.abhaId || assistingPatient.id}
            </span>
            {assistingPatient.isGuest && (
              <span className="bg-rose-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0">
                GUEST
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={onSelectPatient}
            className="flex items-center space-x-1 bg-white/80 hover:bg-white text-amber-950 px-2 py-1 rounded font-bold border border-amber-600/40 transition-colors"
          >
            <User className="w-3 h-3" />
            <span>Select or Register Patient to Assist</span>
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {assistingPatient && (
          <button
            onClick={onOpenReTriage}
            id="btn-re-triage"
            className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded-md font-bold transition-all shadow-sm"
          >
            <RefreshCw className="w-3 h-3 text-amber-400" />
            <span>Dynamic Re-Triage</span>
          </button>
        )}

        <button
          onClick={onOpenAuditTrail}
          id="btn-view-audit-trail"
          className="flex items-center space-x-1 bg-amber-600/40 hover:bg-amber-600/60 text-slate-950 px-2.5 py-1 rounded-md font-bold transition-colors"
        >
          <History className="w-3 h-3" />
          <span>Audit Log</span>
        </button>

        <button
          onClick={onSelectPatient}
          className="bg-white/80 hover:bg-white text-slate-900 px-2 py-1 rounded-md font-semibold transition-colors"
        >
          Switch Patient
        </button>

        <button
          onClick={onExitCareMode}
          id="btn-exit-care-mode"
          title="Exit Caregiving Mode"
          className="flex items-center space-x-1 bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-md font-bold transition-colors"
        >
          <LogOut className="w-3 h-3" />
          <span>Exit Care Mode</span>
        </button>
      </div>
    </aside>
  );
};
