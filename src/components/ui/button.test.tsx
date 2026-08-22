import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Button } from "./button";

afterEach(() => {
  cleanup();
});

describe("Button — icon size a11y dev warning", () => {
  it("warns when size=\"icon\" has no accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button size="icon">×</Button>);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Button size="icon"'));
    warn.mockRestore();
  });

  it("does not warn when size=\"icon\" has an aria-label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button size="icon" aria-label="Close">×</Button>);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
