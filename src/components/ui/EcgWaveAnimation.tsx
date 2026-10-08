import React, { useEffect, useRef } from 'react';

interface EcgWaveAnimationProps {
  heartRate?: number;
  color?: string;
  height?: number;
  className?: string;
  isAlert?: boolean;
}

export const EcgWaveAnimation: React.FC<EcgWaveAnimationProps> = ({
  heartRate = 80,
  color = '#2563EB',
  height = 36,
  className = '',
  isAlert = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    // Normal ECG pattern normalized coordinates [x, y]
    // 0 = center line, -1 = high peak, 1 = low dip
    const ecgPattern = [
      { x: 0.0, y: 0.0 },
      { x: 0.15, y: 0.0 },
      { x: 0.22, y: -0.15 }, // P wave
      { x: 0.28, y: 0.0 },
      { x: 0.38, y: 0.0 },
      { x: 0.42, y: 0.15 },  // Q dip
      { x: 0.48, y: -0.9 },  // R peak
      { x: 0.54, y: 0.35 },  // S dip
      { x: 0.58, y: 0.0 },
      { x: 0.68, y: -0.22 }, // T wave
      { x: 0.78, y: 0.0 },
      { x: 1.0, y: 0.0 },
    ];

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;
      const amplitude = h * 0.42;

      ctx.clearRect(0, 0, width, h);

      // Speed depends on heart rate
      const speed = (heartRate / 60) * 1.5;
      offset = (offset + speed) % width;

      // Draw subtle grid lines
      ctx.strokeStyle = isAlert ? 'rgba(239, 68, 68, 0.08)' : 'rgba(37, 99, 235, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 16) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 12) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw ECG wave
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;

      const patternWidth = 120;

      for (let px = 0; px <= width; px += 2) {
        const adjustedX = (px + offset) % patternWidth;
        const normalizedX = adjustedX / patternWidth;

        // Find position in pattern
        let yNorm = 0;
        for (let i = 0; i < ecgPattern.length - 1; i++) {
          if (normalizedX >= ecgPattern[i].x && normalizedX <= ecgPattern[i + 1].x) {
            const t = (normalizedX - ecgPattern[i].x) / (ecgPattern[i + 1].x - ecgPattern[i].x);
            // smooth cosine interpolation
            const smoothT = (1 - Math.cos(t * Math.PI)) / 2;
            yNorm = ecgPattern[i].y + (ecgPattern[i + 1].y - ecgPattern[i].y) * smoothT;
            break;
          }
        }

        const py = centerY + yNorm * amplitude;
        if (px === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw trailing scan blip
      const sweepX = (width - offset * 1.5) % width;
      const gradient = ctx.createLinearGradient(sweepX - 25, 0, sweepX + 5, 0);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, color);

      ctx.beginPath();
      ctx.arc(sweepX, centerY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [heartRate, color, isAlert]);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-950/5 border border-slate-200/60 ${className}`}>
      <canvas
        ref={canvasRef}
        width={240}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
};
