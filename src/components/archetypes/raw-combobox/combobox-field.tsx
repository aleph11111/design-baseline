import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { selectTriggerVariants } from "../../ui/select";
import { useControlSize } from "../../ui/toolbar-band";
import { useLabels } from "../../../lib/labels";
import { cn } from "../../../lib/utils";
import {
  FIELD_ERROR_RING,
  FieldError,
  FieldFrame,
  FieldHint,
  FieldLabel,
  useFieldIds,
} from "../shared/fieldFrame";

// The shared owner of a **searchable single-select field** — the searchable sibling
// of SelectField (S). The fleet hand-rolls it: controlling-app's AccountCombobox keeps
// its own open / search / highlight state, swaps its trigger for a text box, filters the
// options array itself, and re-implements arrow/Enter/Escape — with no combobox or
// listbox semantics at all. This composes the donor's Popover + Command (cmdk), which
// already own the keyboard model and the combobox ARIA, inside the shared labeled-field
// frame, so label / hint / error wiring is the same as every other field.
//
// Plain controlled, value in / raw string out, options as data — mirroring SelectField.
// Async options: pass `onSearch` and the caller owns filtering (it receives every query
// and swaps `options`); without it, the list filters locally on label + keywords.

/**
 * Local filter: case-insensitive substring over label + keywords only. cmdk's default
 * also fuzzy-scores the item's `value` — an opaque id (UUID) would then match almost
 * any query — and re-sorts by score, breaking the caller's option order.
 */
function matchKeywords(_value: string, search: string, keywords?: string[]): number {
  const q = search.trim().toLowerCase();
  return !q || keywords?.some((k) => k.toLowerCase().includes(q)) ? 1 : 0;
}
//
// Scoped out: multi-value selection, free-text entry (creatable values), and the
// toolbar-band joined label (the field always stacks its label).

/** One choice in the option set. `label` is shown; `value` is emitted on change. */
export interface ComboboxOption {
  value: string;
  label: string;
  /** Group heading this option sits under; options keep their order within a group. */
  group?: string;
  /** Extra terms the local filter matches (e.g. an account code beside its name). */
  keywords?: string[];
  /** Render this option non-selectable. */
  disabled?: boolean;
}

export interface ComboboxFieldProps {
  /** Field label. Always rendered and always associated with the trigger. */
  label: string;
  /** Current value — the selected option's `value`, or "" for none. */
  value: string;
  /** Fires with the chosen option's raw value. */
  onChange: (value: string) => void;
  /** The option set, in display order — data, not markup. Groups follow first appearance. */
  options: ComboboxOption[];
  /** Trigger text when no option is selected. */
  placeholder?: string;
  /** Placeholder of the search box inside the popover. */
  searchPlaceholder?: string;
  /** Shown when no option matches the query. */
  emptyText?: string;
  /**
   * Async seam: receives every query (and "" when the popover closes). When set,
   * local filtering is off — the caller fetches and passes the matching `options`.
   */
  onSearch?: (query: string) => void;
  /** The caller is fetching options for the current query. */
  loading?: boolean;
  /** Helper text under the control (linked via `aria-describedby`). */
  hint?: string;
  /** Error message; renders below and sets `aria-invalid` + a destructive ring. */
  error?: string;
  /** Show a required marker and mark the control required. */
  required?: boolean;
  /** Disable the control. */
  disabled?: boolean;
  /** Id for the trigger; auto-generated (and linked to the label) when omitted. */
  id?: string;
  /** Applied to the wrapper. */
  className?: string;
}

/**
 * ComboboxField — a labeled searchable single-select: label + trigger + popover
 * search list (groups, keyboard, combobox/listbox ARIA) + optional hint + error.
 */
export function ComboboxField({
  label,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  onSearch,
  loading,
  hint,
  error,
  required,
  disabled,
  id,
  className,
}: ComboboxFieldProps): React.ReactElement {
  const L = useLabels();
  const { fieldId, labelId, hintId, errorId, describedBy, invalid } = useFieldIds({
    id,
    hint,
    error,
  });
  const size = useControlSize();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  // cmdk generates the listbox id itself; read it off the mounted list so the
  // trigger's aria-controls names the real listbox.
  const [listId, setListId] = React.useState<string>();
  const listRef = React.useCallback((el: HTMLDivElement | null) => setListId(el?.id), []);
  // Async results replace `options` per query, so the chosen option can leave the
  // set while it is still the value — keep it to label the trigger.
  const [picked, setPicked] = React.useState<ComboboxOption>();
  const selected =
    options.find((o) => o.value === value) ?? (picked?.value === value ? picked : undefined);

  // Async results arrive after cmdk has already picked its highlight, so it ends up on
  // none; re-highlight the first enabled option whenever the result values change
  // (keyed on the values, not the array, so a fresh array per render keeps the highlight).
  const [active, setActive] = React.useState("");
  const resultKey = onSearch ? options.map((o) => o.value).join("\n") : "";
  React.useEffect(() => {
    if (onSearch) setActive(options.find((o) => !o.disabled)?.value ?? "");
  }, [resultKey]);

  const groups = React.useMemo(() => {
    const map = new Map<string | undefined, ComboboxOption[]>();
    for (const opt of options) map.set(opt.group, [...(map.get(opt.group) ?? []), opt]);
    return [...map];
  }, [options]);

  function search(next: string) {
    setQuery(next);
    onSearch?.(next);
  }

  function openChange(next: boolean) {
    setOpen(next);
    if (!next && query) search("");
  }

  function select(opt: ComboboxOption) {
    setPicked(opt);
    onChange(opt.value);
    openChange(false);
  }

  return (
    <FieldFrame className={className}>
      <FieldLabel id={labelId} required={required}>
        {label}
      </FieldLabel>
      <Popover open={open} onOpenChange={openChange}>
        <PopoverTrigger
          id={fieldId}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          aria-required={required || undefined}
          disabled={disabled}
          className={cn(selectTriggerVariants({ size }), "text-left", error && FIELD_ERROR_RING)}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0">
          <Command
            shouldFilter={!onSearch}
            filter={matchKeywords}
            label={`${L.search}: ${label}`}
            {...(onSearch && { value: active, onValueChange: setActive })}
          >
            <CommandInput
              value={query}
              onValueChange={search}
              placeholder={searchPlaceholder ?? L.searchPlaceholder}
            />
            <CommandList ref={listRef}>
              {loading ? (
                <div role="status" className="py-6 text-center text-sm text-muted-foreground">
                  {L.loading}
                </div>
              ) : (
                <CommandEmpty>{emptyText ?? L.noResults}</CommandEmpty>
              )}
              {groups.map(([heading, opts]) => (
                <CommandGroup key={heading ?? ""} heading={heading}>
                  {opts.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      keywords={[opt.label, ...(opt.keywords ?? [])]}
                      disabled={opt.disabled}
                      onSelect={() => select(opt)}
                    >
                      <Check
                        aria-hidden="true"
                        className={cn("mr-2 h-4 w-4", opt.value === value ? "opacity-100" : "opacity-0")}
                      />
                      {opt.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </FieldFrame>
  );
}

ComboboxField.displayName = "ComboboxField";
