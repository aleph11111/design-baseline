import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// The shared owner of a **labeled native form field** — the triad the fleet
// hand-rolls everywhere: `<label>` + a bare native `<input>` (or `<textarea>`) +
// an error `<p>`, each with its own ad-hoc `border rounded px-2 py-1` chrome and,
// almost always, no accessibility wiring at all. Every project re-invents it:
// controlling-app grew its own field.tsx, my-finance-app and dashboard (no shadcn
// primitives) re-hand-roll the triad on every field, and native-only types with
// no shadcn wrapper (`range`, `date`, `time`) sit bare.
//
// This is NOT a replacement for the donor's tokenized controls — a plain text or
// number field can still be a bare `<Input>`, a boolean is a `<Checkbox>`, an enum
// is a `<Select>`. NativeField is the *assembly*: it composes `Input`/`Textarea`/
// `Label`, adds the description + error slots, and — the non-negotiable piece the
// fleet copies all drop — wires the accessibility (label association, `aria-invalid`,
// `aria-describedby` for both hint and error). It also owns the one true gap: a
// tokenized `type="range"` slider, since shadcn ships no slider primitive.
//
// Plain controlled — no react-hook-form coupling (that is the form-field role's job;
// compose NativeField inside it). Value in / raw string out, mirroring ColorField.

/** Native input types NativeField renders with tokenized chrome. `range` gets a slider + value readout. */
export type NativeFieldType =
  | "text"
  | "number"
  | "date"
  | "time"
  | "datetime-local"
  | "password"
  | "url"
  | "email"
  | "range";

export interface NativeFieldProps {
  /** Field label. Always rendered and always associated with the control. */
  label: string;
  /** Current value (single source of truth). Coerced to a string for the control. */
  value: string | number;
  /** Fires with the control's raw string value. Convert with `Number(v)` for numeric fields. */
  onChange: (value: string) => void;
  /** Native input type. Ignored when `multiline` is set. Defaults to `"text"`. */
  type?: NativeFieldType;
  /** Render a `<Textarea>` instead of an `<input>` (for multi-line text). */
  multiline?: boolean;
  /** Helper text under the control (linked via `aria-describedby`). */
  hint?: string;
  /** Error message; renders below and sets `aria-invalid` + a destructive ring. */
  error?: string;
  /** Show a required marker and set the native `required` attribute. */
  required?: boolean;
  /** Disable the control. */
  disabled?: boolean;
  /** Placeholder text (text-like + textarea only). */
  placeholder?: string;
  /** Id for the control; auto-generated (and linked to the label) when omitted. */
  id?: string;
  /** Range only: bounds and step. */
  min?: number;
  max?: number;
  step?: number;
  /** Rows for the multiline variant. */
  rows?: number;
  /** Native `inputMode` (e.g. `"decimal"` for comma-preserving numeric text). */
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  /** Applied to the wrapper. */
  className?: string;
  /** Applied to the `Label`. */
  labelClassName?: string;
  /** Applied to the control. */
  controlClassName?: string;
}

/**
 * NativeField — a labeled native form field: label + tokenized control +
 * optional hint + error, with full accessibility wiring.
 */
export function NativeField({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
  hint,
  error,
  required,
  disabled,
  placeholder,
  id,
  min,
  max,
  step,
  rows,
  inputMode,
  className,
  labelClassName,
  controlClassName,
}: NativeFieldProps): React.ReactElement {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const invalid = error ? true : undefined;
  const stringValue = String(value);

  const shared = {
    id: inputId,
    value: stringValue,
    disabled,
    required,
    "aria-describedby": describedBy,
    "aria-invalid": invalid,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
  };

  const errorRing = error && "border-destructive focus-visible:ring-destructive";

  let control: React.ReactElement;
  if (multiline) {
    control = (
      <Textarea
        {...shared}
        placeholder={placeholder}
        rows={rows}
        className={cn(errorRing, controlClassName)}
      />
    );
  } else if (type === "range") {
    // No shadcn slider primitive — tokenized native range + a live value readout,
    // the shape mistra hand-rolled 4×. Box chrome (h-10 border) is wrong for a
    // slider, so this control is styled directly rather than via <Input>.
    control = (
      <div className="flex items-center gap-3">
        <input
          {...shared}
          type="range"
          min={min}
          max={max}
          step={step}
          className={cn(
            "h-2 w-full cursor-pointer accent-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            controlClassName
          )}
        />
        <span className="w-12 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
          {stringValue}
        </span>
      </div>
    );
  } else {
    control = (
      <Input
        {...shared}
        type={type}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        inputMode={inputMode}
        className={cn(errorRing, controlClassName)}
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={inputId} className={labelClassName}>
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {control}
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

NativeField.displayName = "NativeField";
