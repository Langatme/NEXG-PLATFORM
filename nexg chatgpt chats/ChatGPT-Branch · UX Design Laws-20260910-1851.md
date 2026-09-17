# Branch · UX Design Laws

**User:** Anonymous  
**Created:** 8/5/2026 6:47:01  
**Updated:** 8/9/2026 7:12:09  
**Exported:** 9/10/2026 18:51:31  
**Link:** [https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a72b228-da40-83ea-94e3-0d102c66242d](https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a72b228-da40-83ea-94e3-0d102c66242d)  

## Prompt:
7/31/2026, 10:42:33 AM

As a design.md do you know the 4 in laws of attention, direction, memory, action 
Jakob law
Hicks law
Fitts law
Millers law

## Response:
7/31/2026, 10:42:35 AM

Yes. They’re foundational UX/UI laws, and they map very well to the kind of **design.md system** you’ve been building.

The four you named are:

| Law | Core idea | Design implication |
|---|---|---|
| **Jakob’s Law** | Users expect your interface to work like interfaces they already know. | Preserve familiar interaction patterns unless there is a strong reason to break them. |
| **Hick’s Law** | The more choices people have, the longer it takes to decide. | Reduce, group, prioritize, and progressively reveal choices. |
| **Fitts’s Law** | The time to hit a target depends on its size and distance. | Make important actions large, close, and easy to reach. |
| **Miller’s Law** | People have limited working memory. | Don't make users hold lots of information at once; chunk and externalize information. |

And the **Attention → Direction → Memory → Action** model can sit *above* these laws as a practical design sequence:

**1. Attention**  
What gets noticed first?

→ hierarchy, contrast, spacing, motion, focal points

**2. Direction**  
Where does the interface lead the user?

→ visual flow, proximity, affordances, progressive disclosure

**3. Memory**  
How much does the user have to remember?

→ recognition over recall, contextual information, consistency, chunking

**4. Action**  
How easily can the user perform the intended action?

→ Fitts's Law, clear affordances, target sizing, feedback

So you can think of the system as:

**ATTENTION → DIRECTION → MEMORY → ACTION**

with the four laws acting as constraints:

**Jakob → familiarity**  
**Hick → choice complexity**  
**Fitts → interaction effort**  
**Miller → cognitive load**

For the kind of **single-infinite-display / Monogram interface** you've been designing, this is actually a very useful foundation for a `DESIGN.md` because we can turn each law into **explicit design rules, implementation rules, and acceptance criteria**, rather than leaving them as theory.

## Prompt:
8/5/2026, 6:47:00 AM

Let’s turn each law into a design.md

## Response:
8/5/2026, 6:47:01 AM

I actually think we can go one step further.

Instead of treating them as four isolated laws, make them the **first four chapters of `design.md`**. Every component, screen, modal, workflow, or feature must satisfy these chapters before it can be considered "complete."

# design.md

## Chapter 1 — Jakob's Law
### Familiarity Before Innovation

> Users should spend their mental energy on their work, not on learning our interface.

### Principle

People compare every interface to the hundreds they already know.

Every custom interaction creates cognitive cost.

Innovation should happen in capability—not basic interaction.

---

### Rules

#### 1. Never reinvent common controls.

Use standard behaviors for:

- Buttons
- Search
- Tables
- Dropdowns
- Checkboxes
- Date pickers
- Tabs
- Navigation
- Context menus

---

#### 2. Icons must be universally recognizable.

Examples

✓ Trash = Delete

✓ Pencil = Edit

✓ Plus = Create

✓ Magnifier = Search

Avoid inventing icons.

---

#### 3. Navigation must be predictable.

Users should always know

- Where they are
- Where they came from
- Where they can go

---

#### 4. One interaction = one meaning

Double-click should never sometimes mean Edit and sometimes mean Open.

Consistency is mandatory.

---

### Checklist

Before shipping ask:

- Does this behave like software people already know?
- Would a first-time user predict this behavior?
- Are we different only where it creates real value?

---

## Chapter 2 — Hick's Law
### Reduce Decisions

> Every unnecessary decision slows the user.

---

### Principle

Interfaces should remove choices rather than present them.

The system should make obvious decisions automatically.

---

### Rules

#### 1. Show only what is needed now.

Bad

15 buttons

Good

3 buttons

Advanced options hidden.

---

#### 2. Progressive disclosure

Simple first.

Advanced later.

Never overwhelm.

---

#### 3. Smart defaults

Every form should already have

- sensible defaults
- remembered preferences
- inferred values

---

#### 4. Prioritize actions

Every screen has

Primary Action

Secondary Action

Danger Action

Never ten equal buttons.

---

### Checklist

Ask

Can the system decide this automatically?

Can two options become one?

Can this appear later?

---

## Chapter 3 — Fitts's Law
### Reduce Physical Effort

> Important actions should require the least movement.

---

### Principle

The harder something is to click, the less likely it is to be used.

---

### Rules

#### 1. Primary buttons are largest.

Example

Save

Continue

Send

Pay

Always easier than Cancel.

---

#### 2. Dangerous actions require intention.

Delete

Reset

Archive

Require confirmation or separation.

---

#### 3. Frequently used controls stay close.

Example

Reply button next to email.

Add Note beside timeline.

Call beside phone number.

---

#### 4. Touch targets

Minimum

44×44 px

Desktop

32×32 px minimum

---

#### 5. Reduce cursor travel.

Users should not move across the screen repeatedly.

Group related actions.

---

### Checklist

Ask

Can this be reached faster?

Is the primary action obvious?

Does the mouse travel unnecessarily?

---

## Chapter 4 — Miller's Law
### Respect Human Memory

> Interfaces should remember so people don't have to.

---

### Principle

Humans recognize better than they recall.

The interface should carry memory.

---

### Rules

#### 1. Recognition over recall

Instead of asking

"What was the Merchant ID?"

Show recent merchants.

---

#### 2. Chunk information

Instead of

20 fields

Create logical groups.

Business

Contact

Financial

Compliance

---

#### 3. Preserve context

When opening a modal

Don't lose

Filters

Scroll

Selection

Search

---

#### 4. Never force memorization

Show

History

Breadcrumbs

Recent activity

Suggestions

Auto-complete

---

#### 5. System memory

Remember

Theme

Last tab

Preferred view

Recent searches

Frequently used actions

---

### Checklist

Ask

Does the user have to remember this?

Can we display it instead?

Can we remember it for them?

---

# The Four-Law Flow

Every interface should naturally guide the user through this sequence:

```
ATTENTION
     │
     ▼
What gets noticed first?

     │
     ▼
DIRECTION
Where should the user go next?

     │
     ▼
MEMORY
What can the interface remember or reveal instead of making the user recall it?

     │
     ▼
ACTION
Can the intended action be completed quickly, accurately, and confidently?
```

This creates a simple review process for every new feature:

1. **Jakob:** Does it feel familiar?
2. **Hick:** Have unnecessary choices been removed?
3. **Miller:** Does it reduce cognitive load by remembering or revealing context?
4. **Fitts:** Is the primary action effortless to perform?

As `design.md` evolves, I'd also add later chapters covering other influential principles such as **Tesler's Law** (conservation of complexity), **Aesthetic–Usability Effect**, **Doherty Threshold**, **Occam's Razor**, **Gestalt Principles**, **Peak-End Rule**, **Pareto Principle**, **Parkinson's Law**, and **Zeigarnik Effect**. Together, they form a comprehensive design philosophy that can guide everything from your single-surface Monogram UI to complex enterprise workflows.

## Prompt:
8/5/2026, 6:49:21 AM

Add Teslers law and say next after and which one it will be but first after teslers law explain the ones left and what they will add and what they do some as teslers
Let’s start with the design.md for teslers law

## Response:
8/5/2026, 6:49:22 AM

I think Tesler's Law is the perfect next chapter because it changes **how software is architected**, not just how it looks.

The first four laws teach you how to design interactions. Tesler teaches you **where complexity should live**.

---

# Where `design.md` goes after the first four laws

## Chapter 5 — Tesler's Law
**Moves complexity from the user to the system.**

---

## Chapter 6 — Gestalt Principles
**Teaches the system how humans naturally perceive groups, relationships and patterns.**

Adds:

- Visual organization
- Information hierarchy
- Scanning
- Card layouts
- Dashboards
- Tables
- Forms
- White space
- Alignment

Without Gestalt, interfaces feel messy.

---

## Chapter 7 — Aesthetic–Usability Effect

Users forgive complexity if something feels beautiful.

Adds:

- Color systems
- Typography
- Animation
- Rounded corners
- Shadows
- Motion
- Premium feeling
- Brand perception

This chapter answers:

> Why does Apple software feel easier?

---

## Chapter 8 — Doherty Threshold

Humans remain engaged when systems respond quickly.

Adds:

- Skeleton loaders
- Optimistic UI
- Instant search
- Background loading
- Streaming
- Lazy loading
- Progress indicators

This chapter is about perceived performance, not raw speed.

---

## Chapter 9 — Peak-End Rule

People judge an experience by:

- its highest emotional point
- how it ends

Adds:

- Success animations
- Empty states
- Completion screens
- Celebrations
- Confetti
- Thank-you pages

This chapter makes products memorable.

---

## Chapter 10 — Occam's Razor

The simplest solution that solves the problem is usually the best.

Adds:

- Remove unnecessary features
- Eliminate duplicate workflows
- Simplify APIs
- Reduce dependencies
- Smaller interfaces

This chapter fights feature creep.

---

## Chapter 11 — Pareto Principle

20% of features create 80% of value.

Adds:

- Feature prioritization
- Roadmaps
- MVP planning
- Analytics
- User research

Instead of asking

"What can we build?"

ask

"What creates the most value?"

---

## Chapter 12 — Parkinson's Law

Work expands to fill the available time.

Adds:

- Time limits
- Auto-save
- Deadlines
- One-click actions
- Faster workflows

This chapter is about reducing wasted effort.

---

## Chapter 13 — Zeigarnik Effect

People naturally remember unfinished tasks.

Adds:

- Progress bars
- Checklists
- Continue where you left off
- Drafts
- Notifications
- Streaks

This keeps users engaged without relying on unnecessary interruptions.

---

# Why Tesler comes next

The first four laws answer:

> **How should the interface behave?**

Tesler asks a different question:

> **Who should carry the complexity?**

That question affects every system you build.

For example:

Traditional CRM

```
Create Merchant

↓

Fill 42 fields

↓

Pick status

↓

Pick category

↓

Pick tags

↓

Assign sales rep

↓

Create workflow

↓

Configure reminders

↓

Done
```

Tesler-compliant CRM

```
Create Merchant

↓

Enter Name

↓

Enter Phone

↓

Done

↓

System:

✓ Detects business type

✓ Suggests category

✓ Creates pipeline

✓ Generates follow-ups

✓ Creates reminders

✓ Assigns owner

✓ Starts automation
```

The amount of work hasn't disappeared. **The complexity moved from the human to the software.** That is the essence of Tesler's Law.

---

# Chapter 5 — Tesler's Law
## Conservation of Complexity

> Every system contains an irreducible amount of complexity. Great software moves that complexity away from the user and into the system.

---

## Principle

Complexity cannot be eliminated—it can only be relocated.

Users should never perform work that the computer can perform more accurately, consistently, or quickly.

The interface should ask for only the information that cannot be inferred, calculated, or discovered automatically.

---

## Design Philosophy

The user provides **intent**.

The system determines **execution**.

Design software that feels intelligent by reducing decisions, automating repetition, and surfacing only what matters in the current context.

---

## Rules

### 1. Automate before asking

Before requesting input, ask:

- Can this be inferred?
- Can this be calculated?
- Can it be remembered?
- Can it be discovered?
- Can AI or business rules determine it?

Only ask when the answer is genuinely unknown.

---

### 2. One input, many outcomes

A single action should trigger multiple system responsibilities.

Example:

Creating a merchant should automatically:

- Generate a unique ID.
- Detect the business category.
- Create a default sales pipeline.
- Configure standard follow-up tasks.
- Enable notifications.
- Initialize analytics.
- Apply organization defaults.

The user performs one action; the system performs many.

---

### 3. Eliminate repetitive work

The same information should never be entered twice.

Use:

- Auto-complete
- Auto-fill
- Templates
- History
- Defaults
- Reusable components
- Context-aware suggestions

---

### 4. Make the system context-aware

Interfaces should adapt to the user's current task.

Examples:

- Show actions relevant to the selected item.
- Hide unavailable features.
- Recommend the next logical step.
- Surface frequently used commands.

Context reduces unnecessary decisions.

---

### 5. Shift operational complexity to the backend

Validation, calculations, business rules, permissions, and workflow orchestration belong in the system—not in the user's head.

Users should focus on goals, not implementation details.

---

### 6. Prefer intelligent defaults over blank states

Every new object should begin with sensible defaults that users can override if needed.

Blank forms represent missed opportunities to reduce effort.

---

### 7. Reveal complexity progressively

Simple tasks should remain simple.

Advanced capabilities should become available only when they are needed.

Power should not require overwhelming first-time users.

---

## Checklist

Before shipping, ask:

- Did we ask the user for information the system already knows?
- Did we automate every repetitive step that can be automated?
- Is the user expressing intent rather than configuring implementation?
- Can this workflow be completed with fewer interactions?
- Have we relocated complexity into the software instead of leaving it with the user?

---

## Success Metric

A feature follows Tesler's Law when a new user can achieve a meaningful result with minimal input because the system intelligently performs the remaining work on their behalf.

This chapter naturally becomes the bridge from interaction design into intelligent software design. Once the first four laws make the interface understandable, Tesler's Law ensures the software itself carries as much of the complexity as possible, enabling workflows that feel effortless rather than merely familiar.

## Prompt:
8/5/2026, 6:58:08 AM

That is a brilliant, highly sophisticated UX evolution. Moving from a rigid tab-based navigation to a Widget-Based Home Screen Workspace aligns directly with modern OS design paradigms (like iOS Smart Stacks and Live Activities).
Instead of forcing the user to switch back and forth between dedicated tab screens, this approach treats the Home Screen as a dynamic command center.
1. Why the Dynamic Home Screen Concept Superior
 * Zero-Click Awareness (Attention): Important operational information (e.g., active orders, today's bookings, total revenue) is visible immediately upon launching the app without requiring tab-switching.
 * Progressive Expansion (Hick’s & Fitts’s Laws): Instead of navigating away to a deep page, tapping a widget expands it in place or slides it open as a sheet. The user never loses their global sense of context.
 * Flexibility & Personalization: Merchants can prioritize what matters most to their specific business vertical (e.g., a delivery-heavy merchant pins the Logistics widget to the top; a salon or clinic pins the Bookings widget).
2. The Home Screen Architecture & Expansion Mechanics
In this structure, the app is simplified even further into a Single Home Canvas with a persistent, minimal floating bar at the bottom containing just [ Home ], [ Analytics ], and [ Settings/Search ].
┌────────────────────────────────────────────────────────┐
│  06:40                                          4G 🔋 │
│  Nexg Merchant                             [ Profile ] │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 📦 LOGISTICS QUEUE (LIVE)          [ Expand ↗ ] │  │  <-- Top Priority:
│  │ ⚡ 2 Orders Need Dispatch                        │  │      Live status,
│  │ • Order #12345 — Preparing (14m ago)             │  │      quick actions
│  │ • Order #12344 — Ready for pickup                │  │      in-line
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────────────┐  ┌──────────────────────┐  │
│  │ 📅 TODAY'S BOOKINGS    │  │ 💰 TODAY'S REVENUE   │  │  <-- Dual-Column
│  │ 4 Confirmed            │  │ KSh 14,500.00        │  │      Glanceable
│  │ Next: John D. (10:00)  │  │ ▲ 12% vs yesterday   │  │      Widgets
│  └────────────────────────┘  └──────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ⚠️ ACTION ITEMS & COMPLIANCE                      │  │  <-- Dynamic Status
│  │ • Tax Certificate Update Required [Fix Now]      │  │      Alert Bar
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│             (  🏠 Home   📊 Reports   ⚙️ Settings  )    │  <-- Ultra-minimal
└────────────────────────────────────────────────────────┘      Floating Pill

3. How Expansion Works (The "Jony Ive" Elastic Feel)
When a merchant taps an expandable card widget, the interface smoothly morphs rather than abruptly changing pages:
  [ Compact Card ]  ──( Tap Widget )──>  [ Fluid Spring Animation ]  ──>  [ Full Expanded Workspace ]

 * Inline Expansion (Accordion Style): Tapping the Logistics Queue Card smoothly scales the card up to fill 80% of the screen height, revealing full order details, customer contact info, and "Dispatch" buttons right on the main feed.
 * Contextual Minimization: Other widgets beneath it softly blur or dim into the background (backdrop-filter: blur), keeping the merchant focused exclusively on fulfillment.
 * Dismissal (Swipe to Collapse): Swiping down on the expanded workspace seamlessly snaps the card back into its compact widget form.
4. UI Comparison: Tab Navigation vs. Live Widget Canvas
| Feature | Tab-Based Architecture | Live Widget Home Canvas |
|---|---|---|
| Primary Interaction | Tap tab bar → Full screen load → Navigate back | Glance key data → Tap widget to expand inline |
| Information Density | High, but fragmented across 4 screens | High, unified on a single intelligent feed |
| Context Switching | High (must jump between tabs) | Zero (everything expands on the main canvas) |
| Speed to Action | 2–3 taps to dispatch an order | 1 tap to expand & fulfill |
| Psychological Feel | Traditional Mobile Web App | Native OS / Dashboard Experience |

For NexG merchants app

## Response:
8/5/2026, 6:58:09 AM

I think this is a very strong direction, and it aligns with the design philosophy you've been building over the last few months. More importantly, it isn't just a visual redesign—it changes the interaction model.

That said, I would make one fundamental shift.

The **Home** should not be treated as a page.

It should become the **Workspace**.

That distinction seems small, but it changes the architecture of the entire app.

---

# The NexG Merchant Design Philosophy

## There are no pages.

There are only **Workspaces**.

A workspace is a living environment composed of intelligent widgets.

Each widget is

- Alive
- Context-aware
- Expandable
- Independent
- Persistent

Think less like opening screens and more like interacting with a desktop.

---

# The Home Workspace

The Home Workspace answers one question:

> **"What requires my attention right now?"**

Not

> "What features does this app have?"

That's a critical difference.

The system should organize itself around the merchant's priorities, not around the app's modules.

---

# A Widget Is Not a Card

Most dashboards mistake widgets for static summary cards.

A NexG widget should be a **mini-application**.

For example:

### Logistics Widget

Collapsed

```
2 Orders Waiting

Driver 3 minutes away

[Expand]
```

Expanded

```
Dispatch Queue

Customer timeline

Driver assignment

Call customer

Maps

Payment

Print receipt

Live tracking

Status history

Bulk actions
```

Notice something.

It didn't navigate.

It simply grew.

---

# Widgets Have States

Instead of designing pages, design widget life cycles.

```
Hidden

↓

Compact

↓

Expanded

↓

Focused

↓

Pinned

↓

Background Live
```

Every widget moves through these states.

---

## Hidden

Not currently relevant.

Zero visual noise.

---

## Compact

Provides awareness.

One glance.

```
Revenue

KSh 14,500

▲12%
```

---

## Expanded

Provides interaction.

```
Revenue

Today's Sales

Transactions

Refunds

Payment Methods

Invoices
```

---

## Focused

Almost fullscreen.

The merchant is actively working.

Example

Dispatching an order.

Everything else fades.

---

## Pinned

Merchant permanently keeps this widget near the top.

Example

Restaurants

```
Orders

Kitchen Queue

Dispatch
```

Hotels

```
Reservations

Housekeeping

Check-outs
```

Salon

```
Today's Appointments

Walk-ins

Staff Schedule
```

---

## Background Live

Widget continues updating.

The merchant closes it.

It still receives updates.

The Home Workspace remains current without requiring refreshes.

---

# Intelligent Widget Ordering

This is where AI becomes genuinely useful.

Instead of the merchant arranging widgets once and forgetting them, the workspace continuously adapts.

Priority could be determined by factors such as:

```
Urgency

Time sensitivity

Revenue impact

Frequency of use

Outstanding tasks

Merchant behavior

Time of day

Business type
```

For example:

**8:00 AM**

```
Bookings

Today's Schedule

Staff

Open Store
```

---

**1:00 PM**

```
Orders

Kitchen

Drivers

Customer Messages
```

---

**11:00 PM**

```
Revenue

Settlement

Inventory

Tomorrow's Schedule
```

The workspace evolves with the merchant's day.

---

# Widget Behaviors

Every widget should support the same interaction vocabulary.

```
Tap

Expand

↓

Swipe Down

Collapse

↓

Long Press

Quick Actions

↓

Pin

Move to Top

↓

Drag

Reorder

↓

Double Tap

Favorite

↓

Live Update

Refresh Automatically
```

Users learn one interaction model and apply it everywhere, which reinforces Jakob's Law.

---

# Design Law Mapping

Your first five chapters of `design.md` naturally map onto this architecture:

**Jakob's Law** — Every widget behaves consistently. Learn one widget, understand them all.

**Hick's Law** — Show only compact summaries until users choose to expand.

**Miller's Law** — Keep important context visible; don't make users remember information from another screen.

**Fitts's Law** — Primary actions (Dispatch, Accept, Check In, Complete) remain within easy reach inside expanded widgets.

**Tesler's Law** — Widgets infer priorities, preload data, suggest actions, and automate routine work instead of asking users to configure everything.

---

## One refinement I'd strongly recommend

I would actually replace the bottom navigation labels:

```
Home

Analytics

Settings
```

with

```
Workspace

Insights

Search
```

Here's why:

- **Workspace** communicates that this is where work happens—not just a landing page.
- **Insights** is broader than Analytics; it can include trends, AI recommendations, and business health, not just charts.
- **Search** can become a universal command center. Like Spotlight on iOS or Raycast on macOS, it can search orders, customers, bookings, inventory, reports, settings, and even execute actions ("Create booking", "Refund order", "Open today's dispatch queue").

That gives NexG a more distinctive mental model:

```
Workspace   → Do work
Insights    → Understand the business
Search      → Find anything or do anything
```

At that point, the merchant app stops feeling like a collection of screens and starts feeling like an operating system for running a business. That architectural shift is much harder to copy than simply reproducing a dashboard layout.

## Prompt:
8/5/2026, 6:59:30 AM

Generate the image with all 3 screens

## Response:
8/5/2026, 6:59:31 AM

![Image](https://chatgpt.com/backend-api/estuary/content?id=file_000000002814820a854337ec7a69ea2e&fn=image-gen-1.png&cd=attachment&ts=496959&p=fs&cid=1&sig=fc1961b3ca4a0c1769d68fc29cc9bdcb88083e0405e7b247a0868780bfe12b30&v=0)

## Prompt:
8/5/2026, 7:02:10 AM

How would you generate the host app, for the property managers

## Response:
8/5/2026, 7:02:10 AM

I actually wouldn't make the Host app look like the Merchant app.

The **Merchant app** is about **high-frequency operations** (orders, bookings, dispatch, payments). It's optimized for speed.

The **Host app** is about **assets** (properties), **time** (reservations), **people** (guests), and **operations** (housekeeping, maintenance). It needs a different workspace while keeping the same interaction language.

---

# NexG Host OS

## Philosophy

> "Everything revolves around a property."

Not around menus.

Not around modules.

Not around tabs.

A host wakes up thinking:

- Which properties are occupied?
- Who is checking in?
- What needs cleaning?
- Which apartment has a maintenance issue?
- How much revenue am I making?

The workspace should answer those questions immediately.

---

# Home Workspace

```
06:40

Good Morning Emma

Portfolio Health
────────────────────────
🏠 18 Properties

🟢 15 Occupied

🟡 2 Checking In Today

🔴 1 Requires Cleaning

────────────────────────
```

Immediately underneath...

```
Today's Timeline

08:00

Apartment A12

Check-out

────────────

10:00

Apartment C5

Housekeeping

────────────

14:00

Apartment B7

Check-in

────────────

18:00

Airport Pickup

Guest David
```

The day becomes the primary navigation.

---

# Property Widget

Collapsed

```
🏠 Riverside Apartment

Occupied

John Smith

Checkout Tomorrow

Revenue

KSh 6,500
```

Tap...

Expands...

```
Property

Guest

Reservation

Payments

Messages

Cleaning

Maintenance

Documents

Smart Lock

Photos

Reviews

Analytics
```

Everything happens inside the property.

No navigation.

---

# Reservation Widget

Instead of a calendar page...

```
Upcoming Check-ins

Today

3

Tomorrow

5

This Week

18
```

Expand...

```
Today's Check-ins

09:00

Apartment 2A

Passport Verified

Airport Pickup

Paid

──────────

12:00

Villa 4

VIP Guest

Late Arrival

Welcome Basket

──────────

15:00

Studio 9

Pending Balance
```

---

# Housekeeping Widget

This becomes one of the most important widgets.

Collapsed

```
Housekeeping

4 Pending

2 In Progress

18 Complete
```

Expanded

```
Cleaner

Property

Priority

Checklist

Photos

Supplies

Inspection

Approve
```

---

# Maintenance Widget

```
Maintenance

2 Open

1 Emergency

6 Scheduled
```

Expand...

```
Issue

Technician

Photos

Timeline

Parts

Cost

Status

Invoice
```

---

# Guest Widget

```
Guests Today

7 Arrivals

5 Staying

2 Departures
```

Expand...

```
Guest Timeline

Messages

ID Verification

Invoices

Special Requests

Complaints

Loyalty

History
```

---

# Revenue Widget

```
Today's Revenue

KSh 52,000

▲14%
```

Expand...

```
Revenue

Occupancy

ADR

RevPAR

Channel Mix

Outstanding Payments

Refunds

Forecast
```

---

# AI Widget

This is where the Host app becomes different.

```
Assistant

Good morning.

Apartment B3 has been vacant
for six days.

Suggested action

Reduce nightly price by 8%.

────────────

Guest Sarah requested

Late Checkout

Approve?

[Approve]

[Decline]
```

Instead of just reporting...

The system recommends.

---

# Property Expansion

When a property expands...

Everything else fades.

```
Portfolio

↓

Apartment B7

↓

Guest

↓

Cleaning

↓

Maintenance

↓

Revenue

↓

History
```

The property becomes the workspace.

Exactly like macOS opening a Finder window.

---

# Widget Priorities

Morning

```
Today's Arrivals

Housekeeping

Messages

Airport Pickups
```

Afternoon

```
Check-ins

Guest Support

Cleaning

Payments
```

Evening

```
Revenue

Reviews

Tomorrow's Schedule

Maintenance
```

Dynamic.

No fixed dashboard.

---

# Bottom Navigation

I'd actually simplify it further than the Merchant app.

```
Workspace

Portfolio

Search
```

### Workspace

Live operational feed.

### Portfolio

A spatial view of all properties.

Apartment

Villa

Hotel

Airbnb

Commercial

Grouped visually.

### Search

Universal command center.

```
Search

Apartment

Guest

Reservation

Cleaner

Invoice

Technician

Document

Payment

Everything
```

---

## The "killer feature": Spatial Portfolio

This is where I think NexG can differentiate itself. Instead of a flat property list, imagine a **Portfolio Canvas** where each property is a live card that changes status at a glance.

```
🏢 Riverside Apartments

┌────┬────┬────┐
│101🟢│102🔴│103🟡│
├────┼────┼────┤
│104🟢│105🟢│106⚪│
└────┴────┴────┘

🟢 Occupied
🟡 Check-in Today
🔴 Needs Cleaning
⚪ Vacant
```

Tap **102**, and it expands directly into the property's full workspace without leaving the portfolio. For larger operators, the same concept scales from apartments to villas, hotels, or entire buildings.

Combined with your widget-based workspace philosophy, this would make the Host app feel less like a traditional property management system and more like a **Property Operating System**—where managers are continuously aware of their portfolio's health and can move from a portfolio overview to a single property's live operations in one fluid interaction. That distinction is difficult for conventional PMS software, which typically relies on lists, tabs, and separate modules.

## Prompt:
8/5/2026, 7:02:57 AM

Generate the screens of the host app

## Response:
8/5/2026, 7:02:57 AM

![NexG Host Dashboard Trio](https://chatgpt.com/backend-api/estuary/content?id=file_000000003cc4820a9a7d0f9ce9d05c16&fn=NexG+Host+Dashboard+Trio.png&cd=attachment&ts=496959&p=fs&cid=1&sig=f5e2631599e0acff578e0a87163466d9cb0e2a50732fa632503ccf54ceed474f&v=0)

## Prompt:
8/5/2026, 7:06:39 AM

What about riders app

## Response:
8/5/2026, 7:06:40 AM

![NexG Rider Delivery Dashboard Mockup](https://chatgpt.com/backend-api/estuary/content?id=file_00000000bbf8820aa06e2b91fe34c03b&fn=NexG+Rider+Delivery+Dashboard+Mockup.png&cd=attachment&ts=496959&p=fs&cid=1&sig=c08782f3aa78695cdf06151c458cfd7678ba99c5fd41278877afbfc5965a827f&v=0)

## Prompt:
8/5/2026, 7:09:05 AM

Orders and profile screen

## Response:
8/5/2026, 7:09:06 AM

![NexG Rider Orders and Profile Mockup](https://chatgpt.com/backend-api/estuary/content?id=file_0000000002848246b4d58a3bc68f251c&fn=NexG+Rider+Orders+and+Profile+Mockup.png&cd=attachment&ts=496959&p=fs&cid=1&sig=13661228fdfb0cd88a1b4572a7683be7669c86058380d422eeb425137aba494b&v=0)

## Prompt:
8/5/2026, 7:15:31 AM

Upcoming, completed am, cancelled order screens, as well as expanded rider widget

The nav bar logic should be reconsidered because there is some form of redundancy with the Home Screen but I understand that maybe they need to be anchored bc of importance

## Response:
8/5/2026, 7:15:32 AM

![Dark-Themed Delivery Rider App Collage](https://chatgpt.com/backend-api/estuary/content?id=file_0000000063c48246bc4b2e5ed20d50c7&fn=Dark-Themed+Delivery+Rider+App+Collage.png&cd=attachment&ts=496959&p=fs&cid=1&sig=6af88b793975343a14eea11b9bc2cd90aa723e9c6484b1867432e786c334c51a&v=0)

## Prompt:
8/5/2026, 7:22:28 AM

Now what about the consumer app where all the ordering comes from and how screen swill be accessible from the nav bar

## Response:
8/5/2026, 7:22:29 AM

This is actually the hardest app in the ecosystem because it's the one customers compare to the best consumer apps in the world. The benchmark isn't another startup—it's apps like Uber Eats, DoorDash, Glovo, Airbnb, and Apple Wallet.

I also think this app should **not** follow the same navigation philosophy as the Merchant and Host apps.

The Merchant, Host, and Rider apps are **workspaces**. People open them to perform work.

The Consumer app is an **exploration and transaction** app. People open it to discover, compare, and buy. That changes the information architecture.

---

# The Three Types of NexG Apps

| App | Primary Goal | UX Model |
|------|--------------|----------|
| Merchant | Operate a business | Workspace |
| Host | Operate properties | Workspace |
| Rider | Complete deliveries | Workspace |
| Consumer | Discover and buy | Exploration + Transaction |

The consumer app therefore needs a different mental model.

---

# One Home, Many Journeys

The Home screen should not be a list of restaurants.

Instead it should answer:

> **What is relevant to me right now?**

For example:

```
Good Morning

Delivery in your area

──────────────

Continue Order

Chicken Republic

12 mins

──────────────

Recommended

──────────────

Nearby

──────────────

Offers

──────────────

Recent Orders

──────────────

Experiences

──────────────

Airport Transfer

──────────────

Laundry

──────────────

Groceries
```

Notice something.

There isn't a "Restaurant page."

There isn't a "Laundry page."

Everything starts from one intelligent feed.

---

# Navigation

I would reduce it to four anchors.

```
🏠

Home

🔍

Explore

🧺

Orders

👤

Account
```

Not five.

Not six.

Four.

---

## Home

This is the living feed.

Widgets include:

```
Continue Order

Today's Deals

Restaurants Nearby

Book Again

Saved Places

Live Order

Promotions

Experiences

Airport Pickup

Groceries

Laundry

Events

Subscriptions
```

Every widget expands.

No navigation.

---

## Explore

This becomes the discovery engine.

Think Apple Maps meets Airbnb.

Top

```
Search

──────────

Categories

──────────

Restaurants

Groceries

Pharmacy

Laundry

Flowers

Beauty

Transport

Experiences

Hotels

Events
```

Scrolling reveals:

```
Trending

New

Highest Rated

Fastest Delivery

Luxury

Budget

Nearby

Open Now
```

---

Tapping a category does **not** open a new tab.

It simply filters Explore.

```
Explore

↓

Restaurants

↓

Italian

↓

Pizza

↓

Merchant
```

The navigation remains stable.

---

## Orders

This is where people expect history, tracking, and receipts.

Instead of one long list, use four tabs at the top:

```
Active

Upcoming

Completed

Cancelled
```

This matches the Rider experience, creating consistency across the ecosystem.

---

### Active

```
Driver

ETA

Live Map

Call

Chat

Receipt

Support
```

---

### Upcoming

```
Reservations

Scheduled Deliveries

Airport Pickup

Housekeeping

Appointments
```

---

### Completed

```
Receipt

Rate

Tip

Book Again

Reorder

Invoice
```

---

### Cancelled

```
Refund

Reason

Support

Rebook
```

---

## Account

Everything personal.

```
Wallet

Addresses

Payment Methods

Notifications

Preferences

Family

Loyalty

Support

Documents

Settings
```

---

# Universal Search

This becomes one of the most powerful features.

Instead of only searching restaurants...

Search everything.

```
Pizza

↓

Restaurants

Meals

Coupons

Stores

Reviews

```

Search

```
Airport

↓

Airport Transfer

Airport Hotels

Airport Parking

Airport Lounge

```

Search

```
Laundry

↓

Laundry

Dry Cleaning

Ironing

Express

```

One search.

Entire ecosystem.

---

# The Universal Action Sheet

The floating action isn't a "+" button.

It's a **Quick Action Sheet**.

```
Order Food

Book Stay

Request Ride

Airport Pickup

Laundry

Grocery

Courier

Flowers

Reserve Table

Find Pharmacy
```

This lets users jump directly into an intent without first navigating through categories.

---

# Why this navigation works

The bottom navigation isn't organized by business verticals (Food, Hotels, Laundry). It's organized by **user intent**:

- **Home** → "Show me what matters now."
- **Explore** → "Help me discover."
- **Orders** → "Help me manage what I've requested."
- **Account** → "Help me manage myself."

Within those anchors, the entire NexG ecosystem—restaurants, groceries, pharmacies, airport transfers, laundry, experiences, and property bookings—can be surfaced through widgets, filters, and search rather than adding more bottom navigation items.

That keeps the navigation compact while still allowing the platform to grow into new service categories without redesigning the app each time a new vertical is introduced.

## Prompt:
8/5/2026, 7:24:17 AM

Let’s generate the Home Screen and all its states

## Response:
8/5/2026, 7:24:18 AM

![Image](https://chatgpt.com/backend-api/estuary/content?id=file_00000000dc44820a821194a7d10a3290&fn=image-gen-1%281%29.png&cd=attachment&ts=496959&p=fs&cid=1&sig=fa73ee5a438f991aeeccaca3186d415e163545eab7f50e3d06aa5cbc179e9eaa&v=0)

![NexG Food and Services App Showcase](https://chatgpt.com/backend-api/estuary/content?id=file_00000000e09882468eaeeeedd18c0a45&fn=NexG+Food+and+Services+App+Showcase.png&cd=attachment&ts=496959&p=fs&cid=1&sig=e163eac7d9be0930462ed521cac81fc0bcdd8678c7c36eaa5b7bafb843f564b7&v=0)

## Prompt:
8/5/2026, 8:15:22 AM

Make it dark mode image 2 and all icons should be monochrome like a single type of whitish colour 
The food images should have no background so the food card background is a type of charcoal dark on the iOS keyboard the type of black dim white on the letters and a greyish letter box

## Response:
8/5/2026, 8:15:23 AM

![Image](https://chatgpt.com/backend-api/estuary/content?id=file_00000000ef70820ab9ca003e2e3595b3&fn=image-gen-1%282%29.png&cd=attachment&ts=496959&p=fs&cid=1&sig=fd4143b14970f32b493078e7dd5b2bd621f5cb0241a7c245c80d468f203df0d2&v=0)

## Prompt:
8/9/2026, 6:30:44 AM

Can this apps all be built from a a similar reusable components library 
And how long would it take it to collect one not make 
Just collect existing parts I like from existing libraries

## Response:
8/9/2026, 6:30:49 AM

Yes — **absolutely**, and for NEXG I would strongly recommend doing this **before building the individual apps**.

The important distinction is:

> We don't need to *design and build* hundreds of components.  
> We need to **collect, curate, normalize, and organize existing components** into a NEXG component library.

That could save a huge amount of time.

### What NEXG could share

The four operational apps:

- Consumer
- Merchant
- Host
- Rider

and then:

- Admin
- Monitoring
- Merchant Portal
- Host Portal
- other web portals

can all use the same **design language and component primitives**.

For example:

```text
NEXG COMPONENT LIBRARY
│
├── Foundations
│   ├── Typography
│   ├── Spacing
│   ├── Radius
│   ├── Shadows
│   ├── Icons
│   ├── Colors
│   └── Motion
│
├── Navigation
│   ├── Bottom Navigation
│   ├── Top Bar
│   ├── Side Navigation
│   ├── Search
│   └── Breadcrumbs
│
├── Inputs
│   ├── Text Field
│   ├── Search
│   ├── Select
│   ├── Date Picker
│   ├── Time Picker
│   ├── Toggle
│   └── Upload
│
├── Surfaces
│   ├── Card
│   ├── Widget
│   ├── Sheet
│   ├── Modal
│   ├── Drawer
│   └── Panel
│
├── Data
│   ├── Table
│   ├── List
│   ├── Timeline
│   ├── Calendar
│   ├── Chart
│   └── KPI
│
├── Commerce
│   ├── Product Card
│   ├── Cart
│   ├── Order
│   ├── Payment
│   ├── Invoice
│   └── Receipt
│
├── Operations
│   ├── Order Widget
│   ├── Booking Widget
│   ├── Delivery Widget
│   ├── Property Widget
│   ├── Rider Widget
│   └── Task Widget
│
└── Feedback
    ├── Toast
    ├── Alert
    ├── Empty State
    ├── Loading
    ├── Skeleton
    └── Error
```

Then the apps are basically **different compositions of the same vocabulary**.

---

# And this is where your five laws become powerful

We shouldn't just collect pretty components.

We collect components that satisfy your:

**Jakob →** familiar behavior  
**Hick →** controlled choices  
**Fitts →** accessible targets  
**Miller →** reduced cognitive load  
**Tesler →** complexity handled by the system

Then we build the NEXG layer on top.

For example:

### Existing library

`Card`

↓

### NEXG Card

```text
NEXG Card
├── compact
├── expanded
├── interactive
├── live
├── loading
├── error
└── focused
```

Then the same component can become:

**Consumer**

> Restaurant card

**Merchant**

> Order card

**Host**

> Property card

**Rider**

> Delivery card

**Admin**

> Merchant monitoring card

Same underlying design language.

---

# We can also collect the components visually first

This is probably the fastest route for you.

Instead of immediately coding:

### Step 1 — Component archaeology

Collect existing components you like from reputable open-source libraries.

For example:

- buttons
- cards
- sheets
- dialogs
- navigation
- tables
- calendars
- maps
- charts
- inputs
- command palettes
- avatars
- timelines
- status indicators
- loading states
- notifications

Then put them into one **NEXG Component Library**.

### Step 2 — Remove duplicates

You might find:

```text
Button A
Button B
Button C
```

We choose one.

Same for:

```text
Card A
Card B
Card C
```

This is where the library becomes coherent instead of becoming a junk drawer.

### Step 3 — Apply NEXG tokens

Then we establish:

```text
NEXG
│
├── Typography
├── Spacing
├── Radius
├── Elevation
├── Motion
├── Iconography
└── Color
```

The components inherit these tokens.

### Step 4 — Add NEXG-specific components

Only after exhausting existing components.

This is important.

We **do not build a custom component because we can**.

We build one only when:

> Existing components cannot express an important NEXG interaction.

That's where things like your **expandable live widgets** may become genuinely custom.

---

# How long to COLLECT it?

If we're talking specifically about **collecting and organizing existing components**, not coding them:

### Quick foundation

**1–2 days**

You could have:

- typography
- buttons
- inputs
- cards
- navigation
- modals
- sheets
- tables
- basic data components
- icons
- feedback components

---

### Serious NEXG library

**4–7 days**

We could curate roughly:

**150–300 component variants**

organized into a proper taxonomy.

That's probably the sweet spot.

---

### Very comprehensive library

**1–2 weeks**

Something closer to:

**300–600+ component variants**

including:

- mobile
- desktop
- dark mode
- responsive states
- loading
- empty
- error
- disabled
- selected
- expanded
- focused
- hover
- success
- destructive

At that point you aren't just collecting components.

You're creating the **NEXG Design System Foundation**.

---

# But there is one major catch

We should **not simply copy components from random websites**.

We should select libraries with compatible licenses and use their actual packages/source where permitted.

For example, we can investigate ecosystems such as:

- **shadcn/ui**
- **Radix UI**
- **Material UI**
- **Tailwind UI / Headless UI**
- **React Aria**
- **React Native Paper**
- **NativeWind**
- **Lucide**
- **TanStack**
- **Recharts**

and then decide what belongs in the NEXG stack.

The exact choice depends on whether we're building each interface in **React web, React Native, or a mixed architecture**.

---

# The really interesting part for NEXG

We could make the library **platform-aware**.

```text
                 NEXG DESIGN SYSTEM
                         │
             ┌───────────┴───────────┐
             │                       │
        WEB SYSTEM              MOBILE SYSTEM
             │                       │
       React components       React Native components
             │                       │
     ┌───────┼────────┐       ┌──────┼────────┐
     │       │        │       │      │        │
 Merchant   Host    Admin   Consumer Rider   Host
 Portal    Portal  Portal    App     App     App
```

But the **design language remains one system**.

So a NEXG button should feel like a NEXG button everywhere, even if its underlying implementation differs.

---

## My recommendation

Don't spend weeks designing components individually.

Let's do this:

**Phase 1 — Collect**  
Find the best existing components.

**Phase 2 — Curate**  
Choose the winners and remove duplicates.

**Phase 3 — Normalize**  
Make them obey NEXG's typography, spacing, radius, icons, motion and dark/light rules.

**Phase 4 — Compose**  
Build Merchant, Host, Rider and Consumer from them.

**Phase 5 — Identify gaps**  
Only then create genuinely custom NEXG components.

That is much faster and, importantly, it prevents the four apps from slowly developing **four different design languages**.

If we do the collection properly, **a week is a very realistic target for the initial NEXG component library**, with the actual app-specific assembly happening afterward.

## Prompt:
8/9/2026, 6:33:44 AM

I like this 

300–600+ component variants

including:

* mobile
* desktop
* dark mode
* responsive states
* loading
* empty
* error
* disabled
* selected
* expanded
* focused
* hover
* success
* destructive

And I would love to use expo and also a progressive blur would be nice at the header and bottom near the bars

## Response:
8/9/2026, 6:33:46 AM

> **Searching the web**
>
> [LinearGradient - Expo Documentation](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
>
> **Searched 1 website**
>
> 
>
> Worked for a couple of seconds

Yes. I would lock this in as the **NEXG cross-platform design-system strategy**.

And I especially like the combination of **Expo + a large curated component library + progressive blur**, because it lets us build the Consumer, Merchant, Host, and Rider apps from one visual/interaction language while still allowing each app to have its own information architecture.

### The library target

I would make the target:

**300-600+ variants**, not 300-600 completely different components.

For example, one `NexGButton` could have:

```text
Button
├── primary
├── secondary
├── tertiary
├── destructive
├── loading
├── disabled
├── focused
├── selected
├── icon
├── icon + label
├── full width
├── compact
├── large
├── dark
└── light
```

That is much more useful than having hundreds of unrelated components.

---

# And yes - Expo is a very good fit

I would structure the mobile system around:

**Expo + React Native + Expo Router + TypeScript**

Expo's current ecosystem supports the development/deployment workflow and Expo Router provides the navigation layer we need. ([Expo Documentation](https://docs.expo.dev/guides/overview/?utm_source=chatgpt.com))

Then our NEXG layer sits above it:

```text
NEXG APPS
│
├── Consumer
├── Merchant
├── Host
└── Rider
       │
       ▼
NEXG DESIGN SYSTEM
       │
       ├── Components
       ├── Tokens
       ├── Motion
       ├── Icons
       ├── Widgets
       ├── Navigation
       └── States
       │
       ▼
Expo / React Native
```

---

# Progressive Blur should be part of the system

And I **wouldn't use blur as decoration everywhere**.

I'd make it a specific NEXG surface primitive:

### `NexGGlass`

Used for:

- top headers
- bottom navigation
- floating action bars
- expanded widget controls
- floating search
- modal controls
- live-status overlays

Expo's `BlurView` is specifically designed for things such as navigation bars, tab bars and modals. ([Expo Documentation](https://docs.expo.dev/versions/v54.0.0/sdk/blur-view/?utm_source=chatgpt.com))

---

# But the effect you described is better than ordinary blur

You don't want:

```text
████████████
FULL BLUR
████████████
```

You want:

```text
Content

       ↓

     slight blur
       ↓
    medium blur
       ↓
   strong blur
       ↓
████████████
  NAV BAR
████████████
```

So the blur **progressively increases toward the edge**.

And the same thing at the top:

```text
STATUS BAR
████████████
strong blur

medium blur

slight blur

CONTENT
```

That's going to look much more like a native OS surface.

`expo-linear-gradient` gives us the gradient primitive needed to create the fading transition around these surfaces. ([Expo Documentation](https://docs.expo.dev/versions/latest/sdk/linear-gradient/?utm_source=chatgpt.com))

So conceptually:

```text
           HEADER
    ┌─────────────────────┐
    │      Blur 100%      │
    │      Blur 80%       │
    │      Blur 40%       │
    │      Blur 15%       │
    └─────────────────────┘
             ↓
           CONTENT
             ↓
    ┌─────────────────────┐
    │      Blur 15%       │
    │      Blur 40%       │
    │      Blur 80%       │
    │      Blur 100%      │
    │     NAVIGATION      │
    └─────────────────────┘
```

We can make this a reusable component rather than implementing it separately in every app.

---

# `NexGProgressiveBlur`

Something conceptually like:

```text
<NexGProgressiveBlur
    position="top"
    intensity={80}
    tint="dark"
/>
```

or:

```text
<NexGProgressiveBlur
    position="bottom"
    intensity={90}
    tint="dark"
/>
```

Then every app gets the same behavior.

---

# And this solves something important with your widget architecture

Remember your expanded widgets.

Instead of:

```text
Widget expands

↓

New page

↓

Opaque navigation bar
```

we can have:

```text
HOME WORKSPACE
────────────────────

Live widgets

       ↓

Widget expands

       ↓

Content fills screen

       ↓

Progressive blur
       ↓
Floating controls
```

The interface feels like **one continuous surface**.

That is exactly the direction I would take NEXG.

---

# The component library should therefore have 8 layers

### 01 - Foundations

Typography  
Spacing  
Colors  
Radius  
Elevation  
Motion  
Blur  
Grid

### 02 - Primitives

Text  
Icon  
Avatar  
Image  
Divider  
Badge  
Progress

### 03 - Controls

Button  
Input  
Search  
Toggle  
Checkbox  
Radio  
Select  
Slider

### 04 - Surfaces

Card  
Sheet  
Modal  
Drawer  
Popover  
Toast  
Tooltip

### 05 - Navigation

Top Bar  
Bottom Bar  
Floating Bar  
Tab Bar  
Command Search  
Breadcrumbs

### 06 - Data

List  
Table  
Timeline  
Calendar  
Chart  
KPI  
Map

### 07 - NEXG Widgets

Order  
Delivery  
Booking  
Property  
Guest  
Merchant  
Rider  
Payment  
Revenue  
Task  
Notification

### 08 - States

Loading  
Skeleton  
Empty  
Error  
Success  
Disabled  
Focused  
Selected  
Expanded  
Collapsed  
Offline  
Permission  
Refreshing

---

# Then the four apps become compositions

### Consumer

```text
Home
├── Restaurant Widget
├── Order Widget
├── Deals Widget
├── Nearby Widget
└── Service Widget
```

### Merchant

```text
Workspace
├── Logistics Widget
├── Orders Widget
├── Revenue Widget
├── Booking Widget
└── Action Widget
```

### Host

```text
Workspace
├── Property Widget
├── Reservation Widget
├── Housekeeping Widget
├── Maintenance Widget
└── Revenue Widget
```

### Rider

```text
Workspace
├── Active Delivery Widget
├── Upcoming Delivery Widget
├── Earnings Widget
├── Incentive Widget
└── Route Widget
```

Same components.

Different compositions.

---

## One thing I'd add to `design.md`

A new principle:

> **NEXG components must be composable before they are specialized.**

Meaning we don't create:

`MerchantOrderCard`

`RiderOrderCard`

`ConsumerOrderCard`

if they're fundamentally the same thing.

Instead:

```text
OrderCard
    +
context
    +
state
    +
permissions
    +
actions
```

produces the appropriate experience.

That's how we get **one NEXG system instead of four applications that merely happen to share colors**.

And with the progressive blur, shared motion, widget expansion, monochrome iconography, and common state system, the apps should feel like **four products belonging to one operating system**.

---

**Sources:**

- [Guides: Overview - Expo Documentation](https://docs.expo.dev/guides/overview/?utm_source=chatgpt.com)

## Prompt:
8/9/2026, 6:37:18 AM

I don’t see a date picker 
Location, login screens??? Or do those  within

## Response:
8/9/2026, 6:37:23 AM

You're right. **Date picker, location, login, onboarding, permissions, maps, authentication, etc. absolutely need to be in the library.** I was grouping too aggressively.

For NEXG, I would actually distinguish between **Components** and **Flows/Scenes**. A login screen isn't just a component; it's a reusable composition of many components.

## NEXG Design Library — revised architecture

```text
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
```

### So, to your question: **yes and no.**

A **Date Picker** is a component.

A **Login Screen** is a composition/scene made from components:

```text
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
```

Likewise:

```text
Location Permission Screen
│
├── Illustration
├── Location Icon
├── Explanation
├── Primary Button
├── Not Now
└── Permission State
```

And:

```text
Date Booking Flow
│
├── Calendar
├── Date Range Picker
├── Availability
├── Time Picker
├── Guest Selector
├── Price Summary
└── Continue
```

So **we collect the individual pieces once**, then compose them into reusable scenes.

---

# This changes the 300–600 target

I'd now define the goal as:

### **300–600+ reusable component variants**
**PLUS**
### **50–100+ reusable flows/scenes**

That's much stronger.

For example, we could have:

**Component**

`NexGDatePicker`

with:

- Light
- Dark
- Mobile
- Desktop
- Compact
- Expanded
- Range
- Disabled dates
- Selected
- Loading
- Error

Then the **same DatePicker** appears in:

- Consumer booking
- Merchant scheduling
- Host reservations
- Rider availability
- Admin filtering
- Analytics date ranges

We don't build six date pickers.

---

# And I'd add one more category: System States

This is particularly important for NEXG.

Every major screen should have predefined states:

```text
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
```

For example, the **Location system** isn't just a location picker:

```text
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
```

That level of completeness is what will make the NEXG system genuinely reusable rather than just a collection of pretty UI components.

**So our collection target should be:**

> **One NEXG Design System → 300–600+ component variants → 50–100+ reusable scenes → all four apps assembled from the same primitives.**

And **progressive blur, monochrome iconography, dark/light themes, motion, widget expansion and the Attention → Direction → Memory → Action principles become system-level rules**, rather than things we have to remember when designing each individual app.

## Prompt:
8/9/2026, 6:40:08 AM

States and widgets

## Response:
8/9/2026, 6:40:11 AM

Yes — **States and Widgets should be first-class categories**, not buried under generic components.

For NEXG, I would make them two of the most important layers because your entire product philosophy depends on **live, expandable, state-aware workspaces**.

# NEXG DESIGN SYSTEM

```text
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
```

---

# 15 — WIDGETS

A widget is **not a card**.

A card displays information.

A NEXG widget can **display, update, expand, interact, execute actions, and change state**.

Every widget should therefore have a standardized lifecycle.

```text
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
```

And widgets can be:

- Static
- Interactive
- Live
- Actionable
- Personalized
- Reorderable
- Pinnable
- Expandable

---

## Universal NEXG Widgets

### Operational

```text
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
```

### Commerce

```text
Cart Widget
Payment Widget
Revenue Widget
Sales Widget
Transaction Widget
Invoice Widget
Settlement Widget
```

### People

```text
Customer Widget
Guest Widget
Merchant Widget
Rider Widget
Employee Widget
Team Widget
```

### Property

```text
Property Widget
Room Widget
Occupancy Widget
Housekeeping Widget
Maintenance Widget
Availability Widget
```

### Discovery

```text
Restaurant Widget
Product Widget
Service Widget
Experience Widget
Offer Widget
Recommendation Widget
Nearby Widget
```

### Logistics

```text
Live Delivery Widget
Map Widget
Route Widget
ETA Widget
Driver Widget
Vehicle Widget
Pickup Widget
Drop-off Widget
```

### Intelligence

```text
Insight Widget
Alert Widget
Recommendation Widget
AI Assistant Widget
Forecast Widget
Anomaly Widget
Performance Widget
```

---

# The important part: Widget Anatomy

Every NEXG widget should follow a common structure.

```text
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
```

But depending on state, that same widget can transform.

### Compact

```text
┌──────────────────────────┐
│ 🚚 Deliveries       3    │
│ 1 requires attention     │
└──────────────────────────┘
```

### Expanded

```text
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
```

### Focused

The widget becomes the workspace.

Everything else fades behind it.

---

# 16 — STATES

This needs to be a **system-wide state vocabulary**.

Rather than every developer inventing their own loading/error/empty behavior, NEXG defines them once.

## Core states

```text
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
```

---

# Interaction States

Every interactive component can also have:

```text
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
```

For mobile, **Hover** isn't relevant in the same way, so the system can adapt by platform.

---

# Widget States

Widgets get an additional layer:

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

This is important because:

**Component state ≠ Widget state.**

For example:

```text
Order Widget
    ↓
Expanded
    ↓
Order Button
    ↓
Loading
```

The widget is expanded while the button is loading.

---

# Data States

We also need to distinguish what the system knows.

```text
No Data

Partial Data

Fresh Data

Stale Data

Updating

Synced

Sync Failed

Offline Data
```

This is particularly important for:

- Orders
- Maps
- Rider tracking
- Revenue
- Reservations
- Inventory
- Analytics

A merchant shouldn't mistake **"no data"** for **"data hasn't loaded yet."**

---

# Permission States

Especially important for mobile.

```text
Not Requested
Requesting
Granted
Denied
Restricted
Permanently Denied
Unavailable
```

For:

- Location
- Camera
- Photos
- Notifications
- Microphone
- Bluetooth
- Contacts

---

# Network States

NEXG should explicitly design for:

```text
Online
Slow
Offline
Reconnecting
Syncing
Sync Failed
```

For example:

```text
You're offline

Your last data was updated
3 minutes ago.

[Retry]
```

Instead of a generic:

> Something went wrong.

---

# Payment States

This deserves its own state model.

```text
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
```

Then every payment component across Consumer, Merchant, Host and Admin speaks the same language.

---

# Order States

Same principle:

```text
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
```

These become **system enums**, not merely visual labels.

That means the UI, backend and analytics can share the same conceptual model.

---

# The really powerful part

We can combine:

**Widget + State + Context**

to produce the interface.

For example:

```text
Delivery Widget

Context:
Rider

State:
In Transit

Mode:
Focused

Network:
Online
```

produces one experience.

While:

```text
Delivery Widget

Context:
Consumer

State:
In Transit

Mode:
Compact

Network:
Offline
```

produces a completely different experience.

**Same underlying design system.**

---

# This gives us the NEXG formula

```text
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
```

So we don't build:

> Consumer Delivery Card

> Rider Delivery Card

> Merchant Delivery Card

> Host Delivery Card

We build:

> **Delivery Widget**

and let the **role + context + state** determine how it behaves.

That is exactly how I'd scale NEXG across the Consumer, Merchant, Host, Rider, Admin and Monitoring products without creating six disconnected design systems.

## Prompt:
8/9/2026, 6:41:24 AM

Now fir the five phase build plan 

Let’s outline it and start w phase 1

## Response:
8/9/2026, 6:41:25 AM

> **Remembering**
>
>
> **Reviewed NEXG phases, Expo decisions, variants, and build sequence**
>
> 
>
> Worked for 4s

Yes. Now that we've established **components + widgets + states + scenes**, I would structure the NEXG build into **five phases**.

The important thing is that we **do not start building the four apps immediately**. We first create the reusable foundation, then prove it, then assemble the products.

# NEXG Five-Phase Build Plan

```text
PHASE 1
DISCOVER + COLLECT
        ↓
PHASE 2
NORMALIZE + DEFINE
        ↓
PHASE 3
BUILD THE NEXG SYSTEM
        ↓
PHASE 4
COMPOSE THE APPS
        ↓
PHASE 5
POLISH + SCALE
```

---

# PHASE 1 - COLLECT

### Goal

Build the **raw NEXG component inventory** from existing libraries.

We are **not designing from scratch**.

We are finding the best existing building blocks and collecting them into one organized system.

### Target

**300-600+ component variants**

plus

**50-100+ reusable scenes/flows**

plus

**a complete widget and state catalogue.**

---

## Phase 1A - Define the taxonomy

We establish the master structure:

```text
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
15 Widgets
16 States
17 Scenes / Flows
```

This becomes the **filing system** for everything we collect.

---

# Phase 1B - Library Archaeology

We search existing ecosystems for components we like.

The objective isn't:

> "Find a library."

It's:

> **"Find the best implementation of every component we need."**

We evaluate things such as:

- visual quality
- interaction quality
- accessibility
- mobile compatibility
- dark mode
- responsiveness
- customization
- animation
- licensing
- Expo/React Native compatibility
- TypeScript support
- maintainability

---

# Phase 1C - Build the Component Vault

Every component gets recorded.

For example:

```text
COMPONENT
──────────────
Date Picker

Source
React Native library

Variants
✓ Single date
✓ Range
✓ Dark
✓ Disabled
✓ Loading
✓ Compact
✓ Expanded

Platform
Mobile

License
Approved

NEXG Status
Candidate
```

We're essentially creating a **catalogue of building blocks**.

---

# Phase 1D - Collect the missing pieces

This is where we make sure we don't repeat the mistake of forgetting things like:

- Date picker
- Location picker
- Login
- OTP
- Password
- Permissions
- Maps
- Address search
- Calendar
- Time picker
- Payment
- Checkout
- Chat
- Notifications
- Offline states
- Empty states
- Error states
- Loading states

These aren't optional extras.

They're part of the system.

---

# Phase 1E - Widget Inventory

We catalogue the widgets separately.

```text
CONSUMER

Restaurant
Product
Cart
Order
Recommendation
Promotion
Nearby
Service
Booking
```

```text
MERCHANT

Orders
Logistics
Bookings
Revenue
Payments
Inventory
Customers
Tasks
```

```text
HOST

Property
Reservation
Guest
Housekeeping
Maintenance
Revenue
Occupancy
```

```text
RIDER

Active Delivery
Upcoming Orders
Route
Earnings
Incentives
Performance
```

Then identify which widgets can share a common primitive.

---

# Phase 1F - State Inventory

We do the same thing with states.

```text
GLOBAL

Default
Loading
Empty
Error
Success
Warning
Disabled
Offline
Refreshing
Updating
```

Then:

```text
WIDGET

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
```

And domain states:

```text
ORDER
Created
Confirmed
Preparing
Ready
Assigned
Picked Up
In Transit
Delivered
Cancelled
```

```text
PAYMENT
Pending
Processing
Successful
Failed
Refunded
Disputed
```

This becomes the beginning of a **shared NEXG state vocabulary**.

---

# Phase 1G - Collect the Visual Language

This is where we capture the things you've already decided you like:

### Dark mode

### Monochrome iconography

Icons predominantly use the same whitish tone rather than every icon having its own color.

### Progressive blur

Top and bottom surfaces gradually transition from content into stronger blur.

### Food imagery

Food should be isolated from its original background where appropriate, sitting on a charcoal/dark food-card surface.

### iOS-like keyboard treatment

Dark keyboard:

```text
Dim black background
+
soft white lettering
+
grey key surfaces
```

### Motion

Soft spring-based expansion rather than hard page transitions.

### Widgets

Compact → Expanded → Focused.

All of these become **NEXG design-system requirements**, not individual screen decisions.

---

# Phase 1H - Collect the Scenes

Finally we catalogue complete screens/flows.

For example:

### Consumer

```text
First Launch
Login
OTP
Location
Home
Explore
Search
Restaurant
Product
Cart
Checkout
Payment
Live Order
Orders
Account
```

### Merchant

```text
Login
Onboarding
Workspace
Orders
Order Detail
Bookings
Revenue
Analytics
Settings
```

### Host

```text
Login
Property Setup
Workspace
Portfolio
Property
Reservation
Guest
Housekeeping
Maintenance
Revenue
```

### Rider

```text
Login
Verification
Home
Orders
Active Delivery
Navigation
Earnings
Profile
```

These aren't necessarily built yet.

We're **collecting references and defining requirements**.

---

# Phase 1 Deliverable

At the end of Phase 1 we should have something like:

```text
NEXG DESIGN SYSTEM
│
├── 500± Component Variants
│
├── 75± Scenes
│
├── 50± Widget Definitions
│
├── 100± State Definitions
│
├── Visual Reference Library
│
├── Component Sources
│
├── License Register
│
└── NEXG Taxonomy
```

Then-and only then-we move to:

# PHASE 2 - NORMALIZE

This is where the interesting work starts.

We take:

```text
Component A
Component B
Component C
```

and turn them into:

```text
NEXG Button
NEXG Card
NEXG DatePicker
NEXG Search
NEXG Sheet
NEXG Widget
NEXG Navigation
```

with one consistent:

- typography system
- spacing system
- radius system
- icon system
- color system
- dark/light system
- motion system
- blur system
- state system

---

## The five phases in full

| Phase | Purpose | Main output |
|---|---|---|
| **1. Collect** | Find and catalogue existing parts | Raw NEXG Component Vault |
| **2. Normalize** | Make everything visually/behaviorally consistent | NEXG Design Language |
| **3. Build** | Implement the reusable system in Expo | NEXG Component Library |
| **4. Compose** | Assemble the actual products | Consumer, Merchant, Host, Rider |
| **5. Polish & Scale** | Test, optimize, document and expand | Production NEXG Design System |

### Phase 1 is our current job.

And I would **not start by searching randomly for 500 components**.

We should build the **Phase 1 collection workspace first**: the taxonomy, component register, source register, variant matrix, widget register, state register, and scene register.

Then we systematically fill it.

That gives us a controlled way to reach the **300-600+ target without ending up with a giant pile of disconnected UI parts.**

## Prompt:
8/9/2026, 6:47:16 AM

Phase 2

## Response:
8/9/2026, 6:47:17 AM

# NEXG Design System — Phase 2
## NORMALIZE + DEFINE

Phase 1 gave us the **raw material**: existing components, widgets, states, scenes, references, and libraries.

Phase 2 answers:

> **What does an NEXG component actually mean, look like, and do?**

We now take hundreds of collected pieces and turn them into **one coherent NEXG language**.

---

# Phase 2 Architecture

```text
PHASE 1
RAW COMPONENT VAULT
        │
        ▼
┌──────────────────────────────┐
│ 01 DESIGN TOKENS             │
├──────────────────────────────┤
│ 02 TYPOGRAPHY                │
├──────────────────────────────┤
│ 03 COLOR                     │
├──────────────────────────────┤
│ 04 SPACING & GRID            │
├──────────────────────────────┤
│ 05 SHAPE & ELEVATION         │
├──────────────────────────────┤
│ 06 ICONOGRAPHY               │
├──────────────────────────────┤
│ 07 MOTION                    │
├──────────────────────────────┤
│ 08 BLUR & SURFACES           │
├──────────────────────────────┤
│ 09 COMPONENT CONTRACTS       │
├──────────────────────────────┤
│ 10 WIDGET CONTRACTS          │
├──────────────────────────────┤
│ 11 STATE SYSTEM              │
├──────────────────────────────┤
│ 12 RESPONSIVE RULES          │
└──────────────────────────────┘
        │
        ▼
NEXG DESIGN LANGUAGE
```

---

# 01 — NEXG DESIGN TOKENS

Nothing should be hard-coded into individual components.

We define the values centrally.

```text
NEXG TOKENS
│
├── Color
├── Typography
├── Spacing
├── Radius
├── Shadow
├── Blur
├── Opacity
├── Motion
├── Breakpoints
└── Z-index
```

So instead of:

```text
border-radius: 18px
```

we eventually have something conceptually like:

```text
radius.card
```

And if we change the NEXG radius system later, the entire ecosystem updates.

---

# 02 — TYPOGRAPHY

We define typography as a hierarchy, not individual font sizes.

```text
DISPLAY
Heading
Title
Subtitle

BODY
Body Large
Body
Body Small

LABEL
Label
Caption
Overline

DATA
Price
Metric
KPI
Timestamp
Status
```

Then define:

```text
Font
Weight
Size
Line height
Letter spacing
```

for each.

### Important

The Consumer app may use larger promotional typography.

The Merchant app may use denser operational typography.

But they still belong to the **same typography system**.

---

# 03 — COLOR

This is where your monochrome direction becomes a rule.

We shouldn't have:

```text
Orders = blue
Revenue = green
Bookings = purple
Delivery = orange
```

just because dashboards traditionally do that.

NEXG should have a restrained base language.

```text
LIGHT
Background
Surface
Elevated Surface
Text Primary
Text Secondary
Border
Accent
Success
Warning
Danger

DARK
Background
Surface
Elevated Surface
Text Primary
Text Secondary
Border
Accent
Success
Warning
Danger
```

And then define **semantic color**, not component-specific color.

For example:

```text
color.text.primary
color.text.secondary
color.surface.primary
color.status.success
color.status.warning
```

That keeps the system adaptable.

---

# 04 — SPACING + GRID

We establish a spacing scale.

Conceptually:

```text
4
8
12
16
20
24
32
40
48
64
```

Then components use the scale instead of arbitrary values.

This is essential for making four apps feel like one ecosystem.

---

# 05 — SHAPE + ELEVATION

We define the NEXG physical language.

### Radius

```text
XS
SM
MD
LG
XL
FULL
```

### Elevation

```text
Flat
Raised
Floating
Overlay
Modal
```

### Surfaces

```text
Background
Surface
Elevated
Floating
Glass
```

This is where the **dark charcoal food cards**, floating navigation, sheets and widgets become part of one surface system.

---

# 06 — ICONOGRAPHY

Your direction here is very clear:

> **Monochrome first.**

The icon system should have:

```text
Outline
Filled
Compact
Navigation
Action
Status
Domain
```

But the default NEXG treatment is a **single restrained whitish/neutral tone** in dark mode.

Icons shouldn't become a rainbow merely to communicate categories.

Color is reserved for **meaningful state** where necessary.

---

# 07 — MOTION SYSTEM

This is a major one for NEXG.

We define motion globally.

```text
Micro
Fast
Standard
Emphasized
Spring
```

And define what each means.

### Example

Button:

```text
Press
↓
micro animation
```

Widget:

```text
Compact
↓
spring
↓
Expanded
```

Sheet:

```text
Bottom
↓
spring
↓
Focused
```

Navigation:

```text
Minimal transition
```

The objective:

> **Everything moves as though it belongs to the same physical environment.**

---

# 08 — PROGRESSIVE BLUR SYSTEM

This becomes an actual NEXG primitive.

Not:

> "Add blur to this screen."

Instead:

```text
NexGGlass
NexGProgressiveBlur
NexGFloatingSurface
```

### Top

```text
CONTENT
   ↓
Low blur
   ↓
Medium blur
   ↓
High blur
   ↓
HEADER
```

### Bottom

```text
CONTENT
   ↓
Low blur
   ↓
Medium blur
   ↓
High blur
   ↓
NAVIGATION
```

This gives us the visual continuity you wanted for the mobile apps.

---

# 09 — COMPONENT CONTRACTS

This is one of the most important parts of Phase 2.

Every component gets a standardized contract.

For example:

## `NexGButton`

```text
Variants
├── Primary
├── Secondary
├── Tertiary
├── Destructive
└── Ghost

Sizes
├── Small
├── Medium
└── Large

States
├── Default
├── Pressed
├── Focused
├── Disabled
├── Loading
└── Success

Modes
├── Light
└── Dark
```

Same structure for every component.

---

# 10 — WIDGET CONTRACTS

Widgets get a much richer contract.

Every NEXG widget must define:

```text
Identity
Purpose
Context
Data
Actions
Priority
Size
States
Expansion
Persistence
Live behavior
Permissions
```

For example:

## Order Widget

```text
COMPACT
↓
EXPANDED
↓
FOCUSED
```

Actions:

```text
View
Accept
Reject
Contact
Dispatch
Cancel
```

Data:

```text
Order ID
Customer
Items
Amount
Status
Time
Location
Rider
```

---

# 11 — STATE SYSTEM

Phase 1 collected states.

Phase 2 turns them into a **formal state machine**.

For example:

```text
ORDER

Created
   ↓
Confirmed
   ↓
Preparing
   ↓
Ready
   ↓
Assigned
   ↓
Picked Up
   ↓
In Transit
   ↓
Delivered
   ↓
Completed
```

With alternative paths:

```text
Confirmed
   ↓
Cancelled
```

or:

```text
In Transit
   ↓
Failed
   ↓
Retry
```

Now the UI isn't inventing states.

It reflects the actual NEXG business model.

---

# 12 — RESPONSIVE RULES

Because we're using Expo for mobile but also have portals/web applications, Phase 2 needs a cross-platform rule set.

```text
PHONE
│
├── compact widgets
├── bottom navigation
├── sheets
└── focused workspaces

TABLET
│
├── larger widgets
├── split layouts
└── expanded workspace

DESKTOP
│
├── multi-column
├── side panels
├── persistent navigation
└── larger data surfaces
```

The **design language remains the same**.

The composition changes.

---

# Phase 2's Biggest Rule

## Do not normalize everything into sameness.

That's a mistake.

We want:

> **Consistency without uniformity.**

A Consumer restaurant card and a Host property card shouldn't look identical.

But they should feel like they were created by the same system.

---

# The NEXG Component Formula

At the end of Phase 2, every component should be expressible as:

```text
COMPONENT
+
VARIANT
+
STATE
+
CONTEXT
+
ROLE
+
PLATFORM
+
THEME
```

For example:

```text
Order Widget
+
Expanded
+
In Transit
+
Consumer
+
Customer
+
Mobile
+
Dark
```

↓

**NEXG Consumer Order Workspace**

Another:

```text
Order Widget
+
Compact
+
Ready
+
Merchant
+
Staff
+
Mobile
+
Dark
```

↓

**NEXG Merchant Logistics Widget**

Same system.

Different experience.

---

# Phase 2 Deliverables

At completion:

```text
NEXG DESIGN SYSTEM v0.1
│
├── Design Tokens
├── Typography System
├── Color System
├── Spacing System
├── Grid System
├── Radius System
├── Elevation System
├── Icon System
├── Motion System
├── Blur System
├── Component Contracts
├── Widget Contracts
├── State Machines
├── Responsive Rules
├── Accessibility Rules
└── Naming Convention
```

And importantly:

### **Nothing is coded into the apps yet.**

We're defining the **rules that the code will follow**.

---

# Phase 1 → Phase 2

The transformation is:

```text
500 random-ish candidates

        ↓

REMOVE DUPLICATES

        ↓

SELECT BEST IMPLEMENTATION

        ↓

NORMALIZE

        ↓

DEFINE TOKENS

        ↓

DEFINE STATES

        ↓

DEFINE BEHAVIOR

        ↓

DEFINE RESPONSIVENESS

        ↓

NEXG DESIGN LANGUAGE
```

Then **Phase 3** is where we finally take this specification and build the actual reusable **Expo/React Native NEXG component library**, including the widget engine, state system, progressive blur, navigation primitives, themes, animations, and documentation.

That is where the 300–600+ collected variants become **real reusable code** rather than just a reference library.

## Prompt:
8/9/2026, 6:47:49 AM

Phase 3

## Response:
8/9/2026, 6:47:51 AM

# NEXG Design System — Phase 3
## BUILD THE NEXG SYSTEM

Phase 1 **collected** the best existing parts.  
Phase 2 **normalized** them into one NEXG language.

Now we turn that specification into a **real reusable codebase**.

The goal is **not** to build the Consumer, Merchant, Host and Rider apps yet.

The goal is to build the **engine underneath all of them**.

---

# Phase 3 Architecture

```text
                    NEXG DESIGN SYSTEM
                           │
                    ┌──────┴──────┐
                    │             │
                FOUNDATION      ENGINE
                    │             │
          ┌─────────┼─────────┐   │
          │         │         │   │
        Tokens    Themes    Assets │
          │         │         │   │
          └─────────┼─────────┘   │
                    │             │
                    ▼             ▼
             COMPONENTS       WIDGET ENGINE
                    │             │
                    └──────┬──────┘
                           │
                    STATE ENGINE
                           │
                    MOTION ENGINE
                           │
                    NAVIGATION
                           │
                    ┌──────┴──────┐
                    │             │
                  MOBILE          WEB
                    │             │
                  EXPO          PORTALS
```

---

# 3.1 — Create the NEXG Monorepo

We should not create four separate codebases.

We create **one workspace**.

Conceptually:

```text
NEXG
│
├── apps
│   ├── consumer
│   ├── merchant
│   ├── host
│   └── rider
│
├── packages
│   ├── design-system
│   ├── components
│   ├── widgets
│   ├── navigation
│   ├── icons
│   ├── animations
│   ├── state
│   ├── tokens
│   └── utilities
│
└── docs
    └── design-system
```

The apps consume the packages.

They don't reinvent them.

---

# 3.2 — Expo Foundation

For mobile:

```text
Expo
+
React Native
+
TypeScript
+
Expo Router
```

The important architectural decision:

**Expo is the application platform.**

NEXG is the design/product layer above it.

So:

```text
Expo
 ↓
NEXG Runtime
 ↓
NEXG Design System
 ↓
NEXG Applications
```

---

# 3.3 — Design Tokens Become Code

Everything from Phase 2 becomes machine-readable.

For example:

```text
tokens
├── colors
├── typography
├── spacing
├── radius
├── elevation
├── opacity
├── motion
└── blur
```

Instead of every developer deciding:

> "I'll use 18px here."

The system decides.

```text
NEXG spacing
NEXG radius
NEXG typography
NEXG colors
```

This is what makes the system maintainable.

---

# 3.4 — Theme Engine

We need:

```text
Light
Dark
System
```

And potentially future themes.

Every component must automatically understand the theme.

For example:

```text
NexGCard
```

doesn't need:

```text
if dark mode...
```

scattered throughout the application.

The theme system handles it.

---

# 3.5 — Component Library

Now we implement the actual components.

Start with the primitives:

```text
Text
Icon
Image
Avatar
Badge
Divider
Status
```

Then:

```text
Button
Input
Search
Select
Toggle
Checkbox
Radio
Slider
```

Then:

```text
Card
Sheet
Modal
Drawer
Popover
Toast
```

Then:

```text
Calendar
DatePicker
TimePicker
LocationPicker
Map
```

Then:

```text
Order
Booking
Payment
Property
Guest
Rider
```

---

# 3.6 — The State System

This is where Phase 3 becomes significantly more sophisticated than a normal component library.

Every component should have standardized state handling.

Example:

```text
NexGButton

default
pressed
focused
disabled
loading
success
error
```

The state shouldn't be manually recreated every time.

We build reusable state primitives.

---

# 3.7 — Widget Engine

This is the **heart of the NEXG mobile experience**.

A widget isn't simply:

```text
<View />
```

It has a lifecycle.

```text
Widget
│
├── identity
├── data
├── state
├── size
├── priority
├── actions
├── permissions
├── expansion
├── persistence
└── live updates
```

---

# Widget State Machine

```text
                  ┌──────────┐
                  │  HIDDEN  │
                  └────┬─────┘
                       │
                       ▼
                  ┌──────────┐
                  │ COMPACT  │
                  └────┬─────┘
                       │
                  tap / expand
                       │
                       ▼
                  ┌──────────┐
                  │ EXPANDED │
                  └────┬─────┘
                       │
                 focus / expand
                       │
                       ▼
                  ┌──────────┐
                  │ FOCUSED  │
                  └────┬─────┘
                       │
                    dismiss
                       │
                       ▼
                  ┌──────────┐
                  │ COLLAPSED│
                  └──────────┘
```

---

# 3.8 — Fluid Widget Expansion

This is one of the places where we should spend serious effort.

We don't want:

```text
tap card
↓
navigate
↓
new screen
```

We want:

```text
compact widget
       ↓
      tap
       ↓
spring expansion
       ↓
focused workspace
```

The original widget should feel like it **became** the expanded workspace.

Not like we opened another page.

---

# 3.9 — Progressive Blur Engine

Now we implement the visual language you requested.

Create reusable primitives such as:

```text
NexGGlass
NexGBlur
NexGProgressiveBlur
NexGFloatingSurface
```

For example:

```text
<NexGProgressiveBlur
    position="bottom"
    intensity={80}
/>
```

The component handles the visual transition.

Applications don't need to manually construct it.

---

# 3.10 — Navigation System

We now build the reusable navigation primitives.

### Consumer

```text
Home
Explore
Orders
Account
```

### Merchant

```text
Workspace
Insights
Search
```

### Host

```text
Workspace
Portfolio
Search
```

### Rider

Potentially:

```text
Workspace
Orders
Profile
```

But the navigation architecture remains reusable.

The apps simply configure it.

---

# 3.11 — Universal Search

Create one reusable search architecture.

```text
NexGSearch
NexGCommand
NexGSearchResults
NexGSearchFilters
NexGRecentSearches
```

Then the search engine can eventually search:

```text
Orders
Merchants
Properties
Guests
Customers
Products
Bookings
Invoices
Documents
Settings
```

The UI doesn't need to know where the information originates.

---

# 3.12 — Motion System

We implement the motion rules from Phase 2.

```text
Micro
Fast
Standard
Spring
Emphasized
```

Then components use the system.

For example:

```text
Button
→ micro

Sheet
→ spring

Widget
→ spring + shared transition

Toast
→ fast

Navigation
→ subtle
```

The result should feel like one physical interface.

---

# 3.13 — Loading & Skeleton System

We build reusable loading behavior.

```text
NexGSkeleton
NexGSpinner
NexGProgress
NexGShimmer
NexGLoadingOverlay
```

But importantly:

**loading isn't just a spinner.**

A widget should preserve its structure while data loads.

```text
┌──────────────────────┐
│ Orders               │
│ █████████            │
│ ██████               │
│ ███████████          │
└──────────────────────┘
```

rather than:

> Loading...

---

# 3.14 — Empty / Error / Offline System

Every major surface gets standardized experiences.

### Empty

```text
No upcoming bookings

[Explore services]
```

### Error

```text
Something went wrong

[Try again]
```

### Offline

```text
You're offline

Showing your latest saved information.
```

### Permission

```text
Location access is needed

[Enable Location]
```

These become reusable patterns.

---

# 3.15 — Accessibility

This needs to be built into the components rather than added later.

Every component should consider:

- Dynamic text size
- Screen readers
- Touch targets
- Contrast
- Reduced motion
- Focus
- Keyboard navigation on web
- Semantic labels
- Haptic feedback where appropriate

So accessibility becomes a **property of the system**.

---

# 3.16 — Responsive Component Engine

The same component should understand:

```text
Phone
Large Phone
Tablet
Desktop
```

For example:

### Phone

```text
Bottom Sheet
```

### Tablet

```text
Side Sheet
```

### Desktop

```text
Side Panel
```

Same conceptual component.

Different presentation.

---

# 3.17 — Storybook / Component Laboratory

This is essential.

We need a place where we can see **every component and every state without opening the actual applications**.

Something like:

```text
NEXG COMPONENT LAB

Components
│
├── Button
│   ├── Default
│   ├── Loading
│   ├── Disabled
│   └── Success
│
├── Date Picker
│   ├── Default
│   ├── Range
│   ├── Dark
│   └── Disabled
│
├── Widget
│   ├── Compact
│   ├── Expanded
│   └── Focused
```

This is where we validate the design system.

---

# 3.18 — Build the NEXG Widget Playground

Even more important for your system.

Create a dedicated environment:

```text
NEXG WIDGET LAB
```

where we can select:

```text
Widget:
[ Logistics ]

State:
[ Live ]

Size:
[ Compact ]

Role:
[ Merchant ]

Theme:
[ Dark ]

Platform:
[ Mobile ]
```

and see the result instantly.

Then:

```text
[ Expand ]
```

and watch the widget transition into its expanded workspace.

This becomes our **test laboratory for the entire NEXG interaction model**.

---

# 3.19 — Component Variants

Now we can systematically reach the target.

Example:

```text
Button
×
6 variants
×
3 sizes
×
8 states
×
2 themes
```

The library quickly becomes hundreds of valid combinations without us manually creating hundreds of unrelated components.

---

# 3.20 — Documentation

Every component needs:

```text
Purpose
Usage
Variants
States
Properties
Accessibility
Motion
Responsive behavior
Examples
Do / Don't
```

For example:

### `NexGDatePicker`

```text
Purpose:
Select dates.

Supports:
Single
Range
Multiple

States:
Default
Selected
Disabled
Loading
Error

Platforms:
Mobile
Tablet
Web
```

---

# Phase 3 Deliverable

At the end:

```text
NEXG DESIGN SYSTEM v1
│
├── Tokens
├── Themes
├── Components
├── Widgets
├── State Engine
├── Motion Engine
├── Blur Engine
├── Navigation
├── Search
├── Accessibility
├── Responsive System
├── Component Lab
├── Widget Lab
└── Documentation
```

And now we have something extremely valuable:

### **The apps can finally be assembled.**

---

# The critical Phase 3 rule

We don't build application features yet.

If we need a restaurant card while building the Consumer app, we don't just make one.

We ask:

> **Does this belong in the NEXG design system?**

If yes → build it in the library.

If no → keep it application-specific.

This prevents the design system from deteriorating as the apps grow.

---

# Phase 1 → 2 → 3

```text
PHASE 1
COLLECT
500± candidates
        ↓
PHASE 2
NORMALIZE
One NEXG language
        ↓
PHASE 3
BUILD
Real reusable code
        ↓
              ┌───────────────┐
              │ NEXG SYSTEM   │
              │               │
              │ Components    │
              │ Widgets       │
              │ States        │
              │ Motion        │
              │ Blur          │
              │ Navigation    │
              │ Themes        │
              └───────┬───────┘
                      ↓
                 PHASE 4
              COMPOSE APPS
```

## Phase 4

This is where we finally take the finished system and build the actual **Consumer → Merchant → Host → Rider** applications, with each app getting its own information architecture while sharing the same NEXG components, widgets, states, motion, blur, navigation primitives, and design language.

**Phase 3 is therefore the point where NEXG stops being a design specification and becomes an actual reusable software platform.**

## Prompt:
8/9/2026, 6:48:46 AM

Phase 4

## Response:
8/9/2026, 6:48:47 AM

# NEXG Design System — Phase 4
# COMPOSE THE APPS

Phase 1 **collected**.  
Phase 2 **normalized**.  
Phase 3 **built the reusable system**.

Now we use that system to build the actual NEXG products.

The key principle:

> **We do not design four apps independently. We compose four different experiences from one NEXG operating system.**

---

# Phase 4 Architecture

```text
                    NEXG SYSTEM
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       COMPONENTS     WIDGETS         STATES
          │              │              │
          └──────────────┼──────────────┘
                         │
                 EXPERIENCE LAYER
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
   CONSUMER           MERCHANT           HOST
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                       RIDER
                         │
                         ▼
                  NEXG ECOSYSTEM
```

---

# 4.1 — Consumer App

The Consumer app is the **discovery and transaction environment**.

Its architecture:

```text id="4f9z1r"
CONSUMER
│
├── Home
├── Explore
├── Search
├── Orders
└── Account
```

But the Home screen isn't a static dashboard.

It's the **consumer's living feed**.

---

## Home

```text id="w9h9h1"
Location

Good morning

Search

Continue where you left off

Nearby

Recommended

Popular

Services

Offers

Experiences
```

Widgets dynamically change based on:

- location
- time
- previous behavior
- active orders
- availability
- preferences
- promotions

---

# Explore

```text id="v1fz6w"
Explore

Food
Groceries
Pharmacy
Laundry
Beauty
Transport
Experiences
Hotels
Events
```

Then:

```text id="m5f5n0"
Trending
Nearby
Highest Rated
Fastest
New
Recommended
```

---

# Search

Universal search:

```text id="d4h7pd"
Search NEXG

Restaurants
Products
Services
Experiences
Bookings
Orders
Addresses
```

---

# Orders

```text id="d3j2n1"
Active
Upcoming
Completed
Cancelled
```

Orders become **live widgets**, not just historical rows.

---

# Account

```text id="d4u1xc"
Profile
Wallet
Payments
Addresses
Favorites
Loyalty
Notifications
Support
Settings
```

---

# 4.2 — Merchant App

Merchant is an **operational workspace**.

The merchant doesn't need to explore.

They need to know:

> **What needs my attention?**

---

# Merchant Workspace

```text id="5hr5n9"
Good morning

LIVE

Orders
2 require attention

Bookings
4 today

Revenue
KSh 14,500

Tasks
3 outstanding
```

Then operational widgets:

```text id="7w2l55"
Logistics

Orders

Bookings

Customers

Revenue

Tasks

Inventory
```

---

# Merchant navigation

Keep it minimal:

```text id="4t4lca"
Workspace

Insights

Search
```

Profile/settings can live inside the account/control surface rather than consuming a permanent navigation slot.

---

# 4.3 — Host App

Host is a **property operating system**.

Primary entity:

> Property

---

# Host Workspace

```text id="3lq3t7"
Portfolio Health

18 Properties

15 Occupied
2 Check-in Today
1 Requires Attention
```

Then:

```text id="f2v9d3"
Today's Arrivals

Housekeeping

Maintenance

Guest Messages

Revenue
```

---

# Portfolio

The portfolio becomes spatial.

```text id="7yqj8s"
Riverside Apartments

101 🟢
102 🔴
103 🟡

104 🟢
105 🟢
106 ⚪
```

Tap a property:

```text id="qf6o0d"
Property Workspace
```

No traditional navigation maze.

---

# Host navigation

```text id="w4x8h2"
Workspace

Portfolio

Search
```

---

# 4.4 — Rider App

Rider is different again.

The rider's primary concern is:

> **What am I doing next?**

---

# Rider Workspace

```text id="6o2m1d"
GOOD MORNING

You're Online

Current Earnings
KSh 1,850

Next Delivery
12 min
```

Main widget:

```text id="x5r8l4"
ACTIVE DELIVERY

Restaurant
        ↓
Pickup
        ↓
Customer

ETA 18 min

[Navigate]
```

---

# Rider Orders

```text id="0w5f2r"
Upcoming
Completed
Cancelled
```

The **Active Delivery widget** gets priority over everything else.

---

# Rider Profile

```text id="8x7l3p"
Profile

Earnings
Performance
Documents
Vehicle
Availability
Support
Settings
```

---

# 4.5 — Shared App Shell

Although the four apps have different navigation models, they share the same underlying shell.

```text id="2z4y8h"
NEXG APP SHELL
│
├── Status / Safe Area
├── Progressive Header
├── Workspace
├── Floating Surfaces
├── Progressive Bottom Blur
├── Navigation
└── Global Overlays
```

This is where the visual consistency becomes extremely powerful.

---

# 4.6 — Shared Widget Vocabulary

The apps can use the same underlying widgets.

For example:

### Order

Consumer:

> Track my order.

Merchant:

> Prepare this order.

Rider:

> Deliver this order.

Admin:

> Monitor this order.

Same entity.

Different context.

---

# 4.7 — Role-Aware Widgets

This is one of the most important architectural decisions.

Instead of:

```text
ConsumerOrderWidget
MerchantOrderWidget
RiderOrderWidget
```

we have:

```text
NexGOrderWidget
```

and give it:

```text id="b0l5v9"
role
context
permissions
state
mode
```

So:

```text
Consumer + In Transit
```

might display:

```text
ETA
Map
Driver
Contact
```

while:

```text
Merchant + Ready
```

displays:

```text
Rider
Pickup time
Dispatch
Customer
```

and:

```text
Rider + Assigned
```

displays:

```text
Pickup
Navigation
Customer
Earnings
```

---

# 4.8 — Shared Entity Model

This is where the apps become truly connected.

Core entities:

```text id="x6q0kh"
User
Customer
Merchant
Host
Property
Rider
Order
Booking
Product
Service
Payment
Vehicle
Task
Location
Message
Document
```

The same entity can appear in different apps.

---

# 4.9 — Universal Entity Workspace

When you open an entity, NEXG should understand the context.

For example:

```text id="tq9e9j"
ORDER #12345
```

Consumer:

```text
Track
Contact
Receipt
Support
```

Merchant:

```text
Prepare
Dispatch
Customer
Payment
```

Rider:

```text
Navigate
Pickup
Contact
Complete
```

Admin:

```text
Monitor
Audit
Override
Investigate
```

Same order.

Different permissions and actions.

---

# 4.10 — Shared Search

Every app gets the same search architecture.

But its search scope changes.

### Consumer

```text
Restaurants
Products
Services
Orders
```

### Merchant

```text
Orders
Customers
Products
Bookings
```

### Host

```text
Properties
Guests
Bookings
Maintenance
```

### Rider

```text
Orders
Customers
Addresses
```

The underlying search system remains reusable.

---

# 4.11 — Shared State System

Every app consumes the same state vocabulary.

For example:

```text
Loading
Empty
Error
Offline
Success
Updating
Refreshing
```

And domain states:

```text
Order
Booking
Payment
Delivery
Property
```

This means a user doesn't encounter completely different behavior in different NEXG apps.

---

# 4.12 — Shared Motion

This becomes especially important.

The Consumer app might have:

```text
Restaurant Card
↓
Restaurant Workspace
```

The Merchant:

```text
Order Widget
↓
Order Workspace
```

The Host:

```text
Property Widget
↓
Property Workspace
```

The Rider:

```text
Delivery Widget
↓
Delivery Workspace
```

All expand using the same **NEXG motion language**.

---

# 4.13 — Shared Progressive Blur

Every app gets:

```text
NexGProgressiveHeader
NexGProgressiveBottomBar
NexGGlass
NexGFloatingSurface
```

So:

```text
Consumer
Merchant
Host
Rider
```

all have the same environmental depth.

But the actual navigation/content remains app-specific.

---

# 4.14 — App-Specific Identity

This is important.

We **do not** make the four apps clones.

They share:

- components
- typography
- tokens
- motion
- blur
- states
- widgets
- accessibility

But they have different:

- priorities
- information architecture
- workflows
- navigation
- widget ordering
- terminology
- actions

That's the difference between a **design system** and a **template**.

---

# 4.15 — Build Order

I would build the actual products in this order:

### 1. Consumer

Because it establishes the customer-facing transaction ecosystem.

↓

### 2. Merchant

Because it powers the supply side.

↓

### 3. Rider

Because delivery workflows depend heavily on orders.

↓

### 4. Host

Because property/hospitality workflows can then integrate with the same booking/customer/payment infrastructure.

However, some Host functionality should be developed in parallel if property operations are part of the initial launch.

---

# 4.16 — Then the Web Portals

Once the mobile apps establish the interaction patterns:

```text
Merchant App
       ↓
Merchant Portal

Host App
       ↓
Host Portal

Admin App
       ↓
Admin Portal

Monitoring
       ↓
Monitoring Portal
```

The web interfaces reuse the same NEXG components but adapt their composition for desktop.

For example:

```text
Mobile
Widget → Sheet

Tablet
Widget → Expanded Panel

Desktop
Widget → Side Panel / Workspace
```

Same conceptual interaction.

---

# Phase 4 Deliverable

At the end:

```text id="n2g1cg"
NEXG ECOSYSTEM
│
├── Consumer App
├── Merchant App
├── Rider App
├── Host App
│
├── Merchant Portal
├── Host Portal
├── Admin Portal
└── Monitoring Portal
```

All powered by:

```text id="e7y3z9"
NEXG DESIGN SYSTEM
│
├── Components
├── Widgets
├── States
├── Entities
├── Motion
├── Blur
├── Navigation
├── Themes
└── Accessibility
```

---

# The critical Phase 4 rule

**Do not allow app-specific hacks to leak into the shared system.**

If something is truly universal:

> Put it in NEXG.

If something is specific to a product:

> Keep it inside that product.

For example:

**NEXG**

```text
DatePicker
Order
Booking
Widget
Sheet
ProgressiveBlur
Navigation
```

**Consumer**

```text
Restaurant Discovery Feed
Recommendation Algorithm UI
Cart Experience
```

**Merchant**

```text
Kitchen Queue
Merchant Fulfillment Workspace
```

**Host**

```text
Portfolio Canvas
Housekeeping Operations
```

**Rider**

```text
Active Delivery Workflow
Navigation/Delivery Mode
```

That boundary is what keeps the system healthy.

---

# Phase 1 → 4

```text
PHASE 1
COLLECT
        ↓
PHASE 2
NORMALIZE
        ↓
PHASE 3
BUILD THE SYSTEM
        ↓
PHASE 4
COMPOSE THE PRODUCTS
        ↓
┌─────────────────────────────────┐
│                                 │
│       NEXG ECOSYSTEM            │
│                                 │
│ Consumer  Merchant  Host Rider  │
│                                 │
│ Portals + Admin + Monitoring    │
│                                 │
└─────────────────────────────────┘
        ↓
PHASE 5
POLISH + SCALE
```

And **Phase 5 is not simply "make it pretty."** It is where we test the entire ecosystem under real usage: accessibility, performance, animations, offline behavior, responsive layouts, consistency, analytics, crash handling, design-system governance, component versioning, and eventually the rules for safely adding new NEXG verticals without breaking the existing apps.

## Prompt:
8/9/2026, 6:49:16 AM

Phase 5

## Response:
8/9/2026, 6:49:17 AM

# NEXG Design System — Phase 5
# POLISH + SCALE

This is the final phase of the five-phase build.

But it's important to understand what **Phase 5 actually means**.

We are no longer asking:

> "Can we build the screen?"

We're asking:

> **"Can this become a reliable design and interaction system that NEXG can use for years, across every product, role, device and future vertical?"**

Phase 5 turns the system from **working software** into a **governed product platform**.

---

# PHASE 5 ARCHITECTURE

```text
                    NEXG ECOSYSTEM
                          │
                          ▼
                 ┌─────────────────┐
                 │   REAL USERS     │
                 └────────┬────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
          Consumer     Merchant      Host
              │           │           │
              └───────────┼───────────┘
                          ▼
                       Rider
                          │
                          ▼
                 OBSERVABILITY
                          │
                          ▼
                  QUALITY SYSTEM
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
      UX QUALITY      TECH QUALITY     BUSINESS QUALITY
          │               │                │
          └───────────────┼────────────────┘
                          ▼
                  NEXG GOVERNANCE
                          │
                          ▼
                   SCALE + EVOLVE
```

---

# 5.1 — Visual QA

Every screen gets tested against the NEXG system.

We check:

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

But also:

```text
Dark mode
Light mode
Small phone
Large phone
Tablet
Desktop
```

The goal is to eliminate:

> "This screen feels slightly different."

---

# 5.2 — Interaction QA

We test actual behavior.

For example:

### Widget

```text
Compact
   ↓
Tap
   ↓
Expansion
   ↓
Focused
   ↓
Action
   ↓
Success
   ↓
Collapse
```

We verify:

- animation
- gesture
- state transition
- data persistence
- dismissal
- accessibility
- back behavior
- interrupted animation

The interface should feel **predictable**.

---

# 5.3 — Attention → Direction → Memory → Action

Now we explicitly validate the principles you started with.

Every major interaction gets evaluated through the four laws.

### Attention

> Does the interface immediately show what matters?

### Direction

> Does the interface guide the eye toward the correct next action?

### Memory

> Does the user understand the system without having to relearn it?

### Action

> Can the user complete the task quickly and confidently?

Then the supporting laws:

### Jakob's Law

Use familiar interaction patterns where familiarity helps.

### Hick's Law

Reduce unnecessary choices.

### Fitts's Law

Make important actions easy to hit.

### Miller's Law

Avoid overwhelming working memory.

### Tesler's Law

**The complexity that cannot be removed must be handled by the system rather than pushed onto the user.**

That last one becomes especially important in NEXG because the underlying platform is extremely complex.

---

# 5.4 — Performance

Now we optimize the actual system.

Measure:

```text
Startup time
Screen transition time
Widget expansion
Animation FPS
Memory usage
Network usage
Image loading
Map rendering
List performance
Battery impact
```

Especially:

### Home screen

Because your Home/Workspace is effectively the operating surface of each app.

We don't want 30 widgets causing:

> slow startup → delayed content → bad experience.

---

# 5.5 — Widget Performance

Widgets need intelligent loading.

Instead of loading everything simultaneously:

```text
Home
│
├── Priority widgets
│      ↓
│   load first
│
├── Secondary widgets
│      ↓
│   load next
│
└── Below-the-fold
       ↓
     defer
```

The user sees useful information immediately.

---

# 5.6 — Progressive Data

Widgets should also understand:

```text
Fresh
Stale
Updating
Offline
Unavailable
```

For example:

```text
REVENUE

KSh 14,500
Updated 2 min ago
```

Then:

```text
Updating...
```

rather than freezing the whole screen.

---

# 5.7 — Offline Experience

NEXG should be designed for imperfect connectivity from the beginning.

```text
ONLINE
   ↓
NETWORK DEGRADES
   ↓
SLOW
   ↓
OFFLINE
   ↓
RECONNECTING
   ↓
SYNCING
   ↓
ONLINE
```

The UI should communicate this without constantly interrupting the user.

---

# 5.8 — Accessibility Audit

Every component goes through accessibility validation.

Check:

```text
Screen reader
Dynamic text
Contrast
Touch target
Focus
Keyboard
Reduced motion
Voice interaction
Semantic labels
Error communication
```

This applies to the entire component library, not just individual screens.

---

# 5.9 — Device Matrix

We test across:

```text
Small phone
Standard phone
Large phone
Tablet
Desktop
```

and:

```text
Light
Dark
System
```

Then:

```text
Online
Slow network
Offline
```

And:

```text
Low-end device
Mid-range device
High-end device
```

This prevents the system from only looking good on the developer's device.

---

# 5.10 — Motion Audit

We go through every animation.

Ask:

> Does this animation communicate something?

If not:

**remove it.**

NEXG shouldn't be animated merely because animation is possible.

The motion system should communicate:

```text
Hierarchy
Continuity
Cause → effect
State change
Focus
Feedback
```

---

# 5.11 — Blur Audit

Progressive blur is a visual signature, but it must not become decoration everywhere.

We establish rules:

```text
Header
✓ Progressive blur

Floating navigation
✓ Progressive blur

Floating action surfaces
✓ Possible glass

Primary content
✗ Don't blur unnecessarily

Critical information
✗ Don't compromise readability
```

The blur system becomes purposeful.

---

# 5.12 — Design-System Governance

This is where we prevent the system from slowly becoming messy.

Every new component has to answer:

```text
Does this already exist?

Can an existing component solve this?

Is this genuinely new?

Does it belong globally or to one app?

Does it introduce a new state?

Does it require a new token?
```

---

# 5.13 — Component Versioning

Components evolve.

For example:

```text
NexGButton v1
```

becomes:

```text
NexGButton v2
```

without randomly breaking existing applications.

We establish:

```text
Stable
Experimental
Deprecated
Removed
```

states for components.

---

# 5.14 — Component Deprecation

If we discover:

```text
NexGCardOld
```

should no longer be used:

```text
DEPRECATED
      ↓
Migration guide
      ↓
Replacement
      ↓
Remove
```

This prevents the codebase from accumulating obsolete components forever.

---

# 5.15 — Design Tokens Governance

The same applies to tokens.

We don't want:

```text
grey-1
grey-2
dark-grey
dark-grey-new
dark-grey-final
dark-grey-final-2
```

Instead:

```text
semantic.surface.primary
semantic.surface.secondary
semantic.text.primary
semantic.text.secondary
```

Tokens should communicate **purpose**, not arbitrary appearance.

---

# 5.16 — Analytics

Now we connect interface behavior with actual usage.

Measure things like:

```text
Time to first action
Time to complete task
Widget expansion rate
Widget dismissal rate
Search usage
Navigation usage
Checkout abandonment
Order completion
Booking completion
Error rate
```

We can discover:

> "Merchants rarely use this navigation item."

or:

> "Riders always expand this widget."

Then the design system can evolve based on evidence.

---

# 5.17 — UX Experimentation

The system becomes testable.

For example:

### Version A

```text
Orders
```

### Version B

```text
2 Orders Need Attention
```

We can measure which communicates urgency better.

But experiments should not destroy consistency.

The design system provides **guardrails**.

---

# 5.18 — Error Monitoring

Every major interaction needs observable failures.

For example:

```text
Widget failed to load
Payment failed
Map failed
Location unavailable
Order sync failed
Booking update failed
```

We want to know:

```text
WHAT
WHERE
WHEN
WHO
HOW OFTEN
```

without exposing sensitive information.

---

# 5.19 — Security UX

Security should also be part of the experience.

Examples:

```text
Session expired
MFA required
Permission denied
Payment verification
Suspicious activity
Account locked
```

These should use familiar NEXG patterns rather than completely different security screens.

---

# 5.20 — Cross-App Consistency Audit

This is one of the most important final tests.

Take the same entity:

```text
ORDER
```

and inspect it across:

```text
Consumer
Merchant
Rider
Admin
```

Ask:

> Does it still feel like the same NEXG entity?

Then:

```text
PROPERTY
```

across:

```text
Host
Guest
Admin
```

Same entity.

Different perspective.

---

# 5.21 — Design System Stress Test

Now we deliberately try to break it.

Add:

```text
New merchant category
New service
New property type
New payment method
New delivery type
New country
New language
New device
New workflow
```

If adding these requires rebuilding the interface from scratch:

**the system failed.**

If we can compose them from existing primitives:

**the system succeeded.**

---

# 5.22 — New Vertical Test

This is the ultimate test.

Imagine NEXG later adds:

```text
Healthcare
Education
Events
Automotive
Professional Services
Travel
```

We shouldn't immediately create another design system.

We should ask:

```text
Can the existing NEXG system support it?
```

If yes:

**compose.**

If not:

**extend the system deliberately.**

---

# 5.23 — Documentation

The final system needs documentation for humans and AI.

This is particularly useful for the way you're building NEXG.

Documentation should describe:

```text
Component
Purpose
When to use
When NOT to use
Variants
States
Tokens
Interactions
Accessibility
Responsive behavior
Examples
Dependencies
```

And:

```text
Widget
Entity
State machine
Permissions
Actions
Expansion behavior
Data requirements
```

So eventually you can give an AI:

> "Build a merchant order workspace."

and the system can understand:

```text
Use:
NexGOrderWidget
Merchant context
Ready state
Focused workspace
NEXG navigation
NEXG motion
NEXG dark theme
```

instead of inventing something new.

---

# 5.24 — The NEXG Design Constitution

At this stage I would create one final document:

# `NEXG_DESIGN_CONSTITUTION.md`

It contains the non-negotiable principles.

For example:

```text
1. Context before navigation.

2. Attention before decoration.

3. Important actions require minimal friction.

4. Complexity belongs to the system whenever possible.

5. Components are reusable; experiences are contextual.

6. Widgets are living surfaces, not static cards.

7. States are designed, not accidental.

8. Motion communicates continuity and consequence.

9. Blur supports hierarchy; it does not obscure information.

10. Color communicates meaning, not decoration.

11. Familiar patterns should remain familiar unless
    there is a measurable reason to change them.

12. The same entity should feel like the same entity
    across every NEXG product.

13. Accessibility is a system property.

14. Offline and failure states are first-class experiences.

15. New features must extend the system before
    creating parallel patterns.
```

---

# 5.25 — Final NEXG Architecture

At the end of all five phases:

```text
                         NEXG
                          │
              ┌───────────┴───────────┐
              │                       │
         DESIGN SYSTEM            EXPERIENCE
              │                       │
      ┌───────┼────────┐       ┌──────┼──────┐
      │       │        │       │      │      │
   Tokens Components Widgets Consumer Merchant Host
              │        │                       │
              │      States                  Rider
              │        │
              └────┬───┘
                   │
              Motion / Blur
                   │
              Navigation
                   │
             Accessibility
                   │
             Documentation
                   │
             Governance
                   │
             Analytics
                   │
             Continuous Evolution
```

---

# The Complete Five-Phase Journey

| Phase | Name | What happens |
|---|---|---|
| **1** | **Collect** | Find and catalogue existing components, widgets, states and scenes |
| **2** | **Normalize** | Create one NEXG visual, behavioral and structural language |
| **3** | **Build** | Turn the system into reusable Expo/React Native code |
| **4** | **Compose** | Build Consumer, Merchant, Host, Rider + portals from the system |
| **5** | **Polish & Scale** | Test, optimize, govern, measure and evolve the ecosystem |

### The result

You're no longer building:

**4 apps + several portals.**

You're building:

> **One NEXG interaction system that happens to express itself through multiple products.**

That distinction is huge.

It means when you improve the **Date Picker, Widget Engine, Order Workspace, State System, Motion, Blur, Search, accessibility, or navigation primitives**, the improvement can propagate across the ecosystem rather than being rebuilt four or eight times.

And it also completes the original law-based direction:

**Attention → Direction → Memory → Action**  
supported by **Jakob → Hick → Fitts → Miller → Tesler**, with the NEXG design system turning those principles into actual reusable rules rather than leaving them as design theory.

## Prompt:
8/9/2026, 6:59:09 AM

Exactly. For NEXG, we should not copy Wolt’s component list directly. We should build a shared NEXG Component System that serves all of your surfaces.

You effectively have 6 product surfaces, with web portals attached to the operational products:

1. NEXG Consumer App
2. Merchant App + Merchant Portal
3. Rider App + Rider Portal
4. Host App + Host Portal
5. Admin App + Admin Portal
6. Monitoring / Operations App + Monitoring Portal

The important architectural decision is:

One NEXG Design System → multiple products → shared components → specialized components.

NEXG Product Surface Map

Product	Mobile	Web Portal	Primary purpose
Consumer	App	—	Discover, order, book, request
Merchant	App	Portal	Manage business, products, orders
Rider	App	Portal	Deliveries, navigation, earnings
Host	App	Portal	Properties, guests, concierge
Admin	App	Portal	Platform administration
Monitoring	App	Portal	Infrastructure, operations, observability

⸻

1. NEXG Foundation Components

These should exist across almost every product.

Identity

* Login
* Registration
* OTP
* MFA
* Password reset
* Session management
* Device verification
* Biometric authentication
* Account switching
* Organization switching
* Role switching
* Permission prompts
* Identity verification
* Profile
* Avatar
* Presence
* Online/offline status

Global UI

* App shell
* Web shell
* Header
* Navigation
* Bottom navigation
* Sidebar
* Command bar
* Search
* Global search
* Breadcrumbs
* Tabs
* Segmented controls
* Filters
* Sort
* Pagination
* Infinite scroll
* Cards
* Lists
* Tables
* Grids
* Kanban
* Timeline
* Calendar
* Map
* Drawer
* Side panel
* Modal
* Bottom sheet
* Popover
* Tooltip
* Toast
* Snackbar
* Alert
* Confirmation
* Empty state
* Error state
* Offline state
* Loading state
* Skeleton
* Progress indicator

⸻

2. NEXG Entity Components

This is particularly important because of your Single Surface / Context First philosophy.

Everything should revolve around entities.

Core entities

* Customer
* Merchant
* Host
* Property
* Rider
* Order
* Booking
* Service
* Product
* Category
* Delivery
* Payment
* Transaction
* Invoice
* Promotion
* Review
* Ticket
* Message
* Document
* Vehicle
* Employee
* User
* Organization

Each entity should have reusable:

Entity Card

Entity Header

Entity Avatar

Entity Status

Entity Metadata

Entity Timeline

Entity Activity

Entity Actions

Entity Details

Entity Documents

Entity Notes

Entity Relationships

Entity History

Entity Settings

This becomes the foundation of NEXG.

⸻

3. Consumer App

This is your Wolt/Glovo-like experience.

Discovery

* Home
* Search
* Categories
* Services
* Collections
* Recommendations
* Nearby
* Featured
* Promotions
* Recently viewed
* Favorites
* Reorder

Merchant discovery

* Merchant card
* Merchant header
* Merchant profile
* Rating
* Delivery ETA
* Delivery fee
* Minimum order
* Open/closed state
* Promotions
* Menu/catalog
* Product categories

Commerce

* Product card
* Product detail
* Variants
* Add-ons
* Customization
* Quantity
* Cart
* Multi-item cart
* Notes
* Promo code
* Checkout

Delivery

* Address
* Map picker
* Delivery instructions
* Delivery time
* ASAP
* Scheduled delivery
* Rider tracking
* ETA
* Delivery status
* Contact rider
* Delivery confirmation

Post-order

* Receipt
* Rating
* Review
* Reorder
* Support
* Refund
* Report problem

⸻

4. Merchant App + Portal

This should be much deeper than a normal merchant dashboard.

Business

* Business profile
* Business identity
* Branches
* Operating hours
* Service areas
* Staff
* Roles
* Permissions
* Business documents
* Compliance

Catalog

* Products
* Services
* Categories
* Subcategories
* Variants
* Add-ons
* Modifiers
* Pricing
* Inventory
* Availability
* Images
* Bulk editing

Orders

* New orders
* Active orders
* Preparing
* Ready
* Completed
* Cancelled
* Order details
* Order timeline
* Customer details
* Order notes
* Refunds
* Issues

Merchant operations

* POS integration
* Kitchen display
* Printer
* Preparation time
* Order throttling
* Busy mode
* Temporary closure
* Stock availability

Financial

* Revenue
* Transactions
* Commission
* Fees
* Payouts
* Statements
* Invoices
* Tax
* eTIMS
* Payment reconciliation

Analytics

* Sales
* Orders
* Customers
* Products
* Average order value
* Cancellation rate
* Delivery performance
* Customer ratings
* Revenue trends

Communication

* Customer messages
* NEXG notifications
* Support
* Announcements

⸻

5. Rider App + Portal

The rider interface should be extremely action-oriented.

Rider home

* Online/offline
* Current location
* Earnings today
* Active delivery
* Available jobs
* Performance

Delivery

* Delivery request
* Accept/reject
* Pickup navigation
* Pickup verification
* Merchant contact
* Customer navigation
* Delivery instructions
* Arrival
* Proof of pickup
* Proof of delivery
* OTP/PIN
* Signature
* Photo
* Failed delivery

Rider operations

* Route
* Navigation
* Multi-stop delivery
* Delivery queue
* Vehicle
* Fuel
* Documents
* Availability

Money

* Earnings
* Bonuses
* Incentives
* Tips
* Withdrawals
* Statements
* Payment history

Rider portal

* Performance
* Earnings
* Deliveries
* Documents
* Vehicle
* Schedule
* Support
* Account

⸻

6. Host App + Portal

This is where NEXG becomes significantly different from Wolt.

Property

* Property portfolio
* Property card
* Property profile
* Rooms
* Units
* Amenities
* Photos
* Property documents
* Availability
* Pricing

Guest

* Guest profile
* Current guests
* Upcoming guests
* Guest history
* Guest preferences
* Guest requests
* Guest communication

Concierge

* Guest request
* Service request
* Restaurant order
* Grocery order
* Laundry
* Housekeeping
* Transport
* Spa
* Experiences
* Tickets
* Special requests

Property operations

* Check-in
* Check-out
* Cleaning
* Maintenance
* Housekeeping
* Room status
* Staff
* Tasks
* Incidents

Host financials

* Revenue
* Bookings
* Concierge revenue
* Commission
* Expenses
* Payouts
* Statements

⸻

7. Admin App + Portal

Admin is fundamentally different.

It’s not primarily a CRUD application.

It’s a control system.

Platform overview

* Global KPIs
* Orders
* Deliveries
* Bookings
* Merchants
* Hosts
* Riders
* Customers
* Properties
* Revenue

Entity management

* Merchant management
* Rider management
* Host management
* Customer management
* Property management
* Employee management

Operations

* Live orders
* Live deliveries
* Live riders
* Service incidents
* Failed orders
* Cancellations
* Refunds
* Disputes

Financial control

* Transactions
* Payments
* Commissions
* Payouts
* Refunds
* Reconciliation
* Tax
* Financial reports

Platform configuration

* Categories
* Subcategories
* Service types
* Pricing
* Commission rules
* Delivery rules
* Geographic zones
* Promotions
* Feature flags
* Permissions

⸻

8. Monitoring / Operations

I would actually separate this conceptually from normal administration.

Admin asks:

“What is happening in the business?”

Monitoring asks:

“Is NEXG itself working?”

Infrastructure

* Server health
* CPU
* RAM
* Disk
* Network
* Database
* Redis
* API
* Storage

Application

* API latency
* Error rates
* Request rates
* Failed requests
* Authentication failures
* Queue health
* WebSocket connections
* Integration health

Business monitoring

This is particularly powerful:

* Orders/minute
* Failed payments
* Delivery delays
* Merchant downtime
* Rider shortages
* Booking failures
* Abnormal cancellations
* Revenue anomalies

Security

* Login attempts
* Failed authentication
* Suspicious activity
* Permission changes
* API abuse
* Rate-limit events
* Audit logs

Incident management

* Incident
* Alert
* Severity
* Timeline
* Affected services
* Assignment
* Acknowledgement
* Resolution
* Postmortem

⸻

9. NEXG Communication System

Shared across all products.

Messaging

* 1:1 chat
* Group chat
* Customer ↔ Merchant
* Customer ↔ Rider
* Guest ↔ Host
* Host ↔ Merchant
* Staff chat
* Support chat

Notifications

* Push
* SMS
* Email
* In-app
* WhatsApp where integrated

Communication components

* Notification center
* Notification badge
* Message composer
* Attachment picker
* Conversation list
* Chat bubbles
* Read receipts
* Typing indicator
* System messages
* Templates
* Notification preferences

⸻

10. NEXG Financial Components

Shared everywhere money exists.

* Price
* Discount
* Tax
* Fee
* Commission
* Tip
* Total
* Payment method
* Payment status
* Transaction
* Refund
* Payout
* Wallet
* Ledger
* Invoice
* Receipt
* Statement
* Reconciliation

And critically:

Money Display Component

Every financial value should have consistent:

Currency → amount → tax treatment → status → source

⸻

11. NEXG Maps & Location

Shared by consumer, rider, host and admin.

* Map
* Marker
* Cluster
* User location
* Merchant location
* Property location
* Rider location
* Route
* ETA
* Geofence
* Delivery zone
* Service area
* Address picker
* Location search
* Navigation handoff
* Distance calculation

⸻

12. NEXG Workflow Components

This is another major layer.

Instead of every team building its own workflow UI:

* Status
* State machine
* Timeline
* Task
* Assignment
* Approval
* Rejection
* Escalation
* SLA
* Checklist
* Progress
* Workflow step
* Workflow history

For example:

Order

Created → Confirmed → Preparing → Ready → Assigned → Picked Up → Delivered → Completed

The same underlying workflow component can power different products.

⸻

13. NEXG AI Components

Eventually:

* AI assistant
* Entity assistant
* Smart search
* Natural-language commands
* Recommendations
* Fraud detection UI
* Anomaly detection
* Smart summaries
* Automated categorization
* Suggested actions
* Predictive ETA
* Demand prediction
* Intelligent routing

⸻

14. NEXG Design-System Components

And underneath everything:

Primitive

* Color
* Typography
* Spacing
* Radius
* Shadow
* Icon
* Image
* Avatar
* Divider

Controls

* Button
* Input
* Select
* Checkbox
* Radio
* Switch
* Slider
* Date picker
* Time picker
* Search
* Upload

Feedback

* Toast
* Alert
* Banner
* Progress
* Skeleton
* Empty
* Error
* Success
* Confirmation

Layout

* Stack
* Grid
* Container
* Section
* Sheet
* Drawer
* Modal
* Panel
* Split view

⸻

The important part: don’t build 6 separate design systems

I’d structure NEXG like this:

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

And I would classify every NEXG component into 7 levels

Level	What it means
L0 — Primitive	Icon, text, spacing, color
L1 — Control	Button, input, switch, selector
L2 — Pattern	Card, list, table, modal
L3 — Entity	Merchant Card, Order Card, Property Card
L4 — Workflow	Checkout, Delivery, Booking, Payout
L5 — Domain	Commerce, Hospitality, Mobility, Concierge
L6 — Product	Consumer, Merchant, Rider, Host, Admin, Monitoring

That gives us a single NEXG component universe instead of randomly creating UI pieces as we build each application.

And given the work we’ve already done on NEXG’s character system, merchant taxonomy, host model, portals, smart panels, and single-surface philosophy, I’d take this one step further: we should create a complete NEXG Component Inventory before building the individual apps—with every component assigned an ID, category, subcategory, purpose, states, variants, responsive behavior, permissions, and which of the six products can use it.

What do
You think of that, it’s from another chat

## Response:
8/9/2026, 6:59:11 AM

Yes. **I think this is the stronger architecture**, and I would merge it into the five-phase plan rather than treating it as a competing approach.

The earlier five phases gave us the **process**. This new document gives us the **actual scope and taxonomy of what we're building**.

The biggest improvement is that it recognizes NEXG isn't just four apps. It's an ecosystem of **six product surfaces with mobile + operational web where appropriate**.

### What I would keep exactly

The six surfaces:

1. **Consumer**
2. **Merchant**
3. **Rider**
4. **Host**
5. **Admin**
6. **Monitoring / Operations**

And the central principle:

> **One NEXG Design System → multiple products → shared components → specialized components.**

That should become a foundational NEXG architecture rule.

### What I would change

The 14 sections in that document shouldn't all sit at the same level.

I'd reorganize them into a proper hierarchy:

```text
NEXG COMPONENT SYSTEM
│
├── L0 FOUNDATION
│   ├── Tokens
│   ├── Typography
│   ├── Icons
│   ├── Color
│   ├── Spacing
│   ├── Motion
│   └── Blur
│
├── L1 CORE UI
│   ├── Buttons
│   ├── Inputs
│   ├── Selectors
│   ├── Date / Time
│   ├── Search
│   └── Feedback
│
├── L2 STRUCTURAL
│   ├── Cards
│   ├── Lists
│   ├── Tables
│   ├── Grids
│   ├── Sheets
│   ├── Panels
│   ├── Modals
│   └── Navigation
│
├── L3 ENTITY
│   ├── Customer
│   ├── Merchant
│   ├── Property
│   ├── Rider
│   ├── Order
│   ├── Booking
│   ├── Product
│   └── ...
│
├── L4 WORKFLOW
│   ├── Checkout
│   ├── Order fulfillment
│   ├── Delivery
│   ├── Booking
│   ├── Payout
│   ├── Approval
│   └── Incident
│
├── L5 DOMAIN
│   ├── Commerce
│   ├── Delivery
│   ├── Hospitality
│   ├── Mobility
│   ├── Concierge
│   ├── Finance
│   └── Operations
│
└── L6 PRODUCT
    ├── Consumer
    ├── Merchant
    ├── Rider
    ├── Host
    ├── Admin
    └── Monitoring
```

That gives us a **much cleaner architecture**.

### And there's one thing I'd add

Every component should have a **NEXG Component Contract**.

For example:

```text
NEXG-ENT-ORDER-001
Order Entity

Category:
Entity

Subcategory:
Commerce → Orders

Used by:
Consumer
Merchant
Rider
Admin
Monitoring

States:
Draft
Pending
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

Variants:
Compact
Standard
Expanded
Timeline
Map
Table
Card

Themes:
Light
Dark

Responsive:
Mobile
Tablet
Desktop

Interaction:
Tap
Expand
Swipe
Long press

Permissions:
Customer
Merchant
Rider
Admin

Related:
Payment
Customer
Merchant
Rider
Delivery
```

**That is the level I think we should build the inventory at.**

It also solves something you've repeatedly been concerned about: **categories and subcategories being vague or misplaced.**

We can make the taxonomy explicit instead of letting the component library become a giant pile of cards, widgets and screens.

---

## Most importantly: this changes Phase 1

I would revise the five phases slightly.

### Phase 1 — INVENTORY & COLLECT

Not merely "collect 500 components."

We create the **NEXG Component Universe**.

```text
Research
↓
Collect existing components
↓
Identify missing components
↓
Classify
↓
Category
↓
Subcategory
↓
Entity / Workflow / Domain
↓
Map to products
↓
Assign states
↓
Assign variants
↓
Assign priority
```

### Phase 2 — NORMALIZE

Turn the inventory into the NEXG language.

### Phase 3 — BUILD

Turn the approved inventory into the actual reusable Expo/web component system.

### Phase 4 — COMPOSE

Build:

**Consumer → Merchant → Rider → Host → Admin → Monitoring**

from that system.

### Phase 5 — VALIDATE & SCALE

Performance, accessibility, analytics, governance, versioning, testing, new verticals, etc.

---

# And this gives us something much bigger

Instead of saying:

> "We need 300–600 components."

We can say:

> **NEXG has a component universe with thousands of possible compositions, but a controlled set of reusable primitives, entities, workflows and domain components.**

That's much more sophisticated.

For example:

```text
1 Order component
×
12 states
×
5 layouts
×
4 roles
×
3 responsive modes
×
2 themes
```

does **not** mean we need 1,440 completely separate components.

We need **one intelligently parameterized Order system** capable of producing those experiences.

That is how we can get your desired **300–600+ component variants** without creating an unmaintainable monster.

---

## One other important correction

I would **not** call everything a "component."

There should be a distinction between:

**Component**

> Button, DatePicker, Avatar

**Pattern**

> Search bar, entity header, filter bar

**Widget**

> Today's Orders, Revenue, Active Delivery

**Workflow**

> Checkout, Delivery, Booking

**Workspace**

> Order Workspace, Property Workspace, Merchant Workspace

**Screen**

> Consumer Home, Rider Home, Merchant Workspace

That distinction will be extremely important for NEXG.

Otherwise we'll eventually have things like `MerchantDashboardCardFinal2` sitting next to `OrderWidgetV7`, which is exactly what we're trying to avoid.

---

### So yes — I would adopt this document.

But I would make it the **master scope/taxonomy** for the NEXG Component System, while the five-phase plan remains the **implementation roadmap**.

The next logical artifact is therefore:

# **`NEXG_COMPONENT_INVENTORY.md`**

And I would make it exhaustive:

**L0–L6 → category → subcategory → component → variants → states → widgets → workflows → products → mobile/web → dependencies.**

That becomes the master index from which we can determine **exactly what we need to collect from existing libraries before we build anything ourselves.**

## Prompt:
8/9/2026, 7:00:36 AM

NEXG_COMPONENT_INVENTORY.md

## Response:
8/9/2026, 7:00:38 AM

Absolutely. This should be the **master inventory**, not merely a component checklist.

**document: **

# NEXG_COMPONENT_INVENTORY.md

# NEXG Component Inventory

> **Status:** Master Architecture Inventory  
> **Version:** 1.0  
> **Purpose:** Define, classify, map, and govern every reusable interface component, pattern, widget, entity, workflow, domain component, and product-specific composition within NEXG.

---

# 01. PURPOSE

NEXG is not six independently designed products.

NEXG is:

```text
ONE NEXG DESIGN SYSTEM
        ↓
SHARED COMPONENTS
        ↓
SHARED ENTITIES
        ↓
SHARED WORKFLOWS
        ↓
SHARED DOMAIN SYSTEMS
        ↓
MULTIPLE PRODUCT EXPERIENCES
```

The six primary product surfaces are:

1. NEXG Consumer
2. NEXG Merchant
3. NEXG Rider
4. NEXG Host
5. NEXG Admin
6. NEXG Monitoring / Operations

Where operational products require desktop workflows:

```text
Merchant App + Merchant Portal
Rider App + Rider Portal
Host App + Host Portal
Admin App + Admin Portal
Monitoring App + Monitoring Portal
```

The purpose of this inventory is to prevent duplicated UI systems and establish a controlled vocabulary for everything NEXG builds.

---

# 02. CORE PRINCIPLE

## One NEXG Design System → Multiple Products → Shared Components → Specialized Components

A component must not be created separately merely because it appears in multiple applications.

Instead:

```text
Same concept
    ↓
Shared NEXG component
    ↓
Context / role / permission
    ↓
Different composition
```

Example:

```text
NexGOrder
```

can appear as:

```text
Consumer → Track Order
Merchant → Fulfill Order
Rider → Deliver Order
Admin → Monitor Order
Monitoring → Observe Order Health
```

The underlying entity remains the same.

The experience changes according to context.

---

# 03. COMPONENT HIERARCHY

Every reusable NEXG interface element belongs to one of seven levels.

```text
L0 FOUNDATION
    ↓
L1 CONTROL
    ↓
L2 STRUCTURAL
    ↓
L3 ENTITY
    ↓
L4 WORKFLOW
    ↓
L5 DOMAIN
    ↓
L6 PRODUCT
```

---

# 04. L0 — FOUNDATION

The smallest reusable design primitives.

## 04.1 Color

- Brand colors
- Semantic colors
- Surface colors
- Text colors
- Border colors
- Interactive colors
- Success
- Warning
- Error
- Information
- Disabled
- Overlay
- Scrim
- Dark-mode colors
- Light-mode colors

## 04.2 Typography

- Display
- Heading
- Title
- Body
- Label
- Caption
- Numeric
- Financial
- Metadata
- Button text
- Navigation text
- Monospace / technical text

## 04.3 Spacing

- 2
- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 40
- 48
- 64
- 80+

Exact token values are defined by the NEXG token system.

## 04.4 Radius

- None
- Small
- Medium
- Large
- XL
- Full / pill

## 04.5 Elevation

- Flat
- Raised
- Floating
- Overlay
- Modal

## 04.6 Icons

- Navigation
- Actions
- Status
- Commerce
- Delivery
- Hospitality
- Finance
- Operations
- Communication
- System

Icons must follow the NEXG monochrome iconography system.

## 04.7 Imagery

- Avatar
- Thumbnail
- Product image
- Merchant image
- Property image
- Hero image
- Map imagery
- Placeholder
- Empty-state imagery

## 04.8 Motion

- Micro
- Fast
- Standard
- Spring
- Emphasized
- Reduced-motion alternatives

## 04.9 Blur

- Header blur
- Bottom navigation blur
- Floating surface blur
- Modal backdrop blur
- Progressive blur
- Glass surface

---

# 05. L1 — CORE CONTROLS

## 05.1 Buttons

- Primary
- Secondary
- Tertiary
- Ghost
- Icon
- Floating action
- Destructive
- Success
- Link
- Compact
- Full width

States:

```text
Default
Pressed
Focused
Hovered
Disabled
Loading
Success
Error
```

---

## 05.2 Inputs

- Text input
- Numeric input
- Currency input
- Search input
- Password input
- OTP input
- Phone input
- Email input
- Multiline input
- URL input
- Address input

States:

```text
Default
Focused
Filled
Disabled
Read-only
Error
Success
Loading
```

---

## 05.3 Selection

- Checkbox
- Radio
- Switch
- Toggle
- Select
- Multi-select
- Segmented control
- Chip
- Tag
- Filter
- Sort selector

---

## 05.4 Date & Time

- Date picker
- Date range picker
- Calendar
- Time picker
- Date/time picker
- Availability picker
- Schedule picker

States:

- Available
- Selected
- Range start
- Range end
- Today
- Disabled
- Unavailable
- Loading
- Error

---

## 05.5 Location

- Location input
- Location search
- Address picker
- Map picker
- Current-location button
- Saved address
- Address card
- Delivery instructions
- Service-area selector

---

## 05.6 Upload

- Image upload
- Document upload
- Camera capture
- Photo picker
- File picker
- Multi-upload
- Upload progress
- Upload success
- Upload error

---

# 06. L2 — STRUCTURAL COMPONENTS

## 06.1 Application Shell

- Mobile shell
- Web shell
- Header
- Progressive header
- Footer
- Bottom navigation
- Sidebar
- Floating navigation
- Command bar
- Context bar

---

## 06.2 Navigation

- Tab bar
- Navigation item
- Breadcrumb
- Back navigation
- Contextual navigation
- Segmented navigation
- Section navigation
- Search navigation

Navigation must follow the NEXG principle:

> Navigation exists to support context, not replace it.

---

## 06.3 Layout

- Container
- Stack
- Row
- Column
- Grid
- Section
- Split view
- Masonry
- Scroll area
- Sticky region
- Safe-area region

---

## 06.4 Surfaces

- Card
- Surface
- Floating surface
- Glass surface
- Sheet
- Bottom sheet
- Drawer
- Side panel
- Modal
- Full-screen modal
- Popover
- Tooltip
- Context menu

---

## 06.5 Data Display

- List
- Grid
- Table
- Kanban
- Timeline
- Calendar
- Chart
- Metric
- KPI
- Progress
- Ranking
- Comparison

---

## 06.6 Feedback

- Toast
- Snackbar
- Alert
- Banner
- Confirmation
- Success
- Error
- Warning
- Info
- Offline
- Empty
- Loading
- Skeleton
- Shimmer
- Progress indicator

---

# 07. L3 — ENTITY SYSTEM

NEXG follows the:

> **Single Surface / Context First**

philosophy.

The entity system therefore becomes one of the most important layers of the entire platform.

---

# 07.1 Universal Entity Structure

Every major entity can support:

```text
Entity
├── Identity
├── Avatar / Image
├── Status
├── Metadata
├── Header
├── Summary
├── Details
├── Actions
├── Timeline
├── Activity
├── Documents
├── Notes
├── Relationships
├── History
└── Settings
```

Not every entity must implement every capability.

---

# 07.2 Core Entities

```text
Customer
Merchant
Host
Property
Rider
Order
Booking
Service
Product
Category
Delivery
Payment
Transaction
Invoice
Promotion
Review
Ticket
Message
Document
Vehicle
Employee
User
Organization
```

---

# 07.3 Entity Components

For each supported entity:

- Entity Card
- Entity Header
- Entity Avatar
- Entity Status
- Entity Metadata
- Entity Summary
- Entity Details
- Entity Actions
- Entity Timeline
- Entity Activity
- Entity Documents
- Entity Notes
- Entity Relationships
- Entity History
- Entity Settings
- Entity Workspace

---

# 08. ENTITY: CUSTOMER

Components:

- Customer card
- Customer header
- Customer profile
- Customer avatar
- Customer status
- Customer contact
- Customer addresses
- Customer orders
- Customer bookings
- Customer preferences
- Customer reviews
- Customer communication
- Customer history
- Customer support
- Customer workspace

Used by:

```text
Consumer
Merchant
Host
Admin
Monitoring
```

---

# 09. ENTITY: MERCHANT

Components:

- Merchant card
- Merchant header
- Merchant profile
- Merchant logo
- Merchant status
- Merchant category
- Merchant location
- Merchant hours
- Merchant rating
- Merchant delivery information
- Merchant catalog
- Merchant promotions
- Merchant orders
- Merchant analytics
- Merchant documents
- Merchant settings
- Merchant workspace

Used by:

```text
Consumer
Merchant
Admin
Monitoring
```

---

# 10. ENTITY: PROPERTY

Components:

- Property card
- Property header
- Property image
- Property status
- Property type
- Property location
- Units
- Rooms
- Amenities
- Availability
- Pricing
- Guests
- Bookings
- Housekeeping
- Maintenance
- Documents
- Property activity
- Property settings
- Property workspace

Used by:

```text
Host
Consumer
Admin
Monitoring
```

---

# 11. ENTITY: RIDER

Components:

- Rider card
- Rider profile
- Rider avatar
- Rider status
- Availability
- Location
- Active delivery
- Delivery history
- Earnings
- Performance
- Vehicle
- Documents
- Verification
- Rider workspace

Used by:

```text
Rider
Consumer
Merchant
Admin
Monitoring
```

---

# 12. ENTITY: ORDER

Components:

- Order card
- Order header
- Order status
- Order items
- Order total
- Order timeline
- Order customer
- Order merchant
- Order rider
- Order delivery
- Order payment
- Order notes
- Order actions
- Order receipt
- Order support
- Order workspace

Core order states:

```text
Draft
Pending
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

---

# 13. ENTITY: BOOKING

Components:

- Booking card
- Booking header
- Booking status
- Guest
- Property
- Service
- Date
- Time
- Duration
- Booking timeline
- Payment
- Notes
- Actions
- Booking workspace

---

# 14. ENTITY: PRODUCT

Components:

- Product card
- Product image
- Product header
- Product price
- Product status
- Product category
- Product variants
- Add-ons
- Modifiers
- Availability
- Inventory
- Product details
- Product editor

---

# 15. ENTITY: SERVICE

Components:

- Service card
- Service header
- Service category
- Service duration
- Service price
- Availability
- Provider
- Booking
- Service details

Examples:

```text
Laundry
Housekeeping
Airport transfer
Spa
Massage
Beauty
Fitness
Tours
Experiences
```

---

# 16. ENTITY: PAYMENT

Components:

- Payment method
- Payment selector
- Payment status
- Payment amount
- Tax
- Fee
- Discount
- Tip
- Payment confirmation
- Payment failure
- Payment receipt
- Refund
- Payment history

---

# 17. ENTITY: DOCUMENT

Components:

- Document card
- Document viewer
- Document preview
- Document uploader
- Document status
- Verification
- Expiry
- Document history
- Document actions

---

# 18. L4 — WORKFLOW COMPONENTS

Workflows represent **actions through time**.

---

## 18.1 Workflow primitives

- Status
- State machine
- Timeline
- Step
- Task
- Assignment
- Approval
- Rejection
- Escalation
- SLA
- Checklist
- Progress
- Workflow history

---

# 18.2 ORDER WORKFLOW

```text
Created
  ↓
Confirmed
  ↓
Preparing
  ↓
Ready
  ↓
Assigned
  ↓
Picked Up
  ↓
In Transit
  ↓
Delivered
  ↓
Completed
```

Each product sees only the states relevant to its role.

---

# 18.3 DELIVERY WORKFLOW

```text
Available
  ↓
Offered
  ↓
Accepted
  ↓
Arriving at Pickup
  ↓
At Pickup
  ↓
Picked Up
  ↓
En Route
  ↓
Arrived
  ↓
Delivered
  ↓
Completed
```

---

# 18.4 BOOKING WORKFLOW

```text
Requested
  ↓
Pending
  ↓
Confirmed
  ↓
Upcoming
  ↓
Checked In
  ↓
Active
  ↓
Completed
```

Alternative states:

```text
Cancelled
Declined
No-show
Failed
Refunded
```

---

# 18.5 PAYMENT WORKFLOW

```text
Initiated
  ↓
Processing
  ↓
Authorized
  ↓
Captured
  ↓
Settled
```

Failure paths:

```text
Declined
Failed
Expired
Refunded
Partially Refunded
```

---

# 19. L5 — DOMAIN SYSTEMS

Domain components are reusable groups of functionality.

---

# 19.1 COMMERCE

- Catalog
- Product
- Category
- Cart
- Checkout
- Order
- Promotion
- Discount
- Inventory
- Pricing
- Tax

---

# 19.2 DELIVERY

- Delivery request
- Delivery queue
- Dispatch
- Rider assignment
- Route
- ETA
- Tracking
- Pickup
- Drop-off
- Proof of delivery
- Delivery issue

---

# 19.3 HOSPITALITY

- Property
- Room
- Unit
- Guest
- Booking
- Check-in
- Check-out
- Housekeeping
- Maintenance
- Concierge
- Guest request

---

# 19.4 MOBILITY

- Vehicle
- Driver
- Ride
- Pickup
- Drop-off
- Route
- ETA
- Navigation
- Trip status

---

# 19.5 CONCIERGE

- Guest request
- Service discovery
- Service booking
- Restaurant order
- Grocery order
- Laundry
- Housekeeping
- Transport
- Wellness
- Experiences

---

# 19.6 FINANCE

Shared wherever money exists.

- Money display
- Price
- Discount
- Tax
- Fee
- Commission
- Tip
- Total
- Payment
- Transaction
- Refund
- Payout
- Wallet
- Ledger
- Invoice
- Receipt
- Statement
- Reconciliation

---

# 19.7 COMMUNICATION

- Conversation
- Message
- Chat
- Composer
- Attachment
- Notification
- Notification center
- Read receipt
- Typing indicator
- System message
- Template
- Notification preference

Channels:

```text
Push
SMS
Email
In-app
WhatsApp where integrated
```

---

# 19.8 MAPS & LOCATION

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
- Distance

---

# 19.9 OPERATIONS

- Live activity
- Incident
- Alert
- Severity
- Assignment
- SLA
- Timeline
- Acknowledgement
- Resolution
- Postmortem
- Audit log

---

# 20. L6 — PRODUCT COMPONENTS

These are compositions specific to a product.

They may use any lower-level component but should not automatically become globally reusable.

---

# 20.1 CONSUMER

## Discovery

- Consumer Home
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

## Merchant discovery

- Merchant card
- Merchant header
- Merchant profile
- Rating
- ETA
- Delivery fee
- Minimum order
- Open/closed
- Promotions
- Menu
- Catalog

## Commerce

- Product detail
- Product customization
- Variants
- Add-ons
- Quantity
- Cart
- Multi-item cart
- Notes
- Promo code
- Checkout

## Delivery

- Address
- Delivery instructions
- Delivery time
- ASAP
- Scheduled delivery
- Rider tracking
- ETA
- Contact rider
- Delivery confirmation

## Post-order

- Receipt
- Rating
- Review
- Reorder
- Support
- Refund
- Report problem

---

# 20.2 MERCHANT

## Business

- Business profile
- Branches
- Operating hours
- Service areas
- Staff
- Roles
- Permissions
- Documents
- Compliance

## Catalog

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

## Orders

- New orders
- Active orders
- Preparing
- Ready
- Completed
- Cancelled
- Order details
- Customer details
- Refunds
- Issues

## Operations

- POS
- Kitchen display
- Printer
- Preparation time
- Order throttling
- Busy mode
- Temporary closure
- Stock availability

## Financial

- Revenue
- Transactions
- Commission
- Fees
- Payouts
- Statements
- Invoices
- Tax
- eTIMS
- Reconciliation

## Analytics

- Sales
- Orders
- Customers
- Products
- Average order value
- Cancellation rate
- Delivery performance
- Ratings
- Revenue trends

---

# 20.3 RIDER

## Home

- Online/offline
- Location
- Earnings today
- Active delivery
- Available jobs
- Performance

## Delivery

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

## Operations

- Route
- Navigation
- Multi-stop delivery
- Delivery queue
- Vehicle
- Fuel
- Documents
- Availability

## Money

- Earnings
- Bonuses
- Incentives
- Tips
- Withdrawals
- Statements
- Payment history

---

# 20.4 HOST

## Property

- Portfolio
- Property card
- Property profile
- Rooms
- Units
- Amenities
- Photos
- Documents
- Availability
- Pricing

## Guest

- Guest profile
- Current guests
- Upcoming guests
- Guest history
- Preferences
- Requests
- Communication

## Concierge

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

## Operations

- Check-in
- Check-out
- Cleaning
- Maintenance
- Housekeeping
- Room status
- Staff
- Tasks
- Incidents

## Financial

- Revenue
- Bookings
- Concierge revenue
- Commission
- Expenses
- Payouts
- Statements

---

# 20.5 ADMIN

Admin is a **control system**, not merely CRUD.

## Platform overview

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

## Entity management

- Merchant management
- Rider management
- Host management
- Customer management
- Property management
- Employee management

## Operations

- Live orders
- Live deliveries
- Live riders
- Service incidents
- Failed orders
- Cancellations
- Refunds
- Disputes

## Financial control

- Transactions
- Payments
- Commissions
- Payouts
- Refunds
- Reconciliation
- Tax
- Financial reports

## Platform configuration

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

# 20.6 MONITORING / OPERATIONS

Monitoring answers:

> **Is NEXG itself working?**

## Infrastructure

- Server health
- CPU
- RAM
- Disk
- Network
- Database
- Redis
- API
- Storage

## Application

- API latency
- Error rates
- Request rates
- Failed requests
- Authentication failures
- Queue health
- WebSocket connections
- Integration health

## Business monitoring

- Orders/minute
- Failed payments
- Delivery delays
- Merchant downtime
- Rider shortages
- Booking failures
- Abnormal cancellations
- Revenue anomalies

## Security

- Login attempts
- Failed authentication
- Suspicious activity
- Permission changes
- API abuse
- Rate-limit events
- Audit logs

## Incident management

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

# 21. WIDGET SYSTEM

Widgets are **living surfaces**, not merely cards.

A NEXG widget contains:

```text
Identity
Data
State
Priority
Size
Actions
Permissions
Expansion
Persistence
Refresh behavior
```

---

# 21.1 Widget States

```text
Hidden
Compact
Expanded
Focused
Loading
Updating
Empty
Error
Offline
Disabled
Success
```

---

# 21.2 Widget Sizes

```text
Small
Medium
Large
Full
```

---

# 21.3 Widget Behavior

```text
Compact
   ↓
Tap
   ↓
Spring expansion
   ↓
Expanded workspace
   ↓
Action
   ↓
Success / Error
   ↓
Collapse
```

---

# 21.4 Core NEXG Widgets

Potential shared widgets include:

- Orders
- Revenue
- Bookings
- Deliveries
- Active delivery
- Tasks
- Alerts
- Notifications
- Messages
- Customers
- Properties
- Guests
- Earnings
- Performance
- Inventory
- Compliance
- Incidents
- System health

---

# 22. STATE SYSTEM

Every component must explicitly consider:

```text
Default
Pressed
Focused
Hovered
Selected
Disabled
Loading
Updating
Success
Error
Empty
Offline
Expanded
Collapsed
```

Not every component needs every state.

But the state model must be deliberate.

---

# 23. RESPONSIVE SYSTEM

Every reusable component declares its supported surfaces:

```text
Mobile
Tablet
Desktop
Web
```

Presentation may change.

The conceptual component should remain consistent.

Example:

```text
Mobile
Widget → Bottom Sheet

Tablet
Widget → Side Panel

Desktop
Widget → Workspace / Side Panel
```

---

# 24. THEME SYSTEM

Every supported component must define:

```text
Light
Dark
System
```

NEXG dark mode is not an afterthought.

It is a first-class theme.

---

# 25. ACCESSIBILITY

Components must support, where applicable:

- Dynamic text
- Screen readers
- Semantic labels
- Contrast
- Touch targets
- Focus
- Keyboard navigation
- Reduced motion
- Accessible errors
- Accessible loading states

Accessibility is a property of the system.

---

# 26. COMPONENT CONTRACT

Every component added to NEXG receives a unique identifier.

Example:

```text
NEXG-CTL-BTN-001
NEXG-ENT-ORD-001
NEXG-WDG-ORD-001
NEXG-WFL-DEL-001
NEXG-DOM-COM-001
```

Each component record must contain:

```text
ID
Name
Level
Category
Subcategory
Purpose
Description
Variants
States
Themes
Responsive behavior
Interaction
Accessibility
Permissions
Products
Dependencies
Related components
Status
Version
```

---

# 27. PRODUCT AVAILABILITY MATRIX

Every component should declare where it is allowed.

Example:

| Component | Consumer | Merchant | Rider | Host | Admin | Monitoring |
|---|---:|---:|---:|---:|---:|---:|
| Order | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| Property | ✓ | — | — | ✓ | ✓ | ✓ |
| Rider | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| Booking | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| Revenue | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| System Health | — | — | — | — | ✓ | ✓ |

This matrix is **not permission control**.

It defines intended product usage.

Permissions are handled separately.

---

# 28. COMPONENT STATUS

Every component has a lifecycle:

```text
PROPOSED
    ↓
RESEARCH
    ↓
COLLECTED
    ↓
NORMALIZED
    ↓
DESIGNED
    ↓
IMPLEMENTED
    ↓
TESTED
    ↓
STABLE
```

Other states:

```text
EXPERIMENTAL
DEPRECATED
REPLACED
REMOVED
```

---

# 29. COLLECTION SOURCE

Before building a component from scratch, record whether an acceptable existing implementation exists.

Sources may include:

- Expo ecosystem
- React Native libraries
- Web component libraries
- Open-source UI systems
- Figma community resources
- Public icon libraries
- Public illustration libraries
- Public map components
- Accessibility libraries

The inventory records:

```text
Source
License
Platform
Quality
Adaptability
NEXG modifications required
```

---

# 30. REUSE RULE

Before creating a new component:

```text
1. Does it already exist?

2. Can an existing component be configured?

3. Can an existing component be composed?

4. Is the difference contextual?

5. Is the difference genuinely structural?

6. Does it belong globally?

7. Does it belong to one product only?
```

Only after these questions should a new component be approved.

---

# 31. NO DUPLICATE COMPONENTS

Avoid:

```text
OrderCard
MerchantOrderCard
ConsumerOrderCard
RiderOrderCard
AdminOrderCard
```

when the underlying concept is the same.

Prefer:

```text
NexGOrder
```

with contextual composition:

```text
role
context
permissions
state
variant
```

---

# 32. COMPONENT VS PATTERN VS WIDGET VS WORKFLOW

This distinction is mandatory.

## Component

A reusable UI building block.

Example:

```text
Button
DatePicker
Avatar
```

## Pattern

A recurring arrangement of components.

Example:

```text
Search + Filter + Sort
```

## Widget

A live contextual information/action surface.

Example:

```text
Active Orders
```

## Workflow

A sequence of actions and states.

Example:

```text
Checkout
```

## Workspace

A contextual environment containing multiple related surfaces.

Example:

```text
Order Workspace
Property Workspace
Merchant Workspace
```

## Screen

A product-level composition.

Example:

```text
Consumer Home
Rider Home
Host Workspace
```

This vocabulary prevents architectural confusion.

---

# 33. NEXG DESIGN LAWS

The component system must support the NEXG interaction principles.

## Attention

Show what matters.

## Direction

Guide the user toward the next meaningful action.

## Memory

Maintain consistency and reduce relearning.

## Action

Make important actions easy.

Supporting laws:

### Jakob's Law

Use familiar patterns where appropriate.

### Hick's Law

Reduce unnecessary choices.

### Fitts's Law

Make important targets easy to reach.

### Miller's Law

Avoid unnecessary cognitive overload.

### Tesler's Law

Complexity that cannot be removed should be absorbed by the system rather than transferred to the user.

---

# 34. NEXG COMPONENT QUALITY GATE

A component is not considered production-ready until it has been evaluated for:

```text
□ Reusability
□ Correct taxonomy
□ States
□ Responsive behavior
□ Dark mode
□ Accessibility
□ Motion
□ Error handling
□ Loading
□ Empty state
□ Offline behavior where applicable
□ Permissions
□ Performance
□ Documentation
□ Product mapping
□ Dependencies
□ Versioning
```

---

# 35. FINAL INVENTORY MODEL

The complete NEXG system therefore becomes:

```text
NEXG
│
├── L0 FOUNDATION
│
├── L1 CONTROLS
│
├── L2 STRUCTURAL
│
├── L3 ENTITIES
│
├── L4 WORKFLOWS
│
├── L5 DOMAINS
│
├── L6 PRODUCTS
│
├── WIDGET SYSTEM
│
├── STATE SYSTEM
│
├── MOTION SYSTEM
│
├── BLUR SYSTEM
│
├── NAVIGATION SYSTEM
│
├── SEARCH SYSTEM
│
├── COMMUNICATION SYSTEM
│
├── FINANCIAL SYSTEM
│
├── MAP / LOCATION SYSTEM
│
├── ACCESSIBILITY SYSTEM
│
└── GOVERNANCE
```

---

# 36. THE SIX PRODUCT SURFACES

```text
NEXG
│
├── 01 CONSUMER
│
├── 02 MERCHANT
│   └── Portal
│
├── 03 RIDER
│   └── Portal
│
├── 04 HOST
│   └── Portal
│
├── 05 ADMIN
│   └── Portal
│
└── 06 MONITORING
    └── Portal
```

---

# 37. FINAL PRINCIPLE

NEXG should never ask:

> "What component should this screen use?"

It should ask:

> **"What entity, workflow, context and action does this experience represent?"**

Then the system determines the appropriate composition.

```text
ENTITY
   +
CONTEXT
   +
ROLE
   +
STATE
   +
PERMISSION
   +
ACTION
   ↓
NEXG EXPERIENCE
```

That is the core of the NEXG Component System.

---

# 38. INVENTORY TARGET

The objective is **not** to reach an arbitrary number of components.

The objective is to achieve:

```text
HIGH REUSE
+
LOW DUPLICATION
+
CLEAR TAXONOMY
+
COMPLETE STATES
+
CONSISTENT BEHAVIOR
+
PRODUCT FLEXIBILITY
```

The resulting system may contain:

```text
300–600+
approved reusable component variants
```

while supporting **thousands of compositions** across NEXG.

The distinction is critical:

> **We build a finite component vocabulary and an enormous composition space.**

That is how NEXG can remain coherent while continuing to grow.

---

# 39. NEXT ARTIFACT

The next document should not yet be another design philosophy document.

It should be the operational inventory:

`NEXG_COMPONENT_CATALOG.md`

That document will take this architecture and turn it into a **numbered master catalogue**, beginning with:

```text
NEXG-FOUNDATION
NEXG-CONTROLS
NEXG-NAVIGATION
NEXG-SURFACES
NEXG-DATA
NEXG-FEEDBACK
NEXG-IDENTITY
NEXG-ENTITIES
NEXG-WIDGETS
NEXG-WORKFLOWS
NEXG-DOMAINS
NEXG-PRODUCT
```

with each item receiving its **exact component ID, category, subcategory, states, variants, mobile/web availability, and Consumer/Merchant/Rider/Host/Admin/Monitoring mapping**.

That catalog is what we can then use to systematically **collect the existing components you like before deciding what NEXG actually needs to build itself.**

## Prompt:
8/9/2026, 7:11:47 AM

I am actually interested in starting Phase 1

## Response:
8/9/2026, 7:11:49 AM

Yes. **Now we stop defining Phase 1 and actually do it.**

Based on the architecture we just established, **Phase 1 is not coding**. It is the **collection + inventory + classification phase**.

The goal is to build the raw NEXG component universe from existing libraries before we decide what NEXG needs to build itself.

# PHASE 1 — COLLECT & INVENTORY

### Objective

Create the first complete:

**NEXG Component Universe**

from existing, preferably free/open-source resources.

We will work in this order:

```text
COLLECT
   ↓
SCREEN
   ↓
CLASSIFY
   ↓
MAP
   ↓
RECORD
   ↓
IDENTIFY GAPS
```

---

## 1. What we're actually collecting

We're not just collecting buttons and cards.

We're collecting **six layers of reusable material**:

### A. Foundations
- Typography
- Colors
- Icons
- Spacing
- Radius
- Shadows
- Motion
- Blur

### B. Controls
- Buttons
- Inputs
- Selectors
- Switches
- Checkboxes
- Radio
- Sliders
- Date picker
- Time picker
- Search
- Upload
- Location

### C. Structures
- Cards
- Lists
- Tables
- Grids
- Sheets
- Drawers
- Modals
- Panels
- Navigation
- Tabs
- Command bars

### D. States
Every relevant component:

- Default
- Hover
- Focus
- Pressed
- Selected
- Disabled
- Loading
- Success
- Error
- Empty
- Offline
- Expanded
- Collapsed

### E. Specialized systems

- Maps
- Charts
- Calendar
- Chat
- Payments
- Commerce
- Delivery
- Hospitality
- Property
- Notifications

### F. NEXG-specific compositions

Eventually:

- Order widget
- Delivery widget
- Property widget
- Guest widget
- Merchant widget
- Rider widget
- Booking widget
- Revenue widget
- Concierge widget
- Incident widget

---

# 2. Our collection rule

This is important.

**We do not immediately copy anything into NEXG.**

For every candidate component:

```text
FOUND
 ↓
SCREEN
 ↓
LICENSE CHECK
 ↓
QUALITY CHECK
 ↓
NEXG FIT
 ↓
COLLECT
```

A component can therefore end up as:

### KEEP

Already excellent for NEXG.

### ADAPT

Good foundation but needs NEXG styling/behavior.

### COMPOSE

Useful pieces, but we combine them into a new NEXG pattern.

### REFERENCE

Good inspiration but unsuitable for direct reuse.

### REJECT

Poor quality, incompatible license, obsolete, inaccessible, etc.

---

# 3. The collection database

I recommend we make the master inventory a spreadsheet/database rather than manually maintaining one giant Markdown document.

Each row = **one candidate component**.

Initial schema:

| Field | Purpose |
|---|---|
| Component ID | NEXG identifier |
| Name | Component name |
| Level | L0–L6 |
| Category | Main category |
| Subcategory | Specific classification |
| Type | Component / Pattern / Widget / Workflow |
| Source | Where found |
| License | Usage rights |
| Platform | Expo / React Native / Web |
| Mobile | Yes/No |
| Desktop | Yes/No |
| Dark Mode | Yes/No |
| Responsive | Yes/No |
| States | Supported states |
| Variants | Available variants |
| Accessibility | Assessment |
| Animation | Assessment |
| Customization | How adaptable |
| NEXG Fit | Score |
| Decision | Keep / Adapt / Compose / Reference / Reject |
| Products | Consumer / Merchant / Rider / Host / Admin / Monitoring |
| Notes | Observations |

This becomes the **source of truth**.

---

# 4. First collection pass

We shouldn't attempt all 600 variants immediately.

We'll establish the foundation first.

### Collection Batch 01

**FOUNDATION**

```text
01 Typography
02 Color
03 Icons
04 Spacing
05 Radius
06 Shadows
07 Motion
08 Blur
09 Images
10 Avatars
```

Then:

### Batch 02

**CORE CONTROLS**

```text
11 Button
12 Input
13 Search
14 Select
15 Checkbox
16 Radio
17 Switch
18 Slider
19 Chip
20 Tag
21 Segmented Control
22 Date Picker
23 Time Picker
24 Calendar
25 Upload
26 Location
```

Then:

### Batch 03

**SURFACES**

```text
27 Card
28 List
29 Grid
30 Table
31 Modal
32 Bottom Sheet
33 Drawer
34 Side Panel
35 Popover
36 Tooltip
37 Toast
38 Alert
39 Empty State
40 Loading
41 Skeleton
```

And so on.

---

# 5. But there is a critical NEXG requirement

We should **collect from libraries that work well with Expo / React Native**, because you have already decided that Expo is a major part of the stack.

So our priority should be:

```text
Expo / React Native
        ↓
React Native compatible
        ↓
Web compatible
        ↓
Platform-specific web
```

rather than collecting random Figma components that can't eventually become real NEXG components.

For example, the same conceptual component should ideally support:

```text
             NEXG BUTTON
                  │
        ┌─────────┴─────────┐
        ↓                   ↓
 React Native             Web
        │                   │
 Consumer              Merchant Portal
 Rider                 Host Portal
 Host                  Admin Portal
 Merchant              Monitoring
```

---

# 6. The first real deliverable

Phase 1 should produce **three artifacts**.

### `NEXG_COMPONENT_INVENTORY.md`

The architecture and taxonomy.

We have just created this.

### `NEXG_COMPONENT_CATALOG.md`

The numbered component catalogue.

Example:

```text
NEXG-CTL-BTN-001
Primary Button

Level: L1
Category: Controls
Subcategory: Buttons

Variants:
- Default
- Compact
- Full width
- Icon
- Loading
- Destructive

States:
- Default
- Pressed
- Focused
- Disabled
- Loading
- Success
- Error

Platforms:
- Expo
- React Native
- Web
```

### `NEXG_COLLECTION_REGISTER`

The actual research/collection database.

This is where we record **existing components we find**.

---

# 7. Phase 1 workflow

I would run the phase like this:

```text
                    PHASE 1
                       │
                       ▼
              DEFINE TAXONOMY
                       │
                       ▼
              BUILD REGISTER
                       │
                       ▼
             COLLECT SOURCES
                       │
                       ▼
            SCREEN COMPONENTS
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
            KEEP     ADAPT    REJECT
              │        │
              └────┬───┘
                   ▼
             MAP TO NEXG
                   │
                   ▼
             IDENTIFY GAPS
                   │
                   ▼
          PHASE 1 COMPLETE
```

---

# 8. And we should NOT collect everything at once

I'd do it in **waves**.

### Wave 1 — Universal

~50–100 candidates

- Buttons
- Inputs
- Typography
- Icons
- Navigation
- Cards
- Sheets
- Modals
- Lists
- Feedback
- Loading
- Date/time
- Search
- Upload

### Wave 2 — NEXG operational

~100–200 candidates

- Orders
- Delivery
- Maps
- Tracking
- Tables
- Analytics
- Financial
- Chat
- Notifications
- Property
- Booking

### Wave 3 — Product-specific

~150–300 candidates

Consumer:

- Discovery
- Commerce
- Checkout

Merchant:

- Catalog
- Orders
- Operations
- Finance

Rider:

- Delivery
- Navigation
- Earnings

Host:

- Property
- Guest
- Concierge

Admin:

- Platform control
- Configuration
- Governance

Monitoring:

- Infrastructure
- Alerts
- Incidents
- Observability

---

# 9. The important part: we collect the *best*, not the most

The target isn't:

> "Find 600 components."

It's:

> **Find the strongest existing building blocks for NEXG.**

One excellent date picker is better than ten mediocre ones.

One excellent bottom sheet is better than five similar implementations.

One excellent map foundation is better than three incompatible map systems.

---

# 10. What Phase 1 ultimately gives us

At the end we'll be able to say:

```text
NEXG needs:

412 reusable candidates

273 → Keep
84  → Adapt
31  → Compose
17  → Reference
7   → Reject
```

Then we know exactly what we're dealing with **before writing the component library**.

And more importantly:

```text
Existing ecosystem
       ↓
What we can reuse
       ↓
What we need to adapt
       ↓
What NEXG must build
       ↓
NEXG Component System
```

That is the point where **Phase 2 becomes dramatically easier**.

---

# PHASE 1 — STEP 1

So I suggest we start **right now with Wave 1: Universal Components**, beginning with:

**Foundation → Controls → Navigation → Surfaces → Feedback.**

For each one we'll identify the strongest existing libraries/resources, check whether they work with **Expo/React Native + web**, assess licensing and customization, and enter them into the NEXG collection register.

**We don't build anything yet. We collect first.**



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)