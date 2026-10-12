// Local performance metric only: not an online/secure leaderboard.
export function leaderboard(state) {
    return Object.values(state.factions).map((faction) => {
        const land = state.territories.filter((t) => t.owner === faction.id);
        const troops = Math.round(land.reduce((a, t) => a + t.troops, 0));
        return {
            id: faction.id, name: faction.name, territories: land.length, troops,
            score: land.length * 100 + Math.round(troops / 4) + faction.captures * 15,
        };
    }).sort((a, b) => b.score - a.score);
}
export function formatClock(seconds) {
    const total = Math.floor(seconds);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
