import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  ArrowRight,
  User,
  Heart,
  Phone
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { Allergy, EmergencyContact } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CitizenKYCApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRedirectToAdmin?: () => void;
}

export const CitizenKYCApplicationModal: React.FC<CitizenKYCApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccessRedirectToAdmin
}) => {
  const { submitCitizenKYC, setActivePortal } = useMedical();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  // Form State
  const [applicantName, setApplicantName] = useState<string>('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [phone, setPhone] = useState<string>('+91 ');
  const [email, setEmail] = useState<string>('');
  const [globalId, setglobalId] = useState<string>('91-');
  const [govtIdType, setGovtIdType] = useState<'Aadhaar Card' | 'Passport' | 'Voter ID' | 'Driving License'>('Aadhaar Card');
  const [govtIdNumber, setGovtIdNumber] = useState<string>('XXXX-XXXX-');
  const [bloodGroup, setBloodGroup] = useState<string>('B +ve');
  const [organDonor, setOrganDonor] = useState<boolean>(true);
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState<string>('');
  const [pastMedicalHistoryText, setPastMedicalHistoryText] = useState<string>('');
  const [allergenName, setAllergenName] = useState<string>('');
  const [allergenReaction, setAllergenReaction] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [contactRelation, setContactRelation] = useState<string>('Spouse');
  const [contactPhone, setContactPhone] = useState<string>('+91 ');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) return;

    const allergies: Allergy[] = allergenName.trim() ? [
      {
        id: `alg-${Date.now()}`,
        allergen: allergenName.trim(),
        severity: 'ANAPHYLACTIC_DEADLY',
        reaction: allergenReaction.trim() || 'Severe respiratory distress and swelling',
        category: 'Antibiotic',
        crossReactivities: ['Beta-Lactams']
      }
    ] : [];

    const emergencyContacts: EmergencyContact[] = contactName.trim() ? [
      {
        id: `cnt-${Date.now()}`,
        name: contactName.trim(),
        relationship: contactRelation.trim() || 'Emergency Contact',
        phone: contactPhone.trim() || '+91 98765 43210',
        isPrimary: true,
        isMedicalProfessional: false
      }
    ] : [];

    const appId = await submitCitizenKYC({
      applicantName: applicantName.trim(),
      age: typeof age === 'number' ? age : 29,
      gender: gender,
      phone: phone.trim(),
      email: email.trim(),
      globalId: globalId.trim() || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      govtIdType: govtIdType,
      govtIdNumber: (govtIdNumber.trim() && govtIdNumber.trim() !== 'XXXX-XXXX-') ? govtIdNumber.trim() : `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
      bloodGroup: bloodGroup,
      organDonor: organDonor,
      organDonorCardNumber: organDonor ? `NOTTO-IN-2026-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
      primaryDiagnosis: primaryDiagnosis.trim() || 'Citizen Self-Registered Digital Health Profile',
      allergies: allergies,
      emergencyContacts: emergencyContacts,
      pastMedicalHistoryText: pastMedicalHistoryText.trim(),
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    setSubmittedAppId(appId);
  };

  const handleResetAndClose = () => {
    setStep(1);
    setSubmittedAppId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-xl w-full p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto relative">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Apply for Nadiayu Emergency Pass
            </h2>
            <p className="text-sm text-slate-700 mt-0.5">
              Submit your Global profile for hospital registrar verification and pass issuance.
            </p>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1 rounded-lg text-slate-600 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUCCESS CONFIRMATION STATE */}
        {submittedAppId ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-slate-900" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <span className="text-sm font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-md">
                APPLICATION ID: {submittedAppId}
              </span>
              <h3 className="text-base font-bold text-slate-900 pt-2">
                Application Submitted for Approval
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Your application has been placed in the Hospital Registrar's verification queue.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                onClick={() => {
                  handleResetAndClose();
                  setActivePortal('admin');
                }}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors cursor-pointer"
              >
                Go to Admin Portal to Review
              </button>

              <button
                onClick={handleResetAndClose}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Minimal Step Indicators */}
            <div className="flex items-center justify-between gap-1 bg-slate-100 p-1 rounded-xl text-sm">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${step === 1 ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-700'
                  }`}
              >
                1. Identity
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${step === 2 ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-700'
                  }`}
              >
                2. Medical Info
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${step === 3 ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-700'
                  }`}
              >
                3. ICE Contacts
              </button>
            </div>

            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <div className="space-y-3.5 pt-1">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyanshu Mehta"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Age</label>
                    <input
                      type="number"
                      placeholder="32"
                      value={age}
                      onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Global ID (Global Health)</label>
                    <input
                      type="text"
                      placeholder="91-4829-1029-4412"
                      value={globalId}
                      onChange={(e) => setglobalId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Govt ID Number (Masked)</label>
                    <input
                      type="text"
                      placeholder="XXXX-XXXX-8912"
                      value={govtIdNumber}
                      onChange={(e) => setGovtIdNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Next: Medical Info</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: MEDICAL */}
            {step === 2 && (
              <div className="space-y-3.5 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Blood Group *</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-400"
                    >
                      <option value="O -ve">O -ve (Universal RBC)</option>
                      <option value="O +ve">O +ve</option>
                      <option value="A +ve">A +ve</option>
                      <option value="A -ve">A -ve</option>
                      <option value="B +ve">B +ve</option>
                      <option value="B -ve">B -ve</option>
                      <option value="AB +ve">AB +ve</option>
                      <option value="AB -ve">AB -ve</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Organ Donor</label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={organDonor}
                        onChange={(e) => setOrganDonor(e.target.checked)}
                        className="rounded text-slate-900"
                      />
                      <span>Pledge as Organ Donor</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Severe Drug Allergies (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Aspirin"
                    value={allergenName}
                    onChange={(e) => setAllergenName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Past Medical Conditions</label>
                  <textarea
                    placeholder="e.g. Hypertension, Mild Asthma"
                    value={pastMedicalHistoryText}
                    onChange={(e) => setPastMedicalHistoryText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-slate-400 h-20 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Next: ICE Contact</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONTACTS */}
            {step === 3 && (
              <div className="space-y-3.5 pt-1">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600">
                  Provide an emergency contact who will be notified if your pass is scanned by emergency responders.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rohan Verma"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Relationship</label>
                    <input
                      type="text"
                      placeholder="e.g. Spouse / Parent"
                      value={contactRelation}
                      onChange={(e) => setContactRelation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98712 44320"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors cursor-pointer"
                  >
                    Submit KYC Application
                  </button>
                </div>
              </div>
            )}

          </form>
        )}
      </div>
    </div>
  );
};

