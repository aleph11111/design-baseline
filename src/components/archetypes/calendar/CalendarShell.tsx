"use client";
import * as React from "react";
import { PageFrame, type PageShellFrameProps } from "../../layout/PageFrame";
import { useFullBleedClass } from "../../layout/surface";
import { COL_HEADER_CLASS } from "../../layout/overline";
import { cn } from "../../../lib/utils";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Event tone. Token-pure — each tone resolves to a token-backed accent-bar +
 * tint pair (see `TONE_CLASS`), never a literal hex. `default` reads as the
 * donor-neutral muted/foreground; `success` / `info` / `warning` borrow the
 * Badge-family semantic tints so a week can carry a little colour variety
 * without baking a brand accent.
 */
export type CalendarEventTone = "default" | "success" | "info" | "warning";

/** One event chip placed inside a day column. */
export type CalendarEvent = {
  /** Stable key, unique within the week. */
  id: string;
  /** Pre-formatted time label (mono, e.g. "09:00"). The primitive never formats. */
  time: React.ReactNode;
  /** Event title (sans, semibold). */
  title: React.ReactNode;
  /**
   * Accent-bar + tint tone. Derived per the contract's status -> tone keying
   * rule (docs/archetypes/calendar.md, Layer 7) from the event's own domain
   * status — not the page author's taste:
   *   warning  — the domain marks the event failed / blocked / overdue
   *   success  — the domain marks the event completed / confirmed
   *   info     — the domain marks the event noteworthy / externally driven
   *   default  — the event carries no such domain status
   * Omitted `tone` resolves to `default` — the rule's own answer for a bare
   * scheduled item, so a no-status event simply passes no `tone`.
   */
  tone?: CalendarEventTone;
};

/** One day column: its header (dow + date) plus the events that fall on it. */
export type CalendarDay = {
  /** Stable key, unique within the week (e.g. ISO date). */
  id: string;
  /** Short day-of-week overline (e.g. "Mo", "Tu"). */
  dow: React.ReactNode;
  /** Pre-formatted day number (mono, e.g. "22"). */
  date: React.ReactNode;
  /** Tints the header cell + brightens the number when this is the current day. */
  today?: boolean;
  /** Events for this day, in display order. The consumer pre-sorts. */
  events: CalendarEvent[];
};

export type CalendarShellProps = PageShellFrameProps & {
  /** The seven day columns in display order. */
  days: CalendarDay[];
  /** Empty-column copy, centred faintly when a day has no events. Default: none. */
  emptyDayLabel?: React.ReactNode;
};

// ---------------------------------------------------------------------------
// Tone → token classes (no literal hex — Badge-family / muted tokens only)
// ---------------------------------------------------------------------------

type ToneClasses = { chip: string; bar: string; time: string };

const TONE_CLASS: Record<CalendarEventTone, ToneClasses> = {
  default: {
    chip: "bg-muted",
    bar: "border-l-foreground/70",
    time: "text-muted-foreground",
  },
  success: {
    chip: "bg-status-success-bg",
    bar: "border-l-status-success-fg",
    time: "text-status-success-fg",
  },
  info: {
    chip: "bg-primary/10",
    bar: "border-l-primary",
    time: "text-primary",
  },
  warning: {
    chip: "bg-status-warning-bg",
    bar: "border-l-status-warning-fg",
    time: "text-status-warning-fg",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * The calendar archetype's reference primitive — a 7-column scheduling grid,
 * rendered through `PageFrame` (ADR-0008): `title` is the page heading,
 * `toolbar` holds the period/view navigation (‹ · Today · › · the period
 * label), `actions` the one primary create action. Row 1 is the day headers
 * (dow overline + mono day number, today's cell tinted); row 2 is the day
 * columns, each stacking event chips (left accent bar + faint tint, mono time +
 * semibold title).
 *
 * Every figure mono/tabular, token-pure tones. Full-bleed. The grid scrolls
 * horizontally on narrow viewports rather than reflowing — a week stays a week.
 *
 * Event interaction (open / create) is consumer-owned: the shell renders the
 * chips and the slots, and the consumer wires their click handlers. The shell
 * exposes no `onClick` on day cells or event chips.
 */
export function CalendarShell({
  days,
  emptyDayLabel,
  ...frame
}: CalendarShellProps): React.ReactElement {
  const fullBleed = useFullBleedClass();
  return (
    <PageFrame
      {...frame}
      // Full-bleed archetype (ADR-0007 §1): the marker lifts AppShell's column
      // (page root only; nested in a surface it leaves the column alone).
      className={fullBleed}
    >
      {/* Grid — scrolls horizontally on narrow viewports. */}
      <div className="relative overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-7">
          {/* Row 1 — day headers */}
          {days.map((day) => (
            <div
              key={`h-${day.id}`}
              className={cn(
                "border-b border-r border-border/60 px-1.5 py-2.5 text-center last:border-r-0",
                day.today && "bg-muted",
              )}
            >
              <div className={COL_HEADER_CLASS}>
                {day.dow}
              </div>
              <div
                className={cn(
                  "mt-0.5 text-base font-semibold tabular-nums",
                  day.today ? "text-foreground" : "text-foreground/80",
                )}
              >
                {day.date}
              </div>
            </div>
          ))}

          {/* Row 2 — day columns */}
          {days.map((day) => (
            <div
              key={`c-${day.id}`}
              className="flex min-h-[170px] flex-col gap-1.5 border-r border-border/60 p-1.5 last:border-r-0"
            >
              {day.events.length === 0
                ? emptyDayLabel != null && (
                    <div className="select-none pt-1 text-center text-[10px] text-muted-foreground/60">
                      {emptyDayLabel}
                    </div>
                  )
                : day.events.map((event) => {
                    const tone = TONE_CLASS[event.tone ?? "default"];
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "rounded-md border-l-[3px] px-2 py-1.5",
                          tone.chip,
                          tone.bar,
                        )}
                      >
                        <div
                          className={cn(
                            "text-[10px] tabular-nums",
                            tone.time,
                          )}
                        >
                          {event.time}
                        </div>
                        <div className="mt-px text-[11.5px] font-semibold leading-tight text-foreground">
                          {event.title}
                        </div>
                      </div>
                    );
                  })}
            </div>
          ))}
        </div>
      </div>
    </PageFrame>
  );
}

CalendarShell.displayName = "CalendarShell";
