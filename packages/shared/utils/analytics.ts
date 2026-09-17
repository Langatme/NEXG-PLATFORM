import * as Sentry from '@sentry/react-native';

/**
 * Product analytics boundary.
 * Currently logs in development and records Sentry breadcrumbs.
 * Swap the implementation for a real provider (Segment, Amplitude, Firebase)
 * without touching call sites.
 */
export type AnalyticsEvent =
  | 'app_open'
  | 'search_started'
  | 'search_completed'
  | 'merchant_viewed'
  | 'service_viewed'
  | 'map_opened'
  | 'filter_used'
  | 'favorite_added'
  | 'favorite_removed'
  | 'cart_created'
  | 'cart_updated'
  | 'cart_opened'
  | 'category_selected'
  | 'subcategory_selected'
  | 'collection_opened'
  | 'checkout_started'
  | 'payment_started'
  | 'payment_completed'
  | 'booking_started'
  | 'booking_completed'
  | 'order_created'
  | 'order_completed'
  | 'widget_expanded'
  | 'widget_actioned'
  | 'recommendation_browse_all'
  | 'notification_opened';

export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

export const trackEvent = (event: AnalyticsEvent, params?: AnalyticsParams) => {
  if (__DEV__) {
    const formatted = params ? ` ${JSON.stringify(params)}` : '';
    console.info(`[analytics] ${event}${formatted}`);
  }
  Sentry.addBreadcrumb({ category: 'analytics', message: event, data: params, level: 'info' });
};
