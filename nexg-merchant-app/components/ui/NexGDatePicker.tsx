// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Promoted from vendor/ahmedbna-ui-components (registry/src/components/ui/date-picker.tsx).
// Adaptations: NexG tokens via useTheme, NexGText slots, NexGBottomSheet driven by local
// state instead of the vendor useBottomSheet hook, NexGButton footer actions, lucide
// icons rendered directly. Range/single API, calendar math, and haptics unchanged.
import { NexGButton } from "@/components/ui/NexGButton";
import { NexGBottomSheet } from "@/components/ui/NexGBottomSheet";
import { NexGText } from "@/components/ui/NexGText";
import { useHaptics } from "@/hooks/use-haptics";
import { useTheme } from "@/theme";
import {
  ArrowRight,
  Calendar,
  CalendarClock,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

export interface NexGDateRange {
  startDate: Date | null;
  endDate: Date | null;
}

// Conditional typing based on mode
interface NexGBaseDatePickerProps {
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  style?: ViewStyle;
  minimumDate?: Date;
  maximumDate?: Date;
  timeFormat?: "12" | "24";
  variant?: "filled" | "outline" | "group";
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  haptic?: boolean;
}

interface NexGDatePickerRangeProps extends NexGBaseDatePickerProps {
  mode: "range";
  value?: NexGDateRange;
  onChange?: (value: NexGDateRange | undefined) => void;
}

interface NexGDatePickerDateProps extends NexGBaseDatePickerProps {
  mode?: "date" | "time" | "datetime";
  value?: Date;
  onChange?: (value: Date | undefined) => void;
}

export type NexGDatePickerProps =
  | NexGDatePickerRangeProps
  | NexGDatePickerDateProps;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Generate year range (current year ± 50 years)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

const TRIGGER_MIN_HEIGHT = 48;

// Type guard: a range value carries its start/end domain fields. `in` narrowing on the
// closed value union separates Date from NexGDateRange without inspecting representations.
const isDateRange = (
  value: Date | NexGDateRange | undefined
): value is NexGDateRange => {
  return (
    value !== undefined &&
    value !== null &&
    "startDate" in value &&
    "endDate" in value
  );
};

export function NexGDatePicker(props: NexGDatePickerProps) {
  const { colors, radii } = useTheme();
  const {
    label,
    error,
    placeholder = "Select date",
    disabled = false,
    style,
    minimumDate,
    maximumDate,
    timeFormat = "24",
    variant = "filled",
    labelStyle,
    errorStyle,
    haptic = true,
  } = props;

  const mode = props.mode || "date";
  const value = props.value;

  // Narrow the onChange union once at the boundary: the mode discriminant selects the
  // matching call signature, so every site below calls a precise handler with no assertion.
  // `mode === "range"` here is equivalent to `props.mode === "range"` (other modes fall
  // back to "date"), which is what keeps each narrowed handler aligned with its branch.
  const rangeOnChange = props.mode === "range" ? props.onChange : undefined;
  const dateOnChange = props.mode === "range" ? undefined : props.onChange;

  const feedback = useHaptics(haptic);

  const [isVisible, setIsVisible] = useState(false);
  const open = () => setIsVisible(true);
  const close = () => setIsVisible(false);

  // Get the current date for navigation, prioritizing single date or range start date
  const getCurrentDate = useCallback(() => {
    if (mode === "range") {
      const rangeValue = isDateRange(value)
        ? value
        : { startDate: null, endDate: null };
      return rangeValue.startDate || new Date();
    }
    if (isDateRange(value)) return value.startDate || new Date();
    return value || new Date();
  }, [value, mode]);

  const [currentDate, setCurrentDate] = useState(() => getCurrentDate());
  const [viewMode, setViewMode] = useState<"date" | "time" | "month" | "year">(
    "date"
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Range selection state for temporary storage during selection
  const [tempRange, setTempRange] = useState<NexGDateRange>(() =>
    mode === "range" && isDateRange(value)
      ? value
      : { startDate: null, endDate: null }
  );

  // Theme colors
  const cardColor = colors.surface.primary;
  const borderColor = colors.border.strong;
  const primaryColor = colors.accent.primary;
  const primaryForegroundColor = colors.text.inverse;
  const mutedColor = colors.surface.secondary;
  const textMutedColor = colors.text.muted;
  const mutedForegroundColor = colors.text.muted;
  const textColor = colors.text.primary;
  const iconColor = colors.text.secondary;

  const formatDisplayValue = useCallback(() => {
    if (mode === "range") {
      const rangeValue = isDateRange(value)
        ? value
        : { startDate: null, endDate: null };

      if (!rangeValue.startDate && !rangeValue.endDate) {
        return placeholder;
      }

      const startStr = rangeValue.startDate
        ? rangeValue.startDate.toLocaleDateString()
        : "";
      const endStr = rangeValue.endDate
        ? rangeValue.endDate.toLocaleDateString()
        : "";

      if (startStr && endStr) {
        return `${startStr} - ${endStr}`;
      } else if (startStr) {
        return `${startStr} - Select end date`;
      } else if (endStr) {
        return `Select start date - ${endStr}`;
      }
      return placeholder;
    }

    const dateValue = isDateRange(value) ? value.startDate || undefined : value;
    if (!dateValue) return placeholder;

    switch (mode) {
      case "time":
        if (timeFormat === "12") {
          return dateValue.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        }
        return dateValue.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      case "datetime":
        const timeStr =
          timeFormat === "12"
            ? dateValue.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : dateValue.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
        return `${dateValue.toLocaleDateString()} ${timeStr}`;
      default:
        return dateValue.toLocaleDateString();
    }
  }, [value, mode, placeholder, timeFormat]);

  // Helper function to check if a date is disabled
  const isDateDisabled = useCallback(
    (date: Date) => {
      if (minimumDate && date < minimumDate) return true;
      if (maximumDate && date > maximumDate) return true;
      return false;
    },
    [minimumDate, maximumDate]
  );

  // Helper function to check if a date is in range
  const isDateInRange = useCallback(
    (date: Date) => {
      if (mode !== "range" || !tempRange.startDate || !tempRange.endDate) {
        return false;
      }

      // Create new date objects to avoid mutation
      const startDate = new Date(tempRange.startDate);
      const endDate = new Date(tempRange.endDate);
      const checkDate = new Date(date);

      // Normalize dates for comparison (remove time)
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      checkDate.setHours(0, 0, 0, 0);

      return checkDate >= startDate && checkDate <= endDate;
    },
    [mode, tempRange]
  );

  // Helper function to check if a date is a range endpoint
  const isRangeEndpoint = useCallback(
    (date: Date) => {
      if (mode !== "range") {
        return { isStart: false, isEnd: false };
      }

      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const isStart =
        tempRange.startDate &&
        new Date(tempRange.startDate).setHours(0, 0, 0, 0) ===
          normalizedDate.getTime();
      const isEnd =
        tempRange.endDate &&
        new Date(tempRange.endDate).setHours(0, 0, 0, 0) ===
          normalizedDate.getTime();

      return { isStart: !!isStart, isEnd: !!isEnd };
    },
    [mode, tempRange]
  );

  // Memoized calendar calculations
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create calendar grid with proper positioning
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    // Fill empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);

      // If week is complete (7 days) or it is the last day, start a new week
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    // Add the last incomplete week if it exists
    if (currentWeek.length > 0) {
      // Fill remaining cells with null
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return { weeks, year, month, daysInMonth };
  }, [currentDate]);

  const handleRangeSelect = (day: number) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    // Check if date is disabled
    if (isDateDisabled(selectedDate)) return;

    feedback("selection");

    // If no start date or both dates are selected, start fresh
    if (!tempRange.startDate || (tempRange.startDate && tempRange.endDate)) {
      setTempRange({
        startDate: selectedDate,
        endDate: null,
      });
    } else {
      // We have a start date but no end date
      const startDate = tempRange.startDate;

      if (selectedDate < startDate) {
        // If selected date is before start date, make it the new start date
        setTempRange({
          startDate: selectedDate,
          endDate: null,
        });
      } else {
        // Selected date is after start date, make it the end date
        setTempRange({
          startDate: startDate,
          endDate: selectedDate,
        });
      }
    }
  };

  const handleDateSelect = (day: number) => {
    if (mode === "range") {
      handleRangeSelect(day);
      return;
    }

    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    // Check if date is disabled
    if (isDateDisabled(newDate)) return;

    // Range mode returns above, so this only fires for the leaf case and never
    // doubles up with handleRangeSelect.
    feedback("selection");

    setCurrentDate(newDate);

    if (mode === "date") {
      dateOnChange?.(newDate);
      close();
    } else if (mode === "datetime") {
      setViewMode("time");
    }
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    feedback("tick");
    const newDate = new Date(currentDate);
    newDate.setHours(hours, minutes, 0, 0);
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    feedback("tick");
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleMonthSelect = (monthIndex: number) => {
    feedback("selection");
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    feedback("selection");
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setShowYearPicker(false);
  };

  const handleConfirm = () => {
    feedback("success");
    if (mode === "range") {
      rangeOnChange?.(tempRange);
    } else {
      dateOnChange?.(currentDate);
    }
    close();
  };

  const resetToToday = () => {
    const today = new Date();
    setCurrentDate(today);

    if (mode === "range") {
      setTempRange({ startDate: today, endDate: null });
    } else if (mode === "date") {
      dateOnChange?.(today);
      close();
    }
  };

  const clearSelection = () => {
    if (mode === "range") {
      setTempRange({ startDate: null, endDate: null });
      rangeOnChange?.(undefined);
    } else {
      dateOnChange?.(undefined);
    }
  };

  const handleSheetClose = () => {
    close();
    setShowMonthPicker(false);
    setShowYearPicker(false);
  };

  const renderMonthYearHeader = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        paddingHorizontal: 8,
      }}
    >
      <TouchableOpacity
        onPress={() => navigateMonth("prev")}
        style={{
          padding: 10,
          borderRadius: radii.pill,
          backgroundColor: mutedColor,
        }}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
      >
        <ChevronLeft size={20} color={textColor} />
      </TouchableOpacity>

      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          marginHorizontal: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowMonthPicker(true)}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: radii.pill,
            backgroundColor: mutedColor,
          }}
          accessibilityRole="button"
          accessibilityLabel="Select month"
        >
          <NexGText variant="heading" accessibilityRole="header" style={{ marginRight: 4 }}>
            {MONTHS[calendarData.month]}
          </NexGText>
          <ChevronDown size={16} color={textColor} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowYearPicker(true)}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: radii.pill,
            backgroundColor: mutedColor,
          }}
          accessibilityRole="button"
          accessibilityLabel="Select year"
        >
          <NexGText variant="heading" accessibilityRole="header" style={{ marginRight: 4 }}>
            {calendarData.year}
          </NexGText>
          <ChevronDown size={16} color={textColor} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => navigateMonth("next")}
        style={{
          padding: 10,
          borderRadius: radii.pill,
          backgroundColor: mutedColor,
        }}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        accessibilityRole="button"
        accessibilityLabel="Next month"
      >
        <ChevronRight size={20} color={textColor} />
      </TouchableOpacity>
    </View>
  );

  const renderCalendar = () => (
    <View>
      {renderMonthYearHeader()}
      {/* Day headers */}
      <View
        style={{
          flexDirection: "row",
          marginBottom: 12,
          paddingHorizontal: 4,
        }}
      >
        {DAYS.map((day) => (
          <View
            key={day}
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <NexGText
              variant="caption"
              style={{ fontWeight: "600" }}
            >
              {day}
            </NexGText>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={{ paddingHorizontal: 4 }}>
        {calendarData.weeks.map((week, weekIndex) => (
          <View
            key={weekIndex}
            style={{
              flexDirection: "row",
              marginBottom: 4,
            }}
          >
            {week.map((day, dayIndex) => {
              const dayDate = day
                ? new Date(calendarData.year, calendarData.month, day)
                : null;

              const isSelected =
                day &&
                value &&
                !isDateRange(value) &&
                value.getDate() === day &&
                value.getMonth() === calendarData.month &&
                value.getFullYear() === calendarData.year;

              const isToday =
                day &&
                new Date().getDate() === day &&
                new Date().getMonth() === calendarData.month &&
                new Date().getFullYear() === calendarData.year;

              const disabledDay = dayDate ? isDateDisabled(dayDate) : false;

              // Range-specific styling
              const inRange = dayDate ? isDateInRange(dayDate) : false;
              const rangeEndpoints = dayDate
                ? isRangeEndpoint(dayDate)
                : { isStart: false, isEnd: false };

              return (
                <View
                  key={dayIndex}
                  style={[
                    {
                      flex: 1,
                      alignItems: "center",
                      backgroundColor:
                        mode === "range" && inRange
                          ? primaryColor
                          : "transparent",
                      paddingHorizontal: mode === "range" && inRange ? 0 : 0,
                    },
                    rangeEndpoints.isStart && {
                      borderTopLeftRadius: radii.pill,
                      borderBottomLeftRadius: radii.pill,
                    },
                    rangeEndpoints.isEnd && {
                      borderTopRightRadius: radii.pill,
                      borderBottomRightRadius: radii.pill,
                    },
                  ]}
                >
                  {day ? (
                    <TouchableOpacity
                      onPress={() => !disabledDay && handleDateSelect(day)}
                      disabled={disabledDay}
                      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
                      style={[
                        {
                          width: 40,
                          height: 40,
                          borderRadius:
                            rangeEndpoints.isStart || rangeEndpoints.isEnd
                              ? 0
                              : radii.pill,
                          backgroundColor:
                            rangeEndpoints.isStart || rangeEndpoints.isEnd
                              ? primaryColor
                              : inRange
                                ? primaryColor
                                : isSelected
                                  ? primaryColor
                                  : "transparent",
                          borderWidth:
                            isToday && !isSelected && !inRange ? 1 : 0,
                          borderColor: primaryColor,
                          justifyContent: "center",
                          alignItems: "center",
                          opacity: disabledDay ? 0.3 : 1,
                        },
                        rangeEndpoints.isStart && {
                          borderTopLeftRadius: radii.pill,
                          borderBottomLeftRadius: radii.pill,
                        },
                        rangeEndpoints.isEnd && {
                          borderTopRightRadius: radii.pill,
                          borderBottomRightRadius: radii.pill,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Day ${day}`}
                      accessibilityState={{
                        selected: !!isSelected,
                        disabled: disabledDay,
                      }}
                    >
                      <NexGText
                        variant="body"
                        style={{
                          color:
                            rangeEndpoints.isStart || rangeEndpoints.isEnd
                              ? primaryForegroundColor
                              : inRange
                                ? primaryForegroundColor
                                : isSelected
                                  ? primaryForegroundColor
                                  : disabledDay
                                    ? mutedForegroundColor
                                    : textColor,
                          fontWeight:
                            rangeEndpoints.isStart ||
                            rangeEndpoints.isEnd ||
                            isSelected ||
                            isToday
                              ? "600"
                              : "400",
                          fontVariant: ["tabular-nums"],
                        }}
                      >
                        {day}
                      </NexGText>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ width: 40, height: 40 }} />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Range selection info */}
      {mode === "range" && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
            padding: 20,
            paddingHorizontal: 36,
            backgroundColor: mutedColor,
            borderRadius: radii.large,
          }}
        >
          <NexGText variant="heading" style={{ flex: 1 }}>
            {tempRange.startDate
              ? `${tempRange.startDate.toLocaleDateString()}`
              : "Start date"}
          </NexGText>

          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ArrowRight color={textColor} strokeWidth={3} />
          </View>

          <NexGText variant="heading" style={{ flex: 1, textAlign: "right" }}>
            {tempRange.endDate
              ? `${tempRange.endDate.toLocaleDateString()}`
              : "End date"}
          </NexGText>
        </View>
      )}
    </View>
  );

  const renderTimePicker = () => {
    const selectedHours = currentDate.getHours();
    const selectedMinutes = currentDate.getMinutes();

    const isPM = selectedHours >= 12;

    return (
      <View style={{ height: 300 }}>
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            gap: 16,
          }}
        >
          {/* Hours */}
          <View style={{ flex: 1 }}>
            <NexGText
              variant="caption"
              align="center"
              style={{ marginBottom: 12 }}
            >
              Hours
            </NexGText>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: 20,
              }}
            >
              {Array.from({ length: timeFormat === "12" ? 12 : 24 }, (_, i) =>
                timeFormat === "12" ? (i === 0 ? 12 : i) : i
              ).map((hour) => {
                const actualHour =
                  timeFormat === "12"
                    ? hour === 12
                      ? isPM
                        ? 12
                        : 0
                      : isPM
                        ? hour + 12
                        : hour
                    : hour;

                const isSelected = actualHour === selectedHours;

                return (
                  <TouchableOpacity
                    key={hour}
                    onPress={() =>
                      handleTimeChange(actualHour, selectedMinutes)
                    }
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: radii.pill,
                      backgroundColor: isSelected
                        ? primaryColor
                        : "transparent",
                      marginVertical: 2,
                      alignItems: "center",
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Hour ${hour}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <NexGText
                      variant="body"
                      style={{
                        color: isSelected ? primaryForegroundColor : textColor,
                        fontWeight: isSelected ? "600" : "400",
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {hour.toString().padStart(2, "0")}
                    </NexGText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Minutes */}
          <View style={{ flex: 1 }}>
            <NexGText
              variant="caption"
              align="center"
              style={{ marginBottom: 12 }}
            >
              Minutes
            </NexGText>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: 20,
              }}
            >
              {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                <TouchableOpacity
                  key={minute}
                  onPress={() => handleTimeChange(selectedHours, minute)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: radii.pill,
                    backgroundColor:
                      minute === selectedMinutes ? primaryColor : "transparent",
                    marginVertical: 2,
                    alignItems: "center",
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Minute ${minute}`}
                  accessibilityState={{ selected: minute === selectedMinutes }}
                >
                  <NexGText
                    variant="body"
                    style={{
                      color:
                        minute === selectedMinutes
                          ? primaryForegroundColor
                          : textColor,
                      fontWeight: minute === selectedMinutes ? "600" : "400",
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {minute.toString().padStart(2, "0")}
                  </NexGText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* AM/PM picker for 12-hour format */}
          {timeFormat === "12" && (
            <View style={{ flex: 0.5 }}>
              <NexGText
                variant="caption"
                align="center"
                style={{ marginBottom: 12 }}
              >
                Period
              </NexGText>
              <View
                style={{
                  paddingVertical: 20,
                  gap: 8,
                }}
              >
                {["AM", "PM"].map((period) => {
                  const isAM = period === "AM";
                  const isSelected = isAM ? !isPM : isPM;

                  return (
                    <TouchableOpacity
                      key={period}
                      onPress={() => {
                        const newHours = isAM
                          ? selectedHours >= 12
                            ? selectedHours - 12
                            : selectedHours
                          : selectedHours < 12
                            ? selectedHours + 12
                            : selectedHours;
                        handleTimeChange(newHours, selectedMinutes);
                      }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: radii.pill,
                        backgroundColor: isSelected
                          ? primaryColor
                          : "transparent",
                        alignItems: "center",
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={period}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <NexGText
                        variant="body"
                        style={{
                          color: isSelected
                            ? primaryForegroundColor
                            : textColor,
                          fontWeight: isSelected ? "600" : "400",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {period}
                      </NexGText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderMonthPicker = () => (
    <View style={{ height: 300 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 20,
        }}
      >
        {MONTHS.map((month, index) => (
          <TouchableOpacity
            key={month}
            onPress={() => handleMonthSelect(index)}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderRadius: radii.pill,
              backgroundColor:
                index === calendarData.month ? primaryColor : "transparent",
              marginVertical: 2,
              alignItems: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel={month}
            accessibilityState={{ selected: index === calendarData.month }}
          >
            <NexGText
              variant="body"
              style={{
                color:
                  index === calendarData.month
                    ? primaryForegroundColor
                    : textColor,
                fontWeight: index === calendarData.month ? "600" : "400",
              }}
            >
              {month}
            </NexGText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderYearPicker = () => (
    <View style={{ height: 300 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 20,
        }}
      >
        {YEARS.map((year) => (
          <TouchableOpacity
            key={year}
            onPress={() => handleYearSelect(year)}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderRadius: radii.pill,
              backgroundColor:
                year === calendarData.year ? primaryColor : "transparent",
              marginVertical: 2,
              alignItems: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel={`Year ${year}`}
            accessibilityState={{ selected: year === calendarData.year }}
          >
            <NexGText
              variant="body"
              style={{
                color:
                  year === calendarData.year
                    ? primaryForegroundColor
                    : textColor,
                fontWeight: year === calendarData.year ? "600" : "400",
                fontVariant: ["tabular-nums"],
              }}
            >
              {year}
            </NexGText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const getSheetContent = () => {
    if (showMonthPicker) return renderMonthPicker();
    if (showYearPicker) return renderYearPicker();

    if (mode === "datetime") {
      return viewMode === "date" ? renderCalendar() : renderTimePicker();
    }

    if (mode === "time") return renderTimePicker();
    return renderCalendar();
  };

  const getSheetTitle = () => {
    if (showMonthPicker) return "Select Month";
    if (showYearPicker) return "Select Year";

    if (mode === "datetime") {
      return viewMode === "date" ? "Select Date" : "Select Time";
    }

    if (mode === "time") return "Select Time";

    if (mode === "range") return "Select Range";

    return "Select Date";
  };

  const handleOpenPicker = () => {
    feedback("impact-light");
    setCurrentDate(new Date());
    setViewMode("date");
    setShowMonthPicker(false);
    setShowYearPicker(false);
    open();
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
  };

  const TriggerIcon =
    mode === "time"
      ? Clock
      : mode === "datetime"
        ? CalendarClock
        : mode === "range"
          ? CalendarRange
          : Calendar;

  return (
    <>
      <TouchableOpacity
        style={[triggerStyle, disabled && { opacity: 0.5 }, style]}
        onPress={handleOpenPicker}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        accessibilityState={{ disabled, expanded: isVisible }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <View
            style={{
              width: label ? 120 : "auto",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <TriggerIcon size={20} strokeWidth={1} color={iconColor} />

            {/* Label takes 1/3 of available width when present */}
            {label && (
              <View style={{ flex: 1 }}>
                <NexGText
                  variant="caption"
                  color={error ? "error" : "muted"}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={labelStyle}
                >
                  {label}
                </NexGText>
              </View>
            )}
          </View>

          {/* Text takes 2/3 of available width when label is present, or full width when no label */}
          <View style={{ flex: 1 }}>
            <NexGText
              variant="body"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: value ? textColor : textMutedColor,
              }}
            >
              {formatDisplayValue()}
            </NexGText>
          </View>
        </View>
      </TouchableOpacity>

      {error && (
        <NexGText
          variant="caption"
          color="error"
          style={[{ marginTop: 4, marginLeft: 14 }, errorStyle]}
        >
          {error}
        </NexGText>
      )}

      <NexGBottomSheet
        open={isVisible}
        onClose={handleSheetClose}
        title={getSheetTitle()}
        snapPoints={[0.7]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {getSheetContent()}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 20,
              gap: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 8,
              }}
            >
              <NexGButton label="Today" variant="secondary" onPress={resetToToday} />

              <NexGButton
                label={mode === "range" ? "Clear" : "Cancel"}
                variant="secondary"
                onPress={() => {
                  handleSheetClose();
                  clearSelection();
                }}
              />
            </View>

            {mode === "datetime" && viewMode === "date" ? (
              <View style={{ flex: 1 }}>
                <NexGButton
                  label="Next"
                  onPress={() => setViewMode("time")}
                />
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <NexGButton label="Done" onPress={handleConfirm} />
              </View>
            )}
          </View>
        </ScrollView>
      </NexGBottomSheet>
    </>
  );
}
