import { requireRole } from "@/lib/permissions";
import { StubPage } from "@/components/shell/stub-page";

// Owner: organizer builder. Archetype: workspace.
export default async function OrganizePage() {
  await requireRole("ORGANIZER");
  return <StubPage title="organize" owner="organizer" archetype="workspace" />;
}
