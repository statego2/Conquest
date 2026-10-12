import { FACTIONS, MAP_COLS, MAP_ROWS } from './config.js';
// Seeded, deterministic: later we can replay games and verify leaderboard runs.
export function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
        value = (value + 0x6d2b79f5) >>> 0;
        let t = value;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
export function territoryId(col, row) {
    return row * MAP_COLS + col;
}
export function hexNeighbours(col, row) {
    const offsets = row % 2 === 0
        ? [[-1, 0], [1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]]
        : [[-1, 0], [1, 0], [0, -1], [1, -1], [0, 1], [1, 1]];
    return offsets
        .map(([dx, dy]) => [col + dx, row + dy])
        .filter(([x, y]) => x >= 0 && x < MAP_COLS && y >= 0 && y < MAP_ROWS)
        .map(([x, y]) => territoryId(x, y));
}
export function createGame(seed = 24102) {
    const random = seededRandom(seed);
    const territories = [];
    for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
            const roll = random();
            const terrain = roll < 0.2 ? 'highland' : roll < 0.38 ? 'fertile' : 'plain';
            territories.push({
                id: territoryId(col, row), col, row, terrain,
                owner: null, troops: 7 + Math.floor(random() * 11),
                capitalOf: null, unrest: 0, neighbours: hexNeighbours(col, row),
            });
        }
    }
    const factions = {};
    for (const [id, faction] of Object.entries(FACTIONS)) {
        const capitalId = territoryId(faction.col, faction.row);
        factions[id] = {
            id, name: faction.name, color: faction.color,
            capital: capitalId, reserves: 28, revoltCooldown: 0, aiDelay: 1.3 + random(), captures: 0,
        };
        const home = territories[capitalId];
        home.capitalOf = id;
        home.terrain = 'citadel';
        home.owner = id;
        home.troops = 57;
        home.neighbours.slice(0, 3).forEach((neighbourId) => {
            const neighbour = territories[neighbourId];
            if (neighbour.owner === null) {
                neighbour.owner = id;
                neighbour.troops = 19;
            }
        });
    }
    return {
        seed, time: 0, territories, factions, marches: [], nextMarchId: 1,
        events: [], paused: false, speed: 1,
    };
}
