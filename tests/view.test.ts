import { describe, expect, it } from 'vitest';
import { automaticView, factionCentroid, resolveView, scaleForView } from '../src/game/view';
import { createGame } from '../src/game/world';

describe('Three levels of command', () => {
  it('begins on a tactical battlefield and scales with the player's empire', () => {
    expect(automaticView(1)).toBe('tactical');
    expect(automaticView(7)).toBe('tactical');
    expect(automaticView(8)).toBe('operational');
    expect(automaticView(27)).toBe('operational');
    expect(automaticView(28)).toBe('strategic');
    expect(automaticView(147)).toBe('strategic');
  });
  it('manual view preferences always outrank auto zoom', () => {
    expect(resolveView('auto',40)).toBe('strategic');
    expect(resolveView('tactical',40)).toBe('tactical');
    expect(resolveView('strategic',1)).toBe('strategic');
    expect(resolveView('operational',1)).toBe('operational');
  });
  it('uses a larger scale for micro than operations, then global strategy', () => {
    for (const [width,height] of [[390,730],[844,390],[1440,900]]) {
      const tactical=scaleForView('tactical',width,height);
      const operational=scaleForView('operational',width,height);
      const strategic=scaleForView('strategic',width,height);
      expect(tactical).toBeGreaterThan(operational);
      expect(operational).toBeGreaterThan(strategic);
      expect(strategic).toBeGreaterThan(0);
    }
  });
  it('calculates a strategic focus without changing the map', () => {
    const game=createGame(42),before=JSON.stringify(game);
    const result=factionCentroid(game.territories,'player');
    expect(result?.count).toBeGreaterThan(0);
    expect(result?.col).toBeGreaterThanOrEqual(0);
    expect(result?.row).toBeGreaterThanOrEqual(0);
    expect(game).toEqual(JSON.parse(before));
    expect(factionCentroid(game.territories,'missing')).toBeNull();
  });
});
