import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SurfaceFrame } from "./SurfaceFrame";

// The canonical frame chrome — House style B: flat bounded card, no shadow
// (the detail-overview `shadow-sm` it used to carry was copy drift, retired
// with the extraction).
const CHROME = ["overflow-clip", "rounded-lg", "bg-surface-raised"];

afterEach(() => {
  cleanup();
});

describe("SurfaceFrame — canonical bounded surface", () => {
  it("spells the flat card chrome once, without shadow", () => {
    const { container } = render(
      <SurfaceFrame>body</SurfaceFrame>,
    );
    const frame = container.firstElementChild as HTMLElement;

    for (const cls of CHROME) {
      expect(frame.className).toContain(cls);
    }
    expect(frame.className).not.toContain("shadow-sm");
    // Tone, not a border, separates the raised frame from the canvas (ADR-0007 §3).
    expect(frame.className).not.toMatch(/\bborder\b/);
    expect(frame.className).not.toContain("text-card-foreground");
  });

  it("is untitled: no header bar, just the body (ADR-0008)", () => {
    const { container } = render(<SurfaceFrame>body</SurfaceFrame>);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    expect(container.firstElementChild?.textContent).toBe("body");
  });

  it("renders the ruled toolbar band above the body", () => {
    const { container } = render(
      <SurfaceFrame toolbar={<span>toolbar-slot</span>}>
        body
      </SurfaceFrame>,
    );
    const band = screen.getByText("toolbar-slot").parentElement as HTMLElement;
    expect(band.className).toContain("border-b px-4 py-3");
    // the frame owns the band's chrome — the shell did not wrap it itself
    expect(band.parentElement).toBe(container.firstElementChild);
  });

  it("skips the toolbar band when no toolbar is provided (null or omitted)", () => {
    const withBand = render(
      <SurfaceFrame toolbar={<span>t</span>}>b</SurfaceFrame>,
    );
    expect(
      withBand.container.querySelector(".border-b.px-4.py-3"),
    ).not.toBeNull();
    cleanup();

    const noBand = render(
      <SurfaceFrame toolbar={null}>b</SurfaceFrame>,
    );
    expect(noBand.container.querySelector(".border-b.px-4.py-3")).toBeNull();
    cleanup();

    const omitted = render(<SurfaceFrame>b</SurfaceFrame>);
    expect(omitted.container.querySelector(".border-b.px-4.py-3")).toBeNull();
  });

  // Tailwind's sr-only is position:absolute. Without a positioned frame its
  // containing block sits outside the scroll box, the overflow doesn't clip
  // it, and a label scrolled past the edge widens the whole page.
  it("is the containing block for sr-only descendants in both overflow modes", () => {
    for (const overflow of ["auto", "hidden"] as const) {
      const { container } = render(
        <SurfaceFrame overflow={overflow}>
          <div style={{ width: 3000 }}>
            <span className="sr-only">label</span>
          </div>
        </SurfaceFrame>,
      );
      const frame = container.firstElementChild as HTMLElement;
      expect(frame.className).toMatch(/(^|\s)relative(\s|$)/);
      expect(frame.contains(container.querySelector(".sr-only"))).toBe(true);
      cleanup();
    }
  });

  it("clips by default and scrolls horizontally in the named `auto` mode", () => {
    const clipped = render(
      <SurfaceFrame>b</SurfaceFrame>,
    );
    expect((clipped.container.firstElementChild as HTMLElement).className).toContain(
      "overflow-clip",
    );
    expect(
      (clipped.container.firstElementChild as HTMLElement).className,
    ).not.toContain("overflow-x-auto");
    cleanup();

    const scrolling = render(
      <SurfaceFrame overflow="auto">b</SurfaceFrame>,
    );
    expect((scrolling.container.firstElementChild as HTMLElement).className).toContain(
      "overflow-x-auto",
    );
    expect(
      (scrolling.container.firstElementChild as HTMLElement).className,
    ).not.toContain("overflow-clip");
  });
});
