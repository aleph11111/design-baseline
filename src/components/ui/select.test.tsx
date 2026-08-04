import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Select, SelectTrigger, SelectValue } from "./select";

afterEach(() => {
  cleanup();
});

// The class string the trigger hard-coded before the size scale existed. The
// `default` rung must keep rendering exactly this set — every fleet project that
// vendored the pre-scale trigger re-syncs onto `default`.
const LEGACY_TRIGGER_CLASSES =
  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1";

function renderTrigger(props: React.ComponentProps<typeof SelectTrigger> = {}) {
  render(
    <Select>
      <SelectTrigger aria-label="Scenario" {...props}>
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
    </Select>
  );
  return screen.getByRole("combobox", { name: "Scenario" });
}

function classSet(el: HTMLElement) {
  return new Set(el.className.split(/\s+/).filter(Boolean));
}

describe("SelectTrigger size scale", () => {
  it("renders the pre-scale class set at the default size", () => {
    expect(classSet(renderTrigger())).toEqual(
      new Set(LEGACY_TRIGGER_CLASSES.split(" "))
    );
  });

  it("renders a compact toolbar box at sm", () => {
    const trigger = renderTrigger({ size: "sm" });
    expect(classSet(trigger)).toContain("h-8");
    expect(classSet(trigger)).toContain("text-xs");
    expect(classSet(trigger)).not.toContain("h-10");
  });

  it("renders a touch-sized control at lg", () => {
    const trigger = renderTrigger({ size: "lg" });
    expect(classSet(trigger)).toContain("h-12");
    expect(classSet(trigger)).toContain("text-base");
  });

  it("lets className win over the variant height", () => {
    const classes = classSet(renderTrigger({ className: "h-7" }));
    expect(classes).toContain("h-7");
    expect(classes).not.toContain("h-10");
  });
});
