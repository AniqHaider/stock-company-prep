# TickerLab — offline-first watchlist PWA

Built to demonstrate a modern frontend stack: **SvelteKit 5 (runes) · TypeScript · Tailwind v4 · Workbox SW · IndexedDB (idb) · Web Worker + Comlink · Notifications**.

| Concern | File |
|---|---|
| App shell precache, SWR for API, update flow | `src/service-worker.ts` |
| Offline store (watchlist + last quotes) | `src/lib/db.ts` |
| Off-main-thread SMA/volatility | `src/lib/analytics.worker.ts` |
| UI, runes, cleanup, update prompt | `src/routes/+page.svelte` |
| Mock market API | `src/routes/api/quotes/+server.ts` |

```bash
bun install && bun run build && bun run preview --port 4173
```
Service workers run only in the production build. Demo script: load → DevTools Application tab → tick **Offline** → reload (list still renders from IndexedDB, badge says "Offline · cached") → untick; rebuild after a code change to see the "New version available" banner.

**Honest limits** (say these before they ask): mock data, no auth, no virtualisation, no Background Sync queue for offline writes, no E2E tests yet. Next steps: Playwright offline test, `@tanstack/virtual`-style windowing, outbox pattern for writes.
