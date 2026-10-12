# Game design document — Alpha 0.1

## Session loop

**Observe → choose source → send troops → watch arrival and combat → adapt → repeat.** AI nations expand during the player's decisions. A captured capital continues to show its original flag; the player may later trigger a comeback.

## World

- 13 × 9 hex map: **117 connected sectors**.
- Five factions: player and four AI powers, each with a permanent homeland capital.
- Neutral sectors offer early growth; land ownership automatically generates soldiers.
- Terrain: lowlands 1.0× defense, fertile 1.0× defense, highlands 1.3×, citadels 1.5×.

## Orders

- Select a friendly hex and then one of its adjacent hexes: launch a 65% march (90% with Shift).
- All marches have fixed duration in this prototype, approximately 0.95 simulation seconds.
- Friendly destination: reinforcement. Other destination: battle (attacker must exceed adjusted defense).
- Reserves: accumulate passively even without territories; mobilize to selected friendly sector at 15+ reserves.
- Uprising: when homeland is occupied, 45+ reserves and cooldown permits a direct attack on the homeland. Reserves are spent even if the uprising fails.
- AI has exactly the same combat, mobilization and uprising interfaces.

## Why this is a game, not a simulation dashboard

The player must decide *where* to expand, *when* to overcommit, *where* to reinforce, and *when* to launch the rebellion. AI adds urgency, expanding while the player acts. An attack has travel time: troop positions are not instantly transferred. Territory count, resistance and armies are readable without opening additional menus.

## Alpha limits

This is a **playable first experiment**, not a validated final balance model. The current AI is a greedy opportunist rather than a grand strategist. Occupied-sector unrest is visible in state and future-ready but does not yet independently spawn uprisings. No multiplayer, authentication, centralized scores or Steam SDK.

## Next playtest

Have a new player attempt: (1) capture three neutral regions, (2) repel a hostile assault, (3) lose the homeland and eventually reclaim it, (4) point out the UI's most confusing element. Record time-to-first-capture, successful attacks per minute, failed attacks per minute, homecoming attempts, and subjective fun rating / 10.
