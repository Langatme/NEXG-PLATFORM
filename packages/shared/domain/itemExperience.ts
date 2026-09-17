import type { CatalogItem, Merchant, Session } from './types';

/**
 * NEXG Universal Item Experience — the domain contract for Page A.
 *
 * One invariant sheet composes radically different items (a dish, a car,
 * a treatment, a ticket, a transfer…) from a fixed set of capability
 * primitives. The UI never branches on category: it walks an ordered
 * list of section ids and renders each through the section registry.
 * The recipe (data layer) decides what appears and how it is labelled.
 */

/** The fixed set of item capability primitives (docs/CAPABILITY_ARCHITECTURE.md §7). */
export type ItemCapabilityId =
  | 'quantity'
  | 'variant'
  | 'add_ons'
  | 'instructions'
  | 'date'
  | 'time'
  | 'date_range'
  | 'duration'
  | 'availability'
  | 'participants'
  | 'location'
  | 'pickup'
  | 'dropoff'
  | 'delivery'
  | 'purchase'
  | 'booking'
  | 'rental';

/** How the transaction total scales with selections. */
export type ItemMultiplyBy = 'quantity' | 'participants' | 'per_day' | 'fixed';

/** The primary commerce verb — drives the sticky CTA. */
export type ItemActionKind = 'add' | 'book' | 'rent' | 'reserve' | 'request';

/** Ordered section ids the universal sheet can compose. Never render one
 *  without data behind it. */
export type ExperienceSectionId =
  | 'identity'
  | 'reputation'
  | 'attributes'
  | 'description'
  | 'about'
  | 'variants'
  | 'rental'
  | 'date'
  | 'time'
  | 'participants'
  | 'quantity'
  | 'location'
  | 'pickup'
  | 'dropoff'
  | 'add_ons'
  | 'duration'
  | 'delivery'
  | 'availability'
  | 'instructions'
  | 'included'
  | 'policies'
  | 'merchant'
  | 'related';

/** A primary-context fact row (the small number of facts that define an item). */
export interface ItemAttribute {
  icon: string;
  label: string;
  value: string;
}

/** A single selectable configuration choice (variant / add-on). */
export interface ItemSelectOption {
  id: string;
  label: string;
  priceDeltaKes?: number;
  priceKes?: number;
}

/** A quick date day in the sheet's scheduling rail. */
export interface DayOption {
  iso: string;
  label: string;
  weekday: string;
}

/** Live schedulable occurrence (cinema/event/experience). */
export interface ItemSessionHint {
  id: string;
  title: string;
  timeLabel: string;
  seatsLeft?: number;
  priceFromKes: number;
}

/** Everything a user might configure on the item, resolved + labelled. */
export interface ExperienceConfiguration {
  /** Single-choice group (size / colour / vehicle class). */
  variants?: ItemSelectOption[];
  variantsLabel?: string;
  /** Multi-choice group (extras with prices). */
  addons?: ItemSelectOption[];
  addonsLabel?: string;
  addonUnit: 'per_unit' | 'per_day';
  instructions?: { placeholder: string };
  quantity?: { min: number; max: number };
  participants?: { min: number; max: number };
  rentalDays?: { min: number; max: number };
  /** null when the item does not need a date. */
  dates: DayOption[] | null;
  /** null when the item does not need a time. */
  times: string[] | null;
  pickup?: string[];
  dropoff?: string[];
  delivery?: string | null;
  duration?: { label: string; value: string } | null;
  availability?: ItemSessionHint[];
  included?: string[];
  policies?: string[];
}

/** The resolved experience contract consumed by the universal sheet. */
export interface ResolvedItemExperience {
  item: CatalogItem;
  merchant?: Merchant;
  categoryId?: string;
  subcategoryId?: string;
  action: { kind: ItemActionKind; label: string };
  multiplier: ItemMultiplyBy;
  /** Commerce-unit caption — Qty · Guests · Units · Days. */
  unit: string;
  price: { baseKes: number; perLabel?: string };
  identity: { title: string; categoryLabel: string; emoji: string; badges: string[] };
  reputation: { rating: number; reviewCount: number };
  description: string;
  /** Contextual one-liner about the kind of item (kind-aware). */
  about?: { title: string; body: string };
  attributes: ItemAttribute[];
  configuration: ExperienceConfiguration;
  /** Ordered, data-filtered composition. */
  sections: ExperienceSectionId[];
  requiresScheduling: boolean;
}

/** Internal recipe shape produced per category-group in the data layer. */
export interface ItemExperienceRecipe {
  categories: string[];
  action: ItemActionKind;
  unit: string;
  multiplier: ItemMultiplyBy;
  sections: ExperienceSectionId[];
  pricePerLabel?: string;
  requiresScheduling: boolean;
  addonUnit: 'per_unit' | 'per_day';
  showInstructions: boolean;
  quantityRule?: { min: number; max: number };
  participantsRule?: { min: number; max: number };
  rentalDaysRule?: { min: number; max: number };
  defaultAddons?: ItemSelectOption[];
  includedDefault?: string[];
  policiesDefault?: string[];
  pickupDefault?: string[];
  dropoffDefault?: string[];
  /** Data-layer demo spec: category-native primary-context rows. */
  attributeSpec?: (item: CatalogItem, merchant?: Merchant, sessions?: Session[]) => ItemAttribute[];
}