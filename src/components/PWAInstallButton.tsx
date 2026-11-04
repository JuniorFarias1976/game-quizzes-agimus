import React from 'react';
import { Download, Maximize2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenModal: () => void;
  primaryColor?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenModal,
  primaryColor = '#00d2ff',
  variant = 'compact',
}) => {
  const { isInstalled, isFullscreen } = usePWAInstall();

  // If running in standalone and fullscreen, don't clutter UI
  if (isInstalled && isFullscreen) {
    return null;
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={onOpenModal}
        className="px-4 py-2 rounded-xl text-xs font-bold font-mono-code flex items-center gap-2 border transition shadow-sm active:scale-95"
        style={{
          borderColor: `${primaryColor}66`,
          backgroundColor: `${primaryColor}15`,
          color: primaryColor,
        }}
        title="Instalar aplicativo para rodar sem barra de navegador"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App (Sem Barra)</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenModal}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/60 transition shadow-sm active:scale-95"
      title="Instalar App ou Ativar Tela Cheia (Oculta barra do navegador)"
    >
      <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
      <span className="hidden sm:inline font-mono-code text-[11px] font-bold">Sem Barra</span>
    </button>
  );
};
