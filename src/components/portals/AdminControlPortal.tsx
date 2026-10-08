import React, { useState } from 'react';
import {
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Users,
  Play,
  Zap,
  RefreshCw,
  Globe,
  UserCheck,
  UserX,
  Clock,
  PhoneCall,
  UserPlus,
  Search,
  Eye,
  X,
  ShieldCheck,
  Building2,
  AlertCircle,
  FileCheck,
  Stethoscope
} from 'lucide-react';
import { useMedical } from '../../context/MedicalContext';
import { supabase } from '../../lib/supabase';
import { KYCApplication } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { NumberTicker } from '../ui/NumberTicker';

export const AdminControlPortal: React.FC = () => {
  const { forceDataRefresh,
    systemMetrics,
    playEmergencyAlarm,
    kycApplications,
    userProfiles,
    patients,
    registerUserProfile,
    approveKYCApplication,
    rejectKYCApplication,
    professionalProfiles,
    approveProfessional,
    rejectProfessional,
    directAdminAdmitPatient,
    setActivePortal
  } = useMedical();

  const [activeAdminTab, setActiveAdminTab] = useState<'patient_queue' | 'doctor_queue' | 'nurse_queue' | 'network_audit'>('patient_queue');
  const [kycFilter, setKycFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected KYC for inspection modal / approval
  const [inspectingKyc, setInspectingKyc] = useState<KYCApplication | null>(null);
  const [rejectingKycId, setRejectingKycId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedTriageBay, setSelectedTriageBay] = useState<string>('OPD-01');

  // Emergency direct intake form state
  const [traumaForm, setTraumaForm] = useState<{
    name: string;
    age: number | '';
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    bloodGroup: string;
    primaryDiagnosis: string;
    triageBay: string;
    allergen: string;
    contactName: string;
    contactPhone: string;
  }>({
    name: '',
    age: '',
    gender: 'MALE',
    bloodGroup: 'O -ve',
    primaryDiagnosis: 'Unconscious polytrauma / vehicular crash arrival',
    triageBay: 'RESUS-BAY-01',
    allergen: '',
    contactName: '',
    contactPhone: ''
  });

  const [simulatingLoad, setSimulatingLoad] = useState<boolean>(false);
  const [simulatedAlerts, setSimulatedAlerts] = useState<number>(systemMetrics.activeCriticalAlerts);
  const [simLog, setSimLog] = useState<string[]>([
    'Global System Gateway 3.2 connected for citizen identity verification',
    'Live telemetry synchronized with regional emergency hubs',
    'RxNorm & SNOMED CT drug safety engine active and listening',
    'Emergency bystander GPS beacon listener operational'
  ]);

  const pendingKycCount = kycApplications.filter(k => k.status === 'PENDING_ADMIN_VERIFICATION').length;
  const approvedKycCount = kycApplications.filter(k => k.status === 'APPROVED').length;

  const getTabCounts = () => {
    if (activeAdminTab === 'patient_queue') {
      return {
        pending: kycApplications.filter(k => k.status === 'PENDING_ADMIN_VERIFICATION').length,
        approved: kycApplications.filter(k => k.status === 'APPROVED').length
      };
    } else if (activeAdminTab === 'doctor_queue') {
      return {
        pending: userProfiles.filter((p: any) => p.accountStatus === 'PENDING' && p.role === 'DOCTOR').length,
        approved: professionalProfiles.filter(p => p.approval_status === 'APPROVED' && p.role === 'DOCTOR').length
      };
    } else if (activeAdminTab === 'nurse_queue') {
      return {
        pending: userProfiles.filter((p: any) => p.accountStatus === 'PENDING' && p.role === 'NURSE').length,
        approved: professionalProfiles.filter(p => p.approval_status === 'APPROVED' && p.role === 'NURSE').length
      };
    }
    return { pending: 0, approved: 0 };
  };

  const currentCounts = getTabCounts();

  const approvePatientRegistration = async (profile: any) => {
    await registerUserProfile({ ...profile, accountStatus: 'APPROVED' });
    
    // Auto-create patient record so they can access their dashboard
    if (profile.role === 'PATIENT') {
        const patientId = profile.googleUserId || profile.id;
        // Check if patient already exists to avoid 409
        if (!patients?.find((p: any) => p.id === patientId)) {
            const newPatient = {
                id: patientId,
                uhid: `UHID-${Math.floor(100000000 + Math.random() * 900000000)}`,
                name: profile.fullName || 'Citizen',
                age: 30,
                gender: 'OTHER',
                bloodGroup: 'Unknown',
                vitals: { hr: 0, bp: '0/0', spo2: 0, temp: 0, rr: 0, timestamp: '' },
                allergies: [],
                activeMedications: [],
                pastMedicalHistory: [],
                emergencyContacts: [],
                pastPrescriptions: [],
                interventions: []
            };
            try {
                // @ts-ignore
                await supabase.from('patients').upsert(newPatient);
            } catch (e) {
                console.error('Error auto-creating patient', e);
            }
            forceDataRefresh();
        }
    }
  };

  const handleApprove = (appId: string) => {
    approveKYCApplication(appId, 'Dr. Aris Thorne (Chief Registrar)', selectedTriageBay);
    setInspectingKyc(null);
    setSimLog(prev => [
      `${new Date().toTimeString().split(' ')[0]} - [APPROVED] Verified & issued UHID Emergency Pass for ${appId}`,
      ...prev
    ]);
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingKycId || !rejectionReason.trim()) return;
    rejectKYCApplication(rejectingKycId, 'Dr. Aris Thorne (Chief Registrar)', rejectionReason.trim());
    setRejectingKycId(null);
    setRejectionReason('');
    setInspectingKyc(null);
  };

  const handleDirectTraumaAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!traumaForm.name.trim()) return;

    directAdminAdmitPatient({
      uhid: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      name: traumaForm.name.trim(),
      age: typeof traumaForm.age === 'number' ? traumaForm.age : 35,
      gender: traumaForm.gender,
      bloodGroup: traumaForm.bloodGroup,
      bloodGroupDetails: `${traumaForm.bloodGroup} (Trauma Protocol Intake)`,
      isUniversalDonor: traumaForm.bloodGroup === 'O -ve',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      emergencyStatus: 'CRITICAL_RED',
      primaryDiagnosis: traumaForm.primaryDiagnosis.trim() || 'Acute trauma workup pending evaluation',
      secondaryConditions: ['Direct Emergency Bypass Intake'],
      organDonor: true,
      organDonorCardNumber: `NOTTO-IND-${Math.floor(100000 + Math.random() * 900000)}-EMG`,
      nfcTagUid: `NFC-${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
      qrPayload: `https://nadiayu.ai/scan/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      triageBay: traumaForm.triageBay || 'RESUS-BAY-01',
      vitals: {
        heartRate: 118,
        bloodPressure: '88/54',
        spo2: 89,
        respiratoryRate: 26,
        temperature: 36.4,
        bloodGlucose: 130,
        lastUpdated: 'Live telemetry active'
      },
      gcs: {
        eye: 2,
        verbal: 2,
        motor: 3,
        total: 7
      },
      allergies: traumaForm.allergen.trim() ? [
        {
          id: `alg-${Date.now()}`,
          allergen: traumaForm.allergen.trim(),
          severity: 'ANAPHYLACTIC_DEADLY',
          reaction: 'Airway constriction and circulatory collapse',
          category: 'Antibiotic',
          crossReactivities: ['Beta-Lactams']
        }
      ] : [],
      activeMedications: [],
      emergencyContacts: traumaForm.contactName.trim() ? [
        {
          id: `cnt-${Date.now()}`,
          name: traumaForm.contactName.trim(),
          relationship: 'Next of Kin / Contact',
          phone: traumaForm.contactPhone.trim() || 'Emergency Line',
          isPrimary: true,
          isMedicalProfessional: false
        }
      ] : [],
      interventions: [
        {
          id: `int-${Date.now()}`,
          timestamp: new Date().toTimeString().split(' ')[0],
          action: 'STAT Direct Trauma Bay Admission - Code Red Protocol',
          performedBy: 'Emergency Trauma Registrar',
          category: 'CIRCULATION',
          status: 'COMPLETED'
        }
      ],
      notes: 'Direct emergency trauma admission without citizen KYC bypass.',
      lastIncidentLocation: 'Hospital Emergency Ambulance Bay',
      incidentTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });

    setTraumaForm({
      name: '',
      age: '',
      gender: 'MALE',
      bloodGroup: 'O -ve',
      primaryDiagnosis: 'Unconscious polytrauma arrival',
      triageBay: 'RESUS-BAY-01',
      allergen: '',
      contactName: '',
      contactPhone: ''
    });

    setSimLog(prev => [
      `${new Date().toTimeString().split(' ')[0]} - [CODE RED ADMIT] Direct trauma patient admission executed`,
      ...prev
    ]);
  };

  const handleSimulateEmergencySpike = () => {
    setSimulatingLoad(true);
    playEmergencyAlarm();
    setTimeout(() => {
      setSimulatedAlerts(prev => prev + 1);
      setSimLog(prev => [
        `${new Date().toTimeString().split(' ')[0]} - [SIMULATED CRISIS] Code Red Ingestion: Multi-Vehicle Collision Incident`,
        ...prev
      ]);
      setSimulatingLoad(false);
    }, 800);
  };

  const hospitalNodes = [
    { name: 'Apex Emergency Center (AIIMS)', status: 'ONLINE', latency: '18ms', activeBays: '12 / 12' },
    { name: 'Safdarjung Emergency Red Zone', status: 'ONLINE', latency: '24ms', activeBays: '8 / 10' },
    { name: 'Max Super Speciality Critical Care', status: 'ONLINE', latency: '19ms', activeBays: '6 / 6' },
    { name: 'Fortis Escorts Emergency Bay', status: 'ONLINE', latency: '31ms', activeBays: '4 / 6' },
    { name: 'Apollo Emergency Resuscitation Unit', status: 'ONLINE', latency: '22ms', activeBays: '9 / 10' },
    { name: 'Medanta Medicity Emergency Hub', status: 'ONLINE', latency: '29ms', activeBays: '7 / 8' }
  ];

  const filteredKyc = kycApplications.filter(app => {
    const matchesFilter =
      kycFilter === 'ALL' ? true :
        kycFilter === 'PENDING' ? app.status === 'PENDING_ADMIN_VERIFICATION' :
          kycFilter === 'APPROVED' ? app.status === 'APPROVED' :
            app.status === 'REJECTED';

    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.globalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.govtIdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const filteredDoctors = professionalProfiles.filter(p => p.role === 'DOCTOR').filter(app => {
    const matchesFilter =
      kycFilter === 'ALL' ? true :
        kycFilter === 'PENDING' ? app.approval_status === 'PENDING' :
          kycFilter === 'APPROVED' ? app.approval_status === 'APPROVED' :
            app.approval_status === 'REJECTED';
    const matchesSearch =
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.aadhaar_masked.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.hospital_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredNurses = professionalProfiles.filter(p => p.role === 'NURSE').filter(app => {
    const matchesFilter =
      kycFilter === 'ALL' ? true :
        kycFilter === 'PENDING' ? app.approval_status === 'PENDING' :
          kycFilter === 'APPROVED' ? app.approval_status === 'APPROVED' :
            app.approval_status === 'REJECTED';
    const matchesSearch =
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.aadhaar_masked.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.hospital_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderFilterControls = (title: string, desc: string, pendingCount: number) => (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200">
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setKycFilter('PENDING')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${kycFilter === 'PENDING'
            ? 'bg-slate-900 text-white font-semibold'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          onClick={() => setKycFilter('APPROVED')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${kycFilter === 'APPROVED'
            ? 'bg-slate-900 text-white font-semibold'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
        >
          Approved
        </button>
        <button
          onClick={() => setKycFilter('REJECTED')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${kycFilter === 'REJECTED'
            ? 'bg-slate-900 text-white font-semibold'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setKycFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${kycFilter === 'ALL'
            ? 'bg-slate-900 text-white font-semibold'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
        >
          All Applications
        </button>
      </div>
      <div className="relative w-full sm:w-64">
        <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-5 pb-28 max-w-6xl mx-auto">

      {/* Clean, Non-Distracting Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Hospital Administration &bull; Registrar Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Hospital Admission &amp; KYC Verification
            </h1>
            <button
              onClick={async (e) => {
                const btn = e.currentTarget;
                btn.classList.add('animate-spin');
                await forceDataRefresh();
                setTimeout(() => btn.classList.remove('animate-spin'), 500);
              }}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Force Data Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-slate-700 mt-1">
            Review citizen identity applications, issue official Emergency Passes, and manage patient admissions.
          </p>
        </div>

        {/* Action Counters */}
        {['patient_queue', 'doctor_queue', 'nurse_queue'].includes(activeAdminTab) && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-center">
              <div className="text-sm text-slate-700 uppercase font-semibold">Pending Review</div>
              <div className="text-lg font-bold text-slate-900">{currentCounts.pending}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-center">
              <div className="text-sm text-slate-700 uppercase font-semibold">Approved Passes</div>
              <div className="text-lg font-bold text-slate-900">{currentCounts.approved}</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Tabs - Simple & High Contrast */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-fit overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('patient_queue')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeAdminTab === 'patient_queue'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <UserCheck className="w-4 h-4 text-blue-600" />
          <span>Patient Approvals</span>
          {(pendingKycCount + userProfiles.filter((p: any) => p.id && p.accountStatus === 'PENDING' && p.role === 'PATIENT').length) > 0 && (
            <span className="bg-blue-600 text-white text-sm font-bold px-1.5 py-0.2 rounded-full">
              {pendingKycCount + userProfiles.filter((p: any) => p.id && p.accountStatus === 'PENDING' && p.role === 'PATIENT').length}
            </span>
          )}
        </button>

        

        <button onClick={() => setActiveAdminTab('doctor_queue')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeAdminTab === 'doctor_queue'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Stethoscope className="w-4 h-4 text-emerald-600" />
          <span>Doctor Approvals</span>
          {userProfiles.filter((p: any) => p.accountStatus === 'PENDING' && p.role === 'DOCTOR').length > 0 && (
            <span className="bg-emerald-600 text-white text-sm font-bold px-1.5 py-0.2 rounded-full">
              {userProfiles.filter((p: any) => p.accountStatus === 'PENDING' && p.role === 'DOCTOR').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('nurse_queue')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeAdminTab === 'nurse_queue'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Nurse Approvals</span>
          {userProfiles.filter((p: any) => p.accountStatus === 'PENDING' && p.role === 'NURSE').length > 0 && (
            <span className="bg-emerald-600 text-white text-sm font-bold px-1.5 py-0.2 rounded-full">
              {userProfiles.filter((p: any) => p.accountStatus === 'PENDING' && p.role === 'NURSE').length}
            </span>
          )}
        </button>

        

        <button
          onClick={() => setActiveAdminTab('network_audit')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeAdminTab === 'network_audit'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Activity className="w-4 h-4 text-slate-700" />
          <span>System Status &amp; Logs</span>
        </button>
      </div>

      {/* TAB 1: CITIZEN KYC VERIFICATION QUEUE */}
            {activeAdminTab === 'patient_queue' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Pending Patient Account Registrations</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userProfiles.filter((p: any) => p.id && p.accountStatus === 'PENDING' && p.role === 'PATIENT').map((profile: any) => (
                    <tr key={profile.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{profile.fullName}</div>
                        <div className="text-xs text-slate-500 mono">{profile.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-lg">PENDING</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => approvePatientRegistration(profile)} className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold">Approve</button>
                        <button onClick={() => registerUserProfile({ ...profile, accountStatus: 'REJECTED' })} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold">Reject</button>
                      </td>
                    </tr>
                  ))}
                  {userProfiles.filter((p: any) => p.id && p.accountStatus === 'PENDING' && p.role === 'PATIENT').length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No pending patient registrations.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-8">
            <h3 className="text-lg font-bold text-slate-800">Citizen KYC Submissions</h3>
          </div>


          {/* Clean Filter & Search Bar */}
          {renderFilterControls('Patient Approvals', 'Review citizen identity applications.', currentCounts.pending)}

          {/* Clean KYC Applications List */}
          {filteredKyc.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200 text-center rounded-2xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-900">No applications in this view</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredKyc.map((app) => (
                <div
                  key={app.id}
                  className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 hover:border-slate-300 transition-colors"
                >
                  {/* Top Bar: Applicant Info & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={app.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={app.applicantName}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{app.applicantName}</h3>
                          <span className="text-sm text-slate-700 font-medium">
                            {app.age} yrs &bull; {app.gender}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 mt-0.5">
                          Global: <span className="font-mono text-slate-700 font-semibold">{app.globalId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    {app.status === 'PENDING_ADMIN_VERIFICATION' && (
                      <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold whitespace-nowrap">
                        Needs Review
                      </span>
                    )}
                    {app.status === 'APPROVED' && (
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-sm font-semibold whitespace-nowrap">
                        Approved
                      </span>
                    )}
                    {app.status === 'REJECTED' && (
                      <span className="px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm font-semibold whitespace-nowrap">
                        Rejected
                      </span>
                    )}
                  </div>

                  {/* Clean Detail Rows - Zero Clutter */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                    <div>
                      <div className="text-sm text-slate-700 uppercase font-medium">Blood Group</div>
                      <div className="font-bold text-slate-900">{app.bloodGroup}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-700 uppercase font-medium">Govt ID</div>
                      <div className="font-medium text-slate-900 truncate">{app.govtIdNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-700 uppercase font-medium">Organ Donor</div>
                      <div className="font-medium text-slate-900">{app.organDonor ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  {/* Allergies & ICE Note */}
                  <div className="space-y-1.5 text-sm text-slate-600">
                    {app.allergies && app.allergies.length > 0 ? (
                      <div className="flex items-start gap-1.5 text-slate-800 bg-red-50/50 border border-red-100 p-2.5 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-red-900">Declared Allergies: </span>
                          <span>{app.allergies.map(a => `${a.allergen} (${a.reaction})`).join(', ')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-700 text-sm">
                        No critical drug allergies declared.
                      </div>
                    )}

                    {app.emergencyContacts && app.emergencyContacts.length > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                        <PhoneCall className="w-3 h-3 text-slate-600" />
                        <span>ICE: <strong>{app.emergencyContacts[0].name}</strong> ({app.emergencyContacts[0].relationship}) - {app.emergencyContacts[0].phone}</span>
                      </div>
                    )}

                    {app.status === 'APPROVED' && app.allocatedUhid && (
                      <div className="flex items-center justify-between text-sm pt-1">
                        <span className="text-slate-700 font-mono font-medium">Aadhaar No: {app.allocatedUhid}</span>
                        <button
                          onClick={() => {
                            if (app.allocatedPatientId) {
                              setActivePortal('patient');
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        >
                          View Emergency Pass &rarr;
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Clear Action Buttons */}
                  {app.status === 'PENDING_ADMIN_VERIFICATION' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleApprove(app.id)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve &amp; Issue Pass</span>
                      </button>

                      <button
                        onClick={() => setRejectingKycId(app.id)}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => setInspectingKyc(app)}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors cursor-pointer"
                        title="View Full Application"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 1.5: DOCTOR QUEUE */}
      

            {activeAdminTab === 'doctor_queue' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Pending Doctor Registrations</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userProfiles.filter((p: any) => p.accountStatus === 'PENDING' && p.role === 'DOCTOR').map((profile: any) => (
                    <tr key={profile.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{profile.fullName}</div>
                        <div className="text-xs text-slate-500 mono">{profile.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-lg">PENDING</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => approvePatientRegistration(profile)} className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold">Approve</button>
                        <button onClick={() => registerUserProfile({ ...profile, accountStatus: 'REJECTED' })} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold">Reject</button>
                      </td>
                    </tr>
                  ))}
                  {userProfiles.filter((p: any) => p.accountStatus === 'PENDING' && p.role === 'DOCTOR').length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No pending doctor registrations.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeAdminTab === 'nurse_queue' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Pending Nurse Registrations</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userProfiles.filter((p: any) => p.accountStatus === 'PENDING' && p.role === 'NURSE').map((profile: any) => (
                    <tr key={profile.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{profile.fullName}</div>
                        <div className="text-xs text-slate-500 mono">{profile.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-lg">PENDING</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => approvePatientRegistration(profile)} className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold">Approve</button>
                        <button onClick={() => registerUserProfile({ ...profile, accountStatus: 'REJECTED' })} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold">Reject</button>
                      </td>
                    </tr>
                  ))}
                  {userProfiles.filter((p: any) => p.accountStatus === 'PENDING' && p.role === 'NURSE').length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No pending nurse registrations.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM AUDIT & NODES */}
      {activeAdminTab === 'network_audit' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Hospital Nodes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Connected Hospital Nodes
            </h3>
            <div className="space-y-2">
              {hospitalNodes.map((node, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{node.name}</div>
                    <div className="text-sm text-slate-700">Latency: {node.latency} &bull; Bays: {node.activeBays}</div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                    {node.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Stream */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Live System Audit Log
              </h3>
              <span className="text-sm text-slate-700">Synced</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {simLog.map((log, index) => (
                <div
                  key={index}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-mono text-sm text-slate-600"
                >
                  {log}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={handleSimulateEmergencySpike}
                disabled={simulatingLoad}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {simulatingLoad ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing load...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Run System Diagnostics Test</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      <AnimatePresence>
        {rejectingKycId && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Reject KYC Application
                </h3>
                <button
                  onClick={() => setRejectingKycId(null)}
                  className="p-1 rounded-lg text-slate-600 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-slate-700">
                Specify why this application was rejected so the citizen can provide corrected information.
              </p>

              <form onSubmit={handleReject} className="space-y-3">
                <textarea
                  required
                  placeholder="e.g. Identity name mismatch; please provide a clear blood typing document."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-slate-400 h-24 resize-none"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectingKycId(null)}
                    className="py-2 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold cursor-pointer"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* INSPECTION MODAL */}
      <AnimatePresence>
        {inspectingKyc && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-sm text-slate-700 uppercase font-semibold">Applicant Dossier</span>
                  <h3 className="text-base font-bold text-slate-900">{inspectingKyc.applicantName}</h3>
                </div>
                <button
                  onClick={() => setInspectingKyc(null)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-sm text-slate-700 uppercase font-medium">Global ID</div>
                  <div className="font-semibold text-slate-900 font-mono mt-0.5">{inspectingKyc.globalId}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-sm text-slate-700 uppercase font-medium">{inspectingKyc.govtIdType}</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{inspectingKyc.govtIdNumber}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-sm text-slate-700 uppercase font-medium">Blood Group</div>
                  <div className="font-bold text-slate-900 mt-0.5">{inspectingKyc.bloodGroup}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-sm text-slate-700 uppercase font-medium">Organ Donor</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{inspectingKyc.organDonor ? 'Yes (NOTTO)' : 'No'}</div>
                </div>
              </div>

              {inspectingKyc.pastMedicalHistoryText && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                  <div className="text-sm text-slate-700 uppercase font-medium mb-1">Declared Medical History</div>
                  <div className="text-slate-700 leading-relaxed">{inspectingKyc.pastMedicalHistoryText}</div>
                </div>
              )}

              {inspectingKyc.allergies && inspectingKyc.allergies.length > 0 && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm space-y-1">
                  <div className="text-sm text-red-700 uppercase font-bold">Critical Allergies</div>
                  {inspectingKyc.allergies.map((a, i) => (
                    <div key={i} className="text-red-900">
                      &bull; <strong>{a.allergen}</strong>: {a.reaction}
                    </div>
                  ))}
                </div>
              )}

              {inspectingKyc.status === 'PENDING_ADMIN_VERIFICATION' && (
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setRejectingKycId(inspectingKyc.id);
                    }}
                    className="py-2 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(inspectingKyc.id)}
                    className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold cursor-pointer"
                  >
                    Approve Application
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

