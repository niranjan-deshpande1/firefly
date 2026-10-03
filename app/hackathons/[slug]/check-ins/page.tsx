import { requireUser } from "@/lib/auth";
import { StubPage } from "@/components/shell/stub-page";

// Owner: participation builder. Archetype: stream.
export default async function HackathonsSlugCheckInsPage() {
  await requireUser();
  return <StubPage title="check-ins" owner="participation" archetype="stream" />;
}
