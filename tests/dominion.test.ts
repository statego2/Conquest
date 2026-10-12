import { describe,expect,it } from 'vitest';
import { createGame } from '../src/game/world';
import { sendArmy,totalTroops,tick } from '../src/game/simulation';
import { leaderboard } from '../src/game/metrics';

describe('Actual power and endless world milestones',()=>{
  it('does not erase or hide a marching army from army totals or rankings',()=>{
    const game=createGame(888);
    const from=game.factions.player.capital;
    const to=game.territories[from].neighbours[0];
    const before=totalTroops(game,'player');
    const beforeRank=leaderboard(game).find(row=>row.id==='player')!;
    expect(sendArmy(game,from,to,.65)).toBe(true);
    expect(totalTroops(game,'player')).toBe(before);
    const during=leaderboard(game).find(row=>row.id==='player')!;
    expect(during.troops).toBe(beforeRank.troops);
    for(let i=0;i<15;i++)tick(game,.1);
    expect(game.marches).toHaveLength(0);
    expect(totalTroops(game,'player')).toBeGreaterThan(0);
  });
  it('ranks current political control ahead of historical conquest farming',()=>{
    const game=createGame(15);
    game.factions.player.captures=1_000_000;
    for(const t of game.territories)if(t.owner==='player'){t.owner='amber';t.troops=20;}
    game.factions.player.reserves=280;
    expect(leaderboard(game)[0].id).not.toBe('player');
    expect(leaderboard(game).find(row=>row.id==='player')!.territories).toBe(0);
  });
  it('continues simulation after the player controls the entire map',()=>{
    const game=createGame(77);
    for(const t of game.territories)t.owner='player';
    const initial=game.time;
    for(let i=0;i<30;i++)tick(game,.1);
    expect(game.time).toBeGreaterThan(initial);
    expect(game.factions.amber).toBeDefined();
    expect(game.factions.coral).toBeDefined();
    expect(game.territories.every(t=>t.owner==='player')).toBe(true);
    expect(game.factions.amber.reserves).toBeGreaterThan(28);
  });
});
