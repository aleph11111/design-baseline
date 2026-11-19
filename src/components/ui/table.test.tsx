import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { ControlDensityProvider } from "./toolbar-band";

const table = (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>H</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>C</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

describe("Table density (ADR-0017)", () => {
  it("is compact off touch density", () => {
    const { container } = render(<ControlDensityProvider density="default">{table}</ControlDensityProvider>);
    expect(container.querySelector("table")!.className).toContain("text-[13px]");
    expect(container.querySelector("th")!.className).toContain("h-9");
    expect(container.querySelector("td")!.className).toContain("py-2");
  });

  it("keeps the roomy step under touch density", () => {
    const { container } = render(<ControlDensityProvider density="touch">{table}</ControlDensityProvider>);
    expect(container.querySelector("table")!.className).toContain("text-sm");
    expect(container.querySelector("th")!.className).toContain("h-12");
    expect(container.querySelector("td")!.className).toContain("p-4");
  });

  it("lets a consumer padding override win", () => {
    const { container } = render(
      <Table><TableBody><TableRow><TableCell className="px-1">C</TableCell></TableRow></TableBody></Table>,
    );
    const cls = container.querySelector("td")!.className;
    expect(cls).toContain("px-1");
    expect(cls).not.toContain("px-3");
  });
});
