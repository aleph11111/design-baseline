"use client";
import * as React from "react";

/**
 * True inside a raised surface (`SurfaceFrame`, `SectionCard`, `StatTileRow`).
 * Un-nested, a raised surface carries a hairline border on the canvas; nested
 * in another it drops both border and fill — no card-in-card (ADR-0015).
 */
export const RaisedSurfaceContext = React.createContext(false);

/**
 * True inside any `PageFrame` body (either body mode). Only the outermost page
 * shell may set the page column's width mode, so a shell already inside a
 * `PageFrame` never emits its width marker (ADR-0007 §1). Lives here, not in
 * `PageFrame`, to avoid a `PageFrame` <-> `surface` import cycle.
 */
export const PageFrameContext = React.createContext(false);

/**
 * The raised-surface chrome (ADR-0015 rules 1–2): hairline `border` and the
 * `surface-raised` fill on the canvas; `undefined` nested in another raised
 * surface (no card-in-card). The radius stays with each caller.
 */
export function useRaisedChrome(): string | undefined {
  return React.useContext(RaisedSurfaceContext) ? undefined : "border bg-surface-raised";
}

/**
 * Marker class on the root of a full-bleed archetype shell (`matrix-grid`,
 * `list-with-detail`, `kanban-board`, `calendar`, `statement-with-filters` — the closed set of ADR-0007
 * §1). `AppShell`'s content column drops its max width when it contains one,
 * so full-bleed is derived from the archetype, never a call-site prop.
 */
export const FULL_BLEED_CLASS = "db-full-bleed";

/**
 * The marker for a full-bleed shell's root: `FULL_BLEED_CLASS` only when the
 * shell is the page's own surface. Nested inside a `PageFrame` or another raised surface (a
 * `DetailOverviewShell` frame, a `SectionCard`, a `SurfaceFrame`) it returns
 * `undefined`, so an embedded list or calendar leaves the page column alone.
 * `AppShell` matches the marker at any depth, so this is the one place the
 * scope is decided.
 */
export function useFullBleedClass(): string | undefined {
  const raised = React.useContext(RaisedSurfaceContext);
  const inFrame = React.useContext(PageFrameContext);
  const nested = raised || inFrame;
  return nested ? undefined : FULL_BLEED_CLASS;
}

/**
 * Marker class on the root of a document-column archetype shell
 * (`transaction-document`). `AppShell`'s content column bounds itself to
 * `--db-document-max` (no wide-desk steps) when it contains one — one width
 * bound, owned by `AppShell` tokens, derived from the archetype (ADR-0015
 * amending ADR-0007 §1).
 */
export const DOCUMENT_COLUMN_CLASS = "db-document-column";

/** `DOCUMENT_COLUMN_CLASS` as the page's own surface; `undefined` when nested
 *  in a `PageFrame` or another raised surface (mirrors `useFullBleedClass`). */
export function useDocumentColumnClass(): string | undefined {
  const raised = React.useContext(RaisedSurfaceContext);
  const inFrame = React.useContext(PageFrameContext);
  const nested = raised || inFrame;
  return nested ? undefined : DOCUMENT_COLUMN_CLASS;
}
