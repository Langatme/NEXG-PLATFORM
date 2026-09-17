import { NexGButton } from '@/components/ui/NexGButton';
import { NexGOTPInput } from '@/components/ui/NexGOTPInput';
import { NexGText } from '@/components/ui/NexGText';
import { useTheme } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

/** CNS-007 MFA Verification — 6-digit gate (dev: any 6 digits). */
export default function Mfa() {
  const router = useRouter();
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">Two-step verification</NexGText>
      <NexGText variant="body" color="muted">Enter the 6-digit code from your authenticator.</NexGText>
      <NexGOTPInput length={6} value={code} onChangeText={setCode} />
      <NexGButton
        label="Confirm"
        disabled={code.trim().length < 6}
        onPress={() => router.replace('/(app)/(auth)/(tabs)/home')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, paddingTop: 80, gap: 12 },
});
