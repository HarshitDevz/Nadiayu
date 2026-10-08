import React from 'react';

interface NadiayuLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'icon' | 'banner';
  showSubtitle?: boolean;
  inverted?: boolean;
}

/**
 * Nadiayu Medical Shield Emblem SVG
 * Features the precision shield outline, stylized ECG heartbeat crest, and soaring dynamic 'N'
 */
export const NadiayuEmblem: React.FC<{ size?: number; className?: string; color?: string }> = ({
  size = 40,
  className = '',
  color = '#DC2626'
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 ${className}`}
    >
      {/* Outer Protective Medical Shield */}
      <path
        d="M 40 46 C 40 46, 85 46, 100 24 C 115 46, 160 46, 160 46 C 160 102, 142 144, 100 178 C 58 144, 40 102, 40 46 Z"
        stroke={color}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Top Heart Crest with ECG Pulse Line */}
      <path
        d="M 85 44 C 76 34, 76 22, 88 16 C 96 12, 100 18, 100 20 C 100 18, 104 12, 112 16 C 124 22, 124 34, 115 44 Z"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Dynamic ECG Heartbeat Blip crossing the Heart */}
      <path
        d="M 74 38 L 86 38 L 92 31 L 98 48 L 105 26 L 111 41 L 118 38 L 126 38"
        stroke={color}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Stylized Dynamic 'N' with Medical Checkmark Wing */}
      <path
        d="M 46 150 C 50 144, 60 114, 74 68 C 76 60, 83 60, 87 67 L 118 135 C 122 143, 129 144, 134 136 L 164 40 C 166 34, 162 28, 154 31 L 146 35 C 141 37, 138 42, 136 48 L 116 114 C 113 120, 107 120, 104 114 L 84 66 C 80 57, 72 56, 67 65 L 43 140 C 40 147, 43 152, 46 150 Z"
        fill={color}
      />
    </svg>
  );
};

export const NadiayuLogo: React.FC<NadiayuLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'compact',
  showSubtitle = true,
  inverted = false
}) => {
  // Dimension mapping
  const sizeMap = {
    sm: { emblem: 28, text: 'text-base', sub: 'text-[9px]', gap: 'gap-2' },
    md: { emblem: 38, text: 'text-xl', sub: 'text-sm', gap: 'gap-2.5' },
    lg: { emblem: 52, text: 'text-2xl sm:text-3xl', sub: 'text-sm sm:text-sm', gap: 'gap-3.5' },
    xl: { emblem: 72, text: 'text-4xl sm:text-5xl', sub: 'text-sm sm:text-base', gap: 'gap-4' }
  };

  const currentSize = sizeMap[size];
  const textColorPrimary = '#DC2626';
  const textColorSecondary = inverted ? '#F8FAFC' : '#0F172A';
  const subtextColor = inverted ? '#CBD5E1' : '#475569';

  if (variant === 'icon') {
    return <NadiayuEmblem size={currentSize.emblem} className={className} />;
  }

  if (variant === 'banner') {
    return (
      <div className={`flex flex-col sm:flex-row items-center sm:items-start ${currentSize.gap} ${className}`}>
        <NadiayuEmblem size={currentSize.emblem} />
        <div className="flex flex-col text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start">
            <span className={`heading font-black tracking-tight ${currentSize.text} text-[#DC2626]`}>
              N
            </span>
            <span className={`heading font-extrabold tracking-tight ${currentSize.text}`} style={{ color: textColorSecondary }}>
              adiayu
            </span>
          </div>
          {showSubtitle && (
            <p className={`font-semibold tracking-normal mt-0.5 leading-tight ${currentSize.sub}`} style={{ color: subtextColor }}>
              Emergency Medical ID &amp; Vision AI
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      <NadiayuEmblem size={currentSize.emblem} />
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <div className="flex items-baseline">
            <span className={`heading font-black tracking-tight ${currentSize.text} text-[#DC2626]`}>
              N
            </span>
            <span className={`heading font-extrabold tracking-tight ${currentSize.text}`} style={{ color: textColorSecondary }}>
              adiayu
            </span>
          </div>
          {variant === 'compact' && (
            <span className="text-[9px] mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
              VISION AI
            </span>
          )}
        </div>
        {showSubtitle && (variant === 'full') && (
          <span className={`font-medium tracking-normal mt-1 leading-none ${currentSize.sub}`} style={{ color: subtextColor }}>
            Emergency Medical ID &amp; Vision AI
          </span>
        )}
      </div>
    </div>
  );
};
