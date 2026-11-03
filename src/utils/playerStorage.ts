import { PlayerStats, CrosshairType, FigureTheme } from '../types/game';

const PLAYER_STORAGE_KEY = 'neuroreflex_player_stats_v1';

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  playerName: 'Piloto_Alpha',
  country: '🇵🇹',
  avatar: '⚡',
  equippedCrosshair: 'reticle',
  equippedTheme: 'neon',
  unlockedCrosshairs: ['reticle'],
  unlockedThemes: ['neon'],
  unlockedTrophies: [],
  totalGamesPlayed: 0,
  totalHits: 0,
  totalMisses: 0,
  bestReactionEverMs: 0,
  levelProgress: {
    1: {
      levelId: 1,
      completed: false,
      stars: 0,
      bestReactionMs: 0,
      averageReactionMs: 0,
      bestScore: 0,
      accuracy: 0,
      tier: 'F',
    }
  }
};

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (!raw) return DEFAULT_PLAYER_STATS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PLAYER_STATS, ...parsed };
  } catch {
    return DEFAULT_PLAYER_STATS;
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

export function updateEquippedCrosshair(crosshair: CrosshairType): PlayerStats {
  const stats = loadPlayerStats();
  if (stats.unlockedCrosshairs.includes(crosshair)) {
    stats.equippedCrosshair = crosshair;
    savePlayerStats(stats);
  }
  return stats;
}

export function updateEquippedTheme(theme: FigureTheme): PlayerStats {
  const stats = loadPlayerStats();
  if (stats.unlockedThemes.includes(theme)) {
    stats.equippedTheme = theme;
    savePlayerStats(stats);
  }
  return stats;
}
