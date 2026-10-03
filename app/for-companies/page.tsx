import type { Metadata } from "next";
import NextLink from "next/link";
import { Button, PageHeader, Table, Td, Th, Tr } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatCents, hireFeeCents } from "@/lib/billing/math";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "hiring with firefly" };

const EXAMPLE_SALARY_CENTS = 14_000_000; // $140,000, illustrative

const STEPS = [
  {
    title: "write down the role",
    body: "level, skills, domain knowledge, salary range and location, plus a few criteria specific to your team. criteria must be about the job.",
  },
  {
    title: "enroll it in a hiring cohort",
    body: "builders spend 2 weeks making a project from one prompt, with weekly written check-ins. AI use is allowed and recorded.",
  },
  {
    title: "blind, evidence-linked review",
    body: "two reviewers score each project with names, photos and schools hidden. every score links to a commit, an AI transcript excerpt, a decision log entry or a check-in. disagreements of 2 levels or more are talked through and written down.",
  },
  {
    title: "defense interviews",
    body: "builders who advance walk through their code, make a live change and fix a bug planted in their own project. a passed interview marks the project verified.",
  },
  {
    title: "your shortlist and reports",
    body: "you see a shortlist for your role and a report per candidate with scores, evidence links, the interview scorecard and a summary. you decide who to hire.",
  },
];

// Archetype: passage. One decision: enroll a role in a cohort. Pricing comes from admin settings.
export default async function ForCompaniesPage() {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);
  const flat = formatCents(settings.flatFeeCents);
  const rate = `${settings.hireFeeBps / 100}%`;
  const example = formatCents(hireFeeCents(EXAMPLE_SALARY_CENTS, settings.hireFeeBps));
  const isCompany = user?.role === "COMPANY" || user?.role === "ADMIN";

  return (
    <div className="grid desktop:grid-cols-12">
      <div className="flex flex-col gap-12 desktop:col-span-6 desktop:col-start-2">
        <PageHeader
          title="hiring with firefly"
          eyebrow="for companies"
          description={
            <p>
              hire builders after seeing how they build with AI, and after they defend that work in an interview. people review
              and decide at every step. nothing is scored, ranked or rejected automatically.
            </p>
          }
        />

        <section aria-labelledby="how-heading" className="flex flex-col gap-4">
          <h2 id="how-heading" className="type-display-3">how it works</h2>
          <ol className="flex flex-col">
            {STEPS.map((s, n) => (
              <li key={s.title} className="row flex flex-col gap-2 py-4">
                <h3 className="type-display-4">
                  {n + 1}. {s.title}
                </h3>
                <p className="type-body measure">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="pricing-heading" className="flex flex-col gap-4">
          <h2 id="pricing-heading" className="type-display-3">pricing</h2>
          <Table caption="firefly fees for companies">
            <thead>
              <Tr>
                <Th>fee</Th>
                <Th>amount</Th>
                <Th>when</Th>
              </Tr>
            </thead>
            <tbody>
              <Tr>
                <Td>cohort fee</Td>
                <Td>{flat} flat, per hiring cohort you join</Td>
                <Td>charged at enrollment. non-refundable.</Td>
              </Tr>
              <Tr>
                <Td>hire fee</Td>
                <Td>{rate} of the hire&apos;s reported first-year salary, per hire</Td>
                <Td>applies to hires made within {settings.attributionWindowMonths} months of the cohort&apos;s end</Td>
              </Tr>
            </tbody>
          </Table>
          <p className="type-body-s text-secondary measure">
            example: one hire at {formatCents(EXAMPLE_SALARY_CENTS)} means a hire fee of {example}, on top of the {flat} cohort fee. invoices show in your
            billing page.
          </p>
        </section>

        <section aria-labelledby="start-heading" className="flex flex-col items-start gap-4">
          <h2 id="start-heading" className="type-display-3">start with one role</h2>
          <p className="type-body measure">
            {isCompany
              ? "add a role from your dashboard, then enroll it in the next hiring cohort."
              : "sign in with your work account, add your company and one role, then enroll it in the next hiring cohort."}
          </p>
          <Button asChild variant="primary">
            {isCompany ? <NextLink href="/company">open your company dashboard</NextLink> : <NextLink href="/signin">sign in to enroll a role</NextLink>}
          </Button>
        </section>
      </div>
    </div>
  );
}
