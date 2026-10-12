# CONQUEST — ART DIRECTION BIBLE
**Version:** 0.1 — Dark Strategist (2026-10-12)
**Art thesis:** *Every border is a threat. Every flag is temporary.*

## 1. Player fantasy
The player is a cold-minded architect of empires, reading the continent as a living contest of power rather than a cozy fantasy landscape. The map itself is the protagonist. Territories are won, exhausted, occupied, contested, and reclaimed. Victory means control today, **not permanent safety**.

**Mood words:** midnight war room · imperial ambition · danger · restrained violence · cold intelligence · dynastic history · political fragility · quiet menace.

**Do not make:** bright mobile fantasy; colorful cartoon figures; ornate gold everywhere; particle-heavy war effects; low-contrast province boundaries; permanent ownership that visually hides unrest.

### Four art pillars
1. **Command at a glance:** recognize owner, military pressure, and unrest in one second.
2. **Dark without blindness:** readable units and regions at iPhone size, including in low light.
3. **Power with consequence:** occupied, unstable, rebelling and liberated territories tell different stories.
4. **Expandable atlas:** vector-first asset system for browser now, desktop/Steam later.

## 2. Color tokens (exact HEX)
| Token | HEX | Intended use |
|---|---|---|
| Obsidian | `#090C11` | near-black backgrounds |
| Slate | `#151B23` | panels, provinces at rest |
| Iron | `#28313A` | cards, neutral terrain |
| Border steel | `#65717C` | boundaries and dividers |
| Aged parchment | `#E2D6BD` | primary text |
| Muted ash | `#B9B9B0` | secondary text |
| Antique brass | `#BD9865` | critical chrome/selection |
| Ember crimson | `#9D4146` | red faction / unrest |
| Deep ocean | `#577C96` | blue faction / seas |
| Ivory | `#ACAA9A` | ivory faction |
| Muted teal | `#5B8B83` | positive logistics, not generic confirmation |

**Distribution goal:** ~75% obsidian/slate/iron, ~15% ash/parchment, ~10% signal color/gold. Faction paint should not replace borders. Use gold only for selected, royal, priority, or rare actions; gold is a high-salience resource.

### Faction colors
- **Ember Dominion:** muted burgundy `#9D4146` — imperial pressure.
- **Iron Compact:** weathered gunmetal `#65717C` — disciplined endurance.
- **Azure League:** dusty desaturated blue `#577C96` — naval/trade power.
- **Ivory Covenant:** pale muted stone `#ACAA9A` — cultural legitimacy.

Differentiation uses **sigil + text + fill hue**, not hue alone. Preserve grayscale legibility. Avoid green/red alone for the only distinguishable statuses.

## 3. Visual hierarchy at gameplay zoom
1. **Selected province:** animated? For v1 static gold perimeter, ring; optional minimal 120–180 ms pulse in UI, no excessive glow.
2. **Province ownership:** low-saturation faction fill and clearly drawn border.
3. **Army presence:** one silhouette + readable count, clustered at zoom-out.
4. **Instability:** overt crimson revolt marker, dashed border and city flags; occupation uses crossed emblem.
5. **Structures/capitals:** small high-contrast landmarks at province center.
6. **Topography:** mountain/river/forest is a secondary texture, never obscuring troop or province labels.

### States (designed for years of endless conquest)
- Sovereign: solid faction-colored territory, steady border.
- Occupied: faction of occupier + occupation mark and dashed thin line.
- Contested: dual/dashed red outline; fighting not settled.
- Rebellion ready: pulsing signal (motion optional) and unrest glyph.
- Rebellion active: split banner / rebel-controlled pocket.
- Destroyed army: skull only at battle site; never permanently cover territory.
- Liberated: original claimant insignia + a short temporary reclamation badge.

## 4. Spatial / interface rules
- **Mobile portrait:** 44 CSS-pixel minimum hit target for primary actions; no mouse-hover dependency; province selection via tap; selected province summary fixed to bottom sheet.
- **Desktop:** map occupies 65–80% width; collapsible side drawer for province intel.
- **Icon source:** 128x128 SVG viewBox; transparent backgrounds; one dominant shape; nominal map render 28–44 px.
- **Unit tokens:** silhouettes readable at ~36 CSS px; text labels render separately (do not bake labels into icons).
- **Province boundaries:** visible light stroke 1.5–2.5 CSS px + selected 3–4 px; never communicate identity by color only.
- **Copy:** Greek UI for the initial player-facing prototype; English neutral filenames for implementation.
- **Typography:** elegant serif in titles and imperial headings; pragmatic clear sans for critical numbers and interactions. No external font dependency required.
- **Motion:** reduced motion supported; combat flashes under ~250 ms; no looping strobe or screen shake by default.

## 5. Asset priority and production roadmap
**Phase A — visual MVP (this delivery):** faction shields, unit silhouettes, settlement landmarks, province terrain swatches, strategic action icons, status markers, midnight cartographic background, browsable preview.

**Phase B — gameplay integration:** wire assets to one source of truth (`province.owner`, `province.state`, `province.armies`, `province.unrest`); dynamically generated faction emblems; responsive map/camera; selection and notifications.

**Phase C — immersion:** relief maps, region-specific environments, subtle siege aftermath, battle reports, war fog, ambient particles and sound coordinated with event severity.

**Phase D — persistent online world:** scalable multi-zoom map art, nation crests, presence markers, coalition heraldry, claim overlays, performance budgets and high-density armies.

## 6. Accessibility and art acceptance gates
- At 375 px viewport width, army unit type and selected province are unmistakable.
- Borders remain distinguishable with color saturation reduced by 60%.
- Text uses adequate contrast against actual composited surfaces (check WCAG where text relevant).
- Game logic is never encoded in decorative texture alone; each condition has icon/label support.
- Every shipped icon is coherent with the palette, fits within the viewBox, and parses as SVG.
- Source vectors preserved and render at 1x/2x/3x without changing shape.
- Any later painted/AI-rendered concept is a **reference**, not automatically a game-ready asset; it must be redrawn/segmented/optimized before engine integration.

## 7. Guiding image
Imagine an iron campaign table illuminated by one low flame: a scarred map, contested provinces, bronze insignia and miniature armies. Every press of a button feels like issuing an order whose consequences continue after the battle.
