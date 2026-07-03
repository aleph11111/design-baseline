import * as React from "react";
import {
  CalendarShell,
  type CalendarDay,
  Button,
} from "design-baseline";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

// CalendarShell — the week scheduling grid reference primitive (ported from
// calendar-demo.tsx). Domain: a community centre's room timetable. Full week
// with a nav/create actions cluster and all four event tones represented.
const FULL_WEEK: CalendarDay[] = [
  {
    id: "2026-06-22",
    dow: "Mon",
    date: "22",
    events: [
      { id: "s1", time: "09:00", title: "Morning Yoga", tone: "info" },
      { id: "s2", time: "18:30", title: "German for Beginners", tone: "default" },
    ],
  },
  {
    id: "2026-06-23",
    dow: "Tue",
    date: "23",
    events: [
      { id: "s3", time: "10:00", title: "Parent & Toddler", tone: "success" },
      { id: "s4", time: "16:00", title: "Homework Club", tone: "default" },
      { id: "s5", time: "19:00", title: "Choir Rehearsal", tone: "warning" },
    ],
  },
  {
    id: "2026-06-24",
    dow: "Wed",
    date: "24",
    today: true,
    events: [
      { id: "s6", time: "11:00", title: "Repair Café", tone: "success" },
      { id: "s7", time: "14:00", title: "Citizens' Advice", tone: "info" },
    ],
  },
  {
    id: "2026-06-25",
    dow: "Thu",
    date: "25",
    events: [{ id: "s8", time: "13:00", title: "Community Lunch", tone: "warning" }],
  },
  {
    id: "2026-06-26",
    dow: "Fri",
    date: "26",
    events: [{ id: "s9", time: "17:30", title: "Board Game Night", tone: "default" }],
  },
  {
    id: "2026-06-27",
    dow: "Sat",
    date: "27",
    events: [{ id: "s10", time: "10:30", title: "Saturday Market", tone: "success" }],
  },
  { id: "2026-06-28", dow: "Sun", date: "28", events: [] },
];

export function CommunityCentreWeek() {
  return (
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
      days={FULL_WEEK}
      emptyDayLabel="—"
    />
  );
}

// A quieter week: no nav actions, a "tint" header treatment, and a couple of
// fully empty days showing the emptyDayLabel copy.
export function TintHeaderSparseWeek() {
  const sparseWeek: CalendarDay[] = [
    { id: "2026-07-06", dow: "Mon", date: "6", events: [{ id: "p1", time: "09:30", title: "Repair Café", tone: "success" }] },
    { id: "2026-07-07", dow: "Tue", date: "7", events: [] },
    {
      id: "2026-07-08",
      dow: "Wed",
      date: "8",
      today: true,
      events: [{ id: "p2", time: "18:00", title: "Council Meeting", tone: "warning" }],
    },
    { id: "2026-07-09", dow: "Thu", date: "9", events: [] },
    { id: "2026-07-10", dow: "Fri", date: "10", events: [{ id: "p3", time: "17:00", title: "Book Club", tone: "info" }] },
    { id: "2026-07-11", dow: "Sat", date: "11", events: [] },
    { id: "2026-07-12", dow: "Sun", date: "12", events: [] },
  ];

  return (
    <CalendarShell
      kicker="Schedule"
      title="July 2026 · Week 28"
      days={sparseWeek}
      emptyDayLabel="No sessions"
      headerFill="tint"
    />
  );
}
