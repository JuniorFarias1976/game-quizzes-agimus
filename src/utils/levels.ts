import { LevelConfig, DifficultyTier } from '../types/game';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Fase 1: Aquecimento Sináptico',
    subtitle: 'Nível Cadete',
    description: 'Alvos estáticos amplos. Treine a sincronização inicial olho-mão e estabeleça seu tempo base.',
    targetCount: 12,
    baseDurationMs: 1350,
    spawnDelayMinMs: 400,
    spawnDelayMaxMs: 700,
    targetSize: 84,
    movingTargets: false,
    trapChance: 0,
    goldenChance: 0,
    multiTargetMax: 1,
    prizes: {
      sPlus: {
        id: 'crosshair_cyan_ring',
        title: 'Retícula Anel Ciano Neon',
        type: 'crosshair',
        icon: '🎯',
        description: 'Mira de precisão holográfica com anel ciano resplandecente.',
        value: 'cyan_ring'
      },
      gold: {
        id: 'trophy_cadet_gold',
        title: 'Troféu Cadete Dourado',
        type: 'trophy',
        icon: '🏆',
        description: 'Concedido por completar o Aquecimento com média sub-320ms.',
      },
      bronze: {
        id: 'badge_first_spark',
        title: 'Distintivo Faísca Neural',
        type: 'badge',
        icon: '⚡',
        description: 'Certificado de ativação dos reflexos em combate visual.',
      }
    }
  },
  {
    id: 2,
    name: 'Fase 2: Impulso Fotônico',
    subtitle: 'Nível Piloto',
    description: 'O tempo de tela encurta para 1000ms. Cuidado com Alvos Proibidos (Bombas Vermelhas)!',
    targetCount: 16,
    baseDurationMs: 1050,
    spawnDelayMinMs: 350,
    spawnDelayMaxMs: 600,
    targetSize: 74,
    movingTargets: false,
    trapChance: 0.12,
    goldenChance: 0.08,
    multiTargetMax: 1,
    unlockRequirements: { prevLevelId: 1, minStars: 1 },
    prizes: {
      sPlus: {
        id: 'crosshair_shuriken',
        title: 'Retícula Shuriken Cyberpunk',
        type: 'crosshair',
        icon: '✴️',
        description: 'Retícula angular de alta precisão inspirada na aerodinâmica ninja.',
        value: 'ninja_shuriken'
      },
      gold: {
        id: 'theme_crystals',
        title: 'Tema Figuras: Cristais Cósmicos',
        type: 'theme',
        icon: '💎',
        description: 'Transforma alvos em gemas cintilantes de rubi, esmeralda e safira.',
        value: 'crystals'
      },
      bronze: {
        id: 'trophy_pilot_silver',
        title: 'Troféu Asas de Prata',
        type: 'trophy',
        icon: '🥈',
        description: 'Conquistado com reflexos rápidos e esquiva de armadilhas.',
      }
    }
  },
  {
    id: 3,
    name: 'Fase 3: Sobrecarga Neural',
    subtitle: 'Nível Veterano',
    description: 'Apenas 820ms por figura! Alvos dourados bônus surgem velozmente e triplicam seus pontos.',
    targetCount: 20,
    baseDurationMs: 840,
    spawnDelayMinMs: 280,
    spawnDelayMaxMs: 520,
    targetSize: 66,
    movingTargets: false,
    trapChance: 0.18,
    goldenChance: 0.15,
    multiTargetMax: 1,
    unlockRequirements: { prevLevelId: 2, minStars: 1 },
    prizes: {
      sPlus: {
        id: 'crosshair_quantum_vortex',
        title: 'Retícula Vórtice Quântico',
        type: 'crosshair',
        icon: '🌀',
        description: 'Retícula gravitacional com efeito de rotação sutil contínua.',
        value: 'quantum_vortex'
      },
      gold: {
        id: 'theme_arcade',
        title: 'Tema Figuras: Retro Pixel Invaders',
        type: 'theme',
        icon: '👾',
        description: 'Transforma alvos em monstrinhos clássicos dos fliperamas dos anos 80.',
        value: 'arcade'
      },
      bronze: {
        id: 'trophy_veteran_gold',
        title: 'Troféu Tempestade de Ouro',
        type: 'trophy',
        icon: '🥇',
        description: 'Provou agilidade superior a 90% dos operadores humanos.',
      }
    }
  },
  {
    id: 4,
    name: 'Fase 4: Tempestade Cinética',
    subtitle: 'Nível Mestre',
    description: 'Atenção: Os alvos agora se deslocam e flutuam pela arena em 660ms!',
    targetCount: 24,
    baseDurationMs: 680,
    spawnDelayMinMs: 240,
    spawnDelayMaxMs: 440,
    targetSize: 58,
    movingTargets: true,
    trapChance: 0.22,
    goldenChance: 0.16,
    multiTargetMax: 2,
    unlockRequirements: { prevLevelId: 3, minStars: 2 },
    prizes: {
      sPlus: {
        id: 'crosshair_golden_cross',
        title: 'Retícula Plasma Imperial Dourada',
        type: 'crosshair',
        icon: '⚔️',
        description: 'Design lendário banhado a ouro de alta tecnologia militar.',
        value: 'golden_cross'
      },
      gold: {
        id: 'theme_plasma',
        title: 'Tema Figuras: Orbes de Plasma',
        type: 'theme',
        icon: '🔮',
        description: 'Alvos energizados com radiações pulsantes multicores.',
        value: 'plasma'
      },
      bronze: {
        id: 'trophy_kinetic_master',
        title: 'Troféu Mestre Cinético',
        type: 'trophy',
        icon: '🎖️',
        description: 'Acertos impecáveis em alvos móveis com desvio cinético.',
      }
    }
  },
  {
    id: 5,
    name: 'Fase 5: Sobrecarga Quântica',
    subtitle: 'Nível Lenda',
    description: 'Apenas 520ms de exposição! Alvos múltiplos simultâneos e armadilhas sorrateiras.',
    targetCount: 28,
    baseDurationMs: 530,
    spawnDelayMinMs: 190,
    spawnDelayMaxMs: 360,
    targetSize: 52,
    movingTargets: true,
    trapChance: 0.25,
    goldenChance: 0.18,
    multiTargetMax: 2,
    unlockRequirements: { prevLevelId: 4, minStars: 2 },
    prizes: {
      sPlus: {
        id: 'trophy_quantum_platinum',
        title: 'Troféu Platina da Singularidade',
        type: 'trophy',
        icon: '💎',
        description: 'Honraria máxima da elite neural mundial.',
      },
      gold: {
        id: 'badge_lightning_hands',
        title: 'Distintivo Relâmpago Humano',
        type: 'badge',
        icon: '⚡',
        description: 'Reconhecimento oficial de reflexos na faixa dos 200ms.',
      },
      bronze: {
        id: 'trophy_legend_star',
        title: 'Estrela da Sobrevivência',
        type: 'trophy',
        icon: '🌟',
        description: 'Superou a sobrecarga de alvos em hipermobilidade.',
      }
    }
  },
  {
    id: 6,
    name: 'Fase 6: Velocidade da Luz',
    subtitle: 'Nível Deus do Reflexo',
    description: '420ms de tempo de reação! A fronteira biológica humana. Apenas os eleitos sobrevivem.',
    targetCount: 32,
    baseDurationMs: 430,
    spawnDelayMinMs: 150,
    spawnDelayMaxMs: 300,
    targetSize: 46,
    movingTargets: true,
    trapChance: 0.28,
    goldenChance: 0.20,
    multiTargetMax: 3,
    unlockRequirements: { prevLevelId: 5, minStars: 3 },
    prizes: {
      sPlus: {
        id: 'crosshair_cyber_eye',
        title: 'Retícula Olho Cósmico Holográfico',
        type: 'crosshair',
        icon: '👁️',
        description: 'Retícula mística suprema com pulso eletromagnético sutil.',
        value: 'cyber_eye'
      },
      gold: {
        id: 'trophy_godlike_diamond',
        title: 'Troféu Deus do Reflexo (Diamante)',
        type: 'trophy',
        icon: '👑',
        description: 'A mais alta glória competitiva de tempo de resposta neural do planeta.',
      },
      bronze: {
        id: 'badge_lightspeed_titan',
        title: 'Ordem Suprema da Velocidade',
        type: 'badge',
        icon: '🌌',
        description: 'Velocidade de disparo comparada a impulsos de fibra óptica.',
      }
    }
  }
];

export function calculateTier(averageMs: number, accuracy: number): DifficultyTier {
  if (accuracy >= 94 && averageMs < 240) return 'S+';
  if (accuracy >= 90 && averageMs < 285) return 'S';
  if (accuracy >= 82 && averageMs < 350) return 'A';
  if (accuracy >= 70 && averageMs < 440) return 'B';
  if (accuracy >= 55) return 'C';
  return 'F';
}

export function calculateStars(tier: DifficultyTier): number {
  switch (tier) {
    case 'S+':
    case 'S':
      return 3;
    case 'A':
      return 2;
    case 'B':
      return 1;
    default:
      return 0;
  }
}

export function getMergedLevels(customConfigs?: Record<number, Partial<LevelConfig>>): LevelConfig[] {
  if (!customConfigs || Object.keys(customConfigs).length === 0) {
    return LEVELS;
  }
  return LEVELS.map((lvl) => {
    const custom = customConfigs[lvl.id];
    if (!custom) return lvl;
    return {
      ...lvl,
      ...custom,
      // Keep structural safety
      id: lvl.id,
      prizes: lvl.prizes,
    };
  });
}
