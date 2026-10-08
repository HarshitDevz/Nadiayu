import React, { useState } from 'react';
import {
  AlertOctagon,
  Stethoscope,
  FileUp,
  CheckCheck,
  QrCode,
  ShieldAlert,
  Heart,
  Zap,
  Clock,
  ArrowRight,
  Shield,
  Pill,
  BedDouble,
  Activity,
  MapPin,
  UserPlus,
  Radio,
  X,
  Trash2,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useMedical } from '../../context/MedicalContext';
import { motion, AnimatePresence } from 'motion/react';
import { CitizenKYCApplicationModal } from '../CitizenKYCApplicationModal';

export const OverviewPortal: React.FC = () => {
  const {
    activePatient,
    patients,
    setActivePatientId,
    setActivePortal,
    prescriptions,
    speakPatientBrief,
    registerNewPatient,
    deletePatient,
    isLiveTelemetryActive,
    toggleLiveTelemetry,
    kycApplications
  } = useMedical();

  const [showAdmitModal, setShowAdmitModal] = useState<boolean>(false);
  const [showKycModal, setShowKycModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
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
    bloodGroup: 'O +ve',
    primaryDiagnosis: '',
    triageBay: '01',
    allergen: '',
    contactName: '',
    contactPhone: ''
  });

  const pendingHitlCount = prescriptions.filter(p => p.status === 'awaiting_hitl').length;
  const pendingKycCount = kycApplications.filter(k => k.status === 'PENDING_ADMIN_VERIFICATION').length;
  const deadlyAllergies = activePatient ? activePatient.allergies.filter(a => a.severity === 'ANAPHYLACTIC_DEADLY') : [];

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    registerNewPatient({
      uhid: `NAD-2026-TR${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name.trim(),
      age: typeof formData.age === 'number' ? formData.age : 30,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      bloodGroupDetails: `${formData.bloodGroup} Antigen Profile`,
      isUniversalDonor: formData.bloodGroup === 'O -ve',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      emergencyStatus: 'CRITICAL_RED',
      primaryDiagnosis: formData.primaryDiagnosis.trim() || 'Acute emergency workup pending evaluation',
      secondaryConditions: [],
      organDonor: true,
      organDonorCardNumber: `NOTTO-IND-${Math.floor(100000 + Math.random() * 900000)}-ORG`,
      nfcTagUid: `NFC-${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
      qrPayload: `https://nadiayu.med/p/NAD-2026-${Date.now().toString().slice(-4)}`,
      triageBay: formData.triageBay || '01',
      vitals: {
        heartRate: 110,
        bloodPressure: '115/75',
        spo2: 96,
        respiratoryRate: 20,
        temperature: 36.8,
        bloodGlucose: 105,
        lastUpdated: 'Live telemetry active'
      },
      gcs: {
        eye: 3,
        verbal: 4,
        motor: 5,
        total: 12
      },
      allergies: formData.allergen.trim() ? [
        {
          id: `alg-${Date.now()}`,
          allergen: formData.allergen.trim(),
          severity: 'ANAPHYLACTIC_DEADLY',
          reaction: 'Anaphylactic airway collapse & cardiovascular shock risk',
          category: 'Antibiotic',
          crossReactivities: ['Beta-Lactams', 'Cephalosporins']
        }
      ] : [],
      activeMedications: [],
      emergencyContacts: formData.contactName.trim() ? [
        {
          id: `cnt-${Date.now()}`,
          name: formData.contactName.trim(),
          relationship: 'Next of Kin',
          phone: formData.contactPhone.trim() || 'Emergency Line',
          isPrimary: true,
          isMedicalProfessional: false
        }
      ] : [],
      interventions: [
        {
          id: `int-${Date.now()}`,
          timestamp: new Date().toTimeString().split(' ')[0],
          action: 'Initial emergency intake & triage admission completed',
          performedBy: 'Emergency Bay Triage Officer',
          category: 'AIRWAY',
          status: 'COMPLETED'
        }
      ],
      notes: 'Emergency admission logged into clinical triage queue.',
      lastIncidentLocation: 'Emergency Triage Intake',
      incidentTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });

    setFormData({
      name: '',
      age: '',
      gender: 'MALE',
      bloodGroup: 'O +ve',
      primaryDiagnosis: '',
      triageBay: '01',
      allergen: '',
      contactName: '',
      contactPhone: ''
    });
    setShowAdmitModal(false);
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-200">

      {/* ADMISSION MODAL */}
      <AnimatePresence>
        {showAdmitModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowAdmitModal(false)}
                className="absolute top-5 right-5 text-slate-600 hover:text-slate-700 p-2 rounded-xl bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <form onSubmit={handleCreatePatient} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="heading text-lg font-bold text-[#0F172A]">Admit Emergency Patient</h2>
                    <p className="text-sm text-slate-700">Create real-time clinical intake for emergency monitoring</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-sm mono uppercase font-bold text-slate-600">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm mono uppercase font-bold text-slate-600">Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 35"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm mono uppercase font-bold text-slate-600">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm mono uppercase font-bold text-slate-600">Blood Group *</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-red-600 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    >
                      <option value="O -ve">O -ve (Universal Donor)</option>
                      <option value="O +ve">O +ve</option>
                      <option value="A +ve">A +ve</option>
                      <option value="A -ve">A -ve</option>
                      <option value="B +ve">B +ve</option>
                      <option value="B -ve">B -ve</option>
                      <option value="AB +ve">AB +ve</option>
                      <option value="AB -ve">AB -ve</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm mono uppercase font-bold text-slate-600">Triage Bay / Bed</label>
                    <input
                      type="text"
                      placeholder="e.g. 03 (Red Resus)"
                      value={formData.triageBay}
                      onChange={(e) => setFormData({ ...formData, triageBay: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-sm mono uppercase font-bold text-slate-600">Primary Diagnosis</label>
                    <input
                      type="text"
                      placeholder="e.g. Acute exacerbation, suspected intracranial injury"
                      value={formData.primaryDiagnosis}
                      onChange={(e) => setFormData({ ...formData, primaryDiagnosis: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-sm mono uppercase font-bold text-red-600">Deadly Allergy (If Known)</label>
                    <input
                      type="text"
                      placeholder="e.g. Penicillins, Beta-Lactams, NSAIDs"
                      value={formData.allergen}
                      onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                      className="w-full bg-red-50/60 border border-red-200 rounded-xl px-3.5 py-2.5 text-sm text-red-700 focus:outline-none focus:border-red-400 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm mono uppercase font-bold text-slate-600">Emergency Contact Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe (Spouse)"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm mono uppercase font-bold text-slate-600">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 019-2834"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-primary-blue py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20"
                  >
                    Admit Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdmitModal(false)}
                    className="btn-secondary-paper py-3 px-4 rounded-xl text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IF NO ACTIVE PATIENTS */}
      {!activePatient ? (
        <div className="paper-card p-12 bg-white border border-[#E2E8F0] text-center max-w-xl mx-auto space-y-5 my-8 shadow-sm rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <BedDouble className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="heading text-2xl font-extrabold text-[#0F172A]">
              Emergency Triage Queue is Clear
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              No emergency patients are currently admitted in active resuscitation bays. Admit a patient via direct trauma intake or approve incoming Citizen Global KYC applications.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowKycModal(true)}
              className="w-full sm:w-auto btn-primary-blue py-3 px-6 rounded-2xl text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Apply Citizen KYC Pass</span>
            </button>
            <button
              onClick={() => setShowAdmitModal(true)}
              className="w-full sm:w-auto btn-secondary-paper py-3 px-5 rounded-2xl text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-red-600" />
              <span>Direct Trauma Intake</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* PENDING KYC BANNER IN OVERVIEW */}
          {pendingKycCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-blue-950">
                    {pendingKycCount} Citizen KYC Application{pendingKycCount > 1 ? 's' : ''} Received
                  </span>
                  <p className="text-sm text-blue-800">
                    Citizens applied online via System / Global ID. Review credentials &amp; issue passes in Hospital Admin Command Hub.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActivePortal('admin')}
                className="btn-primary-blue py-2 px-4 rounded-xl text-sm font-bold self-start sm:self-auto cursor-pointer shadow-xs"
              >
                Open KYC Approval Queue &rarr;
              </button>
            </motion.div>
          )}

          {/* CLINICAL TRIAGE ADMISSION BANNER */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="paper-card p-7 sm:p-8 relative overflow-hidden bg-white border border-[#E2E8F0] shadow-sm rounded-3xl"
          >
            <div className="absolute top-6 right-6 hidden sm:flex items-center gap-3">
              <div className="text-right">
                <span className="text-sm uppercase tracking-wider text-slate-700 mono font-bold block">
                  Level 1 Resuscitation
                </span>
                <span className="text-sm text-slate-700 font-semibold">Bed: {activePatient.triageBay}</span>
              </div>
              <div className="bg-red-50 border-2 border-red-500 px-4 py-2 rounded-2xl text-3xl font-black mono text-red-600 shadow-sm">
                {activePatient.bloodGroup}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative">
                <img
                  src={activePatient.photoUrl}
                  alt={activePatient.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="space-y-2.5 max-w-2xl">
                <div className="sm:hidden flex items-center justify-between">
                  <span className="bg-red-50 border-2 border-red-500 px-3 py-1 rounded-xl text-xl font-black mono text-red-600">
                    {activePatient.bloodGroup}
                  </span>
                  <span className="text-sm uppercase tracking-wider text-slate-700 mono font-bold">
                    Tier 1 Resuscitation
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
                    {activePatient.name}
                  </h1>
                  <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-0.5 rounded-full text-sm font-semibold mono">
                    {activePatient.gender}, {activePatient.age} Yrs
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong className="text-[#0F172A] font-semibold">{activePatient.primaryDiagnosis}</strong> &bull; Glasgow Coma Scale: <span className="mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">GCS {activePatient.gcs.total}/15</span>
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {deadlyAllergies.map(alg => (
                    <span key={alg.id} className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-sm font-bold uppercase tracking-wider mono flex items-center gap-1.5 shadow-xs">
                      <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                      DEADLY ALLERGY: {alg.allergen.toUpperCase()}
                    </span>
                  ))}
                  {deadlyAllergies.length === 0 && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium mono">
                      No deadly allergies documented
                    </span>
                  )}
                  {activePatient.organDonor && (
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-sm font-bold uppercase tracking-wider mono flex items-center gap-1.5 shadow-xs">
                      <Heart className="w-3.5 h-3.5 text-emerald-600" />
                      ORGAN DONOR PLEDGED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-700 pt-2 flex-wrap mono">
                  <span>Aadhaar No: <strong className="text-[#0F172A]">{activePatient.uhid}</strong></span>
                  <span>&bull;</span>
                  <span>Incident: <strong className="text-[#0F172A]">{activePatient.incidentTime}</strong></span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {activePatient.lastIncidentLocation}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowAdmitModal(true)}
                  className="btn-secondary-paper px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                  <span>+ Admit New Case</span>
                </button>
                <button
                  onClick={() => deletePatient(activePatient.id)}
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1.5"
                  title="Discharge / Remove patient from active bay"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Discharge</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="#/er"
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                      setActivePortal('er');
                    }
                  }}
                  className="btn-primary-blue px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Open ER Resuscitation &rarr;</span>
                </a>
              </div>
            </div>
          </motion.section>

          {/* TELEMETRY VITALS GRID */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="heading text-sm uppercase tracking-wider text-slate-700 font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Live Clinical Vitals &amp; Telemetry Stream
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleLiveTelemetry}
                  className={`text-sm px-3 py-1 rounded-full border font-mono flex items-center gap-1.5 transition-colors ${isLiveTelemetryActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isLiveTelemetryActive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                  {isLiveTelemetryActive ? 'Telemetry Streaming' : 'Telemetry Paused'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Heart Rate */}
              <div className="paper-card p-4 bg-white border border-slate-200 space-y-1 rounded-2xl shadow-xs">
                <div className="text-sm mono text-slate-700 font-bold uppercase flex justify-between items-center">
                  <span>HEART RATE</span>
                  <Heart className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div className="text-2xl font-black text-[#0F172A] mono">
                  {activePatient.vitals.heartRate} <span className="text-sm font-semibold text-slate-600">BPM</span>
                </div>
                <div className="text-sm text-slate-700 mono">Target: 60-100</div>
              </div>

              {/* Blood Pressure */}
              <div className="paper-card p-4 bg-white border border-slate-200 space-y-1 rounded-2xl shadow-xs">
                <div className="text-sm mono text-slate-700 font-bold uppercase flex justify-between items-center">
                  <span>BP</span>
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-[#0F172A] mono">
                  {activePatient.vitals.bloodPressure}
                </div>
                <div className="text-sm text-slate-700 mono">mmHg</div>
              </div>

              {/* SpO2 */}
              <div className="paper-card p-4 bg-white border border-slate-200 space-y-1 rounded-2xl shadow-xs">
                <div className="text-sm mono text-slate-700 font-bold uppercase flex justify-between items-center">
                  <span>SPO2</span>
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-[#0F172A] mono">
                  {activePatient.vitals.spo2}%
                </div>
                <div className="text-sm text-emerald-700 mono font-semibold">Target &gt;94%</div>
              </div>

              {/* Respiratory Rate */}
              <div className="paper-card p-4 bg-white border border-slate-200 space-y-1 rounded-2xl shadow-xs">
                <div className="text-sm mono text-slate-700 font-bold uppercase flex justify-between items-center">
                  <span>RESP RATE</span>
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="text-2xl font-black text-[#0F172A] mono">
                  {activePatient.vitals.respiratoryRate} <span className="text-sm font-semibold text-slate-600">/min</span>
                </div>
                <div className="text-sm text-slate-700 mono">Target: 12-20</div>
              </div>

              {/* Temperature */}
              <div className="paper-card p-4 bg-white border border-slate-200 space-y-1 rounded-2xl shadow-xs">
                <div className="text-sm mono text-slate-700 font-bold uppercase flex justify-between items-center">
                  <span>TEMP</span>
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-[#0F172A] mono">
                  {activePatient.vitals.temperature}°C
                </div>
                <div className="text-sm text-slate-700 mono">Normothermia</div>
              </div>

              {/* GCS Total */}
              <div className="paper-card p-4 bg-white border border-slate-200 space-y-1 rounded-2xl shadow-xs">
                <div className="text-sm mono text-slate-700 font-bold uppercase flex justify-between items-center">
                  <span>GCS TOTAL</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-600 mono">
                  {activePatient.gcs.total} <span className="text-sm font-semibold text-slate-600">/ 15</span>
                </div>
                <div className="text-sm text-amber-600 mono font-bold">
                  {activePatient.gcs.total <= 8 ? 'Severe' : 'Monitored'}
                </div>
              </div>
            </div>
          </section>

          {/* TWO-COLUMN CLINICAL LOG & MEDICATIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column: Interventions & Clinical Action Log (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="paper-card p-6 sm:p-7 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="heading text-sm uppercase tracking-wider text-slate-700 font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Chronological Clinical Interventions
                  </h3>
                  <span className="text-sm mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {activePatient.interventions.length} Recorded
                  </span>
                </div>

                <div className="space-y-3">
                  {activePatient.interventions.map((int) => (
                    <div
                      key={int.id}
                      className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-start justify-between gap-3 text-sm hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-sm">
                            {int.timestamp}
                          </span>
                          <span className="mono font-bold text-blue-700 text-sm uppercase">
                            [{int.category}]
                          </span>
                          <span className="text-slate-700 text-sm">&bull; {int.performedBy}</span>
                        </div>
                        <p className="text-[#0F172A] font-semibold leading-relaxed">
                          {int.action}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {int.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Active Medications & Prescriptions (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="paper-card p-6 sm:p-7 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="heading text-sm uppercase tracking-wider text-slate-700 font-bold flex items-center gap-2">
                    <Pill className="w-4 h-4 text-blue-600" />
                    Active Emergency Medications
                  </h3>
                  <button
                    onClick={() => setActivePortal('nurse')}
                    className="text-sm mono font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>+ Scan Order</span>
                  </button>
                </div>

                {activePatient.activeMedications.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-sm text-slate-700">
                    No active medications recorded yet. Use the Nurse Scanner to ingest doctor orders.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activePatient.activeMedications.map(med => (
                      <div
                        key={med.id}
                        className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1 text-sm"
                      >
                        <div className="flex items-center justify-between font-bold text-[#0F172A]">
                          <span>{med.name}</span>
                          <span className="mono text-sm text-slate-700">{med.dosage} &bull; {med.frequency}</span>
                        </div>
                        <div className="text-sm text-slate-600">
                          Indication: {med.indication}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}

      <CitizenKYCApplicationModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
      />

    </div>
  );
};

