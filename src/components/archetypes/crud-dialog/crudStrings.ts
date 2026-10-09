// Shared strings for the J (crud-dialog) archetype. The baseline ships
// language-neutral English defaults; consumers in another language supply
// their own (see useCrudDialogController's `labels` option and confirmDiscard's
// `message` argument). i18n is the consumer's concern, not the baseline's.

import { labelsEn } from "../../../lib/labels";

// English defaults, re-exported from the shared label module; a mounted
// `BaselineLabelsProvider` supplies the localized equivalents.
export const CRUD_ERRORS = {
  load: labelsEn.crudLoadError,
  create: labelsEn.crudCreateError,
  update: labelsEn.crudUpdateError,
  delete: labelsEn.crudDeleteError,
} as const;

export const CRUD_DISCARD_PROMPT = labelsEn.discardPrompt;

/**
 * Shared onConfirmDiscard implementation for useCrudDialogMode and
 * useCrudDialogController. window.confirm is the simplest discard guard;
 * production consumers may replace it with a shadcn <AlertDialog> flow.
 * Pass `message` to localize the prompt without redefining the function.
 */
export function confirmDiscard(message: string = CRUD_DISCARD_PROMPT): boolean {
  return window.confirm(message);
}
