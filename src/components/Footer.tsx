import React from 'react';
import { 
  HeartPulse, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  FileText, 
  CheckCircle2, 
  PhoneCall, 
  Radio, 
  QrCode, 
  Shield, 
  Lock,
  Stethoscope,
  ScanLine,
  Pill,
  Cpu
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { PortalType } from '../types';
import { NadiayuLogo } from './NadiayuLogo';

export const Footer: React.FC = () => {
  const { activePortal, setActivePortal, sosActive } = useMedical();

  const footerLinks: { label: string; portal: PortalType; desc: string; icon: React.FC<{ className?: string }> }[] = [
    {
      label: '1. Bystander / Public Scan',
      portal: 'scan',
      desc: 'Instant QR/NFC Public Safety Pass & 108 Emergency Call',
      icon: QrCode
    },
    {
      label: '2. Nurse Upload Portal',
      portal: 'nurse',
      desc: 'Vision AI Handwritten Slip Ingestion & Drug Extraction',
      icon: ScanLine
    },
    {
      label: '3. HiTL Verify Portal',
      portal: 'hitl',
      desc: 'Dual-Pane Human-in-the-Loop Pharmacist Safety Validation',
      icon: Pill
    },
    {
      label: '4. ER Doctor Triage',
      portal: 'er',
      desc: '3-Sec Crisis Screen, GCS Assessment & Drug Interaction',
      icon: Stethoscope
    },
    {
      label: '5. Patient Dashboard',
      portal: 'patient',
      desc: 'Personal ICE Contacts, Allergy IDs & Health Summary',
      icon: HeartPulse
    },
    {
      label: '6. Admin Control Portal',
      portal: 'admin',
      desc: 'Platform Security Audits, OCR Telemetry & System Hub',
      icon: Cpu
    }
  ];

  const handlePortalClick = (portal: PortalType) => {
    setActivePortal(portal);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#E6D7C8] bg-[#F7F2ED] text-[#2E1E12] mt-auto relative z-10 transition-colors">
      
      {/* Upper Navigation & Core Portals Section */}
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-14 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand & Purpose Col (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <button
              onClick={() => handlePortalClick('landing')}
              className="text-left focus-visible:outline-none transition-transform hover:opacity-95"
            >
              <NadiayuLogo size="lg" variant="banner" showSubtitle={true} />
            </button>

            <p className="text-sm text-[#6E5646] leading-relaxed max-w-sm">
              Nadiayu is a high-reliability clinical emergency intelligence suite combining sub-3-second OCR prescription ingestion, Human-in-the-Loop drug safety verification, and instant Good Samaritan medical pass access.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200/80 text-sm font-bold mono">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                Code Red Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-sm font-bold mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Sub-3s Triage
              </span>
            </div>
          </div>

          {/* Quick Portal Switcher Grid (8 cols) */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#6E5646] mono">
                Clinical Workstations &amp; Public Portals
              </h4>
              <span className="text-sm text-[#9A8170] mono">6 Active Modules</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {footerLinks.map((item) => {
                const IconComponent = item.icon;
                const isActive = activePortal === item.portal;

                return (
                  <button
                    key={item.portal}
                    onClick={() => handlePortalClick(item.portal)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between group ${
                      isActive 
                        ? 'bg-amber-100/70 border-amber-400 shadow-xs ring-1 ring-amber-500/30' 
                        : 'bg-[#FCFAF8] hover:bg-[#F3ECE6] border-[#E8DCD1] hover:border-[#D8C7B8]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          isActive 
                            ? 'bg-[#8B5A2B] text-white' 
                            : 'bg-white border border-[#E8DCD1] text-[#6E5646] group-hover:text-[#8B5A2B]'
                        }`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className={`heading text-sm font-bold ${
                          isActive ? 'text-[#6A3D18]' : 'text-[#2E1E12] group-hover:text-[#8B5A2B]'
                        }`}>
                          {item.label}
                        </span>
                      </div>
                      <ArrowUpRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                        isActive ? 'text-[#8B5A2B]' : 'text-[#AFA094] group-hover:text-[#6E5646]'
                      }`} />
                    </div>

                    <p className="text-sm text-[#6E5646] line-clamp-1 leading-normal pl-8">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Lower Telemetry & Compliance Strip */}
      <div className="border-t border-[#E6D7C8] bg-[#EDE4DB] py-4 px-4 sm:px-8 lg:px-12 xl:px-14 text-sm text-[#6E5646]">
        <div className="w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          
          <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-start">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-[#2E1E12]">Nadiayu Emergency Clinical Network</span>
            <span className="text-[#C5B5A7] hidden sm:inline">&bull;</span>
            <span className="text-sm text-[#6E5646]">All 6 Clinical Portals Online</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-center text-sm mono text-[#6E5646]">
            <span className="inline-flex items-center gap-1 bg-[#FCFAF8] px-2 py-0.5 rounded-md border border-[#DCCEC2] shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              ISO 13485 Certified
            </span>
            <span className="inline-flex items-center gap-1 bg-[#FCFAF8] px-2 py-0.5 rounded-md border border-[#DCCEC2] shadow-2xs">
              <Activity className="w-3 h-3 text-teal-600" />
              FHIR R4 Compliant
            </span>
            <span className="inline-flex items-center gap-1 bg-[#FCFAF8] px-2 py-0.5 rounded-md border border-[#DCCEC2] shadow-2xs">
              <Lock className="w-3 h-3 text-emerald-600" />
              AES-256 Encrypted
            </span>
          </div>

        </div>
      </div>

    </footer>
  );
};
