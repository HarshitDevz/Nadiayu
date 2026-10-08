import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  pullStrength?: number;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  pullStrength = 0.25,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 180, mass: 0.1 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * pullStrength);
    y.set((e.clientY - centerY) * pullStrength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: smoothX, y: smoothY }}
      whileTap={{ scale: 0.95 }}
      className={`relative select-none cursor-pointer ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};
