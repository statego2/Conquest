import { HOMELAND_UPRISING_BONUS, REVOLT_MIN_RESERVES, TERRAINS } from './config';
import type { FactionId, GameState } from './types';

export type Commitment = 0.35 | 0.65 | 0.9;
export const COMMITMENTS: readonly Commitment[] = [0.35,0.65,0.9];

export function nextCommitment(current: Commitment): Commitment {
  const i=COMMITMENTS.indexOf(current);
  return COMMITMENTS[(i+1)%COMMITMENTS.length];
}

export function committedTroops(source: number, commitment: number): number {
  if(!Number.isFinite(source) || !Number.isFinite(commitment) || commitment<=0) return 0;
  return Math.max(0,Math.min(Math.floor(source)-1,Math.floor(source*commitment)));
}

export type Forecast = { outcome: 'win'|'lose'|'hold'|'invalid'; attacking: number; defending: number; surviving: number; disadvantage: number };
/**
 * Forecast matches the deterministic combat core, including the citadel modifier.
 * Transport delays and later reinforcements can change actual outcomes.
 */
export function battleForecast(state:GameState,from:number,to:number,commitment:Commitment):Forecast {
  const source=state.territories[from],target=state.territories[to];
  if(!source||!target||!source.owner||!source.neighbours.includes(to))return {outcome:'invalid',attacking:0,defending:0,surviving:0,disadvantage:0};
  const troops=committedTroops(source.troops,commitment);
  if(troops<2)return {outcome:'invalid',attacking:troops,defending:target.troops,surviving:0,disadvantage:0};
  if(target.owner===source.owner)return {outcome:'hold',attacking:troops,defending:target.troops,surviving:troops,disadvantage:0};
  const defense=target.troops*TERRAINS[target.terrain].defense;
  const survivors=Math.max(0,troops-Math.ceil(defense));
  return {outcome:troops>defense?'win':'lose',attacking:troops,defending:Math.ceil(defense),surviving:survivors,disadvantage:Math.max(0,Math.ceil(defense)-troops+1)};
}

export function uprisingCommitment(reserves:number,commitment:Commitment|1):number {
  if(reserves<REVOLT_MIN_RESERVES)return 0;
  // Enforce a minimum meaningful rebellion rather than consuming fractional scraps.
  return Math.min(Math.floor(reserves),Math.max(REVOLT_MIN_RESERVES,Math.floor(reserves*commitment)));
}

export function uprisingForecast(state:GameState,id:FactionId,commitment:Commitment): Forecast {
  const faction=state.factions[id],home=state.territories[faction.capital];
  const troops=uprisingCommitment(faction.reserves,commitment);
  if(home.owner===id||faction.revoltCooldown>0||troops<REVOLT_MIN_RESERVES){
    return {outcome:'invalid',attacking:troops,defending:home.troops,surviving:0,disadvantage:0};
  }
  const effective=home.troops*TERRAINS[home.terrain].defense/HOMELAND_UPRISING_BONUS;
  return {outcome:troops>effective?'win':'lose',attacking:troops,defending:Math.ceil(effective),
    surviving:Math.max(0,troops-Math.ceil(effective)),disadvantage:Math.max(0,Math.floor(effective)-troops+1)};
}
