// The three devices every page is tested at (operator requirement 2026-10-29;
// docs/STYLE.md "The device triad"). One copy: the donor's check:viewports and
// every consumer's playwright.config import these — never retype the numbers.
// Zero-dependency on purpose, so a consumer's Playwright config can load it.

/** 27-inch QHD monitor (a 27-inch 5K at 2x gives the same CSS size). */
export const desk27 = Object.freeze({
  viewport: Object.freeze({ width: 2560, height: 1440 }),
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false,
});

/** MacBook Pro 14-inch at its default scaling. */
export const laptop14 = Object.freeze({
  viewport: Object.freeze({ width: 1512, height: 982 }),
  deviceScaleFactor: 2,
  isMobile: false,
  hasTouch: false,
});

/** iPhone 15 class phone. */
export const phone = Object.freeze({
  viewport: Object.freeze({ width: 390, height: 844 }),
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});

export const devices = Object.freeze({ desk27, laptop14, phone });

/** Spread into a Playwright config: `projects: playwrightProjects`. */
export const playwrightProjects = Object.freeze(
  Object.entries(devices).map(([name, use]) => Object.freeze({ name, use })),
);
