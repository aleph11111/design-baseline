import * as React from "react";
import { createPortal } from "react-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { PageFrame } from "./PageFrame";
import type { HeaderActions } from "./HeaderActions";
import { SelectField } from "../archetypes/raw-select";
import { NativeField } from "../archetypes/raw-input";
import { SegmentedControl } from "../ui/segmented-control";
import { ControlDensityProvider } from "../ui/toolbar-band";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../ui/sheet";
import { SectionCard } from "./SectionCard";

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

  it("lets long German labels wrap (not truncate) in the fixed 130px sheet column, for every joined row kind", () => {
    setViewport(430);
    render(
      <PageFrame
        title="Gruppen"
        toolbar={
          <>
            <SelectField
              label="Inhabergeführt"
              value="a"
              onChange={() => {}}
              options={[{ value: "a", label: "A" }]}
            />
            <SegmentedControl
              label="Konsolidierungsgruppe"
              value="a"
              onValueChange={() => {}}
              options={[
                { value: "a", label: "Alle" },
                { value: "b", label: "Offen" },
              ]}
            />
            <NativeField label="Inhabergeführt" type="number" value={1} onChange={() => {}} />
          </>
        }
        filterCount={3}
      >
        body
      </PageFrame>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Filter/ }));
    const sheet = document.querySelector("[data-filter-sheet]") as HTMLElement;
    // jsdom has no stylesheet: assert the rules the sheet applies, and that in every row
    // kind the `.truncate` span they target sits inside the joined label.
    for (const rule of [
      "[&_[data-joined-label]]:w-[130px]",
      "[&_[data-joined-label]_.truncate]:line-clamp-2",
      "[&_[data-joined-label]_.truncate]:whitespace-normal!",
      "[&_[data-joined-label]_.truncate]:[overflow-wrap:anywhere]",
    ])
      expect(sheet.className).toContain(rule);
    const labels = [...sheet.querySelectorAll("[data-joined-label]")];
    expect(labels.map((l) => l.textContent)).toEqual([
      "Inhabergeführt",
      "Konsolidierungsgruppe",
      "Inhabergeführt",
    ]);
    for (const l of labels) expect(l.querySelector(".truncate")).not.toBeNull();
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

  it("wraps the desktop view switch in a shrinkable scroll slot", () => {
    setViewport(1024);
    renderVariance();
    const slot = document.querySelector("[data-view-switch]");
    expect(slot?.className).toContain("max-w-full");
    expect(slot?.className).toContain("shrink-0");
    expect(slot?.className).toContain("overflow-x-auto");
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

describe("PageFrame — stack body (ADR-0015)", () => {
  function setViewport(width: number) {
    Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
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

  function renderStack() {
    return render(
      <PageFrame
        title="Order 4711"
        body="stack"
        toolbar={<NativeField label="Suche" value="" onChange={() => {}} />}
        count="3 lines"
      >
        <SectionCard title="Lines">lines</SectionCard>
        <SectionCard title="Totals">totals</SectionCard>
      </PageFrame>,
    );
  }

  it("renders the page header, then a gap container of bordered cards with no frame around them", () => {
    const { container } = renderStack();
    expect(screen.getByRole("heading", { level: 1, name: "Order 4711" })).toBeTruthy();
    const stack = container.querySelector("[data-page-body=stack]") as HTMLElement;
    expect(stack.className).toContain("md:gap-5");
    // No SurfaceFrame: the cards are the stack's direct children, each un-nested.
    expect(stack.closest(".bg-surface-raised")).toBeNull();
    const cards = Array.from(stack.children) as HTMLElement[];
    expect(cards).toHaveLength(2);
    for (const card of cards) {
      expect(card.tagName).toBe("SECTION");
      expect(card.className).toMatch(/\bborder\b/);
      expect(card.className).toContain("bg-surface-raised");
    }
  });

  it("renders the toolbar band in the first card only, above its title bar", () => {
    const { container } = renderStack();
    const bands = container.querySelectorAll("[data-toolbar-band]");
    expect(bands).toHaveLength(1);
    const [first, second] = Array.from(container.querySelectorAll("section")) as [HTMLElement, HTMLElement];
    expect(first.firstElementChild?.hasAttribute("data-toolbar-band")).toBe(true);
    expect(within(first).getByText("3 lines")).toBeTruthy();
    expect(second.querySelector("[data-toolbar-band]")).toBeNull();
  });

  it("keeps the toolbar band as a band-only card when no child renders", () => {
    const { container } = render(
      <PageFrame title="T" body="stack" toolbar={<NativeField label="Suche" value="x" onChange={() => {}} />}>
        {null}
        {false}
      </PageFrame>,
    );
    expect(screen.getByRole("textbox", { name: "Suche" })).toBeTruthy();
    expect(container.querySelectorAll("[data-toolbar-band]")).toHaveLength(1);
  });

  it("renders no card when the stack has neither toolbar nor children", () => {
    const { container } = render(
      <PageFrame title="T" body="stack">
        {null}
      </PageFrame>,
    );
    expect((container.querySelector("[data-page-body=stack]") as HTMLElement).children).toHaveLength(0);
  });

  it("opens the mobile filter sheet from the first card's band", () => {
    setViewport(430);
    renderStack();
    expect(screen.queryByRole("textbox", { name: "Suche" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Filter/ }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Suche" })).toBeTruthy();
  });

  it("is ignored when nested: the sub-page joins the parent's surface", () => {
    const { container } = render(
      <PageFrame title="Order">
        <PageFrame title="Lines" body="stack">
          <SectionCard title="A">a</SectionCard>
        </PageFrame>
      </PageFrame>,
    );
    expect(container.querySelector("[data-page-body]")).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "Lines" })).toBeTruthy();
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

describe("PageFrame — touch density", () => {
  it("band View button and mobile view-options trigger resolve to the lg step", () => {
    render(
      <ControlDensityProvider density="touch">
        <PageFrame title="T" toolbar={<span>scope</span>} viewOptions={<div />} viewOptionsLabel="Ansicht">
          body
        </PageFrame>
      </ControlDensityProvider>,
    );
    expect(screen.getByRole("button", { name: /Ansicht/ }).className).toContain("h-11");
  });

  it("is unchanged without a provider", () => {
    render(
      <PageFrame title="T" toolbar={<span>scope</span>} viewOptions={<div />} viewOptionsLabel="Ansicht">
        body
      </PageFrame>,
    );
    expect(screen.getByRole("button", { name: /Ansicht/ }).className).toContain("h-9");
  });
});

describe("PageFrame inside an overlay (ADR-0008: drawers are not pages)", () => {
  it("renders no page heading or second surface in a Sheet, but keeps band, actions and body", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Drawer</SheetTitle>
          <SheetDescription>d</SheetDescription>
          <PageFrame title="Page" actions={<button>Act</button>} toolbar={<span>scope</span>}>
            body
          </PageFrame>
        </SheetContent>
      </Sheet>,
    );
    const sheet = screen.getByRole("dialog");
    expect(within(sheet).queryByText("Page")).toBeNull();
    expect(within(sheet).getAllByRole("heading").map((h) => h.textContent)).toEqual(["Drawer"]);
    expect(within(sheet).getByText("scope")).toBeTruthy();
    expect(within(sheet).getByRole("button", { name: "Act" })).toBeTruthy();
    expect(within(sheet).getByText("body")).toBeTruthy();
  });
});

describe("PageFrame inside a titled SectionCard (the section owns the heading)", () => {
  it("renders only the section heading; an untitled section keeps the frame's own", () => {
    const { container } = render(
      <PageFrame title="Item">
        <SectionCard title="Market Intelligence">
          <PageFrame title="Market Intelligence" actions={<button>Sync</button>}>
            grid
          </PageFrame>
        </SectionCard>
        <SectionCard>
          <PageFrame title="Untitled host">body</PageFrame>
        </SectionCard>
      </PageFrame>,
    );
    expect(screen.getAllByText("Market Intelligence")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Sync" })).toBeTruthy();
    expect(screen.getByText("grid")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Untitled host" })).toBeTruthy();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
  });
});

describe("PageFrame — typed header actions (≤ 1 primary + 2 secondary, rest in ⋯)", () => {
  const nine: HeaderActions = {
    primary: { label: "Ship" },
    secondary: [
      { label: "Edit" },
      { label: "Delete order", destructive: true },
      { label: "Print" },
      { label: "Export" },
      { label: "Email" },
    ],
    menu: [{ label: "Duplicate" }, { label: "History" }, { label: "Refund", destructive: true }],
  };

  const paths: [string, (actions: HeaderActions) => React.ReactElement][] = [
    ["default", (actions) => <PageFrame title="Order" actions={actions}>body</PageFrame>],
    [
      "nested",
      (actions) => (
        <PageFrame title="Parent">
          <PageFrame title="Order" actions={actions}>body</PageFrame>
        </PageFrame>
      ),
    ],
    [
      "host-titled",
      (actions) => (
        <SectionCard title="Host">
          <PageFrame title="Order" actions={actions}>body</PageFrame>
        </SectionCard>
      ),
    ],
  ];

  function openHeaderMenu(): HTMLElement {
    fireEvent.pointerDown(screen.getByRole("button", { name: "More actions" }), { button: 0, ctrlKey: false });
    const menu = document.querySelector<HTMLElement>('[role="menu"]');
    if (!menu) throw new Error("menu did not open");
    return menu;
  }

  it.each(paths)("%s path: 1 primary + 2 secondary inline, the rest and every destructive in ⋯", (_, ui) => {
    render(ui(nine));
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Edit",
      "Print",
      "Ship",
      "More actions",
    ]);
    expect(screen.queryByText("Delete order")).toBeNull();
    const items = Array.from(openHeaderMenu().querySelectorAll('[role="menuitem"]')).map((i) => i.textContent);
    expect(items).toEqual(["Export", "Email", "Duplicate", "History", "Refund", "Delete order"]);
  });

  it("moves a destructive primary into the menu", () => {
    render(<PageFrame title="T" actions={{ primary: { label: "Delete", destructive: true } }}>body</PageFrame>);
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["More actions"]);
  });

  it("renders 1 primary + 2 secondary unchanged, with no menu trigger", () => {
    render(
      <PageFrame title="T" actions={{ primary: { label: "New" }, secondary: [{ label: "Export" }, { label: "Print" }] }}>
        body
      </PageFrame>,
    );
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Export", "Print", "New"]);
  });

  it("fires onSelect and renders href actions through renderLink", () => {
    const onSelect = vi.fn();
    render(
      <PageFrame
        title="T"
        actions={{
          primary: { label: "New", onSelect },
          secondary: [{ label: "Open", href: "/orders/1" }],
          renderLink: (href, children) => <a href={href} data-router-link="">{children}</a>,
        }}
      >
        body
      </PageFrame>,
    );
    fireEvent.click(screen.getByRole("button", { name: "New" }));
    expect(onSelect).toHaveBeenCalledOnce();
    const link = screen.getByRole("link", { name: "Open" });
    expect(link.getAttribute("href")).toBe("/orders/1");
    expect(link.hasAttribute("data-router-link")).toBe(true);
  });

  it("renders no actions row for an empty typed object", () => {
    const { container } = render(
      <SectionCard title="Host">
        <PageFrame title="T" actions={{}}>body</PageFrame>
      </SectionCard>,
    );
    expect(container.querySelector(".justify-end.gap-2")).toBeNull();
  });

  it("treats a portal as a rendered node, not a typed object", () => {
    render(<PageFrame title="T" actions={createPortal(<button>Portaled</button>, document.body)}>body</PageFrame>);
    expect(screen.getByRole("button", { name: "Portaled" })).toBeTruthy();
  });

  it("still renders the deprecated flat ReactNode form as before", () => {
    render(<PageFrame title="T" actions={<><button>A</button><button>B</button><button>C</button><button>D</button></>}>body</PageFrame>);
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["A", "B", "C", "D"]);
  });
});
