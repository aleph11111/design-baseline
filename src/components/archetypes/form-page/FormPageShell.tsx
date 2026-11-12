import * as React from "react";
import { PageFrame, type PageFrameProps } from "../../layout/PageFrame";

// ---------------------------------------------------------------------------
// Width variant map
// ---------------------------------------------------------------------------

const WIDTH_MAP: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: "max-w-md",   // ~28rem — narrow forms (3–4 fields)
  md: "max-w-xl",   // ~36rem — default; standard entity forms
  lg: "max-w-2xl",  // ~42rem — wider single-column or 2-col grid forms
  xl: "max-w-4xl",  // ~56rem — wide multi-column layouts
};

/**
 * Padding class for a padded form surface hosted outside the shell (a Card, a dialog body). It publishes the padding as `--form-inset` so the
 * sticky mobile `<FormPageActions>` bar bleeds by exactly that amount and
 * spans the surface edge to edge. A surface without it gets a 0 bleed.
 */
export const FORM_INSET_CLASS = "p-[var(--form-inset)] [--form-inset:1.25rem]";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * The page header — passed once, rendered by `PageFrame` (ADR-0008). No
 * `actions`: a form page's commit actions (save / cancel / delete) live in
 * `<FormPageActions>` at the form's foot, their one home.
 */
type FormPageTitleProps = Pick<
  PageFrameProps,
  "title" | "subtitle" | "icon" | "backHref" | "backLabel" | "renderBackLink"
>;

export type FormPageShellProps = FormPageTitleProps & {
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
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * FormPageShell — the outermost container for every B (form-page) archetype
 * instance. Renders through `PageFrame` (ADR-0008): the page header (title
 * once, optional subtitle / icon / back link) above a stack of raised cards
 * on the canvas (ADR-0015), the whole page held to the `width` preset. Each
 * field group is its own `SectionCard` (a flat form wraps its fields in one
 * untitled card); the commit actions stay in `<FormPageActions>` at the
 * form's foot, outside every card.
 *
 *   <FormPageShell title="New Task" backHref="/tasks">
 *     <form onSubmit={…}>
 *       <SectionCard title="Basics">…fields…</SectionCard>
 *       <FormPageActions … />
 *     </form>
 *   </FormPageShell>
 */
export function FormPageShell({
  children,
  width = "md",
  ...header
}: FormPageShellProps): React.ReactElement {
  return (
    <PageFrame {...header} className={WIDTH_MAP[width]} body="stack">
      {/* The shell owns the card rhythm (ADR-0015 rule 3): the form's children
          become stack items via `contents`, so the stack gap applies between
          cards and the actions bar whatever classes the form carries. */}
      <div className="flex flex-col gap-4 md:gap-5 [&>form]:contents">{children}</div>
    </PageFrame>
  );
}

FormPageShell.displayName = "FormPageShell";
