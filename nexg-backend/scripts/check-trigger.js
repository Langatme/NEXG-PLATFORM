const { Client } = require("pg");

(async () => {
  const c = new Client({
    connectionString:
      process.env.DATABASE_URL ??
      "postgres://nexg:nexg_dev_password@localhost:5433/nexg",
  });
  await c.connect();
  const t = await c.query(
    "SELECT tgname FROM pg_trigger WHERE tgrelid = 'ncl_events'::regclass AND NOT tgisinternal"
  );
  console.log("triggers:", JSON.stringify(t.rows));
  // Live fire test: listen, insert probe row, expect notification
  const cs =
    process.env.DATABASE_URL ??
    "postgres://nexg:nexg_dev_password@localhost:5433/nexg";
  const l = new Client({ connectionString: cs });
  await l.connect();
  await l.query("LISTEN nexg_events");
  const got = new Promise((resolve) => {
    l.on("notification", (m) => resolve(m.payload));
    setTimeout(() => resolve("TIMEOUT"), 5000);
  });
  await c.query(
    `INSERT INTO ncl_events (actor_type, actor_id, event_type, entity_type, entity_id, new_state)
     VALUES ('system','probe','probe.ping','probe','probe-1','{}')`
  );
  console.log("notify payload:", await got);
  await c.query(`DELETE FROM ncl_events WHERE entity_id = 'probe-1'`);
  await l.end();
  await c.end();
})().catch((e) => {
  console.error("TRIG_FAIL", e.message);
  process.exit(1);
});
