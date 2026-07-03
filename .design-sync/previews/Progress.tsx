import * as React from "react";
import { Progress } from "design-baseline";

// Several bars at different values, each labeled — a storage/quota panel.
export function LabeledBars() {
  const rows = [
    { label: "Storage", value: 82 },
    { label: "API requests", value: 46 },
    { label: "Seats used", value: 12 },
  ];
  return (
    <div className="max-w-sm space-y-4 rounded-md border bg-card p-4">
      {rows.map((row) => (
        <div key={row.label} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-mono tabular-nums text-foreground">{row.value}%</span>
          </div>
          <Progress value={row.value} />
        </div>
      ))}
    </div>
  );
}

// A single upload in progress — the value pinned near completion, with a
// file name and byte count, as in an import wizard step.
export function UploadInProgress() {
  return (
    <div className="max-w-sm space-y-2 rounded-md border bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="truncate font-medium">customer-export.csv</span>
        <span className="font-mono tabular-nums text-muted-foreground">91%</span>
      </div>
      <Progress value={91} />
      <p className="font-mono text-xs tabular-nums text-muted-foreground">
        18.2 MB / 20.0 MB
      </p>
    </div>
  );
}

// Empty vs full — the two ends of the range, side by side for contrast.
export function EmptyAndComplete() {
  return (
    <div className="max-w-sm space-y-4 rounded-md border bg-card p-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Not started</span>
          <span className="font-mono tabular-nums text-foreground">0%</span>
        </div>
        <Progress value={0} />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Complete</span>
          <span className="font-mono tabular-nums text-foreground">100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  );
}
