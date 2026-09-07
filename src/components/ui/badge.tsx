
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        // Status tiers — the soft chip look comes from the design-baseline status
        // token pairs (one AA-verified source in tokens.css), not per-badge colors.
        secondary:
          "border-transparent bg-status-neutral-bg text-status-neutral-fg",
        destructive:
          "border-transparent bg-status-danger-bg text-status-danger-fg",
        success:
          "border-transparent bg-status-success-bg text-status-success-fg",
        warning:
          "border-transparent bg-status-warning-bg text-status-warning-fg",
        info: "border-transparent bg-status-info-bg text-status-info-fg",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
