import { FACTIONS, HEX_RADIUS, MAP_COLS, WORLD_HEIGHT, WORLD_WIDTH } from '../game/config';
import type { GameEvent, GameState, Territory } from '../game/types';
import { scaleForView, type ViewMode } from '../game/view';
import { isLandCell } from '../game/world';

interface Burst { x: number; y: number; life: number; color: string; text: string }
export function hexCenter(t: Territory): { x: number; y: number } {
  return { x: 45 + Math.sqrt(3) * HEX_RADIUS * (t.col + (t.row % 2) * 0.5) + Math.sqrt(3) * HEX_RADIUS / 2,
    y: 44 + HEX_RADIUS + t.row * HEX_RADIUS * 1.5 };
}

interface Point { x: number; y: number }
const outlines = new Map<number,Point[]>();
function distortion(x:number,y:number,axis:number):number{
  const a=Math.round(x*100), b=Math.round(y*100);
  const wave=Math.sin(a*12.9898+b*78.233+axis*14.13)*43758.5453;
  return (wave-Math.floor(wave))*2-1;
}
// Every polygon shares exactly the same corners and edge midpoints with its
// neighbours, but the repeated honeycomb silhouette is visually broken.
export function provinceOutline(t:Territory):Point[]{
  const cached=outlines.get(t.id);if(cached)return cached;
  const p=hexCenter(t);
  const corners=Array.from({length:6},(_,i)=>{
    const angle=(Math.PI/180)*(i*60-90);
    const x=p.x+HEX_RADIUS*Math.cos(angle),y=p.y+HEX_RADIUS*Math.sin(angle);
    return {x:x+distortion(x,y,1)*5.3,y:y+distortion(x,y,2)*5.3};
  });
  const pts:Point[]=[];
  for(let i=0;i<6;i++){
    const a=corners[i],b=corners[(i+1)%6];
    const x=(a.x+b.x)/2,y=(a.y+b.y)/2;
    pts.push(a,{x:x+distortion(x,y,3)*2.3,y:y+distortion(x,y,4)*2.3});
  }
  outlines.set(t.id,pts);
  return pts;
}
function tracePolygon(ctx:CanvasRenderingContext2D,pts:Point[]):void{
  ctx.beginPath();pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));ctx.closePath();
}
function pointInPolygon(pts:Point[],x:number,y:number):boolean{
  let inside=false;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++){
    const a=pts[i],b=pts[j];
    if(((a.y>y)!==(b.y>y)) && x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;
  }
  return inside;
}

export class WorldRenderer {
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private width = 1;
  private height = 1;
  private offsetX = 0;
  private offsetY = 0;
  private scale = 1;
  private bursts: Burst[] = [];
  public hover: number | null = null;
  private armyMarkers:{x:number;y:number;id:number}[]=[];
  public viewMode: ViewMode = 'tactical';
  private viewFocus: {x:number;y:number}={x:265,y:230};
  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas2D is unsupported.');
    this.ctx = ctx;
    this.resize(true);
  }
  resize(fit = false): void {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width); this.height = Math.max(1, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    if (fit) this.resetView();
  }
  /**
   * Zoom is a choice about information, not a new simulation.
   * Preserve geographic coordinates across the three command scales.
   */
  setView(mode: ViewMode, state: GameState, focus: number | null = null): void {
    this.viewMode=mode;
    if (mode === 'strategic') {
      this.viewFocus={x: WORLD_WIDTH/2,y: WORLD_HEIGHT/2};
    } else {
      const owned=state.territories.filter(t=>t.owner==='player');
      const point=focus!==null && state.territories[focus] ? hexCenter(state.territories[focus])
        : owned.length ? hexCenter(owned[Math.floor(owned.length/2)])
        : hexCenter(state.territories[state.factions.player.capital]);
      this.viewFocus=point;
    }
    this.resetView();
  }
  resetView(): void {
    this.scale=scaleForView(this.viewMode,this.width,this.height);
    this.offsetX=this.width/2-this.viewFocus.x*this.scale;
    this.offsetY=this.height/2-this.viewFocus.y*this.scale;
    this.constrainCamera();
  }
  zoom(factor: number, screenX = this.width / 2, screenY = this.height / 2): void {
    const next = Math.min(3.4, Math.max(0.18, this.scale * factor));
    this.offsetX = screenX - ((screenX - this.offsetX) / this.scale) * next;
    this.offsetY = screenY - ((screenY - this.offsetY) / this.scale) * next;
    this.scale = next;
    this.constrainCamera();
  }
  pan(dx: number, dy: number): void { this.offsetX += dx; this.offsetY += dy; this.constrainCamera(); }
  private constrainCamera(): void {
    const margin = 40;
    if (WORLD_WIDTH * this.scale <= this.width) this.offsetX = (this.width - WORLD_WIDTH * this.scale) / 2;
    else this.offsetX = Math.max(this.width - WORLD_WIDTH * this.scale - margin, Math.min(margin, this.offsetX));
    const visibleHeight=this.viewMode==='strategic'?Math.max(160,this.height-66):this.height;
    if (WORLD_HEIGHT * this.scale <= visibleHeight) this.offsetY = (visibleHeight - WORLD_HEIGHT * this.scale) / 2;
    else this.offsetY = Math.max(visibleHeight - WORLD_HEIGHT * this.scale - margin, Math.min(margin, this.offsetY));
  }
  pick(state: GameState, screenX: number, screenY: number): number | null {
    if(this.viewMode==='strategic') {
      const marker=this.armyMarkers.find(m=>Math.hypot(m.x-screenX,m.y-screenY)<18);
      if(marker)return marker.id;
    }
    const x = (screenX - this.offsetX) / this.scale;
    const y = (screenY - this.offsetY) / this.scale;
    for (const t of state.territories) {
      if (t.terrain!=='sea'&&pointInPolygon(provinceOutline(t),x,y))return t.id;
    }
    // Tiny strategic cells are difficult to hit on a phone; allow a small
    // screen-space hit radius without turning distant sea into clickable land.
    if(this.viewMode==='strategic') {
      let id:null|number=null,near=22;
      for(const t of state.territories){
        if(t.terrain==='sea')continue;
        const p=hexCenter(t);
        const distance=Math.hypot(p.x*this.scale+this.offsetX-screenX,p.y*this.scale+this.offsetY-screenY);
        if(distance<near){near=distance;id=t.id;}
      }
      return id;
    }
    return null;
  }
  onEvents(events: GameEvent[], state: GameState): void {
    for (const e of events) {
      const c = hexCenter(state.territories[e.territory]);
      this.bursts.push({ x:c.x, y:c.y, life:e.type==='defense'?.65:1.15,
        color:e.type==='defense'?'#e58578':FACTIONS[e.owner].color,
        text:e.type==='defense'?'REPELLED':e.type === 'revolt' ? 'UPRISING' : e.type === 'mobilize' ? 'REINFORCED' : 'CONQUERED' });
    }
    if (this.bursts.length > 24) this.bursts.splice(0,this.bursts.length-24);
  }
  render(state: GameState, selected: number | null, dt: number, supportMode = false): void {
    const c = this.ctx;
    c.setTransform(this.dpr,0,0,this.dpr,0,0);
    c.clearRect(0,0,this.width,this.height);
    this.drawBackdrop(c);
    c.setTransform(this.dpr*this.scale,0,0,this.dpr*this.scale,this.offsetX*this.dpr,this.offsetY*this.dpr);
    c.strokeStyle = 'rgba(140,156,154,0.017)'; c.lineWidth=.6;
    for(let x=0;x<WORLD_WIDTH;x+=84){c.beginPath();c.moveTo(x,0);c.lineTo(x,WORLD_HEIGHT);c.stroke();}
    for(let y=0;y<WORLD_HEIGHT;y+=84){c.beginPath();c.moveTo(0,y);c.lineTo(WORLD_WIDTH,y);c.stroke();}
    const targets = selected === null ? [] : [...state.territories[selected].neighbours];
    const macro=this.viewMode==='strategic';
    const operational=this.viewMode==='operational';
    // Mark every reachable allied province when a reinforcement order is being issued.
    if (supportMode && selected !== null && state.territories[selected].owner === 'player') {
      const visited = new Set<number>([selected]);
      const queue = [selected];
      for (let i = 0; i < queue.length; i++) {
        for (const id of state.territories[queue[i]].neighbours) {
          if (visited.has(id) || state.territories[id].owner !== 'player') continue;
          visited.add(id); queue.push(id);
        }
      }
      targets.splice(0,targets.length,...queue.slice(1));
    }
    for(const t of state.territories){
      if(t.terrain==='sea')continue;
      const p=hexCenter(t),sx=p.x*this.scale+this.offsetX,sy=p.y*this.scale+this.offsetY;
      const margin=HEX_RADIUS*this.scale+28;
      if(sx< -margin || sx>this.width+margin || sy< -margin || sy>this.height+margin)continue;
      const frontier=t.neighbours.some(n=>state.territories[n].owner!==t.owner);
      this.drawHex(t,t.id===selected,t.id===this.hover,targets.includes(t.id),frontier,state.time,macro,operational);
    }
    this.drawCoastalOutline(state);
    // Macro focus: continuous geopolitical borders and frontier concentrations.
    if (macro || operational) this.drawPoliticalBorders(state,macro);
    if (macro) this.drawStrategicLabels(state);
    if (macro) this.drawWorldArmyMarkers(state, selected);
    for(const m of state.marches){
      const route = m.route?.length && m.route[0]===m.from && m.route[m.route.length-1]===m.to
        ? m.route : [m.from,m.to];
      const positions=route.map(id=>hexCenter(state.territories[id]));
      const pct=Math.min(1,m.elapsed/m.duration), color=FACTIONS[m.owner].color;
      c.strokeStyle=color+'77';c.lineWidth=2.2;c.setLineDash([5,6]);c.lineDashOffset=-state.time*15;
      c.beginPath();positions.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));
      c.stroke();c.setLineDash([]);
      const stage=Math.min((positions.length-1)-0.00001,pct*(positions.length-1));
      const segment=Math.floor(stage), local=stage-segment;
      const a=positions[segment],b=positions[segment+1];
      const x=a.x+(b.x-a.x)*local,y=a.y+(b.y-a.y)*local;
      c.beginPath();c.fillStyle=color;c.shadowColor=color;c.shadowBlur=14;c.arc(x,y,7,0,Math.PI*2);c.fill();c.shadowBlur=0;
      c.fillStyle='#ecfcf8';c.font='bold 10px system-ui';c.textAlign='center';c.textBaseline='middle';
      c.fillText(String(m.troops),x,y-14);
    }
    for(let i=this.bursts.length-1;i>=0;i--){
      const b=this.bursts[i];b.life-=dt;
      if(b.life<=0){this.bursts.splice(i,1);continue;}
      const elapsed=1.15-b.life;c.globalAlpha=Math.min(1,b.life*2);
      c.strokeStyle=b.color;c.lineWidth=2.4;c.beginPath();c.arc(b.x,b.y,13+elapsed*39,0,Math.PI*2);c.stroke();
      c.fillStyle='#e6f8f5';c.font='700 11px system-ui';c.textAlign='center';c.fillText(b.text,b.x,b.y-30-elapsed*22);
      c.globalAlpha=1;
    }
    c.setTransform(this.dpr,0,0,this.dpr,0,0);
  }
  /** A proper coastline separates land theatre from open water at every zoom. */
  private drawCoastalOutline(state:GameState):void {
    const c=this.ctx;
    c.save();c.lineWidth=this.viewMode==='strategic'?1.9:1.5;
    c.shadowColor='#9abeba';c.shadowBlur=this.viewMode==='strategic'?4:2;
    for(const t of state.territories){
      if(t.terrain==='sea')continue;
      const offshore=t.row%2===0
        ? [[-1,0],[1,0],[-1,-1],[0,-1],[-1,1],[0,1]]
        : [[-1,0],[1,0],[0,-1],[1,-1],[0,1],[1,1]];
      if(!offshore.some(([dx,dy])=>!isLandCell(t.col+dx,t.row+dy)))continue;
      const p=hexCenter(t);
      if(p.x*this.scale+this.offsetX<-80||p.x*this.scale+this.offsetX>this.width+80)continue;
      if(p.y*this.scale+this.offsetY<-80||p.y*this.scale+this.offsetY>this.height+80)continue;
      c.strokeStyle='#8bb1ab7d';
      tracePolygon(c,provinceOutline(t));c.stroke();
    }
    c.restore();
  }
  private drawPoliticalBorders(state: GameState, macro: boolean): void {
    const c=this.ctx;
    c.save(); c.lineJoin='round';
    c.lineWidth=macro?3.7:2.4;
    for(const territory of state.territories) {
      if(!territory.owner)continue;
      const own=hexCenter(territory);
      for(const neighbourId of territory.neighbours) {
        const other=state.territories[neighbourId];
        if(other.owner===territory.owner)continue;
        const target=hexCenter(other),mx=(own.x+target.x)*.5,my=(own.y+target.y)*.5;
        const dx=target.x-own.x,dy=target.y-own.y;
        const norm=Math.hypot(dx,dy)||1,px=-dy/norm*16,py=dx/norm*16;
        c.strokeStyle=FACTIONS[territory.owner].color;
        c.globalAlpha=macro?.85:.55;
        c.beginPath();c.moveTo(mx-px,my-py);c.lineTo(mx+px,my+py);c.stroke();
      }
    }
    c.restore();
  }
  /**
   * Legible, aggregated army formations in WORLD mode. Troops stay on the map,
   * and markers are selectable touch targets for actual strategic orders.
   */
  private drawWorldArmyMarkers(state:GameState,selected:number|null):void{
    const clusters=new Map<string,{troops:number;army:Territory;x:number;y:number;size:number;front:boolean}>();
    for(const t of state.territories) {
      if(t.terrain==='sea'||!t.owner)continue;
      const key=t.owner+':'+Math.floor(t.col/5)+':'+Math.floor(t.row/4);
      const point=hexCenter(t),front=t.neighbours.some(id=>state.territories[id].owner!==t.owner);
      const item=clusters.get(key);
      if(!item){
        clusters.set(key,{troops:t.troops,army:t,x:point.x,y:point.y,size:1,front});
      }else{
        item.troops+=t.troops;item.x+=point.x;item.y+=point.y;item.size++;
        const contact=t.neighbours.some(id=>state.territories[id].owner==='player'&&t.owner!=='player');
        const currentContact=item.army.neighbours.some(id=>state.territories[id].owner==='player'&&t.owner!=='player');
        if((contact&&!currentContact)||(contact===currentContact&&(t.troops>item.army.troops||(front&&!item.front))))item.army=t;
        item.front ||= front;
      }
    }
    const candidates=[...clusters.values()].filter(a=>a.troops>=12)
      .sort((a,b)=>Number(b.army.id===selected)-Number(a.army.id===selected) ||
        Number(b.front)-Number(a.front) || b.troops-a.troops)
      .slice(0,33);
    const c=this.ctx;
    c.save();c.setTransform(this.dpr,0,0,this.dpr,0,0);
    this.armyMarkers=[];
    const occupied:{x:number;y:number}[]=[];
    for(const m of candidates) {
      const x=m.x/m.size*this.scale+this.offsetX;
      const y=m.y/m.size*this.scale+this.offsetY;
      if(x<12||x>this.width-12||y<27||y>this.height-24)continue;
      if(occupied.some(p=>Math.hypot(p.x-x,p.y-y)<29))continue;
      occupied.push({x,y});
      const color=FACTIONS[m.army.owner!].color;
      const special=m.army.id===selected;
      c.fillStyle='#07161ce9';c.strokeStyle=special?'#f3dba7':color;c.lineWidth=special?2.2:1.2;
      c.beginPath();c.roundRect(x-24,y-10,48,20,4);c.fill();c.stroke();
      c.fillStyle=color;c.beginPath();c.moveTo(x-19,y);c.lineTo(x-13,y-5);c.lineTo(x-7,y);c.lineTo(x-13,y+5);c.closePath();c.fill();
      c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f6f0df';
      c.font='bold 11px system-ui';
      c.fillText(m.troops>=1000?Math.floor(m.troops/100)/10+'k':String(Math.floor(m.troops)),x+7,y);
      this.armyMarkers.push({x,y,id:m.army.id});
    }
    if(selected!==null && state.territories[selected].terrain!=='sea'){
      const t=state.territories[selected],p=hexCenter(t),x=p.x*this.scale+this.offsetX,y=p.y*this.scale+this.offsetY;
      c.strokeStyle='#fae8b8';c.lineWidth=2.4;c.beginPath();c.arc(x,y,16,0,7);c.stroke();
      c.fillStyle='#fff4d5';c.font='800 12px system-ui';c.textAlign='center';
      c.fillText(Math.floor(t.troops).toString(),x,y-20);
    }
    c.restore();
  }
  private drawStrategicLabels(state: GameState): void {
    const c=this.ctx;
    for(const faction of Object.values(state.factions)) {
      const owned=state.territories.filter(t=>t.owner===faction.id);
      if(owned.length<3)continue;
      const cx=owned.reduce((sum,t)=>sum+hexCenter(t).x,0)/owned.length;
      const cy=owned.reduce((sum,t)=>sum+hexCenter(t).y,0)/owned.length;
      c.save();c.textAlign='center';c.textBaseline='middle';
      c.shadowColor='#071014';c.shadowBlur=13;
      c.fillStyle='#f1efe2';c.font='800 '+Math.max(25,14/this.scale)+'px Barlow Condensed,system-ui';
      c.fillText(faction.name, cx, cy-126, 230);
      c.font='700 '+Math.max(19,11/this.scale)+'px Barlow Condensed,system-ui';
      c.fillStyle=FACTIONS[faction.id].color;
      c.fillText(owned.length+' REGIONS',cx,cy-101,220);
      c.restore();
    }
  }
  private drawBackdrop(c: CanvasRenderingContext2D): void {
    // An uninterrupted dark theatre with subtle topographic lines, not a boxed board.
    const grad=c.createLinearGradient(0,0,this.width,this.height);
    grad.addColorStop(0,'#112a33');grad.addColorStop(.55,'#0b202a');grad.addColorStop(1,'#07131d');
    c.fillStyle=grad;c.fillRect(0,0,this.width,this.height);
    c.save();c.globalAlpha=.19;c.strokeStyle='#6faba7';c.lineWidth=.75;
    for(let j=0;j<17;j++){
      const base=(j/16)*this.height;
      c.beginPath();
      for(let x=-25;x<=this.width+25;x+=9){
        const y=base+Math.sin(x*.013+j*1.73)*14+Math.sin(x*.031+j*.93)*7;
        if(x===-25)c.moveTo(x,y);else c.lineTo(x,y);
      }
      c.stroke();
    }
    c.restore();
    const shade=c.createRadialGradient(this.width*.45,this.height*.48,40,this.width*.5,this.height*.5,this.width*.83);
    shade.addColorStop(0,'#00000000');shade.addColorStop(1,'#00000083');
    c.fillStyle=shade;c.fillRect(0,0,this.width,this.height);
  }
  /** Deterministic top-down surface detail; no images, random frame jitter or GPU dependencies. */
  private drawTacticalSurface(t: Territory,p: Point):void {
    const c=this.ctx;
    c.save();
    tracePolygon(c,provinceOutline(t));
    c.clip();
    // Civilian roads cross sector boundaries coherently for linked neighbour pairs.
    c.strokeStyle=t.terrain==='highland'?'#80939a66':'#b8ac8761';
    c.lineWidth=1.9;
    for(const neighbour of t.neighbours){
      if((t.id+neighbour)%3!==0)continue;
      const regionX=45+Math.sqrt(3)*HEX_RADIUS*(neighbour%MAP_COLS+(Math.floor(neighbour/MAP_COLS)%2)*.5)+Math.sqrt(3)*HEX_RADIUS/2;
      const regionY=44+HEX_RADIUS+Math.floor(neighbour/MAP_COLS)*HEX_RADIUS*1.5;
      c.beginPath();c.moveTo(p.x,p.y);
      c.quadraticCurveTo(p.x+(regionX-p.x)*.3,p.y+(regionY-p.y)*.45,
        (p.x+regionX)*.5,(p.y+regionY)*.5);
      c.stroke();
    }
    const seed=(t.id*13007+17)%997;
    c.lineWidth=.9;
    for(let j=0;j<3;j++){
      const ox=((seed+j*47)%19)-9,oy=((seed*3+j*29)%23)-11;
      c.strokeStyle=t.terrain==='highland'?'#b9c0a85c':t.terrain==='fertile'?'#6da99b55':'#7892973b';
      c.beginPath();c.moveTo(p.x-30,p.y-18+j*14+oy*.3);
      c.bezierCurveTo(p.x-11+ox*.2,p.y-30+j*14+oy,
        p.x+15+ox*.3,p.y-2+j*14,p.x+35,p.y-12+j*14+oy*.25);
      c.stroke();
    }
    // Small geographic features create the feeling of an overhead world.
    if(t.terrain==='highland'){
      c.strokeStyle='#bdc1b598';c.lineWidth=1.3;
      for(let k=0;k<3;k++){
        const x=p.x-19+k*15,y=p.y-19+(k%2)*5;
        c.beginPath();c.moveTo(x-7,y+6);c.lineTo(x,y-6);c.lineTo(x+8,y+6);c.stroke();
      }
    }else if(t.terrain==='fertile'){
      for(let k=0;k<7;k++){
        const x=p.x-23+((seed+k*19)%46),y=p.y-22+((seed+k*13)%25);
        c.fillStyle=k%2?'#658a70aa':'#839c76aa';
        c.beginPath();c.arc(x,y,2.3,0,Math.PI*2);c.fill();
        c.strokeStyle='#3b5e54aa';c.beginPath();c.moveTo(x,y);c.lineTo(x+1,y+4);c.stroke();
      }
    }else if(t.terrain==='citadel'){
      c.strokeStyle='#d4bc8e98';c.lineWidth=1.6;
      c.strokeRect(p.x-19,p.y-26,38,12);
      c.fillStyle='#a3936a9a';
      for(let k=0;k<4;k++)c.fillRect(p.x-17+k*10,p.y-25,6,5);
    }else{
      for(let k=0;k<4;k++){
        const x=p.x-25+((seed+k*17)%48),y=p.y-25+((seed+k*11)%30);
        c.fillStyle='#456b666e';c.fillRect(x,y,3,2);
      }
    }
    c.restore();
  }
  /** Unit glyphs make nearby troop stacks read as battalions, not spreadsheet cells. */
  private drawBattalion(t:Territory,p:Point,time:number):void{
    const c=this.ctx,count=Math.min(7,Math.max(0,Math.ceil(Math.sqrt(t.troops)/2.5)));
    if(!count)return;
    c.save();
    const team=t.owner?FACTIONS[t.owner].color:'#a2b2aa';
    c.fillStyle=team;c.strokeStyle='#0d2026';c.lineWidth=.65;
    const spacing=7.4,origin=p.x-(count-1)*spacing/2;
    const bounce=Math.sin(time*1.4+t.id)*.65;
    for(let k=0;k<count;k++){
      const x=origin+k*spacing,y=p.y-10+(k%2)*2+bounce;
      c.beginPath();c.moveTo(x,y-3.5);c.lineTo(x+3.1,y+2.3);
      c.lineTo(x-3.1,y+2.3);c.closePath();c.fill();c.stroke();
    }
    c.restore();
  }
  private drawHex(t: Territory,selected:boolean,hovered:boolean,inReach:boolean,frontier:boolean,time:number,macro=false,operational=false):void{
    const c=this.ctx,p=hexCenter(t);
    tracePolygon(c,provinceOutline(t));
    const color=t.owner?FACTIONS[t.owner].color:'#53686b';
    c.fillStyle=t.owner
      ? blend(t.terrain==='fertile'?'#25372f':'#1a302e',color,macro?.66:operational?.58:.38)
      : macro?'#2b4138':t.terrain==='fertile'?'#334537':t.terrain==='highland'?'#414946':'#293a35';
    if(selected||hovered){c.shadowColor=selected?'#65ecdf':color;c.shadowBlur=7;}
    c.fill();c.shadowBlur=0;
    if(!macro&&!operational)this.drawTacticalSurface(t,p);
    c.strokeStyle=selected?'#fff2cd':hovered?'#ffffff':inReach?'#d1c299b0':
      frontier?color+'b9':macro?'#00000000':'#ffffff17';
    c.lineWidth=selected?2.8:inReach?1.5:frontier?1.4:.8;c.stroke();
    if(t.terrain==='highland'){c.strokeStyle='#8aa2b177';c.lineWidth=1;
      c.beginPath();c.moveTo(p.x-17,p.y-15);c.lineTo(p.x-10,p.y-23);c.lineTo(p.x-3,p.y-15);c.stroke();}
    else if(t.terrain==='fertile'){c.fillStyle='#8dc39574';c.beginPath();c.arc(p.x-13,p.y-20,2.8,0,7);c.fill();}
    if(t.capitalOf){const home=FACTIONS[t.capitalOf].color;
      c.strokeStyle=home;c.lineWidth=1.8;c.beginPath();c.moveTo(p.x+13,p.y-10);c.lineTo(p.x+13,p.y-26);c.stroke();
      c.beginPath();c.moveTo(p.x+13,p.y-26);c.lineTo(p.x+27,p.y-22);c.lineTo(p.x+13,p.y-18);c.closePath();c.fillStyle=home;c.fill();
      c.strokeStyle=home+'88';c.lineWidth=1.3;c.beginPath();c.arc(p.x,p.y,24+Math.sin(time*1.8+t.id)*1.6,0,Math.PI*2);c.stroke();}
    if(!macro&&!operational)this.drawBattalion(t,p,time);
    c.textAlign='center';c.textBaseline='middle';c.fillStyle=t.owner?'#f0fffc':'#b8c8cb';
    if(!macro && (!operational || selected || hovered || t.capitalOf || frontier)) {
      c.font='700 17px Barlow Condensed,system-ui';
      c.fillText(String(Math.floor(t.troops)),p.x,p.y+4);
    }
    if(t.capitalOf){c.fillStyle=t.capitalOf===t.owner?'#efddaf':'#ed8187';c.fillRect(p.x-2,p.y+17,4,4);}
  }
}
function blend(a:string,b:string,ratio:number):string{
  const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const ca=rgb(a),cb=rgb(b);
  return `rgb(${ca.map((n,i)=>Math.round(n*(1-ratio)+cb[i]*ratio)).join(',')})`;
}
