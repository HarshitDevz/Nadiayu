import React, { useState, useEffect, useMemo } from 'react';
import { useMedical } from '../../context/MedicalContext';
import {
  AlertTriangle,
  PhoneCall,
  MapPin,
  Radio,
  CheckCircle2,
  Heart,
  User,
  Droplets,
  Phone
} from 'lucide-react';

export const PatientSOSPortal: React.FC = () => {
  const { findPatientByUniqueId, patients } = useMedical();
  const [sosState, setSosState] = useState<'idle' | 'broadcasting' | 'confirmed'>('idle');
  const [scannedId, setScannedId] = useState<string | null>(null);

  useEffect(() => {
    const hashParts = window.location.hash.split('/');
    if (hashParts.length > 2) {
      setScannedId(hashParts[2]);
    }
  }, []);

  const patient = useMemo(() => {
    return scannedId ? findPatientByUniqueId(scannedId) : null;
  }, [scannedId, patients]);

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Invalid Emergency Pass</h2>
          <p className="text-slate-600">The scanned QR code is invalid or the patient profile does not exist.</p>
        </div>
      </div>
    );
  }

  const displayData = {
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    emergencyContact: patient.emergencyContacts?.[0] || { name: 'None Listed', phone: 'N/A' },
    location: 'GPS: Live Location Tracking Enabled'
  };


  const handleSOS = () => {
    setSosState('broadcasting');
    setTimeout(() => setSosState('confirmed'), 2200);
  };

  const handleReset = () => setSosState('idle');

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4 gap-8">

      {/* ── EMERGENCY CARD ── */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
        {/* Header stripe */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-red-100 font-bold uppercase tracking-widest">Emergency Medical Pass</p>
            <h2 className="text-xl font-extrabold text-white mt-0.5">NadiAyu · Public Card</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Patient Info */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Patient</p>
              <p className="text-base font-bold text-slate-900">{displayData.name}</p>
              <p className="text-sm text-slate-500">{displayData.age} yrs · {displayData.gender}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Blood Group */}
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <Droplets className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Blood Group</p>
                <p className="text-lg font-black text-red-700 font-mono">{displayData.bloodGroup}</p>
              </div>
            </div>
            {/* ICE Contact */}
            <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
              <Phone className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">ICE Contact</p>
                <p className="text-sm font-bold text-blue-800 truncate">{displayData.emergencyContact.phone}</p>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 leading-relaxed">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>Public view only. Clinical history, allergies & prescriptions are restricted to licensed medical staff.</span>
          </div>
        </div>
      </div>

      {/* ── SOS BUTTON / STATE ── */}
      {sosState === 'idle' && (
        <button
          id="sos-trigger-btn"
          onClick={handleSOS}
          className="w-full max-w-md bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-lg py-5 rounded-3xl shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Radio className="w-6 h-6 animate-pulse" />
          🚨 TRIGGER EMERGENCY SOS
        </button>
      )}

      {sosState === 'broadcasting' && (
        <div className="w-full max-w-md bg-amber-50 border-2 border-amber-400 rounded-3xl p-6 flex flex-col items-center gap-3 shadow-lg">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-amber-800 font-bold text-base">Broadcasting SOS…</p>
          <p className="text-amber-600 text-sm">Locking GPS · Alerting nearest ER & Ambulance</p>
        </div>
      )}

      {sosState === 'confirmed' && (
        <div className="w-full max-w-md space-y-3">
          {/* Success Banner */}
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-5 flex items-start gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-emerald-900 font-extrabold text-base">GPS Location Broadcasted!</p>
              <p className="text-emerald-700 text-sm mt-0.5">Nearest Ambulance & ER Notified</p>
              <p className="text-emerald-600 text-xs mt-2 font-mono">{displayData.location}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:108"
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl text-sm transition-colors shadow-md shadow-red-500/20"
            >
              <PhoneCall className="w-4 h-4" />
              Call 108
            </a>
            <a
              href={`tel:${displayData.emergencyContact.phone}`}
              className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold py-3 rounded-2xl text-sm transition-colors"
            >
              <Heart className="w-4 h-4 text-red-500" />
              Call Family
            </a>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-700">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-500" />
            <span>ETA: ~4 minutes · Ambulance Unit AU-07 dispatched</span>
          </div>

          <button
            onClick={handleReset}
            className="w-full text-slate-500 hover:text-slate-700 text-sm font-semibold py-2 transition-colors cursor-pointer"
          >
            Reset Demo
          </button>
        </div>
      )}
      {/* Registration Banner */}
      <div className="w-full max-w-sm mt-8 p-5 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
        <h3 className="text-slate-800 font-bold mb-2">Want your own Emergency Pass?</h3>
        <p className="text-sm text-slate-600 mb-4">Get a free NadiAyu Public Card to protect yourself in emergencies.</p>
        <button 
          onClick={() => window.location.hash = '#/user_registration'}
          className="w-full btn-primary-blue py-3 rounded-xl font-bold cursor-pointer hover:bg-blue-700 text-white bg-blue-600 transition-colors"
        >
          Register Today
        </button>
      </div>

    </div>
  );
};
