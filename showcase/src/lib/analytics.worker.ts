import { expose } from 'comlink';
import type { Analytics } from './types';

// Runs off the main thread: heavy number crunching must never block input/scroll.
const history = new Map<string, number[]>();

const api = {
	push(symbol: string, ltp: number): Analytics {
		const arr = history.get(symbol) ?? [];
		arr.push(ltp);
		if (arr.length > 500) arr.shift(); // bounded memory
		history.set(symbol, arr);

		const window = arr.slice(-20);
		const mean = window.reduce((a, b) => a + b, 0) / window.length;
		const variance = window.reduce((a, b) => a + (b - mean) ** 2, 0) / window.length;
		return { sma20: +mean.toFixed(2), volatility: +Math.sqrt(variance).toFixed(2), samples: arr.length };
	},
	reset(symbol: string) {
		history.delete(symbol);
	}
};

export type AnalyticsApi = typeof api;
expose(api);
