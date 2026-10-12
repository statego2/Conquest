import { describe,expect,it } from 'vitest';
import { createGame } from '../src/game/world';
import { battleForecast, committedTroops,nextCommitment,uprisingCommitment,uprisingForecast } from '../src/game/tactics';
import { launchRevolt,sendArmy,tick } from '../src/game/simulation';

describe('Visible force commitments and combat forecast',()=>{
  it('cycles three orders with no hidden send amount',()=>{
    expect(nextCommitment(0.35)).toBe(0.65);
    expect(nextCommitment(0.65)).toBe(0.9);
    expect(nextCommitment(0.9)).toBe(0.35);
    expect(committedTroops(100,.9)).toBe(90);
    expect(committedTroops(2,.9)).toBe(1);
    expect(committedTroops(0,.9)).toBe(0);
  });
  it('predicts a capture and its exact surviving soldiers',()=>{
    const game=createGame(),source=game.factions.player.capital;
    const to=game.territories[source].neighbours.find(id=>game.territories[id].owner!== 'player')!;
    game.territories[to].troops=5;
    const forecast=battleForecast(game,source,to,.65);
    expect(forecast.outcome).toBe('win');
    expect(sendArmy(game,source,to,.65)).toBe(true);
    game.paused=false;
    for(let n=0;n<12;n++)tick(game,.1);
    expect(game.territories[to].owner).toBe('player');
  });
  it('distinguishes failed assaults from allied reinforcement',()=>{
    const game=createGame(),from=game.factions.player.capital;
    const enemy=game.territories[from].neighbours.find(id=>game.territories[id].owner===null)!;
    game.territories[enemy].troops=150;
    expect(battleForecast(game,from,enemy,.65).outcome).toBe('lose');
    const ally=game.territories[from].neighbours.find(id=>game.territories[id].owner==='player')!;
    expect(battleForecast(game,from,ally,.35).outcome).toBe('hold');
  });
  it('lets an uprising commit less than all reserves and forecasts the outcome',()=>{
    const game=createGame();
    const home=game.factions.player.capital;
    game.territories[home].owner='amber';game.territories[home].troops=10;
    game.factions.player.reserves=100;
    expect(uprisingCommitment(100,.35)).toBe(45);
    expect(uprisingForecast(game,'player',.35).outcome).toBe('win');
    expect(launchRevolt(game,'player',.35)).toBe(true);
    expect(game.factions.player.reserves).toBe(55);
    expect(game.territories[home].owner).toBe('player');
  });
  it('rejects revolt before reserve threshold',()=>{
    const game=createGame(),home=game.factions.player.capital;
    game.territories[home].owner='amber';
    game.factions.player.reserves=20;
    expect(uprisingForecast(game,'player',.9).outcome).toBe('invalid');
    expect(launchRevolt(game,'player',.9)).toBe(false);
  });
});
