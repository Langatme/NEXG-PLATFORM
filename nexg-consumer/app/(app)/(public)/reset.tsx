import { NexGButton } from '@/components/ui/NexGButton';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGText } from '@/components/ui/NexGText';
import { useTheme } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

/** CNS-009 Reset Credential — code + new PIN. */
export default function Reset() {
  const router = useRouter();
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const valid = code.trim().length >= 4 && pin.trim().length >= 4;
  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">Set a new PIN</NexGText>
      <NexGText variant="body" color="muted">Enter the reset code and choose a new PIN.</NexGText>
      <NexGInput label="Reset code" value={code} onChangeText={setCode} placeholder="Reset code" keyboardType="number-pad" />
      <NexGInput label="New PIN" value={pin} onChangeText={setPin} placeholder="New PIN (4+ digits)" secureTextEntry keyboardType="number-pad" />
      <NexGButton label="Save new PIN" disabled={!valid} onPress={() => router.replace('/(app)/(public)/sign-in')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, paddingTop: 80, gap: 12 },
});
