// Archetype: passage. One details step of a hackathon: one decision, its explanation, one save.
import { notFound } from "next/navigation";
import { managedHackathon } from "@/lib/organize/guard";
import { TextLink } from "@/components/ui";
import { ConsoleFrame } from "@/components/organize/console-frame";
import { DetailStep } from "@/components/organize/detail-steps";
import { stepsFor } from "@/components/organize/steps";

export default async function DetailStepPage({ params }: PageProps<"/organize/[slug]/edit/[step]">) {
  const { slug, step } = await params;
  const { hackathon } = await managedHackathon(slug);
  const steps = stepsFor(hackathon.type);
  const index = steps.findIndex((s) => s.key === step);
  if (index === -1) notFound();
  const current = steps[index];
  const next = steps[index + 1];
  const base = `/organize/${slug}`;

  return (
    <ConsoleFrame hackathon={hackathon} title={current.title} description={current.description}>
      <div className="grid gap-12 desktop:grid-cols-12 desktop:gap-6">
        <nav aria-label="details steps" className="desktop:col-span-3">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 desktop:flex-col">
            {steps.map((s) => (
              <li key={s.key}>
                <TextLink
                  href={`${base}/edit/${s.key}`}
                  aria-current={s.key === current.key ? "page" : undefined}
                  className="inline-flex min-h-11 items-center type-body-s"
                >
                  {s.label}
                </TextLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="measure flex flex-col gap-12 desktop:col-span-6">
          <DetailStep key={current.key} step={current.key} hackathon={hackathon} />
          <p className="type-body-s text-secondary">
            {next ? (
              <>
                next: <TextLink href={`${base}/edit/${next.key}`}>{next.label}</TextLink>
              </>
            ) : (
              <TextLink href={base}>back to the console</TextLink>
            )}
          </p>
        </div>
      </div>
    </ConsoleFrame>
  );
}
