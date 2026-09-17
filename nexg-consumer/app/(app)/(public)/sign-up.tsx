import { NexGButton } from '@/components/ui/NexGButton';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGText } from '@/components/ui/NexGText';
import useUserStore from '@/hooks/use-userstore';
import { ensureSession } from '@/services/nexg/api';
import { useTheme } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

/** CNS-004 Sign Up — creates backend guest identity, forwards to phone verification. */
export default function SignUp() {
  const router = useRouter();
  const { colors } = useTheme();
  const signIn = useUserStore((s) => s.signIn);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    if (phone.trim().length < 5) return;
    setBusy(true);
    setError(null);
    try {
      await ensureSession();
      signIn({ name: phone.trim() });
      router.replace('/(app)/(public)/profile-setup');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">Join NEXG</NexGText>
      <NexGText variant="body" color="muted">Enter your phone number to get started.</NexGText>
      <NexGInput label="Phone number" value={phone} onChangeText={setPhone} placeholder="+254 7XX XXX XXX" keyboardType="phone-pad" autoCapitalize="none" />
      {error ? <NexGText variant="caption" color="error" accessibilityRole="alert">{error}</NexGText> : null}
      <NexGButton label="Continue" loading={busy} disabled={phone.trim().length < 5} onPress={go} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, paddingTop: 80, gap: 12 },
});
