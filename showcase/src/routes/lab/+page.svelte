<script lang="ts">
	import { onMount } from 'svelte';
	import { wrap, type Remote } from 'comlink';
	import AnalyticsWorker from '#lib/analytics.worker.ts?worker';
	import type { AnalyticsApi } from '#lib/analytics.worker.ts';
	import { addSymbol, getCachedQuotes, getWatchlist, removeSymbol, saveQuotes } from '#lib/db.ts';
	import type { Analytics, Quote } from '#lib/types.ts';

	let symbols = $state<string[]>([]);
	let quotes = $state<Record<string, Quote>>({});
	let stats = $state<Record<string, Analytics>>({});
	let input = $state('');
	let online = $state(true);
	let lastSync = $state<number | null>(null);
	let notify = $state(false);
	let updateReady = $state<ServiceWorkerRegistration | null>(null);

	let worker: Worker;
	let analytics: Remote<AnalyticsApi>;

	const rows = $derived(
		symbols.map((s) => {
			const q = quotes[s];
			const change = q ? ((q.ltp - q.prevClose) / q.prevClose) * 100 : 0;
			return { symbol: s, q, change, stat: stats[s] };
		})
	);

	async function refresh() {
		if (!symbols.length) return;
		try {
			const res = await fetch(`/api/quotes?symbols=${symbols.join(',')}`);
			if (!res.ok) throw new Error(String(res.status));
			const fresh: Quote[] = await res.json();
			for (const q of fresh) {
				quotes[q.symbol] = q;
				stats[q.symbol] = await analytics.push(q.symbol, q.ltp);
				if (notify && Math.abs((q.ltp - q.prevClose) / q.prevClose) > 0.008) {
					new Notification(`${q.symbol} moved`, { body: `LTP ${q.ltp}` });
				}
			}
			lastSync = Date.now();
			await saveQuotes(fresh); // offline-first: persist every successful fetch
		} catch {
			// network failed → we keep showing the IndexedDB-backed values; never blank the UI
		}
	}

	async function add() {
		const s = input.trim().toUpperCase();
		input = '';
		if (!s || symbols.includes(s)) return;
		symbols.push(s);
		await addSymbol(s);
		refresh();
	}

	async function remove(s: string) {
		symbols = symbols.filter((x) => x !== s);
		delete quotes[s];
		delete stats[s];
		await analytics.reset(s);
		await removeSymbol(s);
	}

	async function toggleNotify() {
		if (!notify && 'Notification' in window) {
			notify = (await Notification.requestPermission()) === 'granted';
		} else notify = false;
	}

	onMount(() => {
		worker = new AnalyticsWorker();
		analytics = wrap<AnalyticsApi>(worker);
		online = navigator.onLine;

		const on = () => ((online = true), refresh());
		const off = () => (online = false);
		window.addEventListener('online', on);
		window.addEventListener('offline', off);

		(async () => {
			// 1) paint from IndexedDB immediately, 2) then reconcile with the network
			const wl = await getWatchlist();
			symbols = wl.length ? wl.map((w) => w.symbol) : ['RELIANCE', 'TCS', 'ITC'];
			if (!wl.length) await Promise.all(symbols.map(addSymbol));
			for (const q of await getCachedQuotes()) quotes[q.symbol] = q;
			refresh();
		})();

		const id = setInterval(() => document.visibilityState === 'visible' && refresh(), 3000);

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.ready.then((reg) => {
				reg.addEventListener('updatefound', () => {
					reg.installing?.addEventListener('statechange', function () {
						if (this.state === 'installed' && navigator.serviceWorker.controller) updateReady = reg;
					});
				});
			});
		}

		// cleanup: timers, listeners, worker — the GC / memory-leak question in one place
		return () => {
			clearInterval(id);
			window.removeEventListener('online', on);
			window.removeEventListener('offline', off);
			worker.terminate();
		};
	});

	function applyUpdate() {
		updateReady?.waiting?.postMessage({ type: 'SKIP_WAITING' });
		navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
	}
</script>

<svelte:head><title>TickerLab · Lab</title></svelte:head>

<main class="mx-auto max-w-xl p-4 pb-[env(safe-area-inset-bottom)]">
	<header class="flex items-center justify-between py-4">
		<h1 class="text-xl font-semibold"><a href="/" class="text-slate-500">←</a> TickerLab</h1>
		<span class="flex items-center gap-2 text-xs {online ? 'text-emerald-400' : 'text-amber-400'}" data-testid="net-status">
			<span class="size-2 rounded-full bg-current"></span>
			{online ? 'Online' : 'Offline · cached'}
		</span>
	</header>

	{#if updateReady}
		<button class="mb-3 w-full rounded-lg bg-indigo-600 p-2 text-sm" onclick={applyUpdate}>
			New version available — tap to update
		</button>
	{/if}

	<form class="mb-4 flex gap-2" onsubmit={(e) => (e.preventDefault(), add())}>
		<input
			class="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-base"
			placeholder="Add symbol (e.g. INFY)"
			bind:value={input}
			data-testid="symbol-input"
		/>
		<button class="rounded-lg bg-emerald-600 px-4 py-2 active:scale-95">Add</button>
	</form>

	<ul class="divide-y divide-slate-800 rounded-xl border border-slate-800">
		{#each rows as r (r.symbol)}
			<li class="flex items-center justify-between p-3" data-testid="row-{r.symbol}">
				<div>
					<div class="font-medium">{r.symbol}</div>
					<div class="text-xs text-slate-400">
						{#if r.stat}SMA20 {r.stat.sma20} · σ {r.stat.volatility}{:else}waiting for ticks…{/if}
					</div>
				</div>
				<div class="flex items-center gap-3 text-right">
					<div>
						<div class="tabular-nums">{r.q?.ltp.toFixed(2) ?? '—'}</div>
						<div class="text-xs tabular-nums {r.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
							{r.change >= 0 ? '+' : ''}{r.change.toFixed(2)}%
						</div>
					</div>
					<button class="p-2 text-slate-500" aria-label="Remove {r.symbol}" onclick={() => remove(r.symbol)}>✕</button>
				</div>
			</li>
		{/each}
	</ul>

	<footer class="mt-4 flex items-center justify-between text-xs text-slate-500">
		<span>{lastSync ? `Synced ${new Date(lastSync).toLocaleTimeString()}` : 'Not synced yet'}</span>
		<label class="flex items-center gap-2">
			<input type="checkbox" checked={notify} onchange={toggleNotify} /> Alerts
		</label>
	</footer>
</main>
