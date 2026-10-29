"use client";
import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

import { cn } from "../../lib/utils"
import { useTouchTarget } from "./toolbar-band"

const Collapsible = CollapsiblePrimitive.Root

// touch density: a disclosure line ("Show more", a section toggle) is a 44pt target
const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger ref={ref} className={cn(useTouchTarget(), className)} {...props} />
))
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
