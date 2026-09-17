// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Promoted from vendor/ahmedbna-ui-components (registry/src/components/ui/picker.tsx).
// Adaptations: NexG tokens via useTheme, NexGText slots, NexGBottomSheet instead of
// the vendor Modal sheet, lucide icons rendered directly. Selection/search/a11y kept.
import { NexGBottomSheet } from "@/components/ui/NexGBottomSheet";
import { NexGText } from "@/components/ui/NexGText";
import { useHaptics } from "@/hooks/use-haptics";
import { useTheme } from "@/theme";
import { ChevronDown, type LucideProps } from "lucide-react-native";
import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

export interface NexGPickerOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface NexGPickerSection {
  title?: string;
  options: NexGPickerOption[];
}

export interface NexGPickerProps {
  options?: NexGPickerOption[];
  sections?: NexGPickerSection[];
  value?: string;
  placeholder?: string;
  error?: string;
  variant?: "outline" | "filled" | "group";
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  style?: ViewStyle;
  multiple?: boolean;
  values?: string[];
  onValuesChange?: (values: string[]) => void;

  // Styling props
  label?: string;
  icon?: ComponentType<LucideProps>;
  rightComponent?: ReactNode | (() => ReactNode);
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;

  // Sheet props
  modalTitle?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  haptic?: boolean;
}

const TRIGGER_MIN_HEIGHT = 48;
const OPTIONS_LIST_HEIGHT = 300;

export function NexGPicker({
  options = [],
  sections = [],
  value,
  values = [],
  error,
  variant = "filled",
  placeholder = "Select an option...",
  onValueChange,
  onValuesChange,
  disabled = false,
  style,
  multiple = false,
  label,
  icon,
  rightComponent,
  inputStyle,
  labelStyle,
  errorStyle,
  modalTitle,
  searchable = false,
  searchPlaceholder = "Search options...",
  haptic = true,
}: NexGPickerProps) {
  const { colors, radii, text: textScale } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const feedback = useHaptics(haptic);

  const TriggerIcon = icon;

  const borderColor = colors.border.strong;
  const dividerColor = colors.border.subtle;
  const text = colors.text.primary;
  const muted = colors.text.muted;
  const cardColor = colors.surface.primary;
  const danger = colors.status.error;
  const primary = colors.accent.primary;
  const primaryForeground = colors.text.inverse;
  const inputBg = colors.surface.secondary;
  const textMutedColor = colors.text.muted;

  // Normalize data structure - convert options to sections format
  const normalizedSections: NexGPickerSection[] =
    sections.length > 0 ? sections : [{ options }];

  // Filter sections based on search query — memoized so typing in an
  // unrelated part of the screen does not re-filter every option on every
  // render. Depends on `sections`/`options` directly rather than
  // `normalizedSections`, which is a fresh array every render.
  const filteredSections = useMemo(
    () =>
      searchable && searchQuery
        ? normalizedSections
            .map((section) => ({
              ...section,
              options: section.options.filter((option) =>
                option.label.toLowerCase().includes(searchQuery.toLowerCase())
              ),
            }))
            .filter((section) => section.options.length > 0)
        : normalizedSections,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchable, searchQuery, sections, options]
  );

  // Get selected options for display
  const getSelectedOptions = () => {
    const allOptions = normalizedSections.flatMap((section) => section.options);

    if (multiple) {
      return allOptions.filter((option) => values.includes(option.value));
    } else {
      return allOptions.filter((option) => option.value === value);
    }
  };

  const selectedOptions = getSelectedOptions();

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      // Multi-select rows behave like checkboxes, so they get toggle feedback
      // rather than the one-shot selection tick.
      const isSelected = values.includes(optionValue);
      feedback(isSelected ? "toggle-off" : "toggle-on");
      const newValues = isSelected
        ? values.filter((v) => v !== optionValue)
        : [...values, optionValue];
      onValuesChange?.(newValues);
    } else {
      feedback("selection");
      onValueChange?.(optionValue);
      setIsOpen(false);
    }
  };

  const handleOpen = () => {
    if (disabled) return;
    feedback("impact-light");
    setIsOpen(true);
  };

  const closeSheet = () => setIsOpen(false);

  const getDisplayText = () => {
    if (selectedOptions.length === 0) return placeholder;

    if (multiple) {
      if (selectedOptions.length === 1) {
        return selectedOptions[0].label;
      }
      return `${selectedOptions.length} selected`;
    }

    return selectedOptions[0]?.label || placeholder;
  };

  const triggerStyle: ViewStyle = {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: variant === "group" ? 0 : 16,
    borderWidth: variant === "group" ? 0 : 1,
    borderColor: variant === "outline" ? borderColor : cardColor,
    borderRadius: radii.pill,
    backgroundColor: variant === "filled" ? cardColor : "transparent",
    minHeight: variant === "group" ? "auto" : TRIGGER_MIN_HEIGHT,
    opacity: disabled ? 0.5 : 1,
  };

  const renderOption = (
    option: NexGPickerOption,
    sectionIndex: number
  ) => {
    const isSelected = multiple
      ? values.includes(option.value)
      : value === option.value;

    return (
      <TouchableOpacity
        key={`${sectionIndex}-${option.value}`}
        onPress={() => !option.disabled && handleSelect(option.value)}
        style={{
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderRadius: radii.pill,
          backgroundColor: isSelected ? primary : "transparent",
          marginVertical: 2,
          alignItems: "center",
          opacity: option.disabled ? 0.3 : 1,
        }}
        disabled={option.disabled}
        accessibilityRole="menuitem"
        accessibilityState={{ selected: isSelected, disabled: option.disabled }}
      >
        <View
          style={{
            width: "100%",
            alignItems: "center",
          }}
        >
          <NexGText
            variant="body"
            style={{
              color: isSelected ? primaryForeground : text,
              fontWeight: isSelected ? "600" : "400",
              textAlign: "center",
            }}
          >
            {option.label}
          </NexGText>
          {option.description && (
            <NexGText
              variant="caption"
              style={{
                marginTop: 4,
                color: isSelected ? primaryForeground : textMutedColor,
                textAlign: "center",
              }}
            >
              {option.description}
            </NexGText>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[triggerStyle, style]}
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={modalTitle || label || placeholder}
        accessibilityState={{ disabled, expanded: isOpen }}
      >
        {/* Icon & Label */}
        <View
          style={{
            width: label ? 128 : "auto",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
          pointerEvents="none"
        >
          {TriggerIcon && (
            <TriggerIcon size={16} color={error ? danger : muted} />
          )}
          {label && (
            <NexGText
              variant="caption"
              color={error ? "error" : "muted"}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={labelStyle}
            >
              {label}
            </NexGText>
          )}
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <NexGText
            variant="body"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              {
                color:
                  selectedOptions.length > 0
                    ? text
                    : disabled
                      ? muted
                      : error
                        ? danger
                        : muted,
              },
              inputStyle,
            ]}
          >
            {getDisplayText()}
          </NexGText>

          {rightComponent ? (
            typeof rightComponent === "function" ? (
              rightComponent()
            ) : (
              rightComponent
            )
          ) : (
            <ChevronDown
              size={16}
              color={error ? danger : muted}
              style={{
                transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
              }}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Error message */}
      {error && (
        <NexGText variant="caption" color="error" style={[{ marginTop: 4 }, errorStyle]}>
          {error}
        </NexGText>
      )}

      <NexGBottomSheet
        open={isOpen}
        onClose={closeSheet}
        snapPoints={[0.7]}
        title={modalTitle || (multiple ? "Select Options" : undefined)}
      >
        <View style={{ flex: 1 }}>
          {/* Multi-select Done action (vendor rendered this beside the title) */}
          {multiple && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingTop: 12,
              }}
            >
              <TouchableOpacity
                onPress={closeSheet}
                accessibilityRole="button"
                accessibilityLabel="Done"
              >
                <NexGText variant="label" style={{ color: primary }}>
                  Done
                </NexGText>
              </TouchableOpacity>
            </View>
          )}

          {/* Search */}
          {searchable && (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: dividerColor,
              }}
            >
              <TextInput
                style={{
                  height: 36,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: inputBg,
                  color: text,
                  fontSize: textScale("body").fontSize,
                }}
                placeholder={searchPlaceholder}
                placeholderTextColor={muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                accessibilityLabel="Search options"
              />
            </View>
          )}

          {/* Options */}
          <View style={{ height: OPTIONS_LIST_HEIGHT }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: 20,
                paddingHorizontal: 16,
              }}
            >
              {filteredSections.map((section, sectionIndex) => (
                <View key={sectionIndex}>
                  {section.title && (
                    <View
                      style={{
                        paddingHorizontal: 4,
                        paddingVertical: 12,
                        marginBottom: 8,
                      }}
                    >
                      <NexGText
                        variant="caption"
                        accessibilityRole="header"
                        style={{
                          fontWeight: "600",
                          color: textMutedColor,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {section.title}
                      </NexGText>
                    </View>
                  )}
                  {section.options.map((option) =>
                    renderOption(option, sectionIndex)
                  )}
                </View>
              ))}

              {filteredSections.every(
                (section) => section.options.length === 0
              ) && (
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 24,
                    alignItems: "center",
                  }}
                >
                  <NexGText variant="caption">
                    {searchQuery ? "No results found" : "No options available"}
                  </NexGText>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </NexGBottomSheet>
    </>
  );
}
