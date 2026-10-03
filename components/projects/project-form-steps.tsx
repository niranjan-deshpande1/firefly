"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button, Checkbox, Chip, Field, Input, Markdown, Tab, TabList, TabPanel, Tabs, Textarea, TextLink, useToast } from "@/components/ui";
import { moveProjectImage, removeProjectImage } from "@/lib/projects/actions";
import { LIMITS, parseBuiltWith } from "@/lib/projects/schema";
import { LIMITS as FILE_LIMITS } from "@/lib/storage/validate";
import type { LinkItem } from "@/lib/db/json";

export type FormState = {
  title: string;
  tagline: string;
  story: string;
  builtWith: string; // comma separated while editing
  links: LinkItem[];
  repoUrl: string;
  videoUrl: string;
  teamId: string | null;
};

export type StepProps = {
  form: FormState;
  update: (patch: Partial<FormState>) => void;
  fieldErrors: Record<string, string>;
  hackathon: { id: string; slug: string; title: string };
  projectId: string | null;
  images: { id: string; url: string; alt: string }[];
  team: { id: string; name: string; members: string[] } | null;
  ensureProject: () => Promise<string | null>;
  problems: string[];
  goTo: (step: "basics" | "story" | "built-with" | "media" | "links" | "team" | "review") => void;
};

export function BasicsStep({ form, update, fieldErrors }: StepProps) {
  return (
    <>
      <Field label="title" required error={fieldErrors.title}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={form.title} maxLength={LIMITS.title} required onChange={(e) => update({ title: e.target.value })} />
        )}
      </Field>
      <Field label="tagline" hint="one line on what it does. needed to post." error={fieldErrors.tagline}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={form.tagline} maxLength={LIMITS.tagline} onChange={(e) => update({ tagline: e.target.value })} />
        )}
      </Field>
    </>
  );
}

export function StoryStep({ form, update, fieldErrors }: StepProps) {
  return (
    <Tabs defaultValue="write" className="flex flex-col gap-4">
      <TabList aria-label="story editor">
        <Tab value="write">write</Tab>
        <Tab value="preview">preview</Tab>
      </TabList>
      <TabPanel value="write">
        <Field label="story" hint="Markdown. what you made, how you made it, what you would change. needed to post." error={fieldErrors.story}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} rows={14} value={form.story} maxLength={LIMITS.story} onChange={(e) => update({ story: e.target.value })} />
          )}
        </Field>
      </TabPanel>
      <TabPanel value="preview">
        {form.story.trim() ? <Markdown>{form.story}</Markdown> : <p className="type-body text-secondary">nothing to preview yet. write the story first.</p>}
      </TabPanel>
    </Tabs>
  );
}

export function BuiltWithStep({ form, update, fieldErrors }: StepProps) {
  const tags = parseBuiltWith(form.builtWith);
  return (
    <>
      <Field label="built with" hint={`separate tools with commas, up to ${LIMITS.tags}.`} error={fieldErrors.builtWith ?? Object.entries(fieldErrors).find(([k]) => k.startsWith("builtWith"))?.[1]}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={form.builtWith} placeholder="Next.js, Postgres, Claude" onChange={(e) => update({ builtWith: e.target.value })} />
        )}
      </Field>
      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="tags">
          {tags.map((t) => (
            <li key={t}>
              <Chip>{t}</Chip>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export function MediaStep({ form, update, fieldErrors, projectId, images: initialImages, ensureProject }: StepProps) {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, start] = useTransition();

  function upload() {
    const file = fileRef.current?.files?.[0];
    setError(undefined);
    if (!file) return setError("choose an image file first, then upload it.");
    if (file.size > FILE_LIMITS.IMAGE) return setError("that image is over 5 MB, choose a smaller one.");
    if (!alt.trim()) return setError("describe the image so screen reader users get it too.");
    start(async () => {
      const wasNew = !projectId;
      const id = await ensureProject();
      if (!id) return setError("the draft did not save, fix the error below and try again.");
      const body = new FormData();
      body.set("file", file);
      body.set("alt", alt);
      const res = await fetch(`/projects/${id}/edit/images`, { method: "POST", body }).catch(() => null);
      const json = (await res?.json().catch(() => null)) as { ok: boolean; error?: string; image?: { id: string; url: string; alt: string } } | null;
      if (!json?.ok || !json.image) return setError(json?.error ?? "the upload stopped before it finished, retry the image.");
      setImages((prev) => [...prev, json.image!]);
      setAlt("");
      if (fileRef.current) fileRef.current.value = "";
      toast("image uploaded");
      if (wasNew) router.replace(`/projects/${id}/edit?step=3`, { scroll: false });
      else router.refresh();
    });
  }

  function remove(imageId: string) {
    start(async () => {
      const res = await removeProjectImage({ id: imageId });
      if (!res.ok) return setError(res.error);
      setImages((prev) => prev.filter((i) => i.id !== imageId));
      toast("image removed");
      router.refresh();
    });
  }

  function move(imageId: string, direction: "up" | "down") {
    setError(undefined);
    start(async () => {
      const res = await moveProjectImage({ id: imageId, direction });
      if (!res.ok) return setError(res.error);
      const order = res.data?.ids ?? [];
      setImages((prev) => order.map((id) => prev.find((i) => i.id === id)).filter((i) => i !== undefined));
      toast(direction === "up" ? "image moved up" : "image moved down");
      router.refresh();
    });
  }

  return (
    <>
      {images.length > 0 ? (
        <ol className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          {images.map((img, i) => (
            <li key={img.id} className="flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt} className="h-auto w-full" />
              <p className="type-body-s text-secondary">{i === 0 ? "image 1, the cover" : `image ${i + 1}`}</p>
              <div className="flex flex-wrap gap-2">
                {i > 0 ? (
                  <Button variant="ghost" onClick={() => move(img.id, "up")} disabled={pending} aria-label={`move image ${i + 1} up`}>
                    move up
                  </Button>
                ) : null}
                {i < images.length - 1 ? (
                  <Button variant="ghost" onClick={() => move(img.id, "down")} disabled={pending} aria-label={`move image ${i + 1} down`}>
                    move down
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={() => remove(img.id)} disabled={pending} aria-label={`remove image: ${img.alt}`}>
                  remove image
                </Button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="type-body text-secondary">no images yet. the first image leads your project page and gallery card.</p>
      )}
      <fieldset className="flex flex-col gap-4">
        <legend className="type-label text-secondary">add an image</legend>
        <Field label="image file" hint="PNG, JPEG, GIF or WebP, up to 5 MB." error={error}>
          {({ id, describedBy, invalid }) => (
            <input className="control" id={id} ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" aria-describedby={describedBy} aria-invalid={invalid} />
          )}
        </Field>
        <Field label="image description" hint="what the image shows, for people who can't see it.">
          {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} value={alt} maxLength={LIMITS.alt} onChange={(e) => setAlt(e.target.value)} />}
        </Field>
        <div>
          <Button variant="secondary" onClick={upload} loading={pending} loadingLabel="uploading image">
            upload image
          </Button>
        </div>
      </fieldset>
      <Field label="demo video link" hint="a YouTube, Vimeo or Loom link starting with https://." error={fieldErrors.videoUrl}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="url" inputMode="url" aria-describedby={describedBy} aria-invalid={invalid} value={form.videoUrl} onChange={(e) => update({ videoUrl: e.target.value })} />
        )}
      </Field>
    </>
  );
}

export function LinksStep({ form, update, fieldErrors }: StepProps) {
  const setLink = (i: number, patch: Partial<LinkItem>) => update({ links: form.links.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  return (
    <>
      <Field label="repository link" hint="the public repo, starting with https://." error={fieldErrors.repoUrl}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="url" inputMode="url" aria-describedby={describedBy} aria-invalid={invalid} value={form.repoUrl} onChange={(e) => update({ repoUrl: e.target.value })} />
        )}
      </Field>
      <fieldset className="flex flex-col gap-4">
        <legend className="type-label text-secondary">other links, such as a live demo or a write-up</legend>
        {form.links.map((link, i) => (
          <div key={i} className="flex flex-col gap-3 border-b border-line pb-4">
            <Field label={`link ${i + 1} label`} error={fieldErrors[`links.${i}.label`]}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={link.label} maxLength={LIMITS.linkLabel} onChange={(e) => setLink(i, { label: e.target.value })} />
              )}
            </Field>
            <Field label={`link ${i + 1} address`} error={fieldErrors[`links.${i}.url`]}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="url" inputMode="url" aria-describedby={describedBy} aria-invalid={invalid} value={link.url} onChange={(e) => setLink(i, { url: e.target.value })} />
              )}
            </Field>
            <div>
              <Button variant="ghost" onClick={() => update({ links: form.links.filter((_, j) => j !== i) })}>
                remove link {i + 1}
              </Button>
            </div>
          </div>
        ))}
        {form.links.length < LIMITS.links ? (
          <div>
            <Button variant="secondary" onClick={() => update({ links: [...form.links, { label: "", url: "" }] })}>
              add link
            </Button>
          </div>
        ) : null}
      </fieldset>
    </>
  );
}

export function TeamStep({ form, update, team, hackathon, fieldErrors }: StepProps) {
  if (!team) {
    return (
      <p className="type-body measure">
        you are posting solo. to post with others, form a team first on <TextLink href={`/hackathons/${hackathon.slug}/teams`}>the teams page</TextLink>.
      </p>
    );
  }
  const checked = form.teamId === team.id;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Checkbox id="post-as-team" checked={checked} onCheckedChange={(v) => update({ teamId: v === true ? team.id : null })} aria-describedby="team-members" />
        <label htmlFor="post-as-team" className="type-body">
          post as team {team.name}
        </label>
      </div>
      <p id="team-members" className="type-body-s text-secondary">
        members: {team.members.join(", ")}. every member can edit the project.
      </p>
      {fieldErrors.teamId ? <p className="type-body-s text-error">{fieldErrors.teamId}</p> : null}
    </div>
  );
}

export function ReviewStep({ form, images, problems, goTo, team }: StepProps) {
  const tags = parseBuiltWith(form.builtWith);
  const rows: { label: string; value: string; step: Parameters<StepProps["goTo"]>[0] }[] = [
    { label: "title", value: form.title || "not set", step: "basics" },
    { label: "tagline", value: form.tagline || "not set", step: "basics" },
    { label: "built with", value: tags.join(", ") || "none", step: "built-with" },
    { label: "images", value: String(images.length), step: "media" },
    { label: "demo video", value: form.videoUrl || "none", step: "media" },
    { label: "repository", value: form.repoUrl || "none", step: "links" },
    { label: "other links", value: String(form.links.filter((l) => l.url).length), step: "links" },
    { label: "team", value: form.teamId && team ? team.name : "solo", step: "team" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <dl className="flex flex-col">
        {rows.map((r) => (
          <div key={r.label} className="row flex flex-wrap items-center justify-between gap-2 py-2">
            <dt className="type-label text-secondary">{r.label}</dt>
            <dd className="flex items-center gap-3 type-body-s break-all">
              <span>{r.value}</span>
              <button type="button" className="link target type-label" onClick={() => goTo(r.step)}>
                edit {r.label}
              </button>
            </dd>
          </div>
        ))}
      </dl>
      <section aria-labelledby="preview-story" className="flex flex-col gap-3">
        <h3 id="preview-story" className="type-display-4">
          story preview
        </h3>
        {form.story.trim() ? <Markdown>{form.story}</Markdown> : <p className="type-body text-secondary">the story is empty.</p>}
      </section>
      {problems.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="type-label text-warning">before posting</p>
          <ul className="flex flex-col gap-1">
            {problems.map((p) => (
              <li key={p} className="type-body-s">
                {p}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="type-body-s text-secondary">ready to post. you can keep editing until the deadline.</p>
      )}
    </div>
  );
}
