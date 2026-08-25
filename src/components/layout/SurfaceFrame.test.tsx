import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SurfaceFrame } from "./SurfaceFrame";

// The canonical frame chrome — House style B: flat bounded card, no shadow
// (the detail-overview `shadow-sm` it used to carry was copy drift, retired
// with the extraction).
const CHROME = ["overflow-hidden", "rounded-lg", "border", "bg-card"];

afterEach(() => {
  cleanup();
});

describe("SurfaceFrame — canonical bounded surface", () => {
  it("spells the flat card chrome once, without shadow", () => {
    const { container } = render(
      <SurfaceFrame title="Surface">body</SurfaceFrame>,
    );
    const frame = container.firstElementChild as HTMLElement;

    for (const cls of CHROME) {
      expect(frame.className).toContain(cls);
    }
    expect(frame.className).not.toContain("shadow-sm");
    expect(frame.className).not.toContain("text-card-foreground");
  });

  it("renders the on-surface header and the body below it", () => {
    const { container } = render(
      <SurfaceFrame kicker="Kicker" title="Surface">
        body
      </SurfaceFrame>,
    );
    const header = container.querySelector('[data-slot="surface-header"]');
    expect(header).not.toBeNull();
    expect(header?.textContent).toContain("Kicker");
    expect(header?.textContent).toContain("Surface");
    expect(container.firstElementChild?.textContent).toContain("body");
  });

  it("renders the ruled toolbar band between header and body", () => {
    const { container } = render(
      <SurfaceFrame title="Surface" toolbar={<span>toolbar-slot</span>}>
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
      <SurfaceFrame title="S" toolbar={<span>t</span>}>b</SurfaceFrame>,
    );
    expect(
      withBand.container.querySelector(".border-b.px-4.py-3"),
    ).not.toBeNull();
    cleanup();

    const noBand = render(
      <SurfaceFrame title="S" toolbar={null}>b</SurfaceFrame>,
    );
    expect(noBand.container.querySelector(".border-b.px-4.py-3")).toBeNull();
    cleanup();

    const omitted = render(<SurfaceFrame title="S">b</SurfaceFrame>);
    expect(omitted.container.querySelector(".border-b.px-4.py-3")).toBeNull();
  });

  it("clips by default and scrolls horizontally in the named `auto` mode", () => {
    const clipped = render(
      <SurfaceFrame title="S">b</SurfaceFrame>,
    );
    expect((clipped.container.firstElementChild as HTMLElement).className).toContain(
      "overflow-hidden",
    );
    expect(
      (clipped.container.firstElementChild as HTMLElement).className,
    ).not.toContain("overflow-x-auto");
    cleanup();

    const scrolling = render(
      <SurfaceFrame title="S" overflow="auto">b</SurfaceFrame>,
    );
    expect((scrolling.container.firstElementChild as HTMLElement).className).toContain(
      "overflow-x-auto",
    );
    expect(
      (scrolling.container.firstElementChild as HTMLElement).className,
    ).not.toContain("overflow-hidden");
  });

  it("chromeless: drops the bounded card, keeps the slots, forwards the ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <SurfaceFrame
        ref={ref}
        title="S"
        chrome={false}
        toolbar={<span>t</span>}
      >
        body
      </SurfaceFrame>,
    );
    const root = container.firstElementChild as HTMLElement;

    for (const cls of CHROME) {
      expect(root.className).not.toContain(cls);
    }
    // the slots render in the plain layout div
    expect(root.querySelector('[data-slot="surface-header"]')).not.toBeNull();
    expect(
      (screen.getByText("t").parentElement as HTMLElement).className,
    ).toContain("border-b px-4 py-3");
    expect(ref.current).toBe(root);
  });
});
