import type { FactionId, GameState } from './types';
import { totalTroops } from './simulation';

export interface RankingRow {
  id: FactionId;
  name: string;
  territories: number;
  troops: number;
  score: number;
}

// Local performance metric only: not an online/secure leaderboard.
export function leaderboard(state: GameState): RankingRow[] {
  return Object.values(state.factions).map((faction) => {
    const land = state.territories.filter((t) => t.owner === faction.id);
    const troops = totalTroops(state,faction.id);
    return {
      id: faction.id, name: faction.name, territories: land.length, troops,
      // Current power, not infinitely farmable historical capture counts.
      score: land.length * 500 + Math.round(troops / 4) + Math.round(faction.reserves / 10),
    };
  }).sort((a, b) => b.score - a.score);
}

export function formatClock(seconds: number): string {
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`;
}
