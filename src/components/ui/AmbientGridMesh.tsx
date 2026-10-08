import React from 'react';

interface AmbientGridMeshProps {
  className?: string;
  glowColor?: string;
}

export const AmbientGridMesh: React.FC<AmbientGridMeshProps> = ({
  className = '',
  glowColor = 'rgba(37, 99, 235, 0.05)',
}) => {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}>
      {/* Background subtle dot grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.35]" 
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 80%)',
        }}
      />

      {/* Static GPU-friendly Ambient Blobs (no continuous CPU/GPU recalculations) */}
      <div
        className="absolute -top-24 left-1/4 w-96 h-96 rounded-full blur-2xl opacity-40"
        style={{ 
          background: glowColor,
          transform: 'translateZ(0)',
        }}
      />

      <div
        className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-2xl opacity-30"
        style={{ 
          background: 'rgba(220, 38, 38, 0.03)',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  );
};
