import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Button } from "./button";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Button — icon size a11y dev warning", () => {
  it("warns when size=\"icon\" has no accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button size="icon">×</Button>);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Button size="icon"'));
  });

  it("names the sr-only option in the warning text", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button size="icon">×</Button>);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("sr-only"));
  });

  it("does not warn when size=\"icon\" has an aria-label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button size="icon" aria-label="Close">×</Button>);
    expect(warn).not.toHaveBeenCalled();
  });

  it("does not warn when size=\"icon\" carries an sr-only label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Button size="icon">
        ×<span className="sr-only">Close</span>
      </Button>
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("does not warn when an asChild icon Button's child is labeled", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Button size="icon" asChild>
        <a href="#x" aria-label="Open">×</a>
      </Button>
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("does not warn when a child svg self-labels via aria-label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Button size="icon">
        <svg aria-label="Close" />
      </Button>
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("does not warn when a child img self-labels via alt", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Button size="icon">
        <img alt="Close" />
      </Button>
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns exactly once across three renders of an unlabeled icon Button", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(<Button size="icon">×</Button>);
    rerender(<Button size="icon">×</Button>);
    rerender(<Button size="icon">×</Button>);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
