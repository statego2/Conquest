# CONQUEST — DARK STRATEGIST
## DIRECTION LOCK · 2026-10-13 · v1.0

**Status: RATIFIED PRODUCT DIRECTION (user explicitly requested locking the redesign).**
**Implementation status: NOT implemented in current game.** This is the binding target for NEW development work, not a claim that the existing build follows it.
**Scope:** single-player browser first → beautiful, playable micro slice → regional command → national/imperial command → quality single-player/Steam → persistent multiplayer research.
**Product identity:** CONQUEST — DARK STRATEGIST (never Infinite Conquest).

> **Product promise:** Start as a small local commander; grow into a ruler of regions and countries within one persistent bounded world. Strategic responsibility grows; UI complexity does not.
>
> **Decision standard:** No system without a meaningful, visible choice for the player. First prove that conquering, defending, losing and recovering in ONE micro region is fun.

### Read this before editing game/design files
1. **00_DIRECTION_LOCK.md** (this file): authority, guardrails, scope, decision taxonomy.
2. **01_GAMEPLAY_CONTRACT.md**: mechanics, map, three sovereignties, basic inputs, command escalation.
3. **02_ART_AND_UX.md**: actual target experience and nonnegotiable device design.
4. **03_EXECUTION_AND_ACCEPTANCE.md**: build sequence, verification, stop rules, ownership.
5. Earlier **docs/strategy**, **docs/GAME_DESIGN.md**, **docs/ART_DIRECTION.md**, **docs/DEVELOPMENT_STATE.md**, and the 377-sector build are **historical baseline/prototype evidence**, not permission to supersede this decision.

### Decision classes
- **LOCKED:** product constraint or direction ratified here; can change only after an explicit user decision, documented rationale and revision.
- **PROVISIONAL:** recommended implementation hypothesis pending gameplay/art tests. Never advertise as user-confirmed.
- **DEFERRED:** not in the first playable slice; do not build unless a gate is reached.
- **OBSOLETE:** incompatible historic proposal; retain as historical material but do not implement in vNext.

### Locked product constraints
| Area | Locked decision |
| --- | --- |
| World continuity | Endless, saved world; no forced game-over, 20-minute match, periodic map wipe, expansion of geographical boundary during a campaign, or victory screen that terminates play. |
| Three command scales | MICRO settlements → REGIONAL territories/armies → MACRO countries/empires. Empire is not a fourth rank. |
| Actual scale progression | Higher levels change legal orders, authority, decision horizon and map semantics; they are NOT only zoom or camera labels. |
| Promotion | Eligible players choose WHEN to ascend. The trigger is territorial/military accomplishment; promotion never creates an army or confiscates conquered territory. |
| After promotion | Day-to-day tactical village control is delegated; player commands current higher rank while local owners/garrisons remain actual state. Zooming in is not re-enabling lower-rank micromanagement. |
| Nested sovereignty | Separate village owner, regional sovereign and national sovereign. Any two/three may be different factions until distinct military objectives change that slot. |
| No magical outcomes | No free troops or teleporting; no soldiers in two armies; no instant flipping a national map because a village was captured. |
| Power imbalance | Empires genuinely overpower small opponents when they can deploy force. Opportunities arise from finite troops, time, routes, fronts and mistakes, not scripted rubber-banding. |
| No army betrayal | No loyalty meter, spontaneous mutiny, defection or allegiance transfer. Homeland civilian resistance/uprisings using finite manpower are permitted and are a separate system. |
| Game feel | Top-down, alive, landscape-first, premium dark tactical cartography, moving formations, crisp causal feedback, minimal persistent UI. |
| Interaction | Same compact input language across levels: choose source → target for attack or legal reinforcement. Conditional troop commitment when needed. |
| Primary platform | Real browser-playable single-player (iPhone and Mac), no mandatory online service for normal offline-capable solo mode; Steam and shared-world multiplayer later. |
| Current priority | MICRO gameplay-and-art vertical slice. Do not expand old giant map or add economic/diplomatic dashboards as substitutes for fun. |
| Production discipline | Preserve runnable legacy build and saved campaigns. Test game rules headlessly AND user experience on real hardware; no declaring fun from simulation passing. |

### Ratified creative direction versus provisional numbers
**Direction accepted:** one highly crafted, interesting MICRO theatre first, about 10–12 locations, 2 initial holdings, a few genuine rivals, auto bounded recruitment, real travel/defence and at least two strategic route choices.

**Still provisional:** number and names of locations, number of AI factions, unit counts/second, % force sent by default, promotion threshold, combat multipliers, precise colors, engine implementation, art final approval and balance. These are TESTABLE design values, not frozen eternal rules.

### Legacy reconciliation / explicit supersession
1. The current `src/game/view.ts` Tactical/Operational/Strategic modes are camera/information levels only; `src/game/types.ts` has a single territory-owner slot. This does **not** satisfy nested sovereignty or command-rank design. Preserve the working prototype and build a separate vNext slice.
2. Earlier 12 regions × 12 villages × 3 nations (144 villages) is one simulation scenario, **not a required shape** for the shipped world. Earlier 6×2 region rectangles are not the new art target.
3. Earlier **two orders per week** conflicts with the preferred immediate real-time experience; **OBSOLETE for the MICRO direction**. Real-time pacing and optional pause are retained; specific speed remains provisional.
4. Earlier **12/12 village capture promotion** is a test case, **not a locked threshold**. Promote from meaningful territorial/strategic accomplishments, only by explicit choice and with a real regional military confrontation.
5. A mandatory decline/demotion on military loss is not yet resolved: preserve faction identity, rank history, agency and recoverability. Never create exploitative grinding or wipe old rights merely because a title is lost.
6. Fictional "rebels automatically conquer after unrest timer" and AI-only free reserve troops contradict the user constraints. Voluntary, finite-material resistance for any faction is allowed.
7. Current old art bible's serif/parchment/war-room chrome is no longer the primary visual brief. NEW visual target is polished, modern, top-down geographic tactics with readable territories, sparse chrome and restrained motion.
8. The older 377-hex world is a **valuable engineering and gameplay laboratory**, not the required new MICRO map. Do not continue embellishing it instead of delivering a good first battlefield.
9. More source code, successful CI or a valid deployment is **not** evidence that actual play feels good.

### Product boundaries / scope firewall
**Now**: MICRO region, source→target attack/reinforce, legible formation movement, real terrain/roads, bounded recruitment, 2–3 AI rivals as test hypothesis, conquest/defence/resistance, saves, strong tactile audio-visual feedback, desktop/mobile.

**After MICRO fun gate**: true regional sovereignty, regional formation routes and promotion, then national campaigns with country sovereignty.

**Later**: persistent real-player shared world, server-authoritative combat, offline-player rules, Steam support, leaderboards, complex diplomacy/economy only if demonstrated necessary.

### A choice must be recorded, not smuggled
If developers face a fork, record: (a) player-visible decision created, (b) two viable options, (c) cheaper test, (d) accepted gate/result; default to the less complex alternative. Escalate to owner for any alteration to LOCKED points.

### Source of truth and versioning
This set of 4 docs is the **vNext design source of truth**. Earlier docs stay in place as historical specs and current-engine documentation. Do not mark a feature shipped until linked to a runnable build, tests and a user playtest result. Each future change uses a date, decision owner and rationale; no hidden scope creep.

### First concrete objective
**P0-MICRO-001: One beautiful living tactical region.** An honest playable 10–20-minute micro conquest session should offer meaningful attack, reinforcement, counterattack and the possibility of rebuilding without a maze of buttons. Its save remains playable beyond any testing window.
