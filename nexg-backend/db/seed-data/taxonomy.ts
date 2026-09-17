// Vendored NEXG merchant taxonomy — single source of truth for seed + API.
// Source: `nexg chatgpt chats/ChatGPT-Merchant Categories & Subcategories` (21 categories, 134 subcategories,
// extracted from merchant-onboarding-updated.html). Previously imported from the deleted external
// wolt-react-native-main tree — that path is dead; this file replaces it.
// Shape matches what seed-consumer-catalog.ts expects: { id, subcategories: [{ id, label }] }.

export interface TaxonomySubcategory {
  id: string;
  label: string;
}

export interface TaxonomyCategory {
  id: string;
  subcategories: TaxonomySubcategory[];
}

const subs = (catId: string, labels: string[]): TaxonomySubcategory[] =>
  labels.map((label) => ({
    id: `${catId}--${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    label,
  }));

export const taxonomy: TaxonomyCategory[] = [
  { id: "adults-only", subcategories: subs("adults-only", ["Adult Products", "Adult Wellness", "Cigarettes", "Cigars", "Vapes", "Adult Accessories"]) },
  { id: "airport-transfers", subcategories: subs("airport-transfers", ["Airport Pickup", "Airport Drop-off", "Meet & Greet", "Executive Transfer"]) },
  { id: "alcohol-beverages", subcategories: subs("alcohol-beverages", ["Wine", "Spirits", "Beer", "Champagne", "Cocktail Mixers", "Liquor Stores"]) },
  { id: "fashion-apparel", subcategories: subs("fashion-apparel", ["Men's Fashion", "Women's Fashion", "Kids Fashion", "Shoes", "Bags", "Watches", "Accessories"]) },
  { id: "beauty", subcategories: subs("beauty", ["Makeup", "Skincare", "Haircare", "Fragrances", "Cosmetics Stores"]) },
  { id: "vehicle-rentals", subcategories: subs("vehicle-rentals", ["Car Rental", "Self Drive", "Corporate Rental", "Long-Term Rental", "Bike Rental"]) },
  { id: "experiences", subcategories: subs("experiences", ["Concerts", "Festivals", "Conferences", "Private Events", "Photography", "Workshops", "Classes", "Sports Activities", "Recreation"]) },
  { id: "financial-services", subcategories: subs("financial-services", ["Banking", "Forex", "Insurance", "Payments", "Remittance", "Sacco Services", "Business Services"]) },
  { id: "flowers-gifts", subcategories: subs("flowers-gifts", ["Flowers", "Gift Hampers", "Cakes", "Chocolates", "Personalized Gifts", "Occasion Gifts"]) },
  { id: "restaurants-food", subcategories: subs("restaurants-food", ["Restaurant", "Fast Food", "Café", "Bakery", "Desserts", "Juice Bar", "Cloud Kitchen", "Catering"]) },
  { id: "groceries-essentials", subcategories: subs("groceries-essentials", ["Supermarket", "Convenience Store", "Fresh Produce", "Butchery", "Seafood", "Organic Store"]) },
  { id: "laundry-cleaning", subcategories: subs("laundry-cleaning", ["Laundry", "Dry Cleaning", "Ironing", "Home Cleaning", "Office Cleaning"]) },
  { id: "marketplace", subcategories: subs("marketplace", ["Home & Living", "Furniture", "Appliances", "Decor", "Kitchenware", "Books", "Stationery", "Office Supplies", "General Retail"]) },
  { id: "pharmacy", subcategories: subs("pharmacy", ["Pharmacy", "Medical Supplies", "Baby Products", "Supplements"]) },
  { id: "health", subcategories: subs("health", ["Clinics", "Telemedicine", "Labs", "Mental Health (Therapy)", "Coaching"]) },
  { id: "tech-electronics", subcategories: subs("tech-electronics", ["Smartphones", "Accessories", "Computers", "Gaming", "Audio", "Telecom Services", "Smart Devices"]) },
  { id: "travel-tours", subcategories: subs("travel-tours", ["Safaris", "Game Drives", "Luxury Safaris", "City Tours", "Cultural Tours", "Adventure Tours", "Travel Packages"]) },
  { id: "vehicle-services", subcategories: subs("vehicle-services", ["Car Wash", "Tire Service", "Battery Service", "Vehicle Assistance", "Vehicle Inspection"]) },
  { id: "wellness", subcategories: subs("wellness", ["Spa", "Massage", "Gym", "Personal Training"]) },
  { id: "concierge-services", subcategories: subs("concierge-services", ["Reservations", "Personal Assistance", "Shopping Assistance", "Gift Sourcing", "Travel Planning", "Property Coordination", "Moving Assistance", "Cleaning Coordination", "VIP Assistance"]) },
  { id: "logistics-shipping", subcategories: subs("logistics-shipping", ["Sea Freight", "Air Freight", "Road Freight & Trucking", "Warehousing & Storage"]) },
];
