import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { CrudDialogBody } from "./CrudDialogBody";

afterEach(() => {
  cleanup();
});

describe("CrudDialogBody — loading announcement", () => {
  it("announces as a post-mount change to the region, not as first-paint content", () => {
    // The normal open path mounts the body with isLoading already true
    // (entity fetch in-flight). If "Loading…" were in the region at its
    // mount commit, most screen readers would never announce it. Spy the
    // commits: first must be empty, the text must land later.
    const textsAtCommits: string[] = [];
    const root = document.createElement("div");
    document.body.appendChild(root);
    render(
      <React.Profiler
        id="body"
        onRender={() => {
          const el = root.querySelector<HTMLElement>("[role=status]");
          textsAtCommits.push(el?.textContent ?? "");
        }}
      >
        <CrudDialogBody isLoading>
          <div>fields</div>
        </CrudDialogBody>
      </React.Profiler>,
      { container: root },
    );

    expect(textsAtCommits.length).toBeGreaterThanOrEqual(2);
    // commit 1: region is in the DOM with no text
    expect(textsAtCommits[0]).toBe("");
    // a later commit: the text has landed — that change is what gets announced
    expect(textsAtCommits[textsAtCommits.length - 1]).toBe("Loading…");
  });

  it("toggles the text through a full loading → loaded → loading cycle", () => {
    const { rerender } = render(
      <CrudDialogBody isLoading>
        <div>fields</div>
      </CrudDialogBody>,
    );
    act(() => {});
    const region = screen.getByRole<HTMLSpanElement>("status");
    expect(region.textContent).toBe("Loading…");

    // fields arrive: the announcement clears
    rerender(
      <CrudDialogBody>
        <div>fields</div>
      </CrudDialogBody>,
    );
    act(() => {});
    expect(region.textContent).toBe("");
    expect(screen.getByText("fields")).toBeDefined();

    // a later transition into loading re-announces through the SAME region
    rerender(
      <CrudDialogBody isLoading>
        <div>fields</div>
      </CrudDialogBody>,
    );
    act(() => {});
    expect(region.textContent).toBe("Loading…");
  });

  it("keeps the status region OUT of every aria-b_busy subtree and releases the hold after load", () => {
    const { container, rerender } = render(
      <CrudDialogBody isLoading>
        <div>fields</div>
      </CrudDialogBody>,
    );
    act(() => {});

    // the busy hold exists while loading…
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();

    // …but the live region is not inside it (aria-busy applies to the whole
    // subtree — a busy live region suppresses its own announcements, the
    // exact symptom this ticket fixes)
    const region = screen.getByRole<HTMLSpanElement>("status");
    expect(region.closest('[aria-busy="true"]')).toBeNull();

    // and the hold releases when the fields arrive
    rerender(
      <CrudDialogBody>
        <div>fields</div>
      </CrudDialogBody>,
    );
    expect(container.querySelector('[aria-busy="true"]')).toBeNull();
  });

  it("suppresses children while loading", () => {
    render(
      <CrudDialogBody isLoading>
        <div>fields</div>
      </CrudDialogBody>,
    );

    act(() => {});
    expect(screen.queryByText("fields")).toBeNull();
    expect(screen.getByText("Loading…")).toBeDefined();
  });
});

describe("CrudDialogBody — skeleton mobile collapse", () => {
  // jsdom can't resolve media queries, so the guarantee asserted here is the
  // one that makes that true in the browser: the skeleton's paired-field
  // sections use the SAME class list as the loaded two-column layout, so
  // both break at the same width. Both states are rendered in one fixture
  // and the classes are compared against each other. `layout` keys both the
  // loaded and skeleton fixtures to the same body shape.
  function renderBoth(layout?: "flat" | "two-column") {
    const { container } = render(
      <>
        <div data-testid="loaded">
          <CrudDialogBody layout={layout}>
            <div>a</div>
            <div>b</div>
          </CrudDialogBody>
        </div>
        <div data-testid="skeleton">
          <CrudDialogBody isLoading layout={layout}>
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
    const { loadedRoot, skeletonRoot } = renderBoth("two-column");

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
    const { loadedRoot, skeletonRoot } = renderBoth("two-column");

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

  it("publishes its px-6 padding as --form-inset for an in-body FormPageActions bar", () => {
    const { loadedRoot } = renderBoth("flat");
    const inset = loadedRoot.querySelector<HTMLElement>(".px-6")!;
    expect(inset.classList.contains("[--form-inset:1.5rem]")).toBe(true);
  });

  it("renders no paired two-column section for a flat body", () => {
    const { loadedRoot, skeletonRoot } = renderBoth("flat");

    // the loaded flat body's layout wrapper is a single stack, never a grid
    expect(loadedRoot.querySelector<HTMLElement>(".grid")).toBeNull();

    // the skeleton shows the same: no paired two-column grid section
    expect(skeletonRoot.querySelectorAll<HTMLElement>(".grid").length).toBe(0);

    // class-list match at the layout-wrapper level, selected by structure on
    // BOTH sides: the flat wrapper is the loaded body's only space-y-4 element,
    // and the skeleton's inner wrapper is the direct child of the aria-hidden
    // padding root — which ALSO carries space-y-4, so selecting the padding
    // root would compare the wrong level and mask a divergence here.
    const loadedWrapper = loadedRoot.querySelector<HTMLElement>(".space-y-4")!;
    const skeletonWrapper = skeletonRoot
      .querySelector<HTMLElement>("[aria-hidden]")!
      .firstElementChild as HTMLElement;
    expect(Array.from(skeletonWrapper.classList).sort()).toEqual(
      Array.from(loadedWrapper.classList).sort(),
    );

    // the padding box is still shared (no shift on load)
    const loadedInset = loadedWrapper.parentElement!;
    const skeletonInset = skeletonRoot.querySelector<HTMLElement>("[aria-hidden]")!;
    for (const cls of Array.from(loadedInset.classList)) {
      expect(skeletonInset.classList.contains(cls), `skeleton inset missing "${cls}"`).toBe(true);
    }
  });

  it("renders no paired two-column section for a no-layout body", () => {
    const { skeletonRoot } = renderBoth();

    // mixed / tabbed bodies carry no layout wrapper of their own, so the
    // skeleton must not invent one either: plain stacked fields under the
    // padding box, no grid section
    expect(skeletonRoot.querySelectorAll<HTMLElement>(".grid").length).toBe(0);
    const skeletonInset = skeletonRoot.querySelector<HTMLElement>("[aria-hidden]")!;
    expect(skeletonInset.classList.contains("px-6")).toBe(true);
    expect(skeletonInset.classList.contains("py-4")).toBe(true);
  });
});
