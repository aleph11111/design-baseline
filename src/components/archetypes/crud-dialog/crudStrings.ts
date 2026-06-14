// Shared strings for the J (crud-dialog) archetype. The baseline ships
// language-neutral English defaults; consumers in another language supply
// their own (see useCrudDialogController's `labels` option and confirmDiscard's
// `message` argument). i18n is the consumer's concern, not the baseline's.

export const CRUD_ERRORS = {
  create: "Could not create. Please try again.",
  update: "Could not save. Please try again.",
  delete: "Could not delete. Please try again.",
} as const;

export const CRUD_DISCARD_PROMPT = "Discard changes?";

/**
 * Shared onConfirmDiscard implementation for useCrudDialogMode and
 * useCrudDialogController. window.confirm is the simplest discard guard;
 * production consumers may replace it with a shadcn <AlertDialog> flow.
 * Pass `message` to localize the prompt without redefining the function.
 */
export function confirmDiscard(message: string = CRUD_DISCARD_PROMPT): boolean {
  return window.confirm(message);
}
