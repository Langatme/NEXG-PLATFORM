import type { CartLine } from '@/domain/types';
import { buildFeeBreakdown, type FeeBreakdown } from './money';

/** Line resolver input: cart stores ids + config; catalog resolves the rest. */
export interface ResolvedLineInput {
  itemId: string;
  quantity: number;
  configLabel?: string;
  instructions?: string;
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.item.priceKes * l.quantity, 0);
}

export function cartTotalItems(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.quantity, 0);
}

export function cartFees(lines: CartLine[], opts?: { isDelivery?: boolean; distanceKm?: number; promoCode?: string | null }): FeeBreakdown {
  return buildFeeBreakdown({
    subtotal: cartSubtotal(lines),
    distanceKm: opts?.distanceKm,
    isDelivery: opts?.isDelivery ?? true,
    promoCode: opts?.promoCode ?? null,
  });
}

export function resolveCartLines<T extends { id: string }>(
  pool: T[],
  lineIds: ResolvedLineInput[],
  toLine: (item: T, l: ResolvedLineInput) => CartLine | null
): CartLine[] {
  return lineIds
    .map((l) => {
      const item = pool.find((i) => i.id === l.itemId);
      return item ? toLine(item, l) : null;
    })
    .filter((l): l is CartLine => l !== null);
}
