import "server-only";
import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";

// ponytail: Vercel quick demo without a hosted database: copy the bundled seeded SQLite file to /tmp
// (the only writable dir). Changes last only as long as the serverless instance; use Postgres for real data.
if (process.env.VERCEL && !/^postgres(ql)?:/.test(process.env.DATABASE_URL ?? "")) {
  const tmp = "/tmp/demo.db";
  if (!existsSync(tmp)) copyFileSync(path.join(process.cwd(), "prisma", "demo.db"), tmp);
  process.env.DATABASE_URL = `file:${tmp}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Neon's default connection string goes through PgBouncer in transaction mode, which needs Prisma's
 * pgbouncer flag (no prepared statements). Added here so the Vercel env var can be used as given.
 */
function datasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || !/^postgres(ql)?:/.test(url) || !url.includes("-pooler") || url.includes("pgbouncer=")) return undefined;
  return `${url}${url.includes("?") ? "&" : "?"}pgbouncer=true`;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: datasourceUrl() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "./enums";
export * from "./json";
