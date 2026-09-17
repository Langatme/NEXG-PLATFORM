# NexG Ledger Architecture

**User:** Anonymous  
**Created:** 9/4/2026 3:32:06  
**Updated:** 9/4/2026 3:32:37  
**Exported:** 9/10/2026 18:04:33  
**Link:** [https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a9a1161-9618-83ea-a3ba-6a50b1cf9406](https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a9a1161-9618-83ea-a3ba-6a50b1cf9406)  

## Prompt:
9/4/2026, 3:32:03 AM

Thinking very hard with all the context you have about NexG 
I need all the ledgers NexG needs and its main source of truth ledger

## Response:
9/4/2026, 3:32:05 AM

> **Searching the web**
>
>
> **Searching 8 websites**
>
> 
>
> Worked for a few seconds

Yes. Thinking about NEXG as the system we've been building-not just a marketplace, but a **context-aware operating system coordinating consumers, merchants, hosts, riders, properties, orders, bookings, payments, promotions and eventually many verticals**-I would **not** make one giant “ledger” responsible for everything.

I would build a **Ledger Architecture**.

The key distinction is:

> **NEXG needs one canonical event/transaction history, with specialized ledgers underneath it.**

And there is one extremely important rule:

> **No balance, status, entitlement, commission, payout, loyalty point or financial position should become authoritative merely because it exists in a UI table.**

This aligns with the broader ledger architecture pattern: append-only journals, immutable posted financial history, idempotency, and derived balances/projections are much safer than mutable balance columns. ([GitHub](https://github.com/dcaglar/payment-platform-for-marketplaces/blob/main/docs/architecture/architecture.md?utm_source=chatgpt.com))

---

# NEXG LEDGER ARCHITECTURE

I would structure it like this:

```text
                         NEXG
                          │
                          ▼
              ┌───────────────────────┐
              │  NEXG CANONICAL LEDGER │
              │       NCL              │
              │                       │
              │ "What happened?"      │
              └───────────┬───────────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
     BUSINESS         FINANCIAL         CONTROL
     LEDGERS          LEDGERS           LEDGERS
          │               │                │
          ▼               ▼                ▼
     Orders          Money / GL        Audit
     Bookings        Payments          Permissions
     Fulfilment      Wallets           Compliance
     Inventory       Settlement        Idempotency
     Availability    Commission        Reconciliation
     Loyalty         Tax               Evidence
     Promotions      Refunds
```

But there is an even more important distinction.

---

# 1. THE NEXG CANONICAL LEDGER

## `NEXG_CANONICAL_LEDGER`

This is the **main source of truth for what happened in NEXG**.

Not necessarily the source of truth for every *current value*.

It answers:

> **What happened, to what, by whom, when, in what context, and what did it cause?**

Think of it as NEXG's **memory of reality**.

Example:

```text
Consumer searched for restaurant
        ↓
Viewed merchant
        ↓
Added item
        ↓
Cart locked
        ↓
Order created
        ↓
Payment initiated
        ↓
Payment authorized
        ↓
Merchant accepted
        ↓
Rider assigned
        ↓
Order picked up
        ↓
Order delivered
        ↓
Merchant payable created
        ↓
NEXG commission recognized
        ↓
Merchant settlement initiated
        ↓
Settlement completed
```

Every meaningful transition becomes a canonical event.

### Canonical event

```text
event_id
tenant_id
actor_id
actor_type

event_type

entity_type
entity_id

occurred_at
recorded_at

correlation_id
causation_id
idempotency_key

previous_state
new_state

source
source_reference

metadata
payload

schema_version
```

And ideally:

```text
previous_event_hash
event_hash
```

So the history becomes tamper-evident.

This concept is important because a transaction frequently spans multiple systems. Mature ledger architectures use a canonical cross-system transaction record specifically so the entire lineage can be reconstructed rather than relying on isolated records. ([NexLedger](https://nexledger.ai/platform.php?utm_source=chatgpt.com))

---

# 2. THE NEXG TRANSACTION LEDGER

I would actually make this a major substructure of the canonical ledger.

## `TRANSACTION_LEDGER`

This answers:

> **What business transaction is actually taking place?**

Because NEXG isn't just processing payments.

It processes:

```text
ORDER
BOOKING
RENTAL
RIDE
DELIVERY
EXPERIENCE
SERVICE
PURCHASE
RESERVATION
TRANSFER
REFUND
CANCELLATION
```

The critical idea:

### One transaction can touch many systems.

For example:

```text
TX-92837

Consumer
   │
   ├── Cart
   ├── Order
   ├── Payment
   ├── Merchant
   ├── Inventory
   ├── Rider
   ├── Commission
   ├── Refund
   └── Settlement
```

Instead of losing that relationship between services, NEXG maintains:

```text
Transaction
     │
     ├── Order
     ├── Payment
     ├── Fulfilment
     ├── Commission
     ├── Inventory
     └── Settlement
```

This becomes NEXG's **transaction DNA**.

---

# 3. THE FINANCIAL GENERAL LEDGER

## `NEXG_GENERAL_LEDGER`

This is different.

This is the:

> **Source of truth for NEXG's accounting reality.**

The canonical ledger says:

> Payment of KSh 5,000 happened.

The financial ledger says:

```text
DR Customer/Payment Clearing    5,000
CR Merchant Payable             4,250
CR NEXG Commission                750
```

This must be **double-entry**.

Never:

```text
merchant.balance += 4250
```

as the authoritative financial operation.

Instead:

```text
journal
   ↓
debit
credit
   ↓
derived balance
```

Balances become projections.

That architecture is also used in payment-ledger designs where the append-only journal is authoritative and balances are derived from it. ([ApexSutra](https://www.apexsutra.com/work/payments-ledger?utm_source=chatgpt.com))

---

# 4. PAYMENT LEDGER

## `PAYMENT_LEDGER`

This records the lifecycle of money movement through payment providers.

For NEXG + Paystack this becomes extremely important.

```text
Payment initiated
       ↓
Authorization
       ↓
Successful
       ↓
Captured
       ↓
Failed
       ↓
Refunded
       ↓
Partially refunded
       ↓
Settled
```

It records:

```text
payment_intent
payment_attempt
provider_reference
provider
amount
currency
payment_method
status
fees
authorization
capture
refunds
settlement_reference
```

But:

**Payment Ledger ≠ General Ledger.**

Payment ledger:

> What happened with the payment processor?

GL:

> What does that mean financially?

---

# 5. WALLET / BALANCE LEDGER

NEXG may eventually have:

```text
Consumer wallet
Merchant wallet
Host wallet
Rider wallet
NEXG wallet
```

Don't create mutable balances as the source of truth.

Use:

## `WALLET_LEDGER`

Example:

```text
Merchant wallet

+4,250  Order settlement earned
-500    Refund
-250    Adjustment
+1,000  Bonus
```

Then:

```text
available_balance
pending_balance
held_balance
withdrawable_balance
```

are projections.

This becomes especially important once NEXG handles merchant payouts.

---

# 6. MERCHANT PAYABLE LEDGER

## `MERCHANT_PAYABLE_LEDGER`

This deserves its own subledger because NEXG isn't simply collecting money.

It has an obligation to merchants.

Example:

```text
Customer pays             KSh 5,000

Merchant gross            KSh 5,000
NEXG commission           KSh   750
Payment fee               KSh    80
Refund reserve            KSh   100

Merchant payable          KSh 4,070
```

Then:

```text
earned
        ↓
available
        ↓
held
        ↓
approved
        ↓
payout initiated
        ↓
payout completed
```

This gives Finance a clean reconciliation point.

---

# 7. COMMISSION / REVENUE LEDGER

## `NEXG_REVENUE_LEDGER`

NEXG has multiple revenue models.

For example:

```text
Commission
Subscription
Merchant services
Promotions
Booking fees
Delivery fees
Service fees
Cancellation fees
Advertising
Future financial services
```

Every revenue event should be traceable.

```text
Transaction
     ↓
Revenue rule
     ↓
Revenue event
     ↓
GL entry
```

Do **not** hard-code:

```text
commission = order.total * 0.15
```

throughout the application.

Instead:

```text
COMMISSION_RULE
```

with:

```text
merchant_category
transaction_type
rate
fixed_fee
effective_from
effective_to
currency
```

Then the applied rule becomes part of the transaction evidence.

---

# 8. REFUND / REVERSAL LEDGER

## `REFUND_LEDGER`

Refunds are not simply:

```text
payment.status = refunded
```

They create financial consequences.

Example:

```text
Original payment
      ↓
Partial refund
      ↓
Merchant payable adjustment
      ↓
NEXG revenue reversal
      ↓
Payment-provider refund
      ↓
Settlement reconciliation
```

Every refund should link back to the original transaction.

And financial corrections should generally be reversal/adjustment entries rather than mutating history. Immutable posted entries with linked reversals are a strong established ledger pattern. ([Nexus Ledger](https://nexus-ledger-web.vercel.app/about?utm_source=chatgpt.com))

---

# 9. ORDER LEDGER

## `ORDER_LEDGER`

This is the history of commercial orders.

```text
Cart
 ↓
Order created
 ↓
Payment pending
 ↓
Paid
 ↓
Merchant accepted
 ↓
Preparing
 ↓
Ready
 ↓
Picked up
 ↓
Delivered
```

For different NEXG categories:

```text
Restaurant
Retail
Flowers
Fashion
Alcohol
Vehicle rental
Experience
Airport transfer
Beauty
Financial service
```

the state machine differs.

But the underlying ledger pattern stays the same.

---

# 10. BOOKING LEDGER

## `BOOKING_LEDGER`

For:

```text
Hotels
Experiences
Vehicle rentals
Airport transfers
Appointments
Events
```

you need temporal state.

Example:

```text
requested
held
confirmed
modified
checked-in
completed
cancelled
no-show
```

And critically:

```text
who changed it
when
why
what was the previous state
```

---

# 11. INVENTORY LEDGER

## `INVENTORY_LEDGER`

This is extremely important because NEXG has merchants selling physical things.

Don't treat:

```text
stock_quantity = 17
```

as the ultimate truth.

Record movements:

```text
+50 received
-2 sold
-1 damaged
+5 returned
-3 transferred
```

Then:

```text
available stock
reserved stock
sold stock
damaged stock
```

are derived.

For a restaurant:

```text
Ingredient inventory
```

For a retailer:

```text
SKU inventory
```

For vehicle rental:

```text
fleet availability
```

So inventory becomes polymorphic.

---

# 12. AVAILABILITY LEDGER

## `AVAILABILITY_LEDGER`

This one is slightly different.

NEXG has **time-based inventory**.

For example:

```text
Toyota Prado
10:00-14:00
```

or:

```text
Spa appointment
14:30
```

or:

```text
Hotel room
Sep 10-12
```

or:

```text
Airport transfer
18:00
```

Availability changes because of:

```text
reservation
hold
release
cancellation
maintenance
blackout
capacity change
```

That history should be recorded.

---

# 13. FULFILMENT / DISPATCH LEDGER

## `FULFILMENT_LEDGER`

This is particularly important for your:

**Rider App.**

```text
fulfilment created
 ↓
dispatch requested
 ↓
rider candidate found
 ↓
rider assigned
 ↓
rider accepted
 ↓
arrived merchant
 ↓
picked up
 ↓
en route
 ↓
delivered
```

For airport transfer:

```text
driver assigned
flight monitored
arrival
pickup
trip
completed
```

The same underlying ledger can support radically different workflows.

---

# 14. CUSTOMER RELATIONSHIP LEDGER

## `CUSTOMER_LEDGER`

This is **not merely CRM**.

It records the relationship history between a customer and NEXG.

```text
customer discovered merchant
customer viewed item
customer purchased
customer booked
customer cancelled
customer reviewed
customer returned
customer received promotion
customer earned loyalty
```

This becomes extraordinarily valuable for the NEXG concept of:

> understanding the context around you and coordinating what you need next.

Your customer's relationship history becomes part of the context layer.

---

# 15. LOYALTY LEDGER

## `LOYALTY_LEDGER`

Never:

```text
user.points = 4500
```

as the source of truth.

Instead:

```text
+100 purchase reward
+50 campaign
-500 redeemed
-100 expired
+200 referral
```

Then:

```text
points_balance
```

is derived.

This makes fraud investigation and customer support vastly easier.

---

# 16. PROMOTION / CAMPAIGN LEDGER

## `PROMOTION_LEDGER`

Track:

```text
promotion issued
promotion viewed
promotion applied
promotion reserved
promotion redeemed
promotion expired
promotion reversed
```

This lets NEXG answer:

> Did this promotion actually create incremental business?

rather than simply:

> How many coupons were created?

---

# 17. DISPUTE LEDGER

## `DISPUTE_LEDGER`

For:

```text
customer disputes
merchant disputes
rider disputes
payment disputes
refund disputes
damage claims
cancellation disputes
```

The important thing is that the dispute references the underlying transaction rather than becoming an isolated support ticket.

```text
Dispute
   ↓
Transaction
   ↓
Order
   ↓
Payment
   ↓
Fulfilment
   ↓
Evidence
```

---

# 18. TAX LEDGER

## `TAX_LEDGER`

Don't make tax a report generated at the end.

Tax-relevant events should be recorded as transactions happen.

Potentially:

```text
VAT
withholding
service tax
fees
tax exemptions
tax adjustments
```

And every tax amount should link to:

```text
transaction
tax rule
jurisdiction
tax point
```

NEXG eventually operating across countries makes this architecture important.

---

# 19. SETTLEMENT LEDGER

## `SETTLEMENT_LEDGER`

This is different from payments.

Payment:

> Customer successfully paid.

Settlement:

> Where did the money actually land?

Example:

```text
Customer payment
      ↓
Paystack
      ↓
NEXG settlement
      ↓
Merchant allocation
      ↓
Bank / wallet payout
```

The settlement ledger reconciles:

```text
Expected
vs
Provider reported
vs
Bank received
vs
Merchant paid
```

This will be one of your most important finance-control mechanisms.

---

# 20. RECONCILIATION LEDGER

## `RECONCILIATION_LEDGER`

This doesn't represent money itself.

It represents:

> **NEXG proving that two sources agree.**

Examples:

```text
Paystack ↔ NEXG payments

Paystack settlement ↔ NEXG settlement

Merchant payable ↔ payout

Order totals ↔ payment totals

Inventory ↔ sales

Subledger ↔ GL
```

Every reconciliation should have:

```text
source_a
source_b
expected
actual
difference
status
run_at
resolved_at
resolution
actor
```

This is a **control ledger**.

---

# 21. AUDIT LEDGER

## `AUDIT_LEDGER`

This is the immutable record of administrative/system changes.

```text
Who
What
When
Before
After
Why
Source
IP/device/context
```

For example:

```text
Admin changed commission rule
Merchant changed bank account
Refund approved
Order manually cancelled
Payout held
User role changed
```

Your UX constitution explicitly pushes NEXG toward governance, observability and cross-app consistency, so this shouldn't be bolted on later. `Branch · UX Design Laws.txt`

---

# 22. PERMISSION / AUTHORITY LEDGER

## `AUTHORITY_LEDGER`

This is particularly useful as NEXG gets complicated.

Record:

```text
role granted
role revoked
permission granted
permission revoked
delegation created
delegation revoked
approval granted
approval rejected
```

Then NEXG can answer:

> **Was this person actually authorized to perform this action at that time?**

That is much stronger than simply looking at their current role.

---

# 23. EVIDENCE LEDGER

## `EVIDENCE_LEDGER`

Every important transaction can have evidence:

```text
payment provider response
invoice
receipt
photo
delivery proof
signature
GPS event
merchant confirmation
customer confirmation
identity verification
refund evidence
```

Store the evidence reference and integrity metadata.

Not necessarily huge blobs inside the ledger.

Instead:

```text
evidence_id
object_reference
hash
created_at
source
entity_id
event_id
```

The principle is:

> **The ledger tells you what happened. Evidence proves it.**

---

# 24. NOTIFICATION LEDGER

## `NOTIFICATION_LEDGER`

Since NEXG has:

```text
Consumer
Merchant
Host
Rider
Admin
```

and notifications are part of workflow, record:

```text
notification created
queued
sent
delivered
opened
failed
dismissed
```

This is incredibly useful for:

```text
Why didn't the merchant accept?
Did the rider receive the request?
Did the customer see the cancellation?
```

---

# 25. ANALYTICS / TELEMETRY LEDGER

This one should be separate from business truth.

## `EVENT / TELEMETRY LEDGER`

Your UX architecture already explicitly calls for:

```text
time to first action
search
widget expansion
checkout abandonment
order completion
error rate
```

`Branch · UX Design Laws.txt`

These events should **never be confused with business ledger events**.

For example:

```text
User tapped "Book"
```

is telemetry.

```text
Booking created
```

is business truth.

That's a very important boundary.

---

# THE COMPLETE NEXG LEDGER MAP

I'd therefore define approximately **18 core ledgers**:

| # | Ledger | What it answers |
|---|---|---|
| 1 | **Canonical Ledger** | What happened in NEXG? |
| 2 | **Transaction Ledger** | What business transaction is this? |
| 3 | **General Ledger** | What is the financial/accounting truth? |
| 4 | **Payment Ledger** | What happened to the payment? |
| 5 | **Wallet Ledger** | What value is held/owed in an account? |
| 6 | **Merchant Payable Ledger** | What does NEXG owe merchants? |
| 7 | **Revenue/Commission Ledger** | What did NEXG earn? |
| 8 | **Refund Ledger** | What was reversed/refunded? |
| 9 | **Order Ledger** | What happened to the order? |
| 10 | **Booking Ledger** | What happened to the reservation? |
| 11 | **Inventory Ledger** | What happened to stock/capacity? |
| 12 | **Availability Ledger** | What was available/held/reserved? |
| 13 | **Fulfilment Ledger** | What happened during execution/delivery? |
| 14 | **Customer Relationship Ledger** | What happened in the customer relationship? |
| 15 | **Loyalty Ledger** | What points/value were earned or spent? |
| 16 | **Promotion Ledger** | What happened to offers/campaigns? |
| 17 | **Dispute Ledger** | What happened in a contested transaction? |
| 18 | **Settlement/Reconciliation Ledger** | Did external money and NEXG agree? |

Then the control layer:

```text
19. Tax Ledger
20. Audit Ledger
21. Authority Ledger
22. Evidence Ledger
23. Notification Ledger
24. Telemetry/Event Ledger
```

---

# BUT HERE IS THE MOST IMPORTANT PART

I would **not** make all 24 equal.

I'd create a hierarchy.

```text
                    NEXG
                     │
                     ▼
        ┌────────────────────────┐
        │ NEXG CANONICAL LEDGER  │
        │                        │
        │ "WHAT HAPPENED?"       │
        └────────────┬───────────┘
                     │
             Transaction DNA
                     │
       ┌─────────────┼──────────────┐
       │             │              │
       ▼             ▼              ▼
   BUSINESS       FINANCE        CONTROL
   SUBLEDGERS     SUBLEDGERS     SUBLEDGERS
```

Then:

```text
BUSINESS
├── Orders
├── Bookings
├── Inventory
├── Availability
├── Fulfilment
├── Customer
├── Loyalty
├── Promotions
└── Disputes

FINANCE
├── Payments
├── Wallets
├── Merchant Payables
├── Revenue
├── Refunds
├── Tax
├── Settlement
└── General Ledger

CONTROL
├── Reconciliation
├── Audit
├── Authority
├── Evidence
├── Notifications
└── Telemetry
```

---

# THE SOURCE-OF-TRUTH RULE

This is where I would lock NEXG's architecture.

### Canonical Ledger

**Source of truth for events and transaction lineage.**

### Domain ledger

**Source of truth for its domain history.**

### General Ledger

**Source of truth for accounting.**

### Projection

**Never a source of truth.**

So:

```text
Database table
        ↓
Could be projection
```

Whereas:

```text
Immutable ledger event
        ↓
Authoritative history
```

---

# NEXG SHOULD HAVE ONE "TRUTH SPINE"

This is the architecture I think you actually want:

```text
                    ┌───────────────────┐
                    │      NEXG         │
                    │   EXPERIENCE      │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   NEXG CONTEXT    │
                    │      ENGINE       │
                    └─────────┬─────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │ NEXG CANONICAL LEDGER   │
                 │                         │
                 │ Transaction DNA         │
                 │ Events                  │
                 │ Relationships           │
                 │ State transitions       │
                 │ Lineage                 │
                 │ Idempotency              │
                 └────────────┬────────────┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
       DOMAIN LEDGERS    FINANCE LEDGERS   CONTROL
             │                │                │
             ▼                ▼                ▼
        Order          Payment             Audit
        Booking        Wallet              Authority
        Inventory      Payable             Evidence
        Fulfilment     Revenue             Reconciliation
        Customer       Refund              Tax
        Loyalty        Settlement
        Promotion      GL
```

And then:

```text
                  LEDGERS
                     │
                     ▼
                READ MODELS
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
      Consumer    Merchant    Host
          │          │          │
          ▼          ▼          ▼
        Rider      Admin     Analytics
```

**Never the other way around.**

The UI does not create truth.

The services do not independently create competing truth.

The projections do not become truth.

---

# ONE MORE THING I WOULD ADD TO NEXG

## `NEXG_STATE`

This is **not another ledger**.

It's a derived current-state layer.

For example:

```text
Canonical Ledger
       ↓
Order Projection
       ↓
Current Order State
```

So you can query:

```text
WHERE order_id = X
```

without replaying 500 events.

But if the projection says:

```text
DELIVERED
```

and you ask:

> Why?

NEXG can walk backward:

```text
Current State
      ↓
Projection
      ↓
Ledger Events
      ↓
Transaction
      ↓
Evidence
```

That gives you the **explainability** your platform needs.

---

# THE GOLDEN RULE FOR NEXG

I'd put this directly into the NEXG architecture constitution:

> **NEXG does not trust mutable state as historical truth.**

And:

> **Every economically, operationally, or permission-significant change must produce an immutable, attributable, idempotent event.**

And:

> **All derived balances, statuses, dashboards and analytics must be reproducible from authoritative history.**

And finally:

> **The General Ledger is authoritative for accounting; the NEXG Canonical Ledger is authoritative for the history and lineage of NEXG transactions.**

That last distinction is crucial.

I would **not** call the financial GL the "main NEXG source of truth." It cannot represent the full reality of a rider assignment, booking hold, cart lock, merchant acceptance, customer interaction, inventory reservation, etc.

Instead, **NEXG Canonical Ledger + Transaction DNA is the truth spine**, while the **General Ledger is the financial truth engine**.

That gives NEXG the architecture to eventually add another vertical-cars, hotels, experiences, healthcare, education, whatever-without inventing another source-of-truth system every time. It also fits the design-system principle already established for NEXG: new verticals should compose from the existing system rather than create parallel systems. `Branch · UX Design Laws.txt`

If we lock this now, **every NEXG service-Orders, Payments/Paystack, Merchant, Rider, Host, Inventory, Promotions, CRM, Notifications and Analytics-can be designed around this truth spine instead of each service inventing its own version of reality.**

---

**Sources:**

- [payment-platform-for-marketplaces/docs/architecture/architecture.md at main · dcaglar/payment-platform-for-marketplaces · GitHub](https://github.com/dcaglar/payment-platform-for-marketplaces/blob/main/docs/architecture/architecture.md?utm_source=chatgpt.com)
- [The Reasoning Core, Not a Product Suite | NexLedger](https://nexledger.ai/platform.php?utm_source=chatgpt.com)
- [Payments Ledger — reference architecture · ApexSutra](https://www.apexsutra.com/work/payments-ledger?utm_source=chatgpt.com)
- [About · Nexus Ledger · Nexus Ledger](https://nexus-ledger-web.vercel.app/about?utm_source=chatgpt.com)



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)