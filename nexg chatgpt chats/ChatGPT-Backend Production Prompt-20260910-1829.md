# Backend Production Prompt

**User:** Anonymous  
**Created:** 8/31/2026 8:06:31  
**Updated:** 8/31/2026 8:35:23  
**Exported:** 9/10/2026 18:29:55  
**Link:** [https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a950b95-8870-83ea-b9c5-486bed730312](https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a950b95-8870-83ea-b9c5-486bed730312)  

## Prompt:
8/31/2026, 8:06:29 AM

i want a prompt for the agent building nexg it already has a front end as you have seen the lates with three pages on the nav, a cool react seacrh bar that lets you see previous, and can show popular suggestions, recents in a dynamic way already, also the search bar should close when there is no active category selected, also they should be no emoty items pages when items are clicked, some are well written out with add ons and category context but not all, i need all written down, it wrote a few but left alot but also didnt align the fewa well, ❯now i need to prepare to connect a real back end a databse with unique images per item per restaurant and all assets from stored there upto, the stack and everything, i'm already running expo

## Response:
8/31/2026, 8:06:31 AM

Yes. The agent should **not redesign the frontend** right now. This phase should be treated as **“productionize the existing NEXG consumer app”**: preserve what already works, finish the missing experience definitions, then introduce a real data/API/media architecture underneath it.

I’d give the coding agent this as one master prompt:

**document: **

# NEXG - FRONTEND → REAL BACKEND PRODUCTIONIZATION MASTER TASK

You are continuing development of the existing **NEXG consumer application**.

The frontend already exists and is being built in **Expo + React Native**. Do NOT restart the app, replace the current architecture, redesign the UI from scratch, or create parallel screens unless absolutely necessary.

Your job now is to take the existing frontend from a partially hardcoded prototype into a **real, data-driven NEXG application backed by a production-ready backend, database, media/asset system, and clean domain architecture**.

The existing frontend is the visual source you must preserve.

The NEXG UX/design principles in the attached `Branch · UX Design Laws.txt` are authoritative for interaction quality, consistency, states, progressive disclosure, accessibility, performance, offline behavior, component governance, and cross-product consistency.

---

# 1. FIRST: AUDIT WHAT ALREADY EXISTS

Before modifying code, inspect the entire repository.

Understand:

- Expo configuration
- React Native version
- navigation
- current 3-page navigation structure
- current screens
- reusable components
- search implementation
- category implementation
- item/detail pages
- restaurant/merchant pages
- cards
- modals
- bottom sheets
- image handling
- local/static data
- state management
- API-related code
- environment configuration
- TypeScript types
- assets
- icons
- animations
- loading states
- empty states
- error states
- existing backend, if any
- package manager
- build configuration

Do not assume the current implementation is wrong.

First determine:

> What is already working, what is partially implemented, and what is missing?

Create an internal implementation map before changing anything.

---

# 2. PRESERVE THE CURRENT FRONTEND

The current NEXG frontend already has important work completed.

In particular, preserve the existing:

- three-page navigation
- visual language
- existing layout
- search experience
- search animations
- category behavior
- cards
- typography
- spacing
- existing component hierarchy
- existing interactions
- existing Expo setup

Do NOT:

- replace the navigation with a different navigation paradigm
- redesign the Home screen
- redesign Explore
- redesign Search
- introduce a completely different card system
- replace working animations with generic animations
- create duplicate components that perform the same role
- rebuild working screens simply because you prefer another implementation

Improve the underlying architecture while preserving the established experience.

---

# 3. SEARCH IS ALREADY A CORE NEXG EXPERIENCE

The current search bar already supports dynamic behavior.

It can:

- show previous searches
- show recent searches
- show popular suggestions
- dynamically change its contents
- respond to category context

Preserve this.

However, verify the following behavior:

## Search lifecycle

```text
Idle
 ↓
Tap Search
 ↓
Search Active
 ↓
Suggestions / Recent / Popular
 ↓
User types
 ↓
Results
 ↓
Category/context selected
 ↓
Contextual results
```

The search interface should be state-driven rather than a collection of hardcoded visual conditions.

The search system should eventually support data from the backend.

Separate:

```text
Search UI
Search state
Search query
Search history
Search suggestions
Search results
Search ranking
Search context
```

Do not tightly couple these together.

---

# 4. IMPORTANT SEARCH RULE

The search bar should CLOSE when there is no active category/context requiring it.

Verify the existing behavior and fix it if necessary.

The intended logic is:

```text
No active category
        ↓
Search closes / returns to compact state

Active category
        ↓
Search can remain contextual / expanded
```

Do not create weird duplicate search components to achieve this.

The same search component should transition between states.

---

# 5. NO EMPTY ITEM PAGES

This is currently one of the largest unfinished areas.

Some item/detail pages have already been written well.

Some include:

- item description
- add-ons
- category context
- pricing
- related items
- restaurant context
- useful actions
- supporting information

But this has not been completed consistently.

You must audit **EVERY clickable item in the application**.

There must be no:

> "You clicked something and got an empty page."

Every item that can be opened must resolve to a complete experience.

---

# 6. CREATE AN EXPERIENCE CONTRACT FOR EVERY ITEM

Every clickable entity must have a defined representation.

At minimum, establish appropriate structures for:

```text
Merchant
Restaurant
Venue
Experience
Food item
Menu item
Product
Service
Add-on
Category
Subcategory
Promotion
Event
Booking
Order
```

Do not blindly give every entity the same screen.

Instead define:

```text
Entity
 ↓
Context
 ↓
Available information
 ↓
Available actions
 ↓
Related entities
 ↓
Purchase / booking / interaction flow
```

For example:

```text
Restaurant
 ├── hero
 ├── identity
 ├── cuisine/category
 ├── description
 ├── menu/categories
 ├── items
 ├── add-ons
 ├── offers
 ├── location
 ├── opening/status
 └── actions
```

And:

```text
Food item
 ├── image
 ├── name
 ├── description
 ├── price
 ├── category
 ├── restaurant
 ├── variants
 ├── add-ons
 ├── dietary/context information where available
 ├── related items
 └── add to order
```

The exact representation should follow the existing NEXG design rather than inventing arbitrary UI.

---

# 7. COMPLETE THE CONTENT SYSTEM, NOT JUST THE SCREENS

Do not solve missing detail pages by hardcoding more JSX.

Create structured data.

For example, conceptually:

```ts
Restaurant {
  id
  name
  description
  categoryIds
  imageIds
  location
  status
  openingHours
  menuIds
  experienceIds
}
```

And:

```ts
MenuItem {
  id
  merchantId
  categoryId
  name
  description
  price
  currency
  imageId
  variants
  addonGroups
  relatedItemIds
  availability
}
```

The UI should render these structures.

The backend becomes the source of truth.

---

# 8. REAL DATABASE

Move the application toward a proper backend/database architecture.

The database must become the source of truth for dynamic NEXG content.

Do NOT make the frontend responsible for business truth.

The frontend should consume:

```text
API
 ↓
typed domain data
 ↓
state/query layer
 ↓
components
```

rather than:

```text
component
 ↓
hardcoded object
 ↓
hardcoded UI
```

---

# 9. RECOMMENDED BACKEND ARCHITECTURE

Use a clean architecture that can scale beyond the consumer app.

Prefer:

```text
NEXG
│
├── API
│
├── Identity
├── Tenancy
├── Catalog
├── Merchants
├── Categories
├── Products / Menu Items
├── Experiences
├── Orders
├── Bookings
├── Payments
├── Promotions
├── Search
├── Media
├── Notifications
├── Dispatch
└── Analytics
```

The immediate implementation does NOT need every domain fully implemented.

But the architecture must leave clean boundaries for them.

---

# 10. DATABASE MODEL

Design the database around stable entities and relationships.

At minimum account for:

```text
users
merchants
merchant_locations
categories
subcategories
catalog_items
item_variants
addon_groups
addons
item_addons
menus
menu_sections
experiences
promotions
media_assets
media_variants
orders
order_items
bookings
favorites
search_history
popular_searches
```

Adapt this to the actual existing codebase.

Do not blindly create every table if an equivalent already exists.

Avoid duplicated concepts.

---

# 11. USE REAL IDs

Every dynamic entity needs a stable unique identifier.

Never use:

```text
array index
screen position
name
image filename
```

as the entity's identity.

Use proper IDs.

For example:

```text
restaurant_id
menu_item_id
experience_id
media_asset_id
category_id
```

Relationships should use IDs.

This is essential for:

- deep links
- caching
- analytics
- updates
- favorites
- orders
- search
- recommendations
- media
- future mobile/web clients

---

# 12. MEDIA / IMAGE ARCHITECTURE

This is extremely important.

NEXG must NOT depend on random local image imports for production content.

Every dynamic entity should be capable of referencing its own media.

For example:

```text
Restaurant A
 ├── hero image
 ├── logo
 ├── gallery
 └── menu images

Restaurant B
 ├── hero image
 ├── logo
 ├── gallery
 └── menu images
```

And:

```text
Pizza Margherita
 └── its own image

Chicken Burger
 └── its own image

Cocktail
 └── its own image
```

Do not reuse one generic image simply because several entities belong to the same category.

---

# 13. MEDIA MUST BE DATA

The database should store metadata about media.

Conceptually:

```text
media_assets

id
entity_type
entity_id
type
url
thumbnail_url
width
height
alt_text
sort_order
metadata
created_at
updated_at
```

Where appropriate, support:

```text
hero
thumbnail
gallery
logo
menu_item
category
banner
icon
video
```

The actual binary assets should live in appropriate object/media storage.

The database stores references and metadata.

---

# 14. MEDIA STORAGE

Design the application so assets can eventually live in:

```text
Object Storage
      ↓
CDN
      ↓
NEXG API
      ↓
Expo app
```

Do not make the frontend care whether storage is:

- S3-compatible
- Cloudflare R2
- Supabase Storage
- another object store

The API/media abstraction should hide this.

Use environment variables for storage configuration.

Never hardcode production storage credentials.

---

# 15. IMAGE VARIANTS

Do not send enormous original images to the phone.

Support image variants such as:

```text
thumbnail
small
medium
large
original
```

For example:

```text
thumbnail → list/card
medium → detail
large → hero/gallery
original → administrative/media purposes
```

Use appropriate image caching and lazy loading.

The frontend should request the appropriate representation for the component.

---

# 16. ASSET REGISTRY

Create a proper asset registry.

The application should be able to answer:

> What image belongs to this restaurant?

and:

> What image belongs to this menu item?

and:

> What assets belong to this experience?

without relying on scattered imports throughout the codebase.

This should become the source of truth for dynamic media.

---

# 17. STATIC VS DYNAMIC ASSETS

Clearly separate:

### Static application assets

Examples:

- NEXG logo
- Bellbo
- UI icons
- permanent illustrations
- app-level decorative assets

from:

### Dynamic business assets

Examples:

- restaurant images
- merchant logos
- menu items
- experience images
- promotions
- venue photography
- category imagery

Static assets may remain bundled with Expo.

Dynamic assets must be remotely addressable.

---

# 18. API LAYER

Create a clean API client.

Do not scatter raw fetch calls across components.

Use something conceptually like:

```text
api/
  client
  auth
  merchants
  categories
  catalog
  search
  experiences
  orders
  bookings
  media
```

The exact structure should follow the existing project conventions.

Components should consume typed services/hooks rather than manually constructing URLs.

---

# 19. TYPED DATA CONTRACT

The frontend and backend must agree on domain structures.

Use TypeScript types/interfaces generated or maintained from the backend contract where practical.

Avoid:

```ts
any
```

for dynamic NEXG domain data.

The system should make it difficult for:

```text
backend field renamed
```

to silently break:

```text
restaurant page
```

---

# 20. LOADING / ERROR / EMPTY STATES

Every backend-driven component needs explicit states.

At minimum:

```text
Loading
Loaded
Empty
Error
Offline
Stale
Refreshing
```

Follow the NEXG UX laws.

Do not leave blank white screens.

Do not use meaningless:

```text
Something went wrong
```

everywhere.

Errors should be contextual.

---

# 21. SKELETONS

Where content takes time to load, use appropriate loading representations.

Preserve the visual structure of the final content.

Do not make every loading state a generic spinner.

Use:

```text
card skeleton
restaurant skeleton
menu skeleton
search skeleton
experience skeleton
```

where appropriate.

---

# 22. OFFLINE / DEGRADED NETWORK

The architecture must account for imperfect connectivity from day one.

At minimum support:

```text
online
slow
offline
reconnecting
syncing
```

Use caching for appropriate read-heavy data.

The UI should remain useful when the network temporarily fails.

Follow the attached NEXG design principles:

> Offline and failure states are first-class experiences.

---

# 23. CACHING

Use a proper server-state strategy rather than manually duplicating API responses throughout local state.

The architecture should support:

```text
cache
stale data
background refresh
optimistic updates where appropriate
retry
invalidation
pagination
```

Do not cache data indefinitely without an invalidation strategy.

---

# 24. SEARCH BACKEND

The current frontend search experience should eventually connect to a real search service/API.

Search should understand:

```text
query
category
subcategory
merchant
location/context
recent searches
popular searches
```

Potential response structure:

```text
suggestions
recent
popular
categories
merchants
items
experiences
```

Do not hardcode popular suggestions into the UI.

They should be capable of being supplied by the backend.

---

# 25. SEARCH HISTORY

Search history should eventually belong to the user/session rather than being permanently embedded in the UI.

Support:

```text
recent searches
clear one
clear all
ranking
timestamps
```

Respect privacy.

Do not store unnecessary sensitive search information.

---

# 26. POPULAR SEARCHES

Popular suggestions should be data-driven.

Eventually they can be derived from:

```text
search frequency
recent trends
location/context
category
time
availability
business priority
```

For now, create the clean API/data contract without overengineering the ranking algorithm.

---

# 27. CATEGORY CONTEXT

Categories should not just be visual labels.

They should be entities in the backend.

Conceptually:

```text
Category
 ├── id
 ├── name
 ├── slug
 ├── description
 ├── image
 ├── icon
 ├── parent
 ├── children
 ├── sort_order
 ├── status
 └── metadata
```

The frontend should consume them dynamically.

---

# 28. REST / API DESIGN

Use predictable resource-oriented endpoints.

For example:

```text
GET /categories
GET /categories/:id

GET /merchants
GET /merchants/:id

GET /catalog/items
GET /catalog/items/:id

GET /experiences
GET /experiences/:id

GET /search
GET /search/suggestions
GET /search/recent
```

Adapt endpoint naming to the backend framework and existing project.

Do not create arbitrary endpoint naming for every screen.

The API should represent domains rather than screens.

---

# 29. DO NOT BUILD SCREEN-SPECIFIC BACKEND ENTITIES

Avoid things like:

```text
/home-screen-data
/explore-screen-data
/restaurant-page-data
```

unless there is a legitimate aggregation/BFF requirement.

Prefer domain APIs.

The frontend composes them into experiences.

This matters because NEXG will eventually have:

```text
Consumer
Merchant
Host
Rider
Admin
```

using overlapping domain entities.

---

# 30. NEXG IS A PLATFORM

Architect the backend so the consumer app is only one client.

Eventually:

```text
             NEXG API
                │
      ┌─────────┼─────────┐
      ↓         ↓         ↓
  Consumer   Merchant    Host
      │         │         │
      └─────────┼─────────┘
                ↓
              Rider
                ↓
              Admin
```

The same underlying entities should be reusable across products.

---

# 31. MULTI-TENANCY READINESS

NEXG will interact with multiple merchants/properties/businesses.

Design dynamic business data so it can be associated with the appropriate tenant/merchant/property.

Do not build a database that assumes there is only one restaurant or one merchant.

---

# 32. AUTHENTICATION

If authentication already exists, preserve it.

If not, establish a clean authentication boundary.

The frontend should not own authentication logic in every screen.

Use:

```text
auth state
session
token management
refresh
logout
```

through a centralized mechanism.

Never hardcode credentials or tokens.

---

# 33. ENVIRONMENT CONFIGURATION

Separate:

```text
development
staging
production
```

Use environment variables for:

```text
API_URL
MEDIA/CDN URL
database configuration
storage configuration
authentication configuration
analytics configuration
```

Never commit secrets.

Provide an `.env.example`.

---

# 34. DATABASE MIGRATIONS

Do not manually alter the production schema.

Use migrations.

Every schema change should be reproducible.

The project should be capable of:

```text
fresh database
 ↓
run migrations
 ↓
seed development data
 ↓
start backend
```

---

# 35. SEED DATA

Create realistic development seed data.

Do not use:

```text
Restaurant 1
Restaurant 2
Restaurant 3
```

with empty fields.

Seed enough data to exercise the real frontend:

```text
multiple merchants
multiple categories
multiple restaurants
multiple menu sections
multiple menu items
multiple add-ons
multiple experiences
multiple images
multiple prices
multiple statuses
```

Every clickable object should have meaningful content.

---

# 36. IMAGE SEEDING

Development seed data should include unique image references.

For example:

```text
Restaurant A → image A
Restaurant B → image B

Pizza A → image A
Pizza B → image B
Burger A → image C
```

Do not use one image for every entity.

The system should prove that entity-specific media works before production.

---

# 37. DATA VALIDATION

Validate backend data.

A restaurant without:

```text
id
name
```

should not silently crash the app.

Validate API payloads at the boundary.

Reject malformed data early.

---

# 38. FRONTEND DATA LAYER

The frontend should have a clean separation:

```text
Screens
   ↓
Experience components
   ↓
Hooks / server state
   ↓
API services
   ↓
Backend
   ↓
Database / storage
```

Do not allow screens to directly manipulate database concepts.

---

# 39. COMPONENT CONTRACTS

Existing components should become data-driven.

For example, instead of:

```tsx
<RestaurantCard
  image={require(...)}
  title="..."
/>
```

the production architecture should allow something conceptually like:

```tsx
<RestaurantCard restaurant={restaurant} />
```

where the restaurant contains the necessary media/data.

Do not blindly refactor every component at once.

Migrate incrementally.

---

# 40. NO UI REGRESSION

After backend integration, the frontend should still look like the current application.

Compare:

```text
before backend
vs
after backend
```

Check:

- spacing
- typography
- image proportions
- card dimensions
- navigation
- search behavior
- transitions
- category states
- item pages
- scrolling
- gestures

Backend integration must not become an excuse for visual degradation.

---

# 41. COMPLETE THE CURRENT THREE NAVIGATION PAGES

Before considering this phase complete:

Audit all three current navigation destinations.

For each one document:

```text
purpose
data required
API calls
states
clickable entities
destination
loading
empty
error
offline
```

Every clickable element must have a destination or intentional action.

---

# 42. CLICK-THROUGH AUDIT

Perform a full click-through of the application.

Test:

```text
Home
 → category
 → item

Home
 → restaurant
 → menu
 → item
 → add-ons

Explore
 → category
 → merchant
 → item

Search
 → suggestion
 → category
 → merchant
 → item

Popular
 → result

Recent
 → result
```

Use the actual routes and entities discovered in the repository.

The important rule:

> There must be no dead-end clickable UI.

---

# 43. ITEM EXPERIENCE MATRIX

Create an internal matrix similar to:

```text
ENTITY          SOURCE       DETAIL PAGE       ACTIONS       MEDIA
Restaurant      API          YES               YES           YES
Menu item       API          YES               YES           YES
Experience      API          YES               YES           YES
Category        API          YES               YES           YES
Promotion       API          YES               YES           YES
```

Fill this out for every currently clickable entity.

Anything incomplete must be implemented.

---

# 44. DESIGN SYSTEM DISCIPLINE

Use existing NEXG components before creating new ones.

Before creating a component ask:

```text
Does this already exist?

Can it be extended?

Is the new behavior genuinely different?

Does the new state belong in the existing component?
```

Follow the NEXG principle:

> New features should extend the system before creating parallel patterns.

---

# 45. STATE-DRIVEN UI

Do not build UI states accidentally.

Explicitly model important states.

For example:

```text
Search
 ├── idle
 ├── focused
 ├── typing
 ├── results
 ├── category-context
 ├── loading
 ├── empty
 └── error
```

Likewise:

```text
Item
 ├── loading
 ├── loaded
 ├── unavailable
 ├── error
 └── offline
```

---

# 46. PERFORMANCE

Do not introduce an architecture that makes the Expo app slow.

Measure:

```text
startup
navigation
search
image loading
large lists
detail pages
memory
```

Use:

- image caching
- pagination
- lazy loading
- memoization where justified
- virtualization
- request deduplication

Do not optimize blindly.

Measure first.

---

# 47. OBSERVABILITY

Prepare the architecture for:

```text
API errors
frontend errors
search failures
image failures
slow requests
failed navigation
checkout failures
```

Useful telemetry should eventually answer:

```text
WHAT happened?
WHERE?
WHEN?
HOW OFTEN?
```

without exposing unnecessary user information.

---

# 48. TESTING

Add tests around the most important contracts.

At minimum:

### API

- successful request
- malformed response
- authentication failure
- server error

### Search

- recent
- popular
- results
- category context
- empty results

### Detail pages

- valid entity
- missing entity
- unavailable entity
- image missing
- malformed data

### Navigation

- every clickable entity resolves correctly

---

# 49. DOCUMENT THE ARCHITECTURE

Create/update documentation for:

```text
ARCHITECTURE.md
DATABASE.md
API.md
MEDIA.md
ENVIRONMENT.md
```

Document:

- stack
- folder structure
- data flow
- database
- migrations
- API
- media
- local development
- environment variables
- seed process
- testing

The documentation must reflect the implementation, not an imagined future system.

---

# 50. FINAL STACK DECISION

Before implementing infrastructure, inspect the existing repository and choose technologies that fit it.

The resulting architecture should clearly define:

```text
Expo / React Native
        ↓
TypeScript
        ↓
API client / server-state layer
        ↓
NEXG backend
        ↓
PostgreSQL
        ↓
Object storage
        ↓
CDN
```

If the repository already contains a backend stack, use it rather than introducing another backend framework unnecessarily.

Do not create multiple competing databases or API frameworks.

---

# 51. IMPLEMENTATION ORDER

Do this in phases.

## PHASE A - AUDIT

Inspect the complete codebase.

Produce:

```text
current architecture
current screens
current components
current routes
current hardcoded data
current item types
current search behavior
current asset strategy
current backend status
```

Do not modify major code yet.

---

## PHASE B - EXPERIENCE COMPLETENESS

Fix:

- empty item pages
- dead-end clicks
- incomplete item descriptions
- missing add-ons
- missing category context
- inconsistent detail experiences

Create the entity/experience matrix.

---

## PHASE C - DATA MODEL

Design:

```text
entities
relationships
IDs
media
categories
catalog
search
```

Create migrations.

---

## PHASE D - BACKEND

Implement:

```text
API
database
seed data
validation
media references
search endpoints
```

Keep the API domain-oriented.

---

## PHASE E - MEDIA

Implement:

```text
media registry
object storage abstraction
image URLs
image variants
caching
entity-specific media
```

---

## PHASE F - FRONTEND DATA INTEGRATION

Replace hardcoded dynamic content incrementally.

Do NOT replace everything at once.

For each domain:

```text
hardcoded data
 ↓
API contract
 ↓
query/hook
 ↓
component
 ↓
screen
```

---

## PHASE G - SEARCH INTEGRATION

Connect:

```text
query
recent
popular
categories
merchants
items
experiences
```

to the backend.

Preserve the current search UX.

---

## PHASE H - QA

Perform:

```text
visual QA
interaction QA
data QA
API QA
image QA
navigation QA
offline QA
performance QA
```

---

# 52. CRITICAL RULE: DO NOT OVERBUILD

The objective is NOT to create the entire future NEXG platform immediately.

The objective is:

> **Build the smallest real backend architecture that can support the current consumer experience correctly and grow into the NEXG platform.**

Do not spend days implementing:

- payments
- dispatch
- complex recommendation ML
- advanced analytics
- multi-country infrastructure
- merchant dashboards

unless the existing code requires them now.

Create clean boundaries for them.

Build what the current consumer app actually needs first.

---

# 53. CRITICAL RULE: DON'T INVENT UX

If something is visually or behaviorally ambiguous:

1. inspect existing implementation
2. inspect existing NEXG components
3. inspect the UX/design-law document
4. follow existing patterns
5. only then introduce a new pattern

Do not use generic SaaS UI patterns just because they are convenient.

---

# 54. CRITICAL RULE: THE DATABASE IS THE SOURCE OF TRUTH

Once dynamic content is migrated:

```text
Database
    ↓
API
    ↓
Frontend
```

Not:

```text
Frontend
    ↓
hardcoded data
    ↓
API later
```

The frontend should be a consumer of NEXG data.

---

# 55. CRITICAL RULE: THE IMAGE IS NOT THE SOURCE OF TRUTH

Visual design remains governed by the NEXG design system and implementation.

The database/data model is the source of truth for dynamic business data.

The design system/specification is the source of truth for UX.

Generated visuals or temporary mock data are never the source of truth.

---

# 56. DEFINITION OF DONE

This task is complete only when:

### Frontend

- current three-page navigation works
- current search experience remains intact
- search recent/popular behavior works
- search closes correctly when context is inactive
- every clickable item has a real destination/action
- no empty item pages remain
- all item experiences have complete structured content
- add-ons/category context are represented where applicable

### Backend

- real API exists
- real database exists
- migrations exist
- seed data exists
- dynamic entities have stable IDs
- relationships work
- validation exists

### Media

- dynamic images are stored outside the app bundle
- each relevant entity can have unique media
- media metadata exists
- image variants are supported or architected cleanly
- frontend loads remote media correctly
- image caching is handled appropriately

### Architecture

- frontend is separated from backend
- API access is centralized
- server state is handled consistently
- environment configuration exists
- secrets are not hardcoded
- architecture is documented
- future NEXG clients can reuse the same domain APIs

### UX

- no blank states caused by missing data
- loading/error/empty/offline states exist
- existing visual language is preserved
- no duplicate component systems
- no unnecessary redesign

---

# 57. WORKING STYLE

You are an autonomous engineering agent.

Do not stop after identifying problems.

For each issue:

```text
discover
→ understand
→ plan
→ implement
→ test
→ verify
→ document
```

If an existing implementation is good, preserve it.

If it is incomplete, finish it.

If architecture is weak, improve it without unnecessarily changing the user experience.

Do not ask for permission for every small implementation decision.

Make reasonable engineering decisions and continue.

However, when there is a genuinely architectural fork that would materially affect the entire platform, document the tradeoff before committing to the irreversible option.

---

# 58. MOST IMPORTANT PRIORITY ORDER

When tradeoffs occur, prioritize:

```text
1. Existing NEXG UX
2. Correctness
3. Complete user journeys
4. Clean domain/data model
5. Real backend integration
6. Media architecture
7. Performance
8. Maintainability
9. Future extensibility
10. Cosmetic improvements
```

Do not sacrifice a working NEXG experience merely to make the code "cleaner."

---

# FINAL OBJECTIVE

Turn the current Expo NEXG consumer frontend from:

```text
beautiful prototype
+
hardcoded/partial data
+
some incomplete experiences
```

into:

```text
REAL NEXG CONSUMER APPLICATION

        ↓

Expo / React Native
        ↓
NEXG typed data layer
        ↓
NEXG API
        ↓
PostgreSQL
        ↓
Media/Object Storage
        ↓
CDN

        ↓

Real merchants
Real categories
Real restaurants
Real items
Real add-ons
Real experiences
Real images
Real search
Real state
Real user journeys
```

while preserving the current NEXG interface and interaction language.

The end result should feel like **the exact same NEXG product**, except that the content is now real, persistent, queryable, scalable, and ready for the rest of the NEXG ecosystem.

The key thing I’d enforce on the agent is **not to let “backend integration” turn into another frontend rewrite**. The current UI becomes the client of a real domain model. That also sets you up for the bigger NEXG architecture from the design document: the same `Restaurant`, `Item`, `Experience`, `Category`, `Order`, etc. can later be consumed by Merchant, Host, Rider and Admin rather than rebuilding those concepts per app. `Branch · UX Design Laws.txt`

If you want, I can also turn this into a **much more aggressive Claude Code / OpenCode-style execution prompt** that tells the agent exactly how to inspect the repo, what files to create, what order to implement them in, and when it is allowed to stop.

## Prompt:
8/31/2026, 8:07:51 AM

im on the user app currently

## Response:
8/31/2026, 8:07:54 AM

Exactly - **you're on the NEXG User/Consumer app right now**. So I’d narrow the agent prompt considerably.

The immediate goal is **not** “build the NEXG backend/platform.” It is:

> **Finish and productionize the User App first, while making the backend architecture reusable later.**

That means the agent should focus on the current 3 navigation pages, search, categories, discovery, merchant/restaurant/item/experience detail flows, and then connect those to real data.

I would actually give the agent this revised instruction:

**document: **

# NEXG USER APP - PRODUCTIONIZATION PROMPT

You are working ONLY on the **NEXG Consumer/User App** right now.

The application is already being built in **Expo + React Native** and already has an existing frontend with **3 primary navigation pages**.

Your job is to take the existing User App from its current prototype state into a **complete, data-driven, backend-ready product**.

Do NOT start building Merchant, Host, Rider, or Admin applications.

Do NOT redesign the existing application.

Do NOT replace the current navigation.

Do NOT rebuild working UI unnecessarily.

The current User App is the product we are finishing.

---

# 1. UNDERSTAND THE CURRENT APP FIRST

Inspect the entire existing Expo project before making major changes.

Identify:

- the 3 navigation pages
- navigation structure
- current routes
- current components
- search component
- search states
- categories
- merchants/restaurants
- items
- experiences
- cards
- detail pages
- modals
- sheets
- local data
- hardcoded data
- image imports
- asset structure
- state management
- API code
- TypeScript types
- environment configuration

First understand what exists.

Do not replace existing architecture simply because you would have designed it differently.

---

# 2. CURRENT USER APP IS THE SOURCE OF THE VISUAL TRUTH

Preserve the existing NEXG User App.

The following are already important parts of the experience:

- 3-page navigation
- existing visual language
- current search bar
- search animations
- previous searches
- recent searches
- popular suggestions
- dynamic search behavior
- category context
- existing cards
- existing detail-page patterns
- existing spacing
- typography
- motion
- navigation behavior

Improve the implementation without destroying the experience.

---

# 3. SEARCH

The existing search bar is already a significant NEXG interaction.

It currently supports:

```text
Previous searches
Recent searches
Popular suggestions
Dynamic suggestions
Category context
```

Preserve this behavior.

The search system should be structured around explicit states:

```text
IDLE
 ↓
FOCUSED
 ↓
SUGGESTIONS
 ↓
TYPING
 ↓
RESULTS
 ↓
CATEGORY CONTEXT
```

Also support:

```text
LOADING
EMPTY
ERROR
OFFLINE
```

---

# 4. SEARCH CLOSING BEHAVIOR

There is an important existing UX rule:

> The search bar should close when there is no active category/context selected.

Verify the current implementation.

The intended behavior is:

```text
No active category/context
        ↓
Search returns to its compact/closed state
```

while:

```text
Active category/context
        ↓
Search may remain contextual
```

Do not create multiple search components to accomplish this.

Use one search system with state transitions.

---

# 5. NO EMPTY ITEM PAGES

This is a major priority.

Some item/detail experiences are already well written.

Some already contain:

- descriptions
- add-ons
- category context
- related content
- merchant/restaurant context
- useful actions

But this is incomplete across the application.

You must perform a **full click-through audit**.

Every clickable item must lead somewhere meaningful.

There should be ZERO:

```text
click
 ↓
empty page
```

or:

```text
click
 ↓
placeholder
```

or:

```text
click
 ↓
missing content
```

---

# 6. COMPLETE EVERY USER-FACING EXPERIENCE

Audit every entity currently exposed to the User App.

At minimum look for:

```text
Category
Subcategory
Restaurant
Merchant
Menu
Menu section
Food item
Product
Service
Experience
Promotion
Event
```

For every entity ask:

```text
What is it?
What context does the user need?
What information should be shown?
What can the user do?
What related content should appear?
Where does the user go next?
```

Do not force every entity into the same template.

Use the existing NEXG experience patterns.

---

# 7. DETAIL EXPERIENCE STANDARD

Where applicable, a detail experience should support:

```text
Identity
Image/media
Description
Category context
Merchant/restaurant context
Price
Variants
Add-ons
Availability
Related items
Related experiences
Primary action
Secondary actions
```

Not every entity requires every field.

The point is:

> No entity should feel unfinished.

---

# 8. FIX THE EXISTING WRITTEN PAGES TOO

Do not only create missing pages.

Review the detail experiences that already exist.

Some were written before the whole system was aligned.

Make them consistent with one another.

Check:

- hierarchy
- spacing
- typography
- image treatment
- add-on placement
- category context
- CTA placement
- related content
- navigation/back behavior
- loading state
- error state
- unavailable state

The goal is not to make everything identical.

The goal is:

> Different experiences should still feel like the same NEXG application.

---

# 9. CREATE A USER-APP EXPERIENCE REGISTRY

Create a machine-readable/internal registry of all current User App experiences.

For example:

```text
Category
Restaurant
Menu
MenuItem
Experience
Promotion
```

For each record define:

```text
entity type
route
required data
optional data
media
actions
related entities
states
```

This becomes the reference for completing the User App.

Do not let individual screens become the source of truth for what an experience is.

---

# 10. MOVE FROM MOCK DATA TO REAL DATA

Once the UX is complete, begin separating:

```text
UI
```

from:

```text
data
```

The current hardcoded content should be identified.

Classify it as:

```text
Static UI asset
OR
Dynamic business data
```

Examples of static:

```text
NEXG logo
Bellbo
permanent UI icons
application illustrations
```

Examples of dynamic:

```text
restaurant
merchant
menu item
price
category
promotion
experience
image
availability
```

Dynamic data must eventually come from the backend.

---

# 11. BUILD THE USER APP BACKEND AROUND THE USER EXPERIENCE

Do NOT build the entire NEXG platform yet.

Build the backend required to support the current User App.

The first backend domains should be:

```text
Users
Categories
Merchants
Restaurants
Catalog/Menu
Items
Add-ons
Experiences
Promotions
Media
Search
```

Prepare clean boundaries for:

```text
Orders
Bookings
Payments
Notifications
```

but do not overbuild them unless the current User App requires them.

---

# 12. DATABASE

Use a real relational database.

Prefer PostgreSQL if the existing backend does not already dictate another database.

The database should contain real entities rather than screen-specific structures.

For example:

```text
users

merchants

merchant_locations

categories

subcategories

menus

menu_sections

catalog_items

item_variants

addon_groups

addons

experiences

promotions

media_assets

search_history
```

Adapt this to the existing codebase.

Do not duplicate concepts that already exist.

---

# 13. IMPORTANT: DOMAIN MODEL, NOT SCREEN MODEL

Do NOT create databases like:

```text
home_screen_data
explore_screen_data
restaurant_page_data
```

Instead create:

```text
restaurant
menu
menu_item
category
experience
merchant
```

The User App composes these entities into screens.

This allows the same backend entities to eventually support the other NEXG products without building those products now.

---

# 14. UNIQUE IDs

Every dynamic entity needs a stable unique ID.

For example:

```text
restaurant_id
menu_id
menu_item_id
experience_id
category_id
merchant_id
media_asset_id
```

Never identify an item using:

```text
array index
name
image filename
screen position
```

---

# 15. REAL IMAGE / MEDIA SYSTEM

This is a major part of this phase.

Every restaurant/item/experience should be able to have its own media.

For example:

```text
Restaurant A
 → Restaurant A hero
 → Restaurant A gallery

Restaurant B
 → Restaurant B hero
 → Restaurant B gallery

Pizza A
 → Pizza A image

Pizza B
 → Pizza B image
```

Do not use one generic image for every item.

---

# 16. MEDIA MUST BE SEPARATE FROM THE EXPO BUNDLE

Dynamic business images should NOT require:

```text
require("./assets/restaurant.jpg")
```

inside production components.

Instead:

```text
Database
 ↓
media_asset
 ↓
URL
 ↓
Expo Image
```

The app should be capable of receiving new restaurants/items/images without shipping a new Expo build.

---

# 17. MEDIA MODEL

Create a media abstraction that supports something conceptually like:

```text
media_assets

id
entity_type
entity_id
type
url
thumbnail_url
width
height
alt_text
sort_order
metadata
created_at
updated_at
```

Possible media types:

```text
hero
thumbnail
gallery
logo
menu_item
category
banner
video
```

Adapt to the actual implementation.

---

# 18. STORAGE ARCHITECTURE

The eventual flow should be:

```text
                    NEXG BACKEND
                         │
                         ↓
                  Media metadata
                         │
                         ↓
                 Object Storage
                         │
                         ↓
                       CDN
                         │
                         ↓
                    Expo App
```

The frontend must not care which storage provider is being used.

Use configuration/environment variables.

Never hardcode credentials.

---

# 19. IMAGE PERFORMANCE

Do not send huge originals to mobile devices.

Support appropriate variants:

```text
thumbnail
small
medium
large
original
```

Use the appropriate image size for:

```text
list
card
detail
hero
gallery
```

Add proper caching.

---

# 20. SEARCH BACKEND

The existing search UX should eventually consume real backend data.

The backend should be able to return:

```text
suggestions
recent searches
popular searches
categories
merchants
restaurants
items
experiences
```

Search should eventually understand:

```text
query
category
context
merchant
location
```

Do not hardcode popular suggestions into the final production architecture.

---

# 21. USER SEARCH HISTORY

Design the backend so recent searches can belong to the current user/session.

Support:

```text
add search
retrieve recent
remove search
clear searches
```

The existing frontend behavior should remain unchanged.

---

# 22. CATEGORY DATA

Categories should be database entities.

At minimum:

```text
id
name
slug
description
image
icon
parent_id
sort_order
status
metadata
```

The current frontend category experience should consume this data eventually.

---

# 23. API

Create a centralized API layer.

The frontend should NOT contain random fetch calls in individual components.

Use a structure appropriate to the existing repository, conceptually:

```text
api/
  client
  categories
  merchants
  restaurants
  catalog
  experiences
  search
  media
```

Screens consume typed hooks/services.

---

# 24. FRONTEND DATA FLOW

The desired architecture is:

```text
NEXG Screen
      ↓
NEXG Experience Component
      ↓
Query / Hook
      ↓
API Client
      ↓
NEXG Backend
      ↓
PostgreSQL
```

For media:

```text
PostgreSQL metadata
      ↓
Object Storage/CDN
      ↓
Expo Image
```

---

# 25. SERVER STATE

Do not duplicate backend state unnecessarily across local state.

Use an appropriate server-state/data-fetching layer if the project does not already have one.

It should support:

```text
caching
refreshing
loading
error
pagination
retry
invalidation
stale data
```

---

# 26. EVERY BACKEND-DRIVEN SCREEN NEEDS STATES

No screen should assume the API always succeeds.

Explicitly handle:

```text
Loading
Loaded
Empty
Error
Offline
Refreshing
```

For appropriate experiences also:

```text
Unavailable
Sold out
Closed
Coming soon
```

Do not leave blank screens.

---

# 27. SEED REALISTIC DATA

Create development seed data that makes the current User App feel alive.

Include multiple:

```text
categories
restaurants
merchants
menu sections
menu items
add-ons
experiences
promotions
images
```

Every clickable entity must contain meaningful information.

Do not seed empty placeholder objects.

---

# 28. SEED UNIQUE MEDIA

Every major visible entity should have appropriate unique media references.

The purpose is to test that:

```text
restaurant A
```

does not accidentally render:

```text
restaurant B's image
```

and that:

```text
item A
```

does not accidentally inherit a category placeholder.

---

# 29. NAVIGATION QA

Perform a complete click-through.

Test:

```text
Home
 → category
 → restaurant
 → menu
 → item
 → add-ons

Explore
 → category
 → merchant
 → item

Search
 → suggestion
 → category

Search
 → restaurant

Search
 → item

Search
 → experience
```

Adapt to the actual routes present in the project.

Every click must have an intentional result.

---

# 30. DO NOT BUILD THE OTHER NEXG APPS

Do not currently implement:

```text
Merchant App
Host App
Rider App
Admin
```

Only ensure the backend domain model does not prevent them later.

The current milestone is:

> **NEXG User App = complete + real data + real media + real backend.**

---

# 31. DO NOT OVERENGINEER THE BACKEND

The goal is NOT:

> Build the entire future NEXG infrastructure.

The goal is:

> Build the minimum serious backend required for the User App while making the domain model reusable.

Do not spend the current milestone implementing complex:

```text
dispatch
payments
merchant CRM
rider routing
advanced ML
```

unless required by an existing User App flow.

---

# 32. DEVELOPMENT ENVIRONMENT

The app is already running through Expo.

Do not break that workflow.

Ensure:

```text
Expo app
 ↓
development API
 ↓
database
```

can run reliably.

Create:

```text
.env.example
```

and document the required environment variables.

Do not commit secrets.

---

# 33. MIGRATIONS

Database schema changes must be migration-based.

The project should support:

```text
fresh database
 ↓
migrations
 ↓
seed
 ↓
backend
 ↓
Expo app
```

from a clean development environment.

---

# 34. DOCUMENTATION

Document the current User App production architecture.

Create/update:

```text
USER_APP_ARCHITECTURE.md
DATABASE.md
API.md
MEDIA.md
```

Document what actually exists.

Do not document imaginary future systems.

---

# 35. TEST THE REAL USER JOURNEYS

The most important tests are not individual database tables.

They are complete journeys.

Test:

```text
Discover
 → browse category
 → open merchant
 → browse items
 → open item
 → configure item
 → action
```

and:

```text
Search
 → recent/popular
 → query
 → result
 → detail
```

and:

```text
Explore
 → category
 → merchant
 → item
```

No dead ends.

---

# 36. VISUAL REGRESSION

After connecting real data, compare the UI against the current frontend.

Real data must not cause:

- broken layouts
- overflowing text
- wrong image ratios
- inconsistent card heights
- missing content
- unexpected spacing
- broken navigation
- awkward empty states

Real data should make the current UI work better, not change its identity.

---

# 37. IMPORTANT NEXG DESIGN PRINCIPLE

Use the existing NEXG design system principles:

```text
Attention
Direction
Memory
Action
```

supported by:

```text
Jakob
Hick
Fitts
Miller
Tesler
```

Complexity should be handled by the system rather than dumped onto the user.

The User App should therefore not expose unnecessary backend complexity.

---

# 38. IMPLEMENTATION ORDER

Follow this order:

### STEP 1
Audit current User App.

### STEP 2
Map all routes and clickable entities.

### STEP 3
Complete every missing/empty detail experience.

### STEP 4
Align the existing detail experiences.

### STEP 5
Inventory all hardcoded dynamic data.

### STEP 6
Design the User App domain model.

### STEP 7
Implement PostgreSQL + migrations.

### STEP 8
Implement backend API.

### STEP 9
Implement media storage abstraction.

### STEP 10
Seed realistic data + unique images.

### STEP 11
Connect frontend data layer.

### STEP 12
Connect search.

### STEP 13
Replace hardcoded dynamic content incrementally.

### STEP 14
Run complete click-through QA.

### STEP 15
Run visual + performance + error-state QA.

---

# 39. DEFINITION OF DONE

The current NEXG User App is considered productionized when:

## UX

- 3 current navigation pages work
- existing search UX is preserved
- recent searches work
- popular suggestions work
- search context works
- search closes correctly when context is inactive
- every clickable entity has a destination
- zero empty detail pages remain
- detail experiences are aligned
- add-ons/context/related content are implemented where applicable

## Data

- dynamic data is no longer fundamentally hardcoded
- entities have stable IDs
- relationships work
- categories are data-driven
- restaurants/merchants are data-driven
- items are data-driven
- experiences are data-driven

## Backend

- real API exists
- PostgreSQL exists
- migrations exist
- seed data exists
- validation exists
- environment configuration exists

## Media

- dynamic images are remote
- every relevant entity can have unique media
- media metadata exists
- images are cached appropriately
- image variants are supported or cleanly extensible

## Reliability

- loading states work
- error states work
- empty states work
- unavailable states work
- offline/degraded states are considered
- API failures do not produce blank screens

## Architecture

- Expo remains functional
- current UI remains intact
- API access is centralized
- server state is handled consistently
- backend is domain-oriented
- documentation matches implementation

---

# FINAL PRINCIPLE

Do not think:

> "I need to build a backend for some screens."

Think:

> **"I am turning the NEXG User App into a real client of the NEXG domain."**

The current frontend is the experience.

The backend supplies the truth.

The database stores the entities.

The media system supplies the assets.

The API connects them.

The User App should ultimately be able to receive a completely new restaurant, menu item, experience, category, promotion, or image from the backend **without requiring a new frontend build**.

That is the milestone.

Do not redesign NEXG.

Make the NEXG User App real.

This is the version I'd use **now**, because it keeps the scope brutally focused: **User App → complete UX → real data → real DB → real images → real search**. Then once that's stable, we can layer the broader NEXG platform around the same domain model. `Branch · UX Design Laws.txt`



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)