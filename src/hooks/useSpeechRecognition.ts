import { useState, useEffect, useRef, useCallback } from 'react';

export type RecognitionState = 'IDLE' | 'STARTING' | 'LISTENING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

export type SpeechProviderType = 'AUTO' | 'BROWSER' | 'SERVER_CLOUD';

export interface SpeechErrorDetails {
  type: string;
  message: string;
  title: string;
  isPermissionBlocked?: boolean;
  canRetry: boolean;
  audioDetected?: boolean;
}

export interface SpeechDiagnostics {
  // Core API & permission states
  microphoneApi: 'AVAILABLE' | 'UNAVAILABLE';
  microphonePermission: 'GRANTED' | 'DENIED' | 'PROMPT' | 'UNKNOWN';
  speechRecognitionApi: 'AVAILABLE' | 'UNAVAILABLE';
  recognitionLanguage: string;
  recognitionState: RecognitionState;
  lastRecognitionError: string;
  lastTranscript: string;
  lastRecognitionStartTime: string;
  lastRecognitionEndTime: string;

  // Real Hardware Inspection (Section 1)
  microphoneDevice: 'DETECTED' | 'NOT DETECTED';
  audioTrackState: 'ACTIVE' | 'INACTIVE';
  audioInputLabel: string;
  sampleRate?: number;
  channelCount?: number;

  // Real Audio Level / RMS Test (Section 2 & 8)
  audioLevel: 'SILENT' | 'DETECTED';
  audioRms: number; // 0 - 100 percentage
  speechDetectedDuringSession: boolean;

  // Architecture & Environment (Section 10 & 11)
  environment: 'PREVIEW_IFRAME' | 'TOP_LEVEL_TAB';
  speechProvider: SpeechProviderType;
  activeProviderUsed: string;

  // Backward compatibility fields
  microphoneAvailable: 'YES' | 'NO' | 'CHECKING';
  permission: 'GRANTED' | 'DENIED' | 'UNKNOWN';
  selectedLanguage: string;
  lastSpeechError: string;
  isSecureContext: boolean;
}

interface UseSpeechRecognitionOptions {
  languageCode: string; // e.g., 'en-IN', 'ta-IN', 'hi-IN', etc.
  onFinalTranscript?: (transcript: string) => void;
  onInterimTranscript?: (interim: string) => void;
  onStateChange?: (state: RecognitionState) => void;
  silenceTimeoutMs?: number; // default: 12000ms
  maxDurationMs?: number; // default: 45000ms
}

export function useSpeechRecognition({
  languageCode,
  onFinalTranscript,
  onInterimTranscript,
  onStateChange,
  silenceTimeoutMs = 12000,
  maxDurationMs = 45000,
}: UseSpeechRecognitionOptions) {
  const [state, setStateInternal] = useState<RecognitionState>('IDLE');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<SpeechErrorDetails | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [audioLevelStatus, setAudioLevelStatus] = useState<'SILENT' | 'DETECTED'>('SILENT');
  const [currentRms, setCurrentRms] = useState<number>(0);
  const [speechProvider, setSpeechProviderState] = useState<SpeechProviderType>('AUTO');
  const [isTestingAudio, setIsTestingAudio] = useState<boolean>(false);

  // Detect environment (Google AI Studio Preview iframe vs Top-level browser tab)
  const isIframe = typeof window !== 'undefined' ? window.self !== window.top : false;

  // Diagnostics state for patient/clinician inspection
  const [diagnostics, setDiagnostics] = useState<SpeechDiagnostics>({
    microphoneApi: typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) ? 'AVAILABLE' : 'UNAVAILABLE',
    microphonePermission: 'UNKNOWN',
    speechRecognitionApi: typeof window !== 'undefined' && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) ? 'AVAILABLE' : 'UNAVAILABLE',
    recognitionLanguage: languageCode,
    recognitionState: 'IDLE',
    lastRecognitionError: 'None',
    lastTranscript: '',
    lastRecognitionStartTime: '-',
    lastRecognitionEndTime: '-',

    // Real Hardware Inspection
    microphoneDevice: 'NOT DETECTED',
    audioTrackState: 'INACTIVE',
    audioInputLabel: 'Awaiting microphone access...',
    sampleRate: undefined,
    channelCount: undefined,

    // Real Audio Level Detection
    audioLevel: 'SILENT',
    audioRms: 0,
    speechDetectedDuringSession: false,

    // Environment & Provider
    environment: isIframe ? 'PREVIEW_IFRAME' : 'TOP_LEVEL_TAB',
    speechProvider: 'AUTO',
    activeProviderUsed: 'None',

    // Compatibility
    microphoneAvailable: typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) ? 'YES' : 'NO',
    permission: 'UNKNOWN',
    selectedLanguage: languageCode,
    lastSpeechError: 'None',
    isSecureContext: typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false,
  });

  // Stable references
  const recognitionRef = useRef<any>(null);
  const stateRef = useRef<RecognitionState>('IDLE');
  const silenceTimerRef = useRef<any>(null);
  const maxDurationTimerRef = useRef<any>(null);
  const processingRef = useRef<boolean>(false);
  const currentLangRef = useRef<string>(languageCode);
  const providerRef = useRef<SpeechProviderType>('AUTO');

  // Audio Pipeline References (Hardware track, AudioContext, AnalyserNode, MediaRecorder)
  const activeStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechDetectedInSessionRef = useRef<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  currentLangRef.current = languageCode;
  providerRef.current = speechProvider;

  const setSpeechProvider = useCallback((provider: SpeechProviderType) => {
    setSpeechProviderState(provider);
    providerRef.current = provider;
    setDiagnostics(prev => ({ ...prev, speechProvider: provider }));
  }, []);

  const updateState = useCallback((newState: RecognitionState) => {
    stateRef.current = newState;
    setStateInternal(newState);
    setDiagnostics(prev => ({
      ...prev,
      recognitionState: newState,
      selectedLanguage: currentLangRef.current,
    }));
    onStateChange?.(newState);
  }, [onStateChange]);

  const clearAllTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
  }, []);

  // Section 3: Safe cleanup of audio tracks & context
  const cleanupAudioPipeline = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceNodeRef.current = null;
    }

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {
        // ignore
      }
      analyserRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }

    if (activeStreamRef.current) {
      try {
        activeStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch {
        // ignore
      }
      activeStreamRef.current = null;
    }

    setDiagnostics(prev => ({
      ...prev,
      audioTrackState: 'INACTIVE',
      audioLevel: 'SILENT',
      audioRms: 0,
    }));
    setAudioLevelStatus('SILENT');
    setCurrentRms(0);
  }, []);

  // Section 6: Stop Text-to-Speech (TTS) before STT starts
  const stopAnyOngoingTTS = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }, []);

  // Check hardware and API support on mount or language change
  useEffect(() => {
    const isBrowser = typeof window !== 'undefined';
    if (!isBrowser) return;

    const SpeechRecConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const hasMedia = Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasApi = Boolean(SpeechRecConstructor);

    setDiagnostics(prev => ({
      ...prev,
      speechRecognitionApi: hasApi ? 'AVAILABLE' : 'UNAVAILABLE',
      microphoneApi: hasMedia ? 'AVAILABLE' : 'UNAVAILABLE',
      microphoneAvailable: hasMedia ? 'YES' : 'NO',
      recognitionLanguage: languageCode,
      selectedLanguage: languageCode,
      isSecureContext: Boolean(window.isSecureContext),
      environment: isIframe ? 'PREVIEW_IFRAME' : 'TOP_LEVEL_TAB',
    }));

    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          const stateMap: Record<string, 'GRANTED' | 'DENIED' | 'PROMPT'> = {
            granted: 'GRANTED',
            denied: 'DENIED',
            prompt: 'PROMPT',
          };
          const mapped = stateMap[permissionStatus.state] || 'UNKNOWN';
          setDiagnostics(prev => ({
            ...prev,
            microphonePermission: mapped,
            permission: mapped === 'GRANTED' ? 'GRANTED' : mapped === 'DENIED' ? 'DENIED' : 'UNKNOWN',
          }));
          permissionStatus.onchange = () => {
            const updated = stateMap[permissionStatus.state] || 'UNKNOWN';
            setDiagnostics(prev => ({
              ...prev,
              microphonePermission: updated,
              permission: updated === 'GRANTED' ? 'GRANTED' : updated === 'DENIED' ? 'DENIED' : 'UNKNOWN',
            }));
          };
        })
        .catch(() => {
          // Permissions API might not support 'microphone' in some browsers
        });
    }
  }, [languageCode, isIframe]);

  // Section 1 & 2: Dedicated Audio Level & Hardware Diagnostic Function
  const runAudioHardwareTest = useCallback(async () => {
    if (isTestingAudio || stateRef.current === 'LISTENING') return;
    setIsTestingAudio(true);
    stopAnyOngoingTTS();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const tracks = stream.getAudioTracks();
      if (!tracks || tracks.length === 0) {
        throw new Error('No audio tracks returned by hardware');
      }

      const activeTrack = tracks[0];
      const settings = activeTrack.getSettings ? activeTrack.getSettings() : {};

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const testAudioCtx = new AudioCtxClass();
      const testSource = testAudioCtx.createMediaStreamSource(stream);
      const testAnalyser = testAudioCtx.createAnalyser();
      testAnalyser.fftSize = 256;
      testSource.connect(testAnalyser);

      const buffer = new Uint8Array(testAnalyser.frequencyBinCount);
      let maxLevel = 0;
      let detectedSpeech = false;

      const startTime = Date.now();
      const checkLoop = () => {
        if (Date.now() - startTime > 3000) {
          // Complete test
          testSource.disconnect();
          testAnalyser.disconnect();
          testAudioCtx.close().catch(() => {});
          tracks.forEach(t => t.stop());
          setIsTestingAudio(false);
          return;
        }

        testAnalyser.getByteTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          const norm = (buffer[i] - 128) / 128;
          sum += norm * norm;
        }
        const rms = Math.sqrt(sum / buffer.length);
        const levelPct = Math.min(100, Math.round(rms * 250));
        if (levelPct > maxLevel) maxLevel = levelPct;
        if (rms > 0.02) detectedSpeech = true;

        setDiagnostics(prev => ({
          ...prev,
          microphoneDevice: 'DETECTED',
          audioTrackState: 'ACTIVE',
          audioInputLabel: activeTrack.label || 'Default Microphone',
          sampleRate: settings.sampleRate,
          channelCount: settings.channelCount,
          audioLevel: detectedSpeech ? 'DETECTED' : 'SILENT',
          audioRms: levelPct,
          speechDetectedDuringSession: detectedSpeech,
        }));
        setAudioLevelStatus(detectedSpeech ? 'DETECTED' : 'SILENT');
        setCurrentRms(levelPct);

        animFrameRef.current = requestAnimationFrame(checkLoop);
      };

      animFrameRef.current = requestAnimationFrame(checkLoop);
    } catch (err: any) {
      setIsTestingAudio(false);
      setDiagnostics(prev => ({
        ...prev,
        microphoneDevice: 'NOT DETECTED',
        audioTrackState: 'INACTIVE',
        lastRecognitionError: err?.name || 'HardwareAccessError',
      }));
    }
  }, [isTestingAudio, stopAnyOngoingTTS]);

  // Section 11 & 12: Real Server-Side Speech Transcription
  const transcribeAudioViaServer = useCallback(async (audioBlob: Blob, langCode: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          if (!base64Data) {
            resolve(null);
            return;
          }

          const response = await fetch('/api/speech/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Data,
              mimeType: audioBlob.type || 'audio/webm',
              languageCode: langCode,
            }),
          });

          if (!response.ok) {
            resolve(null);
            return;
          }

          const data = await response.json();
          if (data.success && data.transcript) {
            resolve(data.transcript);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(audioBlob);
    });
  }, []);

  // Safe stop
  const stopListening = useCallback(() => {
    clearAllTimers();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    }

    cleanupAudioPipeline();

    if (stateRef.current !== 'SUCCESS' && stateRef.current !== 'ERROR') {
      updateState('IDLE');
    }
  }, [clearAllTimers, cleanupAudioPipeline, updateState]);

  // Reset to IDLE
  const resetState = useCallback(() => {
    clearAllTimers();
    cleanupAudioPipeline();
    processingRef.current = false;
    setErrorDetails(null);
    setFeedbackMessage('');
    setInterimTranscript('');
    setAudioLevelStatus('SILENT');
    setCurrentRms(0);
    updateState('IDLE');
  }, [clearAllTimers, cleanupAudioPipeline, updateState]);

  // Start speech recognition session
  const startListening = useCallback(async () => {
    if (
      stateRef.current === 'STARTING' ||
      stateRef.current === 'LISTENING' ||
      stateRef.current === 'PROCESSING' ||
      processingRef.current
    ) {
      return;
    }

    // 1. Clear previous errors and reset state
    clearAllTimers();
    cleanupAudioPipeline();
    setErrorDetails(null);
    setInterimTranscript('');
    speechDetectedInSessionRef.current = false;
    recordedChunksRef.current = [];
    updateState('STARTING');
    setFeedbackMessage('Preparing microphone...');

    // 2. Section 6: Stop any ongoing TTS audio and enforce a 250ms stabilization delay
    stopAnyOngoingTTS();
    await new Promise((resolve) => setTimeout(resolve, 250));

    // 3. Section 1: Obtain & Inspect real MediaStream hardware
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;
    } catch (err: any) {
      cleanupAudioPipeline();
      updateState('ERROR');
      const errName = err.name || '';
      const isBlocked = errName === 'NotAllowedError' || errName === 'PermissionDeniedError';
      const title = isBlocked ? 'Microphone access blocked' : 'No microphone detected';
      const message = isBlocked
        ? 'Microphone access is blocked. Please allow microphone access in your browser settings.'
        : 'Unable to access your microphone device. Please check hardware connection.';

      setErrorDetails({
        type: errName || 'permission-error',
        title,
        message,
        isPermissionBlocked: isBlocked,
        canRetry: true,
      });
      setFeedbackMessage(message);
      setDiagnostics(prev => ({
        ...prev,
        microphoneDevice: 'NOT DETECTED',
        audioTrackState: 'INACTIVE',
        microphonePermission: isBlocked ? 'DENIED' : prev.microphonePermission,
        lastRecognitionError: errName || 'HardwareAccessError',
      }));
      return;
    }

    // Inspect tracks
    const tracks = stream.getAudioTracks();
    if (!tracks || tracks.length === 0 || tracks[0].readyState !== 'live') {
      cleanupAudioPipeline();
      updateState('ERROR');
      setErrorDetails({
        type: 'no-tracks',
        title: 'Microphone track inactive',
        message: 'The audio track was not live. Please verify your microphone.',
        canRetry: true,
      });
      return;
    }

    const primaryTrack = tracks[0];
    const settings = primaryTrack.getSettings ? primaryTrack.getSettings() : {};

    setDiagnostics(prev => ({
      ...prev,
      microphoneApi: 'AVAILABLE',
      microphonePermission: 'GRANTED',
      permission: 'GRANTED',
      microphoneDevice: 'DETECTED',
      audioTrackState: 'ACTIVE',
      audioInputLabel: primaryTrack.label || 'Microphone Audio Input',
      sampleRate: settings.sampleRate,
      channelCount: settings.channelCount,
      lastRecognitionStartTime: new Date().toLocaleTimeString(),
    }));

    // 4. Section 2: Connect real-time AudioContext + AnalyserNode for audio level RMS monitoring
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      audioContextRef.current = audioCtx;

      const sourceNode = audioCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      sourceNode.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const monitorAudioLevel = () => {
        if (stateRef.current !== 'LISTENING' && stateRef.current !== 'STARTING') {
          return;
        }

        analyser.getByteTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          const norm = (buffer[i] - 128) / 128;
          sum += norm * norm;
        }
        const rms = Math.sqrt(sum / buffer.length);
        const levelPct = Math.min(100, Math.round(rms * 250));

        // RMS threshold for detectable speech
        if (rms > 0.022) {
          speechDetectedInSessionRef.current = true;
          setAudioLevelStatus('DETECTED');
        }

        setCurrentRms(levelPct);
        setDiagnostics(prev => ({
          ...prev,
          audioLevel: speechDetectedInSessionRef.current ? 'DETECTED' : 'SILENT',
          audioRms: levelPct,
          speechDetectedDuringSession: speechDetectedInSessionRef.current,
        }));

        animFrameRef.current = requestAnimationFrame(monitorAudioLevel);
      };

      animFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    } catch (audioErr) {
      console.warn('[Audio Analyser] Unable to start audio context:', audioErr);
    }

    // 5. Section 11: Setup MediaRecorder for real audio capture
    let mediaRecorder: MediaRecorder | null = null;
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/ogg')
        ? 'audio/ogg'
        : '';

      mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.start(250); // Slice every 250ms
    } catch (recErr) {
      console.warn('[MediaRecorder] Fallback recording not supported on this browser:', recErr);
    }

    // 6. Check Browser Speech Recognition
    const SpeechRecConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const currentProvider = providerRef.current;
    const preferBrowser = currentProvider === 'BROWSER' || (currentProvider === 'AUTO' && Boolean(SpeechRecConstructor));

    let sessionCommitted = false;

    // Helper: commit final transcript from either provider
    const commitTranscript = (transcriptText: string, sourceProvider: string) => {
      if (sessionCommitted) return;
      sessionCommitted = true;
      clearAllTimers();
      cleanupAudioPipeline();

      const cleanFinal = transcriptText.trim();
      setFinalTranscript(cleanFinal);
      setInterimTranscript('');
      setDiagnostics(prev => ({
        ...prev,
        lastTranscript: cleanFinal,
        activeProviderUsed: sourceProvider,
        lastRecognitionEndTime: new Date().toLocaleTimeString(),
      }));

      updateState('PROCESSING');
      setFeedbackMessage('Processing...');
      processingRef.current = true;

      // Section 12: Pass transcript to Clinical Information Extraction & ADCP
      onFinalTranscript?.(cleanFinal);

      setTimeout(() => {
        updateState('SUCCESS');
        setFeedbackMessage('Got it');
        setTimeout(() => {
          processingRef.current = false;
          updateState('IDLE');
          setFeedbackMessage('');
        }, 1500);
      }, 500);
    };

    // Helper: trigger Server Speech-to-Text Fallback
    const runServerSpeechFallback = async (triggerReason: string) => {
      if (sessionCommitted) return;
      setFeedbackMessage('Transcribing speech...');
      updateState('PROCESSING');

      // Stop recorder to flush last chunk
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
      const blob = new Blob(recordedChunksRef.current, {
        type: mediaRecorderRef.current?.mimeType || 'audio/webm',
      });

      cleanupAudioPipeline();

      if (blob.size > 2000) {
        const serverTranscript = await transcribeAudioViaServer(blob, currentLangRef.current);
        if (serverTranscript && serverTranscript.length > 0) {
          commitTranscript(serverTranscript, 'Server STT (Cloud)');
          return;
        }
      }

      // Section 5: Calibrated handling if audio was detected but speech recognition produced no words
      updateState('ERROR');
      const wasAudioDetected = speechDetectedInSessionRef.current;

      setDiagnostics(prev => ({
        ...prev,
        lastRecognitionError: 'no-speech',
        lastSpeechError: 'no-speech',
        lastRecognitionEndTime: new Date().toLocaleTimeString(),
      }));

      if (wasAudioDetected) {
        // Microphone hardware captured sound, but words were not recognized
        setErrorDetails({
          type: 'no-speech-with-audio',
          title: 'Speech not detected',
          message: 'I can access your microphone, but speech recognition did not detect your words.',
          canRetry: true,
          audioDetected: true,
        });
        setFeedbackMessage('I can access your microphone, but speech recognition did not detect your words.');
      } else {
        // No sound or silence
        setErrorDetails({
          type: 'no-speech-silent',
          title: 'No speech detected',
          message: "I couldn't hear speech. Please speak into your microphone and try again.",
          canRetry: true,
          audioDetected: false,
        });
        setFeedbackMessage("I couldn't hear speech. Please try again.");
      }
    };

    // 7. Execute Browser Speech Recognition if supported & requested
    if (preferBrowser && SpeechRecConstructor) {
      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {
            // ignore
          }
        }

        const recognition = new SpeechRecConstructor();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        // Section 4: Strict language mapping
        recognition.lang = currentLangRef.current || 'en-IN';

        recognition.onstart = () => {
          updateState('LISTENING');
          // Section 8: Listening UX
          setFeedbackMessage('Listening... Please speak now.');

          // Silence timeout: 12 seconds
          silenceTimerRef.current = setTimeout(() => {
            if (stateRef.current === 'LISTENING' && !sessionCommitted) {
              try {
                recognition.stop();
              } catch {
                // ignore
              }
              if (currentProvider === 'AUTO' && speechDetectedInSessionRef.current) {
                runServerSpeechFallback('Silence timer with audio');
              } else {
                updateState('ERROR');
                setErrorDetails({
                  type: 'no-speech',
                  title: 'No speech detected',
                  message: speechDetectedInSessionRef.current
                    ? 'I can access your microphone, but speech recognition did not detect your words.'
                    : "I couldn't hear speech. Please try again.",
                  canRetry: true,
                });
                setFeedbackMessage(
                  speechDetectedInSessionRef.current
                    ? 'I can access your microphone, but speech recognition did not detect your words.'
                    : "I couldn't hear speech. Please try again."
                );
              }
            }
          }, silenceTimeoutMs);

          // Max duration limit: 45 seconds
          maxDurationTimerRef.current = setTimeout(() => {
            if (stateRef.current === 'LISTENING') {
              try {
                recognition.stop();
              } catch {
                // ignore
              }
            }
          }, maxDurationMs);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            const transcriptPiece = item[0]?.transcript || '';
            if (item.isFinal) {
              currentFinal += transcriptPiece;
            } else {
              currentInterim += transcriptPiece;
            }
          }

          if (currentInterim) {
            setInterimTranscript(currentInterim);
            onInterimTranscript?.(currentInterim);
          }

          if (currentFinal) {
            try {
              recognition.stop();
            } catch {
              // ignore
            }
            commitTranscript(currentFinal, 'Browser Web Speech API');
          }
        };

        recognition.onerror = (event: any) => {
          clearAllTimers();
          const errType = event.error || 'unknown';

          setDiagnostics(prev => ({
            ...prev,
            lastRecognitionError: errType,
            lastSpeechError: errType,
          }));

          if (errType === 'aborted') {
            if (!sessionCommitted) {
              cleanupAudioPipeline();
              updateState('IDLE');
              setFeedbackMessage('');
            }
            return;
          }

          // In Google AI Studio preview iframe, Web Speech API often returns 'no-speech' or 'network'
          // If in AUTO mode, seamlessly try the real server speech transcription fallback!
          if (
            (errType === 'no-speech' || errType === 'network' || errType === 'service-not-allowed') &&
            currentProvider === 'AUTO' &&
            recordedChunksRef.current.length > 0
          ) {
            runServerSpeechFallback(`Browser error: ${errType}`);
            return;
          }

          cleanupAudioPipeline();
          updateState('ERROR');

          if (errType === 'no-speech') {
            const wasAudioDetected = speechDetectedInSessionRef.current;
            setErrorDetails({
              type: 'no-speech',
              title: wasAudioDetected ? 'Speech not detected' : 'No speech detected',
              message: wasAudioDetected
                ? 'I can access your microphone, but speech recognition did not detect your words.'
                : "I couldn't hear speech. Please try again.",
              canRetry: true,
              audioDetected: wasAudioDetected,
            });
            setFeedbackMessage(
              wasAudioDetected
                ? 'I can access your microphone, but speech recognition did not detect your words.'
                : "I couldn't hear speech. Please try again."
            );
          } else if (errType === 'not-allowed') {
            setErrorDetails({
              type: 'not-allowed',
              title: 'Microphone access blocked',
              message: 'Microphone access is blocked. Please allow microphone access in your browser settings.',
              isPermissionBlocked: true,
              canRetry: true,
            });
            setFeedbackMessage('Microphone access is blocked. Please allow microphone access in browser settings.');
          } else {
            setErrorDetails({
              type: errType,
              title: 'Speech recognition issue',
              message: `Speech recognition encountered an issue (${errType}). Please try again or type your response.`,
              canRetry: true,
            });
            setFeedbackMessage(`Speech recognition issue (${errType}). Please try again.`);
          }
        };

        recognition.onend = () => {
          clearAllTimers();
          if (!sessionCommitted) {
            if (stateRef.current === 'LISTENING' && currentProvider === 'AUTO' && recordedChunksRef.current.length > 0) {
              runServerSpeechFallback('Recognition ended without transcript');
            } else if (stateRef.current !== 'ERROR') {
              cleanupAudioPipeline();
              updateState('IDLE');
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (startErr: any) {
        console.warn('[Browser Speech] Error starting Web Speech API, using Server STT:', startErr);
      }
    }

    // 8. Server-only Speech Provider path
    updateState('LISTENING');
    setFeedbackMessage('Listening... Please speak now.');

    // Automatically stop after 6 seconds of recording in server mode or on button click
    silenceTimerRef.current = setTimeout(() => {
      if (stateRef.current === 'LISTENING' && !sessionCommitted) {
        runServerSpeechFallback('Server STT automatic timeout');
      }
    }, 7000);
  }, [
    clearAllTimers,
    cleanupAudioPipeline,
    isIframe,
    maxDurationMs,
    onFinalTranscript,
    onInterimTranscript,
    silenceTimeoutMs,
    stopAnyOngoingTTS,
    transcribeAudioViaServer,
    updateState,
  ]);

  // Deterministic button click handler
  const handleMicrophoneClick = useCallback(() => {
    const currentState = stateRef.current;
    if (currentState === 'IDLE') {
      startListening();
    } else if (currentState === 'STARTING') {
      // Do nothing
    } else if (currentState === 'LISTENING') {
      stopListening();
    } else if (currentState === 'PROCESSING') {
      // Do nothing
    } else if (currentState === 'ERROR' || currentState === 'SUCCESS') {
      resetState();
    }
  }, [startListening, stopListening, resetState]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
      cleanupAudioPipeline();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, [clearAllTimers, cleanupAudioPipeline]);

  return {
    state,
    interimTranscript,
    finalTranscript,
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
    startListening,
    stopListening,
    resetState,
    isSupported: diagnostics.speechRecognitionApi === 'AVAILABLE' || diagnostics.microphoneApi === 'AVAILABLE',
  };
}
