import { TERRAINS } from './config.js';
import { launchRevolt, mobilizeReserves, sendArmy } from './simulation.js';
const AI_IDS = ['amber', 'coral', 'violet', 'moss'];
// AI uses the same actions and rules as the player. No hidden bonuses.
export function updateAI(state, dt) {
    for (const id of AI_IDS) {
        const faction = state.factions[id];
        faction.aiDelay -= dt;
        if (faction.aiDelay > 0)
            continue;
        faction.aiDelay = 0.75 + ((faction.capital * 17 + Math.floor(state.time * 7)) % 8) * 0.11;
        const capital = state.territories[faction.capital];
        if (capital.owner !== id && launchRevolt(state, id))
            continue;
        const owned = state.territories.filter((t) => t.owner === id);
        if (!owned.length)
            continue;
        if (faction.reserves >= 80) {
            const front = owned.filter(t => t.neighbours.some(n => state.territories[n].owner !== id)).sort((a, b) => b.troops - a.troops)[0];
            if (front && mobilizeReserves(state, id, front.id))
                continue;
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
                if (available > target.t.troops * TERRAINS[target.t.terrain].defense * 0.72) {
                    sendArmy(state, source.id, target.t.id, 0.72);
                    continue;
                }
            }
        }
        // Redistribute strong rear garrisons toward an under-defended frontier.
        const rear = owned.filter((t) => t.troops > 42 && t.neighbours.every((n) => state.territories[n].owner === id)).sort((a, b) => b.troops - a.troops)[0];
        if (!rear)
            continue;
        const destination = rear.neighbours.map((n) => state.territories[n]).filter((t) => t.owner === id).sort((a, b) => {
            const af = a.neighbours.some((n) => state.territories[n].owner !== id) ? -25 : 0;
            const bf = b.neighbours.some((n) => state.territories[n].owner !== id) ? -25 : 0;
            return (a.troops + af) - (b.troops + bf);
        })[0];
        if (destination && destination.troops < rear.troops * 0.8) {
            sendArmy(state, rear.id, destination.id, 0.6);
        }
    }
}
function assessTarget(source, target) {
    const advantage = source.troops * 0.72 - target.troops * TERRAINS[target.terrain].defense;
    return (target.owner === null ? 30 : 8) + (target.capitalOf ? 13 : 0) + advantage * 0.55;
}
