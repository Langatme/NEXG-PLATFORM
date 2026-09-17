// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Slice 3 (login-guest): Wolt-style entry gate. One primary CTA (Get started),
// one secondary (Log in), one optional tertiary (e.g. Scan a table code), and
// an always-visible ghost guest row with a caption — guest is never hidden
// behind a menu. All six apps share this layout; copy differs per app.
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { FadeInUp, useReducedMotion } from 'react-native-reanimated';
import { NexGButton } from './NexGButton';
import { NexGText } from './NexGText';
import { NexGWelcomeHero } from './NexGWelcomeHero';

interface NexGAuthGateProps {
  title: string;
  subtitle?: string;
  logo?: React.ReactNode;
  /** Uppercase eyebrow above the title (welcome-screen pattern). */
  eyebrow?: string;
  /** Hero visual rendered between the brand and the CTAs. */
  hero?: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  tertiaryLabel?: string;
  onTertiary?: () => void;
  /** Defaults to "Continue as guest". */
  guestLabel?: string;
  onGuest: () => void;
  guestCaption?: string;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const NexGAuthGate = ({
  title,
  subtitle,
  logo,
  eyebrow,
  hero,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  tertiaryLabel,
  onTertiary,
  guestLabel = 'Continue as guest',
  onGuest,
  guestCaption,
  loading = false,
  style,
  testID,
}: NexGAuthGateProps) => {
  const { colors } = useTheme();
  const reduce = useReducedMotion();
  const rise = (delay: number) => (reduce ? undefined : FadeInUp.delay(delay).duration(450));
  return (
    <View
      style={[styles.root, { backgroundColor: colors.background.primary }, style]}
      testID={testID}>
      <View style={styles.brand}>
        <NexGWelcomeHero logo={logo} eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </View>
      {hero ? <Animated.View entering={rise(100)}>{hero}</Animated.View> : null}
      <Animated.View entering={rise(160)} style={styles.ctas}>
        <NexGButton label={primaryLabel} loading={loading} onPress={onPrimary} />
        {secondaryLabel && onSecondary ? (
          <NexGButton label={secondaryLabel} variant="secondary" disabled={loading} onPress={onSecondary} />
        ) : null}
        {tertiaryLabel && onTertiary ? (
          <NexGButton label={tertiaryLabel} variant="secondary" disabled={loading} onPress={onTertiary} />
        ) : null}
      </Animated.View>
      <Animated.View entering={rise(240)} style={styles.guest}>
        <NexGButton label={guestLabel} variant="ghost" disabled={loading} onPress={onGuest} />
        {guestCaption ? (
          <NexGText variant="caption" color="muted" align="center">
            {guestCaption}
          </NexGText>
        ) : null}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 30, paddingBottom: 24, paddingTop: 80 },
  brand: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  ctas: { gap: 12, width: '100%' },
  guest: { paddingTop: 8 },
});
