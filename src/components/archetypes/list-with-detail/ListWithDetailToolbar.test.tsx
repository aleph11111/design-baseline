import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ListWithDetailToolbar } from "./ListWithDetailToolbar";

afterEach(() => cleanup());

// The toolbar is the counter's owner (Layer 4: `{n} results`, muted small text,
// near the search box). It does not know the rows — the consumer passes the
// filtered count, so every assertion here passes `resultCount` and checks the
// rendered caption, matching the acceptance criteria.
describe("ListWithDetailToolbar result count", () => {
  it("shows the filtered match count while a query is live", () => {
    render(
      <ListWithDetailToolbar
        searchValue="co"
        onSearchChange={() => {}}
        resultCount={2}
      />,
    );
    expect(screen.getByText("2 results")).toBeTruthy();
  });

  it("shows \"0 results\" on a no-match query (the filtered-empty signal)", () => {
    render(
      <ListWithDetailToolbar
        searchValue="zzz"
        onSearchChange={() => {}}
        resultCount={0}
      />,
    );
    expect(screen.getByText("0 results")).toBeTruthy();
  });

  it("shows the full filtered-list count once the query is cleared", () => {
    const { rerender } = render(
      <ListWithDetailToolbar
        searchValue="co"
        onSearchChange={() => {}}
        resultCount={2}
      />,
    );
    expect(screen.getByText("2 results")).toBeTruthy();
    // Clearing the query: the list is the whole (filtered) set, so the full
    // count carries — the acceptance "clearing it displays the full
    // filtered-list count".
    rerender(
      <ListWithDetailToolbar
        searchValue=""
        onSearchChange={() => {}}
        resultCount={5}
      />,
    );
    expect(screen.getByText("5 results")).toBeTruthy();
  });

  it("pluralizes the English default correctly at n = 1", () => {
    render(
      <ListWithDetailToolbar
        searchValue="co"
        onSearchChange={() => {}}
        resultCount={1}
      />,
    );
    expect(screen.getByText("1 result")).toBeTruthy();
    expect(screen.queryByText("1 results")).toBeNull();
  });

  it("is overridable per call site — a formatter localizes plural forms and word order", () => {
    // German has two plural forms: "1 Ergebnis" (singular) vs "2 Ergebnisse"
    // (plural). A fixed noun suffix ("1 Ergebnisse") cannot express that, so the
    // prop is a formatter. This is the shape of the fix the ticket's "localise
    // it" criterion demands.
    const { rerender } = render(
      <ListWithDetailToolbar
        searchValue="co"
        onSearchChange={() => {}}
        resultCount={1}
        resultCountLabel={(n) => (n === 1 ? "1 Ergebnis" : `${n} Ergebnisse`)}
      />,
    );
    expect(screen.getByText("1 Ergebnis")).toBeTruthy();
    rerender(
      <ListWithDetailToolbar
        searchValue="co"
        onSearchChange={() => {}}
        resultCount={2}
        resultCountLabel={(n) => (n === 1 ? "1 Ergebnis" : `${n} Ergebnisse`)}
      />,
    );
    expect(screen.getByText("2 Ergebnisse")).toBeTruthy();
  });

  it("supports a non-English label with a different word order via the formatter", () => {
    // A language that places the figure after the noun (e.g. Arabic/Spanish
    // "resultados: 3" style) — the formatter gives the consumer full freedom.
    render(
      <ListWithDetailToolbar
        searchValue="co"
        onSearchChange={() => {}}
        resultCount={3}
        resultCountLabel={(n) => `${n} Treffer`}
      />,
    );
    expect(screen.getByText("3 Treffer")).toBeTruthy();
  });

  it("omits the caption when no count is provided", () => {
    render(<ListWithDetailToolbar searchValue="co" onSearchChange={() => {}} />);
    expect(screen.queryByText(/results/)).toBeNull();
  });

  it("renders the count in the shared muted small-text style", () => {
    render(
      <ListWithDetailToolbar
        searchValue="co"
        onSearchChange={() => {}}
        resultCount={2}
      />,
    );
    const count = screen.getByText("2 results");
    // Same treatment as the shell's other toolbar captions (search-input's
    // counter slot): muted small text with tabular figures.
    expect(count.className).toContain("text-xs");
    expect(count.className).toContain("text-muted-foreground");
  });
});
