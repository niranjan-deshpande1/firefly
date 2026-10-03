// Participants, updates, judges, reviewers and winners. Organizers may see builder names here; reviewers never reach these screens.
import { prisma } from "@/lib/db";
import { assignJudge, assignReviewer, pickWinner, postUpdate, removeWinner, unassignJudge, unassignReviewer } from "@/lib/organize/actions/people";
import { listAssignableReviewers, listCohortProjects } from "@/lib/organize/queries";
import { REVIEWERS_PER_PROJECT, WINNER_STATUSES } from "@/lib/organize/schemas";
import { EmptyState, Markdown, StatusPill, Table, Td, TextLink, Th, Time, Tr } from "@/components/ui";
import { ConfirmAction, FormShell, SelectField, TextField } from "../form";

type H = { id: string; slug: string; type: string; status: string };

const REGISTRATION_LABEL: Record<string, string> = { REGISTERED: "registered", WITHDRAWN: "withdrawn", SUBMITTED: "posted a project", FINISHED: "finished" };

export async function ParticipantsSection({ hackathon }: { hackathon: H }) {
  const rows = await prisma.registration.findMany({
    where: { hackathonId: hackathon.id },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          name: true,
          username: true,
          teamMembers: { where: { team: { hackathonId: hackathon.id } }, select: { team: { select: { name: true } } } },
        },
      },
    },
  });
  if (rows.length === 0) {
    return (
      <EmptyState action={<TextLink href={`/organize/${hackathon.slug}/updates`}>post an update</TextLink>}>
        no one has registered yet. post an update when registration opens so people know.
      </EmptyState>
    );
  }
  return (
    <Table caption="registrations">
      <thead>
        <Tr>
          <Th>builder</Th>
          <Th>status</Th>
          <Th>team</Th>
          <Th>eligibility</Th>
          <Th>registered</Th>
        </Tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <Tr key={r.id}>
            <Td>{r.user.username ? <TextLink href={`/u/${r.user.username}`}>{r.user.name ?? r.user.username}</TextLink> : (r.user.name ?? "unnamed builder")}</Td>
            <Td>
              <StatusPill tone={r.status === "WITHDRAWN" ? "neutral" : "success"}>{REGISTRATION_LABEL[r.status] ?? r.status.toLowerCase()}</StatusPill>
            </Td>
            <Td>{r.user.teamMembers[0]?.team.name ?? (r.lookingForTeam ? "looking for a team" : "solo")}</Td>
            <Td>{r.eligibilityConfirmed ? "confirmed" : "not confirmed"}</Td>
            <Td>
              <Time value={r.createdAt} />
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}

export async function UpdatesSection({ hackathon }: { hackathon: H }) {
  const [updates, recipients] = await Promise.all([
    prisma.update.findMany({ where: { hackathonId: hackathon.id }, orderBy: { publishedAt: "desc" } }),
    prisma.registration.count({ where: { hackathonId: hackathon.id, status: { not: "WITHDRAWN" } } }),
  ]);
  return (
    <>
      <section aria-labelledby="post-update" className="measure flex flex-col gap-6">
        <h2 id="post-update" className="type-display-3">post an update</h2>
        <p className="type-body text-secondary">
          it shows on the updates tab and is emailed to {recipients} {recipients === 1 ? "registrant" : "registrants"}.
        </p>
        <FormShell action={postUpdate} hidden={{ hackathonId: hackathon.id }} submitLabel="post update" loadingLabel="posting update" resetOnSuccess>
          <TextField name="title" label="title" required />
          <TextField name="body" label="message" hint="Markdown." rows={8} required />
        </FormShell>
      </section>
      <section aria-labelledby="past-updates" className="measure-stream flex flex-col gap-4">
        <h2 id="past-updates" className="type-display-3">posted</h2>
        {updates.length === 0 ? (
          <p className="type-body">nothing posted yet. your first update appears here.</p>
        ) : (
          <ul className="flex flex-col border-t border-line">
            {updates.map((u) => (
              <li key={u.id} className="flex flex-col gap-2 border-b border-line py-4">
                <p className="type-display-4">{u.title}</p>
                <Time value={u.publishedAt} format="datetime" className="type-body-s text-secondary" />
                <Markdown>{u.body}</Markdown>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function NoReviewers({ slug }: { slug: string }) {
  return (
    <EmptyState action={<TextLink href={`/organize/${slug}`}>back to the console</TextLink>}>
      no one has the reviewer role yet. ask an admin to give someone the reviewer role, then assign them here.
    </EmptyState>
  );
}

export async function JudgesSection({ hackathon }: { hackathon: H }) {
  const [assignments, reviewers, projects] = await Promise.all([
    prisma.judgeAssignment.findMany({
      where: { hackathonId: hackathon.id },
      orderBy: { assignedAt: "asc" },
      include: { judge: { select: { name: true } }, project: { select: { title: true } } },
    }),
    listAssignableReviewers(),
    prisma.project.findMany({ where: { hackathonId: hackathon.id, status: "SUBMITTED" }, orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);
  if (reviewers.length === 0) return <NoReviewers slug={hackathon.slug} />;
  return (
    <>
      {assignments.length === 0 ? (
        <p className="type-body measure">no judges yet. assign the first one below.</p>
      ) : (
        <ul className="flex flex-col border-t border-line">
          {assignments.map((a) => (
            <li key={a.id} className="flex flex-col gap-2 border-b border-line py-4 tablet:flex-row tablet:items-center tablet:justify-between">
              <p className="type-body">
                <span className="type-display-4">{a.judge.name ?? "unnamed judge"}</span>
                <span className="text-secondary"> judges {a.project ? a.project.title : "every project"}</span>
              </p>
              <ConfirmAction
                action={unassignJudge}
                hidden={{ hackathonId: hackathon.id, id: a.id }}
                label="remove judge"
                title={`remove ${a.judge.name ?? "this judge"}?`}
                description="they lose access to these projects. scores they already saved stay."
              />
            </li>
          ))}
        </ul>
      )}
      <section aria-labelledby="assign-judge" className="measure flex flex-col gap-6">
        <h2 id="assign-judge" className="type-display-3">assign a judge</h2>
        <FormShell action={assignJudge} hidden={{ hackathonId: hackathon.id }} submitLabel="assign judge" loadingLabel="assigning judge">
          <SelectField name="judgeId" label="judge" hint="only people with the reviewer role can judge." required placeholder="choose a judge" options={reviewers.map((r) => ({ value: r.id, label: r.name ?? r.id }))} />
          <SelectField name="projectId" label="projects" placeholder="every project in this hackathon" options={projects.map((p) => ({ value: p.id, label: p.title }))} />
        </FormShell>
      </section>
    </>
  );
}

export async function ReviewersSection({ hackathon }: { hackathon: H }) {
  const [projects, reviewers] = await Promise.all([listCohortProjects(hackathon.id), listAssignableReviewers()]);
  if (reviewers.length === 0) return <NoReviewers slug={hackathon.slug} />;
  if (projects.length === 0) {
    return (
      <EmptyState action={<TextLink href={`/organize/${hackathon.slug}/participants`}>see who registered</TextLink>}>
        no projects yet. reviewers are assigned once builders start their projects.
      </EmptyState>
    );
  }
  return (
    <ul className="flex flex-col border-t border-line">
      {projects.map((p) => {
        const assigned = p.reviewerAssignments;
        const short = assigned.length < REVIEWERS_PER_PROJECT;
        const open = reviewers.filter((r) => !assigned.some((a) => a.reviewer.id === r.id));
        return (
          <li key={p.id} className="flex flex-col gap-4 border-b border-line py-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="type-display-4">{p.title}</p>
              <span className="type-body-s text-secondary">by {p.owner.name ?? "unnamed builder"}</span>
              <StatusPill>{p.status === "SUBMITTED" ? "posted" : "draft"}</StatusPill>
              <StatusPill tone={short ? "warning" : "success"}>
                {assigned.length} of {REVIEWERS_PER_PROJECT} reviewers
              </StatusPill>
              {p.decisions[0]?.outcome === "ADVANCE" ? (
                <>
                  <StatusPill tone="accent">advanced</StatusPill>
                  <TextLink href={`/interviews/new?projectId=${p.id}`} className="inline-flex min-h-11 items-center type-body-s">
                    schedule an interview
                  </TextLink>
                </>
              ) : null}
            </div>
            {assigned.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {assigned.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-3">
                    <span className="type-body">{a.reviewer.name ?? "unnamed reviewer"}</span>
                    <ConfirmAction
                      action={unassignReviewer}
                      hidden={{ hackathonId: hackathon.id, id: a.id }}
                      label="remove reviewer"
                      title={`remove ${a.reviewer.name ?? "this reviewer"} from ${p.title}?`}
                      description="they lose access to this project. a review they already saved stays."
                    />
                  </li>
                ))}
              </ul>
            ) : null}
            {short ? (
              <div className="measure">
                <FormShell action={assignReviewer} hidden={{ hackathonId: hackathon.id, projectId: p.id }} submitLabel="assign reviewer" loadingLabel="assigning reviewer" primary={false}>
                  <SelectField name="reviewerId" label={`reviewer for ${p.title}`} required placeholder="choose a reviewer" options={open.map((r) => ({ value: r.id, label: r.name ?? r.id }))} />
                </FormShell>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export async function WinnersSection({ hackathon }: { hackathon: H }) {
  const [prizes, projects] = await Promise.all([
    prisma.prize.findMany({
      where: { hackathonId: hackathon.id },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { winners: { include: { project: { select: { id: true, title: true } } }, orderBy: { announcedAt: "asc" } } },
    }),
    prisma.project.findMany({ where: { hackathonId: hackathon.id, status: "SUBMITTED" }, orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);
  const base = `/organize/${hackathon.slug}`;
  if (prizes.length === 0) {
    return <EmptyState action={<TextLink href={`${base}/prizes`}>add a prize</TextLink>}>there are no prizes to award yet. add one first.</EmptyState>;
  }
  const canPick = (WINNER_STATUSES as readonly string[]).includes(hackathon.status);
  return (
    <>
      {!canPick ? (
        <p className="type-body measure">
          awards are picked after judging starts. <TextLink href={`${base}/edit/status`}>set the status to judging</TextLink>
        </p>
      ) : null}
      <ul className="flex flex-col border-t border-line">
        {prizes.map((prize) => {
          const full = prize.winners.length >= prize.quantity;
          const open = projects.filter((p) => !prize.winners.some((w) => w.project.id === p.id));
          return (
            <li key={prize.id} className="flex flex-col gap-4 border-b border-line py-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="type-display-4">{prize.name}</p>
                <span className="type-body-s text-secondary">
                  {prize.winners.length} of {prize.quantity} {prize.quantity === 1 ? "place" : "places"} awarded
                </span>
              </div>
              {prize.winners.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {prize.winners.map((w) => (
                    <li key={w.id} className="flex flex-wrap items-center gap-3">
                      <TextLink href={`/projects/${w.project.id}`}>{w.project.title}</TextLink>
                      <StatusPill tone="accent">awarded: {prize.name}</StatusPill>
                      <ConfirmAction
                        action={removeWinner}
                        hidden={{ hackathonId: hackathon.id, id: w.id }}
                        label="remove award"
                        title={`remove ${prize.name} from ${w.project.title}?`}
                        description="the award label disappears from the project and gallery."
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
              {canPick && !full ? (
                open.length === 0 ? (
                  <p className="type-body-s text-secondary">every posted project already has this award.</p>
                ) : (
                  <div className="measure">
                    <FormShell action={pickWinner} hidden={{ hackathonId: hackathon.id, prizeId: prize.id }} submitLabel={`award ${prize.name}`} loadingLabel="saving award" primary={false}>
                      <SelectField name="projectId" label={`project for ${prize.name}`} required placeholder="choose a posted project" options={open.map((p) => ({ value: p.id, label: p.title }))} />
                    </FormShell>
                  </div>
                )
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
