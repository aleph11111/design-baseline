"use client";
import * as React from "react";
import { Checkbox } from "./checkbox";
import { cn } from "../../lib/utils";
import {
  FieldError,
  FieldFrame,
  FieldHint,
  FieldLabel,
  useFieldIds,
} from "../archetypes/shared/fieldFrame";

// The shared owner of a **multi-pick list** — a labelled column of checkbox rows
// bound to one `string[]`. shadcn has no such primitive, so consumers hand-rolled
// a bordered list with an arbitrary rem-step height cap (controlling-app
// consolidation "Mitglieder"): a second scroll container nested in the
// dialog body that already owns scrolling, cutting the list at 7 rows while the
// sheet had room. The default here is therefore UNCAPPED — the host scrolls. The
// one opt-in cap (`scroll`) is a single fixed height owned by this component
// (ADR-0004: appearance is fixed in the component, never a per-call-site class),
// for inline use on a page with no scrolling host.
// Plain controlled; label/hint/error come from the shared fieldFrame.

/** Height of the opt-in scroll region — the one cap, fixed here (~7 rows). */
const SCROLL_CAP = "max-h-64 overflow-y-auto";

export interface CheckboxListOption {
  /** Emitted in `value` when the row is ticked. */
  value: string;
  label: string;
  /** Trailing content in the row (a count, a status chip). */
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface CheckboxListFieldProps {
  options: CheckboxListOption[];
  /** The ticked option values. */
  value: string[];
  /** Fires with the updated selection, kept in `options` order. */
  onChange: (value: string[]) => void;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Disable every row. */
  disabled?: boolean;
  /**
   * Cap the list at one fixed height and scroll inside it. Leave off inside a
   * `CrudDialogBody` (or any scrolling host): the list then grows with the host.
   */
  scroll?: boolean;
  /** Id of the group; auto-generated when omitted. */
  id?: string;
  /** Applied to the wrapper. */
  className?: string;
}

/**
 * CheckboxListField — a labelled list of checkbox rows bound to a `string[]`.
 */
export function CheckboxListField({
  options,
  value,
  onChange,
  label,
  hint,
  error,
  required,
  disabled,
  scroll = false,
  id,
  className,
}: CheckboxListFieldProps): React.ReactElement {
  const { fieldId, labelId, hintId, errorId, describedBy, invalid } = useFieldIds({
    id,
    hint,
    error,
  });

  const toggle = (optionValue: string, checked: boolean) => {
    const next = new Set(value);
    if (checked) next.add(optionValue);
    else next.delete(optionValue);
    // Known values keep `options` order; values with no matching option (archived,
    // paged-out) are carried through untouched rather than dropped.
    const known = new Set(options.map((o) => o.value));
    onChange([
      ...options.filter((o) => next.has(o.value)).map((o) => o.value),
      ...value.filter((v) => !known.has(v)),
    ]);
  };

  return (
    <FieldFrame className={className}>
      {label && (
        <FieldLabel id={labelId} required={required}>
          {label}
        </FieldLabel>
      )}
      <div
        id={fieldId}
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        className={cn(
          "divide-y rounded-md border border-input bg-background",
          scroll && SCROLL_CAP,
          error && "border-destructive"
        )}
      >
        {options.map((o) => {
          const rowId = `${fieldId}-${o.value}`;
          return (
            <div key={o.value} className="flex items-center gap-3 px-3 py-2">
              <Checkbox
                id={rowId}
                checked={value.includes(o.value)}
                disabled={disabled || o.disabled}
                onCheckedChange={(c) => toggle(o.value, c === true)}
              />
              <label
                htmlFor={rowId}
                className="min-w-0 flex-1 cursor-pointer truncate text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {o.label}
              </label>
              {o.badge != null && <span className="shrink-0">{o.badge}</span>}
            </div>
          );
        })}
      </div>
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </FieldFrame>
  );
}

CheckboxListField.displayName = "CheckboxListField";
