import { describe, expect, it } from "vitest";
import { hideBelowClass } from "./tableColumn";

describe("hideBelowClass", () => {
  it("maps each tier to its spelled-out class", () => {
    expect(hideBelowClass({ hideBelow: "md" })).toBe("hidden md:table-cell");
    expect(hideBelowClass({ hideBelow: "2xl" })).toBe("hidden 2xl:table-cell");
    expect(hideBelowClass({})).toBeUndefined();
  });

  it("never hides the identifier, whatever the tier", () => {
    expect(hideBelowClass({ isIdentifier: true, hideBelow: "2xl" })).toBeUndefined();
    expect(hideBelowClass({ isIdentifier: true, hideBelow: "md" })).toBeUndefined();
  });
});
