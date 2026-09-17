# Create NexG Agent Prompt

**User:** Anonymous  
**Created:** 8/24/2026 9:40:05  
**Updated:** 8/24/2026 9:43:42  
**Exported:** 9/10/2026 18:45:42  
**Link:** [https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a8be718-2ba4-83ea-b103-212b9ecbacc4](https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a8be718-2ba4-83ea-b103-212b9ecbacc4)  

## Prompt:
8/24/2026, 9:40:04 AM

I am building the NexG app off of this and it’s going well 
Just that it lacks a lot of components and needs to look better and more functionality 
I need a comprehensive prompt I can hand offf to my agent 

https://github.com/Galaxies-dev/wolt-react-native

## Response:
8/24/2026, 9:40:05 AM

> **Searching the web**
>
>
> **Searching 3 websites**
>
> 
>
> Worked for a couple of seconds

Yes. I’d **not tell the agent to “make the Wolt clone better.”** I’d tell it to treat the existing Wolt implementation as the **technical/mobile foundation**, then transform it into the NEXG consumer app.

I checked the repository: it already gives you a strong starting point-Expo Router, Reanimated, Gesture Handler, Expo Maps, Zustand, MMKV, Sentry, authentication, discovery, search, maps, menus, cart, checkout, scheduling and profile. ([GitHub](https://github.com/Galaxies-dev/wolt-react-native)) The important limitation is that it is explicitly a **dummy-data clone with no real backend**, so your agent needs to preserve the useful architecture while expanding the product model substantially. ([GitHub](https://github.com/Galaxies-dev/wolt-react-native))

And your NEXG design document is actually a very good second layer: **Attention → Direction → Memory → Action**, progressive reveal, widgets as living surfaces, explicit states, offline behavior, accessibility, motion/blur rules, and cross-product consistency. `Branch · UX Design Laws.txt`

Here is the prompt I would hand directly to your coding agent:

**document: **

# NEXG CONSUMER APP - PRODUCT TRANSFORMATION & COMPLETION PROMPT

## ROLE

You are the lead product engineer, mobile architect, UX engineer, and design-system engineer responsible for transforming the existing React Native Wolt clone into the **NEXG Consumer App**.

Repository foundation:

https://github.com/Galaxies-dev/wolt-react-native

DO NOT treat this as a simple Wolt clone modification.

Treat the repository as a **technical foundation** that already solves many difficult React Native patterns.

Your job is to evolve it into NEXG.

---

# 1. PRIMARY OBJECTIVE

Build a polished, production-oriented NEXG consumer application that feels like:

> **NEXG understands the context around you and coordinates what you need next.**

NEXG is NOT simply:

- a food delivery app
- a restaurant marketplace
- an Uber clone
- a Booking.com clone
- a Wolt clone
- a collection of disconnected services

It is a **contextual local services and experiences platform**.

The consumer should be able to discover, book, order, schedule, track, pay for and manage things around them.

Examples:

- Dinner nearby
- Movies starting soon
- Spa appointment available
- Safari tomorrow
- Laundry ready
- Airport transfer at 10 AM
- Event happening nearby
- Grocery delivery
- Hotel services
- Activities
- Experiences
- Shopping
- Transportation
- Beauty
- Wellness
- Gifts
- Financial services
- Other contextual local services

The application should make these feel like one coherent product.

---

# 2. IMPORTANT: FIRST AUDIT THE EXISTING APPLICATION

Before making major changes:

1. Inspect the entire repository.
2. Understand the existing navigation.
3. Inspect every existing screen.
4. Inspect every component.
5. Inspect constants/theme.
6. Inspect data models.
7. Inspect hooks.
8. Inspect services.
9. Inspect Zustand stores.
10. Inspect animations.
11. Inspect map implementation.
12. Inspect authentication.
13. Inspect modal architecture.
14. Inspect loading states.
15. Inspect error states.
16. Inspect empty states.
17. Inspect responsive behavior.
18. Inspect dependencies.
19. Identify reusable Wolt functionality.
20. Identify functionality that must be replaced.
21. Identify missing NEXG functionality.

Do not blindly rewrite working code.

Create an internal architecture map before modifying anything.

---

# 3. PRESERVE GOOD FOUNDATION

The existing project already contains useful patterns.

Preserve and improve:

- Expo
- Expo Router
- TypeScript
- Reanimated
- Gesture Handler
- Expo Maps
- Zustand
- MMKV/local persistence
- Sentry/error monitoring
- component-based architecture
- modal architecture
- reusable cards
- search
- discovery
- maps
- cart
- checkout
- scheduling
- profile
- authentication

Do not replace a working architecture merely because you prefer another implementation.

Only introduce a new dependency when there is a clear product or technical reason.

---

# 4. NEXG PRODUCT MODEL

Think in terms of:

```text
USER
 ↓
CONTEXT
 ↓
DISCOVERY
 ↓
SERVICE / EXPERIENCE
 ↓
MERCHANT / PROVIDER
 ↓
ORDER / BOOKING
 ↓
PAYMENT
 ↓
DISPATCH / FULFILLMENT
 ↓
TRACKING
 ↓
COMPLETION
 ↓
MEMORY
```

The app must understand that different services have different workflows.

A restaurant order is not the same as:

- spa booking
- cinema ticket
- safari booking
- airport transfer
- laundry
- hotel service
- event ticket
- rental
- appointment

Do not force every product into the restaurant/order model.

---

# 5. CORE NEXG ENTITIES

Create a coherent domain model around:

## User

```text
User
Profile
Preferences
Saved places
Addresses
Payment methods
Favorites
Recent activity
Notifications
Loyalty
Wallet
```

## Property

```text
Property
Hotel
Apartment
Residence
Office
Venue
```

## Merchant

```text
Merchant
Business
Provider
Restaurant
Spa
Salon
Transport provider
Experience provider
Shop
```

## Service

```text
Service
Experience
Product
Activity
Appointment
Delivery
Transfer
Ticket
```

## Order

```text
Order
OrderItem
OrderStatus
Payment
Delivery
Tracking
```

## Booking

```text
Booking
BookingSlot
Guest
BookingStatus
Cancellation
```

## Location

```text
Location
Address
SavedPlace
Coordinates
DeliveryZone
Distance
ETA
```

## Promotion

```text
Promotion
Discount
Voucher
Campaign
Recommendation
```

---

# 6. HOME SCREEN - THE MOST IMPORTANT SCREEN

Do NOT build a conventional marketplace home screen.

The home screen should feel like a **personal contextual workspace**.

It should answer:

> "What matters to me right now?"

Potential structure:

```text
LOCATION / CONTEXT

Good morning, Emma

What's happening around you?

[Search...]

CONTEXTUAL MOMENTS

Dinner nearby
Movies starting soon
2 spa appointments available
Safari tomorrow
Laundry ready
Airport transfer at 10 AM
Event happening 3km away

QUICK ACTIONS

Food
Rides
Stay
Activities
Shopping
Wellness

DISCOVER

Nearby
Popular
Recommended
For you
Happening now

ACTIVE

Current order
Upcoming booking
Ride
Reservation

EXPLORE

Experiences
Hotels
Events
Shopping
Services
```

But DO NOT rigidly implement this exact layout.

Use hierarchy and context.

The system should dynamically prioritize content.

---

# 7. CONTEXT ENGINE

Create a frontend abstraction for contextual ranking.

For now this may use deterministic/mock logic.

Eventually it can connect to ML.

Example:

```ts
ContextSignal {
  location
  time
  day
  weather
  currentActivity
  upcomingBooking
  activeOrder
  userPreferences
  recentActions
  property
  proximity
}
```

Recommendations should be conceptually based on:

```text
WHO
WHERE
WHEN
WHAT THEY ARE DOING
WHAT THEY RECENTLY DID
WHAT THEY MAY NEED NEXT
```

This is central to NEXG.

---

# 8. DISCOVERY

Create a powerful discovery experience.

Support:

- categories
- nearby
- popular
- trending
- recommended
- happening now
- available now
- available today
- available tomorrow
- deals
- experiences
- services
- products
- events

Discovery should support mixed content.

Example:

```text
Restaurants
Spa
Cinema
Airport transfer
Safari
Laundry
Events
Hotel services
Shopping
```

Do not force everything into restaurant cards.

---

# 9. SEARCH

Build search as a first-class product.

Support:

- global search
- autocomplete
- recent searches
- categories
- merchants
- services
- experiences
- products
- events
- locations
- bookings
- orders

Examples:

```text
"spa"
"airport transfer"
"things to do tonight"
"pizza"
"movies"
"safari"
"laundry"
"breakfast near me"
```

Search should eventually understand intent rather than only exact strings.

Design the architecture so semantic search can be added later.

---

# 10. FILTERING

Create reusable filtering infrastructure.

Filters may include:

```text
Distance
Price
Rating
Availability
Date
Time
Category
Service type
Delivery
Pickup
Location
Dietary preferences
Accessibility
Duration
Age suitability
```

Filters should adapt to the entity being searched.

A restaurant should not receive safari-specific filters.

---

# 11. MAP EXPERIENCE

Expand the existing map architecture.

Support:

- current location
- merchant markers
- service markers
- experience markers
- events
- routes
- delivery zones
- nearby places
- selected place
- map/list toggle

Interaction:

```text
Map
 ↓
Tap marker
 ↓
Preview sheet
 ↓
Expand
 ↓
Details
 ↓
Action
```

Use bottom sheets and gestures where appropriate.

---

# 12. MERCHANT / SERVICE DETAIL

Create a universal but flexible detail architecture.

A detail page can contain:

```text
Hero
Name
Rating
Distance
Open/closed
Availability
Description
Gallery
Services
Products
Packages
Reviews
Location
Policies
Offers
Related experiences
CTA
```

But render sections based on entity type.

For example:

Restaurant:

```text
Menu
Delivery
Pickup
Opening hours
```

Spa:

```text
Treatments
Duration
Available slots
Therapists
```

Experience:

```text
Duration
Schedule
Meeting point
Capacity
Requirements
```

---

# 13. SERVICE BOOKING ENGINE

Create a reusable booking flow.

Support:

```text
Select service
 ↓
Select date
 ↓
Select time
 ↓
Select quantity/guests
 ↓
Add-ons
 ↓
Customer details
 ↓
Payment
 ↓
Confirmation
```

Different service types may skip or add steps.

Do not hard-code one booking flow.

---

# 14. CART

Transform the existing cart into a more general transaction system.

Support:

```text
Products
Services
Bookings
Add-ons
Fees
Discounts
Taxes
Delivery
Convenience fees
```

The architecture should eventually support mixed baskets if the business rules permit it.

---

# 15. CHECKOUT

Build a polished checkout experience.

Include:

```text
Items
Subtotal
Fees
Discount
Delivery
Total
Location
Date/time
Payment method
Contact details
Notes
Terms
Confirm
```

Show changes immediately.

Avoid confusing users with excessive fields.

---

# 16. PAYMENTS

Prepare the frontend architecture for:

- M-Pesa
- cards
- saved cards
- wallets
- promo codes
- refunds
- payment failures
- payment pending
- payment success

Do not fake payment success as if a real gateway exists.

Create clean interfaces so backend payment integration can be connected later.

---

# 17. ORDER / BOOKING TRACKING

Create a universal activity center.

Example:

```text
ACTIVE

Food delivery
Preparing

Airport transfer
Tomorrow · 10:00 AM

Spa
Today · 16:30

Cinema
Tonight · 19:00
```

Every activity should have its own state.

---

# 18. STATE MACHINE

Do not design only happy paths.

Every major entity needs states.

Example:

```text
IDLE
LOADING
READY
UPDATING
SUCCESS
EMPTY
ERROR
OFFLINE
STALE
UNAVAILABLE
CANCELLED
```

Orders may have:

```text
PLACED
CONFIRMED
PREPARING
READY
ASSIGNED
PICKED_UP
IN_TRANSIT
DELIVERED
COMPLETED
CANCELLED
```

Bookings may have:

```text
REQUESTED
CONFIRMED
UPCOMING
CHECKED_IN
COMPLETED
CANCELLED
NO_SHOW
```

Design the UI for every state.

---

# 19. ACTIVE TRIP / DELIVERY EXPERIENCE

For deliveries and rides:

```text
Driver/rider
ETA
Live location
Route
Contact
Call
Chat
Order
Support
```

Prepare the architecture for realtime updates.

---

# 20. NOTIFICATIONS

Build an in-app notification center.

Categories:

```text
Orders
Bookings
Promotions
Recommendations
Payments
Security
Messages
System
```

Support:

- unread
- read
- grouped notifications
- deep links
- contextual actions

---

# 21. PROFILE

Profile should become a user control center.

Include:

```text
Personal information
Bookings
Orders
Favorites
Saved places
Payment methods
Wallet
Promotions
Notifications
Preferences
Privacy
Security
Support
About
```

---

# 22. FAVORITES

Allow saving:

- merchants
- restaurants
- experiences
- services
- places
- products

Create reusable favorites behavior.

---

# 23. HISTORY

Create a meaningful activity history.

Instead of only "orders", support:

```text
Orders
Bookings
Rides
Experiences
Payments
Reviews
```

---

# 24. REVIEWS

Create review infrastructure.

Support:

```text
Rating
Text
Photos
Service rating
Merchant rating
Rider rating
```

Make it extensible.

---

# 25. PROMOTIONS

Create a proper promotion surface.

Examples:

```text
20% off spa
Free delivery
Dinner deal
Weekend experience
Airport transfer discount
```

Do not let promotions overwhelm the interface.

Promotions should appear contextually.

---

# 26. NEXG DESIGN SYSTEM

The existing application should be refactored toward a coherent NEXG design system.

Create semantic tokens.

Examples:

```text
color.background.primary
color.background.secondary

color.surface.primary
color.surface.secondary

color.text.primary
color.text.secondary
color.text.muted

color.action.primary
color.action.secondary

color.success
color.warning
color.error
color.info
```

Avoid arbitrary tokens such as:

```text
gray1
gray2
darkGrayNew
blueFinal
```

---

# 27. TYPOGRAPHY

Create a clear type hierarchy.

Support:

```text
Display
Title
Heading
Body
Label
Caption
Numeric
```

Typography should communicate hierarchy before decoration.

---

# 28. SPACING

Create consistent spacing tokens.

For example:

```text
xs
sm
md
lg
xl
2xl
```

Use the system consistently.

---

# 29. RADII

Create semantic radius tokens.

```text
small
medium
large
pill
sheet
```

Avoid arbitrary values everywhere.

---

# 30. COMPONENT LIBRARY

Build/rebuild reusable components.

At minimum:

```text
NexGButton
NexGIconButton
NexGText
NexGInput
NexGSearch
NexGCard
NexGChip
NexGBadge
NexGAvatar
NexGImage
NexGList
NexGSection
NexGDivider
NexGBottomSheet
NexGModal
NexGToast
NexGBanner
NexGEmptyState
NexGErrorState
NexGSkeleton
NexGLoading
NexGMap
NexGPrice
NexGRating
NexGStatus
NexGDatePicker
NexGTimePicker
NexGStepper
NexGQuantitySelector
NexGPaymentMethod
NexGOrderCard
NexGBookingCard
NexGMerchantCard
NexGExperienceCard
```

Do not create components merely for abstraction's sake.

---

# 31. WIDGET SYSTEM

NEXG should use widgets as living surfaces.

A widget must support:

```text
Compact
Expanded
Focused
Loading
Updating
Success
Error
Empty
Offline
```

Example:

```text
Laundry

READY

Tap
 ↓
Expanded
 ↓
Pickup details
 ↓
Track
```

Another:

```text
Spa

2 appointments available

Tap
 ↓
Available times
 ↓
Select
 ↓
Book
```

Widgets should be interactive, not decorative cards.

---

# 32. PROGRESSIVE REVEAL

Do not expose all information immediately.

Use:

```text
Attention
 ↓
Direction
 ↓
Detail
 ↓
Action
```

The first screen should remain calm.

Advanced details appear when needed.

---

# 33. NEXG UX LAWS

Apply these systematically:

### Attention

Show what matters now.

### Direction

Guide the eye toward the next action.

### Memory

Maintain predictable patterns.

### Action

Minimize friction.

Also apply:

### Jakob's Law

Use familiar patterns where familiarity helps.

### Hick's Law

Reduce unnecessary choices.

### Fitts's Law

Make important targets easy to hit.

### Miller's Law

Avoid excessive simultaneous information.

### Tesler's Law

Complexity that cannot be removed should be handled by NEXG rather than the user.

---

# 34. MOTION

Use Reanimated intelligently.

Motion should communicate:

```text
Cause
Effect
Continuity
Hierarchy
Focus
State change
Feedback
```

Avoid animation simply because animation is possible.

Examples:

```text
Card → detail
Sheet expansion
Widget expansion
Tab transitions
Loading
Success
Payment
Order status
```

Animations should feel fast and deliberate.

---

# 35. GESTURES

Use gestures where they improve interaction.

Examples:

```text
Swipe sheets
Drag map
Swipe cards
Dismiss modal
Expand widget
```

Never make essential functionality gesture-only.

---

# 36. BLUR / GLASS

NEXG can use progressive blur/glass as a visual signature.

Use it purposefully.

Good candidates:

```text
Floating navigation
Headers
Floating action surfaces
Bottom sheets
```

Avoid blurring:

```text
Critical information
Dense primary content
Text that must remain highly readable
```

---

# 37. DARK / LIGHT MODE

Support:

```text
Light
Dark
System
```

Do not simply invert colors.

Use semantic tokens.

Audit:

- contrast
- imagery
- icons
- cards
- sheets
- maps
- overlays
- text

---

# 38. ACCESSIBILITY

Every component must consider:

```text
Screen readers
Semantic labels
Dynamic text
Contrast
Touch targets
Focus
Reduced motion
Error communication
```

Important actions must have sufficient touch targets.

---

# 39. OFFLINE EXPERIENCE

NEXG must handle:

```text
Online
Slow
Offline
Reconnecting
Syncing
```

Do not let a network failure destroy the entire UI.

Use cached data where appropriate.

Clearly communicate stale information.

Example:

```text
Updated 2 min ago
```

rather than pretending data is realtime.

---

# 40. LOADING STATES

Never leave blank screens.

Implement:

```text
Skeletons
Progressive loading
Placeholder content
Optimistic updates where safe
Pull-to-refresh
Retry
```

Prioritize above-the-fold content.

---

# 41. ERROR STATES

Every important operation needs an error experience.

Examples:

```text
Payment failed
Location unavailable
Booking failed
Network error
Service unavailable
Map failed
Order sync failed
Session expired
```

Errors must tell users:

1. What happened.
2. Whether their action succeeded.
3. What they can do next.

---

# 42. EMPTY STATES

Design meaningful empty states.

Examples:

```text
No bookings yet
No favorites
No notifications
No nearby experiences
No search results
No active orders
```

Whenever possible provide a next action.

---

# 43. PERFORMANCE

Audit:

```text
Startup
Navigation
Lists
Images
Maps
Animations
Memory
Network
Battery
```

Use lazy loading.

Defer below-the-fold content.

Do not load every home widget simultaneously.

Priority:

```text
Above fold
 ↓
Important contextual widgets
 ↓
Secondary content
 ↓
Below fold
```

---

# 44. IMAGE PERFORMANCE

Use:

- correct image dimensions
- caching
- lazy loading
- placeholders
- progressive loading

Do not ship massive images unnecessarily.

---

# 45. LIST PERFORMANCE

Use appropriate FlatList/FlashList-style architecture where necessary.

Avoid rendering hundreds of unnecessary components.

Memoize only where useful.

Measure before optimizing blindly.

---

# 46. DATA ARCHITECTURE

Separate:

```text
UI
Domain
State
Data
Services
```

Avoid giant components.

Avoid mixing network calls directly into presentation components.

---

# 47. STATE MANAGEMENT

Use Zustand where appropriate.

Separate state into logical domains.

For example:

```text
userStore
cartStore
bookingStore
orderStore
locationStore
searchStore
notificationStore
favoriteStore
contextStore
```

Do not create one giant global store.

---

# 48. MOCK BACKEND

The current repository uses dummy data.

Keep mock data useful during development.

But structure it like real API data.

Create service interfaces such as:

```ts
getMerchants()
getServices()
getExperiences()
getOrders()
getBookings()
getRecommendations()
getNotifications()
getUser()
```

The UI should not care whether data comes from:

```text
mock
REST
GraphQL
Supabase
FastAPI
```

---

# 49. API-READY ARCHITECTURE

Prepare for a real NEXG backend.

Do not hard-code dummy data throughout components.

Use:

```text
repositories
services
API clients
domain types
DTO mapping
```

This will allow the current prototype to transition into production.

---

# 50. ANALYTICS

Instrument important product events.

Examples:

```text
app_open
search_started
search_completed
merchant_viewed
service_viewed
experience_viewed
map_opened
filter_used
favorite_added
cart_created
checkout_started
payment_started
payment_completed
booking_started
booking_completed
order_created
order_completed
widget_expanded
widget_actioned
notification_opened
```

Analytics should eventually allow NEXG to understand:

```text
What users see
What they ignore
What they click
What they complete
Where they abandon
```

---

# 51. OBSERVABILITY

Use the existing monitoring architecture where appropriate.

Errors should capture:

```text
what
where
when
frequency
device
app version
```

Avoid sensitive user information.

---

# 52. DEEP LINKS

Design routing so that links can open directly into:

```text
Merchant
Service
Experience
Booking
Order
Promotion
Event
```

Example conceptually:

```text
nexg://merchant/123
nexg://experience/456
nexg://booking/789
nexg://order/123
```

---

# 53. NOTIFICATION DEEP LINKS

A notification should be able to take the user directly to the relevant context.

Example:

```text
"Your airport transfer is tomorrow at 10 AM."
```

Tap:

→ transfer details.

---

# 54. AUTHENTICATION

Keep authentication modular.

Support:

```text
Phone
Email
Apple
Google
```

where backend support exists.

Do not force users through unnecessary onboarding.

---

# 55. ONBOARDING

Create lightweight onboarding.

Ask only information that meaningfully improves the product.

Potential:

```text
Name
Location
Interests
Preferred categories
```

Do not create a 10-screen questionnaire.

---

# 56. PERSONALIZATION

Design the system so recommendations can eventually use:

```text
History
Preferences
Location
Time
Property
Activity
Behavior
Bookings
Orders
Favorites
```

The UI should be ready for personalized ranking.

---

# 57. PROPERTY / HOTEL CONTEXT

NEXG is particularly powerful when the consumer is associated with a property.

Support a contextual property mode.

Example:

```text
Welcome to [Hotel]

Your stay

Room service
Breakfast
Spa
Airport transfer
Laundry
Experiences
Local restaurants
Events
```

The app should understand:

```text
Guest
Property
Stay
Room
Available services
```

without turning the consumer app into a hotel-management application.

---

# 58. LOCAL CONTEXT

Location is a major NEXG primitive.

The app should understand:

```text
near me
near my hotel
near my home
near my current location
near an event
near a destination
```

Distance should influence discovery.

---

# 59. TIME CONTEXT

Time should influence the interface.

Examples:

Morning:

```text
Breakfast
Coffee
Airport transfer
```

Afternoon:

```text
Lunch
Activities
Spa
Shopping
```

Evening:

```text
Dinner
Movies
Events
Nightlife
```

Tomorrow:

```text
Safari
Airport transfer
Booking
```

---

# 60. "HAPPENING NOW"

Create a contextual discovery surface:

```text
Happening now
Starting soon
Available now
Available today
Tomorrow
This weekend
```

This should become a signature NEXG feature.

---

# 61. HOME PERSONALIZATION

The home screen should not be a fixed collection of 20 cards.

Create a composable section system.

Example:

```ts
HomeSection =
  | ContextWidget
  | RecommendationCarousel
  | CategoryGrid
  | ActiveOrder
  | UpcomingBooking
  | MerchantList
  | ExperienceList
  | EventList
  | Promotion
```

The backend can eventually control ranking.

---

# 62. UNIVERSAL ACTION MODEL

Important actions should be consistent.

Examples:

```text
Book
Order
Reserve
Buy
Track
View
Save
Share
Contact
Cancel
Repeat
```

The system should know the primary action for each entity.

---

# 63. REPEAT ACTIONS

Support:

```text
Order again
Book again
Repeat transfer
Favorite service
Rebook
```

Memory should reduce friction.

---

# 64. SUPPORT

Create support infrastructure.

Support:

```text
FAQ
Help center
Contact support
Order issue
Booking issue
Payment issue
Safety
Refund
```

Contextual support is preferred.

If a user is viewing an order, support should understand that order.

---

# 65. SECURITY UX

Design consistent states for:

```text
Session expired
Permission denied
Payment verification
Suspicious activity
Account locked
```

Security should feel like part of NEXG rather than a separate application.

---

# 66. CODE QUALITY

Enforce:

- strict TypeScript
- reusable components
- no unnecessary duplication
- no giant screens
- meaningful naming
- predictable folder structure
- clean imports
- no dead code
- no unused dependencies
- no console spam
- no fake production claims

---

# 67. NO PLACEHOLDER UX

Do not leave:

```text
TODO
Coming soon
Lorem ipsum
Fake buttons
Dead navigation
Empty cards
Broken images
```

unless explicitly required for a future integration.

If a feature cannot be fully connected to a backend, create a realistic mock implementation with a clear service boundary.

---

# 68. DO NOT INVENT RANDOM FEATURES

NEXG should become richer, not bloated.

Every new feature should answer:

```text
Does this help the user discover something?
Does this help them decide?
Does this help them act?
Does this help them manage something?
Does this improve context?
```

If not, question the feature.

---

# 69. VISUAL QUALITY BAR

The app should feel:

```text
Premium
Modern
Fast
Calm
Contextual
Confident
Native
Polished
```

Avoid:

```text
Generic SaaS
Generic marketplace
Dashboard-like mobile UI
Excessive cards
Excessive borders
Excessive gradients
Visual clutter
Tiny text
Random colors
Random radii
Inconsistent spacing
```

---

# 70. NEXG VISUAL LANGUAGE

The design should have a distinctive NEXG identity.

Use:

- strong typography
- generous spacing
- clear hierarchy
- restrained color
- purposeful imagery
- subtle motion
- progressive blur where appropriate
- contextual widgets
- high-quality bottom sheets
- native-feeling gestures

Do not simply reproduce Wolt's branding.

Take the interaction quality, not the identity.

---

# 71. NAVIGATION

Navigation should be simple.

Potential structure:

```text
Home
Explore
Activity
Saved
Profile
```

But evaluate the existing implementation before changing it.

The goal is not maximum navigation.

The goal is:

> minimum navigation necessary to access maximum capability.

---

# 72. ACTIVITY

Activity should combine:

```text
Orders
Bookings
Rides
Experiences
Reservations
Payments
```

with clear current/upcoming/past states.

---

# 73. SAVED

Saved should contain:

```text
Favorites
Saved merchants
Saved experiences
Saved services
Saved places
```

---

# 74. EXPLORE

Explore should be discovery-oriented.

It should not duplicate Home.

Home:

> What matters to you now?

Explore:

> What can you discover?

---

# 75. PRODUCT ARCHITECTURE

Aim for:

```text
NEXG
│
├── Context
├── Discovery
├── Search
├── Maps
├── Merchants
├── Services
├── Experiences
├── Orders
├── Bookings
├── Payments
├── Activity
├── Notifications
├── Favorites
├── Profile
├── Support
│
└── Design System
    ├── Tokens
    ├── Components
    ├── Widgets
    ├── States
    ├── Motion
    └── Accessibility
```

---

# 76. COMPONENT GOVERNANCE

Before creating a new component ask:

```text
Does this already exist?

Can an existing component solve it?

Is this genuinely new?

Is it global or feature-specific?

What states does it have?

What accessibility requirements does it have?
```

Avoid component explosion.

---

# 77. ENTITY CONSISTENCY

The same entity must feel like the same entity everywhere.

For example:

```text
ORDER
```

should maintain recognizable:

- name
- status
- imagery
- metadata
- actions
- state language

across Home, Activity, Notifications, Merchant details and tracking.

---

# 78. DESIGN FOR FUTURE VERTICALS

The system must eventually support:

```text
Food
Travel
Hotels
Events
Wellness
Shopping
Transportation
Experiences
Professional services
Automotive
Healthcare
Education
```

Do not build the architecture around restaurants.

Build around:

```text
Context
Provider
Service
Transaction
Booking
Location
Time
```

---

# 79. TESTING

Create tests for:

### Components

- rendering
- states
- interaction

### Navigation

- deep links
- modals
- back behavior

### Transactions

- cart
- checkout
- booking

### State

- persistence
- offline
- errors

### Accessibility

- labels
- focus
- touch targets

---

# 80. DEVICE MATRIX

Test:

```text
Small phone
Standard phone
Large phone
Tablet
```

and:

```text
Light
Dark
System
```

and:

```text
Fast network
Slow network
Offline
```

and ideally:

```text
Low-end
Mid-range
High-end
```

---

# 81. VISUAL QA

Every major screen must be reviewed for:

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
Motion
```

Do not accept:

> "It technically works."

The objective is:

> "It feels finished."

---

# 82. INTERACTION QA

For every major interactive surface:

```text
Idle
 ↓
Tap
 ↓
Transition
 ↓
Focused
 ↓
Action
 ↓
Success
 ↓
Persistence
```

Also test:

```text
Dismiss
Back
Interrupted animation
Network failure
Double tap
Slow response
```

---

# 83. PERFORMANCE QA

Measure:

```text
Startup
Navigation
Screen rendering
List scrolling
Map rendering
Animation FPS
Memory
Image loading
Network usage
```

Do not optimize blindly.

Measure first.

---

# 84. DOCUMENTATION

Create documentation for:

```text
Components
Tokens
Widgets
Entities
States
Navigation
Services
API boundaries
Analytics
Accessibility
```

The documentation should eventually allow another engineer or AI agent to extend NEXG without inventing a new design language.

---

# 85. IMPLEMENTATION STRATEGY

Do NOT attempt a massive rewrite in one uncontrolled operation.

Work in phases.

## PHASE 1 - AUDIT

Inspect everything.

Output internally:

```text
Existing
Reusable
Needs modification
Missing
Broken
Deprecated
```

## PHASE 2 - FOUNDATION

Establish:

```text
Design tokens
Theme
Typography
Spacing
Navigation
Core components
State conventions
Domain models
Service boundaries
```

## PHASE 3 - HOME

Build the NEXG contextual home.

## PHASE 4 - DISCOVERY

Build:

```text
Explore
Search
Filters
Map
Categories
```

## PHASE 5 - ENTITY EXPERIENCE

Build:

```text
Merchant
Service
Experience
Product
Event
```

## PHASE 6 - TRANSACTIONS

Build:

```text
Cart
Booking
Checkout
Payment
Confirmation
```

## PHASE 7 - ACTIVITY

Build:

```text
Orders
Bookings
Tracking
History
Notifications
```

## PHASE 8 - PERSONALIZATION

Build:

```text
Favorites
Recommendations
Context
History
```

## PHASE 9 - POLISH

Audit:

```text
Motion
Accessibility
Offline
Loading
Errors
Empty states
Performance
```

## PHASE 10 - FINAL QA

Run the full product through realistic user journeys.

---

# 86. REALISTIC USER JOURNEYS

Test at least these:

### Journey 1 - Food

```text
Home
→ restaurant
→ menu
→ item
→ cart
→ checkout
→ payment
→ order
→ tracking
→ completion
```

### Journey 2 - Spa

```text
Home
→ contextual recommendation
→ spa
→ treatment
→ date
→ time
→ checkout
→ booking
→ activity
```

### Journey 3 - Safari

```text
Explore
→ experience
→ details
→ date
→ guests
→ booking
→ payment
→ confirmation
```

### Journey 4 - Airport Transfer

```text
Home
→ airport transfer
→ pickup
→ destination
→ time
→ vehicle
→ payment
→ booking
→ tracking
```

### Journey 5 - Event

```text
Explore
→ event
→ tickets
→ quantity
→ checkout
→ ticket
```

### Journey 6 - Hotel Guest

```text
Property context
→ room service
→ spa
→ laundry
→ local experiences
→ booking
```

---

# 87. CRITICAL PRINCIPLE

Do not confuse:

```text
more features
```

with:

```text
better product
```

The goal is:

> **more capability with less perceived complexity.**

This is where Tesler's Law matters.

NEXG can have enormous backend complexity while the user experience remains simple.

---

# 88. WHAT SUCCESS LOOKS LIKE

When finished, a user should be able to open NEXG and immediately understand:

```text
Where am I?
What is happening around me?
What can I do?
What should I do next?
What have I already booked?
What am I waiting for?
```

without having to understand the underlying NEXG platform.

---

# 89. FINAL PRODUCT TEST

Ask these questions:

### Attention

Does the screen immediately show what matters?

### Direction

Does the user know what to do next?

### Memory

Does the interface behave consistently?

### Action

Can the user complete the task quickly?

### Complexity

Is NEXG doing the hard work instead of the user?

### Context

Does the interface understand:

```text
who
where
when
what
```

?

### Quality

Does the app feel like a serious consumer product rather than a prototype?

---

# 90. IMPORTANT AGENT BEHAVIOR

You are allowed to:

- refactor
- reorganize
- create components
- create stores
- create services
- improve navigation
- improve animations
- improve visual design
- add missing screens
- improve state handling
- introduce sensible abstractions
- remove obsolete code
- improve performance

But:

**DO NOT destroy working functionality without understanding it first.**

**DO NOT rewrite the whole application merely for aesthetic reasons.**

**DO NOT create fake backend integrations.**

**DO NOT hard-code production assumptions.**

**DO NOT create dozens of unnecessary components.**

**DO NOT turn the application into a dashboard.**

**DO NOT make every screen a card grid.**

**DO NOT copy Wolt's branding.**

Use Wolt as the technical and interaction starting point.

Build NEXG as its own product.

---

# 91. FINAL DIRECTIVE

Take the existing application from:

> "A very good Wolt-style React Native prototype"

to:

> **"A coherent, polished NEXG consumer application that is architecturally ready to become a real product."**

The application should feel like one system.

Not a collection of screens.

Not a Wolt clone with extra buttons.

Not a marketplace with many categories.

It should feel like:

# NEXG

> **The system that understands the context around you and coordinates what you need next.**

Start by auditing the existing repository.

Do not ask for permission to inspect the code.

Do not stop at identifying problems.

Identify → prioritize → implement → test → polish.

After each major phase:

1. Run the app.
2. Inspect the result.
3. Fix visual inconsistencies.
4. Fix interaction issues.
5. Fix TypeScript errors.
6. Fix runtime errors.
7. Test the primary journeys.
8. Continue to the next phase.

The final standard is not "feature complete."

The final standard is:

**coherent, fast, contextual, beautiful, extensible, and genuinely usable.**

One important thing I'd add to your agent workflow: **don't have it implement all 90 sections blindly in one shot.** The repository already has 40 commits and a fairly clean separation between `app`, `components`, `constants`, `data`, `hooks`, `services`, and `utils`, so an agent that starts rewriting everything could easily destroy the good foundation. ([GitHub](https://github.com/Galaxies-dev/wolt-react-native))

The prompt deliberately tells it to **audit → preserve → refactor → expand → polish**.

And the biggest conceptual shift is this:

**Wolt gives you the transaction/discovery skeleton. NEXG needs to add the context layer above it.**

That's what turns:

`Restaurant → Menu → Cart → Checkout`

into:

`Context → What matters now → Discover → Service/Experience → Book/Order → Track → Remember → Recommend what comes next.`

That is much closer to the NEXG product you've been defining. `Branch · UX Design Laws.txt`

---

**Sources:**

- [GitHub - Galaxies-dev/wolt-react-native · GitHub](https://github.com/Galaxies-dev/wolt-react-native)



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)