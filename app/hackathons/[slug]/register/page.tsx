import { requireUser } from "@/lib/auth";
import { StubPage } from "@/components/shell/stub-page";

// Owner: participation builder. Archetype: passage.
export default async function HackathonsSlugRegisterPage() {
  await requireUser();
  return <StubPage title="register" owner="participation" archetype="passage" />;
}
