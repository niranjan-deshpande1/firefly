import "server-only";
import { prisma } from "@/lib/db";
import { PAGE_SIZE, auditWhere, emailWhere, type AuditFilters, type EmailFilters } from "./filters";
import { revenueFrom, type FunnelCounts } from "./funnel";

export async function getFunnel() {
  const [signups, registrations, checkIns, projects, reviews, advances, interviews, shortlisted, hires, invoices] = await Promise.all([
    prisma.user.count({ where: { role: "CANDIDATE" } }),
    prisma.registration.count({ where: { status: { not: "WITHDRAWN" } } }),
    prisma.checkIn.count(),
    prisma.project.count({ where: { status: "SUBMITTED" } }),
    prisma.review.count({ where: { kind: "RUBRIC", status: "SUBMITTED" } }),
    prisma.decision.count({ where: { outcome: "ADVANCE" } }),
    prisma.interview.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.shortlistEntry.groupBy({ by: ["candidateId"] }).then((rows) => rows.length),
    prisma.hire.count(),
    prisma.invoice.findMany({ select: { status: true, amountCents: true } }),
  ]);
  const counts: FunnelCounts = { signups, registrations, checkIns, projects, reviews, advances, interviews, shortlisted, hires };
  return { counts, revenue: revenueFrom(invoices) };
}

const person = { select: { id: true, name: true, email: true, role: true } } as const;

export async function listAudit(f: AuditFilters) {
  const where = auditWhere(f);
  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: person, subjectUser: person },
      orderBy: { createdAt: "desc" },
      skip: (f.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { rows, total };
}

export async function listEmails(f: EmailFilters) {
  const where = emailWhere(f);
  const [rows, total, templates] = await Promise.all([
    prisma.emailLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (f.page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.emailLog.count({ where }),
    prisma.emailLog.findMany({ distinct: ["template"], select: { template: true }, orderBy: { template: "asc" } }),
  ]);
  return { rows, total, templates: templates.map((t) => t.template) };
}

/** All invoices for the operator, or one company's own invoices for its billing page. */
export async function listInvoices(opts: { companyId?: string; status?: string } = {}) {
  return prisma.invoice.findMany({
    where: { ...(opts.companyId ? { companyId: opts.companyId } : {}), ...(opts.status ? { status: opts.status } : {}) },
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listDataRequests() {
  return prisma.dataRequest.findMany({
    include: { user: person },
    orderBy: { createdAt: "desc" },
  });
}

export async function getResolverNames(ids: string[]) {
  const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
  return new Map(users.map((u) => [u.id, u.name ?? "an operator"]));
}
