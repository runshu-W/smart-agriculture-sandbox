import pg from "pg";
import { spawnSync } from "node:child_process";

const password = process.env.DEMO_PASSWORD;
if (!password || password.length < 16 || password === "SmartAgri2026!") {
  throw new Error("Set DEMO_PASSWORD to a new password of at least 16 characters before initialization.");
}
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  // Avoid both concurrent initializers and destructive re-seeding of a live database.
  const lock = await client.query("SELECT pg_try_advisory_lock(830126) AS locked");
  if (!lock.rows[0].locked) throw new Error("Another initializer is running.");
  const result = await client.query('SELECT (SELECT count(*) FROM "User") + (SELECT count(*) FROM "Unit") + (SELECT count(*) FROM "ClassRoom") AS count');
  if (Number(result.rows[0].count) !== 0) throw new Error("Database already contains data. Initialization refused; use migrations only.");
  const child = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "prisma/seed.ts"], { stdio: "inherit", env: process.env });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error("Initialization failed. Inspect the database before retrying.");
} finally {
  await client.end();
}
