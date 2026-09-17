import { NexGButton } from '@/components/ui/NexGButton';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGText } from '@/components/ui/NexGText';
import useUserStore from '@/hooks/use-userstore';
import { ensureSession } from '@/services/nexg/api';
import { useTheme } from '@/theme';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

/** CNS-003 Sign In — phone + PIN via backend guest ladder. */
export default function SignIn() {
  const router = useRouter();
  const { colors } = useTheme();
  const signIn = useUserStore((s) => s.signIn);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    if (phone.trim().length < 5 || pin.trim().length < 1) return;
    setBusy(true);
    setError(null);
    try {
      await ensureSession();
      signIn({ name: phone.trim() });
      router.replace('/(app)/(auth)/(tabs)/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">Welcome back</NexGText>
      <NexGText variant="body" color="muted">Sign in with your phone and PIN.</NexGText>
      <NexGInput
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="+254 7XX XXX XXX"
        keyboardType="phone-pad"
        autoCapitalize="none"
      />
      <NexGInput
        label="PIN"
        value={pin}
        onChangeText={setPin}
        placeholder="PIN"
        secureTextEntry
      />
      {error ? <NexGText variant="caption" color="error" accessibilityRole="alert">{error}</NexGText> : null}
      <NexGButton label="Sign in" loading={busy} disabled={phone.trim().length < 5} onPress={go} />
      <Link href="/(app)/(public)/recovery" asChild>
        <NexGButton label="Forgot PIN?" variant="ghost" onPress={() => router.push('/(app)/(public)/recovery')} />
      </Link>
      <Link href="/(app)/(public)/sign-up" asChild>
        <NexGButton label="Create account" variant="secondary" onPress={() => router.push('/(app)/(public)/sign-up')} />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, paddingTop: 80, gap: 12 },
});
