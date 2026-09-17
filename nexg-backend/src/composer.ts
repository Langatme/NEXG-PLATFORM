// HOME COMPOSER — lightweight adaptive engine (docs: NEXG HOME ENGINE).
// Feels smart, is just weights. <50ms, cached 60s server-side, mirrored on client for offline.
// Priority: active 100, upcoming 95, urgent 90, relevant search 85, nearby-open 70,
// personal rec 65, popular 50, promotion 40, general 30.

export interface ComposerInput {
  activeOrders?: Array<{ id: string; eta_min?: number }>;
  upcomingBookings?: Array<{ id: string; at?: string }>;
  urgentRequests?: Array<{ id: string }>;
  lastSearch?: string | null;
  nearbyOpen?: Array<{ id: string; name: string; distance_km?: number }>;
  personal?: Array<{ id: string; name: string; reason?: string }>;
  popular?: Array<{ id: string; name: string }>;
  promotions?: Array<{ id: string; title: string; code?: string }>;
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
}

export interface ComposedSection {
  key: string;
  title: string;
  priority: number;
  items: unknown[];
}

export function composeHome(input: ComposerInput): ComposedSection[] {
  const sections: ComposedSection[] = [];
  if (input.activeOrders?.length)
    sections.push({ key: "active", title: "Active now", priority: 100, items: input.activeOrders });
  if (input.upcomingBookings?.length)
    sections.push({ key: "upcoming", title: "Up next", priority: 95, items: input.upcomingBookings });
  if (input.urgentRequests?.length)
    sections.push({ key: "urgent", title: "Needs attention", priority: 90, items: input.urgentRequests });
  if (input.lastSearch)
    sections.push({ key: "relevant", title: `For "${input.lastSearch}"`, priority: 85, items: [] });
  if (input.nearbyOpen?.length)
    sections.push({ key: "nearby", title: "Around you", priority: 70, items: input.nearbyOpen });
  if (input.personal?.length)
    sections.push({ key: "personal", title: "Recommended for you", priority: 65, items: input.personal });
  if (input.popular?.length)
    sections.push({ key: "popular", title: "Popular near you", priority: 50, items: input.popular });
  if (input.promotions?.length)
    sections.push({ key: "promos", title: "Offers", priority: 40, items: input.promotions });
  sections.push({ key: "discover", title: "Explore more", priority: 30, items: [] });
  return sections.sort((a, b) => b.priority - a.priority);
}

// Capability-driven CTA (docs: capabilities not categories). Same renderer, different action.
export function primaryActionFor(capabilities: string[]): string {
  if (capabilities.includes("order")) return "Order now";
  if (capabilities.includes("book")) return "Book now";
  if (capabilities.includes("reserve")) return "Reserve";
  if (capabilities.includes("quote")) return "Get ride";
  if (capabilities.includes("request")) return "Request service";
  return "View";
}
