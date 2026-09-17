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
