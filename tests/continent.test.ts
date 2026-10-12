import { describe,expect,it } from 'vitest';
import { MAP_COLS, MAP_ROWS, MARCH_SECONDS } from '../src/game/config';
import { createGame,hexNeighbours,isLandCell } from '../src/game/world';
import { resolveBattle,sendArmy,sendOffensive,tick } from '../src/game/simulation';
import { automaticView } from '../src/game/view';

describe('Living continental world',()=>{
  it('has ocean, a navigable irregular coast and permanent inland homeland',()=>{
    const game=createGame(1812);
    expect(game.territories).toHaveLength(MAP_COLS*MAP_ROWS);
    const coast=game.territories.filter(t=>t.terrain==='sea');
    expect(coast.length).toBeGreaterThan(100);
    expect(coast.every(t=>t.owner===null&&t.troops===0&&t.neighbours.length===0)).toBe(true);
    for(const t of game.territories){
      expect(isLandCell(t.col,t.row)).toBe(t.terrain!=='sea');
      if(t.terrain==='sea')continue;
      for(const neighbour of hexNeighbours(t.col,t.row)){
        expect(game.territories[neighbour].terrain).not.toBe('sea');
        expect(game.territories[neighbour].neighbours).toContain(t.id);
      }
    }
    for(const faction of Object.values(game.factions)){
      expect(game.territories[faction.capital].terrain).toBe('citadel');
      expect(game.territories[faction.capital].owner).toBe(faction.id);
    }
  });
  it('never allows a land faction to capture, recruit from or march into the sea',()=>{
    const game=createGame(22);
    const sea=game.territories.find(t=>t.terrain==='sea')!;
    const troopsBefore=game.territories[game.factions.player.capital].troops;
    resolveBattle(game,'player',sea.id,10000);
    expect(sea.owner).toBeNull();
    expect(sendArmy(game,game.factions.player.capital,sea.id,.9)).toBe(false);
    expect(sea.troops).toBe(0);
    expect(game.territories[game.factions.player.capital].troops).toBe(troopsBefore);
    for(let i=0;i<100;i++)tick(game,.1);
    expect(sea.owner).toBeNull();
  });
  it('issues actual offensives from a distant allied army across legal friendly territory',()=>{
    const game=createGame(2026);
    const from=game.factions.player.capital;
    const mid=game.territories[from].neighbours.find(id=>game.territories[id].owner==='player')!;
    const target=game.territories[mid].neighbours.find(id=>game.territories[id].owner===null
      && !game.territories[from].neighbours.includes(id))!;
    expect(target).toBeDefined();
    game.territories[mid].owner='player';
    game.territories[from].troops=160;
    const before=game.territories[from].troops;
    expect(sendOffensive(game,from,target,.65)).toBe(true);
    expect(game.marches[0].route).toEqual([from,mid,target]);
    expect(game.marches[0].duration).toBeCloseTo(MARCH_SECONDS*2);
    expect(game.territories[from].troops+game.marches[0].troops).toBe(before);
    for(let i=0;i<30;i++)tick(game,.1);
    expect(game.territories[target].owner).toBe('player');
  });
  it('prevents an offensive across detached friendly islands',()=>{
    const game=createGame();
    const source=game.factions.player.capital;
    const far=game.factions.coral.capital;
    expect(sendOffensive(game,source,far)).toBe(false);
    expect(game.marches).toHaveLength(0);
    expect(automaticView(60)).toBe('strategic');
  });
});
