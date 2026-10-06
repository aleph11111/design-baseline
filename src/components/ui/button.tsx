"use client";
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // The control height ladder (STYLE.md "Control heights"), shared with
      // Select, Input, SearchInput and SegmentedControl: sm h-8 · default h-9 ·
      // lg h-11 (the 44pt touch target).
      size: {
        default: "h-9 px-4",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

type LabelProps = {
  "aria-label"?: string
  "aria-labelledby"?: string
  title?: string
  alt?: string
  className?: string
  children?: React.ReactNode
}

// An accessible name: an aria/title attribute, a visually-hidden
// `<span className="sr-only">` child (the shadcn idiom), or a self-labeling
// child element (`<svg aria-label>`, `<img alt>`). Under `asChild` the name
// may sit on the child element instead of the Button.
function hasAccessibleName(props: LabelProps, asChild: boolean): boolean {
  if (props["aria-label"] || props["aria-labelledby"] || props.title) return true
  return React.Children.toArray(props.children).some((child) => {
    if (!React.isValidElement<LabelProps>(child)) return false
    if (child.props["aria-label"] || child.props.title) return true
    if (child.type === "img" && child.props.alt) return true
    if (child.props.className?.split(/\s+/).includes("sr-only")) return true
    return asChild && hasAccessibleName(child.props, false)
  })
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const warnedRef = React.useRef(false)
    const missingName =
      process.env.NODE_ENV !== "production" &&
      size === "icon" &&
      !hasAccessibleName(props, asChild)
    React.useEffect(() => {
      if (missingName && !warnedRef.current) {
        warnedRef.current = true
        console.warn(
          'Button size="icon" has no aria-label, aria-labelledby, title, or <span className="sr-only"> label — screen readers will announce it as an unlabeled button. Add an aria-label describing the action.'
        )
      }
    }, [missingName])
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
