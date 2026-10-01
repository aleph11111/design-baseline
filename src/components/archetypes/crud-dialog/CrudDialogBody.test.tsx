import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CrudDialogBody } from "./CrudDialogBody";

afterEach(() => {
  cleanup();
});

describe("CrudDialogBody — loading announcement", () => {
  it("keeps the status region mounted across both states and toggles its text", () => {
    // jsdom has no live-region semantics, so the behavioral contract is: the
    // region exists and carries the loading text while loading, keeps its
    // identity after load, and clears its text — the pattern screen readers
    // (which only announce CHANGES to an existing region) can actually act on.
    const { rerender } = render(
      <CrudDialogBody isLoading>
        <div>fields</div>
      </CrudDialogBody>,
    );

    const region = screen.getByRole<HTMLSpanElement>("status");
    expect(region.textContent).toBe("Loading…");
    expect(region.getAttribute("aria-live")).toBe("polite");
    // busy must NOT sit on the live region — a live region that is itself
    // marked busy suppresses its own announcements (the exact symptom the
    // ticket reports: a screen-reader user hears the title, then nothing).
    expect(region.getAttribute("aria-busy")).toBeNull();

    rerender(
      <CrudDialogBody>
        <div>fields</div>
      </CrudDialogBody>,
    );

    const regionAfter = screen.getByRole<HTMLSpanElement>("status");
    // same node, text cleared — the announcement is a change, not an unmount
    expect(regionAfter).toBe(region);
    expect(regionAfter.textContent).toBe("");
    expect(screen.getByText("fields")).toBeDefined();
  });

  it("exposes aria-busy on the persistent body container and clears it after load", () => {
    const { rerender } = render(
      <CrudDialogBody isLoading>
        <div>fields</div>
      </CrudDialogBody>,
    );

    const region = screen.getByRole("status");
    const busyContainer = region.parentElement!;
    expect(busyContainer.getAttribute("aria-busy")).toBe("true");

    rerender(
      <CrudDialogBody>
        <div>fields</div>
      </CrudDialogBody>,
    );

    // the container outlives the skeleton: the loaded content renders inside
    // the very same node, and the busy hold is released
    expect(busyContainer.contains(screen.getByText("fields"))).toBe(true);
    expect(busyContainer.hasAttribute("aria-busy")).toBe(false);
  });

  it("suppresses children while loading", () => {
    render(
      <CrudDialogBody isLoading>
        <div>fields</div>
      </CrudDialogBody>,
    );

    expect(screen.queryByText("fields")).toBeNull();
    expect(screen.getByText("Loading…")).toBeDefined();
  });
});

describe("CrudDialogBody — skeleton mobile collapse", () => {
  // jsdom can't resolve media queries, so the guarantee asserted here is the
  // one that makes that true in the browser: the skeleton's paired-field
  // sections use the SAME class list as the loaded two-column layout, so both
  // break at the same width. Both states are rendered in one fixture and the
  // classes are compared against each other.
  function renderBoth() {
    const { container } = render(
      <>
        <div data-testid="loaded">
          <CrudDialogBody layout="two-column">
            <div>a</div>
            <div>b</div>
          </CrudDialogBody>
        </div>
        <div data-testid="skeleton">
          <CrudDialogBody isLoading>
            <div>fields</div>
          </CrudDialogBody>
        </div>
      </>,
    );
    return {
      loadedRoot: container.querySelector<HTMLElement>("[data-testid=loaded]")!,
      skeletonRoot: container.querySelector<HTMLElement>("[data-testid=skeleton]")!,
    };
  }

  it("reuses the loaded two-column layout classes on its paired sections", () => {
    const { loadedRoot, skeletonRoot } = renderBoth();

    const loadedGrid = loadedRoot.querySelector<HTMLElement>(".grid")!;
    const skeletonGrids = Array.from(skeletonRoot.querySelectorAll<HTMLElement>(".grid"));
    expect(loadedGrid).not.toBeNull();
    expect(skeletonGrids.length).toBeGreaterThanOrEqual(2);

    for (const skeletonGrid of skeletonGrids) {
      for (const cls of Array.from(loadedGrid.classList)) {
        expect(skeletonGrid.classList.contains(cls), `skeleton grid missing loaded class "${cls}"`).toBe(true);
      }
      // a bare (non-responsive) two-column class would stay 2-col on mobile
      expect(skeletonGrid.classList.contains("grid-cols-2")).toBe(false);
    }
  });

  it("shares the loaded body's padding box so load causes no layout shift", () => {
    const { loadedRoot, skeletonRoot } = renderBoth();

    // loaded inset = the parent of the layout grid; skeleton inset = the
    // aria-hidden skeleton root (both carry the body's padding box)
    const loadedInset = loadedRoot.querySelector<HTMLElement>(".grid")!.parentElement!;
    const skeletonInset = skeletonRoot.querySelector<HTMLElement>("[aria-hidden]")!;

    for (const cls of Array.from(loadedInset.classList)) {
      expect(skeletonInset.classList.contains(cls), `skeleton inset missing "${cls}"`).toBe(true);
    }
    expect(skeletonInset.classList.contains("px-6")).toBe(true);
    expect(skeletonInset.classList.contains("py-4")).toBe(true);
  });
});
