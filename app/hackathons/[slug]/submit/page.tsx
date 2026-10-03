// Archetype: passage. Owner: projects builder.
import { notFound, redirect } from "next/navigation";
import { EmptyState, PageHeader, TextLink, Time } from "@/components/ui";
import { ProjectForm } from "@/components/projects/project-form";
import { requireUser } from "@/lib/auth";
import { authorizePage } from "@/lib/permissions";
import { findUserProject, getHackathonBySlug, getRegistration, getUserTeam } from "@/lib/projects/queries";
import { isBeforeDeadline } from "@/lib/projects/schema";

export default async function PostProjectPage({ params }: PageProps<"/hackathons/[slug]/submit">) {
  const { slug } = await params;
  const user = await requireUser();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) notFound();
  await authorizePage(user, "hackathon.view", { hackathonId: hackathon.id });

  const existing = await findUserProject(user.id, hackathon.id);
  if (existing) redirect(`/projects/${existing.id}/edit`);

  const header = (
    <PageHeader level={2}
      title="post your project"
      description={
        <p>
          for {hackathon.title}. posting closes <Time value={hackathon.submissionDeadline} format="datetime" />.
        </p>
      }
    />
  );

  if (!isBeforeDeadline(hackathon.submissionDeadline)) {
    return (
      <section aria-labelledby="page-title" className="flex flex-col gap-8">
        {header}
        <EmptyState action={<TextLink href={`/hackathons/${slug}/projects`}>see the posted projects</TextLink>}>
          posting closed on <Time value={hackathon.submissionDeadline} format="datetime" />.
        </EmptyState>
      </section>
    );
  }

  const registration = await getRegistration(user.id, hackathon.id);
  if (user.role !== "CANDIDATE" || !registration || registration.status === "WITHDRAWN") {
    return (
      <section aria-labelledby="page-title" className="flex flex-col gap-8">
        {header}
        <EmptyState action={<TextLink href={`/hackathons/${slug}/register`}>register for {hackathon.title}</TextLink>}>
          only registered builders can post a project here.
        </EmptyState>
      </section>
    );
  }

  const team = await getUserTeam(user.id, hackathon.id);
  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-8">
      {header}
      <ProjectForm
        hackathon={{ id: hackathon.id, slug: hackathon.slug, title: hackathon.title }}
        projectId={null}
        status="DRAFT"
        initial={{ title: "", tagline: "", story: "", builtWith: "", links: [], repoUrl: "", videoUrl: "", teamId: team?.id ?? null }}
        images={[]}
        team={team}
        initialStep={0}
      />
    </section>
  );
}
