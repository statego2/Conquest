import { FACTIONS, HEX_RADIUS, WORLD_HEIGHT, WORLD_WIDTH } from '../game/config';
import type { GameEvent, GameState, Territory } from '../game/types';

interface Burst { x: number; y: number; life: number; color: string; text: string }
export function hexCenter(t: Territory): { x: number; y: number } {
  return { x: 45 + Math.sqrt(3) * HEX_RADIUS * (t.col + (t.row % 2) * 0.5) + Math.sqrt(3) * HEX_RADIUS / 2,
    y: 44 + HEX_RADIUS + t.row * HEX_RADIUS * 1.5 };
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
    this.scale = Math.min(this.width / WORLD_WIDTH, this.height / WORLD_HEIGHT) * 0.95;
    this.offsetX = (this.width - WORLD_WIDTH * this.scale) / 2;
    this.offsetY = (this.height - WORLD_HEIGHT * this.scale) / 2;
  }
  zoom(factor: number, screenX = this.width / 2, screenY = this.height / 2): void {
    const next = Math.min(3, Math.max(0.3, this.scale * factor));
    this.offsetX = screenX - ((screenX - this.offsetX) / this.scale) * next;
    this.offsetY = screenY - ((screenY - this.offsetY) / this.scale) * next;
    this.scale = next;
  }
  pan(dx: number, dy: number): void { this.offsetX += dx; this.offsetY += dy; }
  pick(state: GameState, screenX: number, screenY: number): number | null {
    const x = (screenX - this.offsetX) / this.scale;
    const y = (screenY - this.offsetY) / this.scale;
    for (const t of state.territories) {
      const c = hexCenter(t);
      const px = Math.abs(x - c.x), py = Math.abs(y - c.y);
      if (py <= HEX_RADIUS && px <= HEX_RADIUS * Math.sqrt(3)/2 && Math.sqrt(3) * py + px <= Math.sqrt(3) * HEX_RADIUS) return t.id;
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
    c.strokeStyle = 'rgba(128,176,181,0.055)'; c.lineWidth=1;
    for(let x=0;x<WORLD_WIDTH;x+=30){c.beginPath();c.moveTo(x,0);c.lineTo(x,WORLD_HEIGHT);c.stroke();}
    for(let y=0;y<WORLD_HEIGHT;y+=30){c.beginPath();c.moveTo(0,y);c.lineTo(WORLD_WIDTH,y);c.stroke();}
    const targets = selected === null ? [] : state.territories[selected].neighbours;
    for(const t of state.territories) this.drawHex(t,t.id===selected,t.id===this.hover,targets.includes(t.id),state.time);
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
    const g=c.createRadialGradient(this.width*.5,this.height*.44,35,this.width*.5,this.height*.5,this.width*.9);
    g.addColorStop(0,'#132936');g.addColorStop(.56,'#0b1b27');g.addColorStop(1,'#07111b');
    c.fillStyle=g;c.fillRect(0,0,this.width,this.height);
    c.strokeStyle='#21425266';c.lineWidth=1;c.strokeRect(12,12,this.width-24,this.height-24);
    c.font='11px system-ui';c.textAlign='left';c.fillStyle='#577584';
    c.fillText('TACTICAL THEATRE  /  SECTOR ATLAS 01',25,33);
    c.textAlign='right';c.fillText('REAL-TIME SIMULATION',this.width-25,this.height-23);
  }
  private drawHex(t: Territory,selected:boolean,hovered:boolean,inReach:boolean,time:number):void{
    const c=this.ctx,p=hexCenter(t),r=HEX_RADIUS-2.3;
    c.beginPath();for(let i=0;i<6;i++){const a=(Math.PI/180)*(60*i-90);
      const x=p.x+r*Math.cos(a),y=p.y+r*Math.sin(a);if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}
    c.closePath();
    const color=t.owner?FACTIONS[t.owner].color:'#537180';
    c.fillStyle=t.owner?blend('#152532',color,t.capitalOf===t.owner ? .43 : .25):'#172732';
    if(selected||hovered){c.shadowColor=selected?'#65ecdf':color;c.shadowBlur=16;}
    c.fill();c.shadowBlur=0;
    c.strokeStyle=selected?'#e8fff8':hovered?'#c9f6ef':inReach?'#74ccbfa8':t.owner?color+'96':'#395261';
    c.lineWidth=selected?3.1:inReach?2.2:1.25;c.stroke();
    if(t.terrain==='highland'){c.strokeStyle='#8aa2b177';c.lineWidth=1;
      c.beginPath();c.moveTo(p.x-17,p.y-15);c.lineTo(p.x-10,p.y-23);c.lineTo(p.x-3,p.y-15);c.stroke();}
    else if(t.terrain==='fertile'){c.fillStyle='#8dc39574';c.beginPath();c.arc(p.x-13,p.y-20,2.8,0,7);c.fill();}
    if(t.capitalOf){const home=FACTIONS[t.capitalOf].color;
      c.strokeStyle=home;c.lineWidth=1.8;c.beginPath();c.moveTo(p.x+13,p.y-10);c.lineTo(p.x+13,p.y-26);c.stroke();
      c.beginPath();c.moveTo(p.x+13,p.y-26);c.lineTo(p.x+27,p.y-22);c.lineTo(p.x+13,p.y-18);c.closePath();c.fillStyle=home;c.fill();
      c.strokeStyle=home+'88';c.lineWidth=1.3;c.beginPath();c.arc(p.x,p.y,24+Math.sin(time*1.8+t.id)*1.6,0,Math.PI*2);c.stroke();}
    c.textAlign='center';c.textBaseline='middle';c.fillStyle=t.owner?'#f0fffc':'#b8c8cb';
    c.font='700 17px system-ui';c.fillText(String(Math.floor(t.troops)),p.x,p.y-1);
    c.font='700 9px system-ui';c.fillStyle=t.owner?color:'#668492';
    c.fillText(String(t.id+1).padStart(3,'0'),p.x,p.y+15);
  }
}
function blend(a:string,b:string,ratio:number):string{
  const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const ca=rgb(a),cb=rgb(b);
  return `rgb(${ca.map((n,i)=>Math.round(n*(1-ratio)+cb[i]*ratio)).join(',')})`;
}
