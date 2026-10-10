import * as React from "react";
import { FieldGroup, NativeField } from "@/components/archetypes/raw-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageFrame } from "@/components/layout/PageFrame";

/**
 * raw-input demo — a home-brew batch log (domain deliberately far from any source
 * project: no finance/controlling/inventory/CRM/transcription nouns). Types are
 * defined here FIRST, then fed to NativeField; the primitive never sees a domain
 * type, only its generic label / value / type / error / hint props.
 *
 * Exercises every NativeField control: required text + error, number, date,
 * range (slider), and multiline. Plain controlled state, no react-hook-form.
 *
 * "Hops" is a `FieldGroup`: a caption over several checkboxes is a fieldset legend,
 * never a bare `<Label>` (the `raw-input-label-missing-htmlfor` scan signal).
 *
 * The second block shows the same field inside a `PageFrame` toolbar band, where it
 * joins its label to the box by itself (STYLE.md "Toolbar field labels").
 */

interface Batch {
  name: string;
  originalGravity: string; // kept as string — the control emits raw strings
  brewedOn: string; // date, "yyyy-mm-dd"
  costPerLitre: string; // prefixed text adornment
  fermTemp: number; // range
  notes: string; // multiline
  hops: string[]; // FieldGroup of checkboxes
}

const HOPS = ["Citra", "Saaz", "Cascade", "Hallertau"];

const EMPTY: Batch = {
  name: "",
  originalGravity: "1.050",
  brewedOn: "2026-07-01",
  costPerLitre: "1.80",
  fermTemp: 20,
  notes: "",
  hops: [],
};

export function RawInputDemo(): React.ReactElement {
  const [batch, setBatch] = React.useState<Batch>(EMPTY);
  const [submitted, setSubmitted] = React.useState<Batch | null>(null);

  // A trivial validation rule so the error slot has something to show.
  const nameError =
    batch.name.trim() === "" ? "Give the batch a name before logging it." : undefined;
  const hopsError = batch.hops.length === 0 ? "Pick at least one hop." : undefined;

  function set<K extends keyof Batch>(key: K, value: Batch[K]) {
    setBatch((b) => ({ ...b, [key]: value }));
    setSubmitted(null);
  }

  // The toolbar-band example's scope: which readings the frame shows.
  const [readingsFrom, setReadingsFrom] = React.useState("2026-10-01");
  const [readingsDays, setReadingsDays] = React.useState("14");

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
          if (!nameError && !hopsError) setSubmitted(batch);
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
          maxLength={280}
          value={batch.notes}
          onChange={(v) => set("notes", v)}
          placeholder="Aroma, body, anything to change next time…"
        />

        <FieldGroup label="Hops" required hint="Every hop that went in." error={hopsError}>
          {HOPS.map((hop) => (
            <div key={hop} className="flex items-center gap-2">
              <Checkbox
                id={`hop-${hop}`}
                checked={batch.hops.includes(hop)}
                onCheckedChange={(on) =>
                  set("hops", on ? [...batch.hops, hop] : batch.hops.filter((h) => h !== hop))
                }
              />
              <Label htmlFor={`hop-${hop}`} className="font-normal">
                {hop}
              </Label>
            </div>
          ))}
        </FieldGroup>

        <Button type="submit" disabled={!!nameError || !!hopsError}>
          Log batch
        </Button>
      </form>

      {submitted && (
        <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}

      <PageFrame
        title="Gravity readings"
        toolbar={
          <>
            <NativeField
              label="From"
              type="date"
              value={readingsFrom}
              onChange={setReadingsFrom}
              controlClassName="w-40"
            />
            <NativeField
              label="Days"
              type="number"
              value={readingsDays}
              onChange={setReadingsDays}
              controlClassName="w-20"
            />
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Readings for {readingsDays || 0} days from {readingsFrom}.
        </p>
      </PageFrame>
    </div>
  );
}

RawInputDemo.displayName = "RawInputDemo";
