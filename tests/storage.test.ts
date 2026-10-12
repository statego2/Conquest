import { afterEach,describe,expect,it,vi } from 'vitest';
import { createGame, territoryId } from '../src/game/world';
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
  it('transplants legacy 147-region wars with cities, troop counts and marches into new continent',()=>{
    const {store}=memoryStorage();
    const game=createGame(1234);
    const mapped=(col:number,row:number)=>territoryId(col+6,row+6);
    const oldRegions=Array.from({length:147},(_,id)=>{
      const col=id%21,row=Math.floor(id/21);
      const t=game.territories[mapped(col,row)];
      return {...t,id,col,row,owner:null,capitalOf:null,neighbours:[],manpower:undefined};
    });
    const legacy=JSON.parse(JSON.stringify(game));
    legacy.territories=oldRegions;
    const capitals={player:65,amber:38,coral:122,violet:10,moss:136};
    for(const [faction,capital] of Object.entries(capitals)){
      legacy.factions[faction].capital=capital;
      legacy.territories[capital].capitalOf=faction;
      legacy.territories[capital].terrain='citadel';
      legacy.territories[capital].owner=faction;
    }
    legacy.territories[65].owner='amber';
    legacy.territories[38].owner='player';
    legacy.territories[38].troops=412;
    legacy.factions.player.reserves=121;
    legacy.marches=[{id:3,from:38,to:39,owner:'player',troops:40,duration:.95,elapsed:.1,route:[38,39]}];
    legacy.time=874;
    store.setItem('conquest-dark-strategist-v2',JSON.stringify({version:2,state:legacy}));
    const migrated=loadGame()!;
    expect(migrated.territories.length).toBe(33*19);
    expect(migrated.territories[mapped(65%21,Math.floor(65/21))].owner).toBe('amber');
    expect(migrated.territories[mapped(38%21,Math.floor(38/21))].owner).toBe('player');
    expect(migrated.territories[mapped(38%21,Math.floor(38/21))].troops).toBe(412);
    expect(migrated.marches[0].from).toBe(mapped(38%21,Math.floor(38/21)));
    expect(migrated.factions.player.capital).toBe(mapped(65%21,Math.floor(65/21)));
    expect(migrated.factions.player.reserves).toBe(121);
    expect(migrated.time).toBe(874);
    expect(migrated.territories.every(t=>t.manpower>=0 && t.manpower<=MANPOWER_CAP)).toBe(true);
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
