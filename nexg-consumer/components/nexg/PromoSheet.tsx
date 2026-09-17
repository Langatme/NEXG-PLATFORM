import { NexGBottomSheet } from '@/components/ui/NexGBottomSheet';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGText } from '@/components/ui/NexGText';
import type { Activity, Promotion } from '@/domain/types';
import { useCartStore } from '@/hooks/use-cartstore';
import { useTheme } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export function PromoSheet({ promo, onClose }: { promo: Promotion | null; onClose: () => void }) {
  const router = useRouter();
  const applyPromo = useCartStore((s) => s.applyPromo);
  return (
    <NexGBottomSheet open={!!promo} onClose={onClose} snapPoints={[0.45]} title={promo ? `${promo.emoji} ${promo.headline}` : ''}>
      {promo ? (
        <View style={{ padding: 20, gap: 12 }}>
          <NexGText variant="body" color="muted">
            {promo.subline} · Code {promo.code}
          </NexGText>
          <NexGButton
            label="Apply at checkout"
            onPress={() => {
              applyPromo(promo.code);
              trackEvent('filter_used', { filterType: 'promo', code: promo.code });
              onClose();
              router.push('/(app)/(auth)/order');
            }}
          />
        </View>
      ) : null}
    </NexGBottomSheet>
  );
}

export function ActiveOrderSheet({ activity, onClose }: { activity: Activity | null; onClose: () => void }) {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <NexGBottomSheet open={!!activity} onClose={onClose} snapPoints={[0.4]} title="Happening now">
      {activity ? (
        <View style={{ padding: 20, gap: 12 }}>
          <NexGText variant="bodyStrong">
            {activity.merchant.accentEmoji} {activity.merchant.name} · {activity.status.replace(/_/g, ' ')}
          </NexGText>
          <NexGButton
            label="Track"
            onPress={() => {
              onClose();
              router.push({ pathname: '/(app)/(auth)/activity/[id]', params: { id: activity.id } });
            }}
          />
          <NexGText variant="caption" color="muted" style={{ color: colors.text.muted }}>
            Statuses update live.
          </NexGText>
        </View>
      ) : null}
    </NexGBottomSheet>
  );
}

export function CategorySheet({ category, onClose }: { category: string | null; onClose: () => void }) {
  const router = useRouter();
  return (
    <NexGBottomSheet open={!!category} onClose={onClose} snapPoints={[0.4]} title={category ?? ''}>
      {category ? (
        <View style={{ padding: 20, gap: 12 }}>
          <NexGText variant="body" color="muted">
            Browse every {category} place with search filters.
          </NexGText>
          <NexGButton
            label={`Search ${category}`}
            onPress={() => {
              onClose();
              router.push({ pathname: '/(app)/(auth)/(modal)/search', params: { q: category } });
            }}
          />
        </View>
      ) : null}
    </NexGBottomSheet>
  );
}
