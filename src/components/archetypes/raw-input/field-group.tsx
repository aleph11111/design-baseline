"use client";
import * as React from "react";
import { cn } from "../../../lib/utils";
import { FieldError, FieldHint, RequiredMarker, useFieldIds } from "../shared/fieldFrame";

// The **group caption** of the labeled-field family. A caption that names
// several controls (a checkbox list, a radio set, a row of toggles, a repeating
// line-item editor) is a group legend, not a `<label>`: a label names exactly
// one control, and a `<label>` with no control is announced as nothing at all.
// The fleet's `raw-input-label-missing-htmlfor` scan signal finds exactly that
// shape — a bare `<Label>Topics</Label>` above a list of checkboxes. This is the
// native fix: `<fieldset>` + `<legend>` give the group role and its accessible
// name with zero ARIA, and `<fieldset disabled>` disables every child natively.

export interface FieldGroupProps
  extends Omit<React.ComponentPropsWithoutRef<"fieldset">, "children"> {
  /** The group caption, rendered as the `<legend>` in the field-label type style — it is the group's accessible name. */
  label: React.ReactNode;
  /** Muted hint under the group; linked to the fieldset via `aria-describedby`. */
  hint?: React.ReactNode;
  /** Error under the group; linked via `aria-describedby`. The group never decides validity — the caller passes it. */
  error?: React.ReactNode;
  /** Renders the visual required marker on the legend. Groups have no native required state — each control keeps its own. */
  required?: boolean;
  /** The grouped controls, each still labelling itself (a checkbox's own label, a radio item's own label). */
  children: React.ReactNode;
}

/**
 * A labeled group of controls: `<fieldset class="flex min-w-0 flex-col gap-1.5">`
 * with a `<legend>` in the `Label` type style (`text-sm font-medium leading-none`,
 * `mb-1.5` because a legend sits outside the flex gap), then the controls, then
 * the shared hint/error lines. Use for any caption naming more than one control.
 */
export function FieldGroup({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
  ...props
}: FieldGroupProps): React.ReactElement {
  const { fieldId, hintId, errorId, describedBy } = useFieldIds({ id, hint, error });
  return (
    <fieldset
      id={fieldId}
      aria-describedby={describedBy}
      className={cn("flex min-w-0 flex-col gap-1.5", className)}
      {...props}
    >
      <legend className="mb-1.5 text-sm font-medium leading-none">
        {label}
        {required && <RequiredMarker />}
      </legend>
      {children}
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </fieldset>
  );
}

FieldGroup.displayName = "FieldGroup";
