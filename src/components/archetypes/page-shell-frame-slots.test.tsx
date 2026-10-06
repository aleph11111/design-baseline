import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { PageShellFrameProps } from "../layout/PageFrame";
import { ListWithDetailShell, type ListWithDetailShellProps } from "./list-with-detail";
import { SettingsTableShell, type SettingsTableShellProps } from "./settings-table";
import { GroupedListShell, type GroupedListShellProps } from "./grouped-list";
import { BoardShell, type BoardShellProps } from "./kanban-board";
import { MatrixGridShell, type MatrixGridShellProps } from "./matrix-grid";
import { CalendarShell, type CalendarShellProps } from "./calendar";
import { DashboardShell, type DashboardShellProps } from "./analytics-dashboard";
import { FeedShell, type FeedShellProps } from "./feed-inbox";
import {
  StatementWithFiltersShell,
  type StatementWithFiltersShellProps,
} from "./statement-with-filters";

// Every full-frame page shell takes every shared `PageFrame` slot and forwards
// it — a shell typed by a hand-picked `Pick<PageFrameProps, …>` silently drops
// each slot it forgets (the mobile filter-sheet slots were exactly that).

// Type-level gate (`tsc --noEmit` covers this file): a shell whose props lack a
// shared slot fails to compile here. `except` names a slot the shell derives
// itself by contract (settings-table's `count`).
type TakesEveryFrameSlot<P, except extends keyof PageShellFrameProps = never> =
  Exclude<keyof PageShellFrameProps, except> extends keyof P ? true : false;
const fullFrameShells: true[] = [
  true satisfies TakesEveryFrameSlot<ListWithDetailShellProps<unknown>>,
  true satisfies TakesEveryFrameSlot<SettingsTableShellProps<unknown>, "count">,
  true satisfies TakesEveryFrameSlot<GroupedListShellProps>,
  true satisfies TakesEveryFrameSlot<BoardShellProps>,
  true satisfies TakesEveryFrameSlot<MatrixGridShellProps<unknown>>,
  true satisfies TakesEveryFrameSlot<CalendarShellProps>,
  true satisfies TakesEveryFrameSlot<DashboardShellProps>,
  true satisfies TakesEveryFrameSlot<FeedShellProps>,
  true satisfies TakesEveryFrameSlot<StatementWithFiltersShellProps>,
];
void fullFrameShells;

vi.mock("../../hooks/use-mobile", () => ({ useIsMobile: () => true }));
afterEach(cleanup);

type Row = { id: string; name: string };
const rows: Row[] = [{ id: "a", name: "Alpha" }];
const columns = [{ key: "name", header: "Name", cell: (r: Row) => r.name, isIdentifier: true }];

const onResetFilters = vi.fn();
const frame = {
  title: "Seite",
  toolbar: <span>Jahr-Filter</span>,
  filterCount: 2,
  filterSummary: "2026 · Ist",
  onResetFilters,
  filterLabels: { filter: "Filtern", done: "Fertig", reset: "Zurücksetzen" },
} satisfies PageShellFrameProps;

const shells: [string, () => React.ReactElement][] = [
  ["ListWithDetailShell", () => <ListWithDetailShell {...frame} rows={rows} columns={columns} getRowId={(r) => r.id} />],
  ["SettingsTableShell", () => <SettingsTableShell {...frame} rows={rows} columns={columns} getRowId={(r) => r.id} />],
  ["GroupedListShell", () => <GroupedListShell {...frame} />],
  ["BoardShell", () => <BoardShell {...frame}>{null}</BoardShell>],
  ["MatrixGridShell", () => <MatrixGridShell {...frame} columns={[]} rows={[]} />],
  ["CalendarShell", () => <CalendarShell {...frame} days={[]} />],
  ["DashboardShell", () => <DashboardShell {...frame}>{null}</DashboardShell>],
  ["FeedShell", () => <FeedShell {...frame}>{null}</FeedShell>],
  ["StatementWithFiltersShell", () => <StatementWithFiltersShell {...frame}>{null}</StatementWithFiltersShell>],
];

describe.each(shells)("%s — mobile filter-sheet slots", (_name, renderShell) => {
  it("forwards filterCount, filterSummary, onResetFilters and filterLabels to PageFrame", () => {
    render(renderShell());
    expect(screen.getByText("2026 · Ist")).toBeTruthy();
    const trigger = screen.getByRole("button", { name: /^Filtern/ });
    expect(within(trigger).getByText("2")).toBeTruthy();
    fireEvent.click(trigger);
    const sheet = screen.getByRole("dialog");
    expect(within(sheet).getByText("Jahr-Filter")).toBeTruthy();
    expect(within(sheet).getByRole("button", { name: "Fertig" })).toBeTruthy();
    onResetFilters.mockClear();
    fireEvent.click(within(sheet).getByRole("button", { name: "Zurücksetzen" }));
    expect(onResetFilters).toHaveBeenCalledOnce();
  });
});
