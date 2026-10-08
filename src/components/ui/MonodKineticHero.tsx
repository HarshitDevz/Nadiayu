import React from 'react';
import { motion, Variants } from 'motion/react';
import { Sparkles, HeartPulse, ArrowRight, Zap, ShieldCheck, LogIn } from 'lucide-react';
import { MagneticButton } from './MagneticButton';
import { useMedical } from '../../context/MedicalContext';

interface MonodKineticHeroProps {
  badgeText?: string;
  badgeSubtext?: string;
  titlePrefix?: string;
  titleHighlight?: string;
  titleSuffix?: string;
  description?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  metrics?: { label: string; value: string; detail?: string }[];
}

export const MonodKineticHero: React.FC<MonodKineticHeroProps> = ({
  badgeText = 'System & FHIR R4 Emergency AI',
  badgeSubtext = 'Nadi-Ayu Protocol',
  titlePrefix = 'Emergency Medical Pass & Vision AI for the',
  titleHighlight = 'Golden Hour',
  titleSuffix = 'Trauma Window',
  description = 'Bridging the critical 60 minutes of trauma resuscitation. Unconscious patient identification in <3 seconds, Vision OCR prescription ingestion, and zero-hallucination pharmacist verification.',
  primaryActionLabel = 'Experience Emergency Scan (/scan)',
  onPrimaryAction,
  secondaryActionLabel = 'Open ER Doctor Console (/er)',
  onSecondaryAction,
  metrics = [
    { label: 'Triage Response', value: 'Fast', detail: 'Instant Pass Scan' },
    { label: 'EHR Accuracy', value: '100%', detail: 'HiTL Verified' },
    { label: 'Allergy Safeguard', value: 'Tier 1', detail: 'Deadly Drug Intercept' },
  ]
}) => {
  const { currentUser, signInWithGoogle, isAuthLoading } = useMedical();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.09, delayChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 22, stiffness: 160 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full flex flex-col items-center justify-center text-center overflow-hidden py-16 sm:py-24"
    >

      {/* Main Headline */}
      <motion.div variants={itemVariants} className="w-full mb-5 px-2">
        <h1
          className="heading text-slate-900 tracking-tight leading-[1.15] w-full mx-auto"
          style={{ fontSize: 'clamp(1.6rem, 3.8vw, 3.6rem)' }}
        >
          {titlePrefix}{' '}
          <span className="relative inline-block text-blue-600">
            <span className="relative z-10">{titleHighlight}</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-1 left-0 right-0 h-3 bg-blue-100/70 -z-10 rounded-sm origin-left"
            />
          </span>{' '}
          <span className="text-slate-900">{titleSuffix}</span>
        </h1>
      </motion.div>

      {/* Description */}
      <motion.p
        variants={itemVariants}
        className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl mx-auto mb-7 font-normal px-4"
      >
        {description}
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
      >
        {onPrimaryAction && (
          <MagneticButton pullStrength={0.2} onClick={onPrimaryAction}>
            <div className="btn-primary-blue py-3 px-6 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all">
              <Zap className="w-4 h-4 text-blue-200 animate-pulse" />
              <span>{primaryActionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </MagneticButton>
        )}

        {onSecondaryAction && (
          <MagneticButton pullStrength={0.15} onClick={onSecondaryAction}>
            <div className="btn-secondary-paper py-3 px-6 rounded-2xl text-sm font-bold flex items-center gap-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
              <HeartPulse className="w-4 h-4 text-red-600" />
              <span>{secondaryActionLabel}</span>
            </div>
          </MagneticButton>
        )}

        {/* Google Sign-In CTA */}
        {!currentUser && !isAuthLoading && (
          <MagneticButton pullStrength={0.15} onClick={signInWithGoogle}>
            <div className="flex items-center gap-2.5 py-3 px-6 rounded-2xl text-sm font-bold border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all text-slate-800">
              {/* Google "G" logo SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Sign in with Google</span>
            </div>
          </MagneticButton>
        )}

        {/* Signed-in pill */}
        {currentUser && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Signed in as {currentUser.displayName || currentUser.email?.split('@')[0]}</span>
          </div>
        )}
      </motion.div>

      {/* Metrics Strip */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl w-full mx-auto px-4"
      >
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="p-3 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-sm shadow-xs hover:shadow-md transition-all text-center space-y-0.5 group"
          >
            <div className="text-sm font-semibold text-slate-700 mono uppercase tracking-wider">
              {m.label}
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#0F172A] mono group-hover:text-blue-600 transition-colors">
              {m.value}
            </div>
            {m.detail && (
              <div className="text-sm text-slate-600 font-medium">{m.detail}</div>
            )}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

