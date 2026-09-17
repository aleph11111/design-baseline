"use client";
import * as React from "react";
import { SurfaceHeader } from "./SurfaceHeader";
import { SurfaceHeaderBar } from "./SurfaceHeaderBar";

export type SurfaceHeaderSlotProps = {
  /** Overline kicker above the title (the entity/section class). */
  kicker?: React.ReactNode;
  /** Surface title. When set, the on-surface header bar renders. */
  title?: React.ReactNode;
  /** Optional secondary metadata line below the title (`text-xs`). */
  subtitle?: React.ReactNode;
  /** Optional decorative icon left of the title. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Right-aligned actions in the on-surface header. */
  headerActions?: React.ReactNode;
};

/**
 * SurfaceHeaderSlot — the shared "on-surface header" contract every framed
 * archetype shell mounts at the top of its bounded surface. Centralizes the
 * header guard so shells don't each hand-roll it:
 *
 *   - `title` set                  → the full `<SurfaceHeader>` stack.
 *   - no `title`, `headerActions`  → an actions-only `<SurfaceHeaderBar>`.
 *   - neither                      → nothing.
 *
 * The actions-only band matters because a list surface often carries a
 * page-level action (an "Add" button) while its title is already supplied by
 * the page around it. Gating the whole slot on `title` alone silently swallowed
 * those actions — the consumer passed `headerActions` and nothing rendered.
 *
 * The header's treatment is read from `HeaderFillContext` (set once at
 * `<AppShell headerFill=…>`) — there is no per-shell override prop.
 */
export function SurfaceHeaderSlot({
  kicker,
  title,
  subtitle,
  icon,
  headerActions,
}: SurfaceHeaderSlotProps): React.ReactElement | null {
  if (title === undefined) {
    if (headerActions === undefined) return null;
    // Actions-only band: no title block, so the bar's title slot stays empty
    // and the actions keep their canonical padding and header-fill treatment.
    return <SurfaceHeaderBar actions={headerActions}>{null}</SurfaceHeaderBar>;
  }
  return (
    <SurfaceHeader
      kicker={kicker}
      title={title}
      subtitle={subtitle}
      icon={icon}
      actions={headerActions}
    />
  );
}

SurfaceHeaderSlot.displayName = "SurfaceHeaderSlot";
