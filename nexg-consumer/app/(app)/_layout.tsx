import useUserStore from '@/hooks/use-userstore';
import { Stack } from 'expo-router';

/**
 * One-way doors: public (sign-in/onboarding) vs authed app.
 * Guards + replace navigations mean back never re-enters sign-in,
 * onboarding, or a completed purchase (checkout → confirmation is replace).
 */
export default function AppGroupLayout() {
  const user = useUserStore((s) => s.user);
  const isGuest = useUserStore((s) => s.isGuest);
  const isAuthed = user !== null || isGuest;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthed}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthed}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
