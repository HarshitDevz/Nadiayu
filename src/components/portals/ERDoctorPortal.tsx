import React, { useState, useRef } from 'react';
import {
  Stethoscope,
  Pill,
  ArrowRight,
  AlertOctagon,
  Plus,
  Trash2,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  AlertTriangle,
  Send
} from 'lucide-react';
import { useMedical } from '../../context/MedicalContext';
import { extractPrescriptionWithGemini } from '../../utils/geminiExtractor';
import { Medication, Allergy } from '../../types';

// ── helpers ──────────────────────────────────────────────────────────────────
const uid = () => `rx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

interface RxDrug {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  route: string;
  indication: string;
  isHighRisk: boolean;
}

interface RxAllergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'ANAPHYLACTIC_DEADLY' | 'SEVERE' | 'MODERATE';
}

const emptyDrug = (): RxDrug => ({
  id: uid(),
  name: '',
  genericName: '',
  dosage: '',
  frequency: 'OD',
  route: 'Oral',
  indication: '',
  isHighRisk: false,
});

const emptyAllergy = (): RxAllergy => ({
  id: uid(),
  allergen: '',
  reaction: '',
  severity: 'MODERATE',
});

// ── Main Component ────────────────────────────────────────────────────────────
export const ERDoctorPortal: React.FC = () => {
  const {
    patients,
    activePatient,
    setActivePatientId,
    selectPatientByUniqueId,
    setActivePortal,
    updatePatientProfile,
    registerNewPatient,
    addPrescriptionDirectly,
    prescriptions
  } = useMedical();

  // ── existing state ──
  const [patientIdSearchInput, setPatientIdSearchInput] = useState<string>('');
  const [activeHistoryTab, setActiveHistoryTab] = useState<'active_2wk' | 'past_history' | 'past_rx'>('active_2wk');
  const [isLookupMode, setIsLookupMode] = useState(!activePatient);

  // ── prescription form state ──
  const [showRxForm, setShowRxForm] = useState(false);
  const [doctorName, setDoctorName] = useState('Dr. ');
  const [rxDrugs, setRxDrugs] = useState<RxDrug[]>([emptyDrug()]);
  const [rxAllergies, setRxAllergies] = useState<RxAllergy[]>([]);
  const [rxNotes, setRxNotes] = useState('');
  const [rxPastHistory, setRxPastHistory] = useState('');
  const [saving, setSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedRxImage, setUploadedRxImage] = useState<string | null>(null);
  const [rawExtractedText, setRawExtractedText] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // ── new patient form state ──
  const [isRegistering, setIsRegistering] = useState(false);
  const [newPtName, setNewPtName] = useState('');
  const [newPtAge, setNewPtAge] = useState('');
  const [newPtGender, setNewPtGender] = useState('Male');
  const [newPtBlood, setNewPtBlood] = useState('O+');
  const [newPtPhone, setNewPtPhone] = useState('');

  // ── handlers: search ──
  const handlePatientIdSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdSearchInput.trim()) return;
    const found = selectPatientByUniqueId(patientIdSearchInput);
    if (found) {
      setIsLookupMode(false);
      setPatientIdSearchInput('');
    }
  };

  // ── handlers: drugs ──

  const addDrug = () => setRxDrugs(p => [...p, emptyDrug()]);
  const removeDrug = (id: string) => setRxDrugs(p => p.filter(d => d.id !== id));
  const updateDrug = (id: string, field: keyof RxDrug, value: string | boolean) =>
    setRxDrugs(p => p.map(d => d.id === id ? { ...d, [field]: value } : d));

  // ── handlers: allergies ──
  const addAllergy = () => setRxAllergies(p => [...p, emptyAllergy()]);
  const removeAllergy = (id: string) => setRxAllergies(p => p.filter(a => a.id !== id));
  const updateAllergy = (id: string, field: keyof RxAllergy, value: string) =>
    setRxAllergies(p => p.map(a => a.id === id ? { ...a, [field]: value } : a));

  // ── submit: save to Firestore patient record ──
  const handleSubmitRx = async () => {
    if (!activePatient) return;
    if (rxDrugs.every(d => !d.name.trim())) return;

    setSaving(true);

    const newMeds: Medication[] = rxDrugs
      .filter(d => d.name.trim())
      .map(d => ({
        id: uid(),
        name: d.name,
        genericName: d.genericName || d.name,
        dosage: d.dosage,
        frequency: d.frequency,
        route: d.route,
        indication: d.indication || rxNotes,
        prescribingDr: doctorName,
        startedDate: new Date().toISOString().split('T')[0],
        contraindications: [],
        isHighRisk: d.isHighRisk,
      }));

    const newAllergies: Allergy[] = rxAllergies
      .filter(a => a.allergen.trim())
      .map(a => ({
        id: uid(),
        allergen: a.allergen,
        severity: a.severity,
        reaction: a.reaction,
        category: 'Other' as const,
        crossReactivities: [],
      }));

    // Merge into existing patient record and save to Firestore
    await updatePatientProfile({
      activeMedications: [
        ...newMeds,
        ...(activePatient.activeMedications || []),
      ],
      allergies: newAllergies.length
        ? [...newAllergies, ...(activePatient.allergies || [])]
        : activePatient.allergies,
      notes: (rxNotes || rxPastHistory)
        ? `[Dr Rx ${new Date().toLocaleTimeString()}] ${rxPastHistory ? 'Past History: ' + rxPastHistory + ' | ' : ''}${rxNotes}${activePatient.notes ? '\n\n' + activePatient.notes : ''}`
        : activePatient.notes,
    });


    // Also push a record to the prescriptions list so it shows in the patient dashboard
    const newJob = {
      id: `rx-${Date.now()}`,
      patientId: activePatient.id,
      patientName: activePatient.name,
      patientUhid: activePatient.uhid,
      uploadedByNurse: doctorName || 'ER Doctor',
      hospitalUnit: 'ER Clinical Bay',
      uploadedAt: new Date().toISOString(),
      status: 'approved',
      imageUri: uploadedRxImage || '',
      imagePresetType: 'Digital Direct Entry',
      overallConfidence: 100,
      extractedText: rawExtractedText || 'Direct Digital Entry via ER Doctor Portal',
      doctorNotes: rxNotes || 'Digital e-Prescription',
      extractedMedications: newMeds.map(m => ({
        id: m.id,
        parsedName: m.name,
        dosage: m.dosage,
        frequency: m.frequency
      })),
      criticalExtract: {
        allergiesDetected: newAllergies.length > 0,
        pastHistory: rxPastHistory
      },
      ocrStages: []
    };
    
    await addPrescriptionDirectly(newJob as any);
    setSaving(false);
    setSavedSuccess(true);
    // Reset form after 3s
    setTimeout(() => {
      setSavedSuccess(false);
      setShowRxForm(false);
      setRxDrugs([emptyDrug()]);
      setRxAllergies([]);
      setRxNotes('');
      setRxPastHistory('');
    }, 3000);
  };

  const handleRegisterNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPtName.trim() || !newPtAge.trim()) return;

    const generatedUhid = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    await registerNewPatient({
      uhid: generatedUhid,
      name: newPtName,
      age: parseInt(newPtAge) || 30,
      gender: newPtGender,
      bloodGroup: newPtBlood,
      bloodGroupDetails: newPtBlood,
      isUniversalDonor: newPtBlood === 'O-',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      emergencyStatus: 'STABLE_GREEN',
      primaryDiagnosis: 'New Registration',
      secondaryConditions: [],
      organDonor: false,
      nfcTagUid: `NFC-${Math.floor(Math.random() * 9999)}`,
      qrPayload: `https://nadiayu.ai/scan/${generatedUhid}`,
      allergies: [],
      activeMedications: [],
      emergencyContacts: newPtPhone ? [{ name: 'Primary Contact', phone: newPtPhone, relation: 'Family' }] : [],
      pastMedicalHistory: [],
      vitals: {
        heartRate: 75,
        bloodPressure: '120/80',
        spo2: 98,
        respiratoryRate: 16,
        temperature: 37.0,
        bloodGlucose: 100,
        lastUpdated: 'Just now'
      },
      gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
      interventions: [],
      notes: 'Registered directly from ER Doctor Portal',
      lastIncidentLocation: 'ER Desk',
      incidentTime: new Date().toLocaleTimeString(),
      triageBay: 'OPD-01'
    });

    setIsRegistering(false);
    setPatientIdSearchInput('');
  };

  // ── lookup & empty state ──
  if (!activePatient || isLookupMode) {
    const filteredPatients = patients.filter(p =>
      p.uhid.toLowerCase().includes(patientIdSearchInput.toLowerCase()) ||
      p.name.toLowerCase().includes(patientIdSearchInput.toLowerCase())
    );

    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto mt-12 bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-200">
        <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
          <Stethoscope className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Doctor Lookup Desk</h2>
        <p className="text-sm text-slate-500 text-center mb-6">
          Access the central registry. Ensure the patient is already registered to issue a digital prescription.
        </p>

        {activePatient && (
          <button
            onClick={() => setIsLookupMode(false)}
            className="absolute top-4 right-4 text-sm font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Cancel
          </button>
        )}

        {!isRegistering ? (
          <>
            <form onSubmit={handlePatientIdSearch} className="w-full flex gap-2">
              <input
                type="text"
                placeholder="Search Aadhaar No. or Name..."
                value={patientIdSearchInput}
                onChange={(e) => setPatientIdSearchInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors shadow-sm"
              />
              <button type="submit" className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 cursor-pointer">
                Pull
              </button>
            </form>

            <div className="w-full mt-8">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Patients Database</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{filteredPatients.length} Found</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 no-scrollbar">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-400 mb-3">No registered patients match this ID.</p>
                    <button
                      onClick={() => setIsRegistering(true)}
                      className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      + Register New Patient
                    </button>
                  </div>
                ) : (
                  filteredPatients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setActivePatientId(p.id); setIsLookupMode(false); }}
                      className="w-full text-left p-4 rounded-xl hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-sm flex items-center justify-between transition-all cursor-pointer group"
                    >
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{p.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{p.age}y {p.gender}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aadhaar No.</div>
                        <div className="text-sm font-mono text-slate-600">{p.uhid}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleRegisterNewPatient} className="w-full space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">New Patient Registration</div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
              <input type="text" value={newPtName} onChange={e => setNewPtName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Age</label>
                <input type="number" value={newPtAge} onChange={e => setNewPtAge(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Gender</label>
                <select value={newPtGender} onChange={e => setNewPtGender(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Blood Group</label>
                <select value={newPtBlood} onChange={e => setNewPtBlood(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                  <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Phone</label>
                <input type="tel" value={newPtPhone} onChange={e => setNewPtPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setIsRegistering(false)} className="flex-1 bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors cursor-pointer">
                Register Patient
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">

      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Direct Digital Prescription Desk</div>
        <button
          onClick={() => setIsLookupMode(true)}
          className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          Switch / Lookup Patient
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6 shadow-sm overflow-hidden">
        <div className="shrink-0 flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-xl p-4 min-w-[120px]">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Blood</div>
          <div className="text-3xl font-bold text-red-600 font-mono">{activePatient.bloodGroup}</div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Fast-Track Digital Rx</span>
            {activePatient.organDonor && <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">Donor</span>}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 truncate">{activePatient.name}</h1>
          <div className="text-sm text-slate-500 font-mono mt-1 flex flex-wrap gap-x-3 gap-y-1">
            <span>Aadhaar: {activePatient.uhid}</span>
            <span>{activePatient.age}y {activePatient.gender}</span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => setShowRxForm(prev => !prev)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 justify-center transition-colors cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>{showRxForm ? 'Hide Rx Form' : 'Write Prescription'}</span>
          </button>
          <button
            onClick={() => setActivePortal('pharmacist')}
            className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 justify-center transition-colors cursor-pointer"
          >
            <span>Scan Rx</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setShowRxForm(true); setTimeout(addDrug, 50); }}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 justify-center transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Line</span>
          </button>
        </div>
      </div>

      {/* Allergies Banner */}
      {activePatient.allergies && activePatient.allergies.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 shadow-sm">
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <div className="text-sm font-bold text-red-800">Allergies Detected</div>
            <div className="text-sm text-red-700 mt-1">
              {activePatient.allergies.map(a => a.allergen).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* ── WRITE PRESCRIPTION FORM ────────────────────────────────────── */}
      {showRxForm && (
        <div className="bg-white border border-blue-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Form header */}
          <div className="bg-blue-600 px-6 py-3 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm">Digital Prescription — {activePatient.name}</span>
          </div>

          <div className="p-6 space-y-6">

            {/* Success state */}
            {savedSuccess && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-300 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-emerald-900 font-bold text-sm">Prescription saved to patient record!</p>
                  <p className="text-emerald-600 text-xs mt-0.5 font-mono">Transmitted to Firestore · JSON schema committed</p>
                </div>
              </div>
            )}

            {/* Doctor name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Prescribing Doctor</label>
              <input
                type="text"
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                placeholder="Dr. Full Name · Reg #"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            {/* ── ALLERGIES SECTION ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Allergies / Contraindications
                </label>
                <button
                  onClick={addAllergy}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {rxAllergies.length === 0 ? (
                <div className="text-sm text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-4 py-3 text-center">
                  No new allergies to add — or click <strong>Add</strong> above
                </div>
              ) : (
                <div className="space-y-2">
                  {rxAllergies.map(a => (
                    <div key={a.id} className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <input
                        type="text"
                        value={a.allergen}
                        onChange={e => updateAllergy(a.id, 'allergen', e.target.value)}
                        placeholder="Allergen (e.g. Penicillin)"
                        className="flex-1 bg-white border border-red-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-400 transition-colors min-w-0"
                      />
                      <input
                        type="text"
                        value={a.reaction}
                        onChange={e => updateAllergy(a.id, 'reaction', e.target.value)}
                        placeholder="Reaction"
                        className="flex-1 bg-white border border-red-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-400 transition-colors min-w-0"
                      />
                      <select
                        value={a.severity}
                        onChange={e => updateAllergy(a.id, 'severity', e.target.value)}
                        className="w-28 bg-white border border-red-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="MODERATE">Moderate</option>
                        <option value="SEVERE">Severe</option>
                        <option value="ANAPHYLACTIC_DEADLY">Anaphylactic</option>
                      </select>
                      <button
                        onClick={() => removeAllergy(a.id)}
                        className="p-1 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── MEDICINES SECTION ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5" />
                  Medicines & Dosages
                </label>
                <button
                  onClick={addDrug}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Line
                </button>
              </div>

              <div className="space-y-3">
                {rxDrugs.map((d, i) => (
                  <div key={d.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    {/* Row 1: Name + Generic + High Risk toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 w-6 shrink-0">Rx{i + 1}</span>
                      <input
                        type="text"
                        value={d.name}
                        onChange={e => updateDrug(d.id, 'name', e.target.value)}
                        placeholder="Brand / Medicine name"
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-colors min-w-0"
                      />
                      <input
                        type="text"
                        value={d.genericName}
                        onChange={e => updateDrug(d.id, 'genericName', e.target.value)}
                        placeholder="Generic name"
                        className="w-36 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                      />
                      <label className="flex items-center gap-1 text-xs text-red-600 font-semibold cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={d.isHighRisk}
                          onChange={e => updateDrug(d.id, 'isHighRisk', e.target.checked)}
                          className="accent-red-500 cursor-pointer"
                        />
                        High Risk
                      </label>
                      {rxDrugs.length > 1 && (
                        <button
                          onClick={() => removeDrug(d.id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {/* Row 2: Dosage / Frequency / Route / Indication */}
                    <div className="flex items-center gap-2 pl-8">
                      <input
                        type="text"
                        value={d.dosage}
                        onChange={e => updateDrug(d.id, 'dosage', e.target.value)}
                        placeholder="Dose (e.g. 500 mg)"
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-colors min-w-0"
                      />
                      <select
                        value={d.frequency}
                        onChange={e => updateDrug(d.id, 'frequency', e.target.value)}
                        className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none transition-colors cursor-pointer"
                      >
                        {['OD', 'BD', 'TDS', 'QID', 'STAT', 'SOS', 'PRN'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                      <select
                        value={d.route}
                        onChange={e => updateDrug(d.id, 'route', e.target.value)}
                        className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none transition-colors cursor-pointer"
                      >
                        {['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhaled', 'Rectal', 'Sublingual'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={d.indication}
                        onChange={e => updateDrug(d.id, 'indication', e.target.value)}
                        placeholder="Indication (optional)"
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-colors min-w-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past History */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Past Medical History
              </label>
              <textarea
                value={rxPastHistory}
                onChange={e => setRxPastHistory(e.target.value)}
                rows={2}
                placeholder="e.g. Hypertension x 10 yrs, Appendectomy in 2015..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none mb-6"
              />
            </div>

            {/* Clinical Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Clinical Notes / Instructions
              </label>
              <textarea
                value={rxNotes}
                onChange={e => setRxNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Avoid NSAIDs. Monitor renal function. Follow-up in 5 days."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"
              />
            </div>

            {/* JSON Preview (read-only mini preview) */}
            {rxDrugs.some(d => d.name.trim()) && (
              <div className="bg-slate-900 rounded-xl px-4 py-3 overflow-x-auto">
                <div className="text-slate-400 text-xs font-mono mb-1">JSON preview (what gets saved to Firestore):</div>
                <pre className="text-emerald-400 text-xs font-mono leading-relaxed">
                  {JSON.stringify({
                    prescribingDr: doctorName,
                    issuedAt: new Date().toISOString(),
                    patientUhid: activePatient.uhid,
                    medications: rxDrugs.filter(d => d.name).map(d => ({
                      name: d.name,
                      genericName: d.genericName || d.name,
                      dosage: d.dosage,
                      frequency: d.frequency,
                      route: d.route,
                      indication: d.indication,
                      isHighRisk: d.isHighRisk,
                    })),
                    newAllergies: rxAllergies.filter(a => a.allergen).map(a => ({
                      allergen: a.allergen,
                      reaction: a.reaction,
                      severity: a.severity,
                    })),
                    pastHistory: rxPastHistory,
                    notes: rxNotes,
                  }, null, 2)}
                </pre>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmitRx}
              disabled={saving || savedSuccess || rxDrugs.every(d => !d.name.trim())}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving to patient record…
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Prescription to Patient DB
                </>
              )}
            </button>

          </div>
        </div>
      )}

      {/* ── HISTORY TABS ──────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveHistoryTab('active_2wk')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium shrink-0 transition-colors cursor-pointer ${activeHistoryTab === 'active_2wk' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Active Regimen ({(() => {
              const seenIds = new Set<string>();
              const dedupedRx = prescriptions
                .filter(p => p.patientId === activePatient.id && p.status === 'approved')
                .filter(p => { if (seenIds.has(p.id)) return false; seenIds.add(p.id); return true; })
                .slice(0, 2);
              return (activePatient.activeMedications?.length || 0) +
                dedupedRx.flatMap(p => p.extractedMedications).length;
            })()})
          </button>
          <button
            onClick={() => setActiveHistoryTab('past_history')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium shrink-0 transition-colors cursor-pointer ${activeHistoryTab === 'past_history' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Past History ({activePatient.pastMedicalHistory?.length || 0})
          </button>
          <button
            onClick={() => setActiveHistoryTab('past_rx')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium shrink-0 transition-colors cursor-pointer ${activeHistoryTab === 'past_rx' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Archived Rx ({(activePatient.pastPrescriptions || activePatient.pastPrescriptionHistory)?.length || 0})
          </button>
        </div>

        {activeHistoryTab === 'active_2wk' && (() => {
          // Deduplicate prescriptions by id, keep last 2 uploads only
          const seen = new Set<string>();
          const approvedRx = prescriptions
            .filter(p => p.patientId === activePatient.id && p.status === 'approved')
            .filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; })
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
            .slice(0, 2);

          const directMeds = (activePatient.activeMedications || []);
          const hasAnything = approvedRx.length > 0 || directMeds.length > 0;

          if (!hasAnything) {
            return <div className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-xl">No active medications.</div>;
          }

          const formatDate = (iso: string) => {
            try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
            catch { return iso; }
          };

          return (
            <div className="space-y-4">
              {approvedRx.map(rx => (
                rx.extractedMedications.length > 0 && (
                  <div key={rx.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{formatDate(rx.uploadedAt)}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-semibold text-slate-500">{rx.hospitalUnit}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-400">By: {rx.uploadedByNurse}</span>
                    </div>
                    <div className="space-y-1.5">
                      {rx.extractedMedications.map(m => (
                        <div key={m.id} className="p-3 bg-slate-50 rounded-xl flex justify-between border border-slate-100">
                          <div>
                            <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                              <Pill className="w-3.5 h-3.5 text-slate-400" /> {m.parsedName}
                            </div>
                            {(m.dosage || m.frequency) && (
                              <div className="text-xs text-slate-500 mt-0.5">{[m.dosage, m.frequency].filter(Boolean).join(' • ')}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}

              {directMeds.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Direct Entry</span>
                    <span className="text-xs text-slate-400">· ER Doctor Portal</span>
                  </div>
                  <div className="space-y-1.5">
                    {directMeds.map(med => (
                      <div key={med.id} className="p-3 bg-slate-50 rounded-xl flex justify-between border border-slate-100">
                        <div>
                          <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                            <Pill className="w-3.5 h-3.5 text-slate-400" /> {med.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{[med.dosage, med.frequency, med.route].filter(Boolean).join(' • ')}</div>
                          {med.prescribingDr && <div className="text-xs text-slate-400 mt-0.5">By: {med.prescribingDr}</div>}
                        </div>
                        {med.isHighRisk && <div className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded border border-red-200 self-start">High Risk</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {activeHistoryTab === 'past_history' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medical History</h3>
              {(!activePatient.pastMedicalHistory || activePatient.pastMedicalHistory.length === 0) ? (
                <div className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-xl">No past history recorded.</div>
              ) : (
                activePatient.pastMedicalHistory.map(pmh => (
                  <div key={pmh.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-slate-900 text-sm">{pmh.department || pmh.condition}</div>
                      <div className="text-xs text-slate-500 font-mono">{pmh.visitDate || pmh.diagnosedYear}</div>
                    </div>
                    <div className="text-sm text-slate-600 mt-2">{pmh.diagnosis || pmh.condition}</div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Allergies</h3>
              {(!activePatient.allergies || activePatient.allergies.length === 0) ? (
                <div className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-xl">No known allergies.</div>
              ) : (
                activePatient.allergies.map(a => (
                  <div key={a.id} className="p-4 bg-red-50/50 rounded-xl border border-red-100 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-red-900 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" /> {a.allergen}
                      </div>
                      <div className="text-sm text-red-700 mt-1">Reaction: {a.reaction}</div>
                    </div>
                    {a.severity && <div className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded border border-red-200">{a.severity}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeHistoryTab === 'past_rx' && (
          <div className="space-y-2">
            {(!(activePatient.pastPrescriptions || activePatient.pastPrescriptionHistory) || (activePatient.pastPrescriptions || activePatient.pastPrescriptionHistory)!.length === 0) ? (
              <div className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-xl">No past prescriptions.</div>
            ) : (
              (activePatient.pastPrescriptions || activePatient.pastPrescriptionHistory)!.map(pph => (
                <div key={pph.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-start border border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{pph.drugName}</div>
                    <div className="text-sm text-slate-500 mt-1">{pph.dosage}</div>
                  </div>
                  <div className="text-xs text-slate-500">{pph.date}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
};
