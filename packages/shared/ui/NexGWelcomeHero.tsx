// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Onboarding-refresh: the shared welcome hero. Pattern adapted from
// vendor/top-welcome-screens (scrl/yazio/duolingo): eyebrow + brand + staged
// entrance — rebuilt on NexG tokens/type, responsive layout, no fixed
// geometry, no vendor assets. Used by NexGAuthGate and the merchant/rider/
// host entry gates so every welcome moment shares one motion language.
import React from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, { FadeInUp, useReducedMotion } from 'react-native-reanimated';
import { NexGText } from './NexGText';

interface NexGWelcomeHeroProps {
  logo?: React.ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Stagger base in ms — gates pass increasing delays per block. */
  delay?: number;
  style?: ViewStyle;
  testID?: string;
}

export const NexGWelcomeHero = ({
  logo,
  eyebrow,
  title,
  subtitle,
  delay = 0,
  style,
  testID,
}: NexGWelcomeHeroProps) => {
  const reduce = useReducedMotion();
  return (
    <Animated.View
      entering={reduce ? undefined : FadeInUp.delay(delay).duration(450)}
      style={[styles.hero, style]}
      testID={testID}>
      {logo}
      {eyebrow ? (
        <NexGText variant="label" color="accent" align="center" style={styles.eyebrow}>
          {eyebrow}
        </NexGText>
      ) : null}
      <NexGText variant="display" align="center">
        {title}
      </NexGText>
      {subtitle ? (
        <NexGText variant="title" align="center" color="muted">
          {subtitle}
        </NexGText>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  hero: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  eyebrow: { textTransform: 'uppercase', letterSpacing: 2 },
});
