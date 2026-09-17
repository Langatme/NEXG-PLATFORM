---
name: system-design-notes
description: Reference library of 28 system design deep-dives (scaling, rate limiting, consistent hashing, queues, payments, chat, maps, monitoring, etc.). Use when designing backend architecture, picking data stores, sizing capacity, or reviewing scalability of any NEXG surface.
---

# System Design Notes

Local reference library cloned to `C:\Users\lenovo\Desktop\system-design-notes`
(source: https://github.com/liquidslr/system-design-notes).
Consult it BEFORE proposing architecture, NOT from memory.

## Contents

01 Scaling · 02 Back Of the Envelope Estimation · 03 System Design Framework ·
04 Rate Limiter · 05 Consistent Hashing · 06 Key-Value Store · 07 Unique-Id Generator ·
08 URL Shortener · 09 Web Crawler · 10 Notification System · 11 News Feed System ·
12 Chat System · 13 Search Autocomplete · 14 Youtube · 15 Google Drive ·
16 Proximity Service · 17 Nearby Friends · 18 Google Maps ·
19 Distributed Message Queue · 20 Metrics Monitoring and Alerting System ·
21 Ad Click Event Aggregation · 22 Hotel Reservation System · 23 Distributed Email Service ·
24 S3-like Object Storage · 25 Real-time Gaming Leaderboard · 26 Payment System ·
27 Digital Wallet · 28 Stock Exchange

## When to Use

- Designing or reviewing any backend/API/data decision in `nexg-backend/`
- Capacity planning, back-of-envelope math, rate limits, idempotency, queues
- Choosing between Postgres/pgvector/MinIO/SSE/polling vs alternatives
- NEXG analogues: Chat System → messaging threads; Google Maps/Proximity →
  rider tracking + merchant discovery; Notification System → inbox/SSE fan-out;
  Hotel Reservation → host bookings + overlap guards; Payment/Digital Wallet →
  M-Pesa + promos + payouts; Metrics/Monitoring → ops-workspace; URL Shortener →
  QR guest links; Search Autocomplete → `/search/suggestions`

## Process

1. Map the task to one of the 28 topics above (or the closest analogue).
2. Read the matching folder under `C:\Users\lenovo\Desktop\system-design-notes\`
   with the Read tool — quote file paths and key numbers in your answer.
3. Apply its framework explicitly: requirements → estimation → API/data model →
   high-level design → deep dives → bottlenecks. State which step drove each decision.
4. Check against NEXG constraints before finalizing: monolith-first, domain REST
   (no screen-APIs), every mutation emits hash-chained NCL, scope-before-data,
   15s poll contract, Postgres 16 + pgvector + MinIO already chosen.

## Rationalizations (don't)

- "I know how rate limiters work" → still open folder 04 and cite it.
- "NEXG is too small for this" → do the envelope math (folder 02) and show why.
- "I'll design first, reference later" → reference first; design second.

## Verification

- Answer cites the specific notes folder + file used.
- Numbers shown (QPS, storage, bandwidth) with arithmetic, not adjectives.
- Decision lists what was adopted AND what was deliberately skipped, with reasons.
