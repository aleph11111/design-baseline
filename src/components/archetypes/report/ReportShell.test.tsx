import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ReportShell } from "./ReportShell";

afterEach(() => {
  cleanup();
});

describe("ReportShell", () => {
  it("titles the page once, as the h1, with no on-surface title and no toolbar band", () => {
    const { container } = render(
      <ReportShell title="RE-2025-0417" actions={<button type="button">PDF</button>}>
        <div>body</div>
      </ReportShell>,
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("RE-2025-0417");
    expect(screen.getAllByText("RE-2025-0417")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    expect(container.querySelector(".border-b")).toBeNull();
    expect(screen.getByText("PDF")).toBeTruthy();
  });

  it("bounds the page column by width", () => {
    const { container } = render(
      <ReportShell title="Beleg" width="sm">
        <div>body</div>
      </ReportShell>,
    );
    expect((container.firstElementChild as HTMLElement).className).toContain("max-w-xl");
  });
});
