// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NexGText } from './NexGText';

interface NexGQuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const NexGQuantitySelector = ({ quantity, onIncrement, onDecrement }: NexGQuantitySelectorProps) => {
  const { colors, radii } = useTheme();
  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface.secondary, borderRadius: radii.pill }]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        accessibilityState={{ disabled: quantity <= 1 }}
        onPress={onDecrement}
        disabled={quantity <= 1}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        style={[styles.btn, { opacity: quantity <= 1 ? 0.4 : 1 }]}>
        <Text accessible={false} style={{ color: colors.text.primary, fontSize: 20 }}>−</Text>
      </TouchableOpacity>
      <NexGText
        variant="numeric"
        style={{ minWidth: 24, textAlign: 'center', fontVariant: ['tabular-nums'] }}
        accessibilityLabel={`Quantity ${quantity}`}
        accessibilityLiveRegion="polite"
      >
        {quantity}
      </NexGText>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        onPress={onIncrement}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        style={styles.btn}>
        <Text accessible={false} style={{ color: colors.text.primary, fontSize: 18 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
