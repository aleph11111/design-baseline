import { describe, expect, it } from "vitest";
// through the package's own export, as a consumer imports it
import { devices, playwrightProjects, type DeviceName } from "design-baseline/testing/devices";

describe("device triad", () => {
  it("pins the three devices (STYLE.md 'The device triad')", () => {
    expect(devices).toEqual({
      desk27: { viewport: { width: 2560, height: 1440 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
      laptop14: { viewport: { width: 1512, height: 982 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false },
      phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    });
  });

  it("ships one Playwright project per device", () => {
    const names: DeviceName[] = playwrightProjects.map((p) => p.name);
    expect(names).toEqual(["desk27", "laptop14", "phone"]);
    for (const p of playwrightProjects) expect(p.use).toBe(devices[p.name]);
  });
});
