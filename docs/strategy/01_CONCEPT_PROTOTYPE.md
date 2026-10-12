# Conquest — First concept specification
Status: proposed implementation brief. Numeric values are provisional.

## Experiment
Can expansion, occupation and choosing when to revolt create satisfying decisions in an indefinitely continuing world?

## Small but complete scope
One fictional connected map, initially 12 provinces and 4 factions including the player.
One home province per faction, permanent faction identity, visible ownership and garrison.
Real-time simulation with pause and speed controls as an initial hypothesis.
A small map limits production effort, not session duration.
Use existing game architecture if present; do not rewrite working systems to match this proposal without inspection.

## Minimum player actions
Select a province; inspect owner, homeland, forces, income and resistance.
Recruit using money and finite manpower.
Send a selected quantity of troops to an adjacent province.
Reinforce or attack, with visible travel progress.
Consolidate occupation through a local stance.
While dispossessed: choose concealment/recruitment stance and choose when to launch an uprising.
Pause, change speed, save, load and start a separate new world deliberately.

## Faction lifecycle
Sovereign -> partially occupied -> dispossessed -> uprising -> sovereign again.
Losing all provinces does not remove the faction or open a forced game-over screen.
A failed uprising consumes committed forces; surviving reserves and homeland identity persist.
Repeated attempts remain possible after manpower recovers, subject to meaningful cost.
AI follows the same resource and eligibility rules.

## First-pass rules
A province tracks owner, homelandFaction, garrison, civilian/manpower pool and resistance readiness.
A faction tracks treasury, field armies, reserve organisation and its home province.
Ownership and homeland identity are separate fields.
Recruitment transfers manpower into troops and spends funds; it must not duplicate population.
Battle losses remove troops. Define deterministic combat and tie resolution before implementation.
Movement has duration so a weakened province creates a readable opportunity.
Occupation reduces productive income initially. A visible garrison requirement and local stance affect resistance organisation.
A dispossessed faction can organise local recruits without owning taxable territory; this is a separate, capped, manpower-limited path.
Concealment preserves reserves more safely but recruits slowly. Mobilisation recruits faster but exposes readiness to the occupier. These are hypotheses to test, not final balance.
Launching a revolt deploys only selected, already recruited reserves, then resolves a normal contest for the province.
No conversion of all civilians into an army on a single free click.

## Sustainable endless play
Manpower replenishment saturates at a local cap; troop upkeep constrains military accumulation.
Tune treasury growth or spending opportunities after measuring long-session inflation.
Limit retained event history; summarise older events so memory use does not grow without bound.
Dominating the full map keeps simulation, saves and resistance decisions available.
A stable world is allowed. Do not manufacture inevitable collapse to force drama.
If domination becomes boring, test additional voluntary ambitions and systemic pressures before adding compulsory resets.
Save/load must preserve occupied homeland, reserves, movement and simulation/random state.

## Architecture boundaries
Simulation must not depend on rendering or Steam.
Keep rules, AI, UI, scenario data, balance configuration and platform adapters separable.
Use a fixed simulation step and seeded randomness if randomness is needed.
Browser persistence needs a versioned save schema. Later desktop and Steam services attach through adapters.
Prefer existing repository conventions; these boundaries do not mandate a new engine or several frameworks.

## Not in this experiment
PvP networking, Steam API, monetisation, technology trees, campaign narrative, complex diplomacy, dozens of unit types, historical world map.
Art should communicate faction, ownership, garrison, homeland and uprising without relying on colour alone.

## Acceptance
A human can play expansion, occupation, loss of all land and recovery in the same save.
The world continues past any observation window and after full-map conquest.
AI can lose and regain its homeland.
No troops or money appear from an unintended duplication exploit.
There is at least one meaningful action while dispossessed.
A saved world resumes the same strategic situation.

