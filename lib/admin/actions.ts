"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { BillingError, canTransition, formatCents, markInvoicePaid } from "@/lib/billing";
import { getSettings, saveSettings } from "@/lib/settings";
import { ForbiddenError, authorize, requireRoleForAction } from "@/lib/permissions";
import { anonymizeUser } from "./data-requests";
import { fieldErrors, resolveRequestSchema, settingsFormSchema, settingsFromForm } from "./forms";

export type ActionResult = { ok: true; message: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

const idSchema = z.string().min(1).max(64);

async function requireAdmin(action: "admin.access" | "invoice.markPaid") {
  const user = await requireRoleForAction("ADMIN");
  await authorize(user, action);
  return user;
}

function failure(error: unknown, fallback: string): ActionResult {
  if (error instanceof BillingError || error instanceof ForbiddenError) return { ok: false, error: error.message };
  console.error(error);
  return { ok: false, error: fallback };
}

function revalidateBilling() {
  revalidatePath("/admin");
  revalidatePath("/admin/invoices");
  revalidatePath("/company/billing");
}

export async function markInvoicePaidAction(invoiceId: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(invoiceId);
  if (!parsed.success) return { ok: false, error: "that invoice id is not valid, reload invoices and try again." };
  try {
    const user = await requireAdmin("invoice.markPaid");
    const invoice = await markInvoicePaid(parsed.data, user.id);
    revalidateBilling();
    return { ok: true, message: `invoice ${invoice.number} marked paid` };
  } catch (error) {
    return failure(error, "the invoice was not marked paid, try again.");
  }
}

/** Issues a draft invoice: DRAFT to SENT, with the invoice email to the company owner. */
export async function markInvoiceSentAction(invoiceId: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(invoiceId);
  if (!parsed.success) return { ok: false, error: "that invoice id is not valid, reload invoices and try again." };
  try {
    const user = await requireAdmin("invoice.markPaid");
    const invoice = await prisma.invoice.findUnique({
      where: { id: parsed.data },
      include: { company: { include: { members: { where: { isOwner: true }, include: { user: { select: { email: true } } } } } } },
    });
    if (!invoice) return { ok: false, error: "that invoice does not exist, return to invoices." };
    if (!canTransition(invoice.status, "SENT")) return { ok: false, error: `a ${invoice.status.toLowerCase()} invoice can't be sent, reload invoices.` };
    await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "SENT", issuedAt: new Date() } });
    // ponytail: no INVOICE_SENT audit action exists; issuing is recorded as INVOICE_CREATED with event "issued".
    await audit({ actorId: user.id, action: "INVOICE_CREATED", resourceType: "Invoice", resourceId: invoice.id, metadata: { event: "issued", type: invoice.type } });
    const to = invoice.company.members[0]?.user.email;
    if (to) {
      await sendEmail(to, "invoiceIssued", { company: invoice.company.name, number: invoice.number, amount: formatCents(invoice.amountCents), nonRefundable: invoice.nonRefundable });
    }
    revalidateBilling();
    return { ok: true, message: `invoice ${invoice.number} sent` };
  } catch (error) {
    return failure(error, "the invoice was not sent, try again.");
  }
}

export async function resolveDataRequestAction(input: { id: string; outcome: "COMPLETED" | "REJECTED"; note?: string }): Promise<ActionResult> {
  const parsed = resolveRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "that request could not be read, reload data requests and try again." };
  try {
    const user = await requireAdmin("admin.access");
    const request = await prisma.dataRequest.findUnique({ where: { id: parsed.data.id } });
    if (!request) return { ok: false, error: "that request does not exist, return to data requests." };
    if (request.status !== "OPEN") return { ok: false, error: "that request is already resolved, reload data requests." };
    if (request.kind === "DELETE" && parsed.data.outcome === "COMPLETED" && request.userId === user.id) {
      return { ok: false, error: "you can't delete your own account from here, ask another operator." };
    }

    let filesDeleted = 0;
    if (request.kind === "DELETE" && parsed.data.outcome === "COMPLETED") {
      ({ filesDeleted } = await anonymizeUser(request.userId));
    }
    await prisma.dataRequest.update({
      where: { id: request.id },
      data: { status: parsed.data.outcome, note: parsed.data.note || request.note, resolvedById: user.id, resolvedAt: new Date() },
    });
    await audit({
      actorId: user.id,
      action: "DATA_REQUEST_RESOLVED",
      resourceType: "DataRequest",
      resourceId: request.id,
      subjectUserId: request.userId,
      metadata: { kind: request.kind, status: parsed.data.outcome, filesDeleted },
    });
    revalidatePath("/admin/data-requests");
    revalidatePath("/admin/audit");
    revalidatePath("/admin");
    const done = request.kind === "DELETE" ? "account data deleted" : "export marked done";
    return { ok: true, message: parsed.data.outcome === "COMPLETED" ? done : "request declined" };
  } catch (error) {
    return failure(error, "the request was not resolved, try again.");
  }
}

export async function saveSettingsAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = settingsFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "some settings need a fix, see the fields below.", fieldErrors: fieldErrors(parsed.error) };
  try {
    const user = await requireAdmin("admin.access");
    const before = await getSettings();
    const after = await saveSettings(settingsFromForm(parsed.data));
    await audit({ actorId: user.id, action: "SETTINGS_CHANGED", resourceType: "AppSetting", metadata: { before, after } });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/audit");
    return { ok: true, message: "settings saved" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const byStoredKey = fieldErrors(error);
      const rename: Record<string, string> = { flatFeeCents: "flatFee", hireFeeBps: "hireFeePercent" };
      const errors = Object.fromEntries(Object.keys(byStoredKey).map((k) => [rename[k] ?? k, "that value is out of range, enter a smaller number."]));
      return { ok: false, error: "some settings are out of range, see the fields below.", fieldErrors: errors };
    }
    return failure(error, "the settings were not saved, try again.");
  }
}
