/**
 * calendar-demo.tsx
 *
 * Sandbox demo for the Cal (calendar) archetype — a week scheduling grid in a
 * single bounded card. Domain: a neighbourhood **community centre's** room
 * timetable, deliberately far from CRM/MSP nouns — yoga, language circles, a
 * repair café, council meetings.
 *
 * Exercises the full vocabulary mirroring the calendar reference mockup:
 *   - CalendarShell with a `kicker` + `title` header bar over the 7-col grid,
 *     and a nav/create `actions` cluster (‹ · Today · › · + Event).
 *   - Seven `CalendarDay` columns; one marked `today` (header tints, number
 *     brightens); a handful of `CalendarEvent` chips across all four tones.
 *   - House style B: every time/day-number mono + tabular; titles + button
 *     labels stay sans; flat carded surface, no shadow.
 *
 * Types are LOCAL with zero reference to any source project's domain.
 */

import * as React from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CalendarShell,
  type CalendarDay,
  type CalendarEventTone,
} from "@/components/archetypes/calendar";

// ---------------------------------------------------------------------------
// Domain — a community-centre room timetable
// ---------------------------------------------------------------------------

type Session = {
  id: string;
  /** 24h start time. */
  start: string;
  title: string;
  tone: CalendarEventTone;
};

type ScheduleDay = {
  id: string; // ISO date
  /** Short day-of-week label. */
  dow: string;
  /** Day-of-month number. */
  date: string;
  today?: boolean;
  sessions: Session[];
};

// ---------------------------------------------------------------------------
// Fixture — week of 22–28 June 2026 (Wed is today)
// ---------------------------------------------------------------------------

const WEEK: ScheduleDay[] = [
  {
    id: "2026-06-22",
    dow: "Mon",
    date: "22",
    sessions: [
      { id: "s1", start: "09:00", title: "Morning Yoga", tone: "info" },
      { id: "s2", start: "18:30", title: "German for Beginners", tone: "default" },
    ],
  },
  {
    id: "2026-06-23",
    dow: "Tue",
    date: "23",
    sessions: [
      { id: "s3", start: "10:00", title: "Parent & Toddler", tone: "success" },
      { id: "s4", start: "16:00", title: "Homework Club", tone: "default" },
      { id: "s5", start: "19:00", title: "Choir Rehearsal", tone: "warning" },
    ],
  },
  {
    id: "2026-06-24",
    dow: "Wed",
    date: "24",
    today: true,
    sessions: [
      { id: "s6", start: "11:00", title: "Repair Café", tone: "success" },
      { id: "s7", start: "14:00", title: "Citizens' Advice", tone: "info" },
    ],
  },
  {
    id: "2026-06-25",
    dow: "Thu",
    date: "25",
    sessions: [
      { id: "s8", start: "13:00", title: "Community Lunch", tone: "warning" },
    ],
  },
  {
    id: "2026-06-26",
    dow: "Fri",
    date: "26",
    sessions: [
      { id: "s9", start: "17:30", title: "Board Game Night", tone: "default" },
    ],
  },
  {
    id: "2026-06-27",
    dow: "Sat",
    date: "27",
    sessions: [
      { id: "s10", start: "10:30", title: "Saturday Market", tone: "success" },
    ],
  },
  { id: "2026-06-28", dow: "Sun", date: "28", sessions: [] },
];

// ---------------------------------------------------------------------------
// Demo page
// ---------------------------------------------------------------------------

export function CalendarDemo(): React.ReactElement {
  const days: CalendarDay[] = WEEK.map((d) => ({
    id: d.id,
    dow: d.dow,
    date: d.date,
    today: d.today,
    events: d.sessions.map((s) => ({
      id: s.id,
      time: s.start,
      title: s.title,
      tone: s.tone,
    })),
  }));

  return (
    <div className="space-y-5">
      <p className="max-w-prose text-sm text-muted-foreground">
        A week scheduling grid in one bounded card. The header bar pins the
        period title beside a nav/create cluster; the 7-column grid heads each
        day with a mono day-number (today's cell tinted) over a column of event
        chips. Tones (<strong>default · success · info · warning</strong>) carry
        a little colour variety, all token-backed.
      </p>

      <CalendarShell
        kicker="Schedule"
        title={
          <>
            June 2026 <span className="mx-1.5 text-border">·</span>
            <span className="font-mono tabular-nums">Week 26</span>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="px-2" aria-label="Previous week">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              Today
            </Button>
            <Button variant="outline" size="sm" className="px-2" aria-label="Next week">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Event
            </Button>
          </>
        }
        days={days}
        emptyDayLabel="—"
      />
    </div>
  );
}

CalendarDemo.displayName = "CalendarDemo";
