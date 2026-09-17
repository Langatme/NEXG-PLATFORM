// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
import { usePressScale } from '@/hooks/use-press-scale';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { NexGText } from './NexGText';

interface NexGChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Optional chrome icon rendered before the label. */
  icon?: keyof typeof Ionicons.glyphMap;
}

export const NexGChip = ({ label, selected = false, onPress, icon }: NexGChipProps) => {
  const { colors, radii } = useTheme();
  const { pressHandlers, pressStyle } = usePressScale();
  const iconColor = selected ? colors.text.inverse : colors.text.secondary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      {...pressHandlers}>
      <Animated.View
        style={[
          styles.chip,
          {
            borderRadius: radii.pill,
            backgroundColor: selected ? colors.surface.inverse : colors.surface.primary,
            borderColor: selected ? colors.surface.inverse : colors.border.subtle,
          },
          pressStyle,
        ]}>
        <View style={styles.inner}>
          {icon ? <Ionicons name={icon} size={16} color={iconColor} /> : null}
          <NexGText variant="label" style={{ color: selected ? colors.text.inverse : colors.text.secondary }}>
            {label}
          </NexGText>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
