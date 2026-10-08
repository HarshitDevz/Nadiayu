import React from 'react';
import { motion } from 'motion/react';

interface MarqueeTickerProps {
  items: React.ReactNode[];
  speed?: number; // duration in seconds
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
  itemClassName?: string;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({
  items,
  speed = 28,
  direction = 'left',
  pauseOnHover = true,
  className = '',
  itemClassName = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden w-full flex select-none ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <motion.div
        className={`flex shrink-0 items-center gap-4 py-2 ${itemClassName}`}
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
        whileHover={pauseOnHover ? { animationPlayState: 'paused' } : undefined}
      >
        {/* Double items array for seamless looping */}
        {[...items, ...items].map((item, index) => (
          <div key={index} className="shrink-0 flex items-center">
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};
