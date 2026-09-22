import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Stethoscope,
  Volume2,
  AlertTriangle,
  Activity,
  Check
} from 'lucide-react';
import { 
  ClinicalIntakeData, 
  PatientDemographics, 
  QueueTicket, 
  TriageAssessment, 
  BodyRegion 
} from '../../types/mednova';
import { VoiceIntakeWidget } from './VoiceIntakeWidget';
import { BodyMapSelector } from './BodyMapSelector';
import { DocumentUploadModal } from './DocumentUploadModal';
import { TokenReceiptModal } from './TokenReceiptModal';
import { evaluateClinicalTriage, DEPARTMENT_ROOMS } from '../../utils/triageEngine';
import { SampleComplaint } from '../../utils/translations';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage, NurseUser } from '../../types/mednova';
import { VoiceGuidanceWidget } from '../common/VoiceGuidanceWidget';

interface IntakeWizardProps {
  onTicketCreated: (ticket: QueueTicket) => void;
  onViewQueue: () => void;
  language?: SupportedLanguage;
  isNurseMode?: boolean;
  nurseUser?: NurseUser | null;
  onOpenNurseLogin?: () => void;
}

export const IntakeWizard: React.FC<IntakeWizardProps> = ({
  onTicketCreated,
  onViewQueue,
  isNurseMode,
  nurseUser,
  onOpenNurseLogin,
}) => {
  const { language, t, speak, currentLanguage, setActivePage, autoVoiceGuidance } = useLanguage();

  const handleFieldFocus = (text: string) => {
    if (autoVoiceGuidance) {
      speak(text);
    }
  };

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [createdTicket, setCreatedTicket] = useState<QueueTicket | null>(null);
  const [confirmedUnderstanding, setConfirmedUnderstanding] = useState(false);

  // Handle voice guidance on step change
  useEffect(() => {
    switch (currentStep) {
      case 1:
        setActivePage('registration');
        break;
      case 2:
        setActivePage('voiceCaseTaking');
        break;
      case 3:
        setActivePage('adcp');
        break;
      case 4:
        setActivePage('ayushPrakriti');
        break;
      case 5:
        setActivePage('clinicalSummary');
        break;
    }
  }, [currentStep, setActivePage]);

  // Patient Demographics State
  const [demographics, setDemographics] = useState<PatientDemographics>({
    id: `P-${Math.floor(10000 + Math.random() * 90000)}`,
    abhaId: '91-4829-1029-4821',
    fullName: '',
    age: 45,
    gender: 'male',
    phone: '+91 98450 12345',
    emergencyContact: '',
    city: 'Kolkata, West Bengal',
    preferredLanguage: language,
  });

  // Keep preferredLanguage synchronized
  useEffect(() => {
    setDemographics((prev) => ({ ...prev, preferredLanguage: language }));
  }, [language]);

  // Clinical Intake State
  const [intake, setIntake] = useState<ClinicalIntakeData>({
    chiefComplaint: '',
    chiefComplaintOriginal: '',
    inputLanguage: language,
    inputMode: 'voice',
    duration: '2 hours',
    onset: 'sudden',
    bodyRegions: ['chest'],
    painType: 'Crushing heaviness',
    associatedSymptoms: ['Sweating / Cold Clammy Skin'],
    dynamicQuestions: [],
    pastMedicalHistory: ['Hypertension'],
    currentMedications: ['Telmisartan 40mg'],
    allergies: ['No Known Drug Allergies (NKDA)'],
    documents: [],
    vitals: {
      bloodPressureSystolic: 140,
      bloodPressureDiastolic: 90,
      heartRate: 88,
      spO2: 97,
      temperature: 98.6,
      respiratoryRate: 18,
      bloodGlucose: 120,
      painScore: 7,
    },
    redFlagsDetected: [],
  });

  // Dynamic follow-up answers state
  const [probeAnswers, setProbeAnswers] = useState<Record<string, string>>({
    radiation: 'crushingPressure',
    breathing: 'yesMild',
    sweats: 'yesSevere',
  });

  // 1-Click test patient auto-filler for testing
  const handleLoadDemoPatient = (type: 'cardiac' | 'dengue' | 'pediatric' | 'ortho') => {
    if (type === 'cardiac') {
      setDemographics({
        id: `P-${Math.floor(10000 + Math.random() * 90000)}`,
        abhaId: '14-8839-2049-5512',
        fullName: 'Rameshwar Lal Verma',
        age: 59,
        gender: 'male',
        phone: '+91 98290 44556',
        emergencyContact: '+91 98290 99887 (Son: Manoj)',
        city: 'Jaipur, Rajasthan',
        preferredLanguage: language,
      });
      setIntake({
        ...intake,
        chiefComplaint: 'Severe crushing chest pain and profuse sweating for the past 2 hours radiating to left shoulder and jaw.',
        chiefComplaintOriginal: language === 'ta'
          ? '2 மணி நேரமாக நெஞ்சு பாரம், கடுமையான வியர்வை மற்றும் இடது தோள்பட்டை வரை பரவும் வலி உள்ளது.'
          : language === 'hi'
          ? 'सीने में पिछले 2 घंटे से बहुत भारी दबाव और पसीना आ रहा है, दर्द बाएं कंधे तक जा रहा है।'
          : 'Severe crushing chest pain and profuse sweating for the past 2 hours radiating to left shoulder.',
        bodyRegions: ['chest'],
        duration: 'Less than 2 hours',
        onset: 'sudden',
        associatedSymptoms: ['Sweating / Cold Clammy Skin', 'Chest tightness / Discomfort', 'Shortness of Breath / Dyspnea'],
        vitals: {
          bloodPressureSystolic: 168,
          bloodPressureDiastolic: 104,
          heartRate: 110,
          spO2: 95,
          temperature: 98.4,
          respiratoryRate: 22,
          painScore: 9,
        },
        pastMedicalHistory: ['Type 2 Diabetes', 'Smoker'],
        currentMedications: ['Metformin 500mg'],
        allergies: ['No Known Drug Allergies (NKDA)'],
      });
      setConfirmedUnderstanding(true);
    } else if (type === 'dengue') {
      setDemographics({
        id: `P-${Math.floor(10000 + Math.random() * 90000)}`,
        abhaId: '33-1029-4412-9021',
        fullName: 'Kavitha Ramachandran',
        age: 28,
        gender: 'female',
        phone: '+91 98401 55667',
        city: 'Coimbatore, Tamil Nadu',
        preferredLanguage: language,
      });
      setIntake({
        ...intake,
        chiefComplaint: 'Continuous high fever for 3 days with severe retro-orbital headache, body aches, and bleeding gums while brushing.',
        chiefComplaintOriginal: language === 'ta' 
          ? '3 நாட்களாக கடுமையான காய்ச்சல் மற்றும் கண் இமைகளின் பின்னால் வலி, ஈறுகளில் ரத்தக்கசிவு.'
          : 'High continuous fever for 3 days with intense headache and bleeding gums.',
        bodyRegions: ['head_neck', 'skin_generalized'],
        duration: '2 to 3 days',
        onset: 'sudden',
        associatedSymptoms: ['High Fever & Chills', 'Nausea / Vomiting', 'Bleeding (Nose, Mouth, Stool)'],
        vitals: {
          bloodPressureSystolic: 100,
          bloodPressureDiastolic: 68,
          heartRate: 106,
          spO2: 98,
          temperature: 103.1,
          respiratoryRate: 20,
          painScore: 7,
        },
        pastMedicalHistory: ['Hypothyroidism'],
        currentMedications: ['Thyronorm 25mcg'],
        allergies: ['No Known Drug Allergies (NKDA)'],
      });
      setConfirmedUnderstanding(true);
    } else if (type === 'pediatric') {
      setDemographics({
        id: `P-${Math.floor(10000 + Math.random() * 90000)}`,
        abhaId: '22-8192-3301-4412',
        fullName: 'Aarav Nair',
        age: 6,
        gender: 'male',
        phone: '+91 97110 99887',
        emergencyContact: '+91 97110 99887 (Mother: Deepa)',
        city: 'Kochi, Kerala',
        preferredLanguage: language,
      });
      setIntake({
        ...intake,
        chiefComplaint: 'Acute whistling sound while breathing, severe cough, and chest drawing in since midnight.',
        chiefComplaintOriginal: 'ശ്വാസമെടുക്കാൻ ബുദ്ധിമുട്ട്, കടുത്ത ചുമ, നെഞ്ചിൽ വിസിലിങ് ശബ്ദം.',
        bodyRegions: ['chest'],
        duration: 'Less than 2 hours',
        onset: 'sudden',
        associatedSymptoms: ['Shortness of Breath / Dyspnea', 'Audible Wheezing / Stridor'],
        vitals: {
          bloodPressureSystolic: 98,
          bloodPressureDiastolic: 64,
          heartRate: 128,
          spO2: 92,
          temperature: 99.2,
          respiratoryRate: 34,
          painScore: 5,
        },
        pastMedicalHistory: ['Known Asthma'],
        currentMedications: ['Salbutamol Inhaler SOS'],
        allergies: ['No Known Drug Allergies (NKDA)'],
      });
      setConfirmedUnderstanding(true);
    } else {
      setDemographics({
        id: `P-${Math.floor(10000 + Math.random() * 90000)}`,
        fullName: 'Chandrakant Jadhav',
        age: 66,
        gender: 'male',
        phone: '+91 98200 11223',
        city: 'Nagpur, Maharashtra',
        preferredLanguage: language,
      });
      setIntake({
        ...intake,
        chiefComplaint: 'Chronic bilateral knee aching pain on walking or climbing stairs for 6 months.',
        chiefComplaintOriginal: 'गेल्या ६ महिन्यांपासून दोन्ही गुडघ्यांमध्ये चालताना खूप दुखणे होते.',
        bodyRegions: ['lower_limbs'],
        duration: 'More than 1 month',
        onset: 'gradual',
        associatedSymptoms: ['Joint Stiffness / Swelling'],
        vitals: {
          bloodPressureSystolic: 130,
          bloodPressureDiastolic: 80,
          heartRate: 72,
          spO2: 98,
          temperature: 98.4,
          respiratoryRate: 16,
          painScore: 4,
        },
        pastMedicalHistory: ['Mild Hypertension'],
        currentMedications: ['Amlodipine 5mg'],
        allergies: ['No Known Drug Allergies (NKDA)'],
      });
      setConfirmedUnderstanding(true);
    }
  };

  const handleSamplePromptSelect = (sample: SampleComplaint) => {
    setIntake((prev) => ({
      ...prev,
      chiefComplaint: sample.englishTranslation,
      chiefComplaintOriginal: sample.nativeText,
      inputLanguage: sample.language,
      bodyRegions: [sample.bodyRegion as BodyRegion],
    }));
    setConfirmedUnderstanding(true);
  };

  const toggleSymptom = (symptomKey: string, symptomLabel: string) => {
    if (intake.associatedSymptoms.includes(symptomLabel)) {
      setIntake((prev) => ({
        ...prev,
        associatedSymptoms: prev.associatedSymptoms.filter((s) => s !== symptomLabel),
      }));
    } else {
      setIntake((prev) => ({
        ...prev,
        associatedSymptoms: [...prev.associatedSymptoms, symptomLabel],
      }));
    }
  };

  // Submission & AI Triage Pipeline (guarded against duplicate submissions)
  const handleFinalSubmit = async () => {
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      // 1. Call server-side Gemini triage endpoint (backed by automatic retry + deterministic rule fallback)
      const response = await fetch('/api/gemini/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intake,
          patientAge: demographics.age,
          patientGender: demographics.gender,
          preferredLanguage: demographics.preferredLanguage,
        }),
      });

      let triageResult: TriageAssessment;
      let translatedComplaint = intake.chiefComplaint;
      let triageSource: 'gemini' | 'rules_fallback' = 'gemini';
      let triageNotice: string | undefined;
      let triageFallbackReason: string | undefined;

      if (response.ok) {
        const data = await response.json();
        triageResult = data.triage;
        translatedComplaint = data.translatedChiefComplaint || intake.chiefComplaint;
        triageSource = data.source || (triageResult.ruleBased ? 'rules_fallback' : 'gemini');
        triageNotice = data.dashboardNotice || (triageSource === 'rules_fallback' ? 'AI assistance temporarily unavailable — rule-based triage active.' : undefined);
        triageFallbackReason = data.fallbackReason;

        // If patient completed AYUSH Prakriti or integrative assessment, fetch ADCP protocol
        if (intake.ayushPrakriti) {
          try {
            const adcpRes = await fetch('/api/gemini/adcp-protocol', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chiefComplaint: translatedComplaint,
                prakritiProfile: intake.ayushPrakriti.dominantPrakriti || 'Vata-Pitta',
                vitalSigns: intake.vitals,
                contraindicationsCheck: intake.allergies,
              }),
            });
            if (adcpRes.ok) {
              const adcpData = await adcpRes.json();
              if (adcpData.protocol) {
                triageResult.adcpProtocol = adcpData.protocol;
              }
            }
          } catch (e) {
            console.info('ADCP protocol endpoint fallback');
          }
        }
      } else {
        // Fallback to local deterministic triage engine
        console.info('[Triage]\nLocal rule engine applied\nAction: clinical-rules fallback');
        triageResult = evaluateClinicalTriage(intake, demographics.age);
        triageSource = 'rules_fallback';
        triageNotice = 'AI assistance temporarily unavailable — rule-based triage active.';
        triageFallbackReason = 'AI service temporarily unavailable; clinical rules fallback used.';
      }

      // 2. Generate unique OPD Token (e.g. CR-105, GM-210, ER-001)
      const deptPrefix = 
        triageResult.recommendedDepartment.includes('Cardio') ? 'CR' :
        triageResult.recommendedDepartment.includes('Emergency') ? 'ER' :
        triageResult.recommendedDepartment.includes('Pedia') ? 'PD' :
        triageResult.recommendedDepartment.includes('Surg') ? 'GS' :
        triageResult.recommendedDepartment.includes('Ortho') ? 'OP' : 'GM';

      const tokenNumber = `${deptPrefix}-${Math.floor(100 + Math.random() * 900)}`;
      const roomNumber = DEPARTMENT_ROOMS[triageResult.recommendedDepartment] || 'OPD Room 101';

      // 3. Create Ticket object
      const newTicket: QueueTicket = {
        id: `ticket-${Date.now()}`,
        tokenNumber,
        patient: demographics,
        intake: {
          ...intake,
          chiefComplaint: translatedComplaint,
        },
        triage: triageResult,
        department: triageResult.recommendedDepartment,
        roomNumber,
        status: triageResult.level === 1 ? 'called' : 'waiting',
        createdAt: new Date().toISOString(),
        calledAt: triageResult.level === 1 ? new Date().toISOString() : undefined,
        priorityRank: triageResult.level === 1 ? 5200 : triageResult.level === 2 ? 1400 : 350,
        estimatedWaitMinutes: triageResult.level === 1 ? 0 : triageResult.level === 2 ? 10 : 35,
        triageSource,
        triageNotice,
        triageFallbackReason,
      };

      onTicketCreated(newTicket);
      setCreatedTicket(newTicket);
    } catch {
      console.info('[Triage]\nLocal rule engine applied\nAction: clinical-rules fallback');
      const fallbackTriage = evaluateClinicalTriage(intake, demographics.age);
      const tokenNumber = `GM-${Math.floor(100 + Math.random() * 900)}`;

      const newTicket: QueueTicket = {
        id: `ticket-${Date.now()}`,
        tokenNumber,
        patient: demographics,
        intake,
        triage: fallbackTriage,
        department: fallbackTriage.recommendedDepartment,
        roomNumber: DEPARTMENT_ROOMS[fallbackTriage.recommendedDepartment] || 'OPD Room 101',
        status: 'waiting',
        createdAt: new Date().toISOString(),
        priorityRank: 400,
        estimatedWaitMinutes: 20,
        triageSource: 'rules_fallback',
        triageNotice: 'AI assistance temporarily unavailable — rule-based triage active.',
        triageFallbackReason: 'AI service temporarily unavailable; clinical rules fallback used.',
      };

      onTicketCreated(newTicket);
      setCreatedTicket(newTicket);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCreatedTicket(null);
    setCurrentStep(1);
    setConfirmedUnderstanding(false);
    setDemographics({
      id: `P-${Math.floor(10000 + Math.random() * 90000)}`,
      abhaId: '',
      fullName: '',
      age: 35,
      gender: 'male',
      phone: '',
      city: 'New Delhi',
      preferredLanguage: language,
    });
    setIntake({
      chiefComplaint: '',
      chiefComplaintOriginal: '',
      inputLanguage: language,
      inputMode: 'voice',
      duration: '1 day',
      onset: 'gradual',
      bodyRegions: [],
      painType: '',
      associatedSymptoms: [],
      dynamicQuestions: [],
      pastMedicalHistory: [],
      currentMedications: [],
      allergies: [],
      documents: [],
      vitals: {
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 78,
        spO2: 98,
        temperature: 98.4,
        respiratoryRate: 16,
        painScore: 3,
      },
      redFlagsDetected: [],
    });
  };

  // Symptoms translation lookup table
  const SYMPTOMS_KEYS = [
    { key: 'fever', fallback: 'High Fever & Chills' },
    { key: 'dyspnea', fallback: 'Shortness of Breath / Dyspnea' },
    { key: 'chestTightness', fallback: 'Chest tightness / Discomfort' },
    { key: 'nausea', fallback: 'Nausea / Vomiting' },
    { key: 'dizziness', fallback: 'Dizziness / Lightheadedness' },
    { key: 'coldSweat', fallback: 'Sweating / Cold Clammy Skin' },
    { key: 'abdominalPain', fallback: 'Severe Abdominal Pain' },
    { key: 'wheezing', fallback: 'Audible Wheezing / Stridor' },
    { key: 'diarrhea', fallback: 'Loose Motions / Diarrhea' },
    { key: 'dysuria', fallback: 'Burning Urination / Dysuria' },
    { key: 'jointPain', fallback: 'Joint Stiffness / Swelling' },
    { key: 'rash', fallback: 'Skin Rash / Itching' },
    { key: 'syncope', fallback: 'Loss of Consciousness / Syncope' },
    { key: 'bleeding', fallback: 'Bleeding (Nose, Mouth, Stool)' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 relative">
      <VoiceGuidanceWidget />
      
      {/* Top Wizard Steps Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
              {t('nav.intake')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('app.subtagline')}
            </p>
          </div>

          {/* Quick Demo Pre-fill Buttons */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 px-1.5 flex items-center">
              <Sparkles className="h-3 w-3 mr-1 text-teal-600" /> {t('demographics.quickPrefill')}
            </span>
            <button
              type="button"
              onClick={() => handleLoadDemoPatient('cardiac')}
              className="text-xs px-2 py-1 bg-white hover:bg-red-50 text-red-700 font-bold rounded-md shadow-2xs transition-colors cursor-pointer border border-red-200"
            >
              {t('demographics.chestPainCase')}
            </button>
            <button
              type="button"
              onClick={() => handleLoadDemoPatient('dengue')}
              className="text-xs px-2 py-1 bg-white hover:bg-amber-50 text-amber-700 font-bold rounded-md shadow-2xs transition-colors cursor-pointer border border-amber-200"
            >
              {t('demographics.dengueCase')}
            </button>
            <button
              type="button"
              onClick={() => handleLoadDemoPatient('pediatric')}
              className="text-xs px-2 py-1 bg-white hover:bg-sky-50 text-sky-700 font-bold rounded-md shadow-2xs transition-colors cursor-pointer border border-sky-200"
            >
              {t('demographics.childWheezeCase')}
            </button>
          </div>
        </div>

        {/* Step Indicator Progress */}
        <div className="grid grid-cols-5 gap-2 mt-6">
          {[
            { step: 1, label: t('demographics.stepTitle').split(':')[0] },
            { step: 2, label: t('voice.title').split('(')[0] },
            { step: 3, label: t('symptoms.title').split(':')[0] },
            { step: 4, label: t('vitals.title').split(':')[0] },
            { step: 5, label: t('history.title').split(':')[0] },
          ].map((s) => (
            <div
              key={s.step}
              onClick={() => setCurrentStep(s.step as any)}
              className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                currentStep === s.step
                  ? 'bg-teal-50 border-teal-500 shadow-2xs ring-1 ring-teal-500/30'
                  : currentStep > s.step
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black mb-1 ${
                currentStep === s.step
                  ? 'bg-teal-600 text-white'
                  : currentStep > s.step
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > s.step ? '✓' : s.step}
              </div>
              <span className={`text-[11px] font-bold truncate max-w-full ${currentStep === s.step ? 'text-teal-900' : 'text-slate-600'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Step Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative">
        
        {/* STEP 1: Demographics & Registration */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {t('demographics.stepTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('demographics.stepSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('demographics.fullName')} *
                </label>
                <input
                  type="text"
                  id="input-patient-name"
                  value={demographics.fullName}
                  onChange={(e) => setDemographics({ ...demographics, fullName: e.target.value })}
                  onFocus={() => handleFieldFocus('Please enter your full name.')}
                  placeholder={t('demographics.fullNamePlaceholder')}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('demographics.abhaId')} ({t('common.optional')})
                  </label>
                  {!demographics.isEmergencyGuest && (
                    <button
                      type="button"
                      onClick={() => {
                        const tempId = `EMG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                        setDemographics({
                          ...demographics,
                          isEmergencyGuest: true,
                          isGuest: true,
                          temporaryId: tempId,
                          abhaId: ''
                        });
                      }}
                      className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded transition-colors"
                    >
                      Skip ABHA — Emergency Guest
                    </button>
                  )}
                </div>
                {demographics.isEmergencyGuest ? (
                  <div className="w-full px-3.5 py-2.5 text-sm bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-bold text-red-700 uppercase tracking-wider mb-0.5">Emergency Guest ID</span>
                        <span className="font-mono font-bold text-slate-900">{demographics.temporaryId}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDemographics({ ...demographics, isEmergencyGuest: false, isGuest: false, temporaryId: undefined })}
                        className="text-[10px] text-slate-500 hover:text-slate-700 underline underline-offset-2"
                      >
                        Use ABHA Instead
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2 leading-tight">
                      Emergency mode allows care to begin without ABHA. Your temporary ID can be linked to your ABHA later by authorized staff.
                    </p>
                  </div>
                ) : (
                  <input
                    type="text"
                    id="input-patient-abha"
                    value={demographics.abhaId || ''}
                    onChange={(e) => setDemographics({ ...demographics, abhaId: e.target.value })}
                    onFocus={() => handleFieldFocus('You can continue with your ABHA Health Account, or choose Emergency Guest if this is an emergency.')}
                    placeholder={t('demographics.abhaPlaceholder')}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white font-mono"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('demographics.age')} *
                  </label>
                  <input
                    type="number"
                    id="input-patient-age"
                    value={demographics.age}
                    onChange={(e) => setDemographics({ ...demographics, age: parseInt(e.target.value) || 0 })}
                    onFocus={() => handleFieldFocus('Please enter your age.')}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('demographics.gender')} *
                  </label>
                  <select
                    id="select-patient-gender"
                    value={demographics.gender}
                    onChange={(e) => setDemographics({ ...demographics, gender: e.target.value as any })}
                    onFocus={() => handleFieldFocus('Please select your gender.')}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer"
                  >
                    <option value="male">{t('demographics.male')}</option>
                    <option value="female">{t('demographics.female')}</option>
                    <option value="other">{t('demographics.other')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('demographics.phone')}
                </label>
                <input
                  type="tel"
                  id="input-patient-phone"
                  value={demographics.phone}
                  onChange={(e) => setDemographics({ ...demographics, phone: e.target.value })}
                  onFocus={() => handleFieldFocus('Please enter your mobile number.')}
                  placeholder={t('demographics.phonePlaceholder')}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('demographics.city')}
                </label>
                <input
                  type="text"
                  id="input-patient-city"
                  value={demographics.city}
                  onChange={(e) => setDemographics({ ...demographics, city: e.target.value })}
                  placeholder={t('demographics.cityPlaceholder')}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('demographics.emergencyContact')}
                </label>
                <input
                  type="text"
                  id="input-patient-emergency-contact"
                  value={demographics.emergencyContact || ''}
                  onChange={(e) => setDemographics({ ...demographics, emergencyContact: e.target.value })}
                  placeholder={t('demographics.emergencyContactPlaceholder')}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Voice Intake & Body Map */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {t('voice.title')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('voice.subtitle')}
              </p>
            </div>

            {/* Multilingual Voice Recording Widget */}
            <VoiceIntakeWidget
              value={intake.chiefComplaintOriginal || intake.chiefComplaint}
              onChange={(val, original, source) => {
                const determinedSource = source || (nurseUser ? 'NURSE_ASSISTED' : 'PATIENT_VOICE');
                setIntake((prev) => ({
                  ...prev,
                  chiefComplaint: val,
                  chiefComplaintOriginal: original || val,
                  inputMode: determinedSource === 'PATIENT_VOICE' ? 'voice' : 'text',
                  sources: {
                    ...(prev.sources || {}),
                    chiefComplaint: determinedSource,
                  },
                }));
                if (val.length > 5) {
                  setConfirmedUnderstanding(false);
                }
              }}
              onSampleSelect={handleSamplePromptSelect}
              onClinicalInfoExtracted={(extracted) => {
                if (extracted.structuredRegions && extracted.structuredRegions.length > 0) {
                  setIntake((prev) => {
                    const mergedStructured = [...(prev.structuredBodyRegions || [])];
                    extracted.structuredRegions.forEach((sr) => {
                      const exists = mergedStructured.some(
                        (m) => m.bodyRegion === sr.bodyRegion && m.side === sr.side && m.subRegion === sr.subRegion
                      );
                      if (!exists) mergedStructured.push(sr);
                    });

                    const mergedLegacy = Array.from(new Set([...prev.bodyRegions, ...extracted.legacyBodyRegions]));
                    return {
                      ...prev,
                      structuredBodyRegions: mergedStructured,
                      bodyRegions: mergedLegacy,
                      duration: extracted.duration || prev.duration,
                    };
                  });
                }
              }}
              isNurseAssisted={Boolean(nurseUser)}
            />

            {/* AI Clinical Understanding Card (Demonstrates voice comprehension in native language) */}
            {(intake.chiefComplaintOriginal || intake.chiefComplaint) && (
              <div className="p-4 rounded-2xl bg-teal-50/90 border-2 border-teal-500/40 shadow-xs space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-teal-900">
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    <span>{t('understanding.badge')}</span>
                  </div>
                  <span className="text-[11px] font-semibold bg-teal-200/60 text-teal-900 px-2 py-0.5 rounded-full">
                    {t('understanding.confidenceHigh')}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-teal-200 space-y-2">
                  <div className="text-xs text-slate-500 font-semibold">
                    {t('understanding.whatIUnderstood')}:
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">
                    "{intake.chiefComplaintOriginal || intake.chiefComplaint}"
                  </p>
                  <div className="text-xs text-teal-700 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>{t('understanding.confirmQuestion')}</span>
                    <button
                      type="button"
                      onClick={() => speak(intake.chiefComplaintOriginal || intake.chiefComplaint)}
                      className="inline-flex items-center space-x-1 text-teal-700 hover:text-teal-900 font-bold"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>{t('voice.listenBack')}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setConfirmedUnderstanding(true)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                      confirmedUnderstanding
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{t('understanding.btnContinue')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedUnderstanding(false);
                      setIntake((prev) => ({ ...prev, chiefComplaint: '', chiefComplaintOriginal: '' }));
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70"
                  >
                    {t('understanding.btnEdit')}
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Body Anatomy Map */}
            <div className="pt-2 border-t border-slate-200">
              <BodyMapSelector
                selectedRegions={intake.bodyRegions}
                structuredRegions={intake.structuredBodyRegions || []}
                onChange={(regions, structured) => setIntake((prev) => ({ 
                  ...prev, 
                  bodyRegions: regions,
                  structuredBodyRegions: structured
                }))}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Symptoms, Pain & Adaptive Dynamic Clinical Probing (ADCP) */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {t('symptoms.title')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('symptoms.subtitle')}
              </p>
            </div>

            {/* ADCP: Adaptive Dynamic Clinical Probing Questions */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900">
                <Stethoscope className="h-4 w-4 text-indigo-600" />
                <span>{t('adcp.title')}</span>
              </div>
              <p className="text-xs text-indigo-700 leading-relaxed">
                {t('adcp.subtitle')}
              </p>

              <div className="space-y-3 pt-1">
                {/* Q1: Pain radiation / pressure */}
                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    1. {t('adcp.questions.painLocation')}
                  </label>
                  <span className="text-[11px] text-slate-500 block mb-2">
                    {t('adcp.questions.painLocationDesc')}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'crushingPressure', label: t('adcp.options.crushingPressure') },
                      { key: 'sharpStabbing', label: t('adcp.options.sharpStabbing') },
                      { key: 'burningAche', label: t('adcp.options.burningAche') },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setProbeAnswers((prev) => ({ ...prev, radiation: opt.key }))}
                        className={`p-2 rounded-lg text-xs font-medium text-left border transition-all ${
                          probeAnswers.radiation === opt.key
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-slate-50 hover:bg-indigo-50/60 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q2: Breathing / Wheezing */}
                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    2. {t('adcp.questions.breathingDifficulty')}
                  </label>
                  <div className="flex space-x-2">
                    {[
                      { key: 'yesSevere', label: t('adcp.options.yesSevere') },
                      { key: 'yesMild', label: t('adcp.options.yesMild') },
                      { key: 'noNone', label: t('adcp.options.noNone') },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setProbeAnswers((prev) => ({ ...prev, breathing: opt.key }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          probeAnswers.breathing === opt.key
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-slate-50 hover:bg-indigo-50/60 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q3: Sweating / Dizziness */}
                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    3. {t('adcp.questions.sweatingRadiation')}
                  </label>
                  <div className="flex space-x-2">
                    {[
                      { key: 'yesSevere', label: t('adcp.options.yesSevere') },
                      { key: 'yesMild', label: t('adcp.options.yesMild') },
                      { key: 'noNone', label: t('adcp.options.noNone') },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setProbeAnswers((prev) => ({ ...prev, sweats: opt.key }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          probeAnswers.sweats === opt.key
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-slate-50 hover:bg-indigo-50/60 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pain Scale (0 - 10) Slider */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-800">
                  {t('symptoms.painScoreLabel')}: <span className="text-teal-700 text-base">{intake.vitals.painScore} {t('symptoms.painScoreValue')}</span>
                </label>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  intake.vitals.painScore >= 8
                    ? 'bg-red-100 text-red-700'
                    : intake.vitals.painScore >= 5
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {intake.vitals.painScore >= 8
                    ? t('symptoms.severe')
                    : intake.vitals.painScore >= 5
                    ? t('symptoms.moderate')
                    : intake.vitals.painScore > 0
                    ? t('symptoms.mild')
                    : t('symptoms.noPain')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={intake.vitals.painScore}
                onChange={(e) =>
                  setIntake((prev) => ({
                    ...prev,
                    vitals: { ...prev.vitals, painScore: parseInt(e.target.value) || 0 },
                  }))
                }
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
                <span>0 ({t('symptoms.noPain')})</span>
                <span>3 ({t('symptoms.mild')})</span>
                <span>5 ({t('symptoms.moderate')})</span>
                <span>8+ ({t('symptoms.severe')})</span>
              </div>
            </div>

            {/* Duration & Onset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('symptoms.durationLabel')}
                </label>
                <select
                  value={intake.duration}
                  onChange={(e) => setIntake({ ...intake, duration: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer"
                >
                  <option value="Less than 2 hours">{t('adcp.options.lessThan2h')}</option>
                  <option value="Few hours">{t('adcp.options.fewHours')}</option>
                  <option value="Several days">{t('adcp.options.severalDays')}</option>
                  <option value="More than 1 month">{t('adcp.options.chronic')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('symptoms.onsetLabel')}
                </label>
                <div className="flex items-center space-x-3 pt-1">
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="onset"
                      checked={intake.onset === 'sudden'}
                      onChange={() => setIntake({ ...intake, onset: 'sudden' })}
                      className="accent-teal-600"
                    />
                    <span>{t('symptoms.sudden')}</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="onset"
                      checked={intake.onset === 'gradual'}
                      onChange={() => setIntake({ ...intake, onset: 'gradual' })}
                      className="accent-teal-600"
                    />
                    <span>{t('symptoms.gradual')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Associated Symptoms Checklist */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t('symptoms.accompanyingTitle')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SYMPTOMS_KEYS.map((sym) => {
                  const localized = t(`symptoms.symptomList.${sym.key}`, sym.fallback);
                  const isChecked = intake.associatedSymptoms.includes(localized) || intake.associatedSymptoms.includes(sym.fallback);
                  return (
                    <button
                      key={sym.key}
                      type="button"
                      onClick={() => toggleSymptom(sym.key, localized)}
                      className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`h-4 w-4 rounded-md flex items-center justify-center text-[10px] ${
                        isChecked ? 'bg-teal-600 text-white' : 'border border-slate-300 bg-white'
                      }`}>
                        {isChecked ? '✓' : ''}
                      </span>
                      <span className="truncate">{localized}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Vital Signs Recording */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t('vitals.title')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('vitals.subtitle')}
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                <Activity className="h-3.5 w-3.5 mr-1" />
                {t('vitals.kioskSync')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Blood Pressure */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('vitals.bpLabel')}
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="Sys (120)"
                    value={intake.vitals.bloodPressureSystolic || ''}
                    onChange={(e) =>
                      setIntake((prev) => ({
                        ...prev,
                        vitals: { ...prev.vitals, bloodPressureSystolic: parseInt(e.target.value) || undefined },
                      }))
                    }
                    className="flex-1 min-w-0 px-2 py-2 text-sm bg-white border border-slate-300 rounded-lg text-center font-mono font-bold"
                  />
                  <span className="text-slate-400 font-bold shrink-0">/</span>
                  <input
                    type="number"
                    placeholder="Dia (80)"
                    value={intake.vitals.bloodPressureDiastolic || ''}
                    onChange={(e) =>
                      setIntake((prev) => ({
                        ...prev,
                        vitals: { ...prev.vitals, bloodPressureDiastolic: parseInt(e.target.value) || undefined },
                      }))
                    }
                    className="flex-1 min-w-0 px-2 py-2 text-sm bg-white border border-slate-300 rounded-lg text-center font-mono font-bold"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">{t('vitals.bpNormal')}</span>
              </div>

              {/* Heart Rate / Pulse */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('vitals.hrLabel')}
                </label>
                <input
                  type="number"
                  placeholder={t('vitals.hrPlaceholder')}
                  value={intake.vitals.heartRate || ''}
                  onChange={(e) =>
                    setIntake((prev) => ({
                      ...prev,
                      vitals: { ...prev.vitals, heartRate: parseInt(e.target.value) || undefined },
                    }))
                  }
                  className="w-full px-2.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-center font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">{t('vitals.hrNormal')}</span>
              </div>

              {/* SpO2 Oxygen Saturation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('vitals.spo2Label')}
                </label>
                <input
                  type="number"
                  placeholder={t('vitals.spo2Placeholder')}
                  value={intake.vitals.spO2 || ''}
                  onChange={(e) =>
                    setIntake((prev) => ({
                      ...prev,
                      vitals: { ...prev.vitals, spO2: parseInt(e.target.value) || undefined },
                    }))
                  }
                  className="w-full px-2.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-center font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">{t('vitals.spo2Normal')}</span>
              </div>

              {/* Body Temperature */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('vitals.tempLabel')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={t('vitals.tempPlaceholder')}
                  value={intake.vitals.temperature || ''}
                  onChange={(e) =>
                    setIntake((prev) => ({
                      ...prev,
                      vitals: { ...prev.vitals, temperature: parseFloat(e.target.value) || undefined },
                    }))
                  }
                  className="w-full px-2.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-center font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">{t('vitals.tempNormal')}</span>
              </div>

              {/* Respiratory Rate */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('vitals.rrLabel')}
                </label>
                <input
                  type="number"
                  placeholder={t('vitals.rrPlaceholder')}
                  value={intake.vitals.respiratoryRate || ''}
                  onChange={(e) =>
                    setIntake((prev) => ({
                      ...prev,
                      vitals: { ...prev.vitals, respiratoryRate: parseInt(e.target.value) || undefined },
                    }))
                  }
                  className="w-full px-2.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-center font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">{t('vitals.rrNormal')}</span>
              </div>

              {/* Blood Glucose */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('vitals.rbsLabel')}
                </label>
                <input
                  type="number"
                  placeholder={t('vitals.rbsPlaceholder')}
                  value={intake.vitals.bloodGlucose || ''}
                  onChange={(e) =>
                    setIntake((prev) => ({
                      ...prev,
                      vitals: { ...prev.vitals, bloodGlucose: parseInt(e.target.value) || undefined },
                    }))
                  }
                  className="w-full px-2.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-center font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">{t('vitals.rbsNormal')}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Past Medical History, Document OCR & Submit */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {t('history.title')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('history.subtitle')}
              </p>
            </div>

            {/* Medical History & Allergies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('history.pastHistoryLabel')}
                </label>
                <input
                  type="text"
                  value={intake.pastMedicalHistory.join(', ')}
                  onChange={(e) =>
                    setIntake({
                      ...intake,
                      pastMedicalHistory: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  placeholder={t('history.pastHistoryPlaceholder')}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('history.allergiesLabel')}
                </label>
                <input
                  type="text"
                  value={intake.allergies.join(', ')}
                  onChange={(e) =>
                    setIntake({
                      ...intake,
                      allergies: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  placeholder={t('history.allergiesPlaceholder')}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Document Upload & OCR Section */}
            <DocumentUploadModal
              documents={intake.documents}
              onAddDocument={(doc) => setIntake((prev) => ({ ...prev, documents: [...prev.documents, doc] }))}
              onRemoveDocument={(id) => setIntake((prev) => ({ ...prev, documents: prev.documents.filter((d) => d.id !== id) }))}
            />

            {/* Clinical Intake Summary Card */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs text-slate-800 space-y-2">
              <div className="flex items-center space-x-1.5 font-bold text-teal-900">
                <Stethoscope className="h-4 w-4" />
                <span>{t('history.summaryTitle')}</span>
              </div>
              <p className="leading-relaxed">
                <span className="font-semibold">{t('triage.patientDetails')}:</span> {demographics.fullName || 'Patient'} ({demographics.age}y / {demographics.gender})
              </p>
              <p className="leading-relaxed">
                <span className="font-semibold">{t('understanding.primarySymptom')}:</span> "{intake.chiefComplaintOriginal || intake.chiefComplaint || 'Not specified'}"
              </p>
              <p className="leading-relaxed">
                <span className="font-semibold">{t('vitals.title')}:</span> BP: {intake.vitals.bloodPressureSystolic || '--'}/{intake.vitals.bloodPressureDiastolic || '--'} mmHg • Pulse: {intake.vitals.heartRate || '--'} bpm • SpO2: {intake.vitals.spO2 || '--'}% • Pain: {intake.vitals.painScore}/10
              </p>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('common.back')}</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              id="btn-wizard-next"
              onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>{t('common.continue')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-wizard-submit"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className={`px-7 py-3 rounded-2xl text-sm font-extrabold text-white shadow-lg flex items-center space-x-2 transition-all cursor-pointer ${
                isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-teal-600/30 hover:scale-[1.02]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>{t('triage.evaluating')}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>{t('common.submit')}</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

      {/* Generated Token Slip Modal */}
      {createdTicket && (
        <TokenReceiptModal
          ticket={createdTicket}
          onClose={() => setCreatedTicket(null)}
          onViewInQueue={() => {
            setCreatedTicket(null);
            onViewQueue();
          }}
          onNewIntake={resetForm}
        />
      )}

    </div>
  );
};
