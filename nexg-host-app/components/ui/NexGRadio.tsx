// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Promoted from vendor/ahmedbna-ui-components (registry/src/components/ui/radio.tsx).
import { NexGText } from '@/components/ui/NexGText';
import { useHaptics } from '@/hooks/use-haptics';
import { useTheme } from '@/theme';
import React from 'react';
import { TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface NexGRadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface NexGRadioGroupProps {
  options: NexGRadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  style?: ViewStyle;
  optionStyle?: ViewStyle;
  labelStyle?: TextStyle;
  haptic?: boolean;
}

export interface NexGRadioButtonProps {
  option: NexGRadioOption;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  haptic?: boolean;
}

const OUTER_SIZE = 26;
const INNER_SIZE = 16;

export function NexGRadioButton({
  option,
  selected,
  onPress,
  disabled = false,
  style,
  labelStyle,
  haptic = true,
}: NexGRadioButtonProps) {
  const { colors, radii } = useTheme();
  const activeColor = colors.accent.primary;
  const borderColor = colors.border.strong;
  const feedback = useHaptics(haptic);

  const isDisabled = disabled || option.disabled;

  // Re-tapping the option that is already selected is a no-op, so it should not
  // feel like one. RadioGroup deliberately does not fire its own — this is the
  // single source of feedback for the interaction.
  const handlePress = () => {
    if (!selected) feedback('selection');
    onPress();
  };

  const radioButtonStyle: ViewStyle = {
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: selected ? activeColor : borderColor,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  };

  const innerCircleStyle: ViewStyle = {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: radii.pill,
    backgroundColor: selected ? activeColor : 'transparent',
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    minHeight: 44,
    opacity: isDisabled ? 0.5 : 1,
  };

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      hitSlop={{ top: 9, bottom: 9, left: 9, right: 9 }}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: isDisabled }}
      accessibilityLabel={option.label}
    >
      <View style={radioButtonStyle}>
        <View style={innerCircleStyle} />
      </View>
      <NexGText
        color={isDisabled ? 'muted' : 'primary'}
        style={[{ fontSize: 17, lineHeight: 24 }, labelStyle]}
      >
        {option.label}
      </NexGText>
    </TouchableOpacity>
  );
}

export function NexGRadioGroup({
  options,
  value,
  onValueChange,
  disabled = false,
  orientation = 'vertical',
  style,
  optionStyle,
  labelStyle,
  haptic = true,
}: NexGRadioGroupProps) {
  const containerStyle: ViewStyle = {
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    gap: orientation === 'horizontal' ? 16 : 8,
  };

  const handlePress = (optionValue: string) => {
    if (onValueChange && !disabled) {
      onValueChange(optionValue);
    }
  };

  return (
    <View style={[containerStyle, style]} accessibilityRole="radiogroup">
      {options.map((option) => (
        <NexGRadioButton
          key={option.value}
          option={option}
          selected={value === option.value}
          onPress={() => handlePress(option.value)}
          disabled={disabled}
          style={optionStyle}
          labelStyle={labelStyle}
          haptic={haptic}
        />
      ))}
    </View>
  );
}
