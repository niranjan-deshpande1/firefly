import type { ReactNode } from "react";
import { PageHeader, StatusPill, type StatusTone } from "@/components/ui";
import { ConsoleNav } from "./console-nav";

export const TYPE_LABEL: Record<string, string> = { OPEN: "open hackathon", HIRING_COHORT: "hiring cohort" };

export const STATUS_LABEL: Record<string, string> = {
  DRAFT: "draft",
  UPCOMING: "upcoming",
  OPEN: "open",
  JUDGING: "judging",
  DEFENSE: "defense",
  COMPLETED: "completed",
};

const STATUS_TONE: Record<string, StatusTone> = { DRAFT: "neutral", OPEN: "success", JUDGING: "warning", DEFENSE: "warning", COMPLETED: "neutral", UPCOMING: "accent" };

export function HackathonStatus({ status }: { status: string }) {
  return <StatusPill tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status.toLowerCase()}</StatusPill>;
}

type Props = {
  hackathon: { slug: string; title: string; type: string; status: string };
  /** The page's one lowercase display line. */
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

/** Header, console tabs, then the section. The hackathon title is builder-authored, so it is never case-transformed. */
export function ConsoleFrame({ hackathon, title, description, actions, children }: Props) {
  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow={TYPE_LABEL[hackathon.type]}
          title={title}
          description={
            <div className="flex flex-col gap-2">
              <p className="flex flex-wrap items-center gap-3">
                <span className="type-display-4 text-primary">{hackathon.title}</span>
                <HackathonStatus status={hackathon.status} />
              </p>
              {description ? <div>{description}</div> : null}
            </div>
          }
          actions={actions}
        />
        <ConsoleNav slug={hackathon.slug} type={hackathon.type} />
      </div>
      {children}
    </>
  );
}
