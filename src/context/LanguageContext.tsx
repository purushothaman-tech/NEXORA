import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SupportedLanguage, LanguageOption } from '../types/mednova';
import { PatientPageKey, getGuidanceNarration } from '../utils/audioGuidance';

import en from '../locales/en.json';
import ta from '../locales/ta.json';
import hi from '../locales/hi.json';
import te from '../locales/te.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';
import bn from '../locales/bn.json';
import mr from '../locales/mr.json';

export const SUPPORTED_LANGUAGES_LIST: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
];

export const SPEECH_LANG_CODES: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
};

const LOCALES: Record<SupportedLanguage, any> = {
  en,
  ta,
  hi,
  te,
  kn,
  ml,
  bn,
  mr,
};

// Aliases mapping legacy or alternative keys to canonical paths
const KEY_ALIASES: Record<string, string> = {
  'queue.openWaitingHall': 'queue.openWaitingHall',
  'queue.tvDisplayBtn': 'queue.openWaitingHall',
  'queue.review': 'queue.review',
  'queue.reviewCase': 'queue.review',
  'queue.liveOPD': 'queue.liveOPD',
  'queue.liveBadge': 'queue.liveOPD',
  'queue.activeOPDs': 'queue.activeOPDs',
  'queue.activeDepts': 'queue.activeOPDs',
  'queue.avgWaitTime': 'queue.avgWaitTime',
  'queue.avgWait': 'queue.avgWaitTime',
  'queue.urgentWindow': 'queue.urgentWindow',
  'queue.reviewWindow': 'queue.urgentWindow',
  'queue.allDepartments': 'queue.allDepartments',
  'queue.allDepts': 'queue.allDepartments',
  'queue.allTriageLevels': 'queue.allTriageLevels',
  'queue.allTriage': 'queue.allTriageLevels',
  'queue.sortByPriority': 'queue.sortByPriority',
  'queue.sortPriority': 'queue.sortByPriority',
  'queue.sortByWait': 'queue.sortByWait',
  'queue.sortWait': 'queue.sortByWait',
  'queue.complaintLabel': 'queue.complaintLabel',
  'queue.waitedLabel': 'queue.waitedLabel',
  'queue.waitedMins': 'queue.waitedLabel',
  'app.title': 'app.title',
  'app.name': 'app.title',
  'app.subtitle': 'app.subtitle',
  'app.abdmCompliant': 'app.abdmCompliant',
  'app.esiTriage': 'app.esiTriage',
  'app.aiDecisionSupport': 'app.aiDecisionSupport',
  'emergency.bannerTitle': 'emergency.bannerTitle',
  'language.title': 'language.title',
  'doctor.overrideTriage': 'doctor.overrideTriage',
  'doctor.doctorOverride': 'doctor.overrideTriage',
  'doctor.criticalRedFlags': 'doctor.criticalRedFlags',
  'doctor.redFlagsDetected': 'doctor.criticalRedFlags',
  'doctor.printCaseSheet': 'doctor.printCaseSheet',
  'doctor.printCase': 'doctor.printCaseSheet',
  'doctor.patientVoice': 'doctor.patientVoice',
  'doctor.patientVoiceTitle': 'doctor.patientVoice',
  'doctor.playAudio': 'doctor.playAudio',
  'doctor.audioPlayback': 'doctor.playAudio',
  'doctor.englishTranslation': 'doctor.englishTranslation',
  'doctor.clinicalEnglish': 'doctor.englishTranslation',
  'doctor.differentials': 'doctor.differentials',
  'doctor.differentialTitle': 'doctor.differentials',
  'doctor.attachedDocs': 'doctor.attachedDocs',
  'doctor.documentsOcr': 'doctor.attachedDocs',
  'doctor.speakToPatient': 'doctor.speakToPatient',
  'doctor.speakAdvice': 'doctor.speakToPatient',
  'doctor.translateToPatient': 'doctor.translateToPatient',
  'doctor.translateBtn': 'doctor.translateToPatient',
  'doctor.translatedInstructions': 'doctor.translatedInstructions',
  'doctor.translatedAdviceTitle': 'doctor.translatedInstructions',
};

// Permanent safeguard against translation-key leakage anywhere in the UI
const FALLBACK_STRINGS: Record<string, string> = {
  'queue.openWaitingHall': 'Queue in Waiting Hall',
  'queue.review': 'Queue Review',
  'queue.liveOPD': 'Live OPD',
  'queue.activeOPDs': 'Active OPDs',
  'queue.avgWaitTime': 'Average Waiting Time',
  'queue.urgentWindow': 'Urgent Window',
  'queue.allDepartments': 'All Departments',
  'queue.allTriageLevels': 'All Triage Levels',
  'queue.sortByPriority': 'Sort by Priority',
  'queue.sortByWait': 'Sort by Wait Time',
  'queue.patients': 'Patients',
  'queue.complaintLabel': 'Chief Complaint',
  'queue.waitedLabel': 'Waiting',
  'queue.queueDisclaimer': 'Auto-refreshes • Weighted by ESI urgency & wait time',
  'queue.callPatient': 'Call Patient',
  'queue.startConsult': 'Start Consultation',
  'queue.noPatientsDesc': 'Try adjusting your search query or department filter.',
  'app.title': 'MedNova',
  'app.subtitle': 'AI-Powered Clinical Intake & Triage',
  'app.abdmCompliant': 'ABDM & Ayushman Bharat Compliant',
  'app.esiTriage': 'Emergency Severity Index (ESI) Protocol',
  'app.aiDecisionSupport': 'AI Clinical Decision Support Only',
  'emergency.bannerTitle': 'Priority 1 - Immediate Resuscitation / Emergency Alert',
  'language.title': 'Select Language',
  'doctor.noPatients': 'No patients currently assigned in consultation queue.',
  'doctor.noDocsUploaded': 'No medical documents or lab reports uploaded for this patient.',
  'doctor.attachedDocs': 'Attached Diagnostic Records & Clinical Documents',
  'doctor.criticalRedFlags': 'Critical Red Flags Detected by MedNova AI',
  'doctor.overrideTriage': 'Doctor Override Triage Level',
  'doctor.patientVoice': "Patient's Voice Audio (Original Native Recording)",
  'doctor.playAudio': 'Listen to Patient Recording',
  'doctor.englishTranslation': 'Clinical English Standardized Translation',
  'doctor.differentials': 'Potential Differential Considerations',
  'doctor.currentMeds': 'Current Medications',
  'doctor.allergies': 'Known Allergies',
  'doctor.speakToPatient': 'Speak Advice to Patient',
  'doctor.translateToPatient': 'Translate to Patient Language',
  'doctor.translatedInstructions': 'Translated Patient Instructions',
  'doctor.printCaseSheet': 'Print Case Sheet',
  'voice.micUnavailableTitle': 'Microphone access is unavailable',
  'voice.micPermissionDesc': 'Microphone access was not allowed. Please enable microphone access or choose Type Instead.',
  'voice.allowMic': 'Allow Microphone',
  'voice.typeInstead': 'Type Instead',
  'voice.micNetworkError': 'Voice recognition is temporarily unavailable. Please try again or type your response.',
  'voice.micNoSpeech': 'We did not hear anything. Please try again.',
  'voice.micLangUnsupported': 'Voice input is not available for this language on this device. Please type your response or ask a nurse for assistance.',
  'voice.micDeviceError': 'Microphone hardware was not detected. Please choose Type Instead.',
  'voice.micServiceUnavailable': 'Voice recognition service is unavailable. Please choose Type Instead.',
  'voice.micBrowserUnsupported': 'Your browser does not support voice input. Please type your response or use touch options.',
  'voice.nurseAssistance': 'Caregiving / Nurse Mode'
};

function humanizeKey(rawKey: string): string {
  const lastPart = rawKey.includes('.') ? rawKey.split('.').pop()! : rawKey;
  return lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .trim()
    .replace(/^./, (str) => str.toUpperCase());
}

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  speechCode: string;
  currentLanguage: LanguageOption;
  supportedLanguages: LanguageOption[];
  t: (path: string, fallback?: string) => string;
  speak: (text: string, overrideSpeechCode?: string) => void;
  stopAudio: () => void;
  autoVoiceGuidance: boolean;
  setAutoVoiceGuidance: (enabled: boolean) => void;
  toggleAutoVoiceGuidance: () => void;
  speakGuidance: (pageKey: PatientPageKey, params?: Record<string, string | number>, langOverride?: SupportedLanguage) => void;
  activePage: PatientPageKey | null;
  setActivePage: (pageKey: PatientPageKey, params?: Record<string, string | number>) => void;
  isLanguageModalOpen: boolean;
  openLanguageModal: () => void;
  closeLanguageModal: () => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'mednova_language';
const AUTO_VOICE_STORAGE_KEY = 'mednova_auto_voice';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LOCALES[saved as SupportedLanguage]) {
        return saved as SupportedLanguage;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const [autoVoiceGuidance, setAutoVoiceGuidanceState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AUTO_VOICE_STORAGE_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // ignore
    }
    return true; // Auto Voice Guidance enabled by default
  });

  const [activePage, setActivePageState] = useState<PatientPageKey | null>(null);
  const activeParamsRef = useRef<Record<string, string | number> | undefined>(undefined);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const speechCode = useMemo(() => {
    return SPEECH_LANG_CODES[language] || 'en-IN';
  }, [language]);

  const currentLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES_LIST.find((l) => l.code === language) || SUPPORTED_LANGUAGES_LIST[0];
  }, [language]);

  // Audio Speech Synthesis
  const speak = useCallback((text: string, overrideSpeechCode?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = overrideSpeechCode || SPEECH_LANG_CODES[language] || 'en-IN';
      utterance.lang = targetLang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Select matching voice if available in browser
      const voices = window.speechSynthesis.getVoices?.() || [];
      const matchingVoice = voices.find(
        (v) => v.lang.toLowerCase() === targetLang.toLowerCase() || v.lang.toLowerCase().startsWith(targetLang.slice(0, 2).toLowerCase())
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  }, [language]);

  const stopAudio = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakGuidance = useCallback((
    pageKey: PatientPageKey,
    params?: Record<string, string | number>,
    langOverride?: SupportedLanguage
  ) => {
    const targetLang = langOverride || language;
    const narration = getGuidanceNarration(pageKey, targetLang, params);
    if (narration) {
      const targetSpeechCode = SPEECH_LANG_CODES[targetLang] || 'en-IN';
      speak(narration, targetSpeechCode);
    }
  }, [language, speak]);

  const setAutoVoiceGuidance = useCallback((enabled: boolean) => {
    setAutoVoiceGuidanceState(enabled);
    if (!enabled) {
      stopAudio();
    }
    try {
      localStorage.setItem(AUTO_VOICE_STORAGE_KEY, String(enabled));
    } catch {
      // ignore
    }
  }, [stopAudio]);

  const toggleAutoVoiceGuidance = useCallback(() => {
    setAutoVoiceGuidance(!autoVoiceGuidance);
  }, [autoVoiceGuidance, setAutoVoiceGuidance]);

  const setActivePage = useCallback((pageKey: PatientPageKey, params?: Record<string, string | number>) => {
    setActivePageState(pageKey);
    activeParamsRef.current = params;
    if (autoVoiceGuidance) {
      speakGuidance(pageKey, params);
    }
  }, [autoVoiceGuidance, speakGuidance]);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (LOCALES[newLang]) {
      // 1. Stop currently playing audio
      stopAudio();

      // 2. Update currentLanguage
      setLanguageState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch {
        // ignore
      }

      // 3. Immediately narrate current page in new language if auto-guidance is on
      if (autoVoiceGuidance && activePage) {
        // slight tick to allow state settle
        setTimeout(() => {
          const narration = getGuidanceNarration(activePage, newLang, activeParamsRef.current);
          if (narration) {
            const newSpeechCode = SPEECH_LANG_CODES[newLang] || 'en-IN';
            speak(narration, newSpeechCode);
          }
        }, 80);
      }
    }
  }, [activePage, autoVoiceGuidance, speak, stopAudio]);

  // Nested property lookup with alias support and zero-leakage guarantee
  const t = useCallback((path: string, fallback?: string): string => {
    // Resolve alias if mapped
    const resolvedPath = KEY_ALIASES[path] || path;
    const keys = resolvedPath.split('.');
    
    // 1. Try in current language
    let current: any = LOCALES[language];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        current = undefined;
        break;
      }
    }

    if (typeof current === 'string') {
      return current;
    }

    // 2. Fallback to English
    if (language !== 'en') {
      let fallbackCurrent: any = LOCALES.en;
      for (const key of keys) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && key in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[key];
        } else {
          fallbackCurrent = undefined;
          break;
        }
      }
      if (typeof fallbackCurrent === 'string') {
        return fallbackCurrent;
      }
    }

    // 3. Fallback to custom provided fallback
    if (fallback) {
      return fallback;
    }

    // 4. Fallback to centralized permanent dictionary
    if (FALLBACK_STRINGS[resolvedPath]) {
      return FALLBACK_STRINGS[resolvedPath];
    }
    if (FALLBACK_STRINGS[path]) {
      return FALLBACK_STRINGS[path];
    }

    // 5. Safety: Never return raw dot-separated key to UI
    if (path.includes('.')) {
      return humanizeKey(path);
    }

    return path;
  }, [language]);

  const openLanguageModal = useCallback(() => setIsLanguageModalOpen(true), []);
  const closeLanguageModal = useCallback(() => setIsLanguageModalOpen(false), []);

  const value = useMemo(() => ({
    language,
    setLanguage,
    speechCode,
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES_LIST,
    t,
    speak,
    stopAudio,
    autoVoiceGuidance,
    setAutoVoiceGuidance,
    toggleAutoVoiceGuidance,
    speakGuidance,
    activePage,
    setActivePage,
    isLanguageModalOpen,
    openLanguageModal,
    closeLanguageModal,
  }), [
    language,
    setLanguage,
    speechCode,
    currentLanguage,
    t,
    speak,
    stopAudio,
    autoVoiceGuidance,
    setAutoVoiceGuidance,
    toggleAutoVoiceGuidance,
    speakGuidance,
    activePage,
    setActivePage,
    isLanguageModalOpen,
    openLanguageModal,
    closeLanguageModal,
  ]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Reusable translation hook shortcut
export const useTranslation = () => {
  const { t, language, speechCode, setLanguage } = useLanguage();
  return { t, language, speechCode, setLanguage };
};
