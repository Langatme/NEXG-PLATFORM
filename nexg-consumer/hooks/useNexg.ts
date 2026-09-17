import type { Merchant } from '@/domain/types';
import { bookingLive, catalogService, merchantService, requestService, transactionService } from '@/services/nexg';
import type { CreateTransactionInput } from '@/services/nexg/nexgService';
import { apiCategories, apiDiscoveryHome, apiModifyBooking, apiOrderEvents, apiSuggestions, isApiEnabled } from '@/services/nexg/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useMerchants = () =>
  useQuery({ queryKey: ['merchants'], queryFn: merchantService.getAll });

export const useMerchant = (id: string) =>
  useQuery({
    queryKey: ['merchant', id],
    queryFn: () => merchantService.getById(id),
    enabled: !!id,
  });

export const useSessions = () =>
  useQuery({ queryKey: ['sessions'], queryFn: merchantService.getSessions });

export const useCatalog = (merchantId: string) =>
  useQuery({
    queryKey: ['catalog', merchantId],
    queryFn: () => catalogService.getForMerchant(merchantId),
    enabled: !!merchantId,
  });

export const useCatalogItem = (itemId: string) =>
  useQuery({
    queryKey: ['catalog-item', itemId],
    queryFn: () => catalogService.getItem(itemId),
    enabled: !!itemId,
  });

export const useSearch = (query: string) =>
  useQuery({
    queryKey: ['search', query],
    queryFn: () => merchantService.search(query),
    enabled: query.trim().length > 1,
  });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: apiCategories, staleTime: 300_000 });

export const useDiscoveryHome = (params?: { category?: string; q?: string }) =>
  useQuery({
    queryKey: ['discovery-home', params?.category ?? '', params?.q ?? ''],
    queryFn: () => apiDiscoveryHome(params),
  });

export const useMerchantSearch = (query: string, _merchant?: Pick<Merchant, 'id'>) => useSearch(query);

/** CNS-022/026 live suggestions (backend ranked). Enabled only for real queries. */
export const useSuggestions = (query: string) =>
  useQuery({
    queryKey: ['suggestions', query.trim()],
    queryFn: () => apiSuggestions(query.trim()),
    enabled: isApiEnabled() && query.trim().length > 1,
    staleTime: 60_000,
  });

const isBackendActivityId = (id: string) =>
  !id.startsWith('ord_seed_') && !id.startsWith('bkg_seed_') && !id.includes('_mock_');

/** CNS-056→058 live order events (15s contract) for backend orders. */
export const useOrderEvents = (orderId: string | undefined, enabled = true) => {
  const live = orderId !== undefined && enabled && isBackendActivityId(orderId) ? orderId : null;
  return useQuery({
    queryKey: ['order-events', live],
    queryFn: () => apiOrderEvents(live ?? ''),
    enabled: live !== null,
    refetchInterval: 15_000,
  });
};

/** CNS-071 live booking status (15s poll of backend detail). */
export const useLiveBooking = (bookingId: string | undefined, enabled = true) => {
  const live = bookingId !== undefined && enabled && isBackendActivityId(bookingId) ? bookingId : null;
  return useQuery({
    queryKey: ['live-booking', live],
    queryFn: () => bookingLive.fetch(live ?? ''),
    enabled: live !== null,
    refetchInterval: 15_000,
  });
};

/** CNS-081/082 service requests on the stay (15s refresh). */
export const useBookingRequests = (bookingId: string | undefined, enabled = true) => {
  const live = bookingId !== undefined && enabled && isBackendActivityId(bookingId) ? bookingId : null;
  return useQuery({
    queryKey: ['booking-requests', live],
    queryFn: () => requestService.forBooking(live ?? ''),
    enabled: live !== null,
    refetchInterval: 15_000,
  });
};

export const useCreateServiceRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { merchant_id: string; booking_id?: string; kind?: string; title: string; detail?: string }) =>
      requestService.create(input),
    onSuccess: (_data, variables) => {
      if (variables.booking_id) queryClient.invalidateQueries({ queryKey: ['booking-requests', variables.booking_id] });
    },
  });
};

/** CNS-072 modify reservation (backend apiModifyBooking live). */
export const useModifyBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { scheduled_for?: string; guests?: number } }) =>
      apiModifyBooking(id, patch),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['live-booking', variables.id] });
    },
  });
};

/** CNS-044→051 checkout create (orders + bookings) behind the service boundary. */
export const useCreateTransaction = () =>
  useMutation({
    mutationFn: (input: CreateTransactionInput) => transactionService.create(input),
  });
