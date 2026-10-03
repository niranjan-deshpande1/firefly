"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Field, Input, Radio, RadioGroup, useToast } from "@/components/ui";
import { rescheduleInterview } from "@/lib/interviews/manage";
import { MODE_LABELS } from "@/lib/interviews/script";

type Mode = keyof typeof MODE_LABELS;

type RescheduleFormProps = {
  interviewId: string;
  timeZone: string;
  initial: { localTime: string; durationMin: number; mode: Mode; location: string; videoLink: string };
};

/** New time, length and place. The IANA zone stays the one chosen at scheduling. */
export function RescheduleForm({ interviewId, timeZone, initial }: RescheduleFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [localTime, setLocalTime] = useState(initial.localTime);
  const [durationMin, setDurationMin] = useState(String(initial.durationMin));
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [location, setLocation] = useState(initial.location);
  const [videoLink, setVideoLink] = useState(initial.videoLink);

  const save = () =>
    startTransition(async () => {
      const result = await rescheduleInterview({
        interviewId,
        localTime,
        durationMin,
        mode,
        location: mode === "IN_PERSON" ? location : undefined,
        videoLink: mode === "VIDEO" ? videoLink : undefined,
      });
      if (!result.ok) return setError(result.error);
      setError(undefined);
      toast("interview rescheduled, emails logged");
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-8 measure">
      <div className="flex flex-col gap-4 tablet:flex-row">
        <Field label="date and time" required hint={`in ${timeZone}, the zone chosen at scheduling.`} className="flex-1">
          {({ id, describedBy }) => <Input id={id} type="datetime-local" aria-describedby={describedBy} value={localTime} onChange={(e) => setLocalTime(e.target.value)} />}
        </Field>
        <Field label="duration in minutes" required className="tablet:w-40">
          {({ id, describedBy }) => (
            <Input id={id} type="number" min={15} max={240} step={15} aria-describedby={describedBy} value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
          )}
        </Field>
      </div>

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
        <Field label="location" required hint="the address and room.">
          {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} value={location} onChange={(e) => setLocation(e.target.value)} />}
        </Field>
      ) : (
        <Field label="video link" required hint="paste the meeting link from your own video tool.">
          {({ id, describedBy }) => <Input id={id} type="url" inputMode="url" aria-describedby={describedBy} value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />}
        </Field>
      )}

      {error ? (
        <p role="alert" className="type-body-s text-error">
          {error}
        </p>
      ) : null}
      <div>
        <Button variant="primary" onClick={save} loading={pending} loadingLabel="saving the new time">
          save the new time
        </Button>
      </div>
    </div>
  );
}
