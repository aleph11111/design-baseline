import * as React from "react";
import { Label } from "../../ui/label";
import { cn } from "../../../lib/utils";

// The **shared labeled-field frame** — the one owner of the label + hint + error
// assembly every labeled field in the baseline composes (NativeField (I),
// SelectField (S), TextareaField (T), ColorField, FileField). Before this the
// frame was hand-rolled five times, and the copies had diverged on exactly the
// pieces that must not differ: the id scheme (`-hint`/`-error` vs `-help`), the
// `aria-describedby` join, the hint/error type scale (`text-sm` vs `text-xs`),
// their coexistence, and the required marker. The frame owns all of it once;
// the field components own only their control-specific body.
//
// Control-agnostic by design: it renders no control — the caller places its own
// control between `<FieldLabel>` and the hint/error pair inside the wrapper.
// Native controls associate via `htmlFor`; a button-based control (Radix
// Select's trigger) associates via `aria-labelledby={labelId}` — the id for both
// comes from `useFieldIds()`, so the scheme and the `aria-describedby` join
// exist in exactly one place.

/**
 * The id + a11y wiring of a labeled field, computed once:
 * `fieldId` for the control, `labelId` for the `Label` (used by
 * `aria-labelledby` controls), and the `${id}-hint` / `${id}-error` description
 * ids with their `aria-describedby` join and `aria-invalid` derivation.
 * Omit `id` to auto-generate; the ids then carry the hook's internal `id`
 * prefix, so every derived id stays unique.
 */
export function useFieldIds(opts: {
  id?: string;
  hint?: string | React.ReactNode;
  error?: string | React.ReactNode;
}): {
  fieldId: string;
  labelId: string;
  hintId?: string;
  errorId?: string;
  describedBy?: string;
  invalid?: true;
} {
  const autoId = React.useId();
  const fieldId = opts.id ?? autoId;
  const labelId = `${fieldId}-label`;
  const hintId = opts.hint ? `${fieldId}-hint` : undefined;
  const errorId = opts.error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return {
    fieldId,
    labelId,
    hintId,
    errorId,
    describedBy,
    invalid: opts.error ? true : undefined,
  };
}

export interface FieldFrameProps {
  /** Applied to the wrapper `<div>`. */
  className?: string;
  children: React.ReactNode;
}

/**
 * The field wrapper: `flex flex-col gap-1.5`. The single owner of that wrapper
 * class for every labeled field in the baseline.
 */
export function FieldFrame({ className, children }: FieldFrameProps): React.ReactElement {
  return <div className={cn("flex flex-col gap-1.5", className)}>{children}</div>;
}

export interface FieldLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
  /** Renders the required marker after the caption. */
  required?: boolean;
}

/**
 * The field caption + required marker. The marker span lives here — exactly once
 * in `src/components` — so every field gets the same `*` affordance for free.
 * `htmlFor` associates a native control; a button-based control (Radix Select's
 * trigger) takes no `htmlFor` but keeps the `id` (its trigger carries
 * `aria-labelledby` pointing at it).
 */
export function FieldLabel({
  required,
  children,
  ...props
}: FieldLabelProps): React.ReactElement {
  return (
    <Label {...props}>
      {children}
      {required && (
        <span className="ml-0.5 text-destructive" aria-hidden="true">
          *
        </span>
      )}
    </Label>
  );
}

export interface FieldHintProps {
  /** The hint's id (from `useFieldIds.hintId`) — the field links it via `aria-describedby`. */
  id?: string;
  children: React.ReactNode;
}

/** Muted hint line under the control: `text-sm text-muted-foreground`. */
export function FieldHint({ id, children }: FieldHintProps): React.ReactElement {
  return (
    <p id={id} className="text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export interface FieldErrorProps {
  /** The error's id (from `useFieldIds.errorId`) — the field links it via `aria-describedby`. */
  id?: string;
  children: React.ReactNode;
}

/** Destructive error line under the control: `text-sm font-medium text-destructive`. */
export function FieldError({ id, children }: FieldErrorProps): React.ReactElement {
  return (
    <p id={id} className="text-sm font-medium text-destructive">
      {children}
    </p>
  );
}
