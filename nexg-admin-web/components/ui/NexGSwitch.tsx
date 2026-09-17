// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Promoted from vendor/ahmedbna-ui-components (registry/src/components/ui/switch.tsx).
import { NexGText } from '@/components/ui/NexGText';
import { useHaptics } from '@/hooks/use-haptics';
import { useTheme } from '@/theme';
import React from 'react';
import {
  Switch as RNSwitch,
  SwitchProps as RNSwitchProps,
  TextStyle,
  View,
} from 'react-native';

export interface NexGSwitchProps extends RNSwitchProps {
  label?: string;
  error?: string;
  labelStyle?: TextStyle;
  haptic?: boolean;
}

export function NexGSwitch({
  label,
  error,
  labelStyle,
  haptic = true,
  onValueChange,
  ...props
}: NexGSwitchProps) {
  const { colors } = useTheme();
  const trackOffColor = colors.border.strong;
  const trackOnColor = colors.status.success;
  const feedback = useHaptics(haptic);

  const handleValueChange = React.useCallback(
    (value: boolean) => {
      feedback(value ? 'toggle-on' : 'toggle-off');
      onValueChange?.(value);
    },
    [feedback, onValueChange]
  );

  return (
    <View style={{ marginBottom: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 44,
        }}
      >
        {label && (
          <NexGText
            variant="caption"
            color={error ? 'error' : 'primary'}
            numberOfLines={2}
            ellipsizeMode="tail"
            style={[{ flex: 1, marginRight: 12 }, labelStyle]}
            pointerEvents="none"
          >
            {label}
          </NexGText>
        )}

        <RNSwitch
          trackColor={{ false: trackOffColor, true: trackOnColor }}
          thumbColor={props.value ? '#ffffff' : '#f4f3f4'}
          accessibilityLabel={label}
          accessibilityRole="switch"
          accessibilityState={{ disabled: props.disabled }}
          {...props}
          onValueChange={handleValueChange}
        />
      </View>

      {error && (
        <NexGText
          variant="caption"
          color="error"
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{ marginTop: 4 }}
          pointerEvents="none"
        >
          {error}
        </NexGText>
      )}
    </View>
  );
}
