import { describe, expect, it } from 'vitest';
import { createGame, hexNeighbours, seededRandom, isLandCell } from '../src/game/world';
import { canRevolt, launchRevolt, mobilizeReserves, resolveBattle, sendArmy, tick } from '../src/game/simulation';
import { MAP_COLS, MAP_ROWS } from '../src/game/config';
import { leaderboard } from '../src/game/metrics';

describe('Deterministic world', () => {
  it('generates an irregular continental war theatre and five permanent homelands', () => {
    const a=createGame(99),b=createGame(99);
    expect(a).toEqual(b);expect(a.territories).toHaveLength(MAP_COLS*MAP_ROWS);
    expect(a.territories.filter(t=>t.terrain!=='sea').length).toBeGreaterThan(390);
    expect(a.territories.filter(t=>t.terrain==='sea').length).toBeGreaterThan(100);
    expect(a.territories.every(t=>isLandCell(t.col,t.row)===(t.terrain!=='sea'))).toBe(true);
    expect(a.territories.filter(t=>t.capitalOf)).toHaveLength(5);
  });
  it('keeps all hex neighbor links symmetric and bounded',()=>{
    const world=createGame();
    for(const t of world.territories){
      expect(hexNeighbours(t.col,t.row)).toEqual(t.neighbours);
      if(t.terrain==='sea')expect(t.neighbours).toHaveLength(0);
      else expect(t.neighbours.length).toBeGreaterThan(0);
      for(const n of t.neighbours)expect(world.territories[n].neighbours).toContain(t.id);
    }
  });
  it('uses an identical random sequence for identical seeds',()=>{
    const x=seededRandom(1337),y=seededRandom(1337);
    expect([x(),x(),x()]).toEqual([y(),y(),y()]);
  });
});

describe('Conquest rules',()=>{
  it('allows legal adjacent marches without creating soldiers',()=>{
    const s=createGame();const home=s.factions.player.capital;
    const target=s.territories[home].neighbours[0];
    const before=s.territories[home].troops;
    expect(sendArmy(s,home,target,.65)).toBe(true);
    expect(s.territories[home].troops+s.marches[0].troops).toBe(before);
    expect(sendArmy(s,home,146)).toBe(false);
  });
  it('resolves capture according to garrison and terrain',()=>{
    const s=createGame(),target=s.territories.find(t=>!t.owner&&t.terrain==='plain')!;
    const ownerBefore=target.owner;
    resolveBattle(s,'player',target.id,3);
    expect(target.owner).toBe(ownerBefore);
    resolveBattle(s,'player',target.id,80);
    expect(target.owner).toBe('player');expect(target.troops).toBeGreaterThan(0);
  });
  it('retains a nation and permits a comeback after complete elimination',()=>{
    const s=createGame();
    for(const t of s.territories)if(t.owner==='player'){t.owner='amber';t.troops=1;}
    const home=s.factions.player.capital;
    expect(s.territories.filter(t=>t.owner==='player')).toHaveLength(0);
    s.factions.player.reserves=70;
    expect(canRevolt(s,'player')).toBe(true);
    expect(launchRevolt(s,'player')).toBe(true);
    expect(s.territories[home].owner).toBe('player');
    expect(s.factions.player.reserves).toBe(0);
  });
  it('makes landless resistance grow',()=>{
    const s=createGame();
    for(const t of s.territories)if(t.owner==='player')t.owner='amber';
    const before=s.factions.player.reserves;
    for(let i=0;i<40;i++)tick(s,.1);
    expect(s.factions.player.reserves).toBeGreaterThan(before+10);
  });
  it('does not allow mobilizing in hostile territory',()=>{
    const s=createGame();const rival=s.factions.amber.capital;
    expect(mobilizeReserves(s,'player',rival)).toBe(false);
    const home=s.factions.player.capital;
    expect(mobilizeReserves(s,'player',home)).toBe(true);
  });
  it('does not advance while paused',()=>{
    const s=createGame();s.paused=true;const before=JSON.stringify(s);
    tick(s,.1);expect(JSON.stringify(s)).toBe(before);
  });
  it('shows a local ranking for all factions',()=>{
    const s=createGame();const rows=leaderboard(s);
    expect(rows).toHaveLength(5);
    expect(rows[0].score).toBeGreaterThanOrEqual(rows[4].score);
  });
});
