import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Button } from "./button";
import { Input } from "./input";
import { SearchInput } from "./search-input";
import { Tabs, TabsList, TabsTrigger } from "./tabs";
import { SegmentedControl } from "./segmented-control";
import { Select, SelectTrigger, SelectValue } from "./select";
import { ToggleField } from "./toggle-field";
import { ControlDensityProvider, OutsideToolbarBand, ToolbarSizeContext } from "./toolbar-band";

afterEach(cleanup);

function Controls() {
  return (
    <>
      <Button>btn</Button>
      <Button size="sm">small</Button>
      <Input aria-label="in" />
      <SearchInput clearable value="x" />
      <Tabs defaultValue="a">
        <TabsList data-testid="list">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>
      <SegmentedControl
        aria-label="seg"
        value="a"
        onValueChange={() => {}}
        options={[{ value: "a", label: "A" }]}
      />
      <ToggleField aria-label="tog">t</ToggleField>
      <Select>
        <SelectTrigger data-testid="sel">
          <SelectValue />
        </SelectTrigger>
      </Select>
    </>
  );
}

const cls = (el: HTMLElement) => el.className;

describe("app control density", () => {
  it("keeps today's heights without a provider", () => {
    render(<Controls />);
    expect(cls(screen.getByText("btn"))).toContain("h-9");
    expect(cls(screen.getByLabelText("in"))).toContain("h-9");
    expect(cls(screen.getByTestId("list"))).toContain("h-9");
    expect(cls(screen.getByTestId("sel"))).toContain("h-9");
    expect(cls(screen.getByRole("searchbox"))).toContain("h-9");
    expect(cls(screen.getByRole("tab"))).not.toContain("h-9");
    expect(cls(screen.getByRole("tablist")).startsWith("inline-flex h-9 items-center")).toBe(true);
    expect(cls(screen.getByRole("switch"))).toContain("h-9");
    expect(screen.getByRole("radiogroup").outerHTML).toContain("h-9");
  });

  it("band step (filter sheet) still sets lg on ladder fields but leaves Button/Tabs/SearchInput alone", () => {
    render(
      <ToolbarSizeContext.Provider value="lg">
        <Controls />
      </ToolbarSizeContext.Provider>,
    );
    expect(cls(screen.getByLabelText("in"))).toContain("h-11");
    expect(cls(screen.getByTestId("sel"))).toContain("h-11");
    expect(cls(screen.getByText("btn"))).toContain("h-9");
    expect(cls(screen.getByTestId("list"))).toContain("h-9");
  });

  it("resolves unsized controls to h-11 under touch; explicit size wins", () => {
    render(
      <ControlDensityProvider density="touch">
        <Controls />
      </ControlDensityProvider>,
    );
    expect(cls(screen.getByText("btn"))).toContain("h-11");
    expect(cls(screen.getByText("small"))).toContain("h-8");
    expect(cls(screen.getByLabelText("in"))).toContain("h-11");
    expect(cls(screen.getByRole("searchbox"))).toContain("h-11");
    expect(cls(screen.getByTestId("list"))).toContain("h-11");
    expect(cls(screen.getByTestId("sel"))).toContain("h-11");
    expect(cls(screen.getByRole("button", { name: /clear/i }))).toContain("h-11");
    expect(cls(screen.getByRole("switch"))).toContain("h-11");
    expect(screen.getByRole("radiogroup").outerHTML).toContain("h-11");
  });

  it("persists across overlays (OutsideToolbarBand)", () => {
    render(
      <ControlDensityProvider density="touch">
        <OutsideToolbarBand>
          <Button>btn</Button>
        </OutsideToolbarBand>
      </ControlDensityProvider>,
    );
    expect(cls(screen.getByText("btn"))).toContain("h-11");
  });
});
