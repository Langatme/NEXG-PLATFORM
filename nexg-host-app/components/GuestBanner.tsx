import { StyleSheet, View } from 'react-native';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGText } from '@/components/ui/NexGText';
import { useHostAuth } from '@/lib/store';
import { useTheme } from '@/theme';

/** Read-only preview notice for guest sessions (mirrors consumer guest UX). */
export function GuestBanner() {
  const { colors } = useTheme();
  const signOut = useHostAuth((s) => s.signOut);
  if (!useHostAuth((s) => s.isGuest)) return null;
  return (
    <View style={[styles.banner, { backgroundColor: colors.accent.soft, borderColor: colors.border.subtle }]}>
      <NexGText variant="body">Browsing as guest · read-only</NexGText>
      <NexGButton label="Staff sign in" variant="secondary" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
});
