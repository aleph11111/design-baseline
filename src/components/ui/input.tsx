"use client";
import * as React from "react"

import { cn } from "../../lib/utils"

// Control height ladder (docs/STYLE.md "Control heights"). `default` keeps the
// base `h-9` + responsive text size; sm/lg override both. Replaces the native
// numeric `size` attribute, which nothing in the fleet uses.
const SIZE = {
  sm: "h-8 text-xs md:text-xs",
  default: "",
  lg: "h-11 text-base md:text-base",
} as const

export type InputSize = keyof typeof SIZE

type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  size?: InputSize
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          SIZE[size],
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
