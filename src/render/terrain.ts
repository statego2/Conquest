/**
 * Deterministic value-noise landscape. Ownership is rendered separately.
 * Continuous world-coordinate sampling avoids visible geometric tessellation.
 */
function hash(x:number,y:number,seed:number):number {
  let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(seed,2246822519))|0;
  h=Math.imul(h^(h>>>13),1274126177);
  return ((h^(h>>>16))>>>0)/4294967296;
}
const smooth=(v:number)=>v*v*(3-2*v);
function valueNoise(x:number,y:number,seed:number):number {
  const ix=Math.floor(x),iy=Math.floor(y);
  const tx=smooth(x-ix),ty=smooth(y-iy);
  const a=hash(ix,iy,seed),b=hash(ix+1,iy,seed);
  const c=hash(ix,iy+1,seed),d=hash(ix+1,iy+1,seed);
  return (a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;
}
export function terrainHeight(seed:number,x:number,y:number):number {
  let sum=0,amplitude=.55,total=0,frequency=.0048;
  for(let i=0;i<5;i++){
    sum+=valueNoise(x*frequency,y*frequency,seed+i*193)*amplitude;
    total+=amplitude;amplitude*=.53;frequency*=2.12;
  }
  return sum/total;
}

export function terrainRGB(seed:number,x:number,y:number):[number,number,number]{
  const elevation=terrainHeight(seed,x,y);
  const detail=valueNoise(x*.056,y*.056,seed^0x9e3779b9)-.5;
  const grit=valueNoise(x*.18,y*.18,seed^0x46ca1fed)-.5;
  const rise=(elevation-.5)*70;
  const rock=Math.max(0,(elevation-.62)*130);
  const moisture=valueNoise(x*.005+37,y*.005-14,seed+101);
  const leaf=moisture*.36;
  const grain=detail*12+grit*5;
  const r=Math.max(10,Math.min(125,Math.round(44+rise+rock+grain-leaf*10)));
  const g=Math.max(19,Math.min(138,Math.round(65+rise*.8+rock*.75+grain*.65+leaf*11)));
  const b=Math.max(16,Math.min(126,Math.round(54+rise*.68+rock*.8+grain*.62-leaf*5)));
  return [r,g,b];
}
