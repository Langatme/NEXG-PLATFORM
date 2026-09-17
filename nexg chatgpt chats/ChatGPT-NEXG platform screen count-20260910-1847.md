# NEXG platform screen count

**User:** Anonymous  
**Created:** 8/9/2026 11:50:16  
**Updated:** 8/9/2026 11:51:38  
**Exported:** 9/10/2026 18:47:55  
**Link:** [https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a783f0c-e688-83ea-a694-823c2ba10afe](https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a783f0c-e688-83ea-a694-823c2ba10afe)  

## Prompt:
8/9/2026, 11:50:14 AM

I am interested in the number of screens on each and every platform

## Response:
8/9/2026, 11:50:15 AM

Yes. If you're asking **how many actual screens we should expect to build for every NEXG platform**, I would count them systematically rather than treating every modal, widget expansion, or state as a separate screen.

The Phase 5 document explicitly frames NEXG as **Consumer, Merchant, Host, Rider + portals**, with the same entities expressed from different perspectives. `Branch · UX Design Laws.txt`

For NEXG, I would currently estimate the following **before we start implementing every edge case**:

| Platform | Mobile app | Web portal | Estimated core screens |
|---|---:|---:|---:|
| **NEXG Consumer** | iOS + Android | - | **25-35** |
| **Merchant** | iOS + Android | Merchant Portal | **35-50 app + 20-30 web** |
| **Rider** | iOS + Android | Rider Portal | **25-35 app + 15-20 web** |
| **Host / Property Manager** | iOS + Android | Host Portal | **30-40 app + 20-30 web** |
| **NEXG Admin / Operations** | - | Admin Console | **30-45** |
| **NEXG internal/support** | - | Support/Operations surfaces | **10-20** |

### Rough total

That puts the first serious NEXG ecosystem around:

**~190-275 core screens/screen compositions.**

But-and this is important-we **should not build 190-275 completely unique screens**.

The whole point of the NEXG system we're designing is that many of these are **compositions of the same reusable primitives, widgets, entities and scenes**.

For example:

**Order**

```text
Consumer
    ↓
Order screen

Merchant
    ↓
Order workspace

Rider
    ↓
Delivery task

Admin
    ↓
Order investigation
```

That's potentially **4 different screens**, but they're all built around the same underlying:

```text
NEXG ORDER
├── Order identity
├── Items
├── Customer
├── Merchant
├── Payment
├── Status
├── Timeline
├── Location
├── Actions
└── Activity
```

This is exactly the cross-app consistency principle in the document: the same entity should feel like the same NEXG entity across products. `Branch · UX Design Laws.txt`

### And then there are "screens" that I would NOT count separately

For example:

```text
Home
 ├── Order widget
 │    ├── Compact
 │    ├── Expanded
 │    └── Focused
 │
 ├── Revenue widget
 │    ├── Loading
 │    ├── Loaded
 │    ├── Updating
 │    └── Error
 │
 └── Activity widget
```

Those are **states/components**, not six additional screens.

Likewise:

```text
Login
 ├── Enter phone
 ├── OTP
 ├── Verify
 ├── Error
 └── Success
```

I'd treat that as **one authentication flow/scene**, not five screens for purposes of estimating the design system.

---

## The more useful number for NEXG

I think we should actually track **four different numbers**:

### 1. Platforms

Probably:

**5 major product surfaces**

```text
1. Consumer
2. Merchant
3. Rider
4. Host
5. Admin
```

### 2. Applications

Because mobile/web matters:

```text
Consumer App
Merchant App
Merchant Portal
Rider App
Rider Portal
Host App
Host Portal
Admin Console
```

So approximately **8 applications/surfaces**.

### 3. Core scenes/screens

Approximately:

**190-275 initially**

but we should establish the exact number during Phase 1.

### 4. Reusable system components

This is the really important number.

Instead of building 200 isolated screens, we might have something like:

```text
FOUNDATIONS
    ~50-100

PRIMITIVES
    ~50-80

COMPOSITE COMPONENTS
    ~80-120

WIDGETS
    ~50-80

SCENES
    ~40-70

ENTITY WORKSPACES
    ~20-30

FLOWS
    ~30-50
```

The exact numbers should **come from our Phase 1 inventory**, not be invented upfront.

And that is actually what your uploaded Phase 5 architecture points toward: first **Collect**, then **Normalize**, then **Build**, then **Compose**. `Branch · UX Design Laws.txt`

### So I wouldn't start coding 200 screens.

I'd start with:

**Phase 1 → enumerate every screen/scene for every NEXG platform → identify which ones are genuinely unique → identify shared entities → identify reusable widgets → identify reusable flows.**

Then we can produce a definitive document like:

**`NEXG_SCREEN_INVENTORY.md`**

with something like:

```text
NEXG SCREEN INVENTORY

01 CONSUMER
   01.01 Launch
   01.02 Authentication
   01.03 Home
   01.04 Search
   01.05 Discovery
   01.06 Merchant
   01.07 Product
   01.08 Cart
   01.09 Checkout
   01.10 Payment
   01.11 Order
   ...

02 MERCHANT APP
   ...

03 MERCHANT PORTAL
   ...

04 RIDER APP
   ...

05 RIDER PORTAL
   ...

06 HOST APP
   ...

07 HOST PORTAL
   ...

08 ADMIN
   ...
```

**That would give us the actual number**, rather than an estimate.

And given how far we've already gone with the NEXG component system, I think **this is the right next Phase 1 artifact to create**: a complete screen-by-screen inventory for all 8 surfaces, including authentication, onboarding, home/workspace, CRUD, settings, payments, notifications, errors, empty states, and entity workspaces.

## Prompt:
8/9/2026, 11:51:30 AM

What’s the cost of generating an image on the 200 dollar plan

## Response:
8/9/2026, 11:51:31 AM

> **Searching the web**
>
> [What is ChatGPT Plus? | OpenAI Help Center](https://help.openai.com/en/articles/6950777-chatgpt-plus-)
> [Introducing ChatGPT Go, now available worldwide | OpenAI](https://openai.com/index/introducing-chatgpt-go/)
>
> **Searched 2 websites**
>
> 
>
> Worked for a couple of seconds

If you mean **ChatGPT Pro at $200/month**, there isn't a published fixed **“$X per image”** charge for your personal subscription.

The important distinction is:

- **Your $200 Pro subscription includes image generation.**
- You **don't pay an additional dollar amount for each image** under normal included usage.
- Pro $200 has **20× the usage allowance of Plus** overall, although OpenAI does not publish a simple “you get exactly N images per month” number for Pro. ([OpenAI Help Center](https://help.openai.com/en/articles/9793128-what-is-chatgpt-pro%25252525252525252525252525252525252525252525252525252525252525252525253F.gz?utm_source=chatgpt.com))
- ChatGPT Images 2.0 is available on Pro, including **images with thinking**. ([OpenAI Help Center](https://help.openai.com/en/articles/11084440-chatgpt-image-library?_bhlid=b1de3ce90fdf61589dde45b2bffec1dda444a947&utm_source=chatgpt.com))

So for your NEXG work, if you're asking:

> **“If I generate 500 UI mockup images, am I spending $500 on images?”**

**No.** You aren't charged $1 per image. You're consuming your Pro plan's included image-generation allowance.

The exact practical limit can vary, and ChatGPT will tell you when you've hit an applicable usage limit. OpenAI currently doesn't give a public fixed monthly image count for the $200 Pro plan. ([OpenAI Help Center](https://help.openai.com/en/articles/9793128-what-is-chatgpt-pro%25252525252525252525252525252525252525252525252525252525252525252525253F.gz?utm_source=chatgpt.com))

**For what we're doing with NEXG**, this is actually important: we can use image generation quite heavily for things like **screen exploration, UI concepts, merchant/host/rider interfaces, branding, physical plaques, character concepts, etc.** without treating every generated image as a separate purchase.

---

**Sources:**

- [About ChatGPT Pro tiers | OpenAI Help Center](https://help.openai.com/en/articles/9793128-what-is-chatgpt-pro%25252525252525252525252525252525252525252525252525252525252525252525253F.gz?utm_source=chatgpt.com)



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)