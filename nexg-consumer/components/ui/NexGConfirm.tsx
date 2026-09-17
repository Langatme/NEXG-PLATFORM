import { useTheme } from '@/theme';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { NexGButton } from './NexGButton';
import { NexGText } from './NexGText';

interface NexGConfirmProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  destructive?: boolean;
  loading?: boolean;
}

/**
 * Destructive-action confirmation. Modals stay centered (scale-origin exempt),
 * enter from scale(0.96)+opacity, and exit faster than they enter.
 */
export const NexGConfirm = ({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
  destructive = true,
  loading = false,
}: NexGConfirmProps) => {
  const { colors, radii, spacing } = useTheme();
  const [mounted, setMounted] = useState(open);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      progress.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System });
    } else if (mounted) {
      progress.value = withTiming(0, { duration: 140, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System });
      const t = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.96 + 0.04 * progress.value }],
  }));

  if (!mounted) return null;

  return (
    <Modal transparent visible onRequestClose={onClose} animationType="none">
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, backdropStyle]} />
        <View style={styles.center}>
          <Animated.View
            style={[
              styles.card,
              cardStyle,
              { backgroundColor: colors.surface.primary, borderRadius: radii.large, padding: spacing.xl },
            ]}>
            <NexGText variant="heading" align="center">
              {title}
            </NexGText>
            <NexGText variant="body" color="secondary" align="center" style={{ marginTop: spacing.sm }}>
              {message}
            </NexGText>
            <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
              <NexGButton
                label={loading ? 'Processing…' : confirmLabel}
                variant={destructive ? 'destructive' : 'primary'}
                onPress={onConfirm}
                loading={loading}
              />
              <NexGButton label="Go back" variant="secondary" onPress={onClose} />
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
});
