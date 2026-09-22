import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, Sparkles, AlertCircle, RefreshCw, Activity, CheckCircle2, ChevronDown, ChevronUp, UserCheck, Keyboard, HelpCircle } from 'lucide-react';
import { SampleComplaint, SAMPLE_COMPLAINTS } from '../../utils/translations';
import { useLanguage } from '../../context/LanguageContext';
import { useSpeechRecognition, RecognitionState } from '../../hooks/useSpeechRecognition';
import { extractClinicalInformationFromText, ExtractedClinicalInfo } from '../../utils/clinicalNlp';

interface VoiceIntakeWidgetProps {
  value: string;
  onChange: (val: string, originalNative?: string, source?: 'PATIENT_VOICE' | 'PATIENT_TOUCH' | 'NURSE_ASSISTED') => void;
  onSampleSelect?: (sample: SampleComplaint) => void;
  onClinicalInfoExtracted?: (info: ExtractedClinicalInfo) => void;
  onNurseAssistanceClick?: () => void;
  isNurseAssisted?: boolean;
}

export const VoiceIntakeWidget: React.FC<VoiceIntakeWidgetProps> = ({
  value,
  onChange,
  onSampleSelect,
  onClinicalInfoExtracted,
  onNurseAssistanceClick,
  isNurseAssisted = false,
}) => {
  const { language, speechCode, currentLanguage, t, speak, stopAudio } = useLanguage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedClinicalInfo | null>(null);
  const [isExtractingClinical, setIsExtractingClinical] = useState(false);
  const lastProcessedTranscriptRef = useRef<string>('');
  const processingRef = useRef<boolean>(false);

  // Clinical NLP extraction with in-flight guard and deduplication
  const processClinicalInformation = useCallback(async (transcriptText: string) => {
    const trimmed = transcriptText.trim();
    if (!trimmed || trimmed === lastProcessedTranscriptRef.current || processingRef.current) {
      return;
    }

    processingRef.current = true;
    lastProcessedTranscriptRef.current = trimmed;
    setIsExtractingClinical(true);

    try {
      // Deterministic baseline rule extraction
      const baseline = extractClinicalInformationFromText(trimmed, language);

      // Attempt AI backend extraction with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        const resp = await fetch('/api/gemini/extract-clinical-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: trimmed, language }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const result = await resp.json();
          if (result?.data) {
            setExtractedInfo(result.data);
            onClinicalInfoExtracted?.(result.data);
            return;
          }
        }
      } catch {
        // Fallback gracefully to client-side rule extraction
      }

      setExtractedInfo(baseline);
      onClinicalInfoExtracted?.(baseline);
    } catch {
      // ignore
    } finally {
      setIsExtractingClinical(false);
      processingRef.current = false;
    }
  }, [language, onClinicalInfoExtracted]);

  // Hook for speech recognition
  const {
    state,
    interimTranscript,
    feedbackMessage,
    errorDetails,
    diagnostics,
    audioLevelStatus,
    currentRms,
    speechProvider,
    setSpeechProvider,
    runAudioHardwareTest,
    isTestingAudio,
    handleMicrophoneClick,
    resetState,
    stopListening,
  } = useSpeechRecognition({
    languageCode: speechCode || 'en-IN',
    onFinalTranscript: (final) => {
      // Append or replace transcript
      const newText = value ? `${value} ${final}`.trim() : final;
      onChange(newText, newText, isNurseAssisted ? 'NURSE_ASSISTED' : 'PATIENT_VOICE');
      // Trigger clinical NLP
      processClinicalInformation(newText);
    },
    onInterimTranscript: (interim) => {
      // Live interim text
    },
  });

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopAudio();
    };
  }, [stopListening, stopAudio]);

  // Handle Clarification Selection (Section 11 & 12)
  const handleClarificationChoice = (choiceSide: 'left' | 'right' | 'both') => {
    if (!extractedInfo || !extractedInfo.bodyLocation) return;

    const updatedLocation = {
      ...extractedInfo.bodyLocation,
      laterality: choiceSide,
    };

    const updatedStructured = (extractedInfo.structuredRegions || []).map(r => ({
      ...r,
      side: choiceSide,
    }));

    const resolvedInfo: ExtractedClinicalInfo = {
      ...extractedInfo,
      bodyLocation: updatedLocation,
      structuredRegions: updatedStructured,
      needsClarification: false,
      clarificationQuestion: undefined,
    };

    setExtractedInfo(resolvedInfo);
    onClinicalInfoExtracted?.(resolvedInfo);

    // Speak confirmation
    const sideLabel = choiceSide === 'both' ? 'both sides' : `${choiceSide} side`;
    speak(`Recorded ${sideLabel}.`, speechCode);
  };

  const handleApplySample = (sample: SampleComplaint) => {
    lastProcessedTranscriptRef.current = sample.englishTranslation;
    onChange(sample.englishTranslation, sample.nativeText, 'PATIENT_TOUCH');
    processClinicalInformation(sample.englishTranslation);
    onSampleSelect?.(sample);
  };

  const handleSpeakCurrentText = () => {
    if (value) {
      speak(value, speechCode);
    }
  };

  // Human-readable labels strictly matching Section 9
  const getMicrophoneStateLabel = (s: RecognitionState): string => {
    switch (s) {
      case 'IDLE':
        return 'Tap to speak';
      case 'STARTING':
        return 'Starting microphone...';
      case 'LISTENING':
        return 'Listening... Speak now';
      case 'PROCESSING':
        return 'Processing...';
      case 'SUCCESS':
        return 'Got it';
      case 'ERROR':
        return 'Try again';
    }
  };

  // Filter samples that match current language
  const relevantSamples = SAMPLE_COMPLAINTS.filter((s) => s.language === language);
  const displaySamples = relevantSamples.length > 0 ? relevantSamples : SAMPLE_COMPLAINTS.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Microphone Control Banner */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-4">
            {/* Deterministic Microphone Button */}
            <button
              type="button"
              id="btn-voice-record"
              onClick={handleMicrophoneClick}
              disabled={state === 'STARTING' || state === 'PROCESSING'}
              className={`relative h-16 w-16 rounded-full flex items-center justify-center transition-all cursor-pointer select-none ${
                state === 'LISTENING'
                  ? 'bg-rose-600 text-white ring-4 ring-rose-400/40 animate-pulse scale-105'
                  : state === 'STARTING'
                  ? 'bg-amber-500 text-white cursor-wait'
                  : state === 'PROCESSING'
                  ? 'bg-sky-600 text-white cursor-wait'
                  : state === 'SUCCESS'
                  ? 'bg-emerald-600 text-white'
                  : state === 'ERROR'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white ring-2 ring-amber-400/40'
                  : 'bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/30'
              }`}
              aria-label={getMicrophoneStateLabel(state)}
              title={getMicrophoneStateLabel(state)}
            >
              {state === 'LISTENING' ? (
                <MicOff className="h-7 w-7" />
              ) : state === 'STARTING' || state === 'PROCESSING' ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : state === 'SUCCESS' ? (
                <CheckCircle2 className="h-7 w-7" />
              ) : state === 'ERROR' ? (
                <RefreshCw className="h-6 w-6" />
              ) : (
                <Mic className="h-7 w-7 stroke-[2.2]" />
              )}

              {/* Concentric sound wave ripples during active recording */}
              {state === 'LISTENING' && (
                <span className="absolute -inset-2 rounded-full border-2 border-rose-400/60 animate-ping pointer-events-none" />
              )}
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-white">
                  {state === 'LISTENING' && '🔴 '}
                  {getMicrophoneStateLabel(state)}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-teal-200">
                  {currentLanguage.nativeName} ({speechCode})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {state === 'LISTENING'
                  ? t('voice.speakNaturally', 'Speak your symptoms clearly in your comfortable language')
                  : state === 'STARTING'
                  ? 'Initializing audio hardware...'
                  : state === 'PROCESSING'
                  ? 'Converting voice to clinical text...'
                  : state === 'ERROR'
                  ? 'Microphone encountered an issue. Tap to try again.'
                  : t('voice.subtitle', 'Speak in Tamil, Hindi, Telugu, Kannada, English, or your native dialect')}
              </p>
            </div>
          </div>

          {/* Sound Wave Visualizer */}
          <div
            className="flex items-center space-x-1.5 self-center sm:self-auto h-8 px-3 rounded-lg bg-slate-800/80 border border-slate-700"
            title={t('voice.soundWave', 'Audio level')}
          >
            {[4, 8, 14, 22, 16, 26, 12, 18, 6, 12].map((height, idx) => {
              const dynamicHeight =
                state === 'LISTENING'
                  ? Math.max(4, Math.min(28, Math.round((currentRms / 100) * height * 1.8) + 4))
                  : 4;
              return (
                <span
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    state === 'LISTENING'
                      ? audioLevelStatus === 'DETECTED'
                        ? 'bg-emerald-400'
                        : 'bg-teal-400 animate-pulse'
                      : 'bg-slate-600'
                  }`}
                  style={{ height: `${dynamicHeight}px` }}
                />
              );
            })}
          </div>

        </div>

        {/* Section 8: Active Listening Indicator & Internal Audio Detection UX */}
        {state === 'LISTENING' && (
          <div className="mt-3 p-2.5 rounded-xl bg-teal-950/80 border border-teal-500/50 flex flex-wrap items-center justify-between gap-2 text-xs animate-fadeIn">
            <div className="flex items-center space-x-2 text-teal-200 font-semibold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400"></span>
              </span>
              <span>Listening... Please speak now.</span>
            </div>

            {/* Internal audio diagnostic indicator */}
            <div className="flex items-center space-x-1.5 text-[11px] font-mono">
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  audioLevelStatus === 'DETECTED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {audioLevelStatus === 'DETECTED' ? '● Audio detected' : '○ No microphone audio detected'}
              </span>
              <span className="text-slate-400 text-[10px]">{currentRms}% RMS</span>
            </div>
          </div>
        )}

        {/* Interim live speech preview while speaking */}
        {interimTranscript && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-800/90 border border-teal-500/30 text-xs text-teal-200 animate-pulse">
            <span className="font-semibold text-slate-400 mr-2">Speaking:</span>
            <span className="italic font-medium">"{interimTranscript}"</span>
          </div>
        )}

        {/* Code-mixed speech support note & Diagnostics toggle */}
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-teal-300/80">
          <div className="flex items-center space-x-1">
            <span>💡</span>
            <span>{t('voice.codeMixedSupported', 'Code-mixed Indian languages supported (Tanglish, Hinglish, Kanglish)')}</span>
          </div>
          
          <button 
            type="button" 
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="text-slate-400 hover:text-white flex items-center space-x-1 text-[11px] font-mono cursor-pointer"
          >
            <span>Diagnostics</span>
            {showDiagnostics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Transient feedback message */}
        {feedbackMessage && state !== 'LISTENING' && state !== 'IDLE' && (
          <div className="mt-2 py-1 px-2.5 rounded-lg bg-white/10 text-xs text-teal-200 flex items-center space-x-1.5">
            <Activity className="h-3.5 w-3.5 shrink-0 animate-pulse" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Diagnostics Panel (Sections 1, 2, 8, 10 & 11) */}
      {(showDiagnostics || state === 'ERROR') && (
        <div className="bg-slate-900 text-[11px] text-slate-300 p-4 rounded-xl border border-slate-700 font-mono shadow-md animate-fadeIn space-y-3">
          <div className="flex flex-wrap items-center justify-between font-bold text-white pb-2 border-b border-slate-700 gap-2">
            <span className="text-teal-400">Microphone & Speech Diagnostics</span>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {diagnostics.environment === 'PREVIEW_IFRAME' ? 'Google AI Studio Preview (Iframe)' : 'Top-Level Chrome Tab'}
              </span>
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-sky-400 hover:text-sky-300 underline font-sans cursor-pointer"
                title="Test directly in a normal Chrome tab without preview iframe sandbox"
              >
                Open in New Tab ↗
              </a>
            </div>
          </div>

          {/* Real Microphone Hardware Inspection (Section 1) */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              1. Hardware & MediaStream Inspection
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <div>
                Microphone API:{' '}
                <span className={diagnostics.microphoneApi === 'AVAILABLE' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {diagnostics.microphoneApi}
                </span>
              </div>
              <div>
                Microphone permission:{' '}
                <span className={diagnostics.microphonePermission === 'GRANTED' ? 'text-emerald-400 font-bold' : diagnostics.microphonePermission === 'DENIED' ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                  {diagnostics.microphonePermission}
                </span>
              </div>
              <div>
                Microphone device:{' '}
                <span className={diagnostics.microphoneDevice === 'DETECTED' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {diagnostics.microphoneDevice}
                </span>
              </div>
              <div>
                Audio track state:{' '}
                <span className={diagnostics.audioTrackState === 'ACTIVE' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {diagnostics.audioTrackState}
                </span>
              </div>
              <div className="sm:col-span-2 truncate">
                Audio input label:{' '}
                <span className="text-white font-medium">{diagnostics.audioInputLabel}</span>
              </div>
              <div>
                Sample rate: <span className="text-teal-300">{diagnostics.sampleRate ? `${diagnostics.sampleRate} Hz` : 'N/A'}</span>
              </div>
              <div>
                Channel count: <span className="text-teal-300">{diagnostics.channelCount ?? 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Real Audio Level Test (Section 2 & 8) */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              2. Real Audio Level Test (AudioContext / AnalyserNode)
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div>
                  Microphone audio level:{' '}
                  <span className={diagnostics.audioLevel === 'DETECTED' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {diagnostics.audioLevel}
                  </span>{' '}
                  <span className="text-slate-400">({diagnostics.audioRms}%)</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Speech detected in current/last session:{' '}
                  <span className={diagnostics.speechDetectedDuringSession ? 'text-emerald-400 font-bold' : 'text-slate-400 font-bold'}>
                    {diagnostics.speechDetectedDuringSession ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={runAudioHardwareTest}
                disabled={isTestingAudio || state === 'LISTENING'}
                className="px-3 py-1.5 rounded-md bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-[11px] font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Mic className="w-3 h-3" />
                <span>{isTestingAudio ? 'Testing audio levels...' : 'Run Audio Level Test'}</span>
              </button>
            </div>
          </div>

          {/* SpeechRecognition API & Abstract Provider (Section 10 & 11) */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              3. Speech Recognition Engine & Provider Architecture
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <div>
                SpeechRecognition API:{' '}
                <span className={diagnostics.speechRecognitionApi === 'AVAILABLE' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {diagnostics.speechRecognitionApi}
                </span>
              </div>
              <div>
                Recognition language:{' '}
                <span className="text-sky-400 font-bold">{diagnostics.recognitionLanguage || speechCode}</span>
              </div>
              <div>
                Recognition state:{' '}
                <span className="text-amber-400 font-bold">{diagnostics.recognitionState}</span>
              </div>
              <div>
                Secure Context:{' '}
                <span className={diagnostics.isSecureContext ? 'text-emerald-400' : 'text-amber-400'}>
                  {diagnostics.isSecureContext ? 'YES' : 'NO'}
                </span>
              </div>
              <div>
                Active provider used:{' '}
                <span className="text-teal-300 font-bold">{diagnostics.activeProviderUsed}</span>
              </div>
              <div>
                Last error:{' '}
                <span className={diagnostics.lastRecognitionError === 'None' ? 'text-emerald-400' : 'text-rose-400 font-semibold'}>
                  {diagnostics.lastRecognitionError}
                </span>
              </div>

              <div className="sm:col-span-2 pt-1 border-t border-slate-700/50 flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400">Speech Provider Mode:</span>
                {(['AUTO', 'BROWSER', 'SERVER_CLOUD'] as const).map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setSpeechProvider(prov)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      speechProvider === prov
                        ? 'bg-teal-600 text-white font-bold'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {prov === 'AUTO' ? 'Auto (Browser + Cloud Fallback)' : prov === 'BROWSER' ? 'Browser Native' : 'Cloud STT'}
                  </button>
                ))}
              </div>

              {diagnostics.lastTranscript && (
                <div className="sm:col-span-2 truncate pt-1 border-t border-slate-700/50">
                  Last transcript: <span className="text-white italic">"{diagnostics.lastTranscript}"</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Accessible Error / Fallback Action Banner (Sections 7, 16 & 17) */}
      {errorDetails && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-slate-800 shadow-xs animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{errorDetails.title}</h4>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{errorDetails.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetState}
              className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 cursor-pointer"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>

          {/* Action buttons: Try Again / Type Instead / Nurse Assistance */}
          <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex flex-wrap items-center gap-2">
            {errorDetails.canRetry && (
              <button
                type="button"
                id="btn-retry-mic-permission"
                onClick={() => {
                  resetState();
                  handleMicrophoneClick();
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </button>
            )}

            <button
              type="button"
              id="btn-switch-type-instead"
              onClick={() => {
                resetState();
                textareaRef.current?.focus();
                textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Keyboard className="h-3.5 w-3.5 text-slate-600" />
              <span>Type Instead</span>
            </button>

            <button
              type="button"
              id="btn-nurse-assistance"
              onClick={() => {
                resetState();
                onNurseAssistanceClick?.();
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-sky-50 border border-sky-300 hover:bg-sky-100 text-sky-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <UserCheck className="h-3.5 w-3.5 text-sky-600" />
              <span>Ask Nurse for Help</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Text Area with live sync */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="input-chief-complaint"
          rows={3}
          value={value}
          onChange={(e) => {
            onChange(e.target.value, e.target.value, isNurseAssisted ? 'NURSE_ASSISTED' : 'PATIENT_TOUCH');
          }}
          onBlur={(e) => {
            if (e.target.value.trim().length > 3) {
              processClinicalInformation(e.target.value);
            }
          }}
          placeholder={t('voice.transcriptPlaceholder', 'Speak into the microphone or type your symptoms here...')}
          className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-xs resize-none leading-relaxed"
        />
        {value && (
          <button
            type="button"
            onClick={handleSpeakCurrentText}
            className="absolute bottom-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title={t('voice.listenBack', 'Listen back')}
          >
            <Volume2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Extracted Clinical Data & Interactive Clarification Question (Sections 11 & 12) */}
      {extractedInfo && (extractedInfo.bodyLocation || extractedInfo.duration || extractedInfo.needsClarification) && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 font-bold text-slate-900">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>MedNova Clinical Extraction</span>
            </div>
            {isExtractingClinical && (
              <span className="text-[10px] text-teal-600 flex items-center space-x-1 animate-pulse">
                <Activity className="h-3 w-3" />
                <span>Extracting...</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            {extractedInfo.bodyLocation && (
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block font-medium">Body Location:</span>
                <span className="font-bold text-slate-900">
                  {extractedInfo.bodyLocation.laterality !== 'unspecified'
                    ? `${extractedInfo.bodyLocation.laterality.toUpperCase()} `
                    : ''}
                  {extractedInfo.bodyLocation.label}
                  {extractedInfo.bodyLocation.specificRegion ? ` (${extractedInfo.bodyLocation.specificRegion})` : ''}
                </span>
              </div>
            )}

            {extractedInfo.duration && (
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block font-medium">Duration:</span>
                <span className="font-bold text-slate-900">{extractedInfo.duration}</span>
              </div>
            )}

            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <span className="text-slate-500 block font-medium">Complaint:</span>
              <span className="font-bold text-slate-900 capitalize">{extractedInfo.complaintType}</span>
            </div>
          </div>

          {/* Clarification prompt if patient mentioned paired limb without specifying side (Section 12) */}
          {extractedInfo.needsClarification && extractedInfo.clarificationQuestion && (
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 space-y-2">
              <div className="flex items-center space-x-1.5 font-bold text-indigo-900">
                <HelpCircle className="h-3.5 w-3.5 text-indigo-600" />
                <span>{extractedInfo.clarificationQuestion}</span>
              </div>
              <p className="text-[11px] text-indigo-700">
                Please specify which side is hurting so the physician receives an accurate clinical map:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {(extractedInfo.clarificationOptions || [
                  { label: 'Left', side: 'left' },
                  { label: 'Right', side: 'right' },
                  { label: 'Both', side: 'both' },
                ]).map((opt) => (
                  <button
                    key={opt.side}
                    type="button"
                    onClick={() => handleClarificationChoice(opt.side)}
                    className="px-3 py-1 rounded-md bg-white border border-indigo-300 text-indigo-900 hover:bg-indigo-600 hover:text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* One-Click Sample Prompts (Accurate clinical scenarios) */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-teal-600" />
          <span>{t('voice.samplePromptsTitle', 'Sample Multilingual Clinical Complaints')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {displaySamples.map((sample, idx) => (
            <button
              key={idx}
              id={`sample-prompt-${idx}`}
              type="button"
              onClick={() => handleApplySample(sample)}
              className="flex flex-col items-start p-2.5 rounded-lg bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-left transition-all group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                  {sample.category}
                </span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm ${
                  sample.expectedTriage === 1 
                    ? 'bg-red-100 text-red-700' 
                    : sample.expectedTriage === 2 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  ESI Level {sample.expectedTriage}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                "{sample.nativeText}"
              </p>
              <span className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
                → {sample.englishTranslation}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
