import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGEmptyState } from '@/components/ui/NexGStates';
import { NexGText } from '@/components/ui/NexGText';
import { useHostAuth } from '@/lib/store';
import { useTheme } from '@/theme';

export function HostSignInGate({ hint }: { hint: string }) {
  const { colors, spacing } = useTheme();
  const signIn = useHostAuth((s) => s.signIn);
  const continueAsGuest = useHostAuth((s) => s.continueAsGuest);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [propertyId, setPropertyId] = useState('mrc_003');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!useHostAuth((s) => s.ready)) {
    return <NexGEmptyState emoji="🏨" title="Loading" message="Restoring session…" />;
  }
  if (useHostAuth((s) => s.propertyId)) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, padding: spacing.lg }]}>
      <NexGText variant="title">Host sign in</NexGText>
      <NexGText variant="body">{hint}</NexGText>
      {(['Phone', 'PIN', 'Property ID'] as const).map((label) => (
        <TextInput
          key={label}
          placeholder={label}
          placeholderTextColor={colors.text.secondary}
          autoCapitalize="none"
          secureTextEntry={label === 'PIN'}
          value={label === 'Phone' ? phone : label === 'PIN' ? pin : propertyId}
          onChangeText={label === 'Phone' ? setPhone : label === 'PIN' ? setPin : setPropertyId}
          style={[styles.input, { borderColor: colors.border.subtle, color: colors.text.primary }]}
        />
      ))}
      {error ? <NexGText variant="caption">{error}</NexGText> : null}
      <NexGButton
        label="Sign in"
        loading={busy}
        onPress={() => {
          setBusy(true);
          setError(null);
          signIn(phone.trim(), pin, propertyId.trim())
            .catch((e) => setError(e instanceof Error ? e.message : 'Sign in failed'))
            .finally(() => setBusy(false));
        }}
      />
      <NexGButton
        label="Continue as guest"
        variant="ghost"
        disabled={busy}
        onPress={() => {
          setBusy(true);
          setError(null);
          continueAsGuest(propertyId.trim() || 'mrc_003')
            .catch((e) => setError(e instanceof Error ? e.message : 'Guest entry failed'))
            .finally(() => setBusy(false));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', gap: 12 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 16 },
});
