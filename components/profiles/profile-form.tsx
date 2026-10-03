"use client";

import { startTransition, useActionState, useEffect } from "react";
import { EXPERIENCE_LEVELS } from "@/lib/db/enums";
import { EXPERIENCE_LABEL } from "@/lib/profiles";
import { saveProfile } from "@/lib/profiles/actions";
import { Button, Field, Input, Select, Textarea, useToast } from "@/components/ui";

export type ProfileFormValues = {
  name: string;
  username: string;
  headline: string;
  bio: string;
  skills: string;
  links: string;
  location: string;
  school: string;
  experienceLevel: string;
};

/** Builders get the full profile; everyone else gets their name only (builder = false). */
export function ProfileForm({ values, builder }: { values: ProfileFormValues; builder: boolean }) {
  const [state, action, pending] = useActionState(saveProfile, null);
  const toast = useToast();
  useEffect(() => {
    if (state?.ok) toast(builder ? "profile saved" : "name saved");
  }, [state, toast, builder]);
  const error = state && !state.ok ? state.error : undefined;

  return (
    // onSubmit keeps typed values on an error; a form `action` would reset the fields.
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="flex flex-col gap-6 measure" aria-describedby={error ? "profile-error" : undefined}>
      <Field label="name" required>
        {(p) => <Input id={p.id} name="name" defaultValue={values.name} required maxLength={80} autoComplete="name" aria-describedby={p.describedBy} />}
      </Field>
      {builder ? (
        <>
          <Field label="username" required hint="your profile lives at /u/ plus this. lowercase letters, digits and dashes.">
            {(p) => <Input id={p.id} name="username" defaultValue={values.username} required minLength={3} maxLength={30} pattern="[a-z0-9][a-z0-9\-]{1,28}[a-z0-9]" autoComplete="username" aria-describedby={p.describedBy} />}
          </Field>
          <Field label="headline" hint="one line about what you make.">
            {(p) => <Input id={p.id} name="headline" defaultValue={values.headline} maxLength={120} aria-describedby={p.describedBy} />}
          </Field>
          <Field label="bio" hint="Markdown works here.">
            {(p) => <Textarea id={p.id} name="bio" defaultValue={values.bio} rows={6} maxLength={4000} aria-describedby={p.describedBy} />}
          </Field>
          <Field label="skills" hint="separate skills with commas, for example: TypeScript, Postgres, product writing.">
            {(p) => <Input id={p.id} name="skills" defaultValue={values.skills} maxLength={1000} aria-describedby={p.describedBy} />}
          </Field>
          <Field label="links" hint="one per line: a label, then the address. for example: portfolio https://example.com">
            {(p) => <Textarea id={p.id} name="links" defaultValue={values.links} rows={4} maxLength={2000} aria-describedby={p.describedBy} />}
          </Field>
          <div className="grid gap-6 tablet:grid-cols-2">
            <Field label="location">
              {(p) => <Input id={p.id} name="location" defaultValue={values.location} maxLength={80} autoComplete="address-level2" />}
            </Field>
            <Field label="school">
              {(p) => <Input id={p.id} name="school" defaultValue={values.school} maxLength={80} />}
            </Field>
          </div>
          <Field label="experience">
            {(p) => (
              <Select id={p.id} name="experienceLevel" defaultValue={values.experienceLevel}>
                <option value="">prefer not to say</option>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>{EXPERIENCE_LABEL[level]}</option>
                ))}
              </Select>
            )}
          </Field>
        </>
      ) : null}
      {error ? <p id="profile-error" role="alert" className="type-body-s text-error">{error}</p> : null}
      <div>
        <Button type="submit" variant="primary" loading={pending} loadingLabel="saving">{builder ? "save profile" : "save name"}</Button>
      </div>
    </form>
  );
}
