export type DifficultyTier = 'S+' | 'S' | 'A' | 'B' | 'C' | 'F';

export type FigureShapeType = 
  | 'circle' 
  | 'star' 
  | 'diamond' 
  | 'hexagon' 
  | 'triangle' 
  | 'crystal' 
  | 'alien' 
  | 'trap' 
  | 'golden';

export type FigureTheme = 'neon' | 'crystals' | 'arcade' | 'plasma' | 'custom_image';

export type CrosshairType = 'reticle' | 'cyan_ring' | 'ninja_shuriken' | 'quantum_vortex' | 'golden_cross' | 'cyber_eye';

export interface CustomTargetImageConfig {
  enabled: boolean;
  imageUrl: string;
  imageName?: string;
  shapeFit: 'cover' | 'contain';
  customBorderColor: string;
}

export interface DevControlOverrides {
  customImage: CustomTargetImageConfig;
  targetDurationOverrideMs: number | null; // null = use level default
  targetSizeOverridePx: number | null; // null = use level default
  trapChanceOverride: number | null; // null = use level default
  movingTargetsOverride: boolean | null; // null = use level default
  slowMotionFactor: number; // 1 = normal, 2 = 2x slower
  showHitboxes: boolean;
  unlimitedTime: boolean;
}

export interface BrandingColorsConfig {
  primaryColor: string; // e.g. '#00d2ff' or '#0284c7'
  secondaryColor: string; // e.g. '#6366f1'
  backgroundColor: string; // e.g. '#090d16'
  themePreset: 'agimus_blue' | 'cyberpunk' | 'emerald_tech' | 'sunset' | 'crimson' | 'custom';
}

export interface CompanyLogoConfig {
  enabled: boolean;
  logoUrl: string;
  companyName: string;
  subTitle?: string;
}

export interface RegistrationFormConfig {
  enabled: boolean; // require registration before playing
  requireName: boolean;
  showEmail: boolean;
  requireEmail: boolean;
  showPhone: boolean;
  requirePhone: boolean;
  showCompany: boolean;
  requireCompany: boolean;
  showCargo: boolean;
  requireCargo: boolean;
  showConsent: boolean;
  title: string;
  description: string;
  consentText: string;
}

export interface PlayerRegistration {
  id: string;
  playerName: string;
  email: string;
  phone: string;
  company: string;
  cargo: string;
  consentGiven: boolean;
  createdAt: string;
  gamesPlayed: number;
  bestScore: number;
  bestReactionMs: number;
}

export interface EndGameImageConfig {
  enabled: boolean;
  imageUrl: string;
  imageName?: string;
  headline?: string; // e.g. 'Parabéns pelo Desafio!'
  subheadline?: string; // e.g. 'Obrigado por participar! Veja a sua pontuação e tempo de reação.'
  ctaText?: string; // e.g. 'Jogar Novamente'
}

export interface AppAdminSettings {
  passwordHash: string; // Master administrator password
  lockEntireAppWithPassword: boolean; // Require password to access and play the game
  customImageMandatory: boolean; // Enforce custom image for all users
  customTargetImage: CustomTargetImageConfig;
  endGameImage: EndGameImageConfig;
  customLevelConfigs: Record<number, Partial<LevelConfig>>;
  tournamentMode: boolean; // Strict tournament mode: disables dev cheats
  adminDisplayName: string;
  branding: BrandingColorsConfig;
  logo: CompanyLogoConfig;
  registration: RegistrationFormConfig;
}

export interface TargetFigureData {
  id: string;
  x: number; // percentage 5% to 90%
  y: number; // percentage 10% to 85%
  size: number; // in pixels (e.g., 50px to 95px)
  shape: FigureShapeType;
  color: string;
  spawnTime: number; // performance.now()
  durationMs: number; // time before it vanishes
  isTrap: boolean;
  isGolden: boolean;
  points: number;
  vx?: number; // drift speed x
  vy?: number; // drift speed y
  flicker?: boolean;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  targetCount: number;
  baseDurationMs: number; // how long each figure stays
  spawnDelayMinMs: number;
  spawnDelayMaxMs: number;
  targetSize: number; // base diameter
  movingTargets: boolean;
  trapChance: number; // 0 to 0.35
  goldenChance: number; // 0 to 0.15
  multiTargetMax: number; // 1 to 2
  unlockRequirements?: {
    prevLevelId: number;
    minStars: number;
  };
  prizes: {
    sPlus: PrizeReward;
    gold: PrizeReward;
    bronze: PrizeReward;
  };
}

export interface PrizeReward {
  id: string;
  title: string;
  type: 'trophy' | 'crosshair' | 'theme' | 'badge';
  icon: string;
  description: string;
  value?: string;
}

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  stars: number; // 0-3
  bestReactionMs: number;
  averageReactionMs: number;
  bestScore: number;
  accuracy: number;
  tier: DifficultyTier;
  completedAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  country: string; // ISO 2 letters or flag
  avatar: string;
  score: number;
  averageReactionMs: number;
  bestReactionMs: number;
  accuracy: number;
  levelId: number | 'all';
  tier: DifficultyTier;
  date: string;
  isUser?: boolean;
}

export interface PlayerStats {
  playerName: string;
  country: string;
  avatar: string;
  equippedCrosshair: CrosshairType;
  equippedTheme: FigureTheme;
  unlockedCrosshairs: CrosshairType[];
  unlockedThemes: FigureTheme[];
  unlockedTrophies: string[];
  totalGamesPlayed: number;
  totalHits: number;
  totalMisses: number;
  bestReactionEverMs: number;
  levelProgress: Record<number, LevelProgress>;
}

export interface HitRecord {
  reactionTimeMs: number;
  points: number;
  combo: number;
  isGolden: boolean;
  isTrap: boolean;
  ratingText: string;
  x: number;
  y: number;
}
