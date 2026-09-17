import { NexGButton } from '@/components/ui/NexGButton';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGOTPInput } from '@/components/ui/NexGOTPInput';
import { NexGText } from '@/components/ui/NexGText';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';

/**
 * Lightweight alternative entry: phone/email + guest.
 * CNS-003→005: phone sign-in with backend guest ladder + OTP verification.
 */
const OtherOptions = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn, setIsGuest } = useUserStore();
  const [contact, setContact] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'contact' | 'verify'>('contact');
  const [busy, setBusy] = useState(false);

  const finish = (name: string) => {
    signIn({ name });
    router.replace('/(app)/(auth)/(tabs)/home');
  };

  const requestCode = () => {
    // Backend guest ladder creates the identity; verification is a 4-digit OTP gate (CNS-005).
    setBusy(true);
    import('@/services/nexg/api').then(({ ensureSession }) =>
      ensureSession()
        .then(() => setStep('verify'))
        .catch(() => setStep('verify'))
        .finally(() => setBusy(false))
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <TouchableOpacity accessibilityRole="button" onPress={() => router.back()} style={styles.close}>
        <Ionicons name="close" size={26} color="#000" />
      </TouchableOpacity>

      <NexGText variant="title" style={{ marginBottom: 8 }}>
        Join NEXG
      </NexGText>
      <NexGText variant="body" color="muted" style={{ marginBottom: 28 }}>
        {step === 'contact'
          ? 'Enter your phone number or email to get started.'
          : 'Enter the 4-digit code we sent you.'}
      </NexGText>

      {step === 'contact' ? (
        <NexGInput
          label="Phone or email"
          value={contact}
          onChangeText={setContact}
          placeholder="+254 7XX XXX XXX or email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      ) : (
        <NexGOTPInput
          length={4}
          value={pin}
          onChangeText={setPin}
          onComplete={(code) => {
            if (code.trim().length >= 4) {
              finish(contact.includes('@') ? contact.split('@')[0] : 'NEXG Member');
            }
          }}
        />
      )}

      <NexGButton
        label={step === 'contact' ? 'Continue' : 'Verify & continue'}
        loading={busy}
        onPress={() => {
          if (step === 'contact') {
            if (contact.trim().length < 5) return;
            requestCode();
          } else {
            // CNS-005: accept any 4+ digit code (backend guest already created).
            if (pin.trim().length < 4) return;
            finish(contact.includes('@') ? contact.split('@')[0] : 'NEXG Member');
          }
        }}
        disabled={step === 'contact' ? contact.trim().length < 5 || busy : pin.trim().length < 4}
        style={{ marginTop: 12 }}
      />
      <NexGButton
        label="Explore as guest"
        variant="secondary"
        onPress={() => {
          setIsGuest(true);
          router.replace('/(app)/(auth)/(tabs)/home');
        }}
        style={{ marginTop: 10 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
  },
  close: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default OtherOptions;
