// Owner: interviews builder. Archetype: passage (reschedule or cancel one interview).
import { notFound } from "next/navigation";
import { PageHeader, StatusPill, TextLink, Time } from "@/components/ui";
import { ReasonDialog } from "@/components/interviews/reason-dialog";
import { RescheduleForm } from "@/components/interviews/reschedule-form";
import { requireUser } from "@/lib/auth";
import { authorizePage } from "@/lib/permissions";
import { getManageInterview } from "@/lib/interviews/queries";
import { manageError, utcToZonedLocal } from "@/lib/interviews/rules";
import { MODE_LABELS, STATUS_LABELS } from "@/lib/interviews/script";

export default async function ManageInterviewPage({ params }: PageProps<"/interviews/[id]/manage">) {
  const { id } = await params;
  const user = await requireUser();
  const interview = await getManageInterview(id);
  if (!interview) notFound();
  await authorizePage(user, "interview.manage", { projectId: interview.projectId });

  const closed = manageError(interview.status, "reschedule");
  const candidate = interview.candidate.name ?? "the candidate";

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        eyebrow="defense interview"
        title={`manage the interview with ${candidate}`}
        description={
          <p>
            {interview.project.title}, {interview.project.hackathon.title}
            {interview.role ? `, for ${interview.role.title} at ${interview.role.company.name}` : ""}.
          </p>
        }
      />

      <section aria-label="current details" className="flex flex-col gap-3 border-y border-line py-4 type-body-s">
        <p>
          <span className="text-secondary">when </span>
          <Time value={interview.scheduledAt} format="datetime" timeZone={interview.timeZone} />, {interview.durationMin} min
        </p>
        <p>
          <span className="text-secondary">{MODE_LABELS[interview.mode as keyof typeof MODE_LABELS]} </span>
          {interview.mode === "VIDEO" ? interview.videoLink : interview.location}
        </p>
        <p>
          <span className="text-secondary">panel </span>
          {interview.interviewers.map((i) => i.user.name ?? "unnamed").join(", ")}
        </p>
        <p className="flex flex-wrap items-center gap-3">
          <StatusPill tone={interview.status === "CANCELLED" ? "error" : "neutral"}>{STATUS_LABELS[interview.status as keyof typeof STATUS_LABELS]}</StatusPill>
          <TextLink href="/interviews">return to your interviews</TextLink>
        </p>
      </section>

      {closed ? (
        <p className="type-body measure">
          {closed} {interview.status === "CANCELLED" && interview.notes ? interview.notes : ""}
        </p>
      ) : (
        <>
          <section aria-labelledby="reschedule-heading" className="flex flex-col gap-6">
            <h2 id="reschedule-heading" className="type-display-4">
              reschedule
            </h2>
            <p className="type-body text-secondary measure">the candidate and the panel get an email with the new details.</p>
            <RescheduleForm
              interviewId={interview.id}
              timeZone={interview.timeZone}
              initial={{
                localTime: utcToZonedLocal(interview.scheduledAt, interview.timeZone),
                durationMin: interview.durationMin,
                mode: interview.mode as keyof typeof MODE_LABELS,
                location: interview.location ?? "",
                videoLink: interview.videoLink ?? "",
              }}
            />
          </section>

          <section aria-labelledby="cancel-heading" className="flex flex-col gap-4 border-t border-line pt-8">
            <h2 id="cancel-heading" className="type-display-4">
              cancel
            </h2>
            <p className="type-body text-secondary measure">cancelling closes the interview for good. schedule a new one if the defense still needs to happen.</p>
            <div>
              <ReasonDialog kind="cancel" id={interview.id} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
