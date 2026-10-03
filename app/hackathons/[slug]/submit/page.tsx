import { requireUser } from "@/lib/auth";
import { StubPage } from "@/components/shell/stub-page";

// Owner: projects builder. Archetype: passage.
export default async function HackathonsSlugSubmitPage() {
  await requireUser();
  return <StubPage title="post your project" owner="projects" archetype="passage" />;
}
