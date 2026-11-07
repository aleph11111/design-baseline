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

  it("phoneNav: AuthCard page is exempt from no-navigation, an app page is not", async () => {
    // jsdom has no layout, so `visible` is false everywhere: this exercises only the marker branch.
    const run = (html: string) => {
      document.body.innerHTML = html;
      return checkPageInvariants({ evaluate: async (fn, a) => (fn as (a: unknown) => unknown)(a) as never }, devices.phone);
    };
    expect((await run('<div data-slot="auth-card"></div>')).failures.filter((f: string) => f.startsWith("phoneNav"))).toEqual([]);
    expect((await run('<div class="db-content-column"><div data-slot="auth-card"></div></div>')).failures).toEqual(
      expect.arrayContaining([expect.stringMatching(/^phoneNav: phone has no navigation/)]),
    );
    expect((await run("<main></main>")).failures).toEqual(expect.arrayContaining([expect.stringMatching(/^phoneNav: phone has no navigation/)]));
  });
});
