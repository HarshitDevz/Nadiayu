import sys
import re

with open('src/components/portals/PatientDashboardPortal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

qr_block = """
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
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://nadiayu.ai/scan/${activePatient.uhid}`} 
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
              href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://nadiayu.ai/scan/${activePatient.uhid}`}
              download={`Emergency_QR_${activePatient.uhid}.png`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary-blue py-2.5 px-5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download HQ Image</span>
            </a>
            <button 
              onClick={() => setActivePortal('scan')}
              className="btn-secondary-paper py-2.5 px-5 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <Scan className="w-4 h-4 text-slate-600" />
              <span>Test Scanner Gateway</span>
            </button>
          </div>
        </div>
      </motion.div>
"""

content = content.replace('{/* TWO COLUMNS: CONTACTS & MEDICAL RECORD SUMMARY */}', qr_block + '\n      {/* TWO COLUMNS: CONTACTS & MEDICAL RECORD SUMMARY */}')

if 'Scan' not in content:
    content = content.replace('QrCode,', 'QrCode,\n  Scan,')

with open('src/components/portals/PatientDashboardPortal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
