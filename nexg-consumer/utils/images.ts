// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
import type { ImageRequireSource } from 'react-native';

export interface ResolvedMedia {
  uri?: string;
  thumbnailUri?: string;
  alt?: string;
  emoji: string;
  tint: string;
  localSource?: ImageRequireSource;
}

/** Backend media reference → ResolvedMedia. `media://key` placeholders render the tile until S3 URLs land. */
export function mediaFromKey(
  ref: string | null | undefined,
  fallback: { emoji?: string; tint?: string; alt?: string } = {}
): ResolvedMedia {
  const base: ResolvedMedia = {
    emoji: fallback.emoji ?? '🏪',
    tint: fallback.tint ?? '#00A26B',
    alt: fallback.alt,
  };
  if (!ref) return base;
  if (ref.startsWith('media://')) return base; // placeholder key → designed tile
  return { ...base, uri: ref };
}

interface MerchantLike {
  heroImageKey?: string;
  accentEmoji?: string;
  name?: string;
}

interface ItemLike {
  imageKey?: string;
  name?: string;
}

/** Consumer-owned resolvers (kept here, not in shared, because tile fallbacks are consumer UX). */
export function resolveMerchantMedia(m: MerchantLike, _w = 1200): ResolvedMedia {
  return mediaFromKey(m.heroImageKey, { emoji: m.accentEmoji ?? '🏪', alt: m.name });
}

export function resolveItemMedia(item: ItemLike): ResolvedMedia {
  return mediaFromKey(item.imageKey, { emoji: '🍽️', alt: item.name });
}
