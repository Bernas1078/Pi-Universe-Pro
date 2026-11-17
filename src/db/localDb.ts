/**
 * Built-in local browser database (IndexedDB with localStorage fallback)
 * Stores custom/edited boards, accessories, and image assets directly in the site.
 */

const DB_NAME = 'pi_universe_pro_db';
const DB_VERSION = 1;

export type StoreName = 'boards' | 'accessories' | 'images';

const STORES: StoreName[] = ['boards', 'accessories', 'images'];
const LS_PREFIX = 'pi_universe_localdb_';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

function readFallback<T>(store: StoreName): T[] {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}${store}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFallback<T>(store: StoreName, items: T[]): void {
  try {
    localStorage.setItem(`${LS_PREFIX}${store}`, JSON.stringify(items));
  } catch {
    // Ignore quota error in fallback
  }
}

export async function dbGetAll<T extends { id: string }>(store: StoreName): Promise<T[]> {
  try {
    const db = await openDb();
    return await new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return readFallback<T>(store);
  }
}

export async function dbPut<T extends { id: string }>(store: StoreName, item: T): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const existing = readFallback<T>(store);
    const idx = existing.findIndex((x) => x.id === item.id);
    if (idx >= 0) {
      existing[idx] = item;
    } else {
      existing.unshift(item);
    }
    writeFallback(store, existing);
  }
}

export async function dbDelete(store: StoreName, id: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const existing = readFallback<{ id: string }>(store);
    writeFallback(
      store,
      existing.filter((x) => x.id !== id)
    );
  }
}

export async function dbClearAll(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES, 'readwrite');
      for (const store of STORES) {
        tx.objectStore(store).clear();
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    for (const store of STORES) {
      try {
        localStorage.removeItem(`${LS_PREFIX}${store}`);
      } catch {
        // Ignore
      }
    }
  }
}
