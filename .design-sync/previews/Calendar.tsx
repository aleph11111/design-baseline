import * as React from "react";
import { Calendar } from "design-baseline";

export function MonthGrid() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 24));

  return (
    <div className="w-fit rounded-lg border bg-card">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        defaultMonth={new Date(2026, 5, 1)}
        today={new Date(2026, 5, 24)}
      />
    </div>
  );
}

export function RangeSelection() {
  const range = {
    from: new Date(2026, 5, 22),
    to: new Date(2026, 5, 26),
  };

  return (
    <div className="w-fit rounded-lg border bg-card">
      <Calendar
        mode="range"
        selected={range}
        defaultMonth={new Date(2026, 5, 1)}
        today={new Date(2026, 5, 24)}
      />
    </div>
  );
}
