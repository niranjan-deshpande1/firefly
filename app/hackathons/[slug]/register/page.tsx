import { hasCurrentConsent } from "@/lib/profiles";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { authorizePage } from "@/lib/permissions";
import { eligibilityItems, registrationBlock, teamsAllowed } from "@/lib/participation/logic";
import { getHackathonBySlug, getRegistration } from "@/lib/participation/queries";
import { RegisterForm } from "@/components/participation/register-form";
import { Button, PageHeader, TextLink } from "@/components/ui";

// Owner: participation builder. Archetype: passage.
// One decision (join this hackathon), its context (eligibility, consent), one primary action.
export const metadata = { title: "register" };

export default async function RegisterPage({ params }: PageProps<"/hackathons/[slug]/register">) {
  const { slug } = await params;
  const user = await requireUser();
  const h = await getHackathonBySlug(slug);
  if (!h) notFound();
  await authorizePage(user, "hackathon.view", { hackathonId: h.id });
  await authorizePage(user, "registration.create", { hackathonId: h.id });

  const title = `register for ${h.title}`;
  const existing = await getRegistration(h.id, user.id);
  if (existing && existing.status !== "WITHDRAWN") {
    return (
      <Passage title={title}>
        <p className="type-body measure">you&apos;re registered for {h.title}. your dashboard has the dates and what&apos;s due.</p>
        <Button asChild variant="primary">
          <Link href="/dashboard">open your dashboard</Link>
        </Button>
      </Passage>
    );
  }

  const blocked = registrationBlock(h, new Date());
  if (blocked) {
    return (
      <Passage title={title}>
        <p className="type-body measure">{blocked}</p>
        <TextLink href="/hackathons">browse hackathons</TextLink>
      </Passage>
    );
  }

  const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id }, select: { consentAt: true, consentVersion: true } });
  if (!hasCurrentConsent(profile)) {
    const next = `/hackathons/${h.slug}/register`;
    return (
      <Passage title={title}>
        <p className="type-body measure">
          before you register, read what firefly collects while you build, who sees it, how long we keep it and your rights. it takes about 2 minutes, then you come
          straight back here.
        </p>
        <Button asChild variant="primary">
          <Link href={`/onboarding?step=consent&next=${encodeURIComponent(next)}`}>review the consent terms</Link>
        </Button>
      </Passage>
    );
  }

  const isCohort = h.type === "HIRING_COHORT";
  return (
    <Passage
      title={title}
      description={
        isCohort
          ? "a 2 week solo build with weekly check-ins and a defense interview at the end."
          : teamsAllowed(h)
            ? "confirm you're eligible, then start a team or build solo."
            : "confirm you're eligible, then start building."
      }
    >
      <RegisterForm hackathonId={h.id} eligibility={eligibilityItems(h.eligibility)} teamsAllowed={teamsAllowed(h)} />
    </Passage>
  );
}

function Passage({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-8 desktop:ms-[calc(100%/12)] desktop:w-5/12">
      <PageHeader level={2} title={title} description={description ? <p>{description}</p> : undefined} />
      {children}
    </div>
  );
}
