"use client";
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"

import { cn } from "../../lib/utils"
import { useTouchTarget } from "./toolbar-band"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
  // touch density: a 44pt hit area around the unchanged 16px box, so rows don't grow
  const touchTarget = useTouchTarget()
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "group peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        touchTarget,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        {/* Radix mounts the Indicator for `indeterminate` as well as `checked`, so the icon is
            switched by the root's data-state, not the caller: Minus when some-but-not-all, Check otherwise */}
        <Check className="h-4 w-4 group-data-[state=indeterminate]:hidden" />
        <Minus className="hidden h-4 w-4 group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
