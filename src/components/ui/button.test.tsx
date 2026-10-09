import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Button, buttonVariants } from "./button";
import { ControlDensityProvider } from "./toolbar-band";

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

describe("Button — ladder sizes", () => {
  it("icon-sm is the h-8 w-8 square", () => {
    const c = buttonVariants({ size: "icon-sm" });
    expect(c).toContain("h-8 w-8");
    expect(c).not.toMatch(/\b(h|w)-9\b/);
  });

  it("inline carries no height or horizontal padding", () => {
    const c = buttonVariants({ size: "inline" });
    expect(c).not.toMatch(/(^|\s)h-/);
    expect(c).not.toMatch(/(^|\s)px-/);
  });

  it("warns for an unlabeled icon-sm", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button size="icon-sm">×</Button>);
    expect(warn).toHaveBeenCalled();
  });
});

describe("Button — touch density icon steps", () => {
  it.each(["icon", "icon-sm"] as const)("%s resolves to h-11 w-11 under touch", (size) => {
    const { getByRole } = render(
      <ControlDensityProvider density="touch">
        <Button size={size} aria-label="x">×</Button>
      </ControlDensityProvider>
    );
    expect(getByRole("button").className).toContain("h-11 w-11");
  });

  it("icon is unchanged without density", () => {
    const { getByRole } = render(<Button size="icon" aria-label="x">×</Button>);
    expect(getByRole("button").className).toContain("h-9 w-9");
  });
});
