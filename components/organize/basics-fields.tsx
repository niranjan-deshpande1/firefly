"use client";

import { useState } from "react";
import { Field, Input } from "@/components/ui";
import { DEFAULT_TIME_ZONE } from "@/lib/format/date";
import { slugify } from "@/lib/organize/schemas";
import { zoneOptions } from "@/lib/organize/time";
import { SelectField, TextField, useFieldError } from "./form";

type Props = {
  defaults?: { title: string; slug: string; type: string; tagline: string; description: string; timeZone: string };
};

/** Title, slug (suggested from the title until edited), type, time zone, tagline and description. */
export function BasicsFields({ defaults }: Props) {
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults));
  const titleError = useFieldError("title");
  const slugError = useFieldError("slug");

  return (
    <>
      <Field label="title" error={titleError} required>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
        )}
      </Field>
      <Field label="slug" hint={`the address: /hackathons/${slug || "your-slug"}`} error={slugError} required>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
        )}
      </Field>
      <SelectField
        name="type"
        label="type"
        hint="hiring cohorts are solo, two weeks, with weekly check-ins and a defense interview."
        required
        defaultValue={defaults?.type ?? "OPEN"}
        options={[
          { value: "OPEN", label: "open hackathon" },
          { value: "HIRING_COHORT", label: "hiring cohort" },
        ]}
      />
      <SelectField
        name="timeZone"
        label="time zone"
        hint="every date and time for this hackathon is entered and shown in this zone."
        required
        defaultValue={defaults?.timeZone ?? DEFAULT_TIME_ZONE}
        options={zoneOptions(defaults?.timeZone).map((z) => ({ value: z, label: z }))}
      />
      <TextField name="tagline" label="tagline" hint="one line shown on the hackathon card." required defaultValue={defaults?.tagline} />
      <TextField name="description" label="description" hint="Markdown." rows={8} defaultValue={defaults?.description} />
    </>
  );
}
