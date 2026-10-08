import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface MonodBentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  tiltIntensity?: number;
  badge?: React.ReactNode;
  borderBeam?: boolean;
}

export const MonodBentoCard: React.FC<MonodBentoCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(37, 99, 235, 0.10)',
  tiltIntensity = 4,
  badge,
  borderBeam = false,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number | null>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });

  // Damped spring for subtle, high-performance tilt without jitter
  const springConfig = { damping: 30, stiffness: 200, mass: 0.1 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [tiltIntensity, -tiltIntensity]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-tiltIntensity, tiltIntensity]), springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      mouseX.set(x);
      mouseY.set(y);
      setSpotlightPos({ x: clientX - rect.left, y: clientY - rect.top });
    });
  }, [mouseX, mouseY]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        willChange: 'transform',
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-slate-900/5 transition-shadow duration-200 ${className}`}
      {...(props as any)}
    >
      {/* Dynamic Cursor Spotlight Radial Glow */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-200 rounded-3xl"
          style={{
            background: `radial-gradient(400px circle at ${spotlightPos.x}px ${spotlightPos.y}px, ${glowColor}, transparent 65%)`,
          }}
        />
      )}

      {/* Optional Top Right Badge */}
      {badge && (
        <div className="absolute top-5 right-5 z-20">
          {badge}
        </div>
      )}

      {/* Card Content */}
      <div className="relative z-10 space-y-4">
        {children}
      </div>
    </motion.div>
  );
};
