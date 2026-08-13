import * as React from "react";
import { NativeField } from "@/components/archetypes/raw-input";
import { Button } from "@/components/ui/button";

/**
 * raw-input demo — a home-brew batch log (domain deliberately far from any source
 * project: no finance/controlling/inventory/CRM/transcription nouns). Types are
 * defined here FIRST, then fed to NativeField; the primitive never sees a domain
 * type, only its generic label / value / type / error / hint props.
 *
 * Exercises every NativeField control: required text + error, number, date,
 * range (slider), and multiline. Plain controlled state, no react-hook-form.
 */

interface Batch {
  name: string;
  originalGravity: string; // kept as string — the control emits raw strings
  brewedOn: string; // date, "yyyy-mm-dd"
  costPerLitre: string; // prefixed text adornment
  fermTemp: number; // range
  notes: string; // multiline
}

const EMPTY: Batch = {
  name: "",
  originalGravity: "1.050",
  brewedOn: "2026-07-01",
  costPerLitre: "1.80",
  fermTemp: 20,
  notes: "",
};

export function RawInputDemo(): React.ReactElement {
  const [batch, setBatch] = React.useState<Batch>(EMPTY);
  const [submitted, setSubmitted] = React.useState<Batch | null>(null);

  // A trivial validation rule so the error slot has something to show.
  const nameError =
    batch.name.trim() === "" ? "Give the batch a name before logging it." : undefined;

  function set<K extends keyof Batch>(key: K, value: Batch[K]) {
    setBatch((b) => ({ ...b, [key]: value }));
    setSubmitted(null);
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-6 py-8">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Log a brew batch</h1>
        <p className="text-sm text-muted-foreground">
          Every field is a <code>NativeField</code> — one labeled, accessible,
          on-token assembly instead of a hand-rolled <code>{"<label>"}</code> +{" "}
          <code>{"<input>"}</code> + error triad.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!nameError) setSubmitted(batch);
        }}
      >
        <NativeField
          label="Batch name"
          required
          value={batch.name}
          onChange={(v) => set("name", v)}
          placeholder="e.g. Autumn Saison"
          error={nameError}
          hint="Shown on the fermenter tag."
        />

        <NativeField
          label="Original gravity"
          type="number"
          step={0.001}
          min={1}
          max={1.2}
          value={batch.originalGravity}
          onChange={(v) => set("originalGravity", v)}
          hint="Pre-fermentation sugar reading."
        />

        <NativeField
          label="Brewed on"
          type="date"
          value={batch.brewedOn}
          onChange={(v) => set("brewedOn", v)}
        />

        <NativeField
          label="Cost per litre"
          type="number"
          step={0.01}
          min={0}
          prefix="EUR"
          value={batch.costPerLitre}
          onChange={(v) => set("costPerLitre", v)}
          hint="Ingredients only — the control pads itself clear of the prefix."
        />

        <NativeField
          label="Fermentation temp (°C)"
          type="range"
          min={0}
          max={30}
          step={1}
          value={batch.fermTemp}
          onChange={(v) => set("fermTemp", Number(v))}
          hint="Most ales ferment cleanest at 18–22 °C."
        />

        <NativeField
          label="Tasting notes"
          multiline
          rows={3}
          value={batch.notes}
          onChange={(v) => set("notes", v)}
          placeholder="Aroma, body, anything to change next time…"
        />

        <Button type="submit" disabled={!!nameError}>
          Log batch
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

RawInputDemo.displayName = "RawInputDemo";
