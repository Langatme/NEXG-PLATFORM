// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
import { useTheme } from '@/theme';
import type { TextVariant } from '@/theme';
import React from 'react';
import { Text, TextProps } from 'react-native';

interface NexGTextProps extends TextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'accent' | 'error' | 'success' | 'warning';
  align?: 'left' | 'center' | 'right';
}

export const NexGText = ({
  variant = 'body',
  color = 'primary',
  align,
  style,
  ...props
}: NexGTextProps) => {
  const { colors, text } = useTheme();
  const colorMap = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    muted: colors.text.muted,
    inverse: colors.text.inverse,
    accent: colors.accent.primary,
    error: colors.status.error,
    success: colors.status.success,
    warning: colors.status.warning,
  } as const;
  return (
    <Text
      {...props}
      style={[
        text(variant),
        { color: colorMap[color] },
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
};
