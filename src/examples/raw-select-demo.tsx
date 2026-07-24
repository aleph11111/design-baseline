import * as React from "react";
import { SelectField, type SelectOption } from "@/components/archetypes/raw-select";
import { Button } from "@/components/ui/button";

/**
 * raw-select demo — a board-game shelf entry (domain deliberately far from any source
 * project: no finance/controlling/inventory/CRM/transcription nouns). Types are
 * defined here FIRST, then fed to SelectField; the primitive never sees a domain type,
 * only its generic label / value / options / error / hint props.
 *
 * Every field is an enum choice — exactly what SelectField owns. Plain controlled
 * state, no react-hook-form.
 */

interface ShelfEntry {
  playerCount: string; // band
  complexity: string; // weight
  category: string;
  shelf: string; // storage location
}

const PLAYER_COUNTS: SelectOption[] = [
  { value: "solo", label: "Solo (1)" },
  { value: "duel", label: "Two-player (2)" },
  { value: "small", label: "Small group (3–4)" },
  { value: "party", label: "Party (5+)" },
];

const COMPLEXITY: SelectOption[] = [
  { value: "gateway", label: "Gateway" },
  { value: "medium", label: "Medium weight" },
  { value: "heavy", label: "Heavy" },
];

const CATEGORY: SelectOption[] = [
  { value: "euro", label: "Euro" },
  { value: "ameritrash", label: "Ameritrash" },
  { value: "coop", label: "Co-operative" },
  { value: "abstract", label: "Abstract" },
  { value: "legacy", label: "Legacy", disabled: true }, // shelf is full
];

const SHELVES: SelectOption[] = [
  { value: "top", label: "Top shelf" },
  { value: "middle", label: "Middle shelf" },
  { value: "closet", label: "Closet bin" },
];

const EMPTY: ShelfEntry = {
  playerCount: "small",
  complexity: "",
  category: "euro",
  shelf: "top",
};

export function RawSelectDemo(): React.ReactElement {
  const [entry, setEntry] = React.useState<ShelfEntry>(EMPTY);
  const [submitted, setSubmitted] = React.useState<ShelfEntry | null>(null);

  // A trivial validation rule so the error slot has something to show.
  const complexityError =
    entry.complexity === "" ? "Pick a complexity before shelving it." : undefined;

  function set<K extends keyof ShelfEntry>(key: K, value: ShelfEntry[K]) {
    setEntry((e) => ({ ...e, [key]: value }));
    setSubmitted(null);
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-6 py-8">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Shelve a board game</h1>
        <p className="text-sm text-muted-foreground">
          Every field is a <code>SelectField</code> — one labeled, accessible, on-token
          enum assembly instead of a hand-rolled <code>{"<label>"}</code> +{" "}
          <code>{"<select>"}</code> + error triad.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!complexityError) setSubmitted(entry);
        }}
      >
        <SelectField
          label="Player count"
          value={entry.playerCount}
          onChange={(v) => set("playerCount", v)}
          options={PLAYER_COUNTS}
          hint="The sweet-spot band, not the box maximum."
        />

        <SelectField
          label="Complexity"
          required
          value={entry.complexity}
          onChange={(v) => set("complexity", v)}
          options={COMPLEXITY}
          placeholder="How heavy is it?"
          error={complexityError}
        />

        <SelectField
          label="Category"
          value={entry.category}
          onChange={(v) => set("category", v)}
          options={CATEGORY}
          hint="“Legacy” is disabled — that shelf is full."
        />

        <SelectField
          label="Shelf"
          value={entry.shelf}
          onChange={(v) => set("shelf", v)}
          options={SHELVES}
        />

        <Button type="submit" disabled={!!complexityError}>
          Shelve it
        </Button>
      </form>

      {submitted && (
        <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </div>
  );
}

RawSelectDemo.displayName = "RawSelectDemo";
