import { MAX_TROOPS, MARCH_SECONDS, RESERVE_CAP, REVOLT_COOLDOWN, REVOLT_MIN_RESERVES, TERRAINS } from './config.js';
export function ownedTerritories(state, faction) {
    return state.territories.filter((territory) => territory.owner === faction);
}
export function isNeighbour(state, from, to) {
    return state.territories[from]?.neighbours.includes(to) ?? false;
}
export function sendArmy(state, from, to, fraction = 0.65) {
    const source = state.territories[from];
    const target = state.territories[to];
    if (!source || !target || !source.owner || !isNeighbour(state, from, to))
        return false;
    const troops = Math.max(0, Math.min(source.troops - 1, Math.floor(source.troops * fraction)));
    if (troops < 2)
        return false;
    source.troops -= troops;
    state.marches.push({
        id: state.nextMarchId++, from, to, owner: source.owner, troops,
        duration: MARCH_SECONDS, elapsed: 0,
    });
    return true;
}
export function resolveBattle(state, owner, id, attackers) {
    const target = state.territories[id];
    if (!target || attackers <= 0)
        return;
    if (target.owner === owner) {
        target.troops = Math.min(MAX_TROOPS, target.troops + attackers);
        return;
    }
    const defense = TERRAINS[target.terrain].defense;
    // Attacker wins if force exceeds defenders multiplied by terrain defense.
    if (attackers > target.troops * defense) {
        const previousOwner = target.owner;
        const losses = Math.ceil(target.troops * defense);
        target.troops = Math.max(1, Math.min(MAX_TROOPS, attackers - losses));
        target.owner = owner;
        target.unrest = previousOwner === null ? 0 : 45;
        state.factions[owner].captures += 1;
        state.events.push({ type: 'capture', territory: id, owner, message: `${state.factions[owner].name} captured sector ${id + 1}` });
    }
    else {
        target.troops = Math.max(0, target.troops - Math.ceil(attackers / defense));
        state.events.push({ type: 'defense', territory: id, owner, message: `Attack repelled in sector ${id + 1}` });
    }
}
export function canRevolt(state, factionId) {
    const faction = state.factions[factionId];
    return state.territories[faction.capital].owner !== factionId &&
        faction.reserves >= REVOLT_MIN_RESERVES && faction.revoltCooldown <= 0;
}
export function launchRevolt(state, factionId) {
    if (!canRevolt(state, factionId))
        return false;
    const faction = state.factions[factionId];
    const force = Math.floor(faction.reserves);
    faction.reserves = 0;
    faction.revoltCooldown = REVOLT_COOLDOWN;
    resolveBattle(state, factionId, faction.capital, force);
    state.events.push({ type: 'revolt', territory: faction.capital, owner: factionId, message: `${faction.name}: HOMELAND UPRISING!` });
    return true;
}
export function mobilizeReserves(state, factionId, territoryId) {
    const target = state.territories[territoryId];
    const faction = state.factions[factionId];
    if (!target || target.owner !== factionId || faction.reserves < 15)
        return false;
    const troops = Math.min(MAX_TROOPS - target.troops, Math.floor(faction.reserves));
    if (troops <= 0)
        return false;
    target.troops += troops;
    faction.reserves -= troops;
    state.events.push({ type: 'mobilize', territory: territoryId, owner: factionId, message: `+${troops} reserves mobilized` });
    return true;
}
// Pure simulation clock: no DOM or rendering dependencies; portable to future server authority.
export function tick(state, dt) {
    if (state.paused || dt <= 0)
        return;
    dt = Math.min(dt, 0.1) * state.speed;
    state.time += dt;
    state.events.length = 0;
    for (const province of state.territories) {
        if (!province.owner)
            continue;
        const rate = TERRAINS[province.terrain].production;
        const homelandBoost = province.capitalOf === province.owner ? 0.45 : 0;
        province.troops = Math.min(MAX_TROOPS, province.troops + dt * (rate + homelandBoost));
        province.unrest = Math.max(0, province.unrest - dt * 1.3);
    }
    for (const faction of Object.values(state.factions)) {
        // Both human and AI gain persistent national reserves, even with zero land.
        const landless = ownedTerritories(state, faction.id).length === 0;
        const occupiedHomeland = state.territories[faction.capital].owner !== faction.id;
        const reserveRate = 0.65 + (landless ? 2.3 : 0) + (occupiedHomeland ? 1.25 : 0);
        faction.reserves = Math.min(RESERVE_CAP, faction.reserves + reserveRate * dt);
        faction.revoltCooldown = Math.max(0, faction.revoltCooldown - dt);
    }
    for (let i = state.marches.length - 1; i >= 0; i--) {
        const march = state.marches[i];
        march.elapsed += dt;
        if (march.elapsed >= march.duration) {
            state.marches.splice(i, 1);
            resolveBattle(state, march.owner, march.to, march.troops);
        }
    }
}
export function totalTroops(state, owner) {
    return Math.round(state.territories.filter((t) => t.owner === owner).reduce((sum, t) => sum + t.troops, 0));
}
