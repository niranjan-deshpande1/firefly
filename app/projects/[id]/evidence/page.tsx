import { requireUser } from "@/lib/auth";
import { StubPage } from "@/components/shell/stub-page";

// Owner: evidence builder. Archetype: record.
export default async function ProjectsIdEvidencePage() {
  await requireUser();
  return <StubPage title="evidence locker" owner="evidence" archetype="record" />;
}
