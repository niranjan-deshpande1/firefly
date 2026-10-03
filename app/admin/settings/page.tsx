// Owner: ops builder. Archetype: passage (operator only).
import { authorizePage, requireRole } from "@/lib/permissions";
import { getSettings } from "@/lib/settings";
import { settingsToForm } from "@/lib/admin/forms";
import { PageHeader, TextLink } from "@/components/ui";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { SettingsForm } from "@/components/admin/settings-form";
import { ActionButton } from "@/components/admin/action-button";
import { runJobsAction } from "@/lib/admin/actions";

export const metadata = { title: "settings" };

export default async function AdminSettingsPage() {
  const user = await requireRole("ADMIN");
  await authorizePage(user, "admin.access");
  const settings = await getSettings();

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="operator"
          title="fees and retention"
          description="changes apply to new invoices only. invoices already issued keep their amounts."
        />
        <AdminTabs />
      </div>
      <SettingsForm values={settingsToForm(settings)} />
      <p className="type-body-s text-secondary measure">
        every change is written to the <TextLink href="/admin/audit?action=SETTINGS_CHANGED">audit log of settings changes</TextLink>.
      </p>
      <section aria-labelledby="jobs-heading" className="measure flex flex-col gap-3">
        <h2 id="jobs-heading" className="type-display-4">scheduled jobs</h2>
        <p className="type-body-s text-secondary">
          the jobs email held feedback once results are out and delete process evidence from hackathons that ended more than the retention period ago.
          they run on a schedule with <code>npm run jobs</code>; run them here to catch up now. each run is in the{" "}
          <TextLink href="/admin/audit?action=RETENTION_RUN">audit log of retention runs</TextLink>.
        </p>
        <div>
          <ActionButton action={runJobsAction} id="now" label="run scheduled jobs now" loadingLabel="running jobs" />
        </div>
      </section>
    </>
  );
}
