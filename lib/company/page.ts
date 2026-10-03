import "server-only";
import { notFound, redirect } from "next/navigation";
import { authorizePage, requireRole } from "@/lib/permissions";
import { getActiveCompany, getRole } from "./queries";

/**
 * Page guard for company surfaces: a company member (or an admin) acting for one company.
 * Members without a company go to onboarding.
 */
export async function requireCompanyPage(slug?: string | string[]) {
  const user = await requireRole("COMPANY");
  const company = await getActiveCompany(user, typeof slug === "string" ? slug : null);
  if (!company) {
    if (user.role === "ADMIN") notFound();
    redirect("/company/onboarding");
  }
  await authorizePage(user, "company.manage", { companyId: company.id });
  return { user, company };
}

/** Page guard for one role: 404 unless the user may act on it (`role.manage` by default). */
export async function requireRolePage(roleId: string, action: "role.manage" | "shortlist.view" | "cohort.enroll" | "hire.report" = "role.manage") {
  const user = await requireRole("COMPANY");
  await authorizePage(user, action, { roleId });
  const role = await getRole(roleId);
  if (!role) notFound();
  return { user, role };
}
