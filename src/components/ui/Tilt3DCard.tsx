import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface Tilt3DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glareOpacity?: number;
  perspective?: number;
  scaleOnHover?: number;
}

export const Tilt3DCard: React.FC<Tilt3DCardProps> = ({
  children,
  className = '',
  maxTilt = 10,
  glareOpacity = 0.15,
  perspective = 1000,
  scaleOnHover = 1.02,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothMouseX, [0, 1], [-maxTilt, maxTilt]);

  const glareX = useTransform(smoothMouseX, [0, 1], ['0%', '100%']);
  const glareY = useTransform(smoothMouseY, [0, 1], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective,
        transformStyle: 'preserve-3d',
      }}
      className={`relative ${className}`}
      {...(props as any)}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: scaleOnHover }}
        transition={{ type: 'spring', damping: 18, stiffness: 220 }}
        className="w-full h-full relative rounded-[inherit]"
      >
        {children}

        {/* Specular glare shine overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 overflow-hidden"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(400px circle at ${gx} ${gy}, rgba(255,255,255,${glareOpacity}), transparent 60%)`
            ),
          }}
        />
      </motion.div>
    </motion.div>
  );
};
