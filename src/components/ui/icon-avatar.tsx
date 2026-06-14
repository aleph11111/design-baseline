import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type IconAvatarSize = "xs" | "sm" | "md";

export type IconAvatarProps = {
  /** A lucide icon element or short initials. */
  children: React.ReactNode;
  size?: IconAvatarSize;
  className?: string;
};

const SIZE_CLASS: Record<IconAvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
};

/**
 * IconAvatar — the single owner of the small "entity circle": a muted round
 * holder for a leading icon or initials (feed-row glyphs, assignee initials).
 * Previously hand-rolled as `<span className="…rounded-full bg-muted…">` at three
 * different sizes; this wraps the shadcn `<Avatar>` so the shape/color is uniform
 * and only the `size` varies. (A numbered step indicator — e.g. WizardStepper —
 * is a different molecule and does NOT use this.)
 */
export function IconAvatar({
  children,
  size = "sm",
  className,
}: IconAvatarProps): React.ReactElement {
  return (
    <Avatar className={cn(SIZE_CLASS[size], className)}>
      <AvatarFallback className="bg-muted font-medium text-muted-foreground">
        {children}
      </AvatarFallback>
    </Avatar>
  );
}

IconAvatar.displayName = "IconAvatar";
