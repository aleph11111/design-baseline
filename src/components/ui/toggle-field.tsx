"use client";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";
import { JOINED_LABEL_CLASS, JoinedLabelText, FIXED_BOX_LABEL_CLASS, hasWidthClass, useControlSize, useInToolbarBand } from "./toolbar-band";

export type ToggleFieldProps = Omit<
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
  "children"
> & {
  /** The filter's name, shown in the box ("Show inactive"). */
  children: React.ReactNode;
  /**
   * Joined label: a shaded cell fused to the box's left edge ("Status | Active
   * only"), the toolbar label style (STYLE.md "Toolbar field labels"), inside a
   * `PageFrame` band; outside one it renders as a caption stacked above the
   * box. Omit it when the box text names itself.
   */
  label?: React.ReactNode;
  /** Height on the shared control ladder: sm h-8 · default h-9 · lg h-11. */
  size?: "sm" | "default" | "lg";
};

const SIZE = {
  sm: { box: "h-8 text-xs", pad: "px-2.5" },
  default: { box: "h-9 text-sm", pad: "px-3" },
  lg: { box: "h-11 text-base", pad: "px-4" },
} as const;

/**
 * ToggleField — the on-ladder boolean filter for a toolbar band. A pressed-state
 * box of the band's step (never the bare 24px `Switch`, which is a second
 * control height in the band): outline when off, `bg-primary` when on. Built on
 * the Switch primitive, so it keeps `role="switch"` and the `checked` /
 * `onCheckedChange` API (not `pressed` / `onPressedChange`). `label` joins a
 * caption to the left edge in a band (stacked above elsewhere). Takes the
 * band's step from `ToolbarSizeContext`; an explicit `size` wins.
 */
export const ToggleField = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  ToggleFieldProps
>(({ children, label, size: sizeProp, className, ...props }, ref) => {
  const labelId = React.useId();
  const joined = useInToolbarBand();
  const textId = React.useId();
  const bandSize = useControlSize();
  const size = SIZE[sizeProp ?? bandSize ?? "default"];
  const fixed = label != null && joined && hasWidthClass(className);
  const box = (
    <SwitchPrimitives.Root
      ref={ref}
      aria-labelledby={label != null ? `${labelId} ${textId}` : undefined}
      className={cn(
        "group inline-flex items-stretch overflow-hidden rounded-md border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        size.box,
        label != null && joined && !fixed && "inline-grid min-w-min grid-cols-[auto_auto]",
        fixed && "shrink-0",
        className,
      )}
      {...props}
    >
      {label != null && joined && (
        <span id={labelId} data-joined-label="" className={cn(JOINED_LABEL_CLASS, "border-r", fixed && FIXED_BOX_LABEL_CLASS)}>
          <JoinedLabelText>{label}</JoinedLabelText>
        </span>
      )}
      <span
        id={textId}
        className={cn(
          "flex items-center whitespace-nowrap",
          fixed && "grow",
          size.pad,
          "group-data-[state=checked]:bg-primary group-data-[state=checked]:text-primary-foreground group-data-[state=unchecked]:text-muted-foreground group-data-[state=unchecked]:group-hover:text-foreground",
        )}
      >
        {children}
      </span>
    </SwitchPrimitives.Root>
  );
  if (label == null || joined) return box;
  return (
    <div className="inline-flex flex-col items-start gap-1.5">
      <span id={labelId} className="text-sm font-medium">
        {label}
      </span>
      {box}
    </div>
  );
});
ToggleField.displayName = "ToggleField";
