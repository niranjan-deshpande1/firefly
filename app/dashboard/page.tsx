import { requireUser } from "@/lib/auth";
import { StubPage } from "@/components/shell/stub-page";

// Owner: participation builder. Archetype: workspace.
export default async function DashboardPage() {
  await requireUser();
  return <StubPage title="your dashboard" owner="participation" archetype="workspace" />;
}
