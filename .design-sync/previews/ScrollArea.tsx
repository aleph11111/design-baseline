import { ScrollArea, Separator } from "design-baseline";

const TAGS = [
  "design-system", "tokens", "accessibility", "radix", "tailwind",
  "typography", "color", "motion", "layout", "grid",
  "icons", "forms", "dark-mode", "responsive", "components",
];

// Bounded vertical list — a fixed-height container with overflowing rows,
// the canonical use case (e.g. a tag list or activity feed panel).
export function VerticalList() {
  return (
    <ScrollArea
      type="always"
      className="w-72 rounded-md border p-4"
      style={{ height: 256 }}
    >
      <h4 className="mb-3 text-sm font-medium leading-none">Tags</h4>
      {TAGS.map((tag) => (
        <div key={tag}>
          <div className="text-sm py-2">{tag}</div>
          <Separator />
        </div>
      ))}
    </ScrollArea>
  );
}

// Bounded card grid — a taller panel of stacked entries, showing the same
// primitive used for a longer, denser scroll (e.g. a notification list).
export function ActivityFeed() {
  const entries = [
    "Priya merged PR #482 into main",
    "Automated build #217 passed",
    "Marcus commented on \"Q3 revenue chart\"",
    "New release v2.4.0 published",
    "Sana requested review on #486",
    "Deploy to staging succeeded",
    "Ahmed opened issue #91: sidebar overflow",
    "Weekly digest sent to 12 subscribers",
  ];
  return (
    <ScrollArea
      type="always"
      className="w-80 rounded-md border"
      style={{ height: 288 }}
    >
      <div className="p-4 space-y-3">
        {entries.map((entry) => (
          <div key={entry} className="text-sm text-foreground">
            {entry}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
