# NEXG Asset Plan — 3D icons + Nairobi imagery (v1.0)

> Status: PLAN (approved direction: AI-generate full set). No binaries committed yet.
> Owner: App dev + Backend (pipeline). Target: before SEED_42 merchant fill.
> Rule: consistency is the requirement — one style prompt, one art direction per category.

## 0. Objective

Every one of the 21 categories ships a **consistent 3D icon** plus **hyper-realistic
Nairobi imagery** (merchants shot in **Kilimani context**). Tiles within a category
read as a family; categories read as distinct. No stretched stock, no mixed styles.

## 1. 3D icon set (21 icons, one prompt)

Locked style prompt (do not vary per category — vary subject only):

> `premium 3D app icon, soft clay render, [SUBJECT], warm neutral background
> (#F6F6F4), subtle floor shadow, 45-degree three-quarter view, rounded forms,
> muted NEXG palette (ink #131316, accent #00A26B), centered, no text, 1024x1024`

Subjects: 🔞 adults parcel · 🛫 plane-window · 🍷 wine glasses · 👗 dress form ·
💄 lipstick · 🚗 hatchback · 🎭 masks · 🏦 bank · 💐 bouquet · 🍔 burger ·
🛒 basket · 🧺 laundry stack · 🏬 storefront · 💊 pill bottle · 🏥 clinic cross ·
📱 phone · 🧳 safari jeep · 🔧 wrench · 🧘 figure · 🛎️ bell · 📦 parcels.

- Output: `assets/icons-3d/{category_id}.png` (source) → downscaled 256/128/64.
- Categories table gets `icon_3d_key` (migration `015_asset_keys`, nullable until cutover).
- Fallback stays: `accentEmoji` payout tile in `NexGMedia` (already designed — never blank).

## 2. Photo packs (per category, Kilimani merchants)

- **Per category:** ≥6 hero-grade images (hyper-realistic Nairobi: light, streetscapes,
  interiors, people, food). Same grade + color temp within a pack.
- **Per merchant (42):** 1 hero + 3–5 gallery + logo mark. Kilimani context:
  recognizable high-rise/trees/café fronts; budget lane = vibrant/street, premium
  lane = calm/interior (matches merchant lanes in SEED_42).
- **Item images:** food merchants get per-signature-dish shots; services get
  1 representative image per section (not per item — 1,700 bespoke item photos
  is out of scope; section-level + emoji tile covers the rest).

## 3. Pipeline (DB-first, matches media rule)

1. Sources versioned: `assets-source/{icons,photos}/...` (git-LFS later if heavy; local first).
2. Upload via `POST /uploads/presign` → MinIO `nexg-media` bucket now.
3. Variants: thumb/small/medium/large (USER_FLOWS media rule); `media_assets` rows
   via `POST /media` (CB-04 contract); merchants reference `hero_image_key`.
4. Cutover: `CDN_URL` replaces MinIO host; re-index media URLs; assert no `media://`
   in API output (HANDOFF exit gate).

## 4. Acceptance

- [ ] 21/21 icons render at 64px legibly, same family at a glance
- [ ] 42/42 merchants resolve a hero (DB-backed, zero black tiles on airplane re-entry)
- [ ] `SELECT COUNT(*) FROM media_assets` covers every merchant + category
- [ ] Light + dark tiles both designed (tint rule in `NexGMedia` unchanged)

## 5. Rollback

Emoji tiles remain the payout state — deleting any asset row degrades to the
designed tile, never a hole. No code rollback needed.
