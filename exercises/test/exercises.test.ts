import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle } from '@impl/debounce';
import { promisePool } from '@impl/promisePool';
import { all, allSettled } from '@impl/promiseUtils';
import { eventLoopOrder } from '@impl/eventLoop';
import { memoize } from '@impl/memoize';
import { inherit } from '@impl/inheritance';
import { LRUCache } from '@impl/lru';
import { Emitter } from '@impl/emitter';
import { retry } from '@impl/retry';

describe('1 debounce/throttle', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());
	it('debounce fires once with the last args', () => {
		const fn = vi.fn();
		const d = debounce(fn, 100);
		d(1); d(2); d(3);
		vi.advanceTimersByTime(99);
		expect(fn).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(3);
	});
	it('throttle fires leading edge, then at most once per window', () => {
		const fn = vi.fn();
		const t = throttle(fn, 100);
		t('a'); t('b');
		expect(fn).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(100);
		t('c');
		expect(fn).toHaveBeenCalledTimes(2);
	});
});

describe('2 promisePool', () => {
	it('respects the limit, keeps order', async () => {
		let active = 0, peak = 0;
		const task = (v: number) => async () => {
			peak = Math.max(peak, ++active);
			await new Promise((r) => setTimeout(r, 10 - v));
			active--;
			return v;
		};
		const res = await promisePool([0, 1, 2, 3, 4, 5].map(task), 2);
		expect(res).toEqual([0, 1, 2, 3, 4, 5]);
		expect(peak).toBe(2);
	});
	it('rejects on first error', async () => {
		await expect(promisePool([async () => 1, async () => { throw new Error('x'); }], 2)).rejects.toThrow('x');
	});
});

describe('3 all / allSettled', () => {
	it('all: order, plain values, empty', async () => {
		expect(await all([1, Promise.resolve(2), new Promise<number>((r) => setTimeout(() => r(3), 5))])).toEqual([1, 2, 3]);
		expect(await all([])).toEqual([]);
	});
	it('all: rejects', async () => {
		await expect(all([1, Promise.reject(new Error('no'))])).rejects.toThrow('no');
	});
	it('allSettled', async () => {
		const r = await allSettled([1, Promise.reject('e')]);
		expect(r).toEqual([{ status: 'fulfilled', value: 1 }, { status: 'rejected', reason: 'e' }]);
	});
});

describe('4 event loop', () => {
	it('sync → microtasks (in queue order) → macrotask', async () => {
		expect(await eventLoopOrder()).toEqual(['sync', 'async-start', 'micro1', 'micro2', 'async-after-await', 'timeout']);
	});
});

describe('5 memoize', () => {
	it('caches and evicts oldest past max', () => {
		const fn = vi.fn((n: number) => n * 2);
		const m = memoize(fn, { max: 2 });
		m(1); m(1); m(2); m(3); // 1 evicted
		expect(fn).toHaveBeenCalledTimes(3);
		m(1);
		expect(fn).toHaveBeenCalledTimes(4);
	});
});

describe('6 inheritance', () => {
	it('prototype chain, constructor, instanceof', () => {
		function Animal(this: any, n: string) { this.n = n; }
		Animal.prototype.speak = function () { return this.n + ' makes a sound'; };
		function Dog(this: any, n: string) { Animal.call(this, n); }
		inherit(Dog, Animal);
		const d = new (Dog as any)('Rex');
		expect(d instanceof (Animal as any)).toBe(true);
		expect(d.speak()).toBe('Rex makes a sound');
		expect(Dog.prototype.constructor).toBe(Dog);
		expect(Object.keys(Dog.prototype)).not.toContain('constructor');
	});
});

describe('7 LRU', () => {
	it('evicts least recently used', () => {
		const c = new LRUCache<string, number>(2);
		c.put('a', 1); c.put('b', 2); c.get('a'); c.put('c', 3);
		expect(c.get('b')).toBeUndefined();
		expect(c.get('a')).toBe(1);
		expect(c.get('c')).toBe(3);
	});
});

describe('8 Emitter', () => {
	it('on/off/once, no leaks, error isolation', () => {
		const onError = vi.fn();
		const e = new Emitter<{ tick: [number] }>(onError);
		const a = vi.fn(), b = vi.fn();
		const off = e.on('tick', a);
		e.once('tick', b);
		e.on('tick', () => { throw new Error('boom'); });
		e.emit('tick', 1);
		e.emit('tick', 2);
		expect(a).toHaveBeenCalledTimes(2);
		expect(b).toHaveBeenCalledTimes(1);
		off();
		expect(onError).toHaveBeenCalledTimes(2);
		expect(e.listenerCount('tick')).toBe(1);
	});
});

describe('9 retry', () => {
	it('retries with backoff then succeeds', async () => {
		let n = 0;
		const r = await retry(async () => { if (++n < 3) throw new Error('flaky'); return 'ok'; }, { retries: 3, baseMs: 1 });
		expect(r).toBe('ok');
		expect(n).toBe(3);
	});
	it('gives up after retries', async () => {
		await expect(retry(async () => { throw new Error('dead'); }, { retries: 2, baseMs: 1 })).rejects.toThrow('dead');
	});
	it('honours AbortSignal', async () => {
		const ac = new AbortController();
		const p = retry(async () => { throw new Error('x'); }, { retries: 5, baseMs: 50, signal: ac.signal });
		setTimeout(() => ac.abort(new Error('aborted')), 10);
		await expect(p).rejects.toThrow();
	});
});
