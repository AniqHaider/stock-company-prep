import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Deterministic-ish random walk so the demo works with no external market API.
const BASE: Record<string, number> = {
	RELIANCE: 2950, TCS: 4020, INFY: 1610, HDFCBANK: 1680, ITC: 430, SBIN: 820
};

export const GET: RequestHandler = ({ url }) => {
	const symbols = (url.searchParams.get('symbols') ?? '').split(',').filter(Boolean);
	const quotes = symbols.map((symbol) => {
		const base = BASE[symbol] ?? 100 + (symbol.charCodeAt(0) % 50) * 10;
		const ltp = +(base * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2);
		return { symbol, ltp, prevClose: base, ts: Date.now() };
	});
	// Short max-age so the SW's stale-while-revalidate strategy is visible in DevTools.
	return json(quotes, { headers: { 'cache-control': 'public, max-age=0' } });
};
