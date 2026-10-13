import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Quote } from './types';

interface TickerDB extends DBSchema {
	watchlist: { key: string; value: { symbol: string; addedAt: number } };
	quotes: { key: string; value: Quote };
}

let dbPromise: Promise<IDBPDatabase<TickerDB>> | undefined;

// Lazy singleton: open once, reuse. Versioned upgrade callback = the migration path.
function db() {
	dbPromise ??= openDB<TickerDB>('tickerlab', 1, {
		upgrade(d) {
			d.createObjectStore('watchlist', { keyPath: 'symbol' });
			d.createObjectStore('quotes', { keyPath: 'symbol' });
		}
	});
	return dbPromise;
}

export async function getWatchlist() {
	return (await (await db()).getAll('watchlist')).sort((a, b) => a.addedAt - b.addedAt);
}
export async function addSymbol(symbol: string) {
	await (await db()).put('watchlist', { symbol, addedAt: Date.now() });
}
export async function removeSymbol(symbol: string) {
	const d = await db();
	const tx = d.transaction(['watchlist', 'quotes'], 'readwrite');
	await Promise.all([tx.objectStore('watchlist').delete(symbol), tx.objectStore('quotes').delete(symbol), tx.done]);
}
export async function saveQuotes(quotes: Quote[]) {
	const tx = (await db()).transaction('quotes', 'readwrite');
	await Promise.all([...quotes.map((q) => tx.store.put(q)), tx.done]);
}
export async function getCachedQuotes() {
	return (await db()).getAll('quotes');
}
