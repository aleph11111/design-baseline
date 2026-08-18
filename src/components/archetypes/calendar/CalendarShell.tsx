import * as React from "react";
import {
  SurfaceHeaderSlot,
  type SurfaceHeaderSlotProps,
} from "@/components/layout/SurfaceHeaderSlot";
import { cn } from "@/lib/utils";

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
  /** Accent-bar + tint tone. Defaults to `default`. */
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

export type CalendarShellProps = Omit<SurfaceHeaderSlotProps, "title"> & {
  /** The period title (e.g. "June 2026 · Week 26"). Unlike the other framed
   *  shells, a calendar's header is never optional. */
  title: React.ReactNode;
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
    chip: "bg-success/10",
    bar: "border-l-success",
    time: "text-success",
  },
  info: {
    chip: "bg-primary/10",
    bar: "border-l-primary",
    time: "text-primary",
  },
  warning: {
    chip: "bg-warning/10",
    bar: "border-l-warning",
    time: "text-warning",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * The calendar archetype's reference primitive — a single bounded card holding
 * a ruled header bar (kicker + title left, nav/create cluster right) over a
 * 7-column scheduling grid. Row 1 is the day headers (dow overline + mono day
 * number, today's cell tinted); row 2 is the day columns, each stacking event
 * chips (left accent bar + faint tint, mono time + semibold title).
 *
 * House style B: flat carded surface (no shadow), faint hairlines, every figure
 * mono/tabular, token-pure tones. The grid scrolls horizontally on narrow
 * viewports rather than reflowing — a week stays a week.
 */
export function CalendarShell({
  kicker,
  title,
  headerActions,
  days,
  emptyDayLabel,
}: CalendarShellProps): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <SurfaceHeaderSlot
        kicker={kicker}
        title={title}
        headerActions={headerActions}
      />

      {/* Grid — scrolls horizontally on narrow viewports. */}
      <div className="overflow-x-auto">
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
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                {day.dow}
              </div>
              <div
                className={cn(
                  "mt-0.5 font-mono text-base font-semibold tabular-nums",
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
                            "font-mono text-[10px] tabular-nums",
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
    </div>
  );
}

CalendarShell.displayName = "CalendarShell";
