import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Calendar } from "./calendar";
import { ControlDensityProvider } from "./toolbar-band";

afterEach(cleanup);

const month = new Date(2026, 0, 1);
const navBtn = () => screen.getAllByRole("button")[0]!;
const dayBtn = () => screen.getAllByRole("gridcell")[10]!;

describe("Calendar under touch density", () => {
  it("lifts nav and day buttons to 44pt", () => {
    render(<ControlDensityProvider density="touch"><Calendar defaultMonth={month} /></ControlDensityProvider>);
    expect(navBtn().className).toContain("h-11 w-11");
    expect(dayBtn().className).toContain("h-11 w-11");
  });

  it("is unchanged without density", () => {
    render(<Calendar defaultMonth={month} />);
    expect(navBtn().className).toContain("h-7 w-7");
    expect(navBtn().className).not.toContain("h-11");
    expect(dayBtn().className).toContain("h-9 w-9");
  });
});
