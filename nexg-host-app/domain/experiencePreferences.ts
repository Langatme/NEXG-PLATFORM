// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Slice 3 (login-guest): canonical experience preferences for the 10-chip
// selector. The 9 core Verticals map 1:1 onto domain Vertical; `offers` is a
// cross-vertical meta-chip (no vertical filter — it scopes to promotions).
import type { MerchantKind, Vertical } from './types';

export interface ExperiencePreference {
  id: string;
  label: string;
  emoji: string;
  /** Empty = cross-vertical (matches everything). */
  verticals: Vertical[];
  /** Tag hints for search/filter mapping. */
  tags: string[];
  /** Merchant kinds this preference surfaces first (cap-cards, Slice 4). */
  kinds?: MerchantKind[];
}

export const EXPERIENCE_PREFERENCES: ExperiencePreference[] = [
  { id: 'food', label: 'Food', emoji: '🍔', verticals: ['food'], tags: ['restaurants', 'delivery', 'groceries'], kinds: ['restaurant', 'store'] },
  { id: 'wellness', label: 'Wellness', emoji: '🧘', verticals: ['wellness'], tags: ['spa', 'fitness', 'massage'], kinds: ['serviceProvider'] },
  { id: 'beauty', label: 'Beauty', emoji: '💅', verticals: ['beauty'], tags: ['salon', 'barber', 'nails'], kinds: ['serviceProvider'] },
  { id: 'experiences', label: 'Experiences', emoji: '🎭', verticals: ['experiences'], tags: ['activities', 'tours', 'classes'], kinds: ['experience'] },
  { id: 'transport', label: 'Rides', emoji: '🚕', verticals: ['transport'], tags: ['taxi', 'transfer', 'delivery'], kinds: ['transport'] },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', verticals: ['shopping'], tags: ['retail', 'groceries', 'pharmacy'], kinds: ['store'] },
  { id: 'events', label: 'Events', emoji: '🎟️', verticals: ['events'], tags: ['concerts', 'cinema', 'nightlife'], kinds: ['venue'] },
  { id: 'services', label: 'Services', emoji: '🛠️', verticals: ['services'], tags: ['repairs', 'cleaning', 'laundry'], kinds: ['utility'] },
  { id: 'stay', label: 'Stays', emoji: '🏠', verticals: ['stay'], tags: ['hotels', 'apartments', 'bnb'], kinds: ['venue'] },
  { id: 'offers', label: 'Offers', emoji: '🏷️', verticals: [], tags: ['deals', 'promos', 'discounts'] },
];
