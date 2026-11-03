import React, { useState, useRef } from 'react';
import { 
  CustomTargetImageConfig, 
  DevControlOverrides 
} from '../types/game';
import { 
  Sliders, 
  Image as ImageIcon, 
  Upload, 
  Link, 
  X, 
  Check, 
  Trash2, 
  Zap, 
  RotateCcw, 
  Eye, 
  ShieldAlert, 
  Key, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface HiddenControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  customImage: CustomTargetImageConfig;
  onUpdateCustomImage: (config: CustomTargetImageConfig) => void;
  devOverrides: DevControlOverrides;
  onUpdateDevOverrides: (overrides: Partial<DevControlOverrides>) => void;
  onUnlockAll: () => void;
  onResetProgress: () => void;
  onOpenAdmin?: () => void;
}

// Preset Targets as instant vector data URIs (no external network needed)
const PRESET_TARGETS: { name: string; icon: string; url: string }[] = [
  {
    name: 'Alvo Tático Clássico',
    icon: '🎯',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23dc2626"/><circle cx="50" cy="50" r="38" fill="white"/><circle cx="50" cy="50" r="28" fill="%23dc2626"/><circle cx="50" cy="50" r="18" fill="white"/><circle cx="50" cy="50" r="8" fill="%23dc2626"/><circle cx="50" cy="50" r="3" fill="%23fef08a"/></svg>`,
  },
  {
    name: 'Alien Cyberpunk',
    icon: '👾',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%230f172a"/><path d="M25 40h10v10H25zm40 0h10v10H65zm-30 20h30v10H35z" fill="%2322d3ee"/><circle cx="30" cy="45" r="4" fill="%23ec4899"/><circle cx="70" cy="45" r="4" fill="%23ec4899"/></svg>`,
  },
  {
    name: 'Moeda Gamer 1UP',
    icon: '🪙',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23f59e0b" stroke="%23fbbf24" stroke-width="4"/><circle cx="50" cy="50" r="36" fill="%23d97706"/><polygon points="50,22 58,38 76,38 62,49 67,67 50,56 33,67 38,49 24,38 42,38" fill="%23fef3c7"/></svg>`,
  },
  {
    name: 'Chefe Cool Sunglasses',
    icon: '😎',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23facc15"/><path d="M20 40 Q35 36 50 40 Q65 36 80 40 Q80 58 65 58 Q50 58 50 44 Q50 58 35 58 Q20 58 20 40 Z" fill="%230f172a"/><path d="M36 68 Q50 78 64 68" stroke="%23b45309" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`,
  },
  {
    name: 'Orbe de Fogo Plasma',
    icon: '🔥',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23ef4444"/><circle cx="50" cy="50" r="34" fill="%23f97316"/><circle cx="50" cy="50" r="22" fill="%23facc15"/><circle cx="50" cy="50" r="10" fill="white"/></svg>`,
  },
  {
    name: 'Gatinho Ninja',
    icon: '🐱',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="55" r="38" fill="%23475569"/><polygon points="20,20 40,35 25,50" fill="%23334155"/><polygon points="80,20 60,35 75,50" fill="%23334155"/><ellipse cx="38" cy="50" rx="5" ry="7" fill="%2322d3ee"/><ellipse cx="62" cy="50" rx="5" ry="7" fill="%2322d3ee"/><polygon points="50,58 46,63 54,63" fill="%23f43f5e"/></svg>`,
  }
];

const BORDER_COLORS = ['#22d3ee', '#ec4899', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];

export const HiddenControlPanel: React.FC<HiddenControlPanelProps> = ({
  isOpen,
  onClose,
  customImage,
  onUpdateCustomImage,
  devOverrides,
  onUpdateDevOverrides,
  onUnlockAll,
  onResetProgress,
  onOpenAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'difficulty' | 'cheats'>('image');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showTempNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Local file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUrlError('O arquivo selecionado não é uma imagem válida.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onUpdateCustomImage({
          ...customImage,
          enabled: true,
          imageUrl: result,
          imageName: file.name,
        });
        showTempNotify('Imagem local carregada com sucesso!');
        setUrlError('');
      }
    };
    reader.readAsDataURL(file);
  };

  // URL input handler
  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput); // validate URL format
      onUpdateCustomImage({
        ...customImage,
        enabled: true,
        imageUrl: urlInput.trim(),
        imageName: 'Imagem da Web',
      });
      showTempNotify('Imagem por link da web aplicada!');
      setUrlInput('');
      setUrlError('');
    } catch {
      setUrlError('Por favor insira um URL de imagem válido (ex: https://...)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0b1120] border-2 border-cyan-500/50 rounded-2xl p-6 sm:p-7 shadow-[0_0_40px_rgba(34,211,238,0.2)] overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Glow corner accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/60 text-[10px] font-mono-code font-bold text-cyan-400">
                ATALHO: ALT + C
              </span>
              <span className="text-[10px] font-mono-code text-slate-400">PAINEL OCULTO</span>
            </div>
            <h2 className="text-xl font-display font-black text-white tracking-wide mt-1 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Painel Secreto de Controle & Imagem
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition"
            title="Fechar (ou pressione ALT + C)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Admin Mode Banner */}
        {onOpenAdmin && (
          <div className="mb-4 p-3 bg-gradient-to-r from-cyan-950/70 via-indigo-950/70 to-purple-950/70 border border-cyan-500/40 rounded-xl flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Modo Administrador Completo</span>
                  <span className="text-[9px] bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono-code px-1 rounded">
                    REQUER SENHA
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Gerencie todo o app, edite as 6 fases, modere o ranking global e altere a senha mestra.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition whitespace-nowrap shadow-sm active:scale-95"
            >
              Entrar como Admin →
            </button>
          </div>
        )}

        {/* Notification Toast */}
        {notification && (
          <div className="mb-4 p-2.5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-pulse">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/90 border border-slate-800 rounded-xl mb-5">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'image'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Imagem do Alvo</span>
          </button>

          <button
            onClick={() => setActiveTab('difficulty')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'difficulty'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Ajustes & Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('cheats')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'cheats'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Desbloqueios & Cheats</span>
          </button>
        </div>

        {/* Tab 1: Imagem do Alvo Personalizada */}
        {activeTab === 'image' && (
          <div className="space-y-5">
            {/* Toggle Enable Custom Image */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Ativar Imagem Personalizada nos Alvos</span>
                  {customImage.enabled && customImage.imageUrl && (
                    <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 text-[9px] font-bold rounded">
                      ATIVA
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Substitui as figuras geométricas padrão pela sua própria imagem no jogo.
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={customImage.enabled}
                  onChange={(e) =>
                    onUpdateCustomImage({ ...customImage, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
              </label>
            </div>

            {/* Live Target Preview */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="relative w-18 h-18 rounded-full overflow-hidden flex items-center justify-center border-2 shadow-xl"
                  style={{
                    borderColor: customImage.customBorderColor || '#22d3ee',
                    boxShadow: `0 0 20px ${customImage.customBorderColor || '#22d3ee'}88`,
                    backgroundColor: '#050b14',
                  }}
                >
                  {customImage.imageUrl ? (
                    <img
                      src={customImage.imageUrl}
                      alt="Prévia do Alvo"
                      className={`w-full h-full ${
                        customImage.shapeFit === 'contain' ? 'object-contain p-1' : 'object-cover'
                      }`}
                    />
                  ) : (
                    <div className="text-xs text-slate-500 text-center font-mono-code p-1">
                      Sem Imagem
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-white">Pré-visualização do Alvo em Jogo</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {customImage.imageUrl
                      ? `Origem: ${customImage.imageName || 'Imagem Definida'}`
                      : 'Nenhuma foto carregada ainda'}
                  </div>
                  {customImage.imageUrl && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          onUpdateCustomImage({
                            ...customImage,
                            shapeFit: customImage.shapeFit === 'cover' ? 'contain' : 'cover',
                          })
                        }
                        className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                      >
                        Ajuste: {customImage.shapeFit === 'cover' ? 'Preencher (Cover)' : 'Conter (Contain)'}
                      </button>

                      <button
                        onClick={() => {
                          onUpdateCustomImage({
                            ...customImage,
                            imageUrl: '',
                            imageName: '',
                            enabled: false,
                          });
                          showTempNotify('Imagem removida.');
                        }}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-rose-950 text-rose-300 hover:bg-rose-900 rounded border border-rose-800 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Border Color Picker */}
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Cor do Brilho
                </div>
                <div className="flex items-center gap-1.5">
                  {BORDER_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdateCustomImage({ ...customImage, customBorderColor: c })}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        customImage.customBorderColor === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Upload from Local File */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Carregar Imagem do seu Computador</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono-code">PNG, JPG, GIF, WebP</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-white bg-cyan-600/90 hover:bg-cyan-500 rounded-xl transition shadow active:scale-95 border border-cyan-400/40"
              >
                <Upload className="w-4 h-4" />
                Escolher Arquivo de Imagem para o Alvo
              </button>
            </div>

            {/* Or Paste Image URL */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
                <Link className="w-3.5 h-3.5 text-purple-400" />
                <span>Ou Cole o Link (URL) de uma Imagem da Internet</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/minha-foto.png"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleApplyUrl}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition"
                >
                  Aplicar URL
                </button>
              </div>

              {urlError && <div className="text-[11px] text-rose-400 mt-1">{urlError}</div>}
            </div>

            {/* Presets Gallery */}
            <div>
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ou Escolha uma das Figuras Prontas</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_TARGETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      onUpdateCustomImage({
                        ...customImage,
                        enabled: true,
                        imageUrl: p.url,
                        imageName: p.name,
                      });
                      showTempNotify(`Alvo alterado para: ${p.name}`);
                    }}
                    className="p-2.5 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl flex items-center gap-2.5 transition text-left"
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400">1-clique</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Ajustes & Sandbox */}
        {activeTab === 'difficulty' && (
          <div className="space-y-4">
            {/* Target Duration Override */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white">Tempo de Exposição do Alvo</span>
                <span className="text-xs font-mono-code font-bold text-cyan-400">
                  {devOverrides.targetDurationOverrideMs
                    ? `${devOverrides.targetDurationOverrideMs}ms`
                    : 'Padrão da Fase'}
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="2500"
                step="50"
                value={devOverrides.targetDurationOverrideMs || 1000}
                onChange={(e) =>
                  onUpdateDevOverrides({ targetDurationOverrideMs: Number(e.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Ultra-rápido (200ms)</span>
                <button
                  onClick={() => onUpdateDevOverrides({ targetDurationOverrideMs: null })}
                  className="text-cyan-400 hover:underline"
                >
                  Restaurar Padrão
                </button>
                <span>Fácil / Treino (2500ms)</span>
              </div>
            </div>

            {/* Target Size Override */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white">Tamanho das Figuras</span>
                <span className="text-xs font-mono-code font-bold text-emerald-400">
                  {devOverrides.targetSizeOverridePx
                    ? `${devOverrides.targetSizeOverridePx}px`
                    : 'Padrão da Fase'}
                </span>
              </div>
              <input
                type="range"
                min="35"
                max="120"
                step="2"
                value={devOverrides.targetSizeOverridePx || 70}
                onChange={(e) =>
                  onUpdateDevOverrides({ targetSizeOverridePx: Number(e.target.value) })
                }
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Pequeno (35px)</span>
                <button
                  onClick={() => onUpdateDevOverrides({ targetSizeOverridePx: null })}
                  className="text-emerald-400 hover:underline"
                >
                  Restaurar Padrão
                </button>
                <span>Gigante (120px)</span>
              </div>
            </div>

            {/* Moving Targets Override */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div>
                <div className="text-xs font-bold text-white">Forçar Alvos em Movimento</div>
                <div className="text-[11px] text-slate-400">
                  Faz todas as figuras derivarem e flutuarem pela arena em qualquer fase.
                </div>
              </div>
              <button
                onClick={() =>
                  onUpdateDevOverrides({
                    movingTargetsOverride:
                      devOverrides.movingTargetsOverride === true
                        ? false
                        : devOverrides.movingTargetsOverride === false
                        ? null
                        : true,
                  })
                }
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                  devOverrides.movingTargetsOverride === true
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : devOverrides.movingTargetsOverride === false
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {devOverrides.movingTargetsOverride === true
                  ? 'Forçar Ativo'
                  : devOverrides.movingTargetsOverride === false
                  ? 'Forçar Parado'
                  : 'Automático (Fase)'}
              </button>
            </div>

            {/* Show Hitboxes Debug */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exibir Hitboxes / Coordenadas de Colisão</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Mostra anel tracejado e diâmetro exato do alvo para diagnóstico.
                </div>
              </div>
              <input
                type="checkbox"
                checked={devOverrides.showHitboxes}
                onChange={(e) => onUpdateDevOverrides({ showHitboxes: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Cheats & Desbloqueios Rápidos */}
        {activeTab === 'cheats' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-xs font-bold text-white mb-1">
                Desbloqueio Total de Fases & Miras
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Desbloqueia instantaneamente todas as 6 fases da campanha, todas as retículas holográficas e todos os temas de figuras para teste.
              </p>
              <button
                onClick={() => {
                  onUnlockAll();
                  showTempNotify('Todas as Fases, Miras e Prêmios foram desbloqueados!');
                }}
                className="w-full py-2 px-4 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl transition shadow active:scale-95"
              >
                Desbloquear Tudo Imediatamente
              </button>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-xs font-bold text-white mb-1">
                Redefinir Dados de Fábrica
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Limpa os recordes locais salvos e retorna ao estado inicial limpo de jogador cadete.
              </p>
              <button
                onClick={() => {
                  if (confirm('Deseja realmente redefinir todo o progresso do jogo?')) {
                    onResetProgress();
                    showTempNotify('Progresso e recordes redefinidos.');
                  }
                }}
                className="w-full py-2 px-4 text-xs font-semibold text-rose-300 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 rounded-xl transition"
              >
                Resetar Progresso para Padrão
              </button>
            </div>
          </div>
        )}

        {/* Footer / Shortcut Reminder */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono-code text-[11px]">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pressione <strong className="text-white">ALT + C</strong> a qualquer hora para alternar este painel</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
