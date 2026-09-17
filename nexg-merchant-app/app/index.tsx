import { Redirect } from 'expo-router';
import { NexGSplash } from '@/components/ui/NexGSplash';
import { useMerchantAuth } from '@/lib/store';

export default function Index() {
  const ready = useMerchantAuth((s) => s.ready);
  const merchantId = useMerchantAuth((s) => s.merchantId);

  if (!ready) return <NexGSplash />;
  if (!merchantId) return <Redirect href="/(auth)/sign-in" />;
  return <Redirect href="/(tabs)/orders" />;
}
