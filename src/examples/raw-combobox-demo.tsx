import * as React from "react";
import { ComboboxField, type ComboboxOption } from "@/components/archetypes/raw-combobox";
import { Button } from "@/components/ui/button";

/**
 * raw-combobox demo — logging a pottery kiln firing (domain deliberately far from any
 * source project: no finance/controlling/inventory/CRM/transcription nouns). Three
 * cases: a grouped option set filtered locally (with keywords), an async option set
 * the demo "fetches" per query, and the error state.
 */

const GLAZES: ComboboxOption[] = [
  { value: "celadon", label: "Celadon", group: "Stoneware", keywords: ["green", "cone 10"] },
  { value: "tenmoku", label: "Tenmoku", group: "Stoneware", keywords: ["brown", "cone 10"] },
  { value: "shino", label: "Shino", group: "Stoneware", keywords: ["white", "cone 10"] },
  { value: "majolica", label: "Majolica", group: "Earthenware", keywords: ["white", "cone 04"] },
  { value: "terra-sig", label: "Terra sigillata", group: "Earthenware", keywords: ["burnish"] },
  { value: "raku-copper", label: "Copper matte", group: "Raku", keywords: ["lustre"] },
  { value: "crackle", label: "Crackle white", group: "Raku", disabled: true }, // out of stock
];

const KILNS = [
  "Anagama — wood", "Bourry box — wood", "Electric 7 cu ft", "Electric test kiln",
  "Gas downdraft", "Gas updraft", "Raku barrel", "Soda kiln", "Salt kiln", "Pit firing",
].map((label) => ({ value: label.toLowerCase().replace(/\W+/g, "-"), label }));

/** Stand-in for a server search: resolves the matching kilns after a short delay. */
function useKilnSearch() {
  const [options, setOptions] = React.useState<ComboboxOption[]>(KILNS.slice(0, 5));
  const [loading, setLoading] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const search = React.useCallback((query: string) => {
    clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      const q = query.trim().toLowerCase();
      setOptions(q ? KILNS.filter((k) => k.label.toLowerCase().includes(q)) : KILNS.slice(0, 5));
      setLoading(false);
    }, 400);
  }, []);
  return { options, loading, search };
}

export function RawComboboxDemo(): React.ReactElement {
  const [glaze, setGlaze] = React.useState("celadon");
  const [kiln, setKiln] = React.useState("");
  const [liner, setLiner] = React.useState("");
  const kilns = useKilnSearch();

  const linerError = liner === "" ? "Pick a liner glaze before logging." : undefined;

  return (
    <div className="mx-auto max-w-md space-y-6 px-6 py-8">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Log a kiln firing</h1>
        <p className="text-sm text-muted-foreground">
          Every field is a <code>ComboboxField</code> — a labeled, searchable single-select
          with combobox/listbox semantics instead of a hand-rolled open + search + filter list.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <ComboboxField
          label="Outer glaze"
          value={glaze}
          onChange={setGlaze}
          options={GLAZES}
          placeholder="Choose a glaze"
          searchPlaceholder="Name, colour or cone…"
          hint="Grouped by clay body; try “cone 10”. Crackle white is out of stock."
        />

        <ComboboxField
          label="Kiln"
          value={kiln}
          onChange={setKiln}
          options={kilns.options}
          onSearch={kilns.search}
          loading={kilns.loading}
          placeholder="Search the kiln shed"
          hint="Async: options are fetched per query."
        />

        <ComboboxField
          label="Liner glaze"
          required
          value={liner}
          onChange={setLiner}
          options={GLAZES}
          placeholder="Choose a glaze"
          error={linerError}
        />

        <Button type="submit" disabled={!!linerError}>
          Log firing
        </Button>
      </form>
    </div>
  );
}

RawComboboxDemo.displayName = "RawComboboxDemo";
