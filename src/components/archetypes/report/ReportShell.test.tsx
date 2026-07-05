import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ReportShell } from "./ReportShell";

afterEach(() => {
  cleanup();
});

describe("ReportShell", () => {
  it("renders its header through the shared SurfaceHeader", () => {
    const { container, getByText } = render(
      <ReportShell kicker="Beleg" title="RE-2025-0417">
        <div>body</div>
      </ReportShell>,
    );

    const header = container.querySelector('[data-slot="surface-header"]');
    expect(header).not.toBeNull();
    expect(header?.contains(getByText("Beleg"))).toBe(true);
    expect(header?.contains(getByText("RE-2025-0417"))).toBe(true);
  });
});
