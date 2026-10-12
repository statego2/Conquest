export type FactionId = 'player' | 'amber' | 'coral' | 'violet' | 'moss';
export type Terrain = 'plain' | 'fertile' | 'highland' | 'citadel';

export interface Territory {
  id: number;
  col: number;
  row: number;
  terrain: Terrain;
  owner: FactionId | null;
  troops: number;
  /** Local finite recruitment pool shared by military production and homeland resistance. */
  manpower: number;
  capitalOf: FactionId | null;
  neighbours: number[];
  // Recent conquest unrest; visual signal and future space for deeper insurgency.
  unrest: number;
}

export interface Faction {
  id: FactionId;
  name: string;
  color: string;
  reserves: number;
  capital: number;
  revoltCooldown: number;
  aiDelay: number;
  captures: number;
}

export interface March {
  id: number;
  from: number;
  to: number;
  owner: FactionId;
  troops: number;
  duration: number;
  elapsed: number;
  /** Path used by long-range friendly support. Old saves have no route. */
  route?: number[];
}

export interface GameEvent {
  type: 'capture' | 'defense' | 'revolt' | 'mobilize';
  territory: number;
  owner: FactionId;
  message: string;
}

export interface GameState {
  seed: number;
  time: number;
  territories: Territory[];
  factions: Record<FactionId, Faction>;
  marches: March[];
  nextMarchId: number;
  events: GameEvent[];
  paused: boolean;
  speed: 1 | 2;
}
