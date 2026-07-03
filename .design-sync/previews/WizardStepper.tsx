import * as React from "react";
import { WizardShell } from "design-baseline";

// WizardStepper is read-only chrome the shell renders internally — it only
// reads meaningfully inside a <WizardShell> page, so every cell mounts a
// full wizard and varies `current` to show the done / active / upcoming
// states across the step row.

const STEPS = [
  { key: "upload", label: "Upload" },
  { key: "map", label: "Map columns" },
  { key: "verify", label: "Verify" },
  { key: "commit", label: "Commit" },
];

// At the start — step 1 active, the rest upcoming (muted).
export function AtStart() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <WizardShell kicker="Import" title="Import transactions" steps={STEPS} current={0}>
        <p className="text-sm text-muted-foreground">Drop a CSV here, or choose a file.</p>
      </WizardShell>
    </div>
  );
}

// Mid-flow — two done (checked, filled connector), one active (ringed),
// one upcoming.
export function MidFlow() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <WizardShell kicker="Import" title="Import transactions" steps={STEPS} current={2}>
        <p className="text-sm text-muted-foreground">
          128 rows · 126 valid · 2 skipped (missing amount).
        </p>
      </WizardShell>
    </div>
  );
}

// At the end — every prior step done, the terminal step active.
export function AtEnd() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <WizardShell kicker="Import" title="Import transactions" steps={STEPS} current={3}>
        <p className="text-sm text-muted-foreground">
          126 transactions will be imported into Checking.
        </p>
      </WizardShell>
    </div>
  );
}
