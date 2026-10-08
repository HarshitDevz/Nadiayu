import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '../../lib/supabase';

import { 
  Heart, 
  PhoneCall, 
  AlertTriangle, 
  MapPin, 
  ShieldCheck, 
  Radio, 
  Activity, 
  Share2, 
  QrCode, 
  CheckCircle2, 
  Volume2, 
  Sparkles,
  VolumeX,
  UserPlus,
  Lock,
  Send,
  Bell,
  EyeOff,
  Clock,
  Smartphone,
  Scan
} from 'lucide-react';
import { useMedical } from '../../context/MedicalContext';
import { motion, AnimatePresence } from 'motion/react';
import { NadiayuLogo, NadiayuEmblem } from '../NadiayuLogo';
import { DigitalMedicalPass } from '../DigitalMedicalPass';
import { BorderBeam } from '../ui/BorderBeam';
import { BadgePulse } from '../ui/BadgePulse';
import { ShimmerButton } from '../ui/ShimmerButton';
import { SpotlightCard } from '../ui/SpotlightCard';
import { MagneticButton } from '../ui/MagneticButton';
import { AmbientGridMesh } from '../ui/AmbientGridMesh';
import { BlurFade } from '../ui/BlurFade';

export const BystanderScanPortal: React.FC<{ forcePreview?: boolean }> = ({ forcePreview = false }) => {
  const { 
    activePatient, 
    sosActive, 
    sosEtaMinutes, 
    triggerSOSBeacon, 
    cancelSOS,
    setActivePortal,
    scanNotifications,
    notifyEmergencyContactsOnScan 
  } = useMedical();

  const [cprMetronomeActive, setCprMetronomeActive] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(forcePreview);
  const [scannedPatient, setScannedPatient] = useState<any>(null);
  const [scanError, setScanError] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cprCount, setCprCount] = useState<number>(0);
  const [bystanderAddress, setBystanderAddress] = useState<string>('National Highway 48, KM 32.4 (GPS Locked: 28.4595° N, 77.0266° E)');
  const [lastNotificationSent, setLastNotificationSent] = useState<boolean>(false);
  const [recentNotificationMsg, setRecentNotificationMsg] = useState<string | null>(null);

  // Auto-dispatch notification to emergency contacts when public scan occurs
  useEffect(() => {
    if (activePatient && hasScanned && !lastNotificationSent) {
      const log = notifyEmergencyContactsOnScan(displayPatient?.id, bystanderAddress);
      if (log) {
        setLastNotificationSent(true);
        setRecentNotificationMsg(`SMS & Emergency Ping sent to ${log.contactName} (${log.contactPhone}) at ${log.timestamp}`);
      }
    }
  }, [displayPatient?.id, hasScanned]);

  // 110 BPM Metronome timer (110 beats/min = 545ms interval)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cprMetronomeActive) {
      interval = setInterval(() => {
        setCprCount(prev => (prev >= 30 ? 1 : prev + 1));
      }, 545);
    } else {
      setCprCount(0);
    }
    return () => clearInterval(interval);
  }, [cprMetronomeActive]);

  const handleManualResendNotification = () => {
    if (!activePatient) return;
    const log = notifyEmergencyContactsOnScan(displayPatient?.id, bystanderAddress);
    if (log) {
      setRecentNotificationMsg(`Updated GPS Alert dispatched to ${log.contactName} (${log.contactPhone}) at ${log.timestamp}`);
      setTimeout(() => setRecentNotificationMsg(null), 5000);
    }
  };


  const handleQRScan = async (result: any) => {
    if (!result || !result.length) return;
    const rawValue = result[0].rawValue;
    // Extract UHID from URL or raw text
    let uhid = rawValue;
    if (rawValue.includes('nadiayu.ai/scan/')) {
      uhid = rawValue.split('nadiayu.ai/scan/')[1];
    } else if (rawValue.includes('/scan/')) {
      uhid = rawValue.split('/scan/').pop();
    }
    
    setIsScanning(true);
    setScanError('');
    
    try {
      const { data, error } = await supabase.from('patients').select('*').eq('uhid', uhid).single();
      if (error || !data) throw new Error('Patient not found in database.');
      
      setScannedPatient(data);
      setHasScanned(true);
      
      // Auto-dispatch notification
      if (!lastNotificationSent) {
        notifyEmergencyContactsOnScan(data.id, bystanderAddress);
        setLastNotificationSent(true);
      }
    } catch (err: any) {
      setScanError('Invalid QR Code or Patient Not Found.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanSimulation = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 1500); // simulate a 1.5s scan
  };



  const displayPatient = scannedPatient || activePatient;
  if (!hasScanned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center w-full max-w-md space-y-6">
          <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto flex items-center justify-center text-slate-500 mb-4">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="heading text-xl font-bold text-[#0F172A]">Scan Emergency Pass</h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Hold the patient's physical Nadiayu QR code up to the camera to view their critical medical emergency profile.
          </p>
          
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[300px]">
            <Scanner onScan={handleQRScan} />
            {isScanning && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold text-slate-800">Searching Database...</span>
                </div>
              </div>
            )}
          </div>
          
          {scanError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm font-bold rounded-xl border border-red-200">
              {scanError}
            </div>
          )}

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={() => setActivePortal('landing')}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const primaryContact = displayPatient?.emergencyContacts?.[0] || {
    name: 'Emergency Guardian',
    relationship: 'Family ICE',
    phone: '+91 98110 92811'
  };

  // Only critical/severe medication allergies for public safety
  const criticalAllergies = (displayPatient?.allergies || []).filter(
    a => a.severity === 'ANAPHYLACTIC_DEADLY' || a.severity === 'SEVERE' || a.category === 'Antibiotic' || a.category === 'Analgesic'
  );

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-200">
      
      {/* PUBLIC GOOD SAMARITAN EMERGENCY BANNER WITH ROLE PRIVACY NOTICE */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="paper-card border-2 border-red-500 p-6 sm:p-7 shadow-sm bg-white rounded-3xl relative overflow-hidden"
      >
        <BorderBeam size={220} duration={8} colorFrom="#DC2626" colorTo="#F87171" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex p-2.5 rounded-2xl bg-red-50 border border-red-200 shrink-0">
              <NadiayuEmblem size={52} />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600 text-white text-sm mono uppercase font-extrabold tracking-wider mb-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                PUBLIC GOOD SAMARITAN EMERGENCY PASS
              </div>
              <h1 className="heading text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                Life-Saving Emergency Pass Active
              </h1>
              <p className="text-sm sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                You are viewing the public emergency pass. As per privacy mandates, only essential life-saving data (<strong>Name, Age, Gender, Blood Group &amp; Critical Allergies</strong>) is visible.
              </p>
            </div>
          </div>

          {/* Quick Blood Group Badge */}
          <div className="bg-red-50 border-2 border-red-500 text-red-600 rounded-3xl px-6 py-4 text-center shrink-0 shadow-xs relative overflow-hidden">
            <div className="text-sm mono uppercase font-bold text-red-700">PATIENT BLOOD</div>
            <div className="text-3xl sm:text-4xl font-black mono">{displayPatient?.bloodGroup || 'Unknown'}</div>
            <div className="text-[9px] mono mt-1 text-slate-700 font-semibold">
              {displayPatient?.isUniversalDonor ? 'Universal Red Cell' : 'Documented Antigen'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* REAL-TIME EMERGENCY CONTACT NOTIFICATION DISPATCH CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-400 rounded-3xl shadow-sm space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black mono uppercase tracking-wider text-emerald-900 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  AUTOMATIC EMERGENCY NOTIFICATION DISPATCHED
                </span>
                <span className="text-sm mono text-emerald-700 font-bold hidden sm:inline">
                  Status: DELIVERED
                </span>
              </div>
              <p className="text-sm text-slate-700 mt-1 font-medium">
                Family &amp; ICE Contacts were instantly notified when this QR Pass was scanned.
              </p>
            </div>
          </div>

          <button
            onClick={handleManualResendNotification}
            className="self-start sm:self-auto bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl text-sm font-bold mono shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600" />
            <span>Send GPS Update to Family</span>
          </button>
        </div>

        <div className="p-3.5 bg-white/90 rounded-2xl border border-emerald-200 text-sm mono text-slate-800 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-700 pb-1 border-b border-slate-100">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              Notified: <strong className="text-[#0F172A]">{primaryContact.name} ({primaryContact.phone})</strong>
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Clock className="w-3 h-3" />
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm text-slate-700 pt-1 leading-relaxed">
            &ldquo;URGENT: Nadiayu Emergency Pass for <strong>{displayPatient?.name || 'Unknown'}</strong> ({displayPatient?.bloodGroup || 'Unknown'}) was scanned at <strong>{bystanderAddress}</strong>. Emergency responders are viewing basic life-saving medical details.&rdquo;
          </p>
        </div>
      </motion.div>

      {/* PUBLIC PASS HIDDEN FOR PRIVACY - ONLY SHOWING ESSENTIALS BELOW */}

      {/* 1-TAP INSTANT EMERGENCY CALL BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Call Ambulance 108 / 911 */}
        <a
          href="tel:108"
          className="group bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-3xl p-6 shadow-md shadow-red-500/20 flex items-center justify-between transition-all duration-150 relative overflow-hidden"
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="text-sm mono uppercase font-black tracking-wider text-white/90">
                1-TAP CALL STAT
              </div>
              <div className="heading text-xl font-extrabold text-white">Call Ambulance 108</div>
              <div className="text-sm text-white/80">Emergency Medical Dispatch</div>
            </div>
          </div>
        </a>

        {/* Call ICE Emergency Contact */}
        <a
          href={`tel:${primaryContact.phone}`}
          className="group bg-red-50/80 hover:bg-red-100/80 border-2 border-red-200 text-red-800 rounded-3xl p-6 shadow-xs flex items-center justify-between transition-all duration-150"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-red-200 flex items-center justify-center shrink-0 text-red-600">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm mono uppercase font-bold text-red-700">
                CALL IN CASE OF EMERGENCY (ICE)
              </div>
              <div className="heading text-lg font-extrabold text-[#0F172A] truncate max-w-[170px]">
                {primaryContact.name}
              </div>
              <div className="text-sm text-slate-700 mono font-medium">{primaryContact.phone}</div>
            </div>
          </div>
        </a>

        {/* SOS Telemetry Broadcast */}
        <SpotlightCard
          spotlightColor="rgba(220, 38, 38, 0.08)"
          className="p-6 border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
              <Radio className={`w-4 h-4 ${sosActive ? 'text-red-600 animate-spin' : 'text-slate-600'}`} />
              <span>GPS Beacon Dispatch</span>
            </div>
            {sosActive ? (
              <BadgePulse color="red" label="BROADCASTING" size="sm" />
            ) : (
              <BadgePulse color="emerald" label="READY" size="sm" />
            )}
          </div>

          <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">
            {sosActive ? `Ambulance unit dispatched (ETA: ~${sosEtaMinutes} mins)` : 'Transmits precise coordinates to regional emergency centers.'}
          </p>

          <button
            onClick={() => {
              if (sosActive) cancelSOS();
              else triggerSOSBeacon(bystanderAddress);
            }}
            className={`w-full mt-4 py-3 px-3 rounded-2xl text-sm font-bold transition-all shadow-xs cursor-pointer ${
              sosActive
                ? 'bg-slate-100 hover:bg-slate-200 text-[#0F172A] border border-slate-200'
                : 'btn-primary-crimson shadow-md shadow-red-500/20'
            }`}
          >
            {sosActive ? 'Cancel Active SOS' : 'Trigger SOS GPS Beacon'}
          </button>
        </SpotlightCard>

      </div>

      {/* CPR METRONOME & CRITICAL ALLERGIES TO AVOID FATAL MEDICATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CPR 110 BPM Assistant (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="paper-card p-6 sm:p-7 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="heading text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                    AHA Hands-Only CPR Guidance (110 BPM)
                  </h2>
                  <p className="text-sm text-slate-700">Audio-visual rhythmic metronome for chest compressions</p>
                </div>
              </div>

              <button
                onClick={() => setCprMetronomeActive(!cprMetronomeActive)}
                className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all shadow-xs cursor-pointer ${
                  cprMetronomeActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                }`}
              >
                {cprMetronomeActive ? 'Stop Metronome' : 'Start 110 BPM Metronome'}
              </button>
            </div>

            {/* Metronome visualization */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mono text-lg transition-transform ${
                  cprMetronomeActive ? 'bg-red-600 scale-110 shadow-lg shadow-red-600/30' : 'bg-slate-400'
                }`}>
                  {cprCount}
                </span>
                <span className="heading text-2xl font-black text-[#0F172A]">
                  / 30 Compressions
                </span>
              </div>

              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Push hard and Fast in the center of the chest (5-6 cm deep). Allow full chest recoil between compressions.
              </p>
            </div>
          </div>
        </div>

        {/* Critical Allergies for Paramedics & First Responders (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="paper-card p-6 sm:p-7 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="heading text-sm uppercase tracking-wider text-slate-700 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Critical Allergies to Avoid Fatal Drugs
              </h3>
              <span className="text-sm mono text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-bold border border-red-200">
                Paramedic Alert
              </span>
            </div>

            {criticalAllergies.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 text-sm text-slate-700 text-center">
                No severe drug allergies registered.
              </div>
            ) : (
              <div className="space-y-2.5">
                {criticalAllergies.map(alg => (
                  <div key={alg.id} className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200 text-sm space-y-1">
                    <div className="font-bold text-red-900 flex justify-between items-center">
                      <span className="text-sm">⚠️ {alg.allergen}</span>
                      <span className="mono uppercase font-bold text-sm bg-red-200/80 text-red-900 px-2 py-0.5 rounded-md">
                        {alg.severity.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-red-700">
                      <strong>Reaction:</strong> {alg.reaction}
                    </div>
                    {alg.crossReactivities && alg.crossReactivities.length > 0 && (
                      <div className="text-sm text-slate-600 mono pt-1 border-t border-red-200/60">
                        Cross-allergic to: {alg.crossReactivities.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Explicit Privacy & Confidentiality Shield Notice */}
          <div className="p-4 bg-slate-100/80 border border-slate-200 rounded-3xl text-sm space-y-2 text-slate-600">
            <div className="flex items-center gap-2 font-bold text-[#0F172A] text-sm mono uppercase">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              Patient Confidentiality Policy Enforced
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Detailed hospital consultation notes, 2-week active prescriptions, and past medical history are hidden and restricted to licensed hospital doctors.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
