// Shared strings for the J (crud-dialog) archetype. Module constants and
// `confirmDiscard` are English presets; inside a component the localized
// equivalents come from `BaselineLabelsProvider` (`useCrudErrors`,
// `useConfirmDiscard`, and the controller's `labels` option).

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
 * Provider-aware `confirmDiscard`: the default prompt is the active
 * `BaselineLabelsProvider`'s `discardPrompt`. Use it as `onConfirmDiscard`.
 */
export function useConfirmDiscard(): (message?: string) => boolean {
  const { discardPrompt } = useLabels();
  return (message = discardPrompt) => window.confirm(message);
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
