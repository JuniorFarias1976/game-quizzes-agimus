import { BrandingColorsConfig } from '../types/game';

export const THEME_PRESETS: {
  id: BrandingColorsConfig['themePreset'];
  name: string;
  description: string;
  primary: string;
  secondary: string;
  background: string;
  headerBackground: string;
  badge: string;
}[] = [
  {
    id: 'agimus_blue',
    name: 'Agimus Azul Corporativo',
    description: 'Identidade moderna com azul tecnológico e ciano reluzente',
    primary: '#00d2ff',
    secondary: '#0284c7',
    background: '#070c18',
    headerBackground: '#060a14',
    badge: 'AGIMUS',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Estilo arcade de alta energia com magenta choque e roxo laser',
    primary: '#ec4899',
    secondary: '#a855f7',
    background: '#0c0714',
    headerBackground: '#090410',
    badge: 'NEON',
  },
  {
    id: 'emerald_tech',
    name: 'Esmeralda Bio-Tech',
    description: 'Visual futurista limpo com verde esmeralda e ciano menta',
    primary: '#10b981',
    secondary: '#06b6d4',
    background: '#05100c',
    headerBackground: '#030d0a',
    badge: 'TECH',
  },
  {
    id: 'sunset',
    name: 'Sunset Ouro Imperial',
    description: 'Tons luxuosos de ouro âmbar e laranja radiante',
    primary: '#f59e0b',
    secondary: '#f97316',
    background: '#120d07',
    headerBackground: '#0e0904',
    badge: 'GOLD',
  },
  {
    id: 'crimson',
    name: 'Rubi Titânio',
    description: 'Visual agressivo de combate visual com vermelho escarlate',
    primary: '#ef4444',
    secondary: '#e11d48',
    background: '#14080a',
    headerBackground: '#100507',
    badge: 'CRIMSON',
  },
];

export const TARGET_PRESET_IMAGES = [
  {
    id: 'corporate_shield',
    name: 'Escudo Tech',
    badge: 'BUSINESS',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2300d2ff"/><stop offset="100%" stop-color="%230284c7"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="%23050c1b"/><path d="M50 15 L80 28 V52 C80 70 50 85 50 85 C50 85 20 70 20 52 V28 Z" fill="url(%23g1)" opacity="0.9"/><path d="M50 25 L70 34 V50 C70 63 50 74 50 74 C50 74 30 63 30 50 V34 Z" fill="%23050c1b"/><circle cx="50" cy="48" r="8" fill="%2300d2ff"/></svg>',
  },
  {
    id: 'cyber_drone',
    name: 'Drone Cyber',
    badge: 'NEON',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%230d0617"/><circle cx="50" cy="50" r="34" fill="none" stroke="%23ec4899" stroke-width="3"/><circle cx="50" cy="50" r="16" fill="%23ec4899"/><line x1="18" y1="50" x2="82" y2="50" stroke="%23a855f7" stroke-width="3"/><line x1="50" y1="18" x2="50" y2="82" stroke="%23a855f7" stroke-width="3"/><circle cx="50" cy="50" r="6" fill="%23ffffff"/></svg>',
  },
  {
    id: 'plasma_core',
    name: 'Bio-Plasma',
    badge: 'BIO-TECH',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="r1"><stop offset="0%" stop-color="%23ffffff"/><stop offset="35%" stop-color="%2310b981"/><stop offset="100%" stop-color="%23042417"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="%2302130e"/><circle cx="50" cy="50" r="38" fill="url(%23r1)"/><polygon points="50,15 62,38 85,38 66,54 73,78 50,62 27,78 34,54 15,38 38,38" fill="none" stroke="%23ffffff" stroke-width="2.5"/></svg>',
  },
  {
    id: 'golden_coin',
    name: 'Moeda Agimus',
    badge: 'PREMIUM',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fde047"/><stop offset="100%" stop-color="%23ca8a04"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="%231a1003"/><circle cx="50" cy="50" r="42" fill="url(%23gold)"/><circle cx="50" cy="50" r="32" fill="%231a1003"/><polygon points="50,26 57,41 74,41 60,51 65,66 50,56 35,66 40,51 26,41 43,41" fill="url(%23gold)"/></svg>',
  },
  {
    id: 'holo_target',
    name: 'Alvo Holográfico',
    badge: 'REFLEX',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23030c14"/><circle cx="50" cy="50" r="38" fill="none" stroke="%2338bdf8" stroke-width="2" stroke-dasharray="8,4"/><circle cx="50" cy="50" r="24" fill="none" stroke="%2338bdf8" stroke-width="3"/><circle cx="50" cy="50" r="10" fill="%2338bdf8"/><line x1="10" y1="50" x2="90" y2="50" stroke="%2338bdf8" stroke-width="2"/><line x1="50" y1="10" x2="50" y2="90" stroke="%2338bdf8" stroke-width="2"/></svg>',
  },
  {
    id: 'boehringer_icon',
    name: 'Boehringer Ingelheim',
    badge: 'MARCA',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23031a15"/><rect x="34" y="20" width="32" height="60" rx="16" fill="none" stroke="%2310b981" stroke-width="4"/><line x1="42" y1="36" x2="42" y2="64" stroke="%2310b981" stroke-width="3.5"/><line x1="50" y1="28" x2="50" y2="72" stroke="%2310b981" stroke-width="3.5"/><line x1="58" y1="36" x2="58" y2="64" stroke="%2310b981" stroke-width="3.5"/></svg>',
  },
];
