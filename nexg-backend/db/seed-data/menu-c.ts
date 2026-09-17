// Menu banks C: health, tech-electronics, travel-tours, vehicle-services,
// wellness, concierge-services, logistics-shipping.
import type { CategoryMenu } from "./items.js";

export const MENU_C: Record<string, CategoryMenu> = {
  "health": {
    capability: "book", laneMul: [1, 1.8], duration: [20, 90],
    variants: { labels: ["Standard", "Priority", "Home visit"], deltas: [0, 800, 1500] },
    addons: [{ label: "Lab report WhatsApp", price: 0 }, { label: "Prescription delivery", price: 300 }],
    sections: [
      { title: "GP & Clinics", items: [["GP Consult 20min", 2000, "P"], ["Child Consult", 1800], ["Follow-up Review", 1200], ["Women's Health Visit", 2500], ["Men's Health Screen", 3500, "P"], ["Vaccination Visit", 1500], ["Wound Dressing", 1200], ["Blood Draw at Clinic", 800], ["ECG + Review", 2800], ["Annual Checkup Basic", 5500]] },
      { title: "Dental", items: [["Cleaning + Polish", 3500, "P"], ["Filling Single", 4500], ["Extraction Simple", 5000], ["Kids Checkup", 2000], ["Whitening Session", 12000, "P"], ["Braces Consult", 3000], ["Denture Review", 2500], ["Emergency Tooth Care", 4000], ["X-Ray Single", 1800], ["Retainer Check", 1500]] },
      { title: "Labs & Tests", items: [["Full Blood Count", 1200, "P"], ["Malaria Test + Review", 900], ["Typhoid Test", 1100], ["Diabetes Panel (HbA1c)", 2500], ["Cholesterol Panel", 2800, "P"], ["Thyroid Panel", 3200], ["Pregnancy Panel", 3500], ["STI Screen Basic", 4000], ["COVID PCR + Cert", 3500], ["Home Sample Collection", 800]] },
      { title: "Therapy & Mental Health", items: [["Counselling 50min", 3000, "P"], ["Couples Session 60min", 4500], ["Teen Session 45min", 2800], ["Grief Support 4wk", 10000], ["Stress Program 6wk", 15000, "P"], ["Online Session 45min", 2500], ["Group Circle Entry", 1200], ["Sleep Clinic 1hr", 3500], ["Anger Program 4wk", 12000], ["First Chat Free 15min", 0]] },
      { title: "Telemedicine", items: [["Video Consult 15min", 1500, "P"], ["Video Follow-up", 900], ["E-Prescription", 600], ["Sick-Note + Consult", 1800], ["Dermatology Photo Review", 2200, "P"], ["Paeds Video 15min", 1600], ["Chronic Review Video", 1400], ["Second Opinion 30min", 3500], ["Night Consult 9pm–6am", 2500], ["Family Plan Monthly", 6000]] },
      { title: "Coaching & Wellness", items: [["Nutrition Plan 4wk", 6000, "P"], ["Fitness Assessment", 2500], ["Weight Program 8wk", 14000], ["Diabetes Lifestyle 6wk", 12000], ["Postnatal Recovery 6wk", 15000, "P"], ["Smoking-Quit 4wk", 8000], ["Sleep Reset 3wk", 7000], ["Corporate Talk 1hr", 20000], ["School Health Talk", 12000], ["Health Chat Monthly", 3000]] },
    ],
  },
  "tech-electronics": {
    capability: "add", laneMul: [1, 1.7], duration: null,
    variants: { labels: ["64GB", "128GB", "256GB"], deltas: [0, 8000, 16000] },
    addons: [{ label: "Screen guard fitted", price: 800 }, { label: "Setup + transfer", price: 1200 }],
    sections: [
      { title: "Phones", items: [["Entry Smartphone 64GB", 18500, "P"], ["Mid Smartphone 128GB", 32000], ["Camera King 256GB", 68000, "P"], ["Foldable 256GB", 145000], ["Refurbished Flagship", 42000], ["Dual-SIM Business", 28000], ["Kids Phone Basic", 9500], ["Hotspot Mifi 4G", 6500], ["Phone Trade-in Credit", 0], ["Lipa Mdogo Plan Entry", 3500]] },
      { title: "Accessories", items: [["Fast Charger 25W", 2200, "P"], ["USB-C Cable Braided", 900], ["Power Bank 20k", 3800], ["Earbuds Pro", 5500, "P"], ["Over-Ear Headphones", 7500], ["Phone Case Rugged", 1400], ["Screen Guard Fit", 800], ["Car Mount Magnetic", 1600], ["Bluetooth Speaker", 4200], ["Memory Card 128GB", 2400]] },
      { title: "Computing", items: [["Chromebook 11in", 32000, "P"], ["Laptop i5 8/512", 78000], ["Laptop i7 16/512", 125000, "P"], ["Desktop Mini i5", 65000], ["Monitor 24in", 22000], ["Keyboard + Mouse", 3800], ["External SSD 1TB", 14500], ["Webcam 1080p", 6500], ["Laptop Stand Alu", 3200], ["Windows Setup + Office", 2500]] },
      { title: "Audio", items: [["Soundbar 2.1", 18500, "P"], ["Party Speaker 40W", 12500], ["Studio Buds", 6800], ["Wired Earphones", 1200], ["Mic USB Podcast", 9500], ["Turntable Bluetooth", 28000, "P"], ["Vinyl Brush Kit", 2200], ["Headphone Stand", 2800], ["Aux + Splitter Pack", 900], ["Hearing-Safe Kids", 3200]] },
      { title: "Gaming", items: [["Console 1TB Disc", 75000, "P"], ["Extra Controller", 9500], ["Headset Gaming", 6800], ["Racing Wheel", 22000], ["Top Title New", 8500], ["Pre-Owned Title", 4500, "P"], ["Gaming Chair", 24000], ["Desk 120cm", 16000], ["LED Strip 5m", 2800], ["Cooling Stand", 3200]] },
      { title: "Smart Home & Repairs", items: [["Smart Bulb (2pk)", 3200, "P"], ["CCTV 4-Cam Kit", 38000], ["Video Doorbell", 14500], ["Smart Plug (2pk)", 2800], ["Screen Replace Mid", 8500, "P"], ["Battery Replace", 4500], ["Back Glass Replace", 6000], ["Charging Port Fix", 3500], ["Data Recovery Attempt", 5000], ["Annual Care Plan", 6000]] },
    ],
  },
  "travel-tours": {
    capability: "book", laneMul: [1, 2], duration: [360, 4320],
    variants: { labels: ["Shared van", "Private 4x4", "Luxury"], deltas: [0, 12000, 35000] },
    addons: [{ label: "Photographer/day", price: 8000 }, { label: "Extra night", price: 12000 }],
    sections: [
      { title: "Day Trips", items: [["Nairobi Park Half-Day", 8500, "P"], ["Giraffe Centre + Lunch", 6800], ["Karura + Museum Day", 4500], ["Naivasha Hell's Gate Day", 9500, "P"], ["Olorgesailie Day", 7200], ["Coffee Farm Tour", 5500], ["City Heritage Walk", 3200], ["Bomas + Carnivore Lunch", 7800], ["Mamba Village Family", 5200], ["Night Game Drive NNP", 12000]] },
      { title: "Mara Safaris", subtitle: "Cars + safaris multi-service flagship", items: [["Mara 2N Budget Camp", 45000, "P"], ["Mara 2N Mid Lodge", 78000], ["Mara 3N Luxury Tented", 145000, "P"], ["Migration Season 3N", 165000], ["Private Mara 2N 4x4", 120000], ["Fly-in Mara 2N", 185000], ["Honeymoon Mara 3N", 195000], ["Family Mara 4N (2A2K)", 220000], ["Photo Safari 4N Pro", 240000], ["Balloon Add-on", 65000]] },
      { title: "Coast Packages", items: [["Diani 3N Flight + Hotel", 68000, "P"], ["Watamu 4N Half-Board", 75000], ["Mombasa 2N SGR + Hotel", 32000], ["Lamu 3N Flight + House", 95000, "P"], ["Malindi 3N + Marine Park", 72000], ["Diving Add-on 2 tanks", 15000], ["Dhow Sunset + Dinner", 8500], ["Wasini Day Trip", 9500], ["Kitesurf Lesson 2hr", 12000], ["Airport–Beach Transfer", 4500]] },
      { title: "City & Culture", items: [["Kibera Walk + Lunch", 3800, "P"], ["Karen Blixen + Kazuri", 5200], ["Matatu Culture Tour", 3500], ["Food Tour CBD 4hr", 6500, "P"], ["Art Galleries Half-Day", 4800], ["Music Night + Transport", 7200], ["Faith Trail Day", 4500], ["Markets + Craft Day", 5800], ["Coffee Cupping 2hr", 4200], ["Family Heritage Day", 9000]] },
      { title: "Adventure", items: [["Mt Longonot Day Hike", 6800, "P"], ["Ngong Hills Traverse", 4500], ["Aberdare Waterfalls Day", 9500], ["Mt Kenya 3N Sirimon", 68000, "P"], ["Rafting Sagana Half-Day", 8500], ["Bungee + Lunch", 11000], ["Skydiving Tandem Diani", 45000], ["Cycling Karura 3hr", 3500], ["Rock Climbing Intro", 5500], ["Camping Gear Hire/Night", 4000]] },
      { title: "Corporate & Groups", items: [["Team-Build Day (20pax)", 95000, "P"], ["Retreat 2N (15pax)", 320000], ["Conference + Safari 3N", 450000], ["School Trip Day (40)", 120000], ["Church Group 2N", 280000, "P"], ["Chama Getaway 2N", 180000], ["End-Year Party + Venue", 150000], ["Transport Only 29-Seater", 28000], ["Guide per Day", 8000], ["Custom Itinerary Build", 5000]] },
    ],
  },
  "vehicle-services": {
    capability: "request", laneMul: [1, 1.7], duration: [30, 180],
    variants: { labels: ["Hatch", "Sedan", "SUV"], deltas: [0, 500, 1200] },
    addons: [{ label: "Interior detail", price: 1500 }, { label: "Pickup + return", price: 800 }],
    sections: [
      { title: "Car Wash", items: [["Body Wash", 500, "P"], ["Wash + Vacuum", 800], ["Wash + Wax", 1500], ["Underbody Wash", 900], ["Engine Wash", 1200, "P"], ["Headlight Restore", 1800], ["Pet Hair Removal", 1000], ["Bike Wash", 400], ["Tuk-Tuk Wash", 450], ["Monthly Wash x4", 2800]] },
      { title: "Detailing", items: [["Full Detail Sedan", 6500, "P"], ["Full Detail SUV", 8500], ["Ceramic Spray 6mo", 12000, "P"], ["Leather Treat + Feed", 4500], ["Odour Bomb + Ozone", 3500], ["Scratch Removal Panel", 4000], ["Headliner Deep-Clean", 3000], ["Convertible Top Treat", 5000], ["Showroom Prep Sale", 7500], ["New-Car Protection", 14000]] },
      { title: "Tires & Batteries", items: [["Puncture Fix", 800, "P"], ["Tire New 14in Fitted", 9500], ["Tire New 16in Fitted", 13500], ["Wheel Balancing (4)", 2500], ["Alignment 3D", 3500, "P"], ["Battery Test Free", 0], ["Battery New 70Ah", 18500], ["Jump-Start Rescue", 1500], ["Spare + Jack Hire/Day", 1200], ["TPMS Reset", 900]] },
      { title: "Service & Inspection", items: [["Minor Service Hatch", 6500, "P"], ["Minor Service Sedan", 7500], ["Minor Service SUV", 9500], ["Major Service + Plugs", 15000, "P"], ["Brake Pads Front", 8500], ["Pre-Purchase Inspect", 5000], ["NTSA Inspection Prep", 3500], ["Diagnostic Scan + Report", 2500], ["AC Regas", 4500], ["Wiper + Fluids Top-up", 1800]] },
      { title: "Rescue & Towing", items: [["Town Tow (10km)", 5000, "P"], ["Highway Tow (50km)", 15000], ["Flatbed SUV Tow", 8000], ["Fuel Rescue 5L", 3500], ["Lockout Opening", 2500], ["Night Rescue Surcharge", 2000], ["Accident Tow + Yard", 12000, "P"], ["Long-Distance Quote/km", 250], ["Bike Tow", 3000], ["Annual Rescue Cover", 9500]] },
      { title: "Subscriptions", items: [["Wash Club Monthly", 3200, "P"], ["Wash + Vacuum Monthly", 4800], ["Driver Car-Care Monthly", 7500], ["Fleet 5-Cars Monthly", 28000, "P"], ["Boda Fleet Wash (10)", 6000], ["Office Cars (3) Monthly", 15000], ["Estate Patrol Wash Day", 9000], ["Showroom Shine Weekly", 12000], ["Taxi Stage Partner", 5500], ["Custom Fleet Quote", 0]] },
    ],
  },
  "wellness": {
    capability: "book", laneMul: [1, 1.9], duration: [30, 120],
    variants: { labels: ["30 min", "60 min", "90 min"], deltas: [0, 1000, 2000] },
    addons: [{ label: "Hot stones", price: 1000 }, { label: "Herbal tea ritual", price: 400 }],
    sections: [
      { title: "Massage", items: [["Swedish 60min", 3500, "P"], ["Deep Tissue 60min", 4500], ["Hot Stone 75min", 6500, "P"], ["Back + Shoulder 30min", 2500], ["Foot Reflex 45min", 2800], ["Prenatal 60min", 5000], ["Couples 60min (2pax)", 9000], ["4-Hands 60min", 8000], ["Sports Recovery 60min", 5000], ["Home Visit 60min", 6000]] },
      { title: "Facials", items: [["Express Glow 30min", 2800, "P"], ["Deep Cleanse 60min", 4200], ["Hydra-Glow 75min", 6500, "P"], ["Anti-Age Gold 90min", 8500], ["Acne Program Session", 5000], ["Brightening Peel", 6000], ["Men's Facial 45min", 3500], ["Teen Facial 40min", 3000], ["Back Facial 45min", 4500], ["Bridal Glow 90min", 7500]] },
      { title: "Spa Packages", items: [["Half-Day Retreat", 9500, "P"], ["Full-Day Sanctuary", 16000, "P"], ["Couples Retreat Half-Day", 18000], ["Mums Morning (3hr)", 8500], ["Gents Reset (2hr)", 7500], ["Birthday Spa (4pax)", 32000], ["Hammam Ritual 90min", 9000], ["Sauna + Plunge Month", 12000], ["Spa + Lunch Bundle", 12500], ["Annual Member 12 visits", 90000]] },
      { title: "Gym & Fitness", items: [["Day Pass + Towel", 1200, "P"], ["Group Class Drop-in", 1000], ["Spin 45min", 1300], ["Pool Session", 1500], ["Month Off-Peak", 5500], ["Month Anytime", 7500, "P"], ["Couple Monthly", 13000], ["Student Monthly", 4500], ["Annual Upfront", 72000], ["Corporate (10) Monthly", 60000]] },
      { title: "Personal Training", items: [["PT Single 1hr", 3000, "P"], ["PT 8-Pack", 22000], ["PT 20-Pack", 50000, "P"], ["Duo PT 1hr", 4500], ["Boxing Coach 1hr", 3500], ["Strength Plan 8wk", 28000], ["Fat-Loss 12wk", 42000], ["Postnatal 1:1 8wk", 32000], ["Online Coach Monthly", 12000], ["Assessment + Plan", 4000]] },
      { title: "Bridal & Groups", items: [["Bride Trial + Day", 15000, "P"], ["Bridesmaids (4pax)", 28000], ["Groom Sharp (2hr)", 8000], ["Family Pamper (5pax)", 30000, "P"], ["Baby-Shower Spa (6)", 35000], ["Chama Treat Day (8)", 45000], ["Office Wind-Down (10)", 55000], ["Private Hire 3hr Eve", 40000], ["Champagne Add-on", 4500], ["Photos Add-on 1hr", 8000]] },
    ],
  },
  "concierge-services": {
    capability: "request", laneMul: [1, 1.6], duration: [30, 240],
    variants: { labels: ["Standard", "Priority 2hr", "Dedicated"], deltas: [0, 1000, 3000] },
    addons: [{ label: "Receipt pack", price: 0 }, { label: "Photo proof", price: 0 }],
    sections: [
      { title: "Reservations", items: [["Restaurant Table (4)", 1500, "P"], ["Hard-to-Get Table", 3500], ["Hotel Night Booking", 2000], ["SGR Tickets (4pax)", 1800, "P"], ["Flight Hold + Ticket", 2500], ["Event Tickets (4)", 2000], ["Doctor Appointment", 1200], ["Salon Slot (3pax)", 1500], ["Golf Tee-Time (4)", 3000], ["Last-Minute Fix Fee", 2500]] },
      { title: "Errands", items: [["Queue + Pay (KRA/NTSA)", 2000, "P"], ["Document Delivery CBD", 1200], ["Bank + Post Run", 1800], ["Shopping List Run", 2200], ["School Pickup + Drop", 2500, "P"], ["Pet Vet Run", 2800], ["Car Service Drop", 2200], ["Laundry Run Return", 1500], ["Pharmacy Run", 1300], ["Late-Night Run 10pm+", 3500]] },
      { title: "Gift Sourcing", items: [["Brief-to-Door Gift", 3500, "P"], ["Corporate Gifts (10)", 28000], ["Bridal Gift Hunt", 5000], ["Kids Wishlist (5)", 8000, "P"], ["Import Sourcing Fee", 4500], ["Wrap + Card + Drop", 1800], ["Cake + Flowers Combo", 5200], ["Surprise Setup + Photo", 7500], ["Monthly Gifting Plan", 12000], ["Apology Rush 3hr", 4200]] },
      { title: "Travel Planning", items: [["Weekend Plan Build", 4500, "P"], ["Date-Night Build", 3800], ["Family Trip Plan 5d", 12000], ["Visa Pack + Photos", 3500], ["Insurance + Forex Pack", 2800, "P"], ["Packing + Prep Visit", 3000], ["Airport VIP Handover", 4000], ["Hotel Price-Match", 1500], ["Safari Add-on Plan", 6000], ["Honeymoon Build", 15000]] },
      { title: "Home & Move", items: [["Cleaner Vetting (3)", 4500, "P"], ["Nanny Vetting (3)", 6000], ["Fundi Dispatch + Supervise", 3500], ["Move Manager Half-Day", 8000, "P"], ["Estate Agent Shortlist", 5000], ["Rent Negotiation", 4000], ["Inventory + Photos", 3000], ["Repairs Under 5k Handle", 2500], ["Garden Reset Day", 7000], ["Deep-Clean Supervise", 2800]] },
      { title: "VIP & Retainer", items: [["Day Retainer 8hr", 15000, "P"], ["Weekend Retainer", 35000], ["Monthly 20hr", 55000, "P"], ["Family Office Lite", 85000], ["Founder Shield Monthly", 120000], ["Travel With-Me/Day", 20000], ["Event Captain 6hr", 18000], ["Night Owl 8pm–2am", 17000], ["Chama Concierge (20)", 40000], ["Custom SLA Build", 0]] },
    ],
  },
  "logistics-shipping": {
    capability: "request", laneMul: [1, 1.6], duration: [60, 720],
    variants: { labels: ["Standard", "Express", "Overnight"], deltas: [0, 600, 1200] },
    addons: [{ label: "Packaging", price: 400 }, { label: "Insurance 1%", price: 500 }],
    sections: [
      { title: "Same-Day Parcels", items: [["CBD Document Rush", 800, "P"], ["Kilimani Parcel 5kg", 1200], ["Westlands 10kg", 1800], ["CBD–JKIA 15kg", 2500, "P"], ["Fragile + Handle", 2000], ["Cash-on-Delivery Run", 1500], ["Return Pickup", 1000], ["Multi-Drop (3 stops)", 2800], ["Night Parcel 8pm+", 2200], ["Weekend Rush", 1900]] },
      { title: "Upcountry Haul", items: [["Nairobi–Nakuru 50kg", 4500, "P"], ["Nairobi–Eldoret 100kg", 9500], ["Nairobi–Kisumu 100kg", 11000], ["Nairobi–Mombasa 100kg", 12000, "P"], ["Nairobi–Nyeri 50kg", 4000], ["Nairobi–Garissa 80kg", 13000], ["Bus-Link + Last-Mile", 2200], ["Full Van Hire Upcountry", 28000], ["Livestock Crate Move", 15000], ["Furniture Wrap + Move", 18000]] },
      { title: "Air Freight", items: [["JKIA Handling + Docs", 4500, "P"], ["NBO–MBA 45kg", 18000], ["NBO–KSM 45kg", 16500], ["NBO–DXB Docs 2kg", 8500], ["NBO–LHR 10kg", 32000, "P"], ["Cold-Chain 20kg", 25000], ["Dangerous-Goods File", 12000], ["Customs Broker Half-Day", 8000], ["Storage/Day at Shed", 1500], ["Insurance Valuation", 2000]] },
      { title: "Sea Freight", items: [["LCL 1cbm Mombasa", 28000, "P"], ["20ft Nairobi–Mombasa", 95000], ["Car Clearing Assist", 45000, "P"], ["Import Docs File", 15000], ["KEBS + KEPHIS Liaison", 12000], ["Port Storage/Day", 3500], ["Last-Mile Mombasa", 5000], ["Upcountry Rail + Truck", 22000], ["Consolidation Fee", 8000], ["Export Pack + Pallet", 9500]] },
      { title: "Warehousing", items: [["Pallet/Month Syokimau", 6500, "P"], ["Shelf Bay/Month", 4500], ["Bulk Floor 10sqm", 18000], ["Cold Room Crate/Day", 1200], ["Pick + Pack per Order", 250, "P"], ["Stock Count Day", 8000], ["Label + Barcode (100)", 1500], ["Returns Handling", 400], ["24hr Guarded Add-on", 3000], ["Dispatch Van Half-Day", 7000]] },
      { title: "Packaging & Extras", items: [["Box + Fill Standard", 600, "P"], ["Double-Wall Box", 900], ["Bubble Wrap 10m", 1200], ["Tape + Label Set", 400], ["Furniture Blanket Hire", 800], ["Crate Build Custom", 4500, "P"], ["Pallet Wrap Full", 700], ["Fragile Sticker + Note", 200], ["Photo POD + POD SMS", 0], ["Monthly Business Rate", 0]] },
    ],
  },
};