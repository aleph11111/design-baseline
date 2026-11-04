"use client";
import * as React from "react";
import { Check, Pencil } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useLabels } from "../../../lib/labels";

export type DashboardTitleEditorProps = {
  /** The dashboard's current name. */
  value: string;
  /**
   * Save a new name. Called only with a trimmed, non-empty, changed value. A
   * rejected promise keeps the editor open so the user can retry (the consumer
   * surfaces the error).
   */
  onRename: (next: string) => void | Promise<void>;
  /** Shown when `value` is empty. */
  placeholder?: string;
};

/**
 * DashboardTitleEditor — the inline rename of an analytics-dashboard in edit
 * mode (ADR-0011), passed as the shell's `title`, so the name stays the page's
 * one `<h1>`. A rename button swaps the name for an input at the title's own
 * size: Enter or the check button saves, Escape cancels, blurring saves.
 */
export function DashboardTitleEditor({
  value,
  onRename,
  placeholder,
}: DashboardTitleEditorProps): React.ReactElement {
  const t = useLabels();
  const [draft, setDraft] = React.useState<string | null>(null);
  // Enter then blur (or a double Enter) must not send the rename twice, and a
  // blur fired while Escape unmounts the input must not save the abandoned draft.
  const busy = React.useRef(false);

  const cancel = () => {
    busy.current = true;
    setDraft(null);
  };
  const save = async () => {
    if (draft === null || busy.current) return;
    const next = draft.trim();
    if (!next || next === value) return cancel();
    busy.current = true;
    try {
      await onRename(next);
      setDraft(null);
    } catch {
      busy.current = false; // keep editing; the consumer shows the error
    }
  };

  if (draft === null) {
    return (
      <span className="inline-flex items-center gap-2">
        {value || placeholder}
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t.rename} onClick={() => {
            busy.current = false;
            setDraft(value);
          }}>
          <Pencil />
        </Button>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <Input
        aria-label={t.rename}
        value={draft}
        placeholder={placeholder}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") void save();
          if (e.key === "Escape") cancel();
        }}
        className="h-auto py-0 text-[length:inherit] font-[inherit] tracking-[inherit] md:text-[length:inherit]"
      />
      <Button type="button" variant="ghost" size="icon-sm" aria-label={t.save} onMouseDown={(e) => e.preventDefault()} onClick={save}>
        <Check />
      </Button>
    </span>
  );
}

DashboardTitleEditor.displayName = "DashboardTitleEditor";
