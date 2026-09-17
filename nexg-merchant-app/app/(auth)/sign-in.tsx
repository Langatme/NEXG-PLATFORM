import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGLogo, NEXG_INK_DARK, NEXG_INK_LIGHT, NEXG_SPLASH_BG_DARK, NEXG_SPLASH_BG_LIGHT } from '@/components/ui/NexGLogo';
import { NexGText } from '@/components/ui/NexGText';
import { NexGWelcomeHero } from '@/components/ui/NexGWelcomeHero';
import { useMerchantAuth } from '@/lib/store';
import { useTheme } from '@/theme';

/** Branded entry gate: logo + staff sign-in or passwordless guest, separate from the app tabs. */
export default function MerchantSignInScreen() {
  const { colors, spacing } = useTheme();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const dark = scheme === 'dark';
  const signIn = useMerchantAuth((s) => s.signIn);
  const signInGuest = useMerchantAuth((s) => s.signInGuest);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [merchantId, setMerchantId] = useState('mrc_001');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const done = () => router.replace('/(tabs)/orders');

  const submit = (fn: Promise<unknown>) => {
    setBusy(true);
    setError(null);
    fn.then(done)
      .catch((e) => setError(e instanceof Error ? e.message : 'Sign in failed'))
      .finally(() => setBusy(false));
  };

  return (
    <View style={[styles.root, { backgroundColor: dark ? NEXG_SPLASH_BG_DARK : NEXG_SPLASH_BG_LIGHT, paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={[styles.body, { padding: spacing.xl, gap: spacing.md }]} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <NexGWelcomeHero
              logo={<NexGLogo ink={dark ? NEXG_INK_DARK : NEXG_INK_LIGHT} width={120} height={Math.round((120 * 504) / 396)} testID="nexg-logo" />}
              eyebrow="Merchant"
              title="NEXG Merchant"
              subtitle="Run your store — orders, catalog, payouts."
            />
          </View>
          {(['Phone', 'PIN', 'Merchant ID'] as const).map((label) => (
            <TextInput
              key={label}
              placeholder={label}
              placeholderTextColor={colors.text.muted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={label === 'PIN'}
              keyboardType={label === 'Phone' ? 'phone-pad' : 'default'}
              value={label === 'Phone' ? phone : label === 'PIN' ? pin : merchantId}
              onChangeText={label === 'Phone' ? setPhone : label === 'PIN' ? setPin : setMerchantId}
              style={[styles.input, { borderColor: colors.border.subtle, color: colors.text.primary }]}
            />
          ))}
          {error ? <NexGText variant="caption" align="center">{error}</NexGText> : null}
          <NexGButton label="Sign in" loading={busy} onPress={() => submit(signIn(phone.trim(), pin, merchantId.trim()))} />
          <NexGButton label="Continue as guest" variant="ghost" loading={busy} onPress={() => {
            if (!merchantId.trim()) { setError('Merchant code required for guest entry.'); return; }
            submit(signInGuest(merchantId.trim()));
          }} />
          <NexGText variant="caption" color="secondary" align="center">Guest needs only the merchant code — no password. Full actions, own-merchant scope.</NexGText>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  body: { flexGrow: 1, justifyContent: 'center' },
  brand: { alignItems: 'center', gap: 8, marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 16 },
});
