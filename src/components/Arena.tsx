import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  LevelConfig, 
  TargetFigureData, 
  FigureShapeType, 
  HitRecord, 
  FigureTheme, 
  CrosshairType,
  CustomTargetImageConfig,
  DevControlOverrides,
  GameArenaTextsConfig
} from '../types/game';
import { sound } from '../utils/sound';
import { TargetFigure } from './TargetFigure';
import { CustomCrosshair } from './CustomCrosshair';
import { Volume2, VolumeX, RotateCcw, Play, Pause, Flame, Target, Zap, ShieldAlert, Sliders, Maximize2 } from 'lucide-react';

interface ArenaProps {
  level: LevelConfig;
  theme: FigureTheme;
  crosshair: CrosshairType;
  customImage?: CustomTargetImageConfig;
  devOverrides?: DevControlOverrides;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
  onOpenControlPanel?: () => void;
  onComplete: (stats: {
    levelId: number;
    score: number;
    averageMs: number;
    bestMs: number;
    accuracy: number;
    hits: number;
    misses: number;
    trapsHit: number;
    records: HitRecord[];
  }) => void;
  isAdminLoggedIn?: boolean;
  primaryColor?: string;
  requiresRegistration?: boolean;
  onRequestRegistration?: () => void;
  autoStartSignal?: number;
  gameTexts?: GameArenaTextsConfig;
  onOpenInstallModal?: () => void;
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  subText?: string;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

const NEON_COLORS = [
  '#22d3ee', // Cyan
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Electric Blue
];

const SHAPES: FigureShapeType[] = ['circle', 'star', 'diamond', 'hexagon', 'triangle'];

export const Arena: React.FC<ArenaProps> = ({
  level,
  theme,
  crosshair,
  customImage,
  devOverrides,
  soundEnabled,
  onToggleSound,
  onRestart,
  onOpenControlPanel,
  onComplete,
  isAdminLoggedIn = false,
  primaryColor = '#00d2ff',
  requiresRegistration = false,
  onRequestRegistration,
  autoStartSignal,
  gameTexts,
  onOpenInstallModal,
}) => {
  const arenaRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

  // Game state ('ready' = kiosk idle screen with big start button)
  const [gameState, setGameState] = useState<'ready' | 'countdown' | 'playing' | 'paused' | 'ended'>('ready');
  const [countdown, setCountdown] = useState<number>(3);
  const [activeFigures, setActiveFigures] = useState<TargetFigureData[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  
  // Stats
  const [spawnedCount, setSpawnedCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [hits, setHits] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [trapsHit, setTrapsHit] = useState<number>(0);
  const [hitRecords, setHitRecords] = useState<HitRecord[]>([]);
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);

  // Mouse coords for crosshair
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHoveringArena, setIsHoveringArena] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // Dynamically detect mobile/touch environment
  useEffect(() => {
    const checkTouch = () => {
      const isMobileSize = typeof window !== 'undefined' && window.innerWidth <= 768;
      const hasTouch = typeof window !== 'undefined' && (
        'ontouchstart' in window ||
        (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) ||
        Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
      );
      setIsTouchDevice(isMobileSize || hasTouch);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    window.addEventListener('orientationchange', checkTouch);
    return () => {
      window.removeEventListener('resize', checkTouch);
      window.removeEventListener('orientationchange', checkTouch);
    };
  }, []);

  // Refs for tracking mutable loops
  const particlesRef = useRef<Particle[]>([]);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  // Particles animation loop
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.alpha -= 0.025;

        if (p.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return true;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const spawnParticles = (x: number, y: number, color: string, count = 18) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 2 + Math.random() * 5;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        size: 2 + Math.random() * 3,
      });
    }
    particlesRef.current.push(...newParticles);
  };

  // Trigger floating text feedback
  const addFloatingText = (x: number, y: number, text: string, subText: string | undefined, color: string) => {
    const id = `float-${Date.now()}-${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, x, y, text, subText, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 800);
  };

  // Countdown timer on start
  useEffect(() => {
    if (gameState !== 'countdown') return;

    sound.playCountdown(countdown === 1);

    if (countdown > 1) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 850);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setGameState('playing');
        sound.playCountdown(true);
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [countdown, gameState]);

  // Auto-start signal listener (e.g. after completing registration)
  const prevAutoStartRef = useRef(autoStartSignal);
  useEffect(() => {
    if (autoStartSignal && autoStartSignal !== prevAutoStartRef.current) {
      prevAutoStartRef.current = autoStartSignal;
      if (gameState === 'ready') {
        setCountdown(3);
        setGameState('countdown');
      }
    }
  }, [autoStartSignal, gameState]);

  const handleStartGame = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (requiresRegistration && onRequestRegistration) {
      onRequestRegistration();
      return;
    }
    setCountdown(3);
    setGameState('countdown');
  };

  // Target spawner logic
  const spawnTarget = useCallback(() => {
    if (gameState !== 'playing') return;

    setSpawnedCount((prev) => {
      if (prev >= level.targetCount) {
        return prev;
      }

      const trapChance = devOverrides?.trapChanceOverride != null 
        ? devOverrides.trapChanceOverride 
        : level.trapChance;
      const isTrap = Math.random() < trapChance && prev > 2;
      const isGolden = !isTrap && Math.random() < level.goldenChance;
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const color = isTrap 
        ? '#ef4444' 
        : isGolden 
        ? '#fbbf24' 
        : NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];

      const isMoving = devOverrides?.movingTargetsOverride != null
        ? devOverrides.movingTargetsOverride
        : level.movingTargets;

      // Drift velocities for moving targets
      const vx = isMoving ? (Math.random() - 0.5) * 0.4 : 0;
      const vy = isMoving ? (Math.random() - 0.5) * 0.4 : 0;

      const baseDur = devOverrides?.targetDurationOverrideMs != null
        ? devOverrides.targetDurationOverrideMs
        : level.baseDurationMs;
      const durationMs = isGolden ? Math.round(baseDur * 0.85) : baseDur;
      const targetSize = devOverrides?.targetSizeOverridePx != null
        ? devOverrides.targetSizeOverridePx
        : level.targetSize;

      // Random position with safety margin from edges
      const x = 12 + Math.random() * 76;
      const y = 14 + Math.random() * 72;

      // Select target image from pool or primary custom image
      let targetImageUrl: string | undefined = undefined;
      const imagesPool = customImage?.images && customImage.images.length > 0
        ? customImage.images
        : customImage?.imageUrl
        ? [customImage.imageUrl]
        : [];

      if (!isTrap && imagesPool.length > 0 && customImage?.enabled) {
        targetImageUrl = imagesPool[prev % imagesPool.length];
      }

      const newFigure: TargetFigureData = {
        id: `fig-${Date.now()}-${Math.random()}`,
        x,
        y,
        size: targetSize,
        shape,
        color,
        spawnTime: performance.now(),
        durationMs,
        isTrap,
        isGolden,
        points: isGolden ? 3000 : 1000,
        vx,
        vy,
        targetImageUrl,
      };

      setActiveFigures((current) => [...current, newFigure]);

      // Schedule auto-expire if player fails to click
      const expireTimeout = setTimeout(() => {
        setActiveFigures((current) => {
          const exists = current.find((f) => f.id === newFigure.id);
          if (exists) {
            if (!exists.isTrap) {
              // Missed target!
              setMisses((m) => m + 1);
              setCombo(0);
              sound.playMiss();
            }
            return current.filter((f) => f.id !== newFigure.id);
          }
          return current;
        });
      }, durationMs);

      timeoutRefs.current.push(expireTimeout);

      return prev + 1;
    });
  }, [gameState, level]);

  // Schedule next spawns while playing
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (spawnedCount >= level.targetCount && activeFigures.length === 0) {
      // Level complete!
      const endTimer = setTimeout(() => {
        setGameState('ended');
      }, 500);
      return () => clearTimeout(endTimer);
    }

    if (spawnedCount < level.targetCount) {
      const activeCount = activeFigures.length;
      if (activeCount < level.multiTargetMax) {
        const delay = Math.random() * (level.spawnDelayMaxMs - level.spawnDelayMinMs) + level.spawnDelayMinMs;
        const timer = setTimeout(() => {
          spawnTarget();
        }, delay);
        timeoutRefs.current.push(timer);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, spawnedCount, activeFigures.length, level, spawnTarget]);

  // Moving targets tick loop (Levels 4, 5, 6 or Dev Override)
  const isMovingActive = devOverrides?.movingTargetsOverride != null
    ? devOverrides.movingTargetsOverride
    : level.movingTargets;

  useEffect(() => {
    if (gameState !== 'playing' || !isMovingActive) return;

    let animId: number;

    const moveTick = () => {
      setActiveFigures((prev) =>
        prev.map((fig) => {
          if (!fig.vx && !fig.vy) return fig;
          let nx = fig.x + (fig.vx || 0);
          let ny = fig.y + (fig.vy || 0);
          let nvx = fig.vx || 0;
          let nvy = fig.vy || 0;

          if (nx < 8 || nx > 92) nvx = -nvx;
          if (ny < 12 || ny > 88) nvy = -nvy;

          return { ...fig, x: nx, y: ny, vx: nvx, vy: nvy };
        })
      );
      animId = requestAnimationFrame(moveTick);
    };

    animId = requestAnimationFrame(moveTick);
    return () => cancelAnimationFrame(animId);
  }, [gameState, isMovingActive]);

  // Stable ref for onComplete callback to avoid re-triggering completion effect
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const hasCompletedRef = useRef(false);

  // Reset completion flag when level changes
  useEffect(() => {
    hasCompletedRef.current = false;
  }, [level.id]);

  // Handle stage completion - executes strictly once per stage run
  useEffect(() => {
    if (gameState === 'ended' && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      clearAllTimeouts();
      const validRecords = hitRecords.filter((r) => !r.isTrap);
      const totalAttempts = validRecords.length + misses;
      const accuracy = totalAttempts > 0 ? Math.round((validRecords.length / totalAttempts) * 1000) / 10 : 0;
      const averageMs = validRecords.length > 0 
        ? Math.round(validRecords.reduce((acc, r) => acc + r.reactionTimeMs, 0) / validRecords.length) 
        : 0;
      const bestMs = validRecords.length > 0 
        ? Math.min(...validRecords.map((r) => r.reactionTimeMs)) 
        : 0;

      onCompleteRef.current({
        levelId: level.id,
        score,
        averageMs,
        bestMs,
        accuracy,
        hits,
        misses,
        trapsHit,
        records: hitRecords,
      });
    }
  }, [gameState, hitRecords, misses, score, hits, trapsHit, level.id]);

  // Target figure clicked
  const handleFigureClick = (figure: TargetFigureData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (gameState !== 'playing') return;

    const rect = arenaRef.current?.getBoundingClientRect();
    const clickX = rect ? e.clientX - rect.left : 100;
    const clickY = rect ? e.clientY - rect.top : 100;

    // Remove clicked figure
    setActiveFigures((prev) => prev.filter((f) => f.id !== figure.id));

    if (figure.isTrap) {
      // Hit a prohibited trap bomb!
      sound.playTrap();
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 350);
      setCombo(0);
      setTrapsHit((t) => t + 1);
      const penalty = 500;
      setScore((s) => Math.max(0, s - penalty));

      addFloatingText(clickX, clickY, `-${penalty} ALVO PROIBIDO!`, 'Reset de Combo!', '#ef4444');
      spawnParticles(clickX, clickY, '#ef4444', 24);

      setHitRecords((prev) => [
        ...prev,
        {
          reactionTimeMs: 0,
          points: -penalty,
          combo: 0,
          isGolden: false,
          isTrap: true,
          ratingText: 'ARMADILHA',
          x: clickX,
          y: clickY,
        },
      ]);
      return;
    }

    // Valid target hit!
    const reactionTimeMs = Math.round(performance.now() - figure.spawnTime);
    setLastReactionMs(reactionTimeMs);

    // Calculate rating and points
    let ratingText = 'BOM';
    let ratingColor = '#3b82f6';
    let baseBonus = 0;

    if (reactionTimeMs < 195) {
      ratingText = 'INUMANO! ⚡';
      ratingColor = '#a855f7';
      baseBonus = 550;
      sound.playGodlike();
    } else if (reactionTimeMs < 255) {
      ratingText = 'DEUS DO REFLEXO 🔥';
      ratingColor = '#22d3ee';
      baseBonus = 350;
      sound.playHit(combo + 1);
    } else if (reactionTimeMs < 340) {
      ratingText = 'EXCELENTE ✨';
      ratingColor = '#10b981';
      baseBonus = 200;
      sound.playHit(combo + 1);
    } else if (reactionTimeMs < 440) {
      ratingText = 'BOM 👍';
      ratingColor = '#f59e0b';
      baseBonus = 80;
      sound.playHit(combo + 1);
    } else {
      ratingText = 'LENTO 🐢';
      ratingColor = '#94a3b8';
      baseBonus = 0;
      sound.playHit(1);
    }

    if (figure.isGolden) {
      sound.playGoldenHit();
      ratingText = `3X OURO! (${reactionTimeMs}ms)`;
      ratingColor = '#fbbf24';
    }

    // Multiplier based on combo streak
    const nextCombo = combo + 1;
    setCombo(nextCombo);
    setMaxCombo((max) => Math.max(max, nextCombo));
    setHits((h) => h + 1);

    const comboMultiplier = 1 + Math.min(nextCombo * 0.1, 2.0);
    const speedPoints = Math.max(150, Math.round(1100 - reactionTimeMs * 1.4)) + baseBonus;
    const finalPoints = Math.round(speedPoints * comboMultiplier * (figure.isGolden ? 3 : 1));

    setScore((s) => s + finalPoints);

    addFloatingText(
      clickX, 
      clickY, 
      `+${finalPoints}`, 
      `${reactionTimeMs}ms · ${ratingText}`, 
      ratingColor
    );

    spawnParticles(clickX, clickY, figure.isGolden ? '#fbbf24' : figure.color, figure.isGolden ? 30 : 16);

    setHitRecords((prev) => [
      ...prev,
      {
        reactionTimeMs,
        points: finalPoints,
        combo: nextCombo,
        isGolden: figure.isGolden,
        isTrap: false,
        ratingText,
        x: clickX,
        y: clickY,
      },
    ]);
  };

  // Empty arena clicked (Miss)
  const handleArenaMiss = (e: React.MouseEvent) => {
    if (gameState !== 'playing') return;

    const rect = arenaRef.current?.getBoundingClientRect();
    const clickX = rect ? e.clientX - rect.left : 100;
    const clickY = rect ? e.clientY - rect.top : 100;

    sound.playMiss();
    setCombo(0);
    setMisses((m) => m + 1);
    const penalty = 80;
    setScore((s) => Math.max(0, s - penalty));

    addFloatingText(clickX, clickY, `-${penalty}`, 'CLIQUE EM FALSO', '#94a3b8');
    spawnParticles(clickX, clickY, '#64748b', 8);
  };

  // Mouse move handler for reticle
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Sync canvas size seamlessly across mobile/desktop, orientation changes, and initial mount
  useEffect(() => {
    const handleResize = () => {
      if (arenaRef.current && particleCanvasRef.current) {
        const rect = arenaRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          particleCanvasRef.current.width = rect.width;
          particleCanvasRef.current.height = rect.height;
        }
      }
    };

    handleResize();
    const t1 = setTimeout(handleResize, 60);
    const t2 = setTimeout(handleResize, 300);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && arenaRef.current) {
      ro = new ResizeObserver(() => {
        handleResize();
      });
      ro.observe(arenaRef.current);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const totalAttempts = hits + misses;
  const currentAccuracy = totalAttempts > 0 ? Math.round((hits / totalAttempts) * 100) : 100;
  const validHits = hitRecords.filter((r) => !r.isTrap);
  const currentAvgMs = validHits.length > 0 
    ? Math.round(validHits.reduce((acc, r) => acc + r.reactionTimeMs, 0) / validHits.length) 
    : 0;

  return (
    <div 
      className="relative flex flex-col items-center w-full max-w-5xl mx-auto"
      onMouseMove={handleMouseMove}
    >
      <CustomCrosshair
        x={mousePos.x}
        y={mousePos.y}
        type={crosshair}
        visible={!isTouchDevice && isHoveringArena && gameState === 'playing'}
      />

      {/* Top HUD Bar - Responsive for Mobile & Desktop */}
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 mb-2.5 sm:mb-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl shadow-lg">
        {/* Stage & Progress info + Quick Mobile Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-display font-bold text-xs sm:text-base text-indigo-400">
              {level.id}
            </div>
            <div>
              <div className="text-[11px] sm:text-xs font-semibold tracking-wider text-indigo-400 uppercase font-display">
                {level.name}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400">
                Alvos: <span className="text-white font-mono-code font-bold">{spawnedCount}/{level.targetCount}</span>
              </div>
            </div>
          </div>

          {/* Quick Controls shown on Mobile Header row */}
          <div className="flex sm:hidden items-center gap-1.5">
            {onOpenControlPanel && (
              <button
                onClick={onOpenControlPanel}
                className="flex items-center gap-1 px-2 py-1 text-slate-300 hover:text-white bg-slate-800/90 rounded-lg border border-cyan-500/30 text-[10px] font-mono-code font-bold"
                title="Painel de Controle (Admin)"
              >
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>ADM</span>
              </button>
            )}
            <button
              onClick={onToggleSound}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg"
              title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <button
              onClick={onRestart}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg"
              title="Reiniciar Fase"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Real-time Reflex Metrics: 4 clean columns on mobile, row on tablet/desktop */}
        <div className="grid grid-cols-4 sm:flex items-center gap-1.5 sm:gap-6 bg-slate-950/40 sm:bg-transparent p-1.5 sm:p-0 rounded-lg border border-slate-800/60 sm:border-0">
          {/* Reaction Speed Indicator */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Reação</div>
              <div className="font-mono-code text-xs sm:text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1">
                <span className={lastReactionMs && lastReactionMs < 250 ? 'text-cyan-400' : 'text-slate-200'}>
                  {lastReactionMs ? `${lastReactionMs}ms` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Combo Multiplier */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2">
            <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${combo > 3 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Combo</div>
              <div className="font-mono-code text-xs sm:text-sm font-bold text-amber-400">
                {combo}x
              </div>
            </div>
          </div>

          {/* Accuracy */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Precisão</div>
              <div className="font-mono-code text-xs sm:text-sm font-bold text-emerald-400">
                {currentAccuracy}%
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-slate-950/70 border border-slate-700/60 rounded-lg text-center sm:text-left">
            <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Pontos</div>
            <div className="font-display text-xs sm:text-base font-bold text-white tracking-wide">
              {score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Controls for Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          {onOpenControlPanel && (
            <button
              onClick={onOpenControlPanel}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-300 hover:text-cyan-300 bg-slate-800/90 hover:bg-slate-700/90 rounded-lg transition-colors border border-cyan-500/30 shadow-sm"
              title="Painel de Controle (ALT + C)"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-mono-code font-bold tracking-wider">PAINEL</span>
            </button>
          )}

          <button
            onClick={onToggleSound}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors"
            title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={onRestart}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors"
            title="Reiniciar Fase"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Arena Area - responsive height and touch-none for mobile */}
      <div
        ref={arenaRef}
        onClick={handleArenaMiss}
        onPointerDown={(e) => {
          if (e.target === arenaRef.current || (e.target as HTMLElement).tagName === 'CANVAS') {
            handleArenaMiss(e as unknown as React.MouseEvent);
          }
        }}
        onMouseEnter={() => setIsHoveringArena(true)}
        onMouseLeave={() => setIsHoveringArena(false)}
        className={`relative w-full h-[55dvh] min-h-[320px] sm:h-[520px] max-h-[640px] bg-gradient-to-b from-[#0a0f1d] via-[#070b14] to-[#04070e] border-2 rounded-2xl overflow-hidden select-none cursor-crosshair shadow-2xl transition-transform touch-none overscroll-none ${
          screenShake ? 'scale-[0.98] border-red-500 translate-x-1 translate-y-1' : 'border-indigo-500/20'
        }`}
      >
        {/* Subtle Sci-Fi Grid lines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, #38bdf818 1px, transparent 1px), linear-gradient(to bottom, #38bdf818 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Radar concentric target circles in background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <div className="w-96 h-96 rounded-full border border-cyan-400" />
          <div className="absolute w-64 h-64 rounded-full border border-indigo-400" />
          <div className="absolute w-32 h-32 rounded-full border border-purple-400" />
        </div>

        {/* Particles Canvas Overlay */}
        <canvas
          ref={particleCanvasRef}
          className="absolute inset-0 pointer-events-none z-30"
        />

        {/* Floating Numbers & Text Feedback */}
        {floatingTexts.map((f) => (
          <div
            key={f.id}
            className="absolute pointer-events-none z-40 animate-float-score -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${f.x}px`, top: `${f.y}px` }}
          >
            <span
              className="text-lg font-display font-bold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              style={{ color: f.color }}
            >
              {f.text}
            </span>
            {f.subText && (
              <span className="text-[11px] font-mono-code font-semibold text-white/90 bg-black/70 px-1.5 py-0.5 rounded shadow">
                {f.subText}
              </span>
            )}
          </div>
        ))}

        {/* Active Target Figures */}
        {gameState === 'playing' &&
          activeFigures.map((fig) => (
            <TargetFigure
              key={fig.id}
              figure={fig}
              theme={theme}
              customImage={customImage}
              showHitbox={devOverrides?.showHitboxes}
              onClick={handleFigureClick}
            />
          ))}

        {/* Custom Target Image Active Badge Indicator */}
        {customImage?.enabled && customImage.imageUrl && (
          <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[10px] text-cyan-300 font-mono-code bg-cyan-950/80 border border-cyan-700/60 px-2 py-0.5 rounded shadow z-30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Alvo Personalizado Ativo</span>
          </div>
        )}

        {/* Ready / Start Screen Overlay for Kiosk Mode */}
        {gameState === 'ready' && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md z-50 p-6 text-center select-none"
          >
            {/* Ambient glows */}
            <div 
              className="absolute w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: primaryColor }}
            />

            <div className="relative z-10 flex flex-col items-center max-w-lg space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Level indicator pill */}
              {(gameTexts?.showLevelBadge ?? true) && (
                <div 
                  className="px-3 py-1 rounded-full text-xs font-mono-code font-bold uppercase tracking-widest border"
                  style={{
                    borderColor: `${primaryColor}66`,
                    color: primaryColor,
                    backgroundColor: `${primaryColor}15`,
                  }}
                >
                  Fase {level.id} · {level.name}
                </div>
              )}

              {/* Headline */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-wide drop-shadow-md">
                  {gameTexts?.splashTitle || 'ARENA DE REFLEXOS'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
                  {gameTexts?.splashSubtitle || 'Acerte as figuras que surgem no ecrã o mais rápido possível para pontuar pelo seu tempo de reação!'}
                </p>
              </div>

              {/* Stage Parameters Pill Group */}
              {(gameTexts?.showParameterChips ?? true) && (
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono-code">
                  <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                    🎯 {level.targetCount} Alvos
                  </span>
                  <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                    ⚡ Tolerância: {level.baseDurationMs}ms
                  </span>
                  {level.trapChance > 0 && (
                    <span className="px-2.5 py-1 bg-red-950/60 border border-red-800/60 rounded-lg text-red-300">
                      💣 Cuidado com Bombas
                    </span>
                  )}
                </div>
              )}

              {/* Primary Start Game Button */}
              <button
                type="button"
                onClick={handleStartGame}
                className="mt-2 px-10 py-4.5 rounded-2xl font-display font-black text-lg sm:text-xl uppercase tracking-wider text-slate-950 flex items-center gap-3.5 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 35px ${primaryColor}77`,
                }}
              >
                <Play className="w-6 h-6 fill-slate-950" />
                <span>{gameTexts?.startGameButtonText || 'COMEÇAR JOGO'}</span>
              </button>

              <div className="text-[11px] text-slate-400 font-mono-code">
                {gameTexts?.splashHintText || 'Toque no botão para iniciar a contagem regressiva'}
              </div>

              {onOpenInstallModal && (
                <button
                  type="button"
                  onClick={onOpenInstallModal}
                  className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-code text-cyan-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400 transition cursor-pointer shadow-sm active:scale-95"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Instalar App / Modo Sem Barra</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Countdown Screen Overlay */}
        {gameState === 'countdown' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50">
            <div className="text-xs font-mono-code tracking-widest text-cyan-400 uppercase mb-2">
              PREPARE OS SEUS REFLEXOS
            </div>
            <div className="text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-500 animate-pulse">
              {countdown}
            </div>
            <div className="mt-4 text-xs text-slate-400 flex items-center gap-2">
              <span>Fase {level.id}: {level.subtitle}</span>
              <span>·</span>
              <span>{level.baseDurationMs}ms de tolerância</span>
            </div>
          </div>
        )}

        {/* Prohibited Alert Hint */}
        {level.trapChance > 0 && gameState === 'playing' && (
          <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-[11px] text-red-400/80 bg-red-950/40 border border-red-900/30 px-2 py-1 rounded">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Alvo Proibido ativo nesta fase: não clique nas bombas!</span>
          </div>
        )}
      </div>
    </div>
  );
};
