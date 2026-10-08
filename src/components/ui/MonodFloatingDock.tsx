import React, { useState } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Home, 
  QrCode, 
  ScanLine, 
  Pill, 
  Stethoscope, 
  HeartPulse, 
  Cpu
} from 'lucide-react';
import { useMedical } from '../../context/MedicalContext';
import { PortalType } from '../../types';

interface DockItemProps {
  id: PortalType;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  isActive: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

const DockItem: React.FC<DockItemProps> = ({
  label,
  icon: Icon,
  badge,
  badgeColor = 'bg-red-500',
  isActive,
  isHovered,
  onHover,
  onLeave,
  onClick,
}) => {
  return (
    <motion.button
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      animate={{
        scale: isHovered ? 1.15 : 1,
        y: isHovered ? -3 : 0,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-colors cursor-pointer group select-none shrink-0 ${
        isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
          : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
      }`}
      title={label}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-105" />

      {/* Active Bottom Dot */}
      {isActive && (
        <motion.span
          layoutId="dock-active-dot"
          className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600"
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        />
      )}

      {/* Floating Tooltip Label on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-sm mono font-bold whitespace-nowrap shadow-lg z-50"
          >
            {label}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optional Badge */}
      {badge && (
        <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full ${badgeColor} text-white text-[9px] mono font-bold flex items-center justify-center shadow-xs`}>
          {badge}
        </span>
      )}
    </motion.button>
  );
};

export const MonodFloatingDock: React.FC = () => {
  const { activePortal, setActivePortal, prescriptions, kycApplications } = useMedical();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const pendingHitlCount = prescriptions.filter(p => p.status === 'awaiting_hitl').length;
  const pendingKycCount = kycApplications.filter(k => k.status === 'PENDING_ADMIN_VERIFICATION').length;

  const items = [
    { id: 'landing' as PortalType, label: '0. Home', shortLabel: 'Home', icon: Home },
    { id: 'nurse' as PortalType, label: '2. Nurse OCR Station', shortLabel: 'Nurse', icon: ScanLine },
    { 
      id: 'hitl' as PortalType, 
      label: '3. HiTL Verification', 
      shortLabel: 'HiTL', 
      icon: Pill, 
      badge: pendingHitlCount > 0 ? pendingHitlCount : undefined,
      badgeColor: 'bg-amber-500'
    },
    { id: 'er' as PortalType, label: '4. ER Doctor Resuscitation', shortLabel: 'ER Bay', icon: Stethoscope },
    { id: 'patient' as PortalType, label: '5. Patient Emergency Pass', shortLabel: 'Patient', icon: HeartPulse },
    { 
      id: 'admin' as PortalType, 
      label: '6. Admin Hospital Hub', 
      shortLabel: 'Admin', 
      icon: Cpu,
      badge: pendingKycCount > 0 ? pendingKycCount : undefined,
      badgeColor: 'bg-blue-600'
    },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 px-2 pointer-events-auto">
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 220, delay: 0.1 }}
        onMouseLeave={() => setHoveredIdx(null)}
        className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-slate-900/10"
      >
        {items.map((item, idx) => (
          <DockItem
            key={item.id}
            id={item.id}
            label={item.label}
            shortLabel={item.shortLabel}
            icon={item.icon}
            badge={item.badge}
            badgeColor={item.badgeColor}
            isActive={activePortal === item.id}
            isHovered={hoveredIdx === idx}
            onHover={() => setHoveredIdx(idx)}
            onLeave={() => setHoveredIdx(null)}
            onClick={() => setActivePortal(item.id)}
          />
        ))}
      </motion.div>
    </div>
  );
};
