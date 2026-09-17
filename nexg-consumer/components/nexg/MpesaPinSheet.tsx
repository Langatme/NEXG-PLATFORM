import { NexGBottomSheet } from '@/components/ui/NexGBottomSheet';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGText } from '@/components/ui/NexGText';
import { useTheme } from '@/theme';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

/** Simulated M-Pesa authorization PIN. No gateway claims — latency stands in for STK. */
export function MpesaPinSheet({ open, onClose, onConfirm, amountLabel }: { open: boolean; onClose: () => void; onConfirm: () => void; amountLabel: string }) {
  const { colors, spacing } = useTheme();
  const [pin, setPin] = useState('');
  return (
    <NexGBottomSheet open={open} onClose={onClose} snapPoints={[0.5]} title="M-Pesa PIN">
      <View style={{ padding: 20, gap: spacing.md }}>
        <NexGText variant="body" color="muted">
          Enter your M-Pesa PIN to authorize {amountLabel}. Simulated in this build.
        </NexGText>
        <TextInput
          value={pin}
          onChangeText={setPin}
          placeholder="••••"
          secureTextEntry
          keyboardType="number-pad"
          maxLength={4}
          style={[styles.input, { borderColor: colors.border.subtle, color: colors.text.primary }]}
        />
        <NexGButton label="Authorize" disabled={pin.length < 4} onPress={() => { setPin(''); onConfirm(); }} />
      </View>
    </NexGBottomSheet>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, height: 52, fontSize: 20, textAlign: 'center', letterSpacing: 8 },
});
