# CONQUEST — DARK STRATEGIST
## Art Direction & UX Acceptance vNext · 2026-10-13

**Status:** direction LOCKED; concrete assets, sample palette and precise measurements PROVISIONAL. This is a quality contract for a future playable build, not a claim the old UI already satisfies it.

## 1. Visual target: PREMIUM DARK TACTICAL CARTOGRAPHY

The player should feel like a strategist physically reading a living landscape from overhead: waterways, passes, roads, settlements, marching units, thin borders and recognizable fronts. At the first scale, a battlefield should have readable physical miniature formations. At macro scale, natural world geography should simplify into readable strategic territorial boundaries.

**Mood:** midnight tactical atlas, high-end satellite/game-terrain relief, understated military intelligence, cinematic restraint. Color marks power and danger; black panels never dominate the viewport.

**Avoid:**
- Flat, monotonous checkerboard or undifferentiated hex mosaic.
- Large dashboards, rows of numerically dense widgets, five simultaneous sidebars.
- Ornamental antique parchment/grunge/heroic fantasy/serif + gold everywhere.
- Neon wash, glowing every unit, over-saturated ownership fill that hides rivers, terrain and roads.
- Tiny grey numerals over textured backgrounds, inaccessible hover-only info and gratuitous animations.
- "Art preview" that is beautiful as a still but not connected to real troop movement/selection.

## 2. Reference qualities (not copies)
- **Bad North:** tactile high-angle battlefield and readable tiny moving formations.
- **Territorial.io:** immediacy, map-first interface, direct territorial control.
- **Thronefall:** restraint, decision density, satisfying response without needless subsystems.
- Political and grand-strategy atlases: semantic zoom, strategic chokepoint reading, borders at large scale.
Use references to define experience, **never** reproduce proprietary interface, maps or artwork.

## 3. Camera language and layered illustration
**Same geographic identity for all levels**:
- MICRO: top-down geographic terrain with height/vegetation, visible village roofs/fort outlines, roads and bridges. Small battalions or legible grouped formation tokens move physically.
- REGIONAL: much less roof detail, more emphasis on mountain passes, river basins, capitals, troop concentration and contested fronts.
- MACRO: countries, political boundaries, campaign lines, major terrain, theatres and strategic resource/corridor icons. Major armies still have physical origin/destination.
- Transition: smooth zoom and LOD (level of detail) rather than cutting to a completely different board. Command-rank promotion is a separate deliberate act, never auto-triggered by wheel/pinch zoom.

**Layer order (behind → front):**
1. ocean/land masses (for future world, do not implement water just for decoration in Micro unless meaningful);
2. relief/elevation vegetation and subtle texture;
3. river, road and bridge networks;
4. local domain tint (subtle) and borders;
5. key physical settlements, citadels and passes;
6. force tokens/counts + route arrows;
7. selection/target/command preview;
8. minimal contextual interface.

## 4. Production-ready palette hypothesis
| Role | Candidate HEX | Note |
| --- | --- | --- |
| midnight void | `#101A22` | background/UI shadows |
| dark slate | `#253D3B` | geographic lowland base |
| player jade/cyan | `#69C9BD` | owner accent, not full opaque fill |
| rival rust | `#B96964` | opposing faction |
| tactical amber | `#D6AF72` | selected strategic element |
| ivory | `#E5E8E4` | high-contrast primary information |
| muted blue river | `#668EA0` | readable water corridor |
| quiet charcoal panel | `#18252D` | contextual HUD only |

These are **visual hypotheses**; final colors should be assessed on rendered geography in sunlight and dim phone environments. Status never depends on hue alone; add outline/icon/shape.

## 5. Art grammar / composition requirements
- Landscape phone first (horizontal gameplay). Desktop may enjoy a slightly taller or wider arena but **must preserve the map-first presentation**.
- Target roughly **80–90% visible map** when idle; overlays appear only when needed. The 'selected' state may momentarily use more real estate but should never permanently narrow the board to a ribbon.
- Strong recognizable spatial features: bridge, fort, mountain ridge, river bend, valuable farmland. Geography must communicate **why** an objective matters.
- Remove non-decision ornament: if feature doesn't assist play/atmosphere, reduce or cut.
- Use readable simple modern sans lettering for dynamic numbers; names appear selectively rather than a wall of labels.
- Variable unit glyph density: MICRO shows soldier formations, REGIONAL groups into banners, MACRO into armies/theatres with concise counts.
- Identical target highlight language at all zooms (selected gold, valid enemy rust target, valid support cyan target; with outline types for color-blindness).

## 6. Interaction states (mobile + mouse)
| State | What must be visible | Player action |
| --- | --- | --- |
| Idle | Map + very small faction/rank banner + most important threat/opportunity | Select own force |
| Own force selected | Selected source, troop count, reachable hostile/friendly targets and optional amount | Tap destination or cancel |
| Enemy target preview | Defending force (as observed), geography modifier, projected casualties risk, troops left behind | Confirm or adjust/send; no huge modal |
| Friendly target preview | Route, travel time/risks if known, source retained force | Confirm support |
| March active | True movement path, travelling force and origin diminished | Select another command; pause as needed |
| Battle resolved | Visible force change, land-owner change where earned, short feedback and aftermath | Issue next command |
| Dispossessed | Homeland focus, occupation garrison estimate, finite resistance readiness, one salient uprising action | Prepare or launch uprising |
| Eligible promotion | Subtle singular invitation; does not hide existing tactical choices | Explicitly promote when wanted |

**Avoid permanent support mode toggle** for ordinary ally targets. An illegal tap must explain a precise reason; never silently do nothing.

### Source/target gesture collision
The current build supports pan and unit drag. The new experience should **prioritize tap/tap**:
- Short first tap selects allied force; short second tap on valid target previews/commits appropriate order.
- Blank-space drag always pans; touch movement over threshold pans unless a deliberate drag-orders affordance was explicitly initiated.
- Two finger pinch only zooms/pans. Pinch end never attacks accidentally.
- Drag source→target can be optional shortcut after gestures become robust; not required to complete basic play.
- Keep a visible selection ring, an accessible cancel action, and a short undo window **before** order is irrevocably dispatched if confirmation is used.

## 7. Compact HUD spec

Idle phone example:
```
┌ CONQUEST | MICRO ────── 02/12 ┐
│                               │
│        LIVING TACTICAL        │
│              MAP              │
│                               │
│  troops 85  ↗  fort 110       │
└ select an army to command ────┘
```
Selected own force:
```
[85 TROOPS]  →  [RIVAL FORT • 110]
[Sending 65% • strong defensive risk]  [SEND]
```
Use existing source/target map selections; overlays are contextual, not separate permanent action menus.

**Permanent accessible controls** must be extremely few: pause/overflow and camera reset if needed. Camera scales may be reached through zoom; **command-rank promotion is a distinct CTA**, never a top-row cluster of MICRO/REGIONS/WORLD buttons.

## 8. Motion/sound standards
- Movement should be visible at phone scale without requiring exact sprite counting.
- A march telegraphs route and ETA for its full duration, with clear direction arrow.
- Attack feedback shows force outcome; capture changes symbol and tint with short, dignified animation. Don't obscure the result in particles.
- Subtle marching/combat/capture audio with mute setting; audio optional, not a substitute for text or readable feedback.
- Reduced-motion option or OS preference respected. No loops that flash or drain a phone battery just for atmosphere.
- Terrain art must render reasonably on a middle-aged iPhone without huge external image loading.

## 9. Screen and readability acceptance
**Review actual screenshots and short interactions** on:
- iPhone landscape, Safari, real hardware.
- iPhone portrait: fallback that doesn't break or silently hide commands; landscape may be explicitly recommended.
- Mac desktop in Safari + Chromium class browser.
- Browser resized: HUD never blocks most attackable area or creates invisible target strips.

**Proposed measurable gates** (test hypotheses):
- First available target and friendly source recognized without text tutorial by 4/5 test subjects.
- Main touch targets ~44 CSS px or reliably gesture-usable; no permanent 9px tappable troop badges.
- Selected location's controller and force strength readable at ordinary phone viewing distance.
- A player can attack and reinforce **without opening any menu**, by default touch gestures.
- During idle micro play, map retains ~80% visible viewport area in typical landscape dimensions.
- A completed order takes no more than two location taps plus optional contextual confirmation.
- No clip/overlap at common landscape Safari dimensions; status bar safe areas respected.
- An actual user rates look and feel acceptable before calling the slice visually ready; palette mockups don't count.

## 10. Asset plan — spend time where it improves decisions
1. **Prototype cartography**: convincing elevation, roads, water and pass geometry on *one* test region.
2. **Game-critical icons**: player/rival troop stack, settlement, regional seat, bridge, valid target, battle state.
3. **Motion**: marching path, attack feedback, capture transition, defensive threat preview.
4. **Polish**: palette cohesion, stroke/shadows, micro typography, restrained sound.
5. Only after these: country-scale painting, extensive shields, city decorative variations, seasonal content.

**Art is a ship gate, not a cosmetic extra.** If the creator says the actual playable screenshot is aesthetically unacceptable, fix rendering before increasing map size.
