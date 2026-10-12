import { FACTIONS, MANPOWER_CAP, MAP_COLS, MAP_ROWS } from './config';
import type { FactionId, GameState, Terrain, Territory } from './types';

// Seeded, deterministic: later we can replay games and verify leaderboard runs.
export function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Contiguous but irregular, deterministic continental shore.
 * The sea is part of the rendered world and explicitly NOT capturable land.
 * No hidden tiles, no disappearing id indices.
 */
export function isLandCell(col:number,row:number):boolean {
  if(col<0||row<0||col>=MAP_COLS||row>=MAP_ROWS)return false;
  const top=1.65+1.45*Math.sin(col*.29+.1)+.7*Math.sin(col*.71+1.4);
  const bottom=16.95-1.15*Math.sin(col*.23+.9)-.65*Math.sin(col*.54);
  const west=1.5+1.2*Math.sin(row*.43+.7);
  const east=30.7-1.15*Math.sin(row*.48+.2);
  if(!(row>=top && row<=bottom && col>=west && col<=east))return false;
  // Navigable bays, fjords and peninsulas. The historical save-migration
  // corridor [6..26] × [6..12] remains land so no veteran conquests are lost.
  if(col>=6 && col<=10 && row<4.7-.24*Math.abs(col-8))return false;
  if(col>=22 && col<=26 && row<5.7-.25*Math.abs(col-24))return false;
  if(col>=8 && col<=13 && row>13.4+.38*Math.abs(col-10))return false;
  if(col>=21 && col<=26 && row>14.2+.25*Math.abs(col-24))return false;
  return true;
}

export function territoryId(col: number, row: number): number {
  return row * MAP_COLS + col;
}

export function hexNeighbours(col: number, row: number): number[] {
  if(!isLandCell(col,row))return [];
  const offsets = row % 2 === 0
    ? [[-1, 0], [1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]]
    : [[-1, 0], [1, 0], [0, -1], [1, -1], [0, 1], [1, 1]];
  return offsets
    .map(([dx, dy]) => [col + dx, row + dy])
    .filter(([x, y]) => isLandCell(x, y))
    .map(([x, y]) => territoryId(x, y));
}

export function createGame(seed = 24102): GameState {
  const random = seededRandom(seed);
  const territories: Territory[] = [];
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const roll = random();
      const land=isLandCell(col,row);
      const terrain: Terrain = !land ? 'sea' : roll < 0.2 ? 'highland' : roll < 0.38 ? 'fertile' : 'plain';
      territories.push({
        id: territoryId(col, row), col, row, terrain,
        owner: null, troops: land ? 7 + Math.floor(random() * 11) : 0, manpower: land ? 145 + Math.floor(random() * 26) : 0,
        capitalOf: null, unrest: 0, neighbours: hexNeighbours(col, row),
      });
    }
  }

  const factions = {} as GameState['factions'];
  for (const [id, faction] of Object.entries(FACTIONS) as [FactionId, typeof FACTIONS[FactionId]][]) {
    if(!isLandCell(faction.col,faction.row))throw new Error('Capital outside land: '+id);
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
    home.manpower = MANPOWER_CAP;
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
