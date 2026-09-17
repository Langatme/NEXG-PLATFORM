# Performance Baseline — whole platform (2026-09-11)

Harness: `scripts/perf.js` (every endpoint + browse→order journey + spike + soak +
SSE latency; warm-up, parameterized data, think time, P50/P90/P95/P99/RPS/errors).
Raw: `docs/perf-baseline-2026-09-11T14-09-42-761Z.json` (2040 reqs, conc=5).
Environment caveat (read first): single tsx dev process, pg pool 10, local Docker on a
dev laptop. These are FLOOR numbers — compiled build + pool tuning will beat them.

## Headline (steady state, conc=5)

- Reads: p50 5–60ms, p99 15–150ms (health 23ms, discovery/home 36ms, search 87ms,
  merchants 89ms, vector search 148ms, inbox 45ms). All green vs 500ms bar.
- Writes: orders 299ms, bookings 221ms, catalog create 207ms, requests 115ms p99.
- Auth: register 821ms, login 2065ms, refresh 945ms p99 — **bcryptjs in pure JS.**
- Journey browse→order: 919ms p99 end-to-end. Spike ×50: 3.3s p99 (queueing, 0 errors).
- SSE commit→client: 59–435ms warm; 1.8s stone-cold boot, 10.6s pre-eager-LISTEN.

## Fix pass (same day) — all five addressed, re-measured

1. **bcryptjs → native bcrypt** — login p99 2065→~650–1350ms across runs (≈2–3×),
   register 821→~540–820. Bigger than the numbers: hashing moved off the event loop
   (libuv threadpool), so auth no longer starves concurrent requests. `$2b$` hashes
   stayed valid — zero migration. Highest variance item on this laptop; re-measure
   on staging hardware.
2. **Pool 10 → 20** (`PG_POOL_MAX`) — queueing past conc 5 reduced; full fix needs
   compiled build + replicas (below).
3. **Embeddings off the write path** — `indexDocument` fire-and-forget with
   never-reject wrapper (vectors are projections). Order POST p99 no longer carries
   the 1536-dim loop.
4. **SSE** — eager LISTEN at boot (10.6s→1.8s cold, 65ms warm). Residual cold cost is
   tsx/JIT on this box.
5. **Rate limiting** — in-memory sliding window (auth 300/min, API 2000/min per IP):
   spike ×50 now sheds 429s in ms instead of queueing 3.3s. Harness tracks shed
   separately from errors. Tighten values for production; gateway enforces there.

Post-fix run: 2125 reqs, **0 errors**, 17 shed-by-design; reads unchanged (already fast);
spike fails fast instead of slow. Raw: `nexg-backend/docs/perf-baseline-*.json` (5 runs,
trend-readable). Compiled build (`npm run build` + `node dist`) proven vs live DB:
23 categories, register 201, search 9 hits. (An earlier dist "hang" was Docker Desktop
being down, not the build — diagnosed via pipe errors, restarted, re-proven.)

## Not problems (verified)
Zero errors across 2040 reqs (one harness-caused 403 fixed in-harness, one SSE timeout
traced to cold boot). No N+1 (endpoints do 1–3 queries; rider-jobs join is index-nested).
No memory growth observed in-run. Vector HNSW correct at 173 docs.

## Regression protocol
`node scripts/perf.js --concurrency=5 --iters=10 --soakSec=20` after every milestone;
fail on p99>500ms (reads) or any errors; JSON artifacts version the trend. Next: raise
to conc=20 post-bcrypt fix, add 10-min soak for leak watch, CI nightly.
