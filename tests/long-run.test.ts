import { describe,expect,it } from 'vitest';
import { updateAI } from '../src/game/ai';
import { MANPOWER_RECOVERY } from '../src/game/config';
import { createGame } from '../src/game/world';
import { resolveBattle,tick } from '../src/game/simulation';
import type { GameState } from '../src/game/types';

function ledger(game:GameState){
  const stationed=game.territories.reduce((sum,t)=>sum+t.troops,0);
  const inTransit=game.marches.reduce((sum,m)=>sum+m.troops,0);
  const manpower=game.territories.reduce((sum,t)=>sum+t.manpower,0);
  const reserves=Object.values(game.factions).reduce((sum,f)=>sum+f.reserves,0);
  return stationed+inTransit+manpower+reserves;
}
function simulate(game:GameState,steps:number){
  for(let n=0;n<steps;n++){
    tick(game,.1);
    updateAI(game,.1);
  }
}
describe('Long-lived AI world integrity',()=>{
  it('never creates soldiers from a transfer, rebellion, capture or AI order',()=>{
    for(const seed of [3,29,808]){
      const game=createGame(seed);
      for(let n=0;n<1800;n++){
        const before=ledger(game);
        const controlled=game.territories.filter(t=>t.owner!==null).length;
        tick(game,.1);
        updateAI(game,.1);
        const after=ledger(game);
        const upper=before+controlled*MANPOWER_RECOVERY*.1+1e-5;
        expect(Number.isFinite(after)).toBe(true);
        expect(after).toBeLessThanOrEqual(upper);
        expect(game.territories.every(t=>Number.isFinite(t.troops)&&t.troops>=0&&t.manpower>=0)).toBe(true);
        expect(game.marches.every(m=>m.troops>=0&&m.duration>0&&m.elapsed>=0)).toBe(true);
      }
    }
  });
  it('AI expands against neutrals under identical seed-specific rules',()=>{
    for(const seed of [11,97,431]){
      const game=createGame(seed);
      simulate(game,1800);
      const aicaptures=Object.entries(game.factions)
        .filter(([id])=>id!=='player')
        .reduce((sum,[,f])=>sum+f.captures,0);
      expect(aicaptures).toBeGreaterThan(5);
      expect(game.time).toBeGreaterThan(175);
    }
  });
  it('replaying the same seed and tick commands reproduces the same world',()=>{
    const first=createGame(54321),second=createGame(54321);
    simulate(first,500);
    simulate(second,500);
    expect(first).toEqual(second);
  });
  it('does not mint a free final survivor when winning by a fractional margin',()=>{
    const game=createGame();
    const target=game.territories[game.factions.amber.capital];
    target.terrain='highland';
    target.troops=1.4;
    const before=ledger(game);
    resolveBattle(game,'player',target.id,2);
    expect(target.owner).toBe('amber');
    expect(ledger(game)).toBeLessThanOrEqual(before);
  });

});
