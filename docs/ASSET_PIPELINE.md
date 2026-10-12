# CONQUEST — ASSET LIBRARY / ENGINE HANDOFF

**Scope:** SVG art pack v0.1, released on `art/dark-strategist-v1`.

## Folder contract
```txt
public/assets/conquest/
├── backgrounds/war-room.svg
├── factions/{ember,iron,azure,ivory}.svg
├── units/{infantry,cavalry,archer,garrison,fleet}.svg
├── structures/{capital,citadel,watchtower,barracks,village}.svg
├── terrain/{plains,forest,mountains,marsh,water}.svg
├── icons/{crown,swords,banner,fortress,uprising,supply,spy,occupation,skull,capital,retreat,diplomacy}.svg
├── ui/{selection-ring,contested-marker,revolt-marker,occupied-marker,war-room-frame}.svg
└── manifest.json
```

Total = **37 original SVGs**: 1 background + 4 faction crests + 5 units + 5 structures + 5 terrain + 12 strategic icons + 5 UI overlays.

## Integration notes
A standard Vite/React app serves assets in `public/` at root level. Therefore:
```js
const asset = (group, name) => `/assets/conquest/${group}/${name}.svg`;
const armyURL = asset('units', 'infantry');
const shieldURL = asset('factions', 'ember');
```
For the standalone `art-preview.html` opened directly from the source repository, the same files are reached at relative `public/assets/conquest/…`.

Manifest file paths are runtime **web paths** (without `public`).

### Proposed renderer interface
```ts
type Faction = 'ember' | 'iron' | 'azure' | 'ivory';
type ProvinceState = 'sovereign' | 'occupied' | 'contested' | 'rebellion-ready' | 'rebel-held';
type TroopType = 'infantry' | 'cavalry' | 'archer' | 'garrison' | 'fleet';

interface ProvinceView {
  id: string;
  name: string;
  owner: Faction;
  state: ProvinceState;
  armies: Partial<Record<TroopType, number>>;
  unrest: number;       // 0..100
  fortLevel: number;    // 0..5
  capital: boolean;
}
```
Render order: atmospheric background -> land/sea -> province fill -> terrain -> borders -> owner symbol -> structures -> armies -> unrest overlays -> selection -> tooltips/drawers.

Keep troop numbers in HTML/canvas text overlays rather than embedding them in raster/vector asset files. For an infinite-war live map, use geometry simplified by zoom level and screen-space marker clustering.

## Naming + quality
- Lowercase `kebab-case` only.
- All SVGs are self-contained, with viewBox, title and role/aria-label; no external fonts or image references.
- Prefer CSS variables for dynamically recolored province vector geometry; faction sigils themselves are intentionally fixed.
- Unit icons are strategic counters rather than illustrations at 300% zoom; do not interpret them as final character portrait art.
- Test on iOS Safari, mobile Chromium and desktop browser after game integration.
- Next production target: coherent map atlas and integrated battle/capture/rebellion visual feedback.

## Showcase
Open [art-preview.html](../art-preview.html) from a local checkout (or static file hosting) to explore the library and a tiny clickable **art-only** province simulation. The preview is meant for evaluating appearance and interaction, **not** as the finished gameplay.
