import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { PageFrame } from "../../layout/PageFrame";
import {
  DetailOverviewShell,
  UnifiedSurfaceContext,
  type DetailOverviewShellProps,
  type StatItem,
} from "./DetailOverviewShell";

afterEach(() => {
  cleanup();
});

/** Renders the current `UnifiedSurfaceContext` value so a slot can assert on it. */
function SurfaceProbe({ label }: { label: string }): React.ReactElement {
  const unified = React.useContext(UnifiedSurfaceContext);
  return <div data-testid={label}>{String(unified)}</div>;
}

const slots = {
  title: "Order #1042",
  summary: <div>summary-slot</div>,
  content: <div>content-slot</div>,
  references: <div>references-slot</div>,
};

describe("DetailOverviewShell — container model is single (unified)", () => {
  it("always renders one bounded outer frame", () => {
    const { container } = render(<DetailOverviewShell {...slots} />);

    // the single container model: one raised surface holds everything
    const frames = container.querySelectorAll(".bg-surface-raised");
    expect(frames).toHaveLength(1);
    const frame = frames[0] as HTMLElement;
    expect(frame.className).toContain("rounded-lg");
    // every slot still renders inside that single frame
    expect(frame.textContent).toContain("summary-slot");
    expect(frame.textContent).toContain("content-slot");
    expect(frame.textContent).toContain("references-slot");
  });

  it("uses the two-column rail grid only for layout=rail", () => {
    const railGrid = "lg:grid-cols-[300px_minmax(0,1fr)]";

    const rail = render(<DetailOverviewShell {...slots} layout="rail" />);
    expect(rail.container.querySelector(`[class*="${railGrid}"]`)).not.toBeNull();
    cleanup();

    const vertical = render(<DetailOverviewShell {...slots} layout="vertical" />);
    expect(
      vertical.container.querySelector(`[class*="${railGrid}"]`),
    ).toBeNull();
  });

  it("clamps the rail's sticky top by its published height so a tall rail's foot stays reachable", () => {
    const observed: Element[] = [];
    const saved = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      observe(el: Element) { observed.push(el); }
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    try {
      const { container } = render(<DetailOverviewShell {...slots} layout="rail" />);
      const rail = container.querySelector('[class*="lg:sticky"]') as HTMLElement;
      // jsdom has no layout, so the measured height is 0 — the wiring is what's under test.
      expect(rail.style.getPropertyValue("--db-rail-h")).toBe("0px");
      expect(observed[0]).toBe(rail);
      expect(rail.className).toContain(
        "lg:top-[min(var(--db-sticky-top,0px),calc(100dvh_-_var(--db-rail-h,0px)))]",
      );
      // no inner scroll box: the page scrolls, never the rail
      expect(rail.className).not.toMatch(/overflow-(y-)?(auto|scroll)|max-h-/);
    } finally {
      globalThis.ResizeObserver = saved;
    }
  });

  it("provides UnifiedSurfaceContext=true in the rail, not the main (rail)", () => {
    const { getByTestId } = render(
      <DetailOverviewShell
        layout="rail"
        title="Record"
        summary={<SurfaceProbe label="rail-summary" />}
        references={<SurfaceProbe label="rail-references" />}
        content={<SurfaceProbe label="main-content" />}
        stats={[{ label: "s", value: "v" }]}
      />,
    );

    expect(getByTestId("rail-summary").textContent).toBe("true");
    expect(getByTestId("rail-references").textContent).toBe("true");
    expect(getByTestId("main-content").textContent).toBe("false");
  });

  it("scopes UnifiedSurfaceContext to summary only in the vertical layout", () => {
    const { getByTestId } = render(
      <DetailOverviewShell
        layout="vertical"
        title="Record"
        summary={<SurfaceProbe label="rail-summary" />}
        content={<SurfaceProbe label="main-content" />}
        // vertical puts references in the MAIN column, so it stays carded
        references={<SurfaceProbe label="main-references" />}
      />,
    );

    expect(getByTestId("rail-summary").textContent).toBe("true");
    expect(getByTestId("main-content").textContent).toBe("false");
    expect(getByTestId("main-references").textContent).toBe("false");
  });
});

describe("DetailOverviewShell — one header path (PageFrame, ADR-0008)", () => {
  it("renders the title once, as the page h1, with no on-surface title", () => {
    const { container, getByRole, getAllByText } = render(
      <DetailOverviewShell
        title="Order #1042"
        subtitle="Parent entity"
        badges={<span>badge</span>}
        actions={<span>action</span>}
        backHref="/orders"
        backLabel="Orders"
        content={<div>content-slot</div>}
      />,
    );

    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(getByRole("heading", { level: 1 }).textContent).toBe("Order #1042");
    expect(getAllByText("Order #1042")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    // header data renders above the surface, not on it
    const frame = container.querySelector(".bg-surface-raised") as HTMLElement;
    for (const text of ["Parent entity", "badge", "action", "Orders"]) {
      expect(container.textContent).toContain(text);
      expect(frame.textContent).not.toContain(text);
    }
  });

  it("nests under a parent PageFrame: an h2, no second h1, no second surface", () => {
    const { container, getByRole } = render(
      <PageFrame title="Customer">
        <DetailOverviewShell title="Devices" content={<div>body</div>} />
      </PageFrame>,
    );

    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(getByRole("heading", { level: 2, name: "Devices" })).toBeTruthy();
    expect(container.querySelectorAll(".bg-surface-raised")).toHaveLength(1);
  });
});

describe("DetailOverviewShell — stats as StatItem[]", () => {
  it("renders a stat strip with one tile per item and no columns passed at the site", () => {
    const { container, getByText } = render(
      <DetailOverviewShell
        title="T"
        content={<div>content-slot</div>}
        stats={[
          { label: "Revenue", value: "€120" },
          { label: "Orders", value: "3" },
          { label: "Margin", value: "34%", hint: "net" },
        ]}
      />,
    );

    // The strip is a grid that collapses to columns matching the data length.
    const tileRow = container.querySelector(".grid") as HTMLElement;
    expect(tileRow).not.toBeNull();
    expect(tileRow.className).toContain("sm:grid-cols-3");
    // every cell renders; the hint lands too
    expect(getByText("Revenue")).toBeTruthy();
    expect(getByText("€120")).toBeTruthy();
    expect(getByText("net")).toBeTruthy();
  });

  it("caps the strip at 4 columns and floors at 2 for a single item", () => {
    const four = render(
      <DetailOverviewShell
        title="T"
        stats={[
          { label: "a", value: "1" },
          { label: "b", value: "2" },
          { label: "c", value: "3" },
          { label: "d", value: "4" },
        ]}
      />,
    );
    expect((four.container.querySelector(".grid") as HTMLElement).className).toContain(
      "sm:grid-cols-4",
    );
    cleanup();

    const one = render(
      <DetailOverviewShell title="T" stats={[{ label: "a", value: "1" }]} />,
    );
    expect((one.container.querySelector(".grid") as HTMLElement).className).toContain(
      "sm:grid-cols-2",
    );
  });

  it("renders no strip when stats is omitted", () => {
    const { container } = render(
      <DetailOverviewShell title="T" content={<div>content-slot</div>} />,
    );
    expect(container.querySelector(".grid")).toBeNull();
  });
});

describe("DetailOverviewShell — width map", () => {
  it.each([
    ["md", "max-w-3xl"],
    ["lg", "max-w-4xl"],
    ["xl", "max-w-6xl"],
  ] as const)("maps width=%s to %s", (width, expected) => {
    const { container } = render(<DetailOverviewShell {...slots} width={width} />);

    expect((container.firstElementChild as HTMLElement).className).toContain(
      expected,
    );
  });

  it("applies the contained md column by default (the record-page default)", () => {
    const { container } = render(<DetailOverviewShell {...slots} />);

    expect((container.firstElementChild as HTMLElement).className).toContain(
      "max-w-3xl",
    );
  });

  it("drops the width constraint on a rail frame", () => {
    const { container } = render(
      <DetailOverviewShell {...slots} layout="rail" width="md" />,
    );

    expect((container.firstElementChild as HTMLElement).className).not.toContain(
      "max-w-3xl",
    );
  });

  it("keeps the width constraint on a vertical frame", () => {
    const { container } = render(
      <DetailOverviewShell {...slots} layout="vertical" width="md" />,
    );

    expect((container.firstElementChild as HTMLElement).className).toContain(
      "max-w-3xl",
    );
  });
});

describe("DetailOverviewShell — closed prop surface", () => {
  it("the closed prop type renders (a smoke over the whole API)", () => {
    const { getByText } = render(
      <DetailOverviewShell
        title="Record"
        subtitle="parent"
        badges={<span>paid</span>}
        actions={<span>invoice</span>}
        layout="rail"
        width="md"
        summary={slots.summary}
        stats={[{ label: "Revenue", value: "€120" }, { label: "Orders", value: "3" }]}
        content={slots.content}
        references={slots.references}
      />,
    );
    expect(getByText("Record")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Type-level regression guard (checked by `tsc`, not the runtime).
//
// The acceptance for closing this API is that `DetailOverviewShellProps`
// declares none of `surface` / `rhythm` / `headerFill` / `className` (and no
// appearance-bearing `header` slot, no `kicker` / `headerActions`), and that `stats` is typed data
// (`StatItem[]`), not a `ReactNode`. A bare grep for `surface` still matches
// the internal `UnifiedSurfaceContext`, so the guard is written against the
// TYPE, not the file: if any retired axis leaks back into `DetailOverviewShellProps`,
// one of the `_Guard` types below collapses to `never` and the following
// assignment fails to compile — the break is caught at typecheck time.
// ---------------------------------------------------------------------------
type Key<T, K extends PropertyKey> = K extends keyof T ? "present" : "absent";
type Absent<T, K extends PropertyKey> = Key<T, K> extends "absent" ? true : never;

type _RetiredAxesGuard = [
  Absent<DetailOverviewShellProps, "surface">,
  Absent<DetailOverviewShellProps, "rhythm">,
  Absent<DetailOverviewShellProps, "headerFill">,
  Absent<DetailOverviewShellProps, "className">,
  Absent<DetailOverviewShellProps, "header">,
  Absent<DetailOverviewShellProps, "kicker">,
  Absent<DetailOverviewShellProps, "headerActions">,
] extends [true, true, true, true, true, true, true]
  ? true
  : never;

// `stats` must be the typed strip (StatItem[]), not an appearance-bearing node.
type _StatsDataGuard = NonNullable<DetailOverviewShellProps["stats"]> extends StatItem[]
  ? true
  : never;

const closedPropGuard: _RetiredAxesGuard = true;
const statsDataGuard: _StatsDataGuard = true;
expect(closedPropGuard).toBe(true);
expect(statsDataGuard).toBe(true);

describe("DetailOverviewShell — empty body slots", () => {
  it("vertical: summary-only renders no bordered body strip", () => {
    const { container } = render(
      <DetailOverviewShell title="T" summary={<div>summary-slot</div>} />,
    );
    expect(container.querySelector(".border-t.border-border\\/60.p-5")).toBeNull();
    cleanup();
    const filled = render(<DetailOverviewShell title="T" summary={<div>s</div>} content={<div>c</div>} />);
    expect(filled.container.querySelector(".border-t.border-border\\/60.p-5")).not.toBeNull();
  });

  it("rail: summary/references-only renders no main column or grid", () => {
    const { container } = render(
      <DetailOverviewShell
        title="T"
        layout="rail"
        summary={<div>summary-slot</div>}
        references={<div>references-slot</div>}
      />,
    );
    expect(container.querySelector(".p-5")).toBeNull();
    expect(container.querySelector('[class*="lg:grid-cols-"]')).toBeNull();
  });
});
