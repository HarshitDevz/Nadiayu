import React, { useState } from 'react';
import {
  UserCircle2,
  PhoneCall,
  ShieldCheck,
  QrCode,
  Scan,
  Heart,
  Pill,
  AlertOctagon,
  Plus,
  Trash2,
  Download,
  Share2,
  Lock,
  CheckCircle2,
  FileCheck,
  Edit2,
  UserPlus,
  Sparkles,
  Clock,
  Building2,
  FileText,
  LogOut
} from 'lucide-react';
import { useMedical } from '../../context/MedicalContext';
import { EmergencyContact } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { NadiayuLogo } from '../NadiayuLogo';
import { DigitalMedicalPass } from '../DigitalMedicalPass';
import { BystanderScanPortal } from './BystanderScanPortal';
import { CitizenKYCApplicationModal } from '../CitizenKYCApplicationModal';
import { BorderBeam } from '../ui/BorderBeam';
import { SpotlightCard } from '../ui/SpotlightCard';
import { BadgePulse } from '../ui/BadgePulse';

export const PatientDashboardPortal: React.FC = () => {
  const {
    activePatient,
    updatePatientProfile,
    setActivePortal,
    kycApplications,
    prescriptions,
    logout
  } = useMedical();

  const [showKycModal, setShowKycModal] = useState<boolean>(false);
  const [showPublicPreview, setShowPublicPreview] = useState<boolean>(false);
  const [isEditingContacts, setIsEditingContacts] = useState<boolean>(false);
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newContactRelation, setNewContactRelation] = useState<string>('');

  const pendingApplications = kycApplications.filter(k => k.status === 'PENDING_ADMIN_VERIFICATION');

  if (showPublicPreview) {
    return (
      <div className="relative min-h-screen z-50 bg-white pb-20">
        <div className="fixed top-4 right-4 z-50">
          <button onClick={() => setShowPublicPreview(false)} className="bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg font-bold">Close Preview</button>
        </div>
        <BystanderScanPortal forcePreview={true} />
      </div>
    );
  }

  
  if (!activePatient) {
    return (
      <div className="space-y-6 pb-28 animate-in fade-in duration-200">
        <div className="paper-card p-12 bg-white border border-slate-200 text-center max-w-lg mx-auto space-y-4 shadow-sm my-8 rounded-3xl">
          <div className="w-14 h-14 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <UserCircle2 className="w-7 h-7" />
          </div>
          <h2 className="heading text-xl font-bold text-[#0F172A]">No Patient Profile Selected</h2>
          <button 
            onClick={() => logout()}
            className="btn-primary-blue px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto mt-4 bg-red-600 hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <p className="text-sm text-slate-600 leading-relaxed">
            You do not have an active patient pass yet. Please complete your registration or wait for Admin approval.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowKycModal(true)}
              className="w-full sm:w-auto btn-primary-blue py-3 px-6 rounded-2xl text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Go to Registration</span>
            </button>
          </div>
        </div>
        <CitizenKYCApplicationModal 
          isOpen={showKycModal}
          onClose={() => setShowKycModal(false)}
        />
      </div>
    );
  }

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: EmergencyContact = {
      id: `cnt-${Date.now()}`,
      name: newContactName.trim(),
      relationship: newContactRelation.trim() || 'Family Member',
      phone: newContactPhone.trim(),
      isPrimary: activePatient.emergencyContacts.length === 0,
      isMedicalProfessional: false
    };

    updatePatientProfile({
      emergencyContacts: [...activePatient.emergencyContacts, newContact]
    });

    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('');
    setIsEditingContacts(false);
  };

  const handleDeleteContact = (id: string) => {
    updatePatientProfile({
      emergencyContacts: activePatient.emergencyContacts.filter(c => c.id !== id)
    });
  };

  const handleToggleOrganDonor = () => {
    updatePatientProfile({
      organDonor: !activePatient.organDonor
    });
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-200">

      {/* PROFILE HEADER & DIGITAL PASS LAUNCHER */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="paper-card p-6 sm:p-7 bg-white border border-slate-200 rounded-3xl shadow-sm relative overflow-hidden"
      >
        <BorderBeam size={180} duration={8} colorFrom="#2563EB" colorTo="#38BDF8" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0 shadow-inner">
              <img
                src={activePatient.photoUrl}
                alt={activePatient.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="heading text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                  {activePatient.name}
                </h1>
                <span className="text-sm mono bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full text-slate-700 font-semibold">
                  {activePatient.age} yrs &bull; {activePatient.gender}
                </span>
              </div>

              <div className="text-sm text-slate-700 mono mt-1 flex flex-wrap gap-2">
                <span>Aadhaar No: <strong className="text-[#0F172A]">{activePatient.uhid}</strong></span>
                <span>&bull;</span>
                <span>NFC ID: <strong className="text-[#0F172A]">{activePatient.nfcTagUid || 'Not Assigned'}</strong></span>
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-sm mono font-bold bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full">
                  Blood: {activePatient.bloodGroup} {activePatient.isUniversalDonor && '(Universal Donor)'}
                </span>
                <button
                  onClick={handleToggleOrganDonor}
                  className={`text-sm mono font-bold border px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer ${activePatient.organDonor
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  <Heart className="w-3 h-3 text-emerald-600" />
                  Organ Donor: {activePatient.organDonor ? 'Pledged (Active)' : 'Not Pledged'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={() => setShowKycModal(true)}
              className="btn-secondary-paper py-3 px-4 rounded-2xl text-sm font-bold flex items-center gap-1.5 cursor-pointer hover:border-blue-300"
              title="Apply for a new citizen health pass"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Apply New Citizen KYC</span>
            </button>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-2xl hidden md:block">
              <NadiayuLogo size="sm" variant="compact" />
            </div>

          </div>
        </div>
      </motion.div>

      {/* PENDING KYC BANNER IF ANY */}
      {pendingApplications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <span className="font-bold text-amber-900">
                {pendingApplications.length} Citizen KYC Application{pendingApplications.length > 1 ? 's' : ''} Awaiting Admin Verification
              </span>
              <p className="text-sm text-amber-800">
                Latest: <strong>{pendingApplications[0].applicantName}</strong> (Global: {pendingApplications[0].globalId}). Needs approval from Hospital Admin Portal.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePortal('admin')}
            className="btn-secondary-paper py-2 px-3.5 rounded-xl text-sm font-bold bg-white text-amber-900 border-amber-200 hover:bg-amber-100 self-start sm:self-auto cursor-pointer"
          >
            Review in Admin Hub &rarr;
          </button>
        </motion.div>
      )}

      {/* 3D INTERACTIVE FLIPPABLE MEDICAL PASS */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => setShowPublicPreview(true)}
            className="btn-primary-blue px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            <Scan className="w-4 h-4" /> View Public Profile
          </button>
        </div>

      
      {/* DIGITAL EMERGENCY QR CODE FOR USER TO DOWNLOAD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="paper-card p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden my-6"
      >
        <BorderBeam size={150} duration={8} delay={9} colorFrom="#3b82f6" colorTo="#2563eb" />
        
        <div className="shrink-0 p-4 bg-slate-50 rounded-3xl border border-slate-200">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + '/#/patient_sos/' + activePatient.uhid)}`} 
            alt="Emergency QR Code" 
            className="w-40 h-40 object-contain rounded-xl mix-blend-multiply"
          />
        </div>

        <div className="space-y-4 flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <QrCode className="w-5 h-5 text-blue-600" />
            <h3 className="heading text-lg font-bold text-[#0F172A]">Your Emergency QR Pass</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md">
            This QR code contains your life-saving medical data. Print this on a sticker or keep it as your phone wallpaper. If scanned by a <strong>normal Google Scanner</strong> or iPhone camera in an emergency, it will instantly securely pull up your Public Emergency Card (like the one above) for paramedics.
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2 relative z-10">
            <a 
              href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(window.location.origin + '/#/patient_sos/' + activePatient.uhid)}`}
              download={`Emergency_QR_${activePatient.uhid}.png`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary-blue py-2.5 px-5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download HQ Image</span>
            </a>
            <button 
              onClick={() => window.open(`/#/patient_sos/${activePatient.uhid}`, '_blank')}
              className="btn-secondary-paper py-2.5 px-5 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <Scan className="w-4 h-4 text-slate-600" />
              <span>Preview Public QR Card</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* TWO COLUMNS: CONTACTS & MEDICAL RECORD SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: ICE CONTACTS (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <SpotlightCard
            spotlightColor="rgba(37, 99, 235, 0.06)"
            className="p-6 sm:p-7 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="heading text-sm uppercase tracking-wider text-slate-700 font-bold flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                Emergency Contacts (ICE)
              </h2>
              <button
                onClick={() => setIsEditingContacts(!isEditingContacts)}
                className="text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            </div>

            {/* Add Contact Form */}
            <AnimatePresence>
              {isEditingContacts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="text-sm font-bold text-[#0F172A]">Add New Emergency Contact</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Relationship (e.g. Spouse)"
                      value={newContactRelation}
                      onChange={(e) => setNewContactRelation(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddContact}
                      className="btn-primary-blue py-2 px-4 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20"
                    >
                      Save Contact
                    </button>
                    <button
                      onClick={() => setIsEditingContacts(false)}
                      className="btn-secondary-paper py-2 px-4 rounded-xl text-sm font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Contact list */}
            {activePatient.emergencyContacts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-sm text-slate-700">
                No emergency contacts listed. Click "Add Contact" above to register next-of-kin.
              </div>
            ) : (
              <div className="space-y-3">
                {activePatient.emergencyContacts.map((c, index) => (
                  <div
                    key={c.id || index}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-red-600 shrink-0 font-bold shadow-xs">
                        ICE
                      </div>
                      <div>
                        <div className="font-bold text-[#0F172A] flex items-center gap-2">
                          <span>{c.name}</span>
                          <span className="text-sm text-slate-700 mono font-normal">({c.relationship})</span>
                        </div>
                        <div className="text-sm text-slate-600 mono">{c.phone}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                      title="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SpotlightCard>
        </div>

        {/* RIGHT COLUMN: ALLERGIES & NOTTO STATUS (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <SpotlightCard
            spotlightColor="rgba(220, 38, 38, 0.06)"
            className="p-6 sm:p-7 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm"
          >
            <h2 className="heading text-sm uppercase tracking-wider text-slate-700 font-bold flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              Documented Allergies
            </h2>

            {activePatient.allergies.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 text-sm text-slate-700 text-center">
                No drug or clinical allergies recorded.
              </div>
            ) : (
              <div className="space-y-2.5">
                {activePatient.allergies.map(alg => (
                  <div key={alg.id} className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200 text-sm">
                    <div className="font-bold text-red-800">{alg.allergen}</div>
                    <div className="text-sm text-slate-600 mt-0.5">{alg.reaction}</div>
                  </div>
                ))}
              </div>
            )}
          </SpotlightCard>
        </div>

      </div>

      <CitizenKYCApplicationModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
      />
      {/* RECENT MEDICAL HISTORY SECTION */}
      <div className="pt-4 border-t border-slate-200/50 mt-4">
        <h2 className="heading text-sm uppercase tracking-wider text-slate-700 font-bold flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4" /> Recent Medical Uploads
        </h2>
        {prescriptions.filter(p => p.patientId === activePatient.id && p.status === 'approved').sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).slice(0, 2).map((job) => (
          <div key={job.id} className="bg-white p-4 rounded-xl border border-slate-200 mb-3 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{job.hospitalUnit}</span>
              <span className="text-xs text-slate-500">{new Date(job.uploadedAt).toLocaleDateString()}</span>
            </div>
            {job.doctorNotes && job.doctorNotes !== 'Uploaded by Pharmacist' && (
              <p className="text-sm text-slate-700 mb-2 leading-relaxed line-clamp-3 whitespace-pre-wrap">{job.doctorNotes}</p>
            )}
            {job.extractedMedications && job.extractedMedications.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Medications</p>
                <div className="flex flex-wrap gap-1">
                  {job.extractedMedications.map((med: any) => (
                    <span key={med.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-full font-medium">
                      💊 {med.parsedName}{med.dosage ? ` · ${med.dosage}` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {job.criticalExtract?.allergiesDetected && (
              <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 text-xs font-bold text-red-700 flex items-center gap-1">
                ⚠️ Allergies recorded
              </div>
            )}
            {job.criticalExtract?.pastHistory && (
              <div className="mt-2 text-xs text-slate-500 italic">🕒 {job.criticalExtract.pastHistory}</div>
            )}
            <p className="text-xs text-slate-400 mt-2">By: {job.uploadedByNurse}</p>
          </div>
        ))}
        {prescriptions.filter(p => p.patientId === activePatient.id && p.status === 'approved').length === 0 && (
          <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl text-center">No recent uploads found.</div>
        )}
      </div>

    </div>
  );
};

