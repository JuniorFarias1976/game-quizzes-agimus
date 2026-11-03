import React, { useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { LevelConfig, HitRecord, DifficultyTier, PrizeReward, EndGameImageConfig, BrandingColorsConfig } from '../types/game';
import { calculateTier, calculateStars } from '../utils/levels';
import { sound } from '../utils/sound';
import { 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  Star, 
  Zap, 
  Target, 
  Award, 
  Globe, 
  CheckCircle2, 
  Sparkles,
  Play
} from 'lucide-react';

interface StageResultModalProps {
  level: LevelConfig;
  stats: {
    levelId: number;
    score: number;
    averageMs: number;
    bestMs: number;
    accuracy: number;
    hits: number;
    misses: number;
    trapsHit: number;
    records: HitRecord[];
  };
  onPlayAgain: () => void;
  onNextLevel?: () => void;
  onGoToLeaderboard: () => void;
  onEquipReward?: (prize: PrizeReward) => void;
  onSubmitScore: (playerName: string, country: string) => void;
  defaultPlayerName: string;
  defaultCountry: string;
  endGameImage?: EndGameImageConfig;
  branding?: BrandingColorsConfig;
}

export const StageResultModal: React.FC<StageResultModalProps> = ({
  level,
  stats,
  onPlayAgain,
  onNextLevel,
  onGoToLeaderboard,
  onEquipReward,
  onSubmitScore,
  defaultPlayerName,
  defaultCountry,
  endGameImage,
  branding,
}) => {
  const tier = calculateTier(stats.averageMs, stats.accuracy);
  const stars = calculateStars(tier);
  const isPassed = tier !== 'F';

  const [playerName, setPlayerName] = useState(defaultPlayerName);
  const [country, setCountry] = useState(defaultCountry);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Derive unlocked prizes directly via useMemo (avoids setState in effect)
  const unlockedPrizes = useMemo(() => {
    const list: PrizeReward[] = [];
    if (tier === 'S+') {
      list.push(level.prizes.sPlus, level.prizes.gold, level.prizes.bronze);
    } else if (tier === 'S' || tier === 'A') {
      list.push(level.prizes.gold, level.prizes.bronze);
    } else if (tier === 'B' || tier === 'C') {
      list.push(level.prizes.bronze);
    }
    return list;
  }, [tier, level.prizes]);

  // One-time celebrations on modal mount
  useEffect(() => {
    sound.playVictory();

    if (unlockedPrizes.length > 0) {
      const unlockTimer = setTimeout(() => sound.playUnlock(), 600);
      return () => clearTimeout(unlockTimer);
    }
  }, []);

  useEffect(() => {
    if (stars >= 2) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#a855f7', '#fbbf24', '#34d399'],
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || scoreSubmitted) return;
    onSubmitScore(playerName.trim(), country);
    setScoreSubmitted(true);
  };

  const getTierColor = (t: DifficultyTier) => {
    switch (t) {
      case 'S+':
        return 'text-amber-300 from-amber-400 to-pink-500';
      case 'S':
        return 'text-cyan-400 from-cyan-400 to-indigo-500';
      case 'A':
        return 'text-emerald-400 from-emerald-400 to-teal-500';
      case 'B':
        return 'text-blue-400 from-blue-400 to-indigo-400';
      case 'C':
        return 'text-yellow-500 from-yellow-400 to-amber-500';
      default:
        return 'text-red-400 from-red-400 to-rose-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* End Game Custom Image Banner (Configured by Administrator) */}
        {endGameImage?.enabled && endGameImage?.imageUrl && (
          <div className="mb-6 relative rounded-2xl overflow-hidden border-2 bg-slate-950/90 shadow-2xl transition-all"
            style={{
              borderColor: `${branding?.primaryColor || '#00d2ff'}88`,
              boxShadow: `0 0 35px ${branding?.primaryColor || '#00d2ff'}33`,
            }}
          >
            <div className="w-full max-h-56 overflow-hidden flex items-center justify-center bg-slate-950">
              <img
                src={endGameImage.imageUrl}
                alt={endGameImage.imageName || 'Fim de Jogo'}
                className="w-full h-auto max-h-56 object-contain"
              />
            </div>
            {(endGameImage.headline || endGameImage.subheadline) && (
              <div className="p-3 text-center bg-slate-950/80 border-t border-slate-800">
                {endGameImage.headline && (
                  <div className="text-sm font-display font-black text-white">
                    {endGameImage.headline}
                  </div>
                )}
                {endGameImage.subheadline && (
                  <div className="text-xs text-slate-400 mt-0.5">
                    {endGameImage.subheadline}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Header result */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="text-xs font-mono-code tracking-widest text-slate-400 uppercase">
            {level.name}
          </div>

          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-7 h-7 ${
                  s <= stars
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_#fbbf24]'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Desempenho:</span>
            <span
              className={`text-4xl font-display font-black bg-clip-text bg-gradient-to-r ${getTierColor(
                tier
              )} drop-shadow`}
            >
              Classificação {tier}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {tier === 'S+' && 'Velocidade cibernética sobre-humana! Reflexos no ápice do potencial biológico.'}
            {tier === 'S' && 'Tempo de reação excepcional de piloto de caça militar! Maestria absoluta.'}
            {tier === 'A' && 'Agilidade neural fantástica! Muito acima da média da população geral.'}
            {tier === 'B' && 'Bom tempo de resposta, com grande consistência de mira.'}
            {tier === 'C' && 'Fase concluída. Continue treinando para alcançar os troféus dourados!'}
            {tier === 'F' && 'Tempo de reação ou precisão insuficiente. Tente novamente!'}
          </p>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              Tempo Médio
            </div>
            <div className="text-lg font-mono-code font-bold text-cyan-400 mt-1">
              {stats.averageMs}ms
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Melhor Acerto
            </div>
            <div className="text-lg font-mono-code font-bold text-amber-400 mt-1">
              {stats.bestMs}ms
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <Target className="w-3 h-3 text-emerald-400" />
              Precisão
            </div>
            <div className="text-lg font-mono-code font-bold text-emerald-400 mt-1">
              {stats.accuracy}%
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3 text-purple-400" />
              Pontuação
            </div>
            <div className="text-lg font-mono-code font-bold text-purple-400 mt-1">
              {stats.score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Unlocked Prizes Showcase */}
        {unlockedPrizes.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>Prêmios Desbloqueados por Desempenho!</span>
            </div>

            <div className="space-y-2">
              {unlockedPrizes.map((prize) => (
                <div
                  key={prize.id}
                  className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{prize.icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-white">{prize.title}</div>
                      <div className="text-[11px] text-slate-400">{prize.description}</div>
                    </div>
                  </div>

                  {onEquipReward && (prize.type === 'crosshair' || prize.type === 'theme') && (
                    <button
                      onClick={() => onEquipReward(prize)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 rounded-md transition"
                    >
                      Equipar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Leaderboard Submission Form */}
        <div className="mb-6 p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Enviar para o Ranking Global</span>
            </div>
            {scoreSubmitted && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Registrado no Ranking!
              </span>
            )}
          </div>

          {!scoreSubmitted ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Seu Apelido no Ranking"
                maxLength={16}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="🇵🇹">🇵🇹 PT</option>
                <option value="🇧🇷">🇧🇷 BR</option>
                <option value="🇺🇸">🇺🇸 US</option>
                <option value="🇪🇸">🇪🇸 ES</option>
                <option value="🇯🇵">🇯🇵 JP</option>
                <option value="🇫🇷">🇫🇷 FR</option>
                <option value="🇩🇪">🇩🇪 DE</option>
                <option value="🇬🇧">🇬🇧 UK</option>
              </select>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-95 rounded-lg transition shadow-md"
              >
                Publicar
              </button>
            </form>
          ) : (
            <button
              onClick={onGoToLeaderboard}
              className="w-full py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline text-center block"
            >
              Ver sua posição no Ranking Global →
            </button>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-5 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-slate-950 rounded-xl transition shadow-lg active:scale-95"
            style={{
              backgroundColor: branding?.primaryColor || '#00d2ff',
              boxShadow: `0 0 20px ${branding?.primaryColor || '#00d2ff'}44`,
            }}
          >
            <RotateCcw className="w-4 h-4 text-slate-950" />
            <span>{endGameImage?.ctaText || 'Jogar Novamente'}</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              onClick={onGoToLeaderboard}
              className="w-full sm:w-auto px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              <Globe className="w-4 h-4" />
              Ranking
            </button>

            {onNextLevel && isPassed && (
              <button
                onClick={onNextLevel}
                className="w-full sm:w-auto px-5 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(34,211,238,0.3)] rounded-xl transition active:scale-95"
              >
                Próxima Fase
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
