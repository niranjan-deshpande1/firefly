// Owner: companies builder. Archetype: record (one role and its intake).
import Link from "next/link";
import { Button, Chip, EmptyState, PageHeader, StatusPill, TextLink, Time } from "@/components/ui";
import { formatCents } from "@/lib/billing";
import { requireRolePage } from "@/lib/company/page";
import { LEVEL_LABEL, REMOTE_LABEL, ROLE_STATUS_LABEL, salaryRangeLabel } from "@/lib/company/labels";

export default async function RolePage({ params, searchParams }: PageProps<"/company/roles/[id]">) {
  const { id } = await params;
  const { enrolled: enrolledInvoice } = await searchParams;
  const { role } = await requireRolePage(id);
  const justEnrolled = role.enrollments.find((e) => e.invoice && e.invoice.number === enrolledInvoice);
  const enrolled = role.enrollments.length > 0;
  const place = [REMOTE_LABEL[role.remote] ?? role.remote, role.location].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-12">
      {justEnrolled?.invoice ? (
        <p role="status" className="card type-body">
          {role.title} is enrolled in {justEnrolled.hackathon.title}. invoice {justEnrolled.invoice.number} created, {formatCents(justEnrolled.invoice.amountCents)}
          {justEnrolled.invoice.nonRefundable ? ", non-refundable" : ""}.
        </p>
      ) : null}
      <PageHeader
        eyebrow={`${role.company.name} role`}
        title={role.title}
        description={
          <p>
            {LEVEL_LABEL[role.level] ?? role.level}, {place}, {role.numberOfHires === 1 ? "1 hire" : `${role.numberOfHires} hires`}, salary {salaryRangeLabel(role.salaryMinCents, role.salaryMaxCents, formatCents)}.
          </p>
        }
        actions={
          <>
            <Button asChild variant="primary">
              {enrolled ? <Link href={`/company/roles/${role.id}/shortlist`}>open the shortlist</Link> : <Link href={`/company/roles/${role.id}/enroll`}>enroll in a hiring cohort</Link>}
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/company/roles/${role.id}/edit`}>edit role intake</Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusPill>{ROLE_STATUS_LABEL[role.status] ?? role.status}</StatusPill>
        <TextLink href="/company" className="target inline-flex items-center">back to the company workspace</TextLink>
      </div>

      <section aria-labelledby="about" className="flex flex-col gap-6">
        <h2 id="about" className="type-display-3">the job</h2>
        <p className="type-body measure whitespace-pre-line">{role.description}</p>
        <div className="flex flex-col gap-2">
          <h3 className="type-label text-secondary">required skills</h3>
          <ul className="flex flex-wrap gap-2">
            {role.requiredSkills.map((s) => (
              <li key={s}><Chip>{s}</Chip></li>
            ))}
          </ul>
        </div>
        {role.domainKnowledge ? (
          <div className="flex flex-col gap-2">
            <h3 className="type-label text-secondary">domain knowledge</h3>
            <p className="type-body measure whitespace-pre-line">{role.domainKnowledge}</p>
          </div>
        ) : null}
        {role.traits ? (
          <div className="flex flex-col gap-2">
            <h3 className="type-label text-secondary">how the person works</h3>
            <p className="type-body measure whitespace-pre-line">{role.traits}</p>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="criteria" className="flex flex-col gap-4">
        <h2 id="criteria" className="type-display-3">company-specific criteria</h2>
        <p className="type-body-s text-secondary measure">reviewers score each one with a rationale and an evidence link, next to the Firefly rubric.</p>
        {role.criteria.length === 0 ? (
          <EmptyState action={<TextLink href={`/company/roles/${role.id}/edit`}>add a job-related criterion</TextLink>}>
            no criteria yet. reviewers will use the Firefly rubric only.
          </EmptyState>
        ) : (
          <ol className="flex flex-col">
            {role.criteria.map((c) => (
              <li key={c.id} className="row flex flex-col gap-2 py-4">
                <h3 className="type-display-4">{c.name}</h3>
                <p className="type-body measure">{c.description}</p>
                <p className="type-body-s text-secondary measure">job-related because {c.jobRelated}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="cohorts" className="flex flex-col gap-4">
        <h2 id="cohorts" className="type-display-3">hiring cohorts</h2>
        {enrolled ? (
          <ul className="flex flex-col">
            {role.enrollments.map((e) => (
              <li key={e.id} className="row flex flex-col gap-1 py-3">
                <TextLink href={`/hackathons/${e.hackathon.slug}`} className="min-h-11 inline-flex items-center">{e.hackathon.title}</TextLink>
                <span className="type-body-s text-secondary">
                  enrolled <Time value={e.enrolledAt} />, runs <Time value={e.hackathon.startsAt} /> to <Time value={e.hackathon.endsAt} />
                  {e.invoice ? `, invoice ${e.invoice.number} for ${formatCents(e.invoice.amountCents)}${e.invoice.nonRefundable ? ", non-refundable" : ""}` : ""}
                </span>
              </li>
            ))}
            <li className="pt-4">
              <TextLink href={`/company/roles/${role.id}/enroll`} className="min-h-11 inline-flex items-center">enroll in another hiring cohort</TextLink>
            </li>
          </ul>
        ) : (
          <EmptyState action={<TextLink href={`/company/roles/${role.id}/enroll`}>choose a hiring cohort</TextLink>}>
            this role is not in a cohort yet. candidates reach its shortlist only through a cohort.
          </EmptyState>
        )}
      </section>

      <section aria-labelledby="hires" className="flex flex-col gap-4">
        <h2 id="hires" className="type-display-3">hires</h2>
        {role.hires.length ? (
          <ul className="flex flex-col">
            {role.hires.map((h) => (
              <li key={h.id} className="row flex flex-col gap-1 py-3">
                <span className="type-body">{h.candidate.name}</span>
                <span className="type-body-s text-secondary">
                  {formatCents(h.salaryCents)} first-year salary, starts <Time value={h.startDate} timeZone="UTC" />
                  {h.invoice ? `, invoice ${h.invoice.number} for ${formatCents(h.invoice.amountCents)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <TextLink href={`/company/roles/${role.id}/hire`} className="target inline-flex items-center">report a hire for this role</TextLink>
      </section>
    </div>
  );
}
