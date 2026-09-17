import { Redirect } from 'expo-router';
import { NexGSplash } from '@/components/ui/NexGSplash';
import { useRiderAuth } from '@/lib/store';

export default function Index() {
  const ready = useRiderAuth((s) => s.ready);
  const signedIn = useRiderAuth((s) => s.signedIn);

  if (!ready) return <NexGSplash />;
  if (!signedIn) return <Redirect href="/(auth)/sign-in" />;
  return <Redirect href="/(tabs)/jobs" />;
}
