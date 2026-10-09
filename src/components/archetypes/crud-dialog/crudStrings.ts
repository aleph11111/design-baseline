// Shared strings for the J (crud-dialog) archetype. The baseline ships
// language-neutral English defaults; consumers in another language supply
// their own (see useCrudDialogController's `labels` option and confirmDiscard's
// `message` argument). i18n is the consumer's concern, not the baseline's.

import { labelsEn, useLabels } from "../../../lib/labels";

// English presets only — module constants cannot read the provider. Inside a
// component use `useCrudErrors()` (localized by `BaselineLabelsProvider`).
export const CRUD_ERRORS = {
  load: labelsEn.crudLoadError,
  create: labelsEn.crudCreateError,
  update: labelsEn.crudUpdateError,
  delete: labelsEn.crudDeleteError,
} as const;

/** English preset; pass `useLabels().discardPrompt` to `confirmDiscard` for a localized prompt. */
export const CRUD_DISCARD_PROMPT = labelsEn.discardPrompt;

/** The crud-dialog mutation/load error strings from the active label provider. */
export function useCrudErrors(): { load: string; create: string; update: string; delete: string } {
  const L = useLabels();
  return { load: L.crudLoadError, create: L.crudCreateError, update: L.crudUpdateError, delete: L.crudDeleteError };
}

/**
 * Shared onConfirmDiscard implementation for useCrudDialogMode and
 * useCrudDialogController. window.confirm is the simplest discard guard;
 * production consumers may replace it with a shadcn <AlertDialog> flow.
 * Pass `message` to localize the prompt without redefining the function.
 */
export function confirmDiscard(message: string = CRUD_DISCARD_PROMPT): boolean {
  return window.confirm(message);
}
