// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Promoted from vendor/ahmedbna-ui-components (registry/src/components/ui/input.tsx).
// Adaptations: NexG tokens via useTheme (surface/text/border/accent/status),
// radii.pill input / radii.large textarea+group, vendor Icon wrapper replaced with
// direct lucide render, vendor Text -> NexGText. Behavior preserved: label/error/
// adornment API, filled+outline variants, textarea rows, grouped variants, a11y labels.
import { NexGText } from '@/components/ui/NexGText';
import { useTheme } from '@/theme';
import type { LucideProps } from 'lucide-react-native';
import React, { forwardRef, useState } from 'react';
import {
  Pressable,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

/**
 * Domain guard: the adornment prop is either a renderable node or a render function.
 * `instanceof Function` separates the two union members exactly (elements, strings and
 * numbers are never Functions; arrows, declarations and component types always are).
 */
function isRenderFunction(
  value: React.ReactNode | (() => React.ReactNode)
): value is () => React.ReactNode {
  return value instanceof Function;
}

export interface NexGInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<LucideProps>;
  rightComponent?: React.ReactNode | (() => React.ReactNode);
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  variant?: 'filled' | 'outline';
  disabled?: boolean;
  type?: 'input' | 'textarea';
  placeholder?: string;
  rows?: number; // Only used when type="textarea"
}

export const NexGInput = forwardRef<TextInput, NexGInputProps>(
  (
    {
      label,
      error,
      icon: LeftIcon,
      rightComponent,
      containerStyle,
      inputStyle,
      labelStyle,
      errorStyle,
      variant = 'filled',
      disabled = false,
      type = 'input',
      rows = 4,
      onFocus,
      onBlur,
      placeholder,
      ...props
    },
    ref
  ) => {
    const { colors, radii, spacing } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Theme colors
    const cardColor = colors.surface.primary;
    const textColor = colors.text.primary;
    const muted = colors.text.muted;
    const borderColor = colors.border.strong;
    const primary = colors.accent.primary;
    const danger = colors.status.error;

    const isTextarea = type === 'textarea';

    // Calculate height based on type
    const getHeight = () => {
      if (isTextarea) {
        return rows * 20 + 32; // Approximate line height + padding
      }
      return 48;
    };

    // Variant styles
    const getVariantStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        borderRadius: isTextarea ? radii.large : radii.pill,
        flexDirection: isTextarea ? 'column' : 'row',
        alignItems: isTextarea ? 'stretch' : 'center',
        minHeight: getHeight(),
        paddingHorizontal: spacing.lg,
        paddingVertical: isTextarea ? spacing.md : 0,
      };

      switch (variant) {
        case 'outline':
          return {
            ...baseStyle,
            borderWidth: 1,
            borderColor: error ? danger : isFocused ? primary : borderColor,
            backgroundColor: 'transparent',
          };
        case 'filled':
        default:
          return {
            ...baseStyle,
            borderWidth: 1,
            borderColor: error ? danger : cardColor,
            backgroundColor: disabled ? muted + '20' : cardColor,
          };
      }
    };

    const getInputStyle = (): TextStyle => ({
      flex: 1,
      fontSize: 16,
      lineHeight: isTextarea ? 22 : undefined,
      color: disabled ? muted : error ? danger : textColor,
      paddingVertical: 0, // Remove default padding
      textAlignVertical: isTextarea ? 'top' : 'center',
    });

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Render right component - supports both direct components and functions
    const renderRightComponent = () => {
      if (!rightComponent) return null;

      // If it's a function, call it. Otherwise, render directly
      return isRenderFunction(rightComponent)
        ? rightComponent()
        : rightComponent;
    };

    const renderInputContent = () => (
      <View style={containerStyle}>
        {/* Input Container */}
        <Pressable
          style={[getVariantStyle(), disabled && { opacity: 0.6 }]}
          onPress={() => {
            if (!disabled && ref && 'current' in ref && ref.current) {
              ref.current.focus();
            }
          }}
          disabled={disabled}
        >
          {isTextarea ? (
            // Textarea Layout (Column)
            <>
              {/* Header section with icon, label, and right component */}
              {(LeftIcon || label || rightComponent) && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: spacing.sm,
                    gap: spacing.sm,
                  }}
                >
                  {/* Left section - Icon + Label */}
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.sm,
                    }}
                    pointerEvents="none"
                  >
                    {LeftIcon && (
                      <LeftIcon
                        size={16}
                        color={error ? danger : muted}
                        strokeWidth={1.8}
                      />
                    )}
                    {label && (
                      <NexGText
                        variant="body"
                        color={error ? 'error' : 'muted'}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[labelStyle]}
                        pointerEvents="none"
                      >
                        {label}
                      </NexGText>
                    )}
                  </View>

                  {/* Right Component */}
                  {renderRightComponent()}
                </View>
              )}

              {/* TextInput section */}
              <TextInput
                ref={ref}
                multiline
                numberOfLines={rows}
                style={[getInputStyle(), inputStyle]}
                placeholderTextColor={error ? danger + '99' : muted}
                placeholder={placeholder || 'Type your message...'}
                onFocus={handleFocus}
                onBlur={handleBlur}
                editable={!disabled}
                selectionColor={primary}
                accessibilityLabel={label}
                accessibilityState={{ disabled: !!disabled }}
                {...props}
              />
            </>
          ) : (
            // Input Layout (Row)
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              {/* Left section - Icon + Label (fixed width to simulate grid column) */}
              <View
                style={{
                  width: label ? 120 : 'auto',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
                pointerEvents="none"
              >
                {LeftIcon && (
                  <LeftIcon
                    size={16}
                    color={error ? danger : muted}
                    strokeWidth={1.8}
                  />
                )}
                {label && (
                  <NexGText
                    variant="body"
                    color={error ? 'error' : 'muted'}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[labelStyle]}
                    pointerEvents="none"
                  >
                    {label}
                  </NexGText>
                )}
              </View>

              {/* TextInput section - takes remaining space */}
              <View style={{ flex: 1 }}>
                <TextInput
                  ref={ref}
                  style={[getInputStyle(), inputStyle]}
                  placeholderTextColor={error ? danger + '99' : muted}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  editable={!disabled}
                  placeholder={placeholder}
                  selectionColor={primary}
                  accessibilityLabel={label}
                  accessibilityState={{ disabled: !!disabled }}
                  {...props}
                />
              </View>

              {/* Right Component */}
              {renderRightComponent()}
            </View>
          )}
        </Pressable>

        {/* Error Message */}
        {error && (
          <NexGText
            variant="label"
            color="error"
            accessibilityLiveRegion="polite"
            style={[{ marginLeft: 14, marginTop: spacing.xs }, errorStyle]}
          >
            {error}
          </NexGText>
        )}
      </View>
    );

    return renderInputContent();
  }
);

NexGInput.displayName = 'NexGInput';

export interface NexGGroupedInputProps {
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  title?: string;
  titleStyle?: TextStyle;
}

export const NexGGroupedInput = ({
  children,
  containerStyle,
  title,
  titleStyle,
}: NexGGroupedInputProps) => {
  const { colors, radii, spacing } = useTheme();
  const border = colors.border.subtle;
  const background = colors.surface.primary;

  const childrenArray = React.Children.toArray(children);

  const errors = childrenArray
    .filter(
      (child): child is React.ReactElement<{ error?: string }> =>
        React.isValidElement<{ error?: string }>(child) &&
        !!child.props.error
    )
    .map((child) => child.props.error);

  const renderGroupedContent = () => (
    <View style={containerStyle}>
      {!!title && (
        <NexGText
          variant="title"
          style={[{ marginBottom: spacing.sm, marginLeft: spacing.sm }, titleStyle]}
        >
          {title}
        </NexGText>
      )}

      <View
        style={{
          backgroundColor: background,
          borderColor: border,
          borderWidth: 1,
          borderRadius: radii.large,
          overflow: 'hidden',
        }}
      >
        {childrenArray.map((child, index) => (
          <View
            key={index}
            style={{
              minHeight: 48,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              justifyContent: 'center',
              borderBottomWidth: index !== childrenArray.length - 1 ? 1 : 0,
              borderColor: border,
            }}
          >
            {child}
          </View>
        ))}
      </View>

      {errors.length > 0 && (
        <View style={{ marginTop: 6 }}>
          {errors.map((error, i) => (
            <NexGText
              key={i}
              variant="label"
              color="error"
              accessibilityLiveRegion="polite"
              style={{
                marginTop: i === 0 ? 0 : 1,
                marginLeft: spacing.sm,
              }}
            >
              {error}
            </NexGText>
          ))}
        </View>
      )}
    </View>
  );

  return renderGroupedContent();
};

export interface NexGGroupedInputItemProps
  extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<LucideProps>;
  rightComponent?: React.ReactNode | (() => React.ReactNode);
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  disabled?: boolean;
  type?: 'input' | 'textarea';
  rows?: number; // Only used when type="textarea"
}

export const NexGGroupedInputItem = forwardRef<
  TextInput,
  NexGGroupedInputItemProps
>(
  (
    {
      label,
      error,
      icon: LeftIcon,
      rightComponent,
      inputStyle,
      labelStyle,
      // Kept for NexGInput API parity; grouped items surface errors via NexGGroupedInput.
      errorStyle: _errorStyle,
      disabled,
      type = 'input',
      rows = 3,
      onFocus,
      onBlur,
      placeholder,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();

    const text = colors.text.primary;
    const muted = colors.text.muted;
    const primary = colors.accent.primary;
    const danger = colors.status.error;

    const isTextarea = type === 'textarea';

    const handleFocus = (e: any) => {
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      onBlur?.(e);
    };

    const renderRightComponent = () => {
      if (!rightComponent) return null;
      return isRenderFunction(rightComponent)
        ? rightComponent()
        : rightComponent;
    };

    const renderItemContent = () => (
      <Pressable
        onPress={() => ref && 'current' in ref && ref.current?.focus()}
        disabled={disabled}
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        <View
          style={{
            flexDirection: isTextarea ? 'column' : 'row',
            alignItems: isTextarea ? 'stretch' : 'center',
            backgroundColor: 'transparent',
          }}
        >
          {isTextarea ? (
            // Textarea Layout (Column)
            <>
              {/* Header section with icon, label, and right component */}
              {(LeftIcon || label || rightComponent) && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                    gap: 8,
                  }}
                >
                  {/* Icon & Label */}
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    pointerEvents="none"
                  >
                    {LeftIcon && (
                      <LeftIcon
                        size={16}
                        color={error ? danger : muted}
                        strokeWidth={1.8}
                      />
                    )}
                    {label && (
                      <NexGText
                        variant="body"
                        color={error ? 'error' : 'muted'}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[labelStyle]}
                        pointerEvents="none"
                      >
                        {label}
                      </NexGText>
                    )}
                  </View>

                  {/* Right Component */}
                  {renderRightComponent()}
                </View>
              )}

              {/* Textarea Input */}
              <TextInput
                ref={ref}
                multiline
                numberOfLines={rows}
                style={[
                  {
                    fontSize: 16,
                    lineHeight: 22,
                    color: disabled ? muted : error ? danger : text,
                    textAlignVertical: 'top',
                    paddingVertical: 0,
                    minHeight: rows * 20,
                  },
                  inputStyle,
                ]}
                placeholderTextColor={error ? danger + '99' : muted}
                placeholder={placeholder || 'Type your message...'}
                editable={!disabled}
                selectionColor={primary}
                onFocus={handleFocus}
                onBlur={handleBlur}
                accessibilityLabel={label}
                accessibilityState={{ disabled: !!disabled }}
                {...props}
              />
            </>
          ) : (
            // Input Layout (Row)
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {/* Icon & Label */}
              <View
                style={{
                  width: label ? 120 : 'auto',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
                pointerEvents="none"
              >
                {LeftIcon && (
                  <LeftIcon
                    size={16}
                    color={error ? danger : muted}
                    strokeWidth={1.8}
                  />
                )}
                {label && (
                  <NexGText
                    variant="body"
                    color={error ? 'error' : 'muted'}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[labelStyle]}
                    pointerEvents="none"
                  >
                    {label}
                  </NexGText>
                )}
              </View>

              {/* Input */}
              <View style={{ flex: 1 }}>
                <TextInput
                  ref={ref}
                  style={[
                    {
                      flex: 1,
                      fontSize: 16,
                      color: disabled ? muted : error ? danger : text,
                      paddingVertical: 0,
                    },
                    inputStyle,
                  ]}
                  placeholder={placeholder}
                  placeholderTextColor={error ? danger + '99' : muted}
                  editable={!disabled}
                  selectionColor={primary}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  accessibilityLabel={label}
                  accessibilityState={{ disabled: !!disabled }}
                  {...props}
                />
              </View>

              {/* Right Component */}
              {renderRightComponent()}
            </View>
          )}
        </View>
      </Pressable>
    );

    return renderItemContent();
  }
);

NexGGroupedInputItem.displayName = 'NexGGroupedInputItem';
