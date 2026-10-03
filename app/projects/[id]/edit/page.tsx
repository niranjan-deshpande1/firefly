import { requireUser } from "@/lib/auth";
import { StubPage } from "@/components/shell/stub-page";

// Owner: projects builder. Archetype: passage.
export default async function ProjectsIdEditPage() {
  await requireUser();
  return <StubPage title="edit project" owner="projects" archetype="passage" />;
}
