// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface NexGSearchBarProps extends TextInputProps {
  onPress?: () => void;
  editable?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

/**
 * Pill search field. When `onPress` is provided it renders as a
 * non-editable launcher (used on Home); otherwise it behaves as a real input.
 */
export const NexGSearchBar = ({
  onPress,
  editable = true,
  rightIcon,
  onRightPress,
  ...inputProps
}: NexGSearchBarProps) => {
  const { colors, radii } = useTheme();
  const containerStyle = [styles.container, { backgroundColor: colors.surface.primary, borderRadius: radii.pill }];

  if (!editable) {
    return (
      <TouchableOpacity
        accessibilityRole="search"
        accessibilityLabel="Search NEXG"
        activeOpacity={0.8}
        onPress={onPress}
        style={containerStyle}>
        <Ionicons name="search" size={18} color={colors.text.muted} />
        <View style={styles.placeholderBox}>
          <TextInput
            {...inputProps}
            editable={false}
            pointerEvents="none"
            accessible={false}
            style={[styles.input, { color: colors.text.muted }]}
          />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      <Ionicons name="search" size={18} color={colors.text.muted} />
      <TextInput
        {...inputProps}
        editable={editable}
        style={[styles.input, { color: colors.text.primary }]}
        placeholderTextColor={colors.text.muted}
        accessibilityRole="search"
        accessibilityLabel={inputProps.accessibilityLabel ?? inputProps.placeholder ?? 'Search'}
      />
      {rightIcon && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={String(rightIcon).replace(/-/g, ' ')}
          onPress={onRightPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name={rightIcon} size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    height: 48,
  },
  placeholderBox: { flex: 1 },
  input: { flex: 1, fontSize: 16, padding: 0 },
});
