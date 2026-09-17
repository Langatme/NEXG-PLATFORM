import { Redirect } from 'expo-router';
import { NexGSplash } from '@/components/ui/NexGSplash';
import { useHostAuth } from '@/lib/store';

export default function Index() {
  const ready = useHostAuth((s) => s.ready);
  const propertyId = useHostAuth((s) => s.propertyId);

  if (!ready) return <NexGSplash />;
  if (!propertyId) return <Redirect href="/(auth)/sign-in" />;
  return <Redirect href="/(tabs)/portfolio" />;
}
