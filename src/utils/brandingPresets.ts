import { BrandingColorsConfig } from '../types/game';

export const THEME_PRESETS: {
  id: BrandingColorsConfig['themePreset'];
  name: string;
  description: string;
  primary: string;
  secondary: string;
  background: string;
  badge: string;
}[] = [
  {
    id: 'agimus_blue',
    name: 'Agimus Azul Corporativo',
    description: 'Identidade moderna com azul tecnológico e ciano reluzente',
    primary: '#00d2ff',
    secondary: '#0284c7',
    background: '#070c18',
    badge: 'AGIMUS',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Estilo arcade de alta energia com magenta choque e roxo laser',
    primary: '#ec4899',
    secondary: '#a855f7',
    background: '#0c0714',
    badge: 'NEON',
  },
  {
    id: 'emerald_tech',
    name: 'Esmeralda Bio-Tech',
    description: 'Visual futurista limpo com verde esmeralda e ciano menta',
    primary: '#10b981',
    secondary: '#06b6d4',
    background: '#05100c',
    badge: 'TECH',
  },
  {
    id: 'sunset',
    name: 'Sunset Ouro Imperial',
    description: 'Tons luxuosos de ouro âmbar e laranja radiante',
    primary: '#f59e0b',
    secondary: '#f97316',
    background: '#120d07',
    badge: 'GOLD',
  },
  {
    id: 'crimson',
    name: 'Rubi Titânio',
    description: 'Visual agressivo de combate visual com vermelho escarlate',
    primary: '#ef4444',
    secondary: '#e11d48',
    background: '#14080a',
    badge: 'CRIMSON',
  },
];
