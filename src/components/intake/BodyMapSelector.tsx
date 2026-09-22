import React, { useState, useEffect } from 'react';
import { BodyRegion, StructuredBodyRegion } from '../../types/mednova';
import { Sparkles, ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BODY_HIERARCHY, AnatomicalRegion, AnatomicalSubRegion } from './BodyMapHierarchy';

interface BodyMapSelectorProps {
  selectedRegions: BodyRegion[];
  structuredRegions?: StructuredBodyRegion[];
  onChange: (regions: BodyRegion[], structured: StructuredBodyRegion[]) => void;
}

export const BodyMapSelector: React.FC<BodyMapSelectorProps> = ({
  selectedRegions,
  structuredRegions = [],
  onChange,
}) => {
  const { t, currentLanguage, speak } = useLanguage();
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');

  // Wizard state
  const [currentStep, setCurrentStep] = useState<'main' | 'side' | 'subregion' | 'specific'>('main');
  const [activeRegion, setActiveRegion] = useState<AnatomicalRegion | null>(null);
  const [activeSide, setActiveSide] = useState<'left' | 'right' | 'both' | undefined>(undefined);
  const [activeSubRegion, setActiveSubRegion] = useState<AnatomicalSubRegion | null>(null);

  // Play voice guidance on mount
  useEffect(() => {
    if (currentStep === 'main') {
      speak(t('bodymap.voice.main', "Please touch the area where you feel pain or discomfort."), currentLanguage.speechCode);
    }
  }, [currentStep, speak, currentLanguage.speechCode, t]);

  const handleRegionSelect = (regionId: string, preSelectedSide?: 'left' | 'right') => {
    const region = BODY_HIERARCHY.find(r => r.id === regionId);
    if (!region) return;

    setActiveRegion(region);

    if (preSelectedSide) {
      setActiveSide(preSelectedSide);
      setCurrentStep('subregion');
      
      const sideText = t(`bodymap.voice.${preSelectedSide}`, preSelectedSide);
      const regionLabel = t(`bodymap.regions.${region.legacyId}`, region.label);
      speak(t('bodymap.voice.subRegionSelect', `You selected ${sideText} ${regionLabel}. Please select the specific area.`), currentLanguage.speechCode);
    } else if (region.isPaired) {
      setCurrentStep('side');
      const regionLabel = t(`bodymap.regions.${region.legacyId}`, region.label);
      speak(t('bodymap.voice.pairedSelect', `Which ${regionLabel} is affected? Please select left, right, or both.`), currentLanguage.speechCode);
    } else if (region.subRegions && region.subRegions.length > 0) {
      setActiveSide(undefined);
      setCurrentStep('subregion');
      const regionLabel = t(`bodymap.regions.${region.legacyId}`, region.label);
      speak(t('bodymap.voice.subRegionSelect', `You selected ${regionLabel}. Please select the specific area.`), currentLanguage.speechCode);
    } else {
      // Directly add if no subregions (e.g. Skin)
      addSelection({
        bodyRegion: region.id,
      }, region.legacyId as BodyRegion);
    }
  };

  const handleSideSelect = (side: 'left' | 'right' | 'both') => {
    setActiveSide(side);
    if (activeRegion?.subRegions && activeRegion.subRegions.length > 0) {
      setCurrentStep('subregion');
      speak(t('bodymap.voice.subRegionSelect', 'Please select the specific area.'), currentLanguage.speechCode);
    } else if (activeRegion) {
      addSelection({
        bodyRegion: activeRegion.id,
        side,
      }, activeRegion.legacyId as BodyRegion);
    }
  };

  const handleSubRegionSelect = (subRegion: AnatomicalSubRegion) => {
    if (subRegion.isPaired && !activeSide) {
      // For things like Eye or Ear inside Head where parent is not paired but child is
      setActiveSubRegion(subRegion);
      setCurrentStep('side');
      speak(t('bodymap.voice.pairedSelect', `Which side is affected? Please select left, right, or both.`), currentLanguage.speechCode);
      return;
    }

    if (subRegion.specificRegions && subRegion.specificRegions.length > 0) {
      setActiveSubRegion(subRegion);
      setCurrentStep('specific');
      speak(t('bodymap.voice.specificSelect', `Please select the exact part that is painful.`), currentLanguage.speechCode);
    } else if (activeRegion) {
      addSelection({
        bodyRegion: activeRegion.id,
        side: activeSide,
        subRegion: subRegion.id
      }, activeRegion.legacyId as BodyRegion);
    }
  };

  const handleSpecificRegionSelect = (specificRegionId: string) => {
    if (activeRegion && activeSubRegion) {
      addSelection({
        bodyRegion: activeRegion.id,
        side: activeSide,
        subRegion: activeSubRegion.id,
        specificRegion: specificRegionId
      }, activeRegion.legacyId as BodyRegion);
    }
  };

  const addSelection = (structured: StructuredBodyRegion, legacyId: BodyRegion) => {
    // Check for duplicates
    const isDuplicate = structuredRegions.some(
      r => r.bodyRegion === structured.bodyRegion && 
           r.side === structured.side && 
           r.subRegion === structured.subRegion && 
           r.specificRegion === structured.specificRegion
    );

    if (!isDuplicate) {
      const newStructured = [...structuredRegions, structured];
      const newLegacy = Array.from(new Set([...selectedRegions, legacyId]));
      onChange(newLegacy, newStructured);
    }
    resetWizard();
  };

  const removeSelection = (index: number) => {
    const newStructured = [...structuredRegions];
    const removed = newStructured.splice(index, 1)[0];
    
    // Recompute legacy regions based on remaining structured regions
    const newLegacy = Array.from(new Set(newStructured.map(s => {
      const region = BODY_HIERARCHY.find(r => r.id === s.bodyRegion);
      return region ? (region.legacyId as BodyRegion) : (removed.bodyRegion as BodyRegion); // Fallback
    })));

    onChange(newLegacy, newStructured);
  };

  const resetWizard = () => {
    setCurrentStep('main');
    setActiveRegion(null);
    setActiveSide(undefined);
    setActiveSubRegion(null);
  };

  const renderSelectionSummary = (sel: StructuredBodyRegion) => {
    const region = BODY_HIERARCHY.find(r => r.id === sel.bodyRegion);
    const parts = [];
    
    if (sel.side) {
      parts.push(sel.side.charAt(0).toUpperCase() + sel.side.slice(1));
    }
    
    if (region) {
      if (!sel.subRegion) {
         parts.push(region.label);
      } else {
         const subRegion = region.subRegions?.find(s => s.id === sel.subRegion);
         if (subRegion) {
            if (sel.side && (sel.bodyRegion === 'upper_limb' || sel.bodyRegion === 'lower_limb')) {
               // For arms/legs, don't repeat "Right Arm -> Right Wrist", just "Right Wrist"
            } else if (!sel.side) {
               // parts.push(region.label);
            }
            parts.push(subRegion.label);
            
            if (sel.specificRegion && subRegion.specificRegions) {
               const specific = subRegion.specificRegions.find(s => s.id === sel.specificRegion);
               if (specific) {
                 parts.push('→ ' + specific.label);
               }
            }
         }
      }
    }
    return parts.join(' ');
  };

  return (
    <div className="space-y-4">
      {currentStep === 'main' && (
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-bold text-slate-800">
              {t('bodymap.title', 'Where is the pain?')}
            </label>
            <p className="text-xs text-slate-500">
              {t('bodymap.subtitle', 'Tap on the body map to select the exact location')}
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('front')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'front' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('bodymap.front', 'Front View')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('back')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'back' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('bodymap.back', 'Back View')}
            </button>
          </div>
        </div>
      )}

      {currentStep === 'main' ? (
        <div className="bg-slate-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-center gap-6">
          {/* Interactive SVG Body Diagram */}
          <div className="relative">
            <svg
              viewBox="0 0 200 380"
              className="w-48 h-80 filter drop-shadow-md select-none"
            >
              {activeTab === 'front' ? (
                <>
                  {/* Head */}
                  <circle
                    cx="100" cy="45" r="30"
                    onClick={() => handleRegionSelect('head')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="100" y="49" textAnchor="middle" className="fill-white text-[10px] font-bold pointer-events-none">{t('bodymap.regions.head_neck', 'Head')}</text>

                  {/* Chest */}
                  <rect
                    x="65" y="85" width="70" height="55" rx="8"
                    onClick={() => handleRegionSelect('torso_front')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="100" y="116" textAnchor="middle" className="fill-white text-[10px] font-bold pointer-events-none">{t('bodymap.regions.chest', 'Chest')}</text>

                  {/* Abdomen */}
                  <rect
                    x="68" y="145" width="64" height="45" rx="6"
                    onClick={() => handleRegionSelect('abdomen')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="100" y="172" textAnchor="middle" className="fill-white text-[10px] font-bold pointer-events-none">{t('bodymap.regions.abdomen', 'Abdomen')}</text>

                  {/* Pelvis */}
                  <polygon
                    points="72,195 128,195 118,225 82,225"
                    onClick={() => handleRegionSelect('pelvis')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="100" y="213" textAnchor="middle" className="fill-white text-[9px] font-bold pointer-events-none">{t('bodymap.regions.pelvis_urinary', 'Pelvis')}</text>

                  {/* Right Arm (Patient Right = Left side of screen) */}
                  <rect
                    x="30" y="90" width="28" height="110" rx="10"
                    onClick={() => handleRegionSelect('upper_limb', 'right')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="44" y="140" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.voice.right', 'Right')}</text>
                  <text x="44" y="152" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.regions.upper_limbs', 'Arm')}</text>

                  {/* Left Arm (Patient Left = Right side of screen) */}
                  <rect
                    x="142" y="90" width="28" height="110" rx="10"
                    onClick={() => handleRegionSelect('upper_limb', 'left')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="156" y="140" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.voice.left', 'Left')}</text>
                  <text x="156" y="152" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.regions.upper_limbs', 'Arm')}</text>

                  {/* Right Leg (Patient Right = Left side of screen) */}
                  <rect
                    x="68" y="235" width="28" height="115" rx="8"
                    onClick={() => handleRegionSelect('lower_limb', 'right')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="82" y="285" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.voice.right', 'Right')}</text>
                  <text x="82" y="297" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.regions.lower_limbs', 'Leg')}</text>

                  {/* Left Leg (Patient Left = Right side of screen) */}
                  <rect
                    x="104" y="235" width="28" height="115" rx="8"
                    onClick={() => handleRegionSelect('lower_limb', 'left')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="118" y="285" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.voice.left', 'Left')}</text>
                  <text x="118" y="297" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.regions.lower_limbs', 'Leg')}</text>
                </>
              ) : (
                <>
                  {/* Back View */}
                  <circle
                    cx="100" cy="45" r="30"
                    onClick={() => handleRegionSelect('head')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="100" y="49" textAnchor="middle" className="fill-white text-[10px] font-bold pointer-events-none">{t('bodymap.regions.head_neck', 'Head')}</text>

                  {/* Back/Spine */}
                  <rect
                    x="65" y="85" width="70" height="110" rx="8"
                    onClick={() => handleRegionSelect('back')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="100" y="140" textAnchor="middle" className="fill-white text-[10px] font-bold pointer-events-none">{t('bodymap.regions.spine_back', 'Spine & Back')}</text>

                  {/* Left Arm (Patient Left = Left side of screen in Back View) */}
                  <rect
                    x="30" y="90" width="28" height="110" rx="10"
                    onClick={() => handleRegionSelect('upper_limb', 'left')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="44" y="140" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.voice.left', 'Left')}</text>
                  <text x="44" y="152" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.regions.upper_limbs', 'Arm')}</text>

                  {/* Right Arm (Patient Right = Right side of screen in Back View) */}
                  <rect
                    x="142" y="90" width="28" height="110" rx="10"
                    onClick={() => handleRegionSelect('upper_limb', 'right')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="156" y="140" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.voice.right', 'Right')}</text>
                  <text x="156" y="152" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.regions.upper_limbs', 'Arm')}</text>

                  {/* Left Leg */}
                  <rect
                    x="68" y="235" width="28" height="115" rx="8"
                    onClick={() => handleRegionSelect('lower_limb', 'left')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="82" y="285" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.voice.left', 'Left')}</text>
                  <text x="82" y="297" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.regions.lower_limbs', 'Leg')}</text>

                  {/* Right Leg */}
                  <rect
                    x="104" y="235" width="28" height="115" rx="8"
                    onClick={() => handleRegionSelect('lower_limb', 'right')}
                    className="cursor-pointer fill-slate-700 hover:fill-teal-700 transition-colors"
                  />
                  <text x="118" y="285" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.voice.right', 'Right')}</text>
                  <text x="118" y="297" textAnchor="middle" className="fill-white text-[8px] font-bold pointer-events-none">{t('bodymap.regions.lower_limbs', 'Leg')}</text>
                </>
              )}
            </svg>
          </div>
          
          <div className="space-y-3 text-xs max-w-xs">
            <div className="flex items-center space-x-2 text-teal-300 font-semibold">
              <Sparkles className="h-4 w-4" />
              <span>{t('bodymap.title', 'Interactive Body Map')}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {t('bodymap.tapInstructions', 'Tap directly on the body part that is painful.')}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <button
                type="button"
                onClick={() => handleRegionSelect('skin')}
                className="px-2.5 py-1.5 rounded-md text-xs font-semibold border bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              >
                🌡️ {t('bodymap.regions.skin_generalized', 'Generalized Skin / Whole Body')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-teal-500 shadow-sm p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button 
            type="button" 
            onClick={resetWizard}
            className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to body map
          </button>
          
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {activeRegion?.label}
            {activeSide ? ` (${activeSide.charAt(0).toUpperCase() + activeSide.slice(1)})` : ''}
            {activeSubRegion ? ` - ${activeSubRegion.label}` : ''}
          </h3>

          <div className="mt-4">
            {currentStep === 'side' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 font-medium">{t('bodymap.stepSide', 'Which side is affected?')}</p>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => handleSideSelect('left')} className="p-3 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50 font-bold text-slate-700">{t('bodymap.voice.left', 'Left')}</button>
                  <button onClick={() => handleSideSelect('both')} className="p-3 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50 font-bold text-slate-700">{t('bodymap.voice.both', 'Both')}</button>
                  <button onClick={() => handleSideSelect('right')} className="p-3 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50 font-bold text-slate-700">{t('bodymap.voice.right', 'Right')}</button>
                </div>
              </div>
            )}

            {currentStep === 'subregion' && activeRegion?.subRegions && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 font-medium">{t('bodymap.stepSpecific', 'Select specific area:')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeRegion.subRegions.map(sub => (
                    <button 
                      key={sub.id}
                      onClick={() => handleSubRegionSelect(sub)} 
                      className="p-2.5 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50 font-bold text-slate-700 text-sm text-left"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'specific' && activeSubRegion?.specificRegions && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 font-medium">{t('bodymap.stepSpecific', 'Select specific area:')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeSubRegion.specificRegions.map(spec => (
                    <button 
                      key={spec.id}
                      onClick={() => handleSpecificRegionSelect(spec.id)} 
                      className="p-2.5 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50 font-bold text-slate-700 text-sm text-left"
                    >
                      {spec.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show currently selected structured regions */}
      {structuredRegions.length > 0 && (
        <div className="pt-3 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Selected Pain Areas</div>
          <div className="flex flex-col gap-2">
            {structuredRegions.map((region, idx) => (
              <div key={idx} className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-lg p-2.5">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-semibold text-teal-900">
                    {renderSelectionSummary(region)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSelection(idx)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
