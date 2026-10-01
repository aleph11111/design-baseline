import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CrudDialogBody } from "./CrudDialogBody";

afterEach(() => {
  cleanup();
});

describe("CrudDialogBody — loading announcement", () => {
  it("exposes a status role with a Loading label while isLoading", () => {
    render(
      <CrudDialogBody isLoading>
        <div>fields</div>
      </CrudDialogBody>,
    );

    expect(screen.getByRole("status")).toBeDefined();
    expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText("Loading…")).toBeDefined();
    expect(screen.queryByText("fields")).toBeNull();
  });

  it("exposes no status role after load", () => {
    render(
      <CrudDialogBody>
        <div>fields</div>
      </CrudDialogBody>,
    );

    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText("Loading…")).toBeNull();
    expect(screen.getByText("fields")).toBeDefined();
  });
});

describe("CrudDialogBody — skeleton mobile collapse", () => {
  it("uses the same responsive collapse as the loaded two-column layout", () => {
    // jsdom can't resolve media queries, so the assertion is on the class
    // contract: the skeleton's grids must carry the exact responsive pair
    // (grid-cols-1 + sm:grid-cols-2) that the loaded two-column layout bakes
    // in, so the skeleton collapses wherever the body does.
    render(
      <CrudDialogBody isLoading>
        <div>fields</div>
      </CrudDialogBody>,
    );

    const wrapper = screen.getByRole("status");
    const grids = wrapper.querySelectorAll<HTMLElement>(".grid");
    expect(grids.length).toBeGreaterThan(0);
    for (const grid of grids) {
      expect(grid.classList.contains("grid-cols-1")).toBe(true);
      expect(grid.classList.contains("sm:grid-cols-2")).toBe(true);
      // A bare (non-responsive) two-column class would 2-col on mobile.
      expect(grid.classList.contains("grid-cols-2")).toBe(false);
    }
  });

  it("keeps the same padding box as the loaded body so load causes no layout shift", () => {
    render(
      <CrudDialogBody isLoading>
        <div>fields</div>
      </CrudDialogBody>,
    );

    const wrapper = screen.getByRole("status");
    expect(wrapper.classList.contains("px-6")).toBe(true);
    expect(wrapper.classList.contains("py-4")).toBe(true);
  });
});
