import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { HeaderFillContext } from "@/components/layout/headerFill";
import { DetailOverviewShell, UnifiedSurfaceContext } from "./DetailOverviewShell";

afterEach(() => {
  cleanup();
});

/** Renders the current `UnifiedSurfaceContext` value so a slot can assert on it. */
function SurfaceProbe({ label }: { label: string }): React.ReactElement {
  const unified = React.useContext(UnifiedSurfaceContext);
  return <div data-testid={label}>{String(unified)}</div>;
}

const slots = {
  header: <div>header-slot</div>,
  summary: <div>summary-slot</div>,
  stats: <div>stats-slot</div>,
  content: <div>content-slot</div>,
  references: <div>references-slot</div>,
};

describe("DetailOverviewShell", () => {
  it("passes every slot through unchanged in the default separated surface", () => {
    const { getByText } = render(<DetailOverviewShell {...slots} />);

    for (const text of [
      "header-slot",
      "summary-slot",
      "stats-slot",
      "content-slot",
      "references-slot",
    ]) {
      expect(getByText(text)).toBeTruthy();
    }
  });

  it("renders no unified frame in the separated surface", () => {
    const { container } = render(<DetailOverviewShell {...slots} />);

    expect(container.querySelector(".bg-card.shadow-sm")).toBeNull();
  });

  describe("surface=unified", () => {
    it("wraps everything in one bounded frame", () => {
      const { container } = render(
        <DetailOverviewShell {...slots} surface="unified" />,
      );

      const frame = container.firstElementChild as HTMLElement;
      expect(frame.className).toContain("rounded-lg");
      expect(frame.className).toContain("border");
      expect(frame.className).toContain("bg-card");
      // every slot still renders inside that single frame
      expect(frame.textContent).toContain("summary-slot");
      expect(frame.textContent).toContain("content-slot");
    });

    it("uses the two-column rail grid only for layout=rail", () => {
      const railGrid = "lg:grid-cols-[300px_minmax(0,1fr)]";

      const rail = render(
        <DetailOverviewShell {...slots} surface="unified" layout="rail" />,
      );
      expect(rail.container.querySelector(`[class*="${railGrid}"]`)).not.toBeNull();
      cleanup();

      const vertical = render(
        <DetailOverviewShell {...slots} surface="unified" layout="vertical" />,
      );
      expect(vertical.container.querySelector(`[class*="${railGrid}"]`)).toBeNull();
    });

    it("provides UnifiedSurfaceContext=true in the rail slot only, not in main (rail)", () => {
      const { getByTestId } = render(
        <DetailOverviewShell
          surface="unified"
          layout="rail"
          summary={<SurfaceProbe label="rail-summary" />}
          references={<SurfaceProbe label="rail-references" />}
          content={<SurfaceProbe label="main-content" />}
          stats={<SurfaceProbe label="main-stats" />}
        />,
      );

      expect(getByTestId("rail-summary").textContent).toBe("true");
      expect(getByTestId("rail-references").textContent).toBe("true");
      expect(getByTestId("main-content").textContent).toBe("false");
      expect(getByTestId("main-stats").textContent).toBe("false");
    });

    it("scopes UnifiedSurfaceContext to summary only in the vertical layout", () => {
      const { getByTestId } = render(
        <DetailOverviewShell
          surface="unified"
          layout="vertical"
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

    it("renders the framed header with the fill classes from HeaderFillContext", () => {
      const { container } = render(
        <HeaderFillContext.Provider value="tint">
          <DetailOverviewShell {...slots} surface="unified" />
        </HeaderFillContext.Provider>,
      );

      const bar = container.querySelector(".px-5.py-4") as HTMLElement;
      expect(bar).not.toBeNull();
      expect(bar.textContent).toContain("header-slot");
      expect(bar.className).toContain("bg-muted");
    });

    it("lets an explicit headerFill prop override the context", () => {
      const { container } = render(
        <HeaderFillContext.Provider value="tint">
          <DetailOverviewShell {...slots} surface="unified" headerFill="solid" />
        </HeaderFillContext.Provider>,
      );

      const bar = container.querySelector(".px-5.py-4") as HTMLElement;
      expect(bar.className).toContain("bg-primary");
    });

    it("omits the header bar when no header slot is given", () => {
      const { container } = render(
        <DetailOverviewShell content={<div>content-slot</div>} surface="unified" />,
      );

      expect(container.querySelector(".px-5.py-4")).toBeNull();
    });
  });

  describe("width and rhythm maps", () => {
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

    it("applies no max-width for width=none (the default)", () => {
      const { container } = render(<DetailOverviewShell {...slots} />);

      expect((container.firstElementChild as HTMLElement).className).not.toContain(
        "max-w-",
      );
    });

    it.each([
      ["compact", "space-y-4"],
      ["default", "space-y-5"],
    ] as const)("maps rhythm=%s to %s", (rhythm, expected) => {
      const { container } = render(<DetailOverviewShell {...slots} rhythm={rhythm} />);

      expect((container.firstElementChild as HTMLElement).className).toContain(
        expected,
      );
    });

    it("drops the width constraint on a unified rail frame", () => {
      const { container } = render(
        <DetailOverviewShell
          {...slots}
          surface="unified"
          layout="rail"
          width="md"
        />,
      );

      expect((container.firstElementChild as HTMLElement).className).not.toContain(
        "max-w-3xl",
      );
    });

    it("keeps the width constraint on a unified vertical frame", () => {
      const { container } = render(
        <DetailOverviewShell {...slots} surface="unified" width="md" />,
      );

      expect((container.firstElementChild as HTMLElement).className).toContain(
        "max-w-3xl",
      );
    });
  });
});
