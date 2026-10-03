"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Checkbox, Field, Input, Radio, RadioGroup, Select, useToast } from "@/components/ui";
import { scheduleInterview } from "@/lib/interviews/actions";
import type { SchedulingOptions } from "@/lib/interviews/queries";
import { MODE_LABELS, MODEL_LABELS } from "@/lib/interviews/script";

type Model = keyof typeof MODEL_LABELS;
type Mode = keyof typeof MODE_LABELS;

type ScheduleFormProps = SchedulingOptions & { zones: string[]; defaultZone: string; defaultProjectId?: string; defaultRoleId?: string; requestId?: string };

/** Passage: one decision (when and who), one primary action. */
export function ScheduleForm({ projects, reviewers, zones, defaultZone, defaultProjectId, defaultRoleId, requestId }: ScheduleFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [projectId, setProjectId] = useState(defaultProjectId && projects.some((p) => p.id === defaultProjectId) ? defaultProjectId : projects[0]?.id ?? "");
  const [model, setModel] = useState<Model>("JOINT");
  const [mode, setMode] = useState<Mode>("IN_PERSON");
  const [roleId, setRoleId] = useState(projects.find((p) => p.id === projectId)?.roles.some((r) => r.id === defaultRoleId) ? defaultRoleId! : "");
  const [location, setLocation] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [timeZone, setTimeZone] = useState(defaultZone);
  const [durationMin, setDurationMin] = useState("75");
  const [panel, setPanel] = useState<string[]>([]);

  const project = projects.find((p) => p.id === projectId);
  const role = project?.roles.find((r) => r.id === roleId);
  const eligible = [...(model === "COMPANY_RUN" ? [] : reviewers.map((r) => ({ ...r, side: "reviewer" }))), ...(model === "WE_RUN" ? [] : (role?.members ?? []).map((m) => ({ ...m, side: role!.company })))];
  const chosen = panel.filter((id) => eligible.some((e) => e.id === id));

  const toggle = (id: string, on: boolean) => setPanel((prev) => (on ? [...prev, id] : prev.filter((x) => x !== id)));

  const schedule = () =>
    startTransition(async () => {
      const result = await scheduleInterview({
        projectId,
        model,
        mode,
        localTime,
        timeZone,
        durationMin,
        roleId: roleId || undefined,
        location: mode === "IN_PERSON" ? location : undefined,
        videoLink: mode === "VIDEO" ? videoLink : undefined,
        interviewerIds: chosen,
        requestId,
      });
      if (!result.ok) return setError(result.error);
      toast("interview scheduled");
      router.push("/interviews");
    });

  return (
    <div className="flex flex-col gap-8 measure">
      <Field label="candidate" required hint="only projects with an advance decision are listed.">
        {({ id, describedBy }) => (
          <Select id={id} aria-describedby={describedBy} value={projectId} onChange={(e) => (setProjectId(e.target.value), setRoleId(""))}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.candidate}: {p.title} ({p.hackathon})
              </option>
            ))}
          </Select>
        )}
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="type-label pb-2">who runs it (required)</legend>
        <RadioGroup value={model} onValueChange={(v) => setModel(v as Model)} className="flex flex-col gap-2" aria-label="who runs it">
          {(Object.keys(MODEL_LABELS) as Model[]).map((m) => (
            <label key={m} className="flex min-h-11 items-center gap-3 type-body">
              <Radio value={m} />
              {MODEL_LABELS[m]}
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <Field label="role" required={model !== "WE_RUN"} hint="roles enrolled in this cohort. company interviewers come from the role's company.">
        {({ id, describedBy }) => (
          <Select id={id} aria-describedby={describedBy} value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            <option value="">no role</option>
            {project?.roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} at {r.company}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="type-label pb-2">mode (required)</legend>
        <RadioGroup value={mode} onValueChange={(v) => setMode(v as Mode)} className="flex flex-col gap-2" aria-label="mode">
          {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
            <label key={m} className="flex min-h-11 items-center gap-3 type-body">
              <Radio value={m} />
              {MODE_LABELS[m]}
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      {mode === "IN_PERSON" ? (
        <Field label="location" required hint="the address and room. the candidate gets it by email.">
          {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} value={location} onChange={(e) => setLocation(e.target.value)} />}
        </Field>
      ) : (
        <Field label="video link" required hint="paste the meeting link from your own video tool.">
          {({ id, describedBy }) => <Input id={id} type="url" inputMode="url" aria-describedby={describedBy} value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />}
        </Field>
      )}

      <div className="flex flex-col gap-4 tablet:flex-row">
        <Field label="date and time" required className="flex-1">
          {({ id, describedBy }) => <Input id={id} type="datetime-local" aria-describedby={describedBy} value={localTime} onChange={(e) => setLocalTime(e.target.value)} />}
        </Field>
        <Field label="duration in minutes" required className="tablet:w-40">
          {({ id, describedBy }) => <Input id={id} type="number" min={15} max={240} step={15} aria-describedby={describedBy} value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />}
        </Field>
      </div>

      <Field label="timezone" required hint="the IANA zone the date and time are in.">
        {({ id, describedBy }) => (
          <Select id={id} aria-describedby={describedBy} value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="type-label pb-2">interviewers (required)</legend>
        {eligible.length === 0 ? (
          <p className="type-body-s text-secondary">{model === "WE_RUN" ? "no reviewers exist yet." : "choose a role to list its company's members."}</p>
        ) : (
          eligible.map((e) => (
            <label key={e.id} className="flex min-h-11 items-center gap-3 type-body">
              <Checkbox checked={chosen.includes(e.id)} onCheckedChange={(v) => toggle(e.id, v === true)} />
              {e.name} <span className="text-secondary">{e.side}</span>
            </label>
          ))
        )}
      </fieldset>

      {error ? (
        <p role="alert" className="type-body-s text-error">
          {error}
        </p>
      ) : null}
      <div>
        <Button variant="primary" onClick={schedule} loading={pending} loadingLabel="scheduling interview">
          schedule interview
        </Button>
      </div>
    </div>
  );
}
