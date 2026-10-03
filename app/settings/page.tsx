// Owner: profiles and privacy builder. Archetype: passage ("you").
// Builders: profile, privacy (visibility, talent pool at #talent-pool), their data. Everyone: name and sign out.
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { parseJson, type LinkItem } from "@/lib/db";
import { authorizePage } from "@/lib/permissions";
import { CONSENT_VERSION, formatLinks } from "@/lib/profiles";
import { getOwnSettings } from "@/lib/profiles/queries";
import { SignOutButton } from "@/components/shell/app-shell";
import { Button, Divider, PageHeader, TextLink, Time } from "@/components/ui";
import { DeleteRequest } from "@/components/profiles/delete-request";
import { PrivacyControls } from "@/components/profiles/privacy-controls";
import { ProfileForm } from "@/components/profiles/profile-form";

export const metadata = { title: "you" };

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6">
      <h2 id={id} className="type-display-3">{title}</h2>
      {children}
    </section>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();
  await authorizePage(user, "profile.edit", { subjectUserId: user.id });
  const me = await getOwnSettings(user.id);
  if (!me) notFound();

  const profile = me.candidateProfile;
  const isBuilder = user.role === "CANDIDATE" && !!profile;
  const consentCurrent = profile?.consentVersion === CONSENT_VERSION && !!profile.consentAt;
  const openDelete = me.dataRequests[0];

  return (
    <div className="flex flex-col gap-16 desktop:ms-[8.333%] desktop:w-7/12">
      <PageHeader
        title="you"
        description={isBuilder ? "your profile, who can see it and the data we hold about you." : "your name and account."}
        actions={isBuilder && me.username ? <TextLink href={`/u/${me.username}`}>view your profile</TextLink> : undefined}
      />

      {user.role === "CANDIDATE" && !consentCurrent ? (
        <p className="type-body measure">
          {profile ? "the way we handle data changed since you last agreed. " : "you have not set up your builder profile yet. "}
          <TextLink href="/onboarding?step=consent&next=/settings">read how we handle your data and agree</TextLink>
        </p>
      ) : null}

      <Section id="settings-profile" title="profile">
        <ProfileForm
          builder={isBuilder}
          values={{
            name: me.name ?? "",
            username: me.username ?? "",
            headline: profile?.headline ?? "",
            bio: profile?.bio ?? "",
            skills: parseJson<string[]>(profile?.skills, []).join(", "),
            links: formatLinks(parseJson<LinkItem[]>(profile?.links, [])),
            location: profile?.location ?? "",
            school: profile?.school ?? "",
            experienceLevel: profile?.experienceLevel ?? "",
          }}
        />
      </Section>

      {isBuilder && profile ? (
        <>
          <Divider />
          <Section id="settings-privacy" title="privacy">
            <PrivacyControls visibility={profile.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE"} talentPoolOptIn={profile.talentPoolOptIn} />
          </Section>

          <Divider />
          <Section id="settings-data" title="your data">
            <div className="flex flex-col gap-3 measure">
              <h3 className="type-display-4">download a copy</h3>
              <p className="type-body-s text-secondary">a JSON file with your profile, registrations, projects, evidence, check-ins, comments and the feedback you can already read.</p>
              <div>
                <Button asChild variant="secondary">
                  <a href="/settings/export" download>download my data</a>
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-3 measure">
              <h3 className="type-display-4">delete your data</h3>
              {openDelete ? (
                <p className="type-body-s text-secondary">
                  you asked us to delete your data on <Time value={openDelete.createdAt} />. an admin will handle it.
                </p>
              ) : (
                <>
                  <p className="type-body-s text-secondary">send a request and an admin deletes your account and what you made here.</p>
                  <div><DeleteRequest /></div>
                </>
              )}
            </div>
            {consentCurrent && profile.consentAt ? (
              <p className="type-body-s text-secondary measure">
                you agreed to how we handle data on <Time value={profile.consentAt} />.{" "}
                <TextLink href="/onboarding?step=consent&next=/settings">read it again</TextLink>
              </p>
            ) : null}
          </Section>
        </>
      ) : null}

      <Divider />
      <Section id="settings-account" title="account">
        <div className="measure">
          <SignOutButton />
        </div>
      </Section>
    </div>
  );
}
