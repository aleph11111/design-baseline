import * as React from "react";
import { TextareaField } from "@/components/archetypes/raw-textarea";
import { Button } from "@/components/ui/button";

/**
 * raw-textarea demo — a book-club annotation form (domain deliberately far from
 * any source project's nouns). Types are defined here first, then fed to
 * TextareaField; the primitive never sees a domain type, only its own
 * label/helperText/error/mono/showCount knobs + native textarea attributes.
 *
 * Shows the three variation axes the fleet hand-rolls:
 *   1. plain labeled field + helper line       (reading notes)
 *   2. showCount + maxLength threshold coloring (one-line review)
 *   3. mono / JSON variant + error state        (shelf metadata)
 */

interface Annotation {
  notes: string;
  review: string;
  metadata: string;
}

const REVIEW_LIMIT = 280;

function isValidJson(s: string): boolean {
  if (s.trim() === "") return true;
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}

export function RawTextareaDemo(): React.ReactElement {
  const [ann, setAnn] = React.useState<Annotation>({
    notes: "",
    review: "",
    metadata: '{\n  "shelf": "to-read",\n  "tags": ["sci-fi"]\n}',
  });

  const set =
    (k: keyof Annotation) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setAnn((a) => ({ ...a, [k]: e.target.value }));

  const metadataError = isValidJson(ann.metadata)
    ? undefined
    : "Not valid JSON — check your brackets and quotes.";

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-semibold">Annotate a book</h2>
        <p className="text-sm text-muted-foreground">
          One field molecule, three variants — plain, counted, and mono/JSON.
        </p>
      </div>

      <TextareaField
        label="Reading notes"
        helperText="Private to your book club. Markdown is fine."
        placeholder="What stood out this chapter?"
        rows={4}
        value={ann.notes}
        onChange={set("notes")}
      />

      <TextareaField
        label="One-line review"
        showCount
        maxLength={REVIEW_LIMIT}
        placeholder="Sum it up for the group…"
        rows={2}
        value={ann.review}
        onChange={set("review")}
      />

      <TextareaField
        label="Shelf metadata"
        mono
        error={metadataError}
        helperText="Raw JSON stored alongside the annotation."
        rows={5}
        value={ann.metadata}
        onChange={set("metadata")}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!!metadataError}
          onClick={() =>
            setAnn({ notes: "", review: "", metadata: "" })
          }
        >
          Save & clear
        </Button>
      </div>
    </div>
  );
}

export default RawTextareaDemo;
