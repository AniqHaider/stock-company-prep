import { marked } from 'marked';

// Pull the prep docs straight from ../docs so the hub never drifts from the markdown.
const raw = import.meta.glob('../../../docs/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export interface Doc { id: string; title: string; md: string; html: string }

export const docs: Doc[] = Object.entries(raw)
	.map(([path, md]) => {
		const id = path.split('/').pop()!.replace('.md', '');
		const title = md.match(/^#\s+(.+)$/m)?.[1] ?? id;
		return { id, title, md, html: marked.parse(md, { async: false }) as string };
	})
	.sort((a, b) => a.id.localeCompare(b.id));

export interface Card { q: string; a: string; section: string }

// Cards = every "**Question?** answer" line in the question bank, tagged by its ## section.
export function buildCards(): Card[] {
	const md = docs.find((d) => d.id.includes('question-bank'))?.md ?? '';
	const cards: Card[] = [];
	let section = '';
	for (const line of md.split('\n')) {
		const h = line.match(/^##\s+(.+)$/);
		if (h) section = h[1];
		const c = line.match(/^\*\*(.+?\?)\*\*\s*(.+)$/);
		if (c) cards.push({ q: c[1], a: c[2], section });
	}
	return cards;
}

export interface Day { day: string; focus: string; output: string }
export function buildPlan(): Day[] {
	const md = docs.find((d) => d.id.includes('study-plan'))?.md ?? '';
	return md
		.split('\n')
		.map((l) => l.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.*?)\s*\|$/))
		.filter((m): m is RegExpMatchArray => !!m)
		.map((m) => ({ day: m[1], focus: m[2], output: m[3] }));
}

export const drills = [
	['1', 'debounce / throttle', 'debounce.ts'],
	['2', 'promise pool', 'promisePool.ts'],
	['3', 'Promise.all / allSettled', 'promiseUtils.ts'],
	['4', 'event loop order', 'eventLoop.ts'],
	['5', 'memoize + eviction', 'memoize.ts'],
	['6', 'prototype inheritance', 'inheritance.ts'],
	['7', 'LRU cache (DSA)', 'lru.ts'],
	['8', 'Emitter, no leaks', 'emitter.ts'],
	['9', 'retry + backoff + abort', 'retry.ts']
] as const;
