import { NexGMedia } from '@/components/ui/NexGMedia';
import type { CatalogItem } from '@/domain/types';
import { resolveItemMedia } from '@/utils/images';

export function ProductMedia({ item, size = 120 }: { item: CatalogItem; size?: number }) {
  return <NexGMedia media={resolveItemMedia(item)} style={{ width: size, height: size, borderRadius: 12, overflow: 'hidden' }} emojiSize={32} />;
}
