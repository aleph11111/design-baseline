import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

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
  className?: string;
};

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
  className,
  ...rest
}: SegmentedControlProps<T>): React.ReactElement {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      aria-label={rest["aria-label"]}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border p-0.5",
        className,
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = opt.value === value;
        return (
          <RadioGroupPrimitive.Item
            key={opt.value}
            value={opt.value}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
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
