// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Slice 3 (login-guest): the obvious-guest banner. Rendered at the top of
// guest-visible surfaces (home greeting, jobs board) so a guest always knows
// they are browsing without an account — and is one tap from signing in.
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { NexGText } from './NexGText';

interface NexGGuestBannerProps {
  message?: string;
  actionLabel?: string;
  onAction: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const NexGGuestBanner = ({
  message = 'Browsing as guest',
  actionLabel = 'Sign in',
  onAction,
  style,
  testID,
}: NexGGuestBannerProps) => {
  const { colors, radii } = useTheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${message}. ${actionLabel}`}
      onPress={onAction}
      testID={testID}
      style={[
        styles.banner,
        {
          backgroundColor: colors.status.infoSoft,
          borderColor: colors.status.info,
          borderRadius: radii.medium,
        },
        style,
      ]}>
      <NexGText variant="label" style={{ color: colors.status.info, flex: 1 }} numberOfLines={2}>
        {message}
      </NexGText>
      <NexGText variant="label" style={{ color: colors.status.info, textDecorationLine: 'underline' }}>
        {actionLabel}
      </NexGText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
});
