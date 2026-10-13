<script lang="ts">
	import { onMount } from 'svelte';
	import { docs, buildCards, buildPlan, drills } from '#lib/content.ts';

	type Tab = 'plan' | 'cards' | 'docs' | 'drills';
	let tab = $state<Tab>('plan');

	const plan = buildPlan();
	const cards = buildCards();

	// progress persisted per-browser only (convenience, not critical)
	let done = $state<Record<string, boolean>>({});
	let known = $state<Record<number, boolean>>({});
	let drilled = $state<Record<string, boolean>>({});
	let loaded = false;

	let idx = $state(0);
	let flipped = $state(false);
	let onlyUnknown = $state(false);
	let docId = $state(docs[0]?.id);

	const deck = $derived(cards.map((c, i) => ({ ...c, i })).filter((c) => !onlyUnknown || !known[c.i]));
	const card = $derived(deck[Math.min(idx, deck.length - 1)]);
	const doc = $derived(docs.find((d) => d.id === docId));
	const pct = $derived(
		Math.round(((Object.values(done).filter(Boolean).length + Object.values(drilled).filter(Boolean).length + Object.values(known).filter(Boolean).length) /
			(plan.length + drills.length + cards.length)) * 100)
	);

	onMount(() => {
		try {
			const s = JSON.parse(localStorage.getItem('prep-progress') ?? '{}');
			done = s.done ?? {}; known = s.known ?? {}; drilled = s.drilled ?? {};
		} catch {}
		loaded = true;
	});
	$effect(() => {
		const snapshot = JSON.stringify({ done, known, drilled });
		if (!loaded) return;
		try { localStorage.setItem('prep-progress', snapshot); } catch {}
	});

	function go(d: number) {
		flipped = false;
		idx = (idx + d + deck.length) % deck.length;
	}
	function mark(v: boolean) {
		known[card.i] = v;
		go(1);
	}
	function shuffle() {
		idx = Math.floor(Math.random() * deck.length);
		flipped = false;
	}
	function onKey(e: KeyboardEvent) {
		if (tab !== 'cards' || !card || (e.target as HTMLElement).tagName === 'INPUT') return;
		if (e.key === ' ') (e.preventDefault(), (flipped = !flipped));
		else if (e.key === 'ArrowRight') go(1);
		else if (e.key === 'ArrowLeft') go(-1);
		else if (e.key === 'y') mark(true);
		else if (e.key === 'n') mark(false);
	}
</script>

<svelte:window onkeydown={onKey} />
<svelte:head><title>stock-company-prep</title></svelte:head>

<div class="mx-auto max-w-3xl p-4">
	<header class="py-4">
		<div class="flex items-end justify-between">
			<div>
				<h1 class="text-2xl font-semibold">stock-company-prep</h1>
				<p class="text-sm text-slate-400">Frontend interview · SvelteKit · PWA · Workers · JS internals</p>
			</div>
			<a href="/lab" class="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-emerald-400">Open TickerLab →</a>
		</div>
		<div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-valuenow={pct}>
			<div class="h-full bg-emerald-500 transition-all" style="width:{pct}%"></div>
		</div>
		<div class="mt-1 text-xs text-slate-500">{pct}% complete · plan days + drills + cards</div>
	</header>

	<nav class="mb-4 flex gap-1 rounded-xl bg-slate-900 p-1 text-sm">
		{#each [['plan', 'Plan'], ['cards', 'Flashcards'], ['drills', 'Drills'], ['docs', 'Docs']] as [id, label]}
			<button
				class="flex-1 rounded-lg px-3 py-2 {tab === id ? 'bg-slate-700 text-white' : 'text-slate-400'}"
				onclick={() => (tab = id as Tab)}>{label}</button>
		{/each}
	</nav>

	{#if tab === 'plan'}
		<ul class="space-y-2">
			{#each plan as d}
				<li>
					<label class="flex cursor-pointer gap-3 rounded-xl border border-slate-800 p-3 {done[d.day] ? 'opacity-50' : ''}">
						<input type="checkbox" class="mt-1" bind:checked={done[d.day]} />
						<span><b>Day {d.day}</b> — {d.focus}{#if d.output}<span class="block text-xs text-slate-500">→ {d.output}</span>{/if}</span>
					</label>
				</li>
			{/each}
		</ul>
	{:else if tab === 'cards'}
		{#if card}
			<div class="mb-2 flex items-center justify-between text-xs text-slate-500">
				<span>{Math.min(idx, deck.length - 1) + 1} / {deck.length} · {card.section}</span>
				<label class="flex items-center gap-1"><input type="checkbox" bind:checked={onlyUnknown} onchange={() => (idx = 0)} /> only not-yet-known</label>
			</div>
			<button
				class="min-h-56 w-full rounded-2xl border border-slate-700 bg-slate-900 p-6 text-left"
				onclick={() => (flipped = !flipped)}
				data-testid="card"
			>
				{#if flipped}
					<div class="text-xs uppercase text-emerald-400">Answer</div>
					<p class="mt-2 text-lg leading-relaxed">{card.a}</p>
				{:else}
					<div class="text-xs uppercase text-slate-500">Say it out loud first</div>
					<p class="mt-2 text-xl font-medium">{card.q}</p>
				{/if}
			</button>
			<div class="mt-3 grid grid-cols-4 gap-2 text-sm">
				<button class="rounded-lg bg-slate-800 p-2" onclick={() => go(-1)}>← Prev</button>
				<button class="rounded-lg bg-rose-900/60 p-2" onclick={() => mark(false)}>Missed (n)</button>
				<button class="rounded-lg bg-emerald-800/70 p-2" onclick={() => mark(true)}>Got it (y)</button>
				<button class="rounded-lg bg-slate-800 p-2" onclick={shuffle}>Random</button>
			</div>
			<p class="mt-2 text-xs text-slate-600">Space flips · ←/→ navigate</p>
		{:else}
			<p class="text-emerald-400">All cards known 🎉 — untick the filter to review.</p>
		{/if}
	{:else if tab === 'drills'}
		<p class="mb-3 text-sm text-slate-400">
			Write the code in <code>exercises/src/</code>, then run <code class="text-emerald-300">cd exercises && bun run test:watch</code>. Tick when green.
		</p>
		<ul class="space-y-2">
			{#each drills as [n, title, file]}
				<li>
					<label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 p-3 {drilled[n] ? 'opacity-50' : ''}">
						<input type="checkbox" bind:checked={drilled[n]} />
						<span class="flex-1">{n}. {title}</span>
						<code class="text-xs text-slate-500">src/{file}</code>
					</label>
				</li>
			{/each}
		</ul>
	{:else}
		<div class="mb-3 flex flex-wrap gap-2 text-sm">
			{#each docs as d}
				<button class="rounded-lg px-3 py-1.5 {docId === d.id ? 'bg-slate-700' : 'bg-slate-900 text-slate-400'}" onclick={() => (docId = d.id)}>{d.id.replace(/^\d+-/, '')}</button>
			{/each}
		</div>
		<article class="prose-doc rounded-xl border border-slate-800 p-4">
			{@html doc?.html}
		</article>
	{/if}
</div>

<style>
	/* minimal typography for rendered markdown (we own the source, so {@html} is safe here) */
	.prose-doc :global(h1) { font-size: 1.4rem; font-weight: 600; margin-bottom: .75rem; }
	.prose-doc :global(h2) { font-size: 1.15rem; font-weight: 600; margin: 1.25rem 0 .5rem; color: #6ee7b7; }
	.prose-doc :global(p), .prose-doc :global(li) { line-height: 1.6; margin: .35rem 0; }
	.prose-doc :global(ul) { list-style: disc; padding-left: 1.25rem; }
	.prose-doc :global(code) { background: #1e293b; padding: 0 .3rem; border-radius: 4px; font-size: .85em; }
	.prose-doc :global(table) { display: block; overflow-x: auto; font-size: .8rem; margin: .5rem 0; }
	.prose-doc :global(th), .prose-doc :global(td) { border: 1px solid #1e293b; padding: .35rem .5rem; text-align: left; vertical-align: top; }
	.prose-doc :global(img) { max-width: 100%; }
</style>
