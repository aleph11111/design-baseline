import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ListWithDetailDemo } from "./list-with-detail-demo";

// jsdom lacks matchMedia; stub a desktop match (same stub the other demo tests set).
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;

afterEach(cleanup);

// Every shell opens its own sheet when its selectedRowId is set, so the panels
// must not share one selection: one row click opens exactly one sheet.
it("a row click in one panel opens exactly one detail sheet", () => {
  render(<ListWithDetailDemo />);
  fireEvent.click(screen.getAllByText("Riverbed")[0]);
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
});
