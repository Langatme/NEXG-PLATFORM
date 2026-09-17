import { NexGText } from './NexGText';
import { useTheme } from '@/theme';
import type { Palette } from '@/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export const NexGBadge = ({
  label,
  tone = 'neutral',
  icon,
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  icon?: string;
}) => {
  const { colors, radii } = useTheme();
  return (
    <View style={[styles.badge, badgeStyle(tone, colors), { borderRadius: radii.pill }]}>
      <NexGText variant="caption" style={{ color: textColor(tone, colors), fontWeight: '700' }}>
        {icon ? `${icon} ` : ''}
        {label}
      </NexGText>
    </View>
  );
};

const toneColors = (colors: Palette) =>
  ({
    neutral: { bg: colors.status.neutralSoft, fg: colors.status.neutral },
    success: { bg: colors.status.successSoft, fg: colors.status.success },
    warning: { bg: colors.status.warningSoft, fg: colors.status.warning },
    error: { bg: colors.status.errorSoft, fg: colors.status.error },
    info: { bg: colors.status.infoSoft, fg: colors.status.info },
    // Accent badge text uses the darker green (status.success) so the
    // soft-accent chip passes contrast in light mode (4.08:1 vs 2.91:1
    // for accent.primary on accent.soft). Same green family, accent lock holds.
    accent: { bg: colors.accent.soft, fg: colors.status.success },
  }) as const;

const badgeStyle = (tone: keyof ReturnType<typeof toneColors>, colors: Palette) => ({
  backgroundColor: toneColors(colors)[tone].bg,
});
const textColor = (tone: keyof ReturnType<typeof toneColors>, colors: Palette) =>
  toneColors(colors)[tone].fg;

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
});
