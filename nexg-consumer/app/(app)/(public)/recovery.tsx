import { NexGButton } from '@/components/ui/NexGButton';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGText } from '@/components/ui/NexGText';
import { useTheme } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

/** CNS-008 Account Recovery — request reset link/code. */
export default function Recovery() {
  const router = useRouter();
  const { colors } = useTheme();
  const [contact, setContact] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">Recover account</NexGText>
      <NexGText variant="body" color="muted">Enter your phone or email and we will send a reset code.</NexGText>
      <NexGInput label="Phone or email" value={contact} onChangeText={setContact} placeholder="+254 7XX XXX XXX or email" autoCapitalize="none" />
      {sent ? <NexGText variant="caption">Code sent — check your messages.</NexGText> : null}
      <NexGButton
        label={sent ? 'Continue to reset' : 'Send code'}
        disabled={contact.trim().length < 5}
        onPress={() => {
          if (sent) router.push('/(app)/(public)/reset');
          else setSent(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, paddingTop: 80, gap: 12 },
});
