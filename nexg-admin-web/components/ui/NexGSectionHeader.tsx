import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import { NexGText } from './NexGText';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const NexGSectionHeader = ({ title, actionLabel, onAction }: SectionHeaderProps) => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <NexGText variant="heading">{title}</NexGText>
      {actionLabel && onAction && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}>
          <View style={styles.action}>
            <NexGText variant="label" style={{ color: colors.text.muted }}>
              {actionLabel}
            </NexGText>
            <Ionicons name="chevron-forward" size={14} color={colors.text.muted} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
