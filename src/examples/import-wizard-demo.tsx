/**
 * import-wizard-demo.tsx
 *
 * Reference demo for the W (import-wizard) archetype: a stepped data-ingestion
 * flow — Upload → Map columns → Verify → Commit. The shell owns the stepper +
 * footer chrome; the consumer owns `current` and the per-step bodies. Domain is
 * a generic CSV transaction import.
 */

import * as React from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  WizardShell,
  type WizardStep,
} from "@/components/archetypes/import-wizard";

const STEPS: WizardStep[] = [
  { key: "upload", label: "Upload" },
  { key: "map", label: "Map columns" },
  { key: "verify", label: "Verify" },
  { key: "commit", label: "Commit" },
];

const SOURCE_COLUMNS = ["Date", "Memo", "Amount", "Category"];
const TARGET_FIELDS = ["— ignore —", "date", "description", "amount", "category"];

const PREVIEW = [
  { date: "2026-06-01", description: "Coffee Bar", amount: "-4.20", category: "Dining" },
  { date: "2026-06-02", description: "Payroll", amount: "+2,940.00", category: "Income" },
  { date: "2026-06-03", description: "Rail pass", amount: "-89.00", category: "Transport" },
];

export function ImportWizardDemo(): React.ReactElement {
  const [step, setStep] = React.useState(0);
  const [uploaded, setUploaded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [committed, setCommitted] = React.useState(false);
  const [mapping, setMapping] = React.useState<Record<string, string>>({
    Date: "date",
    Memo: "description",
    Amount: "amount",
    Category: "category",
  });

  function commit() {
    setBusy(true);
    // Simulate the import; in a real consumer this is an idempotent server call.
    window.setTimeout(() => {
      setBusy(false);
      setCommitted(true);
    }, 600);
  }

  if (committed) {
    return (
      <div className="px-6 py-6">
        <PageHeader title="Import transactions" />
        <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border bg-card p-10 text-center shadow-sm">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          <h2 className="text-lg font-semibold">Import complete</h2>
          <p className="text-sm text-muted-foreground">
            126 transactions imported into Checking · 2 rows skipped.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setCommitted(false);
              setUploaded(false);
              setStep(0);
            }}
          >
            Start another import
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6">
      <PageHeader
        title="Import transactions"
        subtitle="Bring in a CSV export from your bank."
      />

      <WizardShell
        steps={STEPS}
        current={step}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
        onCommit={commit}
        canProceed={step !== 0 || uploaded}
        busy={busy}
      >
        {step === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed py-10 text-center">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            {uploaded ? (
              <p className="text-sm text-foreground">
                <span className="font-medium">transactions.csv</span> · 128 rows
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Drop a CSV here, or choose a file.
                </p>
                <Button size="sm" onClick={() => setUploaded(true)}>
                  Choose file
                </Button>
              </>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Match each CSV column to a field.
            </p>
            {SOURCE_COLUMNS.map((col) => (
              <div key={col} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 font-mono text-xs">{col}</span>
                <span className="text-muted-foreground">→</span>
                <select
                  value={mapping[col] ?? "— ignore —"}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [col]: e.target.value }))
                  }
                  className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                >
                  {TARGET_FIELDS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              128 rows · <span className="text-foreground">126 valid</span> · 2
              skipped (missing amount).
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PREVIEW.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.amount}</TableCell>
                    <TableCell>{r.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">126 transactions</span> will be
              imported into <span className="font-medium">Checking</span>.
            </p>
            <p className="text-muted-foreground">
              2 rows will be skipped. This action can be re-run safely — rows
              already imported are de-duplicated.
            </p>
          </div>
        )}
      </WizardShell>
    </div>
  );
}
