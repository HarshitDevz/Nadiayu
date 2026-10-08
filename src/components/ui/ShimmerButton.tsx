import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ShimmerButtonProps extends HTMLMotionProps<'button'> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = '#ffffff',
      shimmerSize = '0.05em',
      shimmerDuration = '3s',
      borderRadius = '14px',
      background = 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98, y: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={
          {
            '--spread': '90deg',
            '--shimmer-color': shimmerColor,
            '--radius': borderRadius,
            '--speed': shimmerDuration,
            '--cut': shimmerSize,
            '--bg': background,
          } as React.CSSProperties
        }
        className={`group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
        {...props}
      >
        {/* Spark container */}
        <div className="absolute inset-0 overflow-visible [container-type:size]">
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            {/* spark */}
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        {/* Backdrop */}
        <div className="absolute [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]" />
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </div>
      </motion.button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';
