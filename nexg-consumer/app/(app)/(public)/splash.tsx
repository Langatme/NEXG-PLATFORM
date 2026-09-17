import { NexGText } from '@/components/ui/NexGText';
import { useTheme } from '@/theme';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

/** CNS-001 Splash — logo gate, routes to welcome or home based on session. */
export default function Splash() {
  const router = useRouter();
  const { colors } = useTheme();
  useEffect(() => {
    const t = setTimeout(() => router.replace('/(app)/(public)'), 900);
    return () => clearTimeout(t);
  }, [router]);
  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <NexGText variant="display" align="center">NEXG</NexGText>
      <NexGText variant="caption" color="muted">Almost everything, around you</NexGText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
});
