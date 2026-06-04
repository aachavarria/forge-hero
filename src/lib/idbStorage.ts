"use client";

import type { StateStorage } from "zustand/middleware";

// A tiny IndexedDB-backed key/value store used as Zustand's persistence layer.
// IndexedDB's quota is far larger than localStorage's ~5 MB, so the whole
// character draft — including the base64 portrait image — can live here.
// Stores raw JSON strings (createJSONStorage handles (de)serialization).

const DB_NAME = "pjcreator";
const STORE_NAME = "creator";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function run<T>(
  mode: IDBTransactionMode,
  op: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  return getDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const req = op(tx.objectStore(STORE_NAME));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      }),
  );
}

export const idbStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const v = await run<string | undefined>("readonly", (s) => s.get(name));
      if (v != null) return v;
      // One-time migration from the previous localStorage save so an
      // in-progress character isn't lost when we switch backends.
      const legacy =
        typeof localStorage !== "undefined" ? localStorage.getItem(name) : null;
      if (legacy != null) {
        await run("readwrite", (s) => s.put(legacy, name));
        localStorage.removeItem(name);
        return legacy;
      }
      return null;
    } catch {
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      await run("readwrite", (s) => s.put(value, name));
    } catch {
      // Quota or private-mode failures are non-fatal: the draft stays in memory.
    }
  },
  removeItem: async (name) => {
    try {
      await run("readwrite", (s) => s.delete(name));
    } catch {
      // ignore
    }
  },
};
