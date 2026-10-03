"use client";

import * as RadioPrimitive from "@radix-ui/react-radio-group";
import { cn } from "./cn";

type ScoreInputProps = {
  name: string;
  label: string;
  /** Anchor text per level, lowest first. */
  anchors: string[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

/** Reviewer-only rubric level picker. Each level shows its anchor text so the number is never alone. */
export function ScoreInput({ name, label, anchors, value, onValueChange, disabled }: ScoreInputProps) {
  return (
    <RadioPrimitive.Root name={name} aria-label={label} value={value} onValueChange={onValueChange} disabled={disabled} className="flex flex-col gap-2">
      {anchors.map((anchor, i) => {
        const level = String(i + 1);
        return (
          <RadioPrimitive.Item
            key={level}
            value={level}
            className={cn(
              "flex min-h-11 items-start gap-3 rounded-control border border-control bg-raised px-3 py-2 text-start transition-state",
              "hover:bg-raised-2 data-[state=checked]:border-focus disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <span className="type-button pt-1">{level}</span>
            <span className="type-body-s">{anchor}</span>
            <RadioPrimitive.Indicator className="ms-auto type-label text-accent">selected</RadioPrimitive.Indicator>
          </RadioPrimitive.Item>
        );
      })}
    </RadioPrimitive.Root>
  );
}
