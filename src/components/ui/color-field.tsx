import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  FieldError,
  FieldFrame,
  FieldHint,
  FieldLabel,
  useFieldIds,
} from "@/components/archetypes/shared/fieldFrame";

// The shared owner of a **native color input** — the one shadcn gap the fleet
// kept hand-rolling (brickshop ColorPickerField/ColorInput, controlling-app
// chart-colors/assets/tile-config, mistra SettingsPage). shadcn has no color
// primitive, so every project boxed a bare `<input type="color">` with its own
// ad-hoc size/border classes and, in the better cases, a paired hex text field.
// This wraps the native control so it is (a) shared and (b) on-token: the swatch
// carries the standard `border-input`/`bg-background` chrome and the hex echo is
// a real editable `<Input>`, not the read-only span half the fleet settled for.
// The label/hint/error frame is the shared fieldFrame — hint/error slots and the
// `aria-invalid`/`aria-describedby` wiring come from it.
// Plain controlled — no react-hook-form coupling; compose a FormField around it.

const HEX = /^#[0-9a-fA-F]{6}$/;

export interface ColorFieldProps {
  /** Current colour as a `#rrggbb` string (single source of truth for swatch + hex). */
  value: string;
  /** Fires for both the native swatch (always a valid hex) and the hex text field (raw input). */
  onChange: (value: string) => void;
  /** Optional field label rendered above the row, associated with the swatch. */
  label?: string;
  /** Helper text under the row (linked via `aria-describedby`). */
  hint?: string;
  /** Error message; renders below and sets `aria-invalid` + a destructive ring on both inputs. */
  error?: string;
  /** Show a required marker. */
  required?: boolean;
  /** Disable both the swatch and the hex input. */
  disabled?: boolean;
  /** Hide the paired hex text input, leaving only the swatch. */
  hideHex?: boolean;
  /** Id for the swatch input; auto-generated (and linked to the label) when omitted. */
  id?: string;
  /** Applied to the wrapper. */
  className?: string;
}

/**
 * ColorField — swatch + hex text input, two views of one `#rrggbb` string.
 */
export function ColorField({
  value,
  onChange,
  label,
  hint,
  error,
  required,
  disabled,
  hideHex = false,
  id,
  className,
}: ColorFieldProps): React.ReactElement {
  const {
    fieldId: inputId,
    hintId,
    errorId,
    describedBy,
    invalid,
  } = useFieldIds({ id, hint, error });
  // `type=color` warns on anything that isn't `#rrggbb`; fall back to black for
  // display while leaving the real (possibly mid-edit) value in the hex field.
  const swatchValue = HEX.test(value) ? value : "#000000";
  const errorRing = error && "border-destructive focus-visible:ring-destructive";

  return (
    <FieldFrame className={className}>
      {label && (
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
      )}
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="color"
          value={swatchValue}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label ?? "Colour"}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={cn(
            "h-9 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-background p-0.5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            errorRing
          )}
        />
        {!hideHex && (
          <Input
            type="text"
            value={value}
            disabled={disabled}
            maxLength={7}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label ? `${label} hex value` : "Hex colour value"}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={cn("w-28 font-mono", errorRing)}
          />
        )}
      </div>
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </FieldFrame>
  );
}

ColorField.displayName = "ColorField";
