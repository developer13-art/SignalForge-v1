'use strict';

const {
  MARKET_DATA_DEFAULTS,
  MARKET_DATA_METRICS,
} = require('./market-data.constants');

/**
 * SignalForge - Market Data Cache Service
 *
 * In-process cache for market data. The platform does not use Redis,
 * so this cache is intentionally process-local. It is bounded so that
 * a misbehaving consumer cannot exhaust memory, and every entry has a
 * TTL so stale data does not survive across refreshes.
 */

const DEFAULT_MAX_ENTRIES = 10000;

const stores = new Map();

function resolveStore(namespace) {
  if (!stores.has(namespace)) {
    stores.set(namespace, new Map());
  }
  return stores.get(namespace);
}

function set(namespace, key, value, { ttlSeconds } = {}) {
  const store = resolveStore(namespace);
  const ttl = Number.isFinite(Number(ttlSeconds))
    ? Math.max(1, Number(ttlSeconds))
    : MARKET_DATA_DEFAULTS.PRICE_TTL_SECONDS;

  const expiresAt = Date.now() + ttl * 1000;

  if (store.size >= DEFAULT_MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) {
      store.delete(oldestKey);
    }
  }

  store.set(key, {
    value,
    expiresAt,
    storedAt: Date.now(),
  });

  return value;
}

function get(namespace, key) {
  const store = resolveStore(namespace);
  const entry = store.get(key);
  if (!entry) {
    return { hit: false, value: null };
  }
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return { hit: false, value: null, expired: true };
  }
  return {
    hit: true,
    value: entry.value,
    storedAt: entry.storedAt,
    expiresAt: entry.expiresAt,
  };
}

function has(namespace, key) {
  return get(namespace, key).hit;
}

function invalidate(namespace, key) {
  const store = resolveStore(namespace);
  if (key) {
    return store.delete(key);
  }
  const size = store.size;
  store.clear();
  return size;
}

function cleanup(namespace) {
  const store = resolveStore(namespace);
  const now = Date.now();
  let removed = 0;
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(key);
      removed += 1;
    }
  }
  return removed;
}

function cleanupAll() {
  let total = 0;
  for (const namespace of stores.keys()) {
    total += cleanup(namespace);
  }
  return total;
}

function stats(namespace) {
  const store = resolveStore(namespace);
  return {
    namespace,
    size: store.size,
    maxEntries: DEFAULT_MAX_ENTRIES,
  };
}

function statsAll() {
  return Array.from(stores.keys()).map((namespace) => stats(namespace));
}

function getOrSet(namespace, key, loader, { ttlSeconds } = {}) {
  const existing = get(namespace, key);
  if (existing.hit) {
    incrementMetric(MARKET_DATA_METRICS.PRICE_CACHE_HITS, { namespace });
    return Promise.resolve(existing.value);
  }

  incrementMetric(MARKET_DATA_METRICS.PRICE_CACHE_MISSES, { namespace });

  return Promise.resolve(loader()).then((value) => {
    if (value !== undefined && value !== null) {
      set(namespace, key, value, { ttlSeconds });
    }
    return value;
  });
}

function incrementMetric(name, tags) {
  if (global.__signalforgeMetrics && typeof global.__signalforgeMetrics.increment === 'function') {
    global.__signalforgeMetrics.increment(name, tags);
  }
}

function warm(namespace, entries) {
  if (!Array.isArray(entries)) {
    return 0;
  }
  let count = 0;
  for (const entry of entries) {
    if (entry && entry.key) {
      set(namespace, entry.key, entry.value, { ttlSeconds: entry.ttlSeconds });
      count += 1;
    }
  }
  return count;
}

module.exports = {
  set,
  get,
  has,
  invalidate,
  cleanup,
  cleanupAll,
  stats,
  statsAll,
  getOrSet,
  warm,
  DEFAULT_MAX_ENTRIES,
};