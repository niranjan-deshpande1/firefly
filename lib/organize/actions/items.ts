"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { guarded, managedForAction, revalidateHackathon } from "../guard";
import { criterionSchema, formObject, invalid, prizeSchema, resourceSchema, scheduleItemSchema, type ActionResult } from "../schemas";

const NOT_FOUND: ActionResult = { ok: false, error: "that row was not found, reload the page and try again." };

/** Create when there is no id; otherwise update only a row that belongs to this hackathon. */
async function upsert(
  form: FormData,
  write: (hackathonId: string) => Promise<number>,
  message: string,
): Promise<ActionResult> {
  return guarded(async () => {
    const { hackathon } = await managedForAction(form);
    const count = await write(hackathon.id);
    if (count === 0) return NOT_FOUND;
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
    async (hackathonId) =>
      id
        ? (await prisma.prize.updateMany({ where: { id, hackathonId }, data })).count
        : (await prisma.prize.create({ data: { ...data, hackathonId } }), 1),
    "prize saved",
  );
}

export async function saveScheduleItem(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = scheduleItemSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  const { id, ...data } = parsed.data;
  return upsert(
    form,
    async (hackathonId) =>
      id
        ? (await prisma.scheduleItem.updateMany({ where: { id, hackathonId }, data })).count
        : (await prisma.scheduleItem.create({ data: { ...data, hackathonId } }), 1),
    "schedule saved",
  );
}

export async function saveCriterion(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = criterionSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  const { id, ...data } = parsed.data;
  return upsert(
    form,
    async (hackathonId) =>
      id
        ? (await prisma.judgingCriterion.updateMany({ where: { id, hackathonId }, data })).count
        : (await prisma.judgingCriterion.create({ data: { ...data, hackathonId } }), 1),
    "criterion saved",
  );
}

export async function saveResource(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = resourceSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  const { id, ...data } = parsed.data;
  return upsert(
    form,
    async (hackathonId) =>
      id
        ? (await prisma.resource.updateMany({ where: { id, hackathonId }, data })).count
        : (await prisma.resource.create({ data: { ...data, hackathonId } }), 1),
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
    async (hackathonId) => {
      const where = { id, hackathonId };
      if (kind === "prize") return (await prisma.prize.deleteMany({ where })).count;
      if (kind === "schedule") return (await prisma.scheduleItem.deleteMany({ where })).count;
      if (kind === "criterion") return (await prisma.judgingCriterion.deleteMany({ where })).count;
      return (await prisma.resource.deleteMany({ where })).count;
    },
    `${kind === "schedule" ? "schedule item" : kind} removed`,
  );
}
