import React, { useState } from 'react';
import { 
  Heart, 
  QrCode, 
  RotateCw, 
  ShieldCheck, 
  Sparkles, 
  PhoneCall, 
  AlertTriangle, 
  Share2, 
  Download,
  Copy,
  Check
} from 'lucide-react';
import { Patient } from '../types';
import { NadiayuLogo, NadiayuEmblem } from './NadiayuLogo';
import { motion } from 'motion/react';

interface DigitalMedicalPassProps {
  patient: Patient;
  className?: string;
  onTriggerSOS?: () => void;
}

export const DigitalMedicalPass: React.FC<DigitalMedicalPassProps> = ({
  patient,
  className = '',
  onTriggerSOS
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyPassId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(patient.nfcTagUid || patient.uhid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const primaryContact = patient?.emergencyContacts?.[0];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Action Header */}
      <div className="flex items-center justify-between text-sm px-1">
        <span className="font-bold text-[#0F172A] mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          NFC SMART PASS (3D INTERACTIVE)
        </span>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 text-sm bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
        >
          <RotateCw className={`w-3 h-3 transition-transform ${isFlipped ? 'rotate-180' : ''}`} />
          <span>{isFlipped ? 'Show Front Pass' : 'Flip to QR & Directives'}</span>
        </button>
      </div>

      {/* 3D Flip Card Container */}
      <motion.div 
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.985 }}
        className="relative w-full h-[230px] sm:h-[240px] cursor-pointer perspective-1000 select-none group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="w-full h-full relative preserve-3d"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* ================= FRONT OF CARD ================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white shadow-xl border border-slate-700/60 flex flex-col justify-between overflow-hidden backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Background metallic mesh glow */}
            <div className="absolute -right-12 -top-12 w-44 h-44 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-44 h-44 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Header: Brand + NFC Chip */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <NadiayuEmblem size={28} color="#FFFFFF" />
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-wider mono text-white">NADIAYU LIFE PASS</span>
                  <span className="text-[8px] mono text-slate-600">EMERGENCY MEDICAL ID</span>
                </div>
              </div>

              {/* NFC Hologram Chip */}
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[9px] mono font-bold text-slate-200">NFC ACTIVE</span>
              </div>
            </div>

            {/* Middle: Patient Info + Blood Type Pill */}
            <div className="flex items-center justify-between gap-4 relative z-10 my-auto">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 overflow-hidden shrink-0 shadow-inner">
                  <img src={patient.photoUrl} alt={patient?.name || 'Unknown'} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="heading text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[170px] sm:max-w-[210px]">
                    {patient?.name || 'Unknown'}
                  </h3>
                  <div className="text-sm text-slate-300 mono flex items-center gap-2 mt-0.5">
                    <span>{patient?.age || '0'}Y &bull; {patient?.gender || 'U'}</span>
                    <span>&bull;</span>
                    <span>GCS {patient.gcs?.total || 15}/15</span>
                  </div>
                </div>
              </div>

              {/* Blood Group Crest */}
              <div className="bg-red-600/90 border border-red-400 text-white rounded-2xl px-3.5 py-2 text-center shrink-0 shadow-lg shadow-red-600/40">
                <div className="text-[8px] mono font-bold text-red-200 uppercase">BLOOD</div>
                <div className="text-xl sm:text-2xl font-black mono leading-none">{patient?.bloodGroup || 'Unknown'}</div>
              </div>
            </div>

            {/* Bottom Bar: UHID + ICE contact */}
            <div className="flex items-center justify-between text-sm mono border-t border-white/10 pt-2.5 relative z-10 text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">UHID:</span>
                <span className="text-white font-bold">{patient.uhid}</span>
                <button 
                  onClick={handleCopyPassId}
                  className="text-slate-600 hover:text-white transition-colors ml-0.5"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="text-right">
                <span className="text-slate-600">ICE: </span>
                <span className="text-white font-bold">{primaryContact ? primaryContact.phone : '108 Ambulance'}</span>
              </div>
            </div>
          </div>

          {/* ================= BACK OF CARD (FLIPPED) ================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl border border-slate-700/60 flex flex-col justify-between overflow-hidden rotate-y-180 backface-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)' 
            }}
          >
            {/* Header: Emergency Directives & QR */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold mono uppercase tracking-wider text-slate-200">
                  SCAN FOR INSTANT EHR
                </span>
              </div>

              {patient.organDonor && (
                <span className="text-[9px] mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5 text-emerald-400" />
                  ORGAN DONOR
                </span>
              )}
            </div>

            {/* Middle: QR Code + Critical Allergies */}
            <div className="flex items-center justify-between gap-4 my-auto relative z-10">
              {/* Simulated crisp QR box */}
              <div className="w-20 h-20 bg-white p-2 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                <div className="w-full h-full border-2 border-slate-900 rounded-lg flex flex-col items-center justify-center p-1 bg-white">
                  <QrCode className="w-full h-full text-slate-950" />
                </div>
              </div>

              <div className="space-y-1 text-sm text-slate-200 flex-1">
                <div className="text-[9px] mono text-red-400 font-bold uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  Documented Allergies
                </div>
                <div className="text-sm font-semibold text-white truncate">
                  {patient.allergies.length > 0 ? patient.allergies.map(a => a.allergen).join(', ') : 'None Documented'}
                </div>
                <div className="text-sm text-slate-600 mono">
                  NFC Tag: {patient.nfcTagUid || 'UID-7749-EMG'}
                </div>
              </div>
            </div>

            {/* Bottom Bar: Instructions */}
            <div className="flex items-center justify-between text-[9px] mono border-t border-white/10 pt-2 text-slate-600 relative z-10">
              <span>Good Samaritan Law Protected</span>
              <span className="text-emerald-400 font-bold">108 Instant Link</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="flex items-center justify-between text-sm text-slate-700 px-1">
        <span>Tap card anytime to inspect reverse QR matrix</span>
        <span className="mono font-semibold text-blue-600">ISO/IEC 14443 Type A</span>
      </div>
    </div>
  );
};
