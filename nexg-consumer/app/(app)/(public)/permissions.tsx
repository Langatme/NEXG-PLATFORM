import { NexGButton } from '@/components/ui/NexGButton';
import { NexGCard, NexGCardDescription, NexGCardTitle } from '@/components/ui/NexGCard';
import { NexGText } from '@/components/ui/NexGText';
import { useTheme } from '@/theme';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

/** CNS-011 Permission Introduction — location/notifications explainer (system prompts fire later at use). */
export default function Permissions() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">Stay in the loop</NexGText>
      <NexGText variant="body" color="muted">
        NEXG uses your location to show what is nearby and sends updates about orders and bookings. You can change this anytime in settings.
      </NexGText>
      <NexGCard>
        <NexGCardTitle>What each permission is for</NexGCardTitle>
        <NexGCardDescription>Location — shows merchants and experiences near you.</NexGCardDescription>
        <NexGCardDescription>Notifications — order and booking updates only.</NexGCardDescription>
      </NexGCard>
      <NexGButton label="Continue to NEXG" onPress={() => router.replace('/(app)/(auth)/(tabs)/home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, paddingTop: 80, gap: 12 },
});
