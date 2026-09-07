import * as React from "react";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { cn } from "../../../lib/utils";
import {
  FieldError,
  FieldFrame,
  FieldHint,
  FieldLabel,
  useFieldIds,
} from "../shared/fieldFrame";

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
  /** Forwarded to the control — for a field that commits on blur, not per keystroke. */
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  /** Forwarded to the control — for Enter-to-submit and other key handling. */
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  /** Native `maxLength` on the control. */
  maxLength?: number;
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
  /**
   * Short text adornment inside the control's left edge — a currency code, a unit, a `#`.
   * Text and not a node: the field computes the control's left padding from the prefix
   * length, which it cannot do for arbitrary content. Ignored for `range` + `multiline`.
   */
  prefix?: string;
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
  onBlur,
  onKeyDown,
  maxLength,
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
  prefix,
  className,
  labelClassName,
  controlClassName,
}: NativeFieldProps): React.ReactElement {
  // Frame wiring (id scheme, the aria-describedby join, aria-invalid) — the
  // label + hint + error assembly is the shared fieldFrame, composed below.
  const {
    fieldId: inputId,
    hintId,
    errorId,
    describedBy,
    invalid,
  } = useFieldIds({ id, hint, error });
  const stringValue = String(value);

  const shared = {
    id: inputId,
    value: stringValue,
    disabled,
    required,
    "aria-describedby": describedBy,
    "aria-invalid": invalid,
    maxLength,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    onBlur,
    onKeyDown,
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
        // Clears the absolute prefix: Input's own px-3 (0.75rem) + the glyphs + a 0.5rem
        // gap. Inline because the width is a runtime value — a dynamic `pl-[…]` class
        // string is invisible to Tailwind's scanner.
        style={prefix ? { paddingLeft: `calc(1.25rem + ${prefix.length}ch)` } : undefined}
      />
    );
    if (prefix) {
      control = (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
          {control}
        </div>
      );
    }
  }

  return (
    <FieldFrame className={className}>
      <FieldLabel htmlFor={inputId} className={labelClassName} required={required}>
        {label}
      </FieldLabel>
      {control}
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </FieldFrame>
  );
}

NativeField.displayName = "NativeField";
