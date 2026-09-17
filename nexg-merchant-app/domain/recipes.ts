// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Page A (resolver phase): category-native experience recipes.
//
// Locked-architecture rule: "same grammar, different composition." These
// recipes are the composition layer — ordered sections, commerce verb, unit,
// and data rules per merchant kind. They consume ONLY fields that exist on
// CatalogItem/Merchant/Session today (no 21-category taxonomy lives in the
// app domain; categoryId/subcategoryId stay undefined until the backend
// ships the resolved item contract).
//
// Resolver rule: never emit a section without data behind it. Sections listed
// here are candidates — resolveItemExperience filters them against the
// resolved configuration (dates/times/availability/sessions present?).
import type {
  ExperienceSectionId,
  ItemExperienceRecipe,
  ItemMultiplyBy,
} from './itemExperience';
import type { MerchantKind } from './types';

function baseSections(...ids: ExperienceSectionId[]): ExperienceSectionId[] {
  return ['identity', 'reputation', 'attributes', 'description', ...ids];
}

const tail: ExperienceSectionId[] = ['merchant', 'related'];

/** Commerce-unit caption for the locked bottom bar. */
export function unitFor(multiplier: ItemMultiplyBy): string {
  switch (multiplier) {
    case 'quantity':
      return 'Qty';
    case 'participants':
      return 'Guests';
    case 'per_day':
      return 'Days';
    case 'fixed':
      return '';
  }
}

/** Kind-aware one-liner shown under the identity block. */
export const KIND_ABOUT = {
  restaurant: {
    title: 'Made to order',
    body: 'Prepared fresh by the kitchen after you order.',
  },
  store: {
    title: 'From the shelves',
    body: 'Picked, packed, and delivered or ready for pickup.',
  },
  serviceProvider: {
    title: 'By a professional',
    body: 'Delivered by a vetted provider at your chosen time.',
  },
  experience: {
    title: 'Hosted experience',
    body: 'Run by the host with everything arranged for you.',
  },
  venue: {
    title: 'Your seat, held',
    body: 'Reservation confirmed with the venue instantly.',
  },
  transport: {
    title: 'Door to door',
    body: 'Upfront price before you commit — no surprises.',
  },
  utility: {
    title: 'We handle it',
    body: 'Request once — confirmation follows from the provider.',
  },
} satisfies Record<MerchantKind, { title: string; body: string }>;

/** Owner contract: one composed recipe per merchant kind. A named interface (not a
 *  Record) keeps `EXPERIENCE_RECIPES[kind]` typed as ItemExperienceRecipe, so the
 *  resolver can read optional rules (quantity/participants/rental/pricePerLabel)
 *  without narrowing a seven-member literal union at every site. */
export interface ExperienceRecipes {
  restaurant: ItemExperienceRecipe;
  store: ItemExperienceRecipe;
  serviceProvider: ItemExperienceRecipe;
  experience: ItemExperienceRecipe;
  venue: ItemExperienceRecipe;
  transport: ItemExperienceRecipe;
  utility: ItemExperienceRecipe;
}

export const EXPERIENCE_RECIPES: ExperienceRecipes = {
  restaurant: {
    categories: ['restaurant'],
    action: 'add',
    unit: 'Qty',
    multiplier: 'quantity',
    sections: [
      ...baseSections('variants', 'quantity', 'add_ons', 'instructions'),
      ...tail,
    ],
    requiresScheduling: false,
    addonUnit: 'per_unit',
    showInstructions: true,
    quantityRule: { min: 1, max: 10 },
  },
  store: {
    categories: ['store'],
    action: 'add',
    unit: 'Qty',
    multiplier: 'quantity',
    sections: [
      ...baseSections('variants', 'quantity', 'add_ons', 'delivery'),
      ...tail,
    ],
    requiresScheduling: false,
    addonUnit: 'per_unit',
    showInstructions: false,
    quantityRule: { min: 1, max: 10 },
  },
  serviceProvider: {
    categories: ['serviceProvider'],
    action: 'book',
    unit: 'Guests',
    multiplier: 'participants',
    sections: [
      ...baseSections(
        'about',
        'date',
        'time',
        'participants',
        'duration',
        'add_ons',
        'availability',
        'policies'
      ),
      ...tail,
    ],
    pricePerLabel: undefined,
    requiresScheduling: true,
    addonUnit: 'per_unit',
    showInstructions: false,
    participantsRule: { min: 1, max: 10 },
  },
  experience: {
    categories: ['experience'],
    action: 'book',
    unit: 'Guests',
    multiplier: 'participants',
    sections: [
      ...baseSections(
        'about',
        'date',
        'time',
        'participants',
        'pickup',
        'availability',
        'included',
        'policies'
      ),
      ...tail,
    ],
    pricePerLabel: 'per person',
    requiresScheduling: true,
    addonUnit: 'per_unit',
    showInstructions: false,
    participantsRule: { min: 1, max: 12 },
  },
  venue: {
    categories: ['venue'],
    action: 'reserve',
    unit: 'Guests',
    multiplier: 'participants',
    sections: [
      ...baseSections('about', 'date', 'time', 'participants', 'availability', 'policies'),
      ...tail,
    ],
    requiresScheduling: true,
    addonUnit: 'per_unit',
    showInstructions: false,
    participantsRule: { min: 1, max: 20 },
  },
  transport: {
    categories: ['transport'],
    action: 'request',
    unit: 'Guests',
    multiplier: 'participants',
    sections: [
      ...baseSections(
        'about',
        'date',
        'time',
        'pickup',
        'dropoff',
        'participants',
        'availability',
        'policies'
      ),
      ...tail,
    ],
    requiresScheduling: true,
    addonUnit: 'per_unit',
    showInstructions: false,
    participantsRule: { min: 1, max: 6 },
  },
  utility: {
    categories: ['utility'],
    action: 'request',
    unit: '',
    multiplier: 'fixed',
    sections: [
      ...baseSections('about', 'date', 'time', 'instructions', 'policies'),
      ...tail,
    ],
    requiresScheduling: false,
    addonUnit: 'per_unit',
    showInstructions: true,
  },
};
