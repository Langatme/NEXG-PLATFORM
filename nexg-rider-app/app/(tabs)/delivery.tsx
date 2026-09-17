import { useQuery } from '@tanstack/react-query';
import { NexGEmptyState } from '@/components/ui/NexGStates';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { getJobs } from '@/lib/api';
import { useRiderAuth } from '@/lib/store';
import { Redirect } from 'expo-router';

/** Active tab: jumps to the rider's current task, or explains the empty state. */
export default function ActiveDeliveryScreen() {
  const signedIn = useRiderAuth((s) => s.signedIn);
  const query = useQuery({ queryKey: ['r-active'], queryFn: () => getJobs(), enabled: signedIn });

  if (!signedIn) return <Redirect href="/(auth)/sign-in" />;
  if (query.isLoading) return <NexGSectionSkeleton />;
  const active = (query.data ?? []).find((j) =>
    ['ACCEPTED', 'ARRIVED_PICKUP', 'PICKED', 'ARRIVED_DROP'].includes(j.status)
  );
  if (!active) {
    return (
      <NexGEmptyState
        emoji="🛵"
        title="No active delivery"
        message="Accepted jobs appear here with navigation, pickup and proof steps."
      />
    );
  }
  return <Redirect href={{ pathname: '/delivery/[id]', params: { id: active.id } }} />;
}
