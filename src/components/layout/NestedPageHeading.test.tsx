import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { NestedPageHeading, NESTED_HEADING_CLASS } from "./NestedPageHeading";
import { OVERLINE_CLASS } from "./overline";

afterEach(() => {
  cleanup();
});

describe("NestedPageHeading", () => {
  it("renders the title as an h2 and renders no h1", () => {
    const { container } = render(<NestedPageHeading title="Devices" />);

    expect(container.querySelector("h2")?.textContent).toBe("Devices");
    expect(container.querySelector("h1")).toBeNull();
  });

  it("renders the title at the single fixed nested-page scale", () => {
    const { container } = render(<NestedPageHeading title="Devices" />);

    // The scale is a const the component reads at render — no prop routes into
    // the title's class, so the element must carry exactly the shared constant.
    expect(container.querySelector("h2")?.className).toBe(NESTED_HEADING_CLASS);
  });

  it("is a distinct rung of the ladder — not the overline, not the page title", () => {
    // Guards against silently collapsing the ladder: the nested rung must stay
    // below the h1 page title (text-lg) and above the section overline.
    expect(NESTED_HEADING_CLASS).not.toBe(OVERLINE_CLASS);
    expect(NESTED_HEADING_CLASS).not.toContain("text-lg");
  });

  it("renders subtitle, badges and actions only when provided", () => {
    const bare = render(<NestedPageHeading title="Devices" />);
    expect(bare.container.querySelector("p")).toBeNull();
    expect(bare.container.querySelector("button")).toBeNull();
    expect(bare.container.querySelector("[data-testid='badge']")).toBeNull();
    cleanup();

    const full = render(
      <NestedPageHeading
        title="Devices"
        subtitle="12 connected · 2 offline"
        badges={<span data-testid="badge">Active</span>}
        actions={<button data-testid="action" type="button">Manage</button>}
      />,
    );
    expect(full.container.querySelector("p")?.textContent).toBe(
      "12 connected · 2 offline",
    );
    expect(full.container.querySelector("[data-testid='badge']")).not.toBeNull();
    expect(full.container.querySelector("button")).not.toBeNull();
  });
});
