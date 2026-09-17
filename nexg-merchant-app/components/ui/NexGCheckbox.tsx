// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Promoted from vendor/ahmedbna-ui-components (registry/src/components/ui/checkbox.tsx).
import { NexGText } from '@/components/ui/NexGText';
import { useHaptics } from '@/hooks/use-haptics';
import { useTheme } from '@/theme';
import { Check } from 'lucide-react-native';
import React from 'react';
import { TextStyle, TouchableOpacity, View } from 'react-native';

export interface NexGCheckboxProps {
  checked: boolean;
  label?: string;
  error?: string;
  disabled?: boolean;
  labelStyle?: TextStyle;
  onCheckedChange: (checked: boolean) => void;
  accessibilityLabel?: string;
  haptic?: boolean;
}

const BOX_SIZE = 26;

export function NexGCheckbox({
  checked,
  error,
  disabled = false,
  label,
  labelStyle,
  onCheckedChange,
  accessibilityLabel,
  haptic = true,
}: NexGCheckboxProps) {
  const { colors, radii } = useTheme();
  const activeColor = colors.accent.primary;
  const checkColor = colors.text.onAction;
  const borderColor = colors.border.strong;
  const feedback = useHaptics(haptic);

  const handlePress = () => {
    if (disabled) return;
    feedback(checked ? 'toggle-off' : 'toggle-on');
    onCheckedChange(!checked);
  };

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
        paddingVertical: 4,
        minHeight: 44,
      }}
      onPress={handlePress}
      disabled={disabled}
      hitSlop={{ top: 9, bottom: 9, left: 9, right: 9 }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <View
        style={{
          width: BOX_SIZE,
          height: BOX_SIZE,
          borderRadius: radii.pill,
          borderWidth: 1.5,
          borderColor: checked ? activeColor : borderColor,
          backgroundColor: checked ? activeColor : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: label ? 8 : 0,
        }}
      >
        {checked && (
          <Check
            size={16}
            color={checkColor}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        )}
      </View>
      {label && (
        <NexGText
          variant="caption"
          color={error ? 'error' : 'primary'}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={labelStyle}
          pointerEvents="none"
        >
          {label}
        </NexGText>
      )}
    </TouchableOpacity>
  );
}
