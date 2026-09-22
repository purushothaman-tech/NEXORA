import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  Check, 
  Mic, 
  RefreshCw,
  Flame,
  Wind,
  Droplets,
  HeartHandshake
} from 'lucide-react';
import { 
  PrakritiQuestion, 
  PrakritiAnswerRecord, 
  PrakritiAssessment, 
  InformationSource 
} from '../../types/mednova';
import { 
  PRAKRITI_QUESTION_BANK, 
  calculatePrakriti,
  getLocalizedPrakritiQuestion
} from '../../utils/ayushPrakritiEngine';
import { useLanguage } from '../../context/LanguageContext';
import { SourceBadge } from '../common/SourceBadge';

interface AyushPrakritiWizardProps {
  onComplete: (assessment: PrakritiAssessment) => void;
  onSkip?: () => void;
  initialAnswers?: PrakritiAnswerRecord[];
  isNurseAssisting?: boolean;
}

export const AyushPrakritiWizard: React.FC<AyushPrakritiWizardProps> = ({
  onComplete,
  onSkip,
  initialAnswers = [],
  isNurseAssisting = false,
}) => {
  const { language, currentLanguage, speak, stopAudio, autoVoiceGuidance, t } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<PrakritiAnswerRecord[]>(initialAnswers);
  const [activeInputSource, setActiveInputSource] = useState<InformationSource>(
    isNurseAssisting ? 'NURSE_ASSISTED' : 'PATIENT_TOUCH'
  );
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [showResultCard, setShowResultCard] = useState(false);
  const [finalAssessment, setFinalAssessment] = useState<PrakritiAssessment | null>(null);
  const speechRecRef = useRef<any>(null);

  const rawQuestion = PRAKRITI_QUESTION_BANK[currentQuestionIndex];
  const currentQuestion = getLocalizedPrakritiQuestion(rawQuestion, language);
  const progressPercent = Math.round(
    ((currentQuestionIndex + 1) / PRAKRITI_QUESTION_BANK.length) * 100
  );

  // Play spoken question audio guidance
  const handlePlayQuestionAudio = () => {
    const textToSpeak = `${currentQuestion.questionText}. ${currentQuestion.subtitle || ''}`;
    speak(textToSpeak, currentLanguage.speechCode);
  };

  // Auto-play question guidance when question changes if autoVoiceGuidance is active
  React.useEffect(() => {
    if (autoVoiceGuidance && !showResultCard) {
      const textToSpeak = `${currentQuestion.questionText}. ${currentQuestion.subtitle || ''}`;
      speak(textToSpeak, currentLanguage.speechCode);
    }
  }, [currentQuestionIndex, autoVoiceGuidance, showResultCard, language]);

  const handleSelectOption = (
    rawQ: PrakritiQuestion,
    optionKey: string,
    optionLabel: string,
    doshaWeight: { vata: number; pitta: number; kapha: number },
    source: InformationSource = activeInputSource
  ) => {
    const record: PrakritiAnswerRecord = {
      questionId: rawQ.id,
      category: rawQ.category,
      questionText: rawQ.questionText,
      answerKey: optionKey,
      answerLabel: optionLabel,
      doshaWeight,
      source,
    };

    const updatedAnswers = answers.filter((a) => a.questionId !== rawQ.id);
    updatedAnswers.push(record);
    setAnswers(updatedAnswers);

    // If more questions exist, proceed to next question
    if (currentQuestionIndex < PRAKRITI_QUESTION_BANK.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 250);
    } else {
      // Completed all questions -> calculate assessment
      const assessment = calculatePrakriti(updatedAnswers);
      setFinalAssessment(assessment);
      setShowResultCard(true);
    }
  };

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (speechRecRef.current) {
        try {
          speechRecRef.current.abort();
        } catch {
          // ignore
        }
        speechRecRef.current = null;
      }
    };
  }, []);

  const handleVoiceAnswer = () => {
    if (typeof window === 'undefined') return;

    if (isVoiceListening) {
      if (speechRecRef.current) {
        try { speechRecRef.current.stop(); } catch {}
      }
      setIsVoiceListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.info(`[Speech]\nVoice recognition unavailable on device\nLanguage: ${currentLanguage.speechCode}\nAction: touch option fallback`);
      return;
    }

    // Stop any ongoing TTS speech synthesis before microphone starts
    stopAudio();

    try {
      if (speechRecRef.current) {
        try { speechRecRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = currentLanguage.speechCode;
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      setIsVoiceListening(true);
      speechRecRef.current = recognition;
      recognition.start();

      recognition.onresult = (event: any) => {
        setIsVoiceListening(false);
        const transcript = event.results[0][0].transcript.toLowerCase();

        // Match against options
        const matched = currentQuestion.options.find(
          (opt) =>
            transcript.includes(opt.label.toLowerCase()) ||
            opt.label.toLowerCase().includes(transcript) ||
            (opt.description && transcript.includes(opt.description.toLowerCase()))
        );

        if (matched) {
          handleSelectOption(rawQuestion, matched.key, matched.label, matched.doshaWeight, 'PATIENT_VOICE');
        } else {
          // If no direct label match, pick first option with voice tag
          const fallbackOpt = currentQuestion.options[0];
          handleSelectOption(rawQuestion, fallbackOpt.key, fallbackOpt.label, fallbackOpt.doshaWeight, 'PATIENT_VOICE');
        }
      };

      recognition.onerror = (event: any) => {
        console.info(`[Speech]\nVoice recognition event: ${event?.error || 'unknown'}\nLanguage: ${currentLanguage.speechCode}\nAction: touch option fallback`);
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };
    } catch {
      console.info(`[Speech]\nVoice recognition start failed\nLanguage: ${currentLanguage.speechCode}\nAction: touch option fallback`);
      setIsVoiceListening(false);
    }
  };

  const handleConfirmAssessment = () => {
    if (finalAssessment) {
      onComplete(finalAssessment);
    }
  };

  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white p-6 relative">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center font-bold text-emerald-200 shadow-inner">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  AYUSH Prakriti Assessment
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  Ayurveda Decision Support
                </span>
                {isNurseAssisting && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 flex items-center space-x-1">
                    <HeartHandshake className="w-3 h-3" />
                    <span>Nurse Assisting</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Help us understand your natural body and lifestyle characteristics.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePlayQuestionAudio}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all backdrop-blur-sm"
              title="Listen to question guidance"
            >
              <Volume2 className="w-4 h-4 text-emerald-300" />
              <span>Listen</span>
            </button>
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="text-xs text-emerald-200/80 hover:text-white underline px-2 py-1"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>

        {/* Step Progress */}
        {!showResultCard && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-100">
            <div className="flex items-center space-x-2">
              <span className="font-bold">
                Question {currentQuestionIndex + 1} of {PRAKRITI_QUESTION_BANK.length}
              </span>
              <span>•</span>
              <span className="capitalize text-emerald-200">
                {currentQuestion.category.replace('_', ' ')}
              </span>
            </div>
            <div className="w-32 bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Card Body */}
      {!showResultCard ? (
        <div className="p-6 md:p-8 space-y-6">
          {/* Question Text */}
          <div className="space-y-1.5">
            <h3 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
              {currentQuestion.questionText}
            </h3>
            {currentQuestion.subtitle && (
              <p className="text-xs md:text-sm text-slate-500 font-medium">
                {currentQuestion.subtitle}
              </p>
            )}
          </div>

          {/* Large, Patient-Friendly Option Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = currentAnswer?.answerKey === option.key;

              // Dosha visual theme
              const isVata = option.doshaWeight.vata > 0;
              const isPitta = option.doshaWeight.pitta > 0;
              const isKapha = option.doshaWeight.kapha > 0;

              const doshaIcon = isVata ? (
                <Wind className="w-5 h-5 text-indigo-500" />
              ) : isPitta ? (
                <Flame className="w-5 h-5 text-amber-500" />
              ) : (
                <Droplets className="w-5 h-5 text-emerald-500" />
              );

              return (
                <button
                  key={option.key}
                  type="button"
                  id={`btn-prakriti-opt-${option.key}`}
                  onClick={() =>
                    handleSelectOption(
                      rawQuestion,
                      option.key,
                      option.label,
                      option.doshaWeight
                    )
                  }
                  className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between group hover:shadow-lg ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {doshaIcon}
                      </div>
                      <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:border-teal-600 group-hover:text-teal-600">
                        {idx + 1}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug mb-1">
                      {option.label}
                    </h4>

                    {option.description && (
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-2 border-t border-teal-200 flex items-center justify-between text-xs text-teal-800 font-bold">
                      <span className="flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </span>
                      <SourceBadge source={currentAnswer.source} size="sm" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Voice Input & Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleVoiceAnswer}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all ${
                  isVoiceListening
                    ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
              >
                <Mic className="w-4 h-4 text-teal-600" />
                <span>{isVoiceListening ? 'Listening for response...' : 'Answer by Voice'}</span>
              </button>

              {isNurseAssisting && (
                <div className="flex items-center space-x-1.5 text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  <span className="font-semibold">Source Tag:</span>
                  <select
                    value={activeInputSource}
                    onChange={(e) => setActiveInputSource(e.target.value as InformationSource)}
                    className="bg-white border border-amber-300 text-xs rounded px-2 py-0.5 font-bold"
                  >
                    <option value="NURSE_ASSISTED">Nurse Assisted</option>
                    <option value="PATIENT_VOICE">Patient Voice</option>
                    <option value="PATIENT_TOUCH">Patient Touch</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {currentQuestionIndex < PRAKRITI_QUESTION_BANK.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const assessment = calculatePrakriti(answers);
                    setFinalAssessment(assessment);
                    setShowResultCard(true);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-md flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Assessment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Final Decision-Support Result Card */
        <div className="p-6 md:p-8 space-y-6 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Your AYUSH Prakriti Assessment
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                  Decision Support Result
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Based on {finalAssessment?.responses.length} structured biological observations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowResultCard(false)}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Review Responses</span>
            </button>
          </div>

          {/* Constitutional Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vata Card */}
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center space-x-1.5 font-bold text-sm text-indigo-950">
                  <Wind className="w-4 h-4 text-indigo-600" />
                  <span>Vata</span>
                </span>
                <span className="text-lg font-black text-indigo-900">
                  {finalAssessment?.vataScore}%
                </span>
              </div>
              <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${finalAssessment?.vataScore}%` }}
                />
              </div>
              <p className="text-[11px] text-indigo-800 leading-snug">
                Governs bodily movement, nerve impulses, variable metabolism, and cold sensitivity.
              </p>
            </div>

            {/* Pitta Card */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center space-x-1.5 font-bold text-sm text-amber-950">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Pitta</span>
                </span>
                <span className="text-lg font-black text-amber-900">
                  {finalAssessment?.pittaScore}%
                </span>
              </div>
              <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${finalAssessment?.pittaScore}%` }}
                />
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Governs digestion, enzymatic transformation, metabolic heat, and visual acuity.
              </p>
            </div>

            {/* Kapha Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center space-x-1.5 font-bold text-sm text-emerald-950">
                  <Droplets className="w-4 h-4 text-emerald-600" />
                  <span>Kapha</span>
                </span>
                <span className="text-lg font-black text-emerald-900">
                  {finalAssessment?.kaphaScore}%
                </span>
              </div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${finalAssessment?.kaphaScore}%` }}
                />
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Governs physical cohesion, bone/joint lubrication, steady immunity, and deep stamina.
              </p>
            </div>
          </div>

          {/* Assessment Summary Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Indicated Profile:
              </span>
              <span className="text-sm font-extrabold text-teal-800">
                {finalAssessment?.dominantPrakriti}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {finalAssessment?.summary}
            </p>
          </div>

          {/* Mandatory Non-Diagnostic Disclaimers */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-bold">Assessment for Practitioner Review</p>
              <p className="leading-relaxed">
                This assessment is based on the information provided and should be reviewed by an AYUSH practitioner. 
                MedNova does NOT autonomously diagnose or prescribe. The practitioner maintains final clinical interpretation.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Skip Assessment
              </button>
            )}
            <button
              type="button"
              id="btn-confirm-prakriti-result"
              onClick={handleConfirmAssessment}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Attach to Clinical Record & Continue</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
