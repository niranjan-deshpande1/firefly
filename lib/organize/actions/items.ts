"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { auditHackathon, guarded, managedForAction, revalidateHackathon } from "../guard";
import { criterionSchema, formObject, invalid, prizeSchema, resourceSchema, scheduleItemSchema, type ActionResult } from "../schemas";

const NOT_FOUND: ActionResult = { ok: false, error: "that row was not found, reload the page and try again." };

type ItemKind = "prize" | "schedule" | "criterion" | "resource";

/**
 * Create when there is no id; otherwise update only a row that belongs to this hackathon.
 * `write` returns the touched row id, or null when no row of this hackathon matched.
 */
async function upsert(
  form: FormData,
  kind: ItemKind,
  write: (hackathonId: string) => Promise<string | null>,
  message: string,
  removed = false,
): Promise<ActionResult> {
  return guarded(async () => {
    const { user, hackathon } = await managedForAction(form);
    const itemId = await write(hackathon.id);
    if (!itemId) return NOT_FOUND;
    await auditHackathon(user.id, removed ? "HACKATHON_ITEM_REMOVED" : "HACKATHON_ITEM_SAVED", hackathon.id, { kind, itemId });
    revalidateHackathon(hackathon.slug);
    return { ok: true, message };
  });
}

export async function savePrize(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = prizeSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  const { id, value, ...rest } = parsed.data;
  const data = { ...rest, valueCents: value };
  return upsert(
    form,
    "prize",
    async (hackathonId) =>
      id
        ? (await prisma.prize.updateMany({ where: { id, hackathonId }, data })).count > 0 ? id : null
        : (await prisma.prize.create({ data: { ...data, hackathonId }, select: { id: true } })).id,
    "prize saved",
  );
}

export async function saveScheduleItem(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = scheduleItemSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  const { id, ...data } = parsed.data;
  return upsert(
    form,
    "schedule",
    async (hackathonId) =>
      id
        ? (await prisma.scheduleItem.updateMany({ where: { id, hackathonId }, data })).count > 0 ? id : null
        : (await prisma.scheduleItem.create({ data: { ...data, hackathonId }, select: { id: true } })).id,
    "schedule saved",
  );
}

export async function saveCriterion(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = criterionSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  const { id, ...data } = parsed.data;
  return upsert(
    form,
    "criterion",
    async (hackathonId) =>
      id
        ? (await prisma.judgingCriterion.updateMany({ where: { id, hackathonId }, data })).count > 0 ? id : null
        : (await prisma.judgingCriterion.create({ data: { ...data, hackathonId }, select: { id: true } })).id,
    "criterion saved",
  );
}

export async function saveResource(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = resourceSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  const { id, ...data } = parsed.data;
  return upsert(
    form,
    "resource",
    async (hackathonId) =>
      id
        ? (await prisma.resource.updateMany({ where: { id, hackathonId }, data })).count > 0 ? id : null
        : (await prisma.resource.create({ data: { ...data, hackathonId }, select: { id: true } })).id,
    "resource saved",
  );
}

const removeSchema = z.object({
  id: z.string().min(1).max(64),
  kind: z.enum(["prize", "schedule", "criterion", "resource"]),
});

/** Removes one prize, schedule item, criterion or resource that belongs to this hackathon. */
export async function removeItem(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = removeSchema.safeParse(formObject(form));
  if (!parsed.success) return NOT_FOUND;
  const { id, kind } = parsed.data;
  return upsert(
    form,
    kind,
    async (hackathonId) => {
      const where = { id, hackathonId };
      const del =
        kind === "prize"
          ? prisma.prize.deleteMany({ where })
          : kind === "schedule"
            ? prisma.scheduleItem.deleteMany({ where })
            : kind === "criterion"
              ? prisma.judgingCriterion.deleteMany({ where })
              : prisma.resource.deleteMany({ where });
      return (await del).count > 0 ? id : null;
    },
    `${kind === "schedule" ? "schedule item" : kind} removed`,
    true,
  );
}
