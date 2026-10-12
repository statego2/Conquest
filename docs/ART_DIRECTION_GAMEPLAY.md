# Art direction — The War Table

## Creative concept

**A cartographer's living tactical map.** Not cartoon warfare, not a realistic satellite feed. The visual vocabulary is militaristic, restrained and crystalline. Every captured hex emits a brief energy pulse; faction colors carry the story. The camera should feel like a strategic command console.

## Working palette

| Role | Hex | Meaning |
|---|---|---|
| Obsidian | `#07121b` | World/background |
| Slate | `#10232d` | HUD surfaces |
| Free Cities | `#5fe5d2` | Player, renewal, agency |
| Solar Dominion | `#e8ac55` | Ambition/empire |
| Crimson Order | `#ed7186` | Pressure/conflict |
| Ascendancy | `#ab96f2` | Elite/technocracy |
| Verdant Pact | `#a2cf75` | Persistence/expansion |
| Neutral | `#537180` | Unclaimed space |

## Type and hierarchy

- **Barlow Condensed** for big titles and forceful tactical headers, with sturdy system-font fallback.
- **DM Sans** for interface text, with system fallback.
- Large numbers for troops, three-digit sector IDs below numbers, homeland pennants permanently attached to capitals.
- Colors must never be the only identifier: ranks, labels, pennants and selection strokes support readability.

## Motion vocabulary

- Troop marches: glowing couriers along dashed tactical lines.
- Captures: outward pulse / 'CONQUERED' micro-feedback.
- Revolt: same map, stronger flag-based pulse. Never cut to a game-over screen.
- The entire UI must remain usable without motion/sonic feedback; sound is optional and OFF by default.

## Asset production roadmap

1. **Alpha:** Procedural Canvas2D hexes, faction color bands, flag pennants and simple sound cues — minimal download burden.
2. **Art pass:** Exported SVG territorial sigils, standardized icon set, large-scale terrain patterns and capturable border detail.
3. **Production:** Motion language, audio mix, world-map themes, accessible color modes, Steam art and promotional key art.

Version every visual asset in source control. Do not make gameplay depend on proprietary external CDN fonts or imagery.
