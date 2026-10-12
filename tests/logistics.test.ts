import { describe, expect, it } from 'vitest';
import { MANPOWER_CAP, MAX_TROOPS, MARCH_SECONDS } from '../src/game/config';
import { friendlyRoute, isNeighbour, launchRevolt, sendSupport, tick } from '../src/game/simulation';
import { createGame } from '../src/game/world';
import type { GameState } from '../src/game/types';

function convoyScenario(): { game: GameState; from: number; via: number; to: number } {
  const game = createGame(4096);
  const from = game.factions.player.capital;
  const via = game.territories[from].neighbours.find(id => game.territories[id].owner === 'player')!;
  const to = game.territories[via].neighbours.find(id =>
    id !== from && !isNeighbour(game, from, id) && game.territories[id].owner === null)!;
  expect(to).toBeDefined();
  game.territories[to].owner = 'player';
  return { game, from, via, to };
}

describe('Reinforcement corridors (Alpha 0.3)', () => {
  it('connects distant friendly territories using a real path and travel time', () => {
    const { game, from, via, to } = convoyScenario();
    expect(friendlyRoute(game, from, to)).toEqual([from, via, to]);
    const before = game.territories[from].troops;
    expect(sendSupport(game, from, to, .65)).toBe(true);
    expect(game.marches).toHaveLength(1);
    expect(game.marches[0].route).toEqual([from, via, to]);
    expect(game.marches[0].duration).toBeCloseTo(MARCH_SECONDS * 2);
    expect(game.territories[from].troops + game.marches[0].troops).toBeCloseTo(before);
  });

  it('rejects support through enemy land without removing any troops', () => {
    const { game, from, via, to } = convoyScenario();
    game.territories[via].owner = 'amber';
    const before = game.territories[from].troops;
    expect(friendlyRoute(game, from, to)).toBeNull();
    expect(sendSupport(game, from, to)).toBe(false);
    expect(game.territories[from].troops).toBe(before);
    expect(game.marches).toHaveLength(0);
  });

  it('intercepts a convoy if the friendly corridor falls during travel', () => {
    const { game, from, via, to } = convoyScenario();
    const destinationTroops = game.territories[to].troops;
    expect(sendSupport(game, from, to)).toBe(true);
    game.territories[via].owner = 'amber';
    for (let i = 0; i < 22; i++) tick(game, .1);
    expect(game.marches).toHaveLength(0);
    expect(game.territories[to].troops).toBeGreaterThanOrEqual(destinationTroops);
    // The intercepted convoy fights at the blocked sector, not teleports through it.
    expect(game.territories[via].owner).toBe('player');
  });
});

describe('Sustainable world economics (Alpha 0.3)', () => {
  it('transfers homeland manpower into reserves rather than spawning free armies', () => {
    const game = createGame(7);
    const home = game.territories[game.factions.player.capital];
    home.troops = MAX_TROOPS;
    home.manpower = 50;
    game.factions.player.reserves = 0;
    tick(game, .1);
    expect(home.manpower).toBeLessThan(50 + .075);
    expect(game.factions.player.reserves).toBeGreaterThan(0);
    expect((home.manpower + game.factions.player.reserves)).toBeCloseTo(50 + .075, 5);
  });

  it('starts each sector with a bounded manpower supply', () => {
    const game = createGame();
    expect(game.territories.every(t => t.manpower >= 0 && t.manpower <= MANPOWER_CAP)).toBe(true);
    for (let i = 0; i < 1200; i++) tick(game, .1);
    expect(game.territories.every(t => t.troops <= MAX_TROOPS && t.manpower >= 0 && t.manpower <= MANPOWER_CAP)).toBe(true);
  });

  it('supports homeland uprisings against a defended citadel without ending the world', () => {
    const game = createGame();
    const home = game.factions.player.capital;
    for (const territory of game.territories) {
      if (territory.owner === 'player') { territory.owner = 'amber'; territory.troops = 200; }
    }
    game.factions.player.reserves = 220;
    expect(launchRevolt(game, 'player')).toBe(true);
    expect(game.territories[home].owner).toBe('player');
    expect(game.time).toBe(0);
    tick(game,.1);
    expect(game.time).toBeGreaterThan(0);
  });
});

describe('Field-army concentration above local recruitment cap',()=>{
  it('conserves all incoming soldiers rather than silently deleting reinforcement overflow',()=>{
    const game=createGame();
    const [from,to]=[game.factions.player.capital,game.territories[game.factions.player.capital].neighbours.find(id=>game.territories[id].owner==='player')!];
    game.territories[from].troops=200;
    game.territories[to].troops=210;
    const soldiersBefore=game.territories[from].troops+game.territories[to].troops;
    expect(sendSupport(game,from,to,.9)).toBe(true);
    for(let n=0;n<12;n++)tick(game,.1);
    expect(game.territories[to].troops).toBeGreaterThan(MAX_TROOPS);
    expect(game.territories[from].troops+game.territories[to].troops).toBeGreaterThanOrEqual(soldiersBefore);
  });
  it('can concentrate two regions to overwhelm a strongly defended citadel',()=>{
    const game=createGame();
    const from=game.factions.player.capital;
    const ally=game.territories[from].neighbours.find(id=>game.territories[id].owner==='player')!;
    game.territories[from].troops=200;
    game.territories[ally].troops=190;
    game.territories[ally].terrain='citadel';
    expect(sendSupport(game,from,ally,.9)).toBe(true);
    for(let n=0;n<12;n++)tick(game,.1);
    expect(game.territories[ally].troops).toBeGreaterThan(340);
  });
});
