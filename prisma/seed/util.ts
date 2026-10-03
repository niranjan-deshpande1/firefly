// Shared seed helpers. Every date is relative to the moment the seed runs,
// so timelines look current whenever `npm run demo:reset` is run.
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const NOW = new Date();
const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

/** `days` from now (negative = past), optionally at a fixed UTC hour. */
export function daysFromNow(days: number, utcHour?: number): Date {
  const d = new Date(NOW.getTime() + days * DAY);
  if (utcHour !== undefined) d.setUTCHours(utcHour, 0, 0, 0);
  return d;
}

export function hoursFromNow(hours: number): Date {
  return new Date(NOW.getTime() + hours * HOUR);
}

/** Deterministic pseudo-random hex so seeded shas and blind codes are stable across runs. */
export function hex(seed: string, length: number): string {
  let h = 2166136261;
  let out = "";
  while (out.length < length) {
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= out.length;
    out += (h >>> 0).toString(16).padStart(8, "0");
  }
  return out.slice(0, length);
}

export const json = (value: unknown) => JSON.stringify(value);

export const email = (username: string) => `${username}@example.test`;
