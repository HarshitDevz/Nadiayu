import React from 'react';

interface BadgePulseProps {
  color?: 'red' | 'blue' | 'emerald' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const BadgePulse: React.FC<BadgePulseProps> = ({
  color = 'red',
  size = 'md',
  label,
  className = '',
}) => {
  const colorMap = {
    red: {
      bg: 'bg-red-500',
      ping: 'bg-red-400',
      text: 'text-red-700',
      badgeBg: 'bg-red-50 border-red-200',
    },
    blue: {
      bg: 'bg-blue-500',
      ping: 'bg-blue-400',
      text: 'text-blue-700',
      badgeBg: 'bg-blue-50 border-blue-200',
    },
    emerald: {
      bg: 'bg-emerald-500',
      ping: 'bg-emerald-400',
      text: 'text-emerald-700',
      badgeBg: 'bg-emerald-50 border-emerald-200',
    },
    amber: {
      bg: 'bg-amber-500',
      ping: 'bg-amber-400',
      text: 'text-amber-700',
      badgeBg: 'bg-amber-50 border-amber-200',
    },
  };

  const sizeMap = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const selectedColor = colorMap[color];

  if (!label) {
    return (
      <span className={`relative flex ${sizeMap[size]} ${className}`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${selectedColor.ping}`} />
        <span className={`relative inline-flex rounded-full ${sizeMap[size]} ${selectedColor.bg}`} />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold border ${selectedColor.badgeBg} ${selectedColor.text} ${className}`}>
      <span className="relative flex w-2 h-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${selectedColor.ping}`} />
        <span className={`relative inline-flex rounded-full w-2 h-2 ${selectedColor.bg}`} />
      </span>
      <span>{label}</span>
    </span>
  );
};
