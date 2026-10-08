import React from 'react';
import { motion } from 'motion/react';

interface MarqueeItem {
  text: string;
  badge?: string;
  badgeType?: 'blue' | 'emerald' | 'amber' | 'crimson';
  icon?: React.ReactNode;
}

interface MonodMarqueeProps {
  items: MarqueeItem[];
  speedSeconds?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export const MonodMarquee: React.FC<MonodMarqueeProps> = ({
  items,
  speedSeconds = 28,
  direction = 'left',
  className = '',
}) => {
  // Duplicate 2x for seamless continuous loop with light DOM tree
  const duplicatedItems = [...items, ...items];

  const getBadgeStyle = (type?: string) => {
    switch (type) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'crimson':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'blue':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className={`relative w-full overflow-hidden py-3 select-none ${className}`}>
      {/* Side Fade Gradients */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10" />

      <motion.div
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          duration: speedSeconds,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          willChange: 'transform',
        }}
        className="flex items-center gap-4 w-max"
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-colors group shrink-0"
          >
            {item.icon && <span className="text-slate-600 group-hover:text-blue-600 transition-colors">{item.icon}</span>}
            <span className="text-sm font-semibold text-slate-700 group-hover:text-[#0F172A] transition-colors whitespace-nowrap">
              {item.text}
            </span>
            {item.badge && (
              <span className={`text-sm mono font-bold uppercase px-2 py-0.5 rounded-full border ${getBadgeStyle(item.badgeType)}`}>
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
};
