"use client";
export { CrudDialogSheet } from "./CrudDialogSheet";
export type { CrudDialogSheetProps } from "./CrudDialogSheet";

export { CrudDialogHeader } from "./CrudDialogHeader";
export type { CrudDialogHeaderProps } from "./CrudDialogHeader";

export { CrudDialogBody } from "./CrudDialogBody";
export type { CrudDialogBodyProps } from "./CrudDialogBody";

export { CrudDialogFooter } from "./CrudDialogFooter";
export type { CrudDialogFooterProps } from "./CrudDialogFooter";

export { useCrudDialogMode } from "./useCrudDialogMode";
export type {
  CrudDialogMode,
  UseCrudDialogModeOptions,
  UseCrudDialogModeResult,
} from "./useCrudDialogMode";

export {
  useCrudDialogController,
  DEFAULT_CRUD_DIALOG_LABELS,
} from "./useCrudDialogController";
export type {
  CrudDialogLabels,
  CrudDialogMutation,
  UseCrudDialogControllerOptions,
  UseCrudDialogControllerResult,
} from "./useCrudDialogController";

export { CRUD_ERRORS, CRUD_DISCARD_PROMPT, confirmDiscard } from "./crudStrings";
