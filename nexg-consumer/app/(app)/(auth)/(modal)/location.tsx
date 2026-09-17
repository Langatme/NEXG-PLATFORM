import { NexGButton } from '@/components/ui/NexGButton';
import { NexGText } from '@/components/ui/NexGText';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRESETS = ['Home · Wood Ave, Kilimani', 'Work · Westlands'];

/** CNS-040/046 Address selection + confirmation (persisted default). */
export default function LocationModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();
  const defaultAddress = useUserStore((s) => s.defaultAddress);
  const setDefaultAddress = useUserStore((s) => s.setDefaultAddress);
  const [draft, setDraft] = useState('');

  const pick = (address: string) => {
    setDefaultAddress(address);
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top + 10 }]}>
      <NexGText variant="title">Delivery address</NexGText>
      <NexGText variant="caption" color="muted">
        Current default: {defaultAddress}
      </NexGText>
      {PRESETS.map((p) => (
        <TouchableOpacity
          key={p}
          accessibilityRole="radio"
          accessibilityState={{ selected: defaultAddress === p }}
          onPress={() => pick(p)}
          style={[styles.row, { backgroundColor: colors.surface.primary }, defaultAddress === p && { borderWidth: 2, borderColor: colors.accent.primary }]}>
          <Ionicons name="location-outline" size={20} color={colors.text.secondary} />
          <NexGText variant="bodyStrong" style={{ flex: 1 }}>
            {p}
          </NexGText>
        </TouchableOpacity>
      ))}
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="Or type full address…"
        style={[styles.input, { borderColor: colors.border.subtle, color: colors.text.primary }]}
      />
      <View style={{ height: spacing.sm }} />
      <NexGButton label="Confirm address" disabled={draft.trim().length < 5} onPress={() => pick(draft.trim())} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, height: 52, fontSize: 15 },
});
