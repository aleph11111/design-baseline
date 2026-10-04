import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { FeedShell } from "./FeedShell";

afterEach(() => {
  cleanup();
});

describe("FeedShell", () => {
  it("renders `empty` instead of children when both are given", () => {
    const { queryByText, getByText } = render(
      <FeedShell title="Inbox" empty={<p>Nothing here</p>}>
        <div>feed rows</div>
      </FeedShell>,
    );

    expect(getByText("Nothing here")).not.toBeNull();
    expect(queryByText("feed rows")).toBeNull();
  });

  it("renders children when `empty` is omitted", () => {
    const { getByText } = render(
      <FeedShell title="Inbox">
        <div>feed rows</div>
      </FeedShell>,
    );

    expect(getByText("feed rows")).not.toBeNull();
  });

  it("renders the title once, as the page h1, with no on-surface title", () => {
    const { container } = render(
      <FeedShell title="Notifications">
        <div>feed rows</div>
      </FeedShell>,
    );

    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]?.textContent).toBe("Notifications");
    expect(screen.getAllByText("Notifications")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
  });

  it("puts filters and count in the toolbar band, actions in the page header", () => {
    render(
      <FeedShell
        title="Notifications"
        toolbar={<span>All</span>}
        count="3 unread"
        actions={<button>Mark all read</button>}
      >
        <div>feed rows</div>
      </FeedShell>,
    );

    const band = screen.getByText("All").closest(".border-b") as HTMLElement;
    expect(band.textContent).toContain("3 unread");
    expect(screen.getByRole("button", { name: "Mark all read" })).not.toBeNull();
    expect(band.textContent).not.toContain("Mark all read");
  });
});
