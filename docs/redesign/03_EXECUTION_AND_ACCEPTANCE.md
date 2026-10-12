# CONQUEST — DARK STRATEGIST
## Execution roadmap, implementation tickets & acceptance gates · 2026-10-13
**Status:** ratified development ORDER and scope discipline; no fictitious delivery dates or claim of implemented features. Read [00_DIRECTION_LOCK.md](00_DIRECTION_LOCK.md) and [01_GAMEPLAY_CONTRACT.md](01_GAMEPLAY_CONTRACT.md) first.

## A. Production order: no scope reversal
1. D0 Decision baseline + archive/stabilize legacy demo.
2. D1 Core micro game loop in a small authored test region.
3. D2 Premium cartography, minimal interaction, tactical feedback.
4. D3 Headless rule validation + iPhone/desktop human gameplay validation.
5. D4 TRUE regional sovereignty/army layer and optional rank promotion.
6. D5 TRUE national sovereignty/army layer; empire as multi-country control.
7. D6 Full single-player production and desktop/Steam readiness.
8. D7 Small authoritative shared-world technical prototype; persistent PvP only when proven.

**Do not develop D4–D7 to conceal D1–D3 shortcomings.** Steam multiplayer is a long-term vision, not a promise for the next build. Remain one bounded world per campaign with no map-growing session.

## B. Work packages & exact testable outcomes

### D0 — Freeze/segregate known experimental world
**P0-DIR-001:** mark `docs/redesign/` as vNext product design source-of-truth; older docs describe history and/or legacy only.
**P0-ENG-001:** clean branch/feature isolation for MICRO vNext (do NOT overwrite current build without tested replacement).
**P0-ENG-002:** inventory reusable current code: `src/game/simulation.ts`, `ai.ts`, `tactics.ts`, `storage.ts`, `src/render/renderer.ts`, `src/main.ts`. Identify core behaviors to keep vs redraw; do not assume names match desired architecture.
**P0-SAVE-001:** document and preserve legacy local save contract; do not migrate old 377-sector saves into wholly different nodes without validated mapping. Prefer separate save namespace / explicit 'legacy world' access.

**Done:** legacy demo still runs; build and tests execute; vNext project boundary defined; no save-loss migration.

### D1 — MICRO core simulation and map (first playable)
**P0-WORLD-001 — authored theatre**
- Fixed, identifiable geographic region with 10–12 named holdings; organic road/river/ridge geometry. Two alternative viable paths, defended fort, meaningful production and one strategic crossing.
- Build deterministic geometry/path graph and physical-force model.
- Map is a single coherent piece of terrain, not a regularly tiled dashboard.

**P0-CORE-002 — game state / commands**
- Source → target attack and reinforcement on same input pattern.
- Force unique identity + troop subtraction on march launch, arrival after travel, combat/casualties, new owner if victory, visible real garrison.
- Auto recruitment bounded by finite local manpower. No instant replenishment exploit.
- Live real-time single-player sim with pause. Command legality is checked in headless engine.

**P0-CORE-003 — fair AI**
- 2–3 rival AI roles as provisional test; no AI-only soldier grant or secret combat multipliers.
- AI visibly defends, reinforces, attacks where possible. Avoid first session instant annihilation and passive AI freeze.

**P0-CORE-004 — fall, resistance, return**
- Permanent homeland affiliation remains while occupied; finite resistance preparations and voluntary rebellion; occupier may realistically defend and win.
- Defeat does not erase player save, lock input forever or send them to Game Over.

**P0-CORE-005 — persistence**
- Save/reload includes territory slots, army location/movement, manpower, RNG state, events/cooldowns and faction recovery.
- Continue the same session after a 10–20-minute observation window.

**Done:** One complete expansion → defense → loss/recovery loop can run without no-op states and without data duplication.

### D2 — art/game feel is PRIMARY work, not backlog decoration
**P0-ART-001 — unified premium 2D map.** Artist-author a visual target and implement it in live canvas: terrain relief, road/river/pass/settlement identity, unobscured labels, elegant selection.
**P0-ART-002 — troop/march/battle.** Formations at micro level, readable moving count, effects that communicate real losses and ownership changes.
**P0-UX-001 — zero-dashboard HUD.** Map area priority, contextual order strip, small rank indicator and rare CTA. Two location taps for orders; no permanent send-support toggle/menu.
**P0-UX-002 — touch performance.** Safe-area handling, portrait fallback, pan/pinch vs attack separation, desktop compatibility, zoom that never mutates command authority.
**P0-AUDIO-001 — understated sound.** Muted by default if browser policy requires; accessible toggle, no endless distracting loop.

**Done:** creator sees **actual working game** on iPhone and Mac and approves look and feel; no acceptance by a static beautiful mockup alone.

### D3 — micro design and balance validation
**P0-QA-001:** type-check/build; deterministic unit test suite for force conservation, path legalities, combat/outcomes, capped manpower, AI parity, total loss/revolt, save-load and long-run.
**P0-QA-002:** scripted A/B tests: bridge vs bypass, all-in assault vs held reserve, strong garrison vs exposed occupier, rebellion successful only in a plausible opening.
**P0-QA-003:** create 5–10 real human test sessions on working build. Ask players to act without coaching; log time-to-first-attack/support, wrong taps, passive stretches, why they won/lost, and whether they voluntarily kept playing.
**P0-QA-004:** creator-led iPhone Safari landscape visual/touch test and Mac browser test.

**Done:** a first encounter is understandable, meaningful and enjoyable by actual player evidence. '10000 ticks passed' alone does NOT pass this gate.

### D4 — REGION authority
**P1-RANK-001:** separate `village.localOwner`, `region.sovereign`, `country.sovereign` in actual persistent schema; tests for combinations.
**P1-RANK-002:** explicit optional promotion gate (threshold provisional) distinct from military conquest of regional seat.
**P1-RANK-003:** physical conversion of local committed forces into regional army/garrisons; no bonus spawn, teleport or stealing micro garrisons.
**P1-RANK-004:** regional AI plans fronts and counterattacks through physically traversable routes while delegated local AI remains active.
**P1-UI-001:** add semantic terrain/force zoom layer; NO new full-width management menu.

**Done:** player controls one mixed-owner region and makes 2 valid strategic choices at regional scale that cannot be trivially represented by one micro click. No local title flips as side effect.

### D5 — COUNTRY / EMPIRE authority
**P2-NAT-001:** multi-operation national campaigns and national-seat sovereignty; military forces and regions stay physically tracked.
**P2-NAT-002:** campaigns depend on real routes and available forces; counteroffensive, occupation, national homeland recovery tested.
**P2-NAT-003:** third semantic map scale/command, not an additional tech tree or dashboard.
**P2-NAT-004:** after global domination, time/events/resistance keep functioning.

**Done:** three active contiguous national theatres (initial hypothesis) yield meaningful larger-scale decisions and save/loss/return tests.

### D6 — full single-player / Steam
- Stable runtime, save compatibility and migrations, accessibility, graphics settings, audio, tutorial only if needed by observed failures, architecture/performance budget, distribution/desktop packaging.
- Only then meaningful store/demo plan and desktop/Steam evaluation. Release candidate must run unsupervised and show production-ready aesthetic/UX.

### D7 — optional persistent shared world R&D
- One server-authoritative deterministic state; two-client order conflicts; validate no hidden actor authority or unit cloning.
- Trial cohorts (e.g. 8–16) for offline-owner protection, new-player footholds, long-term dominance and collective factions.
- Persistent restart recovery and measured latency/compute costs; one infinite shared player world remains ambitious future, not scope accepted today.

## C. Non-negotiable test catalogue
| Test id | Fixture | Pass criteria |
| --- | --- | --- |
| TC-01 | Two neighboring settlements / known armies | Attack reduces source force immediately; visible march, real combat, correct capture/casualties |
| TC-02 | Two allied connected nodes | Reinforce legally transfers force; no duplicates |
| TC-03 | Enemy disconnected or impassable route | Same command rejected with understandable feedback; no resource mutations |
| TC-04 | River crossing vs mountainous bypass | Different travel/defense creates different rational strategic choice |
| TC-05 | Aggressive all-in vs cautious reserve | Exposed origin can be counterattacked; choices change outcomes |
| TC-06 | Fully garrisoned stronghold vs tiny army | Huge state remains strong; no catch-up cheat |
| TC-07 | Home capital occupied / rebellion pool | Voluntary uprising debits finite manpower; failure/retry legal; no instant cloning |
| TC-08 | AI and human symmetric initial conditions | Same path/combat/recruitment validator applies |
| TC-09 | Save mid-march and with resistance | Reload state and deterministic continuation are equivalent |
| TC-10 | 10,000 headless ticks | No invalid ownership, negative forces, overflow, frozen AI or runaway event history |
| TC-11 | At region promotion | Old holdings/forces preserved; new rank command rights; lower micro command blocked/delegated |
| TC-12 | Region conquered | Only regional title flips; villages/national title remain independently held |
| TC-13 | Nation conquered | Only national title flips after legal campaign; enemy regional/village troops not auto-converted |
| TC-14 | World 100% controlled | No compulsory ending/wipe; emergent resistance legal |
| TC-15 | Real iPhone landscape | Attack/support/pan/pinch/selection all work; readable and beautiful to creator |
| TC-16 | Mac browser | Same orders and meaningful map space; text and interactions work |

TC-11 through TC-14 are **later-stage gates**, never misrepresented as MICRO requirements already delivered.

## D. Minimal development architecture
```text
src/
  game/
    world-model/       # one persistent geographical + sovereign model
    commands/          # pure validate and apply: attack/support/promote/revolt
    movement/          # paths + transit + interception
    combat/            # deterministic accounting & terrain modifiers
    economy/           # finite manpower and optional production capacities
    ai/                # same command interface, no hidden shortcuts
    persistence/       # versioned save/snapshot; legacy isolation
    simulation/        # seeded fixed-tick step, no rendering dependencies
  map/
    geography/         # single authored region first; wider theatres later
    layers/            # terrain, settlements, troops, orders, strategic overlay
    camera/            # gestures and zoom; independent of authority
  ui/
    input/             # source/target gesture state machine
    context/           # contextual order info & rank notice
tests/
  unit/
  fixtures/
  integration/
e2e/
  mobile/
  desktop/
docs/redesign/         # binding vNext planning
```
This is a **target modular layout**, not a request to prematurely generate empty directories. Reuse good existing modules where sensible.

## E. Change control and owner approvals
**LOCKED rules**: only owner-approved change with dated ADR / design revision.  
**PROVISIONAL values**: game designer may alter between controlled playtest builds, record hypothesis, seed, observed outcome and rollback.  
**Developer implementation choice**: may evolve provided it meets source→target UX, invariants and build/test/review gates.  
**External AI roles**: use docs/redesign as source of truth and report changed paths/tests. No role may quietly overwrite another role's work; use separate branches/PRs with a single coordinator.  

Work must always communicate: **what was changed, where, what tests ran, what actual real-user testing happened, and what remains unproven**.

## F. Risk register / mitigation
| Risk | Sign | Countermeasure |
| --- | --- | --- |
| Design scope creep | new buttons/mechanics without proven micro fun | enforce D1–D3 gate and defer list |
| Art failure | geometry looks like a utilitarian dashboard | redraw authored high-quality living terrain first |
| Mobile UX failure | pan gesture mistaken for attack or tiny numbers | tap/tap source-target, actual Safari QA |
| Structural mismatch | promotion just camera zoom | distinct sovereignty & command authority tests |
| Snowball | idle income beats every real decision | constrained recruitment, real transit and garrison costs, many seeds |
| Rubber-band failure | big empire randomly collapses | physical fronts/reserves and predictable counters only |
| Failed recovery | occupied player has nothing legal to do | finite underground resistance state and active choices |
| Invalid older save | new layout silently replaces previous conquest | legacy isolation, documented compatibility, opt-in transfer only |
| Multiplayer complexity | unbounded server/network scope before fun | separate R&D gate after validated solo |

## G. STOP RULES / quality gates
1. **No new macro features** if MICRO first battle or reinforcement is not understandable.
2. **No map enlargement** if initial 10–12 nodes fail to create strategic choices.
3. **No permanent new HUD button** unless it fixes an observed interaction failure which contextual UI/gestures cannot solve.
4. **No game balance approval** without observed choices in both seeded simulation and human sessions.
5. **No claims of shipping/on-device success** until actual link/build and actual Safari testing verified.
6. **No silent rewrite of confirmed decisions**; update lock file with version and owner approval.
7. **No claim of finished project** when a task only updates plans.

## H. Immediate next developer handoff (one ticket, not 20 simultaneous features)
**P0-MICRO-001 — Deliver one beautiful, living tactical theatre**
- New isolated vNext playable path with 10–12 hand-designed meaningful locations.
- One river, two strategic route choices, a fortified seat, real army travel, bounded recruitment.
- Own source → enemy attack; own source → own location reinforcement. Contextual preview, real combat.
- At least two AI opponents legally move, expand and counterattack, same physical rules.
- Faction survives capture of last holding and can attempt finite-resource recovery.
- Auto persistence; phone landscape and desktop work; existing legacy campaign remains accessible.
- Unit tests and a reproducible example seed; real iPhone visual/gameplay acceptance outstanding until human checks it.

**Next step after this design-doc delivery:** build `P0-MICRO-001` as code in a feature branch, not more grand-strategy specifications.
