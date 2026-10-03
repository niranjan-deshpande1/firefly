import "server-only";
import { PrismaClient } from "@prisma/client";

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
