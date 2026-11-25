import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { DashboardAssignmentList } from "../archetypes/analytics-dashboard/DashboardAssignmentList";
import { DashboardGrid } from "../archetypes/analytics-dashboard/DashboardGrid";
import { DashboardPeriodPair } from "../archetypes/analytics-dashboard/DashboardPeriodPair";
import { KeyValueList } from "../archetypes/detail-overview/KeyValueList";
import { SectionNavShell } from "./SectionNav";
import { CardGridBody } from "../archetypes/list-with-detail/presentations/CardGridBody";
import { StructureBuilderShell } from "../archetypes/structure-builder/StructureBuilderShell";

// Layout switches key on the container (@container), not the viewport; className
// lands on the wrapper the parent lays out.
describe("container-query layout primitives", () => {
  it("DashboardGrid: wrapper takes className, grid steps at @4xl/@5xl", () => {
    const { container } = render(<DashboardGrid className="lg:col-span-2">{null}</DashboardGrid>);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain("@container");
    expect(wrapper.className).toContain("lg:col-span-2");
    const grid = wrapper.firstElementChild as HTMLElement;
    expect(grid.className).toContain("@4xl:grid-cols-2");
    expect(grid.className).toContain("@5xl:grid-cols-3");
    expect(grid.className).not.toMatch(/(^| )(sm|md|lg):/);
  });

  it("DashboardAssignmentList: the list's columns step at the list's own container (@4xl/@5xl), not the viewport", () => {
    const { container } = render(
      <DashboardAssignmentList title="Shops" onToggle={() => {}} targets={[{ id: "a", label: "North", assigned: true }]} />,
    );
    const wrapper = container.querySelector('[class*="@container"]')!;
    expect(wrapper.className).toContain("@container");
    const list = wrapper.firstElementChild as HTMLElement;
    expect(list.className).toContain("grid-cols-1");
    expect(list.className).toContain("@4xl:grid-cols-2");
    expect(list.className).toContain("@5xl:grid-cols-3");
    expect(container.innerHTML).not.toMatch(/(^|[ "])(sm|md|lg):/);
  });

  it("DashboardPeriodPair: split keys on the card's container (@4xl), not the viewport", () => {
    const { container } = render(
      <DashboardPeriodPair title="Revenue" month={{ label: "Month", value: "1" }} ytd={{ label: "YTD", value: "10" }} />,
    );
    const split = container.querySelector('[class*="@4xl:grid-cols-2"]') as HTMLElement;
    expect(split.className).toContain("grid-cols-1");
    expect(split.className).toContain("divide-y");
    expect(split.className).toContain("@4xl:grid-cols-2");
    expect(split.className).toContain("@4xl:divide-x");
    expect(split.parentElement!.className).toContain("@container");
    expect(container.innerHTML).not.toMatch(/(^|[ "])(sm|md|lg):/);
  });

  it("KeyValueList is the container the rows query", () => {
    const { container } = render(<KeyValueList>{null}</KeyValueList>);
    expect((container.firstElementChild as HTMLElement).className).toContain("@container");
  });

  it("SectionNavShell: wrapper takes className, nav sits left from @4xl", () => {
    const { container } = render(
      <SectionNavShell groups={[]} pathname="/" renderLink={(_i, c) => <>{c}</>} className="h-96">
        x
      </SectionNavShell>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain("@container");
    expect(wrapper.className).toContain("h-96");
    expect((wrapper.firstElementChild as HTMLElement).className).toContain("@4xl:flex-row");
    expect(wrapper.innerHTML).not.toMatch(/(^|[ "])(sm|md|lg):/);
  });

  it("CardGridBody: @container wrapper, columns step at @4xl/@5xl", () => {
    const { container } = render(
      <CardGridBody rows={[{ id: "a", name: "A" }]} columns={[{ key: "name", header: "Name", isIdentifier: true, cell: (r: { name: string }) => r.name }]} getRowId={(r) => r.id} />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain("@container");
    expect((wrapper.firstElementChild as HTMLElement).className).toContain("@4xl:grid-cols-2");
    expect(wrapper.innerHTML).not.toMatch(/(^|[ "])(sm|md|lg):/);
  });

  it("StructureBuilderShell: tree/palette split keys on @4xl", () => {
    const { container } = render(
      <StructureBuilderShell title="T" paletteTitle="P" palette={<i />}>
        <b>tree</b>
      </StructureBuilderShell>,
    );
    expect(container.querySelector(".\\@container .grid")!.className).toContain("@4xl:grid-cols-3");
    expect(container.innerHTML).not.toMatch(/(^|[ "])lg:(grid-cols|col-span|border-l)/);
  });
});
