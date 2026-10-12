import './style.css';
import { createGame } from './game/world';
import { updateAI } from './game/ai';
import { loadGame, saveGame, clearGame } from './game/storage';
import { isNeighbour, launchRevolt, mobilizeReserves, sendArmy, sendSupport, tick } from './game/simulation';
import type { GameState } from './game/types';
import { WorldRenderer } from './render/renderer';
import { resolveView, type ViewPreference } from './game/view';
import { nextCommitment, type Commitment } from './game/tactics';
import { SoundFx } from './render/sound';
import { HUD } from './ui/hud';

let game:GameState=loadGame()??createGame();
let selected:number|null=game.factions.player.capital;
let supportMode=false;
let commitment:Commitment=0.65;
let viewPreference:ViewPreference='auto';
let activeView=resolveView(viewPreference,game.territories.filter(t=>t.owner==='player').length);
const syncView=(focus:number|null=null)=>{
  const next=resolveView(viewPreference,game.territories.filter(t=>t.owner==='player').length);
  if(next!==activeView || focus!==null) {activeView=next;renderer.setView(next,game,focus);}
};
let renderer:WorldRenderer;
const sound=new SoundFx();
const root=document.querySelector<HTMLElement>('#app');
if(!root)throw new Error('Missing #app root');
const hud=new HUD(root,{
  onCommitment:()=>{commitment=nextCommitment(commitment);hud.message('Force commitment: '+Math.round(commitment*100)+'%.');},
  onView:(mode)=>{viewPreference=mode;activeView=resolveView(mode,game.territories.filter(t=>t.owner==='player').length);renderer.setView(activeView,game,selected);},
  onSupport:()=>{supportMode=!supportMode;hud.message(supportMode?'Select a friendly destination for your convoy.':'Support order cancelled.');},
  onRevolt:()=>{
    if(launchRevolt(game,'player',commitment)){
      renderer.onEvents(game.events,game);sound.playEvents(game.events);
      selected=game.factions.player.capital;hud.message('YOUR HOMELAND RISES AGAIN!');
    }else hud.message('Not enough resistance troops yet.');
  },
  onMobilize:()=>{
    if(selected!==null&&mobilizeReserves(game,'player',selected)){
      renderer.onEvents(game.events,game);hud.message('Reserves deployed to selected sector.');
    }
  },
  onPause:()=>{game.paused=!game.paused;},
  onSpeed:()=>{game.speed=game.speed===1?2:1;},
  onResetView:()=>renderer.resetView(),
  onNewGame:()=>{
    game=createGame(Math.floor(Math.random()*1_000_000_000));
    clearGame();selected=game.factions.player.capital;supportMode=false;
    activeView=resolveView(viewPreference,game.territories.filter(t=>t.owner==='player').length);
    renderer.setView(activeView,game,selected);
    hud.message('A NEW WORLD HAS BEGUN.');
  },
  onSound:()=>{sound.toggle();},
  onZoom:(factor)=>renderer.zoom(factor),
});
renderer=new WorldRenderer(hud.canvas);
const canvas=hud.canvas;
const resize=new ResizeObserver(()=>renderer.resize(true));
resize.observe(canvas);renderer.resize(true);
renderer.setView(activeView,game,selected);
interface Pointer {id:number;x:number;y:number;startX:number;startY:number;moved:boolean;panning:boolean;from:number|null}
let pointer:Pointer|null=null;
const activePointers=new Map<number,{x:number;y:number}>();
let pinching=false;
let lastPinchDistance=0, lastPinchCenter={x:0,y:0};
const resetPointer=()=>{pointer=null;};
const coordinates=(event:PointerEvent|WheelEvent)=>{
  const b=canvas.getBoundingClientRect();return{x:event.clientX-b.left,y:event.clientY-b.top};
};
canvas.addEventListener('pointerdown',(event)=>{
  const {x,y}=coordinates(event);
  activePointers.set(event.pointerId,{x,y});
  canvas.setPointerCapture(event.pointerId);
  if(activePointers.size>=2){
    pinching=true;pointer=null;
    const [a,b]=[...activePointers.values()];
    lastPinchDistance=Math.hypot(a.x-b.x,a.y-b.y);
    lastPinchCenter={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    return;
  }
  if(pointer)return;
  pointer={id:event.pointerId,x,y,startX:x,startY:y,moved:false,panning:false,from:renderer.pick(game,x,y)};
});
canvas.addEventListener('pointermove',(event)=>{
  const {x,y}=coordinates(event);
  if(activePointers.has(event.pointerId))activePointers.set(event.pointerId,{x,y});
  if(pinching && activePointers.size>=2){
    const [a,b]=[...activePointers.values()];
    const distance=Math.hypot(a.x-b.x,a.y-b.y);
    const center={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    renderer.pan(center.x-lastPinchCenter.x,center.y-lastPinchCenter.y);
    if(lastPinchDistance>0 && distance>0)renderer.zoom(distance/lastPinchDistance,center.x,center.y);
    lastPinchDistance=distance;lastPinchCenter=center;
    return;
  }
  renderer.hover=renderer.pick(game,x,y);
  if(!pointer||event.pointerId!==pointer.id)return;
  if(Math.hypot(x-pointer.startX,y-pointer.startY)>9)pointer.moved=true;
  if(pointer.moved && (pointer.from===null || game.territories[pointer.from].owner!=='player' || Math.hypot(x-pointer.startX,y-pointer.startY)>85)) pointer.panning=true;
  if(pointer.panning)renderer.pan(x-pointer.x,y-pointer.y);
  pointer.x=x;pointer.y=y;
});
canvas.addEventListener('pointerup',(event)=>{
  activePointers.delete(event.pointerId);
  if(pinching){
    if(activePointers.size===0)pinching=false;
    pointer=null;return;
  }
  if(!pointer||event.pointerId!==pointer.id)return;
  const {x,y}=coordinates(event),picked=renderer.pick(game,x,y);
  if(!pointer.panning && pointer.moved && pointer.from!==null && game.territories[pointer.from].owner==='player' && picked!==null && picked!==pointer.from && isNeighbour(game,pointer.from,picked)) {
    if(sendArmy(game,pointer.from,picked,event.shiftKey ? .9 : commitment)){
      hud.message(game.territories[picked].owner==='player'?'Reinforcements dispatched.':'Attack launched!');
      selected=pointer.from;
    }
  }else if(!pointer.moved&&picked!==null){
    const target=game.territories[picked];
    if(target.owner==='player'){
      if(supportMode && selected!==null && selected!==picked && game.territories[selected].owner==='player'){
        const success=sendSupport(game,selected,picked,commitment);
        hud.message(success?'Reinforcement convoy dispatched.':'No connected friendly corridor or enough troops.');
        if(success)supportMode=false;
      }else if(event.shiftKey && selected!==null && picked!==selected && isNeighbour(game,selected,picked) && game.territories[selected].owner==='player'){
        sendArmy(game,selected,picked,commitment);
      }else selected=picked;
    }else if(supportMode){
      hud.message('Support convoys can only target connected friendly territory.');
    }else if(selected!==null&&game.territories[selected].owner==='player'&&isNeighbour(game,selected,picked)){
      if(sendArmy(game,selected,picked,event.shiftKey ? .9 : commitment))hud.message('Attack launched!');
    }else hud.message('Select a friendly sector, then an adjacent target.');
  }
  resetPointer();
});
canvas.addEventListener('pointercancel',(event)=>{
  activePointers.delete(event.pointerId);
  if(!activePointers.size)pinching=false;
  resetPointer();
});
canvas.addEventListener('pointerleave',()=>{renderer.hover=null;});
canvas.addEventListener('wheel',(event)=>{
  event.preventDefault();const{x,y}=coordinates(event);
  renderer.zoom(event.deltaY<0?1.12:1/1.12,x,y);
},{passive:false});
window.addEventListener('keydown',(event)=>{
  if(event.code==='Space'&&event.target===document.body){event.preventDefault();game.paused=!game.paused;}
  if(event.key.toLowerCase()==='r')renderer.setView(activeView,game,selected);
  if(event.key==='1'||event.key==='2'||event.key==='3'){
    const modes:ViewPreference[]=['tactical','operational','strategic'];
    viewPreference=modes[Number(event.key)-1];activeView=resolveView(viewPreference,0);
    renderer.setView(activeView,game,selected);
  }
});
let lastFrame=performance.now(),lastUI=0,lastSave=0;
let hadGlobalDominion=game.territories.every(t=>t.owner==='player');
function frame(now:number):void{
  const dt=Math.min(.08,Math.max(0,(now-lastFrame)/1000));lastFrame=now;
  tick(game,dt);
  if(!game.paused) updateAI(game,dt*game.speed);
  if(game.events.length){
    renderer.onEvents(game.events,game);sound.playEvents(game.events);
    if(game.events.some(e=>e.owner==='player'&&e.type==='capture'))hud.message('SECTOR CAPTURED. KEEP ADVANCING.');
    else if(game.events.some(e=>e.type==='revolt'))hud.message('A NATION HAS RISEN AGAIN.');
  }
  const dominant=game.territories.every(t=>t.owner==='player');
  if(dominant && !hadGlobalDominion)hud.message('WORLD DOMINION. THE WAR NEVER ENDS.');
  hadGlobalDominion=dominant;
  syncView();
  renderer.render(game,selected,dt,supportMode);
  if(now-lastUI>170){hud.render(game,selected,supportMode,viewPreference,activeView,commitment,renderer.hover);lastUI=now;}
  if(now-lastSave>10000){saveGame(game);lastSave=now;}
  requestAnimationFrame(frame);
}
window.addEventListener('pagehide',()=>saveGame(game));
requestAnimationFrame(frame);
