import { NexGAuthGate } from '@/components/ui/NexGAuthGate';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

/** Welcome hero mosaic — every vertical at a glance (welcome-screen pattern). */
function ExperienceMosaic() {
  const { colors, radii } = useTheme();
  const glyphs: Array<keyof typeof Ionicons.glyphMap> = [
    'fast-food-outline',
    'leaf-outline',
    'sparkles-outline',
    'ticket-outline',
    'car-outline',
    'bag-outline',
    'calendar-outline',
    'construct-outline',
    'bed-outline',
    'pricetag-outline',
  ];
  return (
    <View
      style={[
        styles.mosaic,
        { backgroundColor: colors.surface.secondary, borderRadius: radii.large },
      ]}>
      {glyphs.map((g) => (
        <Ionicons key={g} name={g} size={22} color={colors.text.secondary} />
      ))}
    </View>
  );
}

/**
 * Wolt-style welcome gate: Get started + Log in + table-code entry, with an
 * always-visible guest row at the bottom. Guest is a first-class path, never
 * hidden behind a menu.
 */
export default function Index() {
  const router = useRouter();
  const setIsGuest = useUserStore((s) => s.setIsGuest);

  const guest = () => {
    setIsGuest(true);
    router.replace('/(app)/(auth)/(tabs)/home');
  };

  return (
    <NexGAuthGate
      title="NEXG"
      subtitle={'Almost everything,\naround you'}
      eyebrow="Order · Book · Reserve · Request"
      hero={<ExperienceMosaic />}
      primaryLabel="Get started"
      onPrimary={() => router.push('/(app)/(public)/other-options')}
      secondaryLabel="Log in"
      onSecondary={() => router.push('/(app)/(public)/sign-in')}
      tertiaryLabel="Scan a table code"
      onTertiary={() => router.push('/(app)/(public)/qr')}
      onGuest={guest}
      guestCaption="Browse first — sign in when you order. By continuing you agree to the NEXG Privacy Statement."
    />
  );
}

const styles = StyleSheet.create({
  mosaic: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    marginBottom: 4,
  },
});
