/**
 * NEXG core domain model.
 *
 * The consumer app is organized around Context, Providers (merchants),
 * Services/Experiences, and Transactions (orders and bookings) rather than
 * around restaurants alone. Every entity is designed to later map 1:1 onto
 * backend DTOs via repository mappers.
 */

export type Vertical =
  | 'food'
  | 'wellness'
  | 'beauty'
  | 'experiences'
  | 'transport'
  | 'shopping'
  | 'events'
  | 'services'
  | 'stay';

/** How a merchant primarily transacts. Drives CTAs and detail layout. */
export type MerchantKind =
  | 'restaurant' // catalog ordering + delivery
  | 'store' // catalog ordering + delivery/pickup
  | 'serviceProvider' // appointment booking with slots
  | 'experience' // scheduled experiences with guests
  | 'venue' // event venue / cinema with sessions
  | 'transport' // transfers & rides with pickup/dropoff scheduling
  | 'utility'; // drop-off services like laundry

export type PrimaryAction = 'order' | 'book' | 'reserve' | 'buy';

export interface GeoLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export type OpeningHours = Record<
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
  string
>;

export interface Merchant {
  id: string;
  name: string;
  kind: MerchantKind;
  verticals: Vertical[];
  categoryLabel: string;
  description: string;
  rating: number;
  reviewCount: number;
  priceLevel: 1 | 2 | 3;
  location: GeoLocation;
  distanceKm: number;
  isOpen: boolean;
  openingHours: OpeningHours;
  tags: string[];
  etaMin?: string;
  minOrderKes?: number;
  heroImageKey?: string;
  accentEmoji: string;
  policies?: string[];
}

export interface ItemOption {
  id: string;
  label: string;
  priceDeltaKes?: number;
  priceKes?: number;
}

export interface ItemOptions {
  /** Single-choice configuration, e.g. doneness, size, egg style. */
  variants?: ItemOption[];
  /** Multi-choice add-ons with absolute prices. */
  addons?: ItemOption[];
}

export interface CatalogItem {
  id: string;
  merchantId: string;
  sectionId: string;
  name: string;
  description: string;
  priceKes: number;
  durationMin?: number;
  isPopular?: boolean;
  tags?: string[];
  options?: ItemOptions;
  /** Contextual media override (backend slot). When absent the resolver
   *  derives category/subcategory-specific media deterministically. */
  imageKey?: string;
}

export interface CatalogSection {
  id: string;
  merchantId: string;
  title: string;
  subtitle?: string;
}

export interface Catalog {
  sections: CatalogSection[];
  items: CatalogItem[];
}

/** Owner contract for free-form media metadata — primitives only. */
export interface MediaAssetMetadata {
  [key: string]: string | number | boolean | null;
}

/** Media asset record — the seam to real object storage. In production these
 *  rows live in the backend's `media_assets` table; `url`/`thumbnailUrl` are
 *  absolute or CDN-base-resolved URLs rendered through expo-image. */
export interface MediaAsset {
  id: string;
  entityType: 'merchant' | 'catalogItem' | 'category' | 'subcategory' | 'experience' | 'collection';
  entityId: string;
  kind: 'hero' | 'thumbnail' | 'gallery' | 'category' | 'logo' | 'banner';
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  altText?: string;
  sortOrder?: number;
  metadata?: MediaAssetMetadata;
}

/** A concrete schedulable occurrence for events/cinema/experiences. */
export interface Session {
  id: string;
  merchantId: string;
  title: string;
  startsAt: string; // ISO
  endsAt?: string; // ISO
  priceFromKes: number;
  capacityLeft?: number;
}

export type TransactionKind = 'order' | 'booking';

export type TimeOfDay = 'earlyMorning' | 'morning' | 'afternoon' | 'evening' | 'night';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type BookingStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'UPCOMING'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface CartLine {
  item: CatalogItem;
  quantity: number;
  /** Human summary of chosen variants/add-ons, e.g. "Medium · Extra shot". */
  configLabel?: string;
  /** Special instructions captured at configuration time (CNS-043). */
  instructions?: string;
}

export interface CartSnapshot {
  lines: CartLine[];
  merchantId: string | null;
  kind: TransactionKind;
  scheduledFor: string | null;
  promoCode: string | null;
}

export interface PaymentMethod {
  id: 'mpesa' | 'card' | 'cash';
  label: string;
  detail: string;
}

export type PaymentMethodId = PaymentMethod['id'];

export interface FeeSummaryKes {
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export interface NexOrder {
  id: string;
  kind: 'order';
  status: OrderStatus;
  createdAt: string;
  scheduledFor: string | null;
  merchant: Pick<Merchant, 'id' | 'name' | 'categoryLabel' | 'heroImageKey' | 'accentEmoji'>;
  lines: CartLine[];
  fees: FeeSummaryKes;
  paymentMethodId: PaymentMethod['id'];
  address: string;
  rider?: { name: string; vehicle: string; phone: string };
}

export interface NexBooking {
  id: string;
  kind: 'booking';
  status: BookingStatus;
  createdAt: string;
  scheduledFor: string;
  merchant: Pick<Merchant, 'id' | 'name' | 'categoryLabel' | 'heroImageKey' | 'accentEmoji'>;
  lines: CartLine[];
  fees: FeeSummaryKes;
  paymentMethodId: PaymentMethod['id'];
  guests: number;
  notes?: string;
}

export type Activity = NexOrder | NexBooking;

export type NotificationCategory =
  | 'orders'
  | 'bookings'
  | 'promotions'
  | 'recommendations'
  | 'payments'
  | 'system';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  deepLink?: string;
}

export interface Promotion {
  id: string;
  code: string;
  headline: string;
  subline: string;
  emoji: string;
  verticals: Vertical[];
}

export interface SavedPlace {
  id: string;
  label: string;
  address: string;
  icon: 'home' | 'work' | 'star';
}

export interface Moment {
  id: string;
  emoji: string;
  title: string;
  context: string;
  deepLink: string;
  tint: keyof PaletteTintMap;
}

export interface PaletteTintMap {
  green: string;
  blue: string;
  amber: string;
  violet: string;
}
