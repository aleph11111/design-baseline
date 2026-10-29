// Real-browser check of every `kind: page` archetype at the device triad
// (desk27 / laptop14 / phone, src/testing/devices.mjs; docs/STYLE.md "The
// device triad"). Asserts layout invariants that need no image baseline, keeps
// AppShell's wide-desk column steps (ADR-0007 amendment 2026-09-29; this
// absorbed check-desk-width.mjs), and writes a contact sheet of every page at
// the three devices for operator review.
// Run: npm run check:viewports  (builds gallery-dist first, uses local Chrome).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { devices } from "../src/testing/devices.mjs";
import { checkPageInvariants } from "../src/testing/invariants.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "gallery-dist");
const OUT = path.join(ROOT, "viewport-report");
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json" };
const PAGES = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/archetypes/MANIFEST.json"), "utf8"))
  .archetypes.filter((a) => a.kind === "page")
  .map((a) => a.slug);
// Content-column width per desktop device (ADR-0007 amendment); full-bleed
// pages have no max-width instead.
const COLUMN = { laptop14: 1144, desk27: 1680 };
// The full-bleed archetypes, a closed set (ADR-0007 §1, STYLE.md "Spacing &
// rhythm"). Pinned by name: a shell that loses its marker would otherwise pass
// as a plain column.
const FULL_BLEED = ["matrix-grid", "list-with-detail", "kanban-board", "calendar", "statement-with-filters"];
// The steps between the triad's two desktop widths, measured on form-page.
const STEPS = [
  { label: "1903 (1920 minus scrollbar)", width: 1903, want: 1440 },
  { label: "1920 sidebar collapsed", width: 1920, want: 1440, collapse: true },
];
// Invariant codes that fail donor-wide for a known, ticketed reason
// (code → ticket slug). Each still runs and prints on every run and in the
// contact sheet, as a warning naming its ticket; delete the entry when the
// ticket ships so the invariant fails again.
const KNOWN_GAPS = {};

const server = http.createServer((req, res) => {
  const p = path.join(DIST, req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(DIST) || !fs.existsSync(p) || !fs.statSync(p).isFile()) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": MIME[path.extname(p)] ?? "application/octet-stream" }).end(fs.readFileSync(p));
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/#/a/`;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const failures = [];
const total = PAGES.length * Object.keys(devices).length + STEPS.length;
let n = 0;
const report = (label, { failures: bad, knownGaps: warn }) => {
  n++;
  const lines = [...bad, ...warn];
  console.log(`[${new Date().toTimeString().slice(0, 8)}] ${n}/${total} ${bad.length ? "FAIL" : warn.length ? "warn" : "ok  "} ${label}${lines.length ? `\n      - ${lines.join("\n      - ")}` : ""}`);
  if (bad.length) failures.push(label);
};
const fail = (message) => ({ failures: [message], knownGaps: [] });
console.log(`viewports check: ${PAGES.length} pages x ${Object.keys(devices).length} devices + ${STEPS.length} column steps against ${DIST} (Chrome: ${CHROME})`);

const open = async (slug, device) => {
  const ctx = await browser.newContext(device);
  const page = await ctx.newPage();
  await page.goto(base + slug);
  await page.waitForSelector(".db-content-column");
  // demos are lazy chunks: wait for the page's own h1 inside the content column
  await page.waitForSelector(".db-content-column h1", { timeout: 10000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300); // useIsMobile and container queries settle
  return { ctx, page };
};

const shots = [];
for (const slug of PAGES) {
  for (const [name, device] of Object.entries(devices)) {
    const label = `${slug} @ ${name}`;
    let ctx;
    try {
      let page;
      ({ ctx, page } = await open(slug, device));
      const result = await checkPageInvariants(page, device, { knownGaps: KNOWN_GAPS, column: COLUMN[name], fullBleed: FULL_BLEED.includes(slug) });
      const file = `${slug}--${name}.jpg`;
      await page.screenshot({ path: path.join(OUT, file), type: "jpeg", quality: 70, scale: "css" });
      shots.push({ slug, name, file, problems: [...result.failures, ...result.knownGaps] });
      report(label, result);
    } catch (e) {
      report(label, fail(e.message.split("\n")[0]));
    } finally {
      await ctx?.close();
    }
  }
}

for (const s of STEPS) {
  const label = `form-page column @ ${s.label}`;
  const page = await browser.newPage({ viewport: { width: s.width, height: 900 } });
  try {
    await page.goto(base + "form-page");
    await page.waitForSelector(".db-content-column h1", { timeout: 10000 });
    if (s.collapse) {
      await page.keyboard.press("Control+b");
      // fail loudly if the toggle didn't collapse, or 1920 would be measured expanded
      await page.waitForSelector('[data-state="collapsed"]', { timeout: 5000 });
      await page.waitForTimeout(400); // sidebar width transition
    }
    const w = await page.$eval(".db-content-column", (el) => Math.round(el.getBoundingClientRect().width));
    report(label, w === s.want ? { failures: [], knownGaps: [] } : fail(`column: ${w}px, want ${s.want}px`));
  } catch (e) {
    report(label, fail(e.message.split("\n")[0]));
  } finally {
    await page.close();
  }
}

await browser.close();
server.close();

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const rows = PAGES.map((slug) => {
  const cells = Object.keys(devices).map((name) => {
    const s = shots.find((x) => x.slug === slug && x.name === name);
    if (!s) return `<figure class="bad"><figcaption>${name}: not rendered</figcaption></figure>`;
    const note = s.problems.length ? `<ul>${s.problems.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : "";
    return `<figure class="${s.problems.length ? "bad" : ""}"><a href="${s.file}"><img src="${s.file}" loading="lazy" alt="${slug} at ${name}"></a><figcaption>${name} ${devices[name].viewport.width}x${devices[name].viewport.height}</figcaption>${note}</figure>`;
  });
  return `<section><h2>${slug}</h2><div class="row">${cells.join("")}</div></section>`;
});
fs.writeFileSync(
  path.join(OUT, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>check:viewports ${new Date().toISOString()}</title>
<style>body{font:14px system-ui;margin:16px;background:#f6f6f6}h2{font-size:16px;margin:24px 0 8px}
.row{display:flex;gap:16px;align-items:flex-start}figure{margin:0;background:#fff;padding:8px;border:2px solid transparent}
figure.bad{border-color:#d33}figure:nth-child(1){flex:4}figure:nth-child(2){flex:3}figure:nth-child(3){flex:1}
img{width:100%;display:block}ul{color:#b00;margin:6px 0 0;padding-left:18px}</style>
<h1>check:viewports — ${failures.length ? `${failures.length} failing` : "all ok"}</h1>${rows.join("")}`,
);

console.log(failures.length ? `FAILED: ${failures.length}/${total}` : `PASSED: ${total}/${total}`);
console.log(`contact sheet: ${path.join(OUT, "index.html")}`);
process.exit(failures.length ? 1 : 0);
