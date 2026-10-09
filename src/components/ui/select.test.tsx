import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Select, SelectTrigger, SelectValue } from "./select";

afterEach(() => {
  cleanup();
});

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
  it("renders the h-9 ladder step at the default size", () => {
    const trigger = renderTrigger();
    expect(classSet(trigger)).toContain("h-9");
    expect(classSet(trigger)).toContain("text-sm");
  });

  it("renders a compact toolbar box at sm", () => {
    const trigger = renderTrigger({ size: "sm" });
    expect(classSet(trigger)).toContain("h-8");
    expect(classSet(trigger)).toContain("text-xs");
    expect(classSet(trigger)).not.toContain("h-10");
  });

  it("renders a touch-sized control at lg", () => {
    const trigger = renderTrigger({ size: "lg" });
    expect(classSet(trigger)).toContain("h-11");
    expect(classSet(trigger)).toContain("text-base");
  });

  it("lets className win over the variant height", () => {
    const classes = classSet(renderTrigger({ className: "h-7" }));
    expect(classes).toContain("h-7");
    expect(classes).not.toContain("h-9");
  });
});

describe("SelectTrigger joined label", () => {
  it("names the trigger and sits inside the button", () => {
    render(
      <Select value="actuals">
        <SelectTrigger label="Scenario">
          <SelectValue>Actuals</SelectValue>
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByRole("combobox", { name: "Scenario" });
    expect(trigger.querySelector("[data-joined-label]")?.textContent).toBe("Scenario");
    // The label cell must not be line-clamped like the value span.
    expect(classSet(trigger)).toContain("pl-0");
  });

  it("a width class on a labelled trigger sets the whole box: no content floor, label column yields first", () => {
    render(
      <Select value="a">
        <SelectTrigger label="Verantwortliche Abteilung" className="w-40">
          <SelectValue>Alle Werte</SelectValue>
        </SelectTrigger>
      </Select>
    );
    const classes = classSet(screen.getByRole("combobox"));
    expect(classes).toContain("w-40");
    expect(classes).toContain("grid-cols-[minmax(3rem,1fr)_auto_auto]");
    expect(classes).not.toContain("min-w-min");
  });

  it("a content-sized labelled trigger floors at label floor + full value", () => {
    render(
      <Select value="a">
        <SelectTrigger label="Scenario">
          <SelectValue>Actuals</SelectValue>
        </SelectTrigger>
      </Select>
    );
    const classes = classSet(screen.getByRole("combobox"));
    expect(classes).toContain("min-w-min");
    expect(classes).toContain("grid-cols-[minmax(3rem,auto)_minmax(max-content,1fr)_auto]");
  });

  it("renders no label cell without the prop", () => {
    expect(renderTrigger().querySelector("[data-joined-label]")).toBeNull();
  });
});
