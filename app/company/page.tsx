// Owner: companies builder. Archetype: workspace (company dashboard).
import Link from "next/link";
import { Button, EmptyState, PageHeader, StatusPill, TextLink, Time } from "@/components/ui";
import { formatCents } from "@/lib/billing";
import { getCompanyWithMembers, getDashboard } from "@/lib/company/queries";
import { requireCompanyPage } from "@/lib/company/page";
import { LEVEL_LABEL, REMOTE_LABEL, ROLE_STATUS_LABEL } from "@/lib/company/labels";

const INVOICE_STATUS: Record<string, string> = { DRAFT: "draft", SENT: "sent", PAID: "paid" };

export default async function CompanyPage({ searchParams }: PageProps<"/company">) {
  const { company: slug } = await searchParams;
  const { company } = await requireCompanyPage(slug);
  const [dash, team] = await Promise.all([getDashboard(company.id), getCompanyWithMembers(company.id)]);

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        eyebrow="company workspace"
        title={company.name}
        description={<p>your roles, the cohorts they joined, and the candidates who advanced.</p>}
        actions={
          <Button asChild variant="primary">
            <Link href="/company/roles/new">add a role</Link>
          </Button>
        }
      />

      <section aria-labelledby="team" className="flex flex-col gap-3">
        <h2 id="team" className="type-label text-secondary">in this workspace</h2>
        <ul className="flex flex-wrap items-center gap-2">
          {team?.members.map((m) => (
            <li key={m.id} className="chip">
              <span>{m.user.name ?? m.user.email}</span>
              {m.title ? <span className="text-secondary">{m.title}</span> : null}
            </li>
          ))}
          <li>
            <TextLink href="/company/profile" className="target inline-flex items-center px-2">manage team and profile</TextLink>
          </li>
        </ul>
      </section>

      <section aria-labelledby="roles" className="flex flex-col gap-4">
        <h2 id="roles" className="type-display-3">roles</h2>
        {dash.roles.length === 0 ? (
          <EmptyState action={<TextLink href="/company/roles/new">write your first role intake</TextLink>}>
            no roles yet. a role intake says what the job needs and how candidates are judged.
          </EmptyState>
        ) : (
          <ul className="flex flex-col">
            {dash.roles.map((role) => {
              const enrolled = dash.enrollments.filter((e) => e.role.id === role.id);
              const shortlisted = role.shortlist?.entries.length ?? 0;
              return (
                <li key={role.id} className="row flex flex-col gap-2 py-4 tablet:flex-row tablet:items-center tablet:justify-between">
                  <div className="flex flex-col gap-1">
                    <Link href={`/company/roles/${role.id}`} className="type-display-4 link">{role.title}</Link>
                    <p className="type-body-s text-secondary">
                      {LEVEL_LABEL[role.level] ?? role.level}, {REMOTE_LABEL[role.remote] ?? role.remote}, {role.numberOfHires === 1 ? "1 hire" : `${role.numberOfHires} hires`}, {role._count.criteria === 1 ? "1 criterion" : `${role._count.criteria} criteria`}
                    </p>
                    <p className="type-body-s text-secondary">
                      {enrolled.length ? `enrolled in ${enrolled.map((e) => e.hackathon.title).join(", ")}` : "not enrolled in a cohort yet"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill>{ROLE_STATUS_LABEL[role.status] ?? role.status}</StatusPill>
                    {enrolled.length ? (
                      <TextLink href={`/company/roles/${role.id}/shortlist`} className="target inline-flex items-center">
                        shortlist{shortlisted ? ` (${shortlisted})` : ""}
                      </TextLink>
                    ) : (
                      <TextLink href={`/company/roles/${role.id}/enroll`} className="target inline-flex items-center">enroll in a cohort</TextLink>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-12 desktop:grid-cols-2">
        <section aria-labelledby="enrollments" className="flex flex-col gap-4">
          <h2 id="enrollments" className="type-display-3">cohort enrollments</h2>
          {dash.enrollments.length === 0 ? (
            <EmptyState action={dash.roles[0] ? <TextLink href={`/company/roles/${dash.roles[0].id}/enroll`}>enroll {dash.roles[0].title}</TextLink> : <TextLink href="/hackathons">browse hiring cohorts</TextLink>}>
              no enrollments yet. enrolling a role brings advanced candidates to its shortlist.
            </EmptyState>
          ) : (
            <ul className="flex flex-col">
              {dash.enrollments.map((e) => (
                <li key={e.id} className="row flex flex-col gap-1 py-3">
                  <TextLink href={`/hackathons/${e.hackathon.slug}`} className="type-body">{e.hackathon.title}</TextLink>
                  <p className="type-body-s text-secondary">
                    {e.role.title}, <Time value={e.hackathon.startsAt} /> to <Time value={e.hackathon.endsAt} />
                    {e.invoice ? `, invoice ${e.invoice.number}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="requests" className="flex flex-col gap-4">
          <h2 id="requests" className="type-display-3">interview requests</h2>
          {dash.requests.length === 0 ? (
            <EmptyState action={<TextLink href="/company/talent">browse the talent pool</TextLink>}>
              no pending requests. ask for an interview from a candidate report or the talent pool.
            </EmptyState>
          ) : (
            <ul className="flex flex-col">
              {dash.requests.map((r) => (
                <li key={r.id} className="row flex flex-col gap-1 py-3">
                  <span className="type-body">{r.candidate.name ?? "candidate"}, for {r.role.title}</span>
                  <span className="type-body-s text-secondary">requested <Time value={r.createdAt} />, waiting for the firefly team to schedule</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="hires" className="flex flex-col gap-4">
          <h2 id="hires" className="type-display-3">hires</h2>
          {dash.hires.length === 0 ? (
            <EmptyState action={dash.roles[0] ? <TextLink href={`/company/roles/${dash.roles[0].id}/hire`}>report a hire for {dash.roles[0].title}</TextLink> : <TextLink href="/company/roles/new">add a role</TextLink>}>
              no hires reported yet. report one when a shortlisted candidate signs an offer.
            </EmptyState>
          ) : (
            <ul className="flex flex-col">
              {dash.hires.map((h) => (
                <li key={h.id} className="row flex flex-col gap-1 py-3">
                  <span className="type-body">{h.candidate.name}, {h.role.title}</span>
                  <span className="type-body-s text-secondary">starts <Time value={h.startDate} timeZone="UTC" /></span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="invoices" className="flex flex-col gap-4">
          <h2 id="invoices" className="type-display-3">recent invoices</h2>
          {dash.invoices.length === 0 ? (
            <EmptyState action={<TextLink href="/company/billing">open billing</TextLink>}>no invoices yet. enrolling a role in a cohort issues the first one.</EmptyState>
          ) : (
            <>
              <ul className="flex flex-col">
                {dash.invoices.map((inv) => (
                  <li key={inv.id} className="row flex items-center justify-between gap-4 py-3">
                    <span className="flex flex-col gap-1">
                      <span className="type-body">{inv.number}</span>
                      <span className="type-body-s text-secondary">{inv.type === "FLAT_FEE" ? "cohort fee, non-refundable" : "hire fee"}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="type-body">{formatCents(inv.amountCents)}</span>
                      <StatusPill tone={inv.status === "PAID" ? "success" : "neutral"}>{INVOICE_STATUS[inv.status] ?? inv.status}</StatusPill>
                    </span>
                  </li>
                ))}
              </ul>
              <TextLink href="/company/billing" className="target inline-flex items-center">all invoices in billing</TextLink>
            </>
          )}
        </section>
      </div>

      <nav aria-label="more company pages" className="flex flex-col gap-3">
        <h2 className="type-label text-secondary">elsewhere</h2>
        <ul className="flex flex-wrap gap-x-6">
          <li><TextLink href="/company/talent" className="target inline-flex items-center">talent pool of past finishers</TextLink></li>
          <li><TextLink href="/company/billing" className="target inline-flex items-center">billing and invoices</TextLink></li>
          <li><TextLink href="/company/profile" className="target inline-flex items-center">company profile and team</TextLink></li>
        </ul>
      </nav>
    </div>
  );
}
