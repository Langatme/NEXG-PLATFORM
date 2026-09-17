# Dynamic Merchant Menu Data

**User:** Anonymous  
**Created:** 8/25/2026 12:34:39  
**Updated:** 8/25/2026 12:35:16  
**Exported:** 9/10/2026 18:41:26  
**Link:** [https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a8d61a0-ab0c-83ea-a72d-2c35f1bcd8ab](https://chatgpt.com/g/g-p-6a1d83cf5a808191bbb4e88799d4517f/c/6a8d61a0-ab0c-83ea-a72d-2c35f1bcd8ab)  

## Prompt:
8/25/2026, 12:34:35 PM

a one time how do we get simple data for todays meeeting so each category and subcategory has a merchant with a menu and merch dispayed dynamically using reusuable components

## Response:
8/25/2026, 12:34:39 PM

Yes. For **today’s meeting**, don’t build a real catalog backend yet. Build a **single seed dataset** that already follows the architecture you want later.

The key is:

> **Category → Subcategory → Merchant → Offerings/Menu → Product/Service**

Then your UI never knows *which* merchant or category it is rendering. It just receives data and uses reusable components.

Your design-system document explicitly pushes this direction: components should be reusable while experiences remain contextual, and the system should be able to absorb a “new merchant category” without rebuilding the interface. `Branch · UX Design Laws.txt`

### The simplest structure

```text
categories
   │
   ├── category
   │      └── subcategories
   │              └── merchant
   │                      └── offerings
   │
   └── category
          └── subcategories
                  └── merchant
                          └── offerings
```

For example:

```text
Food & Dining
└── Restaurants
    └── The Olive Garden
        ├── Burgers
        │   ├── Beef Burger       KSh 850
        │   └── Chicken Burger    KSh 750
        ├── Pizza
        │   ├── Margherita        KSh 900
        │   └── Pepperoni         KSh 1,200
        └── Drinks
            ├── Coke              KSh 200
            └── Fresh Juice        KSh 300
```

Then another:

```text
Beauty
└── Hair & Barber
    └── Urban Cuts
        ├── Haircut              KSh 500
        ├── Beard Trim           KSh 300
        └── Haircut + Beard      KSh 700
```

**Same components. Completely different data.**

---

## For the meeting, I would create just one `seed-data.ts`

Something roughly like:

```ts
export const nexgCatalog = {
  categories: [
    {
      id: "food",
      name: "Food & Dining",
      icon: "restaurant",

      subcategories: [
        {
          id: "restaurants",
          name: "Restaurants",

          merchants: [
            {
              id: "merchant-001",
              name: "The Olive Garden",
              image: "...",
              rating: 4.8,
              deliveryTime: "25-35 min",

              offerings: [
                {
                  id: "item-001",
                  category: "Burgers",
                  name: "Beef Burger",
                  description: "Grilled beef burger...",
                  price: 850,
                  image: "..."
                },
                {
                  id: "item-002",
                  category: "Burgers",
                  name: "Chicken Burger",
                  price: 750,
                  image: "..."
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

But I would actually make it **slightly more normalized** so you don't have to throw it away later.

### Better

```text
Category
Subcategory
Merchant
MenuCategory
Offering
```

with IDs connecting them:

```ts
categories
subcategories
merchants
menuCategories
offerings
```

That lets you do things like:

```ts
getMerchantsBySubcategory("restaurants")

getOfferingsByMerchant("merchant-001")

getOfferingsByCategory("food")

getMerchantsByCategory("beauty")
```

---

# The important part: reusable UI

You should build these components once:

```text
<CategoryCard />

<SubcategoryCard />

<MerchantCard />

<MerchantHeader />

<MenuSection />

<OfferingCard />

<Price />

<Rating />

<ServiceMeta />

<AddToCartButton />

<QuantityControl />
```

Then the screens become **composition**, not custom UI.

For example:

```tsx
<CategoryScreen
    category={category}
/>
```

internally:

```tsx
<SubcategoryList>
    {subcategories.map(subcategory => (
        <SubcategoryCard
            data={subcategory}
        />
    ))}
</SubcategoryList>
```

Then:

```tsx
<MerchantScreen
    merchant={merchant}
/>
```

renders:

```text
MerchantHeader
      ↓
Merchant information
      ↓
MenuSection
      ↓
OfferingCard
      ↓
OfferingCard
      ↓
MenuSection
      ↓
OfferingCard
```

---

# And this is where it gets powerful

You **don't create a different screen for every category**.

You create a **category configuration**.

For example:

```ts
{
  id: "airport-transfers",
  name: "Airport Transfers",

  experienceType: "transport",

  presentation: {
    primaryAction: "book",
    showDuration: true,
    showVehicle: true
  }
}
```

While:

```ts
{
  id: "restaurants",
  name: "Restaurants",

  experienceType: "food",

  presentation: {
    primaryAction: "add",
    showCuisine: true,
    showDeliveryTime: true
  }
}
```

Same underlying system.

Different behavior.

That follows the principle in your design system that **components are reusable while experiences are contextual**. `Branch · UX Design Laws.txt`

---

# For TODAY specifically

Don't waste the meeting trying to populate hundreds of merchants.

I'd seed:

**Every category**
→ at least **one subcategory**

**Every subcategory**
→ exactly **one demo merchant**

**Every demo merchant**
→ **5-10 realistic offerings**

So if you have, say, 15 categories × 4 subcategories, that's only ~60 demo merchants and perhaps 300-600 offerings.

The UI will *look* like the complete NEXG marketplace because everything is dynamically rendered.

### Your demo pipeline becomes

```text
SEED DATA
   ↓
Category
   ↓
Subcategory
   ↓
Merchant
   ↓
Menu
   ↓
Offering
   ↓
Reusable UI
```

And later:

```text
SEED DATA
      ↓
DATABASE / API
      ↓
SAME DATA SHAPE
      ↓
SAME COMPONENTS
      ↓
SAME SCREENS
```

**That is the trick.**

You are not building fake UI data that gets thrown away. You're building a **temporary data source with the same contract your production API will eventually satisfy**.

For the meeting, I'd therefore make the immediate deliverable **one canonical `nexg-catalog.ts` + a tiny catalog service layer + reusable dynamic components**. Then your Explore screen can dynamically show *every category, subcategory, merchant, and menu* without hardcoding any of them.



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)