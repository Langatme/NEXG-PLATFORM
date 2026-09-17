// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Slice 4 (cap-cards): the 5-variant capability system. These are the only
// commerce verbs a card CTA may express — the same vocabulary as
// primaryActionFor() in composer.ts. Each variant maps onto the universal
// item-experience contract (ItemActionKind) so Slice 5 rails can open the
// correct sheet section directly from a card tap.
//
// quote vs request: both resolve to ItemActionKind 'request'. They differ in
// buyer expectation — quote is price-first ("how much?"), request is
// availability-first ("can you?") — hence different copy, icon, and tone.
import type { ItemActionKind } from './itemExperience';
import type { MerchantKind } from './types';

export type CapabilityVariant = 'order' | 'book' | 'reserve' | 'quote' | 'request';

export interface CapabilityConfig {
  variant: CapabilityVariant;
  /** Eyebrow label on the card (commerce mode). */
  label: string;
  /** Default CTA copy. */
  cta: string;
  /** One-line buyer expectation, used as fallback subtitle. */
  blurb: string;
  /** Universal-sheet action this variant opens. */
  itemAction: ItemActionKind;
}

export const CAPABILITY_VARIANTS = {
  order: {
    variant: 'order',
    label: 'Order',
    cta: 'Order now',
    blurb: 'Delivered or ready for pickup',
    itemAction: 'add',
  },
  book: {
    variant: 'book',
    label: 'Book',
    cta: 'Book now',
    blurb: 'Pick a slot that suits you',
    itemAction: 'book',
  },
  reserve: {
    variant: 'reserve',
    label: 'Reserve',
    cta: 'Reserve',
    blurb: 'Hold your seat or table',
    itemAction: 'reserve',
  },
  quote: {
    variant: 'quote',
    label: 'Quote',
    cta: 'Get quote',
    blurb: 'Upfront price before you commit',
    itemAction: 'request',
  },
  request: {
    variant: 'request',
    label: 'Request',
    cta: 'Request',
    blurb: 'Ask — confirmation follows',
    itemAction: 'request',
  },
} satisfies Record<CapabilityVariant, CapabilityConfig>;

export const CAPABILITY_ORDER: CapabilityVariant[] = ['order', 'book', 'reserve', 'quote', 'request'];

/** Merchant kind → the variant its cards lead with. */
export function capabilityVariantForMerchant(kind: MerchantKind): CapabilityVariant {
  switch (kind) {
    case 'restaurant':
    case 'store':
      return 'order';
    case 'serviceProvider':
    case 'experience':
      return 'book';
    case 'venue':
      return 'reserve';
    case 'transport':
      return 'quote';
    case 'utility':
      return 'request';
  }
}
