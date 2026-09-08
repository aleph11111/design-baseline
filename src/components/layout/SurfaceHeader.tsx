"use client";
import * as React from "react";
import { cn } from "../../lib/utils";
import { OVERLINE_CLASS } from "./overline";
import { useHeaderFill, headerFillClasses } from "./headerFill";
import { SurfaceHeaderBar } from "./SurfaceHeaderBar";

export type SurfaceHeaderProps = {
  /** Overline kicker above the title (the entity/section class — "Orders",
   *  "Einstellungen", "Übersicht"). Rendered via the shared `OVERLINE_CLASS`. */
  kicker?: React.ReactNode;
  /** The surface title (`text-lg font-semibold`). Embedded ID/number figures
   *  should be wrapped in `font-mono` by the caller. */
  title: React.ReactNode;
  /** Optional secondary line below the title — compact metadata (created date,
   *  short identifier, status string), not prose. Rendered at `text-xs`, the
   *  same scale as `<PageHeader>`'s subtitle, and dimmed automatically on a
   *  solid header. Parity with the classic `<PageHeader>` path: without this
   *  slot, a shell needing a subtitle had to fall back to the classic header
   *  and lose the on-surface treatment entirely. */
  subtitle?: React.ReactNode;
  /** Optional decorative icon to the left of the title (`h-6 w-6`), matching
   *  `<PageHeader>`'s icon slot. Pass a lucide-react icon component. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Right-aligned actions row — `<Button>`s (size="sm"): secondary =
   *  `variant="outline"`, primary = default. They invert on a solid header. */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * SurfaceHeader — the canonical "header on the surface" bar for a Plex Ledger
 * framed archetype: a kicker overline + title on the left, actions on the
 * right, rendered ON the bounded surface (not a separate PageHeader above it).
 *
 * Every framed archetype shell mounts this at the top of its one bounded card
 * so the whole fleet shares one header treatment, driven by `--header-fill`
 * (solid by default — accent-filled with white title/kicker and inverted
 * buttons; tint / white are the quieter steps). Status `<Badge>`s passed into
 * `actions` stay semantic on solid (they are not inverted).
 */
export function SurfaceHeader({
  kicker,
  title,
  subtitle,
  icon: Icon,
  actions,
  className,
}: SurfaceHeaderProps): React.ReactElement {
  // The bar's padding + `hfc.bar` fill live in `<SurfaceHeaderBar>` (one
  // implementation for every framed shell); this component keeps only its
  // slot-specific overrides — kicker/title/subtitle element treatments.
  const hfc = headerFillClasses(useHeaderFill());
  return (
    <SurfaceHeaderBar className={className} actions={actions}>
      {kicker ? (
        <div className={cn(OVERLINE_CLASS, "mb-1", hfc.kicker)}>{kicker}</div>
      ) : null}
      <div className="flex items-center gap-2">
        {Icon ? (
          <Icon className={cn("h-6 w-6 shrink-0", hfc.title)} />
        ) : null}
        <div
          className={cn(
            "text-lg font-semibold leading-tight text-foreground",
            hfc.title,
          )}
        >
          {title}
        </div>
      </div>
      {subtitle ? (
        <p
          className={cn(
            "mt-0.5 text-xs text-muted-foreground",
            hfc.subtitle,
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </SurfaceHeaderBar>
  );
}

SurfaceHeader.displayName = "SurfaceHeader";
