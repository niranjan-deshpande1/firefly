// Server-rendered forms for each details step. Each step is one decision with one save button naming it.
import type { CohortConfig, Hackathon } from "@prisma/client";
import { parseJson } from "@/lib/db";
import { removeCover, saveBasics, saveCover, saveDates, saveFormat, saveRules, saveStatus } from "@/lib/organize/actions/hackathon";
import {
  addOfficeHours,
  removeCheckIn,
  removeOfficeHours,
  saveCheckIn,
  saveCohortBrief,
  saveCohortDates,
} from "@/lib/organize/actions/cohort";
import type { CheckInSlot, OfficeHour } from "@/lib/organize/schemas";
import { MAX_TEAM_SIZE } from "@/lib/organize/schemas";
import { TextLink, Time } from "@/components/ui";
import { BasicsFields } from "./basics-fields";
import { ConfirmAction, FileField, FormShell, SelectField, TextField, ZonedDateFields } from "./form";
import { STATUS_LABEL } from "./console-frame";
import type { StepKey } from "./steps";

type H = Hackathon & { cohortConfig: CohortConfig | null };

const iso = (d: Date | undefined | null) => d?.toISOString() ?? null;

export function DetailStep({ step, hackathon }: { step: StepKey; hackathon: H }) {
  const hidden = { hackathonId: hackathon.id };
  const tz = hackathon.timeZone;
  const cohort = hackathon.cohortConfig;

  switch (step) {
    case "basics":
      return (
        <FormShell action={saveBasics} hidden={hidden} submitLabel="save basics" loadingLabel="saving basics">
          <BasicsFields
            defaults={{
              title: hackathon.title,
              slug: hackathon.slug,
              type: hackathon.type,
              tagline: hackathon.tagline,
              description: hackathon.description,
              timeZone: hackathon.timeZone,
            }}
          />
        </FormShell>
      );

    case "dates":
      return (
        <FormShell action={saveDates} hidden={hidden} submitLabel="save dates" loadingLabel="saving dates">
          <ZonedDateFields
            zone={tz}
            fields={[
              { name: "registrationOpensAt", label: "registration opens", value: iso(hackathon.registrationOpensAt), required: true },
              { name: "startsAt", label: "starts", value: iso(hackathon.startsAt), required: true },
              { name: "submissionDeadline", label: "projects due", value: iso(hackathon.submissionDeadline), required: true },
              { name: "endsAt", label: "ends", value: iso(hackathon.endsAt), required: true },
            ]}
          />
        </FormShell>
      );

    case "rules":
      return (
        <FormShell action={saveRules} hidden={hidden} submitLabel="save rules" loadingLabel="saving rules">
          <TextField name="rules" label="rules" hint="Markdown. say whether AI tools, outside help and existing code are allowed." rows={10} defaultValue={hackathon.rules} />
          <TextField name="eligibility" label="eligibility" hint="Markdown. who can take part." rows={6} defaultValue={hackathon.eligibility} />
        </FormShell>
      );

    case "format":
      return (
        <FormShell action={saveFormat} hidden={hidden} submitLabel="save format" loadingLabel="saving format">
          <SelectField
            name="format"
            label="format"
            required
            defaultValue={hackathon.format}
            options={[
              { value: "ONLINE", label: "online" },
              { value: "IN_PERSON", label: "in person" },
              { value: "HYBRID", label: "hybrid" },
            ]}
          />
          <TextField name="location" label="location" hint="needed for in person and hybrid events." defaultValue={hackathon.location} />
          {hackathon.type === "HIRING_COHORT" ? (
            <>
              <input type="hidden" name="teamPolicy" value="SOLO" />
              <input type="hidden" name="maxTeamSize" value="1" />
              <p className="type-body text-secondary measure">hiring cohorts are solo, so each project shows one builder&apos;s work.</p>
            </>
          ) : (
            <>
              <SelectField
                name="teamPolicy"
                label="teams"
                required
                defaultValue={hackathon.teamPolicy}
                options={[
                  { value: "SOLO", label: "solo only" },
                  { value: "TEAMS_ALLOWED", label: "teams allowed" },
                ]}
              />
              <TextField name="maxTeamSize" label="max team size" hint={`1 to ${MAX_TEAM_SIZE}. solo events use 1.`} type="number" inputMode="numeric" defaultValue={hackathon.maxTeamSize} />
            </>
          )}
          <TextField
            name="themes"
            label="themes"
            hint="separate themes with commas, up to 10."
            defaultValue={parseJson<string[]>(hackathon.themes, []).join(", ")}
          />
        </FormShell>
      );

    case "cover":
      return (
        <div className="flex flex-col gap-8">
          {hackathon.coverImage ? (
            <figure className="flex flex-col gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- stored upload served by /api/files */}
              <img src={hackathon.coverImage} alt={`cover image for ${hackathon.title}`} className="w-full rounded-card" />
              <ConfirmAction
                action={removeCover}
                hidden={hidden}
                label="remove cover image"
                title="remove the cover image?"
                description="the hackathon page shows no cover until you add another."
              />
            </figure>
          ) : null}
          <FormShell action={saveCover} hidden={hidden} submitLabel="upload cover image" loadingLabel="uploading cover image" resetOnSuccess>
            <FileField name="cover" label="cover image" hint="PNG, JPEG, GIF or WebP, up to 5 MB." />
          </FormShell>
        </div>
      );

    case "brief":
      return (
        <FormShell action={saveCohortBrief} hidden={hidden} submitLabel="save cohort prompt" loadingLabel="saving cohort prompt">
          <TextField name="prompt" label="prompt" hint="Markdown. the problem every builder in the cohort works on." rows={12} required defaultValue={cohort?.prompt} />
          <TextField name="suggestedHours" label="suggested hours" hint="the total time you expect a builder to spend, 1 to 80." type="number" inputMode="numeric" defaultValue={cohort?.suggestedHours ?? 20} />
        </FormShell>
      );

    case "defense":
      return (
        <FormShell action={saveCohortDates} hidden={hidden} submitLabel="save defense and results" loadingLabel="saving defense and results">
          <ZonedDateFields
            zone={tz}
            fields={[
              { name: "defenseWindowStart", label: "defense window opens", value: iso(cohort?.defenseWindowStart), required: true },
              { name: "defenseWindowEnd", label: "defense window closes", value: iso(cohort?.defenseWindowEnd), required: true },
              { name: "resultsAt", label: "results go out", value: iso(cohort?.resultsAt), required: true },
            ]}
          />
        </FormShell>
      );

    case "check-ins":
      return <CheckInsStep hackathon={hackathon} />;

    case "office-hours":
      return <OfficeHoursStep hackathon={hackathon} />;

    case "status":
      return (
        <FormShell action={saveStatus} hidden={hidden} submitLabel="save status" loadingLabel="saving status">
          <SelectField
            name="status"
            label="status"
            hint="winners can be picked once the status is judging or completed."
            required
            defaultValue={hackathon.status}
            options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
          />
        </FormShell>
      );
  }
}

function CheckInsStep({ hackathon }: { hackathon: H }) {
  const tz = hackathon.timeZone;
  const list = parseJson<CheckInSlot[]>(hackathon.cohortConfig?.checkInSchedule, []);
  const hidden = { hackathonId: hackathon.id };
  return (
    <div className="flex flex-col gap-12">
      {list.length > 0 ? (
        <ul className="flex flex-col border-t border-line">
          {list.map((c, i) => (
            <li key={c.week} className="flex flex-col gap-2 border-b border-line py-4">
              <p className="type-display-4">week {c.week}</p>
              <p className="type-body-s text-secondary">
                due <Time value={new Date(c.dueAt)} format="datetime" timeZone={tz} />
              </p>
              <p className="type-body measure">{c.prompt}</p>
              <ConfirmAction
                action={removeCheckIn}
                hidden={{ ...hidden, index: String(i) }}
                label="remove check-in"
                title={`remove the week ${c.week} check-in?`}
                description="builders will no longer see this check-in on their schedule."
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="type-body measure">no check-ins are planned yet. add week 1 below.</p>
      )}
      <section aria-labelledby="add-check-in" className="flex flex-col gap-6">
        <h2 id="add-check-in" className="type-display-3">add or replace a week</h2>
        <FormShell action={saveCheckIn} hidden={hidden} submitLabel="save check-in" loadingLabel="saving check-in" resetOnSuccess>
          <TextField name="week" label="week" hint="saving a week that exists replaces it." type="number" inputMode="numeric" required defaultValue={list.length + 1} />
          <ZonedDateFields zone={tz} fields={[{ name: "dueAt", label: "due", required: true }]} />
          <TextField name="prompt" label="prompt" hint="what builders answer that week." rows={3} required />
        </FormShell>
      </section>
    </div>
  );
}

function OfficeHoursStep({ hackathon }: { hackathon: H }) {
  const tz = hackathon.timeZone;
  const list = parseJson<OfficeHour[]>(hackathon.cohortConfig?.officeHours, []);
  const hidden = { hackathonId: hackathon.id };
  return (
    <div className="flex flex-col gap-12">
      {list.length > 0 ? (
        <ul className="flex flex-col border-t border-line">
          {list.map((o, i) => (
            <li key={`${o.startsAt}-${i}`} className="flex flex-col gap-2 border-b border-line py-4">
              <p className="type-body">
                <Time value={new Date(o.startsAt)} format="datetime" timeZone={tz} /> to <Time value={new Date(o.endsAt)} format="time" timeZone={tz} />
              </p>
              {o.link ? (
                <TextLink href={o.link} className="type-body-s">
                  office hours call link
                </TextLink>
              ) : null}
              <ConfirmAction
                action={removeOfficeHours}
                hidden={{ ...hidden, index: String(i) }}
                label="remove office hours"
                title="remove these office hours?"
                description="builders will no longer see this slot."
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="type-body measure">no office hours yet. add the first slot below.</p>
      )}
      <section aria-labelledby="add-office-hours" className="flex flex-col gap-6">
        <h2 id="add-office-hours" className="type-display-3">add a slot</h2>
        <FormShell action={addOfficeHours} hidden={hidden} submitLabel="add office hours" loadingLabel="adding office hours" resetOnSuccess>
          <ZonedDateFields
            zone={tz}
            fields={[
              { name: "startsAt", label: "starts", required: true },
              { name: "endsAt", label: "ends", required: true },
            ]}
          />
          <TextField name="link" label="call link" hint="optional. where builders join." type="url" />
        </FormShell>
      </section>
    </div>
  );
}
