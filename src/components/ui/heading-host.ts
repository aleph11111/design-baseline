"use client";
import * as React from "react";

/**
 * True where a host already titles the region: inside a `DialogContent` or
 * `SheetContent` (their `DialogTitle` / `SheetTitle`) and inside a titled
 * `SectionCard` (its `SectionHeading`). A `PageFrame` rendered there draws no
 * heading of its own and no second raised surface (ADR-0008 heading ladder) —
 * derived from where it renders, never a prop.
 */
export const HeadingHostContext = React.createContext(false);
