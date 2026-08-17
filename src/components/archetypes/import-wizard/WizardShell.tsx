import * as React from "react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/layout/SectionCard";
import {
  SurfaceHeaderSlot,
  type SurfaceHeaderSlotProps,
} from "@/components/layout/SurfaceHeaderSlot";
import { cn } from "@/lib/utils";
import { WizardStepper, type WizardStep } from "./WizardStepper";

export type WizardShellProps = {
  /** Ordered steps (e.g. Upload → Map → Verify → Commit). */
  steps: WizardStep[];
  /** Index of the active step (consumer-owned state). */
  current: number;
  /** Back to the previous step. Hidden on the first step. */
  onBack?: () => void;
  /** Advance to the next step. Used on every step except the last. */
  onNext?: () => void;
  /** Finish — the terminal action on the last step (the actual import/commit). */
  onCommit?: () => void;
  /** Disable the forward action (Next/Commit) until the current step is valid. */
  canProceed?: boolean;
  /** Show a spinner + disable the footer while the commit is in flight. */
  busy?: boolean;
  nextLabel?: string;
  commitLabel?: string;
  /** The current step's body. */
  children: React.ReactNode;

  className?: string;
} & Omit<SurfaceHeaderSlotProps, "headerActions">;

/**
 * WizardShell — the import-wizard (W) archetype shell: a step indicator, the
 * current step's body in a bounded `<SectionCard>`, and a Back / Next·Commit
 * footer. The flow is **consumer-driven** — the consumer owns `current` and the
 * per-step state; the shell renders chrome and emits navigation intents. The
 * terminal step swaps Next for a single Commit action (idempotent — see spec).
 *
 * When `title` is set, the shell adopts the Plex Ledger board form: an on-surface
 * `<SurfaceHeader>` at the top of one bounded card, with the stepper + step body
 * + footer below. The wizard's navigation actions always stay in the footer.
 */
export function WizardShell({
  steps,
  current,
  onBack,
  onNext,
  onCommit,
  canProceed = true,
  busy = false,
  nextLabel = "Next",
  commitLabel = "Commit import",
  children,
  kicker,
  title,
  className,
}: WizardShellProps): React.ReactElement {
  const isLast = current >= steps.length - 1;
  const isFirst = current <= 0;
  const stepLabel = steps[current]?.label;

  const body = (
    <div className="space-y-5">
      <WizardStepper steps={steps} current={current} />

      <SectionCard title={stepLabel}>{children}</SectionCard>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isFirst || busy}
        >
          Back
        </Button>
        {isLast ? (
          <Button onClick={onCommit} disabled={!canProceed || busy}>
            {busy ? "Importing…" : commitLabel}
          </Button>
        ) : (
          <Button onClick={onNext} disabled={!canProceed || busy}>
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );

  if (title !== undefined) {
    return (
      <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
        <SurfaceHeaderSlot
          kicker={kicker}
          title={title}
        />
        <div className="p-5">{body}</div>
      </div>
    );
  }

  return <div className={cn("space-y-5", className)}>{body}</div>;
}

WizardShell.displayName = "WizardShell";
