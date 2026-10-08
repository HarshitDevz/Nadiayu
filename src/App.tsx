import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MedicalProvider, useMedical } from './context/MedicalContext';
import { TopHeader } from './components/TopHeader';
import { OverviewPortal } from './components/portals/OverviewPortal';
import { LandingPortal } from './components/portals/LandingPortal';
import { ERDoctorPortal } from './components/portals/ERDoctorPortal';
import { BystanderScanPortal } from './components/portals/BystanderScanPortal';
import { PatientDashboardPortal } from './components/portals/PatientDashboardPortal';
import { AdminControlPortal } from './components/portals/AdminControlPortal';
import { PharmacistPortal } from './components/portals/PharmacistPortal';
import { PatientSOSPortal } from './components/portals/PatientSOSPortal';
import { UserRegistrationPortal } from './components/portals/UserRegistrationPortal';
import { motion, AnimatePresence } from 'motion/react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Nadiayu Portal Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] mx-auto flex items-center justify-center text-[#DC2626] font-bold text-2xl shadow-sm">
              !
            </div>
            <div className="space-y-1">
              <h1 className="heading text-xl font-bold text-[#0F172A]">System Notice</h1>
              <p className="text-sm text-[#64748B] leading-relaxed">
                An unexpected interface anomaly occurred. Click below to reload the emergency triage workstation.
              </p>
            </div>
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl text-left text-sm mono text-[#DC2626] overflow-x-auto border border-[#E2E8F0]">
              {this.state.error?.message || 'Unknown runtime exception'}
            </div>
            <button
              onClick={() => {
                window.location.hash = '';
                window.location.reload();
              }}
              className="w-full btn-primary-blue py-3 px-4 rounded-xl text-sm font-bold"
            >
              Reset &amp; Reload Console
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const PortalContainer: React.FC = () => {
  const { activePortal, setActivePortal, currentUser, userProfiles, isAdmin } = useMedical();

  const currentProfile = currentUser ? userProfiles.find((p: any) => p.googleUserId === ((currentUser as any).id || (currentUser as any).uid)) : null;
  const isApproved = currentProfile?.accountStatus === 'APPROVED';

  const renderActivePortal = () => {
    // Role-based Access Control
    if (currentUser && !isAdmin && isApproved) {
      if (currentProfile?.role === 'PATIENT' && !['patient', 'patient_sos', 'landing', 'user_registration'].includes(activePortal)) {
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">!</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Restricted Area</h2>
            <p className="text-slate-600 max-w-sm mb-6">Your Patient Identity prevents access to Clinical and Administrative zones.</p>
            <button onClick={() => setActivePortal('patient')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
              Return to Patient Portal
            </button>
          </div>
        );
      }
    }

    switch (activePortal) {
      case 'landing':
        return <LandingPortal />;
      case 'er':
        return <ERDoctorPortal />;
      case 'scan':
        return <BystanderScanPortal />;
      case 'patient':
        return <PatientDashboardPortal />;
      case 'admin':
        return <AdminControlPortal />;
      case 'pharmacist':
        return <PharmacistPortal />;
      case 'patient_sos':
        return <PatientSOSPortal />;
      case 'user_registration':
        return <UserRegistrationPortal />;
      case 'overview':
      default:
        return <OverviewPortal />;
    }
  };

  return (
    <div className="min-h-screen text-[#0F172A] flex flex-col selection:bg-[#2563EB] selection:text-white relative overflow-hidden font-sans">
      {/* Clean page background */}
      <div className="fixed inset-0 -z-20 bg-[#F8FAFC] pointer-events-none" />

      {/* Top Clinical Header Bar with Integrated Navigation */}
      <TopHeader />

      {/* Main Active Portal View with Smooth Framer Page Transitions */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-14 py-3 sm:py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePortal}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderActivePortal()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="w-full bg-white border-t border-slate-200 mt-auto shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <button onClick={() => setActivePortal('landing')} className="hover:text-blue-600 transition-colors">Home</button>
          <button onClick={() => setActivePortal('user_registration')} className="hover:text-blue-600 transition-colors">Register</button>
          <button onClick={() => setActivePortal('patient')} className="hover:text-blue-600 transition-colors">Patient</button>
          <button onClick={() => setActivePortal('patient_sos')} className="hover:text-blue-600 transition-colors">SOS</button>
          <button onClick={() => setActivePortal('er')} className="hover:text-blue-600 transition-colors">ER Doctor</button>
          <button onClick={() => setActivePortal('pharmacist')} className="hover:text-blue-600 transition-colors">Pharmacy POS</button>
          <button onClick={() => setActivePortal('admin')} className="hover:text-blue-600 transition-colors">Admin</button>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <MedicalProvider>
        <PortalContainer />
      </MedicalProvider>
    </ErrorBoundary>
  );
}
