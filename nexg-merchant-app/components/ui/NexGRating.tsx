// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NexGText } from './NexGText';

export const NexGRating = ({ value, reviewCount }: { value: number; reviewCount?: number }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessible accessibilityRole="text" accessibilityLabel={`Rated ${value} out of 5${reviewCount ? ` from ${reviewCount} reviews` : ''}`}>
      <Ionicons name="star" size={13} color={colors.status.warning} />
      <NexGText variant="label" color="secondary" style={{ fontVariant: ['tabular-nums'] }}>
        {value.toFixed(1)}
        {reviewCount ? ` (${reviewCount.toLocaleString('en-KE')})` : ''}
      </NexGText>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
