import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FeedItem } from "./FeedItem";

afterEach(() => {
  cleanup();
});

describe("FeedItem", () => {
  it("is not a tab stop when it has no onClick", () => {
    render(<FeedItem title="Not clickable" />);
    const row = screen.getByText("Not clickable").closest("[data-state], div");
    expect(row?.getAttribute("tabindex")).toBeNull();
  });

  it("is a focusable button-role row when it has an onClick", () => {
    const onClick = vi.fn();
    render(<FeedItem title="Clickable" onClick={onClick} />);
    const row = screen.getByRole("button", { name: /clickable/i });
    expect(row.getAttribute("tabindex")).toBe("0");
  });

  it("activates the handler on Enter and on Space", () => {
    const onClick = vi.fn();
    render(<FeedItem title="Clickable" onClick={onClick} />);
    const row = screen.getByRole("button", { name: /clickable/i });

    fireEvent.keyDown(row, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(row, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
