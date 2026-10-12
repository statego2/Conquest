import { TERRAINS } from './config';
import { friendlyRoute, launchRevolt, mobilizeReserves, sendArmy, sendSupport } from './simulation';
import type { FactionId, GameState, Territory } from './types';

const AI_IDS: FactionId[] = ['amber', 'coral', 'violet', 'moss'];

// AI uses the same actions and rules as the player. No hidden bonuses.
export function updateAI(state: GameState, dt: number): void {
  for (const id of AI_IDS) {
    const faction = state.factions[id];
    faction.aiDelay -= dt;
    if (faction.aiDelay > 0) continue;
    faction.aiDelay = 0.75 + ((faction.capital * 17 + Math.floor(state.time * 7)) % 8) * 0.11;

    const capital = state.territories[faction.capital];
    if (capital.owner !== id && launchRevolt(state, id)) continue;

    const owned = state.territories.filter((t) => t.owner === id);
    if (!owned.length) continue;
    if (faction.reserves >= 80) {
      const front = owned.filter(t => t.neighbours.some(n => state.territories[n].owner !== id)).sort((a,b)=>b.troops-a.troops)[0];
      if (front && mobilizeReserves(state, id, front.id)) continue;
    }
    const frontier = owned
      .filter((t) => t.troops >= 17 && t.neighbours.some((n) => state.territories[n].owner !== id))
      .sort((a, b) => b.troops - a.troops);
    const source = frontier[0];

    if (source) {
      const enemyNeighbours = source.neighbours
        .map((n) => state.territories[n])
        .filter((n) => n.owner !== id);
      // Neutral land is most attractive. Attack armies when the odds are sensible.
      const target = enemyNeighbours
        .map((t) => ({ t, value: assessTarget(source, t) }))
        .sort((a, b) => b.value - a.value)[0];
      if (target && target.value > -25) {
        const available = Math.floor(source.troops * 0.72);
        // Attacks must actually have enough force to overcome defensive terrain.
        if (available > target.t.troops * TERRAINS[target.t.terrain].defense + 3) {
          sendArmy(state, source.id, target.t.id, 0.72);
          continue;
        }
      }
    }

    // Supply an endangered frontline across ANY connected friendly corridor.
    // Keep meaningful reserves at the rear rather than emptying every homeland.
    const rear=owned.filter(t=>t.troops>78 &&
      t.neighbours.every(n=>state.territories[n].owner===id)).sort((a,b)=>b.troops-a.troops)[0];
    if (!rear) continue;
    const destination=owned.filter(t=>t.id!==rear.id && t.troops<55 &&
      t.neighbours.some(n=>state.territories[n].owner!==id) &&
      friendlyRoute(state,rear.id,t.id)!==null)
      .sort((a,b)=>a.troops-b.troops)[0];
    if (destination) sendSupport(state,rear.id,destination.id,0.5);
  }
}

function assessTarget(source: Territory, target: Territory): number {
  const advantage = source.troops * 0.72 - target.troops * TERRAINS[target.terrain].defense;
  return (target.owner === null ? 30 : 8) + (target.capitalOf ? 13 : 0) + advantage * 0.55;
}
