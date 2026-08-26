import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { HeaderFillContext } from "@/components/layout/headerFill";
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
  summary: <div>summary-slot</div>,
  content: <div>content-slot</div>,
  references: <div>references-slot</div>,
};

describe("DetailOverviewShell — container model is single (unified)", () => {
  it("always renders one bounded outer frame", () => {
    const { container } = render(<DetailOverviewShell {...slots} />);

    // the single container model: a bounded card holds everything
    const frame = container.firstElementChild as HTMLElement;
    expect(frame.className).toContain("rounded-lg");
    expect(frame.className).toContain("border");
    expect(frame.className).toContain("bg-card");
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

describe("DetailOverviewShell — Mode B nested heading (data props)", () => {
  it("renders the nested title as a nested-page heading (h2), not an h1", () => {
    const { container, getByRole } = render(
      <DetailOverviewShell
        title="Devices"
        subtitle="Parent entity"
        badges={<span>badge</span>}
        actions={<span>action</span>}
        content={<div>content-slot</div>}
      />,
    );

    // Mode B: the shell's on-surface header is a nested page title (h2),
    // and the shell itself never emits a standalone page title element.
    const heading = getByRole("heading", { level: 2, name: "Devices" });
    expect(heading).toBeTruthy();
    expect(container.querySelector("h1")).toBeNull();
    // The full Mode B bar is the shared surface bar (`data-slot=surface-header`,
    // the marker every framed shell mounts) and carries all four data props:
    // title + subtitle + badges + actions.
    const bar = heading.closest('[data-slot="surface-header"]') as HTMLElement;
    expect(bar).not.toBeNull();
    expect(bar.textContent).toContain("Parent entity");
    expect(bar.textContent).toContain("badge");
    expect(bar.textContent).toContain("action");
  });

  it("fills the shared bar from the project headerFill context (no override prop)", () => {
    const { container } = render(
      <HeaderFillContext.Provider value="tint">
        <DetailOverviewShell title="Devices" content={<div>body</div>} />
      </HeaderFillContext.Provider>,
    );

    const h2 = container.querySelector("h2") as HTMLElement;
    const bar = h2.closest('[data-slot="surface-header"]') as HTMLElement;
    expect(bar).not.toBeNull();
    expect(bar.className).toContain("bg-muted");
    expect(bar.textContent).toContain("Devices");
  });

  it("inverts the nested title on a solid header via the bar's fill", () => {
    const { getByRole } = render(
      <HeaderFillContext.Provider value="solid">
        <DetailOverviewShell title="Devices" content={<div>body</div>} />
      </HeaderFillContext.Provider>,
    );

    const heading = getByRole("heading", { level: 2, name: "Devices" });
    const bar = heading.closest('[data-slot="surface-header"]') as HTMLElement;
    expect(bar.className).toContain("bg-primary");
    // the solid bar's h2 inversion reaches the fixed-scale nested heading
    expect(bar.className).toContain("[&_h1,h2]:text-primary-foreground");
    expect(heading.className).toContain("text-foreground");
  });

  it("omits the framed header when no title is given", () => {
    const { container } = render(
      <DetailOverviewShell content={<div>body</div>} />,
    );

    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    expect(container.querySelector("h2")).toBeNull();
  });
});

describe("DetailOverviewShell — stats as StatItem[]", () => {
  it("renders a stat strip with one tile per item and no columns passed at the site", () => {
    const { container, getByText } = render(
      <DetailOverviewShell
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
      <DetailOverviewShell stats={[{ label: "a", value: "1" }]} />,
    );
    expect((one.container.querySelector(".grid") as HTMLElement).className).toContain(
      "sm:grid-cols-2",
    );
  });

  it("renders no strip when stats is omitted", () => {
    const { container } = render(
      <DetailOverviewShell content={<div>content-slot</div>} />,
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
// appearance-bearing `header` slot), and that `stats` is typed data
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
] extends [true, true, true, true, true]
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
