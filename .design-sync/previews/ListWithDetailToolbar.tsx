import * as React from "react";
import { useState } from "react";
import { ListWithDetailToolbar, Badge, Button } from "design-baseline";

// Search + quick-filter badges + a trailing page action — the toolbar band
// as it renders under a ListWithDetailShell's on-surface header.
export function SearchWithFilters() {
  const [search, setSearch] = useState("Coffee");
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <ListWithDetailToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search shows…"
          quickFilters={
            <>
              <Badge variant="secondary">Active</Badge>
              <Badge variant="outline">Interview</Badge>
            </>
          }
          pageActions={
            <Button size="sm" variant="outline">
              Export
            </Button>
          }
        />
      </div>
    </div>
  );
}

// Search-only toolbar — the minimal form when there is nothing else to filter.
export function SearchOnly() {
  const [search, setSearch] = useState("");
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <ListWithDetailToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search shows…"
        />
      </div>
    </div>
  );
}
