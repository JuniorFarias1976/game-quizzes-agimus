import React from 'react';
import { 
  Download, 
  Maximize2, 
  Minimize2, 
  Smartphone, 
  Monitor, 
  Share2, 
  PlusSquare, 
  X, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor?: string;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  primaryColor = '#00d2ff',
}) => {
  const { isInstallable, isInstalled, isIOS, isFullscreen, install, toggleFullscreen } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        onClose();
      }
    }
  };

  const handleToggleFullscreen = async () => {
    await toggleFullscreen();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#090e1a] border-2 rounded-2xl shadow-[0_0_50px_rgba(0,210,255,0.25)] flex flex-col max-h-[92vh] overflow-hidden"
        style={{ borderColor: `${primaryColor}88` }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <Download className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-display font-black text-white tracking-wide">
                  Instalar Aplicativo (Modo Kiosk)
                </h3>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/60 text-[9px] font-mono-code font-bold text-cyan-300">
                  SEM BARRA
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Execute em tela inteira sem abas, barra de URL ou menus do navegador.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Quick Instant Fullscreen Option */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-cyan-400" />
                <span>Ocultar Barra Imediatamente (Tela Cheia)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Remove a barra do navegador agora mesmo neste dispositivo com um toque.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="px-3.5 py-2 rounded-lg font-mono-code font-bold text-xs flex items-center gap-1.5 transition shadow active:scale-95 text-slate-950"
              style={{ backgroundColor: primaryColor }}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Tela Cheia</span>
                </>
              )}
            </button>
          </div>

          {/* Already installed status banner */}
          {isInstalled && (
            <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <div>
                <strong>Aplicativo já está instalado no dispositivo!</strong>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">
                  Você está executando no modo isolado nativo (PWA Standalone).
                </p>
              </div>
            </div>
          )}

          {/* Native Install Button (Chrome, Edge, Android) */}
          {isInstallable && (
            <div className="p-4 bg-cyan-950/40 border border-cyan-500/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span>Instalação Direta com 1 Clique</span>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono-code font-bold">RECOMENDADO</span>
              </div>
              <p className="text-xs text-slate-300">
                Instale o jogo no seu computador ou celular. Um atalho é criado e ele abre em janela limpa como um app nativo.
              </p>
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl font-display font-bold text-sm text-slate-950 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
                style={{ backgroundColor: primaryColor }}
              >
                <Download className="w-4 h-4" />
                <span>Instalar Agora no Dispositivo</span>
              </button>
            </div>
          )}

          {/* Guide for iOS (Safari on iPhone / iPad) */}
          {isIOS && (
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Instalar no iPhone / iPad (Safari)</span>
              </div>
              <p className="text-xs text-slate-300">
                O iOS não suporta instalação automática direta, mas você pode adicionar à tela inicial facilmente:
              </p>
              <ol className="space-y-2 text-xs text-slate-300 pl-1">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0">1</span>
                  <span>Toque no botão <strong>Compartilhar</strong> <Share2 className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /> na barra inferior do Safari.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0">2</span>
                  <span>Role o menu para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-cyan-400" />.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0">3</span>
                  <span>Toque em <strong>Adicionar</strong> no canto superior direito.</span>
                </li>
              </ol>
              <div className="p-2.5 bg-slate-950 rounded-lg text-[11px] text-cyan-300">
                ✓ Ao abrir pelo ícone na tela de início, o jogo rodará sem qualquer barra do navegador!
              </div>
            </div>
          )}

          {/* Guide for Chrome / Edge / Windows / Android */}
          {!isIOS && !isInstallable && !isInstalled && (
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Instalar pelo Navegador (Chrome / Edge / Android)</span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0">A</span>
                  <span><strong>No Computador:</strong> Clique no ícone de <strong>Instalar</strong> <Download className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /> no final da barra de endereços do Chrome/Edge (ao lado da estrela de favoritos).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0">B</span>
                  <span><strong>No Celular Android:</strong> Toque no menu de três pontinhos <strong>(⋮)</strong> do Chrome e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
                </div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg text-[11px] text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>O aplicativo abrirá com janela dedicada sem barra de navegação, perfeito para quiosques!</span>
              </div>
            </div>
          )}

          {/* Pro-tip for Kiosk / F11 */}
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs text-slate-400">
            <span>Dica para quiosques com teclado:</span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-400 font-mono-code font-bold">
              Pressione F11
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition"
          >
            Entendido / Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
