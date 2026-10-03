import { requireUser } from "@/lib/auth";
import { StubPage } from "@/components/shell/stub-page";

// Owner: profiles and privacy builder. Archetype: passage.
export default async function SettingsPage() {
  await requireUser();
  return <StubPage title="you" owner="profiles and privacy" archetype="passage" />;
}
