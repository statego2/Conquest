# CONQUEST — DARK STRATEGIST
## Gameplay contract vNext · 2026-10-13
**Authority:** governed by [00_DIRECTION_LOCK.md](00_DIRECTION_LOCK.md). Contract = locked invariants + explicitly provisional design hypotheses. Implementation remains separate from the current 377-sector experiment.

## A. Define the player's fantasy
The world is not a board of equal hexes. A player starts with a tiny, credible physical holding, makes fast consequential military decisions, gets punished for mistakes, can rebuild after loss, and can voluntarily graduate into regional and national command without an exploding interface.

**Core loop (every level):**
> Observe geography and rival force → choose an origin → choose a destination → choose/confirm commitment if needed → troops move along a valid route → attack or support resolves using finite troops → ownership/defense changes → opponents react → repeat.

Every useful new rule must enrich at least one visible trade-off: **where, when, how much, which objective, what to hold, which risk to accept**.

## B. Separation of map, political title, camera and authority
These four things must NEVER be one variable:
1. **Geography** is one fixed bounded coordinate world with rivers, roads, physical passages, crossings and settlements. It doesn't re-create when zooming or ranking up.
2. **Sovereignty** is who controls one specific political slot (settlement, region seat/command, national seat/command). Slots change only through legal substantive operations.
3. **View/camera** is the user's graphical zoom or abstraction lens. Inspecting another scale does not give command rights.
4. **Command rank** is what orders a faction's player may issue. An unlocked rank is not a guarantee of current territorial sovereignty.

We require **3 actual sovereignty records**: `settlement.localOwner`, `region.sovereign`, `country.sovereign`.

### Political examples / invariants
- Green player owns Bridge Village. Crimson faction is sovereign of its region and Blue faction is sovereign of the country: all simultaneously valid.
- Player conquers the regional fortress with physically committed force → `region.sovereign` changes; **every village owner and the national sovereign remain unchanged**.
- A nation loses its capital → national sovereignty changes on a real national campaign outcome; other contested regional seats and local village owners **do not flip**.
- Controlling a settlement doesn't imply a garrison loyal to the regional/country sovereign will defect. Conquering regional/national seat doesn't convert enemy troops into the conqueror's troops.
- **Sovereignty slots are not recursively inherited ownership.** Income, command reach and requisition rights may vary by slot, but cannot double-spend the same manpower.

### Initial vNext conceptual types (reference, not enforced implementation)
```ts
type FactionId = string;
type Rank = "micro" | "regional" | "national";
type NodeId = string;
type Location = { x: number; y: number };

interface Settlement {
  id: NodeId; regionId: NodeId; position: Location;
  localOwner: FactionId | null;
  localGarrisonIds: NodeId[]; // physical troop stacks, not duplicated counters
  manpowerPoolId: NodeId;
  terrainTags: Array<"open"|"forest"|"ridge"|"bridge"|"pass"|"fort">;
}
interface Region {
  id: NodeId; countryId: NodeId;
  seatSettlementId: NodeId; sovereign: FactionId | null;
  settlementIds: NodeId[]; adjacencyIds: NodeId[];
  defenseForceIds: NodeId[];
}
interface Country {
  id: NodeId; capitalRegionId: NodeId; sovereign: FactionId | null;
  regionIds: NodeId[]; defenseForceIds: NodeId[];
}
interface Force {
  id: NodeId; owner: FactionId; size: number; // integer, >=0
  posture: "mobile" | "garrison" | "inTransit";
  rank: Rank; at: NodeId | null;
  route?: NodeId[]; eta?: number;
}
interface Faction {
  id: FactionId; homelandSettlementId: NodeId;
  highestUnlockedRank: Rank;
  availableCommandRank: Rank; // based on actual rights; rules to recover unresolved
  resistancePoolId: NodeId; // bounded, debited from local available manpower
}
```
The exact structure, aliases and map data format are **PROVISIONAL**. What is LOCKED is the explicit separation of actors, unique physical troop IDs and sovereign slots.

## C. Level I — MICRO: build this FIRST

### Physical layout (PROVISIONAL but actionable)
- One authored playtest region, 10–12 clear strategic settlements; 2 starting player nodes; 2–3 AI rivals and optional independent neutral nodes.
- Geography: winding river, 1–2 defensible bridges, a mountain ridge and narrow pass, at least two alternative military paths, a defended regional seat and roads that connect meaningful objectives.
- At least 3 strategically different settlement functions in test terrain: production basin (recover manpower faster), bridge/pass control (affects legal route/response), fort (defense bonus). No upgrade/build menu needed.
- Irregular location silhouettes, not uniform same-size hex tile cluster. Hidden logical sectors or adjacency graph may exist in the engine.
- Hand-curated fixed scenario seed for the first playtest; additional symmetric seeds for balance later.

### Order flow
1. Tap **your own troop/settlement**; source is visibly selected.
2. Tap **enemy valid destination** → ATTACK forecast shown if material uncertainty or destructive commitment; confirm in one simple contextual action or send immediately with clear undo/cancel BEFORE dispatch.
3. Tap **your own valid destination** → REINFORCE through actual allied road/route; distance means travel time. Prefer same source-target gesture for attacks/support rather than permanent SEND SUPPORT mode.
4. Make fractions contextual. A 65% default is **a test constant**, not locked. Candidate: compact 35/65/90 selector shown only with a selected force. The player can preserve a defensive reserve.
5. Bad targets convey a short reason: no legal route, insufficient force, no troops, wrong command tier. No silent failed click.
6. After dispatch, `source.size` falls immediately and the march has a unique ID; active forces are not duplicated on arrival. Hostile reinforcement can alter combat forecast.

### Combat/economy constraints
- Continuous real-time strategic time (pause available offline); units actually travel; no fixed two-actions-per-week or manual 'next turn' spam.
- Deterministic seeded outcomes desirable for reproduction; terrain/ridgeline, garrison and numbers matter; forecast conveys approximate comparison, not a misleading guaranteed win. Hidden opponent information may eventually require uncertainty.
- Recruitment is automatically bounded by local finite recoverable manpower and transparent capacity/throughput. No first-slice visible cash, wood, food, tech trees or unit upgrade menus.
- Attackers who win with survivors may seize target. Casualties and surviving defenders accounted for; no self-cloning. Defensive occupation requires real committed force; a successful conquest can be retaken.
- AI issues the same legal command schema and pays the same costs. 'Harder AI' should mean better planning, not invisibly more soldiers.
- An undefended/landless faction retains a legally playable homeland resistance state with limited manpower preparation and a voluntary revolt. Failed revolt consumes real resources, then rebuilding continues; no scripted free comeback.

### Required experience sequence
First screen: at least one understandable potential attack and one relevant defensive concern, in view, without instruction panels.
Within a short initial test window: first legal attack, animated transit, impactful capture, AI reaction, an opportunity for reinforcement/defense, visible consequences.
Playtest must additionally provide deliberate forced-defeat fixture to test recovery without waiting for a full loss organically.

### Why this is not just another .io map
Conquest does not derive depth from sheer tile count or a scale-only camera.
Unique choices derive from **physical topography + travel time + finite force + occupied homeland + future command rights**. The first 12 nodes must visibly support different viable strategies.

## D. Level II — REGIONAL COMMAND (after MICRO gate)
**Unlocking a rank is not auto-conquest.** The player qualifies by demonstrated settlement influence and access to a regional seat, taps optional **Promote**, then must win/defend a **real distinct** regional seat battle to secure the regional sovereignty slot. Exact threshold **PROVISIONAL**: 60–70% weighted strategic control + access rather than requiring 12/12 as a universal rule.

- Player commands finite regional mobile armies and regional strongholds/fronts; regional assaults are ordered between **actual adjacent theatres** or valid paths.
- Local village ownership persists (sometimes by enemies), and local skirmishes continue by AI/delegated rules. Player does not regain village micromanagement at Level II.
- Regional command army must come from explicitly transferred/mobilized local forces and manpower: **no free army multiplication at rank-up**. Consolidation creates a single force only by subtracting its source stacks.
- Regional income and route privileges reflect real infrastructure/control with unique accounting. Crossing rival-held pockets needs explicit legal pathing and perhaps risk; it is not automatically permitted or forbidden simply because the national map is one color.
- E.g. conquer Green Coast region after taking local holdings, but the national sovereign can counterattack with troops it moves from elsewhere. An overstretched empire can lose; a prepared empire can hold.

### Level II demonstration of distinct gameplay
Human players can explain a **regional** decision that doesn't exist in MICRO: preserve a rear theatre, allocate an army across two fronts, choose a supply corridor or delay a siege until another enemy commits troops elsewhere.

## E. Level III — COUNTRIES / EMPIRES (after REGIONAL gate)
- Promotion again optional after **actual regional military foothold** (threshold provisional).
- The player commits existing national-scale formations to multi-phase front operations; distinct national command/capital campaign changes `country.sovereign` only after actual contested force resolution.
- A country's conquered title doesn't flip all regional and village titles or create free reserve troops.
- 'Empire' is political control of **multiple countries** at same third command rank, not a fourth UI.
- Must remain possible to play indefinitely at maximum rank even after dominating the map. New emergent challenges come from finite force geography and recovering rivals, never mandatory resets.

### National design gate
**Not acceptable**: three giant country tiles and a single 'attack capital' button with automatic all-map recoloring. At least two meaningful alternative campaign choices are needed.

## F. Persistence, loss, sovereignty and re-entry
- Unique faction homeland identity/capital continues even during enemy ownership. Resistance is separate from soldier allegiance and NEVER changes an occupier's existing troops without a battle.
- Losing land does not force a reset or erase historical unlocked achievements; ability to issue higher-rank orders depends on legal current forces/footholds. Exact post-loss rank access is **OPEN** and requires a specific gameplay test (avoid replaying 12-village grind).
- Strong occupiers have a real advantage if they maintain garrisons; there is **no promise** every attempt can succeed against overwhelming defense.
- Reserve/manpower pools recover only at bounded rates and are shared/allocated so the same recruit isn't simultaneously used by occupier and underground resistance.
- "Total domination" is a continuing political state, not the conclusion of a match.

## G. Systems contracts (build-time invariants)
1. All IDs uniquely identify geographic nodes, factions, and forces.
2. All troop balances are nonnegative integers. Never duplicate soldiers when sending, saving, promoting or merging.
3. Movement consumes force at the source now; it arrives only after legal route travel and may be intercepted according to known rules.
4. Every map command validates ownership/command authority, legal path, required forces and game state **in engine code** (not only UI).
5. Each sovereignty slot changes only after a corresponding legal contested action.
6. Save/load reproduces the same ownership, manpower, forces, routes and simulation state including RNG seed; old incompatible topology does not silently overwrite saved vNext games.
7. AI commands pass through the identical validation function as human commands.
8. Multi-layer zoom must not mutate ownership, physical terrain, troops or allowed command rank.
9. Rendering does not decide combat outcomes; simulation owns rules.
10. Pause freezes single-player simulation and AI and does not make background hidden progress.

## H. Decisions we will explicitly TEST, not pre-approve as permanent
| Decision | Candidate A | Candidate B | Default research path |
|---|---|---|---|
| Micro advancement | Own all local settlements | Own weighted strategic threshold + valid siege route | B unless playtest shows confusion/exploit |
| Order commitment | default 65%, long-press adjust | 35/65/90 contextual compact strip | A on mobile, compare |
| Tempo | continuous real-time + pause | real-time with slow/reaction assist | A, test loss of control |
| Combat forecast | clear approximate outcome | exact deterministic prediction | A, report reinforcements as uncertainty |
| Post-loss command | preserve highest unlocked with resistance command | lower available rank with separate fast-track | Both in total-defeat fixture |
| Map node count | 10 | 12 | Choose for strategic geography/readability |
| Local AI | opportunist simple rivals | aggressive/defensive asymmetric personalities | A for first build, then B |
| Fully unified world | simulated regions outside Micro slice | standalone Micro scenario with future same schema | B for prototype, no fake claim the macro world is already running |

## I. Explicitly out of MICRO scope
Diplomacy tree; loyalty/defections; hidden player buffs; tax/wood/food/gold dashboards; inventory; technology tree; 377-location redecoration project; multiplayer backend; online ranking; Steamworks; faction politics menus; fourth command scale; lore encyclopedia.

**Design gate:** Every added element must fit inside a one-sentence action story: **I saw an opening, committed troops, lived with the consequence, and can respond.**
