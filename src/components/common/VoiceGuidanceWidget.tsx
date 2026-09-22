import React, { useState } from 'react';
import { Volume2, VolumeX, RefreshCw, Settings2, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const VoiceGuidanceWidget: React.FC = () => {
  const { 
    autoVoiceGuidance, 
    toggleAutoVoiceGuidance, 
    speakGuidance, 
    activePage, 
    t 
  } = useLanguage();
  
  const [showOptions, setShowOptions] = useState(false);

  const handleReplay = () => {
    if (activePage) {
      speakGuidance(activePage);
    }
  };

  if (!activePage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Options Menu */}
      {showOptions && (
        <div className="absolute bottom-full right-0 mb-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-800 flex items-center">
              <Settings2 className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              Voice Guidance (TTS)
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Spoken audio assistance. Patient microphone is always independent.
            </p>
          </div>
          
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                toggleAutoVoiceGuidance();
                setShowOptions(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <div className={`p-1.5 rounded-md ${autoVoiceGuidance ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                  {autoVoiceGuidance ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <span className={autoVoiceGuidance ? 'text-slate-800' : 'text-slate-500'}>
                  Auto Guidance
                </span>
              </div>
              {autoVoiceGuidance && <Check className="w-4 h-4 text-teal-600" />}
            </button>

            <button
              onClick={() => {
                handleReplay();
                setShowOptions(false);
              }}
              className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
            >
              <div className="p-1.5 rounded-md bg-sky-50 text-sky-600 mr-2.5">
                <RefreshCw className="w-4 h-4" />
              </div>
              Replay Audio
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        className={`flex items-center space-x-2 pl-3 pr-4 py-2.5 rounded-full shadow-lg border transition-all duration-300 ${
          autoVoiceGuidance 
            ? 'bg-teal-600 text-white border-teal-500 hover:bg-teal-700 hover:shadow-teal-500/25' 
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
        }`}
        title={autoVoiceGuidance ? 'Voice Guidance: Active (TTS)' : 'Voice Guidance: Muted (TTS). Microphone remains available.'}
      >
        {autoVoiceGuidance ? (
          <Volume2 className="w-4 h-4 animate-pulse" />
        ) : (
          <VolumeX className="w-4 h-4 text-slate-400" />
        )}
        <span className="text-xs font-bold tracking-wide">
          {autoVoiceGuidance ? 'Guidance ON' : 'Guidance Muted'}
        </span>
      </button>
    </div>
  );
};
