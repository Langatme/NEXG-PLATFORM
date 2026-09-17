# Design Unified Item Modal!

**User:** Anonymous  
**Created:** 9/1/2026 7:54:34  
**Updated:** 9/3/2026 8:49:57  
**Exported:** 9/10/2026 18:05:28  
**Link:** [https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a965a2c-d378-83ea-9000-b31090ef750a](https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a965a2c-d378-83ea-9000-b31090ef750a)  

## Prompt:
9/1/2026, 7:54:34 AM

Something very important for me at NextG is all. This is where we have, like, a diverse category, and, like, from, you know how diverse it is. Now, like individual merchants who have, like, storefronts on the user app have items. Like, I would call them menu items, but then some are cars, so I can't call them menu. I'll just call them items, whatever they do. So, like, when one of them is clicked, it's supposed to bring some information, and then, like, maybe you can decide to purchase. So, like, when you do purchase, you can— there are things you can add on after you have made the purchase. So, like, how does NextG handle all of that for the diverse range of all the categories? And I want it to render on a single type of, like, just— I made a sheet for it, like a pop-up modal sheet. So, like the data structure should be one, and then, like, it should render in a way that I don't have to do for each specific one. Rather, maybe each has, like, a specific data structure it follows when it's rendering. Yeah.

## Response:
9/1/2026, 7:54:34 AM

> **Searching the web**
>
>
> **Searching 6 websites**
>
> 
>
> Worked for a couple of seconds

Yes. And I think the important realization is:

**NEXG should not model these as “menus.” It should model them as `Items` - but the item itself should be a configurable experience, not just a database row.**

Your instinct about **one modal/sheet renderer** is exactly right.

The UX law document you uploaded actually points directly toward this: the system should be able to survive a “new merchant category / new service / new property type” without rebuilding the interface from scratch. `Branch · UX Design Laws.txt`

### The architecture I'd use

```text
                         NEXG ITEM
                            │
             ┌──────────────┼──────────────┐
             │              │              │
          Identity       Commerce       Experience
             │              │              │
          name/id        price           presentation
          merchant       currency        sections
          category       availability    actions
          type           variants        states
                            │
                         options
                            │
                    ┌───────┴────────┐
                    │                │
                 required          optional
                    │                │
                selections        add-ons
```

Then **one universal Item Sheet** consumes that structure.

---

# 1. Don't make the renderer category-specific

Don't do:

```text
RestaurantItemModal
CarRentalModal
SpaModal
FlowerModal
ExperienceModal
FashionModal
AirportTransferModal
```

That becomes exactly the mess you're trying to avoid.

Instead:

```text
<NexGItemSheet item={item} />
```

And internally:

```text
NexGItemSheet
│
├── ItemHeader
├── ItemMedia
├── ItemSummary
├── ItemAttributes
├── ItemOptions
├── ItemAvailability
├── ItemAddOns
├── ItemPricing
├── PrimaryAction
└── RelatedActions
```

The **sheet stays the same**.

The **data determines what appears inside it**.

This is essentially the same direction used by configurable-commerce systems: the product carries options/variants and the storefront resolves the appropriate representation rather than creating a different UI for every product type. ([Adobe Developer](https://developer.adobe.com/commerce/webapi/graphql/schema/products/interfaces/types/configurable?utm_source=chatgpt.com))

---

# 2. The key is separating ITEM from ITEM TYPE

For example:

### Airport transfer

```text
type: "service"
subtype: "airport_transfer"
```

### Toyota Prado rental

```text
type: "rental"
subtype: "vehicle"
```

### Massage

```text
type: "service"
subtype: "spa"
```

### Dinner

```text
type: "product"
subtype: "food"
```

### Concert ticket

```text
type: "ticket"
subtype: "event"
```

But **the UI doesn't care about those categories directly.**

Instead they map to capabilities.

For example:

```text
capabilities: [
  "quantity",
  "date",
  "time",
  "duration",
  "variant",
  "location",
  "add_ons",
  "booking"
]
```

That's much more powerful.

---

# 3. Think in CAPABILITIES, not categories

This is probably the most important part of the architecture.

A car rental might have:

```text
date
time
duration
vehicle_variant
pickup_location
dropoff_location
insurance_addon
driver_addon
```

A spa treatment:

```text
date
time
duration
therapist
location
add_ons
```

A meal:

```text
variant
quantity
add_ons
special_instructions
```

A clothing item:

```text
size
color
quantity
```

An experience:

```text
date
time
participants
pickup
add_ons
```

Instead of teaching NEXG:

> "If category = car, render this."

Teach it:

> "If the item requires `duration`, render the duration selector."

That gives you an **extensible system**.

---

# 4. Your data structure can therefore look like this

Something conceptually like:

```ts
type NexGItem = {
  id: string
  merchantId: string

  type: ItemType
  subtype?: string

  title: string
  description?: string

  media?: Media[]

  pricing: Pricing

  availability?: Availability

  attributes?: Attribute[]

  options?: OptionGroup[]

  addOns?: AddOnGroup[]

  actions?: ActionConfig[]

  fulfillment?: FulfillmentConfig

  booking?: BookingConfig

  metadata?: Record<string, unknown>
}
```

Then:

```ts
type OptionGroup = {
  id: string
  label: string
  required: boolean
  selection: "single" | "multiple"
  options: Option[]
}
```

And:

```ts
type AddOnGroup = {
  id: string
  label: string
  required: boolean
  selection: "single" | "multiple"

  items: AddOn[]
}
```

So a merchant isn't designing a UI.

They're configuring **data**.

---

# 5. And this solves your "after purchase" problem too

I wouldn't make **purchase** the end of the item experience.

Think:

```text
ITEM
 ↓
CONFIGURE
 ↓
PURCHASE / BOOK
 ↓
ORDER
 ↓
POST-PURCHASE OPTIONS
 ↓
FULFILLMENT
```

For example:

### Hotel experience

User buys:

> Airport transfer

Then NEXG can offer:

```text
Your transfer is booked.

Add to your trip:

+ Meet & greet
+ Extra luggage
+ SIM card
+ Restaurant reservation
+ Airport lounge
```

### Car rental

User books:

> Toyota Prado - 3 days

Then:

```text
Enhance your rental

+ Child seat
+ Additional driver
+ Insurance
+ Delivery to hotel
```

### Experience

User books:

> Nairobi National Park Experience

Then:

```text
Complete your experience

+ Hotel pickup
+ Breakfast
+ Photographer
+ Private vehicle
```

These aren't fundamentally different systems.

They're **relationships between items**.

---

# 6. So I'd introduce `ItemRelationships`

Something like:

```ts
relationships: [
  {
    type: "add_on",
    itemId: "..."
  },
  {
    type: "recommended",
    itemId: "..."
  },
  {
    type: "required_with",
    itemId: "..."
  },
  {
    type: "upgrade",
    itemId: "..."
  }
]
```

Now NEXG can say:

```text
Item A
  ↓
Add-on Item B
  ↓
Recommended Item C
```

without hardcoding those relationships into the UI.

---

# 7. There is one distinction I would make

You said:

> "after you have made the purchase"

Be careful here.

Some "add-ons" should actually be selected **before checkout**.

For example:

```text
Toyota Prado
+ Additional driver
+ Insurance
```

Those affect the transaction price.

So:

```text
ITEM CONFIGURATION
        ↓
OPTIONS / ADD-ONS
        ↓
PRICE RESOLUTION
        ↓
CHECKOUT
        ↓
ORDER
```

But other things can genuinely happen **after purchase**:

```text
ORDER
 ↓
POST_PURCHASE
 ↓
Eligible add-ons
```

For example:

```text
Booked airport transfer
        ↓
Add lounge access
```

That's an important distinction for your backend.

---

# 8. The sheet itself should be schema-driven

This is where your idea gets really good.

The frontend doesn't receive:

> "Render a car modal."

It receives something closer to:

```json
{
  "presentation": {
    "template": "item_sheet",
    "sections": [
      "hero",
      "summary",
      "attributes",
      "options",
      "availability",
      "add_ons",
      "price",
      "primary_action"
    ]
  }
}
```

The renderer simply walks the sections.

```text
NexGItemSheet
      │
      ▼
section registry
      │
      ├── hero → HeroRenderer
      ├── summary → SummaryRenderer
      ├── attributes → AttributeRenderer
      ├── options → OptionRenderer
      ├── availability → AvailabilityRenderer
      ├── add_ons → AddOnRenderer
      ├── price → PriceRenderer
      └── action → ActionRenderer
```

**That's the abstraction you want.**

---

# 9. But don't make everything completely generic

There's a trap here.

You don't want:

```text
one giant JSON schema
that can describe literally anything
```

because eventually it becomes impossible to understand.

Instead:

### Universal primitives

```text
Item
Price
Media
Attribute
Option
Variant
AddOn
Availability
Location
Schedule
Quantity
Duration
Action
Order
```

Then:

### Domain capabilities

```text
Bookable
Purchasable
Rentable
Reservable
Deliverable
Configurable
Schedulable
```

Then:

### Category-specific data

```text
Vehicle:
  seats
  transmission
  fuel
  doors

Spa:
  treatment_duration
  therapist
  treatment_type

Food:
  ingredients
  dietary_info
  preparation_time
```

The category-specific information lives in the **data**, not in a completely different UI architecture.

---

# 10. This is basically the NEXG principle

Your uploaded design document says:

> **"Components are reusable; experiences are contextual."** `Branch · UX Design Laws.txt`

That's exactly what you're describing.

The component:

```text
NexGItemSheet
```

is reusable.

The experience:

```text
Toyota Prado rental
```

is contextual.

And the sheet becomes the **universal interaction surface for NEXG commerce/services**.

---

## The architecture I'd lock in

```text
                    MERCHANT
                       │
                       ▼
                  NEXG ITEM
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       CONTENT     CAPABILITIES   COMMERCE
          │            │            │
       title       bookable       price
       media       schedulable    variants
       desc        configurable   inventory
       attrs       deliverable    availability
                    rentable
                       │
                       ▼
                EXPERIENCE SCHEMA
                       │
                       ▼
                NEXG ITEM SHEET
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
    Sections        Components        States
       │               │                │
    Hero            Options          Loading
    Details         Add-ons          Selected
    Options         Calendar         Unavailable
    Availability    Quantity         Success
    Add-ons         Location          Error
    Pricing         etc.
       │
       ▼
                  ACTION ENGINE
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
           Cart      Booking    Purchase
             │         │         │
             └─────────┼─────────┘
                       ▼
                     ORDER
                       │
                       ▼
              POST-PURCHASE ENGINE
                       │
                Related / Add-ons
```

**So yes: one data model + one sheet + schema-driven sections is the right direction.**

And I would go one step further: **don't let merchants directly choose the UI.** Let them define the item's data, capabilities, options, availability and relationships. NEXG's renderer decides the appropriate experience. That is what lets you add 50 categories without creating 50 frontends.

---

**Sources:**

- [Configurable product data types](https://developer.adobe.com/commerce/webapi/graphql/schema/products/interfaces/types/configurable?utm_source=chatgpt.com)



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)