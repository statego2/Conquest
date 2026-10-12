# Conquest — Dark Strategist

**Reign. Fall. Rise again.** A living-world, real-time territorial strategy game with persistent national resistance.

**Status:** Alpha 0.3 candidate · browser-only, single-player. Steam, accounts, multiplayer and real online leaderboards are future milestones — not live features.

## Quick start

Requires **Node.js 20.19+**.

```bash
npm install
npm run dev
```

Open the URL printed by Vite. Production build: `npm run build`. Tests: `npm test`.

## Play

- **Tap/click one of your cyan territories**, then tap/click an adjacent **enemy** sector to send **65%** of its troops. On desktop hold **Shift** while attacking to send **90%**.
- Troops recruit automatically from a **finite local manpower pool** that replenishes slowly; local production slows beyond 90 and stops at 220 troops/sector; reinforcements can concentrate larger armies. Neutral areas start lightly defended; highlands and citadels have stronger defense.
- **Send Support:** select a friendly sector, press **SEND SUPPORT**, then tap any friendly destination connected through your territory. Long routes take longer, and captured corridors can intercept convoys.
- Drag from a friendly sector onto an adjacent allied sector to reinforce it immediately. Tap any friendly sector to select it.
- **Deploy reserves** onto a selected friendly territory, or press **Raise the uprising** when your homeland is occupied. Resistance also consumes finite homeland manpower, and receives a homeland-specific assault advantage.
- Pan from empty/hostile parts of the map; zoom with scroll / `+` / `−`; pan by dragging the map; use the fit icon to recenter.
- Space pauses, `R` fits the map, and 2× speed accelerates the simulation.
- The world autosaves to this browser's local storage; **Start a New World** replaces the local game.

### Non-negotiable design rule

**No nation can be permanently eliminated.** A homeland retains its cultural flag, the reserve pool continues to replenish after conquest, and a faction can eventually revolt. **Every AI faction plays by the same resistance and combat rules.**

## Project domains

| Domain | Owner documents / code | Responsibility |
|---|---|---|
| Vision & philosophy | `docs/VISION.md` | Player fantasy, irreversibles, guiding principles |
| Game design | `docs/GAME_DESIGN.md`, `docs/BALANCE.md` | Core loop, combat, feedback, design hypotheses |
| Art & UX | `docs/ART_DIRECTION.md`, `src/render/`, `src/style.css` | World readability, motion, colors, sound |
| Deterministic simulation | `src/game/` | Pure TS world state, battles, AI, resistance |
| Browser experience | `src/main.ts`, `src/ui/` | Input, HUD, audio, local persistence |
| Quality & delivery | `tests/`, `.github/workflows/` | Unit tests, type checks, production build, Pages workflow |
| Online / Steam future | `docs/ROADMAP.md`, `docs/ARCHITECTURE.md` | Secure scores, server authority, packaging plan |

## Design constraint

For Alpha 0.2 **only armies**, territory, and an automatically growing resistance pool. No wood, gold, food, technology tree, diplomacy menus or base-builder micro-management. Complexity should emerge from geography, tempo, defense and the strategic option to return after defeat.

## Production and deployment

`npm run check` validates tests and creates the web build. `.github/workflows/pages.yml` is prepared to publish on pushes to `main` **once GitHub Pages is enabled in repository settings with Source = GitHub Actions**. The workflow does not provision Pages settings or guarantee a publicly accessible URL.

The in-game **GLOBAL POWER INDEX** is an on-device live ranking of factions within the current simulation, **not** a global network leaderboard. Do not use untrusted client scores for the future Steam leaderboard; see `docs/ARCHITECTURE.md`.

## Collaboration

Before adding a mechanic: define the player decision it creates, test it, add measurable acceptance criteria, then implement it in `src/game/` with tests before polishing effects. Prefer one strong loop over many shallow features.

## Existing art system

The independent **Dark Strategist** SVG art library, [art direction](docs/ART_DIRECTION.md), [asset pipeline](docs/ASSET_PIPELINE.md), and [interactive gallery](art-preview.html) from the first art milestone are retained intact. The runnable prototype uses lightweight Canvas rendering today; follow [gameplay art integration notes](docs/ART_DIRECTION_GAMEPLAY.md) when replacing primitives with provided SVG assets.

### Static mobile-ready playtest

The official browser entrypoint is [Conquest — Dark Strategist](https://statego2.github.io/Conquest/). The legacy [playtest link](https://statego2.github.io/Conquest/play/) redirects to the same current build; old JS snapshots are no longer used. Landscape phone orientation is recommended; the map is horizontally scrollable, and tapping adjacent provinces works in portrait too.

## Alpha 0.3 change control

The rules for finite manpower, long-range friendly convoys, uprising effectiveness and AI reinforcement are experimental balance defaults, not proven final tuning. Previously saved Alpha 0.2 worlds are migrated to include manpower without resetting control, capitals or marching armies. The save key is retained; no automatic new world is created. Strategic supply corridors are validated when orders are issued and when the convoy completes movement. Unit tests in `tests/logistics.test.ts` cover core regression cases.
