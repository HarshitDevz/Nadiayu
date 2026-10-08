import React, { useState, useEffect } from 'react';
import { useMedical } from '../../context/MedicalContext';
import { Shield, Globe, UserCheck, CheckCircle2, ChevronRight, Stethoscope } from 'lucide-react';
import { UserRole } from '../../types';

export const UserRegistrationPortal: React.FC = () => {
  const { currentUser, signInWithGoogle, setActivePortal, registerNewPatient, registerUserProfile, userProfiles, setActivePatientId, patients } = useMedical();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<UserRole>('PATIENT');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  
  // Professional fields
  const [regNumber, setRegNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');
  
  const [submitted, setSubmitted] = useState(false);

  const currentProfile = currentUser ? userProfiles.find((p: any) => p.googleUserId === ((currentUser as any).id || (currentUser as any).uid)) : null;
  const isPending = currentProfile?.accountStatus === 'PENDING';
  const isRejected = currentProfile?.accountStatus === 'REJECTED';
  

  useEffect(() => {
    if (currentProfile?.accountStatus === 'APPROVED') {
       if (currentProfile.role === 'PATIENT') {
           const uuid = (currentProfile.googleUserId || currentProfile.id) as string;
           const aadhaar = currentProfile.aadhaarHash;
           
           // Find matching patient by ID or Aadhaar/UHID
           const linkedPatient = patients.find(p => p.id === uuid || p.uhid === aadhaar || (aadhaar && p.uhid.includes(aadhaar)));
           
           if (linkedPatient) {
               setActivePatientId(linkedPatient.id);
           } else {
               setActivePatientId(uuid);
           }
           setActivePortal('patient');
       } else {
           setActivePortal(currentProfile.role === 'NURSE' ? 'nurse' : 'er');
       }
    }
  }, [currentProfile, setActivePortal, setActivePatientId, patients]);


  useEffect(() => {
    if (currentUser && !fullName) {
      setFullName((currentUser as any).displayName || currentUser.user_metadata?.full_name || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadhaar.trim()) return;

    try {
      await registerUserProfile({
        ...(currentProfile?.id ? { id: currentProfile.id } : {}),
        googleUserId: ((currentUser as any)?.id || (currentUser as any)?.uid),
        fullName: fullName,
        email: email,
        phone: mobile,
        aadhaarHash: btoa(aadhaar.trim()),
        role: role,
        accountStatus: 'PENDING'
      });
      setSubmitted(true);
    } catch(err: any) {
      if (err?.message?.includes('duplicate key') || err?.code === '23505' || (err?.status === 409)) {
        alert('This Aadhaar Number is already registered in the system.');
      } else {
        alert('Failed to submit application. Make sure Supabase is connected.');
      }
    }
  };

  // Step 1: Login / Intro Screen
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto mt-20 bg-white rounded-3xl border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Globe className="w-8 h-8 text-blue-600" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">NADIAYU</h1>
        <p className="text-slate-600 text-center mb-8">Universal Healthcare Identity & Access Portal</p>
        
        <div className="w-full space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            Log in with Google
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            onClick={() => {
              setIsRegistering(true);
              signInWithGoogle(); // Still triggers Google for MVP identity
            }}
            className="w-full py-3.5 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            Create New Account
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Pending Approval for Professionals
  if (submitted || isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto mt-20 bg-white rounded-3xl border border-slate-200 shadow-sm text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mb-5 text-amber-600">
          <UserCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Pending Approval</h2>
        <p className="text-slate-600 mb-6">
          Your application is currently pending admin review. You will be granted access once approved by the Hospital Administration.
        </p>
        <div className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-left text-sm text-slate-700 mb-6 font-mono">
          <div>Status: <span className="font-bold text-amber-600">UNDER_REVIEW</span></div>
          <div>Role: {role}</div>
          <div>Reg No: {regNumber}</div>
        </div>
        <button
          onClick={() => setActivePortal('landing')}
          className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }


  if (isRejected && !submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto mt-20 bg-red-50 rounded-3xl border border-red-200 shadow-sm text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-red-100 border border-red-200 rounded-full flex items-center justify-center mb-5 text-red-600">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-red-900 mb-2">Application Rejected</h2>
        <p className="text-red-700 mb-6">
          Your previous application was rejected by the admin team. Please verify your details and try applying again.
        </p>
        <button
          onClick={() => {
            // Need to allow resubmission
            // We would usually delete the old profile or update it. For now just let them see the form
          }}
          className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
        >
          Re-apply Now
        </button>
      </div>
    );
  }

  // Step 2: Registration Form (Post-Google Auth)
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 mt-8 animate-in fade-in duration-300">
      
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
          <img src={(currentUser as any).photoURL || currentUser.user_metadata?.avatar_url || undefined} alt="Profile" className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Complete Profile Setup</h1>
            <p className="text-sm text-slate-600">Signed in as {currentUser.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Basic Identity</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-slate-50"
                  placeholder="+91"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                readOnly
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 bg-slate-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Aadhaar Number
              </label>
              <p className="text-xs text-slate-500 mb-2">Used strictly for unique identity verification. Never shared publicly.</p>
              <input
                type="text"
                required
                placeholder="XXXX XXXX XXXX"
                value={aadhaar}
                onChange={e => setAadhaar(e.target.value)}
                className="w-full border-2 border-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-900 font-mono tracking-widest bg-emerald-50/30 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Select Role</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'PATIENT', label: 'Patient', icon: '👤' },
                { id: 'DOCTOR', label: 'Doctor', icon: '🩺' },
                { id: 'NURSE', label: 'Nurse', icon: '⚕️' },
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as UserRole)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                    role === r.id 
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <span className="font-bold text-sm">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Professional Context Fields */}
          {role !== 'PATIENT' && (
            <div className="space-y-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                Professional Credentials
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    {role === 'DOCTOR' ? 'Medical Reg No.' : 'Nursing Reg No.'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regNumber}
                    onChange={e => setRegNumber(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-slate-50"
                  />
                </div>
                
                {role === 'DOCTOR' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      required
                      value={specialization}
                      onChange={e => setSpecialization(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-slate-50"
                      placeholder="e.g. Cardiology"
                    />
                  </div>
                )}

                <div className={role === 'DOCTOR' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Hospital / Clinic Name</label>
                  <input
                    type="text"
                    required
                    value={hospital}
                    onChange={e => setHospital(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-slate-50"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              className="w-full py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Create Account</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
