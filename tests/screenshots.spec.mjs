// One baseline per kind:page archetype per device (playwright.config.mjs).
import fs from "node:fs";
import { expect, test } from "@playwright/test";

const manifest = JSON.parse(fs.readFileSync(new URL("../docs/archetypes/MANIFEST.json", import.meta.url), "utf8"));

for (const { slug } of manifest.archetypes.filter((a) => a.kind === "page")) {
  test(slug, async ({ page }) => {
    // demos derive "today" from the clock; pin it so baselines don't move daily
    await page.clock.setFixedTime(new Date("2026-10-29T10:00:00Z"));
    await page.goto(`/#/a/${slug}`);
    await page.waitForSelector(".db-content-column h1");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${slug}.png`);
  });
}

// list-with-detail's bulk / summary state (v4.7): the "Production budget" demo
// sits below the fold of the page shot above, so it gets its own viewport shot,
// scrolled to the section: the bulk band in place of the toolbar, the pinned
// summary band, the checkbox column with two ticked rows.
test("list-with-detail-bulk-summary", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-29T10:00:00Z"));
  await page.goto("/#/a/list-with-detail");
  await page.waitForSelector(".db-content-column h1");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  const section = page.locator("section").filter({ has: page.getByRole("heading", { name: "Production budget", exact: true }) });
  await section.evaluate((el) => el.scrollIntoView({ block: "start" }));
  await expect(page).toHaveScreenshot("list-with-detail-bulk-summary.png");
});
