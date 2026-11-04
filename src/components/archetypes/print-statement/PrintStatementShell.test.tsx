import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PRINT_DELAY_MS, PrintStatementShell } from "./PrintStatementShell";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const styleOf = (container: HTMLElement) => container.querySelector("style")?.textContent ?? "";

describe("PrintStatementShell", () => {
  it("titles the document once and renders a screen-only print toolbar", () => {
    const { container } = render(
      <PrintStatementShell title="Cashflow" subtitle="Asset · 2026" autoPrint={false}>
        <table><thead><tr><th>Position</th></tr></thead></table>
      </PrintStatementShell>,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Cashflow");
    const toolbar = container.querySelector('[data-slot="print-toolbar"]') as HTMLElement;
    expect(toolbar.className).toContain("print:hidden");
    expect(screen.getByRole("button", { name: "Print / Save as PDF" })).toBeTruthy();
  });

  it("emits A4 landscape with a 12mm margin by default, and repeats table headers", () => {
    const { container } = render(<PrintStatementShell title="T" autoPrint={false} />);
    expect(styleOf(container)).toContain("@page { size: A4 landscape; margin: 12mm; }");
    expect(styleOf(container)).toContain("thead { display: table-header-group; }");
  });

  it("emits A4 portrait when asked", () => {
    const { container } = render(<PrintStatementShell title="T" pageSize="a4-portrait" autoPrint={false} />);
    expect(styleOf(container)).toContain("size: A4 portrait;");
  });

  it.each([
    ["loading", { isLoading: true }],
    ["error", { error: new Error("Boom") }],
  ])("renders the %s state instead of the document, with no print action", (_, props) => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    vi.useFakeTimers();
    const { container } = render(
      <PrintStatementShell title="Cashflow" {...props}>
        <p>body</p>
      </PrintStatementShell>,
    );
    vi.advanceTimersByTime(PRINT_DELAY_MS * 2);
    expect(screen.queryByText("body")).toBeNull();
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.queryByRole("button", { name: "Print / Save as PDF" })).toBeNull();
    expect(container.querySelector("style")).toBeNull();
    expect(print).not.toHaveBeenCalled();
  });

  it("auto-prints exactly once, after the delay, once the document is ready", () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    vi.useFakeTimers();
    const { rerender } = render(<PrintStatementShell title="T" isLoading />);
    rerender(<PrintStatementShell title="T" />);
    vi.advanceTimersByTime(PRINT_DELAY_MS - 1);
    expect(print).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    rerender(<PrintStatementShell title="T" subtitle="again" />);
    vi.advanceTimersByTime(PRINT_DELAY_MS * 2);
    expect(print).toHaveBeenCalledTimes(1);
  });
});
