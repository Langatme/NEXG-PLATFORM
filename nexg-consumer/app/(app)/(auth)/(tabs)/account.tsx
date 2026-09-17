import { PaymentMethodsSheet, SecuritySheet, SupportSheet } from '@/components/nexg/AccountSheets';
import { NexGText } from '@/components/ui/NexGText';
import useUserStore from '@/hooks/use-userstore';
import { useOrderStore } from '@/hooks/use-orderstore';
import { useTheme } from '@/theme';
import { formatKes } from '@/utils/money';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface RowItem {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
}

/**
 * CNS-094→102 — Account: the personal configuration workspace.
 * Saved, payments, addresses, preferences, security and support compress
 * into rows + sheets; only genuinely deep flows leave the surface.
 */
const AccountScreen = () => {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const user = useUserStore((s) => s.user);
  const isGuest = useUserStore((s) => s.isGuest);
  const setThemePreference = useUserStore((s) => s.setThemePreference);
  const signOut = useUserStore((s) => s.signOut);
  const orders = useOrderStore((s) => s.orders);
  const bookings = useOrderStore((s) => s.bookings);

  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const darkModeOn = mode === 'dark';

  const walletBalance = useMemo(() => 0, []);
  const activityCount = orders.length + bookings.length;

  const rows: RowItem[] = [
    { icon: 'person-outline', label: 'Edit profile', onPress: () => router.push('/(app)/(auth)/account/edit-profile') },
    { icon: 'heart-outline', label: 'Saved places', value: 'Home · Work', onPress: () => router.push('/(app)/(auth)/(modal)/location') },
    { icon: 'receipt-outline', label: 'Orders & bookings', value: `${activityCount}`, onPress: () => router.push('/(app)/(auth)/(tabs)/activity') },
    { icon: 'card-outline', label: 'Payment methods', value: 'M-Pesa · Card', onPress: () => setPaymentsOpen(true) },
    { icon: 'wallet-outline', label: 'Wallet', value: walletBalance > 0 ? formatKes(walletBalance) : 'Empty' },
    { icon: 'location-outline', label: 'Addresses', onPress: () => router.push('/(app)/(auth)/account/addresses') },
    { icon: 'options-outline', label: 'Preferences', onPress: () => router.push('/(app)/(auth)/account/preferences') },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => router.push('/(app)/(auth)/(modal)/notifications') },
    { icon: 'shield-outline', label: 'Security', onPress: () => setSecurityOpen(true) },
    { icon: 'lock-closed-outline', label: 'Privacy & security', onPress: () => router.push('/(app)/(auth)/account/privacy-security') },
    { icon: 'help-circle-outline', label: 'Help & support', onPress: () => router.push('/(app)/(auth)/account/help') },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.surface.primary }]}>
        <View style={styles.avatar}>
          <NexGText variant="title" style={{ color: colors.text.inverse }}>
            {(user?.name ?? 'G').slice(0, 1).toUpperCase()}
          </NexGText>
        </View>
        <View style={{ flex: 1 }}>
          <NexGText variant="heading">{user?.name ?? 'Welcome'}</NexGText>
          <NexGText variant="caption" color="muted">
            {isGuest ? 'Browsing as guest' : user?.email ?? 'NEXG member'}
          </NexGText>
        </View>
        {!isGuest && (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Sign out" onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={22} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Rows */}
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        {rows.map((row) => (
          <Row key={row.label} row={row} />
        ))}

        {/* Dark mode inline (CNS-098 preferences) */}
        <View style={[styles.rowCard, { backgroundColor: colors.surface.primary }]}>
          <Ionicons name="contrast-outline" size={20} color={colors.text.secondary} />
          <NexGText variant="bodyStrong" style={{ flex: 1 }}>
            Dark mode
          </NexGText>
          <Switch
            accessibilityLabel="Dark mode"
            value={darkModeOn}
            onValueChange={(on) => setThemePreference(on ? 'dark' : 'light')}
            trackColor={{ false: colors.border.subtle, true: colors.accent.primary }}
            thumbColor="#fff"
          />
        </View>

        <Row row={{ icon: 'information-circle-outline', label: 'About NEXG', value: 'v1.0.0' }} />
      </View>

      {isGuest && (
        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.signInCard, { backgroundColor: colors.surface.primary }]}
          onPress={() => {
            signOut();
            router.replace('/(app)/(public)');
          }}>
          <NexGText variant="bodyStrong" color="accent">
            Sign in to sync your activity
          </NexGText>
        </TouchableOpacity>
      )}

      <PaymentMethodsSheet open={paymentsOpen} onClose={() => setPaymentsOpen(false)} />
      <SecuritySheet open={securityOpen} onClose={() => setSecurityOpen(false)} />
      <SupportSheet open={supportOpen} onClose={() => setSupportOpen(false)} />
    </ScrollView>
  );
};

const Row = ({ row }: { row: RowItem }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={!row.onPress}
      onPress={row.onPress}
      style={[styles.rowCard, { backgroundColor: colors.surface.primary }]}>
      <Ionicons name={row.icon} size={20} color={colors.text.secondary} />
      <NexGText variant="bodyStrong" style={{ flex: 1 }}>
        {row.label}
      </NexGText>
      {row.value ? (
        <NexGText variant="caption" color="muted">
          {row.value}
        </NexGText>
      ) : null}
      {row.onPress ? <Ionicons name="chevron-forward" size={16} color={colors.text.muted} /> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 16, marginTop: 16, borderRadius: 18, padding: 16 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#00A26B', alignItems: 'center', justifyContent: 'center' },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginBottom: 10 },
  signInCard: { marginHorizontal: 16, marginTop: 8, borderRadius: 14, padding: 16, alignItems: 'center' },
});

export default AccountScreen;
