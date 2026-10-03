import { requireRole } from "@/lib/permissions";
import { StubPage } from "@/components/shell/stub-page";

// Owner: companies builder. Archetype: collection.
export default async function CompanyTalentPage() {
  await requireRole("COMPANY");
  return <StubPage title="talent pool" owner="companies" archetype="collection" />;
}
