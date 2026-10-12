import { MANPOWER_CAP } from './config';
import type { GameState } from './types';
const SAVE_KEY = 'conquest-dark-strategist-v2';
export function saveGame(state: GameState): void {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({version:3,state:{...state,events:[]}})); }
  catch { /* Private mode may disallow storage. */ }
}
export function loadGame(): GameState | null {
  try {
    const parsed: unknown=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(!parsed||typeof parsed!=='object')return null;
    const payload=parsed as {version?:unknown;state?:Partial<GameState>};
    if((payload.version!==2&&payload.version!==3)||!payload.state)return null;
    const s=payload.state;
    if(!Array.isArray(s.territories)||s.territories.length!==147||!s.factions||!Array.isArray(s.marches))return null;
    if(typeof s.time!=='number'||!Number.isFinite(s.time))return null;
    if(!s.factions.player||!s.factions.amber||!s.factions.coral||!s.factions.violet||!s.factions.moss)return null;
    // In-place v2 -> v3 migration: preserve established conquests and active marches.
    for (const province of s.territories) {
      const old=province as typeof province & {manpower?:number};
      if(typeof old.manpower!=='number'||!Number.isFinite(old.manpower)){
        old.manpower=MANPOWER_CAP*0.7;
      }
      old.manpower=Math.max(0,Math.min(MANPOWER_CAP,old.manpower));
    }
    return {...s,events:[],paused:false,speed:1} as GameState;
  } catch { return null; }
}
export function clearGame(): void { try {localStorage.removeItem(SAVE_KEY);}catch{/* no storage */} }
