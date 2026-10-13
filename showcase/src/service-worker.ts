/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />
import { immutable, assets } from '$app/manifest';
import { version } from '$app/env';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

// App shell: hashed build output + static files, versioned by SvelteKit's `version`.
precacheAndRoute(
	[{ url: '/', revision: version }, ...[...immutable, ...assets].map(({ path }) => ({ url: path, revision: version }))],
	{ ignoreURLParametersMatching: [/.*/] }
);
cleanupOutdatedCaches();

// Offline navigation: any page request falls back to the precached shell.
registerRoute(new NavigationRoute(async () => (await caches.match('/')) ?? Response.error()));

// Quotes: show cached instantly, refresh in the background (stale-while-revalidate).
registerRoute(
	({ url }) => url.pathname.startsWith('/api/quotes'),
	new StaleWhileRevalidate({
		cacheName: 'quotes-api',
		plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 })]
	})
);

// Images: immutable-ish, cache-first with a cap.
registerRoute(
	({ request }) => request.destination === 'image',
	new CacheFirst({ cacheName: 'images', plugins: [new ExpirationPlugin({ maxEntries: 60 })] })
);

// Let the page decide when to activate a waiting SW (no surprise mid-session reload).
self.addEventListener('message', (e) => {
	if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
