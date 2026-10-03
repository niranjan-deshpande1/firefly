// Archetype: passage. Owner: projects builder.
import { notFound } from "next/navigation";
import { EmptyState, PageHeader, TextLink, Time } from "@/components/ui";
import { ProjectForm } from "@/components/projects/project-form";
import { requireUser } from "@/lib/auth";
import { authorizePage } from "@/lib/permissions";
import { getProjectForEdit, getUserTeam } from "@/lib/projects/queries";
import { isBeforeDeadline } from "@/lib/projects/schema";

export default async function EditProjectPage({ params, searchParams }: PageProps<"/projects/[id]/edit">) {
  const { id } = await params;
  const user = await requireUser();
  await authorizePage(user, "project.edit", { projectId: id });
  const project = await getProjectForEdit(id);
  if (!project) notFound();
  const { hackathon } = project;
  const posted = project.status === "SUBMITTED";

  const header = (
    <PageHeader
      title={posted ? "edit your posted project" : "finish your project"}
      description={
        <p>
          {posted ? "it is posted. changes show right away." : "it is a draft, visible to your team and the organizers."} posting for {hackathon.title} closes{" "}
          <Time value={hackathon.submissionDeadline} format="datetime" />.
        </p>
      }
    />
  );

  if (!isBeforeDeadline(hackathon.submissionDeadline)) {
    return (
      <section aria-labelledby="page-title" className="flex flex-col gap-8">
        {header}
        <EmptyState action={<TextLink href={`/projects/${id}`}>open your project page</TextLink>}>
          the posting deadline passed, so the project can no longer change.
        </EmptyState>
      </section>
    );
  }

  const step = Number((await searchParams).step ?? 0);
  const team = await getUserTeam(user.id, hackathon.id);
  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-8">
      {header}
      <ProjectForm
        hackathon={{ id: hackathon.id, slug: hackathon.slug, title: hackathon.title }}
        projectId={project.id}
        status={project.status}
        initial={{ ...project.form, builtWith: project.form.builtWith.join(", ") }}
        images={project.images}
        team={team}
        initialStep={Number.isInteger(step) ? step : 0}
      />
      <p className="type-body-s">
        <TextLink href={`/projects/${id}`}>open the project page</TextLink>
      </p>
    </section>
  );
}
