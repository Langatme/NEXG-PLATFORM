# NEXG App Components

**User:** Anonymous  
**Created:** 8/6/2026 20:46:39  
**Updated:** 8/9/2026 6:56:11  
**Exported:** 9/10/2026 18:53:49  
**Link:** [https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a74c869-be80-83ea-9d8f-474dac1af5d1](https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a74c869-be80-83ea-9d8f-474dac1af5d1)  

## Prompt:
8/6/2026, 8:46:37 PM

What components exist inside the wolt app
All of them

## Response:
8/6/2026, 8:46:39 PM

> **Searching the web**
>
>
> **Searching arxiv.org**
>
> 
>
> Worked for a couple of seconds

If you're trying to build something that matches Wolt's level of polish (like your NEXG consumer app), it helps to think of the app as **hundreds of reusable components**, not just screens.

Based on Wolt's consumer app, their recent navigation redesign, and common mobile architecture, these are the major UI components and building blocks. ([press.wolt.com](https://press.wolt.com/en-WW/259625-wolt-app-updated-a-new-way-to-discover-everything-around-you/?utm_source=chatgpt.com))

# 1. App Foundation

- Splash Screen
- Animated Logo
- Loading Screen
- Onboarding
- Permissions
- Login
- Registration
- OTP Verification
- Biometric Login
- Location Permission
- Notification Permission
- Error Screen
- Offline Screen
- Maintenance Screen
- Force Update Screen

---

# 2. Navigation

- Floating Search/Browse Button
- Bottom Navigation
- Back Button
- Floating Basket
- Floating Checkout
- Profile Shortcut
- Activity Button
- Modal Navigation
- Bottom Sheets
- Side Panels
- Deep Links
- Search Overlay

---

# 3. Home Screen Components

- Delivery Address
- Delivery Time
- Search Bar
- Promotional Banner
- Carousel
- Story Cards
- Categories
- Collections
- Recently Ordered
- Favorites
- Popular Nearby
- Recommended
- Trending
- New on Platform
- Sponsored Merchants
- Continue Shopping
- Flash Deals
- Grocery Shelf
- Retail Shelf
- Restaurant Shelf
- Pharmacy Shelf
- Package Delivery
- Seasonal Cards

---

# 4. Merchant Components

- Merchant Hero Banner
- Merchant Logo
- Rating
- Distance
- Delivery Time
- Delivery Fee
- Pickup Badge
- Open/Closed Badge
- Busy Badge
- Discount Badge
- Wolt+ Badge
- Category Chips
- Image Gallery
- Merchant Description
- Merchant Information
- Opening Hours
- Delivery Zones

---

# 5. Product Components

- Product Card
- Product Image
- Product Name
- Price
- Old Price
- Discount Label
- Quantity Selector
- Add Button
- Plus Button
- Minus Button
- Popular Badge
- Bestseller Badge
- Sold Out Badge
- Dietary Tags
- Allergens
- Calories
- Nutrition
- Customizations
- Variant Selector
- Product Gallery

---

# 6. Search

- Universal Search
- Voice Search (where supported)
- Recent Searches
- Trending Searches
- Search Suggestions
- Category Search
- Merchant Search
- Product Search
- Filters
- Sort
- Search Empty State

---

# 7. Categories

- Food
- Grocery
- Pharmacy
- Electronics
- Flowers
- Pets
- Alcohol (country dependent)
- Convenience
- Beauty
- Bakery
- Desserts
- Retail
- Package Delivery
- Gift Cards

---

# 8. Shopping Cart

- Cart Items
- Merchant Group
- Quantity Controls
- Notes
- Cutlery Toggle
- Promo Code
- Delivery Fee
- Service Fee
- Tip
- Taxes
- Total
- Checkout Button
- Empty Cart

---

# 9. Checkout

- Delivery Address
- Map Picker
- Saved Addresses
- Schedule Delivery
- ASAP Delivery
- Payment Method
- Coupon
- Gift Card
- Order Notes
- Contactless Delivery
- Call on Arrival
- Door Instructions
- Invoice Details
- Place Order Button

---

# 10. Payment

- Credit Cards
- Apple Pay
- Google Pay
- Saved Cards
- Wallet
- Gift Card
- Split Payment
- Payment Success
- Payment Failed

---

# 11. Live Order Tracking

- Status Timeline
- Merchant Preparing
- Courier Assigned
- Courier Map
- Live Location
- ETA
- Call Courier
- Chat
- Order Number
- Receipt
- Delivery Confirmation
- PIN Verification (some markets)

---

# 12. Profile

- User Avatar
- Personal Information
- Saved Addresses
- Payment Methods
- Favorites
- Order History
- Wolt+ Membership
- Rewards
- Referrals
- Notifications
- Language
- Help
- Settings
- Logout

---

# 13. Order History

- Previous Orders
- Reorder
- Receipt
- Invoice
- Rate Merchant
- Rate Courier
- Report Problem
- Support Chat

---

# 14. Notifications

- Push Notifications
- Promotions
- Order Updates
- Messages
- Activity Feed
- Coupons
- Recommendations

---

# 15. Offers

- Campaign Cards
- Coupons
- Free Delivery
- Buy One Get One
- Cashback
- Loyalty Rewards
- Referral Rewards

---

# 16. Reviews

- Star Rating
- Review Summary
- Photos
- Merchant Reply
- Helpful Votes

---

# 17. Maps

- Address Search
- Pin Placement
- Courier Tracking
- Merchant Location
- Delivery Radius
- Route Preview

---

# 18. Support

- FAQ
- Live Chat
- Call Support
- Refund Request
- Missing Item
- Wrong Item
- Late Delivery
- Cancel Order
- Report Courier
- Report Merchant

---

# 19. Reusable UI Components

- Cards
- Buttons
- Chips
- Pills
- Avatars
- Icons
- Badges
- Carousels
- Lists
- Tiles
- Dividers
- Progress Bars
- Skeleton Loaders
- Shimmer Loading
- Empty States
- Error States
- Snackbars
- Toasts
- Dialogs
- Modals
- Bottom Sheets
- Floating Action Buttons
- Tabs
- Accordions
- Stepper
- Rating Stars
- Image Viewer
- Video Player
- Counters
- Timers
- Tag Clouds
- Search Suggestions
- Calendar Picker
- Time Picker
- Toggle Switches
- Radio Buttons
- Checkboxes
- Text Inputs
- OTP Inputs
- PIN Inputs
- Password Fields
- Dropdowns

---

# 20. Animations

- Splash Animation
- Logo Morph
- Page Transition
- Card Expansion
- Hero Animation
- Basket Fly Animation
- Add-to-Cart Animation
- Swipe Gestures
- Pull-to-Refresh
- Bounce Effects
- Haptic Feedback
- Skeleton Fade
- Shimmer
- Success Animation
- Confetti
- Progress Indicators
- Loading Spinners

---

## Approximate component count

A production-quality app at Wolt's level typically includes:

| Layer | Approx. components |
|-------|-------------------:|
| Foundation | 20-30 |
| Navigation | 20-30 |
| Commerce | 80-120 |
| Maps & Delivery | 30-50 |
| Checkout & Payments | 40-60 |
| Profile & Settings | 40-60 |
| Reusable UI Kit | 120-180 |
| Animations & States | 80-120 |
| **Total** | **430-650 reusable components** |

The key insight is that Wolt feels simple because it relies on a large design system of reusable components. Around **90% of the interface is assembled from these shared building blocks**, with only a small portion being unique to individual screens. This component-driven approach is what makes the app feel consistently polished while remaining scalable. ([press.wolt.com](https://press.wolt.com/en-WW/259625-wolt-app-updated-a-new-way-to-discover-everything-around-you/?utm_source=chatgpt.com))

---

**Sources:**

- [Wolt App updated: A New Way to Discover Everything Around You | Wolt Newsroom](https://press.wolt.com/en-WW/259625-wolt-app-updated-a-new-way-to-discover-everything-around-you/?utm_source=chatgpt.com)

## Prompt:
8/9/2026, 6:25:20 AM

Now for NexG

We are building a merchants app,
Portal, website, rider app, portal, host app, portal( all portals are through the website) 
And admin and monitoring app and portal

## Response:
8/9/2026, 6:25:21 AM

Exactly. For **NEXG**, we should not copy Wolt's component list directly. We should build a **shared NEXG Component System** that serves all of your surfaces.

You effectively have **6 product surfaces**, with web portals attached to the operational products:

1. **NEXG Consumer App**
2. **Merchant App + Merchant Portal**
3. **Rider App + Rider Portal**
4. **Host App + Host Portal**
5. **Admin App + Admin Portal**
6. **Monitoring / Operations App + Monitoring Portal**

The important architectural decision is:

> **One NEXG Design System → multiple products → shared components → specialized components.**

### NEXG Product Surface Map

| Product | Mobile | Web Portal | Primary purpose |
|---|---|---|---|
| **Consumer** | App | - | Discover, order, book, request |
| **Merchant** | App | Portal | Manage business, products, orders |
| **Rider** | App | Portal | Deliveries, navigation, earnings |
| **Host** | App | Portal | Properties, guests, concierge |
| **Admin** | App | Portal | Platform administration |
| **Monitoring** | App | Portal | Infrastructure, operations, observability |

---

# 1. NEXG Foundation Components

These should exist across **almost every product**.

### Identity

- Login
- Registration
- OTP
- MFA
- Password reset
- Session management
- Device verification
- Biometric authentication
- Account switching
- Organization switching
- Role switching
- Permission prompts
- Identity verification
- Profile
- Avatar
- Presence
- Online/offline status

### Global UI

- App shell
- Web shell
- Header
- Navigation
- Bottom navigation
- Sidebar
- Command bar
- Search
- Global search
- Breadcrumbs
- Tabs
- Segmented controls
- Filters
- Sort
- Pagination
- Infinite scroll
- Cards
- Lists
- Tables
- Grids
- Kanban
- Timeline
- Calendar
- Map
- Drawer
- Side panel
- Modal
- Bottom sheet
- Popover
- Tooltip
- Toast
- Snackbar
- Alert
- Confirmation
- Empty state
- Error state
- Offline state
- Loading state
- Skeleton
- Progress indicator

---

# 2. NEXG Entity Components

This is particularly important because of your **Single Surface / Context First** philosophy.

Everything should revolve around entities.

### Core entities

- Customer
- Merchant
- Host
- Property
- Rider
- Order
- Booking
- Service
- Product
- Category
- Delivery
- Payment
- Transaction
- Invoice
- Promotion
- Review
- Ticket
- Message
- Document
- Vehicle
- Employee
- User
- Organization

Each entity should have reusable:

**Entity Card**

**Entity Header**

**Entity Avatar**

**Entity Status**

**Entity Metadata**

**Entity Timeline**

**Entity Activity**

**Entity Actions**

**Entity Details**

**Entity Documents**

**Entity Notes**

**Entity Relationships**

**Entity History**

**Entity Settings**

This becomes the foundation of NEXG.

---

# 3. Consumer App

This is your Wolt/Glovo-like experience.

### Discovery

- Home
- Search
- Categories
- Services
- Collections
- Recommendations
- Nearby
- Featured
- Promotions
- Recently viewed
- Favorites
- Reorder

### Merchant discovery

- Merchant card
- Merchant header
- Merchant profile
- Rating
- Delivery ETA
- Delivery fee
- Minimum order
- Open/closed state
- Promotions
- Menu/catalog
- Product categories

### Commerce

- Product card
- Product detail
- Variants
- Add-ons
- Customization
- Quantity
- Cart
- Multi-item cart
- Notes
- Promo code
- Checkout

### Delivery

- Address
- Map picker
- Delivery instructions
- Delivery time
- ASAP
- Scheduled delivery
- Rider tracking
- ETA
- Delivery status
- Contact rider
- Delivery confirmation

### Post-order

- Receipt
- Rating
- Review
- Reorder
- Support
- Refund
- Report problem

---

# 4. Merchant App + Portal

This should be much deeper than a normal merchant dashboard.

### Business

- Business profile
- Business identity
- Branches
- Operating hours
- Service areas
- Staff
- Roles
- Permissions
- Business documents
- Compliance

### Catalog

- Products
- Services
- Categories
- Subcategories
- Variants
- Add-ons
- Modifiers
- Pricing
- Inventory
- Availability
- Images
- Bulk editing

### Orders

- New orders
- Active orders
- Preparing
- Ready
- Completed
- Cancelled
- Order details
- Order timeline
- Customer details
- Order notes
- Refunds
- Issues

### Merchant operations

- POS integration
- Kitchen display
- Printer
- Preparation time
- Order throttling
- Busy mode
- Temporary closure
- Stock availability

### Financial

- Revenue
- Transactions
- Commission
- Fees
- Payouts
- Statements
- Invoices
- Tax
- eTIMS
- Payment reconciliation

### Analytics

- Sales
- Orders
- Customers
- Products
- Average order value
- Cancellation rate
- Delivery performance
- Customer ratings
- Revenue trends

### Communication

- Customer messages
- NEXG notifications
- Support
- Announcements

---

# 5. Rider App + Portal

The rider interface should be extremely **action-oriented**.

### Rider home

- Online/offline
- Current location
- Earnings today
- Active delivery
- Available jobs
- Performance

### Delivery

- Delivery request
- Accept/reject
- Pickup navigation
- Pickup verification
- Merchant contact
- Customer navigation
- Delivery instructions
- Arrival
- Proof of pickup
- Proof of delivery
- OTP/PIN
- Signature
- Photo
- Failed delivery

### Rider operations

- Route
- Navigation
- Multi-stop delivery
- Delivery queue
- Vehicle
- Fuel
- Documents
- Availability

### Money

- Earnings
- Bonuses
- Incentives
- Tips
- Withdrawals
- Statements
- Payment history

### Rider portal

- Performance
- Earnings
- Deliveries
- Documents
- Vehicle
- Schedule
- Support
- Account

---

# 6. Host App + Portal

This is where NEXG becomes significantly different from Wolt.

### Property

- Property portfolio
- Property card
- Property profile
- Rooms
- Units
- Amenities
- Photos
- Property documents
- Availability
- Pricing

### Guest

- Guest profile
- Current guests
- Upcoming guests
- Guest history
- Guest preferences
- Guest requests
- Guest communication

### Concierge

- Guest request
- Service request
- Restaurant order
- Grocery order
- Laundry
- Housekeeping
- Transport
- Spa
- Experiences
- Tickets
- Special requests

### Property operations

- Check-in
- Check-out
- Cleaning
- Maintenance
- Housekeeping
- Room status
- Staff
- Tasks
- Incidents

### Host financials

- Revenue
- Bookings
- Concierge revenue
- Commission
- Expenses
- Payouts
- Statements

---

# 7. Admin App + Portal

Admin is fundamentally different.

It's not primarily a CRUD application.

It's a **control system**.

### Platform overview

- Global KPIs
- Orders
- Deliveries
- Bookings
- Merchants
- Hosts
- Riders
- Customers
- Properties
- Revenue

### Entity management

- Merchant management
- Rider management
- Host management
- Customer management
- Property management
- Employee management

### Operations

- Live orders
- Live deliveries
- Live riders
- Service incidents
- Failed orders
- Cancellations
- Refunds
- Disputes

### Financial control

- Transactions
- Payments
- Commissions
- Payouts
- Refunds
- Reconciliation
- Tax
- Financial reports

### Platform configuration

- Categories
- Subcategories
- Service types
- Pricing
- Commission rules
- Delivery rules
- Geographic zones
- Promotions
- Feature flags
- Permissions

---

# 8. Monitoring / Operations

I would actually separate this conceptually from normal administration.

Admin asks:

> **"What is happening in the business?"**

Monitoring asks:

> **"Is NEXG itself working?"**

### Infrastructure

- Server health
- CPU
- RAM
- Disk
- Network
- Database
- Redis
- API
- Storage

### Application

- API latency
- Error rates
- Request rates
- Failed requests
- Authentication failures
- Queue health
- WebSocket connections
- Integration health

### Business monitoring

This is particularly powerful:

- Orders/minute
- Failed payments
- Delivery delays
- Merchant downtime
- Rider shortages
- Booking failures
- Abnormal cancellations
- Revenue anomalies

### Security

- Login attempts
- Failed authentication
- Suspicious activity
- Permission changes
- API abuse
- Rate-limit events
- Audit logs

### Incident management

- Incident
- Alert
- Severity
- Timeline
- Affected services
- Assignment
- Acknowledgement
- Resolution
- Postmortem

---

# 9. NEXG Communication System

Shared across all products.

### Messaging

- 1:1 chat
- Group chat
- Customer ↔ Merchant
- Customer ↔ Rider
- Guest ↔ Host
- Host ↔ Merchant
- Staff chat
- Support chat

### Notifications

- Push
- SMS
- Email
- In-app
- WhatsApp where integrated

### Communication components

- Notification center
- Notification badge
- Message composer
- Attachment picker
- Conversation list
- Chat bubbles
- Read receipts
- Typing indicator
- System messages
- Templates
- Notification preferences

---

# 10. NEXG Financial Components

Shared everywhere money exists.

- Price
- Discount
- Tax
- Fee
- Commission
- Tip
- Total
- Payment method
- Payment status
- Transaction
- Refund
- Payout
- Wallet
- Ledger
- Invoice
- Receipt
- Statement
- Reconciliation

And critically:

### Money Display Component

Every financial value should have consistent:

**Currency → amount → tax treatment → status → source**

---

# 11. NEXG Maps & Location

Shared by consumer, rider, host and admin.

- Map
- Marker
- Cluster
- User location
- Merchant location
- Property location
- Rider location
- Route
- ETA
- Geofence
- Delivery zone
- Service area
- Address picker
- Location search
- Navigation handoff
- Distance calculation

---

# 12. NEXG Workflow Components

This is another major layer.

Instead of every team building its own workflow UI:

- Status
- State machine
- Timeline
- Task
- Assignment
- Approval
- Rejection
- Escalation
- SLA
- Checklist
- Progress
- Workflow step
- Workflow history

For example:

**Order**

`Created → Confirmed → Preparing → Ready → Assigned → Picked Up → Delivered → Completed`

The same underlying workflow component can power different products.

---

# 13. NEXG AI Components

Eventually:

- AI assistant
- Entity assistant
- Smart search
- Natural-language commands
- Recommendations
- Fraud detection UI
- Anomaly detection
- Smart summaries
- Automated categorization
- Suggested actions
- Predictive ETA
- Demand prediction
- Intelligent routing

---

# 14. NEXG Design-System Components

And underneath everything:

### Primitive

- Color
- Typography
- Spacing
- Radius
- Shadow
- Icon
- Image
- Avatar
- Divider

### Controls

- Button
- Input
- Select
- Checkbox
- Radio
- Switch
- Slider
- Date picker
- Time picker
- Search
- Upload

### Feedback

- Toast
- Alert
- Banner
- Progress
- Skeleton
- Empty
- Error
- Success
- Confirmation

### Layout

- Stack
- Grid
- Container
- Section
- Sheet
- Drawer
- Modal
- Panel
- Split view

---

# The important part: don't build 6 separate design systems

I'd structure NEXG like this:

```text
                    NEXG DESIGN SYSTEM
                           │
              ┌────────────┴────────────┐
              │                         │
        CORE COMPONENTS          ENTITY SYSTEM
              │                         │
       ┌──────┼──────┐          ┌───────┼───────┐
       │      │      │          │       │       │
     Mobile  Web   Responsive  Merchant Host   Rider
       │      │                    │       │      │
       └──────┴────────────────────┴───────┴──────┘
                           │
                    DOMAIN COMPONENTS
                           │
       ┌──────────┬────────┼────────┬──────────┐
       │          │        │        │          │
   Commerce   Delivery  Property Finance   Operations
       │          │        │        │          │
       └──────────┴────────┴────────┴──────────┘
                           │
                     PRODUCT SURFACES
                           │
      Consumer │ Merchant │ Rider │ Host │ Admin │ Monitoring
```

## And I would classify every NEXG component into 7 levels

| Level | What it means |
|---|---|
| **L0 - Primitive** | Icon, text, spacing, color |
| **L1 - Control** | Button, input, switch, selector |
| **L2 - Pattern** | Card, list, table, modal |
| **L3 - Entity** | Merchant Card, Order Card, Property Card |
| **L4 - Workflow** | Checkout, Delivery, Booking, Payout |
| **L5 - Domain** | Commerce, Hospitality, Mobility, Concierge |
| **L6 - Product** | Consumer, Merchant, Rider, Host, Admin, Monitoring |

That gives us a **single NEXG component universe** instead of randomly creating UI pieces as we build each application.

And given the work we've already done on NEXG's character system, merchant taxonomy, host model, portals, smart panels, and single-surface philosophy, I'd take this one step further: **we should create a complete NEXG Component Inventory before building the individual apps**-with every component assigned an ID, category, subcategory, purpose, states, variants, responsive behavior, permissions, and which of the six products can use it.

## Prompt:
8/9/2026, 6:55:59 AM

Does this help????

For NEXG, I would actually distinguish between Components and Flows/Scenes. A login screen isn’t just a component; it’s a reusable composition of many components.

NEXG Design Library — revised architecture

NEXG DESIGN SYSTEM
│
├── 01. FOUNDATIONS
│   ├── Typography
│   ├── Colors
│   ├── Spacing
│   ├── Grid
│   ├── Radius
│   ├── Elevation
│   ├── Motion
│   ├── Blur
│   └── Accessibility
│
├── 02. PRIMITIVES
│   ├── Text
│   ├── Icon
│   ├── Image
│   ├── Avatar
│   ├── Divider
│   ├── Badge
│   ├── Status
│   └── Progress
│
├── 03. INPUTS & CONTROLS
│   ├── Text Input
│   ├── Search
│   ├── Number Input
│   ├── Password
│   ├── OTP
│   ├── Checkbox
│   ├── Radio
│   ├── Toggle
│   ├── Switch
│   ├── Select
│   ├── Multi-select
│   ├── Slider
│   ├── Segmented Control
│   └── Stepper
│
├── 04. DATE & TIME
│   ├── Date Picker
│   ├── Date Range Picker
│   ├── Time Picker
│   ├── Date + Time Picker
│   ├── Calendar
│   ├── Availability Calendar
│   ├── Schedule
│   ├── Timeline
│   └── Recurring Schedule
│
├── 05. LOCATION & MAPS
│   ├── Location Picker
│   ├── Current Location
│   ├── Address Search
│   ├── Address Card
│   ├── Map
│   ├── Map Marker
│   ├── Route
│   ├── ETA
│   ├── Delivery Tracking
│   ├── Geofence
│   └── Location Permission
│
├── 06. AUTHENTICATION
│   ├── Welcome
│   ├── Login
│   ├── Sign Up
│   ├── Phone Login
│   ├── Email Login
│   ├── OTP Verification
│   ├── Password
│   ├── Forgot Password
│   ├── Reset Password
│   ├── MFA
│   ├── Passkey
│   ├── Account Recovery
│   └── Verification
│
├── 07. ONBOARDING
│   ├── Welcome
│   ├── Introduction
│   ├── Permissions
│   ├── Location Setup
│   ├── Profile Setup
│   ├── Preferences
│   ├── Business Setup
│   ├── Property Setup
│   ├── Rider Setup
│   └── Completion
│
├── 08. NAVIGATION
│   ├── Bottom Navigation
│   ├── Top Navigation
│   ├── Floating Navigation
│   ├── Tabs
│   ├── Sidebar
│   ├── Breadcrumbs
│   ├── Back
│   └── Command/Search
│
├── 09. SURFACES
│   ├── Card
│   ├── Widget
│   ├── Sheet
│   ├── Modal
│   ├── Drawer
│   ├── Popover
│   ├── Context Menu
│   └── Floating Panel
│
├── 10. FEEDBACK
│   ├── Toast
│   ├── Alert
│   ├── Confirmation
│   ├── Success
│   ├── Error
│   ├── Warning
│   ├── Offline
│   ├── Loading
│   ├── Skeleton
│   └── Empty State
│
├── 11. COMMERCE
│   ├── Product Card
│   ├── Cart
│   ├── Order
│   ├── Checkout
│   ├── Payment
│   ├── Tip
│   ├── Coupon
│   ├── Invoice
│   └── Receipt
│
├── 12. COMMUNICATION
│   ├── Chat
│   ├── Message
│   ├── Call
│   ├── Notification
│   ├── Inbox
│   └── Support
│
├── 13. DATA
│   ├── List
│   ├── Table
│   ├── Chart
│   ├── KPI
│   ├── Filter
│   ├── Sort
│   ├── Search Results
│   └── Timeline
│
├── 14. NEXG DOMAIN COMPONENTS
│   ├── Merchant
│   ├── Property
│   ├── Guest
│   ├── Booking
│   ├── Order
│   ├── Delivery
│   ├── Rider
│   ├── Restaurant
│   ├── Service
│   ├── Payment
│   └── Task
│
└── 15. COMPLETE FLOWS / SCENES
    ├── Consumer
    │   ├── First Launch
    │   ├── Login
    │   ├── Location Setup
    │   ├── Home
    │   ├── Explore
    │   ├── Search
    │   ├── Product
    │   ├── Cart
    │   ├── Checkout
    │   ├── Live Order
    │   └── Order History
    │
    ├── Merchant
    │   ├── Login
    │   ├── Onboarding
    │   ├── Workspace
    │   ├── Order
    │   ├── Booking
    │   ├── Analytics
    │   └── Settings
    │
    ├── Host
    │   ├── Login
    │   ├── Property Setup
    │   ├── Portfolio
    │   ├── Property
    │   ├── Booking
    │   ├── Guest
    │   ├── Housekeeping
    │   └── Maintenance
    │
    └── Rider
        ├── Login
        ├── Verification
        ├── Home
        ├── Available Orders
        ├── Active Delivery
        ├── Navigation
        ├── Earnings
        └── Profile

So, to your question: yes and no.

A Date Picker is a component.

A Login Screen is a composition/scene made from components:

Login Screen
│
├── Logo
├── Heading
├── Phone/Email Input
├── Password/OTP
├── Primary Button
├── Social/Passkey option
├── Forgot Password
├── Error State
├── Loading State
└── Support

Likewise:

Location Permission Screen
│
├── Illustration
├── Location Icon
├── Explanation
├── Primary Button
├── Not Now
└── Permission State

And:

Date Booking Flow
│
├── Calendar
├── Date Range Picker
├── Availability
├── Time Picker
├── Guest Selector
├── Price Summary
└── Continue

So we collect the individual pieces once, then compose them into reusable scenes.

⸻

This changes the 300–600 target

I’d now define the goal as:

300–600+ reusable component variants

PLUS

50–100+ reusable flows/scenes

That’s much stronger.

For example, we could have:

Component

NexGDatePicker

with:

* Light
* Dark
* Mobile
* Desktop
* Compact
* Expanded
* Range
* Disabled dates
* Selected
* Loading
* Error

Then the same DatePicker appears in:

* Consumer booking
* Merchant scheduling
* Host reservations
* Rider availability
* Admin filtering
* Analytics date ranges

We don’t build six date pickers.

⸻

And I’d add one more category: System States

This is particularly important for NEXG.

Every major screen should have predefined states:

DEFAULT
LOADING
EMPTY
ERROR
OFFLINE
NO_PERMISSION
PARTIAL
SUCCESS
UPDATING
DISABLED
FOCUSED
SELECTED
EXPANDED
COLLAPSED

For example, the Location system isn’t just a location picker:

Location
│
├── Permission not requested
├── Permission requested
├── Permission granted
├── Permission denied
├── Permission permanently denied
├── GPS unavailable
├── Searching
├── Location found
├── Location inaccurate
├── Manual address
├── Saved address
└── Offline

That level of completeness is what will make the NEXG system genuinely reusable rather than just a collection of pretty UI components.

So our collection target should be:

One NEXG Design System → 300–600+ component variants → 50–100+ reusable scenes → all four apps assembled from the same primitives.

And progressive blur, monochrome iconography, dark/light themes, motion, widget expansion and the Attention → Direction → Memory → Action principles become system-level rules, rather than things we have to remember when designing each individual app.

Yes — States and Widgets should be first-class categories, not buried under generic components.

For NEXG, I would make them two of the most important layers because your entire product philosophy depends on live, expandable, state-aware workspaces.

NEXG DESIGN SYSTEM

01 Foundations
02 Primitives
03 Controls & Inputs
04 Date & Time
05 Location & Maps
06 Authentication
07 Onboarding
08 Navigation
09 Surfaces
10 Feedback
11 Commerce
12 Communication
13 Data
14 Domain Components
15 WIDGETS
16 STATES
17 Complete Scenes / Flows

⸻

15 — WIDGETS

A widget is not a card.

A card displays information.

A NEXG widget can display, update, expand, interact, execute actions, and change state.

Every widget should therefore have a standardized lifecycle.

HIDDEN
   ↓
COMPACT
   ↓
EXPANDED
   ↓
FOCUSED
   ↓
FULL WORKSPACE
   ↓
COLLAPSED

And widgets can be:

* Static
* Interactive
* Live
* Actionable
* Personalized
* Reorderable
* Pinnable
* Expandable

⸻

Universal NEXG Widgets

Operational

Order Widget
Booking Widget
Delivery Widget
Task Widget
Queue Widget
Dispatch Widget
Schedule Widget
Calendar Widget
Activity Widget
Notification Widget

Commerce

Cart Widget
Payment Widget
Revenue Widget
Sales Widget
Transaction Widget
Invoice Widget
Settlement Widget

People

Customer Widget
Guest Widget
Merchant Widget
Rider Widget
Employee Widget
Team Widget

Property

Property Widget
Room Widget
Occupancy Widget
Housekeeping Widget
Maintenance Widget
Availability Widget

Discovery

Restaurant Widget
Product Widget
Service Widget
Experience Widget
Offer Widget
Recommendation Widget
Nearby Widget

Logistics

Live Delivery Widget
Map Widget
Route Widget
ETA Widget
Driver Widget
Vehicle Widget
Pickup Widget
Drop-off Widget

Intelligence

Insight Widget
Alert Widget
Recommendation Widget
AI Assistant Widget
Forecast Widget
Anomaly Widget
Performance Widget

⸻

The important part: Widget Anatomy

Every NEXG widget should follow a common structure.

┌──────────────────────────────────┐
│ ICON  TITLE                 ⋯    │
│                                  │
│ PRIMARY INFORMATION              │
│                                  │
│ Secondary context                │
│                                  │
│ STATUS                           │
│                                  │
│ [Primary Action]                 │
└──────────────────────────────────┘

But depending on state, that same widget can transform.

Compact

┌──────────────────────────┐
│ 🚚 Deliveries       3    │
│ 1 requires attention     │
└──────────────────────────┘

Expanded

┌──────────────────────────┐
│ ← Deliveries             │
│                          │
│ 3 Active                 │
│                          │
│ Order #1234              │
│ Preparing                │
│                          │
│ Order #1235              │
│ Ready                    │
│                          │
│ Order #1236              │
│ Driver assigned          │
│                          │
│ [View all]               │
└──────────────────────────┘

Focused

The widget becomes the workspace.

Everything else fades behind it.

⸻

16 — STATES

This needs to be a system-wide state vocabulary.

Rather than every developer inventing their own loading/error/empty behavior, NEXG defines them once.

Core states

Default
Loading
Loaded
Updating
Refreshing
Empty
Error
Offline
Disabled
Locked
Restricted
Success
Warning
Critical

⸻

Interaction States

Every interactive component can also have:

Rest
Hover
Pressed
Focused
Selected
Active
Disabled
Loading
Success
Error

For mobile, Hover isn’t relevant in the same way, so the system can adapt by platform.

⸻

Widget States

Widgets get an additional layer:

Hidden
Compact
Expanded
Focused
Pinned
Minimized
Maximized
Live
Paused
Stale
Refreshing

This is important because:

Component state ≠ Widget state.

For example:

Order Widget
    ↓
Expanded
    ↓
Order Button
    ↓
Loading

The widget is expanded while the button is loading.

⸻

Data States

We also need to distinguish what the system knows.

No Data
Partial Data
Fresh Data
Stale Data
Updating
Synced
Sync Failed
Offline Data

This is particularly important for:

* Orders
* Maps
* Rider tracking
* Revenue
* Reservations
* Inventory
* Analytics

A merchant shouldn’t mistake “no data” for “data hasn’t loaded yet.”

⸻

Permission States

Especially important for mobile.

Not Requested
Requesting
Granted
Denied
Restricted
Permanently Denied
Unavailable

For:

* Location
* Camera
* Photos
* Notifications
* Microphone
* Bluetooth
* Contacts

⸻

Network States

NEXG should explicitly design for:

Online
Slow
Offline
Reconnecting
Syncing
Sync Failed

For example:

You're offline
Your last data was updated
3 minutes ago.
[Retry]

Instead of a generic:

Something went wrong.

⸻

Payment States

This deserves its own state model.

Payment
Pending
Processing
Authorized
Successful
Failed
Cancelled
Refund Pending
Refunded
Partially Refunded
Disputed
Expired

Then every payment component across Consumer, Merchant, Host and Admin speaks the same language.

⸻

Order States

Same principle:

Created
Confirmed
Preparing
Ready
Assigned
Picked Up
In Transit
Arriving
Delivered
Completed
Cancelled
Failed
Refunded

These become system enums, not merely visual labels.

That means the UI, backend and analytics can share the same conceptual model.

⸻

The really powerful part

We can combine:

Widget + State + Context

to produce the interface.

For example:

Delivery Widget
Context:
Rider
State:
In Transit
Mode:
Focused
Network:
Online

produces one experience.

While:

Delivery Widget
Context:
Consumer
State:
In Transit
Mode:
Compact
Network:
Offline

produces a completely different experience.

Same underlying design system.

⸻

This gives us the NEXG formula

                    COMPONENT
                        +
                      STATE
                        +
                     CONTEXT
                        +
                     PLATFORM
                        +
                     ROLE
                        ↓
                  NEXG EXPERIENCE

So we don’t build:

Consumer Delivery Card

Rider Delivery Card

Merchant Delivery Card

Host Delivery Card

We build:

Delivery Widget

and let the role + context + state determine how it behaves.

That is exactly how I’d scale NEXG across the Consumer, Merchant, Host, Rider, Admin and Monitoring products without creating six disconnected design systems.

## Response:
8/9/2026, 6:56:00 AM

Yes - **this helps a lot**, and more importantly, it fixes a structural issue in the earlier NEXG component inventory.

I reviewed the uploaded NEXG Phase 5 material. It explicitly frames the design system as something that must work across **every product, role, device and future vertical**, and it already establishes governance, states, widgets, performance, accessibility, offline behavior, analytics, and cross-app consistency as system-level concerns. `Branch · UX Design Laws.txt`

### What I would change

Your revised architecture is stronger than the original:

**Components ≠ Widgets ≠ States ≠ Scenes.**

I would formalize NEXG into **four different reusable layers**:

```text
NEXG EXPERIENCE SYSTEM
│
├── 01. FOUNDATIONS
│      Tokens, typography, color, spacing, motion, blur...
│
├── 02. COMPONENTS
│      Buttons, inputs, cards, maps, tables, calendars...
│
├── 03. WIDGETS
│      Order, Delivery, Property, Revenue, Guest, Task...
│
├── 04. STATES
│      Loading, empty, offline, stale, processing, failed...
│
├── 05. SCENES / FLOWS
│      Login, Checkout, Active Delivery, Property Workspace...
│
└── 06. PRODUCTS
       Consumer
       Merchant
       Rider
       Host
       Admin
       Monitoring
```

And there is an important relationship:

**Component + State → Widget → Scene → Product experience**

That is much more accurate than simply saying "300-600 components."

---

## There is one thing I'd add to your architecture

### 14. DOMAIN COMPONENTS should become ENTITY SYSTEM

Because NEXG is context-first.

Instead of treating:

> Merchant, Property, Guest, Booking, Order...

as just components, define an **Entity System**.

For example:

```text
ORDER
│
├── Order Identity
├── Order Status
├── Order Items
├── Customer
├── Merchant
├── Payment
├── Delivery
├── Timeline
├── Actions
├── Documents
├── Messages
└── History
```

Then the **same Order entity** can appear differently depending on context:

```text
Consumer → Order Card
Merchant → Order Workspace
Rider → Delivery Job
Admin → Order Investigation
Monitoring → Order Failure Event
```

That's exactly aligned with the Phase 5 principle that the same entity should feel like the same NEXG entity across products, while showing a different perspective. `Branch · UX Design Laws.txt`

---

# The other major thing your document confirms

Your **States** shouldn't just be visual states.

They need to exist at multiple levels.

### Component state

```text
Default
Hover
Pressed
Focused
Selected
Disabled
Loading
Error
Success
```

### Widget state

```text
Hidden
Compact
Expanded
Focused
Pinned
Minimized
Maximized
Live
Paused
Stale
Refreshing
```

### Data state

```text
No Data
Partial
Fresh
Stale
Updating
Synced
Sync Failed
Offline
```

### System/network state

```text
Online
Slow
Offline
Reconnecting
Syncing
```

### Domain state

```text
Order:
Created
Confirmed
Preparing
Ready
Assigned
Picked Up
In Transit
Delivered
Completed
Cancelled
Failed
Refunded
```

This distinction is important because your Phase 5 document specifically calls for **Fresh / Stale / Updating / Offline / Unavailable** and treats offline/reconnection as a designed experience rather than an error afterthought. `Branch · UX Design Laws.txt`

---

# And your Widget idea is especially important

I agree with your statement:

> **A widget is not a card.**

For NEXG, a widget should be a **living operational surface**.

For example:

### Order Widget

```text
COMPACT
   ↓
EXPANDED
   ↓
FOCUSED
   ↓
FULL WORKSPACE
   ↓
COLLAPSED
```

But the underlying order might simultaneously be:

```text
Order
  = Preparing

Network
  = Online

Payment
  = Successful

Widget
  = Expanded

User
  = Merchant

Role permission
  = Can modify order
```

So the UI isn't merely rendering an order.

It's rendering:

**Entity + State + Context + Role + Permission + Platform + Mode**

That is much closer to what NEXG actually needs.

---

# I would therefore redefine the NEXG formula

Instead of:

**Component + State + Context**

I'd make the canonical model:

```text
ENTITY
   +
COMPONENT
   +
STATE
   +
CONTEXT
   +
ROLE
   +
PERMISSION
   +
PLATFORM
   +
DATA
   ↓
WIDGET
   ↓
SCENE
   ↓
PRODUCT EXPERIENCE
```

This gives you a system capable of supporting:

**Consumer**

**Merchant**

**Merchant Portal**

**Rider**

**Rider Portal**

**Host**

**Host Portal**

**Admin**

**Admin Portal**

**Monitoring**

**Monitoring Portal**

without creating separate design languages.

---

# One more correction: portals

I would **not** treat the portals as separate products in the design system.

They're different **platform expressions**.

So:

```text
MERCHANT
├── Mobile Experience
└── Web Experience

RIDER
├── Mobile Experience
└── Web Experience

HOST
├── Mobile Experience
└── Web Experience

ADMIN
├── Mobile Experience
└── Web Experience

MONITORING
├── Mobile Experience
└── Web Experience
```

The underlying:

**entities + components + widgets + states + workflows**

remain shared.

The platform determines:

- layout
- navigation
- density
- interaction model
- keyboard behavior
- pointer behavior
- responsive behavior
- information density

This also fits the uploaded Phase 5 requirement to validate the system across small phones, large phones, tablets and desktop rather than treating each surface as an unrelated design. `Branch · UX Design Laws.txt`

---

# So our final NEXG library should actually be

```text
NEXG DESIGN SYSTEM
│
├── 01 FOUNDATIONS
│
├── 02 PRIMITIVES
│
├── 03 CONTROLS & INPUTS
│
├── 04 DATE & TIME
│
├── 05 LOCATION & MAPS
│
├── 06 AUTHENTICATION
│
├── 07 ONBOARDING
│
├── 08 NAVIGATION
│
├── 09 SURFACES
│
├── 10 FEEDBACK
│
├── 11 COMMERCE
│
├── 12 COMMUNICATION
│
├── 13 DATA
│
├── 14 ENTITY SYSTEM
│
├── 15 WIDGETS
│
├── 16 STATES
│
├── 17 WORKFLOWS
│
├── 18 COMPLETE SCENES / FLOWS
│
├── 19 PLATFORM ADAPTATION
│      ├── Mobile
│      ├── Tablet
│      └── Web
│
└── 20 GOVERNANCE
       ├── Tokens
       ├── Versioning
       ├── Accessibility
       ├── Performance
       ├── Analytics
       ├── QA
       ├── Deprecation
       └── Documentation
```

**That is the architecture I would lock in.**

And importantly, the uploaded Phase 5 document supports this direction: it calls for component governance/versioning, state-aware widgets, performance, accessibility, analytics, experimentation, security UX, cross-app consistency, stress testing, new-vertical testing and documentation. `Branch · UX Design Laws.txt`

So yes: **your revised version isn't just helpful - it gives us the correct foundation for building the complete NEXG component inventory.**

The next logical step is to turn this into a **master NEXG Design Library inventory**, where we enumerate the actual components, their subcomponents, variants, states, widgets, entities and scenes - rather than stopping at category names.



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)