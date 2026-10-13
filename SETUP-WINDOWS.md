# stock-company-prep — Windows setup

Interview-prep workspace with three runnable parts plus written docs:

| Folder | What | Stack |
|---|---|---|
| `exercises\` | 9 JS/TS coding drills (debounce, promise pool, LRU, event loop…) with Vitest tests and reference solutions | Bun + Vitest |
| `showcase\` | **Prep hub** at `/` (plan checklist, flashcards, drills, docs viewer) and **TickerLab** at `/lab` (offline-first PWA) | SvelteKit 5, Tailwind 4, Workbox, IndexedDB, Web Worker (Comlink) |
| `docs\` | Gap analysis, STAR stories, question bank, 10-day study plan (Markdown) | — |

> **Status.** Everything was built and tested on macOS (tests, type-check, production build, running in the browser). The
> Windows steps follow the tools' official Windows docs; the one Unix-only npm script (`SOLUTIONS=1 vitest`) was replaced
> with the cross-platform `cross-env`. The steps have **not been run on a real Windows PC yet** — see *Troubleshooting*.

## 1. Install the tools (PowerShell)

```powershell
winget install --id Git.Git -e
winget install --id Oven-sh.Bun -e
winget install --id OpenJS.NodeJS.LTS -e
```

Close and reopen PowerShell, then check `git --version ; bun --version ; node --version`.
You also want **Chrome or Edge** (for the PWA/offline demo).

```powershell
mkdir C:\dev ; cd C:\dev
git clone https://github.com/AniqHaider/stock-company-prep.git
cd stock-company-prep
```

## 2. The drills (`exercises\`)

You write the code in `exercises\src\*.ts`; the tests are in `exercises\test\exercises.test.ts`.

```powershell
cd exercises
bun install
bun run test:watch          # re-runs on save; your stubs start out failing (14 of 15 fail) — that's the exercise
```

| Command | Expected |
|---|---|
| `bun run test` | Runs **your** code in `src\` — fails until you solve the drills |
| `bun run test:solutions` | Runs the **reference answers** in `solutions\` — `15 passed` |

Drill files: `debounce.ts` (debounce + throttle), `promisePool.ts`, `promiseUtils.ts` (Promise.all/allSettled),
`eventLoop.ts`, `memoize.ts`, `inheritance.ts`, `lru.ts`, `emitter.ts`, `retry.ts`.

## 3. The Prep hub + TickerLab (`showcase\`)

```powershell
cd ..\showcase          # from exercises\; or: cd C:\dev\stock-company-prep\showcase
bun install
```

### Development mode (hot reload)

```powershell
bun run dev
```

Open the URL it prints (normally **http://localhost:5173**):

- `/` — Prep hub: **Plan** (10-day checklist), **Flashcards** (from `docs\03-question-bank.md`), **Drills**, **Docs** viewer.
- `/lab` — TickerLab watchlist.

> The **service worker (offline support) only exists in the production build**, so in dev mode TickerLab works online
> but won't cache anything.

### Production mode (to see the PWA / offline behaviour)

```powershell
bun run build
bun run preview --port 4173
```

Open **http://localhost:4173/lab** in Chrome/Edge → `F12` → **Application → Service Workers** (should be *activated*) →
tick **Offline** in the Network tab or the Service Workers pane → reload. The list still renders (from IndexedDB) and the
badge says "Offline · cached". After you change code and rebuild, reload twice to see the "New version available" banner.

Other commands: `bun run check` (svelte-check, expect `0 ERRORS`).

### Where the hub gets its content

The hub imports `..\docs\*.md` at build time (see `showcase\src\lib\content.ts` and `server.fs.allow` in
`vite.config.ts`), so edit the Markdown in `docs\` and refresh — no other step. Your hub progress (checked days, flashcard
"got it" marks) is saved in the browser's localStorage.

## 4. The written docs (`docs\`)

Just Markdown — open in VS Code (`winget install --id Microsoft.VisualStudioCode -e`) or on GitHub:

- `01-gap-analysis.md` — job-description line → your evidence → gap → how to close it.
- `02-stories.md` — STAR interview stories (fill in the `[METRIC]` placeholders with real numbers).
- `03-question-bank.md` — likely questions with model answers.
- `04-study-plan.md` — 10-day schedule.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `bun` / `node` "not recognized" | Close and reopen PowerShell. |
| `SOLUTIONS is not recognized` | You're on an old commit — `git pull` (the script now uses `cross-env`). |
| Port 5173 or 4173 in use | `bun run dev -- --port 5200` / `bun run preview --port 4200` |
| Offline demo doesn't work in `dev` | Expected — the service worker is only registered in the production build. |
| Old cached app after rebuilding | DevTools → Application → *Service Workers* → **Unregister**, then **Clear site data**, hard-refresh. |
| `svelte-kit sync` errors on install | Use Node 22 LTS; delete `showcase\node_modules` and `.svelte-kit`, then `bun install` again. |
| Antivirus/Defender slows installs | Exclude `C:\dev` from real-time scanning (optional). |

## Related

The prep hub's content and the Svelte/TypeScript quiz are also bundled in the **Kata** Android app (`prep-pocket` repo).
