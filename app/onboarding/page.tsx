// Owner: profiles and privacy builder. Archetype: passage.
// Step 1 picks builder or company member; step 2 is the builder consent screen.
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { authorizePage } from "@/lib/permissions";
import { getSettings } from "@/lib/settings";
import { CONSENT_VERSION, safeNext } from "@/lib/profiles";
import { NAV } from "@/components/shell/nav";
import { Button, PageHeader, Time } from "@/components/ui";
import { ConsentCopy } from "@/components/profiles/consent-copy";
import { ConsentForm, RoleForm } from "@/components/profiles/onboarding-forms";
import NextLink from "next/link";

export const metadata = { title: "welcome" };

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const user = await requireUser();
  await authorizePage(user, "profile.edit", { subjectUserId: user.id });
  const params = await searchParams;
  const next = safeNext(params.next, "") || undefined;
  const home = next ?? NAV[user.role][0].href;

  if (user.role !== "CANDIDATE" && user.role !== "COMPANY") {
    return (
      <div className="flex flex-col gap-8 desktop:ms-[8.333%] desktop:w-5/12">
        <PageHeader title="you're all set" description="your role was set up by a firefly admin, so there is nothing to choose here." />
        <div><Button asChild variant="primary"><NextLink href={home}>go to your home</NextLink></Button></div>
      </div>
    );
  }

  const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id }, select: { consentVersion: true, consentAt: true } });
  const consented = profile?.consentVersion === CONSENT_VERSION && profile.consentAt;

  if (user.role === "CANDIDATE" && params.step === "consent") {
    const { retentionMonths } = await getSettings();
    return (
      <div className="flex flex-col gap-12 desktop:ms-[8.333%] desktop:w-5/12">
        <PageHeader
          eyebrow="step 2 of 2"
          title="how we handle your data"
          description="read this once before you join a hackathon. it covers what we collect, who sees it, how long we keep it and what you can do about it."
        />
        <ConsentCopy retentionMonths={retentionMonths} />
        {consented && profile?.consentAt ? (
          <p className="type-body-s text-secondary">you agreed to this version on <Time value={profile.consentAt} />.</p>
        ) : null}
        <ConsentForm next={next} />
      </div>
    );
  }

  if (consented) {
    return (
      <div className="flex flex-col gap-8 desktop:ms-[8.333%] desktop:w-5/12">
        <PageHeader title="you're all set" description="you have chosen how you use firefly and agreed to how we handle your data. you can change your profile and privacy in settings." />
        <div><Button asChild variant="primary"><NextLink href={home}>go to your home</NextLink></Button></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 desktop:ms-[8.333%] desktop:w-5/12">
      <PageHeader eyebrow={user.role === "CANDIDATE" ? "step 1 of 2" : undefined} title="welcome to firefly" description="tell us how you'll use firefly so we show you the right home." />
      <RoleForm next={next} current={user.role} />
    </div>
  );
}
