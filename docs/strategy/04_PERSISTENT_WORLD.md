# Conquest — Shared persistent world
Status: confirmed future direction; proposed mechanics and engineering below remain hypotheses.
Date: 2026-10-12

## Fantasy
A giant shared strategic map, metaphorically inspired by PlanetSide 2 persistence.
Real players enter the same world. Empires form, expand and collapse. Players can reach first place, lose territory and return.
The reference communicates shared-world ambition, not an FPS requirement or a promise to match that game's scale.

## Now versus later
NOW: browser single-player concept with AI; validate expansion, occupation and comeback.
NEXT: polish and stabilise the simulation; verify reproducibility and saves.
LATER: a bounded multiplayer technical test, then a persistent closed alpha, then capacity expansion.
A small initial test world should exercise the same basic lifecycle without pretending to prove large-scale networking.

## Essential unresolved choices
- Does each player own a faction, join an empire, or command a subordinate territory? Initial hypothesis: one faction per player; alliances later.
- What happens while an owner is offline? Unrestricted overnight conquest can make participation exhausting.
- How do newcomers obtain viable territory in an old world?
- What permits a defeated player to recover without rewarding deliberate defeat?
- How is top position measured without permanently entrenching the oldest player?
- Can one global world meet latency/capacity requirements, or are multiple persistent worlds necessary?
Do not silently decide these questions or promise unlimited concurrent users.

## Prototype offline policies before choosing
Compare reduced offline losses, delegated defence with notifications, and declared vulnerability windows.
Each policy has costs: immunity exploits, weaker persistence, scheduling friction or domination by highly active groups.
Test with ordinary play schedules. No policy is selected yet.
Separate player-selected pause in single-player from a server world that cannot pause for one participant.

## Dominance without a forced reset
First place is a live political status, not the end of the world.
Expansion carries visible upkeep, travel/response costs and occupation obligations.
Avoid opaque punishment for success.
Resistance and political cooperation may challenge empires through understandable actions.
New-player entry and abandoned territory need explicit rules before persistent launch.
Seasonal ranking snapshots may reset a scoreboard without erasing territory; world wipes require a separate explicit product decision.

## Future server architecture
Server-authoritative rules and resource validation. Clients submit commands, not final troop counts.
Authenticated player ownership; reject illegal, duplicated, out-of-order and excessive commands.
Persistent world snapshots plus command/event recovery; define crash recovery and backup restoration.
Interest-based state updates and measured tick/network budgets for a large map.
Load-test increasing concurrent connections and active factions; set advertised capacity from evidence.
Budget hosting, operations, abuse handling and moderation before public persistence.
Save schema and clean simulation boundaries now help, but do not constitute implemented multiplayer readiness.

## Milestones
M1: two real clients affect the same authoritative world correctly.
M2: 8–16 invited players as a provisional test cohort; reconnect, conflict and offline behaviour tested.
M3: persistent closed alpha; restart/recovery, newcomers and domination observed over days.
M4: measured capacity and operating budget; larger tests only after correctness.
M5: public shared-world release when operations, gameplay and retention justify it.
These are proposed test sizes, not confirmed final population limits or delivery commitments.

## Success evidence
A player can return after absence and understand events.
A newcomer has viable decisions.
A defeated player has meaningful recovery actions.
Dominance is satisfying without permanently excluding everyone else.
Multiple people can compete without having to be online continuously.
Server restart does not erase the world or duplicate resources.

## Relationship to Steam
Decide after prototype evidence whether the first Steam release is single-player with multiplayer planned, or whether shared-world play is required for 1.0.
Do not advertise persistent multiplayer as available before it works.
Keep long-term architecture and product ambition aligned while preserving the small concept test now.

