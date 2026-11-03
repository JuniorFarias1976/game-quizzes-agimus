import React from 'react';
import { LevelConfig, LevelProgress } from '../types/game';
import { Star, Lock, Zap, Trophy, Play, CheckCircle } from 'lucide-react';

interface LevelSelectProps {
  levels: LevelConfig[];
  progress: Record<number, LevelProgress>;
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  levels,
  progress,
  currentLevelId,
  onSelectLevel,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">
          Fases & Desafios de Reflexo
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Dificuldade progressiva com tempo de exposição reduzido, alvos móveis e armadilhas proibidas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((lvl) => {
          const prog = progress[lvl.id];
          const isUnlocked =
            lvl.id === 1 ||
            (lvl.unlockRequirements &&
              progress[lvl.unlockRequirements.prevLevelId]?.stars >=
                lvl.unlockRequirements.minStars);
          const isSelected = lvl.id === currentLevelId;

          return (
            <div
              key={lvl.id}
              onClick={() => isUnlocked && onSelectLevel(lvl.id)}
              className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 ${
                isUnlocked
                  ? 'cursor-pointer hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] bg-slate-900/80 backdrop-blur'
                  : 'opacity-60 bg-slate-950/60 cursor-not-allowed border-slate-800/80'
              } ${
                isSelected && isUnlocked
                  ? 'border-cyan-400 ring-2 ring-cyan-500/30'
                  : 'border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono-code uppercase tracking-wider text-cyan-400 font-bold">
                    Fase {lvl.id} · {lvl.subtitle}
                  </span>
                  
                  {isUnlocked ? (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            prog && s <= prog.stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bloqueado</span>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-white tracking-tight mb-1.5 font-display">
                  {lvl.name.replace(/Fase \d+: /, '')}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {lvl.description}
                </p>

                {/* Level specs & requirements */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl mb-4 text-[11px]">
                  <div>
                    <span className="text-slate-400">Tempo Limite:</span>{' '}
                    <span className="font-mono-code font-bold text-cyan-400">{lvl.baseDurationMs}ms</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Alvos:</span>{' '}
                    <span className="font-mono-code font-bold text-white">{lvl.targetCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Armadilhas:</span>{' '}
                    <span className="font-mono-code font-bold text-red-400">
                      {Math.round(lvl.trapChance * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Movimento:</span>{' '}
                    <span className={`font-mono-code font-bold ${lvl.movingTargets ? 'text-amber-400' : 'text-slate-400'}`}>
                      {lvl.movingTargets ? 'Ativo' : 'Fixo'}
                    </span>
                  </div>
                </div>

                {/* Unlocked / Potential Prizes */}
                <div className="border-t border-slate-800/80 pt-3">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    <span>Prêmio de Desempenho S+:</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-950/40 rounded-lg">
                    <span className="text-lg">{lvl.prizes.sPlus.icon}</span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-white truncate">
                        {lvl.prizes.sPlus.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {lvl.prizes.sPlus.description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer / Action */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                {prog && prog.completed ? (
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">
                      Melhor: <strong className="font-mono-code text-cyan-400">{prog.bestReactionMs}ms</strong>
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Não jogado</span>
                )}

                {isUnlocked ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLevel(lvl.id);
                    }}
                    className="px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition active:scale-95 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Jogar
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Exige {lvl.unlockRequirements?.minStars}★ na Fase {lvl.unlockRequirements?.prevLevelId}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
