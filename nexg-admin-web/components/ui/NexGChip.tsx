import { usePressScale } from '@/hooks/use-press-scale';
import { useTheme } from '@/theme';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { NexGText } from './NexGText';

interface NexGChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const NexGChip = ({ label, selected = false, onPress }: NexGChipProps) => {
  const { colors, radii } = useTheme();
  const { pressHandlers, pressStyle } = usePressScale();
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
        <NexGText variant="label" style={{ color: selected ? colors.text.inverse : colors.text.secondary }}>
          {label}
        </NexGText>
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
});
