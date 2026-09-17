// Vendored NEXG category display records — matches the `categories` table columns
// written by seed-consumer-catalog.ts (id, name, fulfillment, emoji, shortLabel, verticals).
// fulfillment drives experience_type via expType(): 'booking' -> book, 'service' -> request, else order.

export interface SeedCategory {
  id: string;
  name: string;
  fulfillment: "delivery" | "booking" | "service";
  emoji: string;
  shortLabel: string;
  verticals: string[];
}

export const nexgCategories: SeedCategory[] = [
  { id: "adults-only", name: "Adults Only", fulfillment: "delivery", emoji: "🔞", shortLabel: "Adults", verticals: ["retail"] },
  { id: "airport-transfers", name: "Airport Transfers", fulfillment: "service", emoji: "🛫", shortLabel: "Airport", verticals: ["transport"] },
  { id: "alcohol-beverages", name: "Alcohol & Beverages", fulfillment: "delivery", emoji: "🍷", shortLabel: "Drinks", verticals: ["food"] },
  { id: "fashion-apparel", name: "Fashion & Apparel", fulfillment: "delivery", emoji: "👗", shortLabel: "Fashion", verticals: ["retail"] },
  { id: "beauty", name: "Beauty", fulfillment: "delivery", emoji: "💄", shortLabel: "Beauty", verticals: ["beauty"] },
  { id: "vehicle-rentals", name: "Vehicle Rentals", fulfillment: "booking", emoji: "🚗", shortLabel: "Rentals", verticals: ["transport"] },
  { id: "experiences", name: "Experiences", fulfillment: "booking", emoji: "🎭", shortLabel: "Live", verticals: ["experiences"] },
  { id: "financial-services", name: "Financial Services", fulfillment: "service", emoji: "🏦", shortLabel: "Finance", verticals: ["services"] },
  { id: "flowers-gifts", name: "Flowers & Gifts", fulfillment: "delivery", emoji: "💐", shortLabel: "Gifts", verticals: ["retail"] },
  { id: "restaurants-food", name: "Restaurants & Food", fulfillment: "delivery", emoji: "🍔", shortLabel: "Food", verticals: ["food"] },
  { id: "groceries-essentials", name: "Groceries & Essentials", fulfillment: "delivery", emoji: "🛒", shortLabel: "Grocery", verticals: ["grocery"] },
  { id: "laundry-cleaning", name: "Laundry & Cleaning", fulfillment: "service", emoji: "🧺", shortLabel: "Laundry", verticals: ["services"] },
  { id: "marketplace", name: "Marketplace", fulfillment: "delivery", emoji: "🏬", shortLabel: "Market", verticals: ["retail"] },
  { id: "pharmacy", name: "Pharmacy", fulfillment: "delivery", emoji: "💊", shortLabel: "Pharma", verticals: ["pharmacy"] },
  { id: "health", name: "Health", fulfillment: "booking", emoji: "🏥", shortLabel: "Health", verticals: ["wellness"] },
  { id: "tech-electronics", name: "Tech & Electronics", fulfillment: "delivery", emoji: "📱", shortLabel: "Tech", verticals: ["retail"] },
  { id: "travel-tours", name: "Travel & Tours", fulfillment: "booking", emoji: "🧳", shortLabel: "Travel", verticals: ["travel"] },
  { id: "vehicle-services", name: "Vehicle Services", fulfillment: "service", emoji: "🔧", shortLabel: "Auto", verticals: ["services"] },
  { id: "wellness", name: "Wellness", fulfillment: "booking", emoji: "🧘", shortLabel: "Spa", verticals: ["wellness"] },
  { id: "concierge-services", name: "Concierge Services", fulfillment: "service", emoji: "🛎️", shortLabel: "Concierge", verticals: ["services"] },
  { id: "logistics-shipping", name: "Logistics & Shipping", fulfillment: "service", emoji: "📦", shortLabel: "Ship", verticals: ["services"] },
];
