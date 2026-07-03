import * as React from "react";
import { UploadCloud } from "lucide-react";
import {
  WizardShell,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "design-baseline";

const STEPS = [
  { key: "upload", label: "Upload" },
  { key: "map", label: "Map columns" },
  { key: "verify", label: "Verify" },
  { key: "commit", label: "Commit" },
];

const SOURCE_COLUMNS = ["Date", "Memo", "Amount", "Category"];

const PREVIEW = [
  { date: "2026-06-01", description: "Coffee Bar", amount: "-4.20", category: "Dining" },
  { date: "2026-06-02", description: "Payroll", amount: "+2,940.00", category: "Income" },
  { date: "2026-06-03", description: "Rail pass", amount: "-89.00", category: "Transport" },
];

// Step 0 — the drop zone before a file is chosen; Next disabled until
// `canProceed`. First step, so Back is also disabled.
export function UploadStep() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <WizardShell kicker="Import" title="Import transactions" steps={STEPS} current={0} canProceed={false}>
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed py-10 text-center">
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Drop a CSV here, or choose a file.</p>
          <Button size="sm">Choose file</Button>
        </div>
      </WizardShell>
    </div>
  );
}

// Step 1 — column mapping, a Select per source column.
export function MapColumnsStep() {
  const mapping: Record<string, string> = {
    Date: "date",
    Memo: "description",
    Amount: "amount",
    Category: "category",
  };
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <WizardShell kicker="Import" title="Import transactions" steps={STEPS} current={1}>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Match each CSV column to a field.</p>
          {SOURCE_COLUMNS.map((col) => (
            <div key={col} className="flex items-center gap-3 text-sm">
              <span className="w-32 shrink-0 font-mono text-xs">{col}</span>
              <span className="text-muted-foreground">→</span>
              <Select defaultValue={mapping[col]}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ignore">— ignore —</SelectItem>
                  <SelectItem value="date">date</SelectItem>
                  <SelectItem value="description">description</SelectItem>
                  <SelectItem value="amount">amount</SelectItem>
                  <SelectItem value="category">category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </WizardShell>
    </div>
  );
}

// Step 2 — verify, a table preview of the parsed rows.
export function VerifyStep() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <WizardShell kicker="Import" title="Import transactions" steps={STEPS} current={2}>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            128 rows · <span className="text-foreground">126 valid</span> · 2 skipped (missing amount).
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
                  <TableCell className="font-mono tabular-nums">{r.date}</TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{r.amount}</TableCell>
                  <TableCell>{r.category}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </WizardShell>
    </div>
  );
}

// Step 3 (last) — Next swaps for a single Commit action; footer shows the
// busy/importing state.
export function CommitStep() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <WizardShell kicker="Import" title="Import transactions" steps={STEPS} current={3} busy>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">126 transactions</span> will be imported into{" "}
            <span className="font-medium">Checking</span>.
          </p>
          <p className="text-muted-foreground">
            2 rows will be skipped. This action can be re-run safely — rows already imported are
            de-duplicated.
          </p>
        </div>
      </WizardShell>
    </div>
  );
}
