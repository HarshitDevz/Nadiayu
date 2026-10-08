export type PortalType = 'patient' | 'doctor' | 'pharmacist' | 'user_registration' | 'landing' | 'er' | 'scan' | 'admin' | 'overview' | 'patient_sos' | 'nurse' | 'hitl';

export type EmergencySeverity = 'CRITICAL_RED' | 'URGENT_YELLOW' | 'STABLE_GREEN';

export interface Allergy {
  id: string;
  allergen: string;
  severity: 'ANAPHYLACTIC_DEADLY' | 'SEVERE' | 'MODERATE';
  reaction: string;
  category: 'Antibiotic' | 'Analgesic' | 'Food' | 'Environmental' | 'Other';
  crossReactivities: string[];
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  route: string;
  indication: string;
  prescribingDr: string;
  startedDate: string;
  contraindications: string[];
  isHighRisk: boolean;
}

export interface GCSState {
  eye: number; // 1-4
  verbal: number; // 1-5
  motor: number; // 1-6
  total: number; // 3-15
}

export interface Vitals {
  heartRate: number; // bpm
  bloodPressure: string; // e.g. "94/58"
  spo2: number; // %
  respiratoryRate: number; // /min
  temperature: number; // C
  bloodGlucose: number; // mg/dL
  lastUpdated: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  relation?: string; // alias for relationship
  phone: string;
  email?: string;
  isPrimary: boolean;
  isMedicalProfessional: boolean;
}

export interface TriageIntervention {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  category: 'AIRWAY' | 'BREATHING' | 'CIRCULATION' | 'DRUG' | 'DIAGNOSTIC';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';
}

export interface PastMedicalVisit {
  id: string;
  visitDate: string;
  department: string;
  doctorName: string;
  chiefComplaint: string;
  diagnosis: string;
  dischargeNotes: string;
  isImmutableHistory: boolean;
  condition?: string; // shorthand for diagnosis
  diagnosedYear?: string;
}

export interface PastPrescriptionRecord {
  id: string;
  date: string;
  doctorName: string;
  drugName: string;
  dosage: string;
  duration: string;
  status: 'COMPLETED_COURSE' | 'DISCONTINUED' | 'SUPERSEDED';
  isArchivedHistory: boolean;
}

export interface Patient {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  bloodGroupDetails: string;
  isUniversalDonor: boolean;
  photoUrl: string;
  emergencyStatus: EmergencySeverity;
  primaryDiagnosis: string;
  secondaryConditions: string[];
  organDonor: boolean;
  organDonorCardNumber?: string;
  nfcTagUid?: string;
  qrPayload?: string;
  vitals: Vitals;
  gcs: GCSState;
  allergies: Allergy[];
  activeMedications: Medication[];
  pastMedicalHistory?: PastMedicalVisit[];
  pastPrescriptions?: PastPrescriptionRecord[];
  pastPrescriptionHistory?: PastPrescriptionRecord[];
  emergencyContacts: EmergencyContact[];
  interventions?: TriageIntervention[];
  notes?: string;
  lastIncidentLocation?: string;
  incidentTime?: string;
  triageBay?: string;
}

export interface ExtractedMedication {
  id: string;
  rawText: string;
  parsedName: string;
  dosage: string;
  frequency: string;
  route: string;
  confidence: number;
  isAllergyConflict: boolean;
  conflictReason?: string;
  conflictDetails?: string;
  isEdited?: boolean;
}

export interface CriticalMedEntry {
  drug: string;
  dose: string;
  frequency: string;
  status: 'new entry' | 'previously recorded' | 'new';
  category: 'Analgesic' | 'Steroid' | 'Anticoagulant' | 'Antibiotic' | 'Antihypertensive' | 'Opioid' | 'High-Risk' | 'Chemotherapy' | 'Other';
}

export interface AccidentHistoryEntry {
  event: string;
  status: 'new entry' | 'previously recorded' | 'new';
}

export interface AllergyEntry {
  drug: string;
  reaction: string;
  status: 'new entry' | 'previously recorded' | 'new';
}

export type CriticalMedicationExtract = CriticalMedEntry;
export type CriticalHistoryExtract = AccidentHistoryEntry;
export type CriticalAllergyExtract = AllergyEntry;

export interface CriticalPatientExtract {
  critical_meds: CriticalMedEntry[];
  accident_history: AccidentHistoryEntry[];
  allergies: AllergyEntry[];
  // flat fields used by prescriptions table
  allergiesDetected?: boolean;
  pastHistory?: string;
  accidentHistory?: AccidentHistoryEntry[] | string[];
}

export interface PrescriptionJob {
  id: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  uploadedByNurse: string;
  hospitalUnit: string;
  uploadedAt: string;
  status: 'queued' | 'processing' | 'awaiting_hitl' | 'approved' | 'rejected';
  imageUri: string;
  imagePresetType?: string;
  overallConfidence: number;
  extractedText: string;
  doctorNotes: string;
  extractedMedications: ExtractedMedication[];
  criticalExtract?: CriticalPatientExtract;
  ocrStages: {
    name: string;
    completed: boolean;
    durationMs: number;
  }[];
  hitlReviewer?: string;
  hitlReviewedAt?: string;
  reviewNotes?: string;
}

export interface DrugInteractionResult {
  candidateDrug: string;
  conflicts: {
    type: 'ALLERGY_CONTRAINDICATION' | 'DRUG_DRUG_INTERACTION' | 'ORGAN_RISK';
    severity: 'FATAL_CONTRAINDICATION' | 'CRITICAL_WARNING' | 'CAUTION';
    source: string;
    details: string;
    recommendation: string;
  }[];
  isSafe: boolean;
}

export interface SystemMetric {
  hospitalNodesOnline?: number;
  activeEmergencyPatients?: number;
  pendingOCRJobs?: number;
  awaitingHiTLReview?: number;
  activeCriticalAlerts: number;
  ocrProcessingSpeedMs?: number;
  hitlAccuracyRate?: number;
  systemUptime?: number;
  emergencyBystanderPings24h?: number;
  avgOCRTimeMs?: number;
  nlpConfidenceScore?: number;
  drugInteractionEngineStatus?: string;
  totalAllergiesIntercepted?: number;
  lastTelemetryHeartbeat?: string;
}

export interface ScanNotificationLog {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  contactName: string;
  contactPhone: string;
  location: string;
  message: string;
  deliveryStatus: 'DELIVERED' | 'DISPATCHED';
}

export interface KYCApplication {
  id: string;
  applicantName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email?: string;
  globalId: string;
  govtIdType: 'Aadhaar Card' | 'Passport' | 'Voter ID' | 'Driving License';
  govtIdNumber: string;
  bloodGroup: string;
  organDonor: boolean;
  organDonorCardNumber?: string;
  photoUrl?: string;
  primaryDiagnosis?: string;
  allergies: Allergy[];
  emergencyContacts: EmergencyContact[];
  pastMedicalHistoryText?: string;
  submittedAt: string;
  status: 'PENDING_ADMIN_VERIFICATION' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  allocatedUhid?: string;
  allocatedPatientId?: string;
}

export interface FormularyDrug {
  name: string;
  category: string;
  indication: string;
  typicalDose: string;
  route: string;
  warnings: string;
  isOpioid?: boolean;
  isNSAID?: boolean;
}

export type UserRole = 'PATIENT' | 'DOCTOR' | 'NURSE';

export interface UserProfile {
  id: string; // UUID PRIMARY KEY
  google_user_id: string;
  full_name: string;
  email: string;
  phone: string;
  aadhaar_hash: string; // UNIQUE
  role: UserRole;
  account_status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

export interface ProfessionalProfile {
  id: string;
  user_id: string; // FOREIGN KEY to UserProfile.id
  professional_type: 'DOCTOR' | 'NURSE';
  registration_number: string;
  specialization?: string;
  hospital_name: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

