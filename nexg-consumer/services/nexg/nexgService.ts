import type {
  Activity,
  CartLine,
  Catalog,
  CatalogItem,
  FeeSummaryKes,
  Merchant,
  PaymentMethod,
  Session,
  Vertical,
} from '@/domain/types';
import {
  apiBooking,
  apiBookingRequests,
  apiCancelBooking,
  apiCancelOrder,
  apiCatalog,
  apiCreateBooking,
  apiCreateOrder,
  apiCreateRequest,
  apiItem,
  apiMerchant,
  apiMerchants,
  apiSearch,
  apiSessions,
  apiSuggestions,
  isApiEnabled,
} from './api';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface SearchResults {
  merchants: Merchant[];
  items: CatalogItem[];
}

/**
 * Repository boundary for discovery data. UI consumes these through React
 * Query hooks; swapping mock implementations for HTTP clients requires no
 * screen-level changes. API-first with mock fallback (offline-first).
 */
export const merchantService = {
  getAll: async (): Promise<Merchant[]> => {
    if (isApiEnabled()) {
      try {
        return await apiMerchants();
      } catch {
        // offline/degraded → empty (honest empty state, never blank screen shell)
      }
    }
    await delay(250);
    return [];
  },

  getById: async (id: string): Promise<Merchant | undefined> => {
    if (isApiEnabled()) {
      try {
        return (await apiMerchant(id)).merchant;
      } catch {
        // fall through
      }
    }
    await delay(150);
    return undefined;
  },

  getByVertical: async (vertical: Vertical): Promise<Merchant[]> => {
    if (isApiEnabled()) {
      try {
        return await apiMerchants({ vertical });
      } catch {
        // fall through
      }
    }
    await delay(200);
    return [];
  },

  getSessions: async (): Promise<Session[]> => {
    // Backend sessions source wins online (mock sunset when source=backend).
    if (isApiEnabled()) {
      try {
        const items = await apiSessions(20);
        if (items.length) {
          return items.map(
            (it, i): Session => ({
              id: `sess_${it.id}`,
              merchantId: it.merchantId,
              title: it.name,
              startsAt: new Date(Date.now() + (i + 1) * 864e5).toISOString(),
              priceFromKes: it.priceKes,
            })
          );
        }
      } catch {
        // fall through
      }
    }
    await delay(200);
    return [];
  },

  /**
   * Lightweight global search across merchants and catalog items.
   */
  search: async (query: string): Promise<SearchResults> => {
    const q = query.trim();
    if (!q) return { merchants: [], items: [] };
    if (isApiEnabled() && q.length > 1) {
      try {
        return await apiSearch(q);
      } catch {
        // fall through
      }
    }
    await delay(180);
    return { merchants: [], items: [] };
  },

  suggestions: async (query: string): Promise<string[]> => {
    if (!isApiEnabled()) return [];
    try {
      const s = await apiSuggestions(query);
      return s.suggestions;
    } catch {
      return [];
    }
  },
};

export const catalogService = {
  getForMerchant: async (merchantId: string): Promise<Catalog> => {
    if (isApiEnabled()) {
      try {
        return await apiCatalog(merchantId);
      } catch {
        // fall through
      }
    }
    await delay(220);
    return { sections: [], items: [] };
  },

  getItem: async (itemId: string): Promise<CatalogItem | undefined> => {
    if (isApiEnabled()) {
      try {
        return await apiItem(itemId);
      } catch {
        // fall through
      }
    }
    await delay(120);
    return undefined;
  },

  getPopularForMerchant: async (merchantId: string): Promise<CatalogItem[]> => {
    if (isApiEnabled()) {
      try {
        const catalog = await apiCatalog(merchantId);
        return catalog.items.filter((i) => i.isPopular);
      } catch {
        // fall through
      }
    }
    await delay(120);
    return [];
  },
};

export interface CreateTransactionInput {
  kind: 'order' | 'booking';
  merchant: Merchant;
  lines: CartLine[];
  fees: FeeSummaryKes;
  scheduledFor: Date | null;
  paymentMethodId: PaymentMethod['id'];
  address: string;
  guests: number;
  notes?: string;
}

/**
 * Transaction service covering both orders and bookings.
 * Real backend first (server money truth + NCL); honest pending states.
 */
export const transactionService = {
  create: async (input: CreateTransactionInput): Promise<Activity> => {
    if (isApiEnabled()) {
      try {
        const merchantSnapshot = {
          id: input.merchant.id,
          name: input.merchant.name,
          categoryLabel: input.merchant.categoryLabel,
          heroImageKey: input.merchant.heroImageKey,
          accentEmoji: input.merchant.accentEmoji,
        };
        if (input.kind === 'order') {
          const placed = await apiCreateOrder({
            merchant_id: input.merchant.id,
            lines: input.lines.map((l) => ({
              item_id: l.item.id,
              title: l.item.name,
              qty: l.quantity,
              unit_price_kes: l.item.priceKes,
            })),
            payment_method: input.paymentMethodId,
            idempotency_key: `ord_${Date.now()}`,
          });
          return {
            id: placed.id,
            kind: 'order',
            status: 'PLACED',
            createdAt: new Date().toISOString(),
            scheduledFor: input.scheduledFor ? input.scheduledFor.toISOString() : null,
            merchant: merchantSnapshot,
            lines: input.lines,
            fees: { ...input.fees, subtotal: placed.subtotal_kes, total: placed.total_kes },
            paymentMethodId: input.paymentMethodId,
            address: input.address,
            rider: undefined,
          } satisfies Activity;
        }
        const confirmed = await apiCreateBooking({
          merchant_id: input.merchant.id,
          scheduled_for: (input.scheduledFor ?? new Date()).toISOString(),
          guests: input.guests,
          idempotency_key: `bkg_${Date.now()}`,
        });
        return {
          id: confirmed.id,
          kind: 'booking',
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          scheduledFor: (input.scheduledFor ?? new Date()).toISOString(),
          merchant: merchantSnapshot,
          lines: input.lines,
          fees: input.fees,
          paymentMethodId: input.paymentMethodId,
          guests: input.guests,
          notes: input.notes,
        } satisfies Activity;
      } catch {
        // offline with backend configured → honest failure, no fake success
        throw new Error('offline');
      }
    }
    await delay(900);
    const base = {
      id: `${input.kind === 'order' ? 'ord' : 'bkg'}_mock_${Date.now()}`,
      createdAt: new Date().toISOString(),
      merchant: {
        id: input.merchant.id,
        name: input.merchant.name,
        categoryLabel: input.merchant.categoryLabel,
        heroImageKey: input.merchant.heroImageKey,
        accentEmoji: input.merchant.accentEmoji,
      },
      lines: input.lines,
      fees: input.fees,
      paymentMethodId: input.paymentMethodId,
    };
    if (input.kind === 'order') {
      return {
        ...base,
        kind: 'order',
        status: 'PLACED',
        scheduledFor: input.scheduledFor ? input.scheduledFor.toISOString() : null,
        address: input.address,
        rider: undefined,
      } satisfies Activity;
    }
    return {
      ...base,
      kind: 'booking',
      status: 'CONFIRMED',
      scheduledFor: (input.scheduledFor ?? new Date()).toISOString(),
      guests: input.guests,
      notes: input.notes,
    } satisfies Activity;
  },

  cancel: async (id: string, reason?: string): Promise<{ success: boolean }> => {
    // Consumer self-cancel via backend; kind-branch orders vs bookings.
    if (isApiEnabled() && !id.startsWith('ord_seed_') && !id.startsWith('bkg_seed_') && !id.includes('_mock_')) {
      if (id.startsWith('bkg_')) await apiCancelBooking(id, reason);
      else await apiCancelOrder(id);
      return { success: true };
    }
    await delay(500);
    return { success: true };
  },
};

export const requestService = {
  forBooking: async (bookingId: string) => {
    if (isApiEnabled() && !bookingId.startsWith('bkg_seed_')) {
      try {
        return await apiBookingRequests(bookingId);
      } catch {
        // offline → empty, never blank screen
      }
    }
    return [];
  },
  create: async (input: { merchant_id: string; booking_id?: string; kind?: string; title: string; detail?: string }) => {
    if (isApiEnabled()) {
      return apiCreateRequest(input);
    }
    await delay(500);
    return { id: `req_mock_${Date.now()}`, status: 'REQUESTED', created_at: new Date().toISOString(), ...input };
  },
};

export const bookingLive = {
  fetch: async (id: string) => {
    if (isApiEnabled() && !id.startsWith('bkg_seed_')) {
      try {
        return await apiBooking(id);
      } catch {
        return null;
      }
    }
    return null;
  },
};
