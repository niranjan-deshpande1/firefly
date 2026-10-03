// Vercel build: the hosted deploy runs on Postgres while local dev stays on SQLite.
// 1. Write prisma/postgres/schema.prisma (the same models, provider swapped).
// 2. Generate the Prisma client from it and push the schema to the database (no data-loss changes).
// 3. Seed the fictional demo data when the database is empty, or when RESEED_DEMO=true.
// 4. next build.
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const url = process.env.DATABASE_URL ?? "";
// Schema push and seeding use the direct connection when Neon provides one (the pooler can't run DDL reliably).
const direct = process.env.DATABASE_URL_UNPOOLED || url;
const run = (cmd, env = {}) => execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

if (!/^postgres(ql)?:/.test(url)) {
  console.error("DATABASE_URL must be a Postgres connection string on Vercel. Add a Neon database in the Vercel Storage tab, then redeploy.");
  process.exit(1);
}

const schema = readFileSync("prisma/schema.prisma", "utf8").replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
mkdirSync("prisma/postgres", { recursive: true });
writeFileSync("prisma/postgres/schema.prisma", schema);

run("npx prisma generate --schema prisma/postgres/schema.prisma");
run("npx prisma db push --schema prisma/postgres/schema.prisma --skip-generate", { DATABASE_URL: direct });

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient({ datasourceUrl: direct });
const users = await prisma.user.count();
await prisma.$disconnect();
if (users === 0 || process.env.RESEED_DEMO === "true") {
  console.log(users === 0 ? "empty database, seeding the demo data" : "RESEED_DEMO=true, wiping and reseeding the demo data");
  run("npx tsx prisma/seed/index.ts", { DATABASE_URL: direct });
}

run("npx next build");
