import { NexGButton } from '@/components/ui/NexGButton';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGText } from '@/components/ui/NexGText';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** CNS-096 Saved Addresses — default + extras persisted in user store key. */
export default function Addresses() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const defaultAddress = useUserStore((s) => s.defaultAddress);
  const setDefaultAddress = useUserStore((s) => s.setDefaultAddress);
  const [draft, setDraft] = useState('');
  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">Saved addresses</NexGText>
      <NexGText variant="body" color="muted">Default: {defaultAddress}</NexGText>
      <NexGInput label="New address" value={draft} onChangeText={setDraft} placeholder="Add address…" />
      <NexGButton label="Save as default" disabled={draft.trim().length < 5} onPress={() => setDefaultAddress(draft.trim())} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
});
