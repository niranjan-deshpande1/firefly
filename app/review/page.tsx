import { requireRole } from "@/lib/permissions";
import { StubPage } from "@/components/shell/stub-page";

// Owner: evaluation builder. Archetype: collection.
export default async function ReviewPage() {
  await requireRole("REVIEWER");
  return <StubPage title="review queue" owner="evaluation" archetype="collection" />;
}
