import React, { useRef } from 'react';
import { motion, useInView, Variants } from 'motion/react';

interface SmoothScrollSectionProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
  yOffset?: number;
  threshold?: number;
}

export const SmoothScrollSection: React.FC<SmoothScrollSectionProps> = ({
  children,
  className = '',
  staggerDelay = 0.08,
  delay = 0,
  yOffset = 20,
  threshold = 0.15,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface SmoothScrollItemProps {
  children: React.ReactNode;
  className?: string;
  yOffset?: number;
}

export const SmoothScrollItem: React.FC<SmoothScrollItemProps> = ({
  children,
  className = '',
  yOffset = 20,
}) => {
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: yOffset,
      scale: 0.99,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};
