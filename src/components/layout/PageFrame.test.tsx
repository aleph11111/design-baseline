import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { PageFrame } from "./PageFrame";
import { SelectField } from "../archetypes/raw-select";
import { SegmentedControl } from "../ui/segmented-control";

afterEach(cleanup);

describe("PageFrame — one page frame (ADR-0008)", () => {
  it("renders the title once, as the page h1, and no title on the surface", () => {
    const { container } = render(
      <PageFrame title="Profit & Loss" toolbar={<button>Year</button>}>
        body
      </PageFrame>,
    );
    expect(screen.getAllByText("Profit & Loss")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Profit & Loss",
    );
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
  });

  it("puts toolbar, count and the view menu in one band", () => {
    render(
      <PageFrame
        title="T"
        toolbar={<span>scope</span>}
        count="12 results"
        viewOptions={<div />}
        viewOptionsLabel="Ansicht"
      >
        body
      </PageFrame>,
    );
    const band = screen.getByText("scope").closest(".border-b") as HTMLElement;
    expect(band.textContent).toContain("12 results");
    expect(band.textContent).toContain("Ansicht");
  });

  it("renders no band without toolbar, count or view options", () => {
    const { container } = render(<PageFrame title="T">body</PageFrame>);
    expect(container.querySelector(".border-b")).toBeNull();
  });

  it("treats a false slot as absent", () => {
    const show = false;
    const { container } = render(
      <PageFrame title="T" toolbar={show && <span>x</span>}>
        body
      </PageFrame>,
    );
    expect(container.querySelector(".border-b")).toBeNull();
  });

  it("a nested frame titles itself h2 and opens no second surface", () => {
    const { container } = render(
      <PageFrame title="Settings">
        <PageFrame title="Members">body</PageFrame>
      </PageFrame>,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "Members",
    );
    expect(container.querySelectorAll(".bg-surface-raised")).toHaveLength(1);
  });
});

describe("PageFrame — mobile filter sheet (below md)", () => {
  const FILTERS = [
    "Jahr",
    "Monat",
    "Szenario",
    "Vergleich",
    "Kostenstelle",
    "Konto",
  ];

  function setViewport(width: number) {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: width,
    });
    window.matchMedia = ((query: string) => ({
      matches: width < 768,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }

  afterEach(() => setViewport(1024));

  function renderVariance() {
    return render(
      <PageFrame
        title="Abweichung"
        viewSwitch={
          <SegmentedControl
            aria-label="Ansicht"
            value="plan"
            onValueChange={() => {}}
            options={[
              { value: "plan", label: "Plan" },
              { value: "check", label: "Checkliste" },
            ]}
          />
        }
        toolbar={FILTERS.map((label) => (
          <SelectField
            key={label}
            label={label}
            value="a"
            onChange={() => {}}
            options={[{ value: "a", label: `${label} A` }]}
          />
        ))}
        filterCount={3}
        filterSummary="2026 · Ist · Alle"
        viewOptions={<div />}
        viewOptionsLabel="Ansicht anpassen"
      >
        body
      </PageFrame>,
    );
  }

  it("renders one row: Filter button with the count, the summary, the view menu icon", () => {
    setViewport(430);
    renderVariance();
    const filter = screen.getByRole("button", { name: /Filter/ });
    expect(within(filter).getByText("3")).toBeTruthy();
    expect(screen.getByText("2026 · Ist · Alle")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Ansicht anpassen" }),
    ).toBeTruthy();
    // The filters are not in the band — they live in the closed sheet.
    expect(screen.queryByRole("combobox", { name: "Jahr" })).toBeNull();
  });

  it("the sheet holds every toolbar filter as a joined-label row at the touch step", () => {
    setViewport(430);
    renderVariance();
    fireEvent.click(screen.getByRole("button", { name: /Filter/ }));
    const sheet = screen.getByRole("dialog");
    for (const label of FILTERS) {
      const trigger = within(sheet).getByRole("combobox", { name: label });
      expect(trigger.querySelector("[data-joined-label]")?.textContent).toBe(
        label,
      );
      expect(trigger.className).toContain("h-11");
    }
  });

  it("stacks fields the app wrapped in its own flex row, one per row", () => {
    setViewport(430);
    render(
      <PageFrame
        title="Abweichung"
        toolbar={
          <form className="flex gap-2">
            <div className="flex">
              {FILTERS.slice(0, 3).map((label) => (
                <SelectField
                  key={label}
                  label={label}
                  value="a"
                  onChange={() => {}}
                  options={[{ value: "a", label: `${label} A` }]}
                />
              ))}
            </div>
          </form>
        }
        filterCount={3}
      >
        body
      </PageFrame>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Filter/ }));
    const sheet = document.querySelector("[data-filter-sheet]") as HTMLElement;
    // jsdom has no stylesheet, so layout is asserted through what the rules key on:
    // every wrapper between sheet and field is a div/form/fieldset carrying `flex`
    // (matched by the sheet's restack rule), and the joined trigger is a button
    // that rule can never match — so the 130px label column is untouched.
    const rule = "[&_:is(div,form,fieldset).flex]:flex-col";
    expect(sheet.className).toContain(rule);
    expect(sheet.className).toContain(
      "[&_:is(div,form,fieldset).flex>*]:w-full!",
    );
    const triggers = within(sheet).getAllByRole("combobox");
    expect(triggers.length).toBe(3);
    for (const t of triggers) {
      expect(t.tagName).toBe("BUTTON");
      expect(t.querySelector("[data-joined-label]")).not.toBeNull();
      for (
        let el = t.parentElement;
        el && el !== sheet;
        el = el.parentElement
      ) {
        if (el.className.includes("flex"))
          expect(["DIV", "FORM", "FIELDSET"]).toContain(el.tagName);
      }
    }
  });

  it("keeps the view switch outside the sheet", () => {
    setViewport(430);
    renderVariance();
    fireEvent.click(screen.getByRole("button", { name: /Filter/ }));
    const sheet = screen.getByRole("dialog");
    expect(within(sheet).queryByRole("radiogroup")).toBeNull();
    // Radix hides the page behind the modal from the a11y tree; query the DOM.
    expect(
      document.querySelector('[data-view-switch] [role="radiogroup"]'),
    ).not.toBeNull();
  });

  it("renders the first fields inline at md and wider; the rest sit behind Filter", () => {
    setViewport(1024);
    renderVariance();
    expect(screen.getByRole("combobox", { name: "Jahr" }).className).toContain(
      "h-9",
    );
    expect(screen.getByRole("button", { name: /^Filter/ })).toBeTruthy();
  });
});

describe("PageFrame — desktop toolbar cap", () => {
  const field = (n: number) => <button key={n}>field{n}</button>;
  const realMatchMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = realMatchMedia;
  });
  beforeEach(() => {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  });

  it("keeps up to the cap inline and renders no Filter trigger", () => {
    render(
      <PageFrame title="T" toolbar={<>{[1, 2, 3, 4].map(field)}</>}>
        body
      </PageFrame>,
    );
    expect(screen.getAllByRole("button", { name: /^field/ })).toHaveLength(4);
    expect(screen.queryByRole("button", { name: /^Filter/ })).toBeNull();
  });

  it("collapses fields past the cap into the filter sheet instead of wrapping", () => {
    render(
      <PageFrame title="T" toolbar={<>{[1, 2, 3, 4, 5, 6].map(field)}</>}>
        body
      </PageFrame>,
    );
    expect(screen.getAllByRole("button", { name: /^field/ })).toHaveLength(4);
    expect(screen.queryByText("field5")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^Filter/ }));
    const sheet = document.querySelector("[data-filter-sheet]") as HTMLElement;
    expect(within(sheet).getByText("field5")).toBeTruthy();
    expect(within(sheet).getByText("field6")).toBeTruthy();
    expect(within(sheet).queryByText("field1")).toBeNull();
  });
});
