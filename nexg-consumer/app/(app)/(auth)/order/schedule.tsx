import { WheelPicker } from '@/components/WheelPicker';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGText } from '@/components/ui/NexGText';
import { useCartStore } from '@/hooks/use-cartstore';
import { useTheme } from '@/theme';
import { formatDayLabel, formatTime, generateTimeSlots, nextNDays } from '@/utils/dates';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Date & time selection for bookings and scheduled orders.
 * Reuses the existing wheel picker, themed for NEXG.
 */
export default function Schedule() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const days = useMemo(() => nextNDays(7), []);
  const dayOptions = days.map((d) => formatDayLabel(d));

  const slots = useMemo(() => {
    // Booking-style slots: 9:00–21:00 every 30 min; orders: delivery windows all day.
    return generateTimeSlots(8, 22, 30);
  }, []);
  const slotLabels = slots.map((s) => formatTime(s));

  const setScheduledFor = useCartStore((s) => s.setScheduledFor);
  const [dayIdx, setDayIdx] = useState(0);
  const [slotIdx, setSlotIdx] = useState(() => {
    // Default to ~1h from now if within range.
    const soon = new Date(Date.now() + 3_600_000);
    let best = Math.floor(slots.length / 2);
    slots.forEach((s, i) => {
      if (Math.abs(s.getTime() - soon.getTime()) < Math.abs(slots[best].getTime() - soon.getTime())) best = i;
    });
    return best;
  });

  const confirm = () => {
    const chosen = new Date(days[dayIdx]);
    chosen.setHours(slots[slotIdx].getHours(), slots[slotIdx].getMinutes(), 0, 0);
    setScheduledFor(chosen.toISOString());
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <NexGText variant="heading" style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        Choose when
      </NexGText>
      <View style={styles.pickerWrapper}>
        <WheelPicker options={dayOptions} selectedIndex={dayIdx} onOptionSelected={setDayIdx} />
        <WheelPicker options={slotLabels} selectedIndex={slotIdx} onOptionSelected={setSlotIdx} />
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}>
        <NexGButton label={`Confirm ${dayOptions[dayIdx]} · ${slotLabels[slotIdx]}`} onPress={confirm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pickerWrapper: { flex: 1, flexDirection: 'row' },
});
