import { NexGText } from './NexGText';
import { useTheme } from '@/theme';
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
  const { radii } = useTheme();
  return (
    <View style={[styles.badge, badgeStyle(tone), { borderRadius: radii.pill }]}>
      <NexGText variant="caption" style={{ color: textColor(tone), fontWeight: '700' }}>
        {icon ? `${icon} ` : ''}
        {label}
      </NexGText>
    </View>
  );
};

const tones = {
  neutral: { bg: 'rgba(0,0,0,0.55)', fg: '#FFFFFF' },
  success: { bg: 'rgba(6,78,59,0.75)', fg: '#D1FAE5' },
  warning: { bg: 'rgba(120,53,15,0.75)', fg: '#FEF3C7' },
  error: { bg: 'rgba(127,29,29,0.8)', fg: '#FEE2E2' },
  info: { bg: 'rgba(30,58,138,0.75)', fg: '#DBEAFE' },
  accent: { bg: 'rgba(0,162,107,0.85)', fg: '#FFFFFF' },
} as const;

const badgeStyle = (tone: keyof typeof tones) => ({ backgroundColor: tones[tone].bg });
const textColor = (tone: keyof typeof tones) => tones[tone].fg;

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
