import { NexGButton } from '@/components/ui/NexGButton';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGEmptyState } from '@/components/ui/NexGStates';
import { NexGText } from '@/components/ui/NexGText';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * PUB-001→004 + CNS-075→079 Guest QR read-only entry.
 * Manual code entry + shared-link deep links; camera scanning can replace
 * `resolveMerchantId` later without changing the flow.
 */
function resolveMerchantId(code: string): string | null {
  const t = code.trim();
  if (!t) return null;
  const m = t.match(/(mrc_[A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

export default function QrEntry() {
  const router = useRouter();
  const { colors } = useTheme();
  const user = useUserStore((s) => s.user);
  const isGuest = useUserStore((s) => s.isGuest);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Pre-auth gate: the merchant surface lives in the (auth) group, so
  // unauthenticated guests sign in first instead of deep-pushing there.
  const openMerchant = (mid: string): void => {
    if (!user && !isGuest) {
      router.push('/(app)/(public)/sign-in');
      return;
    }
    router.push({ pathname: '/(app)/(auth)/(modal)/merchant/[id]', params: { id: mid } });
  };

  // PUB-003 shared-link entry: cold-start + warm URLs like nexg://merchant/mrc_001 resolve here.
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (!url) return;
      const mid = resolveMerchantId(url);
      if (mid) openMerchant(mid);
    }).catch(() => undefined);
    const sub = Linking.addEventListener('url', ({ url }) => {
      const mid = resolveMerchantId(url);
      if (mid) openMerchant(mid);
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isGuest]);

  const open = (): void => {
    const mid = resolveMerchantId(code);
    if (!mid) {
      setError('Enter a plaque code like mrc_001 or nexg://merchant/mrc_001.');
      return;
    }
    setError(null);
    openMerchant(mid);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">Scan for Wi-Fi & services</NexGText>
      <NexGText variant="body" color="muted">
        Point your table plaque code here to open this property — menus, services and support, no app download needed beyond NEXG.
      </NexGText>
      <NexGInput
        value={code}
        onChangeText={setCode}
        placeholder="mrc_001 or nexg://merchant/mrc_001"
        autoCapitalize="none"
        autoCorrect={false}
        error={error ?? undefined}
        accessibilityLabel="Property plaque code"
      />
      <NexGButton label="Open property" disabled={!code.trim()} onPress={open} />
      <View style={{ marginTop: 16 }}>
        <NexGEmptyState
          emoji="🛎️"
          title="Need anything?"
          message="NEXG Concierge — Wi-Fi, service requests and support live on the property page."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, paddingTop: 80, gap: 12 },
});
