// ─────────────────────────────────────────────────────────────────────────────
// Demo backend: every "table" is stored in this browser's localStorage.
// It behaves like a small database (insert / update / remove / subscribe), so the
// whole site — admin panel, accounts, orders, reviews — works with no server.
//
// To go live, re-implement the functions in this file against Firebase, Supabase
// or your own API, keeping the same names. Nothing else in the app needs to change.
// ─────────────────────────────────────────────────────────────────────────────
import { useSyncExternalStore } from 'react';

const PREFIX = 'ar_db_';
const cache = {};
const seeds = {};
const listeners = {};

export function registerSeed(collection, seedFn) {
  seeds[collection] = seedFn;
}

function read(collection) {
  if (!(collection in cache)) {
    let data = null;
    try {
      const raw = localStorage.getItem(PREFIX + collection);
      if (raw) data = JSON.parse(raw);
    } catch {
      /* storage unavailable or corrupt — fall back to seed */
    }
    cache[collection] = data ?? (seeds[collection] ? seeds[collection]() : []);
  }
  return cache[collection];
}

function notify(collection) {
  (listeners[collection] || new Set()).forEach((fn) => fn());
}

function write(collection, data) {
  cache[collection] = data;
  try {
    localStorage.setItem(PREFIX + collection, JSON.stringify(data));
  } catch {
    throw new Error('Browser storage is full. Use smaller images or clear old data.');
  }
  notify(collection);
}

// Keep tabs in sync: an edit in the admin tab shows up in the shop tab.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key || !e.key.startsWith(PREFIX)) return;
    const collection = e.key.slice(PREFIX.length);
    delete cache[collection];
    notify(collection);
  });
}

export function subscribe(collection, fn) {
  (listeners[collection] ||= new Set()).add(fn);
  return () => listeners[collection].delete(fn);
}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const db = {
  all: (collection) => read(collection),
  get: (collection, id) => read(collection).find((d) => d.id === id) ?? null,
  find: (collection, fn) => read(collection).filter(fn),
  insert(collection, doc) {
    const created = { id: doc.id ?? newId(), createdAt: new Date().toISOString(), ...doc };
    write(collection, [...read(collection), created]);
    return created;
  },
  update(collection, id, patch) {
    let updated = null;
    write(
      collection,
      read(collection).map((d) => {
        if (d.id !== id) return d;
        updated = { ...d, ...(typeof patch === 'function' ? patch(d) : patch), updatedAt: new Date().toISOString() };
        return updated;
      }),
    );
    return updated;
  },
  remove(collection, id) {
    write(collection, read(collection).filter((d) => d.id !== id));
  },
  replaceAll(collection, docs) {
    write(collection, docs);
  },
  reset(collection) {
    write(collection, seeds[collection] ? seeds[collection]() : []);
  },
};

// React hook: re-renders whenever the collection changes.
export function useCollection(collection) {
  return useSyncExternalStore(
    (fn) => subscribe(collection, fn),
    () => read(collection),
    () => read(collection),
  );
}

export async function hashPassword(password) {
  const bytes = new TextEncoder().encode(`action-realm:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
