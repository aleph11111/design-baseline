import * as React from "react";
import { ThemeToggle } from "design-baseline";

// The toggle alone — a single small icon button, genuinely tiny by design.
export function Standalone() {
  return (
    <div className="inline-flex rounded-lg border bg-card p-2">
      <ThemeToggle />
    </div>
  );
}

// In its real context: the trailing slot of an app header row.
export function InHeaderRow() {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
      <span className="text-sm font-semibold text-foreground">Ledger</span>
      <ThemeToggle />
    </div>
  );
}
