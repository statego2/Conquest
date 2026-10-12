import { FACTIONS, TERRAINS } from '../game/config';
import { formatClock, leaderboard } from '../game/metrics';
import { canRevolt, ownedTerritories, totalTroops } from '../game/simulation';
import type { GameState } from '../game/types';
import type { ViewMode, ViewPreference } from '../game/view';
import { battleForecast, uprisingForecast, type Commitment } from '../game/tactics';

export interface HudActions {
  onRevolt():void; onMobilize():void; onSupport():void; onView(mode:ViewPreference):void; onCommitment():void; onPause():void; onSpeed():void;
  onResetView():void; onNewGame():void; onSound():void; onZoom(factor:number):void;
}
export class HUD {
  private readonly land:HTMLElement;
  private readonly army:HTMLElement;
  private readonly reserves:HTMLElement;
  private readonly clock:HTMLElement;
  private readonly status:HTMLElement;
  private readonly info:HTMLElement;
  private readonly ranks:HTMLElement;
  private readonly revolt:HTMLButtonElement;
  private readonly support:HTMLButtonElement;
  private readonly commitmentButton:HTMLButtonElement;
  private readonly mobilize:HTMLButtonElement;
  private readonly pause:HTMLButtonElement;
  private readonly speed:HTMLButtonElement;
  private readonly sound:HTMLButtonElement;
  private readonly toast:HTMLElement;
  private readonly viewLabel:HTMLElement;
  private readonly deck:HTMLElement;
  private readonly viewButtons:HTMLButtonElement[];
  private toastTimeout=0;

  constructor(root:HTMLElement,actions:HudActions){
    root.innerHTML="<div class=\"app-frame\">\n <header class=\"status-rail\">\n  <div class=\"identity\"><div class=\"identity-mark\">C<span>╱</span></div><div class=\"identity-name\"><strong>CONQUEST</strong><small>DARK STRATEGIST</small></div></div>\n  <div class=\"overview\">\n    <div class=\"overview-cell\"><span>TERRITORY</span><strong id=\"land\">0</strong></div>\n    <div class=\"overview-cell\"><span>ARMY</span><strong id=\"army\">0</strong></div>\n    <div class=\"overview-cell\"><span>RESERVES</span><strong id=\"reserves\">0</strong></div>\n    <div class=\"overview-cell overview-clock\"><span>WAR TIME</span><strong id=\"clock\">00:00</strong></div>\n  </div>\n  <div class=\"rail-actions\"><button id=\"pause\" title=\"Pause simulation\">PAUSE</button><button id=\"speed\" title=\"Simulation speed\">1×</button><button id=\"sound\" title=\"Toggle audio\">SOUND OFF</button></div>\n </header>\n <main class=\"war-stage\">\n  <div class=\"map-shell\"><canvas id=\"world\" aria-label=\"Interactive conquest map. Select your territory, then tap an adjacent province to attack.\"></canvas></div>\n  <div class=\"stage-head\"><span class=\"live-dot\"></span><span class=\"theatre-title\">LIVE THEATRE / OPERATION ATLAS</span><span class=\"stage-status\" id=\"status\">ESTABLISHING LINK</span></div>\n  <div class=\"view-switch\" aria-label=\"Strategic viewing scale\">\n    <button id=\"view-auto\" data-view=\"auto\" title=\"Automatically zoom out as your empire grows\">AUTO</button>\n    <button id=\"view-tactical\" data-view=\"tactical\" title=\"Micro tactical battlefield\">MICRO</button>\n    <button id=\"view-operational\" data-view=\"operational\" title=\"Regional operational front\">REGIONS</button>\n    <button id=\"view-strategic\" data-view=\"strategic\" title=\"Whole-world strategic overview\">WORLD</button>\n  </div>\n  <div class=\"view-readout\" id=\"view-label\">TACTICAL COMMAND</div>\n  <div class=\"map-tools\"><button id=\"zoom-in\" aria-label=\"Zoom in\">+</button><button id=\"zoom-out\" aria-label=\"Zoom out\">−</button><button id=\"reset-view\" aria-label=\"Reset camera\">◎</button></div>\n  <div class=\"rankings\"><div class=\"rankings-title\">THE POWER BALANCE <span>LIVE · LOCAL</span></div><div id=\"ranks\"></div></div>\n  <div class=\"map-hint\">TAP A CYAN TERRITORY → TAP A NEIGHBOUR TO ATTACK <span> · DRAG EMPTY LAND TO SCROLL</span></div>\n  <div class=\"command-deck\" id=\"command-deck\">\n    <div class=\"selected-module\"><span class=\"module-eyebrow\">FIELD COMMAND</span><div id=\"selected-info\">Choose a territory to command your forces.</div></div>\n    <div class=\"command-actions\"><button id=\"commitment\" class=\"commitment-action\" title=\"Change the percent of troops committed to the next order\">SEND 65%</button><button id=\"support\" class=\"support-action\">SEND SUPPORT</button><button id=\"mobilize\" class=\"deploy-action\">+ DEPLOY RESERVES</button><button id=\"revolt\" class=\"revolt-action\">RAISE UPRISING</button></div>\n    <button id=\"new-game\" class=\"new-game\" title=\"Restart with a new world\">↻ NEW WORLD</button>\n  </div>\n </main>\n <div class=\"toast\" id=\"toast\" role=\"status\" aria-live=\"polite\"></div>\n</div>";
    const el=(id:string)=>{const x=root.querySelector<HTMLElement>(`#${id}`);if(!x)throw new Error(`Missing HUD element ${id}`);return x;};
    this.land=el('land');this.army=el('army');this.reserves=el('reserves');
    this.clock=el('clock');this.status=el('status');this.info=el('selected-info');
    this.ranks=el('ranks');this.toast=el('toast');
    this.viewLabel=el('view-label');
    this.deck=el('command-deck');
    this.viewButtons=(['auto','tactical','operational','strategic'] as ViewPreference[])
      .map(mode=>el('view-'+mode) as HTMLButtonElement);
    this.viewButtons.forEach((button,i)=>{
      const modes:ViewPreference[]=['auto','tactical','operational','strategic'];
      button.onclick=()=>actions.onView(modes[i]);
    });
    this.revolt=el('revolt') as HTMLButtonElement;
    this.support=el('support') as HTMLButtonElement;
    this.commitmentButton=el('commitment') as HTMLButtonElement;
    this.commitmentButton.onclick=actions.onCommitment;
    this.mobilize=el('mobilize') as HTMLButtonElement;
    this.pause=el('pause') as HTMLButtonElement;
    this.speed=el('speed') as HTMLButtonElement;
    this.sound=el('sound') as HTMLButtonElement;
    this.revolt.onclick=actions.onRevolt;this.mobilize.onclick=actions.onMobilize;
    this.support.onclick=actions.onSupport;
    this.pause.onclick=actions.onPause;this.speed.onclick=actions.onSpeed;
    this.sound.onclick=()=>{actions.onSound();this.sound.textContent=this.sound.textContent==='SOUND OFF'?'SOUND ON':'SOUND OFF';};
    el('reset-view').onclick=actions.onResetView;el('new-game').onclick=actions.onNewGame;
    el('zoom-in').onclick=()=>actions.onZoom(1.3);el('zoom-out').onclick=()=>actions.onZoom(1/1.3);
  }
  get canvas():HTMLCanvasElement{return document.querySelector<HTMLCanvasElement>('#world')!;}
  message(text:string):void{
    this.toast.textContent=text;this.toast.classList.add('show');
    this.toastTimeout=performance.now()+2400;
  }
  render(state:GameState,selected:number|null,supportMode=false,preference:ViewPreference='auto',actual:ViewMode='tactical',commitment:Commitment=0.65,hover:number|null=null):void{
    const myLand=ownedTerritories(state,'player');
    this.commitmentButton.textContent='SEND '+Math.round(commitment*100)+'%';
    this.viewLabel.textContent=actual==='tactical'?'TACTICAL / MICRO BATTLE'
      :actual==='operational'?'OPERATIONAL / REGIONAL FRONT':'WORLD COMMAND / TAP A REGION TO ZOOM IN';
    this.deck.classList.toggle('is-strategic',actual==='strategic');
    this.viewButtons.forEach(button=>{
      button.classList.toggle('active',button.dataset.view===preference);
      button.setAttribute('aria-pressed',String(button.dataset.view===preference));
    });
    this.land.textContent=`${myLand.length}/${state.territories.length}`;
    this.army.textContent=totalTroops(state,'player').toLocaleString();
    this.reserves.textContent=String(Math.floor(state.factions.player.reserves));
    this.clock.textContent=formatClock(state.time);
    const occupied=state.territories[state.factions.player.capital].owner!=='player';
    this.status.textContent=myLand.length===state.territories.length?'GLOBAL DOMINION / WORLD CONTINUES':occupied?'HOMELAND OCCUPIED / RESISTANCE ACTIVE':'HOMELAND SECURE / EXPAND WEST TO EAST';
    this.status.classList.toggle('danger',occupied);
    this.pause.textContent=state.paused?'RESUME':'PAUSE';this.speed.textContent=`${state.speed}×`;
    this.support.disabled=selected===null||state.territories[selected].owner!=='player'||state.territories[selected].troops<3;
    this.support.textContent=supportMode?'CANCEL SUPPORT':'SEND SUPPORT';
    this.support.classList.toggle('active',supportMode);
    this.revolt.disabled=!canRevolt(state,'player');
    this.revolt.textContent=occupied?('UPRISING · '+uprisingForecast(state,'player',commitment).attacking+' TROOPS'):'HOMELAND SECURE';
    this.mobilize.disabled=selected===null||state.territories[selected].owner!=='player'||state.factions.player.reserves<15;
    if(selected!==null){
      const t=state.territories[selected],def=TERRAINS[t.terrain];
      const owner=t.owner?FACTIONS[t.owner].name:'INDEPENDENT';
      let forecast='';
      if(t.owner==='player'){
        const target=hover!==null && t.neighbours.includes(hover)&&state.territories[hover].owner!=='player'
          ? state.territories[hover]
          :t.neighbours.map(id=>state.territories[id]).filter(x=>x.owner!=='player')
            .sort((a,b)=>a.troops*TERRAINS[a.terrain].defense-b.troops*TERRAINS[b.terrain].defense)[0];
        if(target){
          const result=battleForecast(state,t.id,target.id,commitment);
          forecast='<div class="forecast '+result.outcome+'">SECTOR '+String(target.id+1).padStart(3,'0')+
            ' · '+(result.outcome==='win'?'ADVANTAGE / '+result.surviving+' SURVIVE':
            result.outcome==='lose'?'DEFICIT / NEED '+result.disadvantage+' MORE':
            'BUILD FORCES')+'</div>';
        }
      }
      this.info.innerHTML=`<div class="sector-heading"><strong>SECTOR ${String(t.id+1).padStart(3,'0')}</strong><span>${t.capitalOf?'⚑ CAPITAL':def.name.toUpperCase()}</span></div>
        <div class="sector-owner">${owner}</div><div class="sector-stats"><span>GARRISON <b>${Math.floor(t.troops)}</b></span><span>DEFENSE <b>${def.defense.toFixed(2)}×</b></span></div>`+forecast;
    }else this.info.innerHTML='<p class="muted">Select a cyan territory, then tap its neighbour.</p>';
    this.ranks.innerHTML=leaderboard(state).map((rank,i)=>`<div class="rank-row ${rank.id==='player'?'me':''}">
      <span class="rank-n">0${i+1}</span><span class="rank-swatch" style="background:${FACTIONS[rank.id].color}"></span>
      <span class="rank-name">${rank.name}</span><strong>${rank.territories}</strong></div>`).join('');
    if(performance.now()>this.toastTimeout)this.toast.classList.remove('show');
  }
}
