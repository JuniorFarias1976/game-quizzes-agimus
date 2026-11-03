import React, { useEffect, useState } from 'react';
import { TargetFigureData, FigureTheme, CustomTargetImageConfig } from '../types/game';

interface TargetFigureProps {
  figure: TargetFigureData;
  theme: FigureTheme;
  customImage?: CustomTargetImageConfig;
  showHitbox?: boolean;
  onClick: (figure: TargetFigureData, e: React.MouseEvent) => void;
}

export const TargetFigure: React.FC<TargetFigureProps> = ({ 
  figure, 
  theme, 
  customImage,
  showHitbox = false,
  onClick 
}) => {
  const [timeLeftPercent, setTimeLeftPercent] = useState(100);

  useEffect(() => {
    const startTime = figure.spawnTime;
    const duration = figure.durationMs;
    let animId: number;

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setTimeLeftPercent(remaining);

      if (remaining > 0) {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [figure.spawnTime, figure.durationMs]);

  // Radius of timer ring
  const strokeWidth = 3;
  const radius = figure.size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeftPercent / 100) * circumference;

  const renderShapeContent = () => {
    if (figure.isTrap) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-red-950/80 rounded-full border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse">
          <svg viewBox="0 0 24 24" className="w-3/5 h-3/5 text-red-500 drop-shadow" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="absolute -bottom-4 text-[9px] font-mono-code font-bold tracking-wider text-red-400 bg-black/90 px-1 py-0.5 rounded border border-red-900/60 uppercase whitespace-nowrap">
            NÃO CLIQUE!
          </span>
        </div>
      );
    }

    const activeTargetImageUrl = figure.targetImageUrl || (customImage?.enabled ? customImage.imageUrl : undefined);

    // Custom Target Image requested by user
    if (customImage?.enabled && activeTargetImageUrl) {
      return (
        <div 
          className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center border-2 transition-transform hover:scale-105"
          style={{
            borderColor: figure.isGolden ? '#fbbf24' : customImage.customBorderColor || '#22d3ee',
            boxShadow: figure.isGolden 
              ? '0 0 25px rgba(251,191,36,0.9)' 
              : `0 0 18px ${customImage.customBorderColor || '#22d3ee'}88`,
            backgroundColor: '#050b14'
          }}
        >
          <img
            src={activeTargetImageUrl}
            alt="Alvo Personalizado"
            className={`w-full h-full ${customImage.shapeFit === 'contain' ? 'object-contain p-1' : 'object-cover'} pointer-events-none select-none`}
            loading="eager"
          />
          {figure.isGolden && (
            <span className="absolute -top-1 bg-amber-400 text-amber-950 text-[9px] font-bold px-1.5 rounded font-display tracking-tight shadow">
              3X BÔNUS
            </span>
          )}
        </div>
      );
    }

    if (figure.isGolden) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-amber-500/20 rounded-full border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-spin-slow">
          <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,1)]" fill="currentColor">
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
          <span className="absolute -top-3 bg-amber-400 text-amber-950 text-[10px] font-bold px-1.5 py-0.2 rounded font-display tracking-tight shadow">
            3X BÔNUS
          </span>
        </div>
      );
    }

    // Themes
    if (theme === 'crystals') {
      return (
        <div 
          className="relative w-full h-full flex items-center justify-center rounded-lg shadow-lg"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${figure.color}, #050b14)`,
            boxShadow: `0 0 20px ${figure.color}88`,
            border: `2px solid ${figure.color}`
          }}
        >
          <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="6 3 18 3 22 9 12 22 2 9" fill={`${figure.color}44`} />
            <line x1="2" y1="9" x2="22" y2="9" />
            <line x1="12" y1="22" x2="9" y2="9" />
            <line x1="12" y1="22" x2="15" y2="9" />
            <line x1="6" y1="3" x2="9" y2="9" />
            <line x1="18" y1="3" x2="15" y2="9" />
          </svg>
        </div>
      );
    }

    if (theme === 'arcade') {
      return (
        <div 
          className="relative w-full h-full flex items-center justify-center rounded border-2 shadow-lg"
          style={{
            borderColor: figure.color,
            backgroundColor: '#070b13',
            boxShadow: `0 0 16px ${figure.color}`
          }}
        >
          <svg viewBox="0 0 24 24" className="w-3/4 h-3/4" style={{ color: figure.color }} fill="currentColor">
            <path d="M4 6h2v2H4zm14 0h2v2h-2zm-2 2h2v2h-2zM6 8h2v2H6zm2 2h8v2H8zm-2 2h2v4H6zm10 0h2v4h-2zm-6 2h4v2h-4zm-4 4h2v2H4zm14 0h2v2h-2zm-4 0h2v2h-2zm-4 0h2v2H8z" />
          </svg>
        </div>
      );
    }

    if (theme === 'plasma') {
      return (
        <div 
          className="relative w-full h-full flex items-center justify-center rounded-full shadow-2xl overflow-hidden"
          style={{
            background: `radial-gradient(circle at 40% 40%, #ffffff, ${figure.color} 50%, #030712 90%)`,
            boxShadow: `0 0 24px ${figure.color}`,
            border: `2px solid ${figure.color}`
          }}
        >
          <div className="w-2/3 h-2/3 rounded-full border border-white/40 animate-ping opacity-30" />
          <div className="absolute w-2 h-2 rounded-full bg-white blur-[1px]" />
        </div>
      );
    }

    // Default: Neon Geometric Shapes
    switch (figure.shape) {
      case 'star':
        return (
          <div 
            className="w-full h-full flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            style={{ filter: `drop-shadow(0 0 10px ${figure.color})` }}
          >
            <svg viewBox="0 0 24 24" className="w-full h-full" fill={figure.color}>
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          </div>
        );
      case 'diamond':
        return (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ filter: `drop-shadow(0 0 12px ${figure.color})` }}
          >
            <div 
              className="w-3/5 h-3/5 rotate-45 border-2 rounded-sm"
              style={{ borderColor: figure.color, backgroundColor: `${figure.color}33` }}
            />
          </div>
        );
      case 'hexagon':
        return (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ filter: `drop-shadow(0 0 12px ${figure.color})` }}
          >
            <svg viewBox="0 0 24 24" className="w-full h-full" fill={`${figure.color}44`} stroke={figure.color} strokeWidth="1.8">
              <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
            </svg>
          </div>
        );
      case 'triangle':
        return (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ filter: `drop-shadow(0 0 12px ${figure.color})` }}
          >
            <svg viewBox="0 0 24 24" className="w-full h-full" fill={`${figure.color}44`} stroke={figure.color} strokeWidth="2">
              <polygon points="12,3 22,20 2,20" />
            </svg>
          </div>
        );
      default: // circle
        return (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ filter: `drop-shadow(0 0 14px ${figure.color})` }}
          >
            <div 
              className="w-3/4 h-3/4 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: figure.color, backgroundColor: `${figure.color}40` }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: figure.color }} />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      onClick={(e) => onClick(figure, e)}
      className="absolute cursor-pointer transition-transform duration-75 active:scale-90 select-none group"
      style={{
        left: `${figure.x}%`,
        top: `${figure.y}%`,
        width: `${figure.size}px`,
        height: `${figure.size}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: figure.isTrap ? 25 : 20,
      }}
    >
      {/* Depleting Circular Timer Progress Gauge */}
      {!figure.isTrap && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox={`0 0 ${figure.size} ${figure.size}`}
        >
          <circle
            cx={figure.size / 2}
            cy={figure.size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={figure.size / 2}
            cy={figure.size / 2}
            r={radius}
            fill="transparent"
            stroke={timeLeftPercent < 25 ? '#ef4444' : figure.isGolden ? '#f59e0b' : figure.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Figure Graphic */}
      <div className="w-full h-full p-1.5 flex items-center justify-center">
        {renderShapeContent()}
      </div>

      {/* Debug Hitbox from Hidden Control Panel */}
      {showHitbox && (
        <div className="absolute inset-0 border border-dashed border-emerald-400 pointer-events-none rounded-full flex items-center justify-center">
          <span className="text-[9px] font-mono-code font-bold text-emerald-300 bg-black/80 px-1 rounded">
            {figure.size}px
          </span>
        </div>
      )}
    </div>
  );
};
