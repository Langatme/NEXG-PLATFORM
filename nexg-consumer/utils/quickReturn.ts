import zustandStorage from './zustandStorage';

const K_LAST = 'nexg-last-merchant';

/** Remembers the last-viewed merchant for quick return surfaces. Best-effort, never throws. */
export function registerQuickReturn(merchantId: string): void {
  try {
    zustandStorage.setItem(K_LAST, merchantId);
  } catch {
    // ignore — convenience only
  }
}

export function lastMerchantId(): string | null {
  try {
    // SAFETY: zustandStorage returns synchronously (MMKV getString / localStorage /
    // memory Map all return string | null); the StateStorage Promise arm is unused.
    return zustandStorage.getItem(K_LAST) as string | null;
  } catch {
    return null;
  }
}
