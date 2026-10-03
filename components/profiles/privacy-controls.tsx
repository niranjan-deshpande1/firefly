"use client";

import { useState, useTransition } from "react";
import { Radio, RadioGroup, Toggle, useToast } from "@/components/ui";
import { setTalentPoolOptIn, setVisibility } from "@/lib/profiles/actions";

type Visibility = "PUBLIC" | "PRIVATE";

const VISIBILITY_OPTIONS: { value: Visibility; label: string; hint: string }[] = [
  { value: "PUBLIC", label: "public", hint: "anyone with the link sees your profile, posted projects, hackathons and wins." },
  { value: "PRIVATE", label: "hidden", hint: "only you and firefly admins see your profile page. reviewers and shortlisting companies still see what the consent screen describes." },
];

/** Both controls save as soon as they change; a failed save puts the old value back and says why. */
export function PrivacyControls({ visibility, talentPoolOptIn }: { visibility: Visibility; talentPoolOptIn: boolean }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [vis, setVis] = useState<Visibility>(visibility);
  const [pool, setPool] = useState(talentPoolOptIn);
  const [error, setError] = useState<{ field: "visibility" | "pool"; message: string } | null>(null);

  function changeVisibility(value: string) {
    const previous = vis;
    setVis(value as Visibility);
    startTransition(async () => {
      const result = await setVisibility(value);
      if (result.ok) {
        setError(null);
        toast(value === "PUBLIC" ? "profile is public" : "profile is hidden");
      } else {
        setVis(previous);
        setError({ field: "visibility", message: result.error });
      }
    });
  }

  function changePool(value: boolean) {
    setPool(value);
    startTransition(async () => {
      const result = await setTalentPoolOptIn(value);
      if (result.ok) {
        setError(null);
        toast(value ? "you're in the talent pool" : "you left the talent pool");
      } else {
        setPool(!value);
        setError({ field: "pool", message: result.error });
      }
    });
  }

  return (
    <div className="flex flex-col gap-12">
      <fieldset className="flex flex-col gap-4" aria-describedby={error?.field === "visibility" ? "visibility-error" : undefined}>
        <legend className="type-display-4 pb-4">profile visibility</legend>
        <RadioGroup value={vis} onValueChange={changeVisibility} disabled={pending} className="flex flex-col gap-4">
          {VISIBILITY_OPTIONS.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-start gap-4">
              <Radio value={option.value} aria-describedby={`visibility-${option.value}`} />
              <span className="flex flex-col gap-1">
                <span className="type-label">{option.label}</span>
                <span id={`visibility-${option.value}`} className="type-body-s text-secondary measure">{option.hint}</span>
              </span>
            </label>
          ))}
        </RadioGroup>
        {error?.field === "visibility" ? <p id="visibility-error" className="type-body-s text-error">{error.message}</p> : null}
      </fieldset>

      <section id="talent-pool" aria-labelledby="talent-pool-title" className="flex scroll-mt-8 flex-col gap-4">
        <h3 id="talent-pool-title" className="type-display-4">talent pool</h3>
        <div className="flex items-start gap-4">
          <Toggle
            id="talent-pool-toggle"
            checked={pool}
            onCheckedChange={changePool}
            disabled={pending}
            aria-describedby={error?.field === "pool" ? "talent-pool-hint talent-pool-error" : "talent-pool-hint"}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="talent-pool-toggle" className="type-label cursor-pointer">let companies hiring through firefly find me</label>
            <p id="talent-pool-hint" className="type-body-s text-secondary measure">
              companies enrolled in a hiring cohort can browse builders who opt in, see their profile and posted projects, and ask for an interview. this is off until you turn it on, and you can turn it off any time.
            </p>
          </div>
        </div>
        {error?.field === "pool" ? <p id="talent-pool-error" className="type-body-s text-error">{error.message}</p> : null}
      </section>
    </div>
  );
}
