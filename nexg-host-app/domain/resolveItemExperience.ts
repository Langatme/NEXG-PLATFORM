// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Page A (resolver phase): the experience resolver. Pure data layer — no
// React, no backend calls.
//
// Locked-architecture contract: the UI never branches on category. It walks
// ResolvedItemExperience.sections and renders each through the section
// registry. This resolver is the only place that maps item + merchant data
// onto that contract.
//
// Honesty rules (backend-authoritative boundary):
// - Sections are emitted ONLY with data behind them (filtered below).
// - times/pickup/dropoff/delivery/included stay empty until the backend slot
//   feed exists — the sheet hides those sections rather than guessing.
// - categoryId/subcategoryId stay undefined: the 21-category taxonomy does
//   not exist in the app domain yet (open backend contract).
import { CAPABILITY_VARIANTS, capabilityVariantForMerchant } from './capability';
import type {
  DayOption,
  ExperienceConfiguration,
  ExperienceSectionId,
  ItemAttribute,
  ItemSessionHint,
  ResolvedItemExperience,
} from './itemExperience';
import { EXPERIENCE_RECIPES, KIND_ABOUT } from './recipes';
import type { CatalogItem, Merchant, Session } from './types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Next `count` days as sheet day options (local calendar). */
export function nextDayOptions(count = 14): DayOption[] {
  const out: DayOption[] = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    out.push({
      iso: `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`,
      label: day.getDate().toString(),
      weekday: WEEKDAYS[day.getDay()] ?? '',
    });
  }
  return out;
}

function formatDuration(min: number): string {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m} min` : `${h}h`;
  }
  return `${min} min`;
}

function formatKes(n: number): string {
  return `KSh ${Math.round(n).toLocaleString('en-KE')}`;
}

function formatSessionTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${WEEKDAYS[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Primary-context facts: the small number of facts that define the item. */
function resolveAttributes(item: CatalogItem, merchant?: Merchant): ItemAttribute[] {
  const attrs: ItemAttribute[] = [];
  if (item.durationMin && item.durationMin > 0) {
    attrs.push({ icon: '⏱', label: 'Duration', value: formatDuration(item.durationMin) });
  }
  if (item.tags && item.tags.length > 0) {
    attrs.push({ icon: '✦', label: 'Highlights', value: item.tags.slice(0, 3).join(' · ') });
  }
  if (
    merchant &&
    (merchant.kind === 'restaurant' || merchant.kind === 'store') &&
    merchant.minOrderKes != null &&
    merchant.minOrderKes > 0
  ) {
    attrs.push({ icon: '🛒', label: 'Minimum order', value: formatKes(merchant.minOrderKes) });
  }
  if (merchant && Number.isFinite(merchant.distanceKm) && merchant.distanceKm >= 0) {
    attrs.push({ icon: '📍', label: 'Distance', value: `${merchant.distanceKm.toFixed(1)} km` });
  }
  return attrs;
}

function resolveAvailability(sessions?: Session[]): ItemSessionHint[] | undefined {
  if (!sessions || sessions.length === 0) return undefined;
  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    timeLabel: formatSessionTime(s.startsAt),
    seatsLeft: s.capacityLeft,
    priceFromKes: s.priceFromKes,
  }));
}

function filterSections(
  sections: ExperienceSectionId[],
  config: ExperienceConfiguration
): ExperienceSectionId[] {
  return sections.filter((s) => {
    switch (s) {
      case 'variants':
        return (config.variants?.length ?? 0) > 0;
      case 'quantity':
        return config.quantity !== undefined;
      case 'participants':
        return config.participants !== undefined;
      case 'rental':
        return config.rentalDays !== undefined;
      case 'date':
        return config.dates !== null;
      case 'time':
        return config.times !== null;
      case 'pickup':
        return (config.pickup?.length ?? 0) > 0;
      case 'dropoff':
        return (config.dropoff?.length ?? 0) > 0;
      case 'delivery':
        return config.delivery != null;
      case 'duration':
        return config.duration !== null;
      case 'availability':
        return (config.availability?.length ?? 0) > 0;
      case 'instructions':
        return config.instructions !== undefined;
      case 'add_ons':
        return (config.addons?.length ?? 0) > 0;
      case 'included':
        return (config.included?.length ?? 0) > 0;
      case 'policies':
        return (config.policies?.length ?? 0) > 0;
      default:
        return true;
    }
  });
}

/**
 * Resolve an item (+ merchant + live sessions) into the universal experience
 * contract. Deterministic and total: unknown kinds fall back to the store
 * recipe (orderable), missing optionals hide their sections.
 */
export function resolveItemExperience(
  item: CatalogItem,
  merchant?: Merchant,
  sessions?: Session[]
): ResolvedItemExperience {
  const kind = merchant?.kind ?? 'store';
  const recipe = EXPERIENCE_RECIPES[kind];
  const variant = capabilityVariantForMerchant(kind);
  const cta = CAPABILITY_VARIANTS[variant].cta;
  const about = KIND_ABOUT[kind];

  const variants = (item.options?.variants ?? []).map((v) => ({
    id: v.id,
    label: v.label,
    priceDeltaKes: v.priceDeltaKes,
  }));
  const addons = (item.options?.addons ?? []).map((a) => ({
    id: a.id,
    label: a.label,
    priceKes: a.priceKes,
    priceDeltaKes: a.priceDeltaKes,
  }));
  const availability = resolveAvailability(sessions);
  const dates = recipe.requiresScheduling ? nextDayOptions(14) : null;

  const configuration: ExperienceConfiguration = {
    variants: variants.length > 0 ? variants : undefined,
    addons: addons.length > 0 ? addons : undefined,
    addonUnit: recipe.addonUnit,
    instructions: recipe.showInstructions
      ? {
          placeholder:
            kind === 'restaurant'
              ? 'Special instructions (e.g. no onions)'
              : 'Notes for the provider',
        }
      : undefined,
    quantity: recipe.quantityRule ? { ...recipe.quantityRule } : undefined,
    participants: recipe.participantsRule ? { ...recipe.participantsRule } : undefined,
    rentalDays: recipe.rentalDaysRule ? { ...recipe.rentalDaysRule } : undefined,
    dates,
    times: null,
    pickup: undefined,
    dropoff: undefined,
    delivery: null,
    duration:
      item.durationMin && item.durationMin > 0
        ? { label: formatDuration(item.durationMin), value: `${item.durationMin}` }
        : null,
    availability,
    included: undefined,
    policies: merchant?.policies && merchant.policies.length > 0 ? [...merchant.policies] : undefined,
  };

  const sections = filterSections(recipe.sections, configuration);

  return {
    item,
    merchant,
    categoryId: undefined,
    subcategoryId: undefined,
    action: { kind: recipe.action, label: cta },
    multiplier: recipe.multiplier,
    unit: recipe.unit,
    price: { baseKes: item.priceKes, perLabel: recipe.pricePerLabel },
    identity: {
      title: item.name,
      categoryLabel: merchant?.categoryLabel ?? 'Item',
      emoji: merchant?.accentEmoji ?? '✨',
      badges: item.isPopular ? ['Popular'] : [],
    },
    reputation: {
      rating: merchant?.rating ?? 0,
      reviewCount: merchant?.reviewCount ?? 0,
    },
    description: item.description,
    about: { ...about },
    attributes: resolveAttributes(item, merchant),
    configuration,
    sections,
    requiresScheduling: recipe.requiresScheduling && (dates !== null || (availability?.length ?? 0) > 0),
  };
}
