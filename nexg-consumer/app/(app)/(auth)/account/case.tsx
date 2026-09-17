import { NexGEmptyState } from '@/components/ui/NexGStates';
import { NexGText } from '@/components/ui/NexGText';
import { useTheme } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { readCases } from './help';

/** CNS-106 Support Case Detail (local). */
export default function CaseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const c = readCases().find((x) => x.id === id);
  if (!c) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 12, backgroundColor: colors.background.primary }]}>
        <NexGEmptyState
          emoji="🗂️"
          title="Case not found"
          message="This support case may have been removed."
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }
  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">{c.title}</NexGText>
      <NexGText variant="caption" color="muted">{new Date(c.at).toLocaleString()}</NexGText>
      <NexGText variant="body">{c.detail || 'No details added.'}</NexGText>
      <NexGText variant="caption" color="muted">Status: open · we reply in-app within a day.</NexGText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
});
