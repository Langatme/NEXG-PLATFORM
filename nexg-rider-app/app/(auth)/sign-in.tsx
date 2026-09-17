import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGLogo, NEXG_INK_DARK, NEXG_INK_LIGHT, NEXG_SPLASH_BG_DARK, NEXG_SPLASH_BG_LIGHT } from '@/components/ui/NexGLogo';
import { NexGText } from '@/components/ui/NexGText';
import { NexGWelcomeHero } from '@/components/ui/NexGWelcomeHero';
import { useRiderAuth } from '@/lib/store';
import { useTheme } from '@/theme';

// Dev bypass: fixed guest creds auto-register on first tap via riderLogin.
// Rendered only when __DEV__ is true, so production builds never show it.
const DEV_GUEST_PHONE = '254700000001';
const DEV_GUEST_PIN = '1234';

/** Branded entry gate: logo + rider sign-in, separate from the app tabs. */
export default function RiderSignInScreen() {
  const { colors, spacing } = useTheme();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const dark = scheme === 'dark';
  const signIn = useRiderAuth((s) => s.signIn);
  const continueAsGuest = useRiderAuth((s) => s.continueAsGuest);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const done = () => router.replace('/(tabs)/jobs');

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
              eyebrow="Rider"
              title="NEXG Rider"
              subtitle="Earn on your schedule — accept jobs, deliver, get paid."
            />
          </View>
          <TextInput
            placeholder="Phone"
            placeholderTextColor={colors.text.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={[styles.input, { borderColor: colors.border.subtle, color: colors.text.primary }]}
          />
          <TextInput
            placeholder="PIN"
            placeholderTextColor={colors.text.muted}
            secureTextEntry
            value={pin}
            onChangeText={setPin}
            style={[styles.input, { borderColor: colors.border.subtle, color: colors.text.primary }]}
          />
          {error ? <NexGText variant="caption" align="center">{error}</NexGText> : null}
          <NexGButton label="Sign in" loading={busy} onPress={() => submit(signIn(phone.trim(), pin))} />
          <NexGButton label="Explore as guest" variant="ghost" loading={busy} onPress={() => submit(continueAsGuest())} />
          <NexGText variant="caption" color="secondary" align="center">Preview the jobs board — accepting stays for signed-in riders.</NexGText>
          {__DEV__ ? (
            <NexGButton label="Continue as dev guest" variant="secondary" loading={busy} onPress={() => submit(signIn(DEV_GUEST_PHONE, DEV_GUEST_PIN))} />
          ) : null}
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
