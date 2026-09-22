export type SupportedLanguage = 
  | 'en' // English
  | 'ta' // Tamil (தமிழ்)
  | 'hi' // Hindi (हिन्दी)
  | 'te' // Telugu (తెలుగు)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ml' // Malayalam (മലയാളം)
  | 'bn' // Bengali (বাংলা)
  | 'mr'; // Marathi (मराठी)

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  speechCode: string;
}

export type TriageLevel = 1 | 2 | 3 | 4;

export interface TriageLevelConfig {
  level: TriageLevel;
  code: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4';
  title: string;
  subTitle: string;
  color: string;
  bgLight: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  maxWaitTimeMinutes: number;
}

export type Department = 
  | 'Emergency & Trauma'
  | 'General Medicine'
  | 'Cardiology'
  | 'Pulmonology'
  | 'General Surgery'
  | 'Orthopedics'
  | 'Pediatrics'
  | 'Neurology'
  | 'Gastroenterology'
  | 'Obstetrics & Gynecology'
  | 'ENT & Head-Neck'
  | 'Dermatology'
  | 'AYUSH / Integrative Medicine';

export type BodyRegion = 
  | 'head_neck'
  | 'chest'
  | 'abdomen'
  | 'spine_back'
  | 'upper_limbs'
  | 'lower_limbs'
  | 'pelvis_urinary'
  | 'skin_generalized';

export interface StructuredBodyRegion {
  bodyRegion: string;
  side?: 'left' | 'right' | 'both' | 'center';
  subRegion?: string;
  specificRegion?: string;
}

export interface VitalsData {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number; // bpm
  spO2?: number; // percentage
  temperature?: number; // Fahrenheit
  respiratoryRate?: number; // breaths/min
  bloodGlucose?: number; // mg/dL
  painScore: number; // 0 - 10
}

export type UserRole = 'patient' | 'nurse' | 'doctor' | 'admin';

export type InformationSource = 
  | 'PATIENT_VOICE' 
  | 'PATIENT_TOUCH' 
  | 'PATIENT_TEXT' 
  | 'NURSE_ASSISTED' 
  | 'DOCUMENT_OCR' 
  | 'PRACTITIONER_ENTERED';

export interface PrakritiQuestionOption {
  key: string;
  label: string;
  labelTranslated?: string;
  doshaWeight: { vata: number; pitta: number; kapha: number };
  description?: string;
}

export interface PrakritiQuestion {
  id: string;
  category: 
    | 'body_build'
    | 'skin'
    | 'hair'
    | 'appetite_digestion'
    | 'sleep'
    | 'energy_activity'
    | 'temperature_tolerance'
    | 'mental_temperament'
    | 'lifestyle';
  questionText: string;
  subtitle?: string;
  audioPromptKey?: string;
  options: PrakritiQuestionOption[];
}

export interface PrakritiAnswerRecord {
  questionId: string;
  category: string;
  questionText: string;
  answerKey: string;
  answerLabel: string;
  doshaWeight: { vata: number; pitta: number; kapha: number };
  source: InformationSource;
}

export interface PrakritiPractitionerReview {
  status: 'pending_review' | 'verified' | 'modified' | 'accepted';
  practitionerNotes?: string;
  verifiedPrakriti?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface PrakritiAssessment {
  vataScore: number; // percentage 0-100
  pittaScore: number; // percentage 0-100
  kaphaScore: number; // percentage 0-100
  dominantPrakriti: string; // e.g. "Vata-Pitta", "Pitta-Kapha", "Kapha"
  characteristics: string[];
  responses: PrakritiAnswerRecord[];
  completenessScore: number; // 0-100
  summary: string;
  lifestyleInfo?: {
    dietPreference?: string;
    dailyRoutine?: string;
    physicalActivity?: string;
    stressLevel?: string;
  };
  practitionerReview: PrakritiPractitionerReview;
}

export interface NurseUser {
  id: string;
  name: string;
  nurseId?: string;
  nurseName?: string;
  role: 'nurse' | 'triage_officer';
  badgeNumber: string;
  department: string;
  shift: 'morning' | 'evening' | 'night';
}

export interface ReTriageRecord {
  timestamp: string;
  previousLevel: TriageLevel;
  newLevel: TriageLevel;
  reason: string;
  nurseName: string;
  updatedWaitMinutes: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userRole: UserRole;
  userName: string;
  patientId: string;
  patientName: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  source: InformationSource;
}

export interface PatientDemographics {
  id: string;
  abhaId?: string; // Ayushman Bharat Health Account (ABHA) e.g., 14-digit
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  emergencyContact?: string;
  city: string;
  preferredLanguage: SupportedLanguage;
  isGuest?: boolean;
  temporaryId?: string;
  isEmergencyGuest?: boolean;
  abhaLinked?: boolean;
  linkedAt?: string;
}

export interface DynamicQuestion {
  id: string;
  questionText: string;
  questionTextTranslated?: string;
  category: 'onset' | 'severity' | 'radiation' | 'associated' | 'red_flag';
  options?: string[];
  answer?: string;
}

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileType: 'lab_report' | 'prescription' | 'discharge_summary' | 'imaging';
  extractedSummary: string;
  extractedKeyFindings?: string[];
  extractedMedications?: string[];
  extractedAllergies?: string[];
  clinicalRiskFlags?: string[];
  practitionerVerificationStatus?: 'pending_verification' | 'verified_by_doctor' | 'rejected';
  date?: string;
  url?: string;
}

export interface ClinicalIntakeData {
  chiefComplaint: string;
  chiefComplaintOriginal: string; // in native patient language
  inputLanguage: SupportedLanguage;
  inputMode: 'voice' | 'text' | 'touch';
  duration: string; // e.g. "3 hours", "2 days"
  onset: 'sudden' | 'gradual';
  bodyRegions: BodyRegion[];
  structuredBodyRegions?: StructuredBodyRegion[];
  painType?: string; // throbbing, sharp, dull, burning, squeezing
  associatedSymptoms: string[];
  dynamicQuestions: DynamicQuestion[];
  pastMedicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  documents: UploadedDocument[];
  vitals: VitalsData;
  redFlagsDetected: string[];
  ayushPrakriti?: PrakritiAssessment;
  sources?: Record<string, InformationSource>;
  nurseAssisted?: boolean | {
    nurseId: string;
    nurseName: string;
    assistedAt: string;
  };
  nurseAssistedBy?: string;
}

export interface AdcpClinicalProtocol {
  protocolTitle?: string;
  allopathicPathway?: string;
  allopathicStabilization?: string;
  ayushGuidance?: string;
  ayushIntegrativeGuidance?: string;
  contraindications?: string[];
  lifestyleCautions?: string[];
  lifestylePrecautions?: string[];
  confidenceScore?: number;
  practitionerVerificationRequired?: boolean;
}

export interface PractitionerVerification {
  verified: boolean;
  verifiedBy: string;
  verifiedAt: string;
  role?: string;
  notes?: string;
  modifiedTriage?: TriageLevel;
}

export interface TriageAssessment {
  level: TriageLevel;
  score: number; // 0 - 100
  recommendedDepartment: Department;
  priorityRationale: string;
  redFlags: string[];
  differentialConsiderations: string[]; // for physician decision support only
  suggestedInvestigations: string[]; // e.g., ECG, Troponin, CBC, Ultrasound
  immediateNursingActions: string[]; // e.g., Oxygen mask, ECG stat, Wheelchair
  immediatePrecautions?: string[];
  aiConfidence: number; // 0 - 1
  confidenceScore?: number;
  confidenceGatingPassed?: boolean;
  confidenceGatingRationale?: string;
  requiresMandatoryPractitionerReview?: boolean;
  adcpProtocol?: AdcpClinicalProtocol;
  isEmergency: boolean;
  ruleBased?: boolean;
  fallbackReason?: string;
}

export type TicketStatus = 
  | 'waiting'
  | 'called'
  | 'in_consultation'
  | 'completed'
  | 'transferred_to_er';

export interface QueueTicket {
  id: string;
  tokenNumber: string; // e.g., "A-102"
  patient: PatientDemographics;
  intake: ClinicalIntakeData;
  triage: TriageAssessment;
  department: Department;
  roomNumber: string;
  assignedDoctor?: string;
  status: TicketStatus;
  createdAt: string; // ISO timestamp
  calledAt?: string;
  consultationStartedAt?: string;
  completedAt?: string;
  priorityRank: number; // calculated score for dynamic queue position
  estimatedWaitMinutes: number;
  triageSource?: 'gemini' | 'rules_fallback';
  triageNotice?: string;
  triageFallbackReason?: string;
  nurseAssisted?: boolean;
  doctorNotes?: string;
  doctorTriageOverride?: TriageLevel;
  orderedInvestigations?: string[];
  practitionerVerification?: PractitionerVerification;
  reTriageHistory?: ReTriageRecord[];
  isGuest?: boolean;
  temporaryId?: string;
  isEmergencyGuest?: boolean;
}

export interface HospitalDepartmentStats {
  department: Department;
  currentWaitCount: number;
  doctorsOnDuty: number;
  avgWaitTimeMinutes: number;
  roomNumbers: string[];
}
