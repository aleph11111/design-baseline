import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { SurfaceHeaderBar } from "./SurfaceHeaderBar";

afterEach(() => {
  cleanup();
});

describe("SurfaceHeaderBar — the one dialog/drawer header bar", () => {
  it("owns the canonical padding and the shared data-slot marker", () => {
    const { container } = render(<SurfaceHeaderBar>bar content</SurfaceHeaderBar>);

    const bar = container.querySelector('[data-slot="surface-header"]');
    expect(bar).not.toBeNull();
    expect(bar?.className).toContain("px-5");
    expect(bar?.className).toContain("py-4");
    expect(bar?.className).toContain("flex");
    expect(bar?.className).toContain("justify-between");
  });

  it("renders one fixed neutral treatment — raised fill, hairline rule, no inversion", () => {
    const { container } = render(
      <SurfaceHeaderBar>
        <h2>title</h2>
      </SurfaceHeaderBar>,
    );

    const bar = container.querySelector('[data-slot="surface-header"]') as HTMLElement;
    expect(bar.className).toContain("bg-surface-raised");
    expect(bar.className).toContain("border-b");
    expect(bar.className).not.toContain("bg-primary");
    expect(bar.className).not.toContain("text-primary-foreground");
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
