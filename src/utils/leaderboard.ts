import { LeaderboardEntry } from '../types/game';

const STORAGE_KEY = 'neuroreflex_leaderboard_v1';

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    playerName: 'Kaito_Reflex',
    country: '🇯🇵',
    avatar: '⚡',
    score: 38450,
    averageReactionMs: 184,
    bestReactionMs: 142,
    accuracy: 99.2,
    levelId: 'all',
    tier: 'S+',
    date: '2026-11-02'
  },
  {
    id: 'lead-2',
    playerName: 'Tiago_Silva_PT',
    country: '🇵🇹',
    avatar: '🦅',
    score: 35120,
    averageReactionMs: 198,
    bestReactionMs: 156,
    accuracy: 98.4,
    levelId: 'all',
    tier: 'S+',
    date: '2026-11-03'
  },
  {
    id: 'lead-3',
    playerName: 'Lucas_Speed_BR',
    country: '🇧🇷',
    avatar: '🔥',
    score: 33890,
    averageReactionMs: 209,
    bestReactionMs: 168,
    accuracy: 97.5,
    levelId: 'all',
    tier: 'S',
    date: '2026-11-01'
  },
  {
    id: 'lead-4',
    playerName: 'Elena_Vortex',
    country: '🇩🇪',
    avatar: '🐺',
    score: 31200,
    averageReactionMs: 221,
    bestReactionMs: 175,
    accuracy: 96.8,
    levelId: 'all',
    tier: 'S',
    date: '2026-11-02'
  },
  {
    id: 'lead-5',
    playerName: 'Cipher_Pulse',
    country: '🇺🇸',
    avatar: '🤖',
    score: 29840,
    averageReactionMs: 236,
    bestReactionMs: 188,
    accuracy: 95.0,
    levelId: 'all',
    tier: 'S',
    date: '2026-10-30'
  },
  {
    id: 'lead-6',
    playerName: 'Mia_Flash',
    country: '🇫🇷',
    avatar: '🐱',
    score: 27400,
    averageReactionMs: 252,
    bestReactionMs: 199,
    accuracy: 94.2,
    levelId: 'all',
    tier: 'A',
    date: '2026-11-02'
  },
  {
    id: 'lead-7',
    playerName: 'Neo_Acrobat',
    country: '🇬🇧',
    avatar: '🕶️',
    score: 25980,
    averageReactionMs: 268,
    bestReactionMs: 210,
    accuracy: 92.5,
    levelId: 'all',
    tier: 'A',
    date: '2026-11-03'
  },
  {
    id: 'lead-8',
    playerName: 'Sora_Chrono',
    country: '🇰🇷',
    avatar: '🐉',
    score: 24150,
    averageReactionMs: 284,
    bestReactionMs: 219,
    accuracy: 91.0,
    levelId: 'all',
    tier: 'B',
    date: '2026-11-01'
  }
];

const CLEARED_FLAG_KEY = 'neuroreflex_leaderboard_cleared_v1';

export function getStoredLeaderboard(): LeaderboardEntry[] {
  try {
    const isCleared = localStorage.getItem(CLEARED_FLAG_KEY) === 'true';
    if (isCleared) {
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // First time initializing applet on a fresh browser
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADERBOARD));
    return INITIAL_LEADERBOARD;
  } catch {
    return [];
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): LeaderboardEntry[] {
  // If a new player registers a score, remove the cleared flag
  try {
    localStorage.removeItem(CLEARED_FLAG_KEY);
  } catch {}

  const current = getStoredLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `lead-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    isUser: true,
  };

  const updated = [...current, newEntry].sort((a, b) => {
    // Sort primarily by highest score, then lowest average reaction time
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.averageReactionMs - b.averageReactionMs;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
  } catch {}

  return updated;
}

export function deleteLeaderboardEntry(id: string): LeaderboardEntry[] {
  const current = getStoredLeaderboard();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (updated.length === 0) {
      localStorage.setItem(CLEARED_FLAG_KEY, 'true');
    }
  } catch {}
  return updated;
}

export function clearAllLeaderboard(): LeaderboardEntry[] {
  try {
    localStorage.setItem(CLEARED_FLAG_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch {}
  return [];
}

export function restoreDefaultLeaderboard(): LeaderboardEntry[] {
  try {
    localStorage.removeItem(CLEARED_FLAG_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADERBOARD));
  } catch {}
  return INITIAL_LEADERBOARD;
}
