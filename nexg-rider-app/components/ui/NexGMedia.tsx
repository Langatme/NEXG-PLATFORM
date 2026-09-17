// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import type { ResolvedMedia } from '@/utils/images';
import { NexGText } from './NexGText';

interface NexGMediaProps {
  /** Resolved media record (uri / thumbnail / alt / payout tile). */
  media?: ResolvedMedia | null;
  /** Caller-owned frame (caller owns sizing). */
  style?: object;
  emojiSize?: number;
  resizeMode?: 'cover' | 'contain';
  /** Show the small subcategory badge in the corner. */
  showBadge?: boolean;
  badgeEmoji?: string;
  /** Render the tiny "image unavailable" caption when the URL failed. */
  showUnavailableCaption?: boolean;
}

/**
 * NexGMedia — the app's single image primitive.
 *
 * Remote-first (expo-image, memory+disk cache, cross-dissolve transition).
 * Every state has a designed payout — never a black rectangle:
 *   - loading  → bundled placeholder + tinted category tile behind
 *   - loaded   → fades in over the tile
 *   - error / timeout / no URL → the designed payout tile (category emoji on a
 *     stable tint) with an optional "image unavailable" caption
 *   - offline  → bundled localSource (instant, from the app bundle)
 */
export const NexGMedia = ({
  media,
  style,
  emojiSize = 28,
  resizeMode = 'cover',
  showBadge = false,
  badgeEmoji,
  showUnavailableCaption = true,
}: NexGMediaProps) => {
  const { colors, radii, text } = useTheme();
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // expo-image can flash black on a slow/failing remote load. We never let it:
  // the bundled localSource is the placeholder, the payout tile is the backdrop,
  // and we only raise opacity once a frame actually decoded.
  const uri = media?.uri;
  const key = useMemo(() => uri ?? 'none', [uri]);
  const source = key !== 'none' && !failed ? { uri } : media?.localSource;
  const placeholder = media?.localSource;
  const tint = media?.tint ?? '#0D0D10';

  // Theme-aware 1px image outline + tile: tokens so both modes stay contrasted.
  // Applied on the caller-owned frame so it follows any caller radius.
  const outlineColor = colors.border.subtle;

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.surface.secondary, borderColor: outlineColor },
        style,
      ]}>
      {/* Designed payout / blank-state tile — ALWAYS visible behind the image. */}
      <View style={[styles.tile, { backgroundColor: `${tint}1F` }]}>
        <Text style={{ fontSize: emojiSize, lineHeight: emojiSize + 6 }}>{media?.emoji ?? '🛍️'}</Text>
        {failed && !source && showUnavailableCaption ? (
          <NexGText variant="caption" style={[styles.unavailableText, { color: colors.text.secondary }]}>
            image unavailable
          </NexGText>
        ) : null}
      </View>

      {source ? (
        <Image
          key={key}
          source={source}
          placeholder={placeholder}
          style={[StyleSheet.absoluteFill, { opacity: loaded ? 1 : 0 }]}
          contentFit={resizeMode}
          transition={220}
          cachePolicy="memory-disk"
          accessibilityLabel={media?.alt}
          accessibilityRole="image"
          onError={() => {
            if (!failed) {
              setFailed(true);
              setLoaded(false);
            }
          }}
          onLoad={() => setLoaded(true)}
        />
      ) : null}

      {showBadge && badgeEmoji ? (
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.background.elevated, borderRadius: radii.pill },
          ]}
          pointerEvents="none"
        >
          <NexGText variant="caption" style={{ fontSize: text('caption').fontSize }}>{badgeEmoji}</NexGText>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  tile: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableText: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    letterSpacing: 0.3,
  },
});