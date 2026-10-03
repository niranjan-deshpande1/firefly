import NextLink from "next/link";
import { StatusPill } from "@/components/ui";
import { DEFAULT_TIME_ZONE, formatDateTime } from "@/lib/format/date";
import { dateRange, formatLabel, statusLabel, typeLabel } from "@/lib/discovery/labels";
import type { HackathonCard as Card } from "@/lib/discovery/queries";

/** Flat collection tile (manual 8.2): equal size, no rotation, no counts. */
export function HackathonCard({ hackathon: h, headingLevel = 2 }: { hackathon: Card; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="card flex h-full flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <StatusPill tone={h.type === "HIRING_COHORT" ? "accent" : "neutral"}>{typeLabel(h.type)}</StatusPill>
        <StatusPill>{statusLabel(h.status)}</StatusPill>
      </div>
      <div className="flex flex-col gap-2">
        <Heading className="type-display-3">
          <NextLink href={`/hackathons/${h.slug}`} className="hover:text-accent focus-visible:text-accent transition-state">
            {h.title}
          </NextLink>
        </Heading>
        <p className="type-body text-secondary">{h.tagline}</p>
      </div>
      <dl className="mt-auto grid gap-1 type-body-s">
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-secondary">dates</dt>
          <dd>{dateRange(h.startsAt, h.endsAt, DEFAULT_TIME_ZONE)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-secondary">posting closes</dt>
          <dd>{formatDateTime(h.submissionDeadline, DEFAULT_TIME_ZONE)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-secondary">where</dt>
          <dd>{formatLabel(h.format, h.location)}</dd>
        </div>
        {h.themes.length > 0 ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-secondary">themes</dt>
            <dd>{h.themes.join(", ")}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
