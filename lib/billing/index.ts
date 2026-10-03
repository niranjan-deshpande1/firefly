import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { audit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { canTransition, formatCents, hireFeeCents } from "./math";

export * from "./math";

export class BillingError extends Error {}

type Tx = Prisma.TransactionClient;

async function nextInvoiceNumber(tx: Tx): Promise<string> {
  const year = new Date().getFullYear();
  const count = await tx.invoice.count({ where: { number: { startsWith: `FF-${year}-` } } });
  return `FF-${year}-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Enrolls a role into a hiring cohort and issues the flat-fee invoice in one transaction.
 * The fee is charged at enrollment and is non-refundable.
 */
export async function enrollRoleInCohort(params: { hackathonId: string; roleId: string; actorId: string }) {
  const settings = await getSettings();
  const result = await prisma.$transaction(async (tx) => {
    const [hackathon, role] = await Promise.all([
      tx.hackathon.findUnique({ where: { id: params.hackathonId } }),
      tx.role.findUnique({ where: { id: params.roleId }, include: { company: true } }),
    ]);
    if (!hackathon || hackathon.type !== "HIRING_COHORT") throw new BillingError("That cohort doesn't exist.");
    if (!role) throw new BillingError("That role doesn't exist.");
    if (hackathon.endsAt < new Date()) throw new BillingError("That cohort has ended.");
    const existing = await tx.cohortEnrollment.findUnique({ where: { hackathonId_roleId: { hackathonId: hackathon.id, roleId: role.id } } });
    if (existing) throw new BillingError("This role is already enrolled in that cohort.");

    const invoice = await tx.invoice.create({
      data: {
        number: await nextInvoiceNumber(tx),
        companyId: role.companyId,
        type: "FLAT_FEE",
        amountCents: settings.flatFeeCents,
        description: `Hiring cohort fee: ${hackathon.title} (${role.title}). Non-refundable.`,
        status: "SENT",
        nonRefundable: true,
        issuedAt: new Date(),
      },
    });
    const enrollment = await tx.cohortEnrollment.create({
      data: { hackathonId: hackathon.id, companyId: role.companyId, roleId: role.id, enrolledById: params.actorId, invoiceId: invoice.id },
    });
    return { enrollment, invoice, company: role.company };
  });
  await audit({ actorId: params.actorId, action: "ENROLLMENT_CREATED", resourceType: "CohortEnrollment", resourceId: result.enrollment.id });
  await audit({ actorId: params.actorId, action: "INVOICE_CREATED", resourceType: "Invoice", resourceId: result.invoice.id, metadata: { type: "FLAT_FEE" } });
  await notifyInvoice(result.invoice.id);
  return result;
}

/** Records a reported hire and issues the hire-fee invoice (5% of reported first-year salary by default). */
export async function reportHire(params: { companyId: string; roleId: string; candidateId: string; salaryCents: number; startDate: Date; actorId: string }) {
  const settings = await getSettings();
  const amount = hireFeeCents(params.salaryCents, settings.hireFeeBps);
  const result = await prisma.$transaction(async (tx) => {
    const role = await tx.role.findUnique({ where: { id: params.roleId } });
    if (!role || role.companyId !== params.companyId) throw new BillingError("That role doesn't belong to this company.");
    const invoice = await tx.invoice.create({
      data: {
        number: await nextInvoiceNumber(tx),
        companyId: params.companyId,
        type: "HIRE_FEE",
        amountCents: amount,
        description: `Hire fee: ${role.title}, ${settings.hireFeeBps / 100}% of ${formatCents(params.salaryCents)} first-year salary.`,
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
  });
  await audit({ actorId: params.actorId, action: "HIRE_REPORTED", resourceType: "Hire", resourceId: result.hire.id, subjectUserId: params.candidateId });
  await audit({ actorId: params.actorId, action: "INVOICE_CREATED", resourceType: "Invoice", resourceId: result.invoice.id, metadata: { type: "HIRE_FEE" } });
  await notifyInvoice(result.invoice.id);
  return result;
}

export async function markInvoicePaid(invoiceId: string, actorId: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new BillingError("That invoice doesn't exist.");
  if (!canTransition(invoice.status, "PAID")) throw new BillingError(`A ${invoice.status.toLowerCase()} invoice can't be marked paid.`);
  const updated = await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "PAID", paidAt: new Date() } });
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
