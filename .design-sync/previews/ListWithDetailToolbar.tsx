import { useState } from "react";
import { ListWithDetailToolbar, Badge } from "design-baseline";

// Search + quick-filter badges — the scoping controls a ListWithDetailShell
// renders in its toolbar band.
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
