import NextLink from "next/link";
import { Button, PageHeader, StatusPill } from "@/components/ui";
import { HackathonTabs } from "@/components/discovery/hackathon-tabs";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format/date";
import { getHackathonForView } from "@/lib/discovery/queries";
import { dateRange, formatLabel, isRegistrationOpen, statusLabel, typeLabel } from "@/lib/discovery/labels";

// Archetype: record (hackathon header shared by every tab; each tab names its own archetype).
export default async function HackathonLayout({ children, params }: LayoutProps<"/hackathons/[slug]">) {
  const { slug } = await params;
  const { hackathon: h, user } = await getHackathonForView(slug);
  const tz = h.timeZone;

  const registered =
    user?.role === "CANDIDATE"
      ? !!(await prisma.registration.findUnique({
          where: { hackathonId_userId: { hackathonId: h.id, userId: user.id } },
          select: { id: true },
        }))
      : false;

  let action = null;
  if (registered) {
    action = (
      <Button asChild variant="secondary">
        <NextLink href="/dashboard">open your dashboard</NextLink>
      </Button>
    );
  } else if (isRegistrationOpen(h.status) && (!user || user.role === "CANDIDATE")) {
    action = (
      <Button asChild variant="primary">
        <NextLink href={`/hackathons/${h.slug}/register`}>{h.type === "HIRING_COHORT" ? "apply to this cohort" : "register"}</NextLink>
      </Button>
    );
  } else if (user && (user.id === h.organizerId || user.role === "ADMIN")) {
    action = (
      <Button asChild variant="secondary">
        <NextLink href="/organize">open the organizer console</NextLink>
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={h.title}
        eyebrow={typeLabel(h.type)}
        description={
          <div className="flex flex-col gap-3">
            <p className="text-primary">{h.tagline}</p>
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 type-body-s" aria-label="key facts">
              <li>
                <StatusPill>{statusLabel(h.status)}</StatusPill>
              </li>
              <li>{dateRange(h.startsAt, h.endsAt, tz)}</li>
              <li>{formatLabel(h.format, h.location)}</li>
              <li>
                posting closes <time dateTime={h.submissionDeadline.toISOString()}>{formatDateTime(h.submissionDeadline, tz)}</time>
              </li>
            </ul>
          </div>
        }
        actions={action}
      />
      <HackathonTabs slug={h.slug} />
      {children}
    </div>
  );
}
