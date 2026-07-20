import * as React from "react";
import { SurfaceHeader } from "./SurfaceHeader";
import { type HeaderFill } from "./headerFill";

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
  /** Header treatment for the on-surface header (House Style B). */
  headerFill?: HeaderFill;
};

/**
 * SurfaceHeaderSlot — the shared "on-surface header" contract every framed
 * archetype shell mounts at the top of its bounded surface: renders a
 * `<SurfaceHeader>` when `title` is set, renders nothing otherwise. Centralizes
 * the `title !== undefined` guard so shells don't each hand-roll it.
 */
export function SurfaceHeaderSlot({
  kicker,
  title,
  subtitle,
  icon,
  headerActions,
  headerFill,
}: SurfaceHeaderSlotProps): React.ReactElement | null {
  if (title === undefined) return null;
  return (
    <SurfaceHeader
      kicker={kicker}
      title={title}
      subtitle={subtitle}
      icon={icon}
      actions={headerActions}
      headerFill={headerFill}
    />
  );
}

SurfaceHeaderSlot.displayName = "SurfaceHeaderSlot";
