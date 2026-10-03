import { requireRole } from "@/lib/permissions";
import { StubPage } from "@/components/shell/stub-page";

// Owner: ops builder. Archetype: collection.
export default async function CompanyBillingPage() {
  await requireRole("COMPANY");
  return <StubPage title="billing" owner="ops" archetype="collection" />;
}
