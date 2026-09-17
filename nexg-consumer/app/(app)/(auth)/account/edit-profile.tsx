import { NexGButton } from '@/components/ui/NexGButton';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGText } from '@/components/ui/NexGText';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** CNS-095 Edit Profile — name + email stored locally. */
export default function EditProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const user = useUserStore((s) => s.user);
  const signIn = useUserStore((s) => s.signIn);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">Edit profile</NexGText>
      <NexGInput label="Full name" value={name} onChangeText={setName} placeholder="Full name" />
      <NexGInput label="Email" value={email} onChangeText={setEmail} placeholder="Email (optional)" keyboardType="email-address" autoCapitalize="none" />
      <NexGButton
        label="Save"
        disabled={name.trim().length < 2}
        onPress={() => {
          signIn({ name: name.trim(), email: email.trim() || undefined });
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
});
