# Question bank + model answers

Say the answer out loud first, then read.

## A. Browser internals
**Rendering pipeline?** Parse HTML→DOM, CSS→CSSOM → render tree (no `display:none`) → layout (geometry) → paint (records draw ops) → composite (GPU layers). Transform/opacity changes can skip layout+paint (compositor only) — why animate those.

**Layout thrashing?** Interleaving DOM writes and layout reads (`offsetHeight`, `getBoundingClientRect`) forces synchronous reflow each time. Fix: batch reads then writes, `requestAnimationFrame`, or `ResizeObserver`/`IntersectionObserver` instead of polling.

**Event delegation?** One listener on a parent using `event.target.closest(sel)` — fewer listeners (memory), works for dynamic children. Caveats: events that don't bubble (`focus`, `blur` → use `focusin`), `stopPropagation` breaks it.

**Garbage collection / leaks?** Mark-and-sweep from roots. Leaks = still-reachable: forgotten timers/listeners, closures holding big objects, detached DOM nodes referenced from JS, unbounded caches, un-terminated Workers. Tools: DevTools heap snapshot diff, Allocations timeline. Fix: cleanup in teardown (see `onMount` return in showcase), `AbortController` for listeners/fetch, `WeakMap/WeakRef` for caches.

**CSS performance?** Avoid deep selectors / universal; `content-visibility:auto`, `contain`, `will-change` sparingly, avoid animating layout props, font `display:swap`.

## B. JavaScript core
**Event loop order?** Call stack → drain ALL microtasks (promise reactions, `queueMicrotask`) → one macrotask (timer, I/O, UI event) → rendering opportunity → repeat. `await x` = continuation as microtask. (Exercise 4.)

**Closures?** Function + its lexical environment. Uses: memoize, debounce, module privacy. Pitfall: `var` in loops; capturing large objects.

**Inheritance?** Objects link via `[[Prototype]]`; lookup walks the chain. `class extends` sets `Child.prototype.__proto__ = Parent.prototype` and `Child.__proto__ = Parent`. (Exercise 6.)

**Error handling in async?** `try/await/catch`; unhandled rejections → `unhandledrejection` event; `Promise.allSettled` when partial failure is OK; `AbortController` for cancellation; error boundaries / global handler + reporting.

**`==` vs `===`, `this`, hoisting/TDZ, `let` in loops, `Map` vs object, `WeakMap`, generators, iterators, optional chaining** — one-liners each.

## C. PWA / Workers / storage
**SW lifecycle?** register → install (precache) → waiting (if old SW controls clients) → activate (cleanup caches, `clients.claim`) → fetch/message. `skipWaiting` activates immediately but can mix old page JS with new SW caches → prefer prompt-the-user (showcase does it).

**Caching strategies?** Cache-first (immutable assets), network-first (HTML/API when freshness matters), stale-while-revalidate (quotes, avatars). Precache hashed build files, runtime-cache the rest. Always version caches and delete old ones.

**Offline-first architecture?** UI reads from local store (IndexedDB), a sync layer reconciles with network; writes queued (Background Sync / outbox) and retried idempotently; show connectivity + last-sync honestly. Conflict policy: last-write-wins vs server-authoritative (for trading data: server wins).

**IndexedDB gotchas?** Transactions auto-commit when no pending request on the event-loop tick (don't `await` non-IDB stuff inside); versioned schema migrations in `upgrade`; storage can be evicted → request `navigator.storage.persist()`; Safari/WebView quirks.

**Cache API vs IndexedDB?** Cache = Request/Response pairs (SW-friendly); IDB = structured data with indexes/queries.

**Web Workers?** Separate thread, no DOM, communicate via `postMessage` (structured clone; use Transferables for big buffers). Comlink wraps it as async RPC proxies. Use for parsing, indicators, crypto, diffing — not for tiny tasks (clone cost).

**Notifications / Push / Geolocation?** Permission must follow a user gesture (don't prompt on load); SW `showNotification` for push; geolocation = permission + accuracy/battery tradeoff; handle denial gracefully.

## D. WebViews (iOS WKWebView / Android WebView)
- JS↔native bridge (`window.webkit.messageHandlers`, `addJavascriptInterface`) — treat inbound data as untrusted; validate origin.
- No guaranteed SW support (WKWebView limited), storage can be cleared → don't rely on persistence.
- 100vh/URL-bar issues → `dvh`, `env(safe-area-inset-*)`; 300ms tap/`touch-action: manipulation`; passive scroll listeners; hardware back button handling; memory limits kill the page → keep state recoverable.
- Debug: Safari Web Inspector / `chrome://inspect`.

## E. Svelte / Solid / frameworks
**Svelte 5 runes?** `$state` deep reactive proxy; `$derived` memoized computed (pure); `$effect` for side-effects after DOM update (not for deriving state); `$props`. Compile-time reactivity, no VDOM.
**Svelte vs React?** Compile-time updates vs runtime diff; no `useMemo/useCallback` ceremony; smaller runtime.
**Solid?** Fine-grained signals; components run **once**; JSX compiles to DOM ops; don't destructure props (breaks reactivity). Svelte 5 runes ≈ signals under the hood.
**SvelteKit?** File routing, `load` (server/universal), hooks, form actions, adapters. `ssr/csr/prerender` per route. Showcase uses `ssr=false` because it's IDB/Worker-bound.

## F. Performance (have numbers!)
Measure first (Lighthouse, WebPageTest, Performance panel, `PerformanceObserver` for LCP/INP/CLS). Levers: code-split by route, `import()` heavy libs, tree-shake, image formats + `srcset`, preload critical, defer third-party, avoid layout shift (dimension attributes), virtualise long lists (showcase `rows` is the place), debounce input, move compute to Worker. Bundle analysis: `rollup-plugin-visualizer`.

## G. Questions to ask them
1. Where do WebViews hit limits today (iOS vs Android)? 2. How is offline/sync handled for trading screens? 3. How do you measure frontend perf (RUM)? 4. Svelte vs Solid — what decides which? 5. What does an incident RCA look like here?
