import { describe,expect,it } from 'vitest';
import { terrainHeight,terrainRGB } from '../src/render/terrain';

describe('Continuous terrain substrate',()=>{
  it('is deterministic for every world seed and coordinate',()=>{
    for(const seed of [0,24102,99999]){
      expect(terrainRGB(seed,500,412)).toEqual(terrainRGB(seed,500,412));
      expect(terrainHeight(seed,120,220)).toBe(terrainHeight(seed,120,220));
      expect(terrainHeight(seed,120,220)).not.toBe(terrainHeight(seed+1,120,220));
    }
  });
  it('does not jump across adjacent pixels as tile-colored land did',()=>{
    let maxJump=0;
    for(let x=100;x<1100;x+=13){
      const a=terrainRGB(24102,x,330),b=terrainRGB(24102,x+1,330);
      maxJump=Math.max(maxJump,...a.map((n,i)=>Math.abs(n-b[i])));
    }
    expect(maxJump).toBeLessThan(40);
  });
  it('produces earthy bounded channels and variations across a continent',()=>{
    const samples=[];
    for(let y=100;y<920;y+=91){
      for(let x=100;x<1940;x+=101){
        const pixel=terrainRGB(24102,x,y);
        expect(pixel.every(v=>Number.isInteger(v)&&v>=10&&v<=138)).toBe(true);
        samples.push(pixel.join(','));
      }
    }
    expect(new Set(samples).size).toBeGreaterThan(25);
  });
});
