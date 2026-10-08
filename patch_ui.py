import codecs

with codecs.open('src/components/portals/ERDoctorPortal.tsx', 'r', 'utf-8') as f:
    content = f.read()

# Update handleFileUpload
new_handle = """          setUploadedRxImage(imgSrc);
          setRawExtractedText(JSON.stringify(res, null, 2));

          // Append to existing manually typed drugs
          setRxDrugs(p => {
            const filtered = p.filter(d => d.name.trim());
            return [...filtered, ...extractedDrugs];
          });

          if (res.allergies && res.allergies.length > 0) {
            setRxAllergies(p => {
              const filtered = p.filter(a => a.allergen.trim());
              const newAllergies = res.allergies.map((a: string) => ({ id: uid(), allergen: a, reaction: '', severity: '' }));
              return [...filtered, ...newAllergies];
            });
          }

          if (res.accident_history && res.accident_history.length > 0) {
            const historyStr = res.accident_history.join('\\n');
            setRxPastHistory(prev => prev ? `${prev}\\n[Scanned History]:\\n${historyStr}` : historyStr);
          }

          if (res.doctor_notes) {
            setRxNotes(prev => prev ? `${prev}\\n[Scanned Notes]: ${res.doctor_notes}` : res.doctor_notes);
          }"""

old_handle_start = '          setUploadedRxImage(imgSrc);'
old_handle_end = 'res.doctor_notes);\\n          }'

start_idx = content.find(old_handle_start)
end_idx = content.find(old_handle_end) + len(old_handle_end)

if start_idx != -1 and end_idx > start_idx:
    content = content[:start_idx] + new_handle + content[end_idx:]


# Inject AI Scan Preview UI
preview_ui = """        {/* AI Scan Preview Section */}
        {uploadedRxImage && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                AI Scan Results
              </div>
              <button 
                onClick={() => {
                  setUploadedRxImage(null);
                  setRawExtractedText('');
                }}
                className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
              >
                Clear Scan
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Uploaded Image */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-64 flex items-center justify-center">
                <img src={uploadedRxImage} alt="Scanned Rx" className="max-w-full max-h-full object-contain" />
              </div>
              
              {/* Raw Extracted Text */}
              <div className="flex flex-col h-64">
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Raw Extraction (Editable)</div>
                <textarea
                  value={rawExtractedText}
                  onChange={(e) => setRawExtractedText(e.target.value)}
                  className="flex-1 w-full bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-xl shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-orange-500" />
              The AI automatically populated the form below. Please verify and edit if needed.
            </p>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm mb-6">"""

target_div = '<div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm mb-6">'
content = content.replace(target_div, preview_ui, 1)

with codecs.open('src/components/portals/ERDoctorPortal.tsx', 'w', 'utf-8') as f:
    f.write(content)
