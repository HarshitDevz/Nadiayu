import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  QrCode,
  AlertTriangle,
  X,
  ChevronDown,
  UserPlus,
  Stethoscope,
  Activity,
  Heart,
  ScanLine,
  Pill,
  HeartPulse,
  Cpu,
  Layers,
  Home,
  LogIn,
  LogOut,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { motion, AnimatePresence } from 'motion/react';
import { NadiayuLogo } from './NadiayuLogo';
import { EcgWaveAnimation } from './ui/EcgWaveAnimation';
import { PortalType } from '../types';

export const TopHeader: React.FC = () => {
  const {
    activePortal,
    activePatient,
    patients,
    setActivePatientId,
    audioMuted,
    toggleAudioMute,
    setActivePortal
  } = useMedical();

  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [showPatientSelector, setShowPatientSelector] = useState<boolean>(false);
  const [showPortalMenu, setShowPortalMenu] = useState<boolean>(false);

  // Initialize smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  const navPortals: { id: PortalType; label: string; shortLabel: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'landing', label: 'Home', shortLabel: 'Home', icon: Home },
    { id: 'scan', label: '1. Scan Pass', shortLabel: 'Scan', icon: QrCode },
    { id: 'er', label: '2. ER Doctor', shortLabel: 'ER Bay', icon: Stethoscope },
    { id: 'patient', label: '3. Patient Hub', shortLabel: 'Patient', icon: HeartPulse },
    { id: 'admin', label: '4. Admin', shortLabel: 'Admin', icon: Cpu },
    { id: 'pharmacist', label: '5. Pharmacist', shortLabel: 'Pharmacist', icon: Pill },
    { id: 'patient_sos', label: '6. Patient SOS', shortLabel: 'SOS', icon: AlertTriangle },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0] px-3 sm:px-6 lg:px-10 xl:px-12 transition-all shadow-2xs">
        <div className="w-full mx-auto flex items-center justify-between h-16 gap-3">

          {/* ZONE 1: BRAND LOGO */}
          <div className="flex items-center gap-3 shrink-0">
            <motion.a
              href="#/"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  setActivePortal('landing');
                }
              }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <NadiayuLogo size="md" variant="icon" />
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-[#0F172A] leading-none group-hover:text-blue-600 transition-colors">
                  NadiAyu
                </span>
                <span className="text-sm text-slate-700 font-bold uppercase tracking-wider mt-0.5">
                  Emergency Trauma OS
                </span>
              </div>
            </motion.a>
          </div>

          {/* MOBILE PORTAL SELECTOR BUTTON (Phone / Small Screen Views Only) */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setShowPortalMenu(!showPortalMenu)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span className="capitalize">{activePortal}</span>
              <ChevronDown className="w-3 h-3 text-slate-700" />
            </button>

            <AnimatePresence>
              {showPortalMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1"
                  onClick={() => setShowPortalMenu(false)}
                >
                  <div className="text-sm uppercase mono tracking-wider text-slate-600 px-3 py-1 font-bold">
                    Hospital Stations
                  </div>
                  {navPortals.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePortal === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActivePortal(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-left transition-colors cursor-pointer ${isActive
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ZONE 3: ACTIVE PATIENT SELECTOR & ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Live Patient Quick Selector (Only if patients exist) */}
            {activePatient ? (
              <div className="relative">
                <button
                  onClick={() => activePortal !== 'patient' && setShowPatientSelector(!showPatientSelector)}
                  className={`flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 sm:px-3 py-1.5 text-sm transition-colors ${activePortal !== 'patient' ? 'hover:bg-slate-100 cursor-pointer' : 'cursor-default'}`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${activePatient.emergencyStatus === 'CRITICAL_RED' ? 'bg-red-500 animate-pulse' :
                    activePatient.emergencyStatus === 'URGENT_YELLOW' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                  <span className="font-semibold text-[#0F172A] truncate max-w-[70px] sm:max-w-[110px]">
                    {activePatient.name}
                  </span>
                  {activePortal !== 'patient' && <ChevronDown className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                </button>

                {/* Patient Dropdown Menu */}
                <AnimatePresence>
                  {showPatientSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1"
                      onClick={() => setShowPatientSelector(false)}
                    >
                      <div className="text-sm uppercase mono tracking-wider text-slate-700 px-3 py-1.5 border-b border-slate-100 flex justify-between items-center font-bold">
                        <span>Admitted Patients</span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{patients.length} Cases</span>
                      </div>
                      {patients.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setActivePatientId(p.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors text-sm cursor-pointer ${p.id === activePatient?.id
                            ? 'bg-blue-50/80 border border-blue-100 text-blue-900 font-medium'
                            : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-[#0F172A]">{p.name} ({p.age}y, {p.gender})</span>
                            <span className="text-sm mono text-slate-700">{p.uhid} &bull; Bed {p.triageBay}</span>
                          </div>
                          <div className="text-right">
                            <span className="mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 text-sm">
                              {p.bloodGroup}
                            </span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <a
                href="#/user_registration"
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    setActivePortal('user_registration');
                  }
                }}
                className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl px-3 py-1.5 text-sm font-bold transition-colors shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Register Yourself</span>
              </a>
            )}

            {/* Audio Toggle */}
            <button
              onClick={toggleAudioMute}
              className={`p-2 rounded-xl border text-sm transition-all duration-200 focus-visible:outline-none cursor-pointer ${audioMuted
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                }`}
              title={audioMuted ? 'Unmute Audio Alarms' : 'Mute Audio Alarms'}
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Emergency Pass Button - Only visible in Patient Portal */}
            {activePortal === 'patient' && activePatient && (
              <button
                onClick={() => setShowQRModal(true)}
                className="btn-primary-blue flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                title="Display Emergency Medical Pass"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">QR Pass</span>
              </button>
            )}

            {/* User Profile UI removed per user request */}

          </div>

        </div>
      </header>

      {/* Emergency Medical ID Card Modal */}
      <AnimatePresence>
        {showQRModal && activePatient && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative"
            >
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-5 right-5 text-slate-600 hover:text-slate-700 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm font-bold uppercase mono">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  Emergency Medical Record
                </div>

                <div>
                  <h3 className="heading text-2xl font-bold text-[#0F172A]">{activePatient.name}</h3>
                  <p className="text-sm text-slate-700 mono mt-0.5">Aadhaar No: {activePatient.uhid} &bull; {activePatient.age}y, {activePatient.gender}</p>
                </div>

                {/* QR Code Container */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(activePatient.qrPayload || `https://nadiayu.ai/scan/${activePatient.uhid}`)}`}
                    alt="Patient Emergency Pass QR Code"
                    className="w-44 h-44 mx-auto rounded-lg"
                  />
                  <span className="block text-sm mono text-slate-700 mt-2 font-bold">
                    NFC TAG: {activePatient.nfcTagUid || 'ACTIVE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                    <span className="text-sm uppercase font-bold text-red-600 block">Blood Group</span>
                    <span className="text-base font-extrabold text-red-950 mono">{activePatient.bloodGroup}</span>
                  </div>
                  <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                    <span className="text-sm uppercase font-bold text-amber-600 block">Allergies</span>
                    <span className="text-sm font-bold text-amber-950 line-clamp-1">
                      {activePatient.allergies.map(a => a.allergen).join(', ') || 'NKDA (None)'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-700">
                  Paramedics & bystanders: scan to access immediate resuscitation history and notify next-of-kin.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
