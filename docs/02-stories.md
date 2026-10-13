# STAR stories (from your real work)

Replace every `[METRIC]` with a real number. If you don't have one, measure it this week (Lighthouse / Network tab).

## 1. Figma/URL → production storefront, end to end
- **S** Clients needed pixel-accurate storefronts fast; each build was manual and inconsistent.
- **T** Own design → deploy for the storefront.
- **A** Built a repeatable pipeline: discover sections → harvest tokens/assets → generate component-library widgets (variant, dispatcher, types, scoped CSS) → wire into theme templates → verify build. Added robots/sitemap/`data-testid`.
- **R** [METRIC: sections/week, or time per storefront before vs after]. *Shows: ownership, systems thinking, tooling.*

## 2. Stale code in dev — three stacked cache layers (SERVICE WORKER story — lead with this)
- **S** Component edits didn't show in dev; looked like a code bug.
- **T** Find root cause, not clear-cache-and-pray.
- **A** Isolated layers using CDP `setCacheDisabled` + resource `transferSize`: (1) `immutable` header on stable dev chunks, (2) SW CacheStorage — app re-registers every load so unregister doesn't stick, (3) already-stored immutable browser entries. Fixed permanently: dev `no-cache` header + middleware SW kill-switch (and deliberately **no** `clients.navigate` — avoids reload loops).
- **R** No more "ghost" deploys for the team. *Deep SW lifecycle knowledge: install/activate/waiting, `clients.claim`, `skipWaiting` trade-offs.* Connect to showcase's update-prompt flow.

## 3. Shared component library without breaking clients
- **S** One codebase, many clients; a `widgets/common` package is shared.
- **A** Hard rule: client-scoped widgets own their markup; reuse hooks/packages, never fork common. Variant registry + a generic typed props interface (data + settings); an editor-integration package so the visual editor plugs in without a git submodule.
- **R** Zero cross-client regressions [METRIC]. *Shows: API boundaries, versioning, mentoring-ready conventions.*

## 4. Tailwind token gotcha → transparent buttons
- Tailwind mapped `bg-black`/`rounded-full` to CSS variables undefined in `:root` → transparent/square. Found via computed styles, fixed in `globals.css`, documented. *Shows: debugging the styling pipeline, writing it down for others.*

## 5. Performance: static → dynamic ISR bug
- PDP/PLP broke in `next start` with "Page changed from static to dynamic at runtime" because a translations fetch used `cache: "no-store"`. Switched to `revalidate: 30`; standardised the ISR window. [METRIC: TTFB / cache-hit before vs after]. *Shows: rendering-mode literacy → maps to SvelteKit prerender/ssr/csr flags.*

## 6. Quality gates
- Husky hook failed on stale `.next/types` tsc errors. Refused `--no-verify`; fixed root cause (`rm -rf .next`, `[skip-tests]` convention). *Shows: discipline with CI/hooks; ready to talk Vitest/ESLint/Prettier/Husky.*

## 7. RCA: recurring checkout-API 500s
- Traced a server-side "X is not a constructor" 500 to a wrong platform setting in the admin dashboard (one case) and a shared-configuration collision (another). Escalated to the right owners with request traces instead of patching the frontend. *Shows: RCA, ownership boundaries, communication.*

## 8. Visual editor in an iframe
- A session JWT whose `sub` must match the store id; `previewOrigin` only honored for localhost; PDP data blank because STATIC source had empty params → inject fetched product. *Shows: postMessage/iframe protocols, auth, debugging cross-origin state. Relevant to WebView bridge questions.*

## Weakness answer (they'll ask)
"My production depth is React/Next; Svelte I've used in [Backend Dojo] and now a PWA. I close gaps by building: here's the offline-first app I made for this role." → open `showcase/`.
