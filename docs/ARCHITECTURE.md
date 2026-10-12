# Technical architecture

## Ownership boundaries

```
index.html
   └── src/main.ts                 orchestration / browser lifecycle
         ├── src/game/             state, simulation, AI, scoring
         ├── src/render/           Canvas2D + audio, replaceable view
         └── src/ui/               HTML HUD / input / accessibility

docs/                         GDD, vision, art, roadmap, tuning
.github/workflows/             test/build and browser deploy
```

`src/game` imports **no DOM APIs**, Canvas code or browser storage. The AI uses the same `sendArmy`, `launchRevolt`, `mobilizeReserves` functions as the human. The seeded map generator supports repeatable balance tests; note that player commands and in-game timing aren't yet replay-logged.

## Browser (Level 1)

- Vite + strict TypeScript; HTML Canvas2D as initial renderer (no heavyweight art framework yet).
- Native HTML/CSS interface; mouse, pointer/touch, wheel/zoom.
- LocalStorage single-device continuation with schema version and basic validation.
- No server, no accounts, no purchase system and no online score claims.

## Steam / online (Level 3 target)

- Package the browser UI inside a desktop shell (e.g. Electron or Tauri) **only after** web gameplay is fun; verify Steamworks compatibility before committing to a shell.
- Extract simulation to a shared package (`packages/simulation`) and define versioned command/event contracts.
- Run **authoritative simulation or replay verification server-side** for ranked scores. A browser `localStorage` score is trivial to forge; never trust it as a live leaderboard submission.
- Score service: auth / Steam identity linking as appropriate, append-only verified match results, rate limits, abuse detection, versioned balancing rules, rank read API, real-time updates via WebSocket/SSE or managed subscriptions.
- Add operational safeguards: secrets outside the client bundle, consent/privacy design, backups, monitoring, tests and cost caps.

## Scale discipline

Do **not** create empty microservices or premature monorepo packages. Keep well-defined boundaries in source now; extract packages when at least two real runtimes need the same module. All new combat mechanics require pure simulation unit tests.
