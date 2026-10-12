# Conquest — Concept validation and iteration
Status: test plan. No playtest results have been collected by this document.

## Principle
Measure whether the concept creates decisions. Do not substitute simulation statistics for human enjoyment.
Observation windows are not match limits.
Never claim automated tests or play sessions were run without a build, procedure and recorded result.

## Build gates
1. Mechanics: conquest changes owner; recruitment conserves manpower; battles and uprisings resolve.
2. Continuity: losing all land and owning all land both leave the world playable.
3. Recovery: repeated revolt attempts are possible but cost actual resources.
4. Persistence: save during occupation and reload without losing reserves or duplicating forces.
5. Experience: humans understand consequences and voluntarily continue.

## Scripted scenarios
| Scenario | Procedure | Evidence sought |
|---|---|---|
| Expansion | Conquer an adjacent province; move most troops onward | Meaningful reward and visible exposure |
| Consolidation | Keep a strong garrison and stabilise | Occupation has usable counterplay |
| Opportunity | Occupier moves army away | Resistance can exploit a real opening |
| Failed revolt | Commit too few reserves | Loss is understandable; recovery remains possible |
| Repeat comeback | Lose, revolt, regain homeland, lose again | Persistent identity through multiple cycles |
| Total loss | Lose last province | Active resistance UI, no forced reset |
| Total dominance | Take every province | Simulation continues; no mandatory ending |
| Save/load | Save during movement and underground recruitment | Equivalent state after reload |
| Long session | Run at least 10,000 simulation ticks, then resume manually | No runaway values, history growth or frozen AI |

Long-session tick count is a provisional test budget, not proof of indefinite stability.
Inspect bounds and resource conservation as well as observed performance.

## Human sessions
Begin with the creator, then 5–10 external testers when controls are usable.
Observe the first 20–30 minutes without leading explanations; allow continuation for as long as desired.
Ask:
- What were you trying to achieve?
- Which decision changed your situation?
- When did you have nothing worthwhile to do?
- Did occupation or resistance feel unfair? Why?
- Would you continue this world? What would you try next?

## Record per session
Build/commit, scenario seed, tester familiarity, elapsed play time, faction changes, revolt attempts, longest inactive period, confusion points, voluntary continuation, quoted feedback with permission.
Use anonymous tester labels. Record only needed gameplay data.

## Balance diagnostics
Track time to first conquest, territory concentration, upkeep/income, army growth, revolt preparation time, successful versus failed revolts, and time spent dispossessed.
Compare several seeds and strategies. A high revolt rate is not automatically good.
Specifically try intentional surrender, repeated free recruitment, undefended expansion and passive turtling.
AI should not receive hidden advantages unless difficulty modifiers are explicit.

## Decision after each iteration
Keep: players can explain choices and want to continue.
Adjust: specific pacing, clarity or numeric problem blocks an otherwise engaging loop.
Redesign: repeated sessions show the main loop is passive or one strategy dominates regardless of situation.
Change one major hypothesis at a time; retain reproducible scenarios.

## Results log
| Build | Scenario | Observation | Decision | Next check |
|---|---|---|---|---|
| Not run | — | No gameplay execution performed for this documentation task | Build the concept | Validate lifecycle first |

