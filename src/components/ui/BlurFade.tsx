import React, { useRef } from 'react';
import { motion, useInView, UseInViewOptions, HTMLMotionProps } from 'motion/react';

interface BlurFadeProps extends HTMLMotionProps<'div'> {
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: UseInViewOptions['margin'];
  blur?: string;
  className?: string;
  children: React.ReactNode;
}

export const BlurFade: React.FC<BlurFadeProps> = ({
  children,
  className = '',
  duration = 0.45,
  delay = 0,
  yOffset = 16,
  inView = true,
  inViewMargin = '-20px 0px -20px 0px',
  blur,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inViewResult = useInView(ref, { 
    once: true, 
    margin: inViewMargin,
    amount: 0.05 
  });
  
  const isInView = !inView || inViewResult;

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        y: yOffset,
      }}
      animate={
        isInView 
          ? { opacity: 1, y: 0 } 
          : { opacity: 0, y: yOffset }
      }
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Smooth butter cubic-bezier
      }}
      style={{
        willChange: 'transform, opacity',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
