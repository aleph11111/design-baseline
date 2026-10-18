"use client";
import * as React from "react";

/**
 * True inside a `DialogContent` or `SheetContent`. Dialogs and drawers are not
 * pages: they keep their own `DialogTitle` / `SheetTitle` (ADR-0008), so a
 * `PageFrame` rendered inside one draws no page heading and no second raised
 * surface — derived from where it renders, never a prop.
 */
export const OverlayHostContext = React.createContext(false);
