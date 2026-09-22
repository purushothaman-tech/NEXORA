import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Globe2, 
  Zap, 
  HeartHandshake,
  Sparkles,
  Info
} from 'lucide-react';
import { SupportedLanguage, LanguageOption } from '../../types/mednova';
import { SUPPORTED_LANGUAGES } from '../../utils/translations';
import { useLanguage } from '../../context/LanguageContext';

export type RegistrationMode = 'abha' | 'standard' | 'emergency_guest';

interface LoginWelcomeModalProps {
  isOpen: boolean;
  onSelectMode: (mode: RegistrationMode, temporaryGuestId?: string) => void;
  onClose?: () => void;
}

export const LoginWelcomeModal: React.FC<LoginWelcomeModalProps> = ({
  isOpen,
  onSelectMode,
  onClose,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [showEmergencyAck, setShowEmergencyAck] = useState(false);
  const [emergencyAcknowledged, setEmergencyAcknowledged] = useState(false);

  if (!isOpen) return null;

  const handleStartEmergencyGuest = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const guestId = `EMG-${new Date().getFullYear()}-${randomSuffix}`;
    onSelectMode('emergency_guest', guestId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        id="login-welcome-card"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col my-8"
      >
        {/* Hospital Branding Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-900 text-white p-6 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center font-bold text-teal-200">
                M
              </span>
              <span className="font-extrabold text-xl tracking-tight">MedNova</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/10 px-2.5 py-1 rounded-full text-xs text-teal-100">
              <Globe2 className="w-3.5 h-3.5 text-teal-300" />
              <span>{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName || 'English'}</span>
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-2">
            Welcome to Clinical Intake & Triage
          </h2>
          <p className="text-xs text-teal-100/90 mt-1 max-w-md">
            "From People's Voices to Prioritized Care" • Ayushman Bharat Digital Mission (ABDM) Enabled
          </p>
        </div>

        {/* Language Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Select Preferred Language:</span>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_LANGUAGES.slice(0, 4).map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  language === lang.code
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* Main 3 Registration Choices */}
        <div className="p-6 space-y-4">
          {/* 1. Primary Recommended: Continue with ABHA */}
          <button
            type="button"
            id="btn-continue-with-abha"
            onClick={() => onSelectMode('abha')}
            className="w-full text-left p-4 rounded-2xl border-2 border-teal-600 bg-teal-50/50 hover:bg-teal-50 hover:shadow-md transition-all group flex items-start space-x-4 relative"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1 pr-6">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900">CONTINUE WITH ABHA</span>
                <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Connect seamlessly with your 14-digit Ayushman Bharat Health Account. Instant retrieval of past prescriptions, allergies, and vaccination history.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-teal-600 absolute right-4 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 2. Secondary: Continue without ABHA */}
          <button
            type="button"
            id="btn-continue-without-abha"
            onClick={() => onSelectMode('standard')}
            className="w-full text-left p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 transition-all group flex items-start space-x-4 relative"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 pr-6">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900">CONTINUE WITHOUT ABHA</span>
                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Manual Registration
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Register using phone number and basic demographic details. You can link your ABHA card later at any point during consultation.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 3. Emergency / Guest Mode */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <span>Urgent or Critical Medical Care</span>
            </div>

            {!showEmergencyAck ? (
              <button
                type="button"
                id="btn-emergency-guest-mode"
                onClick={() => setShowEmergencyAck(true)}
                className="w-full text-left p-4 rounded-2xl border-2 border-rose-400 bg-gradient-to-r from-rose-50 to-amber-50 hover:border-rose-500 hover:shadow-md transition-all group flex items-start space-x-4 relative"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <AlertOctagon className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1 pr-6">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-rose-950">EMERGENCY / GUEST MODE</span>
                    <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Rapid Assistance
                    </span>
                  </div>
                  <p className="text-xs text-rose-800 mt-1 leading-relaxed font-medium">
                    Immediate symptom reporting without requiring ABHA ID or lengthy registration. Generates an instant temporary patient token for urgent triage.
                  </p>
                  <span className="text-[11px] text-rose-700 font-semibold underline mt-1.5 inline-block">
                    Skip ABHA for now &rarr;
                  </span>
                </div>
              </button>
            ) : (
              /* Emergency Acknowledgement Card */
              <div className="p-4 rounded-2xl border-2 border-rose-500 bg-rose-50/90 space-y-3 animate-fade-in">
                <div className="flex items-start space-x-3">
                  <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-rose-950 uppercase tracking-wider">
                      Emergency Guest Acknowledgement
                    </h4>
                    <p className="text-xs text-rose-800 mt-1">
                      A temporary identifier (e.g. <span className="font-mono font-bold">EMG-2026-XXXX</span>) will be assigned immediately. Authorized nursing staff will be alerted and ABHA can be linked subsequently.
                    </p>
                  </div>
                </div>

                <label className="flex items-start space-x-2 bg-white/80 p-2.5 rounded-xl border border-rose-200 cursor-pointer">
                  <input
                    type="checkbox"
                    id="checkbox-emergency-ack"
                    checked={emergencyAcknowledged}
                    onChange={(e) => setEmergencyAcknowledged(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded border-rose-300 focus:ring-rose-500 mt-0.5"
                  />
                  <span className="text-xs text-rose-900 font-medium leading-tight">
                    I understand this creates an expedited temporary emergency ticket. Severe red flags will trigger immediate resuscitation alert.
                  </span>
                </label>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowEmergencyAck(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    id="btn-confirm-emergency-guest"
                    disabled={!emergencyAcknowledged}
                    onClick={handleStartEmergencyGuest}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Proceed with Emergency Guest Mode</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>MedNova is a clinical decision-support system. Does not prescribe.</span>
          </div>
          <button
            type="button"
            onClick={() => onSelectMode('standard')}
            className="text-teal-700 hover:text-teal-800 font-semibold underline"
          >
            Skip ABHA for now
          </button>
        </div>
      </div>
    </div>
  );
};
