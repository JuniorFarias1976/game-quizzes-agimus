import { AppAdminSettings, CustomTargetImageConfig } from '../types/game';

const ADMIN_STORAGE_KEY = 'neuroreflex_admin_settings_v1';
const DEFAULT_PASSWORD = 'admin123';

export const DEFAULT_ADMIN_SETTINGS: AppAdminSettings = {
  passwordHash: DEFAULT_PASSWORD,
  lockEntireAppWithPassword: false,
  customImageMandatory: false,
  customTargetImage: {
    enabled: false,
    imageUrl: '',
    shapeFit: 'cover',
    customBorderColor: '#00d2ff',
    images: [],
    randomizeImages: true,
  },
  endGameImage: {
    enabled: true,
    imageUrl: '',
    imageName: '',
    headline: 'Parabéns pelo Desafio!',
    subheadline: 'Obrigado por participar! Consulte a sua pontuação e tempo de reação abaixo.',
    ctaText: 'Começar Novamente',
  },
  customLevelConfigs: {},
  tournamentMode: false,
  adminDisplayName: 'Administrador Agimus',
  branding: {
    primaryColor: '#00d2ff',
    secondaryColor: '#0284c7',
    backgroundColor: '#070c18',
    headerBackgroundColor: '#060a14',
    headerStyle: 'glass',
    backgroundPattern: 'grid',
    backgroundImageUrl: '',
    backgroundImageOpacity: 0.25,
    backgroundImageFit: 'fill', // Default: fill the entire page without crop
    backgroundImagePosition: 'center',
    themePreset: 'agimus_blue',
    showHeaderControls: false, // Default: false (Removes stars, sound, and player badge from header)
    showAdminButtonInHeader: false, // Default: false (Removes admin button from header)
  },
  logo: {
    enabled: true,
    logoUrl: '',
    companyName: 'AGIMUS',
    subTitle: 'KIOSK GAME ARENA',
    showBrandText: false, // Default: false (Removes text next to logo in header)
  },
  registration: {
    enabled: true,
    requireName: true,
    showEmail: true,
    requireEmail: true,
    showPhone: true,
    requirePhone: false,
    showCompany: true,
    requireCompany: false,
    showCargo: true,
    requireCargo: false,
    showConsent: true,
    title: 'Inscrição no Quiosque Agimus',
    description: 'Preencha seus dados para entrar no placar oficial do evento e disputar prêmios.',
    consentText: 'Autorizo o contato da Agimus para envio de resultados e novidades do evento.',
  },
  gameTexts: {
    splashTitle: 'ARENA DE REFLEXOS',
    splashSubtitle: 'Acerte as figuras que surgem no ecrã o mais rápido possível para pontuar pelo seu tempo de reação!',
    startGameButtonText: 'COMEÇAR JOGO',
    splashHintText: 'Toque no botão para iniciar a contagem regressiva',
    showLevelBadge: true,
    showParameterChips: true,
  },
};

export function loadAdminSettings(): AppAdminSettings {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return DEFAULT_ADMIN_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ADMIN_SETTINGS,
      ...parsed,
      endGameImage: {
        ...DEFAULT_ADMIN_SETTINGS.endGameImage,
        ...(parsed.endGameImage || {}),
      },
      branding: {
        ...DEFAULT_ADMIN_SETTINGS.branding,
        ...(parsed.branding || {}),
      },
      logo: {
        ...DEFAULT_ADMIN_SETTINGS.logo,
        ...(parsed.logo || {}),
      },
      registration: {
        ...DEFAULT_ADMIN_SETTINGS.registration,
        ...(parsed.registration || {}),
      },
      gameTexts: {
        ...DEFAULT_ADMIN_SETTINGS.gameTexts,
        ...(parsed.gameTexts || {}),
      },
      customLevelConfigs: parsed.customLevelConfigs || DEFAULT_ADMIN_SETTINGS.customLevelConfigs || {},
    };
  } catch {
    return DEFAULT_ADMIN_SETTINGS;
  }
}

export function saveAdminSettings(settings: AppAdminSettings): void {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function verifyAdminPassword(password: string): boolean {
  const current = loadAdminSettings();
  const target = current.passwordHash || DEFAULT_PASSWORD;
  return password === target;
}

export function updateAdminPassword(newPassword: string): void {
  const current = loadAdminSettings();
  current.passwordHash = newPassword;
  saveAdminSettings(current);
}

export function resetAdminToDefaults(): AppAdminSettings {
  saveAdminSettings(DEFAULT_ADMIN_SETTINGS);
  return DEFAULT_ADMIN_SETTINGS;
}
