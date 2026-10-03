// Owner: companies builder. Archetype: passage (company onboarding).
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { CompanyForm } from "@/components/company/company-forms";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/company/page";

export default async function CompanyOnboardingPage() {
  const user = await requireCompanyUser();
  const membership = await prisma.companyMember.findFirst({ where: { userId: user.id }, select: { id: true } });
  if (membership) redirect("/company");
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader
        eyebrow="company onboarding"
        title="set up your company"
        description={<p>candidates read this before they see your roles. you can add teammates and roles next.</p>}
      />
      <CompanyForm />
    </div>
  );
}
