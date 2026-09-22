import React, { useState } from 'react';
import { ShieldCheck, X, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { QueueTicket } from '../../types/mednova';
import { useLanguage } from '../../context/LanguageContext';

interface LinkAbhaModalProps {
  ticket: QueueTicket;
  isOpen: boolean;
  onClose: () => void;
  onLinkSuccess: (updatedTicket: QueueTicket) => void;
}

export const LinkAbhaModal: React.FC<LinkAbhaModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onLinkSuccess,
}) => {
  const { t } = useLanguage();
  const [abhaInput, setAbhaInput] = useState('');
  const [patientConsentConfirmed, setPatientConsentConfirmed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLink = () => {
    if (!abhaInput.trim()) {
      setErrorMsg('Please enter a valid 14-digit ABHA ID or ABHA Address.');
      return;
    }
    if (!patientConsentConfirmed) {
      setErrorMsg('Patient or guardian verbal/written consent is required by ABDM guidelines.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    // Simulate instant ABDM Gateway lookup & linking
    setTimeout(() => {
      setIsVerifying(false);
      const updatedTicket: QueueTicket = {
        ...ticket,
        patient: {
          ...ticket.patient,
          abhaId: abhaInput.trim(),
          isGuest: false,
          isEmergencyGuest: false,
          abhaLinked: true,
          linkedAt: new Date().toISOString(),
        },
      };
      onLinkSuccess(updatedTicket);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="link-abha-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Link Official ABHA Health Record</h3>
              <p className="text-xs text-teal-100">National Digital Health Mission (ABDM) Integration</p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-link-abha"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
            title={t('common.close')}
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <p className="font-semibold mb-0.5">Linking Temporary Guest Record</p>
              <p>
                Patient was admitted as temporary guest <span className="font-mono font-bold text-amber-900">[{ticket.patient.temporaryId || ticket.patient.id}]</span>. 
                Linking will attach their official longitudinal health record to this consultation session.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Patient Name
            </label>
            <div className="p-2.5 bg-slate-100 rounded-lg text-sm font-semibold text-slate-800">
              {ticket.patient.fullName || 'Unidentified Emergency Patient'} • {ticket.patient.age}y / {ticket.patient.gender}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              14-Digit ABHA Number or ABHA Address
            </label>
            <input
              type="text"
              id="input-abha-number"
              placeholder="e.g. 91-4829-1029-4821 or patient@abdm"
              value={abhaInput}
              onChange={(e) => setAbhaInput(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setAbhaInput('91-4829-1029-4821')}
                className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-mono transition-colors"
              >
                Use Sample: 91-4829-1029-4821
              </button>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              id="checkbox-patient-consent"
              checked={patientConsentConfirmed}
              onChange={(e) => setPatientConsentConfirmed(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 mt-0.5"
            />
            <div className="text-xs text-slate-700">
              <span className="font-semibold block text-slate-800">Informed Patient / Guardian Consent Verified</span>
              The patient or authorized relative has verbally or in writing consented to link their ABDM health records with this clinical encounter.
            </div>
          </label>

          {errorMsg && (
            <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-link-abha"
            onClick={handleLink}
            disabled={isVerifying}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {isVerifying ? (
              <span>Verifying with ABDM Gateway...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Link ABHA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
