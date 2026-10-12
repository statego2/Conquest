import { MANPOWER_CAP, MAP_COLS, MAP_ROWS } from './config';
import { createGame, territoryId } from './world';
import type { GameState } from './types';
const SAVE_KEY = 'conquest-dark-strategist-v2';
const OLD_COLS = 21;
const OLD_ROWS = 7;

export function saveGame(state: GameState): void {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({version:4,state:{...state,events:[]}})); }
  catch { /* Private browsing may disallow storage. */ }
}

/** Keep every existing commander, occupation, reserve and moving army on the larger world. */
export function migrateRectangularWorld(old: GameState): GameState {
  if(old.territories.length !== OLD_COLS * OLD_ROWS) return old;
  const expanded = createGame(old.seed);
  // Preserve legacy regions exactly inside a larger neutral continent.
  for(const t of expanded.territories) {
    t.owner = null;
    t.capitalOf = null;
    if(t.terrain==='citadel')t.terrain='plain';
  }
  const mapId = (oldId: number): number => {
    const oldTerritory=old.territories[oldId];
    if(!oldTerritory)throw new Error('Invalid legacy region '+oldId);
    return territoryId(oldTerritory.col + 6, oldTerritory.row + 6);
  };
  for(const region of old.territories) {
    const id=mapId(region.id);
    const target=expanded.territories[id];
    if(target.terrain==='sea')throw new Error('Legacy region migrated to sea');
    Object.assign(target,{
      terrain:region.terrain,owner:region.owner,troops:region.troops,
      manpower:Number.isFinite(region.manpower)?region.manpower:MANPOWER_CAP*.7,
      capitalOf:region.capitalOf,unrest:region.unrest
    });
  }
  for(const faction of Object.values(expanded.factions)){
    const previous=old.factions[faction.id];
    Object.assign(faction, previous, {capital:mapId(previous.capital)});
  }
  expanded.marches=old.marches.map(m=>({
    ...m,from:mapId(m.from),to:mapId(m.to),
    route:m.route?.map(mapId)
  }));
  expanded.nextMarchId=old.nextMarchId;
  expanded.time=old.time;
  expanded.speed=old.speed;
  expanded.paused=false;
  expanded.events=[];
  return expanded;
}

export function loadGame(): GameState | null {
  try {
    const parsed:unknown=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(!parsed || typeof parsed!=='object')return null;
    const payload=parsed as {version?:unknown;state?:Partial<GameState>};
    if(![2,3,4].includes(Number(payload.version))||!payload.state)return null;
    const s=payload.state;
    if(!Array.isArray(s.territories)||!s.factions||!Array.isArray(s.marches))return null;
    if(![OLD_COLS*OLD_ROWS,MAP_COLS*MAP_ROWS].includes(s.territories.length))return null;
    if(typeof s.time!=='number'||!Number.isFinite(s.time))return null;
    if(!s.factions.player||!s.factions.amber||!s.factions.coral||!s.factions.violet||!s.factions.moss)return null;
    for(const province of s.territories) {
      if(!province||typeof province!=='object')return null;
      if(typeof province.manpower!=='number'||!Number.isFinite(province.manpower))province.manpower=MANPOWER_CAP*.7;
      province.manpower=Math.max(0,Math.min(MANPOWER_CAP,province.manpower));
    }
    const restored={...s,events:[],paused:false,speed:1} as GameState;
    return migrateRectangularWorld(restored);
  } catch { return null; }
}
export function clearGame():void{try{localStorage.removeItem(SAVE_KEY);}catch{/* no storage */}}
