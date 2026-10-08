import re

with open('src/components/portals/UserRegistrationPortal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add registerUserProfile to destructuring
content = content.replace('const { currentUser, signInWithGoogle, setActivePortal, registerNewPatient } = useMedical();', 'const { currentUser, signInWithGoogle, setActivePortal, registerNewPatient, registerUserProfile, userProfiles } = useMedical();')

# Find current profile
current_prof_code = """
  const currentProfile = currentUser ? userProfiles.find((p: any) => p.googleUserId === currentUser.uid) : null;
  const isPending = currentProfile?.accountStatus === 'PENDING';
  const isRejected = currentProfile?.accountStatus === 'REJECTED';
  
  useEffect(() => {
    if (currentProfile?.accountStatus === 'APPROVED') {
       setActivePortal(currentProfile.role === 'PATIENT' ? 'patient' : currentProfile.role === 'NURSE' ? 'nurse' : 'er');
    }
  }, [currentProfile, setActivePortal]);
"""
content = content.replace('const [submitted, setSubmitted] = useState(false);', 'const [submitted, setSubmitted] = useState(false);\n' + current_prof_code)

# Handle Submit
handle_submit_old = """    // Simulate backend checks
    const aadhaarHash = btoa(aadhaar.trim()); // Mock hash
    const internalUuid = `uuid-${Date.now()}`;

    // Mock Registration Flow
    if (role === 'PATIENT') {
      // Patient auto-approved MVP logic
      await registerNewPatient({
        uhid: aadhaar.trim(),
        name: fullName,
        age: 30, // Default mock
        gender: 'MALE',
        bloodGroup: 'O +ve',
        bloodGroupDetails: 'O +ve (MVP Registered)',
        isUniversalDonor: false,
        photoUrl: currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        emergencyStatus: 'STABLE_GREEN',
        primaryDiagnosis: 'Healthy',
        secondaryConditions: [],
        organDonor: false,
        allergies: [],
        activeMedications: [],
        emergencyContacts: [],
      });
      // Patient goes straight to active dashboard
      setActivePortal('patient');
    } else {
      // Doctor or Nurse is PENDING
      setSubmitted(true);
    }"""
handle_submit_new = """    try {
      await registerUserProfile({
        googleUserId: currentUser?.uid,
        fullName: fullName,
        email: email,
        phone: mobile,
        aadhaarHash: btoa(aadhaar.trim()),
        role: role,
        accountStatus: 'PENDING'
      });
      setSubmitted(true);
    } catch(err) {
      alert('Failed to submit application. Make sure Supabase is connected.');
    }"""
content = content.replace(handle_submit_old, handle_submit_new)

# Step 3 render
step3_old = 'if (submitted) {'
step3_new = 'if (submitted || isPending) {'
content = content.replace(step3_old, step3_new)
content = content.replace("Your {role === 'DOCTOR' ? 'Doctor' : 'Nurse'} registration has been submitted. The administration team is reviewing your credentials.", "Your application is currently pending admin review. You will be granted access once approved by the Hospital Administration.")

# Step 4: Rejected render
rejected_render = """
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
"""
content = content.replace('  // Step 2: Registration Form (Post-Google Auth)', rejected_render + '\n  // Step 2: Registration Form (Post-Google Auth)')


with open('src/components/portals/UserRegistrationPortal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
