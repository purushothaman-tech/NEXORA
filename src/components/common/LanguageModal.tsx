import React from 'react';
import { Languages, Check, Volume2, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../types/mednova';

const GREETINGS: Record<SupportedLanguage, string> = {
  en: 'Hello, welcome to MedNova healthcare.',
  ta: 'வணக்கம், மெட்நோவா மருத்துவ சேவைக்கு வரவேற்கிறோம்.',
  hi: 'नमस्ते, मेडनोवा स्वास्थ्य सेवा में आपका स्वागत है।',
  te: 'నమస్కారం, మెడ్‌నోవా ఆరోగ్య సేవలకు స్వాగతం.',
  kn: 'ನಮಸ್ಕಾರ, ಮೆಡ್ನೋವಾ ಆರೋಗ್ಯ ಸೇವೆಗೆ ಸುಸ್ವಾಗತ.',
  ml: 'നമസ്കാരം, മെഡ്‌നോവ ആരോഗ്യ സേവനത്തിലേക്ക് സ്വാഗതം.',
  bn: 'নমস্কার, মেড়নোভা স্বাস্থ্যসেবায় আপনাকে স্বাগতম।',
  mr: 'नमस्कार, मेडनोव्हा आरोग्य सेवेत आपले स्वागत आहे.',
};

interface LanguageModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { 
    language, 
    setLanguage, 
    supportedLanguages, 
    isLanguageModalOpen, 
    closeLanguageModal,
    speak,
    t
  } = useLanguage();

  const isModalOpen = isOpen !== undefined ? isOpen : isLanguageModalOpen;
  const handleClose = onClose || closeLanguageModal;

  if (!isModalOpen) return null;

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    speak(GREETINGS[code]);
    handleClose();
  };

  const handleAudioPreview = (e: React.MouseEvent, code: SupportedLanguage) => {
    e.stopPropagation();
    speak(GREETINGS[code]);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-teal-700 to-emerald-700 text-white">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Languages className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 id="language-modal-title" className="text-xl font-bold font-display">
                {t('nav.changeLanguage')} • भाषा चुनें • மொழியைத் தேர்ந்தெடுக்கவும்
              </h2>
              <p className="text-xs text-teal-100">
                Select your preferred mother tongue for voice and text
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm font-medium text-slate-600 mb-4">
            Available Official Indian Languages & Native Scripts:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {supportedLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <div
                  key={lang.code}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(lang.code)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(lang.code);
                    }
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left group cursor-pointer ${
                    isSelected 
                      ? 'border-teal-600 bg-teal-50/80 shadow-md ring-2 ring-teal-500/20' 
                      : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-lg ${
                      isSelected 
                        ? 'bg-teal-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-800'
                    }`}>
                      {lang.nativeName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900 leading-tight">
                        {lang.nativeName}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {lang.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => handleAudioPreview(e, lang.code)}
                      className="p-2 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-100/60 transition-colors cursor-pointer"
                      title="Listen audio greeting"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    {isSelected && (
                      <div className="h-6 w-6 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="h-4 w-4 stroke-[2.5]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              ✓ Changes the entire interface immediately &bull; Speech recognition automatically syncs to selected language.
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="ml-3 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
            >
              {t('common.continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
