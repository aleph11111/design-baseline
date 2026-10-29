// The one Playwright image screenshot baselines are rendered in (STYLE.md "The
// device triad"). Pixels differ between machines (fonts, antialiasing), so a
// baseline is only comparable when every run — the operator's Mac, the CI
// runner, a consumer's box — renders inside the same image. Donor and
// consumers import the tag from here and never retype it. Zero-dependency.
import fs from "node:fs";
import path from "node:path";

/** Must equal the installed `@playwright/test` / `playwright-core`: the image ships that version's browsers. */
export const PLAYWRIGHT_VERSION = "1.63.0";

export const PLAYWRIGHT_IMAGE = `mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble`;

/** True inside the official image (it sets `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`). */
export function inPlaywrightImage() {
  return process.env.PLAYWRIGHT_BROWSERS_PATH === "/ms-playwright";
}

/**
 * Throws unless this process runs inside `PLAYWRIGHT_IMAGE` with a matching
 * Playwright installed in `cwd`. Call it at the top of a screenshot config, so
 * a baseline can never be written or compared from a host browser.
 */
export function assertInPlaywrightImage(cwd = process.cwd()) {
  if (!inPlaywrightImage()) {
    throw new Error(
      `Screenshot baselines render only inside ${PLAYWRIGHT_IMAGE}, so every machine draws the same pixels. ` +
        `Run the command through it: npx design-baseline-playwright <command>`,
    );
  }
  const pkg = path.join(cwd, "node_modules/playwright-core/package.json");
  const installed = fs.existsSync(pkg) ? JSON.parse(fs.readFileSync(pkg, "utf8")).version : "none";
  if (installed !== PLAYWRIGHT_VERSION) {
    throw new Error(
      `Installed Playwright is ${installed}, but ${PLAYWRIGHT_IMAGE} ships the browsers of ${PLAYWRIGHT_VERSION}. ` +
        `Pin @playwright/test to exactly ${PLAYWRIGHT_VERSION}.`,
    );
  }
}
