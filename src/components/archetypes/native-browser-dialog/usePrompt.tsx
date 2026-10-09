"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { useLabels } from "../../../lib/labels";

export interface PromptOptions {
  /** Dialog headline — what is being asked for ("Rename recipe"). */
  title: string;
  /** Optional helper line under the title. */
  description?: string;
  /** Visible field label; when omitted the title doubles as the field's accessible name. */
  label?: string;
  /** Pre-filled value (the current name in a rename flow). */
  defaultValue?: string;
  /** Field placeholder. */
  placeholder?: string;
  /** Submit-button label; defaults to the active labels' `save`. */
  confirmText?: string;
  /** Cancel-button label; defaults to the active labels' `cancel`. */
  cancelText?: string;
  /** When true (default), a blank / whitespace-only value disables submit. */
  required?: boolean;
}

export interface UsePrompt {
  /** Opens the dialog; resolves the trimmed value on submit, `null` on cancel / Escape / overlay dismiss. */
  askPrompt: (options: PromptOptions) => Promise<string | null>;
  /** The dialog element — render it once in the owning component's JSX. */
  dialog: React.ReactNode;
}

/**
 * Promise-based replacement for `window.prompt`: a one-field Dialog wrapping a
 * real `<form>` (Enter submits, the field autofocuses). A native
 * `window.prompt` rename becomes:
 *
 *   const { askPrompt, dialog } = usePrompt();
 *   const name = await askPrompt({ title: "Rename", defaultValue: current });
 *   // …and render {dialog}
 *
 * A second `askPrompt` while one is open resolves the earlier one `null`.
 * More than one field is a create/edit dialog (crud-dialog), not a prompt.
 */
export function usePrompt(): UsePrompt {
  const L = useLabels();
  const [options, setOptions] = React.useState<PromptOptions | null>(null);
  const [value, setValue] = React.useState("");
  const resolver = React.useRef<((v: string | null) => void) | null>(null);
  const fieldId = React.useId();

  const settle = React.useCallback((v: string | null) => {
    resolver.current?.(v);
    resolver.current = null;
    setOptions(null);
  }, []);

  const askPrompt = React.useCallback((next: PromptOptions) => {
    resolver.current?.(null);
    return new Promise<string | null>((resolve) => {
      resolver.current = resolve;
      setValue(next.defaultValue ?? "");
      setOptions(next);
    });
  }, []);

  React.useEffect(() => () => resolver.current?.(null), []);

  const trimmed = value.trim();
  const blocked = (options?.required ?? true) && trimmed === "";

  const dialog = (
    <Dialog open={options !== null} onOpenChange={(open) => { if (!open) settle(null); }}>
      <DialogContent>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!blocked) settle(trimmed);
          }}
        >
          <DialogHeader>
            <DialogTitle>{options?.title}</DialogTitle>
            {options?.description ? <DialogDescription>{options.description}</DialogDescription> : null}
          </DialogHeader>
          <div className="grid gap-1.5">
            {options?.label ? <Label htmlFor={fieldId}>{options.label}</Label> : null}
            <Input
              id={fieldId}
              autoFocus
              aria-label={options?.label ? undefined : options?.title}
              value={value}
              placeholder={options?.placeholder}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => settle(null)}>
              {options?.cancelText ?? L.cancel}
            </Button>
            <Button type="submit" disabled={blocked}>
              {options?.confirmText ?? L.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return { askPrompt, dialog };
}
