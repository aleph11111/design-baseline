/**
 * Derive an English present-continuous submitting label from an action label:
 * strip a trailing "e" and append "ing…" ("Save" → "Saving…", "Create" →
 * "Creating…"). This derivation only works for English; non-English callers
 * MUST supply an explicit label instead (e.g. via `CrudDialogLabels.saving` /
 * `.creating` or a footer's `submittingLabel` prop) to avoid mangled output
 * ("Speichern" → "Speicherning…").
 *
 * This is the single home for the derivation — the footers and the crud-dialog
 * controller all route through here rather than re-inlining the regex.
 */
export function deriveSubmittingLabel(label: string): string {
  return `${label.replace(/e$/, "")}ing…`;
}

/**
 * Resolve the label a primary button shows while a mutation is in-flight: an
 * explicit `submittingLabel` override (i18n-safe) wins, otherwise derive from
 * `primaryLabel` via {@link deriveSubmittingLabel}. Falls back to "Saving…"
 * when no primary label is known.
 */
export function resolveSubmittingLabel(
  primaryLabel: string | undefined,
  submittingLabel: string | undefined,
): string {
  return (
    submittingLabel ??
    (primaryLabel ? deriveSubmittingLabel(primaryLabel) : "Saving…")
  );
}
