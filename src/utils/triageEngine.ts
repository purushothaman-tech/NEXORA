import { 
  TriageLevel, 
  TriageLevelConfig, 
  Department, 
  ClinicalIntakeData, 
  TriageAssessment, 
  QueueTicket,
  VitalsData,
  BodyRegion
} from '../types/mednova';

export const TRIAGE_CONFIGS: Record<TriageLevel, TriageLevelConfig> = {
  1: {
    level: 1,
    code: 'LEVEL_1',
    title: 'Priority 1 — Resuscitation / Emergency',
    subTitle: 'Immediate bedside physician response required (< 0 min)',
    color: '#dc2626',
    bgLight: 'bg-red-50 text-red-700 border-red-200',
    badgeBg: 'bg-red-600 text-white',
    badgeText: 'text-red-700',
    borderClass: 'border-l-4 border-l-red-600',
    maxWaitTimeMinutes: 0,
  },
  2: {
    level: 2,
    code: 'LEVEL_2',
    title: 'Priority 2 — Emergent / Very Urgent',
    subTitle: 'Physician evaluation required within 10–15 minutes',
    color: '#ea580c',
    bgLight: 'bg-amber-50 text-amber-800 border-amber-200',
    badgeBg: 'bg-amber-600 text-white',
    badgeText: 'text-amber-700',
    borderClass: 'border-l-4 border-l-amber-500',
    maxWaitTimeMinutes: 15,
  },
  3: {
    level: 3,
    code: 'LEVEL_3',
    title: 'Priority 3 — Urgent / Standard Care',
    subTitle: 'Evaluation recommended within 30–60 minutes',
    color: '#ca8a04',
    bgLight: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    badgeBg: 'bg-yellow-500 text-white',
    badgeText: 'text-yellow-700',
    borderClass: 'border-l-4 border-l-yellow-400',
    maxWaitTimeMinutes: 60,
  },
  4: {
    level: 4,
    code: 'LEVEL_4',
    title: 'Priority 4 — Non-Urgent / Routine',
    subTitle: 'Standard outpatient care (consultation as per schedule)',
    color: '#16a34a',
    bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeBg: 'bg-emerald-600 text-white',
    badgeText: 'text-emerald-700',
    borderClass: 'border-l-4 border-l-emerald-500',
    maxWaitTimeMinutes: 120,
  },
};

export const COMMON_RED_FLAGS = [
  'Central crushing chest pain radiating to left arm/jaw/back',
  'Sudden onset focal neurological deficit (facial droop, hemiparesis, dysarthria)',
  'Severe respiratory distress or SpO2 < 90%',
  'Active profuse hemorrhage or hematemesis / melena with hypotension',
  'Altered sensorium, lethargy, or Glasgow Coma Scale < 13',
  'Anaphylaxis symptoms (stridor, lip/tongue swelling, severe urticaria)',
  'Severe acute abdomen with involuntary guarding and rigidity',
  'High grade fever with neck stiffness and altered consciousness (suspected meningitis)',
  'Hypertensive crisis (Systolic BP > 200 mmHg or Diastolic > 120 mmHg with headache)',
  'Third trimester vaginal bleeding or pre-eclampsia symptoms (BP > 160/110 with epigastric pain)',
];

export const DEPARTMENT_LIST: Department[] = [
  'Emergency & Trauma',
  'General Medicine',
  'Cardiology',
  'Pulmonology',
  'General Surgery',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'Gastroenterology',
  'Obstetrics & Gynecology',
  'ENT & Head-Neck',
  'Dermatology',
  'AYUSH / Integrative Medicine',
];

// Department default rooms mapping
export const DEPARTMENT_ROOMS: Record<Department, string> = {
  'Emergency & Trauma': 'Red Resus Bay 1 & 2',
  'Cardiology': 'OPD Room 101',
  'Pulmonology': 'OPD Room 104',
  'General Medicine': 'OPD Room 106',
  'Neurology': 'OPD Room 109',
  'General Surgery': 'OPD Room 201',
  'Orthopedics': 'OPD Room 205',
  'Pediatrics': 'OPD Room 302',
  'Gastroenterology': 'OPD Room 208',
  'Obstetrics & Gynecology': 'OPD Room 305',
  'ENT & Head-Neck': 'OPD Room 402',
  'Dermatology': 'OPD Room 406',
  'AYUSH / Integrative Medicine': 'AYUSH & Ayurveda Room 4',
};

// Evaluate vitals for critical thresholds
export function evaluateVitalsAlerts(vitals: VitalsData): string[] {
  const alerts: string[] = [];
  if (vitals.spO2 !== undefined && vitals.spO2 > 0 && vitals.spO2 < 92) {
    alerts.push(`Hypoxia detected: SpO2 ${vitals.spO2}% (<92%)`);
  }
  if (vitals.heartRate !== undefined && vitals.heartRate > 120) {
    alerts.push(`Marked tachycardia: Heart Rate ${vitals.heartRate} bpm (>120 bpm)`);
  } else if (vitals.heartRate !== undefined && vitals.heartRate > 0 && vitals.heartRate < 48) {
    alerts.push(`Severe bradycardia: Heart Rate ${vitals.heartRate} bpm (<48 bpm)`);
  }
  if (vitals.bloodPressureSystolic !== undefined && vitals.bloodPressureSystolic >= 190) {
    alerts.push(`Hypertensive crisis risk: Systolic BP ${vitals.bloodPressureSystolic} mmHg (>=190)`);
  } else if (vitals.bloodPressureSystolic !== undefined && vitals.bloodPressureSystolic > 0 && vitals.bloodPressureSystolic < 85) {
    alerts.push(`Hypotension shock risk: Systolic BP ${vitals.bloodPressureSystolic} mmHg (<85)`);
  }
  if (vitals.temperature !== undefined && vitals.temperature >= 103.5) {
    alerts.push(`Hyperpyrexia: Temperature ${vitals.temperature}°F (>=103.5°F)`);
  }
  if (vitals.respiratoryRate !== undefined && vitals.respiratoryRate >= 30) {
    alerts.push(`Tachypnea: Respiratory Rate ${vitals.respiratoryRate} /min (>=30)`);
  }
  if (vitals.bloodGlucose !== undefined && (vitals.bloodGlucose > 350 || vitals.bloodGlucose < 55)) {
    alerts.push(`Extreme glycemic disturbance: Blood Sugar ${vitals.bloodGlucose} mg/dL`);
  }
  return alerts;
}

// Rule-based clinical triage engine (used as instant client-side evaluator & server fallback)
export function evaluateClinicalTriage(
  intake: Partial<ClinicalIntakeData>,
  patientAge: number
): TriageAssessment {
  const complaint = (intake.chiefComplaint || '').toLowerCase();
  const complaintOriginal = (intake.chiefComplaintOriginal || '').toLowerCase();
  const bodyRegions = intake.bodyRegions || [];
  const associated = intake.associatedSymptoms || [];
  const vitals = intake.vitals || { painScore: 0 };

  const detectedRedFlags: string[] = [];
  const vitalsAlerts = evaluateVitalsAlerts(vitals);
  detectedRedFlags.push(...vitalsAlerts);

  // Check cardiac red flags
  const isChest = bodyRegions.includes('chest') || /chest|सीने|छाती|నెమ్ము|நெஞ்சு|হৃৎপিণ্ড/.test(complaint + complaintOriginal);
  const isRadiation = /radiat|jaw|left arm|shoulder|जबड़े|बाएं हाथ|தோள்|దవడ/.test(complaint + complaintOriginal);
  const isSweating = associated.includes('Sweating / Cold Clammy Skin') || /sweat|पसीना|ঘাম|చెమట|வியர்வை/.test(complaint + complaintOriginal);
  const isSeverePressure = /crushing|pressure|tightness|heaviness|भारी दबाव|அழுத்தம்/.test(complaint + complaintOriginal);

  if (isChest && (isRadiation || isSweating || isSeverePressure || vitals.painScore >= 8)) {
    detectedRedFlags.push('High suspicion of Acute Coronary Syndrome (ACS / STEMI)');
  }

  // Check stroke FAST signs
  if (/stroke|droop|weakness on one side|slurred speech|speech difficulty|लकवा|பக்கவாதம்|పక్షవాతం/.test(complaint + complaintOriginal)) {
    detectedRedFlags.push('Potential Acute Cerebrovascular Event / Stroke window');
  }

  // Check respiratory distress
  if (/breathless|wheez|stridor|asthma attack|दम फूलना|శ్వాస ఆడకపోవడం|மூச்சுத் திணறல்/.test(complaint + complaintOriginal)) {
    if (vitals.spO2 && vitals.spO2 < 93) {
      detectedRedFlags.push('Severe respiratory distress with oxygen desaturation');
    }
  }

  // Check severe trauma / bleeding
  if (/bleed|hemorrhag|खून|रक्त|இரத்தம்|రక్తం/.test(complaint + complaintOriginal)) {
    detectedRedFlags.push('Active bleeding / hemorrhage reported');
  }

  // Determine Triage Level
  let level: TriageLevel = 4;
  let score = 25;
  let rationale = 'Mild symptoms suitable for routine outpatient consultation.';
  let department: Department = 'General Medicine';
  const differentialConsiderations: string[] = [];
  const suggestedInvestigations: string[] = [];
  const immediateNursingActions: string[] = [];

  // 1. LEVEL 1: Resuscitation / Immediate
  if (
    detectedRedFlags.some(rf => rf.includes('Acute Coronary') || rf.includes('Stroke') || rf.includes('Hypoxia') || rf.includes('Hypotension')) ||
    (vitals.spO2 !== undefined && vitals.spO2 < 88) ||
    (vitals.bloodPressureSystolic !== undefined && vitals.bloodPressureSystolic < 80)
  ) {
    level = 1;
    score = 95;
    rationale = 'Critical presentation: Red flag indications of life-threatening cardiac, respiratory, or vascular compromise requiring immediate resuscitation.';
    department = isChest ? 'Cardiology' : 'Emergency & Trauma';
    immediateNursingActions.push(
      'Move patient immediately to Resuscitation Bay',
      'Obtain stat 12-lead ECG within 10 minutes',
      'High-flow oxygen via non-rebreather mask if SpO2 < 94%',
      'Establish dual wide-bore IV access (18G)',
      'Continuous cardiac and pulse oximetry monitoring'
    );
    suggestedInvestigations.push('12-Lead ECG stat', 'High-sensitivity Cardiac Troponin-I', 'Point-of-Care Blood Gas & Lactate', 'Bedside 2D Echocardiography', 'Chest X-Ray AP Portable');
    differentialConsiderations.push('ST-Elevation Myocardial Infarction (STEMI)', 'Non-ST Elevation ACS', 'Aortic Dissection', 'Acute Pulmonary Embolism', 'Acute Cardiogenic / Septic Shock');
  } 
  // 2. LEVEL 2: Emergent / Urgent
  else if (
    detectedRedFlags.length > 0 ||
    vitals.painScore >= 8 ||
    (vitals.temperature && vitals.temperature >= 102) ||
    bodyRegions.includes('abdomen') && vitals.painScore >= 7 ||
    /dengue|platelet|appendic|fracture|stone|renal colic|wheez/.test(complaint + complaintOriginal)
  ) {
    level = 2;
    score = 75;
    rationale = 'Urgent clinical scenario: High risk of rapid deterioration, severe unremitting pain, or abnormal hemodynamic parameters requiring prompt doctor evaluation.';
    
    if (bodyRegions.includes('chest') || /cough|wheez|asthma/.test(complaint)) {
      department = 'Pulmonology';
      immediateNursingActions.push('Check peak expiratory flow rate', 'Nebulization with Salbutamol/Ipratropium if indicated', 'Maintain sitting upright position');
      suggestedInvestigations.push('Chest X-Ray PA', 'Complete Blood Count (CBC) with differential', 'Arterial Blood Gas');
      differentialConsiderations.push('Acute Exacerbation of Asthma / COPD', 'Community-Acquired Pneumonia', 'Pleural Effusion');
    } else if (bodyRegions.includes('abdomen') || /stomach|vomit|उल्टी|വയറുവേദന/.test(complaint)) {
      department = 'General Surgery';
      immediateNursingActions.push('Keep patient strictly NPO (Nil per oral)', 'Initiate IV Ringer Lactate fluid hydration', 'Record hourly abdominal girth and tenderness');
      suggestedInvestigations.push('USG Abdomen & Pelvis', 'Serum Amylase & Lipase', 'Complete Blood Count (WBC shift to left)', 'Urine Routine & Microscopy');
      differentialConsiderations.push('Acute Appendicitis', 'Acute Cholecystitis', 'Ureteric / Renal Colic', 'Acute Pancreatitis');
    } else if (bodyRegions.includes('head_neck') && /fever|बुखार|காய்ச்சல்|জ্বর/.test(complaint)) {
      department = 'General Medicine';
      immediateNursingActions.push('Antipyretic sponge bath if temp > 103°F', 'Monitor for petechial or purpuric spots', 'Hydration status assessment');
      suggestedInvestigations.push('Dengue NS1 Antigen & IgM/IgG', 'CBC with Platelet Count & Hematocrit', 'Malaria Rapid Diagnostic Test (RDT)', 'TyphiDot / Blood Culture');
      differentialConsiderations.push('Dengue with Warning Signs', 'Severe Malaria / Leptospirosis', 'Enteric Fever (Typhoid)', 'Acute Viral Encephalopathy');
    } else {
      department = 'Emergency & Trauma';
      immediateNursingActions.push('Record baseline vitals every 15 minutes', 'Analgesic readiness as per physician order');
      suggestedInvestigations.push('Routine blood work', 'Targeted radiography');
      differentialConsiderations.push('Acute inflammatory/infectious process', 'Traumatic tissue injury');
    }
  } 
  // 3. LEVEL 3: Semi-Urgent
  else if (
    vitals.painScore >= 4 ||
    bodyRegions.includes('pelvis_urinary') ||
    /diabetes|sugar|blood pressure|vomit|diarrhea|dizziness|चकّر/.test(complaint + complaintOriginal)
  ) {
    level = 3;
    score = 50;
    rationale = 'Moderate severity with stable baseline vitals. Multiple diagnostic investigations likely needed before definitive management.';
    
    if (bodyRegions.includes('pelvis_urinary') || /urine|burning|मूत्र/.test(complaint)) {
      department = 'General Medicine';
      suggestedInvestigations.push('Urine Routine & Culture', 'Serum Creatinine & Electrolytes', 'Pelvic Ultrasound');
      differentialConsiderations.push('Urinary Tract Infection (UTI)', 'Renal Calculus', 'Benign Prostatic Hypertrophy');
    } else if (/sugar|diabetes|diabetic/.test(complaint)) {
      department = 'General Medicine';
      suggestedInvestigations.push('HbA1c & Fasting/Postprandial Blood Sugar', 'Serum Ketones', 'Lipid Profile');
      differentialConsiderations.push('Uncontrolled Type 2 Diabetes Mellitus', 'Early Diabetic Ketoacidosis / HONK risk');
    } else if (bodyRegions.includes('spine_back') || bodyRegions.includes('upper_limbs') || bodyRegions.includes('lower_limbs')) {
      department = 'Orthopedics';
      suggestedInvestigations.push('Plain X-Ray of affected joint/spine', 'Serum Uric Acid', 'Erythrocyte Sedimentation Rate (ESR)');
      differentialConsiderations.push('Lumbar Radiculopathy / Spondylosis', 'Ligament sprain / Tendinopathy');
    } else {
      department = 'General Medicine';
      suggestedInvestigations.push('Basic Metabolic Panel', 'Complete Blood Picture');
      differentialConsiderations.push('Acute Gastroenteritis', 'Systemic viral syndrome');
    }
    immediateNursingActions.push('Ensure hydration and comfort', 'Direct patient to OPD Sub-waiting area');
  } 
  // 4. LEVEL 4: Routine / Non-Urgent
  else {
    level = 4;
    score = 25;
    rationale = 'Mild, chronic or standard symptom profile with stable vital signs. Managed comfortably through standard OPD schedule.';
    if (bodyRegions.includes('lower_limbs') || bodyRegions.includes('spine_back') || /joint|knee|back|हड्डी/.test(complaint)) {
      department = 'Orthopedics';
      suggestedInvestigations.push('Weight-bearing joint radiographs');
      differentialConsiderations.push('Osteoarthritis', 'Mechanical backache');
    } else if (bodyRegions.includes('skin_generalized') || /skin|rash|itching|खुजली/.test(complaint)) {
      department = 'Dermatology';
      suggestedInvestigations.push('Skin scrapings for microscopy');
      differentialConsiderations.push('Contact dermatitis', 'Tinea / Fungal infection');
    } else if (bodyRegions.includes('head_neck') && /ear|throat|nose|गला|कान/.test(complaint)) {
      department = 'ENT & Head-Neck';
      suggestedInvestigations.push('Otoscopy', 'Indirect Laryngoscopy');
      differentialConsiderations.push('Chronic allergic rhinitis', 'Pharyngitis');
    } else {
      department = 'General Medicine';
      suggestedInvestigations.push('Annual wellness / outpatient baseline panel');
      differentialConsiderations.push('Non-specific somatic complaints', 'Post-viral convalescence');
    }
    immediateNursingActions.push('Issue OPD token and escort to standard waiting hall');
  }

  // Age considerations (Pediatric routing)
  if (patientAge > 0 && patientAge <= 14 && department === 'General Medicine') {
    department = 'Pediatrics';
  }

  return {
    level,
    score,
    recommendedDepartment: department,
    priorityRationale: rationale,
    redFlags: detectedRedFlags,
    differentialConsiderations,
    suggestedInvestigations,
    immediateNursingActions,
    aiConfidence: 0.94,
    isEmergency: level === 1,
    ruleBased: true,
    fallbackReason: 'Deterministic clinical protocol based on Emergency Severity Index (ESI)',
  };
}

// Calculate dynamic queue priority score
// Higher number = higher up in the queue
export function calculateQueuePriority(
  ticket: Pick<QueueTicket, 'triage' | 'createdAt' | 'patient'>
): number {
  const now = Date.now();
  const created = new Date(ticket.createdAt).getTime();
  const waitMinutes = Math.max(0, Math.floor((now - created) / 60000));

  // Triage base weight
  const baseWeight: Record<TriageLevel, number> = {
    1: 5000, // Level 1 is always top priority
    2: 1200,
    3: 400,
    4: 100,
  };

  let score = baseWeight[ticket.triage.level];

  // Waiting time accrual: each minute waited adds priority points
  score += waitMinutes * 3.5;

  // Vulnerability adjustments (Geriatric > 65 or Infant < 3 years)
  if (ticket.patient.age >= 65) {
    score += 80;
  } else if (ticket.patient.age <= 3) {
    score += 70;
  }

  // Red flags multiplier
  if (ticket.triage.redFlags && ticket.triage.redFlags.length > 0) {
    score += ticket.triage.redFlags.length * 50;
  }

  return Math.round(score);
}
