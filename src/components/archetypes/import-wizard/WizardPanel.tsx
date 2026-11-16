"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { WizardStepper, type WizardStep, type WizardStepperProps } from "./WizardStepper";
import { useLabels } from "../../../lib/labels";

export type WizardPanelProps = {
  /** Ordered steps (e.g. Upload → Map → Verify → Commit). */
  steps: WizardStep[];
  /** Index of the active step (consumer-owned state). */
  current: number;
  onBack?: () => void;
  onNext?: () => void;
  /** Finish — the terminal action on the last step. */
  onCommit?: () => void;
  /** Disable the forward action (Next/Commit) until the current step is valid. */
  canProceed?: boolean;
  /** Show a spinner + disable the footer while the commit is in flight. */
  busy?: boolean;
  nextLabel?: string;
  commitLabel?: string;
  backLabel?: string;
  /** Commit button label while `busy`. Default "Importing…". */
  busyLabel?: string;
  /** With `onFirstBack`: label of the outline button shown on the first step. Defaults to `backLabel`. */
  firstBackLabel?: string;
  /** First-step exit (e.g. close the dialog): Back becomes an enabled outline button instead of disabled. */
  onFirstBack?: () => void;
  /** Screen-reader state words in the stepper. */
  stateLabels?: WizardStepperProps["stateLabels"];
  className?: string;
  /** The current step's body. */
  children: React.ReactNode;
};

/**
 * WizardPanel — the embeddable import-wizard frame: stepper, step body and a
 * Back / Next·Commit footer, with no `PageFrame` and no title. Hosts a wizard
 * inside a Dialog or a tab body; `WizardShell` composes it for the page form.
 */
export function WizardPanel({
  steps,
  current,
  onBack,
  onNext,
  onCommit,
  canProceed = true,
  busy = false,
  nextLabel: nextLabelProp,
  commitLabel: commitLabelProp,
  backLabel: backLabelProp,
  busyLabel: busyLabelProp,
  firstBackLabel,
  onFirstBack,
  stateLabels,
  className,
  children,
}: WizardPanelProps): React.ReactElement {
  const L = useLabels();
  const busyLabel = busyLabelProp ?? L.importing;
  const backLabel = backLabelProp ?? L.back;
  const commitLabel = commitLabelProp ?? L.commitImport;
  const nextLabel = nextLabelProp ?? L.next;
  const isLast = current >= steps.length - 1;
  const isFirst = current <= 0;
  const firstExit = isFirst && onFirstBack != null;

  return (
    <div className={cn("space-y-5", className)}>
      <WizardStepper steps={steps} current={current} stateLabels={stateLabels} />

      {children}

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={firstExit ? onFirstBack : onBack}
          disabled={(isFirst && !firstExit) || busy}
        >
          {firstExit ? (firstBackLabel ?? backLabel) : backLabel}
        </Button>
        {isLast ? (
          <Button onClick={onCommit} disabled={!canProceed || busy}>
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {busyLabel}
              </>
            ) : (
              commitLabel
            )}
          </Button>
        ) : (
          <Button onClick={onNext} disabled={!canProceed || busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

WizardPanel.displayName = "WizardPanel";
