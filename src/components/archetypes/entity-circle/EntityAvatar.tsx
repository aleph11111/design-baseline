import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type EntityAvatarSize = "xs" | "sm" | "md";
export type EntityAvatarTone = "muted" | "primary";

export interface EntityAvatarProps {
  /** The entity's display name. Drives the initials fallback AND the accessible name. */
  name: string;
  /** Optional image URL. Renders the image; falls back to initials if it is absent or fails to load. */
  src?: string;
  /** Circle size. Default "sm". Mirrors the IconAvatar scale. */
  size?: EntityAvatarSize;
  /** Fill of the initials fallback: "muted" (default, neutral) or "primary" (brand fill). */
  tone?: EntityAvatarTone;
  /** Extra classes on the Avatar root. */
  className?: string;
}

const SIZE_CLASS: Record<EntityAvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
};

const TONE_CLASS: Record<EntityAvatarTone, string> = {
  muted: "bg-muted text-muted-foreground",
  primary: "bg-primary text-primary-foreground",
};

/**
 * Derive initials from an entity's display name. Splits on whitespace/underscore;
 * a single token yields its first two characters, a multi-token name yields the
 * first character of the first and last token. Uppercased; "?" when empty.
 *
 * Distilled from the fleet's two hand-rolled derivers (brickshop `getUserInitials`,
 * mistra `initialsFrom`) into one shared, tested helper.
 */
export function entityInitials(name: string): string {
  const words = name.trim().split(/[\s_]+/).filter(Boolean);
  const first = words[0] ?? "";
  if (words.length <= 1) return (first.slice(0, 2) || "?").toUpperCase();
  const last = words[words.length - 1] ?? "";
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || "?";
}

/**
 * EntityAvatar — the small "entity circle": a circular avatar that represents a
 * named entity (person, contact, account). Unlike `IconAvatar` (which holds an
 * icon or pre-computed initials you pass as children), EntityAvatar is
 * **name-driven**: it derives the initials itself, renders an optional image with
 * an initials fallback, and exposes the name as the accessible label.
 *
 * The fleet hand-rolls this two ways — a fixed brand fill (brickshop's user
 * avatar) and a positional multi-tint palette (mistra's speaker roster). The
 * baseline conforms to the token set: `tone` is "muted" (default) or "primary".
 * Per-entity hue variety is intentionally NOT offered (see the contract's L7).
 */
export function EntityAvatar({
  name,
  src,
  size = "sm",
  tone = "muted",
  className,
}: EntityAvatarProps): React.ReactElement {
  return (
    <Avatar className={cn(SIZE_CLASS[size], className)}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback
        role="img"
        aria-label={name}
        className={cn("font-medium", TONE_CLASS[tone])}
      >
        {entityInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

EntityAvatar.displayName = "EntityAvatar";
