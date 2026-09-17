import { NexGButton } from '@/components/ui/NexGButton';
import { NexGOTPInput } from '@/components/ui/NexGOTPInput';
import { NexGText } from '@/components/ui/NexGText';
import { useTheme } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

/** CNS-006 Email Verification — any 4+ digit code (backend guest already created). */
export default function VerifyEmail() {
  const router = useRouter();
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">Check your email</NexGText>
      <NexGText variant="body" color="muted">Enter the verification code we sent you.</NexGText>
      <NexGOTPInput length={4} value={code} onChangeText={setCode} />
      <NexGButton
        label="Verify"
        disabled={code.trim().length < 4}
        onPress={() => router.replace('/(app)/(auth)/(tabs)/home')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, paddingTop: 80, gap: 12 },
});
