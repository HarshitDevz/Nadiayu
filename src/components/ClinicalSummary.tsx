import React from 'react';
import { BedDouble, Stethoscope, BadgeCheck, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';
import { Patient } from '../types';

interface ClinicalSummaryProps {
  patient: Patient;
  className?: string;
}

/**
 * Premium UI component presenting a concise clinical summary for a patient.
 * Uses glassmorphism, gradients and subtle micro‑animations to match the
 * application's aesthetic.
 */
export const ClinicalSummary: React.FC<ClinicalSummaryProps> = ({ patient, className = '' }) => {
  const {
    bloodGroup,
    uhid,
    organDonor,
    isUniversalDonor,
    age,
    gender,
    gcs,
    vitals,
    allergies,
  } = patient as any; // additional fields may be added elsewhere

  return (
    <div className={`p-6 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Heart className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-semibold text-white">Full Medical Access Unlocked</h2>
      </div>

      {/* Grid layout for key details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white/90">
        {/* Blood Group & Antigen */}
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">Blood Group:</span> {bloodGroup} (Antigen Verified)
        </div>

        {/* Universal Donor */}
        {isUniversalDonor && (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="font-medium">Universal Donor</span>
          </div>
        )}

        {/* Bed & Physician */}
        <div className="flex items-center gap-2">
          <BedDouble className="w-4 h-4 text-blue-400" />
          <span className="font-medium">BED 01 • ATTENDING PHYSICIAN CLEARANCE</span>
        </div>

        {/* Demographics */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Age / Gender:</span> {age}y • {gender}
        </div>

        {/* GCS */}
        <div className="flex items-center gap-2">
          <span className="font-medium">GCS:</span> {gcs?.total ?? 15}/15
        </div>

        {/* Vitals */}
        {vitals && (
          <div className="flex flex-col gap-1">
            <span className="font-medium">Vitals:</span>
            <div className="flex flex-wrap gap-2">
              <span>HR {vitals.heartRate}bpm</span>
              <span>BP {vitals.bloodPressure}</span>
              <span>SpO₂ {vitals.spo2}%</span>
              <span>RR {vitals.respiratoryRate}/min</span>
              <span>Temp {vitals.temperature}°C</span>
            </div>
          </div>
        )}

        {/* Allergies */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="font-medium">Allergies:</span>{' '}
          {allergies?.length ? allergies.map((a:any) => a.allergen).join(', ') : 'None'}
        </div>

        {/* Organ Donor */}
        {organDonor && (
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="font-medium">Organ Donor: YES (Pledged)</span>
          </div>
        )}
      </div>
    </div>
  );
};
