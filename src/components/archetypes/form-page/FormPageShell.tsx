import * as React from "react";
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
   * Max-width preset for the form container.
   * Defaults to "md" (~36rem / max-w-xl).
   */
  width?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * FormPageShell — the outermost container for every B (form-page) archetype
 * instance.
 *
 * Provides:
 *   - Single-column max-width (configurable via `width` prop)
 *   - Vertical spacing between header / form body / actions: space-y-6
 *
 * Does NOT add page inset (px-6/py-6) — `<AppShell>`'s `<main>` owns that. Adding
 * it here would double-inset. See docs/STYLE.md "Spacing & rhythm".
 *
 * Children should be arranged as:
 *   <FormPageHeader … />
 *   <form className="space-y-4" onSubmit={…}>
 *     …fields…
 *     <FormPageActions … />
 *   </form>
 *
 * Or, when actions live outside the form element:
 *   <FormPageHeader … />
 *   <form className="space-y-4" onSubmit={…}>…fields…</form>
 *   <FormPageActions … />
 */
export function FormPageShell({
  children,
  width = "md",
  className,
}: FormPageShellProps): React.ReactElement {
  return (
    <div
      className={cn(
        "space-y-6",
        WIDTH_MAP[width],
        className,
      )}
    >
      {children}
    </div>
  );
}

FormPageShell.displayName = "FormPageShell";
