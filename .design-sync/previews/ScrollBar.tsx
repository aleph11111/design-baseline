import { ScrollArea, ScrollBar } from "design-baseline";

const COVERS = [
  { title: "Abstract Peaks", artist: "Nadia Reyes" },
  { title: "Neon Corridor", artist: "Tomas Lund" },
  { title: "Quiet Harbor", artist: "Wren Okafor" },
  { title: "Slow Signal", artist: "June Park" },
  { title: "Copper Field", artist: "Idris Amara" },
  { title: "Late Bloom", artist: "Selin Kaya" },
];

// Horizontal ScrollArea explicitly composed with a horizontal ScrollBar —
// a media rail is the classic use case for this subpart.
export function HorizontalRail() {
  return (
    <ScrollArea type="always" className="w-80 whitespace-nowrap rounded-md border">
      <div className="flex gap-4 p-4" style={{ width: "max-content" }}>
        {COVERS.map((cover) => (
          <figure key={cover.title} className="w-32 shrink-0 space-y-2">
            <div
              className="flex w-32 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground"
              style={{ height: 128 }}
            >
              {cover.title
                .split(" ")
                .map((w) => w[0])
                .join("")}
            </div>
            <figcaption className="text-xs">
              <div className="font-medium truncate">{cover.title}</div>
              <div className="text-muted-foreground truncate">{cover.artist}</div>
            </figcaption>
          </figure>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

const REGIONS = [
  "North America", "EMEA", "APAC", "LATAM", "ANZ", "Nordics", "DACH", "Benelux",
];

// A horizontal chip rail — a narrower/shorter composition of the same
// pairing (filter pills that overflow the available width).
export function ChipRail() {
  return (
    <ScrollArea type="always" className="w-72 whitespace-nowrap rounded-md border">
      <div className="flex gap-2 p-3" style={{ width: "max-content" }}>
        {REGIONS.map((region) => (
          <span
            key={region}
            className="shrink-0 rounded-full border px-3 py-1 text-xs font-medium"
          >
            {region}
          </span>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
