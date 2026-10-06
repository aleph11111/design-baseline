import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../../lib/utils";
import { JOINED_LABEL_CLASS } from "./select";

export type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ComponentType<{ className?: string }>;
};

export type SegmentedControlProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentedOption<T>[];
  /** Accessible label for the group. */
  "aria-label"?: string;
  /**
   * Joined label: a shaded cell fused to the track's left edge (the toolbar
   * label style, STYLE.md "Toolbar field labels"); it names the group unless
   * `aria-label` is given.
   */
  label?: React.ReactNode;
  /** Height on the shared control ladder: sm h-8 · default h-9 · lg h-11. */
  size?: "sm" | "default" | "lg";
  className?: string;
};

// Track height + pill type per ladder step; the pills fill the track's height.
const SIZE = {
  sm: { track: "h-8", pill: "px-2.5 text-xs" },
  default: { track: "h-9", pill: "px-3 text-sm" },
  lg: { track: "h-11", pill: "px-4 text-base" },
} as const;

/**
 * SegmentedControl — the single owner of the "pick one mode/filter" pill row
 * (All · Unread · Mentions; Table · Cards; Day · Week · Month). Previously
 * hand-rolled in four demos with drifted button padding (`px-2`/`px-2.5`/`px-3`);
 * this fixes the molecule at one place.
 *
 * Visual contract: a bordered track (`rounded-md border p-0.5`) of equal pills;
 * the active pill is `bg-primary text-primary-foreground`, inactive ones are
 * muted with a hover. Selection state is consumer-owned (controlled).
 *
 * For larger / route-like switches use `<Tabs>`; this is for compact, in-place
 * mode/filter toggles that sit in a toolbar.
 *
 * Built on `@radix-ui/react-radio-group` (same primitive as `ui/radio-group.tsx`)
 * rather than plain buttons, so the WAI-ARIA radiogroup pattern — one tab stop,
 * arrow keys to move and select — comes from the primitive instead of hand-rolled
 * keydown handling.
 */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  label,
  size = "default",
  className,
  ...rest
}: SegmentedControlProps<T>): React.ReactElement {
  const labelId = React.useId();
  const geometry = SIZE[size];
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      aria-label={rest["aria-label"]}
      aria-labelledby={label != null && rest["aria-label"] == null ? labelId : undefined}
      className={cn(
        "inline-flex items-stretch gap-1 overflow-hidden rounded-md border p-0.5",
        geometry.track,
        className,
      )}
    >
      {label != null && (
        // Stretched over the track's p-0.5 so the cell meets the border.
        <span
          id={labelId}
          className={cn(JOINED_LABEL_CLASS, "-my-0.5 -ml-0.5 border-r", size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm")}
        >
          {label}
        </span>
      )}
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = opt.value === value;
        return (
          <RadioGroupPrimitive.Item
            key={opt.value}
            value={opt.value}
            className={cn(
              "inline-flex items-center gap-1.5 rounded font-medium transition-colors",
              geometry.pill,
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {opt.label}
          </RadioGroupPrimitive.Item>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}

SegmentedControl.displayName = "SegmentedControl";
