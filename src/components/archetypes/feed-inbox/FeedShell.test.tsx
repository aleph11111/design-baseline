import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FeedShell } from "./FeedShell";
import { FeedBody, FeedItem, FeedMasterDetailShell, FeedShell as BarrelFeedShell } from "./index";

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

describe("FeedBody", () => {
  it("renders no page h1 and no raised page surface (overlay / sheet use)", () => {
    const { container } = render(
      <FeedBody>
        <div>feed rows</div>
      </FeedBody>,
    );

    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    // No PageHeader (the page-title header) and no SurfaceFrame (the one
    // raised page surface): a feed rendered through the body export inside a
    // Sheet carries neither of the page frame's chrome.
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    expect(container.querySelector(".bg-surface-raised")).toBeNull();
    expect(container.querySelector(".space-y-5")).not.toBeNull();
  });

  it("shows `empty` instead of children when both are given", () => {
    const { queryByText, getByText } = render(
      <FeedBody empty={<p>Nothing here</p>}>
        <div>feed rows</div>
      </FeedBody>,
    );

    expect(getByText("Nothing here")).not.toBeNull();
    expect(queryByText("feed rows")).toBeNull();
  });

  it("renders children when `empty` is omitted", () => {
    const { getByText } = render(
      <FeedBody>
        <div>feed rows</div>
      </FeedBody>,
    );

    expect(getByText("feed rows")).not.toBeNull();
  });
});

describe("FeedMasterDetailShell", () => {
  function Page() {
    const [id, setId] = React.useState<string | null>(null);
    return (
      <FeedMasterDetailShell
        title="Messages"
        toolbar={<span>All</span>}
        detail={id && <p>detail of {id}</p>}
        emptyDetail={<p>Select a message</p>}
        onBack={() => setId(null)}
      >
        <FeedItem title="Order shipped" selected={id === "a"} onClick={() => setId("a")} />
      </FeedMasterDetailShell>
    );
  }
  // jsdom has no layout: assert the narrow-surface hide class; the real-Chrome
  // breakpoint behaviour is checked against the gallery.
  const NARROW_HIDDEN = "@max-3xl:hidden";
  const pane = (c: HTMLElement, slot: string) =>
    c.querySelector(`[data-slot="${slot}"]`) as HTMLElement;

  it("renders one page title and one raised surface holding both panes", () => {
    const { container } = render(<Page />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText("Messages")).toHaveLength(1);
    const surfaces = container.querySelectorAll(".bg-surface-raised");
    expect(surfaces).toHaveLength(1);
    expect(surfaces[0]?.contains(pane(container, "feed-list"))).toBe(true);
    expect(surfaces[0]?.contains(pane(container, "feed-detail"))).toBe(true);
  });

  it("shows list and empty detail side by side from md up when nothing is selected", () => {
    const { container } = render(<Page />);
    expect(pane(container, "feed-list").className).not.toContain(NARROW_HIDDEN);
    // The detail pane hides only below md; from md up it shows the empty state.
    expect(pane(container, "feed-detail").className).toContain(NARROW_HIDDEN);
    expect(screen.getByText("Select a message")).not.toBeNull();
  });

  it("below md, selecting swaps the list for the detail and Back returns", () => {
    const { container } = render(<Page />);
    fireEvent.click(screen.getByText("Order shipped"));
    expect(screen.getByText("detail of a")).not.toBeNull();
    expect(pane(container, "feed-list").className).toContain(NARROW_HIDDEN);
    expect(pane(container, "feed-detail").className).not.toContain(NARROW_HIDDEN);
    expect(container.querySelector('[aria-current="true"]')).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.queryByText("detail of a")).toBeNull();
    expect(pane(container, "feed-list").className).not.toContain(NARROW_HIDDEN);
  });

  it("below md, Back returns focus to the opened row and restores scroll", () => {
    render(<Page />);
    const row = screen.getByText("Order shipped").closest("[tabindex]") as HTMLElement;
    const scroller = document.documentElement; // jsdom has no scrollingElement; the shell falls back to this
    scroller.scrollTop = 120;
    row.focus();
    fireEvent.click(row);
    scroller.scrollTop = 0; // the hidden list clamps the page scroll
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(document.activeElement).toBe(screen.getByText("Order shipped").closest("[tabindex]"));
    expect(scroller.scrollTop).toBe(120);
  });

  it("on a wide surface, clearing the selection leaves scroll and focus alone", () => {
    const { container } = render(<Page />);
    // jsdom's offsetParent is always null (= narrow); stub a visible list.
    Object.defineProperty(pane(container, "feed-list"), "offsetParent", { get: () => document.body });
    const scroller = document.documentElement;
    scroller.scrollTop = 120;
    fireEvent.click(screen.getByText("Order shipped"));
    scroller.scrollTop = 900;
    (document.activeElement as HTMLElement | null)?.blur();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(scroller.scrollTop).toBe(900);
    expect(document.activeElement).toBe(document.body);
  });

  it("below md, Back after a deep link (detail set on mount) still focuses a row", () => {
    function Deep() {
      const [id, setId] = React.useState<string | null>("a");
      return (
        <FeedMasterDetailShell
          title="Messages"
          detail={id && <p>detail of {id}</p>}
          emptyDetail={null}
          onBack={() => setId(null)}
        >
          <FeedItem title="Order shipped" selected={id === "a"} onClick={() => setId("a")} />
        </FeedMasterDetailShell>
      );
    }
    render(<Deep />);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(document.activeElement).toBe(screen.getByText("Order shipped").closest("[tabindex]"));
  });

  it("renders `empty` instead of both panes", () => {
    const { container } = render(
      <FeedMasterDetailShell title="Messages" emptyDetail={null} onBack={() => {}} empty={<p>No messages</p>}>
        <div>rows</div>
      </FeedMasterDetailShell>,
    );
    expect(screen.getByText("No messages")).not.toBeNull();
    expect(pane(container, "feed-split")).toBeNull();
  });

  it("leaves the single-pane FeedShell without split panes", () => {
    const { container } = render(
      <FeedShell title="Inbox">
        <div>feed rows</div>
      </FeedShell>,
    );
    expect(container.querySelector('[data-slot="feed-split"]')).toBeNull();
    expect(container.querySelector(".space-y-5")?.textContent).toBe("feed rows");
  });
});

describe("archetype barrel", () => {
  it("exports the frameless body alongside the shell and the item", () => {
    expect(BarrelFeedShell).toBe(FeedShell);
    expect(FeedBody).toBeTypeOf("function");
  });
});
