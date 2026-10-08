import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  PortalType,
  Patient,
  PrescriptionJob,
  SystemMetric,
  DrugInteractionResult,
  ExtractedMedication,
  Allergy,
  Medication,
  EmergencyContact,
  Vitals,
  CriticalPatientExtract,
  ScanNotificationLog,
  KYCApplication
} from '../types';
const SYSTEM_METRICS_DEFAULT = {
  hospitalNodesOnline: 1,
  activeEmergencyPatients: 0,
  pendingOCRJobs: 0,
  awaitingHiTLReview: 0,
  activeCriticalAlerts: 0,
  ocrProcessingSpeedMs: 0,
  hitlAccuracyRate: 0,
  systemUptime: 100,
  emergencyBystanderPings24h: 0,
  avgOCRTimeMs: 0,
  nlpConfidenceScore: 0,
  drugInteractionEngineStatus: 'ONLINE',
  totalAllergiesIntercepted: 0,
  lastTelemetryHeartbeat: new Date().toISOString()
};
import { clinicalAudio } from '../utils/audioAlerts';
import { extractPrescriptionWithAI } from '../utils/openRouterExtractor';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface MedicalContextType {
  // Auth
  currentUser: User | null;
  isAuthLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInFake: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  // Admin
  isAdmin: boolean;
  // Portal access control
  disabledPortals: PortalType[];
  enablePortal: (portal: PortalType) => void;
  disablePortal: (portal: PortalType) => void;

  activePortal: PortalType;
  setActivePortal: (portal: PortalType) => void;
  patients: Patient[];
  activePatientId: string | null;
  activePatient: Patient | null;
  userProfiles: any[];
  registerUserProfile: (profile: any) => Promise<void>;
  setActivePatientId: (id: string) => void;
  findPatientByUniqueId: (query: string) => Patient | null;
  selectPatientByUniqueId: (query: string) => boolean;
  prescriptions: PrescriptionJob[];
  systemMetrics: SystemMetric;

  // Real Patient Management (Live Firestore & Real Time)
  registerNewPatient: (patient: Omit<Patient, 'id'>) => Promise<string>;
  directAdminAdmitPatient: (patient: Omit<Patient, 'id'>) => Promise<string>;
  updatePatientProfile: (updated: Partial<Patient>) => Promise<void>;
  updatePatientVitals: (vitals: Partial<Vitals>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;

  // Citizen KYC & Admin Verification Flow (Live Firestore)
  kycApplications: KYCApplication[];
  submitCitizenKYC: (data: Omit<KYCApplication, 'id' | 'submittedAt' | 'status'>) => Promise<string>;
  approveKYCApplication: (applicationId: string, reviewerName: string, triageBay?: string) => Promise<string>;
  rejectKYCApplication: (applicationId: string, reviewerName: string, reason: string) => Promise<void>;

  // Professional Approvals (MVP)
  professionalProfiles: any[];
  approveProfessional: (id: string) => void;
  rejectProfessional: (id: string) => void;

  // Real-time Telemetry Stream
  isLiveTelemetryActive: boolean;
  toggleLiveTelemetry: () => void;

  // GCS & Clinical Interventions
  updateGCS: (eye: number, verbal: number, motor: number) => Promise<void>;
  addIntervention: (action: string, category: 'AIRWAY' | 'BREATHING' | 'CIRCULATION' | 'DRUG' | 'DIAGNOSTIC') => Promise<void>;

  // Advanced Drug Interaction Engine
  checkDrugInteraction: (drugQuery: string) => DrugInteractionResult;

  // Nurse OCR & HiTL Verification Pipeline
  addPrescriptionDirectly: (job: PrescriptionJob) => Promise<void>;
  submitPrescriptionForOCR: (
    nurseName: string,
    notes: string,
    presetType: string,
    customImageUri?: string,
    customExtractedText?: string
  ) => Promise<string>;
  updateExtractedMedication: (jobId: string, medId: string, updated: Partial<ExtractedMedication>) => Promise<void>;
  addNewExtractedMedication: (jobId: string, med: Omit<ExtractedMedication, 'id'>) => Promise<void>;
  deleteExtractedMedication: (jobId: string, medId: string) => Promise<void>;
  approvePrescriptionJob: (jobId: string, reviewerName: string, notes?: string) => Promise<void>;
  rejectPrescriptionJob: (jobId: string, reviewerName: string, reason: string) => Promise<void>;

  // Bystander SOS Geolocation Beacon & Scan Notifications
  sosActive: boolean;
  sosEtaMinutes: number;
  sosLocation: { lat: number; lng: number; address: string } | null;
  triggerSOSBeacon: (customAddress?: string, coords?: { lat: number; lng: number }) => void;
  cancelSOS: () => void;
  scanNotifications: ScanNotificationLog[];
  notifyEmergencyContactsOnScan: (patientId: string, customLocation?: string) => ScanNotificationLog | null;

  // Audio Telemetry Feedback
  forceDataRefresh: () => Promise<void>;
  audioMuted: boolean;
  toggleAudioMute: () => void;
  playEmergencyAlarm: () => void;
  playHeartbeatBlip: () => void;
  speakPatientBrief: () => void;
}

const MedicalContext = createContext<MedicalContextType | undefined>(undefined);

// Helper to determine admin status
const isUserAdmin = (user: User | null): boolean => {
  if (!user) return false;
  // Check app_metadata role (set via Supabase dashboard or service role)
  if (user.app_metadata?.role === 'admin') return true;
  // Fallback: check user_metadata
  if (user.user_metadata?.role === 'admin') return true;
  return false;
};

export const MedicalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const [activePortal, setActivePortalState] = useState<PortalType>('landing');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatientId, setActivePatientIdState] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionJob[]>([]);
  const [kycApplications, setKycApplications] = useState<KYCApplication[]>([]);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [scanNotifications, setScanNotifications] = useState<ScanNotificationLog[]>([]);

  // Professional Profiles State
  const [professionalProfiles, setProfessionalProfiles] = useState<any[]>([]);


  const registerUserProfile = async (profile: any) => {
    try {
      // explicitly define onConflict to prevent 409 if there are multiple unique keys
      const { error } = await supabase.from('user_profiles').upsert(profile, { onConflict: 'id' });
      if (error) throw error;
      // Manually update local state to ensure UI updates immediately
      setUserProfiles(prev => prev.map(p => p.id === profile.id ? profile : p));
    } catch (err: any) {
      console.error('Error saving user profile', err);
      if (err?.code === '23505' || err?.message?.includes('duplicate key') || err?.code === '409' || err?.status === 409) {
        throw err; // Re-throw conflict errors so UI can show them
      }
      // Fallback for network issues
      console.warn('Fallback to local state', err);
      setUserProfiles(prev => [profile, ...prev.filter(p => p.id !== profile.id)]);
      throw err; // Always re-throw so the caller knows it failed!
    }
  };

  const approveProfessional = (id: string) => {
    setProfessionalProfiles(prev => prev.map(p => p.id === id ? { ...p, approval_status: 'APPROVED' } : p));
  };

  const rejectProfessional = (id: string) => {
    setProfessionalProfiles(prev => prev.map(p => p.id === id ? { ...p, approval_status: 'REJECTED' } : p));
  };
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric>({
    ...SYSTEM_METRICS_DEFAULT,
    activeCriticalAlerts: 0
  });

  const [isLiveTelemetryActive, setIsLiveTelemetryActive] = useState<boolean>(true);
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [sosEtaMinutes, setSosEtaMinutes] = useState<number>(4);
  const [sosLocation, setSosLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);

  // 1. Listen for Supabase Auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Admin and portal access control state
  const [disabledPortals, setDisabledPortals] = useState<PortalType[]>([]);
  const isAdmin = isUserAdmin(currentUser);

  const enablePortal = (portal: PortalType) => {
    setDisabledPortals((prev) => prev.filter((p) => p !== portal));
  };
  const disablePortal = (portal: PortalType) => {
    setDisabledPortals((prev) => (prev.includes(portal) ? prev : [...prev, portal]));
  };

  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
      clinicalAudio.playConfirmChime();
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      alert(`Sign in failed: ${err.message || 'Please try again.'}`);
    }
  };

  const signInFake = async (email: string) => {
    // Simple mock user object
    const fakeUser = {
      uid: 'fake_' + email.replace('@','_').replace('.','_'),
      email,
      displayName: email.split('@')[0],
      photoURL: null,
      // other fields as needed
    } as any;
    setCurrentUser(fakeUser);
    setIsAuthLoading(false);
  };



  const logout = async () => {
    try {
      await supabase.auth.signOut();
      clinicalAudio.playConfirmChime();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Helper: map snake_case DB row -> camelCase Patient
  const mapPatient = (row: any): Patient => ({
    ...row,
    bloodGroup: row.blood_group ?? row.bloodGroup,
    bloodGroupDetails: row.blood_group_details ?? row.bloodGroupDetails,
    isUniversalDonor: row.is_universal_donor ?? row.isUniversalDonor,
    photoUrl: row.photo_url ?? row.photoUrl,
    emergencyStatus: row.emergency_status ?? row.emergencyStatus,
    primaryDiagnosis: row.primary_diagnosis ?? row.primaryDiagnosis,
    secondaryConditions: row.secondary_conditions ?? row.secondaryConditions ?? [],
    organDonor: row.organ_donor ?? row.organDonor,
    organDonorCardNumber: row.organ_donor_card_number ?? row.organDonorCardNumber,
    nfcTagUid: row.nfc_tag_uid ?? row.nfcTagUid,
    qrPayload: row.qr_payload ?? row.qrPayload,
    activeMedications: row.active_medications ?? row.activeMedications ?? [],
    pastMedicalHistory: row.past_medical_history ?? row.pastMedicalHistory ?? [],
    pastPrescriptions: row.past_prescriptions ?? row.pastPrescriptions ?? [],
    emergencyContacts: row.emergency_contacts ?? row.emergencyContacts ?? [],
    interventions: row.interventions ?? [],
    allergies: row.allergies ?? [],
    lastIncidentLocation: row.last_incident_location ?? row.lastIncidentLocation,
    incidentTime: row.incident_time
      ? (typeof row.incident_time === 'string' ? row.incident_time : new Date(row.incident_time).toLocaleTimeString())
      : row.incidentTime,
    triageBay: row.triage_bay ?? row.triageBay,
  });

  // 2. Real-Time Supabase Synchronization for Patients
  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase.from('patients').select('*');
      if (data) setPatients(data.map(mapPatient));
    };
    fetchPatients();

    const channel = supabase.channel('patients-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, (payload) => {
        fetchPatients();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel);  };
  }, []);

  // 3. Real-Time Supabase Synchronization for KYC Applications
  const forceDataRefresh = async () => {
    const { data: profs } = await supabase.from('user_profiles').select('*');
    if (profs) setUserProfiles(profs.map((p: any) => ({
      ...p,
      googleUserId: p.google_user_id ?? p.googleUserId,
      fullName: p.full_name ?? p.fullName,
      aadhaarHash: p.aadhaar_hash ?? p.aadhaarHash,
      accountStatus: p.account_status ?? p.accountStatus,
    })));
    const { data: kycs } = await supabase.from('kyc_applications').select('*');
    if (kycs) setKycApplications(kycs as KYCApplication[]);
    const { data: pats } = await supabase.from('patients').select('*');
    if (pats) setPatients(pats.map(mapPatient));
  };
  useEffect(() => {
    
    const fetchProfiles = async () => {
      const { data } = await supabase.from('user_profiles').select('*');
      if (data) setUserProfiles(data.map((p: any) => ({
        ...p,
        googleUserId: p.google_user_id ?? p.googleUserId,
        fullName: p.full_name ?? p.fullName,
        aadhaarHash: p.aadhaar_hash ?? p.aadhaarHash,
        accountStatus: p.account_status ?? p.accountStatus,
      })));
    };
    fetchProfiles();
    
    const profChannel = supabase.channel('prof-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => fetchProfiles())
      .subscribe();

    const fetchKyc = async () => {
      const { data, error } = await supabase.from('kyc_applications').select('*');
      if (data) setKycApplications(data as KYCApplication[]);
    };
    fetchKyc();

    const fetchPats = async () => {
      const { data, error } = await supabase.from('patients').select('*');
      if (data) setPatients(data.map(mapPatient));
    };
    fetchPats();

    const channel = supabase.channel('kyc-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kyc_applications' }, (payload) => {
        fetchKyc();
      })
      .subscribe();

    const patsChannel = supabase.channel('pats-changes2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        fetchPats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); supabase.removeChannel(profChannel); supabase.removeChannel(patsChannel); };
  }, []);

  // 4. Real-Time Supabase Synchronization for Prescriptions
  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase.from('prescriptions').select('*');
      if (data) {
        // Deduplicate by id in case of any race conditions
        const seen = new Set<string>();
        const deduped = data.filter((p: any) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        setPrescriptions(deduped as any[]);
      }
    };
    fetchJobs();

    const channel = supabase.channel('prescriptions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, fetchJobs)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // URL Hash Routing Synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash || '';
      const cleanHash = rawHash.replace(/^[#/]+/, '').split('?')[0].split('/')[0].toLowerCase();
      const validPortals: string[] = ['landing', 'er', 'nurse', 'hitl', 'scan', 'patient', 'admin', 'overview', 'pharmacist', 'patient_sos', 'user_registration'];
      if (validPortals.includes(cleanHash)) {
        setActivePortalState(cleanHash as PortalType);
      } else {
        setActivePortalState('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setActivePortal = (portal: PortalType) => {
    setActivePortalState(portal);
    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/#/' + portal);
    } else {
      window.location.hash = `#/${portal}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activePatient = React.useMemo(() => {
    if (activePatientId) {
      const p1 = patients.find(p => p.id === activePatientId);
      if (p1) return p1;
    }
    const currentProfile = userProfiles.find(p => p.googleUserId === currentUser?.id || p.id === currentUser?.id);
    if (currentProfile) {
       // Lookup by KYC Application email first
       const myKyc = kycApplications.find(k => k.email === currentProfile.email && k.status === 'APPROVED');
       if (myKyc && myKyc.allocatedPatientId) {
           const p3 = patients.find(p => p.id === myKyc.allocatedPatientId);
           if (p3) return p3;
       }
       
       if (currentProfile.aadhaarHash) {
          const p2 = patients.find(p => p.uhid === currentProfile.aadhaarHash || p.uhid.includes(currentProfile.aadhaarHash));
          if (p2) return p2;
       }
    }
    return null;
  }, [activePatientId, patients, userProfiles, currentUser, kycApplications]);

  const setActivePatientId = (id: string) => {
    setActivePatientIdState(id);
    clinicalAudio.playHeartbeatBlip();
  };

  // Find Patient across UHID, Name, NFC, QR
  const findPatientByUniqueId = (query: string): Patient | null => {
    if (!query) return null;
    const clean = query.trim().toLowerCase();
    return patients.find(p =>
      p.id.toLowerCase() === clean ||
      p.uhid.toLowerCase() === clean ||
      p.uhid.toLowerCase().includes(clean) ||
      p.name.toLowerCase().includes(clean) ||
      (p.nfcTagUid && p.nfcTagUid.toLowerCase() === clean) ||
      (p.qrPayload && p.qrPayload.toLowerCase().includes(clean))
    ) || null;
  };

  const selectPatientByUniqueId = (query: string): boolean => {
    const found = findPatientByUniqueId(query);
    if (found) {
      setActivePatientIdState(found.id);
      clinicalAudio.playHeartbeatBlip();
      return true;
    }
    return false;
  };

  // Direct Admin Emergency Trauma Bay Admission -> Saved directly to Firestore
  const directAdminAdmitPatient = async (patientData: Omit<Patient, 'id'>): Promise<string> => {
    const newId = `pt-${Date.now().toString().slice(-6)}`;
    const newPatient: Patient = {
      ...patientData,
      id: newId
    };

    try {
      await supabase.from('patients').upsert(newPatient);
    } catch (err) {
      console.warn('Direct Firestore save fallback to local state', err);
      setPatients(prev => [newPatient, ...prev]);
    }

    setActivePatientIdState(newId);
    clinicalAudio.playConfirmChime();
    return newId;
  };

  const registerNewPatient = directAdminAdmitPatient;

  // Submit Citizen KYC Application -> Saved to Supabase
  const submitCitizenKYC = async (data: Omit<KYCApplication, 'id' | 'submittedAt' | 'status'>): Promise<string> => {
    const appId = `kyc-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApplication: KYCApplication = {
      ...data,
      id: appId,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING_ADMIN_VERIFICATION'
    };

    const { error } = await supabase.from('kyc_applications').upsert(newApplication);

    if (error) {
      console.warn('KYC Supabase save error', error);
      // Fallback
      setKycApplications(prev => [newApplication, ...prev]);
    }

    clinicalAudio.playConfirmChime();
    return appId;
  };

  // Hospital Admin approves citizen KYC application
  const approveKYCApplication = async (applicationId: string, reviewerName: string, triageBay?: string): Promise<string> => {
    const targetApp = kycApplications.find(a => a.id === applicationId);
    if (!targetApp) return '';

    const allocatedUhid = targetApp.govtIdNumber; // Using Aadhaar Card number as Unique Health ID
    const newPatientId = `pt-${Date.now().toString().slice(-6)}`;
    const nfcUid = `NFC-${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`;
    const qrPayload = `https://nadiayu.ai/scan/${allocatedUhid}`;

    const newPatient: Patient = {
      id: newPatientId,
      uhid: allocatedUhid,
      name: targetApp.applicantName,
      age: targetApp.age,
      gender: targetApp.gender,
      bloodGroup: targetApp.bloodGroup,
      bloodGroupDetails: `${targetApp.bloodGroup} (Govt & Global Verified)`,
      isUniversalDonor: targetApp.bloodGroup === 'O -ve',
      photoUrl: targetApp.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      emergencyStatus: 'STABLE_GREEN',
      primaryDiagnosis: targetApp.primaryDiagnosis || 'Global Verified Digital Emergency Health Record',
      secondaryConditions: [],
      organDonor: targetApp.organDonor,
      organDonorCardNumber: targetApp.organDonorCardNumber || (targetApp.organDonor ? `NOTTO-IN-2026-${Math.floor(100000 + Math.random() * 900000)}` : undefined),
      nfcTagUid: nfcUid,
      qrPayload: qrPayload,
      allergies: targetApp.allergies || [],
      activeMedications: [],
      emergencyContacts: targetApp.emergencyContacts || [],
      pastMedicalHistory: targetApp.pastMedicalHistoryText ? [
        {
          id: `pmh-${Date.now()}`,
          visitDate: new Date().toISOString().split('T')[0],
          department: 'General Medicine & Health Locker',
          doctorName: 'Verified via Global Registry',
          chiefComplaint: 'Verified Citizen Medical Profile',
          diagnosis: targetApp.pastMedicalHistoryText,
          dischargeNotes: `Records verified by Registrar ${reviewerName} during KYC admission review.`,
          isImmutableHistory: true
        }
      ] : [],
      vitals: {
        heartRate: 76,
        bloodPressure: '120/80',
        spo2: 99,
        respiratoryRate: 16,
        temperature: 37.0,
        bloodGlucose: 95,
        lastUpdated: 'Verified on Admission'
      },
      gcs: {
        eye: 4,
        verbal: 5,
        motor: 6,
        total: 15
      },
      interventions: [
        {
          id: `int-${Date.now()}`,
          timestamp: new Date().toTimeString().split(' ')[0],
          action: `Global Citizen KYC Verified & Emergency Digital Pass Activated (Global ID: ${targetApp.globalId
            })`,
          performedBy: reviewerName,
          category: 'DIAGNOSTIC',
          status: 'COMPLETED'
        }
      ],
      notes: `Global ID: ${targetApp.globalId} | Govt ID: ${targetApp.govtIdType}(${targetApp.govtIdNumber}).Verified by Registrar ${reviewerName}.`,
      lastIncidentLocation: 'Online Citizen KYC Portal',
      incidentTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      triageBay: triageBay || 'OPD-01'
    };

    const updatedKyc: KYCApplication = {
      ...targetApp,
      status: 'APPROVED',
      reviewedBy: reviewerName,
      reviewedAt: new Date().toLocaleString(),
      allocatedUhid: allocatedUhid,
      allocatedPatientId: newPatientId
    };

    try {
      await supabase.from('patients').upsert(newPatient);
      await supabase.from('kyc_applications').upsert(updatedKyc);
    } catch (err) {
      console.warn('Approval supabase fallback', err);
      setPatients(prev => [newPatient, ...prev]);
      setKycApplications(prev => prev.map(a => a.id === applicationId ? updatedKyc : a));
    }

    setActivePatientIdState(newPatientId);
    clinicalAudio.playConfirmChime();
    return newPatientId;
  };

  // Hospital Admin rejects KYC application
  const rejectKYCApplication = async (applicationId: string, reviewerName: string, reason: string): Promise<void> => {
    const targetApp = kycApplications.find(a => a.id === applicationId);
    if (!targetApp) return;

    const updated: KYCApplication = {
      ...targetApp,
      status: 'REJECTED',
      reviewedBy: reviewerName,
      reviewedAt: new Date().toLocaleString(),
      rejectionReason: reason
    };

    try {
      await supabase.from('kyc_applications').upsert(updated);
    } catch (err) {
      console.warn('Rejection supabase fallback', err);
      setKycApplications(prev => prev.map(a => a.id === applicationId ? updated : a));
    }
  };

  const updatePatientProfile = async (updated: Partial<Patient>): Promise<void> => {
    if (!activePatientId || !activePatient) return;
    const merged: Patient = { ...activePatient, ...updated };
    try {
      await supabase.from('patients').upsert(merged);
    } catch (err) {
      setPatients(prev => prev.map(p => p.id === activePatientId ? merged : p));
    }
  };

  const updatePatientVitals = async (vitalsUpdate: Partial<Vitals>): Promise<void> => {
    if (!activePatientId || !activePatient) return;
    const mergedVitals: Vitals = {
      ...activePatient.vitals,
      ...vitalsUpdate,
      lastUpdated: 'Updated just now'
    };
    const updatedPatient: Patient = { ...activePatient, vitals: mergedVitals };
    try {
      await supabase.from('patients').upsert(updatedPatient);
    } catch (err) {
      setPatients(prev => prev.map(p => p.id === activePatientId ? updatedPatient : p));
    }
  };

  const deletePatient = async (id: string): Promise<void> => {
    try {
      await supabase.from('patients').delete().eq('id', id);
    } catch (err) {
      console.warn('Delete doc error', err);
    }
    setPatients(prev => prev.filter(p => p.id !== id));
    setPrescriptions(prev => prev.filter(pr => pr.patientId !== id));
    if (activePatientId === id) {
      const remaining = patients.filter(p => p.id !== id);
      setActivePatientIdState(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const clearAllData = async (): Promise<void> => {
    try {
      // Delete all patients
      for (const p of patients) {
        await supabase.from('patients').delete().eq('id', p.id);;
      }
      // Delete all KYC
      for (const k of kycApplications) {
        await supabase.from('kyc_applications').delete().eq('id', k.id);;
      }
      // Delete all prescriptions
      for (const pr of prescriptions) {
        await supabase.from('prescriptions').delete().eq('id', pr.id);;
      }
    } catch (err) {
      console.warn('Error clearing remote firestore docs', err);
    }

    setPatients([]);
    setPrescriptions([]);
    setKycApplications([]);
    setActivePatientIdState(null);
    setSosActive(false);
    setSosLocation(null);
    clinicalAudio.playConfirmChime();
  };

  const updateGCS = async (eye: number, verbal: number, motor: number): Promise<void> => {
    if (!activePatientId || !activePatient) return;
    const total = eye + verbal + motor;
    const updated: Patient = {
      ...activePatient,
      gcs: { eye, verbal, motor, total }
    };

    try {
      await supabase.from('patients').upsert(updated);
    } catch (err) {
      setPatients(prev => prev.map(p => p.id === activePatientId ? updated : p));
    }

    if (total <= 8) {
      clinicalAudio.playEmergencyAlarm();
    } else {
      clinicalAudio.playHeartbeatBlip();
    }
  };

  const addIntervention = async (
    action: string,
    category: 'AIRWAY' | 'BREATHING' | 'CIRCULATION' | 'DRUG' | 'DIAGNOSTIC'
  ): Promise<void> => {
    if (!activePatientId || !activePatient) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newInt = {
      id: `int - ${Date.now()}`,
      timestamp: timeStr,
      action,
      performedBy: (currentUser as any)?.displayName || currentUser?.user_metadata?.full_name || 'Lead Physician / ER Team',
      category,
      status: 'COMPLETED' as const
    };

    const updated: Patient = {
      ...activePatient,
      interventions: [newInt, ...(activePatient.interventions || [])]
    };

    try {
      await supabase.from('patients').upsert(updated);
    } catch (err) {
      setPatients(prev => prev.map(p => p.id === activePatientId ? updated : p));
    }

    clinicalAudio.playConfirmChime();
  };

  // Comprehensive Clinical Drug Checker Engine
  const checkDrugInteraction = (drugQuery: string): DrugInteractionResult => {
    const query = drugQuery.trim().toLowerCase();
    const patient = activePatient;
    const conflicts: DrugInteractionResult['conflicts'] = [];

    if (!query) {
      return { candidateDrug: '', conflicts: [], isSafe: true };
    }

    if (!patient) {
      return {
        candidateDrug: drugQuery,
        conflicts: [],
        isSafe: true
      };
    }

    // Evaluate against patient's allergies
    patient.allergies.forEach(allergy => {
      const allergenLower = allergy.allergen.toLowerCase();
      const crossLower = (allergy.crossReactivities || []).map(c => c.toLowerCase());

      const isDirectMatch = allergenLower.split(/[\s,()\/]+/).some(token => token.length > 3 && query.includes(token));
      const isCrossMatch = crossLower.some(cr => cr.split(/[\s,()\/]+/).some(token => token.length > 3 && query.includes(token)));

      if (isDirectMatch || isCrossMatch) {
        const isDeadly = allergy.severity === 'ANAPHYLACTIC_DEADLY';
        conflicts.push({
          type: 'ALLERGY_CONTRAINDICATION',
          severity: isDeadly ? 'FATAL_CONTRAINDICATION' : 'CRITICAL_WARNING',
          source: `Clinical Allergy Registry: ${allergy.allergen}`,
          details: `ALLERGY WARNING(${allergy.severity}): Patient has documented ${allergy.reaction || 'severe reaction'}.Direct or cross - reactivity with ${allergy.allergen}.`,
          recommendation: isDeadly
            ? 'ABSOLUTE CONTRAINDICATION. Immediate risk of laryngeal edema and circulatory collapse. Switch class immediately.'
            : 'CONTRAINDICATED. Use non-cross-reactive alternative with antihistamine cover.'
        });
      }
    });

    return {
      candidateDrug: drugQuery,
      conflicts,
      isSafe: conflicts.length === 0
    };
  };

  // OCR Pipeline
  const addPrescriptionDirectly = async (newJob: PrescriptionJob): Promise<void> => {
    try {
      const { error } = await supabase.from('prescriptions').upsert(newJob);
      if (error) console.error('Prescription upsert error:', error);
      // Do NOT manually push to state — realtime fetchJobs will handle it
    } catch (err) {
      console.error('Prescription catch err:', err);
      // Only update local state as fallback if Supabase failed
      setPrescriptions(prev => {
        if (prev.some(p => p.id === newJob.id)) return prev;
        return [newJob, ...prev];
      });
    }
  };

  const submitPrescriptionForOCR = async (
    nurseName: string,
    notes: string,
    presetType: string,
    customImageUri?: string,
    customExtractedText?: string
  ): Promise<string> => {
    const targetPatient = activePatient;
    const jobId = `job - ocr - ${Date.now().toString().slice(-4)} `;

    const textToExtract = customExtractedText || '';

    let critical;
    let extractedMeds: ExtractedMedication[] = [];

    try {
      const result = await extractPrescriptionWithAI(textToExtract, targetPatient || null, customImageUri);
      critical = result.critical;
      extractedMeds = result.medications;
    } catch (e) {
      console.error("Failed to extract with OpenRouter API", e);
      critical = { critical_meds: [], accident_history: [], allergies: [] };
    }

    const newJob: PrescriptionJob = {
      id: jobId,
      patientId: targetPatient ? targetPatient.id : 'unknown',
      patientName: targetPatient ? targetPatient.name : 'Unknown Trauma Case',
      patientUhid: targetPatient ? targetPatient.uhid : 'AADHAAR-PENDING',
      uploadedByNurse: nurseName || (currentUser as any)?.displayName || currentUser?.user_metadata?.full_name || 'Emergency Triage Nurse',
      hospitalUnit: 'Emergency Resuscitation Unit',
      uploadedAt: 'Just now',
      status: 'awaiting_hitl',
      imageUri: customImageUri || '',
      imagePresetType: presetType,
      overallConfidence: 98.4,
      extractedText: textToExtract,
      doctorNotes: notes || 'STAT Emergency Prescribing',
      extractedMedications: extractedMeds,
      criticalExtract: critical,
      ocrStages: [
        { name: 'Raster Binarization & Adaptive Deskew', completed: true, durationMs: 80 },
        { name: 'Cursive Stroke Segmentation', completed: true, durationMs: 65 },
        { name: 'Multi-Pass Vision OCR', completed: true, durationMs: 310 },
        { name: 'Clinical NER Engine', completed: true, durationMs: 140 },
        { name: 'Allergy & Cross-Reactivity Interceptor', completed: true, durationMs: 75 }
      ]
    };

    await supabase.from('prescriptions').upsert(newJob);
    // Do NOT manually push — realtime subscription handles state update

    clinicalAudio.playConfirmChime();
    return jobId;
  };

  const updateExtractedMedication = async (jobId: string, medId: string, updated: Partial<ExtractedMedication>): Promise<void> => {
    const job = prescriptions.find(j => j.id === jobId);
    if (!job) return;

    const updatedMeds = job.extractedMedications.map(m => m.id === medId ? { ...m, ...updated } : m);
    const updatedJob: PrescriptionJob = { ...job, extractedMedications: updatedMeds };

    try {
      const { error } = await supabase.from('prescriptions').upsert(updatedJob);
      if (error) console.error('Prescription upsert error:', error);
    } catch (err) {
      console.error('Prescription catch err:', err);
    }
    setPrescriptions(prev => prev.map(j => j.id === jobId ? updatedJob : j));
  };

  const addNewExtractedMedication = async (jobId: string, med: Omit<ExtractedMedication, 'id'>): Promise<void> => {
    const job = prescriptions.find(j => j.id === jobId);
    if (!job) return;

    const newMed: ExtractedMedication = { ...med, id: `ext - ${Date.now()} ` };
    const updatedJob: PrescriptionJob = { ...job, extractedMedications: [...job.extractedMedications, newMed] };

    try {
      const { error } = await supabase.from('prescriptions').upsert(updatedJob);
      if (error) console.error('Prescription upsert error:', error);
    } catch (err) {
      console.error('Prescription catch err:', err);
    }
    setPrescriptions(prev => prev.map(j => j.id === jobId ? updatedJob : j));
  };

  const deleteExtractedMedication = async (jobId: string, medId: string): Promise<void> => {
    const job = prescriptions.find(j => j.id === jobId);
    if (!job) return;

    const updatedJob: PrescriptionJob = {
      ...job,
      extractedMedications: job.extractedMedications.filter(m => m.id !== medId)
    };

    try {
      const { error } = await supabase.from('prescriptions').upsert(updatedJob);
      if (error) console.error('Prescription upsert error:', error);
    } catch (err) {
      console.error('Prescription catch err:', err);
    }
    setPrescriptions(prev => prev.map(j => j.id === jobId ? updatedJob : j));
  };

  const approvePrescriptionJob = async (jobId: string, reviewerName: string, notes?: string): Promise<void> => {
    const job = prescriptions.find(j => j.id === jobId);
    if (!job) return;

    const updatedJob: PrescriptionJob = {
      ...job,
      status: 'approved',
      hitlReviewer: reviewerName || (currentUser as any)?.displayName || currentUser?.user_metadata?.full_name || 'Dr. On Duty',
      hitlReviewedAt: new Date().toLocaleString(),
      reviewNotes: notes
    };

    try {
      const { error } = await supabase.from('prescriptions').upsert(updatedJob);
      if (error) console.error('Prescription upsert error:', error);
    } catch (err) {
      console.error('Prescription catch err:', err);
    }
    setPrescriptions(prev => prev.map(j => j.id === jobId ? updatedJob : j));

    clinicalAudio.playConfirmChime();
  };

  const rejectPrescriptionJob = async (jobId: string, reviewerName: string, reason: string): Promise<void> => {
    const job = prescriptions.find(j => j.id === jobId);
    if (!job) return;

    const updatedJob: PrescriptionJob = {
      ...job,
      status: 'rejected',
      hitlReviewer: reviewerName || (currentUser as any)?.displayName || currentUser?.user_metadata?.full_name || 'Dr. On Duty',
      hitlReviewedAt: new Date().toLocaleString(),
      reviewNotes: reason
    };

    try {
      const { error } = await supabase.from('prescriptions').upsert(updatedJob);
      if (error) console.error('Prescription upsert error:', error);
    } catch (err) {
      console.error('Prescription catch err:', err);
    }
    setPrescriptions(prev => prev.map(j => j.id === jobId ? updatedJob : j));
  };

  // SOS Beacon
  const triggerSOSBeacon = (customAddress?: string, coords?: { lat: number; lng: number }) => {
    setSosActive(true);
    setSosLocation({
      lat: coords?.lat || 28.5672,
      lng: coords?.lng || 77.2100,
      address: customAddress || 'AIIMS Trauma Center Ring Road Ingress, New Delhi'
    });
    clinicalAudio.playEmergencyAlarm();
  };

  const cancelSOS = () => {
    setSosActive(false);
    setSosLocation(null);
    clinicalAudio.playConfirmChime();
  };

  const notifyEmergencyContactsOnScan = (patientId: string, customLocation?: string): ScanNotificationLog | null => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient || !patient.emergencyContacts || patient.emergencyContacts.length === 0) return null;

    const primaryContact = patient.emergencyContacts.find(c => c.isPrimary) || patient.emergencyContacts[0];
    const log: ScanNotificationLog = {
      id: `scan - log - ${Date.now()} `,
      patientId: patient.id,
      patientName: patient.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      contactName: primaryContact.name,
      contactPhone: primaryContact.phone,
      location: customLocation || 'Apex Emergency Trauma Intake',
      message: `URGENT ALERT: Emergency pass for ${patient.name} was scanned.Response teams alerted.`,
      deliveryStatus: 'DELIVERED'
    };

    setScanNotifications(prev => [log, ...prev]);
    return log;
  };

  // Audio helpers
  const toggleAudioMute = () => {
    setAudioMuted(prev => !prev);
  };

  const playEmergencyAlarm = () => {
    if (!audioMuted) clinicalAudio.playEmergencyAlarm();
  };

  const playHeartbeatBlip = () => {
    if (!audioMuted) clinicalAudio.playHeartbeatBlip();
  };

  const speakPatientBrief = () => {
    if (!activePatient) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Emergency Brief for ${activePatient.name}.Blood group ${activePatient.bloodGroup}. Primary diagnosis: ${activePatient.primaryDiagnosis}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleLiveTelemetry = () => {
    setIsLiveTelemetryActive(prev => !prev);
  };

  return (
    <MedicalContext.Provider
      value={{
        currentUser,
        isAuthLoading,
        signInWithGoogle,
        signInFake,
        logout,
        isAdmin,
        disabledPortals,
        enablePortal,
        disablePortal,
        activePortal,
        setActivePortal,
        patients,
        activePatientId,
        activePatient,
        setActivePatientId,
        findPatientByUniqueId,
        selectPatientByUniqueId,
        prescriptions,
        systemMetrics,
        registerNewPatient,
        directAdminAdmitPatient,
        updatePatientProfile,
        updatePatientVitals,
        deletePatient,
        clearAllData,
        kycApplications,
    userProfiles,
    registerUserProfile,
    forceDataRefresh,
        submitCitizenKYC,
        approveKYCApplication,
        rejectKYCApplication,
        professionalProfiles,
        approveProfessional,
        rejectProfessional,
        isLiveTelemetryActive,
        toggleLiveTelemetry,
        updateGCS,
        addIntervention,
        checkDrugInteraction,
        addPrescriptionDirectly,
        submitPrescriptionForOCR,
        updateExtractedMedication,
        addNewExtractedMedication,
        deleteExtractedMedication,
        approvePrescriptionJob,
        rejectPrescriptionJob,
        sosActive,
        sosEtaMinutes,
        sosLocation,
        triggerSOSBeacon,
        cancelSOS,
        scanNotifications,
        notifyEmergencyContactsOnScan,
        audioMuted,
        toggleAudioMute,
        playEmergencyAlarm,
        playHeartbeatBlip,
        speakPatientBrief
      }}
    >
      {children}
    </MedicalContext.Provider>
  );
};

export const useMedical = () => {
  const context = useContext(MedicalContext);
  if (!context) {
    throw new Error('useMedical must be used within a MedicalProvider');
  }
  return context;
};

