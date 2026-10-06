"use client";
import * as React from "react";

/**
 * True inside `PageFrame`'s toolbar band. A labeled field (SelectField,
 * NativeField) rendered there draws its label joined to the control's left
 * edge instead of stacked above it, so every element in the band is one box of
 * the control height (STYLE.md "Toolbar field labels"). Derived from where the
 * field renders, never a prop — the same placement rule as `PageFrameContext`
 * (ADR-0008 §1).
 */
export const ToolbarBandContext = React.createContext(false);

/** Whether the calling component renders inside a `PageFrame` toolbar band. */
export function useInToolbarBand(): boolean {
  return React.useContext(ToolbarBandContext);
}
