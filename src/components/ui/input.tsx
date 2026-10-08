"use client";
import * as React from "react"

import { cn } from "../../lib/utils"
import { ToolbarSizeContext } from "./toolbar-band"

// Control height ladder (docs/STYLE.md "Control heights"). `default` keeps the
// base `h-9` + responsive text size; sm/lg override both. `sm14` and `lg18`
// pair a ladder height with a non-larger text size (the Button `icon-sm`
// pattern: geometry lives in the step, callers never hand-roll `text-*`).
// Replaces the native numeric `size` attribute, which nothing in the fleet uses.
const SIZE = {
  sm: "h-8 text-xs md:text-xs",
  sm14: "h-8 text-sm md:text-sm",
  default: "",
  lg: "h-11 text-base md:text-base",
  lg18: "h-11 text-lg md:text-lg",
} as const

export type InputSize = keyof typeof SIZE

type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  size?: InputSize
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => {
    const bandSize = React.useContext(ToolbarSizeContext)
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          SIZE[size ?? bandSize ?? "default"],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
