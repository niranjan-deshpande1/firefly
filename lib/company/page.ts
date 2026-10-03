import "server-only";
import { notFound, redirect } from "next/navigation";
import { authorizePage, requireRole } from "@/lib/permissions";
import { getActiveCompany, getRole } from "./queries";

/**
 * Every /company page starts here: signed-out people go to sign-in, other roles get the 404 view, and admins go
 * to /admin, which is their view of every company (the company workspace is for one company's members).
 */
export async function requireCompanyUser() {
  const user = await requireRole("COMPANY");
  if (user.role === "ADMIN") redirect("/admin");
  return user;
}

/** Page guard for company surfaces: a company member acting for their company. Members without one go to onboarding. */
export async function requireCompanyPage(slug?: string | string[]) {
  const user = await requireCompanyUser();
  const company = await getActiveCompany(user, typeof slug === "string" ? slug : null);
  if (!company) redirect("/company/onboarding");
  await authorizePage(user, "company.manage", { companyId: company.id });
  return { user, company };
}

/** Page guard for one role: 404 unless the user may act on it (`role.manage` by default). */
export async function requireRolePage(roleId: string, action: "role.manage" | "shortlist.view" | "cohort.enroll" | "hire.report" = "role.manage") {
  const user = await requireCompanyUser();
  await authorizePage(user, action, { roleId });
  const role = await getRole(roleId);
  if (!role) notFound();
  return { user, role };
}
