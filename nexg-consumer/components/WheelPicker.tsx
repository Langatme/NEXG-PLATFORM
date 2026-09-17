import { StyleSheet, View } from 'react-native';import { NexGText } from '@/components/ui/NexGText';
import { useTheme } from '@/theme';

interface WheelPickerProps {
  options: string[];
  selectedIndex: number;
  onOptionSelected: (index: number) => void;
}

/** Simple wheel-style option column (buttons, accessible, no native deps). */
export function WheelPicker({ options, selectedIndex, onOptionSelected }: WheelPickerProps) {
  const { colors } = useTheme();
  const windowSize = 5;
  const start = Math.max(0, Math.min(selectedIndex - 2, Math.max(0, options.length - windowSize)));
  const visible = options.slice(start, start + windowSize);
  return (
    <View style={{ flex: 1, gap: 4, padding: 8 }}>
      {visible.map((opt, i) => {
        const idx = start + i;
        const selected = idx === selectedIndex;
        return (
          <View key={`${idx}-${opt}`} style={[styles.opt, selected && { borderWidth: 2, borderColor: colors.accent.primary }]}>
            <NexGText
              variant={selected ? 'bodyStrong' : 'body'}
              color={selected ? 'primary' : 'muted'}
              align="center"
              onPress={() => onOptionSelected(idx)}>
              {opt}
            </NexGText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  opt: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8 },
});
