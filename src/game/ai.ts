import { RESERVE_CAP, TERRAINS } from './config';
import { friendlyRoute, launchRevolt, mobilizeReserves, sendArmy, sendSupport } from './simulation';
import { uprisingForecast } from './tactics';
import type { FactionId, GameState, Territory } from './types';

const AI_IDS: FactionId[] = ['amber', 'coral', 'violet', 'moss'];

/**
 * AI has no free soldiers and uses the exact same legal orders as a human.
 * It can consolidate troops behind a frontline and wait for viable attacks.
 */
export function updateAI(state: GameState, dt: number): void {
  for (const id of AI_IDS) {
    const faction=state.factions[id];
    faction.aiDelay-=dt;
    if(faction.aiDelay>0)continue;
    faction.aiDelay=0.75 + ((faction.capital*17+Math.floor(state.time*7))%8)*.11;

    const home=state.territories[faction.capital];
    if(home.owner!==id && faction.revoltCooldown<=0){
      const forecast=uprisingForecast(state,id,.9);
      // Favour a viable uprising, but a huge reserve can still commit an
      // attritional attempt instead of sitting permanently at full capacity.
      if((forecast.outcome==='win'||faction.reserves>=RESERVE_CAP*.88)
         && launchRevolt(state,id,.9))continue;
    }

    const owned=state.territories.filter(t=>t.owner===id);
    if(!owned.length)continue;
    const front=owned.filter(t=>t.neighbours.some(n=>state.territories[n].owner!==id));
    if(!front.length)continue;

    // Only spend the cultural reserve away from home when the homeland is secure.
    if(home.owner===id && faction.reserves>=90) {
      const destination=front.slice().sort((a,b)=>b.troops-a.troops)[0];
      if(destination && mobilizeReserves(state,id,destination.id))continue;
    }

    // 1. Exploit an actually beatable neighbouring province.
    const attacks=front.flatMap(source=>source.neighbours.map(n=>state.territories[n])
      .filter(target=>target.owner!==id)
      .map(target=>({source,target,margin:source.troops*.72-
        target.troops*TERRAINS[target.terrain].defense,
        score:(target.owner===null?45:0)+(target.capitalOf?25:0)-
          target.troops*TERRAINS[target.terrain].defense*.1}))
    );
    const viable=attacks.filter(a=>a.margin>4 && a.source.troops>=17)
      .sort((a,b)=>b.score-a.score || b.margin-a.margin)[0];
    if(viable && sendArmy(state,viable.source.id,viable.target.id,.72))continue;

    // 2. Consolidate a field army rather than repeatedly feeding isolated attacks
    // into a stronghold. Units are transported, never spawned or teleported.
    const objective=attacks.filter(a=>a.target.troops>0)
      .sort((a,b)=>{
        const av=a.target.troops*TERRAINS[a.target.terrain].defense - a.source.troops*.72;
        const bv=b.target.troops*TERRAINS[b.target.terrain].defense - b.source.troops*.72;
        return av-bv || a.target.id-b.target.id;
      })[0];
    if(!objective)continue;
    const arrival=objective.source;
    const donors=owned.filter(t=>t.id!==arrival.id && t.troops>65 &&
      friendlyRoute(state,t.id,arrival.id)!==null)
      .map(t=>({territory:t,retained:t.neighbours.some(n=>state.territories[n].owner!==id)?60:25}))
      .filter(t=>t.territory.troops*.35>t.retained)
      .sort((a,b)=>b.territory.troops-a.territory.troops);
    const donor=donors[0]?.territory;
    if(donor && sendSupport(state,donor.id,arrival.id,.65))continue;

    // 3. In the absence of attack or logistics, hold and recruit naturally.
    // Waiting is preferable to guaranteed-suicide assaults by every AI tick.
  }
}
