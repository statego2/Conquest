const SAVE_KEY = 'infinite-conquest-v1';
export function saveGame(state) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, state: { ...state, events: [] } }));
    }
    catch { /* Private mode may disallow storage. */ }
}
export function loadGame() {
    try {
        const parsed = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
        if (!parsed || typeof parsed !== 'object')
            return null;
        const payload = parsed;
        if (payload.version !== 1 || !payload.state)
            return null;
        const s = payload.state;
        if (!Array.isArray(s.territories) || s.territories.length !== 117 || !s.factions || !Array.isArray(s.marches))
            return null;
        if (typeof s.time !== 'number' || !Number.isFinite(s.time))
            return null;
        if (!s.factions.player || !s.factions.amber || !s.factions.coral || !s.factions.violet || !s.factions.moss)
            return null;
        return { ...s, events: [], paused: false, speed: 1 };
    }
    catch {
        return null;
    }
}
export function clearGame() { try {
    localStorage.removeItem(SAVE_KEY);
}
catch { /* no storage */ } }
