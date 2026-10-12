import { HOMELAND_UPRISING_BONUS, MANPOWER_CAP, MANPOWER_RECOVERY, MAX_TROOPS, MARCH_SECONDS, RESERVE_CAP, REVOLT_COOLDOWN, REVOLT_MIN_RESERVES, SOFT_CAP_PRODUCTION_FACTOR, TERRAINS, TROOP_SOFT_CAP } from './config';
import type { FactionId, GameState, Territory } from './types';
import { committedTroops, uprisingCommitment, type Commitment } from './tactics';

export function ownedTerritories(state: GameState, faction: FactionId): Territory[] {
  return state.territories.filter((territory) => territory.owner === faction);
}

export function isNeighbour(state: GameState, from: number, to: number): boolean {
  return state.territories[from]?.neighbours.includes(to) ?? false;
}

export function sendArmy(state: GameState, from: number, to: number, fraction = 0.65): boolean {
  const source = state.territories[from];
  const target = state.territories[to];
  if (!source || !target || !source.owner || !isNeighbour(state, from, to)) return false;
  const troops = committedTroops(source.troops,fraction);
  if (troops < 2) return false;
  source.troops -= troops;
  state.marches.push({
    id: state.nextMarchId++, from, to, owner: source.owner, troops,
    duration: MARCH_SECONDS, elapsed: 0,
  });
  return true;
}

/** Finds a friendly corridor for a reinforcement convoy, without crossing hostile land. */
export function friendlyRoute(state: GameState, from: number, to: number): number[] | null {
  if (from === to) return null;
  const source = state.territories[from], target = state.territories[to];
  if (!source?.owner || !target || source.owner !== target.owner) return null;
  const queue = [from], parent = new Map<number, number>([[from, -1]]);
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    if (id === to) {
      const result: number[] = [];
      for (let p = to; p !== -1; p = parent.get(p) ?? -1) result.push(p);
      return result.reverse();
    }
    for (const neighbour of state.territories[id].neighbours) {
      if (parent.has(neighbour) || state.territories[neighbour].owner !== source.owner) continue;
      parent.set(neighbour, id); queue.push(neighbour);
    }
  }
  return null;
}

/** Reinforce any connected friendly province. Distance incurs real travel time. */
export function sendSupport(state: GameState, from: number, to: number, fraction = 0.65): boolean {
  const route = friendlyRoute(state, from, to);
  if (!route) return false;
  const source = state.territories[from];
  const troops = committedTroops(source.troops,fraction);
  if (troops < 2) return false;
  source.troops -= troops;
  state.marches.push({
    id: state.nextMarchId++, from, to, owner: source.owner!, troops,
    duration: MARCH_SECONDS * (route.length - 1), elapsed: 0, route,
  });
  return true;
}

export function resolveBattle(state: GameState, owner: FactionId, id: number, attackers: number, uprising = false): void {
  const target = state.territories[id];
  if (!target || attackers <= 0) return;
  if (target.owner === owner) {
    // The cap limits local recruitment, not the size of an arriving field army.
    target.troops += attackers;
    return;
  }

  const defense = TERRAINS[target.terrain].defense;
  const assault = uprising && target.capitalOf === owner ? HOMELAND_UPRISING_BONUS : 1;
  // Homeland uprisings have local advantage; normal invaders use the same defense rules.
  if (attackers * assault > target.troops * defense) {
    const previousOwner = target.owner;
    const losses = Math.ceil(target.troops * defense / assault);
    target.troops = Math.max(1, attackers - losses);
    target.owner = owner;
    target.unrest = previousOwner === null || target.capitalOf === owner ? 0 : 45;
    state.factions[owner].captures += 1;
    state.events.push({ type: 'capture', territory: id, owner, message: `${state.factions[owner].name} captured sector ${id + 1}` });
  } else {
    target.troops = Math.max(0, target.troops - Math.ceil(attackers * assault / defense));
    state.events.push({ type: 'defense', territory: id, owner, message: `Attack repelled in sector ${id + 1}` });
  }
}

export function canRevolt(state: GameState, factionId: FactionId): boolean {
  const faction = state.factions[factionId];
  return state.territories[faction.capital].owner !== factionId &&
    faction.reserves >= REVOLT_MIN_RESERVES && faction.revoltCooldown <= 0;
}

export function launchRevolt(state: GameState, factionId: FactionId, commitment: Commitment | 1 = 1): boolean {
  if (!canRevolt(state, factionId)) return false;
  const faction = state.factions[factionId];
  const force = uprisingCommitment(faction.reserves,commitment);
  if(force<REVOLT_MIN_RESERVES)return false;
  faction.reserves -= force;
  faction.revoltCooldown = REVOLT_COOLDOWN;
  resolveBattle(state, factionId, faction.capital, force, true);
  state.events.push({ type: 'revolt', territory: faction.capital, owner: factionId, message: `${faction.name}: HOMELAND UPRISING!` });
  return true;
}

export function mobilizeReserves(state: GameState, factionId: FactionId, territoryId: number): boolean {
  const target = state.territories[territoryId];
  const faction = state.factions[factionId];
  if (!target || target.owner !== factionId || faction.reserves < 15) return false;
  const troops = Math.floor(faction.reserves);
  if (troops <= 0) return false;
  target.troops += troops;
  faction.reserves -= troops;
  state.events.push({ type: 'mobilize', territory: territoryId, owner: factionId, message: `+${troops} reserves mobilized` });
  return true;
}

// Pure simulation clock: no DOM or rendering dependencies; portable to future server authority.
export function tick(state: GameState, dt: number): void {
  if (state.paused || dt <= 0) return;
  dt = Math.min(dt, 0.1) * state.speed;
  state.time += dt;
  state.events.length = 0;

  for (const province of state.territories) {
    if (!province.owner) continue;
    const rate = TERRAINS[province.terrain].production;
    const homelandBoost = province.capitalOf === province.owner ? 0.45 : 0;
    // Population recovers slowly; recruitment actually transfers population into military.
    province.manpower = Math.min(MANPOWER_CAP, province.manpower + MANPOWER_RECOVERY * dt);
    const occupation = Math.max(0.3, 1 - province.unrest / 70);
    const logistics = province.troops >= TROOP_SOFT_CAP ? SOFT_CAP_PRODUCTION_FACTOR : 1;
    const recruits = Math.min(province.manpower, Math.max(0, MAX_TROOPS - province.troops),
      dt * (rate + homelandBoost) * occupation * logistics);
    province.manpower -= recruits;
    province.troops += recruits;
    province.unrest = Math.max(0, province.unrest - dt * 1.3);
  }

  for (const faction of Object.values(state.factions)) {
    // Both human and AI gain persistent national reserves, even with zero land.
    const landless = ownedTerritories(state, faction.id).length === 0;
    const occupiedHomeland = state.territories[faction.capital].owner !== faction.id;
    const reserveRate = 0.65 + (landless ? 2.3 : 0) + (occupiedHomeland ? 1.25 : 0);
    // National reserves recruit from their cultural homeland, even during occupation.
    // This is the same finite population used by the owner: no free rival spawn.
    const home = state.territories[faction.capital];
    const remaining = Math.max(0, RESERVE_CAP - faction.reserves);
    const raised = Math.min(home.manpower, remaining, reserveRate * dt);
    home.manpower -= raised;
    faction.reserves += raised;
    faction.revoltCooldown = Math.max(0, faction.revoltCooldown - dt);
  }

  for (let i = state.marches.length - 1; i >= 0; i--) {
    const march = state.marches[i];
    march.elapsed += dt;
    if (march.elapsed >= march.duration) {
      state.marches.splice(i, 1);
      // A convoy cannot jump through a corridor that was captured while marching.
      // It fights at the first interdicted intermediate province instead.
      const intercepted = march.route?.slice(1, -1).find(id => state.territories[id].owner !== march.owner);
      resolveBattle(state, march.owner, intercepted ?? march.to, march.troops);
    }
  }

}

export function totalTroops(state: GameState, owner: FactionId): number {
  const stationed=state.territories.filter(t=>t.owner===owner).reduce((sum,t)=>sum+t.troops,0);
  const marching=state.marches.filter(m=>m.owner===owner).reduce((sum,m)=>sum+m.troops,0);
  return Math.round(stationed+marching);
}
