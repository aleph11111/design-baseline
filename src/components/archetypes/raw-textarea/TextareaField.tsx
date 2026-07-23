import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  /** Muted helper line below the textarea. Suppressed while `error` is set. */
  helperText?: React.ReactNode;
  /** Error message below the textarea. Overrides `helperText` and wires `aria-invalid`. */
  error?: React.ReactNode;
  /** Monospace + `spellCheck={false}` — the code / JSON-config variant. */
  mono?: boolean;
  /** Show a `{len}/{maxLength}` counter (requires `maxLength`); colors muted → amber → destructive. */
  showCount?: boolean;
  /** Applied to the wrapper `<div>`, not the textarea (use `className` for that). */
  wrapperClassName?: string;
}

/**
 * TextareaField — Label + Textarea atom + optional helper/error line, with an
 * opt-in char counter and a mono variant. Composes the baseline `Textarea`.
 */
export const TextareaField = React.forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(function TextareaField(
  {
    label,
    helperText,
    error,
    mono = false,
    showCount = false,
    id,
    value,
    defaultValue,
    maxLength,
    className,
    wrapperClassName,
    onChange,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref
) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const helpId = `${fieldId}-help`;
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

  const hasCount = showCount && maxLength != null;
  const near = hasCount && length >= maxLength! * 0.9 && length < maxLength!;
  const atLimit = hasCount && length >= maxLength!;

  const describedBy =
    [ariaDescribedBy, error || helperText ? helpId : null, hasCount ? countId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label && <Label htmlFor={fieldId}>{label}</Label>}
      <Textarea
        ref={ref}
        id={fieldId}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={handleChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        spellCheck={mono ? false : undefined}
        className={cn(
          mono && "font-mono text-xs",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      {(error || helperText || hasCount) && (
        <div className="flex items-start justify-between gap-2 text-xs">
          <span
            id={error || helperText ? helpId : undefined}
            className={cn(error ? "text-destructive" : "text-muted-foreground")}
          >
            {error || helperText}
          </span>
          {hasCount && (
            <span
              id={countId}
              className={cn(
                "shrink-0 tabular-nums",
                atLimit
                  ? "text-destructive"
                  : near
                    ? "text-amber-600 dark:text-amber-500"
                    : "text-muted-foreground"
              )}
            >
              {length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

TextareaField.displayName = "TextareaField";
