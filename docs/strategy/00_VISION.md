# Conquest — Product vision & decisions
Updated: 2026-10-12. Status: concept direction, not implemented gameplay.

## Read order
1. This vision.
2. [Concept prototype](01_CONCEPT_PROTOTYPE.md).
3. [Playtest protocol](02_PLAYTEST_PROTOCOL.md).
4. [Roadmap to Steam](03_STEAM_ROADMAP.md).
5. [Shared persistent world](04_PERSISTENT_WORLD.md).

## Confirmed direction
Conquest is a long-term strategy project. First prove the concept in a browser, single-player. Later deliver a Steam game whose long-term destination is a shared persistent world with real players building and losing empires; leaderboards support this world rather than replace multiplayer.
The player may continue the same world indefinitely by choice. There is NO mandatory timer, victory screen that stops simulation, forced reset, or permanent elimination after losing the last province.
Conquest, occupation, resistance and repeated reconquest apply to player and AI.
Visual preference: darker, dark strategist / war-room atmosphere, while preserving readability.

## Correction to the earlier conversational proposal
The proposed compulsory 20–30-minute match and definitive defeat are withdrawn.
A 20–30-minute playtest is only an observation window. The save and simulation must continue afterward.
Global domination is an achievement/state of the world, not a command to end the session.
Optional bounded challenges may exist later as a separate mode; they must not redefine the core sandbox.

## Core promise
Build power, decide how far to expand, hold what you take, survive loss, and choose when to return.
The player owns their ambition: regional dominance, unification, survival, restoration, or simply observing and intervening in a changing world.

## Design pillars
- Meaningful timing: attack, reinforce, consolidate or organise resistance.
- Persistent political identity: ownership changes; homeland identity can survive.
- Legible consequences: show why conquest succeeds and why occupation becomes unstable.
- Recovery with agency: being dispossessed opens decisions, not a passive waiting screen.
- Sustainable long play: bounded growth, useful delegation later, reliable saves.
- Depth through interacting rules before adding systems.

## Guardrails
No free infinite troops. Resistance uses a finite local manpower pool and recovery time.
No arbitrary collapse solely because the player is winning. Instability must have visible causes and counterplay.
No forced revolts on a timer in a well-managed province.
No permanent erasure of the player faction in the first concept.
No mandatory online connection for ordinary single-player.
No claim that the game is fun or balanced until humans test it.

## Authority and coordination
User-confirmed constraints above outrank tentative numbers below and earlier conversational suggestions.
Implementation choices and numeric defaults remain hypotheses.
Gameplay owns mechanics; engineering owns execution; art owns visual language; product reconciles trade-offs.
Use one shared milestone backlog. Review current repository work before changing interfaces or files owned by another workstream.
This documentation adds strategic direction; it does not assert control of separately running AI conversations.

## Current priority
One functioning, persistent conquest–occupation–revolt–reconquest loop.
Steam integration, large content libraries and PvP are later milestones.

## Confirmed future ambition — shared persistent world
User clarification 2026-10-12: a giant shared map, metaphorically like PlanetSide 2, where players join the same world, form empires, grow, fall and compete for first place. This is a future direction, not the initial prototype scope. Exact player counts, servers/shards and offline rules remain unconfirmed. No scheduled wipes are assumed.

