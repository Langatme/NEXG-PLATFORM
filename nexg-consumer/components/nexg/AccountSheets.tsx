import { NexGBottomSheet } from '@/components/ui/NexGBottomSheet';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGText } from '@/components/ui/NexGText';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import { Linking as RNLinking, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';

/* ------------------------------------------------------------------ */
/* CNS-097 — Payment methods: default/remove/add M-Pesa (persisted)     */
/* ------------------------------------------------------------------ */

export const PaymentMethodsSheet = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { colors, spacing } = useTheme();
  const storedMpesa = useUserStore((s) => s.mpesaNumber);
  const setStoredMpesa = useUserStore((s) => s.setMpesaNumber);
  const storedDefault = useUserStore((s) => s.defaultPayment);
  const setStoredDefault = useUserStore((s) => s.setDefaultPayment);
  const [mpesaNumber, setMpesaNumber] = useState(storedMpesa ?? '••• 678');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [defaultMethod, setDefaultMethod] = useState<'mpesa' | 'card'>(storedDefault);
  const [removedCard, setRemovedCard] = useState(false);

  const saveMpesa = () => {
    const cleaned = draft.replace(/\s/g, '');
    const valid = /^(?:0|\+?254)?7\d{8}$/.test(cleaned);
    if (!valid) return;
    const masked = `••• ${cleaned.slice(-3)}`;
    setMpesaNumber(masked);
    setStoredMpesa(masked);
    setAdding(false);
    setDraft('');
    trackEvent('widget_actioned', { target: 'mpesa-saved' });
  };

  const pickDefault = (m: 'mpesa' | 'card') => {
    setDefaultMethod(m);
    setStoredDefault(m);
  };

  return (
    <NexGBottomSheet open={open} onClose={onClose} snapPoints={[0.62]} title="Payment methods">
      <View style={{ padding: 16, gap: spacing.md }}>
        {/* M-Pesa */}
        <View style={[styles.methodRow, { backgroundColor: colors.surface.secondary }]}>
          <View style={[styles.pmIcon, { backgroundColor: colors.accent.soft }]}>
            <Ionicons name="phone-portrait-outline" size={20} color={colors.accent.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <NexGText variant="bodyStrong">M-Pesa {defaultMethod === 'mpesa' ? '· Default' : ''}</NexGText>
            <NexGText variant="caption" color="muted">
              Safaricom {mpesaNumber}
            </NexGText>
          </View>
          {adding ? null : (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Set M-Pesa as default" onPress={() => pickDefault('mpesa')}>
                <NexGText variant="label" color="secondary">
                  Default
                </NexGText>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Edit M-Pesa number" onPress={() => setAdding(true)}>
                <NexGText variant="label" color="accent">
                  Edit
                </NexGText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {adding && (
          <View style={{ gap: 8 }}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="07XX XXX XXX"
              keyboardType="phone-pad"
              style={[styles.input, { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle, color: colors.text.primary }]}
            />
            <NexGButton label="Save M-Pesa number" size="medium" onPress={saveMpesa} disabled={draft.replace(/\s/g, '').length < 10} />
          </View>
        )}

        {/* Card */}
        {!removedCard ? (
          <View style={[styles.methodRow, { backgroundColor: colors.surface.secondary }]}>
            <View style={[styles.pmIcon, { backgroundColor: colors.status.infoSoft }]}>
              <Ionicons name="card-outline" size={20} color={colors.status.info} />
            </View>
            <View style={{ flex: 1 }}>
              <NexGText variant="bodyStrong">Visa {defaultMethod === 'card' ? '· Default' : ''}</NexGText>
              <NexGText variant="caption" color="muted">
                •••• 4242 · Saved on device
              </NexGText>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Set card as default" onPress={() => pickDefault('card')}>
                <NexGText variant="label" color="secondary">
                  Default
                </NexGText>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Remove saved card" onPress={() => setRemovedCard(true)}>
                <NexGText variant="label" color="error">
                  Remove
                </NexGText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <NexGText variant="caption" color="muted">
            Card removed. Card capture returns with the payment provider integration.
          </NexGText>
        )}

        <NexGText variant="caption" color="muted">
          Payment methods authorize at checkout. NEXG never stores PINs.
        </NexGText>
      </View>
    </NexGBottomSheet>
  );
};

/* ------------------------------------------------------------------ */
/* CNS-101 — Security: 2FA, sessions, biometrics (device-local)         */
/* ------------------------------------------------------------------ */

export const SecuritySheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { colors, spacing } = useTheme();
  const [twoFactor, setTwoFactor] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  return (
    <NexGBottomSheet open={open} onClose={onClose} snapPoints={[0.55]} title="Security">
      <View style={{ padding: 16, gap: spacing.md }}>
        <View style={[styles.securityRow, { backgroundColor: colors.surface.secondary }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.text.secondary} />
          <NexGText variant="bodyStrong" style={{ flex: 1 }}>
            Two-step verification
          </NexGText>
          <Switch value={twoFactor} onValueChange={setTwoFactor} accessibilityLabel="Two-step verification" trackColor={{ false: colors.border.subtle, true: colors.accent.primary }} thumbColor="#fff" />
        </View>
        <View style={[styles.securityRow, { backgroundColor: colors.surface.secondary }]}>
          <Ionicons name="finger-print-outline" size={20} color={colors.text.secondary} />
          <NexGText variant="bodyStrong" style={{ flex: 1 }}>
            Biometric unlock
          </NexGText>
          <Switch value={biometrics} onValueChange={setBiometrics} accessibilityLabel="Biometric unlock" trackColor={{ false: colors.border.subtle, true: colors.accent.primary }} thumbColor="#fff" />
        </View>
        <NexGText variant="caption" color="muted">
          Sessions on this device only. Signing out clears the guest session.
        </NexGText>
      </View>
    </NexGBottomSheet>
  );
};

/* ------------------------------------------------------------------ */
/* CNS-104 — Support links (threads live in Messages)                   */
/* ------------------------------------------------------------------ */

export const SupportSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { spacing } = useTheme();
  return (
    <NexGBottomSheet open={open} onClose={onClose} snapPoints={[0.5]} title="Help & support">
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.md }}>
        <NexGText variant="body" color="muted">
          Start a conversation in Messages for the fastest reply, or browse help in Account.
        </NexGText>
        <NexGButton
          label="Privacy statement"
          variant="secondary"
          onPress={() => {
            const url = Linking.createURL('/privacy');
            RNLinking.openURL('https://nexg.example.com/privacy').catch(() => undefined);
            trackEvent('widget_actioned', { target: 'privacy', url });
          }}
        />
      </ScrollView>
    </NexGBottomSheet>
  );
};

const styles = StyleSheet.create({
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 12 },
  pmIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 52, fontSize: 16 },
  securityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 12 },
});
