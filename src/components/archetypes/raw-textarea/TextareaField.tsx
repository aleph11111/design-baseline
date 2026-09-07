import * as React from "react";
import { Textarea } from "../../ui/textarea";
import { cn } from "../../../lib/utils";
import {
  FieldError,
  FieldFrame,
  FieldHint,
  FieldLabel,
  useFieldIds,
} from "../shared/fieldFrame";

// The shared owner of a **labeled multi-line text field** — the convergence
// target for a pattern the whole fleet re-hand-composes. Every project pairs a
// `<Label>` (or bare `<label>`) with a textarea and an optional helper/error line
// locally, EVEN where a bare `Textarea` atom already exists (brickshop, hk-crm,
// mistra, pmo, controlling-app), plus two projects with no atom at all bind a raw
// `<textarea>` (dashboard, my-finance-app). None reach for a shared field molecule.
// This is it: Label + Textarea atom + helper/error slot, with two opt-in behaviors
// the fleet also hand-rolls — a `maxLength` char counter with threshold coloring
// (brickshop, 4+ near-identical copies) and a `mono` code/JSON variant
// (controlling-app + mistra). No auto-resize: a fleet-wide search for
// scrollHeight/field-sizing/useAutoResize came back empty, so it isn't built.
// Native-attribute spread means it binds equally to useState and react-hook-form
// (`register()` / a `field` spread) — no form-library coupling.

export interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Field label rendered above the textarea; auto-linked to it via id/htmlFor. */
  label?: React.ReactNode;
  /** Muted helper line below the textarea. Renders alongside `error` — same frame slot as every other field. */
  hint?: React.ReactNode;
  /** Muted helper line below the textarea. Renders alongside `error`. @deprecated use `hint`. */
  helperText?: React.ReactNode;
  /** Error message below the textarea. Wires `aria-invalid`. */
  error?: React.ReactNode;
  /** Show the required marker by the label and set the native `required` attribute. */
  required?: boolean;
  /** Monospace + `spellCheck={false}` — the code / JSON-config variant. */
  mono?: boolean;
  /**
   * Applied to the wrapper `<div>`, not the textarea (this field spreads the
   * native `TextareaHTMLAttributes`, so `className` belongs to the textarea
   * here — the one field where the wrapper key differs from the others').
   */
  wrapperClassName?: string;
  /** Forwards to the `<Textarea>` atom. */
  ref?: React.Ref<HTMLTextAreaElement>;
}

/**
 * TextareaField — Label + Textarea atom + optional helper/error line, with an
 * opt-in char counter and a mono variant. Composes the baseline `Textarea`.
 */
export function TextareaField({
  label,
  hint,
  helperText,
  error,
  required,
  mono = false,
  id,
  value,
  defaultValue,
  maxLength,
  className,
  wrapperClassName,
  onChange,
  "aria-describedby": ariaDescribedBy,
  ref,
  ...props
}: TextareaFieldProps) {
  // `helperText` is the pre-frame alias for `hint`.
  const helper = hint ?? helperText;
  // Frame wiring (id scheme + the aria-describedby join + aria-invalid) shared
  // with NativeField and SelectField; the counter id is this field's own.
  const {
    fieldId,
    hintId,
    errorId,
    describedBy: frameDescribedBy,
    invalid,
  } = useFieldIds({ id, hint: helper, error });
  const countId = `${fieldId}-count`;

  // Track length for the counter without forcing the field to be controlled:
  // derive from `value` when controlled, else from an internal tracker seeded by
  // `defaultValue` and updated on change (harmless when controlled).
  const [uncontrolledLen, setUncontrolledLen] = React.useState(
    () => String(defaultValue ?? "").length
  );
  const length = value != null ? String(value).length : uncontrolledLen;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (value == null) setUncontrolledLen(e.target.value.length);
    onChange?.(e);
  };

  // The counter is DERIVED, not opted into: raw-textarea.md L5 keys it to the
  // field's own data ("When a maximum length is set, the field may show a
  // `used / max` counter"), so `maxLength` is the whole condition. The former
  // `showCount` flag added per-call-site discretion on top of that rule, which
  // ADR-0004's derived-vs-inherited test disqualifies.
  const hasCount = maxLength != null;
  const near = hasCount && length >= maxLength! * 0.9 && length < maxLength!;
  const atLimit = hasCount && length >= maxLength!;

  const describedBy =
    [ariaDescribedBy, frameDescribedBy, hasCount ? countId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <FieldFrame className={wrapperClassName}>
      {label && (
        <FieldLabel htmlFor={fieldId} required={required}>
          {label}
        </FieldLabel>
      )}
      <Textarea
        ref={ref}
        id={fieldId}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        required={required}
        onChange={handleChange}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        spellCheck={mono ? false : undefined}
        className={cn(
          mono && "font-mono text-xs",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      {helper && <FieldHint id={hintId}>{helper}</FieldHint>}
      {error && <FieldError id={errorId}>{error}</FieldError>}
      {hasCount && (
        <p className="text-right text-sm tabular-nums text-muted-foreground">
          <span
            id={countId}
            className={cn(
              atLimit
                ? "text-destructive"
                : near
                  ? "text-amber-600 dark:text-amber-500"
                  : "text-muted-foreground"
            )}
          >
            {length}/{maxLength}
          </span>
        </p>
      )}
    </FieldFrame>
  );
}

TextareaField.displayName = "TextareaField";
