"use client";
/**
 * ProgressTracker — horizontal lifecycle / pipeline stepper.
 *
 * PROMOTED PRIMITIVE (rule-of-2): the order lifecycle (BrickShop) and the deal
 * pipeline (hk-crm) are the same molecule — an ordered set of stages with one
 * "current" marker and completed/pending states. Hand-rolling it per app is the
 * drift this absorbs. Lives in `src/components/layout/` next to StatTileRow.
 *
 * Visual contract (token-pure — no color literals):
 *   ●━━━━●━━━━◉────○        dot + connector per stage
 *   done  done cur  pend
 *   - done    : filled `bg-primary` dot, `bg-primary` connector
 *   - current : `bg-primary` dot ring (hollow center), `border` connector ahead
 *   - pending : `bg-background` dot w/ `border-input`, `border` connector
 *   label: `text-sm font-medium` (pending → `text-muted-foreground`)
 *   meta : `text-xs text-muted-foreground`
 *
 * Reads brand color automatically via `--primary`, so it re-skins with the rest
 * of the fleet (teal for hk-crm, blue for BrickShop) with zero per-app code.
 */
import * as React from "react";
import { cn } from "../../lib/utils";

export type ProgressStep = {
  label: React.ReactNode;
  /** Short date/detail line, e.g. "12 Jun" or "Pending". */
  meta?: React.ReactNode;
  state: "done" | "current" | "pending";
};

export type ProgressTrackerProps = {
  steps: ProgressStep[];
  className?: string;
};

export function ProgressTracker({
  steps,
  className,
}: ProgressTrackerProps): React.ReactElement {
  return (
    <ol
      className={cn("grid", className)}
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))` }}
    >
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const done = s.state === "done";
        const current = s.state === "current";
        const stateWord = done ? "completed" : current ? "current" : "upcoming";
        return (
          <li
            key={i}
            className="min-w-0"
            aria-current={current ? "step" : undefined}
          >
            <div className="flex items-center">
              <span
                className={cn(
                  "h-3 w-3 shrink-0 rounded-full border-2",
                  done && "border-primary bg-primary",
                  current && "border-primary bg-primary/25",
                  s.state === "pending" && "border-input bg-background",
                )}
              />
              {!last && (
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    done ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className="pr-4 pt-2.5">
              <div
                className={cn(
                  "text-sm font-medium leading-tight",
                  s.state === "pending" && "text-muted-foreground",
                )}
              >
                {s.label} <span className="sr-only">({stateWord})</span>
              </div>
              {s.meta && (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {s.meta}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

ProgressTracker.displayName = "ProgressTracker";
