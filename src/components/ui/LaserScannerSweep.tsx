import React from 'react';
import { motion } from 'motion/react';

interface LaserScannerSweepProps {
  isActive?: boolean;
  color?: 'blue' | 'red' | 'emerald' | 'amber';
  className?: string;
  label?: string;
}

export const LaserScannerSweep: React.FC<LaserScannerSweepProps> = ({
  isActive = true,
  color = 'blue',
  className = '',
  label = 'AI OCR SCANNING'
}) => {
  if (!isActive) return null;

  const colorStyles = {
    blue: {
      line: 'from-transparent via-blue-500 to-transparent',
      glow: 'shadow-[0_0_15px_3px_rgba(59,130,246,0.6)]',
      bgGlow: 'from-blue-500/10 via-blue-500/5 to-transparent',
      text: 'text-blue-600 bg-blue-50/90 border-blue-200'
    },
    red: {
      line: 'from-transparent via-red-500 to-transparent',
      glow: 'shadow-[0_0_15px_3px_rgba(239,68,68,0.6)]',
      bgGlow: 'from-red-500/10 via-red-500/5 to-transparent',
      text: 'text-red-600 bg-red-50/90 border-red-200'
    },
    emerald: {
      line: 'from-transparent via-emerald-500 to-transparent',
      glow: 'shadow-[0_0_15px_3px_rgba(16,185,129,0.6)]',
      bgGlow: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      text: 'text-emerald-600 bg-emerald-50/90 border-emerald-200'
    },
    amber: {
      line: 'from-transparent via-amber-500 to-transparent',
      glow: 'shadow-[0_0_15px_3px_rgba(245,158,11,0.6)]',
      bgGlow: 'from-amber-500/10 via-amber-500/5 to-transparent',
      text: 'text-amber-600 bg-amber-50/90 border-amber-200'
    }
  };

  const currentTheme = colorStyles[color];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-20 ${className}`}>
      {/* Animated Laser Bar Moving Vertically */}
      <motion.div
        className="w-full absolute left-0 flex flex-col items-center"
        initial={{ top: '0%' }}
        animate={{ top: ['0%', '96%', '0%'] }}
        transition={{
          duration: 2.8,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      >
        {/* Glow trailing gradient */}
        <div className={`w-full h-12 bg-gradient-to-b ${currentTheme.bgGlow}`} />

        {/* Sharp Laser Beam */}
        <div className={`w-full h-[2px] bg-gradient-to-r ${currentTheme.line} ${currentTheme.glow}`} />

        {/* Small floating tracking pill */}
        {label && (
          <div className={`mt-1 px-2 py-0.5 rounded-full border text-[9px] font-mono font-black tracking-widest uppercase shadow-sm ${currentTheme.text} backdrop-blur-xs`}>
            {label}
          </div>
        )}
      </motion.div>

      {/* Grid overlay for high-tech HUD look */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
    </div>
  );
};
