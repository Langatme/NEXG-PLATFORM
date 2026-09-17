// Menu banks B: financial-services, flowers-gifts, restaurants-food,
// groceries-essentials, laundry-cleaning, marketplace, pharmacy.
import type { CategoryMenu } from "./items.js";

export const MENU_B: Record<string, CategoryMenu> = {
  "financial-services": {
    capability: "request", laneMul: [1, 1.5], duration: null,
    sections: [
      { title: "Forex & Exchange", items: [["USD Buy/Sell consult", 0, "P"], ["GBP Rate Lock 24hr", 0], ["Euro Bulk (10k+)", 0], ["M-Pesa ↔ USD Swap", 350], ["Rate Alert Setup", 0], ["Travel Cash Pack", 500, "P"], ["Business Forex Account", 0], ["Receipted Exchange Slip", 0], ["Airport Rate Match", 200], ["Large-Amount Escort", 2500]] },
      { title: "Transfers & Remittance", items: [["Local Bank Transfer", 250, "P"], ["M-Pesa Bulk (100+)", 1500], ["Diaspora Payout Assist", 800], ["School Fees Run", 500], ["Rent Collection", 800], ["Salary Disbursement", 2000, "P"], ["Till Setup Assist", 1200], ["Paybill Reconciliation", 900], ["Statement Pack", 600], ["Urgent Same-Hour Push", 1000]] },
      { title: "Sacco & Savings", items: [["Joining + Onboarding", 1000, "P"], ["Monthly Savings Plan", 0], ["Emergency Loan Assist", 1500], ["School-Fees Loan Assist", 1500], ["Logbook Loan Advisory", 2000], ["Chama Ledger Setup", 1200, "P"], ["Dividend Statement", 400], ["Guarantor Pack", 800], ["Exit + Refund Assist", 600], ["Youth Savings Club", 500]] },
      { title: "Insurance Desk", items: [["Motor Cover Quote", 0, "P"], ["Health Cover Compare", 0], ["Home Cover Quote", 0], ["Life Cover Advisory 1hr", 2000], ["Claim Filing Assist", 1500], ["Claim Follow-up", 1000], ["Policy Review", 1200, "P"], ["Travel Insurance 7-day", 2800], ["Phone Screen Cover 1yr", 2200], ["Business Cover Bundle", 0]] },
      { title: "Business Services", items: [["KRA PIN + Returns", 1500, "P"], ["Business Name Search", 1200], ["Company Registration Assist", 15000], ["Single Permit Renewal", 3500], ["Invoice + Receipt Books", 1800], ["Payroll Setup (10 staff)", 8000, "P"], ["Bookkeeping Monthly", 12000], ["Tender Document Pack", 5000], ["Rubber Stamp + Seal", 1200], ["Compliance Health-Check", 4000]] },
      { title: "Advisory", items: [["Money Consult 45min", 2500, "P"], ["Debt Plan Session", 2000], ["Investment Basics 1hr", 3000], ["Retirement Plan", 3500], ["School-Fees Planner", 1500], ["Hustle Pricing Review", 1800, "P"], ["Land Purchase Checklist", 2500], ["Car Import Math Session", 3000], ["Side-Hustle Audit", 2200], ["Family Budget Build", 2000]] },
    ],
  },
  "flowers-gifts": {
    capability: "add", laneMul: [1, 1.9], duration: null,
    variants: { labels: ["Standard", "Large", "Grand"], deltas: [0, 1200, 3000] },
    addons: [{ label: "Handwritten card", price: 300 }, { label: "Chocolates add-on", price: 900 }],
    sections: [
      { title: "Bouquets", items: [["Rose Dozen Red", 2800, "P"], ["Mixed Roses 20-stem", 3800], ["White Lilies Bunch", 3200], ["Sunflower Burst", 2400], ["Tropical Mix", 2900], ["Mini Posy", 1500], ["Peony-Style Luxury", 5500, "P"], ["Weekly Subscription x4", 9800], ["Condolence White", 3500], ["Graduation Burst", 2600]] },
      { title: "Gift Hampers", items: [["Tea & Coffee Hamper", 3500, "P"], ["Fruit Hamper Large", 4200], ["Chocolate Lovers Box", 3800], ["Spa Pamper Hamper", 5200], ["Baby Welcome Box", 4800, "P"], ["Corporate Hamper", 7500], ["Dry-Foods Bounty", 3900], ["Wine-Free Celebration", 4100], ["Get-Well Basket", 3600], ["Ramadan Kareem Box", 4400]] },
      { title: "Cakes", items: [["Vanilla 1kg", 2800, "P"], ["Chocolate Fudge 1kg", 3200], ["Red Velvet 1kg", 3400], ["Carrot + Nuts 1kg", 3000], ["Cupcakes Box (6)", 2100], ["Bento Mini Cake", 1800], ["Birthday Topper Set", 800], ["Photo Cake 1.5kg", 4500, "P"], ["Eggless Vanilla 1kg", 3000], ["Two-Tier 3kg", 9500]] },
      { title: "Chocolates", items: [["Truffles 12pc", 1700, "P"], ["Dark Bar Trio", 1400], ["Milk Bar Trio", 1300], ["Nut Clusters 300g", 1600], ["Hot Chocolate Mix", 1100], ["Sugar-Free Box", 1900], ["Kids Treat Bag", 900], ["Cocoa-Dusted Almonds", 1500], ["Gift Sleeve Duo", 1200], ["Tasting Flight (6)", 2200]] },
      { title: "Personalized", items: [["Name Mug + Photo", 1400, "P"], ["Engraved Bracelet", 2200], ["Photo Cushion", 1900], ["Custom T-Shirt", 1700], ["Name Necklace", 2600], ["Pet Portrait Mini", 3200, "P"], ["Star-Map Print", 2400], ["Message Bottle", 1300], ["Puzzle Photo 500pc", 2100], ["Calendar 2026 Custom", 1800]] },
      { title: "Occasion Ready", items: [["Birthday Rush (2hr)", 3500, "P"], ["Anniversary Suite", 6800], ["New-Baby Rush", 4200], ["Thank-You Trio", 2400], ["Apology Deluxe", 3900], ["Graduation Pack", 3100], ["Housewarming Green", 2800], ["Office Milestone", 4500], ["Surprise Car-Boot Setup", 8500, "P"], ["Midnight Delivery", 1200]] },
    ],
  },
  "restaurants-food": {
    capability: "add", laneMul: [1, 1.7], duration: null,
    variants: { labels: ["Regular", "Large", "Family"], deltas: [0, 300, 800] },
    addons: [{ label: "Extra chapati", price: 150 }, { label: "Extra sauce", price: 100 }, { label: "Avocado", price: 200 }],
    sections: [
      { title: "Starters", items: [["Samosa (3pc)", 350, "P"], ["Bhajia Plate", 400], ["Mutura Bites", 450], ["Chicken Wings (6pc)", 750, "P"], ["Smocha", 250], ["Rolex Chapati-Egg", 300], ["Soup of the Day", 450], ["Kachumbari + Guac", 400], ["Fried Cassava", 350], ["Pilipili Prawns (6)", 1200]] },
      { title: "Kenyan Classics", items: [["Beef Pilau", 550, "P"], ["Chicken Biryani", 750], ["Ugali + Sukuma + Beef", 600], ["Ugali + Tilapia", 950, "P"], ["Githeri Special", 450], ["Mokimo + Beef", 650], ["Chapati Madondo", 500], ["Wali wa Nazi + Fish", 850], ["Matumbo + Ugali", 600], ["Omena + Ugali", 500]] },
      { title: "Grill & BBQ", items: [["Nyama Choma 500g", 1100, "P"], ["Pork Choma 500g", 1000], ["Chicken Choma Half", 800], ["Full Chicken Choma", 1500, "P"], ["Mbuzi Platter (1kg)", 2200], ["BBQ Ribs Half-Rack", 1400], ["Grilled Tilapia + Sides", 1200], ["T-Bone + Ugali", 1300], ["Mixed Grill for Two", 2400], ["Choma Sausage (4pc)", 600]] },
      { title: "Fast Food & Snacks", items: [["Smash Burger + Fries", 950, "P"], ["Double Smash Burger", 1250], ["Chicken Burger", 850], ["Loaded Fries", 650], ["Shawarma Chicken", 700], ["Fish & Chips", 800], ["Hot Dog + Fries", 600], ["Chicken Nuggets (9pc)", 650], ["Onion Rings", 450], ["Milkshake 500ml", 550]] },
      { title: "Desserts & Drinks", items: [["Mandazi (4pc)", 200, "P"], ["Mahamri + Mbaazi", 350], ["Rice Pudding", 400], ["Banana Bread Slice", 300], ["Ice Cream Scoop (2)", 450], ["Fresh Mango Juice 500ml", 350], ["Passion Juice 500ml", 350, "P"], ["Dawa (Honey-Ginger)", 400], ["Kenyan Chai", 250], ["Soda 500ml", 200]] },
      { title: "Build Your Own", subtitle: "Configurable — variants + add-ons", items: [["Build Your Own Pizza", 1100, "P"], ["Build Your Own Bowl", 950, "P"], ["Build Your Own Burger", 900], ["Build Your Own Wrap", 750], ["Build Your Own Salad", 700], ["Build Your Own Pasta", 950], ["Build Your Own Breakfast", 800], ["Build Your Own Platter (2)", 1900], ["Build Your Own Kids Meal", 600], ["Build Your Own Dessert Box", 700]] },
    ],
  },
  "groceries-essentials": {
    capability: "add", laneMul: [1, 1.6], duration: null,
    variants: { labels: ["500g", "1kg", "2kg"], deltas: [0, 200, 400] },
    addons: [{ label: "Paper bag", price: 50 }, { label: "Chop + prep", price: 150 }],
    sections: [
      { title: "Fresh Produce", items: [["Sukuma Wiki Bunch", 80, "P"], ["Spinach Bunch", 100], ["Kale + Managu Mix", 150], ["Tomatoes 1kg", 180], ["Onions 1kg", 160], ["Bananas (12pc)", 250, "P"], ["Avocado (3pc)", 300], ["Mangoes (4pc)", 350], ["Carrots 1kg", 170], ["Dhania + Spring Onion", 100]] },
      { title: "Butchery & Seafood", items: [["Beef Mince 500g", 550, "P"], ["Beef Stew 1kg", 850], ["Chicken Whole 1.5kg", 950], ["Chicken Breast 500g", 650], ["Tilapia Whole 800g", 750, "P"], ["Nile Perch Fillet 500g", 800], ["Pork Chops 1kg", 900], ["Goat Meat 1kg", 1100], ["Eggs Tray (30)", 650], ["Sausages 500g", 450]] },
      { title: "Dairy & Eggs", items: [["Milk 500ml", 120, "P"], ["Milk 1L", 220], ["Yoghurt 500ml", 280], ["Cheese Cheddar 250g", 550], ["Butter 250g", 480], ["Eggs (12pc)", 300], ["Cream 250ml", 350], ["Ghee 500ml", 750, "P"], ["Lactose-Free Milk 1L", 380], ["Probiotic Drink (4pk)", 420]] },
      { title: "Pantry Staples", items: [["Maize Flour 2kg", 480, "P"], ["Wheat Flour 2kg", 420], ["Rice 2kg", 550], ["Sugar 1kg", 280], ["Cooking Oil 1L", 450], ["Salt 500g", 120], ["Tea Leaves 250g", 350], ["Coffee Ground 250g", 650, "P"], ["Peanut Butter 500g", 550], ["Honey 500ml", 600]] },
      { title: "Beverages & Snacks", items: [["Soda 2L", 450, "P"], ["Juice 1L", 550], ["Biscuits Family Pack", 380], ["Crisps (6pk)", 600], ["Nuts Mix 500g", 750], ["Dried Fruit 300g", 550], ["Chocolate Bar 100g", 350], ["Popcorn Kernels 500g", 300], ["Energy Drink (4pk)", 800], ["Water 5L", 450]] },
      { title: "Household", items: [["Detergent 1kg", 450, "P"], ["Dish Soap 750ml", 350], ["Tissue 10pk", 650], ["Trash Bags (30pk)", 400], ["Broom + Dustpan", 850], ["Mop + Bucket", 1500], ["Air Freshener", 550], ["Candles (6pk)", 500], ["Matches Box", 150], ["Charcoal 4kg", 600]] },
    ],
  },
  "laundry-cleaning": {
    capability: "request", laneMul: [1, 1.6], duration: [60, 480],
    variants: { labels: ["Standard 48hr", "Express 24hr", "Same-day"], deltas: [0, 500, 1200] },
    addons: [{ label: "Stain treatment", price: 300 }, { label: "Fabric softener", price: 150 }],
    sections: [
      { title: "Wash & Fold", items: [["Shirt Wash + Fold", 250, "P"], ["T-Shirt (3pc)", 500], ["Jeans Wash", 350], ["Dress Wash", 450], ["Kids Bundle (5pc)", 800, "P"], ["Bedsheet Set", 600], ["Duvet Single", 900], ["Duvet Double", 1200], ["Towels (4pc)", 550], ["Curtains Pair", 1100]] },
      { title: "Dry Cleaning", items: [["Suit 2pc Dry-Clean", 1200, "P"], ["Blazer Only", 700], ["Silk Dress", 900], ["Ankara Gown", 1000], ["Coat / Trench", 1100], ["Wedding Gown", 4500, "P"], ["Tie / Scarf", 300], ["Leather Jacket Clean", 1800], ["Carpet 3x4 Wash", 3500], ["Rug Small", 1500]] },
      { title: "Ironing & Press", items: [["Shirt Press", 150, "P"], ["Trouser Press", 180], ["Dress Press", 250], ["Suit Press 2pc", 600], ["Table Linen Press", 400], ["School Uniform Set", 350, "P"], ["Curtain Press Pair", 700], ["Bulk Press (10pc)", 1300], ["Steam Only Delicate", 300], ["Fold + Pack (5pc)", 450]] },
      { title: "Home Cleaning", items: [["Bedsitter Deep-Clean", 3500, "P"], ["1BR Deep-Clean", 5000], ["2BR Deep-Clean", 7000, "P"], ["3BR Deep-Clean", 9000], ["Post-Party Cleanup", 6000], ["Bathroom Detail", 1800], ["Kitchen Degrease", 2200], ["Balcony + Windows", 2000], ["Fridge Deep-Clean", 1500], ["Move-Out Full", 12000]] },
      { title: "Office Cleaning", items: [["Desk Cluster (10)", 4000, "P"], ["Boardroom Detail", 3000], ["Kitchenette Weekly", 5000], ["Washroom Block", 3500], ["Floor Scrub 100sqm", 6000], ["Window Inside (20)", 4500], ["Dust + Vacuum Weekly", 5500, "P"], ["Event Setup + Teardown", 8000], ["Carpet Tiles (50)", 7000], ["After-Hours Crew 4hr", 10000]] },
      { title: "Extras", items: [["Shoe Wash Pair", 600, "P"], ["Bag Wash + Condition", 800], ["Pet Bedding Wash", 900], ["School Bag Wash", 500], ["Sports Kit (5pc)", 750], ["Baby Clothes (10pc)", 900], ["Maid Assist Half-Day", 2500, "P"], ["Ironing at Home 2hr", 1800], ["Pickup + Return", 400], ["Folding Service/hr", 1200]] },
    ],
  },
  "marketplace": {
    capability: "add", laneMul: [1, 1.8], duration: null,
    variants: { labels: ["Standard", "Large", "Deluxe"], deltas: [0, 1500, 4000] },
    addons: [{ label: "Assembly", price: 1200 }, { label: "Delivery + install", price: 1800 }],
    sections: [
      { title: "Home & Living", items: [["Bedsheet Set Cotton", 2800, "P"], ["Throw Blanket", 1900], ["Cushion Covers (4)", 1600], ["Wall Clock Oak", 2100], ["Floor Mat 120cm", 2400], ["Laundry Basket", 1300], ["Storage Boxes (3)", 2200, "P"], ["Curtains Pair Blackout", 4800], ["Rug 160x230", 7500], ["LED Floor Lamp", 4200]] },
      { title: "Furniture", items: [["Coffee Table", 9500, "P"], ["TV Stand 55in", 14000], ["Bookshelf 5-tier", 12000], ["Office Chair Ergo", 13500], ["Dining Set 4-seat", 32000, "P"], ["Shoe Rack 5-tier", 4500], ["Bed Frame Queen", 28000], ["Mattress 6x6", 24000], ["Wardrobe 2-door", 22000], ["Balcony Set", 11000]] },
      { title: "Appliances", items: [["Kettle 1.7L", 3200, "P"], ["Blender 2in1", 4500], ["Microwave 20L", 14500], ["Fridge 200L", 52000], ["Washing Machine 8kg", 58000, "P"], ["Iron Steam", 3800], ["Fan Standing 18in", 6500], ["Heater Oil 13-fin", 9500], ["Vacuum 1600W", 12500], ["Extension 4-way Surge", 1800]] },
      { title: "Kitchen", items: [["Sufuria Set (5)", 6500, "P"], ["Non-Stick Pan 28cm", 2800], ["Knife Set 6pc", 3200], ["Chopping Board Bamboo", 1400], ["Flask 1L", 1800], ["Lunch Box Steel", 1300], ["Spice Jars (6)", 1900, "P"], ["Apron + Mitts", 1100], ["Dish Rack Steel", 2600], ["Water Filter 20L", 4200]] },
      { title: "Books & Stationery", items: [["Notebook A5 (3pk)", 900, "P"], ["Pen Set Gel (10)", 700], ["Kids Storybooks (4)", 1800], ["Swahili Novels (2)", 1500], ["Exam Revision Pack", 2200], ["Art Kit Kids", 2600, "P"], ["Backpack School", 2800], ["Math Set + Calc", 1600], ["Sticky Notes + Flags", 600], ["Desk Organiser", 1400]] },
      { title: "General Retail", items: [["Umbrella Windproof", 1400, "P"], ["Torch Rechargeable", 1600], ["Padlock Heavy (2)", 1100], ["Sewing Kit", 800], ["First-Aid Box", 2400], ["Mosquito Net Double", 1700], ["Hot Water Bottle", 900], ["Cooler Box 25L", 3800, "P"], ["Garden Tools (5)", 2900], ["Car Emergency Kit", 3200]] },
    ],
  },
  "pharmacy": {
    capability: "add", laneMul: [1, 1.5], duration: null,
    addons: [{ label: "Pharmacist consult", price: 0 }, { label: "Dose organiser", price: 400 }],
    sections: [
      { title: "OTC Essentials", items: [["Paracetamol 100tabs", 350, "P"], ["Ibuprofen 50tabs", 400], ["Antihistamine 30tabs", 650], ["ORS Sachets (6)", 450], ["Cough Syrup 100ml", 550], ["Antacid Chews (24)", 600, "P"], ["Eye Drops 10ml", 700], ["Nasal Spray", 750], ["Throat Lozenges (24)", 450], ["Heat Rub 50g", 650]] },
      { title: "Baby & Mother", items: [["Diapers S (44pk)", 1350, "P"], ["Diapers M (40pk)", 1350], ["Baby Wipes (3pk)", 750], ["Formula 800g", 2800], ["Nipple Cream", 950], ["Prenatal Vitamins (30)", 1400, "P"], ["Baby Oil 200ml", 650], ["Teething Gel", 800], ["Breast Pads (30)", 900], ["Kids Multivitamin", 1100]] },
      { title: "Supplements", items: [["Vitamin C 60tabs", 950, "P"], ["Vitamin D3 60caps", 1200], ["Zinc 50tabs", 800], ["Iron + Folate (30)", 900], ["Omega-3 60caps", 1800], ["Multivitamin Daily (60)", 1500, "P"], ["Protein Sachets (10)", 2500], ["Collagen Powder 200g", 3200], ["Magnesium 60tabs", 1400], ["Probiotic 30caps", 2200]] },
      { title: "Personal Care", items: [["Sunscreen SPF50", 1800, "P"], ["Lip Balm SPF", 550], ["Hand Sanitiser 500ml", 650], ["Face Masks (10pk)", 800], ["Thermometer Digital", 1200], ["Blood Pressure Cuff", 4500, "P"], ["First-Aid Kit Home", 2800], ["Heating Pad", 1600], ["Compression Socks", 1300], ["Reading Glasses +1.5", 1500]] },
      { title: "Medical Devices", items: [["Glucometer + 25 strips", 3800, "P"], ["Test Strips (50)", 2500], ["Pulse Oximeter", 2800], ["Nebuliser Machine", 6500], ["Crutches Pair", 3200], ["Knee Support", 1500], ["Back Support Belt", 1800], ["Walking Stick Fold", 1400], ["Hot/Cold Pack", 900], ["Pill Cutter + Box", 600]] },
      { title: "Chronic Refills", subtitle: "Prescription verified on chat", items: [["BP Refill 30-day", 1200, "P"], ["Diabetes Refill 30-day", 1500], ["Asthma Inhaler", 1800], ["Allergy Plan 90-day", 2800, "P"], ["Thyroid 30-day", 900], ["Cholesterol 30-day", 1300], ["Auto-Refill Enrol", 0], ["Adherence Call Monthly", 0], ["Home BP Check Visit", 1500], ["Medication Review", 800]] },
    ],
  },
};