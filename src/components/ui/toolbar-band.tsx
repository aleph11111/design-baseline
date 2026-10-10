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
  return (
    <ToolbarBandContext.Provider value={false}>
      <ToolbarSizeContext.Provider value={undefined}>{children}</ToolbarSizeContext.Provider>
    </ToolbarBandContext.Provider>
  );
}

/**
 * The control-ladder step a band imposes on controls that don't pick one.
 * `PageFrame`'s mobile filter sheet sets `"lg"` (the 44pt touch target, 16px
 * text so iOS does not zoom); unset everywhere else, so controls keep their own
 * default. Read (via `useControlSize`) by every ladder control; an explicit
 * `size` always wins.
 */
export const ToolbarSizeContext = React.createContext<"lg" | undefined>(undefined);

/**
 * App-level touch density (`AppShell density="touch"`): every control that
 * doesn't pick a step resolves to `lg`. Unlike `ToolbarSizeContext` it is NOT
 * reset by overlays — dialogs, sheets and popovers in a touch app stay 44pt.
 */
const ControlDensityContext = React.createContext<"lg" | undefined>(undefined);

/** Sets the app's control density. `"touch"` resolves the default step to `lg`; `"default"` is a no-op. */
export function ControlDensityProvider({
  density = "default",
  children,
}: {
  density?: "default" | "touch";
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <ControlDensityContext.Provider value={density === "touch" ? "lg" : undefined}>
      {children}
    </ControlDensityContext.Provider>
  );
}

/** App density alone (no band step) — for primitives that predate the band context and must not resize in the filter sheet. */
export function useAppDensity(): "lg" | undefined {
  return React.useContext(ControlDensityContext);
}

/**
 * The step a control takes when it has no explicit `size`: the band's step,
 * else the app density's, else `undefined` (the control's own default).
 */
export function useControlSize(): "lg" | undefined {
  const band = React.useContext(ToolbarSizeContext);
  const app = React.useContext(ControlDensityContext);
  return band ?? app;
}

/**
 * The joined label cell: a shaded caption fused to a control's left edge, so a
 * toolbar filter reads "Scenario | Actuals ▾" as one box of the control's
 * height (STYLE.md "Toolbar field labels"). Shared by SelectTrigger's and
 * SegmentedControl's `label`, and by SelectField / NativeField in a band.
 *
 * The label's floor is its own text up to `max-w-32` (8rem, padding included): `overflow-clip`
 * (not `hidden`) keeps the automatic minimum size, so a short label never shrinks and a long
 * one ellipsizes (via `JoinedLabelText`) only at the cap. Past that the band scrolls. A control with a
 * label lays out as a grid whose label column is `auto` and whose value columns are never narrower than their content, so the
 * control's own minimum width is label floor + full value: it stops shrinking
 * there and the band scrolls instead of clipping the value. (`shrink` here only
 * serves custom flex consumers; it is not the mechanism for the built-ins.)
 */
export const JOINED_LABEL_CLASS =
  "flex max-w-32 shrink items-center overflow-clip self-stretch whitespace-nowrap bg-muted px-3 font-normal text-muted-foreground";

/** The label's text, ellipsized — `text-overflow` is inert on the label's own flex container. */
export function JoinedLabelText({ children }: { children: React.ReactNode }): React.ReactElement {
  return <span className="truncate">{children}</span>;
}

/**
 * True when a class string carries an explicit, unprefixed width utility (`w-28`, `w-40`,
 * `size-…`; `w-auto|fit|full|min|max` and breakpoint-prefixed widths do not count). Such a width sets the WHOLE joined box (label +
 * control): inside it the label shrinks first, then the value truncates, and nothing
 * overflows the box. Without one the box is content-sized, floored at label floor + full
 * value (STYLE.md "Toolbar field labels").
 */
export function hasWidthClass(className?: string): boolean {
  // unprefixed only (`md:w-40` sets no width below md); `w-auto|fit|full|min|max` are not a fixed box
  return className != null && /(^|\s)(?:w|size)-(?!(?:auto|fit|full|min|max)(?:\s|$))\S+/.test(className);
}

/**
 * Label class inside a FIXED-width joined box (a width class on the control): the box is a
 * plain flex row, the label keeps its content width, gives way first (weight 1000, down to
 * its text floor, capped at 8rem, or 60% of the box when that is narrower, but never below ~4ch of text), and any surplus width goes to the value, never to the label.
 */
export const FIXED_BOX_LABEL_CLASS = "max-w-[max(min(8rem,60%),calc(4ch+1.5rem))] shrink-[1000]";
