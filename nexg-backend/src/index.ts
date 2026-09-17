import "dotenv/config";
import express from "express";
import cors from "cors";
import { auth } from "./routes/auth.js";
import { adminSearch, discovery } from "./routes/discovery.js";
import { deliveries, rider, uploads } from "./routes/deliveries.js";
import { events, inbox, initEvents } from "./routes/events.js";
import { messages } from "./routes/messages.js";
import { apiLimiter, authLimiter } from "./ratelimit.js";
import {
  bookings,
  catalog,
  categories,
  customers,
  experiences,
  finance,
  ledger,
  media,
  merchants,
  orders,
  promos,
  requests,
  search,
  staff,
  units,
} from "./routes/domain.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "nexg-backend", version: "0.1.0" }));

// Domain routers — shared by Consumer / Merchant / Rider / Host / (later Admin)
// Auth is strictly limited (credential stuffing); everything else lenient (fast-fail).
app.use("/auth", authLimiter, auth);
app.use("/categories", apiLimiter, categories);
app.use("/merchants", apiLimiter, merchants);
app.use("/catalog", apiLimiter, catalog);
app.use("/experiences", apiLimiter, experiences);
app.use("/search", apiLimiter, search);
app.use("/orders", apiLimiter, orders);
app.use("/bookings", apiLimiter, bookings);
app.use("/requests", apiLimiter, requests);
app.use("/promos", apiLimiter, promos);
app.use("/customers", apiLimiter, customers);
app.use("/finance", apiLimiter, finance);
app.use("/staff", apiLimiter, staff);
app.use("/units", apiLimiter, units);
app.use("/media", apiLimiter, media);
app.use("/uploads", apiLimiter, uploads);
app.use("/deliveries", apiLimiter, deliveries);
app.use("/rider", apiLimiter, rider);
app.use("/ledger", apiLimiter, ledger);
app.use("/discovery", apiLimiter, discovery);
app.use("/admin", apiLimiter, adminSearch);
app.use("/events", apiLimiter, events);
app.use("/inbox", apiLimiter, inbox);
app.use("/messages", apiLimiter, messages);

// Centralized error shape: { error } + status codes, no blank failures
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "internal" });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, async () => {
  console.log(`nexg-backend listening on :${port}`);
  // Pool warmup: pg establishes connections lazily, and the first handshake is
  // seconds-slow through Docker Desktop networking. Pre-open a few so the first
  // burst never pays 20x serial handshake convoy (perf 2026-09-14: 116s first
  // burst -> warm). Best-effort: never fail boot.
  try {
    const t = Date.now();
    const { pool } = await import("./db.js");
    await Promise.all(Array.from({ length: 5 }, () => pool.query("SELECT 1")));
    console.log(`pg pool warm (5 conns in ${Date.now() - t}ms)`);
  } catch (e) {
    console.error("pg pool warmup failed (continuing cold):", (e as Error).message);
  }
  void initEvents();
});

// A bad query must return 500, never kill the process (Express 4 drops async throws).
process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection (request already failed, process kept alive):", err);
});
