import { requireRole } from "@/lib/permissions";
import { StubPage } from "@/components/shell/stub-page";

// Owner: interviews builder. Archetype: collection.
export default async function InterviewsPage() {
  await requireRole("REVIEWER", "COMPANY");
  return <StubPage title="interviews" owner="interviews" archetype="collection" />;
}
