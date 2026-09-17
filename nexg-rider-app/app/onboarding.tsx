import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGCard } from '@/components/ui/NexGCard';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGSwitch } from '@/components/ui/NexGSwitch';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import {
  getRiderProfile,
  presignDoc,
  submitRiderProfile,
  uploadPhoto,
  type RiderType,
} from '@/lib/api';
import { useRiderAuth } from '@/lib/store';
import { useTheme } from '@/theme';

const PATHWAYS: Array<{ v: RiderType; t: string; d: string }> = [
  { v: 'independent', t: 'Independent Rider', d: 'Own vehicle · commission per delivery' },
  { v: 'dedicated', t: 'NexG Dedicated', d: 'NexG vehicle · base salary · shifts' },
  { v: 'fleet', t: 'Fleet Partner', d: 'Company · bulk riders + vehicles' },
];

export default function RiderOnboardingScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const signedIn = useRiderAuth((s) => s.signedIn);
  const queryClient = useQueryClient();
  const profileQ = useQuery({ queryKey: ['r-profile'], queryFn: getRiderProfile, enabled: signedIn, retry: false });

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<RiderType>('independent');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('');
  const [estate, setEstate] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [kraPin, setKraPin] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Motorcycle');
  const [plate, setPlate] = useState('');
  const [shift, setShift] = useState('Morning (6am–2pm)');
  const [zone, setZone] = useState('');
  const [mpesa, setMpesa] = useState('');
  const [emergName, setEmergName] = useState('');
  const [emergPhone, setEmergPhone] = useState('');
  const [company, setCompany] = useState('');
  const [regNum, setRegNum] = useState('');
  const [signName, setSignName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [docKeys, setDocKeys] = useState<Record<string, string>>({});

  if (!signedIn) return <Redirect href="/(auth)/sign-in" />;
  if (profileQ.isLoading) return <NexGSectionSkeleton />;
  if (profileQ.isError) {
    const e = profileQ.error;
    if (!(e instanceof Error) || !/api 404/.test(e.message)) return <NexGErrorState onRetry={() => profileQ.refetch()} />;
  }
  const existing = profileQ.data;
  if (existing && step === 0 && !busy && existing.status !== undefined && name === '' && type === 'independent' && existing.personal.name) {
    // Prefill once from server profile for resubmit flow.
    setType(existing.type);
    setName(existing.personal.name ?? '');
    setPhone(existing.personal.phone ?? '');
  }
  if (existing && (existing.status === 'pending' || existing.status === 'approved') && step === 0 && error === null) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top, padding: spacing.lg }]}>
        <NexGButton label="‹ Jobs" variant="ghost" onPress={() => router.back()} />
        <NexGEmptyState
          emoji={existing.status === 'approved' ? '✅' : '⏳'}
          title={existing.status === 'approved' ? 'Onboarding approved' : 'Application pending review'}
          message={
            existing.status === 'approved'
              ? `Active as ${existing.type}. You can receive offers.`
              : 'Our team verifies documents within 24h. You will be notified.'
          }
        />
        {existing.status === 'pending' ? null : null}
        {existing.reason ? <NexGText variant="body">{existing.reason}</NexGText> : null}
        <NexGButton label="Refresh status" variant="secondary" onPress={() => profileQ.refetch()} />
      </View>
    );
  }

  const pickDoc = async (slot: string) => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Photo permission denied — you can retry after enabling access.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (picked.canceled || !picked.assets[0]) return;
    const uri = picked.assets[0].uri;
    setBusy(true);
    try {
      const pre = await presignDoc(`${slot}-${Date.now()}.jpg`);
      await uploadPhoto(pre.url, uri);
      setDocKeys((d) => ({ ...d, [slot]: pre.key }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed — retry (never lose local copy).');
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError('Full name and WhatsApp phone are required.');
      return;
    }
    if (!idNumber.trim()) {
      setError('National ID number is required.');
      return;
    }
    if (type === 'independent' && !plate.trim()) {
      setError('License plate is required for Independent riders.');
      return;
    }
    if (type === 'fleet' && (!company.trim() || !regNum.trim())) {
      setError('Company legal name + registration number required for Fleet.');
      return;
    }
    if (!signName.trim() || !agreed) {
      setError('Type your legal name and accept the Rider Terms to sign.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await submitRiderProfile({
        type,
        personal: { name: name.trim(), phone: phone.trim(), county, estate },
        identity_doc: { idNumber: idNumber.trim(), kraPin: kraPin.trim(), dlNumber: dlNumber.trim() },
        vehicle: type === 'dedicated' ? {} : { type: vehicleType, plate: plate.trim() },
        docs: docKeys,
        payout: { method: 'M-Pesa', mpesaNumber: mpesa.trim() },
        emergency: { name: emergName.trim(), phone: emergPhone.trim() },
        services: ['Package Delivery'],
        shift: type === 'dedicated' ? shift : null,
        zone: type === 'dedicated' ? zone : null,
        company: type === 'fleet' ? { legalName: company.trim(), regNum: regNum.trim() } : {},
        fleet_riders: [],
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ['r-profile'] });
      setStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <NexGButton label="‹ Jobs" variant="ghost" onPress={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <NexGText variant="title">Rider onboarding</NexGText>
        <NexGText variant="caption">Step {step + 1} of 6 · {PATHWAYS.find((p) => p.v === type)?.t}</NexGText>
        {existing?.status === 'rejected' ? (
          <NexGText variant="body">Not approved: {existing.reason ?? 'Fix documents and resubmit.'}</NexGText>
        ) : null}

        {step === 0 ? (
          <View style={{ gap: 8 }}>
            {PATHWAYS.map((p) => (
              <TouchableOpacity
                key={p.v}
                onPress={() => setType(p.v)}
                accessibilityRole="button"
                accessibilityLabel={p.t}
                accessibilityState={{ selected: type === p.v }}
              >
                <NexGCard style={{ borderWidth: 1, borderColor: type === p.v ? colors.accent.primary : colors.border.subtle }}>
                  <NexGText variant="bodyStrong">{p.t}</NexGText>
                  <NexGText variant="caption">{p.d}</NexGText>
                </NexGCard>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {step === 1 ? (
          <View style={{ gap: 8 }}>
            <NexGInput label="Full name" placeholder="Full name (as on ID) *" value={name} onChangeText={setName} />
            <NexGInput label="WhatsApp phone" placeholder="WhatsApp phone +254 *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <NexGInput label="County" placeholder="County" value={county} onChangeText={setCounty} />
            <NexGInput label="Estate / Area" placeholder="Estate / Area" value={estate} onChangeText={setEstate} />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={{ gap: 8 }}>
            <NexGInput label="National ID" placeholder="National ID *" value={idNumber} onChangeText={setIdNumber} />
            <NexGInput label="KRA PIN" placeholder="KRA PIN" value={kraPin} onChangeText={setKraPin} />
            <NexGInput label="NTSA license" placeholder="NTSA license" value={dlNumber} onChangeText={setDlNumber} />
            {type === 'dedicated' ? (
              <>
                <NexGInput label="Preferred shift" placeholder="Preferred shift" value={shift} onChangeText={setShift} />
                <NexGInput label="Operating zone" placeholder="Operating zone" value={zone} onChangeText={setZone} />
              </>
            ) : (
              <>
                <NexGInput label="Vehicle type" placeholder="Vehicle type (Motorcycle/TukTuk/Car/Bicycle)" value={vehicleType} onChangeText={setVehicleType} />
                <NexGInput label="License plate" placeholder="License plate *" value={plate} onChangeText={setPlate} autoCapitalize="characters" />
              </>
            )}
          </View>
        ) : null}

        {step === 3 ? (
          <View style={{ gap: 8 }}>
            <NexGText variant="body">Documents — clear photos, max 5MB each.</NexGText>
            {['national-id', 'license', 'kra-pin', 'selfie'].map((slot) => (
              <View key={slot} style={styles.row}>
                <NexGText variant="body">{slot}{docKeys[slot] ? ' ✓' : ''}</NexGText>
                <NexGButton label={docKeys[slot] ? 'Retake' : 'Upload'} variant="secondary" disabled={busy} onPress={() => pickDoc(slot)} />
              </View>
            ))}
          </View>
        ) : null}

        {step === 4 ? (
          <View style={{ gap: 8 }}>
            <NexGInput label="M-Pesa number" placeholder="M-Pesa number" value={mpesa} onChangeText={setMpesa} keyboardType="phone-pad" />
            <NexGInput label="Emergency name" placeholder="Emergency contact name" value={emergName} onChangeText={setEmergName} />
            <NexGInput label="Emergency phone" placeholder="Emergency phone" value={emergPhone} onChangeText={setEmergPhone} keyboardType="phone-pad" />
            {type === 'fleet' ? (
              <>
                <NexGInput label="Company legal name" placeholder="Company legal name *" value={company} onChangeText={setCompany} />
                <NexGInput label="Reg number" placeholder="Reg number *" value={regNum} onChangeText={setRegNum} />
              </>
            ) : null}
          </View>
        ) : null}

        {step === 5 ? (
          <View style={{ gap: 8 }}>
            <NexGText variant="body">Review & sign — {type} agreement, Kenya law, 7-day termination.</NexGText>
            <NexGInput label="Legal name" placeholder="Full legal name (e-sign) *" value={signName} onChangeText={setSignName} />
            <NexGSwitch label="I agree to Rider Terms, Code of Conduct, Safety" value={agreed} onValueChange={setAgreed} accessibilityLabel="Accept rider terms" />
          </View>
        ) : null}

        {error ? <NexGText variant="caption">{error}</NexGText> : null}
        <View style={styles.row}>
          {step > 0 ? <NexGButton label="Back" variant="secondary" onPress={() => setStep((s) => s - 1)} /> : null}
          {step < 5 ? (
            <NexGButton label="Next" onPress={() => setStep((s) => s + 1)} />
          ) : (
            <NexGButton label="Sign & submit" loading={busy} disabled={busy} onPress={submit} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
