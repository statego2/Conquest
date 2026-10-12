import type { FactionId, Terrain } from './types';

export const MAP_COLS = 21;
export const MAP_ROWS = 7;
export const HEX_RADIUS = 35;
export const WORLD_WIDTH = Math.sqrt(3) * HEX_RADIUS * (MAP_COLS + 0.5) + 80;
export const WORLD_HEIGHT = HEX_RADIUS * (MAP_ROWS * 1.5 + 0.5) + 80;

export const FACTIONS: Record<FactionId, { name: string; color: string; col: number; row: number }> = {
  player: { name: 'THE FREE CITIES', color: '#71d9d0', col: 2, row: 3 },
  amber: { name: 'SOLAR DOMINION', color: '#e3b25d', col: 17, row: 1 },
  coral: { name: 'CRIMSON ORDER', color: '#ee697a', col: 17, row: 5 },
  violet: { name: 'THE ASCENDANCY', color: '#a797f0', col: 10, row: 0 },
  moss: { name: 'VERDANT PACT', color: '#b0c27b', col: 10, row: 6 },
};

export const TERRAINS: Record<Terrain, { defense: number; production: number; name: string }> = {
  plain: { defense: 1, production: 0.9, name: 'Lowlands' },
  fertile: { defense: 1, production: 1.35, name: 'Heartlands' },
  highland: { defense: 1.3, production: 0.65, name: 'Highlands' },
  citadel: { defense: 1.5, production: 0.7, name: 'Citadel' },
};

export const MARCH_SECONDS = 0.95;
export const REVOLT_MIN_RESERVES = 45;
export const REVOLT_COOLDOWN = 6;
export const RESERVE_CAP = 280;
export const MAX_TROOPS = 999;
