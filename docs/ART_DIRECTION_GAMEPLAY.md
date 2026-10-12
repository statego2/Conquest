# Conquest — Dark Strategist / art direction v0.2

The playable view is a continuous, wide, top-down battlefield. The map is the product — not a page of dashboards.

## Design constraints
- **Landscape-first:** the world occupies the entire available stage. On a phone in landscape the command dock stays compact; portrait remains usable.
- **Horizontal exploration:** 21 columns × 7 rows = 147 connected provinces. Camera tracks a wide war theatre rather than forcing a full-map overview.
- **Near-invisible borders:** every territory meets its neighbours; borders indicate ownership without looking like separated chess pieces. More organic polygon boundaries can follow once the playtest confirms readability.
- **Dark, restrained, futuristic:** graphite terrain, muted faction hues, rare gold for deliberate player actions. No medieval castles, no 3D diorama, no oversized panels.
- **Napoleonic principle:** centralise player attention on the map, force concentrations, fronts, and movements.
- **Readable first:** big force numbers, understated capitals, visible friendly/hostile frontlines, minimal controls, subdued topographic lines.
- **Single source of truth:** `src/game/`, `src/render/`, `src/ui/`; legacy `/play/` points to the current site instead of rendering stale duplicate code.

## Future test
Replace underlying hex tessellation with continuous organic Voronoi provinces only if the basic war theatre passes usability and fun tests; do not complicate the economy or add visual objects that hide unit counts.

## Brand
**CONQUEST** is the game title. **DARK STRATEGIST** is its subtitle. Do not label it “Infinite Conquest” in metadata, UI, documentation, or package name.
