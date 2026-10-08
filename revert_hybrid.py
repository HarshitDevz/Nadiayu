import codecs
import re

with codecs.open('src/components/portals/ERDoctorPortal.tsx', 'r', 'utf-8') as f:
    content = f.read()

# 1. Remove import
content = content.replace("import { extractPrescriptionWithGemini } from '../../utils/geminiExtractor';\n", '')

# 2. Remove states
states_to_remove = [
    "  const [isExtracting, setIsExtracting] = useState(false);\n",
    "  const fileInputRef = useRef<HTMLInputElement>(null);\n",
    "  const [uploadedRxImage, setUploadedRxImage] = useState<string | null>(null);\n",
    "  const [rawExtractedText, setRawExtractedText] = useState<string>('');\n"
]
for state in states_to_remove:
    content = content.replace(state, '')

# 3. Remove handleFileUpload (we'll just use regex to remove the function)
import re
# Find the start of handleFileUpload
start_idx = content.find('  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {')
if start_idx != -1:
    # Find the next function 'const addDrug = () =>'
    end_idx = content.find('  const addDrug = () =>', start_idx)
    if end_idx != -1:
        content = content[:start_idx] + content[end_idx:]

# 4. Remove AI Scan Preview Section
preview_start = content.find('          {/* AI Scan Preview Section */}')
if preview_start != -1:
    preview_end = content.find('            {/* ── ALLERGIES SECTION ── */}')
    if preview_end != -1:
        # Also remove the wrapper div that I added:
        # <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm mb-6 space-y-6">
        wrapper_div_str = '<div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm mb-6 space-y-6">\n\n'
        content = content.replace(wrapper_div_str, '')
        
        # And remove the closing </div> that I added at line 807
        # We can just remove the preview section safely.
        content = content[:preview_start] + content[preview_end:]

        # Find the extra closing </div> right before {/* Submit */}
        extra_div = '            </div>\n            {/* Submit */}'
        content = content.replace(extra_div, '            {/* Submit */}')

# 5. Fix Scan Rx button
old_button = '''          <button 
            onClick={() => {
              if (showRxForm) {
                fileInputRef.current?.click();
              } else {
                setShowRxForm(true);
                setTimeout(() => fileInputRef.current?.click(), 100);
              }
            }}
            disabled={isExtracting}
            className={`w-full md:w-auto text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 justify-center transition-colors cursor-pointer ${isExtracting ? 'bg-slate-600 animate-pulse' : 'bg-slate-900 hover:bg-slate-800'}`}
          >
            {isExtracting ? (
              <span className="flex items-center gap-2">Extracting AI...</span>
            ) : (
              <>
                <span>Scan Rx</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />'''

new_button = '''          <button 
            onClick={() => setActivePortal('hitl')}
            className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 justify-center transition-colors cursor-pointer"
          >
            <span>Scan Rx</span>
            <ArrowRight className="w-4 h-4" />
          </button>'''

content = content.replace(old_button, new_button)

# 6. Revert handleSubmitRx payload back
job_payload = '''    // Also push a record to the prescriptions list so it shows in the patient dashboard
    const newJob = {
      id: `rx-${Date.now()}`,
      patientId: activePatient.id,
      patientName: activePatient.name,
      patientUhid: activePatient.uhid,
      uploadedByNurse: doctorName || 'ER Doctor',
      hospitalUnit: 'ER Clinical Bay',
      uploadedAt: new Date().toISOString(),
      status: 'approved',
      imageUri: '',
      imagePresetType: 'Digital Direct Entry',
      overallConfidence: 100,
      extractedText: 'Direct Digital Entry via ER Doctor Portal',
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
    
    await addPrescriptionDirectly(newJob as any);'''

old_job_payload = job_payload.replace("imageUri: '',", "imageUri: uploadedRxImage || '',").replace("'Direct Digital Entry via ER Doctor Portal'", "rawExtractedText || 'Direct Digital Entry via ER Doctor Portal'")
content = content.replace(old_job_payload, job_payload)

with codecs.open('src/components/portals/ERDoctorPortal.tsx', 'w', 'utf-8') as f:
    f.write(content)
