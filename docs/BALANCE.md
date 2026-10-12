# Balance notebook — live hypotheses

The following numbers are tunable **hypotheses**, not settled truth.

| Parameter | Alpha starting point | Player experience to measure |
|---|---|---|
| Map | 117 cells | Too large on phone? Too much clicking? |
| Starting capital | 57 soldiers | Does the first move feel meaningful? |
| Neighbor soldiers | 19 | Does early expansion flow? |
| Neutral defenders | 7–17 | Is expansion fun without being free? |
| Send fraction | 65%; Shift = 90% | Is the tradeoff between advance and vulnerability readable? |
| March duration | 0.95 sec | Do attacks have anticipation without dragging? |
| Base troop production | 0.65–1.35 / sec | Are sectors meaningful after five minutes? |
| Highland defense | 1.3× | Does geography affect attack timing? |
| Capital defense | 1.5× | Is a capital a recognizably harder target? |
| Passive reserves | 0.65 / sec | Does comeback pacing feel fair? |
| Homeless/occupied bonus | +2.3 / +1.25 per sec | Is waiting after defeat boring or tense? |
| Revolt threshold | 45 troops, 6 sec cooldown | Is a strategic comeback realistically possible? |
| AI deliberation | ~0.75–1.52 sec | Does the map feel alive without overwhelming the player? |

## Guardrails

- No faction shall permanently disappear from simulation data.
- No AI cheats, secret combat modifiers or hidden spawn rules.
- Neutral sectors are not a late-game objective: contest and reconquest are.
- If sessions stall, improve frontline reasoning and strategic feedback before adding resources.

## Iteration rubric

Record median time to first capture, time to first border clash, captures/minute, length of landless interval, successful revolts per session and 'would play again' rating. Change **one family of constants at a time**; run tests; compare notes.
