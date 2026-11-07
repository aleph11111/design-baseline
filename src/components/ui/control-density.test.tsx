import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Button } from "./button";
import { Input } from "./input";
import { SearchInput } from "./search-input";
import { Tabs, TabsList, TabsTrigger } from "./tabs";
import { SegmentedControl } from "./segmented-control";
import { Select, SelectTrigger, SelectValue } from "./select";
import { ToggleField } from "./toggle-field";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { ControlDensityProvider, OutsideToolbarBand, TOUCH_TARGET_CLASS, ToolbarBandContext, ToolbarSizeContext } from "./toolbar-band";

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

  it("resolves unsized controls and an explicit sm to h-11 under touch", () => {
    render(
      <ControlDensityProvider density="touch">
        <Controls />
      </ControlDensityProvider>,
    );
    expect(cls(screen.getByText("btn"))).toContain("h-11");
    expect(cls(screen.getByText("small"))).toContain("h-11");
    expect(cls(screen.getByLabelText("in"))).toContain("h-11");
    expect(cls(screen.getByRole("searchbox"))).toContain("h-11");
    expect(cls(screen.getByTestId("list"))).toContain("h-11");
    expect(cls(screen.getByTestId("sel"))).toContain("h-11");
    expect(cls(screen.getByRole("button", { name: /clear/i }))).toContain("h-11");
    expect(cls(screen.getByRole("switch"))).toContain("h-11");
    expect(screen.getByRole("radiogroup").outerHTML).toContain("h-11");
  });

  describe("unset density follows the viewport", () => {
    const original = { mm: window.matchMedia, w: window.innerWidth };
    const viewport = (width: number) => {
      window.innerWidth = width;
      // useIsMobile asks `(max-width: 767px)`
      window.matchMedia = ((query: string) => ({
        matches: width < 768 && /max-width/.test(query),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      })) as typeof window.matchMedia;
    };
    afterEach(() => {
      window.matchMedia = original.mm;
      window.innerWidth = original.w;
    });

    it("is touch on a phone", () => {
      viewport(390);
      render(
        <ControlDensityProvider>
          <Button>btn</Button>
          <Checkbox aria-label="row" />
          <Switch aria-label="on" />
        </ControlDensityProvider>,
      );
      expect(cls(screen.getByText("btn"))).toContain("h-11");
      // 44pt hit areas around boxes that keep their size
      expect(cls(screen.getByLabelText("row"))).toContain("h-4");
      expect(cls(screen.getByLabelText("row"))).toContain(TOUCH_TARGET_CLASS);
      expect(cls(screen.getByLabelText("on"))).toContain(TOUCH_TARGET_CLASS);
    });

    it("stays default on a laptop", () => {
      viewport(1512);
      render(
        <ControlDensityProvider>
          <Button>btn</Button>
          <Checkbox aria-label="row" />
        </ControlDensityProvider>,
      );
      expect(cls(screen.getByText("btn"))).toContain("h-9");
      expect(cls(screen.getByText("btn"))).not.toContain("after:");
      expect(cls(screen.getByLabelText("row"))).not.toContain("after:");
    });

    it("explicit density wins at both widths", () => {
      viewport(390);
      render(
        <ControlDensityProvider density="default">
          <Button>phone-opt-out</Button>
        </ControlDensityProvider>,
      );
      expect(cls(screen.getByText("phone-opt-out"))).toContain("h-9");
      cleanup();
      viewport(1512);
      render(
        <ControlDensityProvider density="touch">
          <Button>desk-touch</Button>
        </ControlDensityProvider>,
      );
      expect(cls(screen.getByText("desk-touch"))).toContain("h-11");
    });
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

describe("SearchInput band floor", () => {
  const wrapper = (el: HTMLElement) => el.parentElement as HTMLElement;

  it("floors at 14rem in a band, overridable via minWidth", () => {
    render(
      <ToolbarBandContext.Provider value={true}>
        <SearchInput aria-label="a" />
        <SearchInput aria-label="b" minWidth="20rem" />
      </ToolbarBandContext.Provider>
    );
    expect(wrapper(screen.getByLabelText("a")).style.minWidth).toBe("14rem");
    expect(wrapper(screen.getByLabelText("b")).style.minWidth).toBe("20rem");
  });

  it("is unchanged outside a band", () => {
    render(<SearchInput aria-label="c" minWidth="20rem" />);
    expect(wrapper(screen.getByLabelText("c")).style.minWidth).toBe("");
  });
});

describe("explicit compact steps under touch density (useTouchLift)", () => {
  function Compact() {
    return (
      <>
        <Button size="sm">b</Button>
        <Input aria-label="sm" size="sm" />
        <Input aria-label="sm14" size="sm14" />
        <SearchInput aria-label="search" inputSize="sm" />
        <SegmentedControl
          aria-label="seg"
          size="sm"
          value="a"
          onValueChange={() => {}}
          options={[{ value: "a", label: "A" }]}
        />
        <ToggleField aria-label="tog" size="sm">t</ToggleField>
        <Select>
          <SelectTrigger data-testid="sel" size="sm">
            <SelectValue />
          </SelectTrigger>
        </Select>
      </>
    );
  }
  const heights = () => [
    cls(screen.getByText("b")),
    cls(screen.getByLabelText("sm")),
    cls(screen.getByLabelText("sm14")),
    cls(screen.getByRole("searchbox")),
    screen.getByRole("radiogroup").outerHTML,
    cls(screen.getByRole("switch")),
    cls(screen.getByTestId("sel")),
  ];

  it("lifts sm / sm14 to h-11 under touch", () => {
    render(
      <ControlDensityProvider density="touch">
        <Compact />
      </ControlDensityProvider>,
    );
    for (const c of heights()) expect(c).toContain("h-11");
  });

  it.each([
    ["without a provider", (n: React.ReactNode) => n],
    ["with density=default", (n: React.ReactNode) => <ControlDensityProvider density="default">{n}</ControlDensityProvider>],
  ])("keeps them compact %s", (_, wrap) => {
    render(<>{wrap(<Compact />)}</>);
    for (const c of heights()) expect(c).not.toContain("h-11");
    expect(cls(screen.getByText("b"))).toContain("h-8");
    expect(cls(screen.getByTestId("sel"))).toContain("h-8");
  });

  it("keeps an explicit default at h-9 under touch", () => {
    render(
      <ControlDensityProvider density="touch">
        <Input aria-label="d" size="default" />
        <Button size="default">bd</Button>
      </ControlDensityProvider>,
    );
    expect(cls(screen.getByLabelText("d"))).toContain("h-9");
    expect(cls(screen.getByText("bd"))).toContain("h-9");
  });
});
