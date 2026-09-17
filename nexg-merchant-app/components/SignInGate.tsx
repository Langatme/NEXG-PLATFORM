import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGEmptyState } from '@/components/ui/NexGStates';
import { NexGText } from '@/components/ui/NexGText';
import { useMerchantAuth } from '@/lib/store';
import { useTheme } from '@/theme';

/** Auth gate: staff sign-in anchored to one merchant, or passwordless guest entry. */
export function SignInGate({ hint }: { hint: string }) {
  const { colors, spacing } = useTheme();
  const ready = useMerchantAuth((s) => s.ready);
  const authedMerchantId = useMerchantAuth((s) => s.merchantId);
  const signIn = useMerchantAuth((s) => s.signIn);
  const signInGuest = useMerchantAuth((s) => s.signInGuest);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [merchantId, setMerchantId] = useState('mrc_001');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return <NexGEmptyState emoji="🏪" title="Loading" message="Restoring session…" />;
  }
  if (authedMerchantId) return null;

  const guest = () => {
    if (!merchantId.trim()) { setError('Merchant code required for guest entry.'); return; }
    setBusy(true);
    setError(null);
    signInGuest(merchantId.trim())
      .catch((e) => setError(e instanceof Error ? e.message : 'Guest entry failed'))
      .finally(() => setBusy(false));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, padding: spacing.lg }]}>
      <NexGText variant="title">Merchant sign in</NexGText>
      <NexGText variant="body">{hint}</NexGText>
      {(['Phone', 'PIN', 'Merchant ID'] as const).map((label) => (
        <TextInput
          key={label}
          placeholder={label}
          placeholderTextColor={colors.text.secondary}
          autoCapitalize="none"
          secureTextEntry={label === 'PIN'}
          value={label === 'Phone' ? phone : label === 'PIN' ? pin : merchantId}
          onChangeText={label === 'Phone' ? setPhone : label === 'PIN' ? setPin : setMerchantId}
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
          signIn(phone.trim(), pin, merchantId.trim())
            .catch((e) => setError(e instanceof Error ? e.message : 'Sign in failed'))
            .finally(() => setBusy(false));
        }}
      />
      <NexGButton label="Continue as guest" variant="secondary" loading={busy} onPress={guest} />
      <NexGText variant="caption">Guest needs only the merchant code — no password. Full actions, own-merchant scope.</NexGText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', gap: 12 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 16 },
});
