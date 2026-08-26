import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { HEADING_ROW_CLASSES } from "./HeadingRow";
import { PageHeader } from "./PageHeader";

afterEach(() => {
  cleanup();
});

describe("PageHeader", () => {
  it("renders no back link when backHref is omitted", () => {
    const { container, queryByText } = render(<PageHeader title="Orders" />);

    expect(container.querySelector("a")).toBeNull();
    expect(queryByText("Back")).toBeNull();
  });

  it("renders a default anchor when backHref is set without renderBackLink", () => {
    const { container, getByText } = render(
      <PageHeader title="Order #1024" backHref="/orders" />,
    );

    const anchor = container.querySelector("a");
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute("href")).toBe("/orders");
    expect(anchor?.contains(getByText("Back"))).toBe(true);
  });

  it("uses backLabel for the default anchor", () => {
    const { getByText } = render(
      <PageHeader title="Order #1024" backHref="/orders" backLabel="All orders" />,
    );

    expect(getByText("All orders")).not.toBeNull();
  });

  it("calls renderBackLink with (backHref, backLabel) and renders its result", () => {
    const renderBackLink = vi.fn((href: string, label: string) => (
      <button type="button" data-testid="router-link" data-href={href}>
        {label}
      </button>
    ));

    const { container, getByTestId } = render(
      <PageHeader
        title="Order #1024"
        backHref="/orders"
        backLabel="All orders"
        renderBackLink={renderBackLink}
      />,
    );

    expect(renderBackLink).toHaveBeenCalledWith("/orders", "All orders");

    const link = getByTestId("router-link");
    expect(link.getAttribute("data-href")).toBe("/orders");
    expect(link.textContent).toBe("All orders");
    // The default `<a>` fallback must not also render.
    expect(container.querySelector("a")).toBeNull();
  });

  it("defaults backLabel to \"Back\" when passing it to renderBackLink", () => {
    const renderBackLink = vi.fn(() => null);

    render(<PageHeader title="Order #1024" backHref="/orders" renderBackLink={renderBackLink} />);

    expect(renderBackLink).toHaveBeenCalledWith("/orders", "Back");
  });

  it("ignores renderBackLink when backHref is absent", () => {
    const renderBackLink = vi.fn(() => <span data-testid="router-link">Back</span>);

    const { queryByTestId } = render(
      <PageHeader title="Orders" renderBackLink={renderBackLink} />,
    );

    expect(renderBackLink).not.toHaveBeenCalled();
    expect(queryByTestId("router-link")).toBeNull();
  });

  it("renders icon, badges, actions and subtitle only when provided", () => {
    const Icon = ({ className }: { className?: string }) => (
      <svg data-testid="icon" className={className} />
    );

    const bare = render(<PageHeader title="Orders" />);
    expect(bare.queryByTestId("icon")).toBeNull();
    expect(bare.queryByTestId("badge")).toBeNull();
    expect(bare.queryByTestId("action")).toBeNull();
    expect(bare.container.querySelector("p")).toBeNull();
    cleanup();

    const full = render(
      <PageHeader
        title="Orders"
        subtitle="Updated just now"
        icon={Icon}
        badges={<span data-testid="badge">Paid</span>}
        actions={<button data-testid="action">Export</button>}
      />,
    );
    expect(full.getByTestId("icon")).not.toBeNull();
    expect(full.getByTestId("badge")).not.toBeNull();
    expect(full.getByTestId("action")).not.toBeNull();
    expect(full.container.querySelector("p")?.textContent).toBe("Updated just now");
  });

  it("renders the title as an h1", () => {
    const { container } = render(<PageHeader title="Orders" />);

    expect(container.querySelector("h1")?.textContent).toBe("Orders");
  });

  it("renders badges, subtitle and actions through the shared HeadingRow structure", () => {
    // Paired structural guarantee (paired with the assertion of the same
    // name in NestedPageHeading.test.tsx): the row layout — outer wrapper,
    // row, title block, title/badges row, badges wrapper, subtitle scale and
    // actions wrapper — is pinned to HEADING_ROW_CLASSES, the single source
    // both ladder rungs compose. Any drift in one rung's row classes fails
    // here. The h1 scale is NOT part of the shared row — it is fixed in this
    // component, alongside the h2's NESTED_HEADING_CLASS (ADR-0004).
    const { getByRole, getByTestId, getByText } = render(
      <PageHeader
        title="Orders"
        subtitle="Updated just now"
        badges={<span data-testid="badge">Paid</span>}
        actions={<button data-testid="action">Export</button>}
      />,
    );

    const heading = getByRole("heading", { level: 1 });
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
    expect(getByText("Updated just now").className).toBe(
      HEADING_ROW_CLASSES.subtitle,
    );
    expect(getByTestId("action").parentElement!.className).toBe(
      HEADING_ROW_CLASSES.actions,
    );
    expect(heading.className).toBe(
      "text-lg font-semibold leading-tight tracking-tight text-foreground",
    );
  });
});
