import { describe,expect,it } from 'vitest';
import { updateAI } from '../src/game/ai';
import { createGame } from '../src/game/world';
import { tick } from '../src/game/simulation';

function concentratedWorld(){
  const game=createGame(8675309),home=game.factions.amber.capital;
  const invaded=game.territories[home].neighbours[0];
  for(const t of game.territories){t.owner='amber';t.troops=10;t.manpower=0;}
  game.territories[home].troops=60;
  game.territories[invaded].owner='player';
  game.territories[invaded].troops=80;
  game.territories[invaded].terrain='citadel';
  const donor=game.territories.find(t=>t.id!==home&&t.id!==invaded&&
    !t.neighbours.includes(invaded)&&t.neighbours.includes(home))?.id
    ?? game.territories.find(t=>t.id!==home&&t.id!==invaded&&!t.neighbours.includes(invaded))!.id;
  game.territories[donor].troops=180;
  game.factions.amber.reserves=0;
  game.factions.amber.aiDelay=0;
  for(const id of ['coral','violet','moss'] as const){
    game.factions[id].reserves=0;
    game.factions[id].aiDelay=9999;
  }
  return {game,home,invaded,donor};
}

describe('AI operational strategy',()=>{
  it('concentrates a legal convoy when the next frontline attack is not yet viable',()=>{
    const {game,home,donor}=concentratedWorld();
    const original=game.territories[donor].troops;
    updateAI(game,1);
    expect(game.marches.length).toBe(1);
    expect(game.marches[0].owner).toBe('amber');
    expect(game.marches[0].from).toBe(donor);
    expect(game.marches[0].to).toBe(home);
    expect(game.marches[0].route?.length).toBeGreaterThanOrEqual(2);
    expect(game.territories[donor].troops+game.marches[0].troops).toBe(original);
  });
  it('after gathering forces, attacks a previously fortified enemy without free troops',()=>{
    const {game,invaded}=concentratedWorld();
    for(let i=0;i<600;i++){
      tick(game,.1);
      updateAI(game,.1);
      if(game.territories[invaded].owner==='amber')break;
    }
    expect(game.territories[invaded].owner).toBe('amber');
    expect(game.factions.amber.captures).toBeGreaterThan(0);
  });
});
