# NEXG Retail Integration

**User:** Anonymous  
**Created:** 8/7/2026 9:03:58  
**Updated:** 8/7/2026 11:38:14  
**Exported:** 9/10/2026 19:02:17  
**Link:** [https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a757542-4ac8-83ea-86e3-8b8bb21b0495](https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a757542-4ac8-83ea-86e3-8b8bb21b0495)  

## Prompt:
8/7/2026, 9:03:57 AM

https://developer.wolt.com/docs/getting-started/retail
I want you to read this

## Response:
8/7/2026, 9:03:58 AM

> **Searching the web**
>
>
> **Searching developer.wolt.com**
>
> 
>
> Worked for a couple of seconds

Yes. I’ve read the **Wolt Retail integration documentation** you linked, including the related Retail Order and Assortment guides.

The important thing for **NEXG** is that Wolt’s Retail integration is quite different from their restaurant/POS integration:

- **Retail includes grocery, pharmacy, electronics, etc.**
- Wolt supports **API or SFTP** integrations.
- The integration can update:
  - prices
  - discounts
  - inventory/stock
  - item visibility
- **It does not create the initial assortment** through the API/SFTP; Wolt’s onboarding team handles assortment creation. ([Wolt for Developers](https://developer.wolt.com/docs/getting-started/retail))
- For retail orders, **Wolt's Merchant App handles the picking/order-management process**. Your system pulls the resulting order details through the Order API. ([Wolt for Developers](https://developer.wolt.com/docs/getting-started/retail))
- The recommended retail flow is essentially:
  **Wolt order → merchant picks in Wolt → order reaches READY → NEXG receives webhook → NEXG pulls final order → NEXG processes it.**
- This matters because **substitutions and missing items are only reflected in the final order after picking**, so NEXG should not treat the initial order as the definitive commercial order. ([Wolt for Developers](https://developer.wolt.com/docs/retail-order-guide?utm_source=chatgpt.com))
- Wolt explicitly recommends treating webhook notifications as **triggers**, then pulling the full order before processing it internally.
- Webhooks use **HMAC-SHA256 signatures**, and Wolt expects a `200` response; failed notifications are retried. ([Wolt for Developers](https://developer.wolt.com/docs/retail-order-guide?utm_source=chatgpt.com))
- Authentication for the API is based on **OAuth 2.0/Bearer tokens**. ([Wolt for Developers](https://developer.wolt.com/docs/api/order?utm_source=chatgpt.com))
- Wolt says its APIs themselves are **free to use**, although integration requires their onboarding/T&Cs and access credentials. ([Wolt for Developers](https://developer.wolt.com/docs/faq?utm_source=chatgpt.com))

### The really interesting part for NEXG

This gives us a very clear architectural pattern.

If we're thinking about **NEXG as the merchant's operating system**, rather than simply another marketplace, we could build our retail integration layer like:

**Merchant POS / ERP / NEXG Inventory**
↓  
**NEXG Retail Integration Engine**
↓  
**Wolt API**

And separately:

**Wolt Webhook**
↓  
**NEXG Order Intake**
↓  
**Pull final Wolt order**
↓  
**Normalize into NEXG Order**
↓  
**Inventory / fulfillment / payment / customer / analytics**

That means **Wolt doesn't have to become the source of truth for the merchant**. NEXG can maintain the merchant's canonical product, inventory and order model while synchronizing the relevant state with Wolt.

And this is especially relevant to the architecture discussion we've been having: **we don't need to build the entire giant infrastructure from day one.** We can start with a monolith containing a clean integration boundary, then later extract things like inventory sync, webhooks, observability, integrations, etc.

I also read the adjacent Wolt documentation because it clarifies some important distinctions. Wolt's **restaurant integration** has much more extensive order-management APIs-accept, reject, ready, etc.-whereas **retail is intentionally centered around Wolt's picking workflow and retrieving the final order**. ([Wolt for Developers](https://developer.wolt.com/docs/getting-started/restaurant?utm_source=chatgpt.com))

[Wolt Retail Getting Started](https://developer.wolt.com/docs/getting-started/retail?utm_source=chatgpt.com)

If your reason for sending me this is **“I want NEXG to integrate with Wolt the way a serious POS/ERP/middleware platform does”**, then yes-there's a lot here we should use as an architectural reference.

---

**Sources:**

- [Getting started for retailers - Wolt for Developers](https://developer.wolt.com/docs/getting-started/retail)

## Prompt:
8/7/2026, 9:05:19 AM

I am not integrating with them 
I am using them to map pout how to create all that for NexG and the proper documentation for merchants IT teams

## Response:
8/7/2026, 9:05:19 AM

Exactly. That changes the exercise completely.

You’re **not building a Wolt integration**. You’re using Wolt’s developer documentation as a **benchmark for how NEXG should expose its own merchant-facing technical ecosystem**.

And I think that is the right way to look at it.

### What we should extract from Wolt

We should study Wolt as a **documentation and platform-design reference**, not copy its APIs.

For NEXG, we need to answer:

> **“If a serious merchant has an IT team, POS, ERP, inventory system, website, or custom software, how does that system integrate with NEXG?”**

That means NEXG eventually needs its own equivalent of a **Developer Platform**.

Something like:

```text
NEXG Developer Platform
│
├── Getting Started
│   ├── Introduction
│   ├── Architecture
│   ├── Authentication
│   ├── Environments
│   ├── API Keys
│   └── Quick Start
│
├── Merchant APIs
│   ├── Merchants
│   ├── Locations
│   ├── Products
│   ├── Categories
│   ├── Pricing
│   ├── Inventory
│   ├── Customers
│   ├── Orders
│   ├── Payments
│   ├── Deliveries
│   └── Promotions
│
├── Webhooks
│   ├── Order Created
│   ├── Order Updated
│   ├── Order Cancelled
│   ├── Inventory Changed
│   ├── Payment Events
│   ├── Delivery Events
│   └── Customer Events
│
├── Integrations
│   ├── POS
│   ├── ERP
│   ├── Accounting
│   ├── Ecommerce
│   ├── Inventory
│   └── Custom Systems
│
├── SDKs
│   ├── JavaScript / TypeScript
│   ├── Python
│   ├── PHP
│   └── Java
│
├── Guides
│   ├── Build a POS Integration
│   ├── Sync Products
│   ├── Sync Inventory
│   ├── Receive Orders
│   ├── Process Orders
│   └── Handle Webhooks
│
└── Reference
    ├── REST API
    ├── Webhooks
    ├── Errors
    ├── Rate Limits
    └── Changelog
```

### But there's an even bigger lesson

Wolt isn't merely documenting endpoints.

They're documenting **business capabilities**.

That's what NEXG needs to do.

For example, don't start with:

> `POST /orders`

Start with:

> **Orders API**

**What it does**

Allows merchant systems to retrieve, create, update and synchronize orders between NEXG and the merchant's own systems.

Then explain:

```text
Merchant POS
     │
     │ order
     ▼
   NEXG
     │
     ├── Payment
     ├── Inventory
     ├── Fulfillment
     ├── Customer
     └── Delivery
```

Then define the actual API.

That makes the documentation understandable to an **IT manager, CTO, developer, POS vendor, or systems integrator**, rather than only an API developer.

---

## And NEXG needs a proper integration philosophy

I'd establish this before writing hundreds of endpoints.

### 1. NEXG is the platform

External systems integrate **into NEXG**, rather than NEXG having one-off integrations for every merchant.

```text
                    ┌─────────────┐
                    │ POS         │
                    └──────┬──────┘
                           │
┌─────────────┐            │
│ ERP         │────────────┤
└─────────────┘            │
                           ▼
                    ┌─────────────┐
                    │             │
┌─────────────┐     │    NEXG     │
│ Ecommerce   │────►│ Developer   │
└─────────────┘     │ Platform    │
                    │             │
┌─────────────┐     │             │
│ Inventory   │────►│             │
└─────────────┘     └─────────────┘
```

### 2. APIs are only one part

NEXG should provide several integration mechanisms:

**REST APIs**

For transactional and operational integrations.

**Webhooks**

For real-time event delivery.

**Bulk import/export**

For large datasets.

**File-based integration**

CSV/JSON/SFTP where appropriate for legacy enterprise systems.

**SDKs**

To make development easier.

**OAuth / API credentials**

For secure authentication.

**Sandbox**

So merchant IT teams can develop without touching production.

---

## 3. We need a canonical NEXG data model

This is probably the most important thing to establish **before** writing the API documentation.

For example:

```text
Merchant
   │
   ├── Locations
   │
   ├── Catalog
   │     ├── Categories
   │     ├── Products
   │     ├── Variants
   │     ├── Modifiers
   │     └── Prices
   │
   ├── Inventory
   │
   ├── Customers
   │
   ├── Orders
   │     ├── Items
   │     ├── Payments
   │     └── Fulfillment
   │
   └── Deliveries
```

Then **every API and webhook is built around that model**.

That prevents us from ending up with a collection of disconnected endpoints.

---

# The documentation should actually have two audiences

This is something I would deliberately do differently from many developer portals.

### Merchant IT / Technical Manager

They need:

- What can NEXG integrate with?
- What systems can connect?
- What data can be synchronized?
- What credentials are required?
- What does NEXG expect from their system?
- What does NEXG send back?
- Security requirements
- Network requirements
- Webhook requirements
- Implementation timeline
- Testing process
- Go-live process
- Support process

### Developer

They need:

- endpoints
- request schemas
- response schemas
- authentication
- pagination
- filtering
- errors
- idempotency
- webhooks
- signatures
- retries
- rate limits
- SDKs
- examples

So the documentation could start:

**NEXG Developer Platform**

> Integrate your systems with NEXG.

Then:

**I'm a...**

`Merchant IT Team` | `Developer` | `Integration Partner`

That would make the platform feel much more enterprise-ready.

---

## And we should document the operational contract

This is where I think NEXG can become significantly more professional.

For every integration we should define:

### Authentication

```text
How does the system authenticate?
```

### Authorization

```text
What can this credential access?
```

### Data ownership

```text
Who is the source of truth?
```

### Synchronization

```text
Who sends changes?
How quickly?
What happens if synchronization fails?
```

### Idempotency

```text
What happens if the same order is sent twice?
```

### Webhooks

```text
How are events authenticated?
How are retries handled?
How does the merchant acknowledge them?
```

### Errors

```text
What does 400 mean?
401?
403?
404?
409?
422?
429?
500?
```

### Versioning

```text
/v1
/v2
```

### Reliability

```text
timeouts
retry policy
rate limits
availability
maintenance
```

### Security

```text
TLS
credential management
IP restrictions
signature verification
audit logs
least privilege
```

That is the difference between **“we have an API”** and **“we have an integration platform.”**

---

### So yes - I would use Wolt as a reference architecture.

But I would **not copy Wolt's structure blindly**.

I'd reverse-engineer the documentation and ask:

> **What does a merchant IT team need to know before connecting their system to NEXG?**

Then we design **NEXG's own Developer Platform + Integration Specification** around that.

And given what we've already designed for NEXG-merchant portal, orders, inventory, delivery, payments, CRM, multi-tenancy, etc.-we can make this substantially broader than Wolt's retail documentation.

**The next thing I'd do is map Wolt's entire developer documentation into a requirements matrix: `Wolt concept → Why it exists → NEXG equivalent → NEXG requirement → Documentation we need → API/webhook needed`.** That gives us the blueprint before we write a single NEXG endpoint.

## Prompt:
8/7/2026, 9:07:37 AM

I am not copying blindly I’m asking for steps to produce that unique to us

## Response:
8/7/2026, 9:07:37 AM

Yes — and the distinction is important.

You’re asking **how NEXG should systematically arrive at its own developer platform and merchant IT documentation**, using Wolt only as a reference for the *level of maturity and completeness*.

I would do it in this order:

## NEXG Developer Platform — Production Method

### Phase 1 — Define the NEXG integration philosophy

Before APIs, decide what NEXG actually allows external systems to do.

Map:

**Merchant → NEXG → External systems**

Identify every system a NEXG merchant might have:

- POS
- ERP
- Accounting
- Ecommerce
- Inventory/WMS
- CRM
- Payment systems
- Delivery/logistics
- Loyalty
- Booking/reservation systems
- Custom software

Then define the fundamental relationship:

> **What is NEXG responsible for, and what remains the merchant's system's responsibility?**

This becomes the foundation of everything else.

---

# Phase 2 — Map NEXG's business domains

Don't start by designing endpoints.

First create the **NEXG Domain Map**.

For example:

```text
NEXG
│
├── Identity
├── Organizations
├── Merchants
├── Locations
│
├── Catalog
│   ├── Categories
│   ├── Products
│   ├── Variants
│   ├── Modifiers
│   └── Pricing
│
├── Inventory
│
├── Customers
│
├── Orders
│
├── Payments
│
├── Fulfillment
│
├── Delivery
│
├── Promotions
│
├── Reviews
│
├── Notifications
│
└── Analytics
```

But this needs to be **NEXG-specific**, based on the actual platform you are building.

For every domain ask:

1. What entity exists?
2. Who owns it?
3. Who creates it?
4. Who can modify it?
5. Who consumes it?
6. What events happen to it?
7. Does an external system need access?
8. Does NEXG need to push changes outward?

That produces the actual integration surface.

---

# Phase 3 — Define the canonical data model

Now establish the **NEXG source of truth**.

For example:

```text
Product
 ├── productId
 ├── merchantId
 ├── name
 ├── description
 ├── category
 ├── variants
 ├── pricing
 └── status
```

Then decide:

> If the merchant's POS says Product X costs KSh 500 but NEXG says KSh 550, which one wins?

That question is far more important than the endpoint itself.

For each entity define:

**Source of truth → synchronization direction → conflict resolution → update frequency.**

This becomes the **NEXG Integration Data Contract**.

---

# Phase 4 — Identify integration use cases

Now think like the merchant's IT team.

Don't ask:

> "What APIs should we build?"

Ask:

> **"What does the merchant actually need their system to accomplish?"**

Examples:

### Catalog

> "I want my POS catalog to appear in NEXG."

### Inventory

> "When an item sells in my POS, NEXG should know it's out of stock."

### Orders

> "When a NEXG order arrives, send it to our POS."

### Fulfillment

> "Tell our system when the order has been accepted, prepared and completed."

### Customers

> "Synchronize customer records."

### Payments

> "Tell our accounting system what was paid and how."

Those use cases then become **integration guides**.

---

# Phase 5 — Turn use cases into capabilities

Now you derive the platform capabilities.

For example:

**Use case**

> POS receives NEXG orders.

requires:

```text
Orders API
+
Order webhook
+
Authentication
+
Idempotency
+
Order status model
+
Error handling
+
Retry policy
```

So you're deriving the API from the business requirement rather than inventing APIs first.

---

# Phase 6 — Design the NEXG API

Only now should we design endpoints.

For example:

```text
GET    /v1/merchants
GET    /v1/locations
GET    /v1/products
POST   /v1/products
PATCH  /v1/products/{id}

GET    /v1/inventory
POST   /v1/inventory/adjustments

GET    /v1/orders
GET    /v1/orders/{id}
POST   /v1/orders/{id}/...
```

But every endpoint must have:

- purpose
- authentication
- authorization
- request
- response
- validation
- errors
- idempotency requirements
- pagination
- filtering
- rate limits
- versioning
- examples

---

# Phase 7 — Design the event system

This deserves its own architecture.

NEXG should define an **event taxonomy**.

For example:

```text
order.created
order.updated
order.cancelled
order.fulfilled

inventory.updated

product.created
product.updated
product.archived

payment.created
payment.completed
payment.failed

delivery.created
delivery.assigned
delivery.completed
```

Then define the event contract:

```text
eventId
eventType
eventVersion
occurredAt
merchantId
resourceId
data
```

And then:

**signature → delivery → acknowledgement → retry → failure → replay**

This becomes the **NEXG Webhooks Specification**.

---

# Phase 8 — Design authentication and security

Before publishing documentation, define exactly how merchant systems authenticate.

Potentially:

```text
OAuth 2.0
API Keys
Service Accounts
Signed Webhooks
```

Then define:

- credential creation
- credential rotation
- scopes
- permissions
- expiration
- revocation
- sandbox credentials
- production credentials
- IP restrictions if required
- auditability

Don't leave this until after the APIs.

---

# Phase 9 — Build Sandbox + testing

A professional developer platform needs somewhere to experiment.

Create:

```text
NEXG Sandbox
       │
       ├── Test merchant
       ├── Test location
       ├── Test products
       ├── Test inventory
       ├── Test orders
       └── Test webhooks
```

Then give IT teams:

- test credentials
- sample data
- webhook simulator
- API explorer
- test scenarios
- expected responses

This is where they validate their integration before production.

---

# Phase 10 — Define certification and go-live

This is something I would make **very deliberate for NEXG**.

Merchant IT team:

```text
Build
 ↓
Sandbox test
 ↓
Integration review
 ↓
Security validation
 ↓
Certification
 ↓
Production credentials
 ↓
Go-live
 ↓
Monitoring
```

Define exactly what constitutes a successful integration.

For example:

- authentication works
- catalog synchronization works
- order synchronization works
- webhook verification works
- duplicate events handled
- errors handled
- retries handled
- production credentials secured

Then NEXG can say:

> **Integration Certified**

That's much more professional than simply handing someone an API key.

---

# Phase 11 — Now write the documentation

Only after all of that should we structure the developer portal.

I'd make NEXG's documentation hierarchy:

```text
NEXG Developers
│
├── Getting Started
│
├── Concepts
│
├── Guides
│
├── API Reference
│
├── Webhooks
│
├── SDKs
│
├── Integration Requirements
│
├── Testing & Sandbox
│
├── Security
│
├── Go-Live
│
├── Changelog
│
└── Support
```

### Getting Started

For someone who has never integrated NEXG.

### Concepts

Explain how NEXG works.

### Guides

Task-oriented instructions:

> Sync your catalog

> Receive orders

> Send inventory updates

> Connect a POS

### API Reference

Machine-level technical specification.

### Integration Requirements

For the merchant's IT manager.

### Testing

How to prove the integration works.

### Go-Live

How to move into production.

---

# Phase 12 — Generate documentation from the actual API

This is critical.

**Don't manually maintain API documentation separately from the code.**

The architecture should eventually look like:

```text
NEXG Backend
      │
      ▼
OpenAPI Specification
      │
 ┌────┴───────────┐
 ▼                ▼
API Reference     SDK generation
 │
 ▼
Developer Portal
```

That gives you one source of truth.

When an endpoint changes, the documentation changes with it.

---

# Phase 13 — Establish the NEXG developer experience

Finally, test the documentation as if you were an external developer.

Give a developer:

> "You have a NEXG merchant. Connect their POS and make orders flow into it."

Then **don't help them**.

Watch where they get stuck.

If they can't figure out authentication → documentation problem.

If they don't understand merchant/location relationships → data-model problem.

If they don't know which webhook to use → event architecture problem.

If they can't test → sandbox problem.

If they can integrate but don't know how to go live → operational documentation problem.

That's how you get the documentation to become genuinely good.

---

## The overall process

So I would make our NEXG methodology:

```text
                    NEXG PLATFORM
                         │
                         ▼
               1. Integration Philosophy
                         │
                         ▼
                  2. Domain Mapping
                         │
                         ▼
                3. Canonical Data Model
                         │
                         ▼
                 4. Integration Use Cases
                         │
                         ▼
                  5. Platform Capabilities
                         │
                         ▼
                    6. API Design
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        7. Event System       8. Security
              │                     │
              └──────────┬──────────┘
                         ▼
                  9. Sandbox
                         │
                         ▼
                 10. Certification
                         │
                         ▼
                 11. Documentation
                         │
                         ▼
                12. Developer Portal
                         │
                         ▼
                 13. Developer Test
```

**That is the process I recommend we use for NEXG.**

And importantly, **we should do this before we start writing the actual NEXG developer documentation**. Otherwise we'll end up documenting assumptions that haven't been settled in the platform itself.

## Prompt:
8/7/2026, 9:21:30 AM

Yes. I extracted the actual merchant Category → Subcategory hierarchy from the uploaded NexG merchant onboarding file. The file defines this as the CATALOG used to render the merchant category selection. merchant-onboarding-updated.html

NexG Merchant Categories & Subcategories

#	Category	Subcategories
1	Adults Only	Adult Products; Adult Wellness; Cigarettes; Cigars; Vapes; Adult Accessories
2	Airport Transfers	Airport Pickup; Airport Drop-off; Meet & Greet; Executive Transfer
3	Alcohol & Beverages	Wine; Spirits; Beer; Champagne; Cocktail Mixers; Liquor Stores
4	Fashion & Apparel	Men’s Fashion; Women’s Fashion; Kids Fashion; Shoes; Bags; Watches; Accessories
5	Beauty	Makeup; Skincare; Haircare; Fragrances; Cosmetics Stores
6	Vehicle Rentals	Car Rental; Self Drive; Corporate Rental; Long-Term Rental; Bike Rental
7	Experiences	Concerts; Festivals; Conferences; Private Events; Photography; Workshops; Classes; Sports Activities; Recreation
8	Financial Services	Banking; Forex; Insurance; Payments; Remittance; Sacco Services; Business Services
9	Flowers & Gifts	Flowers; Gift Hampers; Cakes; Chocolates; Personalized Gifts; Occasion Gifts
10	Restaurants & Food	Restaurant; Fast Food; Café; Bakery; Desserts; Juice Bar; Cloud Kitchen; Catering
11	Groceries & Essentials	Supermarket; Convenience Store; Fresh Produce; Butchery; Seafood; Organic Store
12	Laundry & Cleaning	Laundry; Dry Cleaning; Ironing; Home Cleaning; Office Cleaning
13	Marketplace	Home & Living; Furniture; Appliances; Decor; Kitchenware; Books; Stationery; Office Supplies; General Retail
14	Pharmacy	Pharmacy; Medical Supplies; Baby Products; Supplements
15	Health	Clinics; Telemedicine; Labs; Mental Health (Therapy); Coaching
16	Tech & Electronics	Smartphones; Accessories; Computers; Gaming; Audio; Telecom Services; Smart Devices
17	Travel & Tours	Safaris; Game Drives; Luxury Safaris; City Tours; Cultural Tours; Adventure Tours; Travel Packages
18	Vehicle Services	Car Wash; Tire Service; Battery Service; Vehicle Assistance; Vehicle Inspection
19	Wellness	Spa; Massage; Gym; Personal Training
20	Concierge Services	Reservations; Personal Assistance; Shopping Assistance; Gift Sourcing; Travel Planning; Property Coordination; Moving Assistance; Cleaning Coordination; VIP Assistance
21	Logistics & Shipping	Sea Freight; Air Freight; Road Freight & Trucking; Warehousing & Storage

The source also assigns each category/subcategory internal IDs plus fulfillment and workflow metadata, meaning this isn’t merely display categorization—the hierarchy is already being used to drive NexG’s operational logic. merchant-onboarding-updated.html

For example, Restaurants & Food has 8 subcategories, while Marketplace has 9 and Concierge Services has 9. 

Total: 21 categories and 134 subcategories.

If your next goal is what we discussed earlier—building the proper NexG merchant taxonomy/documentation rather than just copying Wolt—this is the current baseline we should work from.

That’s all I can give you as what we provide and it should guide the rest of the process 
1. Can we do Phase 1 now

## Response:
8/7/2026, 9:21:32 AM

Yes. **Phase 1 is exactly what we should do now**, and the 21-category / 134-subcategory catalog you provided should be treated as the starting boundary for the exercise.

The important thing is that we're not designing a generic marketplace integration platform. We're defining **how external merchant systems interact with the actual NEXG operating model**.

## Phase 1 — NEXG Integration Philosophy

### 1. NEXG's fundamental role

NEXG should be defined as a **merchant operating and commerce platform**, not merely a marketplace.

A merchant may have its own:

- POS
- ERP
- accounting system
- inventory system
- ecommerce website
- booking system
- CRM
- logistics system
- custom software

NEXG should provide a standardized integration layer through which those systems can interact with NEXG.

The core principle should be:

> **NEXG provides the operational platform and standardized interfaces; merchants remain free to use their existing systems and connect them to NEXG.**

---

# 2. What NEXG actually provides

Based on the merchant catalog you supplied, NEXG isn't just dealing with "restaurants."

It needs to support very different merchant operating models:

| NEXG capability | Examples |
|---|---|
| Catalog | Products, services, packages, experiences |
| Pricing | Product prices, service prices, package prices |
| Availability | Stock, capacity, appointment availability |
| Orders | Product and service orders |
| Reservations | Tables, activities, experiences |
| Bookings | Tours, vehicles, appointments |
| Payments | Online/offline payment state |
| Fulfillment | Pickup, delivery, service execution |
| Delivery | Logistics and last-mile fulfillment |
| Customers | Customer profiles and order history |
| Locations | Merchant branches/service locations |
| Inventory | Physical stock and availability |
| Scheduling | Appointments, bookings, operating hours |
| Promotions | Discounts, offers and campaigns |
| Documents | Receipts, invoices and operational documents |
| Notifications | Customer and merchant events |

But **not every merchant category uses every capability**.

That's an important principle.

A pharmacy and a safari operator shouldn't be forced into the same workflow simply because both are "merchants."

---

# 3. NEXG's taxonomy drives capabilities

This is where the information from your onboarding file becomes extremely valuable.

The category isn't merely:

> "What type of business are you?"

It becomes:

> **"What operational capabilities does this merchant require?"**

For example:

### Restaurants & Food

Could require:

```text
Catalog
→ Menu
→ Modifiers
→ Pricing
→ Inventory
→ Orders
→ Kitchen workflow
→ Pickup
→ Delivery
→ Payments
```

### Travel & Tours

Could require:

```text
Experiences
→ Packages
→ Availability
→ Capacity
→ Booking
→ Customer
→ Payment
→ Guide/vehicle assignment
→ Fulfillment
```

### Vehicle Rentals

Could require:

```text
Vehicles
→ Availability
→ Pricing
→ Booking
→ Customer
→ Documents
→ Pickup
→ Return
→ Payment
```

### Laundry & Cleaning

Could require:

```text
Services
→ Service types
→ Pricing
→ Pickup
→ Processing
→ Status
→ Delivery
→ Payment
```

### Tech & Electronics

Could require:

```text
Catalog
→ Products
→ Variants
→ Inventory
→ Pricing
→ Orders
→ Fulfillment
→ Delivery
→ Warranty
```

So **taxonomy → capabilities → workflows → APIs/events** becomes one of the central NEXG architectural principles.

---

# 4. The integration boundary

We should establish a very clear boundary.

```text
                    MERCHANT
                       │
        ┌──────────────┼──────────────┐
        │              │              │
       POS            ERP        Custom Software
        │              │              │
        └──────────────┼──────────────┘
                       │
                 NEXG Integration
                       │
              ┌────────┴────────┐
              │                 │
           NEXG APIs         NEXG Events
              │                 │
              └────────┬────────┘
                       │
                  NEXG Platform
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     Customer       Commerce      Fulfillment
     Experience     Operations     & Logistics
```

External systems should **not directly access NEXG's internal database or internal services**.

Everything crosses a controlled integration boundary.

That gives us:

- security
- versioning
- auditability
- consistent validation
- rate limiting
- tenant isolation
- backward compatibility
- observability

---

# 5. The source-of-truth principle

This needs to be one of our strongest Phase 1 decisions.

NEXG should distinguish between:

### NEXG-owned data

Data fundamentally belonging to NEXG's platform.

Examples:

- NEXG merchant ID
- NEXG customer ID
- NEXG order ID
- NEXG delivery ID
- NEXG platform status
- NEXG fulfillment state
- NEXG transaction records

### Merchant-owned data

Data originating from the merchant's own system.

Examples:

- POS product ID
- merchant SKU
- ERP customer ID
- merchant inventory quantity
- merchant accounting reference

Therefore an integration should support **external references**.

Conceptually:

```text
NEXG Product
productId: NEXG-PROD-00123

merchantReference:
    system: POS
    id: POS-84722
```

This prevents NEXG from trying to replace every merchant's existing system.

---

# 6. NEXG should support multiple integration directions

This is another fundamental decision.

### Merchant → NEXG

For example:

```text
POS
 ↓
Product update
 ↓
NEXG
```

or:

```text
ERP
 ↓
Inventory update
 ↓
NEXG
```

### NEXG → Merchant

For example:

```text
NEXG
 ↓
order.created
 ↓
Merchant POS
```

### Bidirectional

```text
        ┌───────────────┐
        │     NEXG      │
        └───────┬───────┘
          ↑     │     ↓
       update   │   event
          │     │     │
          └─────┴─────┘
             Merchant
```

This means we shouldn't design the integration platform as simply "an API that merchants call."

It is a **two-way synchronization and event platform**.

---

# 7. Integration methods

Phase 1 should establish that NEXG can eventually support multiple integration mechanisms.

### Primary

**REST API**

For real-time operations.

### Event-driven

**Webhooks**

For NEXG → merchant events.

### Bulk

**Bulk import/export**

For large datasets and onboarding.

### Legacy / enterprise

**File-based integration**

CSV/JSON/SFTP where necessary.

### Developer convenience

**SDKs**

For supported languages.

We don't necessarily need to build all of these in MVP.

But the **platform philosophy should account for them**.

---

# 8. Integration must be capability-aware

This is particularly important because of your 21 categories.

A merchant should not receive an enormous generic API surface and be expected to figure out what applies to them.

NEXG already knows:

```text
Merchant
   ↓
Category
   ↓
Subcategory
   ↓
Capabilities
   ↓
Workflows
   ↓
Integration requirements
```

For example:

```text
Merchant
Restaurant
   ↓
Restaurants & Food
   ↓
Restaurant
   ↓
Catalog
Orders
Inventory
Payments
Fulfillment
Delivery
```

While:

```text
Merchant
Safari Operator
   ↓
Travel & Tours
   ↓
Safaris
   ↓
Experiences
Bookings
Availability
Customers
Payments
Fulfillment
```

This will eventually allow the developer portal to say:

> **Your merchant is configured for these NEXG capabilities.**

Instead of giving every merchant the same irrelevant documentation.

---

# 9. NEXG integration lifecycle

We should establish this as the standard lifecycle:

```text
DISCOVER
   ↓
REGISTER
   ↓
AUTHENTICATE
   ↓
DEVELOP
   ↓
SANDBOX TEST
   ↓
VALIDATE
   ↓
CERTIFY
   ↓
PRODUCTION
   ↓
MONITOR
   ↓
VERSION / MAINTAIN
```

This becomes part of the merchant IT documentation.

---

# 10. What we explicitly DON'T want

Phase 1 should also establish anti-principles.

### ❌ Don't build one custom API per merchant

Instead:

**One standardized NEXG integration platform.**

### ❌ Don't expose internal database structures

External integrations use stable contracts.

### ❌ Don't assume every merchant operates the same way

Taxonomy and capabilities determine workflows.

### ❌ Don't make NEXG dependent on one POS

Integrate through standardized interfaces.

### ❌ Don't make synchronous APIs responsible for everything

Use APIs for operations and events/webhooks for asynchronous state changes.

### ❌ Don't make the merchant IT team reverse-engineer NEXG

Documentation should explicitly explain:

**What → Why → How → Example → Failure → Recovery**

---

# 11. The Phase 1 statement

I would formally capture our first architectural principle like this:

> **NEXG Integration Philosophy**
>
> NEXG provides a standardized, secure and capability-aware integration platform that enables merchants and their authorized technology providers to connect existing business systems to NEXG without requiring merchants to replace their existing operational infrastructure.
>
> NEXG integrations are organized around NEXG's canonical business domains, merchant taxonomy, capabilities, workflows and event model. External systems interact with NEXG exclusively through documented integration interfaces rather than internal platform components.
>
> NEXG supports both inbound and outbound integration, allowing authorized systems to synchronize operational data with NEXG and receive relevant NEXG events.
>
> The integration experience is designed around the merchant's actual business capabilities rather than providing every merchant with an undifferentiated API surface.

### And that gives us our Phase 1 output:

**NEXG Integration Philosophy v1**

with six foundational principles:

1. **NEXG is the integration platform, not merely a marketplace.**
2. **NEXG's merchant taxonomy determines operational capabilities.**
3. **NEXG maintains canonical platform entities while supporting merchant-system references.**
4. **Integrations are bidirectional: APIs for operations, events for state changes.**
5. **External systems interact through stable, versioned contracts—not NEXG internals.**
6. **The integration experience is capability-aware and follows a controlled lifecycle from development to production.**

**Phase 1 is therefore complete at the conceptual level.**

The next phase should be **Phase 2: NEXG Domain & Capability Mapping**. That's where we take your **21 categories / 134 subcategories** and determine exactly which NEXG capabilities each one activates. That mapping will become the bridge between your merchant onboarding system and the eventual APIs, webhooks, workflows, and developer documentation.

## Prompt:
8/7/2026, 9:26:36 AM

Repeat and use concrete information based 
3 taxonomy drives is a culprit on the categories and sub categories and general context remove for example

Number 5 should say how we will do this throughout the project and give examples
Do not use for example  

6. Do not use for example 
Give me what it will do and how and an example of a result based off info we have
8. No for example

## Response:
8/7/2026, 9:26:37 AM

Yes. We should make Phase 1 a **real NEXG architecture document**, not a generic integration-platform explanation. The 21 categories and 134 subcategories are the concrete starting point, and every principle should describe **what NEXG will actually do**.

# Phase 1 — NEXG Integration Philosophy

## 1. NEXG's Integration Role

NEXG will provide a standardized integration platform that allows a merchant's existing technology systems to communicate with NEXG without requiring the merchant to replace those systems.

NEXG will sit between the merchant's operational systems and NEXG's own merchant, customer, commerce, fulfillment, payment and logistics capabilities.

The integration boundary will be:

```text
Merchant Systems
│
├── POS
├── ERP
├── Accounting
├── Inventory System
├── Ecommerce System
├── Booking System
└── Custom Software
        │
        ▼
┌───────────────────────────┐
│     NEXG Integration      │
│          Layer            │
├───────────────────────────┤
│ APIs                      │
│ Webhooks                  │
│ Authentication            │
│ Data Contracts            │
│ Event Contracts           │
│ Validation                │
│ Rate Limits               │
│ Audit                     │
└─────────────┬─────────────┘
              │
              ▼
       NEXG Platform
```

The merchant's systems will never connect directly to NEXG's internal database or internal services.

Every external integration will pass through the controlled NEXG integration layer.

---

# 2. NEXG's Integration Model

NEXG will support three fundamental interaction patterns.

### Inbound

Merchant systems send information into NEXG.

```text
Merchant POS
     │
     │ Product / Inventory update
     ▼
    NEXG
```

### Outbound

NEXG sends information to merchant systems.

```text
NEXG
 │
 │ Order Created
 ▼
Merchant POS
```

### Bidirectional

Both systems exchange information and synchronize operational state.

```text
              ┌─────────────┐
              │    NEXG     │
              └──────┬──────┘
                 ▲   │   ▼
                 │   │   │
              Updates  Events
                 │   │   │
              ┌──┴───┴───┐
              │ Merchant  │
              │  System    │
              └────────────┘
```

The NEXG platform therefore has to support both **data synchronization** and **event-driven communication**.

---

# 3. NEXG Taxonomy Drives Integration Capabilities

The existing NEXG merchant taxonomy is the starting point for determining what a merchant can operate and what integration capabilities are relevant to that merchant.

NEXG currently has:

**21 merchant categories → 134 subcategories**

The taxonomy is:

| Category | Subcategories |
|---|---|
| Adults Only | Adult Products; Adult Wellness; Cigarettes; Cigars; Vapes; Adult Accessories |
| Airport Transfers | Airport Pickup; Airport Drop-off; Meet & Greet; Executive Transfer |
| Alcohol & Beverages | Wine; Spirits; Beer; Champagne; Cocktail Mixers; Liquor Stores |
| Fashion & Apparel | Men’s Fashion; Women’s Fashion; Kids Fashion; Shoes; Bags; Watches; Accessories |
| Beauty | Makeup; Skincare; Haircare; Fragrances; Cosmetics Stores |
| Vehicle Rentals | Car Rental; Self Drive; Corporate Rental; Long-Term Rental; Bike Rental |
| Experiences | Concerts; Festivals; Conferences; Private Events; Photography; Workshops; Classes; Sports Activities; Recreation |
| Financial Services | Banking; Forex; Insurance; Payments; Remittance; Sacco Services; Business Services |
| Flowers & Gifts | Flowers; Gift Hampers; Cakes; Chocolates; Personalized Gifts; Occasion Gifts |
| Restaurants & Food | Restaurant; Fast Food; Café; Bakery; Desserts; Juice Bar; Cloud Kitchen; Catering |
| Groceries & Essentials | Supermarket; Convenience Store; Fresh Produce; Butchery; Seafood; Organic Store |
| Laundry & Cleaning | Laundry; Dry Cleaning; Ironing; Home Cleaning; Office Cleaning |
| Marketplace | Home & Living; Furniture; Appliances; Decor; Kitchenware; Books; Stationery; Office Supplies; General Retail |
| Pharmacy | Pharmacy; Medical Supplies; Baby Products; Supplements |
| Health | Clinics; Telemedicine; Labs; Mental Health (Therapy); Coaching |
| Tech & Electronics | Smartphones; Accessories; Computers; Gaming; Audio; Telecom Services; Smart Devices |
| Travel & Tours | Safaris; Game Drives; Luxury Safaris; City Tours; Cultural Tours; Adventure Tours; Travel Packages |
| Vehicle Services | Car Wash; Tire Service; Battery Service; Vehicle Assistance; Vehicle Inspection |
| Wellness | Spa; Massage; Gym; Personal Training |
| Concierge Services | Reservations; Personal Assistance; Shopping Assistance; Gift Sourcing; Travel Planning; Property Coordination; Moving Assistance; Cleaning Coordination; VIP Assistance |
| Logistics & Shipping | Sea Freight; Air Freight; Road Freight & Trucking; Warehousing & Storage |

This taxonomy will not remain a presentation-layer classification.

NEXG will use the merchant's category and subcategory to determine the **operational capability profile** associated with that merchant.

The flow will be:

```text
Merchant
   ↓
Category
   ↓
Subcategory
   ↓
Capability Profile
   ↓
Data Model
   ↓
Workflow Model
   ↓
Integration Requirements
   ↓
Available APIs / Webhooks
```

### Concrete NEXG result

A merchant classified as:

**Restaurants & Food → Restaurant**

will receive a capability profile appropriate to restaurant operations, including:

- catalog/menu management
- product and modifier information
- pricing
- inventory/availability
- customer orders
- payments
- fulfillment
- pickup
- delivery

A merchant classified as:

**Travel & Tours → Safaris**

will receive a different capability profile centered around:

- experiences
- packages
- availability
- capacity
- bookings
- customer information
- payments
- fulfillment

A merchant classified as:

**Vehicle Rentals → Car Rental**

will receive capabilities around:

- vehicles
- availability
- rental pricing
- bookings
- customer information
- pickup
- return
- payments

The **same NEXG integration platform** serves all three, but their available operational capabilities and integration requirements differ.

---

# 4. NEXG Canonical Data Model

NEXG will maintain canonical representations of the entities that exist within its platform.

The integration layer will translate external merchant-system data into these canonical NEXG structures.

Core entities will include:

```text
Merchant
Location
Category
Subcategory
Product
Service
Variant
Price
Inventory
Customer
Order
Order Item
Payment
Booking
Reservation
Fulfillment
Delivery
Promotion
Document
Event
```

The canonical model establishes how NEXG understands the business regardless of which external system is connected.

An external POS might call something an `item`.

An ERP might call it a `SKU`.

A booking platform might call something a `package`.

NEXG will map those external representations into the appropriate NEXG entity.

---

# 5. NEXG Will Maintain a Formal Integration Contract

This principle applies **throughout the entire project**.

Every NEXG integration capability will have a defined contract before it becomes part of the public developer platform.

The contract will specify:

1. **Entity**
2. **Purpose**
3. **Owner**
4. **Source of truth**
5. **Allowed operations**
6. **Data structure**
7. **Identifiers**
8. **External references**
9. **Synchronization direction**
10. **Synchronization rules**
11. **Validation rules**
12. **State transitions**
13. **Events**
14. **Authentication requirements**
15. **Authorization scopes**
16. **Idempotency requirements**
17. **Error behavior**
18. **Retry behavior**
19. **Versioning**
20. **Audit requirements**

We will apply this same contract method to:

- merchant data
- catalog
- inventory
- customers
- orders
- payments
- bookings
- reservations
- fulfillment
- delivery
- notifications
- every future integration capability

### Concrete result

For a restaurant order, the project would eventually establish a contract such as:

```text
NEXG Order

orderId
merchantId
locationId
customerId
status
items[]
subtotal
discount
deliveryFee
tax
total
payment
fulfillment
createdAt
updatedAt
```

The contract then defines exactly:

**who can create it → who can update it → which states are valid → which events are emitted → what an external system receives → what happens when the same operation is received twice.**

That contract becomes the source from which the API documentation, webhook documentation, SDK definitions, integration tests and implementation are derived.

---

# 6. NEXG Will Make Integrations Capability-Aware

The integration platform will determine what a merchant can integrate based on the merchant's actual NEXG capability profile.

NEXG will not expose an undifferentiated collection of APIs to every merchant.

The platform will evaluate:

```text
Merchant
   ↓
Category
   ↓
Subcategory
   ↓
Configured Services
   ↓
Enabled Capabilities
   ↓
Integration Permissions
```

The developer experience will therefore reflect the merchant's operational configuration.

### Concrete NEXG result

A merchant configured as:

**Restaurants & Food → Restaurant**

could have an integration profile containing:

```text
Catalog
Inventory
Orders
Payments
Fulfillment
Delivery
Customers
```

A merchant configured as:

**Vehicle Services → Car Wash**

could have:

```text
Services
Pricing
Bookings
Customers
Payments
Fulfillment
```

The integration credentials, scopes, documentation visibility and available operations can therefore be constrained to the capabilities actually enabled for that merchant.

---

# 7. NEXG Will Separate Platform Data From Merchant-System Data

NEXG will maintain its own identifiers while preserving the identifiers used by connected merchant systems.

The model will support:

```text
NEXG ID
+
Merchant System ID
+
System Type
```

A product could therefore exist as:

```text
NEXG Product ID:
NEXG-PROD-000123

Merchant POS:
SKU-84722
```

An order could exist as:

```text
NEXG Order:
NEXG-ORD-20260807-000142

Merchant POS:
POS-ORDER-98122
```

This allows NEXG and the merchant's system to maintain their own identity systems while still maintaining a reliable relationship between records.

---

# 8. NEXG Will Support Controlled Integration Methods

NEXG's integration architecture will provide different mechanisms according to the type and volume of interaction.

### REST APIs

Used for controlled request/response operations involving NEXG resources.

### Webhooks

Used for NEXG-initiated events that external systems need to receive.

### Bulk Operations

Used for large-scale catalog, inventory or data synchronization.

### File-Based Integration

Supported where enterprise or legacy merchant environments require controlled file exchange.

### SDKs

Provided where they materially reduce implementation complexity for developers.

These are not separate integration philosophies.

They are different interfaces over the same **NEXG canonical model and integration contracts**.

---

# 9. NEXG Will Treat Events as First-Class Platform Objects

NEXG will not make external systems repeatedly poll the platform to discover every change.

Important business state changes will generate structured NEXG events.

The event model will follow a consistent structure:

```text
eventId
eventType
eventVersion
occurredAt
merchantId
locationId
resourceType
resourceId
data
```

The event taxonomy will be defined as part of each domain's integration contract.

For orders, this could produce events such as:

```text
order.created
order.updated
order.cancelled
order.fulfilled
```

For inventory:

```text
inventory.updated
```

For payments:

```text
payment.created
payment.completed
payment.failed
```

The exact event catalogue will be determined during the domain-mapping phase rather than invented independently by each feature team.

---

# 10. NEXG Will Protect the Integration Boundary

Every external integration will operate through controlled authentication, authorization and tenant isolation.

The integration platform will enforce:

- authenticated requests
- merchant-level authorization
- capability-level permissions
- scoped credentials
- tenant isolation
- request validation
- rate limits
- audit logging
- webhook authentication
- credential revocation
- credential rotation
- API versioning

An integration belonging to Merchant A must never be capable of retrieving Merchant B's data.

Likewise, credentials that only have inventory permissions must not automatically receive access to payments or customer data.

The permission model will therefore follow:

```text
Integration
    ↓
Merchant
    ↓
Scopes / Capabilities
    ↓
Resources
    ↓
Allowed Operations
```

---

# 11. NEXG Will Have a Defined Integration Lifecycle

Every external integration will follow the same lifecycle:

```text
Discovery
    ↓
Registration
    ↓
Credentials
    ↓
Development
    ↓
Sandbox
    ↓
Testing
    ↓
Validation
    ↓
Certification
    ↓
Production
    ↓
Monitoring
    ↓
Maintenance
```

The merchant IT team will know exactly where their integration is within this lifecycle.

The same lifecycle will apply whether the merchant is:

- a Restaurant
- a Pharmacy
- a Car Rental business
- a Safari operator
- a Laundry business
- a Logistics company
- a Tech & Electronics retailer

Only the capabilities being implemented will change.

---

# 12. NEXG Will Treat Documentation as Part of the Product

Documentation will not be written after the engineering work is finished.

It will be produced alongside the platform contracts.

The project will maintain:

```text
Business Capability
        ↓
Domain Model
        ↓
Integration Contract
        ↓
API / Event Design
        ↓
Implementation
        ↓
Automated Tests
        ↓
Developer Documentation
        ↓
Merchant IT Documentation
```

The documentation will therefore describe **actual NEXG behavior**, rather than theoretical API behavior.

The developer portal will ultimately contain:

```text
NEXG Developers
│
├── Getting Started
├── NEXG Concepts
├── Integration Guides
├── API Reference
├── Webhooks
├── Authentication
├── Security
├── Sandbox
├── Testing
├── Certification
├── Go-Live
├── SDKs
├── Errors
├── Rate Limits
├── Versioning
└── Changelog
```

---

# Phase 1 — Final NEXG Principles

So our first phase establishes these **12 project-wide rules**:

1. **NEXG is the controlled integration platform between merchants and their external technology systems.**

2. **NEXG supports inbound, outbound and bidirectional system communication.**

3. **The 21-category / 134-subcategory merchant taxonomy drives the operational capability profile assigned to each merchant.**

4. **NEXG maintains a canonical data model independent of the merchant's external system terminology and data structures.**

5. **Every integration capability is governed by a formal integration contract covering ownership, data, operations, synchronization, states, events, security, errors, retries and versioning.**

6. **The integration platform exposes capabilities according to the merchant's actual category, subcategory and configured operational capabilities.**

7. **NEXG maintains its own identifiers while preserving merchant-system identifiers and references.**

8. **NEXG provides APIs, webhooks, bulk mechanisms, file-based mechanisms and SDKs as controlled interfaces to the same canonical platform model.**

9. **Business events are first-class NEXG objects and are delivered through a standardized event architecture.**

10. **Every external integration operates through authenticated, authorized, tenant-isolated and auditable interfaces.**

11. **Every integration follows a standardized lifecycle from discovery through production and ongoing maintenance.**

12. **NEXG documentation is derived from the same contracts and platform behavior used to build and test the integration system.**

This is now a much stronger **Phase 1 foundation** because it is tied directly to the NEXG merchant taxonomy and the actual platform we are building, rather than to generic "API best practices."

**Phase 2 should now take the 21 categories and 134 subcategories and build the NEXG Domain → Capability → Data → Workflow matrix.** That is where we discover exactly what the NEXG integration platform needs to support before designing a single endpoint.

## Prompt:
8/7/2026, 9:28:33 AM

Phase 2

## Response:
8/7/2026, 9:28:33 AM

Absolutely. **Phase 2 is where we turn the 21 categories / 134 subcategories into an actual NEXG operational model.** We should not jump to endpoints yet.

# Phase 2 — NEXG Domain & Capability Mapping

## 2.1 Objective

The objective of Phase 2 is to determine:

> **What does NEXG need to understand, store, operate, synchronize, and expose for every type of merchant on the platform?**

We start with the existing merchant taxonomy:

**21 Categories → 134 Subcategories**

and transform it into:

```text
Merchant Taxonomy
        ↓
Business Domain
        ↓
Capability
        ↓
Entity
        ↓
Workflow
        ↓
State
        ↓
Event
        ↓
Integration Requirement
```

This becomes the foundation for the APIs, webhooks, merchant IT documentation, SDKs and integration certification process that come later.

---

# 2.2 First: Separate Domains From Categories

The 21 categories are **merchant classifications**.

They should not automatically become 21 technical domains.

Instead, multiple categories will use the same underlying NEXG domains.

For NEXG, the major operational domains should be:

| Domain | What NEXG manages |
|---|---|
| Identity & Access | Users, organizations, credentials, permissions |
| Merchant | Merchant profile, classification, configuration |
| Locations | Branches, service areas, operating locations |
| Catalog | Products, services, variants, modifiers |
| Pricing | Prices, price lists, discounts |
| Inventory | Stock, availability, adjustments |
| Customers | Customer profiles and relationships |
| Orders | Commercial orders and order items |
| Bookings | Time-based reservations and appointments |
| Experiences | Activities, packages and capacity |
| Payments | Payment records and payment state |
| Fulfillment | Merchant-side execution of orders/services |
| Delivery | Pickup, dispatch and last-mile execution |
| Fleet & Assets | Vehicles and operational assets |
| Scheduling | Availability, operating hours and appointments |
| Promotions | Offers and promotional rules |
| Documents | Receipts, invoices and related records |
| Notifications | Operational communication |
| Integrations | External systems, credentials and mappings |
| Events | NEXG event publication and delivery |
| Analytics | Operational and commercial reporting |

These domains are reusable across the entire merchant ecosystem.

---

# 2.3 The Capability Layer

The next layer determines **what a merchant can actually do**.

A capability is more specific than a domain.

For example:

```text
Domain:
Catalog

Capabilities:
├── Create product
├── Update product
├── Archive product
├── Manage variants
├── Manage modifiers
└── Manage availability
```

Another:

```text
Domain:
Inventory

Capabilities:
├── View inventory
├── Update stock
├── Adjust stock
├── Set availability
└── Receive inventory events
```

Another:

```text
Domain:
Bookings

Capabilities:
├── Create booking
├── Modify booking
├── Cancel booking
├── Check availability
└── Manage booking status
```

This capability layer is what eventually determines what an integration is allowed to do.

---

# 2.4 Taxonomy → Capability Mapping

Now we apply the taxonomy.

## Restaurants & Food

### Restaurant

Core capabilities:

```text
Catalog
├── Menu
├── Products
├── Variants
└── Modifiers

Pricing
├── Item pricing
└── Promotions

Inventory
└── Item availability

Orders
├── Order creation
├── Order updates
└── Order status

Fulfillment
├── Preparation
├── Ready
└── Completed

Payments

Customers

Delivery
```

### Fast Food

Uses essentially the same commerce architecture:

```text
Catalog
Pricing
Inventory
Orders
Payments
Fulfillment
Delivery
Customers
```

The distinction between **Restaurant** and **Fast Food** should therefore primarily influence configuration, workflows and merchant presentation—not create an entirely separate API architecture.

---

# 2.5 Groceries & Essentials

### Supermarket

```text
Catalog
├── Products
├── Variants
├── Categories
└── Pricing

Inventory
├── Stock
├── Availability
└── Inventory adjustments

Orders
├── Items
├── Quantities
└── Substitution handling

Payments

Fulfillment

Delivery

Customers
```

### Fresh Produce

The capability profile changes because products may require different quantity and inventory handling.

```text
Catalog
Inventory
├── Quantity-based inventory
├── Availability
└── Stock adjustments

Pricing
Orders
Payments
Fulfillment
Delivery
Customers
```

The taxonomy therefore doesn't merely tell us the merchant's name.

It tells NEXG **which operational model to activate**.

---

# 2.6 Pharmacy

### Pharmacy

The capability profile becomes:

```text
Catalog
├── Products
├── Product information
└── Categories

Inventory
├── Stock
└── Availability

Orders
Payments
Fulfillment
Delivery
Customers
Documents
```

The pharmacy domain can additionally introduce regulated-product rules into the relevant workflows.

The important architectural point is that those rules belong to **specific capabilities and workflows**, rather than contaminating the entire NEXG platform.

---

# 2.7 Vehicle Rentals

### Car Rental

This requires a different operational model.

```text
Fleet & Assets
├── Vehicle
├── Vehicle status
└── Vehicle availability

Catalog
├── Rental offerings
└── Vehicle classes

Pricing
├── Rental price
├── Duration
└── Pricing rules

Bookings
├── Reservation
├── Pickup
└── Return

Customers

Payments

Documents

Fulfillment
```

The core object isn't an order containing products.

It is a **booking involving an operational asset over time**.

That distinction is critical for NEXG's data architecture.

---

# 2.8 Travel & Tours

### Safaris

The model becomes:

```text
Experiences
├── Safari
├── Package
├── Itinerary
└── Capacity

Availability

Bookings
├── Booking
├── Participants
└── Booking status

Customers

Payments

Fulfillment

Fleet & Assets
├── Vehicle
└── Assigned resources

Documents

Notifications
```

The system therefore needs to understand **capacity, schedules, participants and resource allocation**, not simply product inventory.

---

# 2.9 Experiences

### Concerts

```text
Experience
├── Event
├── Date/time
├── Venue
└── Capacity

Availability

Bookings / Tickets

Customers

Payments

Fulfillment

Notifications
```

### Workshops

```text
Experience
Availability
Scheduling
Capacity
Bookings
Customers
Payments
Fulfillment
```

### Photography

```text
Services
Scheduling
Bookings
Customers
Pricing
Payments
Fulfillment
```

The common domain is **Experiences**, but the operational configuration changes according to the subcategory.

---

# 2.10 Wellness

### Spa

```text
Services
├── Treatments
└── Service duration

Pricing

Scheduling
├── Availability
└── Appointments

Bookings

Customers

Payments

Fulfillment
```

### Gym

```text
Services
Membership
Scheduling
Customers
Payments
Access / attendance
```

### Personal Training

```text
Services
Scheduling
Bookings
Customers
Payments
Fulfillment
```

This demonstrates why NEXG should not create a separate technical architecture for every subcategory.

Instead:

**Taxonomy configures reusable domains and capabilities.**

---

# 2.11 Concierge Services

This category is particularly important for NEXG because many of these operations are **service requests rather than conventional products**.

For:

**Concierge Services → Personal Assistance**

NEXG needs:

```text
Service
Request
Customer
Assignment
Task
Status
Communication
Payment
Fulfillment
```

For:

**Concierge Services → Travel Planning**

the capability profile adds:

```text
Service
Request
Itinerary
Reservation
Booking
Customer
Payment
Fulfillment
```

For:

**Concierge Services → Property Coordination**

the model adds:

```text
Property
Service Request
Task
Assignment
Scheduling
Customer / Guest
Fulfillment
```

This gives us a critical NEXG concept:

> **NEXG must support both commerce objects and service-operation objects.**

---

# 2.12 Laundry & Cleaning

### Laundry

```text
Service
Order
Pickup
Processing
Status
Delivery
Payment
Customer
```

### Home Cleaning

```text
Service
Booking
Scheduling
Customer
Location
Assignment
Fulfillment
Payment
```

The two subcategories share the **service fulfillment architecture**, while their operational workflows differ.

---

# 2.13 Vehicle Services

### Car Wash

```text
Service
Booking
Scheduling
Customer
Vehicle
Payment
Fulfillment
```

### Tire Service

```text
Service
Vehicle
Appointment
Inventory
Payment
Fulfillment
```

### Vehicle Assistance

```text
Service Request
Vehicle
Customer
Location
Assignment
Dispatch
Fulfillment
Payment
```

Here we introduce another reusable NEXG concept:

**Service Request + Assignment + Fulfillment.**

That becomes relevant across many categories.

---

# 2.14 Airport Transfers

### Airport Pickup

```text
Booking
Customer
Flight Information
Pickup Location
Destination
Vehicle
Driver
Scheduling
Dispatch
Payment
Fulfillment
```

### Meet & Greet

Adds:

```text
Airport
Arrival Information
Assigned Agent
Customer
Booking
Fulfillment
```

The operational model is therefore closer to **scheduled logistics** than conventional ecommerce.

---

# 2.15 Logistics & Shipping

### Road Freight & Trucking

```text
Shipment
├── Origin
├── Destination
├── Cargo
└── Delivery requirements

Vehicle

Driver

Assignment

Dispatch

Tracking

Delivery

Documents

Pricing

Payment
```

### Warehousing & Storage

```text
Storage Location
Inventory
Inbound
Outbound
Storage Allocation
Orders
Documents
Pricing
Billing
```

This introduces **Logistics** and **Storage** as reusable NEXG domains.

---

# 2.16 Financial Services

This category requires a different approach.

### Banking

Potential capabilities:

```text
Customer
Account
Transaction
Payment
Documents
Notifications
```

### Forex

```text
Customer
Currency
Exchange Rate
Transaction
Payment
Documents
```

### Insurance

```text
Customer
Policy
Quote
Payment
Documents
Claims
```

### Remittance

```text
Customer
Transfer
Sender
Recipient
Transaction
Payment
Status
Documents
```

The taxonomy therefore activates very different financial capabilities while maintaining a shared **Financial Services domain**.

---

# 2.17 Marketplace

Marketplace is particularly important because it can represent multiple types of merchant inventory.

### Furniture

```text
Catalog
Products
Variants
Inventory
Pricing
Orders
Payments
Fulfillment
Delivery
Customers
```

### Services could eventually use:

```text
Catalog
Services
Scheduling
Bookings
Payments
Fulfillment
Customers
```

The Marketplace category should therefore be treated as a **broad commerce container**, not a single operational workflow.

---

# 2.18 Capability Families

After mapping the categories, we can consolidate the recurring capabilities.

The current taxonomy points toward these major NEXG capability families:

### Commerce

- Products
- Services
- Variants
- Pricing
- Promotions
- Orders
- Payments

### Inventory

- Stock
- Availability
- Adjustments
- Inventory synchronization

### Customer

- Customer profiles
- Customer relationships
- Customer history

### Booking

- Availability
- Reservations
- Appointments
- Capacity
- Scheduling

### Experience

- Experiences
- Packages
- Events
- Activities
- Participants

### Service Operations

- Requests
- Tasks
- Assignments
- Scheduling
- Fulfillment

### Logistics

- Shipments
- Pickup
- Dispatch
- Delivery
- Tracking
- Vehicles
- Drivers

### Property

- Properties
- Units
- Property services
- Coordination

### Fleet

- Vehicles
- Availability
- Assignment
- Inspection
- Maintenance

### Financial

- Payments
- Transactions
- Billing
- Policies
- Transfers
- Documents

### Platform

- Merchants
- Locations
- Users
- Integrations
- Permissions
- Events
- Notifications
- Audit

---

# 2.19 The Most Important Result of Phase 2

We now have a much better abstraction than:

```text
21 Categories
        ↓
134 APIs
```

Instead:

```text
21 Categories
      ↓
134 Subcategories
      ↓
Reusable Capability Families
      ↓
NEXG Domains
      ↓
Canonical Entities
      ↓
Operational Workflows
```

This means the 134 subcategories **configure the platform rather than dictate the architecture**.

That is exactly what we want.

---

# 2.20 The NEXG Capability Matrix

The actual Phase 2 deliverable should eventually become a matrix like this:

| Category | Subcategory | Primary domains | Core capabilities | Primary operational model |
|---|---|---|---|---|
| Restaurants & Food | Restaurant | Catalog, Orders, Inventory, Payments, Fulfillment, Delivery | Menu, modifiers, orders, availability, fulfillment | Commerce |
| Groceries & Essentials | Supermarket | Catalog, Inventory, Orders, Payments, Fulfillment, Delivery | Product catalog, stock, quantities, orders | Commerce |
| Pharmacy | Pharmacy | Catalog, Inventory, Orders, Payments, Fulfillment, Delivery | Products, availability, orders, fulfillment | Commerce |
| Vehicle Rentals | Car Rental | Fleet, Pricing, Bookings, Payments, Documents | Vehicle availability, rental booking, pickup/return | Asset Rental |
| Travel & Tours | Safaris | Experiences, Bookings, Fleet, Payments, Fulfillment | Packages, availability, capacity, bookings | Experience Booking |
| Wellness | Spa | Services, Scheduling, Bookings, Payments | Treatments, appointments, availability | Service Booking |
| Laundry & Cleaning | Laundry | Services, Orders, Fulfillment, Delivery, Payments | Pickup, processing, delivery | Service Fulfillment |
| Airport Transfers | Airport Pickup | Bookings, Fleet, Scheduling, Dispatch, Delivery | Transfer booking, vehicle assignment, pickup | Scheduled Transport |
| Vehicle Services | Car Wash | Services, Scheduling, Bookings, Fleet, Payments | Vehicle service booking | Service Booking |
| Logistics & Shipping | Road Freight & Trucking | Logistics, Fleet, Dispatch, Tracking, Payments | Shipment, assignment, dispatch, delivery | Logistics |
| Concierge Services | Personal Assistance | Services, Requests, Tasks, Customers, Payments | Request, assignment, task fulfillment | Concierge Service |

**This matrix is not the final API specification.**

It is the architectural map from which the API specification will eventually be derived.

---

# 2.21 What Phase 2 Gives Us

At the end of Phase 2, NEXG should know:

**What merchants exist?**

→ 21 categories / 134 subcategories.

**What can they do?**

→ Capability profiles.

**What does NEXG need to understand?**

→ Canonical entities.

**How do those capabilities operate?**

→ Workflows.

**What changes state?**

→ Events.

**What eventually needs integration?**

→ Integration capabilities.

The next phase therefore becomes possible.

---

# Phase 2 Final Architecture

```text
                 NEXG MERCHANT
                       │
                 Category
                       │
                 Subcategory
                       │
              Capability Profile
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      Domains       Entities       Workflows
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                 State Model
                       │
                       ▼
                  Event Model
                       │
                       ▼
              Integration Surface
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
           APIs               Webhooks
```

**Phase 2 is therefore the point where NEXG's merchant taxonomy becomes an actual operating architecture.**

The next step, **Phase 3 — Canonical NEXG Data Model**, should take these domains and define the actual entities and relationships: `Merchant → Location → Catalog → Product/Service → Inventory/Availability → Customer → Order/Booking/Request → Payment → Fulfillment → Delivery`, including identifiers, ownership, lifecycle states and relationships.

## Prompt:
8/7/2026, 9:32:46 AM

Phase 3

## Response:
8/7/2026, 9:32:47 AM

# Phase 3 — NEXG Canonical Data Model

Phase 3 defines **how NEXG represents the businesses, things, people, transactions, services and operational activity that exist across the 21 categories and 134 subcategories.**

The objective is not to design database tables yet.

The objective is to establish the **canonical business language of NEXG** so that:

- NEXG's own applications use the same concepts.
- Merchant integrations map into the same concepts.
- APIs expose the same concepts.
- Webhooks refer to the same concepts.
- Documentation uses the same terminology.
- Different merchant categories can reuse the same underlying architecture.

The fundamental rule is:

> **External systems may use different terminology and structures, but NEXG must have one canonical representation for each business concept it supports.**

---

# 3.1 The NEXG Canonical Model

The top-level model is:

```text
NEXG
│
├── Organization
│
├── Merchant
│   ├── Classification
│   ├── Locations
│   ├── Capabilities
│   ├── Integrations
│   └── Users
│
├── Catalog
│   ├── Categories
│   ├── Products
│   ├── Services
│   ├── Variants
│   └── Modifiers
│
├── Commercial
│   ├── Prices
│   ├── Promotions
│   ├── Orders
│   └── Payments
│
├── Availability
│   ├── Inventory
│   ├── Schedules
│   ├── Capacity
│   └── Resources
│
├── Customer
│
├── Booking
│   ├── Reservation
│   ├── Appointment
│   └── Experience Booking
│
├── Operations
│   ├── Request
│   ├── Task
│   ├── Assignment
│   ├── Fulfillment
│   └── Delivery
│
├── Assets
│   ├── Vehicle
│   ├── Property
│   └── Equipment
│
├── Logistics
│   ├── Shipment
│   ├── Pickup
│   ├── Dispatch
│   └── Delivery
│
├── Documents
│
├── Communications
│
└── Events
```

This becomes the **NEXG canonical vocabulary**.

---

# 3.2 Entity Hierarchy

The first relationship we need to establish is ownership.

```text
Organization
    │
    └── Merchant
          │
          ├── Locations
          │
          ├── Users
          │
          ├── Catalog
          │
          ├── Customers
          │
          ├── Assets
          │
          ├── Orders
          │
          ├── Bookings
          │
          ├── Requests
          │
          ├── Payments
          │
          └── Integrations
```

This matters because NEXG is multi-tenant.

Every operational record must ultimately be attributable to the correct merchant.

---

# 3.3 Organization

An **Organization** represents the legal/business owner above one or more merchant operations where the NEXG configuration requires that separation.

Conceptually:

```text
Organization
├── organizationId
├── name
├── status
├── contact information
└── merchants[]
```

An organization can therefore operate multiple merchant entities.

The organization layer also gives NEXG somewhere to attach:

- enterprise access
- centralized users
- billing relationships
- multiple businesses
- integration relationships

without incorrectly putting everything directly on an individual merchant.

---

# 3.4 Merchant

The **Merchant** is the core NEXG business entity.

```text
Merchant
├── merchantId
├── organizationId
├── businessName
├── legalName
├── category
├── subcategory
├── status
├── capabilities
├── locations
├── contact information
├── configuration
└── integrations
```

The merchant's existing taxonomy becomes part of its canonical identity:

```text
merchant.category
merchant.subcategory
```

For a merchant onboarded as:

```text
category:
Restaurants & Food

subcategory:
Restaurant
```

NEXG stores that classification as structured data.

It is not merely a label displayed on the onboarding screen.

---

# 3.5 Merchant Classification

Because NEXG already has 21 categories and 134 subcategories, classification should be represented independently from the merchant record.

Conceptually:

```text
Merchant
   │
   └── Classification
          ├── categoryId
          ├── categoryName
          ├── subcategoryId
          ├── subcategoryName
          └── capabilityProfile
```

This gives us room for future evolution without changing the merchant entity itself.

It also allows NEXG to maintain the internal IDs already present in the onboarding catalog.

---

# 3.6 Location

A merchant can have one or many operational locations.

```text
Merchant
   │
   ├── Location
   ├── Location
   └── Location
```

A location represents where an operation is physically or operationally based.

```text
Location
├── locationId
├── merchantId
├── name
├── address
├── coordinates
├── operating hours
├── service area
├── capabilities
└── status
```

This is important for NEXG because:

- a supermarket may have several branches;
- a restaurant may have multiple outlets;
- a pharmacy may have multiple branches;
- a safari company may have an operating office;
- a car rental business may have airport and city pickup locations.

The **merchant** represents the business.

The **location** represents an operational point belonging to that business.

---

# 3.7 Catalog

NEXG needs a catalog model capable of representing both **things that can be sold** and **services that can be booked or requested**.

Therefore:

```text
Catalog
│
├── Product
├── Service
├── Variant
├── Modifier
└── Category
```

We should not force every merchant into a `Product` model.

A restaurant sells menu items.

A spa sells treatments.

A safari operator sells experiences/packages.

A car rental company sells rental offerings associated with vehicles.

A concierge may sell services.

The canonical model needs to preserve those distinctions.

---

# 3.8 Product

A **Product** represents a tangible or directly purchasable item.

```text
Product
├── productId
├── merchantId
├── locationId(s)
├── categoryId
├── name
├── description
├── media
├── SKU
├── variants
├── modifiers
├── pricing
├── inventory
├── availability
└── status
```

This supports:

- smartphones
- groceries
- flowers
- cakes
- clothing
- electronics
- pharmacy products
- furniture
- books
- general retail

across the existing NEXG taxonomy.

---

# 3.9 Service

A **Service** represents an operational service rather than physical stock.

```text
Service
├── serviceId
├── merchantId
├── category
├── name
├── description
├── duration
├── pricing
├── availability
├── scheduling requirements
├── resources
└── status
```

This supports:

- Spa treatments
- Massage
- Personal Training
- Car Wash
- Laundry
- Dry Cleaning
- Home Cleaning
- Airport Transfer
- Concierge Assistance
- Photography

The important distinction is:

**Product → generally concerned with an item**

**Service → generally concerned with an activity performed for a customer**

---

# 3.10 Experience

NEXG needs a specialized model for experiences because **Travel & Tours** and **Experiences** cannot be adequately represented as ordinary products.

```text
Experience
├── experienceId
├── merchantId
├── name
├── description
├── itinerary
├── duration
├── schedule
├── capacity
├── resources
├── pricing
├── availability
└── status
```

This supports:

- Safaris
- Game Drives
- Luxury Safaris
- City Tours
- Cultural Tours
- Adventure Tours
- Concerts
- Festivals
- Conferences
- Workshops
- Sports Activities
- Recreation

An experience can then generate a **Booking**.

---

# 3.11 Variant

A variant represents a distinct purchasable configuration of a product.

```text
Product
   │
   ├── Variant
   ├── Variant
   └── Variant
```

The variant can carry its own:

- SKU
- price
- inventory
- attributes
- availability

This allows NEXG to represent different configurations without creating unrelated products.

---

# 3.12 Modifier

Modifiers are particularly important for **Restaurants & Food**.

```text
Product
   │
   └── Modifier Group
          ├── Modifier
          ├── Modifier
          └── Modifier
```

A restaurant item can therefore have configurable selections.

This concept can also support configurable offerings elsewhere in the NEXG ecosystem.

---

# 3.13 Pricing

Pricing should be its own domain rather than permanently embedded inside Product or Service.

```text
Price
├── priceId
├── merchantId
├── resourceType
├── resourceId
├── amount
├── currency
├── pricing rules
├── effectiveFrom
├── effectiveTo
└── status
```

This allows NEXG to support:

- product prices
- service prices
- rental prices
- experience prices
- promotional pricing
- location-specific pricing
- time-dependent pricing

without creating different pricing architectures for every category.

---

# 3.14 Inventory

Inventory represents **finite physical quantities**.

```text
Inventory
├── inventoryId
├── merchantId
├── locationId
├── productId
├── variantId
├── quantity
├── reservedQuantity
├── availableQuantity
├── threshold
└── status
```

The fundamental relationship is:

```text
Available
=
Quantity
-
Reserved Quantity
```

Inventory primarily applies to the product-oriented parts of:

- Groceries & Essentials
- Marketplace
- Tech & Electronics
- Fashion & Apparel
- Flowers & Gifts
- Pharmacy
- Alcohol & Beverages
- Restaurants & Food

But not every merchant needs physical inventory.

---

# 3.15 Availability

This is deliberately separate from Inventory.

**Inventory answers:**

> How many physical units exist?

**Availability answers:**

> Can this product, service, experience, vehicle, appointment or resource be used right now or during a specified period?

Conceptually:

```text
Availability
├── resourceType
├── resourceId
├── locationId
├── start
├── end
├── capacity
├── status
└── constraints
```

This becomes critical for:

- Spa appointments
- Gym sessions
- Car rentals
- Airport transfers
- Safari bookings
- Concerts
- Workshops
- Photography
- Cleaning services

---

# 3.16 Resource

A **Resource** represents something required to perform a service or experience.

```text
Resource
├── resourceId
├── type
├── merchantId
├── locationId
├── availability
└── status
```

Resources can include:

- vehicles
- rooms
- staff members
- equipment
- service slots
- guides
- drivers

This allows NEXG to model operational capacity rather than simply customer transactions.

---

# 3.17 Customer

The **Customer** is a platform-level party interacting with merchants.

```text
Customer
├── customerId
├── profile
├── contact information
├── preferences
├── addresses
├── merchant relationships
└── status
```

A customer can interact with multiple NEXG merchants while maintaining a stable NEXG customer identity subject to NEXG's privacy and tenant rules.

The merchant relationship determines what the merchant is authorized to see.

---

# 3.18 Order

An **Order** represents a commercial request to purchase products or applicable services.

```text
Order
├── orderId
├── merchantId
├── locationId
├── customerId
├── items[]
├── pricing
├── payment
├── fulfillment
├── delivery
├── status
├── externalReferences
├── createdAt
└── updatedAt
```

Order items reference canonical catalog entities.

```text
Order
   │
   └── Order Item
          ├── product
          ├── variant
          ├── modifiers
          ├── quantity
          ├── unit price
          └── total
```

For service-oriented commerce, the order can reference a service.

---

# 3.19 Booking

An **Order** and a **Booking** must not be treated as the same thing.

A booking reserves something for a particular time, date, capacity or resource.

```text
Booking
├── bookingId
├── merchantId
├── customerId
├── resource
├── service / experience
├── date/time
├── participants
├── pricing
├── payment
├── status
└── fulfillment
```

This is fundamental to:

- Vehicle Rentals
- Travel & Tours
- Experiences
- Wellness
- Beauty
- Photography
- Airport Transfers
- Concierge Services
- Vehicle Services
- Cleaning services

---

# 3.20 Request

NEXG needs a third commercial/operational primitive:

**Request.**

A request represents a customer asking NEXG or a merchant to perform something that may require manual or operational processing.

```text
Request
├── requestId
├── merchantId
├── customerId
├── service
├── description
├── location
├── priority
├── status
├── assignments
├── tasks
└── fulfillment
```

This is essential for:

- Personal Assistance
- Shopping Assistance
- Gift Sourcing
- Property Coordination
- Moving Assistance
- Cleaning Coordination
- VIP Assistance
- Vehicle Assistance

This prevents us from forcing concierge operations into an artificial product/order model.

---

# 3.21 Task

A **Task** represents operational work required to fulfil a request, booking or order.

```text
Task
├── taskId
├── merchantId
├── parentResource
├── assignee
├── status
├── priority
├── scheduledAt
├── completedAt
└── notes
```

This allows NEXG to separate:

**customer transaction**

from

**internal operational execution.**

---

# 3.22 Assignment

Assignment connects operational work to the resource or person responsible for executing it.

```text
Assignment
├── assignmentId
├── taskId
├── resourceId / userId
├── assignedAt
├── acceptedAt
├── completedAt
└── status
```

This becomes important for:

- drivers
- cleaners
- chauffeurs
- guides
- delivery personnel
- concierge staff
- technicians

---

# 3.23 Fulfillment

Fulfillment represents the execution of an order, service, booking or request.

```text
Fulfillment
├── fulfillmentId
├── parentType
├── parentId
├── method
├── status
├── assignedResource
├── location
├── scheduledAt
├── completedAt
└── failureReason
```

This gives NEXG one common operational concept across very different merchants.

A restaurant can fulfill an order.

A laundry can fulfill a cleaning order.

A chauffeur can fulfill a transfer.

A concierge can fulfill a service request.

A safari company can fulfill a booking.

---

# 3.24 Delivery

Delivery is separate from fulfillment because fulfillment does not necessarily mean delivery.

```text
Fulfillment
   │
   ├── Pickup
   ├── In-store
   ├── Service
   └── Delivery
```

A Delivery record contains:

```text
Delivery
├── deliveryId
├── fulfillmentId
├── pickup location
├── destination
├── recipient
├── courier / driver
├── vehicle
├── status
├── tracking
└── timestamps
```

This is reusable across:

- Restaurants & Food
- Groceries & Essentials
- Pharmacy
- Marketplace
- Flowers & Gifts
- Laundry & Cleaning
- Logistics & Shipping

---

# 3.25 Vehicle

Because NEXG already has:

- Vehicle Rentals
- Vehicle Services
- Airport Transfers
- Logistics & Shipping

vehicles need to be first-class canonical entities.

```text
Vehicle
├── vehicleId
├── merchantId
├── registration
├── type
├── make
├── model
├── status
├── location
├── availability
└── attributes
```

A vehicle can participate in:

```text
Rental
Transfer
Delivery
Shipment
Vehicle Service
```

without creating four different vehicle models.

---

# 3.26 Property

Property becomes a canonical entity because NEXG includes:

**Concierge Services → Property Coordination**

and the broader NEXG hospitality platform includes property-management operations.

```text
Property
├── propertyId
├── owner
├── manager
├── location
├── units
├── services
├── status
└── metadata
```

A property can therefore become the context for:

- cleaning
- maintenance
- guest services
- coordination
- reservations
- concierge requests

---

# 3.27 Payment

Payment must be separated from Order.

```text
Payment
├── paymentId
├── merchantId
├── customerId
├── amount
├── currency
├── method
├── provider
├── status
├── reference
├── relatedResource
└── timestamps
```

This allows payments to be associated with:

- orders
- bookings
- services
- rentals
- logistics
- concierge requests

without requiring every commercial transaction to be an Order.

---

# 3.28 Document

Documents should be canonical platform objects.

```text
Document
├── documentId
├── merchantId
├── type
├── relatedResource
├── status
├── createdAt
├── issuedAt
└── storageReference
```

Possible document types include:

- receipts
- invoices
- booking confirmations
- rental documents
- shipment documents
- transaction records

The exact document types will be defined by the domains that require them.

---

# 3.29 Integration

An external integration itself is a NEXG entity.

```text
Integration
├── integrationId
├── merchantId
├── systemName
├── systemType
├── environment
├── credentials
├── scopes
├── mappings
├── status
├── lastSyncAt
└── configuration
```

This allows NEXG to know:

> Which external system is connected to which merchant, what it is allowed to access, and how its identifiers map to NEXG identifiers.

---

# 3.30 External References

Every integration-capable canonical entity should be capable of carrying external references.

```text
ExternalReference
├── system
├── externalId
├── resourceType
└── resourceId
```

A NEXG order can therefore maintain:

```text
NEXG:
NEXG-ORD-20260807-000142

Merchant system:
POS-98122
```

The same pattern can apply to:

- products
- customers
- locations
- bookings
- payments
- vehicles
- shipments

This becomes a critical part of integration reliability.

---

# 3.31 Entity Relationships

The central NEXG relationship model now becomes:

```text
Organization
      │
      ▼
Merchant
      │
      ├───────────────┐
      ▼               ▼
Location          Classification
      │               │
      │          Category
      │          Subcategory
      │          Capabilities
      │
      ▼
Catalog
 │
 ├── Product
 │     ├── Variant
 │     └── Modifier
 │
 ├── Service
 │
 └── Experience
       │
       ▼
Availability
       │
       ▼
Customer
       │
       ├───────────────┐
       ▼               ▼
     Order           Booking
       │               │
       └───────┬───────┘
               ▼
             Payment
               │
               ▼
           Fulfillment
          ┌────┼─────┐
          ▼    ▼     ▼
        Task  Pickup Delivery
          │
          ▼
      Assignment
          │
          ▼
       Resource
```

And separately:

```text
Merchant
   │
   ├── Vehicle
   ├── Property
   ├── Shipment
   └── Integration
```

---

# 3.32 Three Core Transaction Primitives

Phase 3 reveals that NEXG should not try to make everything an `Order`.

NEXG has three major customer-initiated operational primitives:

### Order

**I want to purchase something.**

```text
Customer → Order → Fulfillment
```

### Booking

**I want to reserve something.**

```text
Customer → Booking → Scheduled Fulfillment
```

### Request

**I want the merchant to do something for me.**

```text
Customer → Request → Task → Assignment → Fulfillment
```

These three primitives allow NEXG to represent the full merchant taxonomy without forcing every business into an ecommerce model.

---

# 3.33 Four Core Availability Models

NEXG also needs to distinguish different forms of availability.

### Inventory availability

```text
Product → Quantity
```

Used by:

**Tech & Electronics, Groceries, Fashion, Pharmacy, Marketplace**, etc.

### Time availability

```text
Service → Time Slot
```

Used by:

**Beauty, Wellness, Cleaning, Vehicle Services**, etc.

### Capacity availability

```text
Experience → Capacity
```

Used by:

**Concerts, Workshops, Safaris, Recreation**, etc.

### Asset availability

```text
Vehicle / Resource → Available Period
```

Used by:

**Vehicle Rentals, Airport Transfers, Logistics**, etc.

This is a major part of the NEXG canonical model.

---

# 3.34 Lifecycle States

Every stateful entity needs a controlled lifecycle.

We should **not** invent one universal status field for everything.

Different domains require different state machines.

### Order

```text
Draft
  ↓
Created
  ↓
Confirmed
  ↓
Preparing
  ↓
Ready
  ↓
Fulfilled
```

with applicable cancellation/failure states.

### Booking

```text
Requested
  ↓
Confirmed
  ↓
Scheduled
  ↓
In Progress
  ↓
Completed
```

### Request

```text
Submitted
  ↓
Accepted
  ↓
Assigned
  ↓
In Progress
  ↓
Completed
```

### Delivery

```text
Created
  ↓
Assigned
  ↓
Picked Up
  ↓
In Transit
  ↓
Delivered
```

The exact state machines will be formally defined during workflow design.

---

# 3.35 NEXG's Canonical Identity Rules

Every major NEXG entity will receive a stable NEXG identifier.

Conceptually:

```text
merchantId
locationId
productId
serviceId
experienceId
customerId
orderId
bookingId
requestId
paymentId
fulfillmentId
deliveryId
vehicleId
propertyId
integrationId
eventId
```

These IDs belong to NEXG.

External systems may maintain their own IDs through `ExternalReference`.

This gives us:

**NEXG identity ≠ merchant-system identity**

while still allowing deterministic mapping.

---

# 3.36 What This Means for the 21 Categories

The important outcome is that we **do not build 21 separate data architectures.**

Instead:

```text
21 Categories
       ↓
134 Subcategories
       ↓
Capability Profiles
       ↓
Shared NEXG Canonical Entities
```

For instance:

**Restaurants & Food → Restaurant**

uses:

```text
Merchant
Location
Catalog
Product
Modifier
Pricing
Inventory
Customer
Order
Payment
Fulfillment
Delivery
```

**Vehicle Rentals → Car Rental**

uses:

```text
Merchant
Location
Service
Vehicle
Availability
Pricing
Customer
Booking
Payment
Fulfillment
Document
```

**Travel & Tours → Safaris**

uses:

```text
Merchant
Location
Experience
Availability
Capacity
Customer
Booking
Payment
Fulfillment
Vehicle
Document
```

**Concierge Services → Personal Assistance**

uses:

```text
Merchant
Service
Customer
Request
Task
Assignment
Payment
Fulfillment
```

The same underlying NEXG entities are reused while the capability profile determines which ones are activated and how they operate.

---

# 3.37 Phase 3 Deliverable

The Phase 3 canonical model therefore establishes these major NEXG entities:

### Platform

- Organization
- Merchant
- Location
- User
- Integration

### Classification

- Category
- Subcategory
- Capability Profile

### Commerce

- Catalog
- Product
- Service
- Experience
- Variant
- Modifier
- Price
- Promotion

### Availability

- Inventory
- Availability
- Schedule
- Capacity
- Resource

### Customer

- Customer
- Address
- Customer Relationship

### Transactions

- Order
- Order Item
- Booking
- Request
- Payment

### Operations

- Task
- Assignment
- Fulfillment
- Delivery

### Assets

- Vehicle
- Property
- Equipment / Resource

### Logistics

- Shipment
- Pickup
- Dispatch
- Tracking

### Platform Services

- Document
- Notification
- Event
- External Reference

---

# Phase 3 Final Architecture

The canonical NEXG model is now:

```text
                         ORGANIZATION
                              │
                              ▼
                           MERCHANT
                              │
             ┌────────────────┼─────────────────┐
             ▼                ▼                 ▼
        CLASSIFICATION     LOCATIONS        INTEGRATIONS
             │
       Category
       Subcategory
       Capabilities
             │
             ▼
          CATALOG
       ┌─────┼─────┐
       ▼     ▼     ▼
    Product Service Experience
       │     │     │
       └─────┼─────┘
             ▼
       PRICING / AVAILABILITY
             │
             ▼
          CUSTOMER
             │
       ┌─────┼──────┐
       ▼     ▼      ▼
     ORDER BOOKING REQUEST
       │     │      │
       └─────┼──────┘
             ▼
          PAYMENT
             │
             ▼
        FULFILLMENT
       ┌─────┼─────┐
       ▼     ▼     ▼
     TASK  PICKUP DELIVERY
       │
       ▼
   ASSIGNMENT
       │
       ▼
    RESOURCES
       │
       ├── Vehicle
       ├── Property
       └── Other operational resources
```

### The most important Phase 3 decision

**NEXG's canonical model is capability-based, not category-based.**

The 21 categories and 134 subcategories tell NEXG **what kind of merchant it is and which capabilities it needs**.

The canonical model tells NEXG **how those capabilities are represented consistently across the entire platform**.

That separation is what will allow NEXG to grow from the current 21 categories without rebuilding the integration architecture every time a new merchant type is introduced.

**Phase 4 should now be the NEXG Workflow & State Model** — taking these canonical entities and defining exactly how `Order`, `Booking`, `Request`, `Payment`, `Fulfillment`, `Delivery`, `Inventory`, `Vehicle`, `Experience`, etc. move through their lifecycles, including who can trigger each transition and what NEXG event is generated.

## Prompt:
8/7/2026, 9:43:52 AM

Phase 4

## Response:
8/7/2026, 9:43:53 AM

# Phase 4 — NEXG Workflow & State Model

Phase 3 established **what exists in NEXG**.

Phase 4 establishes **what happens to those entities over time**.

This is the point where NEXG stops being a collection of entities and becomes an operational platform.

The objective is to define, for every stateful capability:

- what starts the workflow
- who can perform each action
- what state the entity enters
- what conditions must be satisfied
- what happens next
- what can be cancelled or failed
- what event NEXG produces
- what external systems are allowed to do
- what happens when an operation is repeated or fails

The core model is:

```text id="f3g7qk"
Action
  ↓
Validation
  ↓
State Transition
  ↓
Side Effects
  ↓
Event
  ↓
External Notification
```

---

# 4.1 NEXG Will Use Domain-Specific State Machines

NEXG will **not use one universal status model** across every entity.

An order, booking, payment, delivery and inventory record behave differently.

Each stateful domain will have its own explicit state machine.

The major workflow families are:

```text id="x4m2ks"
Commerce
├── Order
├── Payment
└── Promotion

Catalog
├── Product
├── Service
└── Experience

Availability
├── Inventory
├── Schedule
├── Capacity
└── Resource

Booking
├── Reservation
├── Appointment
└── Experience Booking

Operations
├── Request
├── Task
├── Assignment
└── Fulfillment

Logistics
├── Shipment
├── Dispatch
└── Delivery

Assets
├── Vehicle
└── Property
```

Each receives its own lifecycle.

---

# 4.2 Order Lifecycle

The NEXG order lifecycle must support the commerce categories in the taxonomy, particularly:

- Restaurants & Food
- Groceries & Essentials
- Marketplace
- Pharmacy
- Fashion & Apparel
- Tech & Electronics
- Flowers & Gifts
- Alcohol & Beverages

The baseline lifecycle is:

```text id="w8s6fk"
Draft
  ↓
Created
  ↓
Confirmed
  ↓
Preparing
  ↓
Ready
  ↓
Fulfilled
```

With exceptional paths:

```text id="e0c0h4"
Created ───────→ Cancelled
Confirmed ─────→ Cancelled
Preparing ──────→ Failed
```

The precise allowable transitions will depend on the order's fulfillment model.

---

# 4.3 Order State Definitions

### Draft

The order exists but has not been formally submitted.

### Created

NEXG has received a valid order.

### Confirmed

The merchant has accepted the order and committed to fulfilling it.

### Preparing

The merchant is actively preparing or processing the order.

### Ready

The order is ready for pickup, delivery or the next fulfillment step.

### Fulfilled

The merchant has completed its fulfillment responsibility.

### Cancelled

The order will no longer be fulfilled.

### Failed

The fulfillment process could not successfully complete.

---

# 4.4 Order Workflow

For a **Restaurants & Food → Restaurant** merchant:

```text id="o4p2a8"
Customer
   ↓
Order Created
   ↓
NEXG validates
   ↓
Merchant accepts
   ↓
Confirmed
   ↓
Restaurant prepares
   ↓
Preparing
   ↓
Ready
   ↓
Pickup / Delivery
   ↓
Fulfilled
```

Each transition becomes a controlled NEXG operation.

For example:

```text
POST /orders/{orderId}/confirm
```

would not simply change a database field.

NEXG would:

1. authenticate the caller
2. verify merchant access
3. verify the current state
4. validate required conditions
5. transition the order
6. record the transition
7. generate the appropriate event
8. notify subscribed systems

That pattern applies throughout the platform.

---

# 4.5 Order Events

An order state transition produces a corresponding event.

```text id="9c0j5k"
order.created
order.confirmed
order.preparing
order.ready
order.fulfilled
order.cancelled
order.failed
```

The event contains the canonical order reference and state information.

This allows merchant systems to react without constantly polling NEXG.

---

# 4.6 Inventory Lifecycle

Inventory requires a different state model.

The central states are:

```text id="8jz4np"
Available
Reserved
Unavailable
Out of Stock
Archived
```

The actual quantity model is:

```text id="h5b3xk"
On Hand
   -
Reserved
   =
Available
```

### Example result

A merchant has:

```text id="g7y2pf"
On hand: 20
Reserved: 4
Available: 16
```

A new order reserves 2:

```text id="2c5a0d"
On hand: 20
Reserved: 6
Available: 14
```

When the order is fulfilled:

```text id="a6m0p4"
On hand: 18
Reserved: 0
Available: 18
```

The exact inventory accounting rules will be finalized with the inventory domain specification.

---

# 4.7 Inventory Events

Inventory state changes produce:

```text id="7l2vkh"
inventory.created
inventory.updated
inventory.reserved
inventory.released
inventory.depleted
inventory.adjusted
```

These events will be important for merchant POS and inventory integrations.

---

# 4.8 Booking Lifecycle

Bookings are fundamental to:

- Vehicle Rentals
- Travel & Tours
- Experiences
- Wellness
- Beauty
- Airport Transfers
- Vehicle Services
- Cleaning
- Photography
- Concierge Services

The baseline lifecycle is:

```text id="8f8i8c"
Requested
    ↓
Confirmed
    ↓
Scheduled
    ↓
In Progress
    ↓
Completed
```

Exceptional states:

```text id="9a9v7r"
Requested ──→ Rejected
Confirmed ──→ Cancelled
Scheduled ──→ No Show
In Progress ─→ Failed
```

---

# 4.9 Booking Example — Vehicle Rental

For:

**Vehicle Rentals → Car Rental**

the workflow becomes:

```text id="5x5s9d"
Customer
   ↓
Select vehicle
   ↓
Availability check
   ↓
Booking requested
   ↓
Vehicle reserved
   ↓
Booking confirmed
   ↓
Pickup scheduled
   ↓
Vehicle picked up
   ↓
Rental active
   ↓
Vehicle returned
   ↓
Booking completed
```

This demonstrates why a rental cannot simply use an ordinary order workflow.

The **vehicle is a resource whose availability changes throughout the booking lifecycle**.

---

# 4.10 Experience Booking Lifecycle

For:

**Travel & Tours → Safaris**

the workflow becomes:

```text id="1p3s91"
Customer
   ↓
Select safari
   ↓
Check availability
   ↓
Booking requested
   ↓
Capacity reserved
   ↓
Booking confirmed
   ↓
Scheduled
   ↓
Experience begins
   ↓
In Progress
   ↓
Completed
```

The system must maintain:

- participant count
- available capacity
- scheduled date/time
- assigned resources
- payment state
- fulfillment state

---

# 4.11 Request Lifecycle

Concierge Services requires a separate workflow.

The baseline is:

```text id="d6gq5m"
Submitted
   ↓
Accepted
   ↓
Assigned
   ↓
In Progress
   ↓
Completed
```

Exceptional paths:

```text id="8w8h7g"
Submitted ──→ Rejected
Accepted ───→ Cancelled
Assigned ───→ Reassigned
In Progress → Failed
```

For:

**Concierge Services → Personal Assistance**

the workflow becomes:

```text id="j0e7y3"
Customer request
      ↓
NEXG records request
      ↓
Merchant accepts
      ↓
Staff assigned
      ↓
Task performed
      ↓
Fulfillment completed
      ↓
Payment finalized
```

---

# 4.12 Task Lifecycle

Tasks represent operational work.

```text id="j8a8kx"
Created
  ↓
Assigned
  ↓
Accepted
  ↓
In Progress
  ↓
Completed
```

Exceptional states:

```text id="qj0c0a"
Created ──→ Cancelled
Assigned ─→ Reassigned
In Progress → Blocked
In Progress → Failed
```

A request can contain multiple tasks.

```text id="t0l9u5"
Request
 ├── Task 1
 ├── Task 2
 └── Task 3
```

This is important for concierge operations.

---

# 4.13 Assignment Lifecycle

Assignment connects work to the person or resource performing it.

```text id="b5c6rv"
Created
  ↓
Assigned
  ↓
Accepted
  ↓
Active
  ↓
Completed
```

An assignee may decline:

```text id="s6z1m7"
Assigned
   ↓
Declined
   ↓
Reassignment
```

This allows NEXG to model operational staffing without embedding personnel state into the task itself.

---

# 4.14 Fulfillment Lifecycle

Fulfillment represents execution.

The general model is:

```text id="6t2e1n"
Created
  ↓
Assigned
  ↓
In Progress
  ↓
Ready / Completed
  ↓
Completed
```

The exact intermediate states depend on fulfillment type.

### Product fulfillment

```text id="m5s6zq"
Created
 ↓
Preparing
 ↓
Ready
 ↓
Completed
```

### Service fulfillment

```text id="r8l5m3"
Scheduled
 ↓
In Progress
 ↓
Completed
```

### Transfer fulfillment

```text id="3s8rj0"
Scheduled
 ↓
Driver Assigned
 ↓
Driver Arrived
 ↓
Passenger Picked Up
 ↓
In Transit
 ↓
Completed
```

---

# 4.15 Delivery Lifecycle

Delivery has its own state machine:

```text id="b3f5cs"
Created
   ↓
Assigned
   ↓
Accepted
   ↓
At Pickup
   ↓
Picked Up
   ↓
In Transit
   ↓
At Destination
   ↓
Delivered
```

Failure states include:

```text id="t3q4oz"
Cancelled
Failed
Delivery Attempt Failed
```

This workflow is reusable across:

- Restaurants & Food
- Groceries & Essentials
- Pharmacy
- Marketplace
- Flowers & Gifts
- Laundry & Cleaning
- Logistics & Shipping

---

# 4.16 Airport Transfer Workflow

For:

**Airport Transfers → Airport Pickup**

NEXG needs a more specialized workflow:

```text id="e3i9az"
Booking Confirmed
       ↓
Transfer Scheduled
       ↓
Driver Assigned
       ↓
Driver En Route
       ↓
Driver Arrived
       ↓
Passenger Picked Up
       ↓
In Transit
       ↓
Passenger Dropped Off
       ↓
Completed
```

The booking and delivery/transport execution therefore remain separate:

```text id="j4p7yc"
Booking
   ↓
Fulfillment
   ↓
Transfer Execution
```

---

# 4.17 Shipment Lifecycle

For:

**Logistics & Shipping → Road Freight & Trucking**

the shipment lifecycle is:

```text id="2k8o5r"
Created
  ↓
Booked
  ↓
Assigned
  ↓
Picked Up
  ↓
In Transit
  ↓
At Destination
  ↓
Delivered
```

Additional operational states can represent:

```text id="v7k2q4"
Delayed
Held
Failed
Cancelled
```

The shipment should maintain its own lifecycle rather than being treated as an ordinary customer order.

---

# 4.18 Payment Lifecycle

Payment must have a separate state machine.

```text id="0z2z8v"
Initiated
    ↓
Pending
    ↓
Authorized
    ↓
Captured
```

Failure path:

```text id="h6f3p8"
Pending
   ↓
Failed
```

Cancellation/refund paths:

```text id="b6t7wh"
Captured
   ↓
Refund Requested
   ↓
Refunded
```

The precise payment lifecycle will accommodate the payment providers NEXG supports.

---

# 4.19 Payment Must Not Control Order State Directly

NEXG must keep:

```text id="c4x8l5"
Order State
```

and

```text id="9n6x0d"
Payment State
```

as separate state machines.

An order can be:

```text id="8n9h7m"
Confirmed
```

while its payment is:

```text id="d2k3v7"
Pending
```

depending on the merchant's configured payment rules.

This separation prevents payment-provider behavior from becoming hard-coded into every NEXG commerce workflow.

---

# 4.20 Vehicle Lifecycle

Vehicles are operational assets.

```text id="6q1o0u"
Available
   ↓
Reserved
   ↓
Assigned
   ↓
In Use
   ↓
Returned
   ↓
Available
```

Maintenance can produce:

```text id="7c9r5v"
Available
   ↓
Maintenance
   ↓
Available
```

A vehicle can therefore participate in:

- Vehicle Rental
- Airport Transfer
- Delivery
- Logistics
- Vehicle Services

without changing the canonical Vehicle entity.

---

# 4.21 Experience Capacity Lifecycle

For experiences such as:

**Concerts, Workshops, Safaris, Sports Activities**

NEXG must manage capacity.

```text id="q7j3j4"
Capacity
   ↓
Available
   ↓
Reserved
   ↓
Confirmed
   ↓
Consumed
```

The platform must prevent:

```text id="9b3o4h"
Confirmed Participants
>
Available Capacity
```

This becomes a domain-level invariant.

---

# 4.22 State Transition Rules

A state must never change simply because an API request contains a new status.

Every transition must be validated.

Conceptually:

```text id="q1z0jg"
Current State
      ↓
Requested Action
      ↓
Authorization
      ↓
Business Rules
      ↓
Valid Transition?
     / \
   YES   NO
    ↓     ↓
New State  Error
    ↓
Side Effects
    ↓
Event
```

This is one of the most important rules in the NEXG platform.

---

# 4.23 Who Can Trigger Transitions?

NEXG must distinguish actors.

Potential actors include:

```text id="9m0s5b"
Customer
Merchant Staff
Merchant Administrator
NEXG System
External Integration
Payment Provider
Delivery System
Authorized Partner
```

The actor's permissions determine which transitions they may execute.

A customer should not be able to transition:

```text
Order → Fulfilled
```

A merchant system with the correct permission may be able to update the order's operational state.

NEXG itself may transition records when an internal workflow completes.

---

# 4.24 Idempotency

Every integration operation that can create or change a business transaction must account for duplicate requests.

Suppose an external POS sends:

```text id="4f8r3s"
Create Order
External ID: POS-98122
```

and the request times out.

The POS sends the same request again.

NEXG must recognize that the operation has already been processed rather than creating two orders.

Therefore:

```text id="9q2h6k"
External Idempotency Key
        ↓
NEXG
        ↓
Existing Operation?
    /          \
  YES           NO
   ↓             ↓
Return         Process
Existing       Request
Result
```

This becomes part of the integration contract.

---

# 4.25 Failure Handling

Every workflow needs explicit failure paths.

NEXG should distinguish:

### Business failure

The operation violates a business rule.

### Validation failure

The submitted data is invalid.

### Authorization failure

The caller lacks permission.

### Technical failure

The platform or external service failed.

### Timeout

The operation did not complete within the permitted time.

### External failure

A connected merchant system or service failed.

These should produce structured errors rather than generic failures.

---

# 4.26 Event Generation

State transitions and significant business actions generate NEXG events.

The relationship is:

```text id="9ozbzw"
Business Action
       ↓
State Transition
       ↓
Canonical Record Updated
       ↓
Event Created
       ↓
Event Delivered
```

For an order:

```text id="1c5q8f"
order.created
       ↓
order.confirmed
       ↓
order.preparing
       ↓
order.ready
       ↓
order.fulfilled
```

For a booking:

```text id="0ub8oj"
booking.created
       ↓
booking.confirmed
       ↓
booking.scheduled
       ↓
booking.started
       ↓
booking.completed
```

The event model therefore becomes a direct reflection of the workflow model.

---

# 4.27 Workflow → Integration Relationship

This is the critical connection to our original objective.

A merchant IT team does not merely need to know:

> "There is an Orders API."

They need to know:

> **"What happens to an order, what can my system do, and what will NEXG tell my system?"**

The documentation will therefore eventually represent each workflow as:

```text id="g3q7x8"
Workflow
   │
   ├── States
   ├── Actions
   ├── Permissions
   ├── Conditions
   ├── API operations
   ├── Events
   ├── Errors
   └── Recovery
```

This is what makes the documentation useful to an actual merchant IT team.

---

# 4.28 NEXG Workflow Families

After mapping the major categories, the platform can consolidate workflows into reusable families.

| Workflow family | Primary NEXG entities |
|---|---|
| Product Commerce | Product → Order → Payment → Fulfillment |
| Service Commerce | Service → Booking/Order → Payment → Fulfillment |
| Experience Booking | Experience → Booking → Payment → Fulfillment |
| Asset Rental | Vehicle/Asset → Booking → Payment → Return |
| Scheduled Transport | Booking → Vehicle → Assignment → Transport Fulfillment |
| Concierge Request | Request → Task → Assignment → Fulfillment |
| Delivery | Order/Fulfillment → Delivery → Tracking → Completion |
| Shipment | Shipment → Assignment → Dispatch → Tracking → Delivery |
| Inventory | Product → Inventory → Reservation → Adjustment |
| Appointment | Service → Availability → Booking → Appointment → Completion |

These workflow families will be reused across the 21 categories.

---

# 4.29 Category-to-Workflow Results

The current taxonomy now produces concrete operational models.

### Restaurants & Food

**Commerce + Inventory + Fulfillment + Delivery**

### Groceries & Essentials

**Commerce + Inventory + Fulfillment + Delivery**

### Pharmacy

**Commerce + Inventory + Fulfillment + Delivery**

### Fashion & Apparel

**Commerce + Inventory + Fulfillment + Delivery**

### Tech & Electronics

**Commerce + Inventory + Fulfillment + Delivery**

### Flowers & Gifts

**Commerce + Inventory + Fulfillment + Delivery**

### Vehicle Rentals

**Asset Rental + Booking + Payment + Fulfillment**

### Travel & Tours

**Experience Booking + Capacity + Payment + Fulfillment**

### Experiences

**Experience Booking + Capacity + Scheduling + Fulfillment**

### Wellness

**Service Booking + Scheduling + Payment + Fulfillment**

### Laundry & Cleaning

**Service Commerce + Scheduling/Fulfillment + Delivery**

### Vehicle Services

**Service Booking + Vehicle + Scheduling + Fulfillment**

### Airport Transfers

**Scheduled Transport + Booking + Assignment + Fulfillment**

### Concierge Services

**Service Request + Task + Assignment + Fulfillment**

### Logistics & Shipping

**Shipment + Dispatch + Tracking + Delivery**

### Financial Services

**Financial Transaction + Payment + Documents + Compliance-oriented workflows**

This is the actual bridge between the taxonomy and the eventual integration system.

---

# 4.30 Phase 4 Final Architecture

The NEXG operating model is now:

```text id="m4c0ne"
                 NEXG ENTITY
                     │
                     ▼
                  ACTION
                     │
                     ▼
                VALIDATION
                     │
                     ▼
             AUTHORIZATION
                     │
                     ▼
              STATE CHANGE
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
      SIDE EFFECT             EVENT
          │                     │
          ▼                     ▼
   Other NEXG Domains      External Systems
```

And the overall platform becomes:

```text id="8t1b6y"
TAXONOMY
21 Categories
134 Subcategories
       ↓
CAPABILITY PROFILE
       ↓
CANONICAL ENTITIES
       ↓
WORKFLOW
       ↓
STATE MACHINE
       ↓
BUSINESS ACTION
       ↓
EVENT
       ↓
INTEGRATION
```

## Phase 4 decisions

We have now established that:

1. **Every stateful NEXG domain gets an explicit state machine.**
2. **Orders, bookings and requests are distinct operational primitives.**
3. **Payment state is independent from commercial transaction state.**
4. **Inventory availability is distinct from time, capacity and asset availability.**
5. **Fulfillment is distinct from delivery.**
6. **Tasks and assignments represent operational execution.**
7. **Vehicles, properties and other operational assets are first-class entities.**
8. **State transitions require authorization and business-rule validation.**
9. **Integration operations must be idempotent.**
10. **Failures and recovery paths are part of the workflow definition.**
11. **Important state transitions generate standardized NEXG events.**
12. **APIs and webhooks will eventually expose these workflows rather than arbitrary database operations.**

### What Phase 4 gives us

We now have:

**Phase 1:** How NEXG integrates  
**Phase 2:** What capabilities NEXG provides  
**Phase 3:** What NEXG entities represent those capabilities  
**Phase 4:** How those entities behave and change state

The next logical phase is **Phase 5 — NEXG Integration Capability & API Surface**.

That is where we finally take the domains, entities and workflows we've established and determine **exactly what merchant IT systems can read, create, update, trigger and receive from NEXG**, before we write the individual API endpoints.

## Prompt:
8/7/2026, 9:50:41 AM

Phase 5

## Response:
8/7/2026, 9:50:42 AM

# Phase 5 — NEXG Integration Capability & API Surface

Phase 5 is where the architecture we built in Phases 1–4 becomes an **actual integration product for merchant IT teams**.

We now know:

```text
Phase 1
Taxonomy & Integration Principles
        ↓
Phase 2
Domains & Capabilities
        ↓
Phase 3
Canonical Data Model
        ↓
Phase 4
Workflows & State Machines
        ↓
Phase 5
Integration Capabilities & API Surface
```

The key principle for Phase 5 is:

> **We design the integration surface around business capabilities and workflows, not around database tables.**

A merchant IT team should not have to understand NEXG's internal database architecture to integrate with NEXG.

---

# 5.1 What Phase 5 Must Produce

Phase 5 defines:

1. What merchant systems can **read**
2. What merchant systems can **create**
3. What merchant systems can **update**
4. What merchant systems can **trigger**
5. What NEXG can **send to merchant systems**
6. Which capabilities apply to which merchant types
7. Authentication and authorization boundaries
8. Idempotency requirements
9. Pagination and filtering
10. Error contracts
11. Versioning
12. Webhook behavior
13. Synchronization rules
14. External ID mapping
15. Rate limits
16. Sandbox behavior
17. Integration certification requirements

Only after these are defined should we finalize individual endpoints.

---

# 5.2 NEXG Integration Model

The merchant integration architecture should be:

```text
Merchant System
      │
      │ HTTPS
      ▼
NEXG API Gateway
      │
      ├── Authentication
      ├── Authorization
      ├── Rate Limiting
      ├── Validation
      ├── Idempotency
      └── Versioning
             │
             ▼
        NEXG API Layer
             │
       ┌─────┼─────┐
       ▼     ▼     ▼
    Orders Bookings Catalog
       │     │     │
       └─────┼─────┘
             ▼
        NEXG Domains
             │
             ▼
        Event System
             │
             ▼
        Merchant Webhooks
```

The merchant therefore interacts with **one coherent NEXG integration surface**, even though internally NEXG has many domains.

---

# 5.3 API Capability Families

Based on the canonical model, the initial API surface should be organized into capability groups.

```text
NEXG API
│
├── Merchant
├── Locations
├── Catalog
├── Products
├── Services
├── Experiences
├── Pricing
├── Inventory
├── Availability
├── Customers
├── Orders
├── Bookings
├── Requests
├── Payments
├── Fulfillment
├── Delivery
├── Vehicles
├── Properties
├── Shipments
├── Documents
├── Events
└── Integrations
```

Not every merchant receives access to every capability.

The merchant's **capability profile** determines what is available.

---

# 5.4 Capability-Based API Access

A restaurant should not automatically receive:

```text
Vehicle Rental API
```

A car rental company should not automatically receive:

```text
Restaurant Modifier API
```

Instead:

```text
Merchant
   ↓
Category
   ↓
Subcategory
   ↓
Capability Profile
   ↓
Authorized API Surface
```

For:

**Restaurants & Food → Restaurant**

the enabled surface could include:

```text
Catalog
Products
Modifiers
Pricing
Inventory
Orders
Payments
Fulfillment
Delivery
Customers
Events
```

For:

**Vehicle Rentals → Car Rental**

it could include:

```text
Services
Vehicles
Availability
Pricing
Bookings
Payments
Fulfillment
Documents
Customers
Events
```

The API is therefore **capability-aware**.

---

# 5.5 Read, Write and Event Capabilities

Every integration capability should explicitly declare what an external system can do.

We should use three fundamental interaction types.

### Read

Merchant system retrieves information from NEXG.

```text
NEXG → Merchant System
```

### Write

Merchant system creates or modifies authorized NEXG resources.

```text
Merchant System → NEXG
```

### Subscribe

Merchant system receives NEXG events.

```text
NEXG → Merchant Webhook
```

A capability can support one, two or all three.

---

# 5.6 Catalog Integration

Catalog is one of the most important capabilities.

Merchant systems should be able to synchronize:

```text
Categories
Products
Variants
Modifiers
Services
Experiences
Prices
Availability
```

The basic relationship is:

```text
Merchant System
       │
       ├── Create
       ├── Read
       ├── Update
       └── Archive
             │
             ▼
           NEXG
```

For a restaurant, this allows the merchant's POS/menu system to maintain its NEXG menu representation.

For a supermarket, it allows product catalog synchronization.

For a spa, it allows service synchronization.

For a safari company, it allows experience/package synchronization.

Same API family.

Different capability configuration.

---

# 5.7 Product API Capability

A Product integration should eventually support operations conceptually equivalent to:

```text
Create Product
Get Product
List Products
Update Product
Archive Product
```

But we should not immediately lock ourselves into endpoint syntax.

The capability specification comes first:

```text
Capability:
Products

Actions:
Create
Retrieve
List
Update
Archive

Inputs:
Canonical product fields

Outputs:
Canonical product representation

Events:
product.created
product.updated
product.archived

Permissions:
catalog:write
catalog:read
```

This is much more important than prematurely deciding the URL.

---

# 5.8 Inventory Integration

Inventory integrations need both **query** and **mutation** capabilities.

Merchant systems can:

```text
Read stock
Update stock
Adjust stock
Update availability
```

NEXG can publish:

```text
inventory.updated
inventory.reserved
inventory.released
inventory.depleted
```

This supports synchronization between NEXG and merchant systems.

---

# 5.9 Order Integration

Orders are a core integration surface.

Merchant systems should be able to:

```text
Retrieve orders
List orders
Accept orders
Reject orders
Update operational state
Retrieve order details
```

Depending on the merchant capability profile.

The order flow becomes:

```text
Customer / NEXG
       ↓
Order
       ↓
NEXG
       │
       ├──────────────→ Merchant Webhook
       │
       ▼
Merchant System
       │
       ▼
Order Action
       │
       ▼
NEXG
       │
       ▼
State Transition
```

---

# 5.10 Order Events

The merchant IT team should be able to subscribe to events such as:

```text
order.created
order.confirmed
order.cancelled
order.preparing
order.ready
order.fulfilled
order.failed
```

The exact event catalogue will be formally defined after the workflow specification is finalized.

The important architectural rule is:

> **Webhooks communicate business events, not arbitrary database changes.**

---

# 5.11 Booking Integration

Booking-enabled merchants get a separate capability.

```text
Bookings
├── Create
├── Retrieve
├── List
├── Update
├── Confirm
├── Cancel
└── Complete
```

This applies to:

- Car rental
- Spa
- Massage
- Photography
- Safaris
- Tours
- Airport transfers
- Workshops
- Events
- Cleaning
- Concierge services

The exact permitted actions depend on the booking workflow for that capability.

---

# 5.12 Request Integration

Concierge and service-request merchants require:

```text
Requests
├── Create
├── Retrieve
├── List
├── Accept
├── Reject
├── Assign
├── Update
└── Complete
```

For:

**Concierge Services → Personal Assistance**

a merchant system could receive:

```text
request.created
```

and then update the request as its team works on it.

---

# 5.13 Fulfillment Integration

Fulfillment is deliberately separated from orders.

A merchant system may need to communicate:

```text
Fulfillment started
Fulfillment ready
Fulfillment completed
Fulfillment failed
```

This allows the same capability to work with:

- restaurant orders
- grocery orders
- laundry orders
- concierge requests
- vehicle services
- airport transfers
- experiences

without creating a separate API architecture for every category.

---

# 5.14 Delivery Integration

Delivery-enabled merchants receive delivery capabilities.

```text
Delivery
├── Retrieve
├── Create where authorized
├── Assign
├── Update status
├── Track
└── Complete
```

Events can communicate:

```text
delivery.assigned
delivery.picked_up
delivery.in_transit
delivery.delivered
delivery.failed
```

A restaurant, pharmacy, grocery merchant and flower merchant can therefore use the same delivery integration model.

---

# 5.15 Vehicle Integration

Vehicle-enabled merchants get:

```text
Vehicles
├── Create
├── Retrieve
├── List
├── Update
├── Availability
└── Status
```

This supports:

**Vehicle Rentals → Car Rental**

and:

**Airport Transfers → Airport Pickup**

and:

**Logistics & Shipping → Road Freight & Trucking**

without requiring different vehicle APIs.

---

# 5.16 Shipment Integration

Logistics merchants receive shipment capabilities.

```text
Shipment
├── Create
├── Retrieve
├── List
├── Update
├── Assign
├── Dispatch
└── Track
```

The corresponding events can include:

```text
shipment.created
shipment.assigned
shipment.picked_up
shipment.in_transit
shipment.delivered
shipment.failed
```

---

# 5.17 Payment Integration

Payments should expose carefully controlled capabilities.

Potential capabilities:

```text
Payment
├── Create
├── Retrieve
├── List
├── Authorize
├── Capture
├── Refund
└── Reconcile
```

Not every merchant or integration gets every operation.

For example, a merchant's POS may have permission to initiate payment-related operations while an accounting integration may only receive payment and reconciliation information.

This is where **scopes** become important.

---

# 5.18 Permission Model

NEXG should use capability-specific scopes rather than broad permissions such as:

```text
merchant:full_access
```

A better model is:

```text
catalog:read
catalog:write

inventory:read
inventory:write

orders:read
orders:write

bookings:read
bookings:write

payments:read

fulfillment:read
fulfillment:write

delivery:read
delivery:write

vehicles:read
vehicles:write

events:read
```

This follows least privilege.

A merchant IT team can therefore request only what its integration actually needs.

---

# 5.19 Integration Profiles

Instead of manually configuring every permission individually, NEXG can define integration profiles.

### POS Integration

```text
catalog:read
orders:read
orders:write
inventory:read
inventory:write
fulfillment:read
events:read
```

### Booking System

```text
services:read
availability:read
bookings:read
bookings:write
payments:read
events:read
```

### Fleet System

```text
vehicles:read
vehicles:write
availability:read
bookings:read
fulfillment:read
events:read
```

These profiles make onboarding much easier while retaining fine-grained scopes underneath.

---

# 5.20 Webhooks

NEXG webhooks are the outbound event channel.

The architecture is:

```text
NEXG Event
     ↓
Event Dispatcher
     ↓
Merchant Webhook Endpoint
     ↓
Merchant System
```

A webhook delivery should contain enough information for the merchant system to identify:

- event ID
- event type
- event version
- occurred timestamp
- resource type
- resource ID
- merchant ID
- relevant payload
- delivery metadata

---

# 5.21 Webhook Reliability

Webhooks must be treated as **at-least-once delivery**.

Therefore merchant systems must be able to safely receive the same event more than once.

NEXG should provide:

```text
eventId
```

as a unique identifier.

Merchant systems should use it for deduplication.

The delivery model becomes:

```text
Event Created
     ↓
Delivery Attempt
     ↓
Success?
   /    \
 YES     NO
  ↓       ↓
Complete Retry
          ↓
     Retry Policy
```

The exact retry schedule belongs in the later webhook specification.

---

# 5.22 Webhook Security

Merchant webhook endpoints need verification.

NEXG should provide a signed delivery mechanism.

Conceptually:

```text
Payload
   +
Timestamp
   +
Event ID
   ↓
NEXG Signature
```

The merchant verifies:

```text
Signature
Timestamp
Event ID
```

before accepting the event.

This protects against forged webhook requests and replay attacks.

---

# 5.23 API Authentication

Merchant integrations should use machine-to-machine authentication.

The architecture should be:

```text
Merchant
   ↓
NEXG Developer / Integration Setup
   ↓
Credentials
   ↓
Access Token
   ↓
NEXG API
```

NEXG should be designed so that authentication can support:

- OAuth-based integrations
- service credentials
- scoped access tokens
- token rotation
- revocation

The exact mechanism will be finalized in the security phase, but the API architecture must already accommodate it.

---

# 5.24 Sandbox

Every serious merchant integration needs a safe environment.

NEXG should therefore provide:

```text
Production
Sandbox
```

with separate:

- credentials
- resources
- API traffic
- webhook endpoints
- event streams
- test transactions

A merchant IT team should be able to build and test without affecting production operations.

---

# 5.25 Test Data

The sandbox should provide controlled resources for:

```text
Merchant
Location
Product
Service
Experience
Customer
Order
Booking
Request
Payment
Fulfillment
Delivery
Vehicle
Shipment
```

This gives developers something real to integrate against.

---

# 5.26 API Versioning

NEXG needs explicit API versioning from the beginning.

The API surface should have a stable version boundary.

Conceptually:

```text
NEXG API
   │
   ├── Version 1
   ├── Version 2
   └── Future versions
```

The important rule is:

> **A merchant integration should not unexpectedly break because NEXG changed an internal implementation.**

Breaking changes require a controlled version transition.

---

# 5.27 Backward Compatibility

NEXG should distinguish:

### Additive change

Generally safe:

```text
Add optional field
Add new event
Add new endpoint
```

### Breaking change

Requires version management:

```text
Remove field
Rename field
Change meaning
Change required behavior
Change state transition semantics
```

This distinction becomes part of the public developer documentation.

---

# 5.28 Pagination

Large merchant datasets must never require a single enormous response.

Resources such as:

```text
Orders
Products
Customers
Bookings
Shipments
Events
```

need pagination.

The conceptual request is:

```text
List Orders
     ↓
Page 1
     ↓
Cursor
     ↓
Page 2
     ↓
Cursor
     ↓
Page 3
```

Cursor-based pagination should be the preferred model for operational collections.

---

# 5.29 Filtering

Merchant systems need to retrieve specific operational subsets.

For Orders:

```text
status
createdAt
updatedAt
location
customer
externalReference
```

For Products:

```text
category
status
updatedAt
location
```

For Bookings:

```text
status
date
location
customer
resource
```

The final filter catalogue will be defined per resource.

---

# 5.30 External ID Mapping

This is essential for real merchant integrations.

A merchant may already have:

```text
POS Product ID
POS Order ID
ERP Customer ID
Fleet Vehicle ID
Booking System ID
```

NEXG must preserve these through the canonical `ExternalReference`.

The integration relationship becomes:

```text
Merchant System
External ID
     │
     ▼
NEXG Mapping
     │
     ▼
NEXG ID
```

This prevents integrations from depending on NEXG's internal database identifiers.

---

# 5.31 Synchronization Models

Phase 5 should formally support three synchronization patterns.

## Push

Merchant system sends changes to NEXG.

```text
Merchant → NEXG
```

Used for:

- product updates
- inventory updates
- order status
- booking updates

## Pull

Merchant system retrieves changes from NEXG.

```text
Merchant ← NEXG
```

Used where the merchant system needs controlled synchronization.

## Event-driven

NEXG notifies the merchant when something happens.

```text
NEXG → Webhook → Merchant
```

This should be the preferred real-time mechanism.

---

# 5.32 Recommended Synchronization Pattern

For most operational integrations:

```text
Initial Sync
     ↓
Bulk / Paginated Read
     ↓
Establish External ID Mapping
     ↓
Webhooks
     ↓
Incremental Updates
     ↓
Periodic Reconciliation
```

This is much more robust than continuously polling every resource.

---

# 5.33 Reconciliation

NEXG should support reconciliation because integrations will inevitably encounter:

- network failures
- webhook failures
- merchant downtime
- duplicated requests
- missed updates
- partial synchronization

The merchant system should be able to periodically compare:

```text
Merchant State
      vs
NEXG State
```

and resolve discrepancies.

This is particularly important for:

- inventory
- orders
- bookings
- payments
- shipments

---

# 5.34 Rate Limits

Every integration must operate within controlled API limits.

NEXG should define:

```text
Requests / time window
Burst allowance
Endpoint-specific limits
Webhook delivery limits
```

Limits should be associated with:

```text
Merchant
Integration
Credential
Endpoint class
```

rather than blindly applying one global number.

The exact numerical limits belong in the production API specification after capacity testing.

---

# 5.35 Error Contract

NEXG should have one standardized error structure across the API.

Conceptually:

```text
{
    code
    message
    requestId
    details
}
```

The error should distinguish:

```text
Authentication
Authorization
Validation
Not Found
Conflict
Rate Limit
State Conflict
Idempotency Conflict
Server Error
```

The merchant IT team should be able to program against stable machine-readable error codes rather than parsing human messages.

---

# 5.36 State Conflicts

A particularly important error is:

```text
Invalid State Transition
```

Suppose a merchant system attempts:

```text
Order: Fulfilled → Preparing
```

NEXG should reject it because Phase 4 defined that transition as invalid.

The response should communicate:

```text
Current state:
fulfilled

Requested action:
prepare

Allowed actions:
none / applicable transitions
```

This makes the API predictable for developers.

---

# 5.37 Idempotent Writes

Create and mutation operations that may be retried should support idempotency.

The pattern:

```text
Merchant System
     ↓
Idempotency Key
     ↓
NEXG
     ↓
Process once
     ↓
Return same result for retry
```

This becomes mandatory for high-risk operations such as:

- creating orders
- creating bookings
- creating requests
- initiating payments
- creating shipments

where duplicate execution could create real operational or financial consequences.

---

# 5.38 API Surface by Merchant Type

Now we connect Phase 5 back to the 21-category taxonomy.

### Restaurant

```text
Catalog
Products
Modifiers
Pricing
Inventory
Orders
Payments
Fulfillment
Delivery
Events
```

### Supermarket

```text
Catalog
Products
Pricing
Inventory
Orders
Payments
Fulfillment
Delivery
Events
```

### Pharmacy

```text
Catalog
Products
Inventory
Orders
Payments
Fulfillment
Delivery
Documents
Events
```

### Car Rental

```text
Services
Vehicles
Availability
Pricing
Bookings
Payments
Fulfillment
Documents
Events
```

### Spa

```text
Services
Availability
Scheduling
Bookings
Payments
Fulfillment
Customers
Events
```

### Safari Operator

```text
Experiences
Availability
Capacity
Bookings
Payments
Vehicles
Fulfillment
Documents
Events
```

### Concierge Service

```text
Services
Requests
Tasks
Assignments
Payments
Fulfillment
Customers
Events
```

### Road Freight & Trucking

```text
Shipments
Vehicles
Assignments
Dispatch
Tracking
Payments
Documents
Events
```

The same API platform serves all of them.

---

# 5.39 The Merchant IT Team Experience

This is where the documentation we originally wanted begins to take shape.

A merchant developer should enter the NEXG developer portal and see:

```text
Your Integration
│
├── Merchant
│
├── Enabled Capabilities
│
├── Credentials
│
├── API Reference
│
├── Webhooks
│
├── Events
│
├── Sandbox
│
├── External ID Mapping
│
├── Logs
│
└── Integration Health
```

The documentation should automatically reflect the merchant's enabled capabilities.

A **Restaurant** integration should not be presented with dozens of irrelevant Vehicle Rental APIs.

---

# 5.40 Capability Documentation

Every capability should have a consistent documentation structure.

```text
Capability
│
├── Purpose
├── Who can use it
├── Required scopes
├── Resources
├── Actions
├── Request format
├── Response format
├── State transitions
├── Events
├── Errors
├── Idempotency
├── Pagination
├── Rate limits
├── Examples
└── Testing
```

This becomes the reusable documentation template across NEXG.

---

# 5.41 Endpoint Documentation

Only now should an endpoint be documented.

A final endpoint page should tell the developer:

```text
What it does
Who can call it
Required permission
Request
Response
Possible errors
State requirements
Idempotency requirements
Events generated
Rate limits
Example result
```

This is much more valuable than simply publishing:

```text
POST /orders
```

with a JSON schema.

---

# 5.42 NEXG API Design Principle

The API should expose **business operations**, not raw CRUD wherever the business operation is more meaningful.

Weak abstraction:

```text
PATCH /orders/{id}

{
    "status": "confirmed"
}
```

Better conceptual abstraction:

```text
Confirm Order
```

because confirmation is a business action with:

- authorization
- validation
- state transition
- side effects
- event generation

This is directly derived from Phase 4.

---

# 5.43 NEXG API Surface Architecture

The resulting architecture is:

```text
                    NEXG API
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      READ           WRITE          EVENTS
        │              │              │
        ▼              ▼              ▼
   Resources       Actions        Webhooks
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                Capability Layer
                       │
                Permission Layer
                       │
                 Domain Layer
                       │
              Canonical Data Model
                       │
                Workflow Engine
```

---

# 5.44 What We Have Now

After Phase 5, NEXG has an integration architecture that can answer:

### What can this merchant integrate?

Determined by:

```text
Category
→ Subcategory
→ Capability Profile
```

### What can their system access?

Determined by:

```text
Integration Profile
→ Scopes
→ Resource Permissions
```

### What can their system do?

Determined by:

```text
Capability
→ Action
→ State Transition
```

### How do they know something happened?

```text
NEXG Event
→ Webhook
```

### How do they synchronize?

```text
Initial Read
→ External ID Mapping
→ Webhooks
→ Reconciliation
```

### How do they recover from failures?

```text
Idempotency
+
Error Codes
+
Retries
+
Reconciliation
```

---

# 5.45 Phase 5 Final Model

The complete integration architecture is now:

```text
                    NEXG MERCHANT
                         │
                21 Categories
                134 Subcategories
                         │
                         ▼
                CAPABILITY PROFILE
                         │
                         ▼
                INTEGRATION PROFILE
                         │
                         ▼
                 SCOPES / ACCESS
                         │
                         ▼
                  NEXG API
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
        READ           WRITE         WEBHOOKS
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                CANONICAL ENTITIES
                         │
                         ▼
                  STATE MACHINES
                         │
                         ▼
                    EVENTS
```

## The five phases now form one system

```text
PHASE 1
NEXG Integration Principles
        ↓
"How should NEXG integrate?"

PHASE 2
Domains & Capabilities
        ↓
"What can NEXG do?"

PHASE 3
Canonical Data Model
        ↓
"What does NEXG represent?"

PHASE 4
Workflow & State Model
        ↓
"How does NEXG operate?"

PHASE 5
Integration & API Surface
        ↓
"How does a merchant's IT system interact with NEXG?"
```

### The important architectural result

We have **not yet written the final endpoint catalogue**.

That is deliberate.

If we had started with endpoints, we would have risked designing:

```text
21 categories
×
different merchant APIs
×
different workflows
```

Instead, NEXG now has:

```text
21 categories
        ↓
134 subcategories
        ↓
Reusable capabilities
        ↓
Canonical entities
        ↓
Reusable workflows
        ↓
Capability-based API surface
        ↓
Merchant-specific integration access
```

That gives us the foundation for the next phase:

# **Phase 6 — NEXG API & Event Specification**

Phase 6 is where we can finally become extremely concrete: **the actual resource catalogue, endpoint naming, HTTP methods, request/response schemas, scopes, event names, webhook payloads, pagination, filtering, error codes, idempotency headers, versioning and complete merchant integration examples.**

That is the point where the documentation starts looking like a professional developer platform rather than an architectural proposal.

## Prompt:
8/7/2026, 10:00:03 AM

Phase 6

## Response:
8/7/2026, 10:00:04 AM

Absolutely. **Phase 6 is where we stop defining the architecture conceptually and start specifying the actual NEXG developer interface.**

# Phase 6 — NEXG API & Event Specification

Phase 6 turns the Phase 5 capability model into a **formal API contract** that a merchant's IT team can actually build against.

The important distinction is:

> **Phase 5 defined what merchant systems can do. Phase 6 defines exactly how they do it.**

---

# 6.1 NEXG API Design Principles

The NEXG API will follow these principles throughout the project.

### 1. Business-first APIs

NEXG exposes meaningful business operations rather than exposing database operations.

```text
Confirm Order
Cancel Booking
Reserve Inventory
Assign Vehicle
Complete Fulfillment
```

rather than encouraging developers to directly manipulate arbitrary status fields.

---

### 2. Resource-oriented architecture

Resources have stable identities.

```text
merchant
location
customer
product
service
experience
inventory
order
booking
request
payment
fulfillment
delivery
vehicle
shipment
document
event
```

---

### 3. Explicit actions

Where an operation represents a business action, NEXG exposes it explicitly.

```text
POST /orders/{orderId}/confirm
POST /orders/{orderId}/cancel
POST /bookings/{bookingId}/confirm
POST /bookings/{bookingId}/cancel
POST /shipments/{shipmentId}/dispatch
```

The action is validated against the Phase 4 state machine.

---

# 6.2 Base API Structure

The public API should have a predictable structure.

```text
https://api.nexgapp.com/v1/
```

The API namespace then becomes:

```text
/v1/merchants
/v1/locations
/v1/customers
/v1/products
/v1/services
/v1/experiences
/v1/inventory
/v1/orders
/v1/bookings
/v1/requests
/v1/payments
/v1/fulfillments
/v1/deliveries
/v1/vehicles
/v1/shipments
/v1/documents
/v1/events
```

The exact production hostname can be finalized when infrastructure is finalized.

---

# 6.3 Resource Identity

Every canonical NEXG resource receives a stable identifier.

Example:

```text
merchantId
MRC-20260807-00001
```

```text
orderId
ORD-20260807-00001
```

```text
bookingId
BKG-20260807-00001
```

```text
productId
PRD-20260807-00001
```

The format should be treated as an identifier, not something merchant systems should parse for business meaning.

---

# 6.4 External References

NEXG must also support the merchant's own identifiers.

A resource can therefore contain:

```text
{
  "id": "ORD-20260807-00001",
  "externalReference": {
    "system": "merchant-pos",
    "id": "POS-98122"
  }
}
```

This allows:

```text
Merchant POS
POS-98122
      ↕
NEXG
ORD-20260807-00001
```

without forcing the merchant to replace its internal IDs.

---

# 6.5 Standard Request Headers

NEXG requests should use standardized headers.

Core headers:

```text
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

For mutation requests that support idempotency:

```text
Idempotency-Key: <unique-key>
```

For request tracing:

```text
X-Request-ID: <client-generated-id>
```

NEXG should return its own request identifier in every response.

---

# 6.6 Standard Response Envelope

Successful responses should remain predictable.

For a single resource:

```json
{
  "data": {
    "id": "ORD-20260807-00001",
    "type": "order"
  },
  "requestId": "req_01J..."
}
```

For collections:

```json
{
  "data": [],
  "pagination": {
    "nextCursor": "cursor_...",
    "hasMore": true
  },
  "requestId": "req_01J..."
}
```

This gives developers a consistent response model across NEXG.

---

# 6.7 Collection Endpoints

Resources generally support:

```text
GET /resources
GET /resources/{id}
```

Where authorized:

```text
POST /resources
PATCH /resources/{id}
DELETE /resources/{id}
```

However, NEXG will **not automatically expose CRUD for every resource**.

The allowed operations are determined by the domain and capability model.

---

# 6.8 Merchant API

The merchant resource establishes the integration context.

Core operations:

```text
GET /v1/merchants/{merchantId}
GET /v1/merchants/{merchantId}/locations
GET /v1/merchants/{merchantId}/capabilities
GET /v1/merchants/{merchantId}/integrations
```

The capability endpoint is especially important.

It tells the merchant system what NEXG has enabled for that merchant.

A response could contain:

```json
{
  "data": {
    "merchantId": "MRC-20260807-00001",
    "capabilities": [
      "catalog",
      "inventory",
      "orders",
      "fulfillment",
      "delivery",
      "events"
    ]
  }
}
```

For a restaurant merchant, this might correspond to the operational capabilities required by **Restaurants & Food → Restaurant**.

---

# 6.9 Location API

Multi-location merchants need location-aware operations.

```text
GET /v1/locations
GET /v1/locations/{locationId}
```

Resources such as products, inventory and orders can reference a location.

This allows a merchant with:

```text
Westlands
Kilimani
Karen
```

to maintain different operational data without creating separate merchant accounts.

---

# 6.10 Catalog API

The catalog surface is divided into:

```text
Products
Services
Experiences
Categories
Modifiers
Pricing
```

This avoids creating one enormous universal "catalog object."

---

# 6.11 Product API

Core operations:

```text
POST   /v1/products
GET    /v1/products/{productId}
GET    /v1/products
PATCH  /v1/products/{productId}
POST   /v1/products/{productId}/archive
```

Example creation request:

```json
{
  "name": "Chicken Burger",
  "description": "Grilled chicken burger",
  "categoryId": "CAT-REST-001",
  "price": {
    "amount": 850,
    "currency": "KES"
  },
  "locationIds": [
    "LOC-20260807-00001"
  ],
  "externalReference": {
    "system": "merchant-pos",
    "id": "ITEM-1029"
  }
}
```

The resulting resource would receive its own NEXG ID.

---

# 6.12 Service API

Services use the same catalog principles but support service-specific capabilities.

```text
POST   /v1/services
GET    /v1/services
GET    /v1/services/{serviceId}
PATCH  /v1/services/{serviceId}
POST   /v1/services/{serviceId}/archive
```

A spa could maintain:

```text
Deep Tissue Massage
60 minutes
KES 5,000
```

while NEXG separately manages availability and bookings.

---

# 6.13 Experience API

Experiences represent bookable experiences.

```text
POST /v1/experiences
GET  /v1/experiences
GET  /v1/experiences/{experienceId}
PATCH /v1/experiences/{experienceId}
```

A safari operator can therefore expose:

```text
Maasai Mara Safari
Full Day
Capacity: 8
Price: KES 35,000
```

while availability and booking remain separate domains.

---

# 6.14 Inventory API

Core operations:

```text
GET  /v1/inventory
GET  /v1/inventory/{inventoryId}
POST /v1/inventory/{inventoryId}/adjust
POST /v1/inventory/{inventoryId}/reserve
POST /v1/inventory/{inventoryId}/release
```

The API should not allow arbitrary:

```text
PATCH status = "available"
```

when inventory state is governed by actual reservations and quantities.

The business operation should be explicit.

---

# 6.15 Availability API

Availability is separate from inventory.

It can represent:

```text
Product availability
Service availability
Experience capacity
Vehicle availability
Staff availability
```

Conceptually:

```text
GET /v1/availability
GET /v1/availability/{resourceId}
```

The query can include:

```text
resource
location
date
startTime
endTime
quantity
```

This lets a customer-facing or merchant system ask:

> Can this resource actually be booked for this period?

---

# 6.16 Order API

The order API becomes one of the most important NEXG surfaces.

```text
POST /v1/orders
GET  /v1/orders
GET  /v1/orders/{orderId}
```

Operational actions:

```text
POST /v1/orders/{orderId}/confirm
POST /v1/orders/{orderId}/reject
POST /v1/orders/{orderId}/cancel
POST /v1/orders/{orderId}/start-preparation
POST /v1/orders/{orderId}/mark-ready
POST /v1/orders/{orderId}/complete
```

Not every merchant integration receives every action.

---

# 6.17 Order Creation

An order request could contain:

```json
{
  "locationId": "LOC-20260807-00001",
  "customerId": "CUS-20260807-00012",
  "items": [
    {
      "productId": "PRD-20260807-00018",
      "quantity": 2
    }
  ],
  "fulfillment": {
    "type": "delivery"
  },
  "externalReference": {
    "system": "merchant-pos",
    "id": "POS-98122"
  }
}
```

NEXG then:

```text
Validate
   ↓
Create Order
   ↓
Reserve Inventory where applicable
   ↓
Create Fulfillment
   ↓
Generate order.created
```

The merchant does not need to reproduce NEXG's internal orchestration.

---

# 6.18 Booking API

Core endpoints:

```text
POST /v1/bookings
GET  /v1/bookings
GET  /v1/bookings/{bookingId}
```

Actions:

```text
POST /v1/bookings/{bookingId}/confirm
POST /v1/bookings/{bookingId}/reject
POST /v1/bookings/{bookingId}/cancel
POST /v1/bookings/{bookingId}/start
POST /v1/bookings/{bookingId}/complete
```

A car rental company, spa and safari operator can therefore use the same booking architecture while their domain-specific resources remain different.

---

# 6.19 Request API

For concierge operations:

```text
POST /v1/requests
GET  /v1/requests
GET  /v1/requests/{requestId}
```

Actions:

```text
POST /v1/requests/{requestId}/accept
POST /v1/requests/{requestId}/reject
POST /v1/requests/{requestId}/assign
POST /v1/requests/{requestId}/complete
POST /v1/requests/{requestId}/cancel
```

This directly supports the **Concierge Services** category.

---

# 6.20 Fulfillment API

Fulfillment provides execution-level operations.

```text
GET /v1/fulfillments
GET /v1/fulfillments/{fulfillmentId}
```

Actions:

```text
POST /v1/fulfillments/{fulfillmentId}/start
POST /v1/fulfillments/{fulfillmentId}/ready
POST /v1/fulfillments/{fulfillmentId}/complete
POST /v1/fulfillments/{fulfillmentId}/fail
```

The order or booking remains the commercial record.

Fulfillment represents the operational execution.

---

# 6.21 Delivery API

```text
POST /v1/deliveries
GET  /v1/deliveries
GET  /v1/deliveries/{deliveryId}
```

Operational actions:

```text
POST /v1/deliveries/{deliveryId}/assign
POST /v1/deliveries/{deliveryId}/accept
POST /v1/deliveries/{deliveryId}/pickup
POST /v1/deliveries/{deliveryId}/start
POST /v1/deliveries/{deliveryId}/complete
POST /v1/deliveries/{deliveryId}/fail
```

This supports delivery-enabled merchants without forcing their order system to understand driver logistics.

---

# 6.22 Vehicle API

```text
POST /v1/vehicles
GET  /v1/vehicles
GET  /v1/vehicles/{vehicleId}
PATCH /v1/vehicles/{vehicleId}
```

Operational actions:

```text
POST /v1/vehicles/{vehicleId}/reserve
POST /v1/vehicles/{vehicleId}/assign
POST /v1/vehicles/{vehicleId}/release
POST /v1/vehicles/{vehicleId}/maintenance
```

---

# 6.23 Shipment API

```text
POST /v1/shipments
GET  /v1/shipments
GET  /v1/shipments/{shipmentId}
```

Actions:

```text
POST /v1/shipments/{shipmentId}/assign
POST /v1/shipments/{shipmentId}/pickup
POST /v1/shipments/{shipmentId}/dispatch
POST /v1/shipments/{shipmentId}/deliver
POST /v1/shipments/{shipmentId}/fail
```

---

# 6.24 Payment API

Payment endpoints must be more tightly permissioned.

```text
POST /v1/payments
GET  /v1/payments/{paymentId}
GET  /v1/payments
```

Actions:

```text
POST /v1/payments/{paymentId}/authorize
POST /v1/payments/{paymentId}/capture
POST /v1/payments/{paymentId}/refund
```

Payment operations should always produce corresponding events.

---

# 6.25 Event API

NEXG should provide an event retrieval surface in addition to webhooks.

```text
GET /v1/events
GET /v1/events/{eventId}
```

This provides an audit/recovery mechanism.

A merchant can retrieve events filtered by:

```text
eventType
resourceType
resourceId
createdAt
```

This supports reconciliation after webhook interruptions.

---

# 6.26 Event Naming Convention

Events follow:

```text
resource.action
```

Examples:

```text
order.created
order.confirmed
order.cancelled

booking.created
booking.confirmed
booking.cancelled

inventory.updated
inventory.reserved
inventory.released

delivery.assigned
delivery.picked_up
delivery.delivered

shipment.created
shipment.dispatched
shipment.delivered
```

Event names must remain stable.

---

# 6.27 Event Payload

A standard event should look conceptually like:

```json
{
  "id": "EVT-20260807-00001",
  "type": "order.confirmed",
  "version": "1",
  "occurredAt": "2026-08-07T06:30:00Z",
  "merchantId": "MRC-20260807-00001",
  "resource": {
    "type": "order",
    "id": "ORD-20260807-00001"
  },
  "data": {
    "status": "confirmed"
  }
}
```

The event wrapper remains consistent even when the resource-specific payload changes.

---

# 6.28 Webhook Endpoint

Merchant systems register an endpoint:

```text
POST /v1/webhook-endpoints
```

The registration contains:

```json
{
  "url": "https://merchant.example.com/nexg/webhooks",
  "events": [
    "order.created",
    "order.confirmed",
    "order.fulfilled"
  ]
}
```

NEXG then delivers subscribed events to that endpoint.

---

# 6.29 Webhook Delivery Headers

A delivery should contain verification metadata such as:

```text
NEXG-Event-ID
NEXG-Event-Type
NEXG-Event-Version
NEXG-Timestamp
NEXG-Signature
```

The merchant verifies the signature before processing.

---

# 6.30 Webhook Retry

A failed webhook must not silently disappear.

The lifecycle is:

```text
Event
 ↓
Attempt 1
 ↓
Failed
 ↓
Retry
 ↓
Retry
 ↓
Success
```

If the configured retry policy is exhausted, the event enters a delivery failure state that can be inspected from the integration tooling.

---

# 6.31 Idempotency Contract

For mutation requests:

```text
Idempotency-Key: POS-ORDER-98122
```

NEXG stores the result against that key within the defined idempotency window.

A repeated request with the same key should return the original operation result rather than execute the business action twice.

This is particularly important for:

```text
POST /orders
POST /bookings
POST /payments
POST /shipments
```

---

# 6.32 Standard Error Model

NEXG errors should follow a consistent structure:

```json
{
  "error": {
    "code": "ORDER_INVALID_STATE",
    "message": "The order cannot be confirmed from its current state.",
    "requestId": "req_01J...",
    "details": {
      "currentState": "fulfilled",
      "requestedAction": "confirm"
    }
  }
}
```

Machine-readable `code` is what integrations should program against.

---

# 6.33 HTTP Error Classes

NEXG should consistently use HTTP semantics.

| HTTP | Meaning |
|---:|---|
| 400 | Invalid request |
| 401 | Authentication required/invalid |
| 403 | Insufficient permission |
| 404 | Resource not found |
| 409 | Resource/state conflict |
| 422 | Business validation failure |
| 429 | Rate limit exceeded |
| 500 | NEXG server error |
| 502/503 | Upstream/service availability failure |

The exact error catalogue will be finalized alongside the production API specification.

---

# 6.34 Pagination Contract

Collections should return cursor metadata.

```json
{
  "data": [],
  "pagination": {
    "nextCursor": "eyJpZCI6...",
    "hasMore": true
  }
}
```

The next request uses:

```text
?cursor=eyJpZCI6...
```

This avoids the instability of deep offset pagination for continuously changing operational data.

---

# 6.35 Filtering Contract

Filtering remains resource-specific.

Orders:

```text
GET /v1/orders?status=confirmed&locationId=LOC-001
```

Bookings:

```text
GET /v1/bookings?status=scheduled&from=2026-08-07&to=2026-08-14
```

Products:

```text
GET /v1/products?status=active&locationId=LOC-001
```

NEXG documentation will specify which filters each endpoint supports.

---

# 6.36 Sorting

Collections should support predictable sorting where meaningful.

Examples:

```text
?sort=createdAt
?sort=-createdAt
```

The API must document which fields are sortable.

---

# 6.37 API Versioning

The public API begins at:

```text
/v1/
```

A new major version is introduced only when a breaking change is necessary.

Minor additive changes remain compatible within the existing major version.

---

# 6.38 Scope Model

The API specification now connects directly to the Phase 5 permission architecture.

Example:

```text
GET /v1/orders
```

requires:

```text
orders:read
```

While:

```text
POST /v1/orders/{orderId}/confirm
```

requires:

```text
orders:write
```

And:

```text
GET /v1/events
```

requires:

```text
events:read
```

This provides granular access control.

---

# 6.39 Capability Discovery

A merchant's integration should be able to determine what it has access to.

```text
GET /v1/merchants/{merchantId}/capabilities
```

The result could say:

```json
{
  "data": {
    "capabilities": [
      {
        "name": "orders",
        "operations": [
          "read",
          "create",
          "confirm",
          "cancel"
        ]
      },
      {
        "name": "inventory",
        "operations": [
          "read",
          "update",
          "reserve",
          "release"
        ]
      }
    ]
  }
}
```

This prevents developers from having to guess which APIs their merchant account supports.

---

# 6.40 The Developer Portal

The API specification must ultimately become a developer experience.

The merchant IT team should see:

```text
NEXG Developer Portal
│
├── Getting Started
│
├── Authentication
│
├── Sandbox
│
├── Your Merchant
│
├── Capabilities
│
├── API Reference
│   ├── Catalog
│   ├── Inventory
│   ├── Orders
│   ├── Bookings
│   ├── Requests
│   ├── Payments
│   ├── Fulfillment
│   ├── Delivery
│   ├── Vehicles
│   ├── Shipments
│   └── Events
│
├── Webhooks
│
├── Errors
│
├── Idempotency
│
├── Rate Limits
│
├── Versioning
│
├── Testing
│
└── Integration Certification
```

---

# 6.41 Merchant Integration Journey

A professional merchant integration should follow this sequence:

```text
1. Merchant activated
        ↓
2. IT administrator creates integration
        ↓
3. Select integration profile
        ↓
4. Receive sandbox credentials
        ↓
5. Discover capabilities
        ↓
6. Build against API
        ↓
7. Register webhooks
        ↓
8. Test workflows
        ↓
9. Run certification
        ↓
10. Receive production credentials
        ↓
11. Go live
        ↓
12. Monitor integration
```

This is the complete developer lifecycle.

---

# 6.42 Integration Certification

Before production access, NEXG should verify that the merchant system can correctly handle the important workflows.

For a restaurant integration:

```text
Create Product
      ↓
Update Inventory
      ↓
Receive Order
      ↓
Confirm Order
      ↓
Start Preparation
      ↓
Mark Ready
      ↓
Complete Fulfillment
      ↓
Receive Events
```

For a car rental integration:

```text
Create Vehicle
      ↓
Publish Availability
      ↓
Receive Booking
      ↓
Confirm Booking
      ↓
Assign Vehicle
      ↓
Start Rental
      ↓
Complete Rental
```

Certification therefore tests **real workflows**, not merely whether HTTP requests return 200.

---

# 6.43 API Documentation Must Be Generated From the Contract

NEXG should maintain one authoritative API contract.

The source of truth should define:

```text
Resources
Endpoints
Methods
Parameters
Schemas
Scopes
Errors
Events
Webhooks
Versions
```

From that contract, NEXG can generate:

- API reference
- OpenAPI specification
- SDK documentation
- request examples
- response examples
- validation
- developer tooling

This prevents the documentation and actual API from drifting apart.

---

# 6.44 OpenAPI

NEXG should publish an OpenAPI specification for each supported API version.

Conceptually:

```text
NEXG API
   ↓
OpenAPI Specification
   ├── Swagger-style reference
   ├── SDK generation
   ├── Validation
   ├── Testing
   └── Developer tooling
```

The OpenAPI document becomes a machine-readable contract.

---

# 6.45 SDK Strategy

Once the API stabilizes, NEXG can provide official SDKs.

The initial SDK priorities should follow merchant integration demand.

Potential languages:

```text
TypeScript
Python
Java
PHP
C#
```

The SDK should not introduce a different business model.

It should simply make the canonical API easier to consume.

---

# 6.46 What We Will Not Do

NEXG will **not** create:

```text
Restaurant API
Grocery API
Spa API
Safari API
Car Rental API
Laundry API
```

as completely independent systems.

Instead:

```text
NEXG API
    ↓
Capabilities
    ↓
Domain resources
    ↓
Workflow rules
    ↓
Merchant-specific access
```

This keeps the platform maintainable as the taxonomy expands.

---

# 6.47 Phase 6 Result

We now have the first concrete NEXG API contract architecture:

```text
                         NEXG API v1
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
    RESOURCES              ACTIONS                EVENTS
       │                      │                      │
       │                      │                      │
   Merchants              Confirm                Created
   Locations              Cancel                 Updated
   Products               Assign                 Completed
   Services               Reserve                Failed
   Experiences            Dispatch               Cancelled
   Inventory              Fulfill
   Orders                 Refund
   Bookings
   Requests
   Payments
   Fulfillments
   Deliveries
   Vehicles
   Shipments
                              │
                              ▼
                       STATE MACHINES
                              │
                              ▼
                        DOMAIN RULES
                              │
                              ▼
                    MERCHANT CAPABILITIES
```

And the complete integration lifecycle is:

```text
Taxonomy
   ↓
Capability
   ↓
Entity
   ↓
Workflow
   ↓
State
   ↓
Action
   ↓
API
   ↓
Event
   ↓
Webhook
   ↓
Merchant System
```

---

# 6.48 What Phase 6 Has Established

The NEXG developer platform now has defined foundations for:

**API**

- resource structure
- endpoint conventions
- business actions
- HTTP semantics
- request/response structure
- pagination
- filtering
- sorting
- versioning

**Security**

- scoped access
- authentication
- authorization
- webhook signatures
- idempotency

**Events**

- event naming
- event structure
- event retrieval
- webhook delivery
- retries
- deduplication

**Merchant integration**

- capability discovery
- integration profiles
- external IDs
- sandbox
- certification
- production activation

**Documentation**

- capability documentation
- endpoint documentation
- OpenAPI
- SDK strategy
- developer portal structure

---

# Phase 6 → Phase 7

Now we can do something much more powerful.

**Phase 7 should be the NEXG Merchant Integration Documentation System.**

This is where we take everything we've designed and define the **actual documentation architecture that merchants' IT teams will consume**.

It should specify the complete documentation hierarchy:

```text
NEXG Developers
│
├── 01 Getting Started
├── 02 Merchant Integration
├── 03 Authentication
├── 04 Sandbox
├── 05 API Fundamentals
├── 06 Catalog
├── 07 Inventory
├── 08 Orders
├── 09 Bookings
├── 10 Requests
├── 11 Payments
├── 12 Fulfillment
├── 13 Delivery
├── 14 Vehicles
├── 15 Shipments
├── 16 Events
├── 17 Webhooks
├── 18 Errors
├── 19 Security
├── 20 Testing
├── 21 Certification
├── 22 Production
└── 23 Changelog
```

And, crucially, **the documentation can dynamically adapt to the merchant's 21-category / 134-subcategory profile** so a restaurant IT team sees the integration capabilities relevant to **Restaurants & Food → Restaurant**, while a safari operator sees the capabilities relevant to **Travel & Tours → Safaris**.

That is the point at which we can start defining the actual **NEXG equivalent of a professional merchant developer platform**, uniquely based on the taxonomy, workflows and architecture we've established rather than copying another company's documentation structure.

## Prompt:
8/7/2026, 10:04:25 AM

Phase 7

## Response:
8/7/2026, 10:04:26 AM

# Phase 7 — NEXG Merchant Integration Documentation System

Phase 7 defines **how NEXG will document the platform for merchant IT teams**.

This is not merely a documentation website.

It is the **operational contract between NEXG and a merchant's technical team**.

By this point we have established:

```text
Phase 1 → Integration principles
Phase 2 → Domains & capabilities
Phase 3 → Canonical entities
Phase 4 → Workflows & states
Phase 5 → Integration capabilities
Phase 6 → API & event specification
Phase 7 → Developer documentation system
```

The objective is to make a merchant developer able to go from:

> "We want to connect our system to NEXG."

to:

> "Our integration is tested and ready for production."

without needing NEXG engineers to explain every step manually.

---

# 7.1 The NEXG Documentation Philosophy

NEXG documentation will be:

### Task-oriented

Developers should be able to accomplish something.

```text
Receive NEXG orders
Synchronize products
Update inventory
Create bookings
Receive booking events
Connect a POS
Connect a booking system
```

Not merely read API definitions.

### Capability-aware

The documentation should reflect what the merchant is actually enabled to use.

### Workflow-aware

The documentation explains the entire business process, not just individual endpoints.

### Contract-driven

The API documentation must correspond to the actual API contract.

### Example-driven

Every important integration operation gets a concrete request, response and resulting workflow.

---

# 7.2 The Documentation Architecture

The NEXG developer portal should have this structure:

```text
NEXG Developers
│
├── Getting Started
│
├── Merchant Integration
│
├── Authentication
│
├── Sandbox
│
├── Integration Concepts
│
├── API Reference
│   ├── Merchants
│   ├── Locations
│   ├── Catalog
│   ├── Products
│   ├── Services
│   ├── Experiences
│   ├── Inventory
│   ├── Availability
│   ├── Orders
│   ├── Bookings
│   ├── Requests
│   ├── Payments
│   ├── Fulfillment
│   ├── Delivery
│   ├── Vehicles
│   ├── Shipments
│   └── Events
│
├── Webhooks
│
├── Integration Guides
│
├── Security
│
├── Errors
│
├── Testing
│
├── Certification
│
├── Production
│
├── SDKs
│
└── Changelog
```

---

# 7.3 Getting Started

The first page should answer five questions immediately:

```text
1. What is NEXG?
2. What can my system integrate with?
3. What credentials do I need?
4. What do I build first?
5. How do I test it?
```

The first developer journey becomes:

```text
Understand
   ↓
Create Integration
   ↓
Get Credentials
   ↓
Connect Sandbox
   ↓
Discover Capabilities
   ↓
Build
   ↓
Test
   ↓
Certify
   ↓
Go Live
```

---

# 7.4 Merchant Integration Page

This is where NEXG becomes different from generic API documentation.

The merchant developer should see their integration context.

For a merchant categorized as:

```text
Category:
Restaurants & Food

Subcategory:
Restaurant
```

the portal can display:

```text
Your NEXG capabilities

✓ Catalog
✓ Products
✓ Modifiers
✓ Pricing
✓ Inventory
✓ Orders
✓ Fulfillment
✓ Delivery
✓ Events
```

The developer therefore starts with **their actual integration surface**.

---

# 7.5 Capability Profile

The documentation portal should expose:

```text
Merchant
    ↓
Category
    ↓
Subcategory
    ↓
Capability Profile
    ↓
Integration Permissions
```

The 21 categories and 134 subcategories therefore become an input into the documentation experience.

The taxonomy does **not** determine arbitrary API access by itself.

Instead:

```text
Taxonomy
+
Merchant configuration
+
Enabled capabilities
+
Integration permissions
```

determine what the developer sees and can use.

---

# 7.6 The "Your Integration" Page

Every merchant developer should have a central integration page.

```text
Your Integration
────────────────────────────

Merchant
NEXG Merchant Name

Category
Restaurants & Food

Subcategory
Restaurant

Environment
Sandbox

Integration
POS Integration

Status
Development

Capabilities
9 enabled

Webhooks
3 subscribed

API Credentials
Configured

Certification
Not started
```

This becomes the technical control center.

---

# 7.7 Authentication Documentation

Authentication must be explained before developers reach protected APIs.

The documentation should cover:

```text
Authentication model
Credential creation
Access tokens
Scopes
Token expiration
Token rotation
Credential revocation
Environment separation
Security requirements
```

The developer should receive a concrete flow:

```text
Create Integration
       ↓
Receive Credentials
       ↓
Authenticate
       ↓
Receive Token
       ↓
Call NEXG API
```

---

# 7.8 Authorization Documentation

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

NEXG documentation therefore needs a dedicated scopes section.

Example:

```text
orders:read
orders:write

inventory:read
inventory:write

catalog:read
catalog:write

bookings:read
bookings:write

events:read
```

Each scope should explain:

- what it permits
- which endpoints use it
- which merchant capabilities require it
- whether it is read-only or mutation-capable

---

# 7.9 Sandbox Documentation

Sandbox needs its own complete section.

It should explain:

```text
Sandbox URL
Sandbox credentials
Test merchants
Test customers
Test products
Test orders
Test bookings
Test payments
Test events
Webhook testing
Resetting test data
```

The developer should be able to build the integration without touching production.

---

# 7.10 API Fundamentals

Before individual resources, developers need the common rules.

This section defines:

```text
Base URL
HTTP methods
Headers
Authentication
Request IDs
Response format
Pagination
Filtering
Sorting
Dates and times
Currency
Identifiers
External references
Idempotency
Errors
Versioning
```

Every resource then inherits these conventions.

---

# 7.11 Resource Documentation Template

Every NEXG resource should use the same documentation structure.

```text
# Orders

Purpose

When to use

Resource model

Permissions

Endpoints

State machine

Create

Retrieve

List

Actions

Events

Errors

Idempotency

Pagination

Filtering

Webhook behavior

Integration example

Testing
```

This consistency matters enormously when the API becomes large.

---

# 7.12 Endpoint Documentation Template

Every endpoint gets a predictable page.

```text
POST /v1/orders/{orderId}/confirm
```

### Purpose

Confirms an order that is currently eligible for confirmation.

### Required scope

```text
orders:write
```

### Allowed state

```text
created
```

### Request

No body required unless the operation requires additional data.

### Response

Returns the updated order.

### Events

```text
order.confirmed
```

### Possible errors

```text
ORDER_NOT_FOUND
ORDER_INVALID_STATE
INSUFFICIENT_PERMISSION
```

### Idempotency

Documented where applicable.

This means developers don't have to infer behavior from the endpoint name.

---

# 7.13 Workflow Guides

This is one of the most important parts of Phase 7.

NEXG should document **complete workflows**, not just APIs.

For a restaurant:

```text
Receive Order
      ↓
Retrieve Order
      ↓
Confirm
      ↓
Prepare
      ↓
Mark Ready
      ↓
Fulfill
      ↓
Receive Completion Event
```

The guide then links directly to the relevant API operations.

---

# 7.14 Restaurant Integration Guide

The documentation can provide:

```text
Restaurants & Food
→ Restaurant
→ POS Integration
```

and then show the complete integration.

### Step 1 — Synchronize catalog

```text
POST /v1/products
```

### Step 2 — Synchronize inventory

```text
POST /v1/inventory/{inventoryId}/adjust
```

### Step 3 — Subscribe to orders

```text
order.created
```

### Step 4 — Retrieve order

```text
GET /v1/orders/{orderId}
```

### Step 5 — Confirm

```text
POST /v1/orders/{orderId}/confirm
```

### Step 6 — Prepare

```text
POST /v1/orders/{orderId}/start-preparation
```

### Step 7 — Mark ready

```text
POST /v1/orders/{orderId}/mark-ready
```

### Step 8 — Complete fulfillment

```text
POST /v1/orders/{orderId}/complete
```

This is vastly more useful to an IT team than a list of 30 unrelated endpoints.

---

# 7.15 Car Rental Integration Guide

The same documentation framework adapts to:

```text
Vehicle Rentals
→ Car Rental
```

The workflow becomes:

```text
Synchronize Vehicles
       ↓
Publish Availability
       ↓
Receive Booking
       ↓
Retrieve Booking
       ↓
Confirm Booking
       ↓
Assign Vehicle
       ↓
Start Rental
       ↓
Complete Rental
```

The relevant APIs are surfaced automatically.

---

# 7.16 Safari Integration Guide

For:

```text
Travel & Tours
→ Safaris
```

the documentation becomes:

```text
Create Experience
       ↓
Configure Capacity
       ↓
Publish Availability
       ↓
Receive Booking
       ↓
Confirm Booking
       ↓
Assign Resources
       ↓
Start Experience
       ↓
Complete Experience
```

This is the same documentation architecture applied to a different NEXG capability profile.

---

# 7.17 Concierge Integration Guide

For:

```text
Concierge Services
→ Personal Assistance
```

the workflow becomes:

```text
Receive Request
       ↓
Retrieve Request
       ↓
Accept
       ↓
Assign Staff
       ↓
Perform Task
       ↓
Complete Request
```

Relevant resources:

```text
Requests
Tasks
Assignments
Customers
Payments
Fulfillment
Events
```

---

# 7.18 Integration Recipes

NEXG should have reusable implementation recipes.

Examples:

```text
Receive NEXG orders
Sync your catalog with NEXG
Sync inventory
Connect a POS
Connect a booking system
Connect a fleet system
Receive NEXG webhooks
Implement webhook verification
Handle duplicate events
Handle failed requests
Implement reconciliation
Move from sandbox to production
```

Each recipe solves one concrete integration problem.

---

# 7.19 "Build Your Integration" Guides

The documentation should eventually offer guided paths.

```text
What are you integrating?

○ POS
○ ERP
○ Inventory System
○ Booking System
○ Fleet System
○ Accounting System
○ CRM
○ Custom Platform
```

Then:

```text
What does your merchant provide?

○ Products
○ Services
○ Experiences
○ Bookings
○ Delivery
○ Logistics
```

NEXG can produce the relevant integration path.

---

# 7.20 API Reference vs Guides

We should deliberately separate these.

### Guides

Explain:

> **How do I accomplish something?**

### API Reference

Explains:

> **Exactly how does this endpoint work?**

### Concepts

Explain:

> **Why does NEXG work this way?**

### Webhooks

Explain:

> **How does NEXG tell my system something happened?**

### Troubleshooting

Explain:

> **What do I do when something goes wrong?**

This prevents the developer portal from becoming one giant reference manual.

---

# 7.21 Events Documentation

Every event gets its own documentation.

Example:

```text
order.confirmed
```

Documentation:

```text
When it occurs
Who receives it
Required subscription
Payload
Resource
Version
Delivery behavior
Retry behavior
Deduplication
Example
```

The developer should know exactly what causes the event.

---

# 7.22 Webhook Documentation

Webhook documentation needs to cover the entire operational contract:

```text
Create endpoint
Subscribe to events
Verify signature
Parse event
Validate timestamp
Deduplicate
Process event
Return response
Handle retry
Recover missed events
```

This is critical because webhook integrations are operational systems, not just HTTP callbacks.

---

# 7.23 Error Documentation

NEXG should maintain a searchable error catalogue.

Example:

```text
ORDER_INVALID_STATE
```

Documentation:

```text
Meaning:
The requested order action is not valid for the order's current state.

Common cause:
The merchant attempted an action after the order had already been fulfilled.

Resolution:
Retrieve the order and evaluate its current state before retrying.
```

This makes failures actionable.

---

# 7.24 Troubleshooting

The developer portal should contain workflow-based troubleshooting.

```text
Orders aren't arriving
        ↓
Check webhook subscription
        ↓
Check endpoint response
        ↓
Check webhook delivery logs
        ↓
Retrieve event
        ↓
Check integration permissions
```

Another:

```text
Product isn't appearing
        ↓
Check product status
        ↓
Check location
        ↓
Check category
        ↓
Check capability
        ↓
Check API response
```

---

# 7.25 Integration Logs

The merchant developer should have access to integration-level logs.

```text
Integration Logs
────────────────────────────

Time
10:02:14

Direction
NEXG → Merchant

Event
order.created

Resource
ORD-20260807-00001

Response
200

Delivery
Successful
```

For failed requests:

```text
Direction
Merchant → NEXG

Endpoint
POST /v1/orders/...

Response
409

Code
ORDER_INVALID_STATE
```

This dramatically reduces integration support burden.

---

# 7.26 Webhook Delivery Logs

Webhook logs should expose:

```text
Event ID
Event Type
Destination
Attempt
HTTP Status
Response Time
Delivery Status
Next Retry
```

A developer can therefore diagnose:

```text
Event generated
       ↓
Webhook attempted
       ↓
Merchant returned 500
       ↓
Retry scheduled
```

without contacting NEXG support.

---

# 7.27 Integration Health

The developer portal should eventually expose:

```text
Integration Health
────────────────────

API Requests
✓ Healthy

Authentication
✓ Healthy

Webhooks
✓ Healthy

Event Processing
✓ Healthy

Error Rate
Low

Last Successful Event
10:04:31

Failed Deliveries
0
```

This turns documentation into an operational developer platform.

---

# 7.28 Production Checklist

Before going live:

```text
□ Production credentials created
□ Correct scopes configured
□ Webhook endpoint secured
□ Signature verification implemented
□ Idempotency implemented
□ Duplicate events handled
□ Error handling implemented
□ Retry handling implemented
□ Reconciliation implemented
□ External IDs mapped
□ Required workflows tested
□ Certification completed
```

---

# 7.29 Integration Certification

Certification should be capability-specific.

A restaurant integration should not be tested against vehicle workflows.

A car rental integration should not be tested against restaurant order preparation.

The certification engine uses:

```text
Merchant
   ↓
Capability Profile
   ↓
Required Workflows
   ↓
Test Cases
   ↓
Pass / Fail
```

---

# 7.30 Example Certification — Restaurant

Required tests:

```text
Catalog
✓ Create product
✓ Update product
✓ Archive product

Inventory
✓ Adjust inventory
✓ Reserve inventory
✓ Release inventory

Orders
✓ Receive order
✓ Retrieve order
✓ Confirm order
✓ Start preparation
✓ Mark ready
✓ Complete order

Events
✓ Receive order.created
✓ Receive order.confirmed
✓ Handle duplicate event

Security
✓ Verify webhook signature
✓ Reject unauthorized request
```

Only after these pass should the restaurant integration be eligible for production activation.

---

# 7.31 Production Activation

Once certification passes:

```text
Sandbox
   ↓
Certification Passed
   ↓
Production Credentials
   ↓
Production Webhook
   ↓
Production Test
   ↓
Live
```

Production credentials should be separate from sandbox credentials.

---

# 7.32 Changelog

The documentation needs a permanent changelog.

It should describe:

```text
API additions
New capabilities
New events
New fields
Deprecated functionality
Breaking changes
Security changes
Migration requirements
```

Each change should indicate:

```text
Version
Release date
Affected resources
Impact
Required action
```

---

# 7.33 Deprecation System

NEXG should never silently remove an API capability.

The process should be:

```text
Active
  ↓
Deprecated
  ↓
Migration Period
  ↓
Sunset
```

Documentation should clearly show:

```text
Deprecated
Replacement: /v2/...
Sunset date: ...
Migration guide: ...
```

---

# 7.34 Documentation Source of Truth

The most important architectural rule for the documentation system is:

> **The API contract, event contract and documentation must come from the same authoritative definitions.**

We should avoid:

```text
Developer writes API
Developer writes separate documentation
Developer writes separate OpenAPI
```

because they eventually diverge.

Instead:

```text
NEXG API Contract
       │
       ├── API validation
       ├── OpenAPI
       ├── API Reference
       ├── SDK generation
       ├── Examples
       └── Documentation
```

---

# 7.35 Documentation Metadata

Every capability should have metadata such as:

```text
Capability ID
Name
Description
Applicable Categories
Applicable Subcategories
Required Scopes
Resources
Actions
Events
Required Workflows
Documentation Status
API Version
```

This allows NEXG to generate targeted documentation.

---

# 7.36 Taxonomy → Documentation

This is the major architectural connection.

The NEXG taxonomy:

```text
Restaurants & Food
        ↓
Restaurant
        ↓
Capability Profile
        ↓
Orders
Catalog
Inventory
Fulfillment
Delivery
Events
        ↓
Documentation
```

while:

```text
Vehicle Rentals
        ↓
Car Rental
        ↓
Capability Profile
        ↓
Vehicles
Availability
Bookings
Payments
Fulfillment
Events
        ↓
Documentation
```

The documentation is therefore **derived from NEXG's operating model**.

The taxonomy isn't simply a navigation menu.

---

# 7.37 Documentation Must Not Hide the Core API

Dynamic documentation should personalize the experience, but the underlying API must remain transparent.

A developer should always be able to access:

```text
All API Resources
All Event Types
All Authentication Rules
All Common Concepts
```

subject to authorization.

Personalization improves usability; it should not create a mysterious API.

---

# 7.38 Documentation Layers

NEXG should ultimately have four documentation layers.

### Layer 1 — Discover

```text
What can NEXG do?
```

### Layer 2 — Understand

```text
How does NEXG work?
```

### Layer 3 — Build

```text
How do I integrate?
```

### Layer 4 — Operate

```text
How do I monitor and maintain my integration?
```

This gives us:

```text
Discover
   ↓
Understand
   ↓
Build
   ↓
Operate
```

---

# 7.39 Complete NEXG Developer Journey

The final experience should feel like this:

```text
Merchant IT Admin
       ↓
NEXG Developer Portal
       ↓
Create Integration
       ↓
Select Environment
       ↓
View Capabilities
       ↓
Read Getting Started
       ↓
Authenticate
       ↓
Run First API Call
       ↓
Synchronize Data
       ↓
Configure Webhooks
       ↓
Implement Workflows
       ↓
Test
       ↓
Certification
       ↓
Production
       ↓
Monitor
```

---

# 7.40 Phase 7 Final Architecture

The documentation system now sits on top of everything we've designed:

```text
                    NEXG TAXONOMY
               21 Categories / 134 Subcategories
                            │
                            ▼
                    CAPABILITY MODEL
                            │
                            ▼
                    CANONICAL ENTITIES
                            │
                            ▼
                    WORKFLOW MODEL
                            │
                            ▼
                     API CONTRACT
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
          API REFERENCE            EVENT CONTRACT
                │                       │
                └───────────┬───────────┘
                            ▼
                  DEVELOPER PORTAL
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
      GUIDES             API DOCS           WEBHOOKS
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                   INTEGRATION TESTING
                            │
                            ▼
                       CERTIFICATION
                            │
                            ▼
                        PRODUCTION
```

## Phase 7 establishes the actual documentation system

NEXG will therefore not have a documentation website that is simply:

> **API Reference → Endpoint List**

It becomes:

> **Merchant → Capabilities → Workflows → Implementation Guides → API Contract → Events → Testing → Certification → Production.**

That is the structure an actual merchant IT team can use.

---

# Phase 8

The next phase should now be **NEXG Integration Security, Identity, Credentials & Trust Model**.

That phase should define, concretely:

```text
Merchant identity
      ↓
Organization
      ↓
Users
      ↓
Developer roles
      ↓
Integrations
      ↓
Credentials
      ↓
OAuth / service authentication
      ↓
Scopes
      ↓
Secrets
      ↓
Webhook signing
      ↓
IP/network controls
      ↓
Audit logs
      ↓
Credential rotation
      ↓
Revocation
      ↓
Incident response
```

This is the layer that makes the API and merchant developer platform **safe enough for real production integrations**, particularly once NEXG handles orders, customer information, payments, inventory, bookings and operational data.

## Prompt:
8/7/2026, 10:11:14 AM

Phase 8

## Response:
8/7/2026, 10:11:15 AM

Yes. **Phase 8 is the trust layer.** We now define how NEXG knows **who a merchant is, which system is connecting, what that system is allowed to do, how credentials are protected, and how every sensitive integration action is traceable.**

# Phase 8 — NEXG Integration Security, Identity, Credentials & Trust Model

Phase 8 sits between the merchant organization and the APIs we defined in Phase 6.

The model becomes:

```text
Merchant Organization
        ↓
Merchant Users
        ↓
Developer / IT Team
        ↓
Integration
        ↓
Credentials
        ↓
Authentication
        ↓
Scopes & Permissions
        ↓
NEXG API
        ↓
Audit + Monitoring
```

The objective is not simply to "add authentication."

It is to create a **complete trust model for merchant-to-NEXG communication.**

---

# 8.1 Security Model

NEXG should use a layered model:

```text
Identity
   ↓
Authentication
   ↓
Authorization
   ↓
Credential Security
   ↓
Request Security
   ↓
Data Security
   ↓
Auditability
   ↓
Monitoring
   ↓
Incident Response
```

A request should only succeed when all relevant layers permit it.

---

# 8.2 Merchant Organization Identity

The first trusted object is the merchant organization.

NEXG already has the merchant concept:

```text
merchantId
MRC-20260807-00001
```

The security system associates the merchant with:

```text
Merchant
├── Organization
├── Locations
├── Users
├── Integrations
├── Capabilities
├── Credentials
├── Webhooks
└── Audit Records
```

This establishes the tenant boundary.

---

# 8.3 Multi-Tenant Isolation

A merchant integration must never be able to access another merchant's resources.

If:

```text
Merchant A
MRC-001
```

requests:

```text
GET /v1/orders/ORD-001
```

NEXG must verify that:

```text
ORD-001
        ↓
belongs to Merchant A
```

before returning the resource.

The API must not rely on the merchant simply supplying:

```text
merchantId=MRC-001
```

in a request.

Tenant ownership must be established server-side from the authenticated integration.

---

# 8.4 Organization → Integration

The merchant organization can create one or more integrations.

```text
Merchant
│
├── POS Integration
├── ERP Integration
├── Booking System Integration
└── Custom Integration
```

Each integration receives its own identity.

This is extremely important.

NEXG should not give an entire merchant organization one permanent API key that every system shares.

---

# 8.5 Integration Identity

An integration receives an identifier:

```text
integrationId
INT-20260807-00001
```

Its record contains:

```text
Integration
├── integrationId
├── merchantId
├── name
├── environment
├── status
├── capabilities
├── scopes
├── credentials
├── webhook endpoints
├── createdAt
└── lastUsedAt
```

The integration becomes the principal that calls the API.

---

# 8.6 Environments

Every integration should distinguish:

```text
Sandbox
Production
```

Credentials are never shared between them.

Therefore:

```text
Sandbox Integration
INT-SBX-001
      ↓
Sandbox credentials
      ↓
Sandbox API
```

and:

```text
Production Integration
INT-PRD-001
      ↓
Production credentials
      ↓
Production API
```

A sandbox credential must never authenticate against production.

---

# 8.7 Human Identity vs System Identity

NEXG should distinguish two fundamentally different identities.

### Human

```text
Merchant Administrator
Developer
Operations Manager
Finance User
```

### Machine

```text
POS Integration
Booking System
ERP Integration
Custom Application
```

Humans authenticate as users.

Systems authenticate as integrations.

This prevents employees from having to share personal credentials with software systems.

---

# 8.8 Merchant User Roles

Merchant users can have roles such as:

```text
Owner
Administrator
Developer
Operations
Finance
Viewer
```

The exact role catalogue can evolve.

The important principle is:

> **A merchant user's access to the developer platform does not automatically become API access for their software.**

---

# 8.9 Developer Role

The Developer role should allow appropriate technical operations such as:

```text
View integration configuration
Create sandbox credentials
View API documentation
Configure sandbox webhooks
View integration logs
Run tests
```

Production credential management should require stronger authorization.

---

# 8.10 Production Credential Controls

Production credentials should require elevated authorization.

The flow should be:

```text
Developer requests production credentials
              ↓
Merchant Administrator approval
              ↓
NEXG security checks
              ↓
Credential issued
```

This prevents someone who merely has developer documentation access from immediately obtaining production access.

---

# 8.11 Authentication Strategy

NEXG should support machine-to-machine authentication appropriate for server integrations.

The primary model should be:

```text
Integration
    ↓
Client credentials
    ↓
Authentication server
    ↓
Access token
    ↓
NEXG API
```

The API receives:

```text
Authorization: Bearer <access_token>
```

The token represents the integration rather than a human employee.

---

# 8.12 Access Tokens

Access tokens should be:

- short-lived
- scoped
- environment-specific
- revocable
- auditable

A token should not contain unnecessary sensitive information.

The API validates:

```text
Token
 ↓
Valid?
 ↓
Not expired?
 ↓
Correct environment?
 ↓
Correct integration?
 ↓
Required scope?
 ↓
Resource belongs to merchant?
```

Only then is the operation executed.

---

# 8.13 Refresh Credentials

If long-lived access requires renewal, the authentication architecture should support secure token renewal without requiring merchants to embed permanent secrets in every request.

The exact token strategy can be finalized during implementation, but the fundamental rule remains:

> **Long-lived secrets should be used to obtain short-lived access, not sent with every API request.**

---

# 8.14 API Scopes

Scopes provide the permission boundary.

Examples:

```text
catalog:read
catalog:write

inventory:read
inventory:write

orders:read
orders:write

bookings:read
bookings:write

payments:read
payments:write

fulfillment:read
fulfillment:write

events:read
```

A POS system that only needs to receive orders should not automatically receive payment-refund permissions.

---

# 8.15 Capability + Scope

The final authorization model should combine:

```text
Merchant Capability
+
Integration Permission
+
API Scope
+
Resource Ownership
```

For instance:

```text
Restaurant merchant
       ↓
Orders capability enabled
       ↓
Integration has orders:read
       ↓
Token contains orders:read
       ↓
Request targets merchant's order
       ↓
ALLOW
```

If any required condition fails:

```text
DENY
```

---

# 8.16 Least Privilege

NEXG integrations should receive the minimum permissions required.

A restaurant POS might need:

```text
catalog:read
inventory:read
orders:read
orders:write
events:read
```

It does not automatically need:

```text
payments:refund
merchant:admin
credentials:manage
```

This limits the impact of compromised integrations.

---

# 8.17 Credential Types

NEXG should distinguish:

```text
Application Credentials
Access Tokens
Webhook Secrets
Signing Keys
API Keys where specifically required
```

Each credential type has a different purpose.

We should avoid creating one universal "NEXG key."

---

# 8.18 Secret Display Policy

A production secret should be displayed in full only when initially generated.

After that:

```text
••••••••••••••••••
```

The merchant can:

```text
Rotate
Revoke
Create replacement
```

but cannot retrieve the original plaintext secret from NEXG.

---

# 8.19 Credential Rotation

The merchant should be able to rotate credentials without unnecessary downtime.

The process:

```text
Existing Credential
       │
       ├───────────────┐
       ↓               │
Create New Credential  │
       ↓               │
Merchant Updates System│
       ↓               │
Test New Credential    │
       ↓               │
Revoke Old Credential ─┘
```

This supports controlled migration.

---

# 8.20 Emergency Revocation

If a merchant believes credentials were compromised:

```text
Compromise detected
       ↓
Revoke credential
       ↓
Tokens invalidated
       ↓
Webhook secrets rotated if necessary
       ↓
Review audit logs
       ↓
Investigate requests
       ↓
Issue replacement credentials
```

Revocation should be available immediately.

---

# 8.21 Webhook Trust

NEXG must also authenticate **NEXG → Merchant** communication.

The merchant should not trust a webhook simply because it came from an IP address.

Each webhook should contain a cryptographic signature.

Conceptually:

```text
Event payload
      +
Timestamp
      +
Webhook secret
      ↓
Signature
```

The merchant independently calculates the expected signature and compares it with the received signature.

---

# 8.22 Replay Protection

Webhook requests should include a timestamp.

The merchant verifies:

```text
Current time
      -
Webhook timestamp
```

against an acceptable tolerance.

This prevents an attacker from capturing a legitimate webhook and replaying it much later.

---

# 8.23 Webhook Idempotency

Every webhook has an immutable event ID:

```text
EVT-20260807-00001
```

The merchant should store processed event IDs.

If NEXG sends:

```text
EVT-20260807-00001
```

twice:

```text
First → Process
Second → Recognize duplicate → Do not repeat business action
```

NEXG documentation will explicitly require this behavior.

---

# 8.24 Request Signing

For higher-risk integrations or specific future capabilities, NEXG can support request signing.

The conceptual model:

```text
Request
   +
Timestamp
   +
Nonce
   +
Secret/private key
   ↓
Signature
```

This can provide an additional integrity layer beyond bearer authentication.

It should be introduced where the risk and operational requirements justify it rather than being mandatory for every basic API integration.

---

# 8.25 TLS

All production API and webhook communication must use encrypted transport.

```text
Merchant System
      ⇅
HTTPS/TLS
      ⇅
NEXG
```

Plain HTTP should never be accepted for production credentials or sensitive API operations.

---

# 8.26 Data Encryption

NEXG should distinguish:

### Encryption in transit

```text
Merchant ↔ NEXG
```

### Encryption at rest

```text
NEXG databases
Object storage
Backups
Credential stores
```

Sensitive secrets should receive stronger protection than ordinary business records.

---

# 8.27 Secrets Management

NEXG infrastructure should never store production secrets directly in source code.

Avoid:

```text
API_KEY="..."
DB_PASSWORD="..."
WEBHOOK_SECRET="..."
```

inside repositories.

Instead:

```text
Application
    ↓
Secrets Manager
    ↓
Secret
```

Applications receive secrets through controlled runtime access.

---

# 8.28 Credential Hashing

Where NEXG only needs to verify a secret rather than retrieve it, the system should store a secure derived representation rather than plaintext.

For credentials that must later be used by NEXG to authenticate to another system, encrypted storage is required because the original secret must be recoverable for that operational purpose.

This distinction should be explicitly documented internally.

---

# 8.29 Audit Logging

Security-sensitive actions must generate audit records.

Examples:

```text
Integration created
Credential created
Credential rotated
Credential revoked
Scope changed
Webhook created
Webhook deleted
Production access approved
Production access revoked
API authentication failure
Permission denied
```

Each audit event should include:

```text
actor
actorType
merchantId
integrationId
action
resource
timestamp
requestId
result
source
```

---

# 8.30 API Request Logging

NEXG should maintain operational request logs without storing unnecessary sensitive payload data.

A request record can contain:

```text
requestId
integrationId
merchantId
endpoint
HTTP method
timestamp
response status
latency
error code
```

Sensitive authorization headers and secrets must never appear in ordinary logs.

---

# 8.31 Audit vs Operational Logs

These must remain conceptually separate.

### Audit log

Answers:

> Who changed security or configuration?

### API log

Answers:

> What request happened?

### Webhook log

Answers:

> What event did NEXG attempt to deliver?

### Application log

Answers:

> What happened inside the service?

This separation becomes important for investigations.

---

# 8.32 Request Correlation

Every request should have a unique request ID.

```text
Merchant
   ↓
X-Request-ID
   ↓
NEXG API
   ↓
Internal services
   ↓
Database / event system
```

The same correlation identifier can be connected to:

```text
API request
Business event
Webhook
Audit record
Error
```

This allows an integration engineer to trace a transaction across the platform.

---

# 8.33 Security Event Monitoring

NEXG should detect patterns such as:

```text
Repeated authentication failures
Unusual request volume
Rapid credential usage changes
Repeated permission failures
Unexpected geographic access
Abnormal webhook behavior
Large numbers of failed mutations
```

The system should distinguish ordinary integration failures from potential security incidents.

---

# 8.34 Rate Limiting

Rate limits protect both NEXG and merchant systems.

The limits should be applied according to:

```text
Merchant
Integration
Credential
Endpoint class
Environment
```

A merchant should receive clear responses when limits are exceeded.

```text
HTTP 429
```

with information allowing the client to retry appropriately.

---

# 8.35 Sensitive API Operations

Some operations should have stronger controls.

Examples:

```text
Refund payment
Rotate production credentials
Change webhook secret
Change integration scopes
Modify financial configuration
Delete critical resources
```

These can require:

```text
Elevated scope
Administrator approval
Recent authentication
Additional confirmation
```

depending on the operation.

---

# 8.36 Merchant Administrator Approval

For high-risk integration changes:

```text
Developer
   ↓
Requests permission
   ↓
Merchant Administrator
   ↓
Approves
   ↓
NEXG activates permission
```

The approval itself becomes an audit event.

---

# 8.37 Integration Status

Each integration should have a lifecycle:

```text
Created
   ↓
Configured
   ↓
Sandbox
   ↓
Certification
   ↓
Production
   ↓
Suspended
   ↓
Revoked
```

A revoked integration cannot authenticate.

A suspended integration can be temporarily blocked without destroying its configuration.

---

# 8.38 Security Boundaries

NEXG should maintain explicit boundaries:

```text
Merchant A
──────────────
Users
Integrations
Resources
Credentials
Events
Audit
```

separate from:

```text
Merchant B
──────────────
Users
Integrations
Resources
Credentials
Events
Audit
```

Cross-merchant access must require privileged internal authorization, not ordinary merchant API access.

---

# 8.39 Internal NEXG Access

NEXG employees and internal services should not automatically have unrestricted merchant access.

Internal access should also be:

```text
Authenticated
Authorized
Scoped
Audited
Time-bound where appropriate
```

This is particularly important for production support.

---

# 8.40 Break-Glass Access

For exceptional incidents, NEXG can maintain a controlled emergency access mechanism.

```text
Incident
   ↓
Authorized emergency access
   ↓
Time-limited privilege
   ↓
Every action audited
   ↓
Access automatically expires
```

This should be reserved for genuine operational or security incidents.

---

# 8.41 Data Minimization

Merchant integrations should receive only the data required for their capability.

A POS integration does not need unrelated:

```text
Customer private information
Internal NEXG operational metadata
Other merchant information
Unrelated financial records
```

The API response itself should therefore respect data minimization.

---

# 8.42 PII Protection

Where customer information is involved, NEXG should classify the fields.

Potential categories:

```text
Public
Business
Operational
Personal
Sensitive
Financial
Security-sensitive
```

The API and logs should treat each category appropriately.

Sensitive information should not accidentally appear in:

```text
application logs
error messages
analytics
webhook logs
support screenshots
```

---

# 8.43 Data Retention

NEXG needs defined retention policies for:

```text
API logs
Audit logs
Webhook logs
Security events
Credentials
Events
Integration data
Backups
```

The exact retention periods become an operational/compliance decision, but the system must have explicit policies rather than indefinite retention by default.

---

# 8.44 Integration Security Documentation

The developer portal should expose the security contract clearly.

```text
Authentication
Scopes
Credential management
Webhook signatures
Replay protection
Idempotency
Rate limits
Data handling
Error handling
Security recommendations
Production requirements
```

A developer should know exactly what security behavior NEXG expects from their system.

---

# 8.45 Merchant Security Checklist

Before production:

```text
□ Production credentials stored securely
□ No secrets committed to source control
□ TLS enabled
□ Token handling implemented securely
□ Required scopes verified
□ Webhook signatures verified
□ Replay protection implemented
□ Event deduplication implemented
□ Idempotency implemented
□ 429 handling implemented
□ Credential rotation procedure documented
□ Credential revocation procedure documented
□ Sensitive data protected in logs
□ Error responses handled safely
```

---

# 8.46 Security Certification

Security certification becomes part of integration certification.

The merchant must demonstrate:

```text
Authentication
        ↓
Authorization
        ↓
Webhook verification
        ↓
Replay protection
        ↓
Idempotency
        ↓
Error handling
        ↓
Secret protection
```

This gives NEXG a measurable production-readiness standard.

---

# 8.47 Security Incident Flow

If an integration is compromised:

```text
Detection
   ↓
Containment
   ↓
Credential Revocation
   ↓
Integration Suspension
   ↓
Audit Investigation
   ↓
Impact Assessment
   ↓
Merchant Notification
   ↓
Credential Rotation
   ↓
Recovery
   ↓
Post-Incident Review
```

The exact response process should be maintained internally as a formal security runbook.

---

# 8.48 Trust Model

The final NEXG trust decision becomes:

```text
                 REQUEST
                    │
                    ▼
             Is integration valid?
                    │
                    ▼
              Is token valid?
                    │
                    ▼
             Is token unexpired?
                    │
                    ▼
            Does scope permit it?
                    │
                    ▼
       Does merchant own resource?
                    │
                    ▼
          Is capability enabled?
                    │
                    ▼
        Does workflow permit action?
                    │
                    ▼
                 ALLOW
```

Any failed security condition results in:

```text
DENY
```

with an appropriate machine-readable error.

---

# 8.49 The Complete NEXG Security Architecture

We now have:

```text
                       NEXG TRUST MODEL
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
          HUMAN            MACHINE           DATA
          IDENTITY          IDENTITY          SECURITY
             │                │                │
          Users          Integrations       Encryption
          Roles          Credentials        Minimization
          MFA            Tokens             Retention
             │                │
             └────────┬───────┘
                      ▼
                AUTHORIZATION
                      │
             ┌────────┼────────┐
             ▼        ▼        ▼
         Scopes   Capability  Tenant
                   Access     Boundary
             │        │        │
             └────────┼────────┘
                      ▼
                   API
                      │
             ┌────────┴────────┐
             ▼                 ▼
          Webhooks           Events
             │                 │
        Signatures         Audit Trail
        Replay Protection      │
        Idempotency             │
             └────────┬─────────┘
                      ▼
                MONITORING
                      │
                      ▼
              INCIDENT RESPONSE
```

---

# 8.50 Phase 8 Deliverable

At the end of Phase 8, NEXG has defined the security architecture around the merchant integration platform:

**Identity**

- Merchant organization
- Merchant users
- Integration identities
- Human vs machine identity
- Tenant boundaries

**Authentication**

- Machine authentication
- Access tokens
- Environment separation
- Credential lifecycle

**Authorization**

- Roles
- Scopes
- Capabilities
- Resource ownership
- Least privilege

**Credential security**

- Secret storage
- Rotation
- Revocation
- Production approval

**Webhook security**

- Signatures
- Timestamps
- Replay protection
- Event IDs
- Idempotency

**Operational security**

- Audit logs
- Request tracing
- Rate limiting
- Security monitoring
- Incident response

**Data security**

- Encryption
- Data minimization
- PII protection
- Retention
- Sensitive logging controls

**Production trust**

```text
Merchant
   ↓
Identity
   ↓
Integration
   ↓
Credential
   ↓
Token
   ↓
Scope
   ↓
Capability
   ↓
Resource ownership
   ↓
Workflow authorization
   ↓
NEXG API
```

That gives NEXG a proper **merchant-to-platform trust architecture**, rather than simply putting an API key in front of the endpoints.

---

## Phase 9

The next logical phase is **NEXG Integration Lifecycle & Operations**.

That will define what happens **after a merchant connects**:

```text
Integration Created
        ↓
Configured
        ↓
Sandbox
        ↓
Testing
        ↓
Certification
        ↓
Production
        ↓
Monitoring
        ↓
Version Changes
        ↓
Credential Rotation
        ↓
Capability Changes
        ↓
Suspension
        ↓
Recovery
        ↓
Deactivation
```

It will also define **who does what on the NEXG side and merchant side**, integration health, reconciliation, failure recovery, support escalation, SLAs, maintenance, migrations, version upgrades, and the complete lifecycle of a merchant's technical integration.

## Prompt:
8/7/2026, 10:13:52 AM

Phase 9

## Response:
8/7/2026, 10:13:53 AM

# Phase 9 — NEXG Integration Lifecycle, Operations & Reliability

Phase 9 defines **what happens to a merchant integration throughout its entire operational life**.

Phase 8 established trust:

> **Who is connecting, how are they authenticated, and what are they allowed to do?**

Phase 9 establishes operations:

> **How is the integration created, tested, launched, monitored, changed, recovered, suspended, and eventually retired?**

The complete lifecycle becomes:

```text
Design
  ↓
Create
  ↓
Configure
  ↓
Sandbox
  ↓
Build
  ↓
Test
  ↓
Certify
  ↓
Production
  ↓
Monitor
  ↓
Maintain
  ↓
Change / Upgrade
  ↓
Recover when necessary
  ↓
Suspend / Deactivate
```

---

# 9.1 Integration Lifecycle Model

Every NEXG integration should have an explicit lifecycle state.

```text
DRAFT
  ↓
CONFIGURED
  ↓
SANDBOX
  ↓
CERTIFICATION
  ↓
APPROVED
  ↓
PRODUCTION
```

Operational states can then branch:

```text
PRODUCTION
   ├── HEALTHY
   ├── DEGRADED
   ├── SUSPENDED
   └── RECOVERY
```

And eventually:

```text
PRODUCTION
     ↓
DEACTIVATED
     ↓
ARCHIVED
```

The state should never be inferred from scattered database fields.

There should be one canonical integration lifecycle.

---

# 9.2 Integration Record

The integration record becomes the operational anchor.

```text
integrationId
merchantId
name
type
environment
status
version
capabilities
scopes
createdAt
activatedAt
lastActivityAt
lastHealthyAt
suspendedAt
deactivatedAt
```

It should also maintain operational metadata:

```text
healthStatus
lastSuccessfulRequest
lastFailedRequest
errorRate
webhookDeliveryStatus
certificationStatus
```

---

# 9.3 Integration Types

NEXG should recognize the system being connected.

```text
POS
ERP
Inventory System
Booking System
Fleet System
Accounting System
CRM
Custom Application
```

The type affects:

- available capabilities
- recommended integration guides
- certification tests
- monitoring
- operational expectations

---

# 9.4 Capability Activation

A merchant does not necessarily activate every capability at once.

The integration can progress incrementally.

For a restaurant:

```text
Catalog
   ↓
Inventory
   ↓
Orders
   ↓
Fulfillment
   ↓
Delivery
```

The integration record should know exactly which capabilities are active.

```text
capabilities:
[
  catalog,
  inventory,
  orders,
  fulfillment
]
```

This becomes important when the merchant expands.

---

# 9.5 Adding a Capability

Suppose a restaurant initially integrates only:

```text
Catalog
Orders
```

Later it wants:

```text
Inventory
```

The process becomes:

```text
Request capability
       ↓
Eligibility check
       ↓
Permissions
       ↓
Developer configuration
       ↓
Sandbox testing
       ↓
Certification
       ↓
Production activation
```

Adding functionality therefore does not require rebuilding the entire integration.

---

# 9.6 Removing a Capability

Capability removal should also be controlled.

```text
Active
  ↓
Removal Requested
  ↓
Impact Assessment
  ↓
Merchant Confirmation
  ↓
Capability Disabled
```

NEXG should verify that removing the capability will not leave dependent workflows in an invalid state.

---

# 9.7 Sandbox Lifecycle

Sandbox is not just an API endpoint.

It is a complete development environment.

```text
Sandbox
├── Test Merchant
├── Test Locations
├── Test Catalog
├── Test Inventory
├── Test Orders
├── Test Bookings
├── Test Events
└── Test Webhooks
```

The merchant can build and test without affecting production.

---

# 9.8 Test Data

NEXG should provide deterministic test scenarios.

For orders:

```text
ORDER_CREATED
ORDER_CONFIRMED
ORDER_PREPARING
ORDER_READY
ORDER_COMPLETED
ORDER_CANCELLED
```

For bookings:

```text
BOOKING_CREATED
BOOKING_CONFIRMED
BOOKING_MODIFIED
BOOKING_CANCELLED
BOOKING_COMPLETED
```

This lets merchant IT teams test every important state transition.

---

# 9.9 Test Mode

NEXG should allow developers to deliberately trigger specific sandbox scenarios.

The documentation can expose:

```text
Trigger order.created
Trigger order.cancelled
Trigger booking.confirmed
Trigger payment.failed
Trigger webhook.retry
```

The purpose is to verify that the merchant's system handles actual NEXG workflows rather than only successful cases.

---

# 9.10 Certification Lifecycle

Certification becomes a formal state.

```text
Sandbox
   ↓
Certification Requested
   ↓
Automated Tests
   ↓
Workflow Tests
   ↓
Security Tests
   ↓
Results
```

The integration receives:

```text
Certification
Status: PASSED
Version: 1.0
Certified capabilities:
Orders
Catalog
Inventory
```

---

# 9.11 Certification Versions

Certification must be associated with an integration version.

```text
Integration Version 1.0
Certification 1.0
```

If the merchant makes a material integration change:

```text
Version 1.1
```

NEXG can determine whether recertification is required.

---

# 9.12 Production Activation

Production activation should require:

```text
Certification passed
+
Required permissions
+
Production credentials
+
Webhook configured
+
Security requirements satisfied
```

Then:

```text
Sandbox
   ↓
Approved
   ↓
Production Activation
```

The activation event must be audited.

---

# 9.13 Production Readiness

The developer portal should show:

```text
Production Readiness
──────────────────────

Authentication       ✓
Permissions          ✓
Webhooks             ✓
Idempotency          ✓
Error Handling       ✓
Security             ✓
Certification        ✓
Production Config    ✓

READY FOR PRODUCTION
```

This gives the merchant IT team a concrete launch gate.

---

# 9.14 Production Monitoring

Once live, NEXG must continuously evaluate the integration.

Monitor:

```text
API availability
API latency
Error rate
Authentication failures
Webhook success rate
Webhook latency
Event processing
Rate-limit usage
Integration activity
```

The merchant should not need to discover an outage from customer complaints.

---

# 9.15 Integration Health

Each integration gets a health state:

```text
HEALTHY
DEGRADED
FAILING
SUSPENDED
UNKNOWN
```

The health engine evaluates actual signals.

Example:

```text
API requests
✓

Webhook delivery
✓

Authentication
✓

Error rate
Low

Health
HEALTHY
```

---

# 9.16 Health Is Not the Same as Availability

An API can be available while an individual merchant integration is unhealthy.

Suppose NEXG is operational:

```text
NEXG API
HEALTHY
```

but a merchant's webhook endpoint is returning:

```text
HTTP 500
```

The platform is healthy.

The integration is:

```text
DEGRADED
```

NEXG therefore needs both:

```text
Platform Health
Integration Health
```

---

# 9.17 Integration Health Signals

Health should incorporate:

```text
Successful API requests
Failed API requests
Latency
Authentication failures
Webhook delivery
Webhook response codes
Event processing
Rate limits
Recent activity
```

The system can derive a health state from these signals.

---

# 9.18 Webhook Operations

Webhook delivery becomes an operational subsystem.

```text
Event generated
       ↓
Delivery attempt
       ↓
Merchant response
       ↓
Success?
   ┌───┴───┐
  YES      NO
   ↓        ↓
Complete   Retry
```

---

# 9.19 Webhook Retry

Retries should use controlled backoff.

```text
Attempt 1
   ↓
Attempt 2
   ↓
Attempt 3
   ↓
Attempt 4
   ↓
Final attempt
```

The exact retry schedule becomes an NEXG operational configuration.

The merchant should be able to see the attempts.

---

# 9.20 Dead-Letter Events

If an event cannot be delivered after the defined retry policy:

```text
Failed Event
     ↓
Retry Exhausted
     ↓
Dead-Letter State
```

The event should remain recoverable.

NEXG must not simply discard it.

---

# 9.21 Event Recovery

Merchant developers should be able to:

```text
View failed event
Inspect error
Correct integration
Retry delivery
```

This is essential for operational resilience.

---

# 9.22 Reconciliation

Webhooks alone cannot guarantee that two systems remain synchronized forever.

NEXG therefore needs reconciliation capabilities.

For orders:

```text
NEXG Orders
      ↕
Merchant Orders
```

The merchant should periodically be able to compare:

```text
NEXG Order ID
Merchant Order ID
Status
Amount
Updated timestamp
```

Discrepancies become reconciliation records.

---

# 9.23 Reconciliation Example

NEXG:

```text
Order
ORD-20260807-00001
Status: COMPLETED
Amount: KES 2,450
```

Merchant POS:

```text
POS-88291
Status: PREPARING
Amount: KES 2,450
```

The reconciliation engine identifies:

```text
STATUS_MISMATCH
```

The integration team can investigate instead of discovering the discrepancy manually.

---

# 9.24 Idempotent Recovery

Recovery operations must not create duplicate business actions.

If an event is retried:

```text
eventId = EVT-001
```

and the merchant already processed it:

```text
EVT-001 → Already processed
```

The merchant should acknowledge it without repeating the underlying action.

---

# 9.25 Incident Classification

NEXG should classify integration incidents.

```text
P1 — Critical
P2 — High
P3 — Moderate
P4 — Low
```

### P1

Integration cannot perform essential production operations.

### P2

Major capability is significantly degraded.

### P3

Limited functionality is affected.

### P4

Minor issue or informational problem.

This gives support teams consistent escalation criteria.

---

# 9.26 Merchant Support Escalation

The operational path becomes:

```text
Merchant Developer
       ↓
Documentation
       ↓
Integration Logs
       ↓
Troubleshooting
       ↓
Support
       ↓
Engineering
       ↓
Security / Infrastructure
```

The developer should be able to attach:

```text
merchantId
integrationId
requestId
eventId
timestamp
error code
```

to a support case.

This makes investigation much faster.

---

# 9.27 NEXG Status

There should be a platform-level status mechanism.

```text
NEXG API
Operational

Orders
Operational

Bookings
Operational

Webhooks
Degraded

Payments
Operational
```

The merchant should be able to distinguish:

```text
NEXG problem
```

from:

```text
Merchant integration problem
```

---

# 9.28 Planned Maintenance

NEXG should communicate planned maintenance.

```text
Maintenance
Date
Start
Expected duration
Affected services
Merchant action
```

Where possible, maintenance should be designed so integrations do not need to change anything.

---

# 9.29 API Versioning

NEXG needs a formal versioning strategy.

Conceptually:

```text
/v1/
```

then eventually:

```text
/v2/
```

A version should remain stable throughout its supported lifetime.

New functionality should not silently change existing behavior.

---

# 9.30 Backward Compatibility

Non-breaking changes can include:

```text
New optional response fields
New resources
New endpoints
New event types
```

Breaking changes include:

```text
Removing fields
Changing field meaning
Changing required parameters
Changing state behavior
Changing authentication requirements
```

Breaking changes require explicit migration planning.

---

# 9.31 Deprecation Lifecycle

A deprecated API follows:

```text
Active
   ↓
Deprecated
   ↓
Migration Window
   ↓
Sunset
```

Documentation displays the replacement.

Merchants receive notifications before sunset.

---

# 9.32 Integration Versioning

NEXG should distinguish:

```text
API Version
Integration Version
Certification Version
```

These are not necessarily the same thing.

A merchant can update its internal integration implementation without NEXG releasing a new API version.

---

# 9.33 Migration Guides

When a breaking change occurs, NEXG provides:

```text
Current behavior
New behavior
Affected endpoints
Affected events
Required code changes
Testing requirements
Migration deadline
Certification requirements
```

The merchant should know exactly what must change.

---

# 9.34 Credential Lifecycle Operations

Credentials also have an operational lifecycle:

```text
Created
   ↓
Active
   ↓
Rotating
   ↓
Replaced
   ↓
Revoked
```

The integration itself can remain active while credentials are rotated.

---

# 9.35 Integration Suspension

NEXG may need to temporarily suspend an integration.

Possible causes:

```text
Security incident
Repeated abuse
Severe malformed traffic
Merchant request
Contractual issue
Operational risk
```

Suspension should be explicit:

```text
Integration
Status: SUSPENDED
Reason: Security
```

and fully audited.

---

# 9.36 Suspension Behavior

When suspended:

```text
API authentication
DENIED

Webhook delivery
PAUSED or controlled according to event policy

Credentials
RETAINED

Configuration
RETAINED

Audit history
RETAINED
```

The goal is to stop activity without destroying evidence or configuration.

---

# 9.37 Recovery From Suspension

Recovery should be deliberate:

```text
Issue resolved
      ↓
Security / operational review
      ↓
Merchant confirmation where necessary
      ↓
Integration reactivated
      ↓
Health monitoring
```

NEXG should verify that the underlying problem has actually been resolved.

---

# 9.38 Deactivation

When a merchant permanently stops using an integration:

```text
Active
  ↓
Deactivation Requested
  ↓
Impact Review
  ↓
Credentials Revoked
  ↓
Webhooks Disabled
  ↓
Integration Deactivated
```

Historical records remain available according to retention policies.

---

# 9.39 Re-Activation

A deactivated integration should not necessarily require complete reconstruction.

Where appropriate:

```text
Deactivated
      ↓
Reactivate
      ↓
New credentials
      ↓
Configuration validation
      ↓
Production verification
```

The security model determines whether fresh certification is required.

---

# 9.40 Operational Ownership

Every integration needs clear ownership.

```text
Merchant
    └── Integration Owner

NEXG
    ├── Product Owner
    ├── Integration Support
    ├── Engineering
    └── Security
```

This prevents:

> "Nobody knows who is responsible."

---

# 9.41 Merchant Responsibilities

The merchant IT team is responsible for:

```text
Credential security
Webhook endpoint security
Integration implementation
Idempotency
Error handling
Monitoring its own system
Maintaining compatibility
Responding to deprecation notices
Keeping contact information current
```

---

# 9.42 NEXG Responsibilities

NEXG is responsible for:

```text
API availability
Authentication infrastructure
Authorization enforcement
Webhook delivery
API version stability
Documentation
Integration monitoring
Platform security
Incident communication
Deprecation communication
```

This division should become part of the formal integration agreement.

---

# 9.43 Shared Responsibility

Some areas are shared:

```text
Data synchronization
Incident investigation
Credential rotation
Integration upgrades
Reconciliation
Security incidents
```

The documentation should explicitly identify responsibility.

---

# 9.44 Operational Dashboard

The merchant developer portal should eventually show:

```text
Integration
────────────────────────────

Status
● Healthy

Environment
Production

Version
1.2

Capabilities
Orders
Catalog
Inventory
Fulfillment

API
99.98% successful

Webhooks
100% delivered

Last request
10:41:22

Failed requests
2

Open incidents
0

Certification
Passed
```

This is the merchant's operational view of its NEXG connection.

---

# 9.45 Integration Activity

The portal should show recent technical activity:

```text
10:41:22
POST /v1/orders/...
200

10:41:20
order.confirmed
Delivered

10:40:51
GET /v1/inventory/...
200

10:39:17
Webhook
Delivered
```

This makes the integration observable without exposing unnecessary sensitive data.

---

# 9.46 Integration Metrics

NEXG should measure:

```text
Request volume
Success rate
Error rate
P50 latency
P95 latency
P99 latency
Webhook success
Webhook retries
Authentication failures
Rate-limit events
Reconciliation discrepancies
```

These metrics support both NEXG operations and merchant troubleshooting.

---

# 9.47 Reliability Targets

NEXG should eventually establish explicit service targets for:

```text
API availability
API latency
Webhook delivery
Event availability
Support response
Incident communication
```

These targets can become part of merchant contracts and SLAs once NEXG's infrastructure and operating maturity justify them.

---

# 9.48 Integration Runbooks

NEXG internal teams need operational runbooks.

Examples:

```text
API authentication failures
Webhook delivery failure
Merchant integration outage
Credential compromise
Event backlog
Data synchronization failure
Reconciliation mismatch
API degradation
Production rollback
Integration suspension
Integration recovery
```

Each runbook should specify:

```text
Detection
Diagnosis
Containment
Resolution
Verification
Communication
Post-incident action
```

---

# 9.49 Operational Change Management

NEXG changes should pass through:

```text
Change proposed
      ↓
Impact assessment
      ↓
Testing
      ↓
Documentation update
      ↓
Release
      ↓
Monitoring
      ↓
Rollback if necessary
```

This is particularly important for changes affecting:

```text
Orders
Bookings
Payments
Fulfillment
Events
Authentication
```

---

# 9.50 Rollback

Critical changes need a rollback strategy.

```text
Release
  ↓
Unexpected failure
  ↓
Detect
  ↓
Stop rollout
  ↓
Rollback
  ↓
Verify
  ↓
Communicate
```

NEXG should not rely on "fix forward" for every production incident.

---

# 9.51 The Complete Operational Loop

The mature NEXG model becomes:

```text
                 ┌──────────────┐
                 │    CREATE    │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │  CONFIGURE   │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │   SANDBOX    │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │     TEST     │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │  CERTIFY     │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │   PRODUCTION │
                 └──────┬───────┘
                        ↓
              ┌─────────────────────┐
              │      MONITOR        │
              └─────────┬───────────┘
                        ↓
                ┌───────────────┐
                │   MAINTAIN    │
                └───────┬───────┘
                        ↓
              ┌─────────────────────┐
              │ CHANGE / UPGRADE    │
              └─────────┬───────────┘
                        ↓
                 ┌──────────────┐
                 │   RECOVER    │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │ DEACTIVATE   │
                 └──────────────┘
```

And importantly, **monitoring, security and audit operate across the entire lifecycle**, not only after production.

---

# 9.52 Phase 9 Final Architecture

We can now connect Phases 1–9:

```text
PHASE 1
Integration Principles
        ↓
PHASE 2
Domains & Capabilities
        ↓
PHASE 3
Canonical Entities
        ↓
PHASE 4
Workflows & States
        ↓
PHASE 5
Integration Capabilities
        ↓
PHASE 6
API & Event Contracts
        ↓
PHASE 7
Developer Documentation
        ↓
PHASE 8
Identity, Security & Trust
        ↓
PHASE 9
Lifecycle, Operations & Reliability
```

The result is no longer just:

> **"NEXG has an API."**

It is:

> **"NEXG has a complete merchant integration platform."**

A merchant can **discover → connect → authenticate → build → test → certify → launch → monitor → maintain → upgrade → recover → deactivate** its integration through a defined system.

---

## Phase 10

The next phase should be **NEXG Data Synchronization, Catalog, Inventory & State Consistency Architecture**.

This is where we tackle one of the hardest parts of platforms like NEXG:

```text
Merchant System
       ↕
      NEXG
       ↕
Customer App
       ↕
Operations
       ↕
Fulfillment
```

and define exactly **which system owns which data, what is authoritative, how changes propagate, how conflicts are resolved, how inventory stays consistent, how catalogs synchronize, how external IDs map to NEXG IDs, and how we prevent duplicate orders/bookings or stale availability.**

## Prompt:
8/7/2026, 10:15:28 AM

Phase 10

## Response:
8/7/2026, 10:15:29 AM

# Phase 10 — NEXG Data Synchronization, Catalog, Inventory & State Consistency Architecture

Phase 10 defines **how NEXG and a merchant's own systems exchange, synchronize, reconcile and maintain business data without creating conflicting versions of reality.**

This is critical because NEXG will sit between:

```text id="8v6f3s"
Merchant Systems
       ↕
      NEXG
       ↕
Consumer Applications
       ↕
Operations
       ↕
Fulfillment
       ↕
Payments
```

A merchant may already have a POS, ERP, booking system, inventory system, accounting system or custom software.

NEXG therefore cannot assume:

> "NEXG owns everything."

Instead, Phase 10 establishes **ownership, synchronization direction, identity mapping, state authority, conflict resolution and reconciliation.**

---

# 10.1 The Core Principle

Every important piece of data must have a defined:

```text id="m5n9cz"
Owner
Source of Truth
Identifier
Lifecycle
Synchronization Direction
Update Rules
Conflict Rules
```

Without this, integrations eventually produce:

```text id="h9w0g2"
NEXG says AVAILABLE
Merchant says SOLD OUT
Customer sees AVAILABLE
Order gets created
Merchant cannot fulfill
```

Phase 10 exists to prevent this class of failure.

---

# 10.2 NEXG Does Not Automatically Become the Source of Truth

Different domains can have different authoritative systems.

For a restaurant:

```text id="9o5p1m"
Menu
Merchant POS / NEXG

Inventory
Merchant POS

Order
NEXG after creation

Payment
NEXG payment system

Fulfillment
NEXG + merchant operational system
```

For a car rental:

```text id="x7x1a4"
Vehicle master data
Merchant fleet system

Availability
Shared operational state

Booking
NEXG

Vehicle assignment
Merchant fleet system / NEXG workflow

Payment
NEXG
```

The ownership model is therefore **domain-specific**.

---

# 10.3 Data Ownership Matrix

Every NEXG entity should have an ownership designation.

```text id="x1z6j7"
Entity
        ↓
NEXG-owned
Merchant-owned
Shared
Derived
External reference
```

### NEXG-owned

NEXG is authoritative.

### Merchant-owned

The merchant's system is authoritative.

### Shared

Both systems participate in maintaining the state.

### Derived

The value is calculated from other data.

### External reference

NEXG stores a reference to another system's entity.

---

# 10.4 Example Ownership Model

For a restaurant:

| Entity | Primary Authority |
|---|---|
| Merchant profile | NEXG |
| Merchant category | NEXG |
| Location | NEXG |
| Product | Merchant |
| Catalog availability | Shared |
| Price | Merchant |
| Inventory quantity | Merchant |
| Order | NEXG |
| Order fulfillment status | Shared |
| Payment transaction | NEXG |
| Delivery assignment | NEXG |
| Customer account | NEXG |

This becomes part of the formal integration contract.

---

# 10.5 NEXG Canonical Data Model

Merchant systems may use completely different structures.

One POS might use:

```text id="9b5z9p"
item
```

Another:

```text id="6c7g2r"
product
```

Another:

```text id="0c1s6y"
menu_item
```

NEXG should normalize them into its canonical model:

```text id="c3b0qx"
Product
```

The merchant's terminology does not change the NEXG contract.

---

# 10.6 Canonical Entity Layer

The integration architecture becomes:

```text id="x3a6tc"
Merchant System
      ↓
Merchant Adapter
      ↓
Mapping / Transformation
      ↓
NEXG Canonical Model
      ↓
NEXG Services
      ↓
Consumer / Operations Systems
```

This prevents every NEXG service from learning every merchant's data format.

---

# 10.7 External IDs

NEXG must preserve the merchant's identifiers.

Suppose the merchant has:

```text id="0otx47"
POS Product ID
MENU-8831
```

NEXG creates:

```text id="z5g4uj"
NEXG Product ID
PRD-20260807-00031
```

NEXG stores the relationship:

```text id="0d9l9m"
merchantId
productId
externalProductId
externalSystem
```

This mapping is fundamental.

---

# 10.8 Identifier Mapping

The relationship becomes:

```text id="w6v3w5"
Merchant POS
MENU-8831
       ↓
NEXG
PRD-20260807-00031
       ↓
Consumer App
PRD-20260807-00031
```

The merchant can continue using its own identifier internally.

NEXG maintains the canonical identity across the platform.

---

# 10.9 External Reference Object

A reusable reference structure should exist:

```text id="o7d3o8"
externalReference
├── system
├── entityType
├── externalId
├── locationId
└── lastSyncedAt
```

A product can therefore carry:

```text id="y2r1ks"
system: merchant_pos
entityType: product
externalId: MENU-8831
```

This becomes reusable across products, orders, bookings, vehicles and other entities.

---

# 10.10 Synchronization Modes

NEXG should support several synchronization patterns.

### Push

```text id="l8q2zo"
Merchant
   ↓
NEXG
```

### Pull

```text id="y9u3xl"
NEXG
   ↓
Merchant
```

### Event-driven

```text id="j5m6kk"
Merchant
   ↓
Event
   ↓
NEXG
```

### NEXG event

```text id="v4s9rx"
NEXG
   ↓
Webhook
   ↓
Merchant
```

### Reconciliation

```text id="p6j8bn"
Merchant
   ↕
NEXG
```

The integration can combine all five.

---

# 10.11 Synchronization Is Not One-Way

For many entities:

```text id="z8s7c4"
Merchant → NEXG
```

is appropriate.

For others:

```text id="f2x7az"
NEXG → Merchant
```

is appropriate.

For operational state:

```text id="q9x4gk"
Merchant ↔ NEXG
```

may be required.

Each entity therefore needs a declared synchronization contract.

---

# 10.12 Product Synchronization

For a restaurant, the merchant system can publish:

```text id="0m4j5s"
Product
Name
Description
Price
Category
Images
Modifiers
Availability
Tax configuration
External ID
```

NEXG validates and normalizes it.

Then:

```text id="y1n2g3"
Merchant POS
      ↓
NEXG Catalog
      ↓
Consumer App
```

---

# 10.13 Catalog Ownership

NEXG should distinguish:

```text id="9u1m4c"
Product master data
Catalog presentation
Availability
Pricing
Inventory
```

These are related but not identical.

A merchant may own:

```text id="5g5w3p"
Product name
Price
SKU
```

while NEXG controls:

```text id="w0g8f4"
Whether the product is exposed through NEXG
Which locations offer it
Which consumer channels display it
```

---

# 10.14 Category Mapping

Merchant systems will have their own categories.

NEXG has its canonical taxonomy:

```text id="p6p7hc"
Restaurants & Food
   └── Restaurant
```

A merchant's internal category:

```text id="3s7v2n"
"Main Meals"
```

can map to the merchant's catalog structure without replacing NEXG's canonical merchant classification.

This distinction is important:

```text id="1y8w7k"
Merchant Taxonomy
≠
NEXG Merchant Taxonomy
```

The NEXG taxonomy identifies the merchant's business and capabilities.

The merchant's product taxonomy organizes its inventory.

---

# 10.15 Product State

Products need a canonical lifecycle.

```text id="0tw2sl"
DRAFT
  ↓
ACTIVE
  ↓
UNAVAILABLE
  ↓
ARCHIVED
```

NEXG should not confuse:

```text id="d9u2b5"
Product archived
```

with:

```text id="j8f2l3"
Product temporarily unavailable
```

The former is a lifecycle change.

The latter is an operational availability change.

---

# 10.16 Location-Level Availability

A product can be active globally but unavailable at one location.

```text id="m3a9te"
Product
Chicken Burger
Status: ACTIVE

Location A
AVAILABLE

Location B
UNAVAILABLE
```

Therefore availability should not necessarily live only on the product itself.

---

# 10.17 Inventory Model

NEXG should distinguish:

```text id="d1q7x8"
Product
Inventory Item
Inventory Location
Available Quantity
Reserved Quantity
Committed Quantity
```

The basic relationship:

```text id="n0s4qt"
Product
   ↓
Inventory Item
   ↓
Location
   ↓
Quantity
```

---

# 10.18 Inventory States

A useful canonical model:

```text id="b3p4x9"
On Hand
   ↓
Available
   ↓
Reserved
   ↓
Committed
   ↓
Fulfilled
```

The exact transitions depend on the business domain.

---

# 10.19 Restaurant Inventory

Suppose a restaurant has:

```text id="9l4z0p"
Chicken Burger
Available: 12
```

A customer places an order for 2.

NEXG should not immediately treat this as:

```text id="a3d9r2"
Available: 10
```

without defining what happened to the 2 units.

Instead:

```text id="6e7x2a"
On Hand: 12
Available: 10
Reserved: 2
```

Once the order becomes committed:

```text id="t8g2v1"
On Hand: 10
Available: 10
Reserved: 0
```

This prevents overselling.

---

# 10.20 Inventory Reservation

Reservation should be an explicit operation.

```text id="f2w7n8"
Check availability
       ↓
Reserve
       ↓
Order confirmed
       ↓
Commit
```

If the order fails:

```text id="n6u5e0"
Reservation
       ↓
Release
```

---

# 10.21 Reservation Expiry

Reservations should have controlled expiration where the business process requires it.

```text id="5w4b9n"
Reserved
   ↓
Confirmed
```

or:

```text id="y7c2r3"
Reserved
   ↓
Expired
   ↓
Released
```

This prevents inventory from becoming permanently trapped.

---

# 10.22 Inventory Authority

NEXG must know where inventory truth comes from.

If the merchant POS owns inventory:

```text id="u6r4v1"
Merchant POS
      ↓
Inventory Authority
      ↓
NEXG
```

NEXG should not independently overwrite the merchant's inventory quantity unless the integration contract explicitly makes NEXG authoritative.

---

# 10.23 Inventory Events

Important events include:

```text id="3q5v1r"
inventory.updated
inventory.reserved
inventory.committed
inventory.released
inventory.adjusted
inventory.unavailable
```

The event payload should identify:

```text id="2b8f0m"
inventoryId
productId
locationId
quantity
reason
timestamp
eventId
```

---

# 10.24 Order Synchronization

Order synchronization needs stronger consistency rules than catalog synchronization.

The basic flow:

```text id="x2w8j1"
Customer
   ↓
NEXG
   ↓
Order Created
   ↓
Merchant
   ↓
Accept / Reject
   ↓
NEXG
   ↓
Consumer
```

The order should have one canonical NEXG order identity.

---

# 10.25 Order External Mapping

Merchant POS:

```text id="7f8b3m"
Ticket #48391
```

NEXG:

```text id="4p1q6r"
ORD-20260807-00001
```

Mapping:

```text id="q4b5c2"
NEXG Order
ORD-20260807-00001

Merchant Order
48391
```

This relationship must remain immutable.

---

# 10.26 Order State Authority

NEXG should define which system controls each state transition.

A restaurant order could be:

```text id="k8g7z2"
CREATED
   ↓
CONFIRMED
   ↓
PREPARING
   ↓
READY
   ↓
FULFILLED
```

The merchant system may be authoritative for:

```text id="1p3d8r"
PREPARING
READY
```

while NEXG may be authoritative for:

```text id="v6h4j2"
CREATED
FULFILLED
```

The exact authority is defined by the integration contract.

---

# 10.27 State Transitions Are Commands

Systems should not freely overwrite states.

Instead of:

```text id="j0v2o1"
PUT status = READY
```

the API should expose valid operations:

```text id="w8r3y6"
Start Preparation
Mark Ready
Complete Fulfillment
```

The state machine validates whether the transition is legal.

---

# 10.28 Invalid State Protection

If an order is:

```text id="z7q5k1"
CANCELLED
```

and the merchant sends:

```text id="6h4p9x"
Mark Ready
```

NEXG returns:

```text id="u9v2w6"
ORDER_INVALID_STATE
```

The merchant cannot force the database into an impossible state.

---

# 10.29 Booking Synchronization

For:

```text id="v5c2j8"
Vehicle Rentals
Travel & Tours
Experiences
```

availability becomes especially important.

The system must coordinate:

```text id="3y4n6k"
Resource
Availability
Reservation
Booking
Cancellation
Release
```

---

# 10.30 Availability Architecture

Suppose a safari has:

```text id="2x7m4n"
Safari
10 seats
```

A booking requests:

```text id="q5s8k2"
3 seats
```

The system should atomically evaluate:

```text id="e6r1v9"
Available >= requested quantity
```

before confirming the reservation.

---

# 10.31 Concurrency

Two customers could attempt:

```text id="4x2n8c"
Customer A → 6 seats
Customer B → 6 seats
```

when only 10 remain.

The system must not allow:

```text id="n7p3q5"
A = 6
B = 6
Total = 12
```

The consistency mechanism must ensure only one valid allocation wins or both requests are appropriately constrained.

---

# 10.32 Idempotency

All important mutations should support idempotency.

Suppose a merchant sends:

```text id="f1q8k2"
POST /orders
Idempotency-Key: abc123
```

The network fails.

The merchant retries.

NEXG recognizes:

```text id="n3r7v6"
abc123
```

and does not create another order.

Instead it returns the original result.

This is mandatory for unreliable networks and distributed systems.

---

# 10.33 Idempotency Scope

Idempotency keys should have a defined scope.

For instance:

```text id="z7j2m4"
Integration
+
HTTP operation
+
Idempotency key
```

This prevents unrelated requests from accidentally colliding.

---

# 10.34 Event Ordering

Events may arrive:

```text id="0x6k8v"
order.confirmed
order.created
```

because distributed systems can experience delays.

NEXG and merchant integrations therefore should not assume network delivery order is always perfect.

Events need:

```text id="p3w9m1"
eventId
eventType
resourceId
createdAt
sequence/version where applicable
```

---

# 10.35 Resource Versioning

Resources can carry a version:

```text id="s1h4p8"
orderVersion: 7
```

A merchant can use the version to detect stale updates.

This supports optimistic concurrency.

---

# 10.36 Optimistic Concurrency

Suppose NEXG returns:

```text id="3q8v5c"
Order Version: 7
```

The merchant tries to update based on version 7.

But the order has already become:

```text id="4x7p2n"
Version: 8
```

NEXG can reject the stale mutation:

```text id="n8c5r2"
RESOURCE_VERSION_CONFLICT
```

The merchant retrieves the latest state before continuing.

---

# 10.37 Conflict Resolution

Not every conflict should be resolved by "last write wins."

NEXG should define rules based on the entity.

### Product description

Merchant authority wins.

### Order state

State machine wins.

### Payment status

Payment system authority wins.

### Inventory

Inventory authority wins.

### Delivery assignment

Operational workflow authority wins.

The conflict strategy is therefore **domain-specific**.

---

# 10.38 Sync Status

Every synchronized resource can expose:

```text id="c7m2q9"
SYNCED
PENDING
FAILED
CONFLICT
STALE
```

This gives merchant IT teams visibility into synchronization health.

---

# 10.39 Synchronization Record

A synchronization record can contain:

```text id="8f2m6k"
syncId
integrationId
entityType
entityId
externalId
direction
operation
status
attempt
lastAttemptAt
errorCode
completedAt
```

This becomes the operational history of synchronization.

---

# 10.40 Retry Strategy

Transient synchronization failures should retry.

```text id="s4v7p2"
Sync
 ↓
Failure
 ↓
Retry
 ↓
Retry
 ↓
Success
```

Permanent failures should not retry indefinitely.

```text id="r5n8q1"
INVALID_DATA
   ↓
FAILED
   ↓
Requires correction
```

---

# 10.41 Dead-Letter Synchronization

After retries are exhausted:

```text id="m2q7v4"
FAILED
   ↓
Dead Letter
```

The merchant can inspect:

```text id="f7p3n8"
Entity
External ID
Payload validation
Error
Attempts
Last failure
```

and correct the underlying issue.

---

# 10.42 Catalog Reconciliation

NEXG should periodically compare:

```text id="c2z6x8"
Merchant Catalog
        ↕
NEXG Catalog
```

It can identify:

```text id="n8v4m2"
Missing product
Changed price
Changed availability
Duplicate mapping
Stale product
```

---

# 10.43 Inventory Reconciliation

Inventory reconciliation should compare:

```text id="k3m7v9"
Merchant quantity
NEXG quantity
Reservations
Committed quantity
```

A discrepancy becomes:

```text id="g6p2r8"
Inventory discrepancy
```

rather than silently overwriting one system.

---

# 10.44 Order Reconciliation

Order reconciliation should compare:

```text id="j8x5q4"
NEXG order
Merchant order
Payment
Fulfillment
Status
Amount
```

This is particularly important for financial settlement.

---

# 10.45 Payment Consistency

Payment status should not be inferred from order status.

These are separate domains:

```text id="q5r2m8"
Order
   ↕
Payment
   ↕
Settlement
```

An order can be:

```text id="y6t3p9"
CONFIRMED
```

while payment is:

```text id="z8v1k4"
PENDING
```

if the business model permits it.

The integration contract must explicitly define which combinations are valid.

---

# 10.46 Fulfillment Consistency

Similarly:

```text id="n2m7q5"
Order
   ↓
Fulfillment
   ↓
Delivery
```

should not be treated as one giant status field.

NEXG needs distinct state machines where the business domain requires them.

---

# 10.47 Merchant Data Import

When a merchant first connects, NEXG should support controlled onboarding synchronization.

```text id="p7x4m2"
Connect
 ↓
Discover merchant data
 ↓
Validate
 ↓
Map
 ↓
Preview
 ↓
Import
 ↓
Verify
```

The merchant should see what will be created before a large import occurs.

---

# 10.48 Initial Catalog Import

A restaurant might provide:

```text id="z2f6n8"
150 products
18 categories
32 modifiers
4 locations
```

NEXG processes:

```text id="x8m3q5"
150 products
       ↓
Validation
       ↓
Mapping
       ↓
Import
       ↓
150 canonical products
```

Failed records should be isolated rather than causing the entire import to fail unnecessarily.

---

# 10.49 Partial Failure

If:

```text id="v4k8p2"
150 records submitted
```

and:

```text id="m7q3n5"
146 valid
4 invalid
```

NEXG should report:

```text id="a2x6r9"
146 imported
4 rejected
```

with the four validation errors clearly identified.

---

# 10.50 Data Validation

NEXG should validate:

```text id="w8n2m4"
Required fields
Data types
Currency
Amounts
Identifiers
Relationships
Category compatibility
Location validity
State validity
Duplicate records
```

Validation should happen before corrupt data enters the canonical model.

---

# 10.51 Schema Transformation

Merchant payload:

```text id="p2k8v4"
{
  "item_code": "MENU-8831",
  "item_name": "Chicken Burger",
  "selling_price": 850
}
```

NEXG canonical representation:

```text id="y4m7q2"
{
  "externalId": "MENU-8831",
  "name": "Chicken Burger",
  "price": {
    "amount": 850,
    "currency": "KES"
  }
}
```

The merchant's internal schema therefore remains theirs.

NEXG maintains its own canonical contract.

---

# 10.52 Mapping Configuration

Merchant integrations may need configurable mappings.

```text id="r3n6x8"
Merchant Field
       ↓
NEXG Field

item_code
       →
externalId

selling_price
       →
price.amount
```

This mapping should be versioned and auditable.

---

# 10.53 Mapping Validation

Before production:

```text id="c8m2v7"
Mapping
   ↓
Test Payload
   ↓
Canonical Output
   ↓
Validation
```

The developer can confirm that their system's data will be interpreted correctly.

---

# 10.54 Data Freshness

Synchronization should expose freshness.

```text id="m5q8r1"
Last synchronized:
2026-08-07 10:42:11

Current status:
SYNCED
```

If data becomes too old:

```text id="p7v2x4"
STALE
```

The threshold can differ by capability.

Inventory might require much tighter freshness than a product description.

---

# 10.55 Real-Time vs Periodic Synchronization

NEXG should use real-time synchronization where state changes rapidly.

```text id="y8k3m2"
Orders
Inventory reservations
Bookings
Payments
```

Periodic synchronization can be appropriate for:

```text id="r4p7x9"
Product descriptions
Historical records
Reporting data
Non-critical metadata
```

This reduces unnecessary API traffic.

---

# 10.56 Event-Driven Synchronization

The preferred architecture for operational changes is:

```text id="j6q2w8"
State Change
    ↓
Domain Event
    ↓
Event Bus
    ↓
Integration Delivery
    ↓
Merchant System
```

This prevents systems from constantly polling NEXG.

---

# 10.57 Polling

Polling should remain available where necessary.

A merchant can request:

```text id="c7m5x1"
GET /v1/orders?updatedSince=...
```

This supports:

- recovery
- reconciliation
- systems that cannot consume webhooks
- catching up after downtime

Polling is therefore a **recovery and compatibility mechanism**, not necessarily the primary event mechanism.

---

# 10.58 Synchronization After Downtime

Suppose the merchant system was offline for 40 minutes.

When it returns:

```text id="w9k4m3"
Merchant reconnects
       ↓
Retrieve events since checkpoint
       ↓
Process events
       ↓
Acknowledge
       ↓
Reconcile
       ↓
SYNCED
```

This prevents lost business events.

---

# 10.59 Checkpoints

The integration should maintain a synchronization checkpoint.

```text id="e5q8m1"
Last processed event:
EVT-20260807-00142
```

On recovery:

```text id="p4v7x2"
Continue from checkpoint
```

rather than downloading the entire history.

---

# 10.60 The NEXG Consistency Model

We can now define the core rule:

> **NEXG maintains canonical business identities and state contracts while allowing merchant systems to remain authoritative over domains explicitly assigned to them.**

The system therefore avoids both extremes:

```text id="v6m2q9"
Everything belongs to NEXG
```

and:

```text id="x3p7r1"
Every merchant system behaves independently
```

Instead:

```text id="j8k4m2"
Defined ownership
+
Canonical models
+
Controlled synchronization
+
State machines
+
Events
+
Reconciliation
```

---

# 10.61 Complete Data Flow

A restaurant integration now looks like:

```text id="n7q4w2"
                  MERCHANT POS
                       │
             Product / Inventory
                       │
                       ▼
                NEXG INTEGRATION
                       │
              Mapping + Validation
                       │
                       ▼
                NEXG CANONICAL
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        Catalog Service      Inventory
             │                   │
             └─────────┬─────────┘
                       ▼
                  Consumer App
                       │
                       ▼
                  New Order
                       │
                       ▼
                 NEXG Order
                       │
                       ▼
                 Merchant POS
                       │
                       ▼
                 Preparation
                       │
                       ▼
                 NEXG Fulfillment
```

---

# 10.62 Failure-Safe Architecture

The architecture should assume failures will happen.

```text id="s3m8q5"
Network failure
API timeout
Merchant outage
Duplicate event
Out-of-order event
Invalid payload
Stale data
Inventory conflict
Authentication failure
Webhook failure
```

For each one, NEXG needs a defined behavior.

Not:

> "The developer should figure it out."

---

# 10.63 Data Synchronization Contract

Every integration resource should ultimately document:

```text id="x4q7m2"
Ownership
Canonical ID
External ID
Create authority
Update authority
Delete/archive authority
State authority
Synchronization direction
Event types
Retry behavior
Idempotency
Conflict resolution
Reconciliation
Recovery
```

This becomes one of the most important documents in the NEXG merchant integration specification.

---

# 10.64 Phase 10 Architecture

The complete model becomes:

```text id="k5r8n2"
                    MERCHANT DATA
                         │
                         ▼
                INTEGRATION LAYER
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
          VALIDATION             MAPPING
              │                     │
              └──────────┬──────────┘
                         ▼
                  CANONICAL MODEL
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           CATALOG    INVENTORY    ORDERS
              │          │          │
              └──────────┼──────────┘
                         ▼
                   STATE MACHINES
                         │
                         ▼
                       EVENTS
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
          MERCHANT              NEXG APPS
          SYSTEMS               & OPERATIONS
              │                     │
              └──────────┬──────────┘
                         ▼
                  RECONCILIATION
                         │
                         ▼
                   CONSISTENCY
```

---

# 10.65 Phase 10 Final Deliverable

At the end of Phase 10, NEXG has defined the machinery that keeps its ecosystem synchronized.

### Data

- Canonical entities
- External identifiers
- Data ownership
- Merchant mappings
- Data validation
- Data freshness

### Catalog

- Products
- Categories
- Locations
- Pricing
- Availability
- Catalog synchronization

### Inventory

- On-hand
- Available
- Reserved
- Committed
- Released
- Inventory authority
- Inventory reconciliation

### Orders & Bookings

- Canonical IDs
- External IDs
- State authority
- State transitions
- Idempotency
- Concurrency
- Conflict handling

### Synchronization

- Push
- Pull
- Events
- Webhooks
- Polling
- Checkpoints
- Retry
- Dead-letter handling
- Recovery

### Consistency

```text id="u5q8m3"
Source of Truth
      ↓
Canonical Identity
      ↓
Controlled State
      ↓
Event
      ↓
Synchronization
      ↓
Reconciliation
```

That gives NEXG something much more important than merely an API:

> **a defined system for maintaining one coherent operational reality across NEXG and every merchant system connected to it.**

---

# Phase 11

The next logical phase is **NEXG Commerce, Orders, Bookings, Payments & Fulfillment Transaction Architecture**.

Phase 10 established how data stays synchronized.

Phase 11 should establish what actually happens when a customer **does something that creates a commercial transaction**:

```text id="9c4w7n"
Customer
   ↓
Discover Merchant
   ↓
Browse Product / Service
   ↓
Select
   ↓
Cart / Request
   ↓
Price
   ↓
Availability
   ↓
Order / Booking
   ↓
Payment
   ↓
Confirmation
   ↓
Merchant Acceptance
   ↓
Preparation / Assignment
   ↓
Fulfillment
   ↓
Completion
   ↓
Settlement
   ↓
Receipt
```

And crucially, we should define how that transaction model adapts across the **21 NEXG merchant categories and 134 subcategories** rather than building a restaurant-only commerce engine and trying to stretch it over everything else.

## Prompt:
8/7/2026, 11:08:38 AM

Phase 11

## Response:
8/7/2026, 11:08:39 AM

# Phase 11 — NEXG Commerce, Orders, Bookings, Payments & Fulfillment Transaction Architecture

Phase 11 defines **how a customer action becomes a controlled NEXG transaction and moves from intent to completion**.

Phase 10 established how data remains synchronized between NEXG and merchant systems.

Phase 11 establishes what NEXG does when the customer actually wants to **buy, book, request, reserve, pay for, receive, cancel or modify something**.

The central architecture is:

```text
Customer Intent
      ↓
Selection
      ↓
Availability
      ↓
Pricing
      ↓
Transaction Creation
      ↓
Payment
      ↓
Merchant Acceptance
      ↓
Fulfillment
      ↓
Completion
      ↓
Settlement
      ↓
Receipt / Records
```

But NEXG cannot treat every merchant as a restaurant.

A restaurant order, airport transfer, spa appointment, safari booking, car rental and laundry request have different operational structures.

The solution is:

> **One NEXG transaction architecture with domain-specific transaction types and fulfillment workflows.**

---

# 11.1 The NEXG Transaction Model

Every commercial interaction should have a common transaction envelope.

```text
transactionId
merchantId
customerId
locationId
transactionType
status
currency
subtotal
fees
tax
discount
total
paymentStatus
fulfillmentStatus
createdAt
updatedAt
```

Then the transaction contains domain-specific information.

```text
Restaurant
    → Order

Airport Transfer
    → Transfer Booking

Spa
    → Appointment

Car Rental
    → Rental Booking

Safari
    → Experience Booking

Laundry
    → Service Request
```

This allows NEXG to maintain one financial and operational foundation without forcing every business into an identical workflow.

---

# 11.2 Transaction Types

NEXG should define explicit transaction types.

```text
ORDER
BOOKING
RESERVATION
SERVICE_REQUEST
TRANSFER
RENTAL
TICKET
QUOTE
```

Not every category needs every transaction type.

The merchant's enabled capabilities determine which transaction types are available.

---

# 11.3 Category → Transaction Behavior

The existing NEXG taxonomy becomes operational here.

| NEXG Category | Primary Transaction |
|---|---|
| Restaurants & Food | Order |
| Groceries & Essentials | Order |
| Fashion & Apparel | Order |
| Tech & Electronics | Order |
| Pharmacy | Order |
| Flowers & Gifts | Order |
| Alcohol & Beverages | Order |
| Beauty | Order |
| Laundry & Cleaning | Service Request |
| Airport Transfers | Transfer Booking |
| Vehicle Rentals | Rental Booking |
| Vehicle Services | Service Request |
| Experiences | Booking |
| Travel & Tours | Booking |
| Wellness | Appointment / Booking |
| Concierge Services | Service Request / Quote |
| Logistics & Shipping | Shipment |
| Financial Services | Service Request / Transaction |
| Health | Appointment / Service |
| Marketplace | Order |
| Adults Only | Order / Service according to permitted merchant capability |

The category does not determine every detail.

The **merchant's enabled capabilities** determine the actual transaction flow.

---

# 11.4 Transaction Capability

A merchant profile can expose capabilities such as:

```text
ordering
booking
appointments
reservations
quotations
delivery
pickup
payment
scheduled_fulfillment
```

A restaurant may have:

```text
ordering
delivery
pickup
scheduled_order
```

An airport transfer merchant may have:

```text
booking
scheduled_fulfillment
payment
```

This makes the architecture extensible.

---

# 11.5 Transaction Lifecycle

Every transaction needs a lifecycle.

The common envelope is:

```text
DRAFT
  ↓
PENDING
  ↓
CONFIRMED
  ↓
IN_PROGRESS
  ↓
COMPLETED
```

But transactions can also branch:

```text
PENDING
   ├── CANCELLED
   ├── FAILED
   └── EXPIRED
```

The exact state machine depends on transaction type.

---

# 11.6 Intent Is Not an Order

NEXG should distinguish between:

```text
Customer Intent
```

and:

```text
Confirmed Transaction
```

A customer adding a burger to a cart does not mean:

```text
Order Created
```

A customer selecting a safari date does not mean:

```text
Booking Confirmed
```

The transaction only becomes authoritative when the relevant creation conditions are satisfied.

---

# 11.7 Cart Architecture

For order-based transactions:

```text
Customer
   ↓
Cart
   ↓
Items
   ↓
Modifiers
   ↓
Quantity
   ↓
Price
```

The cart is temporary.

The order is permanent.

```text
Cart
  ↓
Checkout
  ↓
Order
```

---

# 11.8 Cart Validation

At checkout NEXG should revalidate:

```text
Merchant availability
Location availability
Product availability
Quantity
Price
Modifiers
Taxes
Fees
Delivery availability
Minimum order requirements
```

NEXG should not rely entirely on values calculated when the item was first added to the cart.

---

# 11.9 Price Calculation

The transaction total should be composed transparently.

```text
Subtotal
+ Delivery Fee
+ Service Fee
+ Applicable Tax
- Discount
= Total
```

The exact components depend on the transaction.

For a restaurant:

```text
Food
+ Delivery
+ Service
+ Tax
- Promotion
```

For a safari:

```text
Package
+ Add-ons
+ Service Fees
+ Tax
- Discount
```

---

# 11.10 Price Snapshot

Once a transaction is created, NEXG should preserve the price used for that transaction.

Suppose:

```text
Burger
KES 850
```

The merchant later changes it to:

```text
KES 950
```

The existing order remains:

```text
KES 850
```

unless the transaction explicitly permits repricing.

This is why transaction pricing is a **snapshot**, not simply a live reference to the catalog.

---

# 11.11 Line Items

Orders should contain immutable commercial line-item information.

```text
lineItemId
productId
name
quantity
unitPrice
subtotal
tax
discount
total
```

The product's current name or price should not rewrite historical transactions.

---

# 11.12 Modifiers and Options

Products may have configurable components.

Restaurant:

```text
Burger
 ├── Size
 ├── Protein
 ├── Sauce
 └── Extras
```

Spa:

```text
Massage
 ├── Duration
 └── Therapist preference
```

Car rental:

```text
Vehicle
 ├── Insurance
 ├── Child seat
 └── Additional driver
```

These should use a reusable option architecture.

---

# 11.13 Availability Before Transaction

NEXG must check availability before confirming a transaction.

```text
Request
   ↓
Availability Check
   ↓
Available?
 ┌─┴─┐
YES  NO
 ↓    ↓
Continue
      Reject / Alternative
```

Availability may represent:

```text
Inventory quantity
Seats
Vehicles
Time slots
Staff capacity
Delivery capacity
Property availability
```

---

# 11.14 Time-Based Availability

Some transactions require a time slot.

```text
Resource
   ↓
Date
   ↓
Start Time
   ↓
Duration
```

Examples include:

```text
Spa appointment
Airport transfer
Car rental
Photography
Tour
House cleaning
```

NEXG must prevent overlapping reservations where the resource cannot support them.

---

# 11.15 Capacity

Some services are capacity-based.

A tour may have:

```text
Capacity: 12
Booked: 9
Available: 3
```

A request for:

```text
4 people
```

must fail or offer another slot.

---

# 11.16 Resource Allocation

NEXG should distinguish:

```text
Availability
```

from:

```text
Assignment
```

A customer booking an airport transfer creates:

```text
Transfer Booking
```

but the actual driver/vehicle assignment may happen later.

```text
Booking
   ↓
Confirmed
   ↓
Resource Assignment
   ↓
Driver + Vehicle
```

This separation is essential.

---

# 11.17 Booking Lifecycle

A generic booking can be:

```text
REQUESTED
   ↓
HELD
   ↓
CONFIRMED
   ↓
ASSIGNED
   ↓
IN_PROGRESS
   ↓
COMPLETED
```

Alternative paths:

```text
REQUESTED → DECLINED
HELD → EXPIRED
CONFIRMED → CANCELLED
```

---

# 11.18 Reservation Holds

For high-contention resources, NEXG may temporarily hold availability.

```text
Available
   ↓
Held
   ↓
Payment
   ↓
Confirmed
```

If payment is not completed within the permitted period:

```text
Held
 ↓
Expired
 ↓
Released
```

This prevents abandoned checkouts from blocking inventory indefinitely.

---

# 11.19 Payment Is Its Own Domain

NEXG should not make:

```text
Order = Payment
```

They are related but separate.

```text
Order
   ↕
Payment
   ↓
Settlement
```

This allows:

```text
Payment Pending
Order Confirmed
```

where the business workflow supports it.

---

# 11.20 Payment Lifecycle

A payment can move through:

```text
INITIATED
   ↓
PENDING
   ↓
AUTHORIZED
   ↓
CAPTURED
```

or:

```text
PENDING
   ↓
FAILED
```

or:

```text
CAPTURED
   ↓
REFUNDED
```

The exact payment flow depends on the payment method and transaction type.

---

# 11.21 Payment Methods

NEXG should abstract payment methods from the transaction.

```text
Payment
 ├── M-Pesa
 ├── Card
 ├── Bank
 ├── Wallet
 └── Other supported method
```

The order does not need to know the implementation details of the payment provider.

---

# 11.22 Payment Reference

Every payment needs its own identity.

```text
paymentId
transactionId
provider
providerReference
amount
currency
status
createdAt
```

Example:

```text
transactionId
ORD-20260807-00001

paymentId
PAY-20260807-00001

providerReference
MPESA-ABC123
```

---

# 11.23 Payment Amount Protection

NEXG should verify:

```text
Payment Amount
=
Expected Transaction Amount
```

unless the transaction explicitly supports partial payments, deposits or installments.

This protects against accidental or malicious amount mismatches.

---

# 11.24 Partial Payments

Some transaction types may support:

```text
Deposit
+
Balance
```

A safari could have:

```text
Total: KES 120,000
Deposit: KES 30,000
Balance: KES 90,000
```

NEXG should model these as multiple payment obligations rather than modifying the transaction total.

---

# 11.25 Payment Failure

If payment fails:

```text
Payment
FAILED
```

does not automatically mean:

```text
Transaction
CANCELLED
```

The transaction policy determines what happens.

Possible behavior:

```text
Payment Failed
      ↓
Retry Payment
```

or:

```text
Payment Failed
      ↓
Reservation Released
      ↓
Transaction Cancelled
```

---

# 11.26 Merchant Acceptance

Some transactions require merchant confirmation.

For example:

```text
Customer submits request
        ↓
Merchant receives request
        ↓
Merchant accepts
        ↓
Transaction confirmed
```

This is different from an instant-confirmation transaction.

---

# 11.27 Instant vs Merchant-Confirmed

NEXG should support both.

### Instant

```text
Customer
 ↓
Payment
 ↓
Confirmed
```

### Merchant-confirmed

```text
Customer
 ↓
Request
 ↓
Merchant Review
 ↓
Accepted
 ↓
Payment / Confirmation
```

The merchant's capability configuration determines the model.

---

# 11.28 Quote-Based Transactions

Concierge Services and some logistics/services may require:

```text
Request
 ↓
Merchant Review
 ↓
Quote
 ↓
Customer Acceptance
 ↓
Payment
 ↓
Confirmed
```

The quote should become a formal commercial object.

```text
quoteId
transactionId
items
price
validUntil
terms
status
```

---

# 11.29 Quote Expiry

A quote can be:

```text
DRAFT
SENT
ACCEPTED
REJECTED
EXPIRED
```

Once expired, it should not silently become payable.

---

# 11.30 Cancellation

Cancellation is a domain operation, not simply:

```text
status = CANCELLED
```

NEXG must evaluate:

```text
Who cancelled?
When?
Why?
Current state?
Cancellation policy?
Refund?
Merchant compensation?
Resource release?
```

---

# 11.31 Cancellation Policy

Policies can depend on timing.

A tour:

```text
More than 48 hours
→ Full refund
```

A different booking:

```text
Less than 24 hours
→ Partial refund
```

The policy should be captured when the transaction is created where necessary, so historical transactions are not affected by later policy changes.

---

# 11.32 Refund Architecture

A refund is its own financial operation.

```text
Payment
   ↓
Refund Requested
   ↓
Refund Processing
   ↓
Refunded
```

A refund should have:

```text
refundId
paymentId
amount
reason
status
providerReference
createdAt
```

---

# 11.33 Partial Refunds

A transaction may have:

```text
Payment
KES 5,000
```

and:

```text
Refund
KES 1,500
```

The payment remains captured.

The transaction's financial ledger records the refund separately.

---

# 11.34 Fulfillment

Payment does not equal fulfillment.

The architecture becomes:

```text
Transaction
    ↓
Payment
    ↓
Fulfillment
```

Fulfillment answers:

> **How does the customer actually receive the product or service?**

---

# 11.35 Fulfillment Types

NEXG should support:

```text
DELIVERY
PICKUP
ON_SITE
DIGITAL
TRANSFER
SERVICE_AT_CUSTOMER
SERVICE_AT_MERCHANT
SCHEDULED_SERVICE
```

---

# 11.36 Restaurant Fulfillment

```text
Order
 ↓
Accepted
 ↓
Preparing
 ↓
Ready
 ↓
Rider Assigned
 ↓
Picked Up
 ↓
Delivered
```

---

# 11.37 Laundry Fulfillment

```text
Service Request
 ↓
Accepted
 ↓
Pickup Scheduled
 ↓
Collected
 ↓
Cleaning
 ↓
Ready
 ↓
Delivery
 ↓
Completed
```

---

# 11.38 Airport Transfer Fulfillment

```text
Booking
 ↓
Confirmed
 ↓
Driver Assigned
 ↓
Driver En Route
 ↓
Driver Arrived
 ↓
Passenger Picked Up
 ↓
Trip In Progress
 ↓
Completed
```

---

# 11.39 Car Rental Fulfillment

```text
Booking
 ↓
Confirmed
 ↓
Vehicle Assigned
 ↓
Vehicle Handover
 ↓
Rental Active
 ↓
Vehicle Returned
 ↓
Inspection
 ↓
Completed
```

The transaction framework remains common while the fulfillment state machine changes.

---

# 11.40 Experience Fulfillment

For a safari:

```text
Booking
 ↓
Confirmed
 ↓
Participant Check-in
 ↓
Experience Started
 ↓
Experience Completed
```

This shows why NEXG needs **transaction types + domain workflows**, rather than a single universal order status.

---

# 11.41 Fulfillment Object

Fulfillment should be represented independently:

```text
fulfillmentId
transactionId
type
status
scheduledAt
location
resource
assignee
startedAt
completedAt
```

This allows multiple operational activities to exist around one transaction.

---

# 11.42 Delivery Assignment

For delivery:

```text
Fulfillment
     ↓
Assignment
     ↓
Rider
     ↓
Vehicle
```

The rider assignment should not rewrite the underlying order.

---

# 11.43 Multiple Fulfillments

An order can potentially contain multiple fulfillments.

```text
Order
 ├── Fulfillment A
 │      └── Delivery
 │
 └── Fulfillment B
        └── Pickup
```

This allows NEXG to support more complex merchant operations later.

---

# 11.44 Transaction Events

Every important transition should produce an event.

```text
transaction.created
transaction.confirmed
transaction.cancelled
transaction.completed

payment.initiated
payment.succeeded
payment.failed
payment.refunded

fulfillment.created
fulfillment.assigned
fulfillment.started
fulfillment.completed
```

These events power:

```text
Merchant integrations
Consumer notifications
Operations
Analytics
Audit
Email
Receipts
```

---

# 11.45 Transaction Timeline

Every transaction should have an immutable operational timeline.

```text
10:21
Order created

10:21
Payment initiated

10:22
Payment successful

10:22
Merchant accepted

10:28
Preparation started

10:41
Order ready

10:44
Rider assigned

10:58
Delivered
```

This becomes the single narrative of what happened.

---

# 11.46 Audit Trail

Every significant action should record:

```text
actor
actorType
action
timestamp
source
transactionId
previousState
newState
metadata
```

Actors can include:

```text
Customer
Merchant
Rider
Host
Admin
System
Integration
```

---

# 11.47 Transaction Notifications

The transaction engine should emit events.

The notification layer decides which communication is appropriate.

```text
Order Confirmed
      ↓
Notification Policy
      ├── App notification
      ├── Email
      └── SMS where required
```

This keeps transactional logic separate from communication logic.

---

# 11.48 Customer Receipt

When a transaction is completed, NEXG should generate a durable receipt record.

```text
receiptId
transactionId
merchant
customer
items
subtotal
tax
fees
discount
total
payment
date
```

The receipt should represent the actual transaction snapshot.

---

# 11.49 Merchant Record

The merchant should receive the corresponding operational record.

```text
Order
Customer
Items
Payment
Fulfillment
Fees
Commission
Settlement status
```

This gives the merchant one coherent transaction record rather than requiring it to reconstruct the transaction from separate API calls.

---

# 11.50 Commission

NEXG's commercial model needs to remain separate from customer pricing.

Suppose:

```text
Customer pays
KES 2,500
```

NEXG may calculate:

```text
Merchant gross
KES 2,500

NEXG commission
KES 250

Merchant payable
KES 2,250
```

The customer's transaction total remains:

```text
KES 2,500
```

The commission belongs to the settlement layer.

---

# 11.51 Settlement

Settlement should follow:

```text
Transaction
      ↓
Payment
      ↓
Commission / Fees
      ↓
Merchant Balance
      ↓
Settlement
```

This prevents settlement calculations from being mixed directly into order logic.

---

# 11.52 Settlement Record

A settlement record should contain:

```text
settlementId
merchantId
transactionId
grossAmount
fees
commission
adjustments
netAmount
currency
status
settledAt
```

This creates an auditable financial trail.

---

# 11.53 Failed Fulfillment After Payment

A critical scenario:

```text
Payment successful
       ↓
Merchant cannot fulfill
```

NEXG must have a defined policy.

Possible result:

```text
Transaction
CANCELLED

Payment
REFUND REQUIRED

Inventory
RELEASED

Merchant
Notified

Customer
Notified
```

This is why payment and fulfillment cannot be treated as one state.

---

# 11.54 Merchant Rejects an Order

```text
Customer
   ↓
Order
   ↓
Payment
   ↓
Merchant Rejects
```

The transaction engine evaluates:

```text
Cancellation
Refund
Inventory release
Commission reversal
Notification
Audit
```

All affected records must move consistently.

---

# 11.55 Transaction Atomicity

NEXG should identify which operations must succeed together.

For an order:

```text
Create Order
+
Reserve Inventory
```

may need atomic protection.

Where full database atomicity is impossible across external systems, NEXG should use:

```text
State machines
Idempotency
Compensation
Reconciliation
```

rather than pretending distributed operations are automatically atomic.

---

# 11.56 Compensation

Suppose:

```text
Inventory reserved
```

but:

```text
Payment failed
```

NEXG performs a compensating operation:

```text
Release Inventory
```

Similarly:

```text
Payment captured
```

but:

```text
Merchant rejects
```

may trigger:

```text
Refund Payment
```

---

# 11.57 Transaction Failure Model

Every major transaction operation should answer:

```text
What happens if it succeeds?
What happens if it fails?
What happens if it times out?
What happens if it is retried?
What happens if the response is lost?
What happens if the merchant is offline?
What happens if the customer retries?
```

These questions become mandatory in NEXG's integration documentation.

---

# 11.58 Customer Retry

A customer may press:

```text
Pay
```

twice.

NEXG must not create:

```text
Payment A
Payment B
```

for the same transaction unintentionally.

The checkout flow must use transaction and payment idempotency.

---

# 11.59 Merchant Retry

A merchant may receive:

```text
order.created
```

and process it successfully, but its response may never reach NEXG.

NEXG retries.

The merchant sees the same event ID:

```text
EVT-20260807-00001
```

and recognizes:

```text
Already processed
```

No duplicate order is created.

This connects Phase 11 directly to Phase 10's synchronization architecture.

---

# 11.60 Transaction Recovery

If a transaction becomes uncertain:

```text
Payment status unknown
```

NEXG should not immediately create another payment.

Instead:

```text
Unknown
 ↓
Provider status check
 ↓
Reconciliation
 ↓
Confirmed result
```

This is particularly important for external payment systems.

---

# 11.61 Transaction State vs Integration State

These must remain separate.

An integration can be:

```text
HEALTHY
```

while an individual order is:

```text
FAILED
```

Likewise:

```text
Integration
DEGRADED
```

does not mean every transaction has failed.

The architecture maintains independent state domains.

---

# 11.62 Transaction Architecture Across NEXG

The full system becomes:

```text
                     CUSTOMER
                        │
                        ▼
                 DISCOVERY / CART
                        │
                        ▼
                  AVAILABILITY
                        │
                        ▼
                     PRICING
                        │
                        ▼
                  TRANSACTION
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
           PAYMENT            MERCHANT
              │                   │
              │             ACCEPT / REJECT
              │                   │
              └─────────┬─────────┘
                        ▼
                   FULFILLMENT
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
           DELIVERY   PICKUP   SERVICE
                        │
                        ▼
                    COMPLETION
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
          RECEIPT               SETTLEMENT
```

---

# 11.63 The Universal NEXG Transaction Envelope

The most important architectural decision from Phase 11 is this:

```text
NEXG Transaction
│
├── Identity
├── Customer
├── Merchant
├── Location
├── Type
├── Commercial Snapshot
├── Payment
├── Fulfillment
├── State
├── Events
├── Audit
├── Settlement
└── External References
```

Then the domain-specific component sits inside it.

```text
Transaction
   │
   ├── Order
   ├── Booking
   ├── Rental
   ├── Transfer
   ├── Service Request
   ├── Shipment
   └── Quote
```

---

# 11.64 The NEXG Transaction State Architecture

Instead of creating one enormous universal state machine:

```text
ORDER_CREATED
BOOKING_CREATED
RENTAL_CREATED
TRANSFER_CREATED
...
```

NEXG uses:

```text
Transaction Envelope
        +
Transaction Type
        +
Domain State Machine
        +
Payment State
        +
Fulfillment State
        +
Settlement State
```

This is much more scalable.

---

# 11.65 Example: Restaurant

```text
Transaction
ORD-20260807-00001

Type
ORDER

Commercial
KES 2,450

Payment
CAPTURED

Order
CONFIRMED

Fulfillment
DELIVERY / IN_PROGRESS

Merchant
ACCEPTED

Settlement
PENDING
```

Every aspect has its own state.

---

# 11.66 Example: Airport Transfer

```text
Transaction
TRF-20260807-00001

Type
TRANSFER

Booking
CONFIRMED

Payment
CAPTURED

Assignment
DRIVER_ASSIGNED

Fulfillment
DRIVER_EN_ROUTE

Settlement
PENDING
```

---

# 11.67 Example: Safari

```text
Transaction
EXP-20260807-00001

Type
BOOKING

Booking
CONFIRMED

Capacity
3 seats reserved

Payment
DEPOSIT_CAPTURED

Fulfillment
UPCOMING

Balance
PENDING
```

The same transaction architecture supports all three.

---

# 11.68 Merchant IT Integration Contract

Phase 11 means the merchant documentation must clearly define:

```text
How orders are created
How bookings are created
How availability is checked
How prices are calculated
How payments are represented
How merchant acceptance works
How cancellations work
How refunds work
How fulfillment states work
How transaction events work
How retries work
How idempotency works
How reconciliation works
```

A merchant IT team should be able to implement against these rules without guessing NEXG's business behavior.

---

# 11.69 Phase 11 Deliverable

At the end of Phase 11, NEXG has defined:

### Transaction foundation

- Transaction identity
- Transaction types
- Customer intent
- Cart
- Checkout
- Pricing
- Commercial snapshots

### Orders

- Order lifecycle
- Line items
- Modifiers
- Merchant acceptance
- Cancellation
- Completion

### Bookings

- Availability
- Capacity
- Reservations
- Holds
- Scheduling
- Assignment
- Cancellation

### Payments

- Payment lifecycle
- Payment references
- Partial payments
- Refunds
- Payment failure
- Payment reconciliation

### Fulfillment

- Delivery
- Pickup
- Transfer
- Service
- Scheduled fulfillment
- Resource assignment

### Financial operations

- Commission
- Fees
- Settlement
- Merchant payable
- Financial reconciliation

### Reliability

- Idempotency
- Retry
- Compensation
- Recovery
- State consistency
- Audit

---

# 11.70 The Complete NEXG Commerce Architecture

After Phases 10 and 11, the architecture now looks like:

```text
                     NEXG
                      │
        ┌─────────────┴─────────────┐
        │                           │
   DATA PLATFORM              TRANSACTION PLATFORM
        │                           │
        ▼                           ▼
 Canonical Model                Cart / Intent
        │                           │
 Mapping / Sync                 Availability
        │                           │
 Catalog                        Pricing
        │                           │
 Inventory                      Transaction
        │                           │
 Reconciliation                Payment
        │                           │
 Events                         Fulfillment
        │                           │
        └─────────────┬─────────────┘
                      │
                      ▼
                SETTLEMENT
                      │
                      ▼
               MERCHANT SYSTEM
```

The critical principle is:

> **NEXG should not build separate commerce engines for restaurants, safaris, airport transfers, car rentals, wellness, laundry and concierge. It should build one transaction platform with domain-specific capabilities and state machines.**

That gives the existing **21 categories and 134 subcategories** a proper technical foundation instead of leaving them as presentation-level taxonomy.

---

## Phase 12

The next phase should be **NEXG Merchant Integration API Architecture & Contract Design**.

That is where we turn everything established in Phases 1–11 into the actual technical contract an IT team would implement:

```text
Authentication
    ↓
API conventions
    ↓
Resources
    ↓
Endpoints
    ↓
Request schemas
    ↓
Response schemas
    ↓
Errors
    ↓
Pagination
    ↓
Filtering
    ↓
Idempotency
    ↓
Webhooks
    ↓
Events
    ↓
Versioning
    ↓
Rate limits
    ↓
Sandbox
    ↓
Examples
```

And importantly, we can define **the actual NEXG documentation structure and API surface**, rather than merely describing what a good integration platform should contain.

## Prompt:
8/7/2026, 11:10:23 AM

Phase 12

## Response:
8/7/2026, 11:10:23 AM

# Phase 12 — NEXG Merchant Integration API Architecture & Contract Design

Phase 12 turns the architecture from Phases 1–11 into the **actual technical contract that a merchant's IT team will implement**.

The goal is not to document vague concepts like "NEXG supports orders."

The goal is to reach:

> **A developer can receive NEXG credentials, open the documentation, understand exactly what their system needs to send and receive, implement it, test it in Sandbox, and know precisely what every response and error means.**

The NEXG merchant integration surface should therefore be designed around:

```text
Merchant System
      ↓
NEXG API
      ↓
Authentication
      ↓
Validation
      ↓
Business Rules
      ↓
NEXG Domain Services
      ↓
Events / Webhooks
      ↓
Merchant System
```

---

# 12.1 The NEXG API Philosophy

NEXG should expose a **stable canonical API**, not expose its internal database structure.

The merchant should interact with:

```text
Merchants
Locations
Catalog
Products
Inventory
Orders
Bookings
Customers
Payments
Fulfillment
Quotes
Transactions
Events
```

They should not need to understand:

```text
NEXG internal tables
internal services
internal queues
internal database IDs
internal implementation
```

The API is a contract, not a mirror of the backend.

---

# 12.2 API Domains

The API should be organized into business domains.

```text
/v1/merchants
/v1/locations
/v1/catalog
/v1/products
/v1/inventory
/v1/orders
/v1/bookings
/v1/transactions
/v1/payments
/v1/fulfillments
/v1/quotes
/v1/customers
/v1/events
```

Not every merchant receives access to every domain.

Access is capability-based.

---

# 12.3 Merchant Capability Determines API Access

The merchant's NEXG configuration determines what it can use.

A restaurant may receive:

```text
catalog
inventory
orders
payments
fulfillment
```

An airport-transfer merchant may receive:

```text
locations
bookings
payments
fulfillment
```

A concierge merchant may receive:

```text
service_requests
quotes
payments
fulfillment
```

The API therefore reflects the merchant's actual operational model.

---

# 12.4 API Versioning

NEXG should use explicit major versions:

```text
/v1/
```

The version represents the public contract.

NEXG should not silently change:

```text
field meaning
field type
required fields
state behavior
authentication requirements
```

in a backwards-incompatible way.

---

# 12.5 Backwards Compatibility

Changes such as adding an optional response field can normally remain compatible.

Changes such as:

```text
Removing a field
Changing a field's meaning
Changing a field type
Removing a state
Changing a required field
```

should require a new API version or a formally managed breaking-change process.

---

# 12.6 Base API Structure

The production API should have a consistent base structure:

```text
https://api.nexgapp.com/v1/
```

The important part is consistency.

Every endpoint should follow the same conventions for:

```text
Authentication
Headers
IDs
Errors
Pagination
Filtering
Dates
Currency
Amounts
Idempotency
Responses
```

---

# 12.7 Authentication

Merchant systems should authenticate using machine credentials rather than consumer credentials.

The integration model should support:

```text
Merchant
   ↓
Integration
   ↓
Credential
   ↓
NEXG API
```

Credentials belong to the **merchant integration**, not an individual employee.

---

# 12.8 Credential Model

A merchant IT administrator should be able to create:

```text
Integration
NEXG POS Integration

Environment
Sandbox

Credentials
Client ID
Client Secret
```

Production credentials are separate.

```text
Sandbox credentials
≠
Production credentials
```

---

# 12.9 Credential Rotation

Credentials should be rotatable without immediately destroying the existing credential.

The merchant can:

```text
Create new credential
        ↓
Deploy new credential
        ↓
Verify
        ↓
Revoke old credential
```

This avoids unnecessary downtime.

---

# 12.10 Scope-Based Authorization

Credentials should receive scopes.

```text
catalog:read
catalog:write

inventory:read
inventory:write

orders:read
orders:write

bookings:read
bookings:write

payments:read

fulfillment:read
fulfillment:write
```

A merchant integration should only receive the permissions it needs.

---

# 12.11 Example Scope Configuration

A restaurant POS integration could receive:

```text
catalog:read
inventory:read
inventory:write
orders:read
orders:write
fulfillment:read
fulfillment:write
```

It does not automatically receive:

```text
merchant:delete
payments:refund
```

unless that capability is explicitly granted.

---

# 12.12 Authentication Errors

Authentication failures need standardized responses.

```text
401 UNAUTHENTICATED
```

Authorization failures:

```text
403 FORBIDDEN
```

These must be distinguishable.

The developer should know whether:

```text
Credential is invalid
```

or:

```text
Credential is valid but lacks permission
```

---

# 12.13 Request Identity

Every API request should be traceable.

NEXG should return/request a correlation identifier such as:

```text
X-Request-ID
```

A merchant developer can then tell support:

```text
Request ID:
req_01J...
```

NEXG can trace that request through its systems.

---

# 12.14 Idempotency

All operations capable of creating financial or operational side effects should support idempotency.

```text
Idempotency-Key: merchant-order-48391
```

NEXG stores the result associated with that key within the defined idempotency scope.

A retry therefore returns the original operation result rather than creating another transaction.

---

# 12.15 Which APIs Need Idempotency?

At minimum:

```text
POST /orders
POST /bookings
POST /payments
POST /refunds
POST /quotes
POST /fulfillments
```

Any future endpoint that causes a material side effect should be evaluated under the same rule.

---

# 12.16 Request Validation

Every request passes through:

```text
Authentication
       ↓
Authorization
       ↓
Schema Validation
       ↓
Business Validation
       ↓
State Validation
       ↓
Execution
```

This distinction matters.

A request can be structurally valid:

```text
quantity = 2
```

but business-invalid because:

```text
available quantity = 1
```

---

# 12.17 Standard Error Model

NEXG should have one error structure across the API.

```text
{
  "error": {
    "code": "INVENTORY_UNAVAILABLE",
    "message": "The requested quantity is not available.",
    "requestId": "req_...",
    "details": {}
  }
}
```

The exact response schema should be standardized across all domains.

---

# 12.18 Error Codes Are Machine-Readable

Merchant developers should not parse human messages.

They should implement against:

```text
INVENTORY_UNAVAILABLE
INVALID_STATE
INVALID_REQUEST
AUTHENTICATION_FAILED
FORBIDDEN
RESOURCE_NOT_FOUND
DUPLICATE_REQUEST
RATE_LIMITED
PAYMENT_FAILED
RESOURCE_CONFLICT
```

The `message` is for humans.

The `code` is for software.

---

# 12.19 HTTP Status + NEXG Code

Both are useful.

```text
409 Conflict
RESOURCE_CONFLICT
```

or:

```text
422 Unprocessable Entity
INVENTORY_UNAVAILABLE
```

This allows standard HTTP handling while giving the merchant precise NEXG semantics.

---

# 12.20 Resource IDs

NEXG IDs should be opaque.

A merchant should never assume:

```text
ORD-20260807-00001
```

contains meaningful business information that can be parsed.

The documentation should explicitly say:

> Treat NEXG resource identifiers as opaque strings.

This allows NEXG to change its internal ID generation without breaking integrations.

---

# 12.21 External IDs

Merchant systems can maintain their own identifiers.

NEXG should support:

```text
externalId
```

where appropriate.

Restaurant POS:

```text
MENU-8831
```

NEXG:

```text
prd_01J...
```

Both identities remain available.

---

# 12.22 Resource Representation

A canonical NEXG product response could contain:

```text
{
  "id": "prd_01...",
  "externalId": "MENU-8831",
  "name": "Chicken Burger",
  "status": "active",
  "price": {
    "amount": 850,
    "currency": "KES"
  },
  "locationIds": [
    "loc_01..."
  ]
}
```

The API should use consistent naming conventions throughout.

---

# 12.23 Monetary Representation

NEXG should not represent money as floating-point values.

Use:

```text
amount
currency
```

with a defined precision model.

For KES:

```text
{
  "amount": 850,
  "currency": "KES"
}
```

The documentation must clearly state the unit represented by `amount`.

---

# 12.24 Dates and Times

NEXG should use standardized timestamps.

Example:

```text
2026-08-07T08:42:31Z
```

For scheduled activities, NEXG should distinguish:

```text
timestamp
```

from:

```text
local business date/time
```

Timezone information must not be assumed.

---

# 12.25 Location

A merchant may have multiple locations.

```text
Merchant
 ├── Location A
 ├── Location B
 └── Location C
```

Most operational resources should therefore support:

```text
locationId
```

where relevant.

---

# 12.26 Merchant Resource

The merchant endpoint exposes the merchant's NEXG identity and capabilities.

```text
GET /v1/merchant
```

Potential response:

```text
{
  "id": "mrc_01...",
  "name": "Merchant Name",
  "status": "active",
  "capabilities": {
    "ordering": true,
    "booking": false,
    "delivery": true
  }
}
```

---

# 12.27 Locations

```text
GET /v1/locations
GET /v1/locations/{locationId}
```

The merchant can retrieve:

```text
location
address
coordinates
operating hours
status
supported capabilities
```

---

# 12.28 Catalog API

The catalog domain should support:

```text
GET /v1/catalog
GET /v1/products
GET /v1/products/{productId}
POST /v1/products
PATCH /v1/products/{productId}
```

The actual write permissions depend on ownership established in Phase 10.

---

# 12.29 Catalog Categories

NEXG must distinguish:

```text
Merchant Classification
```

from:

```text
Merchant Catalog Categories
```

A merchant classified under:

```text
Restaurants & Food
→ Restaurant
```

can still organize its catalog as:

```text
Breakfast
Burgers
Pizza
Drinks
Desserts
```

Those are not replacing the NEXG merchant taxonomy.

---

# 12.30 Product API

Product creation should have explicit validation.

```text
POST /v1/products
```

Payload:

```text
{
  "externalId": "MENU-8831",
  "name": "Chicken Burger",
  "price": {
    "amount": 850,
    "currency": "KES"
  },
  "locationIds": ["loc_01..."]
}
```

NEXG validates and returns the canonical product.

---

# 12.31 Inventory API

Inventory should expose operational state rather than forcing merchants to manipulate raw quantities incorrectly.

Potential operations:

```text
GET /v1/inventory
GET /v1/inventory/{inventoryId}
POST /v1/inventory/adjustments
POST /v1/inventory/reservations
POST /v1/inventory/reservations/{id}/release
```

The exact API surface should follow the ownership model.

---

# 12.32 Order API

Core endpoints:

```text
POST /v1/orders
GET /v1/orders/{orderId}
GET /v1/orders
POST /v1/orders/{orderId}/accept
POST /v1/orders/{orderId}/reject
POST /v1/orders/{orderId}/cancel
```

This is preferable to allowing arbitrary:

```text
PATCH status
```

because NEXG controls legal state transitions.

---

# 12.33 Order Creation

The order request should contain:

```text
customer
location
items
fulfillment
pricing context
external reference
```

NEXG calculates and validates the authoritative transaction state.

---

# 12.34 Order Acceptance

Instead of:

```text
PATCH /orders/123
{
  "status": "confirmed"
}
```

NEXG can use:

```text
POST /orders/{orderId}/accept
```

This allows NEXG to execute:

```text
Validate state
↓
Record actor
↓
Change state
↓
Emit event
↓
Trigger notifications
```

as one business operation.

---

# 12.35 Booking API

Booking endpoints follow the same principle:

```text
GET /v1/availability
POST /v1/bookings
GET /v1/bookings/{bookingId}
POST /v1/bookings/{bookingId}/confirm
POST /v1/bookings/{bookingId}/cancel
```

The resource is different, but the API conventions remain consistent.

---

# 12.36 Availability API

Availability should not be a vague boolean.

It may return:

```text
resource
date
time
capacity
availableQuantity
status
```

For a tour:

```text
2026-08-12
09:00
capacity: 12
available: 4
```

This gives the merchant application enough information to make a reliable decision.

---

# 12.37 Quote API

For quote-driven merchants:

```text
POST /v1/quotes
GET /v1/quotes/{quoteId}
POST /v1/quotes/{quoteId}/send
POST /v1/quotes/{quoteId}/accept
POST /v1/quotes/{quoteId}/reject
```

Quotes should have their own lifecycle.

---

# 12.38 Payment API

Payment resources should be separate:

```text
GET /v1/payments/{paymentId}
POST /v1/payments
POST /v1/payments/{paymentId}/refund
GET /v1/payments/{paymentId}/refunds
```

Merchant integrations should never assume:

```text
order status = payment status
```

---

# 12.39 Fulfillment API

Fulfillment operations should include:

```text
GET /v1/fulfillments/{fulfillmentId}
POST /v1/fulfillments/{fulfillmentId}/assign
POST /v1/fulfillments/{fulfillmentId}/start
POST /v1/fulfillments/{fulfillmentId}/complete
```

The permitted operations depend on the fulfillment type.

---

# 12.40 Event API

NEXG events should have a standardized structure.

```text
{
  "id": "evt_01...",
  "type": "order.created",
  "createdAt": "2026-08-07T08:42:31Z",
  "resource": {
    "type": "order",
    "id": "ord_01..."
  },
  "data": {}
}
```

This gives every integration a predictable event envelope.

---

# 12.41 Webhooks

NEXG should deliver events to merchant-configured webhook endpoints.

```text
NEXG
 ↓
HTTPS POST
 ↓
Merchant Webhook
```

The merchant must acknowledge receipt.

A successful response confirms delivery.

---

# 12.42 Webhook Security

Merchant webhooks should verify that the request genuinely originated from NEXG.

The documentation should define:

```text
signature
timestamp
payload
verification algorithm
replay protection
```

The merchant should never trust an incoming webhook solely because it reached the endpoint.

---

# 12.43 Webhook Retry

If:

```text
NEXG → Merchant
```

fails due to:

```text
timeout
5xx
network error
```

NEXG should retry according to a documented retry policy.

The merchant must therefore implement idempotent webhook processing.

---

# 12.44 Webhook Ordering

NEXG should provide ordering information where the event stream requires it.

Events should contain sufficient metadata to allow the merchant to detect:

```text
duplicate
out-of-order
missing
```

events.

---

# 12.45 Event Replay

A merchant integration should be able to recover.

NEXG should provide a mechanism to retrieve events from a defined point.

```text
GET /v1/events?after=evt_01...
```

or an equivalent event-delivery mechanism.

This connects directly to Phase 10's checkpoint architecture.

---

# 12.46 Pagination

Collection endpoints should use standardized pagination.

For instance:

```text
GET /v1/orders?limit=50&cursor=...
```

Response:

```text
{
  "data": [],
  "pagination": {
    "nextCursor": "...",
    "hasMore": true
  }
}
```

Cursor pagination is appropriate for large operational datasets because records can continually change.

---

# 12.47 Filtering

Resources should support predictable filters.

Orders:

```text
status
locationId
createdAfter
createdBefore
updatedAfter
externalId
```

Products:

```text
status
locationId
updatedAfter
externalId
```

Bookings:

```text
status
locationId
startAfter
startBefore
```

The documentation should explicitly list supported filters instead of allowing arbitrary query parameters.

---

# 12.48 Incremental Synchronization

Phase 10's synchronization model becomes an API capability.

A merchant can request:

```text
GET /v1/orders?updatedAfter=...
```

and retrieve only records changed since its last synchronization checkpoint.

This is essential for recovery and reconciliation.

---

# 12.49 Expandable Resources

NEXG should avoid enormous default responses.

A resource can return core data while optional related resources can be requested where appropriate.

The exact mechanism should be standardized rather than allowing every endpoint to invent its own behavior.

---

# 12.50 API Rate Limits

NEXG should define rate limits per integration.

Limits can vary by:

```text
environment
endpoint
merchant tier
operation type
```

High-risk operations such as payment creation should receive stricter controls than catalog reads.

---

# 12.51 Rate-Limit Response

When exceeded:

```text
429 Too Many Requests
```

The response should provide enough information for the merchant to retry correctly.

The documentation should define the expected backoff behavior.

---

# 12.52 Sandbox

Every merchant integration should have a safe development environment.

```text
NEXG Sandbox
      ↓
Test Merchant
      ↓
Test Catalog
      ↓
Test Orders
      ↓
Test Payments
      ↓
Test Webhooks
```

Sandbox must not affect production transactions.

---

# 12.53 Test Merchant

A merchant developer should be able to receive test data such as:

```text
Merchant:
MRC-SANDBOX-001

Location:
LOC-SANDBOX-001

Products:
Burger
Coffee
Cake
```

This allows implementation before production access.

---

# 12.54 Test Scenarios

NEXG's sandbox should support deterministic scenarios.

The developer needs to test:

```text
Successful order
Order rejection
Inventory unavailable
Payment success
Payment failure
Booking confirmation
Booking cancellation
Webhook failure
Duplicate request
Invalid state
Rate limit
```

The sandbox should make these states intentionally triggerable.

---

# 12.55 Sandbox Payment Simulation

A merchant should be able to cause:

```text
PAYMENT_SUCCESS
```

or:

```text
PAYMENT_FAILED
```

without moving real money.

This lets the merchant test the entire transaction lifecycle.

---

# 12.56 Sandbox Webhook Testing

The merchant should be able to create an order and observe:

```text
order.created
payment.succeeded
order.confirmed
fulfillment.created
```

delivered to their test endpoint.

This validates both directions of the integration.

---

# 12.57 Production Activation

The production process should be:

```text
Development
   ↓
Sandbox
   ↓
Integration Validation
   ↓
Security Review where required
   ↓
Production Credentials
   ↓
Production Connection
```

The merchant should not simply copy sandbox credentials into production.

---

# 12.58 Integration Health

NEXG should expose integration health.

```text
CONNECTED
HEALTHY
DEGRADED
FAILING
DISCONNECTED
```

Health should incorporate:

```text
authentication
API requests
webhook delivery
synchronization
recent errors
```

---

# 12.59 Integration Logs

Merchant IT teams need visibility.

Each integration should provide:

```text
Request
Response
Timestamp
Endpoint
Status
Request ID
Event ID
Error code
Latency
```

Sensitive information must be redacted.

---

# 12.60 API Observability

NEXG should allow developers to answer:

```text
Did NEXG receive my request?
Did authentication succeed?
Did validation succeed?
Did business logic reject it?
Was it processed?
Was a webhook generated?
Was the webhook delivered?
```

This dramatically reduces integration support time.

---

# 12.61 API Documentation Structure

The actual merchant IT documentation should ultimately be structured as:

```text
NEXG Developer Documentation
│
├── Getting Started
│   ├── Overview
│   ├── Architecture
│   ├── Create Integration
│   ├── Authentication
│   └── First API Request
│
├── Concepts
│   ├── Merchants
│   ├── Locations
│   ├── Catalog
│   ├── Inventory
│   ├── Orders
│   ├── Bookings
│   ├── Payments
│   ├── Fulfillment
│   └── Events
│
├── API Reference
│   ├── Merchants
│   ├── Locations
│   ├── Products
│   ├── Inventory
│   ├── Orders
│   ├── Bookings
│   ├── Payments
│   ├── Fulfillment
│   └── Quotes
│
├── Webhooks
│   ├── Overview
│   ├── Security
│   ├── Events
│   ├── Retries
│   └── Verification
│
├── Guides
│   ├── POS Integration
│   ├── Catalog Sync
│   ├── Inventory Sync
│   ├── Order Integration
│   ├── Booking Integration
│   ├── Payment Integration
│   └── Fulfillment Integration
│
├── Testing
│   ├── Sandbox
│   ├── Test Scenarios
│   └── Troubleshooting
│
└── Reference
    ├── Errors
    ├── States
    ├── Events
    ├── Rate Limits
    ├── Versioning
    └── Changelog
```

---

# 12.62 Every API Endpoint Gets the Same Documentation Standard

Each endpoint should document:

```text
Purpose
Authentication
Required scopes
HTTP method
URL
Path parameters
Query parameters
Headers
Request body
Field definitions
Validation rules
Response
Response fields
Possible errors
State requirements
Idempotency
Side effects
Events emitted
Example request
Example response
```

This is how NEXG avoids documentation becoming fragmented across different teams.

---

# 12.63 Documentation Must Explain Business Meaning

The documentation should not merely say:

```text
POST /orders
```

It should explain:

> Creates an NEXG order from an eligible customer transaction. NEXG validates the merchant, location, products, pricing, availability and fulfillment method before creating the order.

Then it explains exactly what happens.

---

# 12.64 Documentation Must Explain State Machines

A developer needs to see:

```text
CREATED
   ↓
CONFIRMED
   ↓
PREPARING
   ↓
READY
   ↓
FULFILLED
```

and understand:

```text
Who can cause each transition?
Which endpoint causes it?
Which events are emitted?
What happens if it fails?
```

This is more valuable than merely listing statuses.

---

# 12.65 Documentation Must Explain Ownership

For each resource:

```text
Who creates it?
Who updates it?
Who can cancel it?
Who owns its state?
Who receives its events?
```

This directly implements Phase 10.

---

# 12.66 Documentation Must Explain Idempotency

Every developer should know:

```text
When to use it
How to generate it
How long it remains valid
What happens on retry
What response is returned
What happens when the same key is reused with different data
```

This prevents duplicate orders and payments.

---

# 12.67 Documentation Must Explain Errors as Actions

Instead of:

```text
INVENTORY_UNAVAILABLE
```

the documentation should tell the developer what to do:

```text
INVENTORY_UNAVAILABLE

Meaning:
Requested quantity cannot currently be fulfilled.

Merchant action:
Refresh inventory and present the updated availability.

Retry:
Do not immediately retry the same request without changing
the requested quantity or availability state.
```

The documentation becomes operational guidance, not just an API dictionary.

---

# 12.68 OpenAPI as the Machine-Readable Contract

NEXG should maintain an OpenAPI specification as the canonical machine-readable API definition.

It can power:

```text
API Reference
SDK generation
Validation
Testing
Postman collections
Client generation
Contract testing
```

The human documentation and OpenAPI definition should be generated from or continuously validated against the same contract.

---

# 12.69 Contract Testing

NEXG should test:

```text
Merchant Request
      ↓
OpenAPI Schema
      ↓
NEXG API
      ↓
Expected Response
```

Changes to the API contract should automatically be tested for compatibility.

---

# 12.70 SDK Strategy

NEXG can eventually provide official SDKs for common languages:

```text
TypeScript
Python
Java
PHP
C#
```

But SDKs should be generated or maintained from the canonical API contract.

The SDK should not become the only source of truth.

The API contract remains authoritative.

---

# 12.71 Merchant Integration Lifecycle

The complete developer experience becomes:

```text
Merchant Admin
      ↓
Create Integration
      ↓
Select Capabilities
      ↓
Generate Sandbox Credentials
      ↓
Read Documentation
      ↓
Implement
      ↓
Test API
      ↓
Test Webhooks
      ↓
Run Validation
      ↓
Request Production
      ↓
Receive Production Credentials
      ↓
Go Live
      ↓
Monitor
```

---

# 12.72 The First Integration Experience

The documentation should allow a developer to reach a meaningful result quickly.

The first tutorial should be something like:

```text
1. Create sandbox integration
2. Authenticate
3. Retrieve merchant
4. Retrieve locations
5. Retrieve catalog
6. Create test transaction
7. Receive webhook
8. Retrieve transaction
```

That proves the entire connection is functioning.

---

# 12.73 Integration Checklist

A merchant IT team should eventually receive a checklist:

```text
[ ] Sandbox credentials created
[ ] Authentication implemented
[ ] Required scopes verified
[ ] Merchant endpoint implemented
[ ] Location synchronization implemented
[ ] Catalog synchronization implemented
[ ] Inventory synchronization implemented
[ ] Order/booking integration implemented
[ ] Payment handling implemented
[ ] Fulfillment handling implemented
[ ] Webhook endpoint implemented
[ ] Webhook verification implemented
[ ] Idempotency implemented
[ ] Retry handling implemented
[ ] Error handling implemented
[ ] Reconciliation implemented
[ ] Sandbox scenarios passed
[ ] Production credentials issued
[ ] Production monitoring enabled
```

---

# 12.74 Production Readiness

NEXG should not simply ask:

> "Does the API work?"

It should verify:

```text
Authentication
Authorization
Data synchronization
Transaction creation
Payment handling
Webhook handling
Retries
Idempotency
Error handling
Reconciliation
Monitoring
Security
```

Only then should the integration be considered production-ready.

---

# 12.75 API Governance

NEXG needs a formal process for changing the API.

Every proposed change should classify as:

```text
PATCH
MINOR
BREAKING
```

and determine:

```text
Affected endpoints
Affected merchants
Migration requirements
Documentation changes
SDK changes
Sandbox changes
Deprecation period
```

---

# 12.76 Deprecation

NEXG should not suddenly remove APIs.

A deprecated resource should have:

```text
Deprecated
Replacement
Migration guide
Sunset date
```

The merchant developer gets sufficient notice to migrate.

---

# 12.77 The NEXG Developer Contract

Phase 12 therefore establishes a very important principle:

> **Every NEXG integration must have one predictable language for identity, authentication, resources, state, errors, events, synchronization and transactions.**

The merchant should never need to learn one set of conventions for Orders and an entirely different set for Bookings.

---

# 12.78 Phase 12 Final Architecture

The API sits over everything established previously:

```text
                         NEXG API
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
 Authentication         Resources            Events
        │                   │                   │
        │       ┌───────────┼───────────┐       │
        │       ▼           ▼           ▼       │
        │    Catalog     Orders      Bookings    │
        │       │           │           │       │
        │    Inventory   Payments   Fulfillment  │
        │       │           │           │       │
        └───────┴───────────┴───────────┴───────┘
                            │
                     Canonical Model
                            │
                    Business Rules
                            │
                  State / Transaction Engine
                            │
                     Integration Layer
                            │
                       Merchant System
```

---

# 12.79 Phase 12 Deliverables

By the end of this phase, NEXG has defined:

### API foundation

- API versioning
- Resource conventions
- IDs
- Dates
- Money
- Headers
- Request IDs
- Pagination
- Filtering

### Security

- Merchant authentication
- Credential lifecycle
- Credential rotation
- Scopes
- Authorization
- Webhook verification

### Resources

- Merchants
- Locations
- Catalog
- Products
- Inventory
- Orders
- Bookings
- Quotes
- Payments
- Fulfillment
- Transactions

### Reliability

- Idempotency
- Retries
- Error model
- Conflict handling
- Rate limiting
- Recovery
- Reconciliation

### Events

- Event envelope
- Event types
- Webhooks
- Delivery
- Retry
- Replay
- Ordering

### Developer experience

- Sandbox
- Test data
- Test scenarios
- Production activation
- Integration health
- Logs
- OpenAPI
- SDK strategy
- Contract testing

### Documentation

```text
Getting Started
        ↓
Concepts
        ↓
Guides
        ↓
API Reference
        ↓
Webhooks
        ↓
Testing
        ↓
Troubleshooting
        ↓
Reference
```

---

# The result of Phases 1–12

We now have a much clearer progression:

```text
PHASE 1
NEXG Taxonomy & Business Classification
        ↓
PHASE 2
Merchant Capability Architecture
        ↓
PHASE 3
Merchant Operating Model
        ↓
PHASE 4
NEXG Platform Domain Architecture
        ↓
PHASE 5
Merchant Onboarding & Integration Lifecycle
        ↓
PHASE 6
Merchant Catalog & Capability Configuration
        ↓
PHASE 7
Operational Workflow Architecture
        ↓
PHASE 8
Identity, Security & Access Architecture
        ↓
PHASE 9
NEXG Event & Communication Architecture
        ↓
PHASE 10
Data Synchronization & Consistency
        ↓
PHASE 11
Commerce, Transactions, Payments & Fulfillment
        ↓
PHASE 12
Merchant Integration API & Developer Contract
```

**Phase 12 is the point where the architecture starts becoming an actual developer platform.**

The next phase should therefore move one layer deeper: **Phase 13 — NEXG Webhooks, Events, Notifications & Real-Time Integration Architecture**, where we formally design the event catalog, event naming, payload contracts, delivery guarantees, webhook lifecycle, notification triggers, merchant subscriptions and how events connect to the NEXG operational workflows.

## Prompt:
8/7/2026, 11:12:02 AM

How many more phases to go 
Summarize

## Response:
8/7/2026, 11:12:03 AM

We currently have **12 phases completed**.

I’d structure the full NEXG Merchant Integration & Developer Platform program at **18 phases total**.

### Remaining: 6 phases

| Phase | Area | What we produce |
|---|---|---|
| **13** | Events & Webhooks | Complete NEXG event catalog, webhook contracts, delivery, retries, replay and subscriptions |
| **14** | Real-Time & Notifications | How orders, bookings, payments and operational events reach apps, merchants, riders, hosts and customers |
| **15** | Security & Compliance | Production security model, secrets, encryption, RBAC, audit, data protection, fraud controls and Kenyan requirements |
| **16** | Sandbox, Testing & Certification | Merchant test environment, test scenarios, contract testing, integration certification and go-live requirements |
| **17** | Developer Documentation System | The actual documentation architecture: Getting Started, Guides, API Reference, schemas, examples, troubleshooting and changelog |
| **18** | Production Operations & Governance | Versioning, SLAs, monitoring, incident management, deprecation, support, onboarding governance and long-term API evolution |

### Where we are

```text
PHASE 1   Taxonomy & Business Classification       ✓
PHASE 2   Merchant Capabilities                    ✓
PHASE 3   Merchant Operating Model                 ✓
PHASE 4   Platform Domain Architecture             ✓
PHASE 5   Merchant Onboarding                      ✓
PHASE 6   Catalog & Capability Configuration       ✓
PHASE 7   Operational Workflows                    ✓
PHASE 8   Identity & Security Architecture         ✓
PHASE 9   Events & Communication Architecture       ✓
PHASE 10  Data Synchronization                     ✓
PHASE 11  Transactions & Fulfillment               ✓
PHASE 12  Merchant API Contract                    ✓
────────────────────────────────────────────────────
PHASE 13  Events & Webhooks                        →
PHASE 14  Real-Time & Notifications                →
PHASE 15  Security & Compliance                    →
PHASE 16  Sandbox & Certification                 →
PHASE 17  Developer Documentation                  →
PHASE 18  Production Operations & Governance       →
```

### The important distinction

We're **not 12 phases into "writing documentation."**

We're 12 phases into **designing the system that the documentation will describe**.

By Phase 18, we should have the foundation for a genuine NEXG developer platform:

**NEXG taxonomy → merchant capabilities → data → workflows → transactions → APIs → events → security → testing → documentation → production governance.**

Then the next major step would be to turn these 18 phases into the **actual NEXG Merchant Integration Specification**, with concrete schemas, endpoint definitions, event contracts, state machines and implementation rules.

## Prompt:
8/7/2026, 11:12:59 AM

Phase 13

## Response:
8/7/2026, 11:13:00 AM

# Phase 13 — NEXG Events, Webhooks & Event Delivery Architecture

Phase 13 defines **how NEXG communicates state changes to merchant systems and how merchant systems communicate asynchronous events back to NEXG**.

Phase 12 established the synchronous API:

```text
Merchant System
      ↓
NEXG API
      ↓
Request
      ↓
Response
```

Phase 13 adds the asynchronous layer:

```text
NEXG
  │
  │ state change
  ▼
Event
  │
  ├── Internal NEXG systems
  ├── Merchant webhook
  ├── Consumer application
  ├── Rider application
  ├── Host application
  └── Notifications
```

The key principle is:

> **The API answers "what is the state now?" Events communicate "what just happened?"**

---

# 13.1 Why NEXG Needs an Event Architecture

A merchant should not have to repeatedly ask:

```text
GET /orders
GET /orders
GET /orders
GET /orders
```

waiting for an order to change.

Instead:

```text
Customer places order
        ↓
NEXG creates order
        ↓
order.created
        ↓
Merchant receives webhook
```

The merchant can then update its own system immediately.

---

# 13.2 Events Are Not Notifications

NEXG must separate:

```text
EVENT
```

from:

```text
NOTIFICATION
```

An event is a system-level fact:

```text
order.confirmed
```

A notification is a communication decision:

```text
Send customer push notification
Send merchant email
Send merchant dashboard alert
```

Therefore:

```text
Event
  ↓
Event Processing
  ↓
Notification Policy
  ↓
Communication
```

This separation is critical.

---

# 13.3 The NEXG Event Lifecycle

Every significant state transition follows:

```text
Business Action
      ↓
State Change
      ↓
Event Created
      ↓
Event Stored
      ↓
Event Distributed
      ↓
Subscribers Receive Event
      ↓
Acknowledgement
      ↓
Retry if Necessary
```

The event must be created as part of the authoritative transaction rather than being an afterthought.

---

# 13.4 Event Identity

Every event receives a unique ID.

```text id="x5f1t8"
evt_01K...
```

The ID must remain stable across retries.

If the merchant receives:

```text id="6v6i4c"
evt_01K123
```

three times, it is still **one event**.

---

# 13.5 Event Envelope

Every NEXG event should use a consistent envelope.

```text id="q5d8m2"
{
  "id": "evt_01K...",
  "type": "order.created",
  "version": "1",
  "createdAt": "2026-08-07T08:42:31Z",
  "resource": {
    "type": "order",
    "id": "ord_01K..."
  },
  "merchantId": "mrc_01K...",
  "data": {}
}
```

The envelope should remain consistent across event types.

---

# 13.6 Event Type

The event type identifies what happened.

NEXG should use:

```text id="g1j7yq"
resource.action
```

Examples:

```text
order.created
order.confirmed
order.rejected
order.cancelled
order.completed
```

Bookings:

```text
booking.created
booking.confirmed
booking.cancelled
booking.completed
```

Payments:

```text
payment.created
payment.succeeded
payment.failed
payment.refunded
```

Fulfillment:

```text
fulfillment.created
fulfillment.assigned
fulfillment.started
fulfillment.completed
```

---

# 13.7 Event Naming Rules

Event names must be:

- lowercase
- deterministic
- resource-oriented
- action-oriented
- stable

Use:

```text
order.confirmed
```

not:

```text
ORDER_HAS_BEEN_CONFIRMED
```

and not:

```text
confirmOrderEvent
```

Consistency becomes increasingly important as the event catalog grows.

---

# 13.8 Event Version

Events need their own contract version.

```text id="2d4c8h"
"type": "order.created",
"version": "1"
```

This allows NEXG to evolve event payloads without silently breaking integrations.

---

# 13.9 Resource vs Event

An event is not the resource itself.

```text id="7y5a4e"
Order
ord_123
```

is the resource.

```text id="j0b6r8"
order.confirmed
```

is the event describing a change involving that resource.

The merchant can use:

```text id="h4s9v1"
GET /v1/orders/ord_123
```

to retrieve the authoritative current resource.

---

# 13.10 Event Payload Strategy

NEXG should decide whether events contain:

```text id="2p8x9k"
Minimal payload
```

or:

```text id="7s4c1e"
Full resource snapshot
```

The recommended NEXG model is:

> **Provide enough information to process the event, while keeping the canonical resource available through the API.**

For example:

```text id="4t3c6q"
{
  "resource": {
    "type": "order",
    "id": "ord_123"
  },
  "data": {
    "status": "confirmed"
  }
}
```

The merchant can retrieve the complete order if needed.

---

# 13.11 Event Data Should Be Versioned

If an event's payload changes materially, the event contract must change in a controlled manner.

A merchant should never discover unexpectedly that:

```text id="y4x8p3"
data.price
```

has changed from:

```text id="j4s9w0"
number
```

to:

```text id="p3c8v2"
object
```

without a contract change.

---

# 13.12 NEXG Event Domains

The initial event catalog should cover:

```text id="4u0f4k"
Merchant
Location
Catalog
Product
Inventory
Order
Booking
Quote
Payment
Fulfillment
Transaction
Settlement
Integration
```

Not every domain needs events immediately, but the naming architecture should accommodate them.

---

# 13.13 Merchant Events

Merchant-level events:

```text id="4g5d3j"
merchant.updated
merchant.suspended
merchant.reactivated
merchant.capability.updated
```

These communicate important changes to merchant integrations.

---

# 13.14 Location Events

```text id="n7x6d2"
location.created
location.updated
location.activated
location.suspended
```

A merchant system can synchronize its operational locations accordingly.

---

# 13.15 Product Events

```text id="8v0e7k"
product.created
product.updated
product.activated
product.deactivated
product.deleted
```

This supports the catalog synchronization architecture established in Phase 10.

---

# 13.16 Inventory Events

Inventory events are especially important.

```text id="f3s2d1"
inventory.updated
inventory.reserved
inventory.released
inventory.depleted
```

A merchant's POS or inventory system can react without polling continuously.

---

# 13.17 Order Event Catalog

The initial order event lifecycle:

```text id="x3h1q9"
order.created
order.accepted
order.rejected
order.confirmed
order.preparing
order.ready
order.cancelled
order.completed
```

Only valid states for the particular order workflow should be emitted.

---

# 13.18 Booking Event Catalog

```text id="b8n4k2"
booking.created
booking.held
booking.confirmed
booking.assigned
booking.started
booking.cancelled
booking.completed
booking.expired
```

This supports airport transfers, rentals, wellness appointments and experiences.

---

# 13.19 Quote Events

```text id="k6r5x3"
quote.created
quote.sent
quote.updated
quote.accepted
quote.rejected
quote.expired
quote.cancelled
```

This supports the quote-based workflows defined in Phase 11.

---

# 13.20 Payment Events

```text id="m1x8v5"
payment.created
payment.pending
payment.authorized
payment.succeeded
payment.failed
payment.cancelled
payment.refunded
```

Payment events should never expose sensitive payment credentials.

---

# 13.21 Fulfillment Events

```text id="w5c9q2"
fulfillment.created
fulfillment.assigned
fulfillment.started
fulfillment.delayed
fulfillment.completed
fulfillment.cancelled
```

For delivery:

```text id="7x2m5a"
fulfillment.assigned
```

can communicate rider assignment.

For airport transfer:

```text id="0p9d4k"
fulfillment.started
```

can represent the beginning of the transfer.

---

# 13.22 Settlement Events

Merchant financial systems may need:

```text id="z7q3w1"
settlement.created
settlement.processing
settlement.completed
settlement.failed
settlement.adjusted
```

This keeps settlement separate from customer payment events.

---

# 13.23 Integration Events

NEXG itself should expose integration health events where appropriate:

```text id="f5h8s3"
integration.connected
integration.disconnected
integration.degraded
integration.recovered
```

These are particularly useful for NEXG operations.

---

# 13.24 Event Subscriptions

Merchants should not automatically receive every NEXG event.

They configure subscriptions.

```text id="4x8n2p"
Integration
     ↓
Subscriptions
     ├── order.*
     ├── payment.succeeded
     └── fulfillment.*
```

This reduces unnecessary traffic and improves security.

---

# 13.25 Capability-Aware Subscriptions

A merchant should only be allowed to subscribe to events related to its authorized capabilities.

A restaurant integration might subscribe to:

```text id="9v2m6k"
order.*
payment.succeeded
fulfillment.*
```

It should not automatically receive:

```text id="x8h1q3"
another merchant's events
```

or unrelated customer information.

---

# 13.26 Webhook Endpoint

The merchant registers:

```text id="b4q6s8"
Webhook URL
https://merchant-system.example/webhooks/nexg
```

NEXG associates the endpoint with the merchant integration.

---

# 13.27 Multiple Webhook Endpoints

NEXG should support multiple endpoints where useful.

A merchant may have:

```text id="w7m2n4"
Production
   ↓
ERP webhook

Operations
   ↓
Order management webhook

Analytics
   ↓
Data webhook
```

Each endpoint can have its own subscriptions.

---

# 13.28 Webhook Delivery

The delivery architecture:

```text id="g8x5q1"
Event
  ↓
Subscription Matching
  ↓
Webhook Delivery
  ↓
Merchant
  ↓
HTTP Response
```

The event remains stored independently of delivery success.

---

# 13.29 Webhook Acknowledgement

The merchant should return a successful HTTP response when it has safely accepted the event.

A successful acknowledgement means:

```text id="n1m6r3"
NEXG
"Delivery accepted."
```

It does not necessarily mean the merchant's entire downstream business workflow has finished.

---

# 13.30 Webhook Timeout

NEXG should have a defined webhook timeout.

If the merchant does not respond within that period:

```text id="c7x3m8"
Delivery
FAILED
```

and the retry policy begins.

The exact timeout becomes a formal NEXG platform parameter.

---

# 13.31 Retry Strategy

Webhook delivery should use controlled retries.

```text id="u2v9p4"
Attempt 1
   ↓
Failure
   ↓
Wait
   ↓
Attempt 2
   ↓
Failure
   ↓
Wait
   ↓
Attempt 3
```

The intervals should be documented and implemented consistently.

---

# 13.32 Exponential Backoff

Retry intervals should generally increase.

```text id="5m8r2w"
Short delay
      ↓
Longer delay
      ↓
Longer delay
      ↓
Final attempt
```

This prevents a failing merchant server from being overwhelmed by repeated requests.

---

# 13.33 Maximum Retry Period

NEXG should define how long automatic retries continue.

After the retry window ends:

```text id="c4n8x1"
Webhook
DELIVERY_FAILED
```

The event remains available for recovery through replay or event retrieval.

---

# 13.34 Dead-Letter Events

Failed deliveries should move into a recoverable state.

```text id="9p4w7s"
Event
 ↓
Delivery Failed
 ↓
Retry Exhausted
 ↓
Dead-Letter
```

Operations can then inspect and replay the event.

---

# 13.35 Event Replay

NEXG should allow authorized replay.

```text id="r3m8x5"
Dead-Letter Event
      ↓
Replay
      ↓
Webhook
      ↓
Merchant
```

The replay must retain the original:

```text id="f2w7n4"
eventId
```

so the merchant can identify it as the same event.

---

# 13.36 Duplicate Events Are Expected

NEXG should explicitly document:

> **Webhook consumers must be idempotent.**

A merchant may receive:

```text id="e4x9p2"
evt_123
evt_123
```

twice.

It must process the event once.

This is a fundamental property of reliable distributed systems.

---

# 13.37 Merchant Event Processing

The merchant should maintain an event-processing record.

```text id="j8q3v5"
eventId
receivedAt
processedAt
status
```

When:

```text id="q4m7x1"
evt_123
```

arrives again, the merchant recognizes that it has already been processed.

---

# 13.38 Event Ordering

NEXG should not assume that network delivery guarantees global ordering.

A merchant may receive:

```text id="p7s2d8"
order.confirmed
```

before:

```text id="t5v9k3"
order.created
```

if separate delivery paths or retries are involved.

Therefore the event contains:

```text id="n3x6q1"
createdAt
resourceId
eventId
```

and where required:

```text id="r8w4m2"
sequence
```

---

# 13.39 Resource Version

For resources where ordering matters, NEXG can expose:

```text id="x6c2n9"
resourceVersion
```

A merchant can determine:

```text id="k4p8s3"
Version 7
```

is newer than:

```text id="b1m5q7"
Version 6
```

This is particularly useful for catalog and inventory synchronization.

---

# 13.40 Event Sequence

For a specific resource:

```text id="s2v7q9"
order.created
sequence: 1

order.confirmed
sequence: 2

order.preparing
sequence: 3

order.ready
sequence: 4
```

This gives merchants a deterministic way to detect missing events.

---

# 13.41 Missing Event Recovery

If a merchant sees:

```text id="q5r1m8"
sequence 7
```

but its last processed event was:

```text id="n8x4c2"
sequence 5
```

it knows something is missing.

It can request event recovery through the defined event API.

---

# 13.42 Event Retrieval API

NEXG should provide an authorized event history mechanism.

Conceptually:

```text id="m7p2v5"
GET /v1/events
```

with filters such as:

```text id="k1x8q4"
resourceId
eventType
createdAfter
createdBefore
cursor
```

This is not a replacement for webhooks.

It is a recovery and reconciliation mechanism.

---

# 13.43 Event Retention

NEXG must define how long event history is retained.

The retention policy should support:

```text id="z3m7q1"
normal recovery
integration debugging
reconciliation
operational investigation
```

Longer-term audit records may have a separate retention policy.

---

# 13.44 Event Security

Events may contain sensitive business information.

NEXG must enforce:

```text id="x8n2m5"
merchant isolation
scope restrictions
endpoint authorization
payload minimization
secure transport
signature verification
```

One merchant must never receive another merchant's event.

---

# 13.45 Webhook Signature

NEXG should sign the raw payload.

Conceptually:

```text id="q2v7s4"
signature =
HMAC(secret, timestamp + "." + payload)
```

The actual cryptographic standard and header format should be finalized in the security phase.

The merchant verifies:

```text id="f5m1x8"
timestamp
+
signature
+
raw payload
```

before processing the event.

---

# 13.46 Replay Protection

A webhook timestamp prevents an attacker from capturing an old valid webhook and replaying it indefinitely.

The merchant should reject events outside the documented tolerance window unless replay has been explicitly authorized through NEXG's recovery mechanism.

---

# 13.47 Webhook Secret Rotation

Merchant IT teams should be able to rotate webhook secrets.

```text id="n4x8c2"
Create new secret
      ↓
Deploy new secret
      ↓
Verify
      ↓
Retire old secret
```

This should not require rebuilding the integration.

---

# 13.48 Event Privacy

NEXG should follow the principle:

> **Send the minimum data required for the recipient to perform its authorized operation.**

An `order.confirmed` event does not automatically need to contain every customer attribute stored by NEXG.

---

# 13.49 Customer Data in Events

Where customer data is required, NEXG should define precisely which fields may appear.

Potentially:

```text id="z6x1q8"
customerId
displayName
contact information required for fulfillment
```

Sensitive information should not be exposed merely because it exists internally.

---

# 13.50 Event-to-API Recovery Pattern

The recommended pattern is:

```text id="r5m9x2"
Webhook
   ↓
Read Event
   ↓
Validate Signature
   ↓
Record eventId
   ↓
Acknowledge
   ↓
GET canonical resource if needed
   ↓
Process
```

This allows the event to remain lightweight while the API remains authoritative.

---

# 13.51 Event-to-Notification Architecture

NEXG should then use events to drive communications.

```text id="h3x7q9"
order.confirmed
       │
       ├── Merchant integration
       │
       ├── Customer push
       │
       ├── Customer email
       │
       └── Operations
```

The event itself does not decide which communications occur.

Notification policy does.

---

# 13.52 Communication Policy

For every important event NEXG should determine:

```text id="c8m2x5"
Audience
Channel
Priority
Template
Timing
Conditions
```

For:

```text id="v6q1s9"
payment.succeeded
```

the customer may receive an in-app confirmation and receipt, while the merchant integration receives the event.

---

# 13.53 Event Priority

Not every event deserves the same operational priority.

Potential levels:

```text id="j4x8p2"
CRITICAL
HIGH
NORMAL
LOW
```

Payment failure and fulfillment failure may require higher operational priority than a catalog metadata update.

---

# 13.54 Internal Event Bus

Inside NEXG, events should flow through an internal event architecture.

```text id="n8q3v6"
NEXG Service
     ↓
Event
     ↓
Event Bus
     ├── Order processing
     ├── Notifications
     ├── Analytics
     ├── Audit
     ├── Merchant webhooks
     └── Operations
```

This prevents each system from tightly coupling itself to every other system.

---

# 13.55 Event Source of Truth

The event describes a change.

The canonical business database remains authoritative for the current resource state.

```text id="z7m2x4"
Database
   ↓
Current Truth

Event Store
   ↓
History of Changes
```

Neither should be casually substituted for the other.

---

# 13.56 Transaction + Event Consistency

NEXG must avoid this failure:

```text id="c2v8n6"
Order saved
   ↓
Server crashes
   ↓
Event never created
```

The architecture should use a reliable transaction-to-event mechanism such as an **outbox pattern**.

Conceptually:

```text id="h5q1m9"
Database Transaction
 ├── Update Order
 └── Write Event to Outbox
          ↓
       Commit
          ↓
     Event Publisher
          ↓
      Webhooks
```

This ensures the business change and event record are committed together.

---

# 13.57 Outbox Processing

The publisher reads:

```text id="y8x4c2"
PENDING
```

events from the outbox and publishes them.

Then:

```text id="p6m1q9"
PUBLISHED
```

The event remains available for delivery tracking.

---

# 13.58 Delivery State

Each webhook delivery can have its own state:

```text id="r4x7n2"
PENDING
DELIVERING
DELIVERED
RETRYING
FAILED
DEAD_LETTER
```

This is different from the event's own state.

One event can have:

```text id="k9m3v5"
Merchant A → DELIVERED
Merchant B → RETRYING
Merchant C → FAILED
```

---

# 13.59 Event Fan-Out

One NEXG event may serve many subscribers.

```text id="t7q2x8"
order.confirmed
      │
      ├── Merchant webhook
      ├── NEXG notifications
      ├── Analytics
      ├── Operations
      └── Audit
```

The event is generated once and distributed to authorized consumers.

---

# 13.60 Merchant-Specific Event Streams

NEXG should enforce tenant isolation.

Conceptually:

```text id="n2x8q5"
Merchant A
 └── Events A

Merchant B
 └── Events B
```

No shared subscription should accidentally leak another merchant's resources.

---

# 13.61 Event Filtering

Subscriptions can eventually support:

```text id="c5m9x2"
event type
location
resource
capability
```

A large merchant could subscribe to:

```text id="g8q1v4"
orders from Location A
```

without receiving unrelated Location B events.

---

# 13.62 Event Delivery Dashboard

The merchant portal should eventually provide an integration view:

```text id="x4n7m2"
Webhook Health
────────────────────
Endpoint       Healthy
Last Delivery  11:42
Success Rate   99.8%

Recent Events
────────────────────
order.created       Delivered
order.confirmed     Delivered
payment.succeeded   Delivered
fulfillment.updated Retrying
```

This reduces dependency on NEXG support.

---

# 13.63 Event Troubleshooting

A developer should be able to search:

```text id="q8x2m5"
Event ID
Order ID
Request ID
Delivery ID
```

and reconstruct:

```text id="z5n1v7"
Event Created
     ↓
Subscription Matched
     ↓
Delivery Attempt 1
     ↓
Timeout
     ↓
Delivery Attempt 2
     ↓
Success
```

This is essential for production integrations.

---

# 13.64 Event Delivery Metrics

NEXG should monitor:

```text id="j2x7m4"
Events generated
Events delivered
Delivery latency
Failure rate
Retry rate
Dead-letter count
Webhook response latency
```

Per:

```text id="n5q8c1"
merchant
endpoint
event type
environment
```

---

# 13.65 Merchant Event Contract

The merchant documentation must explain every event with:

```text id="v7m2x5"
Event name
Description
When emitted
Resource
Payload schema
Required fields
Possible state
Ordering behavior
Retry behavior
Security
Example payload
```

This makes the event catalog implementable.

---

# 13.66 Example: `order.confirmed`

```text id="q4n8x2"
Event:
order.confirmed

When:
NEXG confirms an eligible order.

Resource:
order

Payload:
{
  "id": "evt_01...",
  "type": "order.confirmed",
  "version": "1",
  "resource": {
    "type": "order",
    "id": "ord_01..."
  },
  "data": {
    "status": "confirmed"
  }
}
```

Merchant action:

```text id="m6x1p8"
Update local order
↓
Begin merchant fulfillment workflow
```

---

# 13.67 Example: `payment.succeeded`

```text id="x8q3m5"
Event:
payment.succeeded

Resource:
payment

Data:
{
  "status": "succeeded",
  "amount": {
    "amount": 2450,
    "currency": "KES"
  }
}
```

The merchant can update its payment state without treating the webhook as the complete payment record.

---

# 13.68 Example: `fulfillment.assigned`

For a delivery:

```text id="p4n7x2"
Event:
fulfillment.assigned

Data:
{
  "status": "assigned",
  "assignment": {
    "type": "rider",
    "id": "rdr_01..."
  }
}
```

This can allow the merchant system to update:

```text id="j9m2q5"
Rider assigned
```

without polling.

---

# 13.69 Event Architecture for the Existing NEXG Taxonomy

The taxonomy from Phase 1 now gains operational meaning.

```text id="s5x8n2"
Restaurants & Food
        ↓
Order Events

Airport Transfers
        ↓
Booking + Fulfillment Events

Vehicle Rentals
        ↓
Booking + Rental Events

Wellness
        ↓
Appointment / Booking Events

Experiences
        ↓
Booking Events

Laundry & Cleaning
        ↓
Service + Fulfillment Events

Concierge Services
        ↓
Request + Quote + Fulfillment Events

Logistics & Shipping
        ↓
Shipment + Fulfillment Events
```

The 21 categories do not each need a completely independent event platform.

They use the common NEXG event architecture with domain-specific event vocabularies.

---

# 13.70 Phase 13 Deliverables

At the end of this phase, NEXG has defined:

### Event foundation

- Event envelope
- Event IDs
- Event types
- Event versions
- Resource references
- Event payload strategy
- Event naming conventions

### Event catalog

- Merchant events
- Location events
- Catalog events
- Product events
- Inventory events
- Order events
- Booking events
- Quote events
- Payment events
- Fulfillment events
- Settlement events
- Integration events

### Webhooks

- Endpoint registration
- Subscriptions
- Delivery
- Acknowledgement
- Retry
- Backoff
- Dead-letter handling
- Replay

### Reliability

- Idempotency
- Duplicate handling
- Event ordering
- Resource versions
- Missing-event recovery
- Event retention
- Outbox architecture

### Security

- Merchant isolation
- Webhook signatures
- Replay protection
- Secret rotation
- Payload minimization
- Scope-based event access

### Operations

- Delivery logs
- Event tracing
- Delivery metrics
- Integration health
- Troubleshooting
- Replay tooling

---

# 13.71 The NEXG Communication Architecture After Phase 13

We now have three distinct communication mechanisms:

```text
                    NEXG
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
       API         EVENTS     NOTIFICATIONS
        │            │            │
   Request/       State       Human-facing
   Response       Change       Communication
        │            │            │
        ▼            ▼            ▼
 Merchant System  Webhooks   Customer/Merchant/
                            Host/Rider
```

And internally:

```text
Business Transaction
        ↓
Database State Change
        ↓
Outbox Event
        ↓
Event Bus
        ├── Merchant Webhook
        ├── Notifications
        ├── Audit
        ├── Analytics
        └── Operations
```

That is the foundation that allows NEXG to operate as a **real multi-tenant platform**, rather than a collection of disconnected APIs.

**Next: Phase 14 — NEXG Real-Time & Notification Architecture**, where we define exactly how these events become live updates, push notifications, email, SMS, in-app notifications, merchant alerts, rider updates and customer communication—and, importantly, which events deserve which channel.

## Prompt:
8/7/2026, 11:14:24 AM

Phase 14

## Response:
8/7/2026, 11:14:25 AM

# Phase 14 — NEXG Real-Time & Notification Architecture

Phase 13 established **events and webhooks**: NEXG can now detect and distribute things that happen.

Phase 14 defines what NEXG does **after an event occurs** when someone needs to see, hear about, or react to it.

The architecture becomes:

```text
Business Action
      ↓
State Change
      ↓
NEXG Event
      ↓
Notification / Real-Time Policy
      ↓
Audience
      ↓
Channel
      ↓
Delivery
      ↓
Read / Action
```

The central rule is:

> **An event is a fact. A notification is a deliberate communication generated from that fact.**

---

# 14.1 NEXG Communication Is Multi-Audience

NEXG has several distinct audiences.

```text
Customer
Merchant
Merchant Staff
Rider / Driver
Host / Property Manager
NEXG Operations
NEXG Administrators
```

The same event may produce completely different communications for each.

```text
order.confirmed
       │
       ├── Customer → Push
       ├── Merchant → Dashboard / Webhook
       ├── Rider → App update
       └── Operations → Monitoring
```

There should never be a rule saying:

```text
Every event → Email
```

The communication policy decides what deserves communication.

---

# 14.2 Communication Types

NEXG should distinguish:

```text
REAL_TIME_UPDATE
PUSH_NOTIFICATION
EMAIL
SMS
IN_APP_NOTIFICATION
WEBHOOK
DASHBOARD_ALERT
```

These are different delivery mechanisms.

---

# 14.3 Real-Time Updates

Real-time updates are primarily for applications that are currently open.

Architecture:

```text
NEXG Event
    ↓
Real-Time Gateway
    ↓
Connected Client
    ↓
UI Update
```

The customer does not need to refresh the screen.

---

# 14.4 Real-Time Transport

NEXG should support a persistent real-time connection such as:

```text
WebSocket
```

with a fallback mechanism where appropriate.

The connection should be authenticated and scoped.

```text
Customer Session
      ↓
Authenticated Connection
      ↓
Authorized Event Stream
```

---

# 14.5 Real-Time Is Not the Source of Truth

A real-time message should never be treated as permanent storage.

Suppose the customer receives:

```text
order.ready
```

The application updates the UI.

If the customer reconnects later, it should retrieve the authoritative order state through the API.

```text
Real-Time
   ↓
Immediate UI

API
   ↓
Authoritative State
```

---

# 14.6 Real-Time Connection Lifecycle

The client connection should have:

```text
CONNECTING
CONNECTED
DEGRADED
RECONNECTING
DISCONNECTED
```

The application should automatically attempt reconnection according to NEXG's documented strategy.

---

# 14.7 Connection Authentication

The client should not receive a general merchant or customer event stream merely because it has an open WebSocket.

The connection must be associated with:

```text
identity
tenant
role
permissions
subscriptions
```

NEXG determines exactly which events the connection can receive.

---

# 14.8 Channel Authorization

A customer should receive:

```text
Their orders
Their bookings
Their payments
Their relevant service updates
```

A merchant should receive:

```text
Its orders
Its bookings
Its fulfillment
Its operational events
```

A rider should receive:

```text
Assigned deliveries
Assigned jobs
Relevant route / fulfillment updates
```

This is tenant and identity isolation at the communication layer.

---

# 14.9 Notification Policy Engine

NEXG needs a formal notification policy layer.

```text
Event
 ↓
Who is affected?
 ↓
Is communication required?
 ↓
Which channel?
 ↓
Which template?
 ↓
What priority?
 ↓
When should it be sent?
```

This prevents individual services from implementing random notification rules.

---

# 14.10 Notification Rule Structure

A notification rule can conceptually contain:

```text
event
audience
channel
priority
template
conditions
timing
fallback
```

For:

```text
payment.succeeded
```

the rule might determine:

```text
Customer
→ In-app + receipt

Merchant
→ Dashboard update

NEXG Finance
→ Ledger event
```

There is no reason to automatically email everyone.

---

# 14.11 Mandatory vs Optional Communications

NEXG should classify communications.

### Mandatory operational communication

Important information required to complete a transaction.

```text
Order confirmation
Booking confirmation
Payment receipt
Cancellation
Refund
Critical fulfillment change
```

### Optional communication

Useful but not essential.

```text
Promotional suggestions
Recommendations
Marketing campaigns
```

Marketing should remain outside the core transactional notification engine.

---

# 14.12 Transactional Communication

The core NEXG notification system should focus on operational communication.

Examples:

```text
Order confirmed
Order rejected
Order ready
Order delivered
Booking confirmed
Booking cancelled
Payment successful
Payment failed
Refund issued
Driver assigned
Service completed
```

These communications are directly tied to business events.

---

# 14.13 Notification Preferences

Users may control appropriate communication preferences.

```text
Customer
 ├── Push
 ├── Email
 └── SMS
```

But NEXG must distinguish between:

```text
preference
```

and:

```text
required operational communication
```

A customer opting out of promotional email should not prevent a critical transactional email from being delivered where required.

---

# 14.14 Preference Model

Preferences should be structured by:

```text
user
event category
channel
```

Conceptually:

```text
Customer
   │
   ├── Transactional
   │      ├── Push: ON
   │      ├── Email: ON
   │      └── SMS: ON
   │
   └── Marketing
          ├── Push: OFF
          ├── Email: OFF
          └── SMS: OFF
```

---

# 14.15 Merchant Notification Preferences

Merchants also need communication preferences.

A merchant might choose:

```text
New order
→ Dashboard + sound

Payment failure
→ Dashboard + email

Daily settlement
→ Email

System outage
→ SMS + email
```

The merchant configuration should control this where the communication is optional.

---

# 14.16 Staff Notifications

A merchant may have multiple users.

```text
Merchant
 ├── Manager
 ├── Cashier
 ├── Kitchen
 └── Operations
```

Notifications can be role-targeted.

A new restaurant order can go to:

```text
Kitchen
```

while a settlement failure goes to:

```text
Finance / Manager
```

---

# 14.17 Notification Routing

NEXG should therefore resolve:

```text
Event
   ↓
Affected Entity
   ↓
Affected Users / Roles
   ↓
Eligible Channels
   ↓
Notification
```

This is more powerful than simply attaching an email address to every event.

---

# 14.18 Notification Priority

NEXG should classify notification urgency.

```text
CRITICAL
HIGH
NORMAL
LOW
```

### Critical

```text
Payment/security failure
Critical operational failure
Emergency service change
```

### High

```text
Order rejected
Driver unable to fulfill
Booking cancelled
```

### Normal

```text
Order confirmed
Payment receipt
Booking confirmation
```

### Low

```text
Non-critical updates
```

---

# 14.19 Channel Selection

NEXG should use channel selection based on urgency and context.

```text
Critical
→ Push + SMS where justified

High
→ Push + Email where appropriate

Normal
→ Push / In-app

Receipt
→ Email + In-app

Merchant integration
→ Webhook
```

This should be policy-driven rather than hard-coded into business services.

---

# 14.20 Email

NEXG already has a transactional email architecture.

Phase 14 connects it to the event system:

```text
Event
 ↓
Notification Policy
 ↓
Email Job / Dispatch
 ↓
Email Template
 ↓
Email Provider
 ↓
Recipient
```

The email system should consume structured notification requests rather than having every business service construct emails independently.

---

# 14.21 Email Template Selection

The event determines the semantic communication.

```text
order.confirmed
```

maps to the appropriate NEXG transactional template.

The template then receives structured data:

```text
order
customer
merchant
items
total
fulfillment
```

The template should not query the database itself.

---

# 14.22 Email Rendering

The email layer should produce:

```text
Subject
Preheader
HTML
Plain Text
```

and use the NEXG email design system.

The communication architecture therefore becomes:

```text
Event
 ↓
Notification
 ↓
Template
 ↓
Renderer
 ↓
Provider
```

---

# 14.23 Email Delivery Status

NEXG should track:

```text
QUEUED
SENT
DELIVERED
BOUNCED
FAILED
```

Where provider capabilities allow additional statuses:

```text
OPENED
CLICKED
```

But those engagement metrics should not be confused with transaction completion.

---

# 14.24 SMS

SMS should be reserved for communications where its immediacy and reach justify the cost.

Strong candidates include:

```text
OTP
Critical booking changes
Driver arrival
Urgent fulfillment changes
Important payment issues
```

Not every ordinary event needs SMS.

---

# 14.25 Push Notifications

Push is the primary immediate mobile communication mechanism.

Examples:

```text
Your order has been confirmed.
Your rider is on the way.
Your booking has been confirmed.
Your payment was successful.
```

Push payloads should contain enough information to route the user to the correct application screen.

---

# 14.26 Push Payload

Conceptually:

```text
{
  "type": "order.confirmed",
  "resourceType": "order",
  "resourceId": "ord_01...",
  "title": "...",
  "body": "..."
}
```

The application then opens:

```text
Order Detail
```

rather than blindly interpreting arbitrary text.

---

# 14.27 In-App Notifications

NEXG should maintain an in-app notification center.

```text
Notifications
──────────────────
Order confirmed
Payment received
Driver assigned
Booking confirmed
```

Notifications should have:

```text
notificationId
type
title
body
resource
createdAt
readAt
```

---

# 14.28 Read State

A notification should have:

```text
UNREAD
READ
```

The read state belongs to the recipient.

It does not change the underlying business event.

```text
order.confirmed
```

remains true regardless of whether the customer opened the notification.

---

# 14.29 Notification Expiration

Some notifications become irrelevant.

A rider assignment notification from yesterday may no longer need to appear prominently.

NEXG can therefore support:

```text
expiresAt
```

without deleting the underlying event or transaction record.

---

# 14.30 Notification Grouping

Applications should avoid flooding users.

Suppose five catalog updates occur.

Instead of:

```text
Update 1
Update 2
Update 3
Update 4
Update 5
```

the UI may group them into:

```text
5 catalog updates
```

Grouping should be defined by notification type.

---

# 14.31 Deduplication

If the same event is processed repeatedly, NEXG should not send duplicate notifications.

```text
eventId
+
recipient
+
channel
+
notification type
```

can form the basis of notification idempotency.

---

# 14.32 Notification Delivery State

Each notification delivery should have its own lifecycle:

```text
CREATED
 ↓
QUEUED
 ↓
SENDING
 ↓
SENT
 ↓
DELIVERED
```

or:

```text
FAILED
 ↓
RETRYING
 ↓
DELIVERED
```

---

# 14.33 Real-Time vs Push

These should not be treated as interchangeable.

### User currently online

```text
Event
 ↓
WebSocket
 ↓
Live UI
```

### User offline

```text
Event
 ↓
Push notification
```

The same business event can therefore use different delivery paths depending on presence.

---

# 14.34 Presence

NEXG applications can maintain a lightweight presence state:

```text
ONLINE
AWAY
OFFLINE
```

This helps determine whether a real-time update has a connected recipient.

Presence must not be treated as an exact guarantee of user attention.

---

# 14.35 Connection Recovery

When a client reconnects:

```text
Connect
 ↓
Authenticate
 ↓
Identify last known event/version
 ↓
Request missed state/events
 ↓
Synchronize
 ↓
Resume real-time stream
```

This prevents the UI from silently becoming stale after network interruptions.

---

# 14.36 Customer Order Experience

For a restaurant transaction:

```text
Order Created
    ↓
Real-Time UI
"Order received"

Order Confirmed
    ↓
Push
"Your order is confirmed"

Preparing
    ↓
Real-Time
"Being prepared"

Ready
    ↓
Push
"Your order is ready"

Rider Assigned
    ↓
Real-Time
"Rider assigned"

Delivered
    ↓
Push + Receipt
"Order delivered"
```

The event system remains the source of these communication triggers.

---

# 14.37 Airport Transfer Experience

```text
Booking Confirmed
       ↓
Confirmation
       ↓
Driver Assigned
       ↓
Push
       ↓
Driver En Route
       ↓
Real-Time location/status
       ↓
Driver Arrived
       ↓
Push
       ↓
Trip Completed
       ↓
Receipt / Completion
```

The customer experience is therefore driven by the fulfillment state machine from Phase 11.

---

# 14.38 Safari Experience

```text
Booking Confirmed
       ↓
Confirmation
       ↓
Upcoming Reminder
       ↓
Check-in
       ↓
Experience Started
       ↓
Experience Completed
       ↓
Completion communication
```

The same communication architecture works without pretending a safari is a restaurant order.

---

# 14.39 Laundry Experience

```text
Request Accepted
       ↓
Pickup Scheduled
       ↓
Pickup Reminder
       ↓
Items Collected
       ↓
Cleaning
       ↓
Ready
       ↓
Delivery
       ↓
Completed
```

The notification policy maps the laundry-specific workflow into appropriate communications.

---

# 14.40 Reminder Engine

Some communications are not triggered immediately by an event.

They are triggered by time relative to an event.

```text
Booking confirmed
        ↓
Scheduled date
        ↓
Reminder policy
        ↓
Reminder notification
```

For example:

```text
Safari booking
August 15
```

could generate a reminder according to the configured policy.

The important architectural distinction is:

```text
Event
≠
Reminder
```

A reminder is a scheduled communication derived from an existing business state.

---

# 14.41 Time-Based Communication

NEXG should support rules such as:

```text
Before appointment
Before transfer
Before tour
After abandoned transaction
After failed payment
```

But the actual scheduling mechanism should remain part of NEXG's controlled platform architecture.

---

# 14.42 Abandoned Transaction Communication

If a transaction remains incomplete:

```text
Checkout Started
 ↓
Payment Not Completed
 ↓
Timeout / Abandonment
```

NEXG can classify the state.

Whether a notification is sent depends on the communication policy.

This is distinct from marketing automation.

---

# 14.43 Operational Alerts

NEXG operations need a separate alerting layer.

```text
Integration failure
Payment provider outage
Webhook failure spike
Merchant system unavailable
Settlement failure
```

These should go to:

```text
NEXG Operations
```

rather than customers.

---

# 14.44 Merchant Operational Alerts

Merchant operators may receive:

```text
New order
Order overdue
Payment failed
Booking requires action
Inventory depleted
Integration disconnected
```

These are different from consumer notifications.

---

# 14.45 Escalation

Important operational events can escalate.

```text
Normal
 ↓
Unresolved
 ↓
High
 ↓
Critical
 ↓
Operations escalation
```

The escalation policy should depend on:

```text
event
severity
duration
merchant
transaction type
```

---

# 14.46 Notification Templates

Templates should be versioned.

```text
template
version
locale
channel
status
```

For example:

```text
order.confirmed
email
en-KE
v3
```

This prevents changing the template from unexpectedly altering historical communication records.

---

# 14.47 Localization

NEXG should design the notification system to support localization.

The notification request should contain semantic data rather than only pre-rendered English text.

```text
event:
order.confirmed

locale:
en-KE

template:
order.confirmed.v3
```

This allows future language support without redesigning the event system.

---

# 14.48 Merchant Branding

Merchant-facing and customer-facing communications can use NEXG's communication shell while dynamically applying merchant identity.

```text
NEXG
 ├── Logo / platform identity
 ├── Merchant identity
 ├── Merchant name
 ├── Transaction details
 └── NEXG support / policy information
```

Branding rules should be centrally controlled.

---

# 14.49 Notification Content Must Be Data-Driven

The notification service should receive structured information:

```text
customerName
merchantName
orderId
total
status
scheduledAt
location
```

It should not receive a block of arbitrary HTML from business logic.

This prevents communication logic from becoming embedded inside operational services.

---

# 14.50 Notification Audit

NEXG should record:

```text
notificationId
eventId
recipient
channel
template
createdAt
sentAt
deliveryStatus
failureReason
```

This allows NEXG to answer:

> Did we actually send the customer the confirmation?

---

# 14.51 Communication Timeline

A transaction timeline can therefore show:

```text
10:21
Order created

10:22
Payment succeeded

10:22
Order confirmed

10:22
Push notification delivered

10:23
Merchant webhook acknowledged

10:41
Order ready

10:41
Customer push delivered
```

This becomes extremely powerful for support and dispute resolution.

---

# 14.52 Communication Failure Does Not Reverse Business State

This is critical.

If:

```text
order.confirmed
```

but:

```text
email.failed
```

the order remains:

```text
CONFIRMED
```

Communication failure is a separate operational problem.

NEXG should retry or use an alternate channel where appropriate.

---

# 14.53 Notification Failure Model

```text
Business Event
      ↓
Notification Created
      ↓
Delivery Attempt
      ↓
Failure
      ↓
Retry
      ↓
Fallback if policy permits
```

A failed SMS should not cancel a booking.

---

# 14.54 Channel Fallback

NEXG can support controlled fallback.

```text
Push
 ↓
Unavailable
 ↓
Email
```

or:

```text
Email
 ↓
Failed
 ↓
SMS
```

But fallback should only happen when the communication policy explicitly allows it.

Otherwise users could receive duplicate or unwanted communications.

---

# 14.55 Communication Preferences vs Fallback

The system must check:

```text
Is channel allowed?
Is communication required?
Is recipient reachable?
Is fallback permitted?
```

before switching channels.

---

# 14.56 Rate Limiting Notifications

NEXG must protect users from notification storms.

Suppose:

```text
inventory.updated
```

fires 50 times.

The customer should not receive 50 notifications.

The notification policy should determine whether the event is:

```text
internal-only
grouped
debounced
ignored
```

---

# 14.57 Event Debouncing

For high-frequency operational changes:

```text
Location updated
Location updated
Location updated
Location updated
```

NEXG can consolidate updates for user-facing communication.

The event history remains intact.

Only the notification stream is optimized.

---

# 14.58 Communication Architecture

The resulting structure is:

```text
                    NEXG EVENT
                        │
                        ▼
                POLICY ENGINE
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
   Real-Time       Notification       Webhook
        │               │                │
        │        ┌──────┼──────┐         │
        │        │      │      │         │
        ▼        ▼      ▼      ▼         ▼
    WebSocket   Push   Email   SMS    Merchant
        │
        ▼
      UI
```

---

# 14.59 NEXG Communication Domains

Phase 14 therefore creates four distinct communication domains:

### 1. Real-time

```text
WebSocket
Live application state
```

### 2. Transactional notifications

```text
Push
Email
SMS
In-app
```

### 3. Integration communication

```text
Webhooks
Events
API
```

### 4. Operational communication

```text
Merchant alerts
NEXG operations alerts
Incident escalation
```

They share the same event foundation but have different policies.

---

# 14.60 Phase 14 Deliverables

By the end of Phase 14, NEXG has defined:

### Real-time

- WebSocket architecture
- Connection lifecycle
- Authentication
- Authorization
- Reconnection
- State recovery
- Presence
- Real-time subscriptions

### Notifications

- Notification policy engine
- Audience routing
- Channel selection
- Priority
- Preferences
- Deduplication
- Grouping
- Rate limiting
- Fallback

### Channels

- Push
- Email
- SMS
- In-app
- Real-time
- Webhook
- Operational alerts

### Transactional communication

- Order communication
- Booking communication
- Payment communication
- Fulfillment communication
- Cancellation
- Refund
- Completion
- Reminders

### Reliability

- Delivery states
- Retry
- Failure handling
- Audit
- Communication timeline

### Developer architecture

```text
Event
 ↓
Policy
 ↓
Channel
 ↓
Delivery
 ↓
Receipt / Status
```

---

# 14.61 The NEXG Communication Architecture After Phase 14

We now have:

```text
                         NEXG
                          │
                    BUSINESS EVENT
                          │
                          ▼
                 ┌─────────────────┐
                 │  EVENT PLATFORM │
                 └─────────────────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
          WEBHOOK      REAL-TIME   NOTIFICATION
             │            │            │
        Merchant       Apps       Policy Engine
                                      │
                           ┌──────────┼──────────┐
                           │          │          │
                           ▼          ▼          ▼
                         Push       Email       SMS
                           │
                           ▼
                       Recipient
```

And the most important separation is now explicit:

```text
EVENT
"What happened?"

        ↓

STATE
"What is true now?"

        ↓

NOTIFICATION
"Who needs to know?"

        ↓

CHANNEL
"How should they know?"

        ↓

DELIVERY
"Did they receive it?"
```

This gives NEXG a clean foundation for **customers, merchants, hosts, riders and NEXG operations to stay synchronized without coupling every part of the platform together.**

### Phase 15

The next phase should be **NEXG Security, Privacy, Compliance & Trust Architecture** — taking the merchant API, transactions, events, webhooks, notifications and multi-tenant model we've built so far and defining exactly how NEXG protects identities, credentials, customer/merchant data, payments, integrations, audit records and operational access in production.

## Prompt:
8/7/2026, 11:15:08 AM

Phase 15

## Response:
8/7/2026, 11:15:09 AM

# Phase 15 — NEXG Security, Privacy, Compliance & Trust Architecture

Phase 15 defines **how NEXG protects identities, merchants, customers, transactions, integrations, data and platform operations** across everything designed in Phases 1–14.

This is not a generic cybersecurity checklist.

It becomes the security architecture that governs:

```text
Merchant
Customer
Host
Rider
Staff
NEXG Operations
NEXG Administrators
External Integrations
APIs
Webhooks
Events
Payments
Notifications
Data
Infrastructure
```

The core principle is:

> **Every request, user, service, integration and data access must be explicitly authenticated, authorized, scoped and auditable.**

---

# 15.1 NEXG Trust Model

NEXG should operate on a zero-trust model.

```text
Request
   ↓
Who are you?
   ↓
Are you authenticated?
   ↓
Which tenant do you belong to?
   ↓
What are you allowed to do?
   ↓
Can you access this resource?
   ↓
Is this action permitted in this context?
   ↓
Record the action
```

Authentication alone is never sufficient.

---

# 15.2 NEXG Security Domains

Security should be divided into:

```text
Identity
Access Control
Tenant Isolation
API Security
Integration Security
Data Security
Payment Security
Webhook Security
Event Security
Application Security
Infrastructure Security
Audit & Monitoring
Privacy
Compliance
Incident Response
```

---

# 15.3 Identity Architecture

NEXG should have a central identity layer.

Conceptually:

```text
                    NEXG Identity
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
   Customers         Merchants         NEXG Staff
       │                 │                 │
       ▼                 ▼                 ▼
    Apps              Portal          Operations
```

Identity should be separated from individual applications.

---

# 15.4 Authentication Methods

NEXG should support authentication appropriate to the actor.

### Customers

```text
Phone
Email
OTP
Password
Social / federated login where supported
```

### Merchant staff

```text
Email
Password
MFA
SSO-ready architecture
```

### Integrations

```text
API credentials
OAuth where appropriate
Signed credentials
```

### NEXG services

```text
Service identity
Short-lived credentials
Mutual authentication where appropriate
```

---

# 15.5 Password Security

Passwords must never be stored as plaintext.

The architecture should use a strong password hashing algorithm such as:

```text
Argon2id
```

with appropriately configured parameters.

NEXG should also support:

```text
Password reset
Password change
Session invalidation
Credential rotation
Account recovery
```

---

# 15.6 Password Reset

The workflow:

```text
Forgot Password
      ↓
Identity Verification
      ↓
Short-Lived Reset Token
      ↓
New Password
      ↓
Invalidate Relevant Sessions
      ↓
Audit
```

Reset tokens should:

- expire quickly
- be single-use
- not reveal whether an account exists
- never be logged in plaintext

---

# 15.7 Multi-Factor Authentication

MFA should be available for sensitive accounts.

Particularly:

```text
Merchant administrators
Financial users
NEXG operations
NEXG administrators
```

Methods can include:

```text
Authenticator app
Passkeys
Security keys
OTP where appropriate
```

---

# 15.8 Session Architecture

Sessions should have:

```text
sessionId
userId
device
createdAt
lastSeenAt
expiresAt
revokedAt
```

NEXG should support:

```text
Sign out
Sign out all devices
Session revocation
Idle expiration
Absolute expiration
```

---

# 15.9 Access Tokens

API access tokens should be:

```text
short-lived
scoped
audience-restricted
revocable where required
```

Long-lived credentials should be reserved for controlled integration scenarios and securely managed.

---

# 15.10 Tenant Isolation

NEXG is multi-tenant.

This is one of the most important security boundaries.

```text
Merchant A
 ├── Users
 ├── Orders
 ├── Products
 ├── Payments
 └── Locations

Merchant B
 ├── Users
 ├── Orders
 ├── Products
 ├── Payments
 └── Locations
```

Merchant A must never be able to query Merchant B's resources.

---

# 15.11 Tenant Context

Every authenticated request should resolve tenant context.

Conceptually:

```text
Request
 ↓
Identity
 ↓
Tenant
 ↓
Role
 ↓
Permission
 ↓
Resource
```

The application should never trust a client-provided `merchantId` alone.

---

# 15.12 Object-Level Authorization

This is critical.

Having permission to:

```text id="s5t3j7"
GET /orders
```

does not mean the user can access:

```text id="y8n1m4"
any order
```

The authorization layer must verify ownership and scope.

---

# 15.13 RBAC

NEXG should support Role-Based Access Control.

Merchant roles can include:

```text
Owner
Administrator
Manager
Operations
Finance
Staff
Viewer
```

Roles provide a manageable permission baseline.

---

# 15.14 Permissions

Permissions should represent actions.

Examples:

```text
orders.read
orders.create
orders.update
orders.cancel

products.read
products.write

payments.read
refunds.create

settlements.read

integrations.manage
webhooks.manage
```

Roles are collections of permissions.

---

# 15.15 ABAC

RBAC alone may not be enough.

NEXG should also support attribute-based rules.

Authorization can depend on:

```text
user
role
merchant
location
resource
resource status
action
time
environment
```

A manager may have permission to manage orders but only for assigned locations.

---

# 15.16 Permission Evaluation

Conceptually:

```text
Can User X
perform ACTION Y
on RESOURCE Z
within TENANT A
under CONTEXT C?
```

The authorization engine returns:

```text
ALLOW
```

or:

```text
DENY
```

The decision should be auditable.

---

# 15.17 Least Privilege

Every actor receives only the access required to perform their job.

```text
Kitchen Staff
→ orders.read
→ orders.update.status

Finance
→ payments.read
→ settlements.read
```

Kitchen staff should not automatically receive:

```text
settlements.write
integrations.manage
users.manage
```

---

# 15.18 Service-to-Service Security

NEXG services should authenticate to one another.

```text
Order Service
     ↓
Authenticated Service Identity
     ↓
Payment Service
```

A service should not be trusted merely because it is inside the private network.

---

# 15.19 Service Permissions

Each service receives only required permissions.

```text
Notification Service
→ read notification data
→ send communication

Order Service
→ order data
→ fulfillment interaction
```

The Notification Service should not automatically have access to payment credentials.

---

# 15.20 API Security

All production APIs must use:

```text
HTTPS
```

with modern TLS configuration.

API security also includes:

```text
Authentication
Authorization
Input validation
Rate limiting
Request size limits
Error handling
Audit logging
```

---

# 15.21 API Keys

Where API keys are required, NEXG should support:

```text
keyId
secret
environment
scopes
createdAt
expiresAt
revokedAt
lastUsedAt
```

The secret should only be shown when created.

---

# 15.22 API Key Rotation

Merchant IT teams should be able to:

```text
Create new key
 ↓
Deploy new key
 ↓
Verify
 ↓
Revoke old key
```

This enables safe credential rotation.

---

# 15.23 Secrets Management

Secrets should never live in:

```text
Source code
Git repositories
Frontend bundles
Logs
Database records in plaintext
```

Examples:

```text
Database passwords
API secrets
Webhook secrets
Encryption keys
Payment credentials
Email provider credentials
```

should be stored in a dedicated secrets-management mechanism.

---

# 15.24 Frontend Security

No private secret should be embedded in:

```text
React
JavaScript bundle
Mobile application
Public configuration
```

A frontend may receive:

```text
public identifiers
configuration
short-lived tokens
```

but not privileged server credentials.

---

# 15.25 Input Validation

Every API boundary validates input.

```text
Type
Format
Length
Range
Required fields
Allowed values
Relationships
```

A merchant cannot submit:

```text
quantity = -900
```

and expect the database to determine whether that is valid.

---

# 15.26 Schema Validation

NEXG API contracts should use formal schemas.

For example:

```text
OrderCreateRequest
OrderResponse
PaymentResponse
BookingCreateRequest
WebhookEvent
```

This makes validation consistent between NEXG and merchant systems.

---

# 15.27 SQL Injection Protection

Database access must use parameterized queries or safe ORM mechanisms.

Never construct SQL using raw untrusted strings.

---

# 15.28 XSS Protection

Merchant-entered content may appear in:

```text
Product descriptions
Merchant names
Notes
Reviews
Messages
```

NEXG must sanitize and safely render untrusted content.

---

# 15.29 CSRF Protection

Browser-based authenticated operations should be protected against cross-site request forgery where cookie-based authentication is used.

---

# 15.30 Rate Limiting

NEXG needs layered rate limits.

```text
IP
User
Merchant
API key
Endpoint
Resource
```

Different operations can have different limits.

---

# 15.31 Authentication Rate Limits

Sensitive endpoints should have stricter controls:

```text
Login
OTP request
Password reset
MFA verification
API credential creation
```

This reduces credential abuse and automated attacks.

---

# 15.32 Abuse Protection

NEXG should detect:

```text
Credential stuffing
Brute force
Token abuse
API scraping
Excessive requests
Webhook abuse
Suspicious payment behavior
```

Rate limiting is only one layer of abuse prevention.

---

# 15.33 Data Classification

NEXG should classify information.

```text
PUBLIC
INTERNAL
CONFIDENTIAL
SENSITIVE
RESTRICTED
```

Example:

```text
Merchant public profile
→ PUBLIC

Merchant operating configuration
→ CONFIDENTIAL

Customer contact information
→ SENSITIVE

Authentication secrets
→ RESTRICTED
```

---

# 15.34 Data Minimization

NEXG should only collect information required for the business function.

If a fulfillment workflow requires:

```text
customerName
phone
deliveryAddress
```

there is no reason for the fulfillment service to receive unrelated identity information.

---

# 15.35 Encryption in Transit

Sensitive communication must use encrypted transport.

```text
Customer App
      ↓ TLS
NEXG API
      ↓ TLS
Internal Service
      ↓ TLS
Database / Storage where applicable
```

---

# 15.36 Encryption at Rest

Sensitive stored data should be encrypted at rest.

This includes appropriate:

```text
Database storage
Object storage
Backups
Secrets
Sensitive records
```

Encryption keys must be managed separately from the encrypted data.

---

# 15.37 Encryption Key Management

NEXG should establish:

```text
Key creation
Key storage
Key rotation
Key access
Key revocation
Key destruction
```

Keys should not be casually shared between services.

---

# 15.38 Payment Security

Payment data requires a separate security boundary.

NEXG should minimize the amount of sensitive payment information it stores.

For payment providers, NEXG should prefer provider tokens and references rather than storing raw card credentials.

---

# 15.39 Payment State vs Payment Credentials

The NEXG platform may store:

```text
paymentId
provider
amount
currency
status
providerReference
createdAt
```

without storing:

```text
raw card number
CVV
```

where those credentials are not required.

---

# 15.40 M-Pesa / Kenyan Payment Integrations

For NEXG's Kenyan operations, payment integration credentials such as Safaricom/Daraja credentials should be treated as restricted secrets.

The system should separate:

```text
Merchant payment configuration
```

from:

```text
NEXG platform credentials
```

and strictly control who can view or modify each.

---

# 15.41 Webhook Security

Phase 13 defined webhook architecture.

Phase 15 secures it.

Every webhook should support:

```text
HTTPS
Signature
Timestamp
Event ID
Replay protection
Secret rotation
Tenant validation
```

The receiving merchant system verifies the signature before processing.

---

# 15.42 Event Authorization

A valid NEXG signature does not automatically mean a recipient is authorized to see every event.

The subscription itself must be authorized.

```text
Merchant
 ↓
Integration
 ↓
Subscription
 ↓
Event
```

Only authorized subscriptions receive events.

---

# 15.43 Notification Security

Notifications can expose sensitive information.

A push notification should not unnecessarily reveal:

```text
financial details
full address
sensitive health information
private customer information
```

The application can instead display:

```text
Payment received
```

and require authentication to view the complete payment details.

---

# 15.44 Email Security

Email is inherently less private than the authenticated application.

Therefore NEXG should avoid placing unnecessarily sensitive information in email.

Email can contain:

```text
Order number
Summary
Merchant
Amount
Status
```

while directing the user to the authenticated application for sensitive details.

---

# 15.45 Audit Logging

Important security and business actions must be auditable.

Examples:

```text
User login
Password change
MFA change
Role change
Permission change
API key creation
API key revocation
Webhook secret rotation
Refund
Settlement change
Merchant suspension
Integration change
```

---

# 15.46 Audit Log Structure

Conceptually:

```text
auditId
timestamp
actor
actorType
tenant
action
resourceType
resourceId
result
ip
requestId
metadata
```

The audit log should be append-oriented and protected against unauthorized modification.

---

# 15.47 Audit vs Application Logs

These must remain distinct.

### Application log

```text
Request failed
Database timeout
Webhook response 500
```

### Audit log

```text
Emma changed Merchant A's settlement configuration.
```

Application logs explain system behavior.

Audit logs establish accountability.

---

# 15.48 Request Correlation

Every significant request should receive:

```text
requestId
```

Example:

```text id="n7x3q2"
req_01K...
```

That ID can follow:

```text
API
 ↓
Service
 ↓
Database
 ↓
Event
 ↓
Webhook
 ↓
Notification
```

This enables complete tracing.

---

# 15.49 Event Correlation

Events should also reference:

```text
requestId
```

where applicable.

Then support can trace:

```text
Customer Action
 ↓
Request
 ↓
Order
 ↓
Event
 ↓
Webhook
 ↓
Notification
```

---

# 15.50 Security Monitoring

NEXG should monitor:

```text
Failed logins
Unusual API traffic
Permission failures
Credential changes
Suspicious sessions
Webhook failures
Payment anomalies
Data access anomalies
```

Security monitoring should distinguish ordinary operational errors from suspicious activity.

---

# 15.51 Security Alerts

Alerts should be prioritized.

```text
CRITICAL
HIGH
MEDIUM
LOW
```

A compromised API credential should not be treated the same as a single failed request.

---

# 15.52 Merchant Security Visibility

Merchant administrators should eventually have a security view showing:

```text
Active sessions
API keys
Webhook endpoints
Webhook secrets
Integration status
Recent security activity
```

This allows merchants to manage their own integration security.

---

# 15.53 API Credential Dashboard

Conceptually:

```text
API Credentials
────────────────────────
Production Key
Created: Aug 7
Last Used: Aug 7
Status: Active

Actions:
Rotate
Revoke
```

The actual secret should never be displayed again after initial creation.

---

# 15.54 Webhook Security Dashboard

```text
Webhook Endpoint
────────────────────
https://merchant.example/nexg

Status: Healthy
Last Delivery: 11:42

Security:
Signature: Enabled
Secret: Active

Actions:
Rotate Secret
Disable
Test Endpoint
```

---

# 15.55 Merchant Data Isolation

Every merchant must have isolation across:

```text
Users
Orders
Customers
Products
Inventory
Payments
Bookings
Documents
Files
Events
Notifications
Logs
```

This should be enforced at the application and database architecture levels.

---

# 15.56 Database-Level Protection

Where practical, NEXG should use database-level tenant controls in addition to application authorization.

For PostgreSQL this can include:

```text
Row-Level Security
```

for particularly sensitive multi-tenant data.

The goal is defense in depth.

---

# 15.57 Object Storage Security

Merchant files such as:

```text
Documents
Invoices
Product images
Verification documents
Receipts
```

should not be publicly accessible by default.

Use controlled access:

```text
Authenticated request
 ↓
Authorization
 ↓
Short-lived signed URL
 ↓
Object
```

---

# 15.58 File Upload Security

Uploads must be checked for:

```text
File type
File size
Content type
Malicious payloads
Filename abuse
Executable content
```

Uploaded files should not automatically become executable resources.

---

# 15.59 Backup Security

Backups must receive the same security treatment as production data.

```text
Encryption
Access control
Retention
Integrity
Monitoring
Recovery testing
```

A backup containing customer data cannot be treated as ordinary infrastructure.

---

# 15.60 Disaster Recovery

NEXG security includes availability.

Define:

```text
RPO
Recovery Point Objective

RTO
Recovery Time Objective
```

These determine how much data NEXG can afford to lose and how quickly systems must be restored.

---

# 15.61 Incident Response

NEXG needs a defined security incident lifecycle:

```text
Detect
 ↓
Classify
 ↓
Contain
 ↓
Investigate
 ↓
Remediate
 ↓
Recover
 ↓
Notify where required
 ↓
Post-incident review
```

---

# 15.62 Credential Compromise

If a merchant API credential is compromised:

```text
Detect
 ↓
Revoke credential
 ↓
Assess access
 ↓
Issue replacement
 ↓
Review activity
 ↓
Notify merchant
```

The system should not require taking the entire merchant offline.

---

# 15.63 Merchant Suspension

NEXG should support controlled merchant suspension.

```text
ACTIVE
 ↓
SUSPENDED
```

Suspension can disable:

```text
New orders
Bookings
API access
Webhook delivery
Payments
```

depending on the reason and policy.

Existing records must remain available for authorized investigation.

---

# 15.64 Data Retention

NEXG must establish retention policies for:

```text
Transactions
Orders
Bookings
Payments
Audit logs
Events
Notifications
Integration logs
Customer records
Merchant records
Backups
```

Different data types may have different retention periods.

---

# 15.65 Data Deletion

Deletion should distinguish:

```text
Delete
Archive
Anonymize
Deactivate
Retain for legal/business reasons
```

A customer account being deleted does not necessarily mean financial records can simply disappear.

---

# 15.66 Anonymization

Where business or legal records must remain but personal identification is no longer required, NEXG can use controlled anonymization.

Conceptually:

```text
Customer
Emma Langat
```

becomes:

```text
Customer
Anonymous Customer
```

while retaining necessary transaction integrity.

---

# 15.67 Privacy by Design

Privacy should be incorporated into system architecture rather than added later.

Every new feature should ask:

```text
What data?
Why collected?
Who needs it?
How long retained?
Who can access it?
Can we collect less?
```

---

# 15.68 Consent

Where consent is required, NEXG should record:

```text
consent type
subject
timestamp
version
source
status
```

Consent must not be treated as a universal permission to use all customer data.

---

# 15.69 Marketing vs Transactional Data

NEXG should separate:

```text
Operational communication
```

from:

```text
Marketing communication
```

An order confirmation is not marketing merely because it contains merchant branding.

This distinction affects preferences, consent and communication policies.

---

# 15.70 Kenyan Compliance Foundation

NEXG operates in Kenya and therefore its architecture should account for applicable Kenyan privacy and business requirements, particularly the **Data Protection Act, 2019** and requirements administered by the **Office of the Data Protection Commissioner (ODPC)**.

The architecture should provide mechanisms for:

```text
Data access
Correction
Deletion where applicable
Consent management
Data minimization
Purpose limitation
Security safeguards
Data processing records
```

The exact legal obligations should be validated with qualified Kenyan legal/compliance professionals before production certification.

---

# 15.71 Data Controller / Processor Model

NEXG should explicitly determine the role it plays for each data flow.

Depending on the service:

```text
NEXG
Merchant
Customer
Host
Payment Provider
Logistics Provider
```

may have different controller/processor relationships.

This needs to be documented per data flow rather than using one blanket classification.

---

# 15.72 Data Flow Mapping

For every major domain:

```text
Customer
   ↓
NEXG
   ↓
Merchant
   ↓
Fulfillment
```

NEXG should document:

```text
Data collected
Purpose
Destination
Storage
Retention
Access
Deletion
```

---

# 15.73 Third-Party Integrations

Every integration should be assessed for:

```text
Data exchanged
Authentication
Authorization
Encryption
Credentials
Retention
Failure behavior
Incident responsibility
```

Examples include:

```text
Payment providers
Email providers
SMS providers
Maps
Identity providers
Merchant systems
Logistics systems
```

---

# 15.74 Integration Trust Levels

NEXG can classify integrations:

```text
TRUSTED INTERNAL
FIRST-PARTY
MERCHANT
PARTNER
THIRD-PARTY
UNTRUSTED EXTERNAL
```

Each level can have different controls.

---

# 15.75 Production Security Boundaries

The platform should be separated into security zones.

```text
Internet
   │
   ▼
WAF / Edge
   │
   ▼
API Gateway
   │
   ▼
Application
   │
   ├── Database
   ├── Event Infrastructure
   ├── Secrets
   └── Object Storage
```

Administrative systems should have additional restrictions.

---

# 15.76 WAF and Edge Protection

At the edge, NEXG should enforce:

```text
TLS
WAF
Rate limiting
Bot protection
Request filtering
DDoS protection
```

where appropriate.

---

# 15.77 Administrative Access

NEXG administrative systems should be isolated from ordinary customer and merchant interfaces.

Administrators should use:

```text
MFA
Restricted network/device access
Strong session controls
Privileged role separation
Audit logging
```

---

# 15.78 Break-Glass Access

NEXG should have controlled emergency access.

```text
Normal access
      ↓
Insufficient during incident
      ↓
Break-glass authorization
      ↓
Temporary elevated access
      ↓
Full audit
      ↓
Automatic expiration
```

This prevents permanent super-admin access from becoming the normal operating model.

---

# 15.79 Security Testing

NEXG should establish recurring:

```text
Dependency scanning
Static analysis
Dynamic testing
API security testing
Authentication testing
Authorization testing
Tenant-isolation testing
Penetration testing
```

The most important early test is:

> Can Merchant A ever access Merchant B's data?

---

# 15.80 Integration Security Testing

Merchant integrations should test:

```text
Invalid credentials
Expired credentials
Wrong scopes
Invalid signatures
Replay attempts
Duplicate events
Malformed payloads
Unauthorized resources
```

---

# 15.81 Security Documentation for Merchant IT Teams

NEXG's eventual developer documentation must contain a dedicated security section covering:

```text
Authentication
API keys
OAuth where applicable
Scopes
Webhook signatures
Secret rotation
IP/network considerations
TLS
Rate limits
Idempotency
Error handling
Data handling
Security incidents
```

---

# 15.82 Security Documentation for NEXG Teams

Internal documentation should additionally cover:

```text
Infrastructure access
Service identities
Secrets
Database access
Incident response
Audit
Privileged access
Key management
Backups
Disaster recovery
Security monitoring
```

Merchant documentation and internal security documentation should not expose the same level of information.

---

# 15.83 Security Versioning

Security contracts must be versioned.

Changes to:

```text
Authentication
Scopes
Webhook signatures
Encryption
API credentials
```

must be treated as potentially breaking changes.

---

# 15.84 Security Change Management

Before changing a security-sensitive component:

```text
Design
 ↓
Threat assessment
 ↓
Implementation
 ↓
Security testing
 ↓
Documentation
 ↓
Deployment
 ↓
Monitoring
```

Security cannot be separated from platform change management.

---

# 15.85 NEXG Threat Model

NEXG should maintain a threat model covering:

```text
Account takeover
Merchant impersonation
Tenant data leakage
Credential theft
Webhook forgery
Replay attacks
Payment fraud
API abuse
Privilege escalation
Data exfiltration
Malicious uploads
Insider misuse
Infrastructure compromise
```

Each threat should have:

```text
Threat
Impact
Likelihood
Control
Detection
Response
Owner
```

---

# 15.86 Security Architecture

The complete model now becomes:

```text
                         NEXG
                          │
                 ┌────────┴────────┐
                 │ Identity Layer  │
                 └────────┬────────┘
                          │
                    Authentication
                          │
                    Authorization
                          │
                 ┌────────┴────────┐
                 │ Tenant Isolation│
                 └────────┬────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
       API              EVENTS         NOTIFICATIONS
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                   Protected Data
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
     Database         Object Storage     Payments
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                   Audit & Monitoring
                          │
                   Security Operations
```

---

# 15.87 Phase 15 Deliverables

At the completion of Phase 15, NEXG has defined:

### Identity

- Customer authentication
- Merchant authentication
- Staff authentication
- MFA
- Password management
- Session management
- Credential recovery

### Authorization

- RBAC
- ABAC
- Permissions
- Resource-level authorization
- Tenant isolation
- Least privilege
- Service identities

### API security

- HTTPS/TLS
- API keys
- Token management
- Rate limiting
- Input validation
- Abuse protection
- Request correlation

### Integration security

- Webhook signatures
- Replay protection
- Secret rotation
- Integration scopes
- API credential management

### Data protection

- Data classification
- Encryption
- Data minimization
- Object storage security
- File upload controls
- Backup security
- Retention
- Deletion/anonymization

### Payments

- Payment-data minimization
- Provider tokenization
- Payment credential isolation
- Kenyan payment integration security

### Privacy

- Privacy-by-design
- Consent
- Data-flow mapping
- Controller/processor analysis
- Kenyan data protection requirements

### Operations

- Audit logs
- Security monitoring
- Incident response
- Break-glass access
- Disaster recovery
- Security testing
- Threat modeling

---

# 15.88 NEXG Trust Architecture After Phase 15

The platform now has a much stronger chain:

```text
IDENTITY
   ↓
AUTHENTICATION
   ↓
AUTHORIZATION
   ↓
TENANT ISOLATION
   ↓
BUSINESS ACTION
   ↓
STATE CHANGE
   ↓
EVENT
   ↓
WEBHOOK / REAL-TIME / NOTIFICATION
   ↓
AUDIT
   ↓
MONITORING
```

And every layer has a security boundary.

That is what allows NEXG to move from **"an application that has APIs"** to a platform where external merchant IT teams can safely connect their POS, ERP, inventory, booking, fulfillment and operational systems.

**Phase 16** should now build the other side of that trust model: **NEXG Sandbox, Testing, Integration Certification & Merchant Go-Live** — defining how a merchant IT team actually gets credentials, develops against NEXG without touching production, tests every required workflow, proves its integration works, and gets approved for production.

## Prompt:
8/7/2026, 11:16:43 AM

Phase 16

## Response:
8/7/2026, 11:16:45 AM

# Phase 16 — NEXG Sandbox, Testing, Integration Certification & Merchant Go-Live

Phase 16 turns everything from Phases 1–15 into a **controlled path for a merchant IT team to connect to NEXG and safely reach production**.

This is the phase that answers:

> **“I am a merchant's developer. I want to connect our system to NEXG. What exactly do I do from receiving credentials to going live?”**

The NEXG integration lifecycle becomes:

```text
Discover
   ↓
Register
   ↓
Sandbox
   ↓
Authenticate
   ↓
Develop
   ↓
Test
   ↓
Validate
   ↓
Certify
   ↓
Production Credentials
   ↓
Go-Live
   ↓
Monitor
```

---

# 16.1 NEXG Integration Environments

NEXG should formally separate environments.

```text
DEVELOPMENT
     ↓
SANDBOX
     ↓
STAGING / CERTIFICATION
     ↓
PRODUCTION
```

The merchant should never develop directly against production.

---

# 16.2 Development Environment

Development is primarily for NEXG internal engineering.

It may contain:

```text
Local services
Mock providers
Test databases
Synthetic data
Developer credentials
```

It should never contain real production customer information.

---

# 16.3 Sandbox

The **NEXG Sandbox** is the primary environment for merchant IT teams.

It should behave like NEXG production while using isolated data and controlled test conditions.

```text
Merchant System
      ↓
NEXG Sandbox API
      ↓
Sandbox Database
      ↓
Sandbox Events
      ↓
Sandbox Webhooks
```

---

# 16.4 Sandbox Identity

A merchant should receive a distinct sandbox integration identity.

Conceptually:

```text
Merchant
 ├── Sandbox
 │    ├── Client ID
 │    ├── Client Secret / API credentials
 │    ├── Webhook configuration
 │    └── Test data
 │
 └── Production
      ├── Production credentials
      ├── Production webhooks
      └── Live data
```

Sandbox credentials must never work against production.

---

# 16.5 Sandbox Data

NEXG should provide controlled test entities.

The merchant can work with:

```text
Test Customer
Test Merchant
Test Product
Test Order
Test Booking
Test Payment
Test Delivery
```

These should be clearly marked as sandbox resources.

---

# 16.6 Synthetic Customer Data

NEXG should not require merchants to upload real customer information simply to test their integration.

Sandbox should provide synthetic data such as:

```text
customer:
CUST_TEST_001

name:
NEXG Test Customer

phone:
Test Number

email:
Test Address
```

The values should be deliberately non-production.

---

# 16.7 Sandbox Merchant

The merchant integration can be associated with a controlled sandbox merchant configuration.

Its catalog can reflect the NEXG merchant model:

```text
Restaurants & Food
 └── Restaurant

Tech & Electronics
 └── Smartphones

Laundry & Cleaning
 └── Laundry
```

This allows the integration to test the same category and subcategory structures that production uses.

---

# 16.8 Sandbox API Base URL

NEXG documentation should clearly distinguish environments.

Conceptually:

```text
Sandbox:
api.sandbox.nexg...

Production:
api.nexg...
```

The actual hostnames should be defined by NEXG infrastructure and then used consistently throughout documentation.

The key rule is:

> **A merchant developer should be able to tell immediately which environment they are calling.**

---

# 16.9 Sandbox API Version

Sandbox should expose the same API contract intended for production.

```text
NEXG API v1
```

should mean the same resource and event structures in both environments.

Sandbox should not become a completely different API.

---

# 16.10 Sandbox Limitations

Sandbox can intentionally differ where real-world dependencies cannot safely be reproduced.

Examples:

```text
Payment providers
SMS
Email
Maps
External logistics
```

NEXG should provide controlled simulation mechanisms.

---

# 16.11 Test Mode

NEXG can expose test scenarios that deliberately produce predictable outcomes.

Conceptually:

```text
TEST_SUCCESS
TEST_FAILURE
TEST_TIMEOUT
TEST_RETRY
TEST_DUPLICATE
TEST_INVALID
```

This allows merchants to build failure handling before production.

---

# 16.12 Payment Simulation

A merchant should be able to test:

```text
Payment initiated
Payment successful
Payment failed
Payment pending
Payment reversed
Refund initiated
Refund completed
Refund failed
```

without moving real money.

---

# 16.13 Order Simulation

For NEXG ordering workflows:

```text
Order Created
      ↓
Order Accepted
      ↓
Preparing
      ↓
Ready
      ↓
Assigned
      ↓
Picked Up
      ↓
Delivered
```

The merchant integration should be able to test the complete lifecycle.

---

# 16.14 Booking Simulation

For services such as:

```text
Airport Transfers
Travel & Tours
Experiences
Wellness
```

sandbox should support:

```text
Booking Created
Booking Confirmed
Provider Assigned
Scheduled
Started
Completed
Cancelled
```

---

# 16.15 Failure Simulation

Certification should not only test success.

NEXG should deliberately test:

```text
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Rate Limited
500 Internal Error
503 Service Unavailable
```

The merchant must demonstrate appropriate handling.

---

# 16.16 Idempotency Testing

For operations that create or mutate transactions, NEXG should support idempotency where required.

The merchant should test:

```text
Request 1
   ↓
Order Created

Same Request
   ↓
Same Result
```

rather than:

```text
Request 1 → Order A
Request 2 → Order B
```

when both requests represent the same operation.

---

# 16.17 Webhook Testing

The merchant must prove its system can receive NEXG webhooks.

The workflow:

```text
NEXG Event
    ↓
Webhook
    ↓
Merchant Endpoint
    ↓
Signature Verification
    ↓
Processing
    ↓
2xx Response
```

---

# 16.18 Webhook Test Console

NEXG should provide a developer-facing interface where merchants can:

```text
Select Event
      ↓
Select Test Resource
      ↓
Send Test Webhook
      ↓
View Response
      ↓
Inspect Headers
      ↓
Inspect Payload
```

This makes webhook development dramatically easier.

---

# 16.19 Webhook Delivery Inspector

For every webhook:

```text
Event ID
Endpoint
Timestamp
HTTP status
Attempt number
Response time
Delivery status
```

should be visible to authorized merchant developers.

---

# 16.20 Webhook Retry Testing

Merchants should be able to simulate:

```text
Merchant returns 500
       ↓
NEXG retries
       ↓
Merchant returns 200
       ↓
Delivery succeeds
```

This ensures merchant systems do not assume every request succeeds on the first attempt.

---

# 16.21 Duplicate Webhook Testing

NEXG should explicitly test duplicate delivery.

```text
Event A
 ↓
Delivery
 ↓
Retry
 ↓
Event A again
```

The merchant must process the event idempotently.

---

# 16.22 Out-of-Order Events

Merchants must not assume network delivery guarantees chronological processing.

NEXG certification should test:

```text
Order Accepted
Order Ready
```

arriving in an unexpected order.

The merchant should use:

```text
eventId
event type
event timestamp
resource version
current resource state
```

to maintain consistency.

---

# 16.23 API Contract Testing

NEXG should publish machine-readable schemas.

Potentially:

```text
OpenAPI
JSON Schema
Webhook schemas
Event schemas
```

Merchant teams can use these to automatically validate their implementations.

---

# 16.24 SDKs

NEXG can eventually provide official SDKs for commonly used languages.

The SDK should simplify:

```text
Authentication
API requests
Pagination
Retries
Idempotency
Webhook verification
Error handling
```

The underlying API must remain the source of truth.

---

# 16.25 SDK Versioning

SDK versions must correspond to API compatibility.

```text
NEXG API v1
 ├── JavaScript SDK v1
 ├── Python SDK v1
 ├── Java SDK v1
 └── PHP SDK v1
```

Breaking changes must be explicitly documented.

---

# 16.26 Integration Documentation

NEXG documentation should be organized around **tasks**, not merely API endpoints.

A merchant developer should see:

```text
1. Create integration
2. Get credentials
3. Authenticate
4. Create/test resource
5. Receive webhook
6. Handle errors
7. Test retries
8. Request certification
9. Go live
```

---

# 16.27 Merchant IT Quick Start

The first integration page should answer:

```text
What am I integrating?
What credentials do I need?
Which environment do I use?
How do I authenticate?
What API do I call first?
How do I receive events?
How do I test?
How do I go live?
```

A developer should not have to read hundreds of pages before making the first successful API request.

---

# 16.28 Integration Guides by Capability

NEXG documentation should provide capability-specific guides.

```text
Orders
Catalog
Inventory
Bookings
Payments
Fulfillment
Customers
Webhooks
Notifications
Settlements
```

This is particularly important because NEXG merchants will not all use the same operational model.

---

# 16.29 Restaurant Integration

A restaurant IT team may need:

```text
Catalog
Orders
Order status
Payments
Fulfillment
Webhooks
```

They should not be forced to understand:

```text
Safari bookings
Airport transfers
Laundry workflows
```

before integrating restaurant functionality.

---

# 16.30 Travel Merchant Integration

A travel operator may need:

```text
Experiences
Availability
Bookings
Guests
Payments
Schedules
Cancellations
```

The documentation should expose those capabilities directly.

---

# 16.31 Merchant Capability Declaration

During integration registration, the merchant can declare what it needs.

Conceptually:

```text
Merchant Integration
 ├── Catalog
 ├── Orders
 ├── Bookings
 ├── Payments
 ├── Fulfillment
 └── Webhooks
```

This determines which permissions and documentation are relevant.

---

# 16.32 Scopes

Credentials should use least-privilege scopes.

Example:

```text
catalog.read
catalog.write

orders.read
orders.write

bookings.read
bookings.write

payments.read

webhooks.manage
```

A merchant integration should not automatically receive every NEXG capability.

---

# 16.33 Integration Registration

The merchant IT team begins by creating an integration.

The resulting record contains:

```text
integrationId
merchantId
environment
scopes
status
createdAt
```

Status could be:

```text
DRAFT
SANDBOX
CERTIFICATION
APPROVED
PRODUCTION
SUSPENDED
REVOKED
```

---

# 16.34 Integration Ownership

Every integration should have an owner.

```text
Merchant
 ↓
Integration
 ↓
Technical Contact
 ↓
Operational Contact
```

NEXG needs to know who is responsible for the integration.

---

# 16.35 Technical Contacts

The merchant should provide:

```text
Technical contact
Email
Phone where appropriate
Organization
Role
```

This becomes important during certification and incidents.

---

# 16.36 Production Access Is Earned

Production credentials should not simply appear after sandbox registration.

The lifecycle should be:

```text
Sandbox
 ↓
Testing
 ↓
Certification
 ↓
Approval
 ↓
Production credentials
```

This creates a controlled trust boundary.

---

# 16.37 Integration Certification

Certification proves that the merchant system correctly implements NEXG's integration contract.

Certification should validate:

```text
Authentication
Authorization
API usage
Data validation
Idempotency
Webhook handling
Error handling
Security
Operational readiness
```

---

# 16.38 Certification Checklist

A merchant integration should demonstrate:

### Authentication

```text
Valid credentials succeed
Invalid credentials fail
Expired credentials are handled
```

### Authorization

```text
Allowed scope succeeds
Unauthorized scope fails
Cross-merchant access fails
```

### API

```text
Valid request succeeds
Invalid request is handled
Pagination works
Errors are handled
```

### Webhooks

```text
Signature verified
Duplicates handled
Retries handled
Unknown events tolerated
```

---

# 16.39 Security Certification

The merchant must demonstrate:

```text
Secrets are not exposed
HTTPS is used
Webhook signatures are verified
Credentials are stored securely
Sensitive data is handled appropriately
```

---

# 16.40 Operational Certification

The merchant should demonstrate:

```text
Monitoring exists
Failures are logged
Webhook failures are retried or investigated
NEXG incidents can reach the technical team
```

---

# 16.41 Certification Result

NEXG can produce:

```text
CERTIFIED
```

or:

```text
CERTIFICATION FAILED
```

with explicit failed requirements.

The merchant should know exactly what must be corrected.

---

# 16.42 Certification Evidence

The system should store:

```text
integrationId
test suite
test results
API version
SDK version where applicable
timestamp
reviewer
certification status
```

This becomes the integration's technical record.

---

# 16.43 Certification Expiration

Certification should not necessarily last forever.

It may need re-certification when:

```text
Major API version changes
Authentication changes
Security model changes
Major integration changes
Merchant changes integration architecture
```

---

# 16.44 Production Credential Issuance

After approval:

```text
Certification Approved
       ↓
Production Integration Created
       ↓
Production Credentials Issued
       ↓
Production Webhook Configured
       ↓
Go-Live
```

Production secrets should follow the security architecture defined in Phase 15.

---

# 16.45 Production Environment Isolation

Sandbox and production must remain completely separate.

```text
SANDBOX

Merchant System
      ↓
Sandbox NEXG
      ↓
Sandbox Data

PRODUCTION

Merchant System
      ↓
Production NEXG
      ↓
Live Data
```

Sandbox credentials must never cross the boundary.

---

# 16.46 Go-Live Checklist

Before activation:

```text
✓ Production credentials created
✓ Production webhook configured
✓ HTTPS verified
✓ Webhook signatures enabled
✓ Scopes reviewed
✓ Contacts confirmed
✓ Error handling tested
✓ Monitoring configured
✓ Rollback plan confirmed
✓ Support path confirmed
```

---

# 16.47 Controlled Go-Live

NEXG should support controlled activation.

```text
Production Integration
        ↓
READY
        ↓
ACTIVATING
        ↓
ACTIVE
```

This allows NEXG to observe the initial traffic.

---

# 16.48 First Production Transaction

The first production transaction should be observable.

NEXG should be able to trace:

```text
Request
 ↓
Authentication
 ↓
Authorization
 ↓
Resource
 ↓
Event
 ↓
Webhook
 ↓
Merchant acknowledgement
```

using correlation identifiers.

---

# 16.49 Production Monitoring

After go-live NEXG should monitor:

```text
API success rate
API latency
Error rate
Webhook success rate
Webhook latency
Webhook retry rate
Authentication failures
Rate-limit events
```

---

# 16.50 Merchant Integration Health

The merchant developer portal should eventually display:

```text
Integration Health
────────────────────
API
✓ Healthy

Webhooks
✓ Healthy

Authentication
✓ Healthy

Error Rate
0.4%

Last Event
11:42:18

Last Webhook
11:42:19
```

---

# 16.51 Integration Status

A useful lifecycle is:

```text
DRAFT
   ↓
SANDBOX
   ↓
CERTIFICATION
   ↓
CERTIFIED
   ↓
PRODUCTION_READY
   ↓
ACTIVE
   ↓
SUSPENDED
   ↓
REVOKED
```

---

# 16.52 Integration Suspension

NEXG may temporarily suspend an integration because of:

```text
Security incident
Credential compromise
Abusive traffic
Repeated invalid requests
Webhook misuse
Merchant account suspension
```

Suspension should be auditable.

---

# 16.53 Integration Revocation

Revocation is stronger than suspension.

```text
Integration
 ↓
Credentials revoked
 ↓
Webhook credentials invalidated
 ↓
Access disabled
```

A new certification process may be required before returning to production.

---

# 16.54 API Deprecation

NEXG must eventually support API evolution.

The lifecycle should be:

```text
CURRENT
 ↓
DEPRECATED
 ↓
SUNSET
```

Merchants should receive advance notice.

---

# 16.55 Deprecation Communication

NEXG should communicate:

```text
What is changing?
Why?
When?
Who is affected?
What replaces it?
How do we migrate?
When does the old version stop working?
```

This should appear in the developer portal and relevant operational communications.

---

# 16.56 Backward Compatibility

NEXG should avoid breaking existing integrations unnecessarily.

Changes should preferably be additive:

```text
New optional field
New endpoint
New event
New capability
```

rather than silently changing existing behavior.

---

# 16.57 Unknown Fields

Merchant integrations should generally tolerate additional fields in NEXG responses and webhook payloads.

This allows NEXG to evolve without breaking consumers that correctly follow the contract.

---

# 16.58 Unknown Events

Merchant webhook handlers should safely handle unknown event types.

Conceptually:

```text
Known event
→ Process

Unknown event
→ Log
→ Acknowledge according to contract
→ Do not crash
```

---

# 16.59 Documentation Versioning

Documentation must correspond to API versions.

```text
Developer Docs
 ├── API v1
 ├── API v2
 └── Migration Guides
```

A merchant using v1 should be able to find the v1 contract.

---

# 16.60 API Reference

The reference should document every endpoint with:

```text
Method
Path
Authentication
Scopes
Parameters
Request body
Response
Errors
Examples
Idempotency
Rate limits
```

---

# 16.61 Event Reference

Every event should document:

```text
Event name
When it occurs
Resource
Payload
Version
Delivery guarantees
Retry behavior
Ordering
Idempotency
```

---

# 16.62 Webhook Reference

Every webhook should document:

```text
Endpoint requirements
HTTP method
Headers
Signature
Payload
Response requirements
Retry policy
Timeout
Duplicate delivery
Replay protection
```

---

# 16.63 Error Reference

NEXG should maintain a standard error model.

Conceptually:

```text
{
  code,
  message,
  requestId,
  details
}
```

The `code` should be machine-readable.

The `message` should be developer-readable.

The `requestId` allows NEXG support to trace the problem.

---

# 16.64 Example Integration Journey

A merchant's IT team receives:

```text
Merchant:
ABC Restaurant

Integration:
ABC POS → NEXG
```

They register the integration.

```text
Integration
→ Sandbox
```

NEXG issues sandbox credentials.

They configure:

```text
catalog.read
orders.read
orders.write
webhooks.manage
```

They build their POS integration.

Then they test:

```text
Create product
Create order
Accept order
Update order
Receive webhook
Retry webhook
Handle duplicate webhook
Handle authentication failure
```

All tests pass.

```text
CERTIFIED
```

NEXG issues production credentials.

The merchant configures the production endpoint.

```text
ABC POS
   ↓
NEXG Production
```

The first live order is successfully processed and traced.

The integration becomes:

```text
ACTIVE
```

---

# 16.65 What the Merchant Developer Actually Sees

The developer portal should eventually feel like:

```text
ABC RESTAURANT
Integration

Status
● Production Active

Environment
Production

Credentials
[Manage]

API
[Documentation]

Webhooks
[Manage]

Events
[Reference]

Logs
[View]

Testing
[Sandbox]

Certification
[View]

Health
[View]

Security
[Manage]
```

This becomes the merchant's **NEXG Integration Control Center**.

---

# 16.66 NEXG Integration Documentation Structure

The final documentation hierarchy should be something close to:

```text
NEXG Developer Platform
│
├── Getting Started
│   ├── Integration Overview
│   ├── Create an Integration
│   ├── Authentication
│   └── First API Request
│
├── Concepts
│   ├── Merchants
│   ├── Customers
│   ├── Orders
│   ├── Bookings
│   ├── Payments
│   ├── Fulfillment
│   └── Events
│
├── APIs
│   ├── Catalog
│   ├── Orders
│   ├── Bookings
│   ├── Customers
│   ├── Payments
│   └── Fulfillment
│
├── Webhooks
│   ├── Overview
│   ├── Security
│   ├── Events
│   ├── Retries
│   └── Testing
│
├── Sandbox
│   ├── Test Data
│   ├── Test Scenarios
│   ├── Simulated Payments
│   └── Failure Testing
│
├── Certification
│   ├── Requirements
│   ├── Test Suite
│   └── Submission
│
├── Production
│   ├── Go-Live
│   ├── Monitoring
│   └── Troubleshooting
│
└── Reference
    ├── API Errors
    ├── Event Schemas
    ├── Changelog
    └── Migration Guides
```

---

# 16.67 What Phase 16 Adds to NEXG

Before Phase 16, we had:

```text
API
Events
Webhooks
Notifications
Security
```

Now we add the **merchant integration lifecycle**:

```text
Developer
    ↓
Documentation
    ↓
Credentials
    ↓
Sandbox
    ↓
Testing
    ↓
Certification
    ↓
Production
    ↓
Monitoring
    ↓
Versioning
```

That is what turns NEXG's technical architecture into an actual **developer platform**.

---

# 16.68 Phase 16 Deliverables

### Developer platform

- Merchant integration registration
- Developer portal
- Sandbox
- Production environments
- Credentials
- Scopes
- API documentation
- Event documentation
- Webhook documentation

### Testing

- Synthetic data
- Test scenarios
- Payment simulation
- Failure simulation
- Retry testing
- Duplicate-event testing
- Idempotency testing
- Contract testing

### Certification

- Certification requirements
- Automated test suite
- Security checks
- Webhook checks
- Operational checks
- Certification records
- Certification status

### Production

- Production credential issuance
- Go-live checklist
- Controlled activation
- Integration health
- Monitoring
- Suspension
- Revocation

### Lifecycle

- API versioning
- Documentation versioning
- Deprecation
- Migration
- Backward compatibility

---

# 16.69 The Complete Merchant Integration Trust Chain

NEXG now has:

```text
MERCHANT
   ↓
INTEGRATION
   ↓
IDENTITY
   ↓
CREDENTIAL
   ↓
SCOPE
   ↓
SANDBOX
   ↓
TEST
   ↓
CERTIFICATION
   ↓
PRODUCTION APPROVAL
   ↓
LIVE INTEGRATION
   ↓
MONITORING
   ↓
AUDIT
```

And this is particularly important for the documentation you are trying to create from the Wolt reference.

**We are not reproducing Wolt's documentation structure.**

We are defining the **NEXG operating contract for merchants** based on NEXG's actual architecture:

```text
21 Categories
134 Subcategories
Merchant onboarding
Catalog
Orders
Bookings
Payments
Fulfillment
Events
Webhooks
Notifications
Multi-tenancy
Security
Sandbox
Certification
Production
```

The documentation will ultimately explain **how a merchant's technology connects to NEXG and what NEXG guarantees in return**.

### Next: Phase 17

**Phase 17 — NEXG Observability, Reliability, SRE & Operational Architecture**

This will define what happens *after everything is live*: metrics, logs, traces, health checks, service-level objectives, incident detection, alerting, uptime, dependency monitoring, webhook/API monitoring, merchant integration health, capacity planning and the operational model for running NEXG reliably from the initial **Kilimani deployment** through national and international scale.

## Prompt:
8/7/2026, 11:23:07 AM

Phase 17

## Response:
8/7/2026, 11:23:08 AM

# Phase 17 — NEXG Observability, Reliability, SRE & Operational Architecture

Phase 17 defines **how NEXG knows that the platform is healthy, how it detects problems, how engineers investigate them, how merchants are protected from failures, and how the infrastructure evolves as NEXG grows.**

This phase is particularly important because NEXG is not one application doing one thing.

It contains:

```text
Consumer App
Merchant Portal
Host / Property Manager Portal
Rider App
Admin Platform
API
Orders
Bookings
Payments
Catalog
Fulfillment
Events
Webhooks
Notifications
Email
SMS
Integrations
Databases
Storage
Analytics
```

The architecture therefore needs a unified operational model.

---

# 17.1 NEXG Operational Principle

The fundamental rule is:

> **If NEXG cannot observe it, measure it, trace it and recover it, NEXG does not consider it production-ready.**

Every critical component needs:

```text
Health
Metrics
Logs
Traces
Alerts
Ownership
Recovery procedure
```

---

# 17.2 The NEXG Observability Model

NEXG should use four primary operational signals:

```text
Metrics
   ↓
Logs
   ↓
Traces
   ↓
Events
```

Together they answer different questions.

### Metrics

**Is something wrong?**

### Logs

**What happened?**

### Traces

**Where did it happen?**

### Events

**What business state changed?**

---

# 17.3 Infrastructure Architecture

The initial NEXG deployment should remain intentionally simple.

The platform does **not** need dozens of independently deployed servers on day one.

A sensible initial structure is:

```text
                         INTERNET
                             │
                             ▼
                       Edge / WAF
                             │
                             ▼
                        NEXG App
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
          PostgreSQL       Redis       Object Storage
              │
              ▼
        Backup / Recovery
```

Observability can be attached across this architecture.

---

# 17.4 Monolith First

NEXG can begin with a modular monolith.

Internally:

```text
NEXG Backend
│
├── Identity
├── Merchants
├── Customers
├── Catalog
├── Orders
├── Bookings
├── Payments
├── Fulfillment
├── Notifications
├── Integrations
├── Webhooks
├── Audit
└── Administration
```

These modules remain logically separated even though they initially run in the same application.

---

# 17.5 Why This Matters

When traffic grows, NEXG can extract specific workloads:

```text
Monolith
   ↓
Identify bottleneck
   ↓
Extract workload
   ↓
Independent service
```

This prevents premature microservice complexity.

---

# 17.6 Observability Must Exist Before Extraction

When a module becomes a service, NEXG should already know:

```text
How much traffic it receives
How long it takes
What errors occur
What dependencies it uses
How much infrastructure it consumes
```

Otherwise service extraction becomes guesswork.

---

# 17.7 Health Checks

Every production component needs health checks.

At minimum:

```text
Liveness
Readiness
```

### Liveness

Answers:

> Is the process alive?

### Readiness

Answers:

> Can this instance safely receive traffic?

---

# 17.8 Dependency Health

Readiness should account for critical dependencies.

For example:

```text
Application
   │
   ├── PostgreSQL ✓
   ├── Redis ✓
   └── Object Storage ✓
```

If a critical dependency is unavailable, the application can stop receiving certain traffic rather than pretending it is healthy.

---

# 17.9 Health Endpoint

NEXG should expose an internal/controlled health endpoint such as:

```text
/health
```

with structured health information.

Conceptually:

```text
status: healthy

database: healthy
cache: healthy
storage: healthy
```

Sensitive infrastructure information should not be exposed publicly.

---

# 17.10 Metrics

NEXG should collect metrics at three levels:

```text
Infrastructure
Application
Business
```

This distinction is critical.

---

# 17.11 Infrastructure Metrics

Monitor:

```text
CPU
Memory
Disk
Network
Database connections
Disk I/O
Storage
Container/process health
```

---

# 17.12 Application Metrics

Monitor:

```text
Requests
Latency
Errors
Throughput
Authentication failures
API rate limits
Webhook deliveries
Queue/event processing
Database queries
```

---

# 17.13 Business Metrics

Monitor actual NEXG operations:

```text
Orders created
Orders completed
Bookings created
Bookings cancelled
Payments successful
Payments failed
Refunds
Merchant activations
Customer transactions
Webhook events
```

Business metrics often reveal problems before infrastructure metrics do.

---

# 17.14 The Four Golden Signals

NEXG should monitor:

```text
Latency
Traffic
Errors
Saturation
```

### Latency

How long operations take.

### Traffic

How much demand exists.

### Errors

How frequently operations fail.

### Saturation

How close infrastructure is to capacity.

---

# 17.15 API Latency

NEXG should measure:

```text
P50
P95
P99
```

rather than only averages.

An average of 200 ms can hide users experiencing 5-second responses.

---

# 17.16 Endpoint-Level Metrics

Metrics should identify specific operations.

```text
GET /orders
POST /orders
GET /catalog
POST /bookings
POST /payments
```

This makes bottlenecks actionable.

---

# 17.17 Error Rates

Track:

```text
4xx
5xx
Timeouts
Dependency failures
Authentication failures
```

The platform should distinguish user errors from NEXG failures.

---

# 17.18 Business Failure Rates

Technical success does not necessarily mean business success.

NEXG should track:

```text
Order acceptance failures
Payment failures
Booking failures
Assignment failures
Webhook failures
Notification failures
```

---

# 17.19 Structured Logging

Logs should be machine-readable.

Conceptually:

```text
timestamp
level
service
environment
requestId
traceId
userId
merchantId
action
message
metadata
```

Avoid unstructured messages that cannot be searched reliably.

---

# 17.20 Never Log Secrets

Logs must never contain:

```text
Passwords
API secrets
Access tokens
Webhook secrets
Payment credentials
Encryption keys
```

Sensitive customer information should also be minimized.

---

# 17.21 Log Levels

NEXG should standardize:

```text
DEBUG
INFO
WARN
ERROR
FATAL
```

Production logging should avoid excessive DEBUG output.

---

# 17.22 Request Correlation

Every request receives a correlation identifier.

```text
requestId
```

It should propagate through relevant internal operations.

---

# 17.23 Distributed Tracing

When NEXG eventually has multiple services:

```text
Consumer App
    ↓
API
    ↓
Order Module
    ↓
Payment
    ↓
Event
    ↓
Webhook
    ↓
Merchant System
```

a trace should allow engineers to see the entire chain.

---

# 17.24 Trace Example

An order could produce:

```text
Trace
│
├── POST /orders
│     120 ms
│
├── Validate catalog
│      12 ms
│
├── Create order
│      28 ms
│
├── Payment authorization
│     310 ms
│
├── Publish event
│       7 ms
│
└── Webhook delivery
      180 ms
```

Now an engineer can identify where the delay occurred.

---

# 17.25 Business Trace

Technical traces should connect to business entities.

A trace should be searchable by:

```text
orderId
bookingId
paymentId
merchantId
customerId
integrationId
```

This is extremely valuable for support.

---

# 17.26 The NEXG Single Operational View

The long-term operational console should allow an engineer to enter:

```text
Order:
ORD-20260807-00123
```

and see:

```text
Order
   ↓
API Request
   ↓
Payment
   ↓
Event
   ↓
Webhook
   ↓
Notification
```

This fits NEXG's broader **single-surface/context-first** philosophy.

---

# 17.27 Merchant Integration Observability

From Phase 16, merchant integrations become first-class objects.

NEXG should monitor each integration:

```text
Integration
 ├── API traffic
 ├── Error rate
 ├── Latency
 ├── Webhooks
 ├── Authentication
 ├── Rate limits
 └── Event processing
```

---

# 17.28 Merchant Integration Health

A merchant could see:

```text
ABC Restaurant
Integration Health

API                 ✓ Healthy
Webhooks             ✓ Healthy
Authentication       ✓ Healthy
Error Rate           0.3%
Webhook Success      99.8%
Last Activity        11:42
```

---

# 17.29 Webhook Observability

NEXG should measure:

```text
Webhook attempts
Successful deliveries
Failed deliveries
Retry count
Latency
Response status
Timeouts
```

---

# 17.30 Webhook Health

For each merchant endpoint:

```text
Healthy
Degraded
Failing
Disabled
```

The status should be derived from actual delivery behavior.

---

# 17.31 Webhook Failure Example

Suppose a merchant endpoint returns:

```text
500
500
500
```

NEXG should:

```text
Record failure
 ↓
Retry according to policy
 ↓
Monitor recovery
 ↓
Alert when threshold exceeded
 ↓
Potentially disable endpoint according to policy
```

The merchant should not simply discover days later that NEXG has stopped delivering events.

---

# 17.32 Event Observability

Every important event should have:

```text
eventId
eventType
timestamp
resourceId
merchantId
producer
version
status
```

This makes event operations traceable.

---

# 17.33 Event Processing

When event infrastructure is introduced, monitor:

```text
Events published
Events processed
Processing latency
Failed events
Retries
Dead-letter events
```

---

# 17.34 Dead-Letter Handling

Events that repeatedly fail should be isolated.

```text
Event
 ↓
Attempt
 ↓
Failure
 ↓
Retry
 ↓
Failure
 ↓
Retry
 ↓
Failure
 ↓
Dead Letter
```

Operations should be able to inspect and replay them safely.

---

# 17.35 Event Replay

Authorized operators should eventually be able to:

```text
Inspect event
 ↓
Verify failure reason
 ↓
Correct problem
 ↓
Replay event
```

Replay must be controlled and auditable.

---

# 17.36 Database Observability

PostgreSQL should be monitored for:

```text
Connections
Query latency
Slow queries
Locks
Deadlocks
Transactions
Cache efficiency
Storage
Replication
Backup status
```

---

# 17.37 Slow Query Detection

NEXG should identify queries exceeding defined thresholds.

The goal is to discover:

```text
API slow
   ↓
Database query slow
   ↓
Missing index
```

before the issue becomes a platform-wide problem.

---

# 17.38 Database Capacity

Track:

```text
CPU
Memory
Connections
Storage
IOPS
Query volume
Growth rate
```

This provides the evidence required before scaling.

---

# 17.39 Redis Observability

If Redis is used for caching, sessions, rate limiting or event infrastructure, monitor:

```text
Memory
Hit rate
Miss rate
Connections
Latency
Evictions
Failures
```

---

# 17.40 Object Storage Observability

Monitor:

```text
Storage growth
Upload failures
Download failures
Request volume
Access errors
```

---

# 17.41 External Dependency Monitoring

NEXG depends on external systems.

Examples:

```text
Payment providers
SMS
Email
Maps
Identity
Cloud infrastructure
```

NEXG should measure each dependency independently.

---

# 17.42 Dependency Health

Conceptually:

```text
Payments       ✓
Email          ✓
SMS            ⚠
Maps           ✓
Storage        ✓
```

This lets NEXG distinguish:

> **NEXG is broken**

from:

> **NEXG is working but an external provider is degraded.**

---

# 17.43 Circuit Breakers

When an external dependency repeatedly fails:

```text
NEXG
 ↓
Payment Provider
 ↓
Repeated failures
```

NEXG should avoid continuously hammering the provider.

A circuit-breaker pattern can move the dependency into a protected state.

---

# 17.44 Timeout Strategy

Every external request should have an explicit timeout.

Never allow:

```text
Request
 ↓
Waiting indefinitely
```

Timeouts should be designed according to the business operation.

---

# 17.45 Retry Strategy

Retries should be selective.

Safe candidates include transient failures.

Unsafe retry behavior can duplicate business operations.

Therefore:

```text
Retry
+
Idempotency
```

must be designed together.

---

# 17.46 Availability

NEXG should define availability targets for important capabilities.

Different functions can have different targets.

```text
Core API
Payments
Orders
Merchant portal
Notifications
Developer API
```

---

# 17.47 SLOs

NEXG should define **Service Level Objectives**.

Conceptually:

```text
API Availability
≥ defined target

P95 API latency
≤ defined target

Webhook delivery success
≥ defined target
```

The exact targets should be established from real traffic and business requirements rather than guessed prematurely.

---

# 17.48 SLIs

The SLO must be based on measurable **Service Level Indicators**.

Examples:

```text
successful requests / total requests

requests under latency threshold / total requests

successful webhook deliveries / total deliveries
```

---

# 17.49 Error Budgets

If NEXG has an SLO, it gets an error budget.

```text
SLO
 ↓
Allowed failure
 ↓
Error Budget
```

When the budget is consumed too quickly, engineering should prioritize reliability work over risky feature releases.

---

# 17.50 Reliability Is a Product Feature

For NEXG:

```text
Order failed
```

is not merely an engineering problem.

It is:

```text
Customer experience
Merchant revenue
NEXG revenue
Trust
```

Therefore reliability belongs to product architecture.

---

# 17.51 Incident Management

When something breaks:

```text
Detect
 ↓
Alert
 ↓
Acknowledge
 ↓
Investigate
 ↓
Contain
 ↓
Recover
 ↓
Communicate
 ↓
Review
```

---

# 17.52 Incident Severity

NEXG should define severity levels.

```text
SEV-1
Critical platform-wide/business impact

SEV-2
Major functionality affected

SEV-3
Limited functionality affected

SEV-4
Minor operational issue
```

---

# 17.53 Incident Ownership

Every critical incident should have:

```text
Incident Commander
Technical Lead
Communications Owner
Subject Matter Experts
```

The exact organizational structure can evolve as NEXG grows.

---

# 17.54 Incident Timeline

During an incident, NEXG should record:

```text
Detected
Acknowledged
Investigating
Mitigation started
Service restored
Incident resolved
Postmortem completed
```

---

# 17.55 Merchant Communication

For major incidents, affected merchants should receive appropriate communication.

The message should clearly state:

```text
What is affected
When it started
Current status
What merchants should do
Expected next update
Resolution
```

---

# 17.56 Status Page

NEXG should eventually operate a public or merchant-facing status page.

Conceptually:

```text
NEXG STATUS

API                 Operational
Merchant Portal     Operational
Payments            Operational
Webhooks            Operational
Notifications       Degraded
```

---

# 17.57 Internal Status

Internal operations should have more detail:

```text
API
 ├── latency
 ├── error rate
 ├── instances
 └── dependencies

Payments
 ├── provider A
 ├── provider B
 └── failure rate
```

---

# 17.58 Alerting

Alerts should be based on symptoms and meaningful thresholds.

Bad alert:

```text
CPU = 71%
```

Useful alert:

```text
API error rate exceeded defined SLO threshold.
```

---

# 17.59 Alert Fatigue

NEXG should avoid hundreds of low-value alerts.

Every alert should answer:

```text
Is action required?
Who should act?
What is the impact?
```

---

# 17.60 Alert Routing

Different alerts go to different owners.

```text
Database
→ Infrastructure

Payment failure
→ Payments / Engineering

Webhook failures
→ Integrations

Security incident
→ Security / Engineering
```

---

# 17.61 Capacity Planning

NEXG should continuously monitor growth.

```text
Users
Orders
Bookings
API calls
Database size
Storage
Events
Webhooks
```

---

# 17.62 Scaling Signals

Scaling decisions should be based on measured signals.

```text
Traffic growth
Latency
CPU
Memory
Database load
Connection pressure
Queue/event backlog
```

---

# 17.63 Initial Kilimani Deployment

For the initial NEXG deployment, the architecture can remain relatively compact:

```text
             Internet
                 │
                 ▼
            Edge / WAF
                 │
                 ▼
          NEXG Application
                 │
       ┌─────────┼─────────┐
       ▼         ▼         ▼
 PostgreSQL    Redis    Storage
       │
       ▼
    Backups
```

Observability should cover all of them from day one.

---

# 17.64 First Scaling Step

When demand grows:

```text
Single App
    ↓
Multiple App Instances
    ↓
Load Balancer
    ↓
Managed / Dedicated PostgreSQL
    ↓
Redis expansion
    ↓
Separate event infrastructure
```

---

# 17.65 Second Scaling Step

When specific workloads become bottlenecks:

```text
NEXG Monolith
│
├── Core Platform
├── Order Service
├── Notification Service
├── Integration Service
└── Analytics
```

Only workloads that demonstrate a real need should be extracted.

---

# 17.66 Geographic Expansion

When NEXG expands beyond Nairobi:

```text
Nairobi
 ↓
Kenya
 ↓
East Africa
 ↓
Africa
 ↓
International
```

the architecture can progressively introduce:

```text
Regional infrastructure
Regional databases
Read replicas
CDN
Regional storage
Traffic routing
```

---

# 17.67 Observability Across Regions

The operational console should eventually show:

```text
Nairobi
✓

Kampala
✓

Dar es Salaam
⚠

International
✓
```

with independent regional metrics.

---

# 17.68 Disaster Recovery

NEXG must define:

```text
RPO
RTO
Backup frequency
Backup retention
Recovery procedure
Recovery ownership
```

---

# 17.69 Backup Monitoring

A backup system is not reliable merely because a backup job says:

```text
SUCCESS
```

NEXG should periodically verify that backups can actually be restored.

---

# 17.70 Recovery Testing

Recovery should be tested deliberately.

```text
Backup
 ↓
Restore
 ↓
Validate
 ↓
Measure recovery time
```

This establishes whether the documented RTO is realistic.

---

# 17.71 Failover

As NEXG matures, critical components can support failover.

Potential targets:

```text
Application
Database
Cache
Load balancer
Storage
External provider
```

---

# 17.72 Graceful Degradation

NEXG should continue providing useful functionality when non-critical components fail.

If email fails:

```text
Ordering
✓

Payment
✓

Email
✗
```

The entire platform should not necessarily become unavailable.

---

# 17.73 Notification Degradation

If email is unavailable:

```text
Email
✗

Push
✓

In-App
✓
```

where the workflow permits it.

---

# 17.74 Payment Provider Degradation

If one payment provider fails, the architecture should be able to distinguish:

```text
Provider unavailable
```

from:

```text
NEXG payment system unavailable.
```

The eventual payment abstraction should make provider-level failure observable.

---

# 17.75 Reliability by Business Domain

Each major NEXG domain should eventually have an operational scorecard.

```text
Orders
Payments
Bookings
Fulfillment
Notifications
Integrations
```

Each scorecard contains:

```text
Availability
Latency
Error rate
Volume
Failures
Dependencies
```

---

# 17.76 NEXG Operational Dashboard

The internal operations surface could look like:

```text
NEXG OPERATIONS

Platform
● Healthy

API
99.98% availability

Orders
● Healthy

Payments
● Healthy

Webhooks
● Healthy

Notifications
⚠ Degraded

Database
● Healthy

Infrastructure
● Healthy
```

Selecting a domain opens the contextual operational information.

This aligns with the NEXG **single-surface / context-first** philosophy rather than creating dozens of disconnected dashboards.

---

# 17.77 Service Ownership

Every production capability must have an owner.

```text
Capability
Owner
Backup owner
Escalation
Runbook
```

No critical system should exist without someone responsible for it.

---

# 17.78 Runbooks

Every important operational failure should have a documented runbook.

Example:

```text
Webhook Delivery Failure
```

Runbook:

```text
1. Check endpoint health
2. Inspect response codes
3. Check merchant integration status
4. Check retry queue
5. Inspect recent deployment
6. Determine provider vs NEXG fault
7. Recover
8. Document incident
```

---

# 17.79 Operational Knowledge Base

The NEXG internal documentation should contain:

```text
Architecture
Runbooks
Incident procedures
Dependency information
Recovery procedures
Service ownership
Deployment procedures
Security procedures
```

---

# 17.80 Change Monitoring

Every deployment should be traceable.

```text
Deployment
 ↓
Version
 ↓
Commit
 ↓
Environment
 ↓
Timestamp
 ↓
Operator
```

If errors increase immediately after deployment, engineers can correlate the change.

---

# 17.81 Deployment Safety

NEXG should eventually support:

```text
Rolling deployment
Canary deployment
Feature flags
Rollback
```

The appropriate mechanism depends on infrastructure maturity.

---

# 17.82 Feature Flags

Feature flags allow controlled activation.

```text
Feature
 ↓
Disabled
 ↓
Internal users
 ↓
5%
 ↓
25%
 ↓
100%
```

This reduces the risk of large releases.

---

# 17.83 Release Health

After deployment:

```text
Compare
Before deployment
vs
After deployment
```

Measure:

```text
Errors
Latency
Traffic
Business failures
```

---

# 17.84 Post-Incident Review

Major incidents should produce a blameless postmortem.

It should contain:

```text
What happened?
Why?
What was affected?
How was it detected?
How was it resolved?
What prevented faster recovery?
What changes will prevent recurrence?
```

---

# 17.85 Reliability Improvement Loop

NEXG should continuously operate:

```text
Measure
 ↓
Detect
 ↓
Investigate
 ↓
Fix
 ↓
Measure Again
```

This becomes the SRE feedback loop.

---

# 17.86 Phase 17 Deliverables

At the end of Phase 17, NEXG has defined:

### Observability

- Metrics
- Logs
- Traces
- Events
- Correlation IDs
- Business observability
- Infrastructure observability

### Reliability

- Health checks
- Availability
- SLOs
- SLIs
- Error budgets
- Graceful degradation
- Failover
- Recovery

### Operations

- Incident management
- Alerting
- Runbooks
- Service ownership
- Status page
- Operational dashboards
- Deployment monitoring

### Infrastructure

- Initial monolith architecture
- Database monitoring
- Redis monitoring
- Storage monitoring
- Dependency monitoring
- Capacity planning
- Scaling strategy

### Merchant integrations

- Integration health
- API monitoring
- Webhook monitoring
- Event monitoring
- Merchant-facing diagnostics

### Disaster recovery

- Backups
- Restore testing
- RPO
- RTO
- Recovery procedures

---

# 17.87 The NEXG Production Operating Model

After Phase 17, the architecture is no longer simply:

```text
App → Database
```

It becomes:

```text
                         NEXG
                          │
                     ┌────┴────┐
                     │  Edge   │
                     └────┬────┘
                          │
                     Application
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
   PostgreSQL           Redis             Storage
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                    Event Layer
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
         Webhooks      Notifications  Integrations
             │
             ▼
       Merchant Systems

────────────────────────────────────────────

           OBSERVABILITY PLANE
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
    Metrics      Logs      Traces
       │          │          │
       └──────────┼──────────┘
                  ▼
             Operations
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
    Alerts     Incidents   Recovery
```

The key architectural decision is that **observability is a platform-wide plane**, not a feature belonging to one server.

---

# 17.88 The Evolution Path

This gives NEXG the expansion strategy you were discussing earlier:

```text
PHASE A — START
Single modular application
+
PostgreSQL
+
Redis
+
Object storage
+
Backups
+
Observability

PHASE B — GROW
Multiple application instances
+
Load balancing
+
Dedicated infrastructure
+
Read replicas

PHASE C — SCALE
Extract proven bottlenecks
+
Event infrastructure
+
Dedicated services
+
Advanced observability

PHASE D — REGIONAL
Regional infrastructure
+
Data strategy
+
Traffic routing
+
Regional resilience

PHASE E — INTERNATIONAL
Multi-region architecture
+
Regional operations
+
Advanced disaster recovery
+
Global developer platform
```

This is important: **NEXG does not need to buy or operate every possible server category on day one.**

The architecture starts simple while the **operational contracts, telemetry and scaling boundaries are designed from the beginning**.

That means when NEXG grows, you can add infrastructure because the system has demonstrated the need for it—not because the architecture was prematurely over-engineered.

## Prompt:
8/7/2026, 11:27:22 AM

List all 17 phases

## Response:
8/7/2026, 11:27:23 AM

Absolutely. The 17 phases we have built so far form the foundation for the **NEXG Merchant Platform & Developer Documentation Architecture**.

### NEXG — 17-Phase Architecture & Documentation Program

| Phase | Focus | Core outcome |
|---|---|---|
| **1** | **NEXG Taxonomy & Domain Foundation** | Establishes the NEXG category/subcategory system, domain vocabulary, entities, relationships and rules that everything else uses. |
| **2** | **Merchant Identity & Merchant Model** | Defines merchants, merchant profiles, locations, business information, ownership, users and merchant-level configuration. |
| **3** | **Catalog & Product Architecture** | Defines how merchants create, organize and expose products/services, including categories, subcategories, variants, pricing, availability and attributes. |
| **4** | **Customer & Consumer Architecture** | Defines customers, profiles, addresses, preferences, order history, interactions and the relationship between customers and merchants. |
| **5** | **Ordering & Transaction Lifecycle** | Defines the complete order model and state machine from creation through acceptance, preparation, fulfillment, completion, cancellation and failure. |
| **6** | **Bookings, Reservations & Service Workflows** | Defines non-order transactional workflows such as airport transfers, tours, experiences, wellness and concierge services. |
| **7** | **Fulfillment & Operational Workflows** | Defines how NEXG turns transactions into operational work across merchants, riders, service providers, hosts and other fulfillment actors. |
| **8** | **Payments, Pricing, Commissions & Settlements** | Defines money movement, pricing, fees, commissions, refunds, merchant balances, settlements and financial states. |
| **9** | **NEXG Notifications & Communication Architecture** | Defines email, SMS, push, in-app and other operational communications, including which business events trigger which communications. |
| **10** | **NEXG Business Events & Event Architecture** | Defines the canonical event model that connects business actions across NEXG and provides the foundation for automation, integrations and real-time behavior. |
| **11** | **NEXG API Architecture & Developer Contract** | Defines the external API model, resources, endpoints, request/response structures, versioning, errors, pagination, idempotency and API conventions. |
| **12** | **NEXG Integration & Connectivity Architecture** | Defines how merchant systems such as POS, ERP, inventory, booking, fulfillment and other external systems connect to NEXG. |
| **13** | **Webhooks, Real-Time Events & Integration Delivery** | Defines how NEXG delivers events to merchant systems, including webhook subscriptions, signatures, retries, ordering, duplicate delivery and failure handling. |
| **14** | **Developer Documentation & Merchant IT Experience** | Turns the architecture into the actual documentation system merchants' technical teams use: getting started, guides, API reference, concepts, event reference and integration workflows. |
| **15** | **Security, Privacy, Compliance & Trust Architecture** | Defines identity, authentication, authorization, RBAC/ABAC, tenant isolation, secrets, encryption, audit, privacy, payment security and compliance foundations. |
| **16** | **Sandbox, Testing, Integration Certification & Merchant Go-Live** | Defines the complete path from sandbox credentials → development → testing → certification → production credentials → controlled go-live. |
| **17** | **Observability, Reliability, SRE & Operational Architecture** | Defines metrics, logs, traces, health checks, monitoring, SLOs, incidents, alerting, disaster recovery, capacity planning and the infrastructure scaling path. |

### The architecture underneath the 17 phases

The phases progressively build this:

```text
                    NEXG FOUNDATION
                          │
                          ▼
              1. TAXONOMY & DOMAINS
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
         MERCHANT      CUSTOMER      CATALOG
             │            │            │
             └────────────┼────────────┘
                          ▼
              ORDERS & TRANSACTIONS
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
          BOOKINGS                FULFILLMENT
              │                       │
              └───────────┬───────────┘
                          ▼
                     PAYMENTS
                          │
                          ▼
                 COMMUNICATIONS
                          │
                          ▼
                      EVENTS
                          │
                          ▼
                       APIs
                          │
                          ▼
                    INTEGRATIONS
                          │
                          ▼
                     WEBHOOKS
                          │
                          ▼
                DEVELOPER DOCS
                          │
                          ▼
                     SECURITY
                          │
                          ▼
                 SANDBOX & TESTING
                          │
                          ▼
                    PRODUCTION
                          │
                          ▼
                OBSERVABILITY & SRE
```

### The important distinction

These aren't 17 unrelated documents.

They form **one dependency chain**:

**Taxonomy → business objects → transactions → operational workflows → money → communications → events → APIs → integrations → security → certification → production operations.**

And your existing **21 merchant categories / 134 subcategories** sit at the foundation rather than being treated as a superficial UI list.

That is what will eventually let us produce the NEXG equivalent of the kind of comprehensive merchant/developer documentation you saw in Wolt's developer platform—**but based on NEXG's own business model, architecture, workflows and terminology.**

## Prompt:
8/7/2026, 11:29:53 AM

Only host model left

## Response:
8/7/2026, 11:29:54 AM

Correct. If we are treating the **merchant/developer platform documentation architecture** as the scope of these 17 phases, then the major model that remains is the **NEXG Host Model**.

And it should **not** simply be squeezed into the merchant model, because a host/property manager has a fundamentally different relationship with NEXG.

### NEXG Host Model

The next phase should define:

1. **Host identity**
   - Individual host
   - Property manager
   - Management company
   - Organization/team

2. **Property model**
   - Property
   - Building
   - Unit
   - Room
   - Villa
   - Apartment
   - Hotel/accommodation entity

3. **Ownership & management**
   - Owner
   - Host
   - Property manager
   - Management company
   - Staff
   - Relationships between them

4. **Guest model**
   - Guest
   - Reservation
   - Stay
   - Guest requests
   - Guest preferences
   - Guest history

5. **Property services**
   - Restaurants & Food
   - Groceries & Essentials
   - Laundry & Cleaning
   - Airport Transfers
   - Vehicle Rentals
   - Experiences
   - Wellness
   - Concierge Services
   - Travel & Tours
   - Other NEXG merchant categories

6. **Host → NEXG merchant relationship**

```text
HOST
  │
  ▼
PROPERTY
  │
  ▼
GUEST
  │
  ▼
NEXG SERVICE DISCOVERY
  │
  ▼
MERCHANT
  │
  ▼
ORDER / BOOKING
  │
  ▼
FULFILLMENT
```

7. **Property-level configuration**
   - Available services
   - Guest access
   - Delivery instructions
   - House rules
   - Preferred merchants
   - Service restrictions
   - Property staff

8. **Host operational workflows**
   - Guest arrival
   - Guest requests
   - Service ordering
   - Deliveries
   - Maintenance/service coordination
   - Checkout
   - Post-stay workflows

9. **Host CRM**

This connects directly with the **Host Property Manager CRM** we've already been designing:

```text
Host
 ├── Properties
 ├── Owners
 ├── Guests
 ├── Reservations
 ├── Activities
 ├── Follow-ups
 ├── Communications
 └── Documents
```

10. **Host financial model**
   - Service charges
   - Commissions
   - Property-level billing
   - Guest-paid services
   - Host-paid services
   - Management fees
   - Reconciliation

11. **Host API / integrations**
   - Property-management systems
   - Booking systems
   - Calendar systems
   - Guest-management systems
   - Smart-property systems
   - External hospitality platforms

12. **Host permissions**

```text
Owner
Property Manager
Manager
Staff
Concierge
Finance
Viewer
```

13. **Host security & privacy**
   - Property isolation
   - Guest-data access
   - Staff permissions
   - Owner permissions
   - Sensitive guest information

14. **Host onboarding**

```text
Create Host
    ↓
Add Organization
    ↓
Add Property
    ↓
Configure Property
    ↓
Connect Reservation System
    ↓
Configure Services
    ↓
Invite Staff
    ↓
Activate
```

15. **Host → Merchant → Guest ecosystem**

This is the key NEXG relationship:

```text
                         NEXG
                          │
             ┌────────────┴────────────┐
             │                         │
           HOST                     MERCHANT
             │                         │
         PROPERTY                 SERVICE
             │                         │
           GUEST                     │
             └──────────┬──────────────┘
                        │
                     ORDER /
                     BOOKING
                        │
                        ▼
                   FULFILLMENT
```

So yes: **the Host Model is the major remaining domain model.**

I would make it **Phase 18 — NEXG Host, Property & Hospitality Management Architecture**, rather than trying to append it to Phase 17. It deserves its own complete phase because it introduces an entire second side of the NEXG ecosystem alongside the merchant side.

## Prompt:
8/7/2026, 11:30:37 AM

Phase 18

## Response:
8/7/2026, 11:30:38 AM

Yes. **Phase 18 is the Host Model**, and this is where we define the other major side of NEXG alongside the Merchant Model.

# Phase 18 — NEXG Host, Property & Hospitality Management Architecture

The purpose of Phase 18 is to establish the complete **Host → Property → Guest → Service** operating model.

NEXG therefore has two fundamentally different business participants:

```text
MERCHANT
   │
   └── Provides products/services

HOST
   │
   └── Manages properties/guests
```

NEXG connects them through the guest's needs.

```text
HOST
  ↓
PROPERTY
  ↓
GUEST
  ↓
NEXG
  ↓
MERCHANT
  ↓
SERVICE / ORDER / BOOKING
```

---

# 18.1 The NEXG Host Model

The core model is:

```text
Host
  │
  ├── Organization
  │
  ├── Properties
  │
  ├── Owners
  │
  ├── Staff
  │
  ├── Guests
  │
  ├── Reservations
  │
  ├── Services
  │
  ├── Communications
  │
  └── Financial Activity
```

A host is therefore not simply another user.

A host is an **operational entity responsible for one or more hospitality properties and the guest experience associated with those properties.**

---

# 18.2 Host Types

NEXG should support different host operating models.

### Individual Host

One person manages one or more properties.

```text
Host
 └── Property
```

### Property Manager

A professional manager operates properties belonging to one or more owners.

```text
Property Manager
 ├── Owner A
 │    ├── Property 1
 │    └── Property 2
 │
 └── Owner B
      └── Property 3
```

### Management Company

An organization manages a portfolio.

```text
Management Company
 ├── Managers
 ├── Staff
 ├── Owners
 └── Properties
```

---

# 18.3 Host Organization

The organizational structure should therefore be:

```text
Organization
      │
      ├── Users
      ├── Roles
      ├── Owners
      └── Properties
```

A person can belong to an organization without personally owning every property.

---

# 18.4 Host Identity

The host identity should contain:

```text
hostId
hostType
organizationId
name
contact information
status
createdAt
updatedAt
```

The `hostId` becomes the primary reference for host-level operations.

---

# 18.5 Host Status

NEXG should maintain an explicit lifecycle:

```text
PROSPECT
   ↓
ONBOARDING
   ↓
PENDING_VERIFICATION
   ↓
ACTIVE
   ↓
SUSPENDED
   ↓
ARCHIVED
```

This should be separate from the user's authentication status.

---

# 18.6 Host vs Host User

This distinction is important.

```text
HOST
```

is the business entity.

```text
HOST USER
```

is the person accessing NEXG.

One host organization can have:

```text
Host
 ├── Owner User
 ├── Manager User
 ├── Concierge User
 ├── Finance User
 └── Viewer User
```

---

# 18.7 Property as a First-Class Entity

A property is not merely an address.

NEXG should model:

```text
Property
 ├── Identity
 ├── Location
 ├── Type
 ├── Ownership
 ├── Management
 ├── Units
 ├── Staff
 ├── Guests
 ├── Services
 └── Configuration
```

---

# 18.8 Property Identity

Each property receives a unique identifier.

```text
propertyId
```

The property record can contain:

```text
propertyName
propertyType
address
location
hostId
status
createdAt
updatedAt
```

---

# 18.9 Property Types

NEXG should support hospitality structures such as:

```text
Apartment
Villa
House
Hotel
Boutique Hotel
Guesthouse
Lodge
Resort
Serviced Apartment
Hostel
```

The taxonomy should remain extensible.

---

# 18.10 Property Hierarchy

Some properties contain multiple rentable units.

Therefore:

```text
Property
   │
   ├── Unit
   ├── Unit
   └── Unit
```

A larger accommodation structure could be:

```text
Building
 ├── Floor
 │    ├── Unit
 │    └── Unit
 └── Floor
      ├── Unit
      └── Unit
```

---

# 18.11 Unit

A unit represents the actual accommodation space associated with a guest stay.

Examples of unit structures:

```text
Apartment 4B
Villa 7
Room 204
Suite 12
```

A unit should have its own identifier.

---

# 18.12 Property Ownership

Ownership and management must be separate concepts.

```text
Owner
   ↓
owns
   ↓
Property
```

while:

```text
Property Manager
   ↓
manages
   ↓
Property
```

The same organization may perform both roles, but NEXG should not assume they are identical.

---

# 18.13 Ownership Relationships

A property may have:

```text
Owner
 ├── Ownership percentage
 ├── Financial relationship
 └── Property rights
```

NEXG should allow ownership structures to evolve without redesigning the property model.

---

# 18.14 Management Relationship

A property can have:

```text
Management Company
        ↓
Property Manager
        ↓
Property
```

This allows NEXG to support professional property-management businesses.

---

# 18.15 Property Staff

Staff can be assigned to properties.

```text
Property
 ├── Manager
 ├── Concierge
 ├── Housekeeping
 ├── Maintenance
 └── Operations
```

Their permissions should be controlled by role.

---

# 18.16 Host Roles

The initial role model can include:

```text
OWNER
PROPERTY_MANAGER
MANAGER
CONCIERGE
OPERATIONS
FINANCE
STAFF
VIEWER
```

Roles determine access.

---

# 18.17 Property-Level Permissions

A user might have access to:

```text
Property A
```

without having access to:

```text
Property B
```

within the same organization.

This is essential for multi-property management companies.

---

# 18.18 Guest

The guest is another first-class entity.

```text
Guest
 ├── Identity
 ├── Contact
 ├── Reservations
 ├── Stays
 ├── Requests
 ├── Orders
 ├── Bookings
 └── Preferences
```

---

# 18.19 Guest Identity

The guest record should contain only the information required for the NEXG experience.

Conceptually:

```text
guestId
name
contact
preferences
status
```

Sensitive information must follow NEXG privacy and access rules.

---

# 18.20 Guest Does Not Belong Permanently to One Property

A guest can stay at different properties.

Therefore:

```text
Guest
 ├── Stay A → Property A
 ├── Stay B → Property B
 └── Stay C → Property C
```

The guest is global to the permitted NEXG context, while the stay is property-specific.

---

# 18.21 Reservation

A reservation connects:

```text
Guest
   ↓
Property / Unit
   ↓
Reservation
```

A reservation should contain:

```text
reservationId
guestId
propertyId
unitId
arrival
departure
status
source
```

---

# 18.22 Reservation Lifecycle

```text
REQUESTED
   ↓
CONFIRMED
   ↓
ARRIVING
   ↓
CHECKED_IN
   ↓
IN_STAY
   ↓
CHECKED_OUT
```

Cancellation paths must exist separately.

---

# 18.23 Stay

A reservation represents the planned accommodation.

A **stay** represents the actual guest occupancy period.

This distinction allows NEXG to handle:

```text
Reservation
   ↓
Actual arrival
   ↓
Stay
   ↓
Actual departure
```

---

# 18.24 Guest Context

When a guest interacts with NEXG, the system should understand their active context.

```text
Guest
 ↓
Current Stay
 ↓
Property
 ↓
Unit
 ↓
Available Services
```

This is one of the most important parts of the NEXG Host model.

---

# 18.25 Property Service Configuration

Each property can define which NEXG services guests can access.

```text
Property
 ├── Food
 ├── Groceries
 ├── Laundry
 ├── Airport Transfer
 ├── Experiences
 ├── Wellness
 └── Concierge
```

These services are supplied through the NEXG merchant ecosystem.

---

# 18.26 Merchant Discovery for Hosts

The host should not manually recreate merchant catalogs.

Instead:

```text
Property
      ↓
Guest Location
      ↓
NEXG Merchant Network
      ↓
Eligible Merchants
      ↓
Available Services
```

NEXG determines which merchants can serve the property.

---

# 18.27 Property Service Rules

The host can configure:

```text
Allowed
Restricted
Preferred
Disabled
```

for services.

A host could therefore control what guests can access without controlling the underlying merchant.

---

# 18.28 Preferred Merchants

A property may establish preferred merchants.

```text
Property
 ├── Preferred Restaurant
 ├── Preferred Laundry
 ├── Preferred Airport Transfer
 └── Preferred Spa
```

NEXG can use these preferences in guest discovery.

---

# 18.29 Guest Service Discovery

The guest experience becomes:

```text
Guest
 ↓
Current Property
 ↓
Available Services
 ↓
Category
 ↓
Merchant
 ↓
Product / Service
 ↓
Order / Booking
```

The guest does not need to understand NEXG's internal organizational structure.

---

# 18.30 Host-Generated Requests

Hosts can also initiate services on behalf of guests.

```text
Host
 ↓
Guest
 ↓
Service Request
 ↓
Merchant
```

The system should record who initiated the transaction.

---

# 18.31 Request Attribution

Every host-created transaction should identify:

```text
requestedBy
requestedFor
propertyId
guestId
merchantId
```

This prevents ambiguity between guest and staff activity.

---

# 18.32 Property Concierge

NEXG can provide a dedicated concierge workflow.

```text
Guest Request
      ↓
Concierge
      ↓
NEXG
      ↓
Merchant
      ↓
Fulfillment
```

The concierge can coordinate multiple services without the guest needing to understand the underlying providers.

---

# 18.33 Concierge Request Lifecycle

```text
REQUESTED
   ↓
ACKNOWLEDGED
   ↓
PROCESSING
   ↓
PROVIDER_ASSIGNED
   ↓
IN_PROGRESS
   ↓
COMPLETED
```

Failure and cancellation states must also exist.

---

# 18.34 Host Services

Host-side services are not the same as merchant services.

Host operations can include:

```text
Guest Assistance
Property Coordination
Cleaning Coordination
Maintenance Coordination
Transport Coordination
Reservation Assistance
Guest Communication
```

The host can orchestrate these while merchants fulfill external services.

---

# 18.35 Property Operations

The property management workspace should expose:

```text
Today's Arrivals
Today's Departures
Current Guests
Open Requests
Pending Services
Upcoming Reservations
Property Tasks
```

---

# 18.36 Property Timeline

Each property should have a contextual timeline.

```text
Property
│
├── Reservation Created
├── Guest Arrived
├── Airport Transfer Booked
├── Restaurant Order
├── Laundry Request
├── Concierge Request
└── Guest Checked Out
```

This creates the operational history of the property.

---

# 18.37 Guest Timeline

The guest timeline can show authorized activity:

```text
Guest
│
├── Reservation
├── Check-in
├── Airport Transfer
├── Restaurant Order
├── Spa Booking
└── Check-out
```

Access must respect privacy and role permissions.

---

# 18.38 Host Dashboard

The host dashboard should not become another generic analytics dashboard.

It should be an operational workspace.

```text
HOST
────────────────────────
3 Arrivals
2 Departures
4 Active Guests
5 Open Requests
2 Pending Services

PROPERTY ACTIVITY
────────────────────────
Villa A
Guest checked in

Apartment 4B
Airport transfer booked

Villa C
Cleaning request pending
```

---

# 18.39 Host CRM

The host CRM should track relationships around the property portfolio.

```text
Host
 ├── Owners
 ├── Properties
 ├── Guests
 ├── Contacts
 ├── Activities
 ├── Follow-ups
 ├── Meetings
 └── Documents
```

This connects directly with the CRM architecture already established for NEXG.

---

# 18.40 Owner Relationship

For professional property managers:

```text
Owner
 ↓
Properties
 ↓
Performance
 ↓
Operations
 ↓
Financial Activity
```

The owner should only see information permitted by their relationship with the management organization.

---

# 18.41 Owner Portal

An owner-facing experience can eventually provide:

```text
Properties
Occupancy
Reservations
Revenue
Expenses
Services
Maintenance
Reports
Documents
```

This should be separate from the property manager's operational interface.

---

# 18.42 Host Financial Model

Host financial activity needs to distinguish:

```text
Guest-paid
Host-paid
Owner-paid
Merchant-paid
NEXG commission
Management fee
Service charge
Refund
```

This allows NEXG to reconcile the different parties correctly.

---

# 18.43 Service Billing Attribution

A transaction should identify its financial context.

```text
Order
 ├── Guest
 ├── Property
 ├── Merchant
 ├── Payer
 └── Financial responsibility
```

The payer does not necessarily have to be the guest.

---

# 18.44 Property-Level Billing

NEXG should support property-level accounts where permitted.

```text
Property
 ↓
Services
 ↓
Charges
 ↓
Statement
```

This is particularly useful for management companies coordinating services centrally.

---

# 18.45 Host Notifications

Hosts should receive operational notifications rather than every event generated by the system.

Relevant events include:

```text
New reservation
Guest arrival
Guest request
Service issue
Order problem
Booking cancellation
Payment issue
Property task
```

Notification preferences should be configurable.

---

# 18.46 Guest Communication

The host can communicate with guests through NEXG's communication architecture.

```text
Host
 ↓
Guest
```

Channels may include:

```text
In-App
Push
Email
SMS
```

subject to the communication rules defined in Phase 9.

---

# 18.47 Property Documents

A property can have:

```text
Property Documents
 ├── Agreements
 ├── Instructions
 ├── Property information
 ├── Policies
 ├── Maintenance documents
 └── Owner documents
```

Access must follow property and organization permissions.

---

# 18.48 Property Configuration

Every property should have a configuration surface:

```text
Property Settings
├── General
├── Location
├── Units
├── Staff
├── Guest Access
├── Services
├── Preferred Merchants
├── Notifications
├── Billing
└── Integrations
```

---

# 18.49 Host Integrations

Professional hosts may already use external systems.

NEXG should eventually integrate with:

```text
Property Management Systems
Booking Platforms
Calendar Systems
Guest Management Systems
Accounting Systems
Smart Property Systems
```

The exact integrations should be added based on validated demand.

---

# 18.50 Property Management System Integration

The external PMS can provide:

```text
Reservation
Guest
Property
Unit
Availability
Check-in
Check-out
```

NEXG then uses that context to power the guest service layer.

---

# 18.51 Integration Architecture

```text
External PMS
     │
     ▼
NEXG Integration Layer
     │
     ├── Guest
     ├── Reservation
     ├── Property
     └── Stay
              │
              ▼
        NEXG Guest Experience
              │
              ▼
           Merchants
```

This connects Phase 18 directly to Phases 11–13.

---

# 18.52 Host API

Eventually NEXG can expose host-facing APIs for:

```text
Properties
Units
Guests
Reservations
Stays
Service Requests
Orders
Bookings
```

The same API principles defined in Phase 11 apply.

---

# 18.53 Host Webhooks

Hosts may need events such as:

```text
reservation.created
reservation.updated
guest.checked_in
guest.checked_out
service.requested
service.completed
```

These become part of the NEXG event model.

---

# 18.54 Host Security Boundary

The fundamental security relationship is:

```text
Organization
   ↓
Property Access
   ↓
Guest Access
   ↓
Operational Data
```

A user must only access the properties and guests permitted by their authorization.

---

# 18.55 Multi-Tenant Host Isolation

A management company should not accidentally access another management company's data.

The architecture therefore maintains:

```text
Organization A
 ├── Property A1
 └── Property A2

Organization B
 ├── Property B1
 └── Property B2
```

with strict tenant isolation.

---

# 18.56 Property-Level Isolation

Within one organization:

```text
Manager A
 → Property 1 ✓
 → Property 2 ✓
 → Property 3 ✗
```

if their role does not grant Property 3 access.

---

# 18.57 Guest Privacy

Host staff should not automatically have unrestricted access to all guest information.

Access should be based on:

```text
Role
Property
Operational necessity
Data sensitivity
```

This connects directly to Phase 15.

---

# 18.58 Audit Trail

Important host actions must be auditable.

```text
User
 ↓
Action
 ↓
Entity
 ↓
Timestamp
 ↓
Result
```

A property manager changing a property configuration, cancelling a service, or accessing sensitive guest information should generate an appropriate audit record.

---

# 18.59 Host Onboarding

The onboarding journey becomes:

```text
Create Account
      ↓
Create Host Organization
      ↓
Verify Organization
      ↓
Add Property
      ↓
Configure Property
      ↓
Add Units
      ↓
Invite Staff
      ↓
Connect Reservation System
      ↓
Configure Services
      ↓
Activate
```

---

# 18.60 Property Onboarding

Property configuration should collect only what NEXG needs.

```text
Property Identity
 ↓
Location
 ↓
Property Type
 ↓
Units
 ↓
Operating Information
 ↓
Services
 ↓
Staff
```

---

# 18.61 Host Activation

A host should become active only after required information is complete.

```text
ONBOARDING
      ↓
READY
      ↓
ACTIVE
```

Incomplete properties remain configurable without appearing operationally active.

---

# 18.62 Host Service Eligibility

NEXG should calculate what services can actually operate at a property.

Inputs include:

```text
Property location
Merchant service area
Merchant availability
Service type
Operating hours
Host configuration
```

Output:

```text
Available
Unavailable
Restricted
Scheduled
```

---

# 18.63 Concrete NEXG Result

A guest staying at a property in Kilimani might see:

```text
AVAILABLE SERVICES

Restaurants & Food
✓ 18 merchants

Laundry & Cleaning
✓ 5 merchants

Airport Transfers
✓ 4 providers

Wellness
✓ 7 providers

Experiences
✓ 12 providers
```

The available merchants are determined by NEXG's merchant network, merchant categories/subcategories, service area and operational rules.

---

# 18.64 Host-to-Merchant Relationship

The host does not become the merchant.

Instead:

```text
Host
   │
   │ requests service for guest
   ▼
NEXG
   │
   │ routes transaction
   ▼
Merchant
   │
   ▼
Fulfillment
```

This distinction preserves the integrity of the merchant model established in Phases 1–17.

---

# 18.65 Host Context in an Order

An order originating from a property should be capable of carrying:

```text
orderId
customerId
guestId
hostId
organizationId
propertyId
unitId
merchantId
```

This provides complete operational context.

---

# 18.66 Host Context in a Booking

Likewise:

```text
bookingId
guestId
hostId
propertyId
unitId
merchantId
service
scheduledAt
```

This allows NEXG to understand **who requested what, for whom, at which property, and which provider is responsible for fulfillment.**

---

# 18.67 The NEXG Hospitality Graph

The host model creates a major NEXG relationship graph:

```text
                 ORGANIZATION
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
        USERS                   OWNERS
                                  │
                                  ▼
                              PROPERTY
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                       UNIT              STAFF
                         │
                         ▼
                       GUEST
                         │
                         ▼
                    SERVICE REQUEST
                         │
                         ▼
                       NEXG
                         │
                         ▼
                      MERCHANT
                         │
                         ▼
                  ORDER / BOOKING
                         │
                         ▼
                    FULFILLMENT
```

This is the core relationship architecture of NEXG's hospitality side.

---

# 18.68 Host + Merchant Are Complementary Models

The two models now become:

```text
                  NEXG
                   │
        ┌──────────┴──────────┐
        │                     │
      HOST                 MERCHANT
        │                     │
    Property              Service
        │                     │
      Guest                  Catalog
        │                     │
        └──────────┬──────────┘
                   │
             Transaction
                   │
             Fulfillment
```

The host provides **context and demand**.

The merchant provides **products and services**.

NEXG provides the **network, orchestration and transaction layer**.

---

# 18.69 Phase 18 Deliverables

At the completion of Phase 18, NEXG will have formally defined:

### Host

- Host identity
- Host types
- Host organization
- Host lifecycle
- Host users
- Host roles
- Host permissions

### Property

- Property
- Property types
- Property hierarchy
- Units
- Ownership
- Management
- Staff
- Property configuration

### Hospitality

- Guests
- Reservations
- Stays
- Guest context
- Guest requests
- Concierge workflows
- Property services

### Merchant connection

- Merchant discovery
- Service eligibility
- Preferred merchants
- Host-created orders
- Host-created bookings
- Guest-to-merchant transactions
- Property-level transaction context

### Financial

- Guest-paid services
- Host-paid services
- Owner-paid services
- Service charges
- Management fees
- Merchant charges
- Reconciliation context

### Technology

- PMS integrations
- Host API
- Host webhooks
- Event integration
- Property synchronization
- Developer documentation

### Security

- Organization isolation
- Property-level permissions
- Guest privacy
- Role-based access
- Auditability

### Operations

- Host onboarding
- Property onboarding
- Property activation
- Host notifications
- Property operations
- Guest communication
- Property timelines

---

# 18.70 Final NEXG Model After Phase 18

We now have the two major sides of the ecosystem:

```text
                         NEXG
                          │
          ┌───────────────┴────────────────┐
          │                                │
        HOST                            MERCHANT
          │                                │
    Organization                      Business
          │                                │
      Properties                       Catalog
          │                                │
        Units                          Products
          │                              Services
        Guests                              │
          │                                 │
    Reservations                            │
          │                                 │
    Service Requests                         │
          │                                 │
          └───────────────┬─────────────────┘
                          │
                    NEXG TRANSACTION
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
              ORDER             BOOKING
                 │                 │
                 └────────┬────────┘
                          ▼
                     FULFILLMENT
                          │
                          ▼
                      CUSTOMER
                          │
                          ▼
                       PAYMENT
                          │
                          ▼
                       EVENTS
                          │
                          ▼
                    NOTIFICATIONS
                          │
                          ▼
                    OBSERVABILITY
```

**Phase 18 completes the second major business domain of NEXG.**

The important result is that we now have a coherent model where **merchant taxonomy, merchant operations, host/property operations, guests, transactions, fulfillment, payments, integrations, security and observability all connect to the same underlying NEXG architecture.**

## Prompt:
8/7/2026, 11:36:50 AM

Generate an image of 18.70

## Response:
8/7/2026, 11:36:51 AM

![Image](https://chatgpt.com/backend-api/estuary/content?id=file_00000000c9ec82119e905ca53a9a6d79&fn=image-gen-1%281%29.png&cd=attachment&ts=496960&p=fs&cid=1&sig=625475d26350220a5404a1b8e4f5c0abc11b2b79ad4864f400ba3d335c6a4c58&v=0)



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)