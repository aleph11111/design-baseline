// TEMP experiment — deleted before ship.
import fs from "node:fs";
import crypto from "node:crypto";
import { expect, test } from "@playwright/test";
const manifest = JSON.parse(fs.readFileSync(new URL("../docs/archetypes/MANIFEST.json", import.meta.url), "utf8"));
for (const { slug } of manifest.archetypes.filter((a) => a.kind === "page")) {
  test(`diag ${slug}`, async ({ page }, info) => {
    const seen = [];
    page.on("response", async (r) => {
      if (!/fonts\.(gstatic|googleapis)/.test(r.url())) return;
      const b = await r.body().catch(() => Buffer.from(""));
      seen.push(`${r.url().slice(0, 90)} ${crypto.createHash("sha1").update(b).digest("hex").slice(0, 10)} ${b.length}`);
    });
    await page.clock.setFixedTime(new Date("2026-10-29T10:00:00Z"));
    await page.goto(`/#/a/${slug}`);
    await page.waitForSelector(".db-content-column h1");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    const w = await page.evaluate(() => [...document.querySelectorAll(".rounded-full")].slice(0, 3).map((e) => `${e.textContent}:${e.getBoundingClientRect().width}`).join(","));
    let ok = "PASS";
    try { await expect(page).toHaveScreenshot(`${slug}.png`); } catch { ok = "FAIL"; }
    console.log(`DIAG ${ok} ${slug} r${info.repeatEachIndex} w=[${w}] fonts=${seen.join(" | ")}`);
    if (ok === "FAIL") throw new Error("diff");
  });
}
