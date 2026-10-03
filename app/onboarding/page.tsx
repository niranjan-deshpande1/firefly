import { requireUser } from "@/lib/auth";
import { StubPage } from "@/components/shell/stub-page";

// Owner: profiles and privacy builder. Archetype: passage.
export default async function OnboardingPage() {
  await requireUser();
  return <StubPage title="welcome" owner="profiles and privacy" archetype="passage" />;
}
