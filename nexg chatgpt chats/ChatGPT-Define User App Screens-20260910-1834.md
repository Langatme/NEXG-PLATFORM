# Define User App Screens

**User:** Anonymous  
**Created:** 8/25/2026 9:03:29  
**Updated:** 8/29/2026 19:14:04  
**Exported:** 9/10/2026 18:34:20  
**Link:** [https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a8d300b-3964-83ea-99c2-dd2add475986](https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a8d300b-3964-83ea-99c2-dd2add475986)  

## Prompt:
8/25/2026, 9:03:27 AM

Currently developing the next app, and I'm on the user app, and there's a few things I just wanted to put across. One of them is how many screens will I have? I had settled on four, but you can tell me how many screens I have and then what will each of them have. Yeah, I'm just only on the user app. Yeah.

## Response:
8/25/2026, 9:03:28 AM

Yes. For the **NEXG Consumer/User App**, I would keep the **four-screen foundation** you settled on.

But there is an important distinction: **four primary navigation surfaces ≠ only four screens**. You can have dozens of transient/detail/workflow screens while the user still experiences the product as a four-surface app.

Based on the NEXG architecture we've established, I would structure the user app like this:

## The 4 primary screens

| # | Primary surface | Purpose |
|---|---|---|
| **1** | **Home** | Understand where I am, what matters, and what I can do next |
| **2** | **Explore** | Discover services, merchants, experiences, places and things around me |
| **3** | **Orders / Activity** | Everything I've booked, ordered, requested or am currently doing |
| **4** | **Profile / Account** | Identity, preferences, payments, saved items, settings and support |

And **Home should be the dominant surface** - essentially the consumer's NEXG workspace.

That aligns very strongly with the design-system principle in your document that the Home/Workspace is the operating surface rather than simply a conventional dashboard. `Branch · UX Design Laws.txt`

---

# 1. HOME - "What do I need next?"

This should **not** look like a generic food-delivery home screen.

It should be the place where NEXG demonstrates its core thesis:

> **NEXG understands the context around you and coordinates what you need next.**

### Header / context

- Location / property
- Greeting
- Current context
- Notifications
- Profile/avatar
- Connectivity/status when necessary

For example:

> **Good morning, Emma**  
> Nairobi • Staying at [Property]

or:

> **Good evening**  
> You're at [Hotel]

### Primary action / search

A very prominent universal search:

> **What do you need?**

Could accept:

- Food
- Transport
- Activities
- Shopping
- Services
- Places
- Experiences
- Natural-language requests

Eventually:

> "I need a taxi to the airport at 6am."

That becomes an NEXG action rather than merely a search query.

### Contextual widgets

This is where the system becomes interesting.

Depending on context:

**If staying at a hotel**

- Your stay
- Room services
- Hotel facilities
- Food
- Transport
- Experiences
- Things happening nearby

**If at home**

- Nearby services
- Food
- Shopping
- Transport
- Local experiences

**If travelling**

- Airport transfer
- Booking
- Itinerary
- Nearby recommendations
- Activities

### Active task

If something is happening:

> 🚗 Driver arriving in 4 min

or:

> 🍔 Order arriving in 18 min

or:

> 🏨 Check-in available

The Home screen should surface it automatically.

### Recommendations

Personalized:

- For you
- Nearby
- Because you're staying here
- Popular tonight
- Continue where you left off

### Bottom navigation

Keep it extremely simple:

**Home · Explore · Activity · Profile**

---

# 2. EXPLORE - "What can I do?"

This is the discovery engine.

Unlike Home, Explore is deliberately **user-directed**.

### Search

Universal NEXG search:

> **Search anything**

Search:

- merchants
- restaurants
- services
- products
- experiences
- destinations
- properties
- activities

### Categories

Your merchant/service taxonomy can appear here.

But don't dump 30+ categories onto the user.

Use progressive disclosure.

For example:

**Popular**

- 🍔 Food
- 🚗 Transport
- 🛍 Shopping
- ✨ Experiences
- 💆 Wellness
- 💄 Beauty

Then:

> **See all**

### Nearby

Location-aware discovery:

> Near you

with:

- Map/list
- Distance
- Open/closed
- Price
- Rating
- Availability

### Curated collections

Examples:

> **Tonight in Nairobi**

> **Around your hotel**

> **Weekend experiences**

> **Under KSh 2,000**

> **Popular with guests**

### Merchant/service detail

This isn't necessarily another primary tab.

It's a **destination screen** launched from Explore.

It can contain:

- Hero
- Merchant information
- Services/products
- Photos
- Availability
- Reviews
- Location
- Offers
- CTA

---

# 3. ACTIVITY - "What's happening with me?"

I actually prefer **Activity** over simply "Orders."

Because NEXG is much bigger than ordering.

This surface contains the user's **relationship with NEXG**.

### Active

Anything currently happening:

> 🚗 Airport transfer  
> Driver arriving

> 🍔 Food order  
> Preparing

> 🎟 Experience  
> Starts tomorrow

> 🏨 Hotel request  
> Pending

### Upcoming

- Bookings
- Reservations
- Experiences
- Transport
- Appointments
- Deliveries

### Past

- Orders
- Trips
- Bookings
- Services
- Payments

### Each activity opens into a contextual workspace

For example:

**Airport Transfer**

```text
Driver
Vehicle
ETA
Pickup
Destination
Contact
Track
Cancel
Payment
```

**Restaurant order**

```text
Restaurant
Items
Order status
ETA
Rider
Track
Contact
Receipt
```

**Experience**

```text
Experience
Date
Time
Location
Tickets
Directions
Host
```

This is important because your UX architecture says **widgets are living surfaces with states**, rather than static cards. `Branch · UX Design Laws.txt`

---

# 4. PROFILE - "Me"

This is the least exciting screen visually, but it contains a lot of functionality.

### Identity

- Profile
- Name
- Phone/email
- Verification
- Membership/loyalty

### Wallet / payments

- Payment methods
- NEXG balance/wallet if introduced
- Transactions
- Receipts
- Refunds

### Saved

- Favorites
- Saved merchants
- Saved places
- Saved experiences

### Preferences

- Dietary/preferences
- Language
- Notifications
- Location preferences
- Accessibility
- Privacy

### Your places

Potentially:

- Home
- Work
- Hotel/stays
- Frequent locations

### Support

- Help center
- AI concierge
- Contact support
- Report issue
- Lost & found

### Settings

- Account
- Security
- Devices
- Permissions
- Privacy
- Notifications

---

# But here's the important part

I **would not** design these four screens as four giant static pages.

The architecture should be:

```text
                    NEXG USER APP
                         │
        ┌────────────────┼────────────────┐
        │                │                │
      HOME            EXPLORE          ACTIVITY
        │                │                │
        └────────────────┼────────────────┘
                         │
                      PROFILE
```

Then each surface **composes experiences from the NEXG component/widget/state system**.

For example:

```text
HOME
 ├── Context Header
 ├── Universal Search
 ├── Active Journey
 ├── Recommended
 ├── Nearby
 ├── Continue
 └── Dynamic Widgets

EXPLORE
 ├── Search
 ├── Categories
 ├── Collections
 ├── Nearby
 ├── Map
 └── Discovery Results

ACTIVITY
 ├── Active
 ├── Upcoming
 ├── Past
 └── Activity Workspaces

PROFILE
 ├── Identity
 ├── Wallet
 ├── Saved
 ├── Preferences
 ├── Support
 └── Settings
```

---

## Then you have the "screens behind the screens"

This is where I would **not count them as primary navigation screens**.

Examples:

### Discovery

```text
Explore
   ↓
Search results
   ↓
Merchant
   ↓
Service/Product
   ↓
Booking/Cart
   ↓
Confirmation
```

### Transport

```text
Home/Explore
   ↓
Transport
   ↓
Choose ride
   ↓
Confirm
   ↓
Driver matching
   ↓
Live trip
   ↓
Receipt
```

### Food

```text
Explore
   ↓
Merchant
   ↓
Menu
   ↓
Cart
   ↓
Checkout
   ↓
Order tracking
```

### Experience

```text
Explore
   ↓
Experience
   ↓
Date/time
   ↓
Booking
   ↓
Confirmation
   ↓
Experience workspace
```

These are **workflow states**, not reasons to add more bottom-navigation tabs.

---

# So the actual number

I'd define it at three levels:

### **4 primary navigation surfaces**

**Home · Explore · Activity · Profile**

### **~15-25 major experience/workspace types**

Things like:

- Merchant
- Product
- Service
- Booking
- Cart
- Checkout
- Order
- Ride
- Live tracking
- Experience
- Property
- Search
- Map
- Payment
- Notifications
- Support
- etc.

### **Hundreds of UI states**

Because every major experience needs states such as:

```text
Loading
Empty
Ready
Focused
Expanded
Processing
Success
Error
Offline
Updating
Unavailable
Cancelled
Completed
```

Your Phase 5 document explicitly calls for these states to be designed as part of the system rather than treated as accidental behavior. `Branch · UX Design Laws.txt`

---

# And I would lock this decision

**NEXG Consumer App v1**

```text
┌──────────────────────────────┐
│                              │
│          EXPERIENCE          │
│                              │
│       HOME / EXPLORE /       │
│       ACTIVITY / PROFILE     │
│                              │
│                              │
├──────────────────────────────┤
│ Home │ Explore │ Activity │ Me│
└──────────────────────────────┘
```

The **four tabs are the user's mental map**.

Everything else should be **contextual, progressive and temporary**.

That gives you the simplicity of a four-screen app without artificially constraining NEXG's enormous functionality.

And importantly, it follows the NEXG law you've already established: **don't make the user navigate the complexity that the system can coordinate for them.** `Branch · UX Design Laws.txt`

## Prompt:
8/25/2026, 9:05:33 AM

![IMG_1221.png](https://chatgpt.com/backend-api/estuary/content?id=file_00000000927481f49ded427ccd225b31&fn=IMG_1221.png&cd=attachment&ts=496959&p=fs&cid=1&sig=5e89565e5d730343affae04856811f4dd0c4c03cf05267853a913851cef361b6&v=0)

Generate an image of the explore screen 
My current services screen

## Response:
8/25/2026, 9:05:35 AM

![NEXG Explore: Nairobi Discoveries](https://chatgpt.com/backend-api/estuary/content?id=file_000000008fc881f4bbb0cad4b01b98f7&fn=NEXG+Explore%3A+Nairobi+Discoveries.png&cd=attachment&ts=496959&p=fs&cid=1&sig=84baf941b9e9f26a02620baac4b8ec9c5717b1857c72309ab16c13ac6a495de6&v=0)

## Prompt:
8/25/2026, 9:08:32 AM

Now give me a detailed prompt for that screen for my agent 
Let it be able to work autonomously on the workflows of each dynamic category

## Response:
8/25/2026, 9:08:56 AM

Absolutely. The important change is: **don't tell the agent to merely build the Explore UI. Tell it to build the Explore surface as a dynamic discovery/workflow engine.**

The agent should be able to take a category such as **Food, Transport, Shopping, Wellness, Beauty, Experiences, etc.**, inspect its configuration, determine the appropriate discovery → detail → action → confirmation flow, and implement it **without you manually designing every category screen**.

This also fits the NEXG principle that the design system remains authoritative while screens are compositions of reusable components, widgets, entities and states. `Branch · UX Design Laws.txt`

**document: **

# NEXG CONSUMER APP - EXPLORE SCREEN
## Autonomous Dynamic Category & Workflow Implementation Specification

You are the primary implementation agent for the NEXG Consumer/User App.

Your task is to implement the **Explore screen** shown in the provided visual reference and, more importantly, build it as a **data-driven, extensible discovery and workflow engine**.

Do not treat this as a static UI recreation.

The goal is:

> **One Explore system capable of dynamically supporting every NEXG category, subcategory, merchant, service, experience and transactional workflow without requiring a separate hardcoded screen for every category.**

The Explore screen must feel like a native NEXG product and must integrate with the existing NEXG design system, component system, entity system, navigation, state system and backend/data models.

---

# 1. PRIMARY OBJECTIVE

Build:

```text
Explore
│
├── Search
├── Categories
├── Subcategories
├── Location-aware discovery
├── Filters
├── Collections
├── Recommended content
├── Dynamic category results
├── Merchant/service discovery
├── Detail experiences
├── Action workflows
└── Transactional workflows
```

The architecture must support:

```text
Category
    ↓
Subcategory
    ↓
Discovery
    ↓
Entity
    ↓
Detail
    ↓
Action
    ↓
Workflow
    ↓
Confirmation
    ↓
Activity
```

The Explore screen is therefore not simply a list of merchants.

It is the **consumer discovery gateway into the NEXG ecosystem**.

---

# 2. VISUAL REFERENCE

Use the provided Explore-screen image as the visual direction.

The existing Services screen is also the current product context and should be treated as the starting point rather than discarded.

Preserve the existing NEXG visual language:

- dark-first interface
- large rounded surfaces
- strong white typography
- restrained grey secondary text
- NEXG green accent
- progressive blur/glass surfaces where appropriate
- generous spacing
- large touch targets
- horizontal content rails
- contextual content
- minimal visual clutter
- strong hierarchy
- iOS-quality interaction

Do NOT blindly copy every visual detail from the reference.

Use the reference to establish:

- hierarchy
- density
- composition
- spacing
- card language
- navigation
- category presentation
- image treatment
- typography
- visual rhythm

The actual implementation must conform to the existing NEXG design tokens and components.

---

# 3. PRIMARY NAVIGATION

The Consumer App has four primary navigation surfaces:

```text
Home
Explore
Activity
Account
```

Explore is the active surface.

Do not create additional bottom-navigation tabs for categories.

Categories belong inside Explore.

---

# 4. EXPLORE SCREEN STRUCTURE

The default Explore screen should be composed approximately as:

```text
┌───────────────────────────────┐
│ Status / system area          │
│                               │
│ Explore                  Map  │
│ Discover places, services     │
│ & experiences around you      │
│                               │
│ ┌───────────────────────────┐ │
│ │ Search anything on NEXG   │ │
│ └───────────────────────────┘ │
│                               │
│ Food Transport Shopping ...   │
│                               │
│ Near you              See map │
│ ┌────┐ ┌────┐ ┌────┐          │
│ │    │ │    │ │    │          │
│ └────┘ └────┘ └────┘          │
│                               │
│ Collections for you     All   │
│ ┌────┐ ┌────┐ ┌────┐          │
│ │    │ │    │ │    │          │
│ └────┘ └────┘ └────┘          │
│                               │
│ Popular experiences     All   │
│ ┌──────────┐ ┌──────────┐     │
│ │          │ │          │     │
│ └──────────┘ └──────────┘     │
│                               │
├───────────────────────────────┤
│ Home Explore Activity Account │
└───────────────────────────────┘
```

However, this composition must be **dynamic**.

Sections should be driven by data and context.

Do not hardcode the entire page.

---

# 5. HEADER

Implement:

### Title

```text
Explore
```

### Subtitle

```text
Discover places, services & experiences around you
```

The subtitle may become contextual depending on location/context.

For example:

```text
Discover what's happening around you
```

or:

```text
Find what you need nearby
```

Do not overuse dynamic copy.

Keep the default stable.

---

# 6. LOCATION

Explore is location-aware.

The system should understand:

```text
current location
location permission state
selected location
property/location context
distance
service availability
merchant proximity
```

Example:

```text
Near you
📍 Westlands, Nairobi
```

Allow the user to change the location.

Possible states:

```text
Location available
Location unavailable
Permission required
Location loading
Location stale
Manual location selected
```

Do not break Explore when location is unavailable.

Fallback to:

```text
Nearby
```

or the user's last known/selectable location.

---

# 7. UNIVERSAL SEARCH

The search field is one of the most important elements.

Placeholder:

```text
Search for anything on NEXG
```

Search should eventually support:

```text
merchant
service
product
experience
category
subcategory
location
property
activity
natural-language intent
```

Examples:

```text
pizza
massage
airport transfer
things to do tonight
coffee near me
gym
flowers
car rental
```

Eventually:

```text
I need a ride to the airport tomorrow at 6am
```

should become an intent-driven workflow.

Architect the search layer so this can be added without rebuilding Explore.

---

# 8. CATEGORY SYSTEM

Categories must NOT be hardcoded into the Explore component.

Create/use a category registry.

Conceptually:

```typescript
Category {
  id
  name
  slug
  icon
  image
  description
  enabled
  sortOrder
  subcategories
  discoveryConfig
  workflowConfig
  filterConfig
  entityTypes
  actions
  capabilities
}
```

The exact schema should follow the existing project architecture if one already exists.

Do not create a competing category system if one already exists.

Inspect the repository first.

---

# 9. CATEGORY REGISTRY IS THE SOURCE OF TRUTH

Before implementing category behavior:

1. Inspect existing category models.
2. Inspect existing merchant/category data.
3. Inspect existing API endpoints.
4. Inspect existing navigation.
5. Inspect existing entity models.
6. Inspect existing service/product/order/booking models.
7. Inspect existing components.
8. Inspect existing design tokens.
9. Inspect existing state management.
10. Reuse existing architecture wherever possible.

Do not create duplicate abstractions.

If something already exists, extend it.

---

# 10. CATEGORY PRESENTATION

The horizontal category rail should dynamically load enabled categories.

Example:

```text
Food
Transport
Shopping
Wellness
Experiences
More
```

Do not assume these are the only categories.

If the backend/configuration contains:

```text
Beauty
Fashion
Vehicle Rental
Flowers & Gifts
Financial Services
Alcohol & Beverages
Airport Transfers
```

the Explore system should be able to render them without changing the Explore component.

---

# 11. CATEGORY ICONS

Each category should have:

```text
icon
label
active state
inactive state
loading state
disabled state
```

Use the existing NEXG icon system.

Do not introduce arbitrary icon styles.

Icons must remain visually consistent across:

- Explore
- Home
- Search
- Merchant pages
- Filters
- Checkout
- Activity

---

# 12. CATEGORY CLICK BEHAVIOR

When a category is selected:

```text
Explore
   ↓
Category
   ↓
Category discovery state
```

Do NOT necessarily navigate to an entirely different app.

Prefer contextual navigation.

For example:

```text
Explore > Food
```

should show:

```text
Food
├── Restaurants
├── Cafes
├── Fast Food
├── Delivery
├── Takeaway
└── other configured subcategories
```

The exact subcategories must come from the category registry/data.

---

# 13. DYNAMIC CATEGORY CONFIGURATION

Every category should be able to define its own discovery behavior.

Conceptually:

```typescript
CategoryDiscoveryConfig {
  layout
  sections
  filters
  sorting
  mapEnabled
  searchEnabled
  locationRequired
  priceFilter
  ratingFilter
  availabilityFilter
  distanceFilter
  entityType
  supportedActions
  workflowType
}
```

Example:

```text
Food
layout = merchant_list
entity = merchant
actions = browse_menu, order, reserve
```

Transport:

```text
Transport
layout = service_selection
entity = transport_service
actions = quote, book
locationRequired = true
```

Experiences:

```text
Experiences
layout = experience_discovery
entity = experience
actions = view, reserve, book
dateFilter = true
availabilityFilter = true
```

Wellness:

```text
Wellness
layout = service_discovery
entity = merchant/service
actions = view, schedule, book
timeFilter = true
```

The architecture must support these differences through configuration rather than duplicate screens.

---

# 14. AUTONOMOUS CATEGORY WORKFLOW ENGINE

This is critical.

The agent must implement a reusable workflow engine capable of determining the correct flow for a category.

Conceptually:

```text
Category
    ↓
Capabilities
    ↓
Available entities
    ↓
Available actions
    ↓
Workflow
```

For example:

```text
Food
→ Browse
→ Merchant
→ Menu
→ Item
→ Cart
→ Checkout
→ Order
→ Tracking
```

Transport:

```text
Transport
→ Choose service
→ Pickup
→ Destination
→ Vehicle/service
→ Price
→ Confirmation
→ Matching
→ Live trip
→ Completion
```

Experiences:

```text
Experience
→ Discover
→ Experience detail
→ Date
→ Time
→ Participants
→ Availability
→ Checkout
→ Booking confirmation
→ Activity
```

Wellness:

```text
Wellness
→ Discover provider
→ Service
→ Staff/provider if applicable
→ Date
→ Time
→ Booking
→ Payment
→ Confirmation
```

Shopping:

```text
Shopping
→ Discover merchant/product
→ Product
→ Variant
→ Quantity
→ Cart
→ Delivery/pickup
→ Checkout
→ Order
→ Tracking
```

The implementation must support this without requiring a separate bespoke screen tree for every category.

---

# 15. WORKFLOW CAPABILITY MODEL

Build around capabilities rather than category names.

For example:

```typescript
Capability =
  | "browse"
  | "search"
  | "view"
  | "order"
  | "book"
  | "reserve"
  | "schedule"
  | "quote"
  | "track"
  | "deliver"
  | "pickup"
  | "pay"
  | "message"
  | "call"
  | "navigate"
```

A category declares which capabilities it supports.

This allows the same workflow primitives to be reused.

---

# 16. ENTITY MODEL

The Explore system should understand different entity types.

At minimum architect for:

```text
Category
Subcategory
Merchant
Product
Service
Experience
Property
Location
Booking
Order
Transport request
Collection
```

Each entity should expose:

```text
identity
title
description
images
location
distance
rating
price
availability
category
subcategory
merchant
actions
```

Only render properties that are relevant.

---

# 17. ENTITY DETAIL SCREEN

Do not create separate visual architectures for every merchant/service type unless genuinely necessary.

Use a shared entity-detail framework.

Example:

```text
Hero
Identity
Description
Gallery
Metadata
Availability
Pricing
Options
Reviews
Location
Related items
Primary CTA
```

Then configure sections per entity type.

---

# 18. PRIMARY ACTION

Every detail experience must have a clear primary action.

Examples:

```text
Food
Order now

Restaurant
View menu

Experience
Book now

Wellness
Book appointment

Transport
Get ride

Product
Add to cart

Service
Request service
```

The CTA must come from the entity/category capability configuration.

Never display irrelevant actions.

---

# 19. DISCOVERY CARDS

Create reusable NEXG discovery cards.

A card should support:

```text
image
badge
favorite
title
category
metadata
rating
duration
distance
price
availability
CTA
```

But not every card needs every field.

Cards should be configuration-driven.

Example:

```text
Merchant card
Experience card
Product card
Service card
Transport card
Collection card
```

Reuse components rather than creating category-specific cards unnecessarily.

---

# 20. "NEAR YOU"

Implement a horizontal discovery rail.

Data should be dynamically fetched based on:

```text
location
distance
category
availability
personalization
ranking
```

Each card should support:

```text
favorite
open
view
navigate
order/book
```

depending on capability.

---

# 21. COLLECTIONS

Collections should be dynamic.

Examples:

```text
Date Night
Quick Bites
Weekend Vibes
Wellness Picks
```

But these should NOT be hardcoded into the component.

Backend/configuration can supply:

```typescript
Collection {
  id
  title
  subtitle
  image
  query
  category
  filters
  ranking
}
```

The collection card opens a discovery result generated from its configuration.

---

# 22. POPULAR EXPERIENCES

The Explore screen should support experience-specific sections.

Example:

```text
Popular experiences
```

Cards may show:

```text
image
availability badge
title
type
price
rating
date
```

Clicking one opens the experience detail workflow.

---

# 23. DYNAMIC SECTIONS

Do not hardcode:

```text
Near you
Collections
Popular experiences
```

as immutable UI.

Instead build:

```typescript
ExploreSection {
  id
  type
  title
  subtitle
  enabled
  priority
  query
  category
  layout
  dataSource
  personalization
  action
}
```

Possible section types:

```text
category_rail
nearby
recommended
collection
popular
trending
starting_soon
recently_viewed
continue
deals
map
merchant_list
experience_list
product_list
```

This allows the Explore home surface to evolve without rewriting it.

---

# 24. PERSONALIZATION

Architect Explore so ranking can eventually consider:

```text
location
time
day
history
favorites
past purchases
bookings
current property
current trip
preferences
availability
merchant quality
distance
price
popularity
```

Do NOT fake personalization in production.

If the backend doesn't provide personalization yet, create a clean fallback ranking layer.

---

# 25. TIME AND CONTEXT

Explore should be context-aware.

Examples:

Morning:

```text
Breakfast
Coffee
Transport
```

Afternoon:

```text
Lunch
Activities
Shopping
```

Evening:

```text
Dinner
Nightlife
Events
Experiences
```

Weekend:

```text
Experiences
Events
Travel
Wellness
```

Property context:

```text
Hotel services
Nearby restaurants
Airport transfer
Activities
```

Again, do not hardcode this into JSX.

Make contextual ranking configurable.

---

# 26. MAP

The map icon in the header opens a map discovery experience.

Map should understand:

```text
current location
merchant markers
experience markers
service availability
category filters
selected entity
distance
```

Selecting a map marker should open the same entity-detail system used by list discovery.

Do not build a separate entity architecture for maps.

---

# 27. FILTER SYSTEM

Filters should be dynamic.

Possible filters:

```text
Category
Subcategory
Distance
Price
Rating
Open now
Available today
Date
Time
Duration
Delivery
Pickup
Booking
Accessibility
```

A category determines which filters make sense.

Food may expose:

```text
Cuisine
Price
Rating
Delivery
Pickup
Open now
```

Experiences:

```text
Date
Time
Price
Duration
Location
Availability
```

Transport:

```text
Vehicle
Pickup
Destination
Time
Price
```

The filter engine should derive these from category configuration.

---

# 28. STATE SYSTEM

Every Explore component must support proper states.

At minimum:

```text
idle
loading
loaded
empty
error
offline
updating
stale
```

Discovery cards may support:

```text
available
unavailable
closed
sold_out
booking_required
```

Actions may support:

```text
idle
processing
success
failed
```

Do not leave state behavior to individual components.

Use the existing NEXG state conventions.

The design system explicitly requires states to be designed and validated as part of the interaction system. `Branch · UX Design Laws.txt`

---

# 29. OFFLINE

Explore must degrade gracefully.

If offline:

```text
Show cached discovery where possible
Show last known location
Clearly communicate stale data
Disable actions that require network
Allow browsing cached content
```

Do not show a blank screen.

---

# 30. EMPTY STATES

Examples:

```text
No restaurants nearby
No experiences today
No results
No services available
No bookings available
```

Provide useful next actions.

Example:

```text
Nothing nearby

Try expanding your search area
```

with:

```text
Expand area
Change location
Explore all
```

---

# 31. SEARCH EMPTY / FAILURE

Search should support:

```text
No results
Network error
Invalid query
Location unavailable
Service unavailable
```

Never leave the user at a dead end.

---

# 32. NAVIGATION RULE

Do not create deep navigation stacks unnecessarily.

Use:

```text
Explore
  ↓
Discovery
  ↓
Entity
  ↓
Workflow
```

and return to the originating context naturally.

The user should never feel lost.

---

# 33. ACTIVITY INTEGRATION

Every transactional workflow launched from Explore must eventually appear in:

```text
Activity
```

Examples:

```text
Order
Booking
Ride
Reservation
Service request
Delivery
```

Explore should never create an isolated transaction that Activity does not understand.

---

# 34. CHECKOUT INTEGRATION

If a category supports payment:

```text
Explore
→ Entity
→ Selection
→ Checkout
→ Payment
→ Confirmation
→ Activity
```

Reuse the global checkout/payment architecture.

Do not create:

```text
FoodCheckout
ExperienceCheckout
WellnessCheckout
ShoppingCheckout
```

unless the business logic genuinely requires separate behavior.

Prefer:

```text
NEXGCheckout
+
category configuration
```

---

# 35. AUTONOMOUS IMPLEMENTATION BEHAVIOR

You are authorized to work autonomously.

Before changing code:

1. Inspect the repository.
2. Understand the existing architecture.
3. Identify existing components.
4. Identify existing screens.
5. Identify existing navigation.
6. Identify category definitions.
7. Identify API/data models.
8. Identify state management.
9. Identify design tokens.
10. Identify existing workflows.

Then determine what can be reused.

Do not ask for confirmation for ordinary implementation decisions.

Only stop and ask if you encounter a genuinely ambiguous product/business rule that cannot reasonably be inferred from the existing architecture.

---

# 36. DO NOT CREATE DUPLICATE SYSTEMS

Before creating:

```text
CategoryProvider
SearchProvider
Navigation system
Card system
Filter system
Entity system
Workflow system
State system
```

search the codebase for existing equivalents.

If an existing system exists:

```text
extend it
```

rather than:

```text
replace it
```

unless the existing architecture is clearly broken.

---

# 37. CATEGORY WORKFLOW AUTO-DISCOVERY

The agent should be able to inspect a category and determine:

```text
What entity does it expose?
What can the user do?
What information is required?
Does it require location?
Does it require date?
Does it require time?
Does it require participants?
Does it require cart?
Does it require payment?
Does it require delivery?
Does it require tracking?
Does it require booking?
Does it create an Activity item?
```

Then compose the appropriate workflow.

Example:

```text
Category: Experiences

Entity:
Experience

Capabilities:
view
book
pay
navigate

Requirements:
date
time
participants

Workflow:
ExperienceDetail
→ Availability
→ BookingOptions
→ Checkout
→ Confirmation
→ Activity
```

---

# 38. WORKFLOW DEFINITIONS

Where appropriate, create declarative workflow definitions.

Conceptually:

```typescript
WorkflowDefinition {
  id
  trigger
  steps
  requirements
  completionAction
  failureAction
}
```

Example:

```typescript
{
  id: "experience-booking",

  trigger: "experience.book",

  steps: [
    "experience-detail",
    "select-date",
    "select-time",
    "select-participants",
    "review",
    "checkout",
    "confirmation"
  ],

  completionAction: "create-activity"
}
```

Do not blindly copy this exact schema if the project already has a workflow engine.

Adapt to the existing architecture.

---

# 39. CATEGORY EXAMPLES

The architecture must be able to support categories such as:

### Food

```text
Discover
→ Restaurant
→ Menu
→ Item
→ Cart
→ Checkout
→ Order
→ Tracking
```

### Transport

```text
Discover
→ Transport type
→ Pickup
→ Destination
→ Options
→ Price
→ Confirm
→ Matching
→ Live tracking
→ Complete
```

### Shopping

```text
Discover
→ Merchant
→ Product
→ Variant
→ Cart
→ Delivery/Pickup
→ Checkout
→ Order
→ Tracking
```

### Wellness

```text
Discover
→ Provider
→ Service
→ Date
→ Time
→ Booking
→ Payment
→ Confirmation
```

### Beauty

```text
Discover
→ Provider
→ Service
→ Staff if applicable
→ Date
→ Time
→ Booking
→ Payment
```

### Experiences

```text
Discover
→ Experience
→ Date
→ Time
→ Participants
→ Availability
→ Checkout
→ Confirmation
```

### Vehicle Rental

```text
Discover
→ Vehicle
→ Dates
→ Pickup
→ Options
→ Quote
→ Checkout
→ Confirmation
```

### Flowers & Gifts

```text
Discover
→ Merchant
→ Product
→ Variant
→ Recipient
→ Delivery
→ Checkout
→ Tracking
```

These are examples of workflow patterns.

Use actual project/backend capabilities as the authoritative source.

---

# 40. DESIGN SYSTEM RULES

Follow NEXG's established design laws:

```text
Attention
→ Direction
→ Memory
→ Action
```

Supporting principles:

```text
Jakob's Law
Hick's Law
Fitts's Law
Miller's Law
Tesler's Law
```

Especially:

> Complexity that cannot be removed should be handled by NEXG rather than pushed onto the user.

This is critical for Explore.

The consumer should not need to understand NEXG's backend complexity.

---

# 41. PROGRESSIVE DISCLOSURE

Do not show every possible option immediately.

Use:

```text
Primary
    ↓
Secondary
    ↓
Advanced
```

For example:

```text
Food
```

first.

Then:

```text
Restaurants
Cafes
Delivery
Takeaway
```

Then filters.

Then advanced filtering only when requested.

Do not overwhelm the consumer.

---

# 42. TOUCH + INTERACTION

Every interactive element must have:

```text
minimum comfortable touch target
pressed state
loading state where relevant
disabled state
accessibility label
haptic opportunity where appropriate
```

Gestures should never be required when an accessible alternative is needed.

---

# 43. MOTION

Motion should communicate:

```text
continuity
hierarchy
cause → effect
state change
feedback
focus
```

Do not animate everything.

Use the existing NEXG motion system.

The NEXG design system explicitly treats motion as purposeful rather than decoration. `Branch · UX Design Laws.txt`

---

# 44. PERFORMANCE

Explore may contain many images and horizontal rails.

Optimize:

```text
image loading
virtualized lists
horizontal lists
lazy sections
pagination
caching
prefetching
API calls
location updates
map rendering
```

Priority content should load first.

Below-the-fold content can be deferred.

This follows the existing NEXG performance architecture where priority widgets load before secondary and below-the-fold content. `Branch · UX Design Laws.txt`

---

# 45. ACCESSIBILITY

Implement:

```text
screen-reader labels
semantic roles
dynamic text
contrast
touch targets
reduced motion
focus behavior
error announcements
accessible images
```

Do not treat accessibility as a later patch.

It is part of the component architecture.

---

# 46. LIGHT MODE

The provided visual is dark mode.

Do not hardcode dark colors.

Use semantic tokens:

```text
surface.primary
surface.secondary
surface.elevated

text.primary
text.secondary
text.tertiary

accent.primary

border.subtle
```

The same Explore architecture must support:

```text
Dark
Light
System
```

without duplicating components.

---

# 47. RESPONSIVENESS

The current target is mobile.

Still ensure the architecture does not assume one exact device width.

Support:

```text
small phone
standard phone
large phone
tablet where applicable
```

Use responsive layout primitives rather than fixed coordinates.

---

# 48. DATA / API

Do not fabricate permanent production data.

If APIs are not ready:

- use the project's existing mock/data layer
- clearly isolate fixtures
- make the data shape match the intended backend contract
- make replacement with real API data straightforward

Do not bury fake data inside UI components.

---

# 49. ANALYTICS

Instrument important Explore interactions.

At minimum architect events for:

```text
explore_opened
category_selected
subcategory_selected
search_started
search_submitted
filter_opened
filter_applied
map_opened
entity_viewed
favorite_added
favorite_removed
collection_opened
primary_action_clicked
workflow_started
workflow_completed
workflow_failed
```

Do not collect unnecessary sensitive information.

---

# 50. ERROR OBSERVABILITY

Important failures must be observable.

Examples:

```text
discovery_load_failed
search_failed
location_failed
entity_load_failed
workflow_failed
checkout_failed
```

The system should provide enough information to understand:

```text
what failed
where
when
how frequently
```

without leaking sensitive information.

---

# 51. TESTING

Create tests for:

### Explore rendering

```text
categories render
sections render
location renders
search renders
```

### Category behavior

```text
category selection
subcategory selection
dynamic category configuration
```

### Discovery

```text
loading
success
empty
error
offline
```

### Workflow

At least test representative patterns:

```text
order workflow
booking workflow
transport workflow
service workflow
```

### Navigation

Verify:

```text
Explore → Detail
Explore → Workflow
Workflow → Confirmation
Confirmation → Activity
```

### Regression

Existing:

```text
Home
Activity
Account
```

must continue to work.

---

# 52. VISUAL QA

Compare implementation against the provided reference.

Check:

```text
Typography
Spacing
Alignment
Iconography
Color
Contrast
Radius
Elevation
Blur
Image treatment
Motion
Navigation
```

Then check:

```text
Dark mode
Light mode
Small phone
Large phone
```

Do not simply make it "look similar."

Make it feel like the same NEXG design system.

---

# 53. DO NOT OVERFIT TO THE REFERENCE

The reference represents one state:

```text
Explore
```

It does NOT define every possible state.

Do not hardcode:

```text
Mama Oliech Grill
Java House Westlands
Serenity Spa
Skyline Cinema IMAX
Blankets & Wine Live
```

as permanent content.

Those are representative visual data.

The real system must render whatever the backend returns.

---

# 54. IMPORTANT ARCHITECTURAL PRINCIPLE

The UI should be:

```text
Registry
   ↓
Configuration
   ↓
Data
   ↓
Components
   ↓
Workflow
   ↓
Rendered Experience
```

NOT:

```text
Generated screen
   ↓
Hardcoded data
   ↓
Hardcoded navigation
   ↓
Hardcoded workflow
```

The registry/configuration remains authoritative.

The visual screen is only a representation of that system.

---

# 55. DELIVERABLES

When finished, the implementation should include:

### Explore

```text
Explore screen
Search
Category rail
Dynamic sections
Nearby
Collections
Experiences
Filters
Map entry
```

### Dynamic category engine

```text
Category registry integration
Subcategory support
Category configuration
Capability detection
Dynamic filters
Dynamic layouts
```

### Entity system

```text
Merchant
Service
Product
Experience
Transport
etc.
```

### Workflow system

```text
Browse
View
Order
Book
Reserve
Schedule
Quote
Track
Pay
```

### State system

```text
loading
ready
empty
error
offline
updating
success
```

### Integration

```text
Activity
Checkout
Payments
Navigation
Location
Analytics
```

---

# 56. IMPLEMENTATION PRIORITY

Work in this order:

```text
1. Inspect existing architecture

2. Identify reusable components

3. Identify existing category/entity models

4. Identify navigation architecture

5. Identify design tokens

6. Build/extend Explore data model

7. Build Explore shell

8. Build dynamic category rail

9. Build discovery sections

10. Build entity cards

11. Build category discovery

12. Build entity detail framework

13. Build capability/action system

14. Connect workflow engine

15. Connect Activity

16. Connect checkout/payment where available

17. Add states

18. Add offline behavior

19. Add analytics

20. Test

21. Visual QA

22. Refactor

23. Document
```

Do not prematurely polish visual details before the architecture is correct.

---

# 57. AUTONOMOUS DECISION RULE

When you encounter a new category, do NOT ask:

> "Which screen should I build for this category?"

Instead ask:

> "What entity does this category expose, what capabilities does it provide, what information does it require, and which reusable workflow primitives can compose its experience?"

Then implement the smallest reusable abstraction capable of supporting it.

---

# 58. FINAL SUCCESS CRITERION

I should be able to add a new category through the category/data configuration and have Explore automatically understand:

```text
its icon
its name
its subcategories
its discovery layout
its entities
its filters
its ranking
its available actions
its workflow
its required inputs
its checkout requirements
its Activity representation
```

without rewriting the Explore screen.

For example, if tomorrow we add:

```text
Automotive
```

the system should be able to support:

```text
Car Wash
Auto Repair
Tyres
Parts
Detailing
Roadside Assistance
```

through configuration and reusable workflow primitives.

If adding Automotive requires creating an entirely new Explore architecture, the implementation has failed.

---

# 59. FINAL PRODUCT PHILOSOPHY

Do not build:

> "An Explore screen."

Build:

> **"The NEXG Consumer Discovery Engine."**

The visible screen is only its first expression.

The deeper architecture must allow:

```text
ONE EXPLORE ENGINE
        │
        ├── Food
        ├── Transport
        ├── Shopping
        ├── Wellness
        ├── Beauty
        ├── Experiences
        ├── Vehicle Rental
        ├── Flowers & Gifts
        ├── Financial Services
        ├── Airport Transfers
        ├── Alcohol & Beverages
        ├── Fashion & Apparel
        └── FUTURE CATEGORIES
```

while maintaining:

```text
ONE DESIGN LANGUAGE
ONE ENTITY SYSTEM
ONE STATE SYSTEM
ONE WORKFLOW MODEL
ONE NAVIGATION MODEL
ONE CHECKOUT SYSTEM
ONE ACTIVITY MODEL
ONE ANALYTICS MODEL
```

The user's experience should remain simple even when NEXG's underlying system becomes extremely complex.

That is the goal.

**Build the system, not just the screen.**

## Prompt:
8/25/2026, 9:17:52 AM

![64739645-BD4C-4629-9267-6CD0DEED3DF9.jpeg](https://chatgpt.com/backend-api/estuary/content?id=file_000000001ddc82108232704de3a78abf&fn=64739645-BD4C-4629-9267-6CD0DEED3DF9.jpeg&cd=attachment&ts=496959&p=fs&cid=1&sig=f7a4bd742dbc6be5db78eaab8f6a7f18f4022b35e58a5db62533a23c5366d4ae&v=0)

My Home Screen

## Response:
8/25/2026, 9:18:23 AM

Yes - **this changes the picture quite a bit**, because now we have the actual **Home + Services/Explore** pair rather than designing them independently.

Your current Home screen is already doing the right job: it is **contextual and action-oriented**, while the Services screen is **discovery-oriented**.

### What I see in your current Home

Your Home is essentially:

```text
HOME
│
├── Context / Location
│   └── Wood Ave, Kilimani, Nairobi
│
├── Notifications
│
├── Universal Search
│
├── Quick Services
│   ├── Restaurants & Food
│   ├── Groceries & Essentials
│   ├── Pharmacy
│   └── Laundry & Cleaning
│
├── Featured / Recommended
│   └── Merchant / experience
│
├── Promotions
│
├── Active Now
│
├── Around You
│
└── Bottom Navigation
    ├── Home
    ├── Services
    ├── Activity
    └── Account
```

That's actually a **stronger structure than a conventional "Home" screen** because Home is already answering:

> **"What's relevant to me right now?"**

while Services answers:

> **"What can I discover or do?"**

### So I would now lock the four Consumer surfaces as:

**1. Home**  
Context, recommendations, active things, promotions, quick access.

**2. Services / Explore**  
Discovery of everything NEXG can provide.

**3. Activity**  
Orders, bookings, rides, reservations, requests, ongoing journeys.

**4. Account**  
Identity, wallet/payment, saved items, preferences, support and settings.

I would **keep the visible name "Services" for now** if that is what your current product already uses. Internally, though, I would call the architecture **Explore/Discovery** because it will eventually cover more than traditional "services."

---

## The really important relationship between Home and Services

Don't duplicate content between them.

For example:

### Home

```text
"Restaurants & Food"
        ↓
quick entry
        ↓
Services → Food
```

### Services

```text
Food
   ↓
Restaurants
   ↓
Discover
   ↓
Mama Oliech Grill
   ↓
Menu
   ↓
Order
```

So Home **initiates intent**, while Services **handles discovery**.

Similarly:

```text
HOME

"Featured tonight"
        ↓
Experience
        ↓
Services/Explore
        ↓
Experience detail
        ↓
Book
```

And:

```text
HOME

"Active now"
        ↓
Current booking/order
        ↓
Activity
        ↓
Live workspace
```

That's the architecture I would build around.

---

### One thing I particularly like in your Home

**"Active now"**.

I would make that a first-class NEXG concept rather than treating it as another card.

It becomes:

```text
                    NEXG
                     │
              What matters now?
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
     Discover      Active       Upcoming
        │            │            │
     Services      Activity      Activity
```

That's much more aligned with your NEXG thesis than making Home essentially a marketplace.

Your uploaded design-system document also reinforces this direction: widgets are supposed to be **living surfaces with states**, and the system should handle complexity rather than forcing users to navigate it themselves. `Branch · UX Design Laws.txt`

So with these two screens now established, **I would not redesign Home from scratch**. I would build the rest of the Consumer app around this existing Home language and make the Services/Explore screen its discovery counterpart.

## Prompt:
8/25/2026, 9:19:31 AM

Single prompt for both

## Response:
8/25/2026, 9:19:35 AM

Yes. I’d give the agent **one master prompt** that treats Home + Services as one connected Consumer experience, rather than two independent screens.

**document: **

# NEXG CONSUMER APP — HOME + SERVICES
## Master Autonomous Implementation Prompt

You are the primary implementation agent for the **NEXG Consumer/User App**.

Your task is to build and refine the **Home + Services experience as one coherent NEXG Consumer system**.

Two visual references are provided:

1. **Current NEXG Home screen**
2. **Current NEXG Services screen / target Services direction**

Treat these as the current product foundation and visual source of truth for the Consumer experience.

Do not build two isolated screens.

Build the system connecting:

```text
HOME
  ↓
SERVICES / EXPLORE
  ↓
DISCOVERY
  ↓
ENTITY
  ↓
WORKFLOW
  ↓
CONFIRMATION
  ↓
ACTIVITY
```

The goal is to make the Consumer app feel like a single intelligent operating surface rather than a collection of unrelated pages.

---

# 1. CONSUMER APP PRIMARY NAVIGATION

The Consumer app has exactly four primary navigation surfaces:

```text
Home
Services
Activity
Account
```

Bottom navigation:

```text
┌─────────────────────────────────────┐
│ Home │ Services │ Activity │ Account│
└─────────────────────────────────────┘
```

Do not add additional primary tabs for:

- Food
- Transport
- Shopping
- Experiences
- Wellness
- Beauty
- etc.

Those belong inside **Services**.

The four tabs represent the user's mental model.

---

# 2. CORE PRODUCT DISTINCTION

The most important architectural distinction is:

## HOME

Answers:

> **"What matters to me right now?"**

## SERVICES

Answers:

> **"What can I discover or do?"**

## ACTIVITY

Answers:

> **"What is happening with me?"**

## ACCOUNT

Answers:

> **"Who am I and how do I manage NEXG?"**

Do not duplicate the responsibilities of these surfaces.

---

# 3. NEXG HOME

The current Home screen already establishes the intended direction.

Preserve and improve its structure.

The Home screen should be contextual, personalized and action-oriented.

Conceptually:

```text
HOME
│
├── Location / Context
├── Notifications
├── Universal Search
├── Quick Services
├── Featured / Recommended
├── Promotions
├── Active Now
├── Around You
└── Bottom Navigation
```

---

# 4. HOME HEADER

Current visual direction:

```text
📍 Wood Ave, Kilimani, Nairobi        🔔
```

Implement:

- current/selected location
- location selector
- notification entry
- notification badge when appropriate
- appropriate loading/error states

Location must not be hardcoded.

The location system should support:

```text
GPS location
selected location
saved location
property location
last known location
location unavailable
permission required
```

If location is unavailable, Home must still function.

---

# 5. HOME SEARCH

Use the existing visual language.

Search should support natural discovery across NEXG.

Example placeholder:

```text
Search food, spa, rides, events...
```

The exact copy can adapt to the product configuration.

Search must eventually understand:

```text
merchants
services
products
experiences
transport
locations
properties
categories
subcategories
```

Examples:

```text
pizza
massage
airport transfer
things to do tonight
coffee near me
laundry
car rental
```

The search architecture must be reusable by Services.

Do not create two separate search systems.

---

# 6. HOME QUICK SERVICES

The current Home contains quick-service cards such as:

```text
Restaurants & Food
Groceries & Essentials
Pharmacy
Laundry & Cleaning
```

Keep this concept.

However:

**Do not hardcode these cards inside the Home component.**

They should come from the NEXG category/service registry.

Conceptually:

```typescript
QuickService {
  categoryId
  title
  subtitle
  icon
  image
  color
  priority
  enabled
}
```

The UI renders whatever is configured.

Selecting a quick service should transition into Services with the correct category already selected.

Example:

```text
Home
→ Restaurants & Food
→ Services
→ Food discovery
```

not:

```text
Home
→ completely separate Food screen
```

---

# 7. HOME FEATURED CONTENT

The current Home has a large featured merchant/experience card.

Preserve this pattern.

It should support:

```text
image
badge
availability
title
rating
reviews
distance
duration
price
primary action
```

Example:

```text
Featured tonight

Mama Oliech Grill

4.7
2,311 reviews
1.8 km
25–40 min
from KSh 500

Explore →
```

But the content must be dynamic.

Do not permanently hardcode:

```text
Mama Oliech Grill
```

The backend/ranking system determines the featured entity.

---

# 8. FEATURED CARD ACTION

The action should depend on the entity.

Examples:

```text
Restaurant → Explore / View menu
Experience → Explore / Book
Transport → Get ride
Service → Book / Request
Product → Shop / View
```

The UI must derive the primary action from the entity's capabilities.

Do not make every card say "Explore."

---

# 9. HOME PROMOTIONS

Current Home has a promotional card:

```text
10% off your next booking
Spa, salon and experiences this week
NEXG10
```

Keep promotional content as a reusable promotional component.

It must support:

```text
promotion
title
description
code
expiry
eligibility
CTA
image/background where appropriate
```

Promotions must be data-driven.

Do not hardcode coupon codes.

---

# 10. HOME ACTIVE NOW

This is one of the most important NEXG concepts.

Treat **Active Now** as a first-class contextual system.

It represents things currently happening for the user.

Examples:

```text
Ride
Order
Booking
Reservation
Delivery
Service request
Hotel request
Experience
```

Example:

```text
Active now

Hemingways Spa
Confirmed
4:30 PM
```

Another user might see:

```text
Active now

Your driver is arriving
4 min away
Track ride →
```

Another:

```text
Active now

Your order is being prepared
Estimated 18 min
Track order →
```

The Home screen should dynamically surface relevant active entities.

Do not create separate Home logic for every activity type.

Use a common Activity/Active-Entity model.

---

# 11. HOME AROUND YOU

Home may include contextual discovery:

```text
Around you · this morning
```

This should use:

```text
location
time
day
availability
personalization
current context
```

Examples:

Morning:

```text
Breakfast
Coffee
Transport
```

Evening:

```text
Dinner
Events
Experiences
Nightlife
```

Weekend:

```text
Experiences
Activities
Shopping
Wellness
```

Do not hardcode these rules directly into UI components.

Use a ranking/context layer.

---

# 12. HOME RESPONSIBILITY

Home should prioritize:

```text
NOW
NEXT
RELEVANT
NEARBY
PERSONALIZED
```

It should NOT attempt to show the entire NEXG marketplace.

If the user wants broad discovery:

```text
Home
→ Services
```

---

# 13. NEXG SERVICES

Services is the **Consumer discovery engine**.

Its job is:

> **Help the user discover anything NEXG can provide and enter the appropriate workflow.**

The Services screen should follow the provided visual direction.

Conceptually:

```text
SERVICES
│
├── Header
├── Search
├── Categories
├── Filters
├── Near You
├── Collections
├── Experiences
├── Recommendations
└── Bottom Navigation
```

---

# 14. SERVICES HEADER

Use:

```text
Services
```

with:

```text
Map
```

as the contextual shortcut.

The screen can use supporting copy such as:

```text
Discover places, services & experiences around you
```

Do not overpopulate the header.

The user should immediately understand:

> this is where I discover things.

---

# 15. SERVICES SEARCH

Reuse the global search system.

Do not implement a second search architecture.

Search should return:

```text
categories
merchants
services
products
experiences
locations
```

Search can eventually support natural language.

---

# 16. SERVICES CATEGORY RAIL

The Services screen should display dynamic categories.

Example:

```text
Food
Transport
Shopping
Wellness
Experiences
More
```

The actual categories must come from the category registry.

The component must not assume a fixed number of categories.

If categories change, the UI should adapt automatically.

---

# 17. CATEGORY REGISTRY

Before implementation, inspect the existing repository for the authoritative category system.

Do NOT create another category registry if one already exists.

If an existing registry exists:

```text
reuse it
extend it
```

If one does not exist, establish one cleanly.

Conceptually:

```typescript
Category {
  id
  name
  slug
  icon
  image
  description
  enabled
  sortOrder
  subcategories
  capabilities
  discoveryConfig
  filterConfig
  workflowConfig
}
```

The exact schema must follow the existing project architecture.

---

# 18. CATEGORY EXPLORATION

When a user selects:

```text
Food
```

the Services system should understand:

```text
Food
├── Restaurants
├── Cafes
├── Fast Food
├── Delivery
├── Takeaway
└── other configured subcategories
```

When selecting:

```text
Wellness
```

it may understand:

```text
Spas
Massage
Fitness
Recovery
etc.
```

The exact subcategories must come from authoritative NEXG data.

Do not invent permanent categories in the UI.

---

# 19. DYNAMIC CATEGORY ENGINE

This is a critical requirement.

The agent must implement Services so categories are **configuration-driven**.

A category should define:

```text
entity type
discovery layout
filters
sorting
available actions
workflow
required inputs
location requirements
date requirements
time requirements
payment requirements
```

For example:

```text
Food

Entity:
Merchant / Product

Capabilities:
browse
order
reserve

Workflow:
Merchant
→ Menu
→ Item
→ Cart
→ Checkout
→ Order
→ Tracking
```

---

# 20. CAPABILITY-BASED ARCHITECTURE

Do NOT make the system depend entirely on category names.

Instead use capabilities.

Example:

```text
browse
view
order
book
reserve
schedule
quote
request
track
pay
deliver
pickup
navigate
message
call
```

A category/entity declares its capabilities.

The UI and workflow engine use those capabilities.

This allows new categories to reuse existing workflows.

---

# 21. AUTONOMOUS WORKFLOW GENERATION

The implementation agent must be able to encounter a new category and reason:

```text
What does this category expose?

What entity is being discovered?

What can the user do?

What information must be collected?

Does it require location?

Does it require date?

Does it require time?

Does it require participants?

Does it require a cart?

Does it require payment?

Does it create an order?

Does it create a booking?

Does it require tracking?
```

Then compose the appropriate existing workflow primitives.

Do not create bespoke screens unnecessarily.

---

# 22. EXAMPLE: FOOD

```text
Services
→ Food
→ Restaurant
→ Menu
→ Product
→ Cart
→ Checkout
→ Payment
→ Order confirmation
→ Activity
→ Live tracking
```

---

# 23. EXAMPLE: TRANSPORT

```text
Services
→ Transport
→ Transport type
→ Pickup
→ Destination
→ Options
→ Price
→ Confirmation
→ Matching
→ Live trip
→ Completion
→ Activity
```

---

# 24. EXAMPLE: WELLNESS

```text
Services
→ Wellness
→ Provider
→ Service
→ Date
→ Time
→ Booking
→ Payment
→ Confirmation
→ Activity
```

---

# 25. EXAMPLE: EXPERIENCES

```text
Services
→ Experiences
→ Experience
→ Date
→ Time
→ Participants
→ Availability
→ Checkout
→ Confirmation
→ Activity
```

---

# 26. EXAMPLE: SHOPPING

```text
Services
→ Shopping
→ Merchant
→ Product
→ Variant
→ Quantity
→ Cart
→ Delivery/Pickup
→ Checkout
→ Order
→ Tracking
→ Activity
```

---

# 27. EXAMPLE: VEHICLE RENTAL

```text
Services
→ Vehicle Rental
→ Vehicle
→ Dates
→ Pickup location
→ Options
→ Quote
→ Checkout
→ Confirmation
→ Activity
```

These are workflow patterns, not hardcoded screens.

---

# 28. ENTITY DETAIL SYSTEM

Build one reusable entity-detail architecture.

It should support:

```text
Merchant
Service
Product
Experience
Vehicle
Property
Transport option
```

Possible sections:

```text
Hero
Title
Description
Gallery
Rating
Price
Location
Availability
Options
Related items
Reviews
Primary action
```

Only render sections relevant to the entity.

---

# 29. PRIMARY ACTIONS

Actions must be contextual.

Examples:

```text
Restaurant
→ View menu

Food merchant
→ Order now

Experience
→ Book now

Spa
→ Book appointment

Transport
→ Get ride

Vehicle
→ Rent now

Product
→ Add to cart

Service
→ Request service
```

Do not use one generic CTA everywhere.

---

# 30. DISCOVERY CARDS

Create reusable NEXG discovery-card primitives.

Support:

```text
image
badge
favorite
title
category
rating
distance
duration
price
availability
CTA
```

But make fields optional.

Do not create a separate hardcoded card for every category.

---

# 31. NEAR YOU

Services should support:

```text
Near you
📍 Westlands, Nairobi
See map →
```

Results should consider:

```text
location
distance
availability
quality
personalization
category
```

Cards should be horizontally scrollable where appropriate.

---

# 32. COLLECTIONS

Support dynamic collections such as:

```text
Date Night
Quick Bites
Weekend Vibes
Wellness Picks
```

Collections must be configuration/data-driven.

Conceptually:

```typescript
Collection {
  id
  title
  subtitle
  image
  query
  category
  filters
  ranking
}
```

Selecting a collection opens a discovery result generated from its configuration.

---

# 33. EXPERIENCES

Support sections such as:

```text
Starting soon
Popular experiences
Tonight
This weekend
```

These should be generated from actual availability/date/time data.

Do not hardcode event names.

---

# 34. MAP

The Services map button opens map-based discovery.

Map should use the same entities as list discovery.

Do not create a separate map entity model.

```text
List entity
↕
Map entity
↕
Entity detail
```

Selecting a marker opens the same detail experience.

---

# 35. FILTER SYSTEM

Filters must be category-aware.

Examples:

Food:

```text
Cuisine
Price
Rating
Open now
Delivery
Pickup
Distance
```

Experiences:

```text
Date
Time
Price
Duration
Availability
Location
```

Transport:

```text
Vehicle
Price
Pickup
Destination
Time
```

Do not display irrelevant filters.

---

# 36. HOME → SERVICES HANDOFF

This interaction is extremely important.

If the user taps:

```text
Restaurants & Food
```

on Home:

```text
Home
↓
Services
↓
Food selected
↓
Food discovery
```

Services should open already configured to the requested context.

Likewise:

```text
Home
→ Featured experience
→ Experience detail
```

or:

```text
Home
→ Active booking
→ Activity
→ Booking workspace
```

Avoid unnecessary intermediate screens.

---

# 37. SERVICES → ACTIVITY HANDOFF

Any transactional action launched from Services must create the appropriate Activity entity.

Examples:

```text
Order
Booking
Ride
Reservation
Delivery
Service request
```

Flow:

```text
Services
→ Workflow
→ Confirmation
→ Activity
```

Activity becomes the user's persistent record of what happened.

---

# 38. SHARED GLOBAL SYSTEMS

Home and Services must share:

```text
Search
Location
Categories
Entities
Favorites
Notifications
Design tokens
Navigation
State system
Analytics
Workflow engine
Checkout
Payment
Activity
```

Do not implement duplicated systems.

---

# 39. STATE ARCHITECTURE

Every screen/section/component must support appropriate states.

Minimum:

```text
idle
loading
ready
empty
error
offline
stale
updating
```

Transactional actions:

```text
idle
processing
success
failed
```

Discovery:

```text
available
closed
unavailable
sold_out
booking_required
```

Design these intentionally.

Do not allow state behavior to emerge accidentally.

---

# 40. OFFLINE EXPERIENCE

NEXG must work gracefully under poor connectivity.

Support:

```text
online
slow
offline
reconnecting
syncing
```

Where possible:

- show cached content
- show stale indicators
- avoid blank screens
- disable only actions requiring connectivity
- restore state after reconnection

---

# 41. LOADING EXPERIENCE

Do not block the entire Home or Services screen while every section loads.

Prioritize:

```text
Header
Search
Primary categories
Primary contextual content
```

Then load:

```text
secondary sections
below-the-fold content
```

This follows the NEXG principle of priority loading rather than making the whole screen wait for every widget.

---

# 42. PERSONALIZATION

Architect both Home and Services to eventually use:

```text
location
time
day
history
favorites
past orders
bookings
current property
current journey
preferences
availability
distance
price
merchant quality
popularity
```

Home should be more personalized.

Services should be more discovery-oriented.

---

# 43. HOME VS SERVICES CONTENT RULE

Use this rule:

### Home

```text
"What should I see right now?"
```

### Services

```text
"What can I find?"
```

Therefore:

Do not fill Home with every category.

Do not fill Services with excessive personal activity.

Keep their responsibilities distinct.

---

# 44. VISUAL LANGUAGE

Use the provided screenshots as the visual baseline.

Maintain:

```text
Dark-first aesthetic
Large rounded corners
White primary typography
Grey secondary typography
NEXG green accent
Soft elevated surfaces
Progressive blur where appropriate
Large touch targets
Horizontal content rails
Strong imagery
Minimal clutter
```

Do not introduce unrelated visual styles.

---

# 45. TYPOGRAPHY

Preserve the existing NEXG typography hierarchy.

Important:

```text
Screen title
Section title
Entity title
Primary information
Secondary metadata
Tertiary metadata
```

Attention should be immediately clear.

Do not make every piece of information equally prominent.

---

# 46. COLOR

Use semantic design tokens.

Do not hardcode arbitrary colours inside components.

Support:

```text
Light
Dark
System
```

The dark screenshots are the primary visual reference.

---

# 47. MOTION

Use motion to communicate:

```text
navigation
continuity
state change
focus
cause → effect
feedback
```

Examples:

```text
Home category tap
→ Services transition

Card tap
→ Entity expansion/navigation

Booking
→ processing
→ confirmation

Activity
→ live status updates
```

Do not animate purely for decoration.

---

# 48. ACCESSIBILITY

All shared components must support:

```text
screen readers
semantic labels
dynamic text
contrast
touch targets
reduced motion
focus
error communication
accessible images
```

Do not treat accessibility as a later phase.

---

# 49. RESPONSIVE BEHAVIOR

Primary target:

```text
mobile
```

But do not assume one fixed screen size.

Support:

```text
small phone
standard phone
large phone
tablet where appropriate
```

Avoid fixed pixel positioning.

---

# 50. DATA ARCHITECTURE

Before implementation, inspect the existing backend/API/data layer.

Reuse existing:

```text
categories
merchants
services
products
experiences
orders
bookings
users
locations
payments
activity
```

Do not create fake parallel models.

If APIs are incomplete:

- use the existing mock/data architecture
- keep fixtures isolated
- make the schema compatible with intended APIs
- make replacement with live data straightforward

---

# 51. AUTONOMOUS REPOSITORY ANALYSIS

Before writing significant code, inspect:

```text
package.json
app structure
routing
navigation
components
design tokens
theme
state management
API layer
models
types
existing Home
existing Services
Activity
Account
authentication
location
payment
```

Find reusable components before creating new ones.

---

# 52. DO NOT DUPLICATE ARCHITECTURE

Before creating a new:

```text
search system
category system
entity system
card system
filter system
navigation system
workflow engine
state system
checkout
activity model
```

search the repository.

If an equivalent exists:

```text
reuse
extend
refactor if necessary
```

Do not build competing implementations.

---

# 53. AUTONOMOUS CATEGORY RULE

When a new category appears, do NOT ask:

> "What new screen do I need?"

Ask:

```text
What entity does this category expose?

What capabilities does it have?

What inputs are required?

What existing workflow matches those capabilities?

What existing components can render it?

What new primitive, if any, is genuinely necessary?
```

Only introduce a new component/workflow primitive when existing abstractions genuinely cannot express the experience.

---

# 54. EXAMPLE FUTURE CATEGORY

If NEXG adds:

```text
Automotive
```

with:

```text
Car Wash
Auto Repair
Tyres
Parts
Detailing
Roadside Assistance
```

the system should be capable of supporting it through configuration and reusable primitives.

The Explore/Home architecture should not need to be rebuilt.

---

# 55. ANALYTICS

Instrument both surfaces.

At minimum:

```text
home_opened
services_opened
search_started
search_submitted
category_selected
subcategory_selected
quick_service_selected
featured_selected
collection_opened
map_opened
filter_opened
filter_applied
entity_viewed
favorite_added
favorite_removed
primary_action_clicked
workflow_started
workflow_completed
workflow_failed
```

Also measure:

```text
time_to_first_action
time_to_complete
search usage
category usage
conversion
abandonment
error rate
```

---

# 56. ERROR OBSERVABILITY

Important failures must be observable:

```text
location_failed
search_failed
discovery_failed
entity_load_failed
workflow_failed
checkout_failed
payment_failed
```

Capture enough context to understand:

```text
what
where
when
frequency
```

without exposing sensitive information.

---

# 57. PERFORMANCE

Optimize:

```text
startup
Home rendering
Services rendering
image loading
horizontal lists
virtualized lists
location updates
API requests
caching
map rendering
animations
```

Do not load every Home/Services section simultaneously.

---

# 58. TESTING

Test:

### Home

```text
location
search
quick services
featured
promotion
active now
nearby
navigation
```

### Services

```text
category selection
subcategory selection
search
filters
nearby
collections
experiences
map
```

### Cross-surface

```text
Home → Services
Home → Activity
Services → Detail
Services → Workflow
Workflow → Activity
```

### States

```text
loading
empty
error
offline
updating
success
```

### Regression

Verify:

```text
Activity
Account
authentication
```

continue working.

---

# 59. VISUAL QA

Compare the implementation to both supplied screenshots.

Audit:

```text
Typography
Spacing
Alignment
Iconography
Color
Contrast
Radius
Elevation
Blur
Imagery
Navigation
```

Then test:

```text
Dark mode
Light mode
Small phone
Large phone
Slow network
Offline
```

The goal is not pixel-copying.

The goal is to reproduce the **NEXG visual and interaction language**.

---

# 60. MOST IMPORTANT ARCHITECTURAL RULE

The system of record must remain:

```text
NEXG EXPERIENCE REGISTRY
        ↓
PLATFORM ALLOCATION
        ↓
EXPERIENCE REPRESENTATION
        ↓
COMPONENT / DATA SPECIFICATION
        ↓
INTERACTION + STATE
        ↓
SCREEN COMPOSITION
        ↓
VISUAL REPRESENTATION
```

The screenshot is a visual reference.

It is NOT the source of truth.

Do not let generated UI determine the underlying product architecture.

---

# 61. FINAL ARCHITECTURE

The Consumer experience should ultimately look conceptually like:

```text
                         NEXG CONSUMER
                              │
             ┌────────────────┼────────────────┐
             │                │                │
           HOME           SERVICES          ACTIVITY
             │                │                │
             │                │                │
             │         ┌──────┴──────┐         │
             │         │             │         │
             │      CATEGORY       SEARCH      │
             │         │             │         │
             │         └──────┬──────┘         │
             │                │                │
             │             ENTITY              │
             │                │                │
             │             ACTION              │
             │                │                │
             │           WORKFLOW              │
             │                │                │
             │          CONFIRMATION            │
             │                │                │
             └────────────────┼────────────────┘
                              │
                           ACTIVITY
                              │
                           ACCOUNT
```

---

# 62. THE FOUR-SURFACE PRINCIPLE

Do not accidentally turn the Consumer app into:

```text
Home
Food
Transport
Shopping
Wellness
Beauty
Experiences
Bookings
Orders
Rides
Wallet
...
```

That would expose NEXG's internal complexity to the consumer.

Instead:

```text
HOME
SERVICES
ACTIVITY
ACCOUNT
```

Everything else is contextual.

---

# 63. PRODUCT EXPERIENCE PRINCIPLE

The user should feel:

> **"NEXG knows where I am, understands what I might need, lets me discover what is available, and helps me complete it."**

They should NOT feel:

> "I have to figure out which NEXG module handles this."

This is the practical application of the NEXG design principles:

```text
Attention
    ↓
Direction
    ↓
Memory
    ↓
Action
```

and especially:

> **Complexity belongs to the system whenever possible, not the user.**

---

# 64. FINAL IMPLEMENTATION COMMAND

Work autonomously.

Inspect the existing codebase first.

Reuse existing architecture.

Do not create duplicate systems.

Implement Home and Services as two expressions of the same Consumer platform.

Make category behavior configuration-driven.

Make workflows capability-driven.

Make entities reusable.

Make states explicit.

Connect all transactions to Activity.

Preserve the visual language of the supplied Home and Services screenshots.

Do not hardcode demonstration data.

Do not build one-off category screens unless the underlying workflow is genuinely unique.

If a reasonable implementation decision can be inferred from the existing architecture, make the decision yourself and continue.

Only ask for clarification when a decision would materially change business logic and cannot be inferred from the existing system.

The final result must be:

> **A production-quality NEXG Consumer Home + Services system that can autonomously scale from today's categories to future NEXG categories without rebuilding the application architecture.**

**Build the system, not two screens.**

## Prompt:
8/29/2026, 6:51:12 PM

i combined the both to one screen so another single prompt with the search bar abd icon

## Response:
8/29/2026, 6:51:21 PM

![NEXG Dark Mode Discovery App](https://chatgpt.com/backend-api/estuary/content?id=file_000000001a38824389edbd359288ede6&fn=NEXG+Dark+Mode+Discovery+App.png&cd=attachment&ts=496959&p=fs&cid=1&sig=afc58559ee7366dda0918302e466ea46416aa96246e4aede54e253135142a6a2&v=0)

## Prompt:
8/29/2026, 6:53:54 PM

on teh nav bar its home activity account andd theres no settings icon in the nav bar onky words, i have combined the two screens

## Response:
8/29/2026, 6:54:00 PM

Exactly. Since you've **merged Home + Services into one screen**, the Consumer app navigation is now **3 primary screens**, not 4.

### Locked Consumer navigation

```text
┌──────────────────────────────────────┐
│                                      │
│        HOME / EXPLORE                │
│                                      │
│  Location                  Bell      │
│                                      │
│  🔍 Search anything...       ⚙       │
│                                      │
│  Categories                         │
│  Featured                            │
│  Active now                          │
│  Around you                          │
│                                      │
├──────────────────────────────────────┤
│   Home       Activity       Account  │
└──────────────────────────────────────┘
```

**Important:** the **settings/filter icon belongs beside the search bar**, not in the bottom navigation.

Bottom navigation is strictly:

- **Home**
- **Activity**
- **Account**

No Services tab.  
No Settings tab.  
No grid/settings icon in the bottom bar.

---

## Single prompt for your agent

```text
NEXG CONSUMER APP — HOME / EXPLORE UNIFIED SCREEN

You are implementing the primary NEXG Consumer/User App experience.

IMPORTANT ARCHITECTURAL CHANGE:

HOME and SERVICES/EXPLORE HAVE BEEN MERGED INTO ONE SINGLE PRIMARY SCREEN.

There are now EXACTLY THREE bottom-navigation destinations:

1. Home
2. Activity
3. Account

DO NOT create a Services tab.

DO NOT create a Settings tab.

DO NOT put a settings/grid/filter icon in the bottom navigation.

The bottom navigation contains ONLY the three words/icons:

Home
Activity
Account

Settings and filtering are accessed contextually from the search/discovery area or Account.

--------------------------------------------------
1. PRIMARY SCREEN
--------------------------------------------------

The main screen is now simultaneously:

- Home
- Explore
- Discovery
- Service discovery
- Contextual recommendations

The user should not have to understand the distinction between "Home" and "Services."

The screen answers:

"What can I do, find, or access right now?"

It should combine the strongest elements from the existing Home and Services screens.

--------------------------------------------------
2. HEADER
--------------------------------------------------

Top of screen:

LOCATION
    📍 Wood Ave, Kilimani, Nairobi
    ↓

NOTIFICATIONS
    Bell icon with notification indicator

Location must be dynamic.

Do not hardcode the location.

Support:

- current location
- selected location
- saved location
- property location
- location unavailable
- permission required
- loading location

--------------------------------------------------
3. SEARCH BAR
--------------------------------------------------

The search bar is one of the most important elements on the screen.

Use a large rounded search field.

Example:

"Search food, spa, rides, events..."

The search must be UNIVERSAL.

It can search:

- merchants
- restaurants
- products
- services
- experiences
- rides
- vehicles
- events
- categories
- subcategories
- locations

DO NOT build a separate search system for every category.

Use one reusable NEXG search system.

--------------------------------------------------
4. SEARCH ACTION / FILTER ICON
--------------------------------------------------

On the RIGHT side of the search bar, include a contextual filter/discovery icon.

Example:

🔍 Search anything...              ☷

This is NOT a bottom-navigation item.

The icon opens filtering/discovery controls.

Filters must change dynamically based on context.

For example:

FOOD:

- Open now
- Cuisine
- Price
- Rating
- Distance
- Delivery
- Pickup

EXPERIENCES:

- Date
- Time
- Price
- Duration
- Availability
- Distance

TRANSPORT:

- Vehicle type
- Pickup
- Destination
- Price
- Time

WELLNESS:

- Service type
- Date
- Time
- Price
- Availability

Do not show irrelevant filters.

--------------------------------------------------
5. CATEGORY DISCOVERY
--------------------------------------------------

Immediately below search, show horizontally scrollable category cards/chips.

Examples:

Food & Restaurants
Groceries & Essentials
Pharmacy
Laundry & Cleaning
Wellness & Spa
Beauty
Experiences
Transport
Shopping
More

IMPORTANT:

Categories MUST be data-driven.

Do not hardcode the categories directly into the UI.

Use the existing NEXG category/subcategory registry if one exists.

The UI should render whatever categories are enabled.

A future category must be able to appear without rewriting the screen.

--------------------------------------------------
6. CATEGORY MODEL
--------------------------------------------------

Each category should conceptually contain:

id
name
slug
icon
image
description
enabled
sortOrder
subcategories
capabilities
filters
workflow configuration

Reuse existing project types/models where available.

DO NOT create duplicate category architecture.

--------------------------------------------------
7. CATEGORY INTERACTION
--------------------------------------------------

When a user taps a category:

DO NOT navigate to a completely separate "category app."

Instead, transform the same unified discovery experience.

Example:

Home
→ Food

The screen becomes:

Food
Search food...
Restaurants
Cafes
Fast Food
Nearby
Popular
Open now

The user remains inside the unified NEXG discovery system.

Likewise:

Home
→ Wellness

becomes:

Wellness
Search wellness...
Spas
Massage
Fitness
Nearby
Available today

--------------------------------------------------
8. SUBCATEGORIES
--------------------------------------------------

Subcategories are dynamic.

Do not assume every category has the same structure.

For example:

Food
→ Restaurants
→ Cafes
→ Fast Food

Wellness
→ Spa
→ Massage
→ Fitness

Transport
→ Rides
→ Airport Transfer
→ Car Rental

Experiences
→ Events
→ Tours
→ Activities

Use the authoritative NEXG data model.

--------------------------------------------------
9. FEATURED CONTENT
--------------------------------------------------

Below categories, show a large featured card.

The featured entity is dynamic.

Example:

Featured tonight

Mama Oliech Grill

⭐ 4.7
2,311 reviews
1.8 km
25–40 min
from KSh 500

Explore →

The actual merchant/content must come from the backend/data layer.

Do not permanently hardcode Mama Oliech Grill.

--------------------------------------------------
10. CONTEXTUAL CTA
--------------------------------------------------

The primary CTA must depend on the entity.

Examples:

Restaurant:
View menu

Food delivery:
Order now

Experience:
Book now

Spa:
Book appointment

Ride:
Get ride

Vehicle:
Rent now

Product:
Shop now

Service:
Request service

Do not make every entity say "Explore."

--------------------------------------------------
11. PROMOTIONS
--------------------------------------------------

Support dynamic promotional cards.

Example:

10% off your next booking
Spa, salon and experiences this week

NEXG10

Promotions must be data-driven.

Do not hardcode coupon codes.

Support:

- title
- description
- code
- image
- expiry
- eligibility
- CTA

--------------------------------------------------
12. ACTIVE NOW
--------------------------------------------------

"Active now" is a first-class NEXG concept.

Show things currently happening for the user.

Examples:

Booking
Order
Ride
Delivery
Service request
Reservation
Experience

Examples:

Hemingways Spa
Today · 4:30 PM
Confirmed

Sushi Takumi
Preparing
Arrives in 18 min

Ride to Airport
Driver arriving in 4 min

These must be generated from the user's actual Activity data.

Do not hardcode them.

Provide:

See all →

which navigates to Activity.

--------------------------------------------------
13. AROUND YOU
--------------------------------------------------

Show contextual discovery based on:

- location
- time
- day
- availability
- distance
- relevance

Example:

Around you · this morning

Java House Westlands
4.5 ⭐ · 0.6 km
Coffee · Breakfast

Fitness Hub
4.7 ⭐ · 0.8 km
Gym · Training

Glow Salon
4.6 ⭐ · 1.1 km
Hair · Beauty

These are reusable discovery cards.

--------------------------------------------------
14. TIME-AWARE CONTENT
--------------------------------------------------

The unified screen should adapt to context.

Morning:

Breakfast
Coffee
Transport
Gyms

Afternoon:

Lunch
Shopping
Wellness
Activities

Evening:

Dinner
Events
Experiences
Nightlife

Weekend:

Experiences
Activities
Shopping
Wellness

Do not hardcode these directly into visual components.

Use contextual ranking/configuration.

--------------------------------------------------
15. DISCOVERY CARDS
--------------------------------------------------

Create reusable discovery components supporting:

image
title
category
rating
distance
price
duration
availability
favorite
badge
CTA

Fields should be optional.

Do not create a unique card component for every category.

--------------------------------------------------
16. ENTITY DETAIL
--------------------------------------------------

All discovered entities should use a reusable detail architecture.

Supported entities include:

Merchant
Restaurant
Service
Product
Experience
Vehicle
Property
Transport option

Render only the sections applicable to that entity.

Possible sections:

Hero
Gallery
Title
Rating
Description
Location
Price
Availability
Options
Related items
Reviews
Primary action

--------------------------------------------------
17. CAPABILITY-DRIVEN WORKFLOWS
--------------------------------------------------

Do not build workflows based only on category names.

Use capabilities.

Possible capabilities:

browse
view
order
book
reserve
schedule
request
quote
pay
track
deliver
pickup
navigate
message
call

A category/entity declares what it supports.

The system chooses the appropriate workflow.

--------------------------------------------------
18. EXAMPLE WORKFLOWS
--------------------------------------------------

FOOD:

Discovery
→ Restaurant
→ Menu
→ Item
→ Cart
→ Checkout
→ Payment
→ Order
→ Activity

WELLNESS:

Discovery
→ Provider
→ Service
→ Date
→ Time
→ Booking
→ Payment
→ Confirmation
→ Activity

EXPERIENCE:

Discovery
→ Experience
→ Date
→ Time
→ Participants
→ Availability
→ Checkout
→ Confirmation
→ Activity

TRANSPORT:

Discovery
→ Pickup
→ Destination
→ Vehicle
→ Price
→ Confirmation
→ Matching
→ Live trip
→ Activity

SHOPPING:

Discovery
→ Merchant
→ Product
→ Variant
→ Cart
→ Delivery/Pickup
→ Checkout
→ Order
→ Activity

Do not create separate navigation architectures for these.

Reuse workflow primitives.

--------------------------------------------------
19. ACTIVITY
--------------------------------------------------

All transactional actions eventually become Activity records.

Activity contains things such as:

Orders
Bookings
Rides
Reservations
Deliveries
Service requests

The unified Home screen surfaces the most relevant active records.

"See all" goes to Activity.

--------------------------------------------------
20. ACCOUNT
--------------------------------------------------

Account contains:

Profile
Payment methods
Wallet
Saved items
Addresses/locations
Preferences
Notifications/preferences
Support
Settings

IMPORTANT:

Settings belongs inside Account.

DO NOT add Settings to bottom navigation.

--------------------------------------------------
21. BOTTOM NAVIGATION
--------------------------------------------------

BOTTOM NAVIGATION IS LOCKED.

Exactly:

Home
Activity
Account

Visual structure:

Home       Activity       Account

Use the existing NEXG navigation visual language.

The selected destination should be clearly indicated.

Do not add:

Services
Explore
Settings
More
Menu

to the bottom navigation.

--------------------------------------------------
22. HOME IS THE DISCOVERY SURFACE
--------------------------------------------------

Because Home and Services are merged:

Home is now both:

- contextual home
- discovery
- category browsing
- search
- recommendations

Therefore the user can discover almost everything from this one surface.

Do not create a redundant Services screen.

--------------------------------------------------
23. PROGRESSIVE REVEAL
--------------------------------------------------

Do not expose every possible NEXG capability immediately.

Prioritize:

1. Location
2. Search
3. Categories
4. Featured/relevant content
5. Active now
6. Around you
7. More discovery

Complexity should progressively reveal itself.

--------------------------------------------------
24. STATES
--------------------------------------------------

Every section must support:

loading
ready
empty
error
offline
stale
updating

Transactional states:

idle
processing
success
failed

Discovery states:

available
closed
unavailable
sold out
booking required

Do not leave states undefined.

--------------------------------------------------
25. PERFORMANCE
--------------------------------------------------

Do not block the entire Home screen while every section loads.

Load in priority order:

1. Header/location
2. Search
3. Categories
4. Primary discovery
5. Featured
6. Active
7. Around you

Use caching and lazy loading where appropriate.

--------------------------------------------------
26. VISUAL DESIGN
--------------------------------------------------

Use the supplied NEXG screenshots as the visual reference.

Preserve:

Dark-first aesthetic
Large rounded corners
Strong typography
NEXG green accent
Soft dark surfaces
Large imagery
Horizontal rails
Minimal visual clutter
Large touch targets
Progressive reveal
Subtle motion

Do not introduce an unrelated design language.

--------------------------------------------------
27. SEARCH + ICON RULE
--------------------------------------------------

The search row must visually read as:

[ Search anything...                          ] [FILTER]

The filter/discovery icon is part of SEARCH.

It is NOT navigation.

This distinction must remain clear.

--------------------------------------------------
28. RESPONSIVE DESIGN
--------------------------------------------------

Primary target is mobile.

Support:

small phones
standard phones
large phones

Do not use brittle fixed positioning.

Use responsive layout primitives.

--------------------------------------------------
29. AUTONOMOUS IMPLEMENTATION
--------------------------------------------------

Before coding:

Inspect the repository.

Find:

existing Home
existing Services
existing navigation
existing categories
existing subcategories
existing merchant models
existing activity models
existing workflow logic
existing search
existing design tokens
existing theme
existing state management
existing API/data layer

Reuse existing architecture.

Do not create duplicate systems.

--------------------------------------------------
30. MOST IMPORTANT RULE
--------------------------------------------------

BUILD THE SYSTEM, NOT A STATIC MOCKUP.

The final screen must be able to handle future NEXG categories without requiring the Home screen to be rewritten.

A new category should primarily require:

category configuration
data
capabilities
workflow configuration

—not a completely new screen.

--------------------------------------------------
31. FINAL USER EXPERIENCE
--------------------------------------------------

The user should open NEXG and immediately understand:

"Where am I?"
"What can I search for?"
"What can I do?"
"What is available around me?"
"What is happening right now?"

The experience should feel like:

LOCATION
↓
SEARCH
↓
DISCOVER
↓
CHOOSE
↓
ACT
↓
TRACK
↓
ACTIVITY

Everything should feel like one continuous NEXG experience.

FINAL NAVIGATION:

HOME | ACTIVITY | ACCOUNT

No Services tab.
No Settings tab.
No extra bottom-navigation destinations.
```

**That is the version I would give the agent now.** It reflects the actual decision you've made: **Home + Explore/Services = one unified discovery surface**, with **Home / Activity / Account** as the only bottom navigation.

## Prompt:
8/29/2026, 6:54:56 PM

it aleady exist it should just better

## Response:
8/29/2026, 6:55:08 PM

> **Refined app improvement prompt for autonomous UX workflows**
>
> 
>
> Worked for 4s

Exactly - then the agent **should not rebuild the screen or architecture**. It should take the existing combined Home/Explore screen and make it substantially better while preserving what already works.

Also, your current design-system material explicitly emphasizes **Visual QA, Interaction QA, Attention → Direction → Memory → Action, progressive data/loading, purposeful motion/blur, and extending existing components rather than creating parallel patterns**. `Branch · UX Design Laws.txt` `Branch · UX Design Laws.txt`

Use this prompt:

```text
NEXG CONSUMER APP - IMPROVE THE EXISTING HOME / EXPLORE SCREEN

You are working inside the EXISTING NEXG Consumer/User App.

IMPORTANT:

THE SCREEN ALREADY EXISTS.

DO NOT REBUILD IT FROM SCRATCH.
DO NOT CREATE A NEW HOME SCREEN.
DO NOT CREATE A SEPARATE SERVICES / EXPLORE SCREEN.
DO NOT CHANGE THE APP'S CORE ARCHITECTURE unnecessarily.

Your job is to take the CURRENT combined Home + Explore screen and make it significantly better in:

- visual quality
- usability
- hierarchy
- spacing
- interaction
- states
- responsiveness
- dynamic category behavior
- search
- discovery
- workflows
- performance
- polish

Preserve the existing NEXG identity and working functionality.

Think:

CURRENT PRODUCT
        ↓
AUDIT
        ↓
IMPROVE
        ↓
POLISH
        ↓
MAKE DYNAMIC
        ↓
QA

NOT:

CURRENT PRODUCT
        ↓
THROW AWAY
        ↓
REBUILD

--------------------------------------------------
1. LOCKED NAVIGATION
--------------------------------------------------

The Consumer app now has EXACTLY THREE bottom navigation destinations:

HOME
ACTIVITY
ACCOUNT

Bottom navigation must contain ONLY:

Home
Activity
Account

There is NO:

Services tab
Explore tab
Settings tab
More tab

Do not add anything else.

Settings belongs inside Account.

--------------------------------------------------
2. THE MAIN SCREEN
--------------------------------------------------

Home and Explore/Services have already been combined.

This single screen is the primary NEXG discovery surface.

It should combine:

- contextual Home content
- universal search
- categories
- subcategories
- featured merchants
- services
- experiences
- nearby discovery
- active activity
- recommendations
- promotions

Do not split these back into separate screens.

--------------------------------------------------
3. HEADER
--------------------------------------------------

Preserve the existing header structure.

It should contain:

LOCATION
NOTIFICATIONS
SEARCH

Example:

📍 Wood Ave, Kilimani, Nairobi             🔔

Search food, spa, rides, events...

The location and notifications already exist.

Improve them where necessary without changing their fundamental behavior.

--------------------------------------------------
4. SEARCH BAR
--------------------------------------------------

The search bar is a major interaction surface.

Keep the existing search bar.

Improve it rather than replacing it.

It should support universal NEXG discovery:

- food
- restaurants
- groceries
- pharmacy
- laundry
- beauty
- wellness
- experiences
- transport
- rides
- vehicles
- products
- services
- merchants
- locations
- events

The search system must use the existing implementation if one exists.

DO NOT create a second search engine.

--------------------------------------------------
5. SEARCH + FILTER ICON
--------------------------------------------------

The search bar must have a contextual icon on the RIGHT.

Structure:

[ 🔍 Search food, spa, rides, events... ] [ FILTER ]

The filter/settings-style icon belongs beside the search bar.

It does NOT belong in bottom navigation.

Tapping it should open the existing filter/discovery mechanism or improve it if necessary.

Filters must become contextual.

Food:

Open now
Cuisine
Price
Rating
Distance
Delivery
Pickup

Wellness:

Service
Date
Time
Price
Availability

Experiences:

Date
Time
Price
Duration
Availability

Transport:

Vehicle
Pickup
Destination
Price
Time

Do not show irrelevant filters.

--------------------------------------------------
6. CATEGORIES
--------------------------------------------------

Preserve the existing category cards/rail.

Make them better visually and behaviorally.

Categories must remain DATA-DRIVEN.

Do not hardcode the category list into the UI.

Use the existing NEXG category/subcategory system.

If the repository already has the registry:

USE IT.

Do not create another registry.

The UI should automatically render enabled categories.

Example:

Food & Restaurants
Groceries & Essentials
Pharmacy
Laundry & Cleaning
Wellness & Spa
Beauty
Experiences
Transport
More

The actual list comes from data.

--------------------------------------------------
7. CATEGORY WORKFLOWS
--------------------------------------------------

This is extremely important.

The agent must autonomously understand what happens when the user selects each existing category.

Do not simply make every category open a generic list.

Inspect the existing category/subcategory definitions and determine:

- what entities they expose
- what the user can do
- what information is required
- what workflow is appropriate
- which existing components can support it

Use existing workflows whenever possible.

Examples:

FOOD:

Category
→ Restaurant
→ Menu
→ Item
→ Cart
→ Checkout
→ Order
→ Activity

WELLNESS:

Category
→ Provider
→ Service
→ Date
→ Time
→ Booking
→ Confirmation
→ Activity

EXPERIENCES:

Category
→ Experience
→ Date
→ Time
→ Participants
→ Availability
→ Booking
→ Activity

TRANSPORT:

Category
→ Transport
→ Pickup
→ Destination
→ Options
→ Price
→ Confirmation
→ Activity

SHOPPING:

Category
→ Merchant
→ Product
→ Variant
→ Cart
→ Delivery/Pickup
→ Checkout
→ Order
→ Activity

These are examples of behavior.

Do NOT create unnecessary new screens for each workflow.

Reuse the existing NEXG workflow architecture.

--------------------------------------------------
8. CAPABILITY-DRIVEN BEHAVIOR
--------------------------------------------------

Do not make logic depend only on category names.

Use existing capabilities where available.

Examples:

browse
view
order
book
reserve
schedule
request
quote
pay
track
deliver
pickup
navigate

A category/entity should expose its capabilities.

The UI should then expose the appropriate actions.

--------------------------------------------------
9. FEATURED CONTENT
--------------------------------------------------

Preserve the existing featured content section.

Improve:

- imagery
- typography
- information hierarchy
- badge placement
- CTA
- favorite interaction
- availability state
- readability

Do not hardcode the merchant shown in the current mockup.

Use the existing dynamic data.

The CTA must reflect the entity.

Restaurant:
View menu / Order

Experience:
Book now

Spa:
Book appointment

Vehicle:
Rent now

--------------------------------------------------
10. PROMOTIONS
--------------------------------------------------

Preserve the existing promotion section.

Improve its visual polish and interaction.

Use real/dynamic promotion data where already available.

Do not hardcode promotional codes.

Support:

- title
- description
- offer
- expiry
- eligibility
- CTA

--------------------------------------------------
11. ACTIVE NOW
--------------------------------------------------

Keep Active Now.

Treat it as an important contextual surface.

It can contain:

- bookings
- orders
- rides
- deliveries
- service requests
- reservations

Use the existing Activity data.

Example:

Hemingways Spa
Today · 4:30 PM
Confirmed

Ride to Airport
Driver arriving in 4 min

Order
Preparing

Do not create fake static activity if real data exists.

The "See all" action goes to Activity.

--------------------------------------------------
12. AROUND YOU
--------------------------------------------------

Preserve Around You.

Improve:

- card design
- horizontal scrolling
- information hierarchy
- imagery
- favorite interaction
- open/closed state
- distance
- rating
- category metadata

Use location-aware data.

Do not hardcode locations.

--------------------------------------------------
13. PROGRESSIVE DISCOVERY
--------------------------------------------------

Do not overwhelm the user.

Follow:

ATTENTION
↓
DIRECTION
↓
MEMORY
↓
ACTION

The most important content should be visually dominant.

Use progressive disclosure.

The user should see:

1. Where am I?
2. Search
3. What can I do?
4. What's relevant now?
5. What's happening?
6. What's around me?

Avoid unnecessary complexity.

The NEXG principle is:

Complexity should be handled by the system rather than pushed onto the user.

--------------------------------------------------
14. VISUAL IMPROVEMENT
--------------------------------------------------

Use the CURRENT SCREEN as the visual baseline.

Do not replace the established NEXG aesthetic.

Improve:

- spacing
- typography
- card proportions
- hierarchy
- alignment
- icon consistency
- imagery
- surface depth
- contrast
- empty space
- scroll behavior
- touch targets
- visual rhythm

The result should feel like:

"the same NEXG app, but much more polished."

NOT:

"a completely different app."

--------------------------------------------------
15. MOTION
--------------------------------------------------

Improve existing motion where appropriate.

Motion should communicate:

- continuity
- state change
- focus
- cause → effect
- feedback

Do NOT add animation just because you can.

If an animation does not communicate something useful, remove it.

--------------------------------------------------
16. STATES
--------------------------------------------------

Do not only implement the happy path.

Existing components and sections should properly support:

Loading
Ready
Empty
Error
Offline
Stale
Updating

Transactional states:

Idle
Processing
Success
Failure

Discovery states:

Open
Closed
Unavailable
Sold out
Booking required

States should feel intentional and consistent.

--------------------------------------------------
17. OFFLINE / POOR NETWORK
--------------------------------------------------

The screen should remain useful under poor connectivity.

Support:

Online
Slow
Offline
Reconnecting
Syncing

Avoid blank screens.

Where possible:

- show cached content
- show stale content
- communicate updates
- retry failed sections independently

Do not freeze the entire screen because one widget failed.

--------------------------------------------------
18. PERFORMANCE
--------------------------------------------------

Do not make the existing screen slower while improving it.

Prioritize loading:

1. Header
2. Search
3. Categories
4. Primary discovery
5. Featured
6. Active
7. Around You

Lazy-load lower-priority content.

Optimize:

- images
- lists
- horizontal rails
- API requests
- state updates
- animations

--------------------------------------------------
19. REUSABLE COMPONENTS
--------------------------------------------------

Before creating a component:

SEARCH THE EXISTING CODEBASE.

Ask:

Does this already exist?

Can it be improved?

Can it be reused?

Can it be extended?

Only create something new if genuinely necessary.

The goal is to strengthen the existing NEXG component system.

Do not create:

CardV2
SearchV2
CategoryCardNew
NewHomeCard
AlternativeFilter
etc.

just because something needs improvement.

Prefer improving the existing primitive.

--------------------------------------------------
20. DATA
--------------------------------------------------

Use the existing backend/API/data layer.

Do not replace working data with mock data.

Do not hardcode:

merchant names
categories
prices
locations
ratings
promotions
activity
availability

unless they are already intentionally fixtures in the project.

--------------------------------------------------
21. RESPONSIVE
--------------------------------------------------

Keep the existing mobile-first implementation.

Make sure it works across:

small phones
standard phones
large phones

Avoid brittle absolute positioning.

--------------------------------------------------
22. ACCESSIBILITY
--------------------------------------------------

Improve accessibility while polishing the UI.

Check:

touch targets
labels
contrast
screen reader semantics
dynamic text
reduced motion
focus
error messaging

--------------------------------------------------
23. VISUAL QA
--------------------------------------------------

After implementation, compare the improved screen against the CURRENT NEXG design.

Audit:

Typography
Spacing
Alignment
Iconography
Color
Contrast
Radius
Elevation
Blur
Motion
Hierarchy

The supplied/current screen is the baseline.

The goal is improvement, not replacement.

--------------------------------------------------
24. INTERACTION QA
--------------------------------------------------

Actually test:

Search
Category selection
Subcategory selection
Filter
Featured cards
Favorite
Promotion
Active Now
Around You
See all
Navigation
Back behavior
Loading
Error
Offline
Retry

Make sure transitions feel predictable.

--------------------------------------------------
25. NAVIGATION QA
--------------------------------------------------

Verify the bottom navigation remains:

HOME | ACTIVITY | ACCOUNT

Nothing else.

Home is the combined Home + Explore experience.

Activity handles the user's transactions and ongoing activity.

Account contains profile, settings, payments, saved items and account controls.

--------------------------------------------------
26. AUTONOMOUS DECISION MAKING
--------------------------------------------------

You are allowed to make implementation decisions autonomously when the answer can be inferred from:

- existing code
- existing components
- existing data models
- existing navigation
- existing category definitions
- current visual design
- NEXG UX principles

Do not stop to ask for permission for small design decisions.

Inspect first.
Reason.
Implement.
Test.
Polish.

Only ask when a decision would materially change established business logic and cannot be inferred from the repository.

--------------------------------------------------
27. FINAL OBJECTIVE
--------------------------------------------------

Do NOT build a new screen.

Take the existing NEXG combined Home/Explore screen and make it:

MORE BEAUTIFUL
MORE COHERENT
MORE DYNAMIC
MORE INTELLIGENT
MORE RESPONSIVE
MORE USABLE
MORE POLISHED
MORE PRODUCTION-READY

while preserving:

- the current NEXG identity
- current navigation
- current architecture
- current working functionality
- existing components
- existing data systems

The final experience should feel like:

THE SAME NEXG APP,
EVOLVED.

And the core Consumer navigation must remain:

HOME
ACTIVITY
ACCOUNT

No Services tab.
No Explore tab.
No Settings tab.

The search bar remains the primary discovery entry point, with the contextual filter icon attached to the search experience.

Improve the existing system. Do not replace it.
```

That is much closer to what you actually need now. The key instruction is **“improve the existing system, don't replace it.”** It also aligns with the UX document's governance rule that new components should first establish whether something already exists and whether it can be extended rather than creating parallel patterns. `Branch · UX Design Laws.txt`

## Prompt:
8/29/2026, 6:55:53 PM

since i combine what features hsould be in the home screen and how do we make it adapt to everone and every cATEGORY AND SUB CATEGORIES

## Response:
8/29/2026, 6:56:08 PM

> **Designed NEXG’s adaptive UX system and home discovery features**
>
> 
>
> Worked for 8s

Yes. **Now that Home + Explore/Services are one screen, I would make Home much more intelligent rather than simply putting every feature onto it.**

Your existing flowboard already defines Home/Discovery around search, categories, active activity, recommendations, nearby content and featured content. `NEXG Consumer Platform UX Flow Board.png` And the design laws specifically say that complexity should be handled by the system, while widgets should be living surfaces with explicit states rather than static cards. `Branch · UX Design Laws.txt`

The key is this:

> **The Home screen should NOT have a fixed set of sections. It should have a fixed set of capabilities, and the content/order/layout adapts to the person, context, category and subcategory.**

## 1. What I would put on the unified Home

### Always available

These are your core shell:

```text
LOCATION
NOTIFICATIONS

SEARCH
[FILTER / DISCOVERY]

CATEGORY RAIL
```

Then everything below is **dynamic**.

### Dynamic content layer

```text
┌──────────────────────────────┐
│ Location                 🔔  │
│                              │
│ 🔍 Search anything...    ☷   │
│                              │
│ Food  Grocery  Wellness ...  │
│                              │
│ ┌──────────────────────────┐ │
│ │      RELEVANT NOW        │ │
│ │                          │ │
│ │ dynamic                  │ │
│ └──────────────────────────┘ │
│                              │
│ Active now                   │
│ ───────────────────────────  │
│                              │
│ Recommended for you          │
│ ───────────────────────────  │
│                              │
│ Around you                   │
│ ───────────────────────────  │
│                              │
│ More                         │
│                              │
├──────────────────────────────┤
│ Home     Activity     Account│
└──────────────────────────────┘
```

But **even those sections aren't all mandatory**.

That's the important part.

---

# 2. The Home should be a dynamic canvas

Think of it like this:

```text
NEXG HOME ENGINE
       │
       ├── Who is this?
       │
       ├── Where are they?
       │
       ├── What time is it?
       │
       ├── What are they doing?
       │
       ├── What have they done before?
       │
       ├── What is happening now?
       │
       ├── What is available?
       │
       └── What can they do next?
                    ↓
              HOME COMPOSER
                    ↓
          personalized screen
```

So two people can open NEXG and get **different Home screens without having different app designs**.

---

# 3. The most important thing: Context

Your design system literally frames the problem around:

**WHAT / WHERE / WHEN / WHO / HOW OFTEN**. `Branch · UX Design Laws.txt`

So Home should understand at least:

### WHO

```text
new user
returning user
frequent user
guest
authenticated user
```

### WHERE

```text
current location
property
neighborhood
city
merchant proximity
```

### WHEN

```text
morning
afternoon
evening
night

weekday
weekend
holiday

specific date/time
```

### WHAT

```text
search intent
current activity
recent activity
category interest
current workflow
```

### HOW OFTEN

```text
frequent restaurant customer
frequent rider
frequent spa customer
frequent shopper
etc.
```

---

# 4. Then add "intent"

This is where NEXG can become much smarter.

Instead of only asking:

> "What category does this belong to?"

the system asks:

> **"What is this person trying to accomplish?"**

For example:

### User searches:

**"breakfast"**

Don't simply show:

```text
Food
```

Infer:

```text
Intent = breakfast
Time = morning
Location = Kilimani
```

Then show:

```text
Breakfast near you

Java House
Artcaffè
Local breakfast spots
```

---

### User searches:

**"airport"**

Potential intent:

```text
Airport transfer
Airport hotel
Airport parking
Airport services
```

The system can intelligently surface the appropriate category/workflow.

---

# 5. Category should change the Home, not replace it

This is the architecture I recommend:

```text
HOME
 │
 ├── No category selected
 │       ↓
 │   Universal discovery
 │
 ├── Food selected
 │       ↓
 │   Food context
 │
 ├── Wellness selected
 │       ↓
 │   Wellness context
 │
 ├── Experiences selected
 │       ↓
 │   Experiences context
 │
 └── Transport selected
         ↓
     Transport context
```

The **same Home engine** changes its content.

---

# 6. Food example

When Food is selected, Home could dynamically become:

```text
Food

Search food...

Restaurants
Cafes
Fast Food
Groceries
Delivery

Open now

Popular near you

Quick delivery

Recommended for you

Deals

Nearby
```

But if the user has no interest in delivery, don't dominate the screen with delivery.

---

# 7. Wellness example

Select Wellness:

```text
Wellness

Search wellness...

Spa
Massage
Fitness
Recovery
Beauty

Available today

Nearby

Recommended for you

Popular this week

Offers
```

Same screen architecture.

Different data.

---

# 8. Experiences example

Select Experiences:

```text
Experiences

Search experiences...

Events
Tours
Activities
Safaris
Entertainment

Tonight

This weekend

Near you

Popular

Recommended
```

The screen changes because the **content model changes**, not because you built another app.

---

# 9. Transport example

Transport is completely different.

You don't necessarily want:

```text
Featured merchant
Popular merchants
```

You might want:

```text
Where are you going?

Pickup
Destination

Ride
Airport transfer
Car rental

Nearby vehicles

Recent destinations
```

This is why you cannot design Home as a fixed collection of cards.

You need a **capability/context engine**.

---

# 10. The category needs to tell Home what it needs

Each category/subcategory should have configuration roughly like:

```text
Category
│
├── Identity
│   ├── name
│   ├── icon
│   └── image
│
├── Discovery
│   ├── card type
│   ├── layout
│   ├── ranking
│   └── filters
│
├── Capabilities
│   ├── browse
│   ├── order
│   ├── book
│   ├── reserve
│   ├── request
│   └── track
│
├── Context
│   ├── location
│   ├── date
│   ├── time
│   └── participants
│
└── Workflow
    └── appropriate journey
```

Then Home asks:

> "What does this category need?"

and composes the experience.

---

# 11. Subcategories work the same way

This is critical because you eventually won't just have:

```text
Food
```

You'll have:

```text
Food
├── Restaurants
│   ├── Kenyan
│   ├── Ethiopian
│   ├── Indian
│   ├── Japanese
│   ├── Fast Food
│   └── Fine Dining
│
├── Cafes
├── Bakeries
├── Catering
└── Delivery
```

You **do not build 20 different Home screens**.

Instead:

```text
Category
     ↓
Subcategory
     ↓
Context
     ↓
Capabilities
     ↓
Reusable components
     ↓
Workflow
```

---

# 12. Personalization should happen at three levels

### Level 1 - Universal

Everyone gets:

```text
Location
Search
Categories
```

### Level 2 - Contextual

Depending on:

```text
time
location
availability
current activity
```

### Level 3 - Personal

Depending on:

```text
history
favorites
preferences
previous purchases
previous bookings
behavior
```

This gives you:

```text
UNIVERSAL
+
CONTEXTUAL
+
PERSONAL
=
NEXG HOME
```

---

# 13. New user vs returning user

This is extremely important.

### New user

Don't show:

> "Because you liked Java House..."

They haven't liked anything yet.

Instead:

```text
Welcome

What are you looking for?

Food
Groceries
Wellness
Experiences
Transport

Popular near you
```

---

### Returning user

Now:

```text
Good evening

Continue where you left off

Your active booking

Because you liked Java House

Popular near you
```

---

# 14. Someone currently has an order

Home changes again.

Top priority becomes:

```text
ACTIVE NOW

Your order is on the way
ETA 12 min

Track →
```

Then discovery moves lower.

This follows your Attention → Direction → Memory → Action principle: the most important thing gets attention first. `NEXG CRM Dashboard State Overview.png`

---

# 15. Someone has an upcoming booking

Instead:

```text
UP NEXT

Hemingways Spa
Today · 4:30 PM

View booking →
```

Then:

```text
Recommended
Around you
Explore
```

---

# 16. Someone is doing nothing

Then Home can become discovery-heavy:

```text
Featured tonight

Popular near you

Experiences this weekend

Food

Wellness

Deals
```

---

# 17. Don't personalize everything

This is important.

If you personalize every pixel, the app becomes unpredictable.

Keep the **structure familiar**.

For example:

```text
LOCATION
SEARCH
CATEGORIES
↓
CONTEXTUAL CONTENT
↓
DISCOVERY
↓
MORE
```

The **content changes**.

The **interaction patterns don't**.

That follows your design constitution's rule that familiar patterns should remain familiar unless there is a reason to change them. `Branch · UX Design Laws.txt`

---

# 18. I would actually define Home as 5 layers

This is probably the cleanest architecture for your agent.

```text
LAYER 1 - SHELL
Location
Notifications
Search
Filter

LAYER 2 - DISCOVERY
Categories
Subcategories
Search results

LAYER 3 - CONTEXT
Active now
Upcoming
Relevant now
Nearby

LAYER 4 - PERSONALIZATION
Recommended
Recently used
Favorites
Because you liked...

LAYER 5 - COMMERCE / CONTENT
Offers
Featured
Collections
Events
Deals
```

And the **Home Composer decides which widgets from layers 2-5 actually appear.**

---

# 19. The Home Composer

This is the piece I'd tell your agent to build.

Something conceptually like:

```text
HOME COMPOSER

Input:
├── User
├── Location
├── Time
├── Category
├── Subcategory
├── Intent
├── Activity
├── Availability
├── History
├── Preferences
└── Promotions

             ↓

Determine:
├── Priority
├── Sections
├── Order
├── Content
├── Layout
├── CTA
└── Workflow

             ↓

Render:
NEXG HOME
```

This is what makes it adaptable.

---

# 20. And each widget needs a priority score

You don't need to show everything.

For example:

```text
Active order             100
Upcoming booking          95
Urgent request            90
Relevant search           85
Nearby open merchant      70
Personal recommendation   65
Popular content           50
Promotion                 40
General discovery         30
```

The exact scoring can evolve.

This allows the screen to decide:

> **"What deserves the user's attention right now?"**

rather than simply:

> "What cards did the developer put on the screen?"

---

# 21. The screen can therefore look different every day

### Monday 8:00 AM

```text
Location
Search
Categories

Coffee nearby
Breakfast
Quick transport

Active booking

Around you
```

### Friday 7:00 PM

```text
Location
Search
Categories

Dinner tonight

Events tonight

Featured experiences

Active booking

Popular nearby
```

### Saturday afternoon

```text
Location
Search
Categories

Things to do this weekend

Experiences

Restaurants

Deals

Nearby
```

Same application.

Same components.

Different composition.

---

# 22. And importantly: category does NOT mean one layout

This is where your agent needs to be careful.

A category could choose:

```text
horizontal cards
vertical list
map
calendar
time slots
merchant grid
product grid
service list
booking widget
```

depending on its capabilities.

Your flowboard already defines different representations such as **widgets, cards, lists/collections, bottom sheets and full scenes**, with states applied across experiences rather than creating a new screen for every state. `NEXG Consumer Platform UX Flow Board.png`

So:

> **Category = data + capabilities + context**

not:

> **Category = screen**

---

# 23. The result

You end up with something extremely powerful:

```text
                    NEXG HOME
                         │
              ┌──────────┴──────────┐
              │                     │
          UNIVERSAL              CONTEXT
          STRUCTURE              ENGINE
              │                     │
      Search / Location       User / Time
      Categories              Location
      Navigation              Activity
                              Intent
                              History
              │                     │
              └──────────┬──────────┘
                         ↓
                   HOME COMPOSER
                         ↓
              ┌──────────┼──────────┐
              ↓          ↓          ↓
          Discovery   Active     Personal
                         │
                         ↓
                     ACTION
                         ↓
                     ACTIVITY
```

That is how you make **one Home screen work for everyone, every category, and every subcategory** without turning the app into a giant collection of hardcoded screens.

And it fits the stress-test principle in your NEXG design system: adding a new merchant category, service, property type, payment method, country, language, device or workflow should **compose from the existing system rather than require rebuilding the interface**. `Branch · UX Design Laws.txt`

**So I would not add 30 more fixed sections to your current Home. I'd add the intelligence that decides which existing sections appear, where they appear, and what they contain.**

## Prompt:
8/29/2026, 6:58:00 PM

GENERATE AN MAGE

## Response:
8/29/2026, 6:58:07 PM

![NEXG Unified Home App Concept](https://chatgpt.com/backend-api/estuary/content?id=file_0000000029f882109430f2cea8825ca7&fn=NEXG+Unified+Home+App+Concept.png&cd=attachment&ts=496959&p=fs&cid=1&sig=5d6d69bb2505e0040ceb9469c910c1d282b72570e2cc765e82618c48a5172e7f&v=0)



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)