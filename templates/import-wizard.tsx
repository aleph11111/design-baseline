// Scaffolded by `design-baseline new-page import-wizard __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/import-wizard.md
import { useState } from "react";
import {
  WizardShell,
  type WizardStep,
} from "design-baseline/archetypes/import-wizard";

const steps: WizardStep[] = [
  { key: "upload", label: "Upload" },
  { key: "review", label: "Review" },
  { key: "commit", label: "Commit" },
];

export function __Name__Page() {
  const [current, setCurrent] = useState(0);
  const [busy, setBusy] = useState(false);

  async function commit() {
    setBusy(true);
    try {
      // TODO: commit; on failure stay on the Commit step and show the error.
    } finally {
      setBusy(false);
    }
  }

  return (
    <WizardShell
      title="__Name__"
      steps={steps}
      current={current}
      onBack={() => setCurrent((step) => Math.max(0, step - 1))}
      onNext={() => setCurrent((step) => Math.min(steps.length - 1, step + 1))}
      onCommit={() => void commit()}
      busy={busy}
    >
      {/* TODO: body for steps[current] */}
      {steps[current]?.label}
    </WizardShell>
  );
}
