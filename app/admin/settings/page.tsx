// Owner: ops builder. Archetype: passage (operator only).
import { authorizePage, requireRole } from "@/lib/permissions";
import { getSettings } from "@/lib/settings";
import { settingsToForm } from "@/lib/admin/forms";
import { PageHeader, TextLink } from "@/components/ui";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { SettingsForm } from "@/components/admin/settings-form";

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
    </>
  );
}
