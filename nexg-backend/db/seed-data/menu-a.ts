// Menu banks A: adults-only, airport-transfers, alcohol-beverages, fashion-apparel,
// beauty, vehicle-rentals, experiences. 6 sections x 10 templates each.
import type { CategoryMenu } from "./items.js";

export const MENU_A: Record<string, CategoryMenu> = {
  "adults-only": {
    capability: "add", laneMul: [1, 1.8], duration: null,
    variants: { labels: ["Standard", "Deluxe", "Premium"], deltas: [0, 800, 2000] },
    addons: [{ label: "Gift wrap", price: 300 }, { label: "Discreet courier", price: 400 }],
    sections: [
      { title: "New Arrivals", subtitle: "This week's drop", items: [["Silk Blindfold", 1500, "P"], ["Satin Restraint Set", 3200], ["Couples Game Night", 2500], ["Massage Candle Trio", 1800, "P"], ["Velvet Storage Pouch", 900], ["Beginner Wellness Kit", 4500], ["Lace Robe", 3800], ["Aromatherapy Duo", 2200], ["Date Night Box", 5500, "P"], ["Aftercare Balm", 1200]] },
      { title: "Wellness & Care", items: [["Warming Massage Oil", 1600, "P"], ["Water-Based Lubricant", 1400], ["Silicone Lubricant", 1800], ["Intimate Wash", 950], ["pH-Balanced Moisturiser", 1300], ["Kegel Trainer", 2800], ["Warming Balm", 1500], ["Cooling Gel", 1500], ["Wellness Supplements", 2400], ["Hygiene Spray", 800]] },
      { title: "Party & Lifestyle", items: [["LED Party Lights", 2200], ["Cocktail Shaker Set", 2600, "P"], ["Card Game: After Dark", 1900], ["Neon Bar Sign", 4500], ["Portable Speaker Mini", 5500], ["Party Cups (50pk)", 850], ["Confetti Cannons (4pk)", 1600], ["Karaoke Mic", 3800], ["Ice Bucket Deluxe", 2900], ["Bar Snacks Platter", 2100]] },
      { title: "Cigarettes & Cigars", subtitle: "18+ only, ID on delivery", items: [["Local Kings (20pk)", 450, "P"], ["Menthol Pack (20pk)", 480], ["Imported Gold (20pk)", 750], ["Slim Lights (20pk)", 650], ["Hand-Rolled Cigars (3pk)", 3200, "P"], ["Premium Cigar Single", 1500], ["Cigar Cutter + Lighter", 1800], ["Rolling Papers (5pk)", 600], ["Tobacco Pouch 50g", 1400], ["Ashtray Stone", 1100]] },
      { title: "Vapes & Alternatives", subtitle: "18+ only", items: [["Disposable Vape 3000puff", 2200, "P"], ["Disposable Vape 6000puff", 3200], ["Pod Device Starter", 4500], ["Replacement Pods (2pk)", 1800], ["Mint E-Liquid 30ml", 1500], ["Mango E-Liquid 30ml", 1500], ["Tobacco E-Liquid 30ml", 1500], ["Coil Pack (5pk)", 1200], ["Charging Cable Fast", 900], ["Carrying Case", 1300]] },
      { title: "Gifts & Accessories", items: [["Scented Candle Large", 1900, "P"], ["Linen Room Spray", 1100], ["Silk Pillowcase Pair", 2600], ["Chocolate Truffles 12pc", 1700], ["Greeting Card + Wrap", 600], ["Bath Salts Jar", 1400], ["Herbal Tea Box", 1200], ["Photo Frame Oak", 1600], ["Wine Glasses (2pk)", 2400], ["Keepsake Box", 2100]] },
    ],
  },
  "airport-transfers": {
    capability: "request", laneMul: [1, 1.6], duration: null,
    variants: { labels: ["Sedan", "SUV", "Van"], deltas: [0, 1200, 2200] },
    addons: [{ label: "Child seat", price: 800 }, { label: "Extra stop", price: 600 }],
    sections: [
      { title: "JKIA Pickup", subtitle: "Flight-tracked", items: [["T1A Pickup – Kilimani", 2500, "P"], ["T1A Pickup – Westlands", 2800], ["T1A Pickup – Karen", 3800], ["T1B Pickup – CBD", 2200], ["T1C Pickup – Eastleigh", 2600], ["T1D Pickup – Lavington", 2700], ["Night Pickup Surcharge", 800], ["Extra Waiting 30min", 700], ["Pickup – Syokimau", 1500], ["Pickup – Athi River", 2200]] },
      { title: "JKIA Drop-off", items: [["Kilimani Drop-off", 2400, "P"], ["Westlands Drop-off", 2700], ["Karen Drop-off", 3700], ["CBD Drop-off", 2100], ["Eastleigh Drop-off", 2500], ["Lavington Drop-off", 2600], ["Early-Morning Slot", 500], ["Luggage Trailer", 1500], ["Syokimau Drop-off", 1400], ["Kikuyu Drop-off", 3200]] },
      { title: "Meet & Greet", items: [["Name Board + Assist", 1200, "P"], ["Fast-Track Assist", 3500], ["Porter + Trolley", 900], ["Lounge Pass 3hr", 4500], ["SIM + Forex Stop", 800], ["Family Greet (5pax)", 2500], ["VIP Lane Assist", 5000, "P"], ["Wheelchair Assist", 1000], ["Pet Handover Assist", 2000], ["Flower Bouquet Handover", 1800]] },
      { title: "Executive & Corporate", items: [["Business Sedan 1hr", 4500, "P"], ["Executive SUV 1hr", 6500], ["Airport–Gigiri Shuttle", 3800], ["Airport–Upperhill Shuttle", 3000], ["Monthly Billing Account", 0], ["Receipted Corporate Ride", 3200], ["Chauffeur Half-Day", 12000], ["Chauffeur Full-Day", 20000, "P"], ["Boardroom Pickup", 5000], ["Hotel Handover SGR", 2800]] },
      { title: "Hourly Charter", items: [["City Charter 2hr", 6000], ["City Charter 4hr", 11000, "P"], ["Nairobi–Naivasha Charter", 15000], ["Nairobi–Nakuru Charter", 22000], ["Shopping Run 3hr", 7500], ["Hospital Shuttle Return", 4000], ["School Run Weekly", 9000], ["Wedding Car 6hr", 25000], ["Funeral Convoy Lead", 8000], ["Night Charter 10pm–4am", 14000]] },
      { title: "Upcountry Connect", items: [["SGR Terminus Link", 1800, "P"], ["Nairobi–Machakos Seat", 900], ["Nairobi–Narok Seat", 1500], ["Private Hire–Kajiado", 9000], ["Private Hire–Thika", 6500], ["Private Hire–Kiambu", 4500], ["Luggage Van Add-on", 2500], ["Group Shuttle 7pax", 12000], ["Group Shuttle 14pax", 20000], ["Cross-Border Enquiry", 0]] },
    ],
  },
  "alcohol-beverages": {
    capability: "add", laneMul: [1, 1.9], duration: null,
    variants: { labels: ["Single", "6-pack", "Case"], deltas: [0, 800, 2500] },
    addons: [{ label: "Ice bag 2kg", price: 300 }, { label: "Chilled delivery", price: 250 }],
    sections: [
      { title: "Wine", items: [["House Red 750ml", 1400, "P"], ["House White 750ml", 1400], ["Rosé 750ml", 1600], ["Sparkling Red 750ml", 1800], ["Box Wine 3L", 3200], ["Premium Red Reserve", 4200, "P"], ["Sangria Mix 1L", 1100], ["Non-Alcoholic Red", 1300], ["Wine Glasses Hire (6)", 1500], ["Corkscrew Pro", 900]] },
      { title: "Spirits", items: [["Vodka 750ml", 2200, "P"], ["Whisky Blend 750ml", 2800], ["Single Malt 750ml", 7500, "P"], ["Gin 750ml", 2600], ["Rum Gold 750ml", 2300], ["Brandy 750ml", 2400], ["Tequila Blanco 750ml", 3800], ["Liqueur Coffee 750ml", 2500], ["Miniatures Set (5x50ml)", 1900], ["Decanter Glass", 2900]] },
      { title: "Beer & Cider", items: [["Lager 500ml x6", 1500, "P"], ["Light Lager 330ml x6", 1400], ["Stout 500ml x6", 1700], ["Craft IPA 330ml x4", 2200], ["Cider Apple 500ml x4", 1600], ["Cider Mixed 330ml x6", 1900], ["Non-Alcoholic Lager x6", 1300], ["Beer Bucket + Ice", 2500, "P"], ["Keg 5L Party", 6500], ["Bottle Opener Steel", 600]] },
      { title: "Champagne & Sparkling", items: [["Prosecco 750ml", 3200, "P"], ["Cava Brut 750ml", 2900], ["Champagne NV 750ml", 9500, "P"], ["Sparkling Wine Rosé", 2800], ["Champagne Mini 200ml", 2800], ["Celebration Pack (2btl)", 6800], ["Champagne Flutes (2)", 2100], ["Ice Sleeve", 1200], ["Sparkler Candles (4)", 700], ["Gift Box Deluxe", 1500]] },
      { title: "Mixers & Extras", items: [["Tonic 1L x4", 1100], ["Soda Water 1L x4", 800], ["Ginger Ale 500ml x4", 1000, "P"], ["Cola 2L", 450], ["Orange Juice 1L", 550], ["Lime Cordial 750ml", 750], ["Cocktail Cherries", 950], ["Bar Nuts 500g", 800], ["Lime + Lemon Bag", 500], ["Ice 5kg", 650]] },
      { title: "Party Packs", items: [["Weekend Duo (2btl)", 3600, "P"], ["Braai Pack (12 beers)", 2900], ["Girls Night (wine x3)", 4400], ["Whisky Night (1L + mixers)", 5200], ["Chama Party (case beer)", 8500], ["Wedding Table (wine x6)", 8400, "P"], ["Office Party (mixed x24)", 12000], ["Dry January (0% x12)", 3600], ["Mocktail Kit", 2400], ["Hangover Kit", 1800]] },
    ],
  },
  "fashion-apparel": {
    capability: "add", laneMul: [1, 2.1], duration: null,
    variants: { labels: ["S", "M", "L", "XL"], deltas: [0, 0, 200, 400] },
    addons: [{ label: "Express tailoring", price: 800 }, { label: "Gift wrap", price: 350 }],
    sections: [
      { title: "Men", items: [["Oxford Shirt", 2500, "P"], ["Chino Trousers", 2800], ["Graphic Tee 254", 1500], ["Denim Jacket", 4500], ["Maasai Shuka Blanket Shirt", 2200], ["Suit (2pc, tailored)", 15000, "P"], ["Shorts Linen", 1900], ["Polo Pique", 2100], ["Ankara Shirt", 2700], ["Sweatshirt Fleece", 2300]] },
      { title: "Women", items: [["Wrap Dress", 3200, "P"], ["Kitenge Skirt", 2400], ["High-Waist Jeans", 3000], ["Silk Blouse", 3400], ["Maxi Dress", 3800], ["Blazer Tailored", 6500, "P"], ["Crop Top Ribbed", 1300], ["Palazzo Pants", 2600], ["Ankara Gown", 7500], ["Cardigan Knit", 2700]] },
      { title: "Kids", items: [["Kids Tee 2pk", 1400, "P"], ["School Shorts", 1100], ["Girl Dress Floral", 1800], ["Denim Dungaree", 2200], ["Sneakers Velcro", 2600], ["Sweater School", 1500], ["Ankara Kids Set", 2400], ["Pyjamas Cotton", 1600], ["Rain Jacket Kids", 2100], ["Socks 5pk", 700]] },
      { title: "Shoes", items: [["White Sneakers", 3500, "P"], ["Leather Loafers", 5500], ["Running Shoes", 6500], ["Sandals Leather", 2200], ["Heels Block", 3800], ["Boots Chelsea", 7200, "P"], ["Slides Comfort", 1400], ["Canvas Slip-ons", 1900], ["School Shoes", 2400], ["Shoe Care Kit", 1200]] },
      { title: "Bags & Accessories", items: [["Canvas Tote", 1300, "P"], ["Leather Handbag", 5800], ["Backpack 20L", 3200], ["Duffle Weekender", 4500], ["Beaded Bracelets (3)", 900], ["Maasai Belt", 1500], ["Sunglasses UV", 2100], ["Silk Scarf", 1800], ["Cap Embroidered", 1200], ["Wallet Leather", 2400]] },
      { title: "Tailoring & Styling", items: [["Hem + Adjust", 800], ["Zip Replacement", 1000, "P"], ["Suit Alteration Full", 3500], ["Dress Fitting Session", 2000], ["Style Consult 1hr", 3000], ["Bridal Fitting", 5000, "P"], ["Ankara Custom Dress", 8500], ["Shirt Custom", 4000], ["Emergency Repair", 1200], [" wardrobe Audit", 4500]] },
    ],
  },
  "beauty": {
    capability: "add", laneMul: [1, 2], duration: null,
    variants: { labels: ["50ml", "100ml", "200ml"], deltas: [0, 600, 1400] },
    addons: [{ label: "Shade-match chat", price: 0 }, { label: "Gift set box", price: 500 }],
    sections: [
      { title: "Skincare", items: [["Gentle Cleanser", 1600, "P"], ["Vitamin C Serum", 2800], ["Niacinamide Serum", 2400], ["Moisturiser SPF30", 2200], ["Shea Body Butter", 1400], ["Exfoliating Toner", 2100], ["Sheet Masks (5pk)", 1500, "P"], ["Lip Balm Trio", 900], ["Sunscreen Invisible", 2300], ["Night Repair Oil", 2900]] },
      { title: "Makeup", items: [["Matte Foundation", 2600, "P"], ["Concealer Stick", 1500], ["Setting Powder", 1900], ["Eyeshadow Palette Nude", 3200], ["Mascara Volume", 1700], ["Liquid Lipstick", 1400], ["Blush Compact", 1600], ["Brow Pencil Duo", 1100], ["Makeup Remover 200ml", 1300], ["Brush Set 8pc", 2800]] },
      { title: "Hair", items: [["Shea Shampoo 400ml", 1300, "P"], ["Deep Conditioner", 1500], ["Leave-in Curl Cream", 1700], ["Hair Oil Rosemary", 1400], ["Braiding Hair 3pk", 1800], ["Wig Cap + Glue Kit", 2100], ["Edge Control", 950], ["Wide-Tooth Comb", 600], ["Satin Bonnet", 800], ["Hot Oil Treatment", 2500, "P"]] },
      { title: "Fragrance", items: [["Citrus EDT 50ml", 3400, "P"], ["Floral EDP 50ml", 4800], ["Oud Oil Roll-on", 2600], ["Body Mist 200ml", 1500], ["Scented Lotion", 1300], ["Discovery Set (5x10ml)", 3200], ["Car Diffuser", 1100], ["Home Reed Diffuser", 1900], ["Perfume Atomiser", 900], ["Gift Duo Mini", 2700]] },
      { title: "Bath & Body", items: [["Shower Gel 500ml", 1100], ["Bath Salts 400g", 1400, "P"], ["Loofah + Soap Set", 900], ["Body Scrub Coffee", 1600], ["Hand Cream Trio", 1300], ["Foot Care Kit", 1500], ["Deodorant Roll 2pk", 1000], ["Towel Wrap Microfibre", 1700], ["Bathrobe Plush", 3800], ["Self-Care Box", 3400]] },
      { title: "Bridal & Salon Booking", subtitle: "Products + bookable add-on", items: [["Bridal Trial Kit", 4500, "P"], ["Party Lashes + Glue", 1200], ["Nails Press-on Set", 1400], ["Hair Appointment Credit", 2500], ["Makeup Appointment Credit", 3500], ["Braids Voucher 6hr", 6000, "P"], ["Pedicure Voucher", 2200], ["Facial Voucher 60min", 3800], ["Group Glam (4pax)", 14000], ["Grooming Consult", 1500]] },
    ],
  },
  "vehicle-rentals": {
    capability: "book", laneMul: [1, 1.9], duration: [480, 4320],
    variants: { labels: ["Self-drive", "With driver"], deltas: [0, 2500] },
    addons: [{ label: "Child seat/day", price: 1000 }, { label: "Extra driver/day", price: 1500 }],
    sections: [
      { title: "Economy Hatch", subtitle: "Per day, full insurance", items: [["Swift Hatch Manual", 4500, "P"], ["Vitz Auto", 5000], ["Note e-Power", 5500], ["Swift + Driver", 7500], ["Weekend Deal 2-day", 8500], ["Weekly Hatch Rate", 28000, "P"], ["One-Way Hatch JKIA", 6000], ["Hatch Monthly", 95000], ["Student Hatch Deal", 4000], ["Hatch + Safari Rack", 6500]] },
      { title: "Sedans", items: [["Corolla Sedan", 6500, "P"], ["Premio Luxury", 8500], ["Camry Executive", 12000], ["Sedan + Driver", 9500], ["Sedan Weekly", 42000], ["Sedan Monthly", 150000], ["Wedding Sedan 6hr", 15000, "P"], ["Corporate Sedan Day", 11000], ["Sedan Airport Return", 9000], ["Long-Term Sedan", 140000]] },
      { title: "SUVs & 4x4", items: [["RAV4 4WD", 9500, "P"], ["Forester AWD", 10000], ["Prado TX-L", 18000, "P"], ["Land Cruiser V8", 28000], ["Ranger Double-Cab", 14000], ["Hilux 4x4", 13500], ["SUV + Rooftop Tent", 16000], ["SUV Weekly", 65000], ["SUV Monthly", 220000], ["SUV + Driver Safari", 22000]] },
      { title: "Vans & Buses", items: [["Noah 7-Seater", 9000, "P"], ["Alphard Executive", 16000], ["Hiace Van 14-Seater", 14000], ["Coaster 29-Seater", 28000], ["Van + Driver Day", 13000], ["Church Group Van", 12000], ["School Trip Bus", 25000], ["Airport Van Return", 11000], ["Van Weekly", 60000], ["Driver + Fuel Included", 17000]] },
      { title: "Luxury & Executive", items: [["Mercedes C-Class", 22000, "P"], ["BMW X5", 28000], ["Range Rover Sport", 35000, "P"], ["Lexus LX", 32000], ["Convertible Weekend", 30000], ["Chauffeur Suit + Car", 25000], ["Red-Carpet Arrival", 20000], ["Proposal Ride 3hr", 18000], ["Photoshoot Car 2hr", 12000], ["VIP Convoy (3 cars)", 75000]] },
      { title: "Safari-Ready Add-ons", subtitle: "Cars + safaris multi-service", items: [["Pop-Top Conversion/day", 4000, "P"], ["Rooftop Tent/day", 3500], ["Cooler Box + Ice", 1200], ["Binoculars Hire/day", 1500], ["Safari Guide/day", 8000], ["Park Fees Handling", 0, "P"], ["Camping Chairs (2)/day", 1000], ["Jerry Can Fuel 20L", 4500], ["Satellite Phone/day", 3000], ["Rescue Cover/day", 2000]] },
    ],
  },
  "experiences": {
    capability: "book", laneMul: [1, 1.7], duration: [60, 300],
    variants: { labels: ["Regular", "VIP", "VVIP"], deltas: [0, 1500, 4000] },
    addons: [{ label: "Photo pass", price: 1000 }, { label: "Merch bundle", price: 2500 }],
    sections: [
      { title: "Concerts & Live", items: [["Blankets & Wine Entry", 1500, "P"], ["Sofar Session Seat", 2500], ["Jazz Night Table", 3500], ["Gospel Live Regular", 1200], ["Ampitheatre Show", 2800], ["Rooftop DJ Night", 2000, "P"], ["Comedy Night Seat", 1800], ["Choir Festival Pass", 2200], ["Album Launch VIP", 5000], ["Backstage Meet", 8500]] },
      { title: "Festivals", items: [["Food Festival Day", 1200, "P"], ["Culture Fest Weekend", 3500], ["Film Fest Pass", 2800], ["Craft Market Entry", 500], ["Beer Fest Session", 2500], ["Book Fair Weekend", 1500], ["Kids Fest Family (4)", 4000, "P"], ["Wellness Fest Day", 2000], ["Moto Show Entry", 1800], ["Season Festival Pass", 9000]] },
      { title: "Workshops & Classes", items: [["Pottery 2hr", 2800, "P"], ["Photography Walk", 2200], ["Sourdough Class", 3200], ["Cocktail Masterclass", 3800], ["Dance Beginner 4wk", 6000], ["Yoga Morning Flow", 1200], ["Swahili Crash Course", 2500], ["DJ Basics 3hr", 4500, "P"], ["Paint & Sip", 3000], ["Candle-Making 2hr", 2900]] },
      { title: "Private Events", items: [["Rooftop Hire 4hr", 25000, "P"], ["Garden Venue Half-Day", 35000], ["Hall + Sound 6hr", 30000], ["Catering per Head", 2200], ["Photographer 3hr", 15000], ["MC + DJ Bundle", 25000], ["Decor Basic Pack", 18000], ["Kids Party Crew", 12000, "P"], ["Livestream Crew 3hr", 20000], ["Security (2) 6hr", 9000]] },
      { title: "Sports & Outdoors", items: [["Karura Ride Half-Day", 1800, "P"], ["Ngong Hike Guided", 2500], ["Padel Court 1hr", 2000], ["5-a-side Pitch 1hr", 3500], ["Swim Session + Towel", 1200], ["Golf Range 50 balls", 1500], ["Go-Kart 15min", 2200], ["Archery 1hr", 2800, "P"], ["Skate Park Day", 800], ["Bootcamp Saturday", 1000]] },
      { title: "Kids & Family", items: [["Indoor Play Day", 1300, "P"], ["Trampoline 1hr", 1500], ["Museum Family (4)", 2400], ["Animal Orphanage Trip", 3200], ["Kids Cinema + Popcorn", 1600], ["Baking Class Kids", 2500], ["STEM Club Saturday", 2800, "P"], ["Face Paint Party Add-on", 4000], ["Balloon World Entry", 1100], ["Family Season Card", 15000]] },
    ],
  },
};