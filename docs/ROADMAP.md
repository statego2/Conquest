# Roadmap — progressive game delivery

## Level 1 · Browser solo (current)

- [x] Define philosophy and game design pillars.
- [x] Separate engine, AI, renderer, UI, docs and tests.
- [x] First playable 117-hex theater, five factions, neutral conquest and troop marches.
- [x] Permanent capitals / comeback via faction reserves; symmetric AI behavior.
- [x] In-session local ranking, pause, speed, controls, local save.
- [x] CI + build + GitHub Pages workflow config.
- [ ] Enable Pages with **GitHub Actions** source in repository settings and verify public URL.
- [ ] User playtest; measure fun and actual time-to-first-capture.
- [ ] Improve touch camera, path orders, defensive AI and combat feedback.
- [ ] Tune balancing from recorded sessions, not designer intuition alone.

## Level 2 · Complete solo game (not started)

- [ ] Distinct playable map identities, improved terrain and accessible map interaction.
- [ ] AI strategic fronts, threat assessment and anti-snowball systems.
- [ ] Meaningful variety with **few** mechanics; no resource soup.
- [ ] High-quality art/audio pass, settings, saved campaigns, replay records.
- [ ] Accessibility and device QA.
- [ ] Public demos and iterative feedback cycle.

## Level 3 · Steam + online services (not started)

- [ ] Desktop packaging and Steamworks integration after platform evaluation.
- [ ] Player accounts/identity and security/privacy policies.
- [ ] Verifiable match records or server-authoritative rankings.
- [ ] Real network leaderboard with abuse protections and ops.
- [ ] Store assets, release engineering, live updates, observability and support.
- [ ] Multiplayer only if actual playtest demand justifies server complexity.

**Exit gate:** Do not ship level 2 feature scope until level 1 creates sustained enjoyable decisions in real playtests. A larger codebase is not a better game.
