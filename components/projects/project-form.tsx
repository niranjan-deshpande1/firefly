"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, useToast } from "@/components/ui";
import { saveProject } from "@/lib/projects/actions";
import { parseBuiltWith, postingProblems } from "@/lib/projects/schema";
import { BasicsStep, BuiltWithStep, LinksStep, MediaStep, ReviewStep, StoryStep, TeamStep, type FormState, type StepProps } from "./project-form-steps";

export const STEPS = ["basics", "story", "built-with", "media", "links", "team", "review"] as const;
export type StepName = (typeof STEPS)[number];

export type ProjectFormProps = {
  hackathon: { id: string; slug: string; title: string };
  projectId: string | null;
  status: string;
  initial: FormState;
  images: { id: string; url: string; alt: string }[];
  team: { id: string; name: string; members: string[] } | null;
  initialStep: number;
};

/** Which step owns each field, so a server error opens the step where its control lives. */
const FIELD_STEP: Record<string, StepName> = {
  title: "basics",
  tagline: "basics",
  story: "story",
  builtWith: "built-with",
  videoUrl: "media",
  repoUrl: "links",
  links: "links",
  teamId: "team",
};

const STEP_VIEWS: Record<StepName, React.ComponentType<StepProps>> = {
  basics: BasicsStep,
  story: StoryStep,
  "built-with": BuiltWithStep,
  media: MediaStep,
  links: LinksStep,
  team: TeamStep,
  review: ReviewStep,
};

/** Multi-step posting flow (passage). Every step can save a draft; the last step posts the project. */
export function ProjectForm(props: ProjectFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(props.initial);
  const [step, setStep] = useState(Math.min(Math.max(props.initialStep, 0), STEPS.length - 1));
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const [intentInFlight, setIntent] = useState<"draft" | "post" | null>(null);
  const posted = props.status === "SUBMITTED";
  const name = STEPS[step];

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  /** Saves and returns the project id, or null when saving failed. */
  async function save(intent: "draft" | "post"): Promise<string | null> {
    setError(null);
    setFieldErrors({});
    const res = await saveProject({
      projectId: props.projectId,
      hackathonId: props.hackathon.id,
      title: form.title,
      tagline: form.tagline,
      story: form.story,
      builtWith: parseBuiltWith(form.builtWith),
      links: form.links.filter((l) => l.label.trim() || l.url.trim()),
      repoUrl: form.repoUrl,
      videoUrl: form.videoUrl,
      teamId: form.teamId,
      intent,
    });
    if (!res.ok) {
      setError(res.error);
      setFieldErrors(res.fieldErrors ?? {});
      const owner = FIELD_STEP[Object.keys(res.fieldErrors ?? {})[0]?.split(".")[0] ?? ""];
      if (owner) setStep(STEPS.indexOf(owner));
      return null;
    }
    return res.data!.projectId;
  }

  function run(intent: "draft" | "post") {
    setIntent(intent);
    start(async () => {
      const id = await save(intent);
      setIntent(null);
      if (!id) return;
      if (intent === "post" && !posted) {
        toast("project posted");
        router.push(`/projects/${id}`);
        return;
      }
      toast(posted ? "changes saved" : "draft saved");
      if (!props.projectId) router.replace(`/projects/${id}/edit?step=${step}`, { scroll: false });
      else router.refresh();
    });
  }

  /** Media uploads need a project row; the first upload saves a draft. */
  async function ensureProject(): Promise<string | null> {
    if (props.projectId) return props.projectId;
    return save("draft");
  }

  const stepProps: StepProps = {
    form,
    update,
    fieldErrors,
    hackathon: props.hackathon,
    projectId: props.projectId,
    images: props.images,
    team: props.team,
    ensureProject,
    problems: postingProblems(form),
    goTo: (s: StepName) => setStep(STEPS.indexOf(s)),
  };

  const isLast = step === STEPS.length - 1;
  const StepView = STEP_VIEWS[name];

  return (
    <div className="flex flex-col gap-8">
      <nav aria-label="steps">
        <ol className="flex flex-wrap gap-x-4 gap-y-2">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={i === step ? "step" : undefined}
                className="target link type-label aria-[current=step]:text-primary aria-[current=step]:no-underline"
              >
                {i + 1} {s}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <form
        className="flex flex-col gap-6 measure"
        onSubmit={(e) => {
          e.preventDefault();
          if (isLast) run("post");
          else setStep(step + 1);
        }}
        aria-labelledby="step-heading"
      >
        <div className="flex flex-col gap-2">
          <p className="type-eyebrow text-secondary">
            step {step + 1} of {STEPS.length}
          </p>
          <h2 id="step-heading" className="type-display-3">
            {name}
          </h2>
        </div>

        <StepView key={name} {...stepProps} />

        {error ? (
          <p role="alert" className="type-body-s text-error">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" loading={pending && intentInFlight === "post"} loadingLabel="posting project" disabled={pending && intentInFlight !== "post"}>
            {isLast ? (posted ? "save changes" : "post project") : `continue to ${STEPS[step + 1]}`}
          </Button>
          {!(isLast && posted) ? (
            <Button
              variant="secondary"
              onClick={() => run("draft")}
              loading={pending && intentInFlight === "draft"}
              loadingLabel={posted ? "saving changes" : "saving draft"}
              disabled={pending && intentInFlight !== "draft"}
            >
              {posted ? "save changes" : "save draft"}
            </Button>
          ) : null}
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              back to {STEPS[step - 1]}
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
