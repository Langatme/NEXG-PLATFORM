import { NexGText } from '@/components/ui/NexGText';
import { usePressScale } from '@/hooks/use-press-scale';
import { useTheme } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

interface NexGButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
}

export const NexGButton = ({
  label,
  onPress,
  variant = 'primary',
  size = 'large',
  loading = false,
  disabled = false,
  icon,
  style,
}: NexGButtonProps) => {
  const { colors, radii } = useTheme();
  const { pressHandlers, pressStyle } = usePressScale();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary'
      ? colors.action.primary
      : variant === 'secondary'
        ? colors.action.secondary
        : variant === 'destructive'
          ? colors.status.errorSoft
          : 'transparent';
  const textColor =
    variant === 'primary'
      ? colors.text.onAction
      : variant === 'secondary'
        ? colors.text.primary
        : variant === 'destructive'
          ? colors.status.error
          : colors.text.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={() => {
        trackEvent('widget_actioned', { target: label });
        onPress?.();
      }}
      {...pressHandlers}>
      <Animated.View
        style={[
          styles.base,
          size === 'large' ? styles.large : styles.medium,
          { backgroundColor, borderRadius: radii.medium },
          pressStyle,
          { opacity: isDisabled ? 0.5 : 1 },
          style,
        ]}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <>
            {icon ? <Text style={{ color: textColor, marginRight: 6 }}>{icon}</Text> : null}
            <NexGText variant={size === 'large' ? 'bodyStrong' : 'label'} style={{ color: textColor }}>
              {label}
            </NexGText>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 52,
  },
  medium: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
  },
});
