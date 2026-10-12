export const MAP_COLS = 13;
export const MAP_ROWS = 9;
export const HEX_RADIUS = 35;
export const WORLD_WIDTH = Math.sqrt(3) * HEX_RADIUS * (MAP_COLS + 0.5) + 80;
export const WORLD_HEIGHT = HEX_RADIUS * (MAP_ROWS * 1.5 + 0.5) + 80;
export const FACTIONS = {
    player: { name: 'THE FREE CITIES', color: '#5fe5d2', col: 2, row: 4 },
    amber: { name: 'SOLAR DOMINION', color: '#e8ac55', col: 10, row: 1 },
    coral: { name: 'CRIMSON ORDER', color: '#ed7186', col: 10, row: 7 },
    violet: { name: 'THE ASCENDANCY', color: '#ab96f2', col: 4, row: 0 },
    moss: { name: 'VERDANT PACT', color: '#a2cf75', col: 5, row: 8 },
};
export const TERRAINS = {
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
