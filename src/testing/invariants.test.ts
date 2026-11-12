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

  it("tapOverlap: a bottom-pinned bar over scrollable content is exempt; a top-pinned bar or a non-scrolling page still fails", async () => {
    // jsdom has no layout: stub the geometry the probe reads. Wrappers say
    // overflow:visible so the probe is not clipped to their (zero) rects.
    const rect = (top: number, h: number) => ({ top, bottom: top + h, left: 0, right: 390, width: 390, height: h, x: 0, y: top, toJSON() {} }) as DOMRect;
    const run = async (pin: string, barTop: number, room: number) => {
      document.body.innerHTML =
        `<div class="db-content-column" style="overflow:visible"><nav style="position:fixed"></nav><button id="t">Target</button><div style="overflow:visible;${pin}"><button id="bar">Bar</button></div></div>`;
      const t = document.getElementById("t")!, bar = document.getElementById("bar")!;
      t.getBoundingClientRect = () => rect(700, 60);
      bar.getBoundingClientRect = () => rect(barTop, 60);
      document.querySelector("nav")!.getBoundingClientRect = () => rect(0, 0);
      document.elementFromPoint = (_x: number, y: number) => (y >= barTop && y <= barTop + 60 ? bar : t);
      Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 844 + room });
      Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
      const { failures } = await checkPageInvariants({ evaluate: async (fn, a) => (fn as (a: unknown) => unknown)(a) as never }, devices.phone);
      return failures.filter((f: string) => f.startsWith("tapOverlap"));
    };
    const bottomBar = "position:sticky;bottom:0";
    expect(await run(bottomBar, 740, 200)).toEqual([]); // Td's sticky bar: the page scrolls the target clear
    expect(await run("position:fixed;bottom:0", 740, 0)).toHaveLength(1); // (b) bottom nav on a non-scrolling page
    expect(await run("position:sticky;top:0", 740, 200)).toHaveLength(1); // (a) top-pinned sticky header over a button
    expect(await run(bottomBar, 660, 200)).toHaveLength(1); // a bar above the target's top
  });
});
