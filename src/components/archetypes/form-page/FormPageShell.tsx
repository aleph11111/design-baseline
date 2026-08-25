import * as React from "react";
import { SurfaceFrame } from "@/components/layout/SurfaceFrame";
import type { SurfaceHeaderSlotProps } from "@/components/layout/SurfaceHeaderSlot";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Width variant map
// ---------------------------------------------------------------------------

const WIDTH_MAP: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: "max-w-md",   // ~28rem — narrow forms (3–4 fields)
  md: "max-w-xl",   // ~36rem — default; standard entity forms
  lg: "max-w-2xl",  // ~42rem — wider single-column or 2-col grid forms
  xl: "max-w-4xl",  // ~56rem — wide multi-column layouts
};

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type FormPageShellProps = {
  children: React.ReactNode;
  /**
   * Max-width preset for the form container. Derived per the contract's width
   * keying rule (docs/archetypes/form-page.md, Layer 2) from the form's field
   * count / column layout — not a free choice:
   *   "sm" — narrow single-column form (~3–4 fields)
   *   "md" — default; standard single-column entity form
   *   "lg" — wider single-column form or a 2-column field-grid body
   *   "xl" — wide multi-column layout (3+ column grid / multiple 2-column sections)
   * Defaults to "md" (~36rem / max-w-xl).
   */
  width?: "sm" | "md" | "lg" | "xl";
} & SurfaceHeaderSlotProps;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * FormPageShell — the outermost container for every B (form-page) archetype
 * instance.
 *
 * Provides:
 *   - Single-column max-width (configurable via `width` prop)
 *   - Vertical spacing between header / form body / actions: space-y-5
 *
 * Does NOT add page inset (px-6/py-6) — `<AppShell>`'s `<main>` owns that. Adding
 * it here would double-inset. See docs/STYLE.md "Spacing & rhythm".
 *
 * Board form (Plex Ledger): pass `title` (and optionally `kicker` /
 * `headerActions`) to render the on-surface header at the top of a bounded
 * card. The form groups / SectionCards render below inside the same surface,
 * and the primary save/cancel actions remain in <FormPageActions> at the
 * footer. Without `title` the shell reverts to the classic free-floating
 * column layout (unchanged behaviour).
 *
 * Classic layout children:
 *   <FormPageHeader … />
 *   <form className="space-y-4" onSubmit={…}>
 *     …fields…
 *     <FormPageActions … />
 *   </form>
 *
 * Board form children (no FormPageHeader needed):
 *   <form className="space-y-4" onSubmit={…}>
 *     …fields…
 *     <FormPageActions … />
 *   </form>
 */
export function FormPageShell({
  children,
  width = "md",
  kicker,
  title,
  headerActions,
}: FormPageShellProps): React.ReactElement {
  if (title !== undefined) {
    return (
      <SurfaceFrame
        kicker={kicker}
        title={title}
        headerActions={headerActions}
        className={WIDTH_MAP[width]}
      >
        <div className="p-5 space-y-5">{children}</div>
      </SurfaceFrame>
    );
  }

  return (
    <div className={cn("space-y-5", WIDTH_MAP[width])}>{children}</div>
  );
}

FormPageShell.displayName = "FormPageShell";
