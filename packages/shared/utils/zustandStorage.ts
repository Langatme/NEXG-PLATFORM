import { Platform } from 'react-native';
import { StateStorage } from 'zustand/middleware';

/** Minimal contract the MMKV instance satisfies; avoids untyped runtime checks. */
interface MmkvLike {
  set(key: string, value: string): void;
  getString(key: string): string | undefined;
  delete(key: string): void;
}

let storage: MmkvLike | null = null;

if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- MMKV is a native module with no web build; guarded fallback below
    const { createMMKV } = require('react-native-mmkv');
    storage = createMMKV();
  } catch (e) {
    console.warn('MMKV is not available, falling back to memory storage', e);
  }
}

const memoryStore = new Map<string, string>();

const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
    } else if (storage) {
      storage.set(name, value);
    } else {
      memoryStore.set(name, value);
    }
  },
  getItem: (name) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(name) ?? null;
    } else if (storage) {
      return storage.getString(name) ?? null;
    }
    return memoryStore.get(name) ?? null;
  },
  removeItem: (name) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name);
    } else if (storage) {
      storage.delete(name);
    } else {
      memoryStore.delete(name);
    }
  },
};

export default zustandStorage;

