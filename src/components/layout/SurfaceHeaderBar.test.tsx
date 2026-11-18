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
    expect(bar.lastElementChild?.textContent).toContain("act");
  });

  it("wraps the actions beneath the title instead of squeezing it (any action count)", () => {
    for (const n of [0, 1, 2, 3, 4]) {
      const actions = Array.from({ length: n }, (_, i) => (
        <button key={i} type="button">Action number {i}</button>
      ));
      const { container } = render(
        <SurfaceHeaderBar actions={n ? actions : undefined}>
          <h2>A rather long title of about thirty characters</h2>
        </SurfaceHeaderBar>,
      );
      const bar = container.querySelector('[data-slot="surface-header"]') as HTMLElement;
      // the bar wraps, so an actions row that does not fit beside the title
      // drops onto its own line instead of taking the title's width
      expect(bar.className).toContain("flex-wrap");
      // the title block grows and keeps a usable basis before the row wraps
      const titleBlock = bar.firstElementChild as HTMLElement;
      expect(titleBlock.className).toMatch(/\bflex-1\b/);
      expect(titleBlock.className).toMatch(/\bbasis-/);
      // nothing in the bar refuses to shrink beside the title
      expect(bar.querySelector(".shrink-0")).toBeNull();
      cleanup();
    }
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
