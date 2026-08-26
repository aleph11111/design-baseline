import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { HEADING_ROW_CLASSES } from "./HeadingRow";
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

  it("renders badges, subtitle and actions through the shared HeadingRow structure", () => {
    // Paired structural guarantee (paired with the assertion of the same
    // name in PageHeader.test.tsx): the row layout — outer wrapper, row,
    // title block, title/badges row, badges wrapper, subtitle scale and
    // actions wrapper — is pinned to HEADING_ROW_CLASSES, the single source
    // both ladder rungs compose. Any drift in this rung's row classes fails
    // here. The h2 scale is NOT part of the shared row — NESTED_HEADING_CLASS
    // is fixed in this component, alongside the h1's scale (ADR-0004).
    const { getByRole, getByTestId, getByText } = render(
      <NestedPageHeading
        title="Devices"
        subtitle="12 connected · 2 offline"
        badges={<span data-testid="badge">Active</span>}
        actions={<button data-testid="action" type="button">Manage</button>}
      />,
    );

    const heading = getByRole("heading", { level: 2 });
    const headingRow = heading.parentElement!;
    const titleBlock = headingRow.parentElement!;
    const row = titleBlock.parentElement!;
    const outer = row.parentElement!;

    expect(outer.className).toBe(HEADING_ROW_CLASSES.outer);
    expect(row.className).toBe(HEADING_ROW_CLASSES.row);
    expect(titleBlock.className).toBe(HEADING_ROW_CLASSES.titleBlock);
    expect(headingRow.className).toBe(HEADING_ROW_CLASSES.titleBadges);
    expect(getByTestId("badge").parentElement!.className).toBe(
      HEADING_ROW_CLASSES.badges,
    );
    expect(getByText("12 connected · 2 offline").className).toBe(
      HEADING_ROW_CLASSES.subtitle,
    );
    expect(getByTestId("action").parentElement!.className).toBe(
      HEADING_ROW_CLASSES.actions,
    );
    expect(heading.className).toBe(NESTED_HEADING_CLASS);
  });
});
