import { FACTIONS, HEX_RADIUS, WORLD_HEIGHT, WORLD_WIDTH } from '../game/config';
import type { GameEvent, GameState, Territory } from '../game/types';

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
  resetView(): void {
    // The camera is a window into a wide continuous theatre, never a tiny fitted atlas.
    const fitHeight = (this.height - Math.min(135, this.height * 0.22)) / WORLD_HEIGHT;
    this.scale = Math.min(1.65, Math.max(0.91, fitHeight));
    const startX = 45 + Math.sqrt(3) * HEX_RADIUS * (2.5);
    this.offsetX = Math.min(18, this.width * 0.33 - startX * this.scale);
    this.offsetY = (this.height - WORLD_HEIGHT * this.scale) / 2;
    this.constrainCamera();
  }
  zoom(factor: number, screenX = this.width / 2, screenY = this.height / 2): void {
    const next = Math.min(3, Math.max(0.6, this.scale * factor));
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
    if (WORLD_HEIGHT * this.scale <= this.height) this.offsetY = (this.height - WORLD_HEIGHT * this.scale) / 2;
    else this.offsetY = Math.max(this.height - WORLD_HEIGHT * this.scale - margin, Math.min(margin, this.offsetY));
  }
  pick(state: GameState, screenX: number, screenY: number): number | null {
    const x = (screenX - this.offsetX) / this.scale;
    const y = (screenY - this.offsetY) / this.scale;
    for (const t of state.territories) {
      if (pointInPolygon(provinceOutline(t),x,y))return t.id;
    }
    return null;
  }
  onEvents(events: GameEvent[], state: GameState): void {
    for (const e of events) {
      if (e.type === 'defense') continue;
      const c = hexCenter(state.territories[e.territory]);
      this.bursts.push({ x:c.x, y:c.y, life:1.15, color:FACTIONS[e.owner].color,
        text:e.type === 'revolt' ? 'UPRISING' : e.type === 'mobilize' ? 'REINFORCED' : 'CONQUERED' });
    }
    if (this.bursts.length > 24) this.bursts.splice(0,this.bursts.length-24);
  }
  render(state: GameState, selected: number | null, dt: number): void {
    const c = this.ctx;
    c.setTransform(this.dpr,0,0,this.dpr,0,0);
    c.clearRect(0,0,this.width,this.height);
    this.drawBackdrop(c);
    c.setTransform(this.dpr*this.scale,0,0,this.dpr*this.scale,this.offsetX*this.dpr,this.offsetY*this.dpr);
    c.strokeStyle = 'rgba(140,156,154,0.025)'; c.lineWidth=.6;
    for(let x=0;x<WORLD_WIDTH;x+=84){c.beginPath();c.moveTo(x,0);c.lineTo(x,WORLD_HEIGHT);c.stroke();}
    for(let y=0;y<WORLD_HEIGHT;y+=84){c.beginPath();c.moveTo(0,y);c.lineTo(WORLD_WIDTH,y);c.stroke();}
    const targets = selected === null ? [] : state.territories[selected].neighbours;
    for(const t of state.territories){
      const frontier=t.neighbours.some(n=>state.territories[n].owner!==t.owner);
      this.drawHex(t,t.id===selected,t.id===this.hover,targets.includes(t.id),frontier,state.time);
    }
    for(const m of state.marches){
      const a=hexCenter(state.territories[m.from]), b=hexCenter(state.territories[m.to]);
      const pct=Math.min(1,m.elapsed/m.duration), color=FACTIONS[m.owner].color;
      c.strokeStyle=color+'77';c.lineWidth=2.2;c.setLineDash([5,6]);c.lineDashOffset=-state.time*15;
      c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.setLineDash([]);
      const x=a.x+(b.x-a.x)*pct,y=a.y+(b.y-a.y)*pct;
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
  private drawBackdrop(c: CanvasRenderingContext2D): void {
    // An uninterrupted dark theatre with subtle topographic lines, not a boxed board.
    const grad=c.createLinearGradient(0,0,this.width,this.height);
    grad.addColorStop(0,'#101d22');grad.addColorStop(.55,'#0c171c');grad.addColorStop(1,'#070e13');
    c.fillStyle=grad;c.fillRect(0,0,this.width,this.height);
    c.save();c.globalAlpha=.13;c.strokeStyle='#6c7e73';c.lineWidth=.85;
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
  private drawHex(t: Territory,selected:boolean,hovered:boolean,inReach:boolean,frontier:boolean,time:number):void{
    const c=this.ctx,p=hexCenter(t);
    tracePolygon(c,provinceOutline(t));
    const color=t.owner?FACTIONS[t.owner].color:'#53686b';
    c.fillStyle=t.owner?blend('#152532',color,t.capitalOf===t.owner ? .54 : .4):'#1b2a2b';
    if(selected||hovered){c.shadowColor=selected?'#65ecdf':color;c.shadowBlur=7;}
    c.fill();c.shadowBlur=0;
    c.strokeStyle=selected?'#fff2cd':hovered?'#ffffff':inReach?'#d1c299b0':frontier?color+'91':'#ffffff10';
    c.lineWidth=selected?2.8:inReach?1.5:frontier?1.4:.8;c.stroke();
    if(t.terrain==='highland'){c.strokeStyle='#8aa2b177';c.lineWidth=1;
      c.beginPath();c.moveTo(p.x-17,p.y-15);c.lineTo(p.x-10,p.y-23);c.lineTo(p.x-3,p.y-15);c.stroke();}
    else if(t.terrain==='fertile'){c.fillStyle='#8dc39574';c.beginPath();c.arc(p.x-13,p.y-20,2.8,0,7);c.fill();}
    if(t.capitalOf){const home=FACTIONS[t.capitalOf].color;
      c.strokeStyle=home;c.lineWidth=1.8;c.beginPath();c.moveTo(p.x+13,p.y-10);c.lineTo(p.x+13,p.y-26);c.stroke();
      c.beginPath();c.moveTo(p.x+13,p.y-26);c.lineTo(p.x+27,p.y-22);c.lineTo(p.x+13,p.y-18);c.closePath();c.fillStyle=home;c.fill();
      c.strokeStyle=home+'88';c.lineWidth=1.3;c.beginPath();c.arc(p.x,p.y,24+Math.sin(time*1.8+t.id)*1.6,0,Math.PI*2);c.stroke();}
    c.textAlign='center';c.textBaseline='middle';c.fillStyle=t.owner?'#f0fffc':'#b8c8cb';
    c.font='700 17px Barlow Condensed,system-ui';c.fillText(String(Math.floor(t.troops)),p.x,p.y+4);
    if(t.capitalOf){c.fillStyle=t.capitalOf===t.owner?'#efddaf':'#ed8187';c.fillRect(p.x-2,p.y+17,4,4);}
  }
}
function blend(a:string,b:string,ratio:number):string{
  const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const ca=rgb(a),cb=rgb(b);
  return `rgb(${ca.map((n,i)=>Math.round(n*(1-ratio)+cb[i]*ratio)).join(',')})`;
}
