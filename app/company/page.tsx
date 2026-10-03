import { requireRole } from "@/lib/permissions";
import { StubPage } from "@/components/shell/stub-page";

// Owner: companies builder. Archetype: workspace.
export default async function CompanyPage() {
  await requireRole("COMPANY");
  return <StubPage title="your company" owner="companies" archetype="workspace" />;
}
