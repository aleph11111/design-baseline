import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FeedShell } from "./FeedShell";

afterEach(() => {
  cleanup();
});

const TOOLBAR = ".flex-wrap";
const HEADER = '[data-slot="surface-header"]';

describe("FeedShell", () => {
  it("renders `empty` instead of children when both are given", () => {
    const { queryByText, getByText } = render(
      <FeedShell empty={<p>Nothing here</p>}>
        <div>feed rows</div>
      </FeedShell>,
    );

    expect(getByText("Nothing here")).not.toBeNull();
    expect(queryByText("feed rows")).toBeNull();
  });

  it("renders children when `empty` is omitted", () => {
    const { getByText } = render(
      <FeedShell>
        <div>feed rows</div>
      </FeedShell>,
    );

    expect(getByText("feed rows")).not.toBeNull();
  });

  it("omits the toolbar row without filters or actions", () => {
    const { container } = render(
      <FeedShell>
        <div>feed rows</div>
      </FeedShell>,
    );

    expect(container.querySelector(TOOLBAR)).toBeNull();
  });

  it("renders the toolbar row with filters or with actions", () => {
    const withFilters = render(
      <FeedShell filters={<span>All</span>}>
        <div>feed rows</div>
      </FeedShell>,
    );
    expect(withFilters.container.querySelector(TOOLBAR)).not.toBeNull();
    expect(withFilters.container.querySelector(".ml-auto")).toBeNull();
    cleanup();

    const withActions = render(
      <FeedShell actions={<button>Mark all read</button>}>
        <div>feed rows</div>
      </FeedShell>,
    );
    const toolbar = withActions.container.querySelector(TOOLBAR);
    expect(toolbar).not.toBeNull();
    expect(toolbar?.querySelector(".ml-auto")?.textContent).toBe("Mark all read");
  });

  it("renders the header (kicker, title, headerActions) when title is set", () => {
    const { container, getByText } = render(
      <FeedShell kicker="Inbox" title="Activity" headerActions={<button>Settings</button>}>
        <div>feed rows</div>
      </FeedShell>,
    );

    const header = container.querySelector(HEADER);
    expect(header).not.toBeNull();
    expect(header?.contains(getByText("Inbox"))).toBe(true);
    expect(header?.contains(getByText("Activity"))).toBe(true);
    expect(header?.contains(getByText("Settings"))).toBe(true);
  });

  it("renders no header when title is undefined", () => {
    const { container } = render(
      <FeedShell kicker="Inbox" headerActions={<button>Settings</button>}>
        <div>feed rows</div>
      </FeedShell>,
    );

    expect(container.querySelector(HEADER)).toBeNull();
  });

  it("treats an empty-string title as titled (not `!title`)", () => {
    const { container } = render(
      <FeedShell title="">
        <div>feed rows</div>
      </FeedShell>,
    );

    expect(container.querySelector(HEADER)).not.toBeNull();
  });
});
