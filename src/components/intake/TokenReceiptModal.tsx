import React from 'react';
import { 
  CheckCircle2, 
  Printer, 
  Volume2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  X,
  ArrowRight
} from 'lucide-react';
import { QueueTicket } from '../../types/mednova';
import { TRIAGE_CONFIGS } from '../../utils/triageEngine';
import { useLanguage } from '../../context/LanguageContext';

interface TokenReceiptModalProps {
  ticket: QueueTicket;
  onClose: () => void;
  onViewInQueue: () => void;
  onNewIntake: () => void;
}

export const TokenReceiptModal: React.FC<TokenReceiptModalProps> = ({
  ticket,
  onClose,
  onViewInQueue,
  onNewIntake,
}) => {
  const { t, speak, speakGuidance, autoVoiceGuidance, currentLanguage } = useLanguage();
  const triageConfig = TRIAGE_CONFIGS[ticket.triage.level];

  // Auto-speak triage confirmation on mount in selected language
  React.useEffect(() => {
    if (autoVoiceGuidance) {
      speakGuidance('triage', { tokenNumber: ticket.tokenNumber });
    }
  }, [autoVoiceGuidance, speakGuidance, ticket.tokenNumber]);

  const handleAnnounceToken = () => {
    speakGuidance('triage', { tokenNumber: ticket.tokenNumber });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Banner with Triage Priority styling */}
        <div className={`p-6 text-white text-center relative ${
          ticket.triage.level === 1 
            ? 'bg-gradient-to-r from-red-600 to-rose-700' 
            : ticket.triage.level === 2
            ? 'bg-gradient-to-r from-amber-600 to-orange-600'
            : ticket.triage.level === 3
            ? 'bg-gradient-to-r from-yellow-600 to-amber-600'
            : 'bg-gradient-to-r from-teal-600 to-emerald-600'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white/20 mb-2">
            <CheckCircle2 className="h-7 w-7 text-white" />
          </div>

          <h3 className="text-xl font-bold font-display tracking-tight">
            {t('triage.tokenSuccessTitle')}
          </h3>
          <p className="text-xs text-white/90 mt-1">
            {t('triage.tokenSuccessSubtitle')}
          </p>
        </div>

        {/* Token Card Body (Hospital Slip / Token Layout) */}
        <div className="p-6 space-y-6">
          
          {/* Big Token Number Display */}
          <div className="text-center py-4 px-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs relative">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {t('triage.opdToken')}
            </span>
            <div className="text-5xl font-black text-slate-900 font-mono tracking-tight my-1">
              {ticket.tokenNumber}
            </div>

            {/* Triage Priority Badge */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold" style={{
              backgroundColor: triageConfig.bgLight,
              color: triageConfig.color,
            }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: triageConfig.color }} />
              <span>
                {ticket.triage.level === 1 ? t('triage.levels.l1Title') :
                 ticket.triage.level === 2 ? t('triage.levels.l2Title') :
                 ticket.triage.level === 3 ? t('triage.levels.l3Title') :
                 t('triage.levels.l4Title')}
              </span>
            </div>

            {/* Voice Announcement Button */}
            <button
              id="btn-announce-token"
              onClick={handleAnnounceToken}
              className="mt-3 inline-flex items-center space-x-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5 mr-1" />
              <span>{t('triage.listenAnnouncement')} ({currentLanguage.nativeName})</span>
            </button>
          </div>

          {/* Wait Time & Room Routing Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">
                  {t('triage.estimatedWait')}
                </span>
                <div className="text-lg font-black text-slate-900">
                  {ticket.estimatedWaitMinutes === 0
                    ? t('triage.immediateAttention')
                    : `${ticket.estimatedWaitMinutes} ${t('triage.mins')}`}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">
                  {t('triage.deptRoom')}
                </span>
                <div className="text-sm font-black text-slate-900 leading-tight">
                  {ticket.department}
                </div>
                <div className="text-xs text-indigo-700 font-bold mt-0.5">
                  {ticket.roomNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Critical Red Flags & Precautions if present */}
          {ticket.triage.immediatePrecautions && ticket.triage.immediatePrecautions.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>{t('triage.precautionsTitle')}</span>
              </div>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                {ticket.triage.immediatePrecautions.map((prec, i) => (
                  <li key={i}>{prec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Patient Details Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900 text-sm mb-1">
              {ticket.patient.fullName}
            </div>
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>{ticket.patient.age}y / {ticket.patient.gender}</span>
              <span>ABHA: {ticket.patient.abhaId || 'N/A'}</span>
            </div>
            <div className="text-slate-500 font-medium pt-1 border-t border-slate-200">
              <span className="font-semibold text-slate-700">{t('understanding.primarySymptom')}:</span> {ticket.intake.chiefComplaint}
            </div>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="btn-print-token-slip"
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>{t('triage.printSlip')}</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onNewIntake}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              {t('triage.nextPatient')}
            </button>

            <button
              id="btn-view-queue-after-token"
              type="button"
              onClick={onViewInQueue}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold flex items-center justify-center space-x-1.5 shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <span>{t('triage.viewInQueue')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
