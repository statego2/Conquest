# AI / developer operating instructions — Conquest: Dark Strategist

**IMPORTANT:** The vNext product direction was explicitly locked on **2026-10-13**. Read this before changing code, UI, gameplay systems, maps or roadmaps.

## New development source of truth
1. [docs/redesign/00_DIRECTION_LOCK.md](docs/redesign/00_DIRECTION_LOCK.md)
2. [docs/redesign/01_GAMEPLAY_CONTRACT.md](docs/redesign/01_GAMEPLAY_CONTRACT.md)
3. [docs/redesign/02_ART_AND_UX.md](docs/redesign/02_ART_AND_UX.md)
4. [docs/redesign/03_EXECUTION_AND_ACCEPTANCE.md](docs/redesign/03_EXECUTION_AND_ACCEPTANCE.md)
5. [docs/redesign/04_DECISIONS_AND_TRADEOFFS.md](docs/redesign/04_DECISIONS_AND_TRADEOFFS.md)

The existing `src/`, `play/` and older `docs/` record valuable 377-sector experimental gameplay. **Do not mistake those camera scales for the new rank/sovereignty system.** Preserve the working demo and its saves. The vNext design is not yet implemented.

## Locked essentials
- EXACT NAME: **Conquest — Dark Strategist**.
- Endless fixed-boundary world; no timed sessions/wipes/expanding terrain while playing.
- Genuine 3 command levels: **settlements → regions → countries/empires**, not mere visual zoom presets.
- **Three independent political sovereignty slots** for settlements, regions, countries.
- Optional explicit rank promotion, retains already-held property and troops, no free promotion armies; lower-level micro management delegated after rank change.
- Human and AI obey identical physical army rules. No secret troop duplication, teleportation, magical ownership flips, loyalty/desertion stats, or automatic empire-collapse rubber-banding.
- Recovery/finite-material homeland resistance without permanent faction deletion.
- Top-down beautiful living cartographic terrain, minimal UI, primarily landscape phone and Mac. **Source → target** attack or support, contextual amount.
- **Current deliverable:** one truly playable and lovely Micro theatre with 10–12 strategic locations (number provisional) and a verified mobile experience. Macro diplomacy, Steam, multiplayer and larger maps are DEFERRED.

## Change discipline
- Don't add a system without naming the new player decision and its test.
- Treat numeric thresholds/colors/unit values as experimental until empirically approved.
- Do not overwrite existing source files or saves without a compatible plan.
- Maintain deterministic headless tests and separate human aesthetic/fun acceptance.
- Never claim “playable on iPhone”, “deployed”, “balanced” or “beautiful” without test evidence.
- Do not produce a gorgeous standalone mockup instead of an actual playable build.
- Use reviewable branches and clear file ownership. Keep the design source of truth synchronized with intended game rules.

## Current next ticket
**P0-MICRO-001**: implement one handcrafted-feeling tactical region, real army attack/reinforce through simple gestures, bounded recruitment, AI, comeback, saves, real feedback, responsive rendering, headless tests. See the complete definition in [execution plan](docs/redesign/03_EXECUTION_AND_ACCEPTANCE.md).

If an instruction conflicts with these LOCKED essentials, stop the conflicting change and document the trade-off for user decision rather than silently violating the project direction.
