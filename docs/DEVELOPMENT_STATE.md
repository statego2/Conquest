# CONQUEST — DARK STRATEGIST
## Development continuity / source of truth
Updated: 2026-10-12

### Non-negotiable product decisions
- Endless single-player browser sandbox FIRST. Future: Steam and genuinely shared, persistent, server-authoritative multiplayer world.
- Territorial conquest is not a timed round. No compulsory game-over, reset or erasure of a faction after total territorial loss.
- Homeland identity persists after ownership changes. Both human and AI can recruit and rebel.
- The world remains live after full domination. Rank measures *current* political/military power, not historical farmable capture counts.
- Landscape-first browser gameplay on iPhone; MICRO -> REGIONS -> WORLD controls plus AUTO adaptive view.
- The correct brand is **Conquest — Dark Strategist**, never "Infinite Conquest".
- Player commands must feel like a strategy game, not a dashboard. Simplicity of actions, depth of interacting systems.

### Current implementation
- Vite 8, TypeScript strict, Canvas2D frontend, pure simulation under `src/game/`, AI `src/game/ai.ts`, render `src/render/`, UI `src/ui/`.
- Seeded 21x7 map (147 sectors), five factions, real-time continuous simulation, recruitment, marches, deterministic combat, occupation, resistance, uprisings, local autosaves.
- Supply corridors: BFS legal path through allied sectors, distance-based travel, interception if the route falls.
- Variable troop commitment 35/65/90%, battle forecast, and percentage-based rebellion that can retain uncommitted reserves.
- Finite local manpower shared with cultural resistance. Soft-cap slower recruitment; 220 is a *production* limit, NOT a prohibition on combining existing field armies.
- AI can coordinate support via supply corridors, gather enough force for a fortified assault, and choose more rational uprising timing.
- MICRO terrain contains roads, overhead ridges, vegetation, citadel features and troop formation glyphs. REGIONS emphasizes fronts; WORLD emphasizes empire boundaries and strength.
- AUTO automatically zooms out at 8+ and 28+ owned territories. Manual view controls always override it. Phone gestures include pinch-zoom.
- Scoreboard accounts for troops on the march; full conquest is a persistent milestone.
- V2 legacy saves migrate to the current V3 schema preserving armies and territory.
- Core quality gates: `npm run check` (Vitest and strict TypeScript production build). New Chromium mobile smoke workflow verifies views, controls and takes screenshots in landscape/portrait.

### Evidence and limitations
- CI completed for merged pull requests #3–#9; these changes are now on main.
- Mobile/browser e2e tests in PR #10: require successful screenshot artifact and CI before final merge.
- No real person on an iPhone has yet signed off on UI readability, navigation or fun. Chromium emulation is not Safari.
- GitHub Pages may require manual enabling. The repo's expected link is https://statego2.github.io/Conquest/; do not claim the live deployment is verified without a successful Pages workflow or actual device test.
- Play balance is experimental; deterministic unit tests cannot prove it is fun or fair.
- No live multiplayer, remote leaderboard, Steamworks or online account services exist.

### Next highest leverage milestones
1. Human iPhone playtest: opening experience, pinch/pan, legibility, attack and support order flow; identify two most frustrating moments.
2. Improve close-range world art fidelity, especially visible armies in motion, while keeping UI minimalist.
3. Recheck attrition, cooldown and manpower on 5–30 minute sessions; examine successful comebacks and snowball.
4. Introduce deeper defensive strategy only if it creates visible decisions: reconnaissance, garrison security, timed multi-pronged assaults, and optional stance.
5. Build a validated vertical slice and world persistence tests before early Steam packaging and multiplayer authority prototypes.

### Delivery discipline
- Preserve existing save key and old player progress unless deliberate version migration is planned.
- Engine and AI share legal orders; no secret troop spawns or AI-only combat modifiers.
- All balance rules need deterministic tests and multiple seeds; no arbitrary punishment merely for being strong.
- Prefer measurable player actions + tests + verified mobile build to cosmetic preview-only updates.
- Short PRs, CI checks and controlled merges make collaboration between AI roles auditable.
- Do not confuse *theoretical project plan* with *implemented features*.
