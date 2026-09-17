import { NexGButton } from '@/components/ui/NexGButton';
import { NexGExperienceChips } from '@/components/ui/NexGExperienceChips';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGText } from '@/components/ui/NexGText';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

/** CNS-010 Profile Setup — name + experience preferences after verification. */
export default function ProfileSetup() {
  const router = useRouter();
  const { colors } = useTheme();
  const signIn = useUserStore((s) => s.signIn);
  const setExperienceIds = useUserStore((s) => s.setExperienceIds);
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (id: string) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">How should we call you?</NexGText>
      <NexGText variant="body" color="muted">This name shows on orders and bookings.</NexGText>
      <NexGInput label="Full name" value={name} onChangeText={setName} placeholder="Full name" />
      <NexGText variant="bodyStrong" style={{ marginTop: 8 }}>
        What do you love?
      </NexGText>
      <NexGText variant="caption" color="muted">
        Pick a few — we tune home for you. Optional.
      </NexGText>
      <NexGExperienceChips selected={picked} onToggle={toggle} />
      <NexGButton
        label="Continue"
        disabled={name.trim().length < 2}
        onPress={() => {
          signIn({ name: name.trim() });
          setExperienceIds(picked);
          router.replace('/(app)/(public)/permissions');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, paddingTop: 80, gap: 12 },
});
