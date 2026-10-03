// Archetype: passage. One decision: name the hackathon and choose its type. Dates come next.
import { authorizePage, requireRole } from "@/lib/permissions";
import { createHackathon } from "@/lib/organize/actions/hackathon";
import { PageHeader, TextLink } from "@/components/ui";
import { FormShell } from "@/components/organize/form";
import { BasicsFields } from "@/components/organize/basics-fields";

export const metadata = { title: "create a hackathon" };

export default async function NewHackathonPage() {
  const user = await requireRole("ORGANIZER");
  await authorizePage(user, "hackathon.create");
  return (
    <div className="measure flex flex-col gap-12">
      <PageHeader
        title="name your hackathon"
        description="it starts as a draft only you can see. next you set the dates, then rules, format and prizes."
      />
      <FormShell action={createHackathon} submitLabel="create draft hackathon" loadingLabel="creating draft">
        <BasicsFields />
      </FormShell>
      <TextLink href="/organize">back to your hackathons</TextLink>
    </div>
  );
}
