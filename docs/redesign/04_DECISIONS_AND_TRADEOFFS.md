# CONQUEST — DARK STRATEGIST
## ADR / Decision register · 2026-10-13 · v1.0

**Purpose:** prevent disagreement between historic specs, AI roles and developer implementations. This records the decision, rejected alternative, trade-off and verification. This file is subordinate to `00_DIRECTION_LOCK.md`.

| ID | Topic | Decision | Rejected or postponed | Why | Evidence needed / change rule |
| --- | --- | --- | --- | --- | --- |
| ADR-001 | Main identity | Conquest — Dark Strategist, minimalist strategy from village to empire | "Infinite Conquest", interface-first empire dashboard | Stable recognizable fantasy & coherent progression | LOCKED; owner revision only |
| ADR-002 | First deliverable | Small polished 10–12 location Micro experience | Adding 377 more territories, more map zooms, empire menus now | Test fun and beauty in smallest honest playable loop | LOCKED direction; count provisional |
| ADR-003 | Game tempo | Continuous real-time tactical simulation with pause | Two orders per week, hand-advance turn | A player should read/act/watch live consequences | LOCKED direction, tick rate provisional |
| ADR-004 | Input language | Select owned source → destination for attack OR reinforcement; small contextual commitment | Permanent send-support toggle, one full action menu per scale | Reduces cognitive load while preserving meaningful orders | LOCKED interaction language; exact touch flow provisional |
| ADR-005 | World geography | Fixed bounded world, no external border expansion during a save | Endless map reveal/growth, reset/seasonal territory wipe | Personal empires and history retain meaning | LOCKED; world size/seed geography provisional |
| ADR-006 | Real strategic scale | Three DISTINCT command scales and sovereignty slots | Three camera preset levels pretending to be three ranks | Growing power must change kind of decision | LOCKED; actual rank criteria provisional |
| ADR-007 | Nested ownership | Settlement/local owner separate from region and country sovereign | Auto-inherit entire province on village capture or vice versa | Makes smaller holders possible within larger contested command | LOCKED; political rights/benefits provisional |
| ADR-008 | Promotion | Player-triggered eligibility, no instant free armies/automatic conquest; lower micro delegated | Forced auto-zoom/progression, adding many permanent controls, converting enemies | Preserves ownership, integrity, progressive strategy | LOCKED trigger action; numeric unlock threshold provisional |
| ADR-009 | Recovery | Permanent homeland identity and finite material resistance, for AI and human | Eliminating a player, gifted revival, army betrayal/loyalty meter | Endless non-scripted comeback is core | LOCKED, preparation formula provisional |
| ADR-010 | Strong vs small | Actual strategic asymmetry based on logistics/commitment/tempo | Hidden buffs for weak faction, scripted punishment for empire | Learnable, fair outcomes; no implausible guaranteed comeback | LOCKED, tuning provisional |
| ADR-011 | Art | Premium Dark Tactical Cartography: organic top-down physical terrain + formations | Flat checkerboard, neon dashboard, parchment UI | Map must itself be desirable to stare at and read | LOCKED direction; palette/art style samples provisional |
| ADR-012 | Product platforms | Browser offline-capable solo/mobile+Mac now; Steam/shared online later | Multiplayer-first backend development | Reduce work before product/UX proof | LOCKED order; launch date not asserted |
| ADR-013 | Save migration | Maintain legacy playability; explicit version isolation | Silent topology remapping into vNext | Avoid data loss or duplicate armies | LOCKED safety contract |
| ADR-014 | UI area | Mostly playable map, conditional HUD with extremely few permanent controls | Persistent sidebars, panels, 100 buttons | Fast strategy, visual focus | LOCKED principle; ~80–90% target provisional |
| ADR-015 | Production test | Real iPhone gameplay/human enjoyment plus deterministic tests | Equating green CI with good game | Fun/readability cannot be inferred from simulator | LOCKED |

## Deliberately open (experiment, not design confusion)

### OPEN-A: Micro promotion threshold
**A:** control all local nodes → predictable but grindy, punishes selective strategic moves.
**B (preferred test):** weighted strategic asset control plus valid fortified seat access → more meaningful but needs clear HUD.
**Protocol:** identical map seed; playtester completes both; record decisions per capture and how well target is understood. Freeze threshold only after results. In both cases a valid distinct siege captures regional sovereignty.

### OPEN-B: Force allocation
**A:** 65% default and accessible on long-press.
**B:** unobtrusive 35/65/90 strip on selection.
**Protocol:** iPhone player tries an attack then reinforcement and explains how many troops are left in their original settlement; compare misclicks and comprehension. No always-visible troop management dashboard.

### OPEN-C: Aesthetic execution
**A:** painterly premium true top-down 2D.
**B:** restrained 2.5D miniatures over readable topography.
**Protocol:** same actual map/army counts at landscape phone scale; evaluate in-game clarity of formations, passes and selection, NOT isolated concept art. Retain geographic strategic intelligibility.

### OPEN-D: Post-defeat rank access
**A:** unlocked rank remembered; dedicated resistance channel, then recover high command if foothold permits.
**B:** available command scale contracts with actual territory and can return quickly without historical total replay.
**Protocol:** repeated loss/reconquest fixture; compare frequency of meaningful choices and time locked out. Do not enforce a grind to unlock twice or automatically 'delete' rank history.

### OPEN-E: Exact role of strategic location production
**A:** bridge/pass/fort affect movement and defense; production inferred automatically.
**B:** visible production/manpower tags on a few select nodes.
**Protocol:** player can explain choosing one village over another. Avoid 4+ kinds of resources until a decision absolutely needs them.

### OPEN-F: Wider world density / timescale
Use only numbers demonstrated by spatial legibility and simulation performance. A 10–12 node Micro prototype need not pretend full macro background war is simulated. At later scale, initialize full finite world geography per world creation; **never expand a running campaign outward**.

## Rejected implementation shortcuts
- "Rank II" is a zoomed-out cosmetic label over identical MICRO army order legality.
- National victory colors all villages and converts other factions' soldiers.
- 10k automated ticks = proof of fun.
- Procedural noise over hexes = final AAA art.
- Infinite troop cap without meaningful costs.
- Difficulty generated by unexplained AI-only reserves.
- Hard-to-see menus and 12 extra buttons justified as "strategic depth".
- 10–20 minute observation window = a match timer.
- Developing multiplayer hosting to postpone proving core loop.
- New player map that appears in any format but does not preserve the fixed campaign world.

## Change protocol
1. State original ADR, new observation (playtest / engineering constraints), proposed alternative and downsides.
2. Tag revision `owner-approved` or `provisional experimental`.
3. Update affected contracts/acceptance tests **together**.
4. Do not secretly change LOCKED decisions via a pull request unrelated to game design.
