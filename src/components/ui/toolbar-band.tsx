"use client";
import * as React from "react";

/**
 * True inside `PageFrame`'s toolbar band. A labeled field (SelectField,
 * NativeField) rendered there draws its label joined to the control's left
 * edge instead of stacked above it, so every element in the band is one box of
 * the control height (STYLE.md "Toolbar field labels"). Derived from where the
 * field renders, never a prop — the same placement rule as `PageFrameContext`
 * (ADR-0008 §1).
 *
 * Lives in `ui/` because the overlay primitives reset it: React context crosses
 * portals, so a form in a popover, sheet or dialog opened from a toolbar button
 * would otherwise read "in the band" and join its labels.
 */
export const ToolbarBandContext = React.createContext(false);

/** Whether the calling component renders inside a `PageFrame` toolbar band. */
export function useInToolbarBand(): boolean {
  return React.useContext(ToolbarBandContext);
}

/**
 * Ends the toolbar band for everything below it. Every overlay content
 * primitive (popover, dropdown menu, dialog, alert dialog, sheet) wraps its
 * portal in this, so content opened from a toolbar control is a form again.
 */
export function OutsideToolbarBand({ children }: { children: React.ReactNode }): React.ReactElement {
  return <ToolbarBandContext.Provider value={false}>{children}</ToolbarBandContext.Provider>;
}

/**
 * The joined label cell: a shaded caption fused to a control's left edge, so a
 * toolbar filter reads "Scenario | Actuals ▾" as one box of the control's
 * height (STYLE.md "Toolbar field labels"). Shared by SelectTrigger's and
 * SegmentedControl's `label`, and by SelectField / NativeField in a band.
 */
export const JOINED_LABEL_CLASS =
  "flex shrink-0 items-center self-stretch whitespace-nowrap bg-muted px-3 font-normal text-muted-foreground";
