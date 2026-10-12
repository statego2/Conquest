import { afterEach,describe,expect,it,vi } from 'vitest';
import { createGame } from '../src/game/world';
import { clearGame,loadGame,saveGame } from '../src/game/storage';
import { sendArmy,sendSupport } from '../src/game/simulation';
import { MANPOWER_CAP } from '../src/game/config';

function memoryStorage(){
  const data=new Map<string,string>();
  const store={
    getItem:(key:string)=>data.get(key)??null,
    setItem:(key:string,value:string)=>{data.set(key,value);},
    removeItem:(key:string)=>{data.delete(key);}
  };
  vi.stubGlobal('localStorage',store);
  return {data,store};
}
afterEach(()=>vi.unstubAllGlobals());

describe('Durable world persistence',()=>{
  it('roundtrips troop concentrations, corridors, occupation and identity',()=>{
    memoryStorage();
    const game=createGame(989),from=game.factions.player.capital;
    const destination=game.territories[from].neighbours.find(id=>game.territories[id].owner==='player')!;
    game.territories[destination].troops=450;
    game.territories[destination].manpower=0;
    game.time=9876.5;
    expect(sendSupport(game,from,destination,.65)).toBe(true);
    const before=JSON.stringify({...game,events:[]});
    saveGame(game);
    const loaded=loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded?.time).toBe(9876.5);
    expect(loaded?.territories[destination].troops).toBe(450);
    expect(loaded?.territories[destination].manpower).toBe(0);
    expect(loaded?.marches).toEqual(game.marches);
    expect(loaded?.territories[from].capitalOf).toBe('player');
    expect(JSON.stringify(loaded)).toBe(before);
  });
  it('migrates a v2 save without deleting a conquered world or its armies',()=>{
    const {store}=memoryStorage();
    const game=createGame(1234);
    const from=game.factions.player.capital,enemy=game.factions.amber.capital;
    game.territories[from].owner='amber';
    game.territories[enemy].owner='player';
    const to=game.territories[enemy].neighbours[0];
    sendArmy(game,enemy,to,.65);
    game.paused=true;game.speed=2;
    const legacy=JSON.parse(JSON.stringify(game));
    for(const t of legacy.territories)delete t.manpower;
    store.setItem('conquest-dark-strategist-v2',JSON.stringify({version:2,state:legacy}));
    const migrated=loadGame()!;
    expect(migrated).not.toBeNull();
    expect(migrated.territories[from].owner).toBe('amber');
    expect(migrated.territories[enemy].owner).toBe('player');
    expect(migrated.territories[enemy].capitalOf).toBe('amber');
    expect(migrated.marches.length).toBe(game.marches.length);
    expect(migrated.territories.every(t=>t.manpower===MANPOWER_CAP*.7)).toBe(true);
    expect(migrated.paused).toBe(false);
    expect(migrated.speed).toBe(1);
  });
  it('clears a world only through explicit clearing and rejects malformed input',()=>{
    const {store}=memoryStorage();
    saveGame(createGame());
    expect(loadGame()).not.toBeNull();
    clearGame();
    expect(loadGame()).toBeNull();
    store.setItem('conquest-dark-strategist-v2','{');
    expect(loadGame()).toBeNull();
  });
});
