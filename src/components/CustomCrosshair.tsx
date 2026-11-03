import React from 'react';
import { CrosshairType } from '../types/game';

interface CustomCrosshairProps {
  x: number;
  y: number;
  type: CrosshairType;
  visible: boolean;
}

export const CustomCrosshair: React.FC<CustomCrosshairProps> = ({ x, y, type, visible }) => {
  if (!visible) return null;

  const renderGraphic = () => {
    switch (type) {
      case 'cyan_ring':
        return (
          <div className="relative w-10 h-10 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-8 h-8 rounded-full border border-cyan-400 shadow-[0_0_10px_#22d3ee] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
            </div>
            <div className="absolute w-1 h-3 -top-1 bg-cyan-400" />
            <div className="absolute w-1 h-3 -bottom-1 bg-cyan-400" />
            <div className="absolute h-1 w-3 -left-1 bg-cyan-400" />
            <div className="absolute h-1 w-3 -right-1 bg-cyan-400" />
          </div>
        );

      case 'ninja_shuriken':
        return (
          <div className="relative w-10 h-10 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none rotate-45">
            <div className="w-9 h-9 border border-purple-500 shadow-[0_0_12px_#a855f7] rotate-12 flex items-center justify-center">
              <div className="w-2 h-2 bg-pink-400 rotate-45" />
            </div>
          </div>
        );

      case 'quantum_vortex':
        return (
          <div className="relative w-10 h-10 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-spin-slow">
            <div className="w-8 h-8 rounded-full border border-dashed border-indigo-400 shadow-[0_0_12px_#818cf8]" />
            <div className="absolute w-4 h-4 rounded-full border border-emerald-400" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
          </div>
        );

      case 'golden_cross':
        return (
          <div className="relative w-12 h-12 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="absolute w-10 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#fbbf24]" />
            <div className="absolute h-10 w-0.5 bg-gradient-to-b from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#fbbf24]" />
            <div className="w-3.5 h-3.5 border border-amber-300 rounded-sm rotate-45" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-200" />
          </div>
        );

      case 'cyber_eye':
        return (
          <div className="relative w-12 h-12 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-400 shadow-[0_0_15px_#34d399] flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border border-emerald-200 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              </div>
            </div>
            <div className="absolute w-12 h-0.5 bg-emerald-400/40" />
            <div className="absolute h-12 w-0.5 bg-emerald-400/40" />
          </div>
        );

      default: // 'reticle'
        return (
          <div className="relative w-8 h-8 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-6 h-6 rounded-full border border-red-500/80 shadow-[0_0_8px_#ef4444] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            </div>
            <div className="absolute w-0.5 h-2 -top-1 bg-red-500" />
            <div className="absolute w-0.5 h-2 -bottom-1 bg-red-500" />
            <div className="absolute h-0.5 w-2 -left-1 bg-red-500" />
            <div className="absolute h-0.5 w-2 -right-1 bg-red-500" />
          </div>
        );
    }
  };

  return (
    <div
      className="fixed z-50 pointer-events-none transition-transform duration-0 ease-linear"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {renderGraphic()}
    </div>
  );
};
