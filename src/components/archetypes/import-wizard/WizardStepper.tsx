"use client";
import { useLabels } from "../../../lib/labels";
import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../../lib/utils";

export type WizardStep = { key: string; label: string };

export type WizardStepperProps = {
  steps: WizardStep[];
  /** Index of the active step. Steps before it render as done, after it as upcoming. */
  current: number;
  /** Screen-reader state words after each step label. Default completed / current / upcoming. */
  stateLabels?: { completed?: string; current?: string; upcoming?: string };
  className?: string;
};

/**
 * WizardStepper — the horizontal step indicator for the import-wizard (W)
 * archetype. Done steps show a check, the active step is filled + ringed,
 * upcoming steps are muted. Read-only — navigation is driven by the shell's
 * Back/Next footer, not by clicking steps.
 */
export function WizardStepper({
  steps,
  current,
  stateLabels,
  className,
}: WizardStepperProps): React.ReactElement {
  const L = useLabels();
  return (
    <ol className={cn("flex items-center gap-2", className)}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const stateWord = done
          ? (stateLabels?.completed ?? L.completed)
          : active
            ? (stateLabels?.current ?? L.current)
            : (stateLabels?.upcoming ?? L.upcoming);
        return (
          <li
            key={step.key}
            className="flex flex-1 items-center gap-2 last:flex-none"
            aria-current={active ? "step" : undefined}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-primary ring-2 ring-ring",
                  !done && !active && "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-sm",
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label} <span className="sr-only">({stateWord})</span>
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1",
                  done ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

WizardStepper.displayName = "WizardStepper";
