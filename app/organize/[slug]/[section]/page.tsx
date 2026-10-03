// Archetypes by section (one per URL): workspace for prizes, schedule, criteria, resources, judges, reviewers and winners;
// collection for participants; stream for updates.
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { authorizePage } from "@/lib/permissions";
import { managedHackathon } from "@/lib/organize/guard";
import { ConsoleFrame } from "@/components/organize/console-frame";
import { CriteriaSection, PrizesSection, ResourcesSection, ScheduleSection } from "@/components/organize/sections/items";
import { JudgesSection, ParticipantsSection, ReviewersSection, UpdatesSection, WinnersSection } from "@/components/organize/sections/people";

type Section = { title: string; description: string; only?: "OPEN" | "HIRING_COHORT" };

const SECTIONS: Record<string, Section> = {
  prizes: { title: "prizes", description: "each prize shows on the hackathon page as plain text." },
  schedule: { title: "schedule", description: "kickoff, office hours, deadlines and every dated event, each with its zone." },
  criteria: { title: "judging criteria", description: "what judges score each project against." },
  resources: { title: "resources", description: "docs, starter material and links builders need." },
  participants: { title: "participants", description: "everyone who registered, with their status." },
  updates: { title: "updates", description: "announcements for everyone registered." },
  judges: { title: "judges", description: "who judges which projects. judges need the reviewer role.", only: "OPEN" },
  reviewers: { title: "reviewers", description: `every project gets 2 reviewers. reviewers see a blind code, never these names.`, only: "HIRING_COHORT" },
  winners: { title: "awards", description: "pick the projects that win each prize, after judging.", only: "OPEN" },
};

export default async function ConsoleSectionPage({ params, searchParams }: PageProps<"/organize/[slug]/[section]">) {
  const { slug, section } = await params;
  const edit = (await searchParams).edit;
  const config = SECTIONS[section];
  if (!config) notFound();
  const { user, hackathon } = await managedHackathon(slug);
  if (config.only && config.only !== hackathon.type) notFound();
  if (section === "winners") await authorizePage(user, "winner.pick", { hackathonId: hackathon.id });

  const ctx = { hackathonId: hackathon.id, slug, editId: typeof edit === "string" ? edit : undefined };
  const body: Record<string, () => ReactNode> = {
    prizes: () => <PrizesSection ctx={ctx} />,
    schedule: () => <ScheduleSection ctx={ctx} />,
    criteria: () => <CriteriaSection ctx={ctx} />,
    resources: () => <ResourcesSection ctx={ctx} />,
    participants: () => <ParticipantsSection hackathon={hackathon} />,
    updates: () => <UpdatesSection hackathon={hackathon} />,
    judges: () => <JudgesSection hackathon={hackathon} />,
    reviewers: () => <ReviewersSection hackathon={hackathon} />,
    winners: () => <WinnersSection hackathon={hackathon} />,
  };

  return (
    <ConsoleFrame hackathon={hackathon} title={config.title} description={config.description}>
      {body[section]()}
    </ConsoleFrame>
  );
}
