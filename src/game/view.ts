import { WORLD_HEIGHT, WORLD_WIDTH } from './config';

/**
 * Tactical: read individual skirmishes. Operational: manage several fronts.
 * Strategic: comprehend the whole theatre. These are camera / information
 * levels, not different game worlds or different simulation rules.
 */
export type ViewMode = 'tactical' | 'operational' | 'strategic';
export type ViewPreference = ViewMode | 'auto';

export function automaticView(owned: number): ViewMode {
  if (owned >= 28) return 'strategic';
  if (owned >= 8) return 'operational';
  return 'tactical';
}

export function resolveView(preference: ViewPreference, owned: number): ViewMode {
  return preference === 'auto' ? automaticView(owned) : preference;
}

/** Responsive zoom for a landscape-first game. World coordinates stay identical. */
export function scaleForView(mode: ViewMode, width: number, height: number): number {
  const w = Math.max(180, width), h = Math.max(160, height);
  const fit = Math.min((w - 24) / WORLD_WIDTH, (h - 24) / WORLD_HEIGHT);
  if (mode === 'strategic') return Math.max(0.18, Math.min(2.2, fit));
  if (mode === 'operational') return Math.max(0.67, Math.min(1.2, Math.max(fit * 1.55, 0.88)));
  return Math.max(1.28, Math.min(1.85, Math.max(fit * 2.8, 1.42)));
}

/** No camera logic is allowed to alter actual ownership or troop simulation. */
export function factionCentroid<T extends {owner:string|null;col:number;row:number}>(regions: T[], owner:string): {col:number;row:number;count:number} | null {
  let col = 0, row = 0, count = 0;
  for (const territory of regions) {
    if (territory.owner !== owner) continue;
    col += territory.col; row += territory.row; count++;
  }
  return count ? { col: col / count, row: row / count, count } : null;
}
