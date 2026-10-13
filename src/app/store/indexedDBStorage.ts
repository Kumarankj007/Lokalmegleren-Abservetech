import { openDB } from 'idb';

// IndexedDB storage for Zustand persist
export const indexedDBStorage = {
  getItem: async (name: string) => {
    const db = await openDB('zustand-db', 1, {
      upgrade(db) {
        db.createObjectStore('zustand-store');
      },
    });
    return (await db.get('zustand-store', name)) ?? null;
  },
  setItem: async (name: string, value: unknown) => {
    const db = await openDB('zustand-db', 1, {
      upgrade(db) {
        db.createObjectStore('zustand-store');
      },
    });
    await db.put('zustand-store', value, name);
  },
  removeItem: async (name: string) => {
    const db = await openDB('zustand-db', 1, {
      upgrade(db) {
        db.createObjectStore('zustand-store');
      },
    });
    await db.delete('zustand-store', name);
  },
};