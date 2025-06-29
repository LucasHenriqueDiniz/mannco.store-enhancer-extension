/* eslint-disable @typescript-eslint/no-explicit-any */
import { StorageEnum } from '../base/index.js';

/**
 * Type-safe wrapper for Chrome storage API
 */
export const storage = {
  local: {
    get: async <T = Record<string, any>>(
      keys?: string | string[] | null | Record<string, any> | undefined,
    ): Promise<T> => {
      return new Promise(resolve => {
        chrome.storage.local.get(keys || null, result => {
          resolve(result as T);
        });
      });
    },
    set: async <T extends Record<string, any>>(items: T): Promise<void> => {
      return new Promise(resolve => {
        chrome.storage.local.set(items, resolve);
      });
    },
    remove: async (keys: string | string[]): Promise<void> => {
      return new Promise(resolve => {
        chrome.storage.local.remove(keys, resolve);
      });
    },
    clear: async (): Promise<void> => {
      return new Promise(resolve => {
        chrome.storage.local.clear(resolve);
      });
    },
  },
  sync: {
    get: async <T = Record<string, any>>(
      keys?: string | string[] | null | Record<string, any> | undefined,
    ): Promise<T> => {
      return new Promise(resolve => {
        chrome.storage.sync.get(keys || null, result => {
          resolve(result as T);
        });
      });
    },
    set: async <T extends Record<string, any>>(items: T): Promise<void> => {
      return new Promise(resolve => {
        chrome.storage.sync.set(items, resolve);
      });
    },
    remove: async (keys: string | string[]): Promise<void> => {
      return new Promise(resolve => {
        chrome.storage.sync.remove(keys, resolve);
      });
    },
    clear: async (): Promise<void> => {
      return new Promise(resolve => {
        chrome.storage.sync.clear(resolve);
      });
    },
  },
  // You can add session storage as well if needed
  getStorageArea: (type: StorageEnum) => {
    switch (type) {
      case StorageEnum.Sync:
        return storage.sync;
      case StorageEnum.Local:
      default:
        return storage.local;
    }
  },
};
