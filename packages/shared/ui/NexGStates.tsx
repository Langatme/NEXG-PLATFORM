import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NexGButton } from './NexGButton';
import { NexGText } from './NexGText';

interface NexGEmptyStateProps {
  emoji: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const NexGEmptyState = ({ emoji, title, message, actionLabel, onAction }: NexGEmptyStateProps) => {
  const { colors, radii, spacing } = useTheme();
  return (
    <View
      style={[styles.container, { paddingVertical: spacing.xxl * 1.5, paddingHorizontal: spacing.lg }]}>
      <View style={[styles.emojiWrap, { backgroundColor: colors.surface.secondary, borderRadius: radii.large }]}>
        <NexGText variant="display" style={{ fontSize: 36 }} accessible={false}>{emoji}</NexGText>
      </View>
      <NexGText variant="heading" align="center" style={{ marginTop: spacing.lg }}>
        {title}
      </NexGText>
      <NexGText variant="body" color="muted" align="center" style={{ marginTop: spacing.sm }}>
        {message}
      </NexGText>
      {actionLabel && onAction && (
        <View style={{ marginTop: spacing.xl }}>
          <NexGButton label={actionLabel} onPress={onAction} size="medium" />
        </View>
      )}
    </View>
  );
};

interface NexGErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const NexGErrorState = ({
  title = 'Something went wrong',
  message = "This didn't load. Your data is safe — please try again.",
  onRetry,
}: NexGErrorStateProps) => {
  const { colors } = useTheme();
  return (
    <View style={styles.centered} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Ionicons name="cloud-offline-outline" size={40} color={colors.status.error} />
      <NexGText variant="heading" align="center" style={{ marginTop: 12 }}>
        {title}
      </NexGText>
      <NexGText variant="caption" color="muted" align="center" style={{ marginTop: 6 }}>
        {message}
      </NexGText>
      {onRetry && (
        <View style={{ marginTop: 20 }}>
          <NexGButton label="Try again" onPress={onRetry} size="medium" variant="secondary" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  emojiWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});
