import './style.css';
import { createGame } from './game/world';
import { updateAI } from './game/ai';
import { loadGame, saveGame, clearGame } from './game/storage';
import { isNeighbour, launchRevolt, mobilizeReserves, sendArmy, sendSupport, tick } from './game/simulation';
import type { GameState } from './game/types';
import { WorldRenderer } from './render/renderer';
import { SoundFx } from './render/sound';
import { HUD } from './ui/hud';

let game:GameState=loadGame()??createGame();
let selected:number|null=game.factions.player.capital;
let supportMode=false;
let renderer:WorldRenderer;
const sound=new SoundFx();
const root=document.querySelector<HTMLElement>('#app');
if(!root)throw new Error('Missing #app root');
const hud=new HUD(root,{
  onSupport:()=>{supportMode=!supportMode;hud.message(supportMode?'Select a friendly destination for your convoy.':'Support order cancelled.');},
  onRevolt:()=>{
    if(launchRevolt(game,'player')){
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
    clearGame();selected=game.factions.player.capital;supportMode=false;renderer.resetView();
    hud.message('A NEW WORLD HAS BEGUN.');
  },
  onSound:()=>{sound.toggle();},
  onZoom:(factor)=>renderer.zoom(factor),
});
renderer=new WorldRenderer(hud.canvas);
const canvas=hud.canvas;
const resize=new ResizeObserver(()=>renderer.resize(true));
resize.observe(canvas);renderer.resize(true);
interface Pointer {id:number;x:number;y:number;startX:number;startY:number;moved:boolean;panning:boolean;from:number|null}
let pointer:Pointer|null=null;
const coordinates=(event:PointerEvent|WheelEvent)=>{
  const b=canvas.getBoundingClientRect();return{x:event.clientX-b.left,y:event.clientY-b.top};
};
canvas.addEventListener('pointerdown',(event)=>{
  if(pointer)return;
  const {x,y}=coordinates(event);
  pointer={id:event.pointerId,x,y,startX:x,startY:y,moved:false,panning:false,from:renderer.pick(game,x,y)};
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove',(event)=>{
  const {x,y}=coordinates(event);renderer.hover=renderer.pick(game,x,y);
  if(!pointer||event.pointerId!==pointer.id)return;
  if(Math.hypot(x-pointer.startX,y-pointer.startY)>9)pointer.moved=true;
  if(pointer.moved && (pointer.from===null || game.territories[pointer.from].owner!=='player' || Math.hypot(x-pointer.startX,y-pointer.startY)>85)) pointer.panning=true;
  if(pointer.panning)renderer.pan(x-pointer.x,y-pointer.y);
  pointer.x=x;pointer.y=y;
});
canvas.addEventListener('pointerup',(event)=>{
  if(!pointer||event.pointerId!==pointer.id)return;
  const {x,y}=coordinates(event),picked=renderer.pick(game,x,y);
  if(!pointer.panning && pointer.moved && pointer.from!==null && game.territories[pointer.from].owner==='player' && picked!==null && picked!==pointer.from && isNeighbour(game,pointer.from,picked)) {
    if(sendArmy(game,pointer.from,picked,event.shiftKey ? .9 : .65)){
      hud.message(game.territories[picked].owner==='player'?'Reinforcements dispatched.':'Attack launched!');
      selected=pointer.from;
    }
  }else if(!pointer.moved&&picked!==null){
    const target=game.territories[picked];
    if(target.owner==='player'){
      if(supportMode && selected!==null && selected!==picked && game.territories[selected].owner==='player'){
        const success=sendSupport(game,selected,picked,.65);
        hud.message(success?'Reinforcement convoy dispatched.':'No connected friendly corridor or enough troops.');
        if(success)supportMode=false;
      }else if(event.shiftKey && selected!==null && picked!==selected && isNeighbour(game,selected,picked) && game.territories[selected].owner==='player'){
        sendArmy(game,selected,picked,.65);
      }else selected=picked;
    }else if(supportMode){
      hud.message('Support convoys can only target connected friendly territory.');
    }else if(selected!==null&&game.territories[selected].owner==='player'&&isNeighbour(game,selected,picked)){
      if(sendArmy(game,selected,picked,event.shiftKey ? .9 : .65))hud.message('Attack launched!');
    }else hud.message('Select a friendly sector, then an adjacent target.');
  }
  pointer=null;
});
canvas.addEventListener('pointercancel',()=>{pointer=null;});
canvas.addEventListener('pointerleave',()=>{renderer.hover=null;});
canvas.addEventListener('wheel',(event)=>{
  event.preventDefault();const{x,y}=coordinates(event);
  renderer.zoom(event.deltaY<0?1.12:1/1.12,x,y);
},{passive:false});
window.addEventListener('keydown',(event)=>{
  if(event.code==='Space'&&event.target===document.body){event.preventDefault();game.paused=!game.paused;}
  if(event.key.toLowerCase()==='r')renderer.resetView();
});
let lastFrame=performance.now(),lastUI=0,lastSave=0;
function frame(now:number):void{
  const dt=Math.min(.08,Math.max(0,(now-lastFrame)/1000));lastFrame=now;
  tick(game,dt);
  if(!game.paused) updateAI(game,dt*game.speed);
  if(game.events.length){
    renderer.onEvents(game.events,game);sound.playEvents(game.events);
    if(game.events.some(e=>e.owner==='player'&&e.type==='capture'))hud.message('SECTOR CAPTURED. KEEP ADVANCING.');
    else if(game.events.some(e=>e.type==='revolt'))hud.message('A NATION HAS RISEN AGAIN.');
  }
  renderer.render(game,selected,dt,supportMode);
  if(now-lastUI>170){hud.render(game,selected,supportMode);lastUI=now;}
  if(now-lastSave>10000){saveGame(game);lastSave=now;}
  requestAnimationFrame(frame);
}
window.addEventListener('pagehide',()=>saveGame(game));
requestAnimationFrame(frame);
