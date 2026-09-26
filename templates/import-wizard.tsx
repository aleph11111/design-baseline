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

// TODO: replace with the page's real commit call.
async function commit__Name__(): Promise<void> {}

export function __Name__Page() {
  const [current, setCurrent] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function commit() {
    setBusy(true);
    setError(null);
    try {
      await commit__Name__();
      // TODO: show the result step + a "start another" affordance.
    } catch (err) {
      // A failed commit stays on the Commit step and shows the error there.
      setError(err instanceof Error ? err.message : "Import failed");
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
      {error && (
        <div role="alert" className="bg-destructive/10 p-4 rounded text-sm text-destructive">
          {error}
        </div>
      )}
      {/* TODO: body for steps[current] */}
      {steps[current]?.label}
    </WizardShell>
  );
}
