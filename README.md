# stock-company-prep — Frontend Engineer Interview Prep

> **Windows?** See [SETUP-WINDOWS.md](SETUP-WINDOWS.md).

Target role: Frontend Engineer (3–6 yrs) — SvelteKit/Svelte 4-5, SolidJS, TS, Tailwind, PWAs,
WebViews, performance.

| Path | What it is |
|---|---|
| `docs/01-gap-analysis.md` | Role requirement → your evidence → gap → how to close it. **Start here.** |
| `docs/02-stories.md` | STAR stories built from your real work (fill the `[METRIC]`s). |
| `docs/03-question-bank.md` | Likely questions + crisp model answers (browser internals, JS, PWA, perf). |
| `docs/04-study-plan.md` | 10-day schedule. |
| `exercises/` | 9 JS/TS coding drills with Vitest (event loop, closures, promises, LRU…). |
| `showcase/` | **Prep hub** at `/` (plan checklist, flashcards from the question bank, drills, docs viewer) and **TickerLab** at `/lab` — SvelteKit 5 + Tailwind PWA: Workbox SW, IndexedDB, Web Worker via Comlink. Your talking-piece. |

## Quick start
```bash
# drills: write code in exercises/src/*.ts until tests pass
cd exercises && bun install && bun run test:watch
bun run test:solutions        # peek at / verify the reference answers

# showcase
cd ../showcase && bun install
bun run build && bun run preview --port 4173   # SW only runs in the production build
```
Hub: http://localhost:4173/ · Lab: http://localhost:4173/lab → DevTools → Application → Service Workers, then tick "Offline" and reload.
