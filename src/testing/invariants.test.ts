import { describe, expect, it } from "vitest";
// through the package's own export, as a consumer imports it
import { assertPageInvariants, checkPageInvariants } from "design-baseline/testing/invariants";
import { devices } from "design-baseline/testing/devices";

// The in-page measurement needs real layout (check:viewports runs it in
// Chrome); here a page stub returns fixed problems to test the gap logic.
const page = (problems: string[]) => ({ evaluate: async () => problems as never });

describe("page invariants", () => {
  it("passes the device's phone flag into the measurement", async () => {
    let arg: { mobile: boolean; tap: number } | undefined;
    await checkPageInvariants({ evaluate: async (_fn, a) => { arg = a as never; return [] as never; } }, devices.phone);
    expect(arg).toMatchObject({ mobile: true, tap: 44 });
  });

  it("throws listing every failure", async () => {
    await expect(assertPageInvariants(page(["overflow: x", "tapTargets: y"]), devices.phone)).rejects.toThrow(
      /overflow: x[\s\S]*tapTargets: y/,
    );
  });

  it("downgrades a known-gap code to a warning naming its ticket", async () => {
    const warnings = await assertPageInvariants(page(["tapTargets: y"]), devices.phone, {
      knownGaps: { tapTargets: "some-ticket" },
    });
    expect(warnings).toEqual(["known gap (some-ticket): tapTargets: y"]);
    await expect(
      assertPageInvariants(page(["tapTargets: y", "overflow: x"]), devices.phone, { knownGaps: { tapTargets: "t" } }),
    ).rejects.toThrow(/overflow: x/);
  });
});
