import { NexGExperienceChips } from '@/components/ui/NexGExperienceChips';
import { NexGText } from '@/components/ui/NexGText';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';

/** CNS-098 Preferences + CNS-099 Notification Settings (local toggles). */
export default function Preferences() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const mode = useUserStore((s) => s.themePreference);
  const setThemePreference = useUserStore((s) => s.setThemePreference);
  const experienceIds = useUserStore((s) => s.experienceIds);
  const setExperienceIds = useUserStore((s) => s.setExperienceIds);
  const [offers, setOffers] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">Preferences</NexGText>
      <Row label="Dark mode" value={mode === 'dark'} onChange={(v) => setThemePreference(v ? 'dark' : 'light')} />
      <NexGText variant="bodyStrong" style={{ marginTop: 12 }}>Experiences</NexGText>
      <NexGText variant="caption" color="muted">What you love — home tunes itself to these.</NexGText>
      <NexGExperienceChips
        selected={experienceIds}
        onToggle={(id) =>
          setExperienceIds(
            experienceIds.includes(id)
              ? experienceIds.filter((e) => e !== id)
              : [...experienceIds, id]
          )
        }
      />
      <NexGText variant="bodyStrong" style={{ marginTop: 12 }}>Notifications</NexGText>
      <Row label="Offers & promos" value={offers} onChange={setOffers} />
      <Row label="Order updates" value={orderUpdates} onChange={setOrderUpdates} />
    </View>
  );
}

function Row({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <NexGText variant="body">{label}</NexGText>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
});
