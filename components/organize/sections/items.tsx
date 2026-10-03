// Prizes, schedule, judging criteria and resources: a list, then one form that adds a row or edits the chosen one.
import type { ReactNode } from "react";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/billing/math";
import { DEFAULT_TIME_ZONE } from "@/lib/format/date";
import { removeItem, saveCriterion, savePrize, saveResource, saveScheduleItem } from "@/lib/organize/actions/items";
import { timeZoneList } from "@/lib/organize/time";
import { SCHEDULE_KINDS } from "@/lib/db/enums";
import { EmptyState, TextLink, Time } from "@/components/ui";
import { ConfirmAction, FormShell, SelectField, TextField, ZonedDateFields } from "../form";

type Ctx = { hackathonId: string; slug: string; editId?: string };
type Kind = "prize" | "schedule" | "criterion" | "resource";

const SCHEDULE_LABEL: Record<string, string> = {
  MILESTONE: "milestone",
  KICKOFF: "kickoff",
  CHECK_IN: "check-in",
  OFFICE_HOURS: "office hours",
  DEADLINE: "deadline",
  DEFENSE: "defense",
  RESULTS: "results",
  EVENT: "event",
};

function Row({ ctx, kind, id, name, children, removeNote }: { ctx: Ctx; kind: Kind; id: string; name: string; children: ReactNode; removeNote: string }) {
  const section = kind === "criterion" ? "criteria" : kind === "schedule" ? "schedule" : `${kind}s`;
  return (
    <li className="flex flex-col gap-3 border-b border-line py-4 tablet:flex-row tablet:items-start tablet:justify-between tablet:gap-6">
      <div className="flex flex-col gap-1 measure">
        <p className="type-display-4">{name}</p>
        {children}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <TextLink href={`/organize/${ctx.slug}/${section}?edit=${id}#item-form`} className="inline-flex min-h-11 items-center">
          edit {name}
        </TextLink>
        <ConfirmAction
          action={removeItem}
          hidden={{ hackathonId: ctx.hackathonId, id, kind }}
          label={`remove ${kind === "schedule" ? "schedule item" : kind}`}
          title={`remove ${name}?`}
          description={removeNote}
        />
      </div>
    </li>
  );
}

function FormSection({ ctx, section, noun, editing, children }: { ctx: Ctx; section: string; noun: string; editing: boolean; children: ReactNode }) {
  return (
    <section id="item-form" aria-labelledby="item-form-heading" className="measure flex flex-col gap-6">
      <h2 id="item-form-heading" className="type-display-3">
        {editing ? `edit ${noun}` : `add a ${noun}`}
      </h2>
      {children}
      {editing ? <TextLink href={`/organize/${ctx.slug}/${section}#item-form`}>add a new {noun} instead</TextLink> : null}
    </section>
  );
}

const hiddenFor = (ctx: Ctx, id?: string): Record<string, string> => (id ? { hackathonId: ctx.hackathonId, id } : { hackathonId: ctx.hackathonId });

export async function PrizesSection({ ctx }: { ctx: Ctx }) {
  const prizes = await prisma.prize.findMany({ where: { hackathonId: ctx.hackathonId }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const editing = prizes.find((p) => p.id === ctx.editId);
  return (
    <>
      {prizes.length === 0 ? (
        <EmptyState action={<TextLink href="#item-form">add the first prize</TextLink>}>no prizes yet. prizes show on the hackathon page as plain text.</EmptyState>
      ) : (
        <ul className="flex flex-col border-t border-line">
          {prizes.map((p) => (
            <Row key={p.id} ctx={ctx} kind="prize" id={p.id} name={p.name} removeNote="any awards already picked for this prize are removed too.">
              <p className="type-body-s text-secondary">
                {p.valueCents !== null ? `${formatCents(p.valueCents)}, ` : ""}
                {p.quantity} {p.quantity === 1 ? "place" : "places"}
              </p>
              {p.description ? <p className="type-body-s">{p.description}</p> : null}
            </Row>
          ))}
        </ul>
      )}
      <FormSection ctx={ctx} section="prizes" noun="prize" editing={!!editing}>
        <FormShell key={editing?.id ?? "new"} action={savePrize} hidden={hiddenFor(ctx, editing?.id)} submitLabel="save prize" loadingLabel="saving prize" resetOnSuccess={!editing}>
          <TextField name="name" label="name" required defaultValue={editing?.name} />
          <TextField name="description" label="description" rows={3} defaultValue={editing?.description} />
          <TextField name="value" label="value in dollars" hint="optional, like 500 or 500.00." inputMode="decimal" defaultValue={editing?.valueCents != null ? (editing.valueCents / 100).toFixed(2) : ""} />
          <TextField name="quantity" label="places" hint="how many projects can win it, 1 to 20." type="number" inputMode="numeric" defaultValue={editing?.quantity ?? 1} />
          <TextField name="sortOrder" label="order" hint="lower numbers list first." type="number" inputMode="numeric" defaultValue={editing?.sortOrder ?? prizes.length} />
        </FormShell>
      </FormSection>
    </>
  );
}

export async function ScheduleSection({ ctx }: { ctx: Ctx }) {
  const items = await prisma.scheduleItem.findMany({ where: { hackathonId: ctx.hackathonId }, orderBy: { startsAt: "asc" } });
  const editing = items.find((i) => i.id === ctx.editId);
  return (
    <>
      {items.length === 0 ? (
        <EmptyState action={<TextLink href="#item-form">add the kickoff</TextLink>}>nothing is on the schedule yet. start with the kickoff.</EmptyState>
      ) : (
        <ul className="flex flex-col border-t border-line">
          {items.map((i) => (
            <Row key={i.id} ctx={ctx} kind="schedule" id={i.id} name={i.title} removeNote="it disappears from the public schedule.">
              <p className="type-body-s text-secondary">
                {SCHEDULE_LABEL[i.kind] ?? i.kind}, <Time value={i.startsAt} format="datetime" />
                {i.endsAt ? (
                  <>
                    {" "}to <Time value={i.endsAt} format="time" />
                  </>
                ) : null}
              </p>
              {i.description ? <p className="type-body-s">{i.description}</p> : null}
            </Row>
          ))}
        </ul>
      )}
      <FormSection ctx={ctx} section="schedule" noun="schedule item" editing={!!editing}>
        <FormShell key={editing?.id ?? "new"} action={saveScheduleItem} hidden={hiddenFor(ctx, editing?.id)} submitLabel="save schedule" loadingLabel="saving schedule" resetOnSuccess={!editing}>
          <SelectField
            name="kind"
            label="kind"
            hint="office hours appear on builders' schedules as drop-in times."
            required
            defaultValue={editing?.kind ?? "MILESTONE"}
            options={SCHEDULE_KINDS.map((k) => ({ value: k, label: SCHEDULE_LABEL[k] }))}
          />
          <TextField name="title" label="title" required defaultValue={editing?.title} />
          <ZonedDateFields
            zones={timeZoneList()}
            defaultZone={DEFAULT_TIME_ZONE}
            fields={[
              { name: "startsAt", label: "starts", value: editing?.startsAt.toISOString(), required: true },
              { name: "endsAt", label: "ends", value: editing?.endsAt?.toISOString(), hint: "optional." },
            ]}
          />
          <TextField name="description" label="description" rows={3} defaultValue={editing?.description} />
          <TextField name="link" label="link" hint="optional, like a call or stream link." type="url" defaultValue={editing?.link} />
        </FormShell>
      </FormSection>
    </>
  );
}

export async function CriteriaSection({ ctx }: { ctx: Ctx }) {
  const criteria = await prisma.judgingCriterion.findMany({ where: { hackathonId: ctx.hackathonId }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const editing = criteria.find((c) => c.id === ctx.editId);
  return (
    <>
      {criteria.length === 0 ? (
        <EmptyState action={<TextLink href="#item-form">add the first criterion</TextLink>}>no judging criteria yet. judges score each project against these.</EmptyState>
      ) : (
        <ul className="flex flex-col border-t border-line">
          {criteria.map((c) => (
            <Row key={c.id} ctx={ctx} kind="criterion" id={c.id} name={c.name} removeNote="judges' scores against this criterion are removed too.">
              <p className="type-body-s text-secondary">weight {c.weight}</p>
              <p className="type-body-s">{c.description}</p>
            </Row>
          ))}
        </ul>
      )}
      <FormSection ctx={ctx} section="criteria" noun="criterion" editing={!!editing}>
        <FormShell key={editing?.id ?? "new"} action={saveCriterion} hidden={hiddenFor(ctx, editing?.id)} submitLabel="save criterion" loadingLabel="saving criterion" resetOnSuccess={!editing}>
          <TextField name="name" label="name" required defaultValue={editing?.name} />
          <TextField name="description" label="what judges look for" rows={3} required defaultValue={editing?.description} />
          <TextField name="weight" label="weight" hint="1 to 10." type="number" inputMode="numeric" defaultValue={editing?.weight ?? 1} />
          <TextField name="sortOrder" label="order" hint="lower numbers list first." type="number" inputMode="numeric" defaultValue={editing?.sortOrder ?? criteria.length} />
        </FormShell>
      </FormSection>
    </>
  );
}

export async function ResourcesSection({ ctx }: { ctx: Ctx }) {
  const resources = await prisma.resource.findMany({ where: { hackathonId: ctx.hackathonId }, orderBy: { title: "asc" } });
  const editing = resources.find((r) => r.id === ctx.editId);
  return (
    <>
      {resources.length === 0 ? (
        <EmptyState action={<TextLink href="#item-form">add the first resource</TextLink>}>no resources yet. link the docs and starter material builders need.</EmptyState>
      ) : (
        <ul className="flex flex-col border-t border-line">
          {resources.map((r) => (
            <Row key={r.id} ctx={ctx} kind="resource" id={r.id} name={r.title} removeNote="it disappears from the public resources tab.">
              <p className="type-body-s break-all text-secondary">{r.url}</p>
              {r.description ? <p className="type-body-s">{r.description}</p> : null}
            </Row>
          ))}
        </ul>
      )}
      <FormSection ctx={ctx} section="resources" noun="resource" editing={!!editing}>
        <FormShell key={editing?.id ?? "new"} action={saveResource} hidden={hiddenFor(ctx, editing?.id)} submitLabel="save resource" loadingLabel="saving resource" resetOnSuccess={!editing}>
          <TextField name="title" label="title" required defaultValue={editing?.title} />
          <TextField name="url" label="link" type="url" required defaultValue={editing?.url} />
          <TextField name="description" label="description" rows={3} defaultValue={editing?.description} />
        </FormShell>
      </FormSection>
    </>
  );
}
