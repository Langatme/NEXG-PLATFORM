import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGEmptyState } from '@/components/ui/NexGStates';
import { NexGText } from '@/components/ui/NexGText';
import { useRiderAuth } from '@/lib/store';
import { useTheme } from '@/theme';

// Dev bypass: fixed guest creds auto-register on first tap via riderLogin.
// Rendered only when __DEV__ is true, so production builds never show it.
const DEV_GUEST_PHONE = '254700000001';
const DEV_GUEST_PIN = '1234';

export function RiderSignInGate({ hint }: { hint: string }) {
  const { colors, spacing } = useTheme();
  const signIn = useRiderAuth((s) => s.signIn);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!useRiderAuth((s) => s.ready)) {
    return <NexGEmptyState emoji="🛵" title="Loading" message="Restoring session…" />;
  }
  if (useRiderAuth((s) => s.signedIn)) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, padding: spacing.lg }]}>
      <NexGText variant="title">Rider sign in</NexGText>
      <NexGText variant="body">{hint}</NexGText>
      <TextInput
        placeholder="Phone"
        placeholderTextColor={colors.text.secondary}
        autoCapitalize="none"
        value={phone}
        onChangeText={setPhone}
        style={[styles.input, { borderColor: colors.border.subtle, color: colors.text.primary }]}
      />
      <TextInput
        placeholder="PIN"
        placeholderTextColor={colors.text.secondary}
        secureTextEntry
        value={pin}
        onChangeText={setPin}
        style={[styles.input, { borderColor: colors.border.subtle, color: colors.text.primary }]}
      />
      {error ? <NexGText variant="caption">{error}</NexGText> : null}
      <NexGButton
        label="Sign in"
        loading={busy}
        onPress={() => {
          setBusy(true);
          setError(null);
          signIn(phone.trim(), pin)
            .catch((e) => setError(e instanceof Error ? e.message : 'Sign in failed'))
            .finally(() => setBusy(false));
        }}
      />
      {__DEV__ ? (
        <NexGButton
          label="Continue as dev guest"
          variant="secondary"
          loading={busy}
          onPress={() => {
            setBusy(true);
            setError(null);
            signIn(DEV_GUEST_PHONE, DEV_GUEST_PIN)
              .catch((e) => setError(e instanceof Error ? e.message : 'Sign in failed'))
              .finally(() => setBusy(false));
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', gap: 12 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 16 },
});
