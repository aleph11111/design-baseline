import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { HeaderFillContext } from "./headerFill";
import { SurfaceHeaderBar } from "./SurfaceHeaderBar";
import { SurfaceHeader } from "./SurfaceHeader";

afterEach(() => {
  cleanup();
});

describe("SurfaceHeaderBar — the one bar chrome every framed shell mounts", () => {
  it("owns the canonical padding and the shared data-slot marker", () => {
    const { container } = render(<SurfaceHeaderBar>bar content</SurfaceHeaderBar>);

    const bar = container.querySelector('[data-slot="surface-header"]');
    expect(bar).not.toBeNull();
    expect(bar?.className).toContain("px-5");
    expect(bar?.className).toContain("py-4");
    expect(bar?.className).toContain("flex");
    expect(bar?.className).toContain("justify-between");
  });

  it("applies hfc.bar to the bar once (the fill is the bar's, not the caller's)", () => {
    const { container } = render(
      <HeaderFillContext.Provider value="tint">
        <SurfaceHeaderBar>
          <h2>title</h2>
        </SurfaceHeaderBar>
      </HeaderFillContext.Provider>,
    );

    const bar = container.querySelector('[data-slot="surface-header"]');
    expect(bar?.className).toContain("bg-muted");
  });

  it("renders the caller's title element as the left block and actions right-aligned", () => {
    const { container } = render(
      <SurfaceHeaderBar actions={<button type="button">act</button>}>
        <h2>title</h2>
      </SurfaceHeaderBar>,
    );

    const bar = container.querySelector('[data-slot="surface-header"]')!;
    // title in the left (min-w-0) block, actions in the right row
    expect(bar.querySelector(".min-w-0")?.textContent).toContain("title");
    expect(bar.querySelector(".flex.shrink-0")?.textContent).toContain("act");
  });

  it("omits the actions row entirely when no actions are given", () => {
    const { container } = render(<SurfaceHeaderBar>title</SurfaceHeaderBar>);
    const bar = container.querySelector('[data-slot="surface-header"]')!;
    // only the left block — no empty right flex row
    expect(bar.children).toHaveLength(1);
  });

  it("inverts a heading title + paragraph subtitle on a solid header (the one-edit-point)", () => {
    // The bar's hfc.bar carries the inversion: a Radix-style h2 title and a p
    // subtitle supplied BY A CALLER pick up the solid treatment without the
    // bar knowing their components — this is what the three constrained shells ride.
    const { getByText } = render(
      <HeaderFillContext.Provider value="solid">
        <SurfaceHeaderBar>
          <h2 className="text-foreground">title</h2>
          <p className="text-muted-foreground">sub</p>
        </SurfaceHeaderBar>
      </HeaderFillContext.Provider>,
    );

    const bar = getByText("title").closest('[data-slot="surface-header"]') as HTMLElement;
    expect(bar.className).toContain("bg-primary");
  });

  it("forwards structural actionsClassName to the actions row and className to the bar", () => {
    const { container } = render(
      <SurfaceHeaderBar className="shrink-0" actionsClassName="pr-8" actions={<button type="button">act</button>}>
        title
      </SurfaceHeaderBar>
    );
    const bar = container.querySelector('[data-slot="surface-header"]') as HTMLElement;
    expect(bar.className).toContain("shrink-0");
    expect(bar.querySelector(".pr-8")).not.toBeNull();
  });
});

describe("SurfaceHeader composes SurfaceHeaderBar (one implementation)", () => {
  it("renders its bar through the shared data-slot marker", () => {
    const { container, getByText } = render(
      <SurfaceHeader kicker="Orders" title="Order #1024" />,
    );

    const bar = container.querySelector('[data-slot="surface-header"]');
    expect(bar).not.toBeNull();
    expect(bar?.className).toContain("px-5");
    expect(bar?.className).toContain("py-4");
    expect(bar?.contains(getByText("Order #1024"))).toBe(true);
  });

  it("keeps its kicker/title/subtitle slot treatments inside the bar", () => {
    const { getByText } = render(
      <SurfaceHeader title="Billing" subtitle="Updated 2 days ago" />,
    );
    // the title div keeps its own scale; the subtitle keeps text-xs
    expect(getByText("Billing").className).toContain("text-lg");
    expect(getByText("Updated 2 days ago").className).toContain("text-xs");
  });

  it("solid context inverts the composed title on the shared bar", () => {
    const { getByText } = render(
      <HeaderFillContext.Provider value="solid">
        <SurfaceHeader title="Order #1024" />
      </HeaderFillContext.Provider>,
    );
    const bar = getByText("Order #1024").closest(
      '[data-slot="surface-header"]',
    ) as HTMLElement;
    expect(bar.className).toContain("bg-primary");
  });
});
