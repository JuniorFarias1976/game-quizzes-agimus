import React from 'react';
import { Crosshair, Trophy, Globe, Play, Volume2, VolumeX, Star, Zap, ShieldCheck, Lock, UserPlus } from 'lucide-react';
import { PlayerStats, CompanyLogoConfig, BrandingColorsConfig } from '../types/game';

interface NavbarProps {
  activeTab: 'arena' | 'levels' | 'leaderboard' | 'gallery';
  onSelectTab: (tab: 'arena' | 'levels' | 'leaderboard' | 'gallery') => void;
  stats: PlayerStats;
  soundEnabled: boolean;
  isAdminLoggedIn: boolean;
  onOpenAdmin: () => void;
  onToggleSound: () => void;
  onOpenCertificate: () => void;
  logo?: CompanyLogoConfig;
  branding?: BrandingColorsConfig;
  onOpenRegistration?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  stats,
  soundEnabled,
  isAdminLoggedIn,
  onOpenAdmin,
  onToggleSound,
  onOpenCertificate,
  logo,
  branding,
  onOpenRegistration,
}) => {
  const totalStars = Object.values(stats.levelProgress).reduce((acc, p) => acc + p.stars, 0);
  const primaryColor = branding?.primaryColor || '#00d2ff';
  const headerBg = branding?.headerBackgroundColor || '#060a14';
  const headerStyle = branding?.headerStyle || 'glass';

  const headerInlineStyle: React.CSSProperties = {
    borderBottomColor: `${primaryColor}30`,
    ...(headerStyle === 'solid'
      ? { backgroundColor: headerBg }
      : headerStyle === 'gradient'
      ? { background: `linear-gradient(to right, ${headerBg}, ${primaryColor}25, ${headerBg})` }
      : { backgroundColor: `${headerBg}e6`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }),
  };

  return (
    <header 
      className="w-full border-b sticky top-0 z-40 transition-colors duration-200"
      style={headerInlineStyle}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div 
          onClick={() => onSelectTab('arena')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          {logo?.enabled && logo?.logoUrl ? (
            <div className="flex items-center gap-2.5">
              <img
                src={logo.logoUrl}
                alt={logo.companyName || 'Logo'}
                className="h-9 max-w-[120px] sm:max-w-[150px] object-contain rounded-lg p-0.5 bg-slate-900/60 border border-slate-700/60 group-hover:scale-105 transition-transform"
              />
              <div className="hidden sm:block">
                <div className="font-display font-black text-sm text-white tracking-wider flex items-center gap-1.5">
                  <span>{logo.companyName || 'AGIMUS'}</span>
                  <span 
                    className="text-[9px] px-1.5 py-0.2 rounded font-mono-code font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${primaryColor}25`, color: primaryColor }}
                  >
                    {logo.subTitle || 'REFLEX'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono-code">
                  QUIOSQUE DE REAÇÃO RÁPIDA
                </div>
              </div>
            </div>
          ) : (
            <>
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 15px ${primaryColor}66`,
                }}
              >
                <Zap className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="font-display font-black text-lg text-white tracking-wider flex items-center gap-1">
                  <span>{logo?.companyName ? logo.companyName.toUpperCase() : 'AGIMUS'}</span>
                  <span style={{ color: primaryColor }}>REFLEX</span>
                </div>
                <div className="text-[10px] text-slate-400 -mt-1 font-mono-code">
                  {logo?.subTitle || 'ARENA DE REAÇÃO RÁPIDA'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Primary Navigation Tabs (Only visible when Admin is logged in, keeping clean kiosk view for players) */}
        {isAdminLoggedIn && (
          <nav className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => onSelectTab('arena')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'arena'
                  ? 'text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={activeTab === 'arena' ? { backgroundColor: primaryColor } : undefined}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Jogar</span>
            </button>

            <button
              onClick={() => onSelectTab('levels')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'levels'
                  ? 'text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={activeTab === 'levels' ? { backgroundColor: primaryColor } : undefined}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Fases</span>
            </button>

            <button
              onClick={() => onSelectTab('leaderboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'leaderboard'
                  ? 'text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={activeTab === 'leaderboard' ? { backgroundColor: primaryColor } : undefined}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Ranking</span>
            </button>

            <button
              onClick={() => onSelectTab('gallery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'gallery'
                  ? 'text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={activeTab === 'gallery' ? { backgroundColor: primaryColor } : undefined}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Prêmios</span>
            </button>
          </nav>
        )}

        {/* Right Status / Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Registration Button (Only when Admin is logged in) */}
          {isAdminLoggedIn && onOpenRegistration && (
            <button
              onClick={onOpenRegistration}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition"
              title="Formulário de Inscrição do Jogador"
            >
              <UserPlus className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>Inscrição</span>
            </button>
          )}

          {/* Stars Count */}
          <div 
            onClick={onOpenCertificate}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs cursor-pointer hover:border-amber-400/50 transition"
            title="Ver Certificado de Piloto"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-mono-code font-bold text-amber-300">{totalStars}★</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition"
            title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" style={{ color: primaryColor }} />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Admin Mode / Control Panel Button */}
          {isAdminLoggedIn ? (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border bg-emerald-950/90 border-emerald-500/70 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)] transition hover:bg-emerald-900/80 active:scale-95"
              title="Modo Administrador Ativo (Clique para abrir o painel)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono-code font-bold text-[11px]">
                PAINEL
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 px-2.5 py-1.5 text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400/80 rounded-lg text-xs transition shadow-sm active:scale-95"
              title="Abrir Painel de Controle (Senha: admin123 ou ALT+C)"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-semibold hidden sm:inline">Painel Admin</span>
            </button>
          )}

          {/* Player Badge */}
          <div 
            onClick={onOpenCertificate}
            className="flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-cyan-400/50 transition"
            title="Clique para ver o Certificado do Jogador"
          >
            <span className="text-base">{stats.country}</span>
            <span className="text-xs font-semibold text-white max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline">
              {stats.playerName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
