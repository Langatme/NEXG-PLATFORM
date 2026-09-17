# POS Problems Analysis

**User:** Anonymous  
**Created:** 9/1/2026 13:52:15  
**Updated:** 9/1/2026 14:03:50  
**Exported:** 9/10/2026 18:08:20  
**Link:** [https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a96ae38-49b4-83e9-9f22-a2fa13bd7ed2](https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a96ae38-49b4-83e9-9f22-a2fa13bd7ed2)  

## Prompt:
9/1/2026, 1:52:12 PM

Current problems POS owners face, both here in Nairobi and internationally and give me percentage level and to a small degree of error

## Response:
9/1/2026, 1:52:14 PM

> **Searching the web**
>
>
> **Searching 17 websites**
>
> 
>
> Worked for 12s

Yes. If by **POS owners** you mean merchants/business owners who operate a POS system-not POS hardware agents specifically-there is a very clear pain map.

One important caveat: **there is no credible dataset that gives a single exact percentage for “Nairobi POS owners.”** So I would not pretend that, say, 73.4% of Nairobi merchants have a particular problem. What we can do is triangulate Kenyan/Nairobi evidence with international merchant/POS surveys and give you **estimated prevalence ranges**, with confidence/error bands.

### POS-owner pain map

| Problem | Nairobi / Kenya estimated prevalence | International prevalence | Confidence |
|---|---:|---:|---|
| **Inventory/stock data is inaccurate or manually maintained** | **55-70%** | **35-50%** | High |
| **POS doesn't properly integrate with other systems** | **40-55%** | **40%** | High |
| **Payment failures / delayed confirmations / reconciliation problems** | **35-50%** | **40-75%** | High |
| **Internet/network dependency** | **45-60%** | **25-40%** | High |
| **No genuinely reliable offline mode** | **40-55%** | **25-40%** | Medium-high |
| **M-Pesa/card/cash reconciliation is painful** | **45-60%** | **25-40%** | Medium-high |
| **POS is too complicated for staff** | **30-45%** | **25-35%** | Medium-high |
| **Staff training/time is a problem** | **30-45%** | **30-40%** | High |
| **Hardware/printer/scanner/device problems** | **25-40%** | **30-45%** | High |
| **POS downtime / slow performance** | **30-45%** | **34-45%** | High |
| **Security/fraud/unauthorized access concerns** | **25-40%** | **30-40%** | High |
| **Customer/merchant data is trapped in the POS** | **25-40%** | **25-40%** | Medium |
| **Reporting gives data but not useful business insight** | **45-60%** | **35-50%** | High |
| **Poor customer support** | **30-45%** | **30-45%** | Medium-high |
| **POS + e-commerce/social selling aren't unified** | **35-50%** | **30-45%** | Medium-high |
| **POS costs too much relative to value** | **35-50%** | **30-45%** | High |
| **Compliance/tax integration creates friction** | **35-50%** | **15-30%** | Medium-high |
| **Multiple branches require separate/fragmented management** | **20-35% overall** | **20-35%** | High |
| **Owner cannot see/control the business remotely in real time** | **40-55%** | **30-45%** | Medium-high |

### The Nairobi-specific part is particularly interesting

Kenya is **not** simply a market where merchants haven't digitized.

Mastercard reported in 2025 that **91% of Kenyan SMEs had adopted digital payments**, while Visa research found **84% of surveyed SMEs believed investment in payment technology was important for growth**. ([Mastercard](https://www.mastercard.com/news/eemea/en/newsroom/press-releases/en/2025-1/february/mastercard-sme-confidence-index-kenyan-smes-embrace-digital-payments-and-innovation-to-drive-business-growth/?utm_source=chatgpt.com))

The bigger problem is that the digital tools are **fragmented**.

A Nairobi-focused 2026 study by the International Growth Centre found that **nearly 40% of SMEs in sub-Saharan Africa record information infrequently or not at all**. More importantly, its randomized Nairobi experiment found that a smartphone POS with automated analytics increased daily record-keeping by **7-9 percentage points**, while also improving inventory management and sales. ([International Growth Centre](https://www.theigc.org/publications/data-without-insight-why-small-businesses-under-invest-record-keeping-evidence-kenya?utm_source=chatgpt.com))

And local reporting still describes SMEs using:

> handwritten receipts + manual inventory logs + disconnected payment systems

which causes errors and makes it harder to obtain financing. ([The Star](https://www.the-star.co.ke/counties/nairobi/2025-06-12-small-businesses-urged-to-leverage-technology-for-growth?utm_source=chatgpt.com))

So I would estimate the **real Nairobi problem isn't “I need a POS.”**

It's:

> **“I have five different pieces of business information and none of them tells me the truth about my business in one place.”**

---

# The biggest problems, ranked

If you're thinking about this from a **NEXG / product opportunity** perspective, I'd rank them differently.

### 1. Stock truth - ~60%

The owner doesn't actually know:

**What came in → what sold → what remains → what was lost → what should be reordered.**

This is particularly important in Kenyan retail.

A Nairobi study of supermarkets found EPOS was the most popular inventory-control technique, but **cost of installation and maintenance was a major challenge**. ([University of Nairobi eRepository](https://erepository.uonbi.ac.ke/items/3560d849-5f31-44fa-8803-fd971918ae8a?utm_source=chatgpt.com))

More recent Kenyan POS providers continue to identify stock variance, inaccurate counts and shrinkage as major problems, although those vendor estimates shouldn't be treated as population-level statistics. ([parcytech.com](https://parcytech.com/retail/?utm_source=chatgpt.com))

**Estimated prevalence: 55-70%.**

---

### 2. Fragmentation - ~50%

This is probably the **biggest structural problem**.

Merchant has:

```text
POS
   +
M-Pesa
   +
Bank
   +
WhatsApp
   +
Instagram
   +
Website
   +
Delivery
   +
Accounting
   +
eTIMS
```

And they're not one system.

International retail research puts **integration with other systems at 40%** as the most frequently selected POS challenge, ahead of speed/downtime and security. ([nation.bluestarinc.com](https://nation.bluestarinc.com/articles/125-retail-executives-discuss-point-of-sale-buying-preferences?utm_source=chatgpt.com))

For restaurants, **67%** of operators reported that most of their software was available through their POS provider rather than third-party integrations-strong evidence that merchants actively value consolidation. ([Scribd](https://www.scribd.com/document/828132705/TouchBistro-2025-State-of-Restaurants-Report?utm_source=chatgpt.com))

**Estimated Nairobi prevalence: ~45-55%.**

---

### 3. Payment reconciliation - ~45%

Kenya has a unique version of this.

A merchant might receive:

```text
Cash
M-Pesa Till
M-Pesa Paybill
Card
Bank
Online payment
```

But the POS may only know about some of them.

Then the owner has to reconcile:

```text
POS sales
vs
M-Pesa
vs
bank
vs
cash
```

Digital payments are already extremely widespread in Kenya, so this problem becomes **more important as digitization increases**, not less. ([Mastercard](https://www.mastercard.com/news/eemea/en/newsroom/press-releases/en/2025-1/february/mastercard-sme-confidence-index-kenyan-smes-embrace-digital-payments-and-innovation-to-drive-business-growth/?utm_source=chatgpt.com))

**Estimated prevalence: 45-60%.**

---

### 4. Connectivity + reliability - ~50%

This is much more severe in Kenya than in many developed POS markets.

A Kenyan POS provider's 2026 analysis specifically identifies unreliable internet and lack of M-Pesa support as reasons conventional POS systems don't fit local shops. ([WIK Technologies](https://wiktechnologies.com/blog/building-wik-pos-point-of-sale.html?utm_source=chatgpt.com))

Internationally, the problem is also significant: **68% of Australian retailers in one survey experienced at least one payment outage in the preceding year**, with nearly a quarter experiencing three or more. ([possolutions.com.au](https://www.possolutions.com.au/blog/eftpos-retailer-survey-analysis-report?utm_source=chatgpt.com))

And in a 2025 U.S. restaurant technology survey, **76% of consumers reported encountering payment-technology problems**, including repeated attempts, unresponsive terminals and slow processing. ([gocanopy.com](https://www.gocanopy.com/report/2025-restaurant-tech?utm_source=chatgpt.com))

**Estimated Nairobi prevalence: 45-60%.**

---

### 5. Data without intelligence - ~50%

This one is underrated.

Most POS systems answer:

> **“What happened?”**

They don't answer:

> **“What should I do?”**

For example:

```text
Sales today: KSh 83,400
```

is data.

But:

```text
Your chicken wings are selling 2.4× faster
than last week.

At current velocity you'll run out
tomorrow afternoon.

Reorder 18 units.
```

is intelligence.

The Nairobi experiment is particularly interesting because automated analytics didn't merely improve record keeping-it improved **inventory decisions and sales**. ([International Growth Centre](https://www.theigc.org/publications/data-without-insight-why-small-businesses-under-invest-record-keeping-evidence-kenya?utm_source=chatgpt.com))

**Estimated prevalence: 45-60%.**

---

# Internationally, the pattern is remarkably consistent

A 2024/25 retail survey found:

| International POS problem | % |
|---|---:|
| Integration | **40%** |
| Speed/downtime | **34%** |
| Security | **31%** |
| Hardware compatibility | **31%** |

([nation.bluestarinc.com](https://nation.bluestarinc.com/articles/125-retail-executives-discuss-point-of-sale-buying-preferences?utm_source=chatgpt.com))

Another retailer survey found **44% experience monthly technical difficulties with payment processing**. ([nation.bluestarinc.com](https://nation.bluestarinc.com/articles/retailers-seek-integration-security-better-support-in-pos?utm_source=chatgpt.com))

And among international merchants dealing with payment infrastructure, **92% reported experiencing payment outages/disruptions during the previous two years** in one 2025 survey. ([BR-DGE](https://br-dge.to/guides-and-resources/enterprise-payments-resilience-key-findings-from-br-dge-2025-merchant-survey/?utm_source=chatgpt.com))

So the global problem isn't fundamentally different from Nairobi.

The **local implementation is different**.

---

# Where Kenya is different

This is where I think the opportunity gets much more interesting for NEXG.

### Global POS

The stack looks like:

```text
POS
│
├── Card
├── Inventory
├── Employees
├── Accounting
└── E-commerce
```

### Kenyan merchant

More like:

```text
                 MERCHANT
                    │
        ┌───────────┼────────────┐
        ↓           ↓            ↓
      POS         M-Pesa       Cash
        │           │            │
        ↓           ↓            ↓
    Inventory     Phone        Till
        │
        ↓
     WhatsApp
        │
        ↓
   Instagram/TikTok
        │
        ↓
    Deliveries
        │
        ↓
     eTIMS
        │
        ↓
     Accountant
```

The problem is **not lack of digital tools**.

It's **lack of orchestration between them**.

---

# The real POS opportunity for NEXG

I wouldn't build:

> **“Another POS.”**

I'd build:

> **The merchant operating layer that sits above the POS.**

Meaning the existing POS can remain the transaction engine.

NEXG becomes the **intelligence + relationship + orchestration layer**:

```text
                 NEXG MERCHANT OS
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
     SALES           STOCK          CUSTOMERS
       ↓               ↓                ↓
    PAYMENTS        SUPPLIERS        CRM
       ↓               ↓                ↓
   M-PESA/CARD     ORDERS          LOYALTY
       └───────────────┼────────────────┘
                       ↓
                   INTELLIGENCE
                       ↓
                "WHAT SHOULD I DO?"
```

And **that** fits extremely well with the NEXG principle in your design document:

> complexity that cannot be removed should be handled by the system rather than pushed onto the user. `Branch · UX Design Laws.txt`

The merchant shouldn't have to understand ten systems.

They should see:

**“Here are the 3 things that need your attention today.”**

---

### One important correction to the percentages

I would **not use these estimates as investor-deck statistics yet**. The international numbers are survey-backed, but the Nairobi percentages are **triangulated estimates**, not a representative Nairobi POS-owner survey. The reasonable error is roughly **±5-10 percentage points** for the strongest estimates and potentially **±10-15 points** for the weaker Nairobi-specific ones.

If we're going to use this to decide **what NEXG should actually build for merchants**, the next step should be much more valuable: **turn these ~20 problems into a quantified “POS Pain Index,” rank them by frequency × financial damage × willingness to pay × NEXG ability to solve them, and identify the 3 problems worth attacking first.**

---

**Sources:**

- [EEMEA | Mastercard Newsroom](https://www.mastercard.com/news/eemea/en/newsroom/press-releases/en/2025-1/february/mastercard-sme-confidence-index-kenyan-smes-embrace-digital-payments-and-innovation-to-drive-business-growth/?utm_source=chatgpt.com)
- [Data without insight: Why small businesses under-invest in record-keeping — evidence from Kenya | International Growth Centre](https://www.theigc.org/publications/data-without-insight-why-small-businesses-under-invest-record-keeping-evidence-kenya?utm_source=chatgpt.com)
- [Small businesses urged to leverage technology for growth](https://www.the-star.co.ke/counties/nairobi/2025-06-12-small-businesses-urged-to-leverage-technology-for-growth?utm_source=chatgpt.com)
- [A survey of the inventory control techniques adopted by supermarkets in Nairobi](https://erepository.uonbi.ac.ke/items/3560d849-5f31-44fa-8803-fd971918ae8a?utm_source=chatgpt.com)
- [RFID Retail Inventory & ETIMS POS Kenya | Parcy Tech](https://parcytech.com/retail/?utm_source=chatgpt.com)
- [125 Retail Leaders Reveal Their Point of Sale Priorities](https://nation.bluestarinc.com/articles/125-retail-executives-discuss-point-of-sale-buying-preferences?utm_source=chatgpt.com)
- [2025 State of Restaurants Insights | PDF | Menu | Restaurants](https://www.scribd.com/document/828132705/TouchBistro-2025-State-of-Restaurants-Report?utm_source=chatgpt.com)
- [Building WIK POS: An Offline-First Point of Sale for Kenyan Retail](https://wiktechnologies.com/blog/building-wik-pos-point-of-sale.html?utm_source=chatgpt.com)
- [EFTPOS Retailer Survey Analysis Report](https://www.possolutions.com.au/blog/eftpos-retailer-survey-analysis-report?utm_source=chatgpt.com)
- [Restaurant Tech Survey 2025: McDonald's, Chick-fil-A Lead in Customer Technology Experience | Canopy Remote Device Management Software](https://www.gocanopy.com/report/2025-restaurant-tech?utm_source=chatgpt.com)
- [Enterprise Payments Resilience: Key Findings from BR-DGE’s 2025 Merchant Survey - BR-DGE](https://br-dge.to/guides-and-resources/enterprise-payments-resilience-key-findings-from-br-dge-2025-merchant-survey/?utm_source=chatgpt.com)

## Prompt:
9/1/2026, 2:01:25 PM

Wdym customers >crm > loyalty

## Response:
9/1/2026, 2:01:26 PM

I meant it as a **layered merchant data flow**, but I worded it badly.

```text
CUSTOMERS
   ↓
CRM
   ↓
LOYALTY
```

does **not** mean customers automatically become CRM and then loyalty.

It means:

- **Customers** = the people buying from the merchant.
- **CRM** = the system that stores and helps the merchant act on the customer relationship: purchase history, contact details, preferences, interactions, etc.
- **Loyalty** = one capability built on top of that customer relationship: points, rewards, repeat-purchase incentives, VIP status, offers, etc.

So for NEXG:

```text
CUSTOMER
   │
   ├── Purchases
   ├── Orders
   ├── Preferences
   ├── Visits
   └── Interactions
          ↓
       CUSTOMER
        PROFILE
          ↓
         CRM
          ↓
   ┌──────┼───────┐
   ↓      ↓       ↓
 Loyalty Offers  Retention
```

And importantly, **loyalty isn't necessarily something every POS merchant needs**. I was listing it as a potential capability, not saying it should be part of the fundamental POS architecture.

For NEXG, I'd actually separate the concepts as:

**Transactions → Customers → Relationship → Intelligence → Actions**

rather than forcing everything into the traditional "POS + CRM + loyalty" model.

## Prompt:
9/1/2026, 2:03:28 PM

With all our merchant categories how does a merchant record dyncsmically and 
1. Which companies sell customer
Profiles does uber Glovo wilt and bolt use them

## Response:
9/1/2026, 2:03:29 PM

> **Searching the web**
>
> [Global Privacy Notice for Bolt Business | Bolt for Business](https://bolt.eu/en/privacy/bolt-business/global-privacy-notice-for-bolt-business/)
> [Bolt | Merchant Analytics](https://www.bolt.com/merchant-analytics)
> [Uber Direct API Terms and Conditions](https://www.uber.com/ke/en/legal/uber-direct-api-terms-and-conditions/)
> [Glovo's Legal Terms and Conditions](https://glovoapp.com/docs/en/legal/privacy/)
> [Restify | Best Restaurant POS & Management System in Kenya](https://www.restify.co.ke/page/privacy-policy)
> [Complete your business verification on Wolt | Merchant support - Wolt (Romania)](https://merchant.wolt.com/en/rou/business-verification)
> [Customer Management Software for Restaurants in Kenya | Veira](https://www.veirahq.com/solutions/customer-management-for-restaurants/)
> [Manage your Store - Kenya](https://sell.glovoapp.com/ke/en/services/manage-your-store/)
>
> **Searched 8 websites**
>
> 
>
> Worked for 7s

Yes - and this is where I think we need to make a **very important architectural distinction for NEXG**.

## 1. A NEXG merchant should not “create a CRM record”

They should simply **record an interaction**, and NEXG should dynamically build the customer profile from it.

That is much more powerful.

For example, take your merchant categories:

| Merchant | What happens | What NEXG records |
|---|---|---|
| Restaurant | Customer orders nyama choma | Order + items + spend + visit |
| Hotel | Guest stays 3 nights | Stay + room + dates + spend + preferences |
| Car rental | Customer rents Toyota | Vehicle + rental period + spend + driver |
| Beauty | Customer gets haircut | Service + stylist + frequency |
| Fashion | Customer buys shoes | Product + size + brand + spend |
| Flower shop | Sends flowers | Recipient + occasion + buyer + frequency |
| Airport transfer | Books airport pickup | Airport + route + date + vehicle |
| Experience | Books safari | Experience + participants + date |
| Alcohol merchant | Buys whisky | Product/category + spend + frequency |
| Electronics | Buys phone | Product + warranty + serial/IMEI where appropriate |
| Financial service | Uses service | Service + transaction + relationship |
| Vehicle dealer | Inquires about car | Vehicle interest + lead stage |
| Event merchant | Books event | Event + date + attendees + spend |

The merchant doesn't need to think:

> "I need to update Emma's CRM."

They just perform the transaction/workflow.

NEXG does:

```text
INTERACTION
     ↓
IDENTIFY PERSON
     ↓
MATCH EXISTING PROFILE
     ↓
CREATE / UPDATE PROFILE
     ↓
ATTACH EVENT
     ↓
UPDATE RELATIONSHIP
     ↓
GENERATE INSIGHT
```

That's the architecture I'd want.

---

# 2. The profile should be dynamic, not a giant fixed form

This is especially important because NEXG has radically different categories.

Don't create:

```text
Customer:
Name
Phone
Email
Birthday
Address
Loyalty points
...
```

and force every merchant to use that.

Instead:

### Core identity

```text
Person
├── ID
├── Name
├── Phone
├── Email
└── Identity confidence
```

Then dynamically attach **domain attributes**.

For example:

### Restaurant

```text
Person
 └── Restaurant relationship
      ├── Orders
      ├── Favourite dishes
      ├── Visits
      ├── Average spend
      └── Preferences
```

### Car rental

```text
Person
 └── Vehicle-rental relationship
      ├── Rentals
      ├── Preferred vehicle
      ├── Rental duration
      ├── Driver information
      └── History
```

### Hotel

```text
Person
 └── Hotel relationship
      ├── Stays
      ├── Rooms
      ├── Preferences
      ├── Spend
      └── Visits
```

Same **Person**.

Different **relationships and events**.

That's how you support all NEXG categories without creating 50 different CRM systems.

---

# 3. And here's the really interesting part

You asked:

> Which companies sell customer profiles?

There are actually **two completely different markets**.

### A. Companies selling the *software to create/manage customer profiles*

These absolutely exist.

**Square** has Customer Directory built into its POS. Every sale can generate a customer profile, and subsequent transactions enrich it with purchase history, preferences, loyalty status, etc. ([Square](https://squareup.com/us/en/point-of-sale/features/customer-directory?utm_source=chatgpt.com))

**Shopify** has customer profiles inside POS containing contact information, purchase history, preferences, addresses, marketing preferences and custom fields. ([Shopify Help Center](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/customer-management/create-customer-profile?utm_source=chatgpt.com))

**Toast** has Guest CRM, where POS, online orders, reservations and other interactions are consolidated into a guest profile. ([pos.toasttab.com](https://pos.toasttab.com/products/guest-crm?utm_source=chatgpt.com))

**Lightspeed** similarly lets merchants maintain customer profiles, link sales to them, track customer history and create customer groups. ([x-series-support.lightspeedhq.com](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534236708635-Setting-up-a-customer-database?utm_source=chatgpt.com))

And in Kenya, **Veira** is explicitly positioning customer management around customer history, preferences, contact details and loyalty. ([Veira](https://www.veirahq.com/solutions/customer-management-for-restaurants/?utm_source=chatgpt.com))

So:

> **Yes, customer-profile infrastructure is already a product category.**

---

# 4. But that's NOT the same as Uber selling customer profiles

This distinction is crucial.

I found evidence that **Uber, Glovo, Wolt and Bolt build and use customer/user profiles and customer data**, but that is very different from saying they sell those profiles to merchants.

### Uber

Uber's systems can process merchant/customer information including:

- name
- delivery address
- phone
- email
- order details
- merchant-generated customer ID

But in Uber Direct's Kenya terms, merchant/customer data is restricted to purposes connected with the delivery service, product improvement, analytics, fraud/safety, etc. ([Uber](https://www.uber.com/ke/en/legal/uber-direct-api-terms-and-conditions/?utm_source=chatgpt.com))

So I would **not characterize Uber as selling merchant customer profiles** based on the evidence I found.

---

### Glovo

Glovo explicitly says it profiles/segments users based on first-party information such as historical orders and usage, partly to personalize stores, offers and recommendations. ([Glovoapp](https://glovoapp.com/docs/en/legal/privacy/?utm_source=chatgpt.com))

Glovo also maintains merchant/order information including order history and related data. ([Glovoapp](https://glovoapp.com/docs/en/legal/privacy-partners/?utm_source=chatgpt.com))

Again:

**They have the profiles.**

That doesn't mean:

**they sell the profiles.**

---

### Wolt

Wolt also processes user and merchant data and has contractual arrangements governing the processing of customer personal data by partners. ([merchant.wolt.com](https://merchant.wolt.com/en/mkd/merchant-app-terms?utm_source=chatgpt.com))

Again, that's a **platform data relationship**, not evidence that Wolt sells a merchant a downloadable database of customer profiles.

---

### Bolt

Bolt is particularly interesting.

Bolt Food gives merchants a Merchant Portal with sales/performance analytics and even **customer conversion and promotion targeting** capabilities. ([bolt.eu](https://bolt.eu/en-ke/food/merchant/?utm_source=chatgpt.com))

Bolt also explicitly markets Merchant Analytics as providing a holistic view of shoppers' purchases and buying behavior. ([Bolt | Perfecting Checkout](https://www.bolt.com/merchant-analytics?utm_source=chatgpt.com))

But Bolt's terms are actually a warning for NEXG: for users interacting with or creating accounts through Bolt's own systems, Bolt retains ownership of certain end-user account/relationship information. ([Bolt | Perfecting Checkout](https://www.bolt.com/terms-of-use?hsLang=en&utm_source=chatgpt.com))

---

# 5. And this exposes a massive NEXG opportunity

Look at the difference:

### Glovo customer

```text
Customer
   ↓
Glovo
   ↓
Orders from Merchant A
Orders from Merchant B
Orders from Merchant C
```

Glovo knows the customer across its ecosystem.

But the **merchant doesn't necessarily own the complete relationship**.

Same general strategic issue exists with marketplaces.

---

### NEXG customer

What I think we should build is:

```text
                 PERSON
                   │
          NEXG CUSTOMER ID
                   │
       ┌───────────┼───────────┐
       ↓           ↓           ↓
 Restaurant      Hotel       Car Rental
       ↓           ↓           ↓
 Orders          Stays       Rentals
       │           │           │
       └───────────┼───────────┘
                   ↓
            RELATIONSHIP
                   ↓
              INTELLIGENCE
```

The merchant gets **their relationship with that customer**.

NEXG, as the platform, can understand the **cross-merchant relationship where legally permitted and appropriately consented**.

That's a fundamentally different architecture from simply building another POS.

---

# 6. So how does a merchant "record" dynamically?

I'd make the primitive:

## **Interaction**

Everything a merchant does with a customer becomes an interaction.

```text
Interaction
├── type
├── customer
├── merchant
├── category
├── timestamp
├── location
├── value
├── entity
├── attributes
└── outcome
```

Examples:

```text
PURCHASE
BOOKING
ORDER
VISIT
STAY
RENTAL
INQUIRY
QUOTE
APPOINTMENT
SERVICE
REFUND
CANCELLATION
REVIEW
SUPPORT
MESSAGE
REWARD
```

Then each category adds its own attributes.

That means **you don't need to redesign the customer system every time NEXG adds a new merchant category.**

This is very consistent with the NEXG architecture you've been developing: **entities + capabilities + dynamic experiences**, rather than hardcoding every vertical into separate applications. `Branch · UX Design Laws.txt`

### The core model becomes:

**Person → Relationship → Interaction → Entity → Outcome**

And *then* CRM, loyalty, marketing, analytics, recommendations, etc. become capabilities operating on that underlying data.

That is much stronger than:

**POS → CRM → Loyalty.**

---

**Sources:**

- [Customer Directory | Square’s free CRM](https://squareup.com/us/en/point-of-sale/features/customer-directory?utm_source=chatgpt.com)
- [Shopify Help Center | Creating a customer profile in the Shopify POS app](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/customer-management/create-customer-profile?utm_source=chatgpt.com)
- [Guest CRM | Restaurant & Retail CRM | Toast POS](https://pos.toasttab.com/products/guest-crm?utm_source=chatgpt.com)
- [Setting up a customer database – Lightspeed Retail (X-Series)](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534236708635-Setting-up-a-customer-database?utm_source=chatgpt.com)
- [Customer Management Software for Restaurants in Kenya | Veira](https://www.veirahq.com/solutions/customer-management-for-restaurants/?utm_source=chatgpt.com)
- [Uber Direct API Terms and Conditions](https://www.uber.com/ke/en/legal/uber-direct-api-terms-and-conditions/?utm_source=chatgpt.com)
- [Glovo's Legal Terms and Conditions](https://glovoapp.com/docs/en/legal/privacy/?utm_source=chatgpt.com)
- [Wolt Merchant App | Terms of Use & Privacy Policy - Wolt (North Macedonia)](https://merchant.wolt.com/en/mkd/merchant-app-terms?utm_source=chatgpt.com)
- [Become a Bolt Food Merchant | Grow Your Business Online](https://bolt.eu/en-ke/food/merchant/?utm_source=chatgpt.com)
- [Bolt | Merchant Analytics](https://www.bolt.com/merchant-analytics?utm_source=chatgpt.com)



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)