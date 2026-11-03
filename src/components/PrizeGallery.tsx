import React from 'react';
import { PlayerStats, CrosshairType, FigureTheme } from '../types/game';
import { LEVELS } from '../utils/levels';
import { Trophy, Award, Target, Sparkles, Check, Lock, Palette } from 'lucide-react';

interface PrizeGalleryProps {
  stats: PlayerStats;
  onEquipCrosshair: (crosshair: CrosshairType) => void;
  onEquipTheme: (theme: FigureTheme) => void;
  onOpenCertificate: () => void;
}

const ALL_CROSSHAIRS: { id: CrosshairType; name: string; icon: string; unlockAt: string }[] = [
  { id: 'reticle', name: 'Retícula Tática Padrão', icon: '🎯', unlockAt: 'Disponível Inicialmente' },
  { id: 'cyan_ring', name: 'Anel Ciano Neon', icon: '⭕', unlockAt: 'Fase 1 (Classificação S+)' },
  { id: 'ninja_shuriken', name: 'Shuriken Cyberpunk', icon: '✴️', unlockAt: 'Fase 2 (Classificação S+)' },
  { id: 'quantum_vortex', name: 'Vórtice Quântico', icon: '🌀', unlockAt: 'Fase 3 (Classificação S+)' },
  { id: 'golden_cross', name: 'Plasma Imperial Dourada', icon: '⚔️', unlockAt: 'Fase 4 (Classificação S+)' },
  { id: 'cyber_eye', name: 'Olho Cósmico Holográfico', icon: '👁️', unlockAt: 'Fase 6 (Classificação S+)' },
];

const ALL_THEMES: { id: FigureTheme; name: string; desc: string; icon: string; unlockAt: string }[] = [
  { id: 'neon', name: 'Neons Geométricos', desc: 'Formas poligonais vibrantes com brilho elétrico', icon: '✨', unlockAt: 'Disponível Inicialmente' },
  { id: 'crystals', name: 'Cristais Cósmicos', desc: 'Gemas preciosas multifacetadas', icon: '💎', unlockAt: 'Fase 2 (Ouro ou superior)' },
  { id: 'arcade', name: 'Retro Pixel Invaders', desc: 'Naves e aliens clássicos de arcade dos anos 80', icon: '👾', unlockAt: 'Fase 3 (Ouro ou superior)' },
  { id: 'plasma', name: 'Orbes de Plasma', desc: 'Esferas concentradas de radiação iônica', icon: '🔮', unlockAt: 'Fase 4 (Ouro ou superior)' },
];

export const PrizeGallery: React.FC<PrizeGalleryProps> = ({
  stats,
  onEquipCrosshair,
  onEquipTheme,
  onOpenCertificate,
}) => {
  // Calculate total stars
  const totalStars = Object.values(stats.levelProgress).reduce((acc, p) => acc + p.stars, 0);

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">
              Galeria de Prêmios & Arsenal
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Troféus, skins de alvos e miras de alta precisão conquistadas pelo seu tempo de reação.
          </p>
        </div>

        {/* Certificate Call-to-Action */}
        <button
          onClick={onOpenCertificate}
          className="px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 rounded-xl transition shadow-[0_0_15px_rgba(251,191,36,0.25)] active:scale-95"
        >
          <Award className="w-4 h-4 text-amber-200" />
          Gerar Certificado de Piloto
        </button>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Total de Estrelas</div>
          <div className="text-2xl font-display font-black text-amber-400 mt-1 flex items-center gap-1.5">
            <span>{totalStars}</span>
            <span className="text-base text-amber-500">★</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Melhor Reflexo</div>
          <div className="text-2xl font-mono-code font-bold text-cyan-400 mt-1">
            {stats.bestReactionEverMs > 0 ? `${stats.bestReactionEverMs}ms` : '--'}
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Total de Acertos</div>
          <div className="text-2xl font-mono-code font-bold text-emerald-400 mt-1">
            {stats.totalHits}
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Mira Equipada</div>
          <div className="text-sm font-semibold text-white mt-1 truncate">
            {ALL_CROSSHAIRS.find((c) => c.id === stats.equippedCrosshair)?.name || 'Padrão'}
          </div>
        </div>
      </div>

      {/* Section 1: Retículas & Miras Customizadas */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display">
            Miras Holográficas Desbloqueáveis
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALL_CROSSHAIRS.map((c) => {
            const isUnlocked = stats.unlockedCrosshairs.includes(c.id);
            const isEquipped = stats.equippedCrosshair === c.id;

            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition ${
                  isEquipped
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                    : isUnlocked
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/60 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                    {c.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {c.name}
                      {isEquipped && (
                        <span className="text-[9px] font-bold bg-cyan-400 text-slate-950 px-1 py-0.2 rounded uppercase">
                          Em Uso
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {isUnlocked ? 'Desbloqueado' : c.unlockAt}
                    </div>
                  </div>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => onEquipCrosshair(c.id)}
                    disabled={isEquipped}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isEquipped
                        ? 'bg-cyan-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                    }`}
                  >
                    {isEquipped ? 'Equipado' : 'Equipar'}
                  </button>
                ) : (
                  <Lock className="w-4 h-4 text-slate-600" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Temas de Figuras */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display">
            Skins & Temas de Alvos
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_THEMES.map((t) => {
            const isUnlocked = stats.unlockedThemes.includes(t.id);
            const isEquipped = stats.equippedTheme === t.id;

            return (
              <div
                key={t.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition ${
                  isEquipped
                    ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : isUnlocked
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/60 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                    {t.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {t.name}
                      {isEquipped && (
                        <span className="text-[9px] font-bold bg-purple-400 text-slate-950 px-1 py-0.2 rounded uppercase">
                          Em Uso
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{t.desc}</div>
                    <div className="text-[10px] text-indigo-400 mt-0.5">
                      {isUnlocked ? 'Desbloqueado' : t.unlockAt}
                    </div>
                  </div>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => onEquipTheme(t.id)}
                    disabled={isEquipped}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isEquipped
                        ? 'bg-purple-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-purple-300 hover:bg-slate-700'
                    }`}
                  >
                    {isEquipped ? 'Equipado' : 'Equipar'}
                  </button>
                ) : (
                  <Lock className="w-4 h-4 text-slate-600" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Troféus de Campanha */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display">
            Troféus de Maestria por Fase
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LEVELS.map((lvl) => {
            const prog = stats.levelProgress[lvl.id];
            const isCompleted = prog?.completed;
            const trophy = lvl.prizes.gold;

            return (
              <div
                key={lvl.id}
                className={`p-4 rounded-xl border flex items-center gap-3 transition ${
                  isCompleted
                    ? 'bg-slate-900/90 border-amber-500/30 shadow-[0_0_12px_rgba(251,191,36,0.1)]'
                    : 'bg-slate-950/60 border-slate-900 opacity-50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-2xl">
                  {isCompleted ? trophy.icon : '🔒'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {trophy.title}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Fase {lvl.id} · {isCompleted ? `Recorde: ${prog.bestReactionMs}ms` : 'Ainda não conquistado'}
                  </div>
                  <div className="text-[10px] text-amber-400/90 mt-0.5">
                    {trophy.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
