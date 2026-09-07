import * as React from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import {
  FieldError,
  FieldFrame,
  FieldHint,
  FieldLabel,
  useFieldIds,
} from "../archetypes/shared/fieldFrame";

// The shared owner of a **native file input** — the other shadcn gap the fleet
// kept hand-rolling (brickshop photo/invoice/logo pickers, controlling-app
// upload steps, mistra UploadSection, my-finance ReceiptUpload, hk-crm import).
// shadcn has no file primitive, so every project hid a bare `<input type="file">`
// and re-invented the trigger, the `input.value = ""` reset-after-read, the
// selected-file row, and the same `if (size > N)` gate. This wraps the native
// control so it is shared AND on-token: a Button trigger, a dashed dropzone
// that is click-to-pick by default and can opt into native drag-and-drop via
// `onFilesDrop`, an optional selected-file row (name + size + clear), and a
// built-in size gate. Fire-and-forget: file state stays with the caller via
// `onSelect`.

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export interface FileFieldProps {
  /** Fires with the picked files that pass the (optional) size gate. */
  onSelect: (files: File[]) => void;
  /** Native `accept` string, e.g. `"image/*"` or `".csv,.xlsx"`. */
  accept?: string;
  /** Allow selecting more than one file. */
  multiple?: boolean;
  /** Disable the trigger. */
  disabled?: boolean;
  /** Show a spinner and disable the trigger while an upload is in flight. */
  busy?: boolean;
  /** `"button"` (default) or a dashed `"dropzone"` box. */
  variant?: "button" | "dropzone";
  /** Field label rendered above the trigger, associated with it via `aria-labelledby`. */
  label?: string;
  /** Trigger text (button label / dropzone primary line). Defaults to "Choose file…". */
  triggerLabel?: string;
  /** Secondary helper line under the dropzone prompt (e.g. accepted types); linked via `aria-describedby`. */
  hint?: string;
  /** Error message; renders below and marks the trigger invalid with a destructive ring. */
  error?: string;
  /** Show a required marker by the label. */
  required?: boolean;
  /** Reject files larger than this many bytes; rejected files go to `onSizeError`. */
  maxSizeBytes?: number;
  /** Called once per file that exceeds `maxSizeBytes`. */
  onSizeError?: (file: File) => void;
  /** Selected files to display as a name + size + clear row. Caller-owned. */
  selected?: File[] | null;
  /** Called when the clear-X on the selected row is pressed. */
  onClear?: () => void;
  /** Dropzone variant only: enable native drag-and-drop file delivery alongside click-to-pick. */
  onFilesDrop?: (files: File[]) => void;
  /** Applied to the wrapper. */
  className?: string;
}

/**
 * FileField — hidden native file input + a Button or dropzone trigger, with an
 * optional selected-file row and a built-in size gate.
 */
export function FileField({
  onSelect,
  accept,
  multiple,
  disabled,
  busy,
  variant = "button",
  label,
  triggerLabel = "Choose file…",
  hint,
  error,
  required,
  maxSizeBytes,
  onSizeError,
  selected,
  onClear,
  onFilesDrop,
  className,
}: FileFieldProps): React.ReactElement {
  const ref = React.useRef<HTMLInputElement>(null);
  const isDisabled = disabled || busy;
  // Frame wiring — the label associates with the visible trigger (not the
  // hidden input) via aria-labelledby, exactly as Radix Select's trigger does.
  const {
    labelId,
    hintId,
    errorId,
    describedBy,
    invalid,
  } = useFieldIds({ hint, error });
  const triggerAria = {
    "aria-labelledby": labelId,
    "aria-describedby": describedBy,
    "aria-invalid": invalid,
  };
  const errorRing = error && "border-destructive focus-visible:ring-destructive";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    // Reset so re-picking the same file fires onChange again (every fleet impl
    // reimplements this; bake it in once).
    e.target.value = "";
    if (files.length === 0) return;

    let ok = files;
    if (maxSizeBytes != null) {
      ok = [];
      for (const f of files) {
        if (f.size > maxSizeBytes) onSizeError?.(f);
        else ok.push(f);
      }
    }
    if (ok.length > 0) onSelect(ok);
  }

  function open() {
    if (!isDisabled) ref.current?.click();
  }

  const hiddenInput = (
    <input
      ref={ref}
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={isDisabled}
      onChange={handleChange}
      className="hidden"
    />
  );

  const icon = busy ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Upload className="h-4 w-4" />
  );

  return (
    <FieldFrame className={className}>
      {label && (
        <FieldLabel id={labelId} required={required}>
          {label}
        </FieldLabel>
      )}

      {variant === "dropzone" ? (
        <div
          role="button"
          tabIndex={isDisabled ? -1 : 0}
          aria-disabled={isDisabled}
          onClick={open}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              open();
            }
          }}
          onDragOver={onFilesDrop ? (e) => e.preventDefault() : undefined}
          onDrop={
            onFilesDrop
              ? (e) => {
                  e.preventDefault();
                  onFilesDrop(Array.from(e.dataTransfer.files));
                }
              : undefined
          }
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-input p-8 text-center text-sm text-muted-foreground transition-colors",
            "hover:border-ring/50 hover:bg-accent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
            isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            errorRing
          )}
          {...triggerAria}
        >
          {icon}
          <span className="font-medium text-foreground">{triggerLabel}</span>
          {/* The dropzone shows its hint inside the box — that node carries the
              frame's hint id, so aria-describedby still lands on it. */}
          {hint && <span id={hintId} className="text-xs">{hint}</span>}
          {hiddenInput}
        </div>
      ) : (
        <div>
          <Button
            type="button"
            variant="outline"
            disabled={isDisabled}
            onClick={open}
            className={cn("gap-2", errorRing)}
            {...triggerAria}
          >
            {icon}
            {triggerLabel}
          </Button>
          {hiddenInput}
        </div>
      )}

      {selected && selected.length > 0 && (
        <ul className="flex flex-col gap-1">
          {selected.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 tabular-nums text-xs">
                {formatSize(file.size)}
              </span>
              {onClear && (
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={onClear}
                  className="ml-auto rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {variant === "button" && hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </FieldFrame>
  );
}

FileField.displayName = "FileField";
