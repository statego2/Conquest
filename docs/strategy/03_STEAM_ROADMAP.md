# Conquest — Concept to Steam roadmap
Updated: 2026-10-12. Milestone sequence, not a delivery-date promise.

## Dependency and scope rule
Prove the endless single-player concept before scaling production.
Milestones have exit evidence, not assumed completion dates.
Do not impose a timed ending to simplify balancing or leaderboard design.

| Stage | Deliverable | Exit evidence | Lead role |
|---|---|---|---|
| 0 Direction | Vision, concept spec, test protocol | Endless play and comeback constraints explicit | Product |
| 1 Playable concept | Small browser world, AI, occupation, uprising, persistence | Full lifecycle playable in one continuing save | Engineering + Gameplay |
| 2 Concept validation | Recorded human sessions and targeted fixes | Players understand choices and voluntarily continue | Gameplay + QA |
| 3 Vertical slice | One polished world with dark strategist art, sound and onboarding | Complete representative experience | Art/UX + Engineering |
| 4 Production foundation | Stable modules, save versioning, reproducible builds, early desktop packaging test | Save compatibility and target desktop viability demonstrated | Engineering |
| 5 Alpha | Intended core systems complete, basic settings and content | No missing essential loop; long-session checks pass | Product + QA |
| 6 Public demo and store | Representative demo, actual gameplay trailer, Steam page | Independent players can install and understand it | Release + UX |
| 7 Beta | Balance, performance, accessibility and online score validation | No known blocking crashes, save loss or major score exploit | QA + Engineering |
| 8 Release candidate | Reviewed build/store, final assets, support and rollback plan | Installation/release checklist passed on promised platforms | Release |
| 9 Steam launch | Published game and monitored support | Hotfix capability and clear issue triage | Release + Engineering |
| 10 Ongoing evolution | Evidence-led updates | Features selected from observed needs | Product |

## First implementation backlog
P0: inspect existing repository and identify playable build versus art preview.
P0: build faction lifecycle without permanent player elimination.
P0: connect movement, recruitment, battle, occupation and voluntary uprising.
P0: AI uses same lifecycle and can return.
P0: persistence, pause, restart only by deliberate user action.
P0: validate total loss and total dominance continuation.
P1: improve readability and eliminate inactive resistance waiting.
P1: run and record first human concept test.
Everything else waits for this evidence.

## Online leaderboard direction
Ordinary sandbox stays endless and playable offline.
Possible later rankings: fastest time to a voluntary milestone, achievement-based records, or a separate seeded challenge.
Ending a score submission must not end the sandbox.
Do not rank raw playtime or endlessly farmable wealth by default.
Separate incompatible rule versions and difficulties; validate ranked submissions.
The confirmed future ambition is a shared persistent multiplayer world. Leaderboards alone do not fulfil it. Real-time multiplayer requires a dedicated technical prototype and additional production milestones, described in 04_PERSISTENT_WORLD.md.

## Production and commercial work
After concept validation: define first-release content, supported systems, staffing/time budget and asset budget.
Test desktop packaging early, before committing to an engine migration.
Once the vertical slice represents the product: position the game, research comparables, decide price and prepare a store page/demo.
Maintain asset/audio licences and accurate store feature claims.
Prepare onboarding, settings, accessible labels, save recovery, performance targets based on measured target hardware, and an issue-reporting path.
Early Access is an optional product decision, not a substitute for a satisfying playable build.
Do not publish a fixed launch date before release readiness is credible.

## Steam administrative dependencies
Official Steam Direct information checked 2026-10-12:
- USD 100 fee per product.
- 30-day wait after app fee payment for initial releases.
- Public Coming Soon page for at least two weeks.
- Store page and build review before release.
Plan lead time and recheck current requirements before submission.
Source: https://partner.steamgames.com/steamdirect
Review: https://partner.steamgames.com/doc/store/review_process

## Change management
Each work item has owner, acceptance criteria, dependency and verification evidence.
Preserve other workstreams' changes; reconcile differing rule proposals before implementation.
Record confirmed user changes in 00_VISION.md, and propagate them to the spec and tests.
Current decision: endless play is core; the immediate objective is a concept test, not a Steam-scale production sprint.

