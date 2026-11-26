import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { TooltipProvider } from "../ui/tooltip";
import { SectionCard } from "./SectionCard";
import { PageFrame } from "./PageFrame";
import { DOCUMENT_COLUMN_CLASS, FULL_BLEED_CLASS, useDocumentColumnClass } from "./surface";
import { TransactionDocumentDemo } from "../../examples/transaction-document-demo";
import { DetailOverviewShell } from "../archetypes/detail-overview/DetailOverviewShell";
import { DetailSection } from "../archetypes/detail-overview/DetailSection";
import { ListWithDetailShell, type ListColumn } from "../archetypes/list-with-detail/ListWithDetailShell";
import { CalendarShell } from "../archetypes/calendar/CalendarShell";
import { BoardShell } from "../archetypes/kanban-board/BoardShell";
import { MatrixGridShell } from "../archetypes/matrix-grid/MatrixGridShell";
import { StatementWithFiltersShell } from "../archetypes/statement-with-filters/StatementWithFiltersShell";

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
  ["StatementWithFiltersShell", () => <StatementWithFiltersShell title="P&L"><div /></StatementWithFiltersShell>],
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
          {/* Stack body (ADR-0015): content sits in its section card, per contract. */}
          <DetailOverviewShell title="Record" summary={<div />} content={<DetailSection title="Embedded">{shell()}</DetailSection>} />
        </TooltipProvider>,
      );
      expect(bleeds(inDetail.container)).toBe(false);
    });
  }
});

describe("full-bleed marker does not leak out of a PageFrame body", () => {
  for (const [name, shell] of shells) {
    for (const body of ["frame", "stack"] as const) {
      it(`${name}: not marked inside a body="${body}" PageFrame`, () => {
        const { container } = render(
          <TooltipProvider><PageFrame title="Page" body={body}>{shell()}</PageFrame></TooltipProvider>,
        );
        expect(bleeds(container)).toBe(false);
      });
    }
  }
});

describe("document-column marker is scoped to the page's own surface", () => {
  const Probe = () => <div data-testid="probe" className={useDocumentColumnClass()} />;
  const marked = (el: HTMLElement) => el.querySelector(`.${DOCUMENT_COLUMN_CLASS}`) !== null;

  it("transaction-document marks the column at page root", () => {
    expect(marked(render(<TooltipProvider><TransactionDocumentDemo /></TooltipProvider>).container)).toBe(true);
  });

  for (const body of ["frame", "stack"] as const) {
    it(`not marked inside a body="${body}" PageFrame`, () => {
      expect(marked(render(<PageFrame title="Page" body={body}><Probe /></PageFrame>).container)).toBe(false);
    });
  }

  it("not marked inside a raised surface; marked bare", () => {
    expect(marked(render(<SectionCard title="Card"><Probe /></SectionCard>).container)).toBe(false);
    cleanup();
    expect(marked(render(<Probe />).container)).toBe(true);
  });
});
