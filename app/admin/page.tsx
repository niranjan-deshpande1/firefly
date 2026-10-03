import { requireRole } from "@/lib/permissions";
import { StubPage } from "@/components/shell/stub-page";

// Owner: ops builder. Archetype: workspace.
export default async function AdminPage() {
  await requireRole("ADMIN");
  return <StubPage title="admin" owner="ops" archetype="workspace" />;
}
