import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { audit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { canTransition, formatCents, hireFeeCents, isWithinAttributionWindow } from "./math";

export * from "./math";

export class BillingError extends Error {}

type Tx = Prisma.TransactionClient;

// Next number after the highest issued this year (count + 1 would reuse a number if one were ever deleted).
async function nextInvoiceNumber(tx: Tx): Promise<string> {
  const year = new Date().getFullYear();
  const last = await tx.invoice.findFirst({ where: { number: { startsWith: `FF-${year}-` } }, orderBy: { number: "desc" }, select: { number: true } });
  const next = last ? Number(last.number.slice(-4)) + 1 : 1;
  return `FF-${year}-${String(next).padStart(4, "0")}`;
}

const isUniqueViolation = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

/** Runs a billing transaction; a unique clash (double submit or two invoices numbered at once) becomes a sentence. */
async function billingTransaction<T>(fn: (tx: Tx) => Promise<T>, duplicateMessage: string): Promise<T> {
  try {
    return await prisma.$transaction(fn);
  } catch (error) {
    if (isUniqueViolation(error)) throw new BillingError(duplicateMessage);
    throw error;
  }
}

/**
 * Enrolls a role into a hiring cohort and issues the flat-fee invoice in one transaction.
 * The fee is charged at enrollment and is non-refundable.
 */
export async function enrollRoleInCohort(params: { hackathonId: string; roleId: string; actorId: string }) {
  const settings = await getSettings();
  const result = await billingTransaction(async (tx) => {
    const [hackathon, role] = await Promise.all([
      tx.hackathon.findUnique({ where: { id: params.hackathonId } }),
      tx.role.findUnique({ where: { id: params.roleId }, include: { company: true } }),
    ]);
    if (!hackathon || hackathon.type !== "HIRING_COHORT") throw new BillingError("that hiring cohort does not exist, choose one from the list.");
    if (!role) throw new BillingError("that role does not exist, choose one of your roles.");
    if (hackathon.endsAt < new Date()) throw new BillingError("that hiring cohort has ended, choose an upcoming one.");
    const existing = await tx.cohortEnrollment.findUnique({ where: { hackathonId_roleId: { hackathonId: hackathon.id, roleId: role.id } } });
    if (existing) throw new BillingError("this role is already enrolled in that hiring cohort, open its shortlist instead.");

    const invoice = await tx.invoice.create({
      data: {
        number: await nextInvoiceNumber(tx),
        companyId: role.companyId,
        type: "FLAT_FEE",
        amountCents: settings.flatFeeCents,
        description: `hiring cohort fee: ${hackathon.title} (${role.title}). non-refundable.`,
        status: "SENT",
        nonRefundable: true,
        issuedAt: new Date(),
      },
    });
    const enrollment = await tx.cohortEnrollment.create({
      data: { hackathonId: hackathon.id, companyId: role.companyId, roleId: role.id, enrolledById: params.actorId, invoiceId: invoice.id },
    });
    return { enrollment, invoice, company: role.company };
  }, "this role is already enrolled in that hiring cohort, open its shortlist instead.");
  await audit({ actorId: params.actorId, action: "ENROLLMENT_CREATED", resourceType: "CohortEnrollment", resourceId: result.enrollment.id });
  await audit({ actorId: params.actorId, action: "INVOICE_CREATED", resourceType: "Invoice", resourceId: result.invoice.id, metadata: { type: "FLAT_FEE" } });
  await notifyInvoice(result.invoice.id);
  return result;
}

/** Records a reported hire and issues the hire-fee invoice (5% of reported first-year salary by default). */
export async function reportHire(params: { companyId: string; roleId: string; candidateId: string; salaryCents: number; startDate: Date; actorId: string }) {
  const settings = await getSettings();
  const amount = hireFeeCents(params.salaryCents, settings.hireFeeBps);
  const result = await billingTransaction(async (tx) => {
    const role = await tx.role.findUnique({ where: { id: params.roleId } });
    if (!role || role.companyId !== params.companyId) throw new BillingError("that role belongs to another company, choose one of your roles.");
    const already = await tx.hire.findFirst({ where: { roleId: params.roleId, candidateId: params.candidateId } });
    if (already) throw new BillingError("this hire is already reported for this role, open billing to see its invoice.");
    const entry = await tx.shortlistEntry.findFirst({
      where: { candidateId: params.candidateId, shortlist: { roleId: params.roleId } },
      select: { project: { select: { hackathon: { select: { endsAt: true } } } } },
    });
    if (!entry) throw new BillingError("that candidate is not on this role's shortlist, choose someone from the shortlist.");
    // ASSUMPTION (decisions log 3 and 21): the hire fee applies within the attribution window after cohort end.
    if (!isWithinAttributionWindow(entry.project.hackathon.endsAt, params.startDate, settings.attributionWindowMonths)) {
      throw new BillingError(`that start date is more than ${settings.attributionWindowMonths} months after the cohort ended, so no hire fee applies. tell the firefly team so we can record it.`);
    }
    const invoice = await tx.invoice.create({
      data: {
        number: await nextInvoiceNumber(tx),
        companyId: params.companyId,
        type: "HIRE_FEE",
        amountCents: amount,
        description: `hire fee: ${role.title}, ${settings.hireFeeBps / 100}% of ${formatCents(params.salaryCents)} first-year salary.`,
        status: "SENT",
        nonRefundable: false,
        issuedAt: new Date(),
      },
    });
    const hire = await tx.hire.create({
      data: {
        companyId: params.companyId,
        roleId: params.roleId,
        candidateId: params.candidateId,
        salaryCents: params.salaryCents,
        startDate: params.startDate,
        reportedById: params.actorId,
        invoiceId: invoice.id,
      },
    });
    await tx.shortlistEntry.updateMany({
      where: { candidateId: params.candidateId, shortlist: { roleId: params.roleId } },
      data: { status: "HIRED" },
    });
    return { hire, invoice };
  }, "this hire is already reported for this role, open billing to see its invoice.");
  await audit({ actorId: params.actorId, action: "HIRE_REPORTED", resourceType: "Hire", resourceId: result.hire.id, subjectUserId: params.candidateId });
  await audit({ actorId: params.actorId, action: "INVOICE_CREATED", resourceType: "Invoice", resourceId: result.invoice.id, metadata: { type: "HIRE_FEE" } });
  await notifyInvoice(result.invoice.id);
  return result;
}

export async function markInvoicePaid(invoiceId: string, actorId: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new BillingError("that invoice does not exist, return to invoices.");
  if (!canTransition(invoice.status, "PAID")) throw new BillingError(`A ${invoice.status.toLowerCase()} invoice can't be marked paid.`);
  // Conditional update so two clicks can't both mark it paid.
  const { count } = await prisma.invoice.updateMany({ where: { id: invoiceId, status: invoice.status }, data: { status: "PAID", paidAt: new Date() } });
  if (count === 0) throw new BillingError("that invoice changed while you were looking at it, reload invoices.");
  const updated = { ...invoice, status: "PAID" };
  await audit({ actorId, action: "INVOICE_PAID", resourceType: "Invoice", resourceId: invoiceId });
  return updated;
}

/** There is deliberately no refund function. Flat fees are non-refundable (issue #3). */

async function notifyInvoice(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { company: { include: { members: { include: { user: true }, where: { isOwner: true } } } } },
  });
  const to = invoice?.company.members[0]?.user.email;
  if (!invoice || !to) return;
  await sendEmail(to, "invoiceIssued", {
    company: invoice.company.name,
    number: invoice.number,
    amount: formatCents(invoice.amountCents),
    nonRefundable: invoice.nonRefundable,
  });
}
