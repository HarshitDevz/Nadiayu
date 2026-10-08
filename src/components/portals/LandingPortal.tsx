import React from 'react';
import {
  ShieldAlert,
  Heart,
  Activity,
  Clock,
  AlertOctagon,
  CheckCircle2,
  FileText,
  Stethoscope,
  PhoneCall,
  UserCheck,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Zap,
  Building2,
  Users,
  Compass,
  Eye,
  Crosshair,
  Sparkles,
  HeartPulse,
  TrendingUp,
  Award,
  Radio,
  Play,
  Layers,
  Lock,
  Cpu,
  RotateCw
} from 'lucide-react';
import { useMedical } from '../../context/MedicalContext';
import { PortalType } from '../../types';
import { motion } from 'motion/react';
import { NadiayuLogo } from '../NadiayuLogo';
import { DigitalMedicalPass } from '../DigitalMedicalPass';
import { MonodKineticHero } from '../ui/MonodKineticHero';
import { MonodBentoCard } from '../ui/MonodBentoCard';
import { MonodMarquee } from '../ui/MonodMarquee';
import { BorderBeam } from '../ui/BorderBeam';
import { NumberTicker } from '../ui/NumberTicker';
import { ShimmerButton } from '../ui/ShimmerButton';
import { BadgePulse } from '../ui/BadgePulse';
import { BlurFade } from '../ui/BlurFade';
import { Tilt3DCard } from '../ui/Tilt3DCard';
import { MagneticButton } from '../ui/MagneticButton';
import { AmbientGridMesh } from '../ui/AmbientGridMesh';

export const LandingPortal: React.FC = () => {
  const { setActivePortal, patients, activePatient } = useMedical();

  const coreProblems = [
    {
      title: 'The Golden Hour Window',
      metric: '60 Minutes',
      metricVal: 60,
      metricSuffix: ' Min',
      description: 'Over 50% of preventable emergency fatalities occur in the first hour due to delayed patient identification and unknown medical history.',
      icon: Clock,
      borderClass: 'border-red-200/80 hover:border-red-400',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
      iconBg: 'bg-red-50 text-red-600',
      glow: 'rgba(220, 38, 38, 0.1)'
    },
    {
      title: 'Deadly Drug Allergies',
      metric: '250k+ Cases/Yr',
      metricVal: 250,
      metricSuffix: 'k+ Cases',
      description: 'Unconscious patients cannot communicate anaphylactic penicillin or NSAID allergies, risking lethal cross-reactivity in the ER.',
      icon: AlertOctagon,
      borderClass: 'border-amber-200/80 hover:border-amber-400',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600',
      glow: 'rgba(217, 119, 6, 0.1)'
    },
    {
      title: 'Prescription Misinterpretation',
      metric: '3.2s Lag Saved',
      metricVal: 3.2,
      metricSuffix: 's Saved',
      decimalPlaces: 1,
      description: 'Illegible handwriting and fragmented paper notes cause critical dosage mistakes during high-stress emergency resuscitation.',
      icon: FileText,
      borderClass: 'border-blue-200/80 hover:border-blue-400',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600',
      glow: 'rgba(37, 99, 235, 0.1)'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Bystander Public Scan',
      stage: 'Stage 1: Zero-Login Field Identification',
      role: 'Everyday Citizen / First Responder',
      summary: 'When a critical patient is found, any bystander scans the NFC or QR emergency pass without downloading any app or logging in. It immediately reveals the universal O-negative blood badge, severe allergies, next-of-kin emergency call dials, and dispatches a GPS SOS to 108 trauma teams.',
      icon: QrCode
    },
    {
      step: '02',
      title: 'Nurse Optical Prescription Capture',
      stage: 'Stage 2: Bedside Rx Digitization',
      role: 'Emergency Triage Nurse',
      summary: 'At emergency arrival, the ER nurse takes a photo of handwritten doctor prescription orders. Vision AI OCR extracts critical medications, dosages, frequency, and administration routes in under 420ms, indexing them against the patient’s live profile.',
      icon: FileText
    },
    {
      step: '03',
      title: 'HiTL Pharmacist Verification',
      stage: 'Stage 3: Safety Interception & Cross-Check',
      role: 'Clinical Pharmacist',
      summary: 'Extracted drugs are queued for human review. If high-risk allergies (like beta-lactams or cephalosporins) are detected, the safety engine flags fatal contraindications with 1-click safe formulation alternatives before dispensing.',
      icon: UserCheck
    },
    {
      step: '04',
      title: 'ER Trauma Resuscitation Console',
      stage: 'Stage 4: Resuscitation & Telemetry',
      role: 'Emergency Physician / Trauma Leader',
      summary: 'ER doctors track live Glasgow Coma Scale (GCS), real-time vitals telemetry, emergency blood matching, and organ donor status, logging critical airway and medication interventions with synchronized audit timestamps.',
      icon: Stethoscope
    },
    {
      step: '05',
      title: 'Patient Global Emergency Hub',
      stage: 'Stage 5: Health Locker & Pass Generation',
      role: 'Citizen / Patient / Caregiver',
      summary: 'Individuals manage verified Global IDs, declare lethal allergies and emergency contacts, and generate high-resolution 3D smart emergency passes ready for NFC wristbands, smart wallets, or physical card printing.',
      icon: HeartPulse
    },
    {
      step: '06',
      title: 'Hospital Capacity & KYC Command',
      stage: 'Stage 6: Multi-Bay Orchestration & Verification',
      role: 'Hospital Administrator / Triage Lead',
      summary: 'Administrative teams manage hospital trauma bay capacities (Red/Yellow/Green beds), review and verify newly submitted Citizen KYC applications linked to Global credentials, and monitor system-wide uptime metrics.',
      icon: Cpu
    }
  ];

  const marqueeItems = [
    { text: '108 Emergency Dispatch Live Sync', badge: 'GPS Online', badgeType: 'emerald' as const, icon: <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> },
    { text: 'Beta-Lactam / Penicillin Intercept Active', badge: 'Tier-1 Anaphylaxis', badgeType: 'crimson' as const, icon: <AlertOctagon className="w-3.5 h-3.5 text-red-600" /> },
    { text: 'Vision AI OCR: Handwritten Rx Parsing', badge: 'Fast Latency', badgeType: 'blue' as const, icon: <Sparkles className="w-3.5 h-3.5 text-blue-600" /> },
    { text: 'System Global Health Digital Mission', badge: 'FHIR R4 Certified', badgeType: 'blue' as const, icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> },
    { text: 'Universal O-ve RBC Donor Match Alert', badge: 'Zero-Login Pass', badgeType: 'emerald' as const, icon: <Heart className="w-3.5 h-3.5 text-emerald-600" /> },
    { text: 'Human-in-the-Loop Pharmacist Audit Active', badge: '100% EHR Safe', badgeType: 'amber' as const, icon: <UserCheck className="w-3.5 h-3.5 text-amber-600" /> },
  ];

  return (
    <div className="space-y-16 pb-28 animate-in fade-in duration-200 relative">

      {/* AMBIENT BACKGROUND GRADIENT MESH (Monod Framer Style) */}
      <AmbientGridMesh glowColor="rgba(37, 99, 235, 0.07)" />

      {/* MONOD KINETIC HERO SECTION */}
      <section className="relative pt-1 sm:pt-2">
        <MonodKineticHero
          badgeText="System & FHIR R4 Emergency AI"
          badgeSubtext="Nadi-Ayu Protocol"
          titlePrefix="Emergency Medical Pass &amp; Vision AI for the"
          titleHighlight="Golden Hour"
          titleSuffix="Trauma Window"
          description="Bridging the critical 60 minutes of trauma resuscitation. Unconscious patient identification in <3 seconds, Vision OCR prescription ingestion, and zero-hallucination pharmacist verification."
          primaryActionLabel="Experience Emergency Scan (/scan)"
          onPrimaryAction={() => setActivePortal('scan')}
          secondaryActionLabel="Open ER Doctor Console (/er)"
          onSecondaryAction={() => setActivePortal('er')}
          metrics={[
            { label: 'Triage Response', value: 'Fast', detail: 'Instant Pass Scan' },
            { label: 'EHR Accuracy', value: '100%', detail: 'HiTL Verified' },
            { label: 'Allergy Safeguard', value: 'Tier 1', detail: 'Deadly Drug Intercept' },
          ]}
        />
      </section>

      {/* MONOD INFINITE KINETIC MARQUEE TICKER */}
      <BlurFade delay={0.15}>
        <div className="w-full">
          <MonodMarquee items={marqueeItems} speedSeconds={30} />
        </div>
      </BlurFade>



      {/* WHY WE ARE DOING THIS: 3 CRITICAL CLINICAL BOTTLENECKS (MONOD BENTO CARDS) */}
      <BlurFade delay={0.25} yOffset={10}>
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 max-w-4xl">
            <div>
              <span className="text-sm mono font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                CLINICAL NECESSITY
              </span>
              <h2 className="heading text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1.5">
                The 3 Fatal Bottlenecks in Emergency Care
              </h2>
              <p className="text-sm sm:text-sm text-slate-700 mt-1">
                Data fragmentation and identification lag cause over 50% of preventable trauma fatalities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {coreProblems.map((p) => {
              const Icon = p.icon;
              return (
                <MonodBentoCard
                  key={p.title}
                  glowColor={p.glow}
                  tiltIntensity={7}
                  badge={
                    <span className={`text-sm mono font-bold px-2.5 py-1 rounded-full border ${p.badgeClass} flex items-center gap-1`}>
                      <NumberTicker value={p.metricVal} decimalPlaces={p.decimalPlaces || 0} />
                      <span>{p.metricSuffix.replace(/^\d+/, '')}</span>
                    </span>
                  }
                >
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: [0, -8, 8, 0] }}
                      transition={{ duration: 0.4 }}
                      className={`w-12 h-12 rounded-2xl ${p.iconBg} flex items-center justify-center shadow-xs`}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>

                    <h3 className="heading text-lg font-bold text-[#0F172A] leading-snug">
                      {p.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {p.description}
                    </p>
                  </div>
                </MonodBentoCard>
              );
            })}
          </div>
        </section>
      </BlurFade>



    </div>
  );
};

