"use client";
import * as React from "react";
import { SectionCard } from "../../layout/SectionCard";
import { PageFrame, type PageFrameProps } from "../../layout/PageFrame";
import { type WizardStep, type WizardStepperProps } from "./WizardStepper";
import { WizardPanel } from "./WizardPanel";

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
  /** Back button label. Default "Back". */
  backLabel?: string;
  /** Commit button label while `busy`. Default "Importing…". */
  busyLabel?: string;
  /** Screen-reader state words in the stepper. Default completed / current / upcoming. */
  stepStateLabels?: WizardStepperProps["stateLabels"];
  /**
   * Done state. When set, the shell renders it as the page body inside the same
   * frame (title kept, one raised surface) in place of stepper, step and footer.
   */
  done?: React.ReactNode;
  /** The current step's body. */
  children: React.ReactNode;
} & Pick<
  PageFrameProps,
  "title" | "subtitle" | "badges" | "viewSwitch" | "viewOptions" | "viewOptionsLabel"
>;

/**
 * WizardShell — the import-wizard (W) archetype shell: a step indicator, the
 * current step's body in a bounded `<SectionCard>`, and a Back / Next·Commit
 * footer. The flow is **consumer-driven** — the consumer owns `current` and the
 * per-step state; the shell renders chrome and emits navigation intents. The
 * terminal step swaps Next for a single Commit action (idempotent — see spec).
 *
 * Renders through `PageFrame` (ADR-0008): the title is the page heading; the
 * stepper opens the body (it is read-only progress, not a scoping control, so
 * it is not toolbar content); the step's titled `SectionCard` flattens inside
 * the frame. Navigation actions stay in the footer — the shell takes no
 * `actions`. A history toggle ("New import" / "History") goes in `viewSwitch`,
 * display-only toggles in `viewOptions`; both persist in the `done` state.
 */
export function WizardShell({
  steps,
  current,
  onBack,
  onNext,
  onCommit,
  canProceed = true,
  busy = false,
  nextLabel,
  commitLabel,
  backLabel,
  busyLabel,
  stepStateLabels,
  done,
  children,
  title,
  subtitle,
  badges,
  viewSwitch,
  viewOptions,
  viewOptionsLabel,
}: WizardShellProps): React.ReactElement {
  const stepLabel = steps[current]?.label;
  const frame = { title, subtitle, badges, viewSwitch, viewOptions, viewOptionsLabel };

  if (done != null) {
    return (
      <PageFrame {...frame}>
        <div className="p-5">{done}</div>
      </PageFrame>
    );
  }

  return (
    <PageFrame {...frame}>
      <WizardPanel
        className="p-5"
        steps={steps}
        current={current}
        onBack={onBack}
        onNext={onNext}
        onCommit={onCommit}
        canProceed={canProceed}
        busy={busy}
        nextLabel={nextLabel}
        commitLabel={commitLabel}
        backLabel={backLabel}
        busyLabel={busyLabel}
        stateLabels={stepStateLabels}
      >
        <SectionCard title={stepLabel}>{children}</SectionCard>
      </WizardPanel>
    </PageFrame>
  );
}

WizardShell.displayName = "WizardShell";
