import { FACTIONS, REVOLT_MIN_RESERVES, TERRAINS } from '../game/config.js';
import { formatClock, leaderboard } from '../game/metrics.js';
import { canRevolt, ownedTerritories } from '../game/simulation.js';
export class HUD {
    land;
    army;
    reserves;
    clock;
    status;
    info;
    ranks;
    revolt;
    mobilize;
    pause;
    speed;
    sound;
    toast;
    toastTimeout = 0;
    constructor(root, actions) {
        root.innerHTML = `
    <div class="shell">
      <header class="masthead">
        <div class="brand-mark">◆</div>
        <div class="brand-title"><span class="eyebrow">A WORLD THAT NEVER ENDS</span><h1>INFINITE <em>CONQUEST</em></h1></div>
        <div class="build-label"><strong>ALPHA 0.1</strong><span>SOLO · LIVE SIMULATION</span></div>
      </header>
      <main class="layout">
        <section class="war-room">
          <div class="room-topline"><span class="pulse"></span><span>THEATRE OF WAR</span><span id="status">THE WAR HAS BEGUN</span></div>
          <div class="map-shell"><canvas id="world" aria-label="Interactive strategy map"></canvas>
            <div class="map-hint">TAP TO SELECT · TAP ENEMY TO ATTACK <span class="desktop-only">· DRAG TROOPS TO MARCH · DRAG EMPTY MAP TO PAN · SCROLL TO ZOOM</span></div>
            <div class="map-tools"><button id="zoom-in" aria-label="Zoom in">+</button><button id="zoom-out" aria-label="Zoom out">−</button><button id="reset-view" aria-label="Fit map">⤢</button></div>
          </div>
          <div class="gamebar"><span>TIME <b id="clock">00:00</b></span><span><b class="legend-dot" style="background:#5fe5d2"></b> YOU</span><span><b class="legend-dot" style="background:#81919c"></b> NEUTRAL</span><button id="pause">PAUSE</button><button id="speed">1× SPEED</button><button id="sound">SOUND OFF</button></div>
        </section>
        <aside class="dashboard">
          <div class="panel intro-panel"><span class="eyebrow">YOUR CIVILIZATION</span><h2>THE FREE CITIES</h2><p>Empires rise. Empires fall.<br><strong>Your homeland remembers.</strong></p></div>
          <div class="score-grid">
            <div class="score"><span>CONTROLLED</span><strong id="land">0</strong><small>SECTORS</small></div>
            <div class="score"><span>FIELD ARMY</span><strong id="army">0</strong><small>SOLDIERS</small></div>
            <div class="score"><span>RESISTANCE</span><strong id="reserves">0</strong><small>RESERVE TROOPS</small></div>
          </div>
          <div class="panel selection-panel"><span class="eyebrow">STRATEGIC INTELLIGENCE</span><div id="selected-info">Select a sector to command your forces.</div></div>
          <div class="action-panel"><button id="mobilize" class="primary-action">DEPLOY RESERVES</button><button id="revolt" class="revolt-action">RAISE THE UPRISING</button><p class="muted small">Resistance never disappears. Even with zero territories, your people rebuild strength.</p></div>
          <div class="panel rankings"><div class="panel-header"><span class="eyebrow">GLOBAL POWER INDEX</span><span class="tiny-live">● LIVE · LOCAL</span></div><div id="ranks"></div></div>
          <button id="new-game" class="new-game">↻ START A NEW WORLD</button>
        </aside>
      </main>
      <footer class="footer"><span>CONQUEST / SIMULATION SYSTEMS</span><span>NO FINAL DEFEAT · NO FINAL VICTORY</span></footer>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
    </div>`;
        const el = (id) => { const x = root.querySelector(`#${id}`); if (!x)
            throw new Error(`Missing HUD element ${id}`); return x; };
        this.land = el('land');
        this.army = el('army');
        this.reserves = el('reserves');
        this.clock = el('clock');
        this.status = el('status');
        this.info = el('selected-info');
        this.ranks = el('ranks');
        this.toast = el('toast');
        this.revolt = el('revolt');
        this.mobilize = el('mobilize');
        this.pause = el('pause');
        this.speed = el('speed');
        this.sound = el('sound');
        this.revolt.onclick = actions.onRevolt;
        this.mobilize.onclick = actions.onMobilize;
        this.pause.onclick = actions.onPause;
        this.speed.onclick = actions.onSpeed;
        this.sound.onclick = () => { actions.onSound(); this.sound.textContent = this.sound.textContent === 'SOUND OFF' ? 'SOUND ON' : 'SOUND OFF'; };
        el('reset-view').onclick = actions.onResetView;
        el('new-game').onclick = actions.onNewGame;
        el('zoom-in').onclick = () => actions.onZoom(1.3);
        el('zoom-out').onclick = () => actions.onZoom(1 / 1.3);
    }
    get canvas() { return document.querySelector('#world'); }
    message(text) {
        this.toast.textContent = text;
        this.toast.classList.add('show');
        this.toastTimeout = performance.now() + 2400;
    }
    render(state, selected) {
        const myLand = ownedTerritories(state, 'player');
        this.land.textContent = `${myLand.length} / ${state.territories.length}`;
        this.army.textContent = myLand.reduce((s, t) => s + Math.floor(t.troops), 0).toLocaleString();
        this.reserves.textContent = String(Math.floor(state.factions.player.reserves));
        this.clock.textContent = formatClock(state.time);
        const occupied = state.territories[state.factions.player.capital].owner !== 'player';
        this.status.textContent = occupied ? 'HOMELAND OCCUPIED · RESISTANCE ACTIVE' : 'HOMELAND SECURE · EXPAND YOUR DOMAIN';
        this.status.classList.toggle('danger', occupied);
        this.pause.textContent = state.paused ? 'RESUME' : 'PAUSE';
        this.speed.textContent = `${state.speed}× SPEED`;
        this.revolt.disabled = !canRevolt(state, 'player');
        this.revolt.textContent = occupied ? `RAISE THE UPRISING · ${REVOLT_MIN_RESERVES} MIN` : 'HOMELAND SECURE';
        this.mobilize.disabled = selected === null || state.territories[selected].owner !== 'player' || state.factions.player.reserves < 15;
        if (selected !== null) {
            const t = state.territories[selected], def = TERRAINS[t.terrain];
            const owner = t.owner ? FACTIONS[t.owner].name : 'INDEPENDENT';
            this.info.innerHTML = `<div class="sector-heading"><strong>SECTOR ${String(t.id + 1).padStart(3, '0')}</strong><span>${t.capitalOf ? '⚑ CAPITAL' : def.name.toUpperCase()}</span></div>
        <div class="sector-owner">${owner}</div><div class="sector-stats"><span>GARRISON <b>${Math.floor(t.troops)}</b></span><span>DEFENSE <b>${def.defense.toFixed(2)}×</b></span></div>
        <p class="muted small">${t.owner === 'player' ? 'Tap adjacent enemy to attack; drag to adjacent ally to reinforce. Hold Shift while attacking for 90%.' : 'Select a friendly sector to command your attack.'}</p>`;
        }
        else
            this.info.innerHTML = '<p class="muted">Select a teal sector, then tap an adjacent sector to attack or reinforce.</p>';
        this.ranks.innerHTML = leaderboard(state).map((rank, i) => `<div class="rank-row ${rank.id === 'player' ? 'me' : ''}">
      <span class="rank-n">0${i + 1}</span><span class="rank-swatch" style="background:${FACTIONS[rank.id].color}"></span>
      <span class="rank-name">${rank.name}</span><strong>${rank.territories}</strong></div>`).join('');
        if (performance.now() > this.toastTimeout)
            this.toast.classList.remove('show');
    }
}
