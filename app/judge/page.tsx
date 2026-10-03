import { requireRole } from "@/lib/permissions";
import { StubPage } from "@/components/shell/stub-page";

// Owner: evaluation builder. Archetype: collection.
export default async function JudgePage() {
  await requireRole("REVIEWER");
  return <StubPage title="judging" owner="evaluation" archetype="collection" />;
}
