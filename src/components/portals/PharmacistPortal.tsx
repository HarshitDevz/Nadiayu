import React, { useState, useRef } from 'react';
import { Pill, Upload, RefreshCw, CheckCircle2, ShieldCheck, Camera, Sparkles } from 'lucide-react';

import { extractPrescriptionWithGemini, GeminiExtractionResult } from '../../utils/geminiExtractor';
import { useMedical } from '../../context/MedicalContext';

type Phase = 'idle' | 'processing' | 'done';

export const PharmacistPortal = () => {

  const [phase, setPhase] = useState<Phase>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<GeminiExtractionResult | null>(null);
  const [pharmacistNote, setPharmacistNote] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);
  const { activePatient, addPrescriptionDirectly, currentUser } = useMedical();

  const runOCR = async (imgSrc: string) => {
    setPhase('processing');
    setProgress(0);
    setExtractedData(null);

    // Start a fake progress interval for UI
    let pct = 0;
    const tick = setInterval(() => {
      pct += 5;
      if (pct < 90) setProgress(pct);
    }, 150);

    try {
      // Determine mimetype (naive extraction from data url)
      const mimeTypeMatch = imgSrc.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

      // Use the active patient's ID so the scan links directly to their dashboard
      const scanId = activePatient?.id || `scanned-pt-${Math.floor(Math.random() * 10000)}`;

      const res = await extractPrescriptionWithGemini(
        imgSrc,
        mimeType,
        scanId
      );

      setExtractedData(res);
      setProgress(100);
      clearInterval(tick);
      setTimeout(() => setPhase('done'), 400);
    } catch (err) {
      console.error(err);
      clearInterval(tick);
      alert("Extraction failed. Check console.");
      setPhase('idle');
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setPhase('idle');
    setPreview(null);
    setProgress(0);
    setPharmacistNote('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDemoScan = () => {
    alert("Please upload a real prescription image file for Gemini extraction to work.");
  };

  
  const handleRegister = async () => {
    if (!extractedData) return;

    // Map critical_medicines string[] → extractedMedications object[]
    const extractedMedications = (extractedData.critical_medicines || []).map((med, i) => ({
      id: `med-${Date.now()}-${i}`,
      parsedName: med,
      rawText: med,
      dosage: '',
      frequency: '',
      route: '',
      confidence: 90,
      isAllergyConflict: false
    }));

    const newJob = {
      id: `rx-${Date.now()}`,
      patientId: activePatient?.id || extractedData.patient_id || 'unknown',
      patientName: extractedData.patient_name || activePatient?.name || 'Unknown Patient',
      patientUhid: activePatient?.uhid || 'Unknown',
      uploadedByNurse: (currentUser as any)?.displayName || 'Pharmacist',
      hospitalUnit: 'Pharmacy',
      uploadedAt: new Date().toISOString(),
      status: 'approved',
      imageUri: preview || '',
      imagePresetType: 'Digital Pharmacy Upload',
      overallConfidence: 95,
      extractedText: extractedData.exact_prescription_text || JSON.stringify(extractedData),
      doctorNotes: [extractedData.exact_prescription_text, pharmacistNote].filter(Boolean).join('\n\n📝 Pharmacist Note: ') || 'Scanned Prescription',
      extractedMedications,
      criticalExtract: {
        allergiesDetected: (extractedData.allergies || []).length > 0,
        pastHistory: (extractedData.accident_history || []).join('\n'),
        allergies: extractedData.allergies || [],
        accidentHistory: extractedData.accident_history || []
      },
      ocrStages: []
    };

    await addPrescriptionDirectly(newJob as any);
    alert(`Prescription data successfully saved and linked to patient registry!`);
    handleReset();
  };
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4 gap-6">

      {/* ── IDLE: UPLOAD ZONE ── */}
      {phase === 'idle' && (
        <div className="w-full max-w-lg space-y-4">
          {/* Header */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-md overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pharmacist Portal</p>
                <h2 className="text-lg font-extrabold text-white">OCR Parser</h2>
              </div>
            </div>

            {/* Dropzone or Preview */}
            <div className="px-6 py-6 space-y-4">
              {!preview ? (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="hidden"
                    id="rx-upload-input"
                  />

                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-10 text-center cursor-pointer transition-colors group bg-slate-50 hover:bg-blue-50"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 group-hover:border-blue-300 mx-auto flex items-center justify-center mb-3 shadow-sm transition-colors">
                      <Camera className="w-7 h-7 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">Upload Prescription Photo</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, HEIC from mobile camera or scanner</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 font-semibold">OR</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <button
                    id="demo-scan-btn"
                    onClick={handleDemoScan}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md shadow-slate-500/20 transition-all duration-200 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Simulate Scan (Demo Handwritten Slip)
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group bg-slate-100 flex items-center justify-center">
                    <img src={preview} alt="Selected Prescription" className="max-w-full max-h-full object-contain" />
                    <button
                      onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                      className="absolute top-2 right-2 bg-slate-900/70 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  <button
                    onClick={() => runOCR(preview)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/30 transition-all duration-200 cursor-pointer"
                  >
                    <Upload className="w-5 h-5" />
                    Extract Prescription Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PROCESSING ── */}
      {phase === 'processing' && (
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-md overflow-hidden">
          <div className="bg-slate-900 px-6 py-4">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Processing</p>
            <h2 className="text-lg font-extrabold text-white">Extraction in Progress…</h2>
          </div>
          <div className="px-6 py-10 flex flex-col items-center gap-6">
            {preview && (
              <div className="w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 shadow-sm opacity-60">
                <img src={preview} alt="Prescription" className="w-full h-full object-cover" />
              </div>
            )}
            {!preview && (
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            )}

            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-semibold">
                <span>Running Vision OCR & Structuring JSON Schema…</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-slate-500 rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 text-center">
                {progress < 35 ? 'Raster binarization & adaptive deskew…' :
                  progress < 65 ? 'Cursive stroke segmentation & NER extraction…' :
                    progress < 90 ? 'Building JSON schema from clinical entities…' :
                      'Finalizing verification badge…'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── DONE: PARSED OUTPUT ── */}
      {phase === 'done' && (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* Left Column: Original Image */}
          {preview && (
            <div className="w-full h-[600px] bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center relative group sticky top-6">
              <img src={preview} alt="Scanned Prescription" className="max-w-full max-h-full object-contain" />
              <div className="absolute top-4 left-4 bg-slate-900/70 text-white text-[10px] font-bold px-3 py-1.5 rounded backdrop-blur-sm">
                ORIGINAL SCAN
              </div>
            </div>
          )}

          {/* Right Column: Extracted Data */}
          <div className="space-y-4">

            {/* JSON Card */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-md overflow-hidden">
              <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-400 text-xs font-mono ml-2">prescription_extract.json</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="bg-slate-950 px-5 py-4 font-mono text-xs leading-relaxed overflow-x-auto">
                <pre className="text-slate-400">
                  {extractedData ? JSON.stringify({ [extractedData.patient_id]: extractedData }, null, 2) : ''}
                </pre>
              </div>

              {/* Raw Text Line Info */}
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Raw Extracted Text (Line Info)</p>
                <div className="max-h-32 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                  {extractedData?.exact_prescription_text?.split('\n').map((line, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
                      <span className="text-slate-400 font-mono w-4 shrink-0 text-right">{idx + 1}</span>
                      <span className="text-slate-700 break-words font-medium">{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parsed Editable cards */}
              <div className="px-5 py-4 space-y-2.5">
                <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Extracted Medications (Editable)</p>
                {extractedData?.critical_medicines?.map((medName, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-400 focus-within:bg-blue-50/50 transition-colors text-sm">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-1.5 py-0.5 shrink-0 mono">Rx{i + 1}</span>
                    <input
                      type="text"
                      value={medName}
                      onChange={(e) => {
                        const newData = { ...extractedData };
                        if (newData.critical_medicines) {
                          newData.critical_medicines[i] = e.target.value;
                          setExtractedData(newData);
                        }
                      }}
                      className="w-full bg-transparent border-none font-bold text-slate-900 focus:outline-none focus:ring-0 p-0"
                    />
                    <button
                      onClick={() => {
                        const newData = { ...extractedData };
                        if (newData.critical_medicines) {
                          newData.critical_medicines = newData.critical_medicines.filter((_, idx) => idx !== i);
                          setExtractedData(newData);
                        }
                      }}
                      className="text-slate-300 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                      title="Remove"
                    >✕</button>
                  </div>
                ))}

                {/* Add Extra Line */}
                <button
                  onClick={() => {
                    const newData = { ...extractedData! };
                    newData.critical_medicines = [...(newData.critical_medicines || []), ''];
                    setExtractedData(newData);
                  }}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600 text-xs font-bold py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <span className="text-base leading-none">+</span>
                  Add Extra Line
                </button>

                {/* Extra Notes by Pharmacist */}
                <div className="mt-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Pharmacist Notes (Optional)</p>
                  <textarea
                    value={pharmacistNote}
                    onChange={e => setPharmacistNote(e.target.value)}
                    placeholder="e.g. Patient advised to take with food. Check INR before dispensing warfarin."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRegister}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/30 transition-all duration-200 cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                Save & Register Patient
              </button>

              <button
                onClick={handleReset}
                className="w-full text-slate-500 hover:text-slate-700 text-sm font-semibold py-2 transition-colors cursor-pointer"
              >
                Upload Another Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
