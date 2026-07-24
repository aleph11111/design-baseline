import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// The shared owner of a **labeled enum form field** — the triad the fleet hand-rolls
// everywhere: `<label>` + a bare native `<select>` (or a re-composed `<Select>`
// trigger) + an error `<p>`, each with its own ad-hoc `border rounded px-2 py-1`
// chrome and, almost always, no accessibility wiring at all. my-finance-app alone
// hand-rolls ~34 native `<select>` sites with ~10 divergent class strings; mistra
// shares a chrome string but leaves the labels unassociated; controlling-app built a
// proper Field wrapper that its selects bypass. This is the enum sibling of
// NativeField (I) and TextareaField (T).
//
// This is NOT a replacement for the donor's `<Select>` primitive — a bare enum control
// can still be a `<Select>`. SelectField is the *assembly*: it composes `Select` +
// `Label`, adds the description + error slots, and — the non-negotiable piece the fleet
// copies all drop — wires the accessibility (label association via `aria-labelledby`,
// `aria-invalid`, `aria-describedby` for both hint and error).
//
// Plain controlled — no react-hook-form coupling (that is the form-field role's job;
// compose SelectField inside it). Value in / raw string out, mirroring NativeField.
//
// Scoped out: multi-value selection, combobox/type-ahead, async search, and the
// flush grid-cell select (that is `CellSelect`, a label-less sibling).

/** One choice in the option set. `label` is shown; `value` is emitted on change. */
export interface SelectOption {
  value: string;
  label: string;
  /** Render this option non-selectable. */
  disabled?: boolean;
}

export interface SelectFieldProps {
  /** Field label. Always rendered and always associated with the control. */
  label: string;
  /** Current value (single source of truth) — the selected option's `value`, or "" for none. */
  value: string;
  /** Fires with the chosen option's raw value. */
  onChange: (value: string) => void;
  /** The option set, in display order. Supplied as data, not as markup. */
  options: SelectOption[];
  /** Placeholder shown when no option is selected. */
  placeholder?: string;
  /** Helper text under the control (linked via `aria-describedby`). */
  hint?: string;
  /** Error message; renders below and sets `aria-invalid` + a destructive ring. */
  error?: string;
  /** Show a required marker and mark the control required. */
  required?: boolean;
  /** Disable the control. */
  disabled?: boolean;
  /** Id for the control; auto-generated (and linked to the label) when omitted. */
  id?: string;
  /** Applied to the wrapper. */
  className?: string;
}

/**
 * SelectField — a labeled enum form field: label + tokenized choice control +
 * optional hint + error, with full accessibility wiring.
 */
export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
  error,
  required,
  disabled,
  id,
  className,
}: SelectFieldProps): React.ReactElement {
  const autoId = React.useId();
  const controlId = id ?? autoId;
  const labelId = `${controlId}-label`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const invalid = error ? true : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Radix's trigger is a button, so the label associates via aria-labelledby
          (not htmlFor) — id on the Label, aria-labelledby on the trigger. */}
      <Label id={labelId}>
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled} required={required}>
        <SelectTrigger
          id={controlId}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={cn(error && "border-destructive focus:ring-destructive")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

SelectField.displayName = "SelectField";
