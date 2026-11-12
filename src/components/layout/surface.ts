"use client";
import * as React from "react";

/**
 * True inside a raised surface (`SurfaceFrame`, `SectionCard`, `StatTileRow`).
 * Un-nested, a raised surface carries a hairline border on the canvas; nested
 * in another it drops both border and fill — no card-in-card (ADR-0015).
 */
export const RaisedSurfaceContext = React.createContext(false);

/**
 * Marker class on the root of a full-bleed archetype shell (`matrix-grid`,
 * `list-with-detail`, `kanban-board`, `calendar`, `statement-with-filters` — the closed set of ADR-0007
 * §1). `AppShell`'s content column drops its max width when it contains one,
 * so full-bleed is derived from the archetype, never a call-site prop.
 */
export const FULL_BLEED_CLASS = "db-full-bleed";

/**
 * The marker for a full-bleed shell's root: `FULL_BLEED_CLASS` only when the
 * shell is the page's own surface. Nested inside another raised surface (a
 * `DetailOverviewShell` frame, a `SectionCard`, a `SurfaceFrame`) it returns
 * `undefined`, so an embedded list or calendar leaves the page column alone.
 * `AppShell` matches the marker at any depth, so this is the one place the
 * scope is decided.
 */
export function useFullBleedClass(): string | undefined {
  return React.useContext(RaisedSurfaceContext) ? undefined : FULL_BLEED_CLASS;
}
