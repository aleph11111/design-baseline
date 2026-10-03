import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { TooltipProvider } from "../ui/tooltip";
import { SectionCard } from "./SectionCard";
import { FULL_BLEED_CLASS } from "./surface";
import { DetailOverviewShell } from "../archetypes/detail-overview/DetailOverviewShell";
import { ListWithDetailShell, type ListColumn } from "../archetypes/list-with-detail/ListWithDetailShell";
import { CalendarShell } from "../archetypes/calendar/CalendarShell";
import { BoardShell } from "../archetypes/kanban-board/BoardShell";
import { MatrixGridShell } from "../archetypes/matrix-grid/MatrixGridShell";

// ListWithDetailShell's useIsMobile reads matchMedia, which jsdom lacks.
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;

afterEach(cleanup);

type Row = { id: string; name: string };
const columns: ListColumn<Row>[] = [
  { key: "name", header: "Name", cell: (row) => row.name, isIdentifier: true },
];

// Every full-bleed archetype shell (ADR-0007 §1).
const shells: [string, () => React.ReactElement][] = [
  ["ListWithDetailShell", () => <ListWithDetailShell title="People" rows={[{ id: "1", name: "Ada" }]} columns={columns} getRowId={(r) => r.id} />],
  ["CalendarShell", () => <CalendarShell title="Week" days={[{ id: "mon", dow: "Mo", date: "22", events: [] }]} />],
  ["BoardShell", () => <BoardShell title="Board"><div /></BoardShell>],
  ["MatrixGridShell", () => <MatrixGridShell title="Grid" columns={[{ key: "mon", label: "Mon" }]} rows={[{ id: "1", label: "Ada", cells: { mon: "P" } }]} renderCell={(c) => c.cell} />],
];

const bleeds = (el: HTMLElement) => el.querySelector(`.${FULL_BLEED_CLASS}`) !== null;

describe("full-bleed marker is scoped to the page's own surface", () => {
  for (const [name, shell] of shells) {
    it(`${name}: marks itself at page root, not when nested in a surface`, () => {
      const root = render(<TooltipProvider>{shell()}</TooltipProvider>);
      expect(bleeds(root.container)).toBe(true);
      cleanup();

      const inCard = render(<TooltipProvider><SectionCard title="Embedded">{shell()}</SectionCard></TooltipProvider>);
      expect(bleeds(inCard.container)).toBe(false);
      cleanup();

      const inDetail = render(
        <TooltipProvider>
          <DetailOverviewShell title="Record" summary={<div />} content={shell()} />
        </TooltipProvider>,
      );
      expect(bleeds(inDetail.container)).toBe(false);
    });
  }
});
