// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Promoted from vendor/ahmedbna-ui-components (registry/src/components/ui/input-otp.tsx).
// Adaptations: NexG theme tokens (light+dark) instead of vendor globals, NexGText
// slots, radii.medium (14) instead of pill corners to match the NexG family.
// Behavior preserved: hidden-TextInput mechanics, Android keyboard guards,
// a11y roles, haptic only on complete (system keyboard already clicks per key).
import { NexGText } from '@/components/ui/NexGText';
import { useHaptics } from '@/hooks/use-haptics';
import { useTheme } from '@/theme';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  TextInput,
  TextInputKeyPressEventData,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

export interface NexGOTPInputProps extends Omit<
  TextInputProps,
  'style' | 'value' | 'onChangeText'
> {
  /** Number of OTP digits */
  length?: number;
  /** Current OTP value */
  value?: string;
  /** Called when OTP value changes */
  onChangeText?: (value: string) => void;
  /** Called when OTP is complete */
  onComplete?: (value: string) => void;
  /** Error message to display */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Individual slot style */
  slotStyle?: ViewStyle;
  /** Error style */
  errorStyle?: TextStyle;
  /** Whether to mask the input (show dots instead of numbers) */
  masked?: boolean;
  /** Separator component between slots */
  separator?: React.ReactNode;
  /** Whether to show cursor in active slot */
  showCursor?: boolean;
  /** Whether to trigger haptic feedback when the code is complete */
  haptic?: boolean;
}

export interface NexGOTPInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
}

const SLOT_SIZE = 58;

export const NexGOTPInput = forwardRef<NexGOTPInputRef, NexGOTPInputProps>(
  (
    {
      length = 6,
      value = '',
      onChangeText,
      onComplete,
      error,
      disabled = false,
      containerStyle,
      slotStyle,
      errorStyle,
      masked = false,
      separator,
      showCursor = true,
      haptic = true,
      onFocus,
      onBlur,
      ...textInputProps
    },
    ref
  ) => {
    const { colors, radii } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const refocusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Android dismisses the keyboard (back button, swipe down) without blurring
    // the input, so tracking it is the only way to tell "still typing" from
    // "focused, keyboard gone" when a slot is pressed. See focusInput below.
    const keyboardVisible = useRef(false);
    const feedback = useHaptics(haptic);

    useEffect(() => {
      const subscriptions =
        Platform.OS === 'android'
          ? [
              Keyboard.addListener('keyboardDidShow', () => {
                keyboardVisible.current = true;
              }),
              Keyboard.addListener('keyboardDidHide', () => {
                keyboardVisible.current = false;
              }),
            ]
          : [];
      return () => {
        subscriptions.forEach((subscription) => subscription.remove());
        if (refocusTimeout.current) clearTimeout(refocusTimeout.current);
      };
    }, []);

    const focusInput = useCallback(() => {
      // On Android the input stays focused after the keyboard is dismissed and
      // no onBlur fires, which makes focus() a no-op — the keyboard never comes
      // back. Cycling blur -> focus reopens it. Guarded on the keyboard being
      // down so pressing a slot mid-entry doesn't flash the keyboard closed.
      if (
        Platform.OS === 'android' &&
        !keyboardVisible.current &&
        inputRef.current?.isFocused()
      ) {
        inputRef.current.blur();
        if (refocusTimeout.current) clearTimeout(refocusTimeout.current);
        refocusTimeout.current = setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
        return;
      }
      inputRef.current?.focus();
    }, []);

    const slotBg = colors.surface.primary;
    const slotBgDisabled = colors.surface.secondary;
    const digitColor = colors.text.primary;
    const mutedColor = colors.text.muted;
    const borderIdle = colors.border.strong;
    const borderActive = colors.accent.primary;
    const danger = colors.status.error;

    // Normalize value to ensure it doesn't exceed length
    const normalizedValue = value.slice(0, length);

    // Calculate active index based on current value
    const currentActiveIndex = Math.min(normalizedValue.length, length - 1);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focus: focusInput,
      blur: () => {
        if (refocusTimeout.current) clearTimeout(refocusTimeout.current);
        inputRef.current?.blur();
      },
      clear: () => {
        onChangeText?.('');
      },
      getValue: () => normalizedValue,
    }));

    const handleChangeText = useCallback(
      (text: string) => {
        // Only allow numeric input
        const cleanText = text.replace(/[^0-9]/g, '');
        const limitedText = cleanText.slice(0, length);
        onChangeText?.(limitedText);
        // Call onComplete when OTP is fully entered.
        // Deliberately the only haptic here: the system keyboard already emits
        // its own key click, so a per-keystroke buzz would double up on the one
        // interaction the user repeats `length` times.
        if (limitedText.length === length) {
          feedback('success');
          onComplete?.(limitedText);
        }
      },
      [length, onChangeText, onComplete, feedback]
    );

    const handleKeyPress = useCallback(
      (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
        const { key } = e.nativeEvent;
        if (key === 'Backspace' && normalizedValue.length > 0) {
          const newValue = normalizedValue.slice(0, -1);
          onChangeText?.(newValue);
        }
      },
      [normalizedValue, onChangeText]
    );

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    const handleSlotPress = useCallback(() => {
      if (!disabled) {
        focusInput();
      }
    }, [disabled, focusInput]);

    // Generate slots
    const slots = Array.from({ length }, (_, index) => {
      const hasValue = index < normalizedValue.length;
      const isActive = isFocused && index === currentActiveIndex;
      const displayValue = hasValue
        ? masked
          ? '•'
          : normalizedValue[index]
        : '';
      return (
        <React.Fragment key={index}>
          <Pressable
            onPress={handleSlotPress}
            disabled={disabled}
            accessibilityRole="keyboardkey"
            accessibilityLabel={
              hasValue
                ? `Digit ${index + 1} of ${length}, ${masked ? 'filled' : normalizedValue[index]}`
                : `Digit ${index + 1} of ${length}, empty`
            }
            accessibilityState={{ disabled, selected: isActive }}
            style={[
              {
                width: SLOT_SIZE,
                height: SLOT_SIZE,
                borderRadius: radii.medium,
                borderWidth: isActive ? 2 : 1,
                borderColor: error ? danger : isActive ? borderActive : borderIdle,
                backgroundColor: disabled ? slotBgDisabled : slotBg,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: disabled ? 0.6 : 1,
              },
              slotStyle,
            ]}
          >
            <NexGText
              variant="title"
              style={{
                fontSize: 22,
                lineHeight: 28,
                fontVariant: ['tabular-nums'],
                color: error ? danger : hasValue ? digitColor : mutedColor,
              }}
            >
              {displayValue}
            </NexGText>
            {showCursor && isActive && !hasValue && (
              <View
                style={{
                  position: 'absolute',
                  width: 2,
                  height: 20,
                  backgroundColor: borderActive,
                  opacity: isFocused ? 1 : 0,
                }}
              />
            )}
          </Pressable>
          {separator && index < length - 1 && (
            <View style={{ marginHorizontal: 4 }}>{separator}</View>
          )}
        </React.Fragment>
      );
    });

    return (
      <View style={containerStyle}>
        {/* Hidden TextInput for handling input */}
        <TextInput
          ref={inputRef}
          value={normalizedValue}
          onChangeText={handleChangeText}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="numeric"
          maxLength={length}
          editable={!disabled}
          selectionColor="transparent"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          accessibilityLabel="One-time passcode"
          style={{ position: 'absolute', left: -9999, opacity: 0, fontSize: 16 }}
          {...textInputProps}
        />
        {/* OTP Slots */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: separator ? 0 : 8,
          }}
        >
          {slots}
        </View>
        {/* Error Message */}
        {error && (
          <NexGText
            variant="caption"
            color="error"
            align="center"
            accessibilityLiveRegion="polite"
            style={[{ marginTop: 8 }, errorStyle]}
          >
            {error}
          </NexGText>
        )}
      </View>
    );
  }
);

NexGOTPInput.displayName = 'NexGOTPInput';

/** Preset with dash separators (3-3 grouping reads best at length 6). */
export const NexGOTPInputWithSeparator = forwardRef<
  NexGOTPInputRef,
  Omit<NexGOTPInputProps, 'separator'>
>((props, ref) => {
  const { colors } = useTheme();
  return (
    <NexGOTPInput
      ref={ref}
      separator={
        <NexGText variant="heading" style={{ color: colors.text.muted }}>
          -
        </NexGText>
      }
      {...props}
    />
  );
});

NexGOTPInputWithSeparator.displayName = 'NexGOTPInputWithSeparator';
