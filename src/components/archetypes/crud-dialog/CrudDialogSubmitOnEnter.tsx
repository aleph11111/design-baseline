"use client";
import * as React from "react";
import { Button } from "../../ui/button";

/**
 * CrudDialogSubmitOnEnter — the hidden submit control a J dialog's `<form>`
 * needs because its footer sits outside it.
 *
 * `CrudDialogFooter` is a sibling of `CrudDialogBody` (Layer 14), so its
 * primary button is not inside the body's `<form>` and pressing Enter in a
 * field would submit nothing. Render this once inside the `<form>` whose
 * `onSubmit` runs the same handler as the footer's primary
 * (`controller.handlePrimary`), and Enter submits again.
 *
 * Visually hidden (`sr-only`, not `display:none`, which some engines skip for
 * implicit submission), out of the tab order, and hidden from assistive tech —
 * the footer's primary is the one real control.
 */
export function CrudDialogSubmitOnEnter(): React.ReactElement {
  return <Button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true" />;
}

CrudDialogSubmitOnEnter.displayName = "CrudDialogSubmitOnEnter";
