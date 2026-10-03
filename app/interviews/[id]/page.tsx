// Owner: interviews builder. Archetype: workspace (interview room).
import { notFound } from "next/navigation";
import { PageHeader, StatusPill, TextLink, Time } from "@/components/ui";
import { CompleteForm } from "@/components/interviews/complete-form";
import { IdentityCheck } from "@/components/interviews/identity-check";
import { SectionCard } from "@/components/interviews/section-card";
import { requireUser } from "@/lib/auth";
import { check } from "@/lib/permissions";
import { blindProjectIds, canRunInterview, getInterviewRoom } from "@/lib/interviews/queries";
import { missingSections } from "@/lib/interviews/rules";
import { MODE_LABELS, MODEL_LABELS, OUTCOME_LABELS, SCRIPT, STATUS_LABELS } from "@/lib/interviews/script";

export default async function InterviewRoomPage({ params }: PageProps<"/interviews/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const interview = await getInterviewRoom(id);
  if (!interview || !(await canRunInterview(user, interview))) notFound();

  const blind = (await blindProjectIds(user.id, [interview.projectId])).has(interview.projectId);
  const candidate = blind ? `candidate ${interview.candidate.candidateProfile?.blindCode ?? "hidden"}` : (interview.candidate.name ?? "the candidate");
  const identityDone = !!interview.identityCheckedAt && !blind;
  const closed = interview.status === "COMPLETED" || interview.status === "CANCELLED";
  const mine = new Map(interview.scores.filter((s) => s.scoredById === user.id).map((s) => [s.section, s]));
  const missing = missingSections(interview.scores).map((s) => SCRIPT.find((x) => x.section === s)!.title);
  const canManage = !closed && (await check(user, "interview.manage", { projectId: interview.projectId }));

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        eyebrow="defense interview"
        title={`interview with ${candidate}`}
        description={
          <p>
            {interview.project.title}, {interview.project.hackathon.title}
            {interview.role ? `, for ${interview.role.title} at ${interview.role.company.name}` : ""}.
          </p>
        }
      />

      {/* People strip: who is in the room and what the room is doing (manual 8.4). */}
      <section aria-label="the room" className="flex flex-col gap-3 border-y border-line py-4 type-body-s">
        <p>
          <span className="text-secondary">panel </span>
          {interview.interviewers.map((i) => i.user.name ?? "unnamed").join(", ")} · {MODEL_LABELS[interview.model as keyof typeof MODEL_LABELS]}
        </p>
        <p>
          <span className="text-secondary">when </span>
          <Time value={interview.scheduledAt} format="datetime" timeZone={interview.timeZone} />, {interview.durationMin} min
        </p>
        <p>
          <span className="text-secondary">{MODE_LABELS[interview.mode as keyof typeof MODE_LABELS]} </span>
          {interview.mode === "VIDEO" && interview.videoLink ? (
            <TextLink href={interview.videoLink} target="_blank" rel="noreferrer">
              open the video call
            </TextLink>
          ) : (
            interview.location
          )}
        </p>
        <p className="flex flex-wrap items-center gap-3">
          <StatusPill tone={interview.outcome === "PASS" ? "success" : interview.outcome === "FAIL" ? "error" : "neutral"}>
            {interview.outcome ? `${OUTCOME_LABELS[interview.outcome as keyof typeof OUTCOME_LABELS]}` : STATUS_LABELS[interview.status as keyof typeof STATUS_LABELS]}
          </StatusPill>
          {interview.project.verified ? <StatusPill tone="success">verified</StatusPill> : null}
          <TextLink href={`/projects/${interview.projectId}`}>open the project</TextLink>
          <TextLink href={`/projects/${interview.projectId}/evidence`}>open the evidence locker</TextLink>
          {canManage ? <TextLink href={`/interviews/${interview.id}/manage`}>reschedule or cancel</TextLink> : null}
        </p>
      </section>

      <section aria-labelledby="identity-heading" className="flex flex-col gap-4">
        <h2 id="identity-heading" className="type-display-4">
          0. identity check
        </h2>
        {blind ? (
          <p className="type-body measure">
            you are also reviewing this project blind. post your review and reveal the builder in the{" "}
            <TextLink href={`/review/${interview.projectId}`}>scoring workspace</TextLink> before you run this defense.
          </p>
        ) : identityDone ? (
          <p className="type-body">
            photo ID checked by {interview.identityCheckedBy?.name ?? "an interviewer"} at <Time value={interview.identityCheckedAt!} format="time" timeZone={interview.timeZone} />.
          </p>
        ) : closed ? (
          <p className="type-body text-secondary">this interview closed without an identity check.</p>
        ) : (
          <IdentityCheck interviewId={interview.id} candidateName={candidate} />
        )}
      </section>

      <div>
        {closed && mine.size === 0 ? (
          <p className="type-body measure border-t border-line py-6">you did not score any section of this interview.</p>
        ) : null}
        {SCRIPT.map((script, i) => {
          const saved = mine.get(script.section);
          if (closed && mine.size === 0) return null;
          return closed ? (
            <section key={script.section} className="flex flex-col gap-2 border-t border-line py-6">
              <h2 className="type-display-4">
                {i + 1}. {script.title}
              </h2>
              <p className="type-body measure">{saved ? `your score ${saved.score}: ${saved.notes}` : "you did not score this section."}</p>
            </section>
          ) : (
            <SectionCard
              key={script.section}
              interviewId={interview.id}
              index={i}
              script={script}
              locked={!identityDone}
              saved={saved ? { score: saved.score, notes: saved.notes } : null}
            />
          );
        })}
      </div>

      <section aria-labelledby="outcome-heading" className="flex flex-col gap-4 border-t border-line pt-8">
        <h2 id="outcome-heading" className="type-display-4">
          outcome
        </h2>
        {closed ? (
          <div className="flex flex-col gap-3 measure">
            <p className="type-body">{interview.notes}</p>
            <TextLink href="/interviews">return to your interviews</TextLink>
          </div>
        ) : identityDone ? (
          <CompleteForm interviewId={interview.id} missing={missing} />
        ) : (
          <p className="type-body text-secondary measure">confirm the photo ID above to start the script.</p>
        )}
      </section>
    </div>
  );
}
