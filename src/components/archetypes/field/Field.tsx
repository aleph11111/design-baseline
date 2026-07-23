import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Props the render-prop hands to the control. Spread them onto the input:
 *  `{(props) => <Input {...props} … />}`. `id` wires the label; the aria
 *  attributes wire the description and error for screen readers. */
export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

export interface FieldProps {
  /** The field label. Rendered in the shared `Label` atom, wired to the control via `htmlFor`. */
  label: React.ReactNode;
  /** Optional helper text below the label, before the control's error. */
  description?: React.ReactNode;
  /** Error message. When set, the control is marked `aria-invalid` and the label + message turn destructive. */
  error?: React.ReactNode;
  /** Show a muted required marker after the label text. */
  required?: boolean;
  /** `"stacked"` (default) = label above control; `"inline"` = label beside control (filters/toolbars). */
  orientation?: "stacked" | "inline";
  /** Extra classes on the wrapper. */
  className?: string;
  /** Extra classes on the label. */
  labelClassName?: string;
  /** Render the control, spreading the passed props onto it for automatic id + aria wiring. */
  children: (props: FieldControlProps) => React.ReactNode;
}

/**
 * Field — a labeled form control with automatic id + aria wiring, for standalone
 * (non-react-hook-form) use: dialogs, filters, settings rows, ad-hoc forms.
 *
 * It is the RHF-free twin of `ui/form.tsx`'s `FormItem`/`FormLabel`/`FormControl`/
 * `FormDescription`/`FormMessage` stack: identical spacing and text tokens, so a
 * standalone field and an RHF form-page field render identically — but it needs no
 * `<FormField>`/`useFormContext` (which those primitives require). Reach for the RHF
 * stack inside an RHF form; reach for `Field` everywhere else, instead of hand-rolling
 * a raw `<label>` + control (the fleet's most common un-wired, un-tokenized field).
 */
export function Field({
  label,
  description,
  error,
  required = false,
  orientation = "stacked",
  className,
  labelClassName,
  children,
}: FieldProps): React.ReactElement {
  const id = React.useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  const controlProps: FieldControlProps = {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
  };

  return (
    <div
      className={cn(
        orientation === "inline"
          ? "flex items-center gap-2"
          : "space-y-1.5",
        className,
      )}
    >
      <Label
        htmlFor={id}
        className={cn(error && "text-destructive", labelClassName)}
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-muted-foreground">
            *
          </span>
        )}
      </Label>
      {children(controlProps)}
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
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

Field.displayName = "Field";
