import * as React from "react";
import { cn } from "@/lib/utils";
import { OVERLINE_CLASS } from "./overline";
import { useHeaderFill, headerFillClasses, type HeaderFill } from "./headerFill";

export type SurfaceHeaderProps = {
  /** Overline kicker above the title (the entity/section class — "Orders",
   *  "Einstellungen", "Übersicht"). Rendered via the shared `OVERLINE_CLASS`. */
  kicker?: React.ReactNode;
  /** The surface title (`text-lg font-semibold`). Embedded ID/number figures
   *  should be wrapped in `font-mono` by the caller. */
  title: React.ReactNode;
  /** Right-aligned actions row — `<Button>`s (size="sm"): secondary =
   *  `variant="outline"`, primary = default. They invert on a solid header. */
  actions?: React.ReactNode;
  /** Header treatment (House Style B). Defaults to the project's
   *  `HeaderFillContext` ("solid" unless overridden). */
  headerFill?: HeaderFill;
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
  actions,
  headerFill,
  className,
}: SurfaceHeaderProps): React.ReactElement {
  const hfc = headerFillClasses(useHeaderFill(headerFill));
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-5 px-5 py-4",
        hfc.bar,
        className,
      )}
    >
      <div className="min-w-0">
        {kicker ? (
          <div className={cn(OVERLINE_CLASS, "mb-1", hfc.kicker)}>{kicker}</div>
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
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

SurfaceHeader.displayName = "SurfaceHeader";
