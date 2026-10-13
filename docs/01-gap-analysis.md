# Gap analysis: role requirements → you

Legend: ✅ strong · 🟡 adjacent, reframe it · 🔴 real gap, close it before the interview.
**Verify each ✅ claim is something you can defend for 5 minutes. Cut anything you can't.**

| Role requirement | Your evidence | Status | Close the gap |
|---|---|---|---|
| End-to-end frontend ownership (design → prod) | Design-to-production web storefront work (Figma/URL → component library → deployment), caching/ISR tuning | ✅ | Story #1, #5 |
| **SvelteKit / Svelte 4-5** | Backend Dojo (Svelte 5 + Vite, runes) | 🟡 | `showcase/` is SvelteKit 5. Learn: runes (`$state/$derived/$effect`), load fns, hooks, form actions, `ssr=false` trade-offs |
| **SolidJS** | none (React/Next.js strong) | 🔴 | Read Solid's "fine-grained reactivity" page; be able to contrast signals vs React VDOM. 2 hrs, not weeks. |
| TypeScript | All storefront work, strictly typed component props (a generic props type for data + settings) | ✅ | Be ready: generics, discriminated unions, `satisfies`, utility types |
| Tailwind + PostCSS | Daily use; CSS-var/Tailwind token gotcha you documented | ✅ | Story #4. Know Tailwind v4 (`@tailwindcss/vite`) vs v3 PostCSS config |
| Mobile browser / WebView perf, memory, touch | Mobile-first storefront clones, sticky bars, 360px QA | 🟡 | Learn: `touch-action`, passive listeners, 100dvh / safe-area, WebView `JavascriptInterface` bridge, back-button handling |
| **PWAs: Service Workers, Workbox, offline-first** | Debugged stale dev SW + CacheStorage serving old chunks (3 stacked layers) | 🟡→✅ | Story #2 + `showcase/` (Workbox precache, SWR, update flow) |
| **Web Workers / Comlink** | none in prod | 🔴→🟡 | `showcase/src/lib/analytics.worker.ts`. Know structured clone, transferables, why Comlink (RPC proxy over postMessage) |
| IndexedDB / Cache API / Notifications / Geolocation | Cache API via SW debugging | 🟡 | `showcase/src/lib/db.ts` (idb), notification toggle. Know IDB transactions auto-commit pitfall |
| Shared component libraries + utilities | Internal shared component packages, a widget/variant system, an editor-integration package, a Web-Components (Lit) SDK | ✅ | Story #3 |
| Bundle opt / rendering perf / layout thrashing | ISR 30s window, static→dynamic fix, carousel/box-shadow clipping | 🟡 | Learn: forced reflow (read-after-write), `content-visibility`, code-splitting, Lighthouse/CWV numbers. Have 1 real measured before/after |
| Vitest, ESLint, Prettier, Husky | Husky pre-commit type-check gate on web projects | ✅ | Story #6 |
| Mentoring, RCA, incident lead | RCA on a recurring checkout-API 500 (misconfiguration vs. shared-config collision → escalated to the right owner) | 🟡 | Story #7 |
| JS internals: event loop, closures, inheritance, error handling | — | 🟡 | `exercises/` 1-9 |
| Browser internals: render pipeline, DOM/CSSOM, GC | — | 🟡 | `03-question-bank.md` §A, 2 hrs |
| DSA | — | 🟡 | `exercises/` 7 (LRU) + arrays/hashmap/two-pointer/sliding-window/BFS basics |
| CI/CD, E2E testing | Playwright use, `data-testid` convention, cloud-VM deploys | 🟡 | Add one Playwright test to `showcase/` if time |

## Positioning (say this early)
"I've owned storefront frontends end-to-end — from Figma to production — in TypeScript with a
shared widget/component-package architecture. Most recently I've gone deep on the
service-worker/cache layer debugging stale deploys, and I built a SvelteKit 5 offline-first PWA
to apply it. React/Next background means I think in component architecture and rendering costs;
I'm moving that to Svelte/Solid's compile-time and fine-grained reactivity model."

Don't hide that Solid is new; **do** show the learning velocity (the showcase is proof).
