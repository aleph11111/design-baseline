// Real-browser check of every `kind: page` archetype at the device triad
// (desk27 / laptop14 / phone, src/testing/devices.mjs; docs/STYLE.md "The
// device triad"), plus every page at the real laptop-window widthSweep
// (invariants only). Asserts layout invariants that need no image baseline, keeps
// AppShell's wide-desk column steps (ADR-0007 amendment 2026-09-29; this
// absorbed check-desk-width.mjs), and writes a contact sheet of every page at
// the three devices for operator review.
// Run: npm run check:viewports  (builds gallery-dist first, uses local Chrome).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { devices, widthSweep } from "../src/testing/devices.mjs";
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
// Document-column archetypes (ADR-0015): the column holds at --db-document-max
// on every desktop device — the wide-desk steps never widen it.
const DOCUMENT_COLUMN = ["transaction-document"];
const columnFor = (slug, name) => (DOCUMENT_COLUMN.includes(slug) && name in COLUMN ? 896 : COLUMN[name]);
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
// Sweep findings with a ticket, keyed `<slug>@<width>:<code>` → ticket slug.
// Per page and width, so a sweep gap never downgrades a code at the triad.
// Empty on purpose: the first sweep run (2026-11-09, 51/51 ok) found no
// finding at any width — toolbarRows at 1024 included.
const SWEEP_GAPS = {};

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
// transaction-document's three demo documents (demo radio label → contact-sheet slug).
const TD_VARIANTS = [["Sales order", "transaction-document-order"], ["Offer", "transaction-document-offer"], ["Purchase order", "transaction-document-purchase"]];
const failures = [];
const total = PAGES.length * (Object.keys(devices).length + widthSweep.length) + STEPS.length + 1 + 3 * Object.keys(devices).length + TD_VARIANTS.length * (Object.keys(devices).length + widthSweep.length); // + the print-media check + analytics-dashboard edit mode + matrix-grid inspector + matrix-grid workbench + transaction-document variants
let n = 0;
const report = (label, { failures: bad, knownGaps: warn }) => {
  n++;
  const lines = [...bad, ...warn];
  console.log(`[${new Date().toTimeString().slice(0, 8)}] ${n}/${total} ${bad.length ? "FAIL" : warn.length ? "warn" : "ok  "} ${label}${lines.length ? `\n      - ${lines.join("\n      - ")}` : ""}`);
  if (bad.length) failures.push(label);
};
const fail = (message) => ({ failures: [message], knownGaps: [] });
console.log(`viewports check: ${PAGES.length} pages x (${Object.keys(devices).length} devices + ${widthSweep.length} sweep widths ${widthSweep.map((d) => d.viewport.width).join("/")}) + ${STEPS.length} column steps against ${DIST} (Chrome: ${CHROME})`);

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
      const result = await checkPageInvariants(page, device, { knownGaps: KNOWN_GAPS, column: columnFor(slug, name), fullBleed: FULL_BLEED.includes(slug) });
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

// Real laptop-window widths (widthSweep, 1133 = laptop14Window): invariants
// only — no column check, no screenshot, no contact-sheet entry.
for (const slug of PAGES) {
  for (const device of widthSweep) {
    const w = device.viewport.width;
    const label = `${slug} @ sweep ${w}`;
    let ctx;
    try {
      let page;
      ({ ctx, page } = await open(slug, device));
      const prefix = `${slug}@${w}:`;
      const gaps = Object.fromEntries(Object.entries(SWEEP_GAPS).filter(([k]) => k.startsWith(prefix)).map(([k, t]) => [k.slice(prefix.length), t]));
      report(label, await checkPageInvariants(page, device, { knownGaps: gaps, fullBleed: FULL_BLEED.includes(slug) }));
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

// print-statement under print media: the toolbar is hidden and the shell's
// @page rule is in the document (A4 landscape, 12mm — the default pageSize).
{
  const label = "print-statement @ print media";
  let ctx;
  try {
    let page;
    ({ ctx, page } = await open("print-statement", devices.desk27));
    await page.emulateMedia({ media: "print" });
    const got = await page.evaluate(() => {
      const toolbar = document.querySelector('[data-slot="print-toolbar"]');
      const rule = [...document.styleSheets]
        .flatMap((s) => { try { return [...s.cssRules]; } catch { return []; } }) // cross-origin sheets throw
        .find((r) => r instanceof CSSPageRule);
      return {
        toolbar: toolbar ? getComputedStyle(toolbar).display : "missing",
        size: rule?.style.getPropertyValue("size") ?? "",
        margin: rule?.style.getPropertyValue("margin") ?? "",
      };
    });
    const bad = [];
    if (got.toolbar !== "none") bad.push(`print toolbar display ${got.toolbar}, want none`);
    if (got.size.toLowerCase() !== "a4 landscape" || got.margin !== "12mm") bad.push(`@page size "${got.size}" margin "${got.margin}", want "A4 landscape" / "12mm"`);
    report(label, { failures: bad, knownGaps: [] });
  } catch (e) {
    report(label, fail(e.message.split("\n")[0]));
  } finally {
    await ctx?.close();
  }
}

// analytics-dashboard in edit mode (ADR-0011): the same invariants at the
// device triad once "Edit layout" has swapped in the edit controls.
for (const [name, device] of Object.entries(devices)) {
  const label = `analytics-dashboard edit mode @ ${name}`;
  let ctx;
  try {
    let page;
    ({ ctx, page } = await open("analytics-dashboard", device));
    await page.getByRole("button", { name: "Edit layout" }).click();
    await page.waitForSelector('[data-slot="dashboard-widget-edit"]', { timeout: 5000 });
    await page.waitForTimeout(300);
    const result = await checkPageInvariants(page, device, { knownGaps: KNOWN_GAPS, column: COLUMN[name], fullBleed: false });
    const file = `analytics-dashboard-edit--${name}.jpg`;
    await page.screenshot({ path: path.join(OUT, file), type: "jpeg", quality: 70, scale: "css" });
    shots.push({ slug: "analytics-dashboard-edit", name, file, problems: [...result.failures, ...result.knownGaps] });
    report(label, result);
  } catch (e) {
    report(label, fail(e.message.split("\n")[0]));
  } finally {
    await ctx?.close();
  }
}

// matrix-grid's docked inspector (contract Layer 6 "Inspector slot"): docked
// at ~480px beside a still-live grid on the desktops, the full-screen overlay
// on phone, and nothing inside it scrolls sideways.
for (const [name, device] of Object.entries(devices)) {
  const label = `matrix-grid inspector @ ${name}`;
  let ctx;
  try {
    let page;
    ({ ctx, page } = await open("matrix-grid", device));
    await page.getByRole("radio", { name: "inspector" }).click();
    await page.locator("td[data-filled]").first().click();
    const dock = page.locator('[data-slot="matrix-inspector"]');
    await dock.waitFor({ timeout: 5000 });
    await dock.getByRole("button", { name: "Monthly attendance" }).click();
    await page.waitForTimeout(400); // sheet slide-in / collapsible settle
    const result = await checkPageInvariants(page, device, { knownGaps: KNOWN_GAPS, column: COLUMN[name], fullBleed: true });
    // phone: the overlay is modal, so the page's nav is aria-hidden behind it by design
    const bad = result.failures.filter((f) => !(name === "phone" && f.startsWith("phoneNav:")));
    const box = await dock.boundingBox();
    const W = device.viewport.width;
    if (name === "phone") {
      if (Math.abs(box.width - W) > 1) bad.push(`inspector: ${box.width}px wide on phone, want full-screen ${W}px`);
    } else {
      if (box.width < 440 || box.width > 500) bad.push(`inspector: ${box.width}px wide, want ~480px docked`);
      const grid = await page.locator('[data-slot="matrix-scroll"]').boundingBox();
      if (grid.x + grid.width > box.x) bad.push("inspector: overlaps the grid instead of docking beside it");
      // the grid stays live: another row's cell re-roots the open inspector
      const before = await dock.locator("h2").textContent();
      await page.locator("tbody tr:nth-child(3) td").first().click();
      await page.waitForTimeout(200);
      const after = await dock.locator("h2").textContent();
      if (after === before) bad.push(`inspector: a grid click did not switch the line (still "${after}")`);
    }
    const wide = await dock.evaluate((root) =>
      [root, ...root.querySelectorAll("*")]
        .filter((el) => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== "visible")
        .map((el) => `<${el.tagName.toLowerCase()}> ${el.scrollWidth}>${el.clientWidth}`),
    );
    for (const w of wide) bad.push(`inspector: scrolls sideways ${w}`);
    const file = `matrix-grid-inspector--${name}.jpg`;
    await page.screenshot({ path: path.join(OUT, file), type: "jpeg", quality: 70, scale: "css" });
    shots.push({ slug: "matrix-grid-inspector", name, file, problems: [...bad, ...result.knownGaps] });
    report(label, { failures: bad, knownGaps: result.knownGaps });
  } catch (e) {
    report(label, fail(e.message.split("\n")[0]));
  } finally {
    await ctx?.close();
  }
}

// matrix-grid workbench (ADR-0013, contract Layer 5 "Workbench satellites"):
// with the inspector open, the read-only preview matrix in `body` and the
// `dock` summary stay rendered and on-screen, and the page never scrolls
// sideways (checkPageInvariants).
for (const [name, device] of Object.entries(devices)) {
  const label = `matrix-grid workbench @ ${name}`;
  let ctx;
  try {
    let page;
    ({ ctx, page } = await open("matrix-grid", device));
    await page.getByRole("radio", { name: "workbench" }).click();
    await page.locator("td[data-filled]").first().click();
    await page.locator('[data-slot="matrix-inspector"]').waitFor({ timeout: 5000 });
    await page.waitForTimeout(400); // sheet slide-in
    const result = await checkPageInvariants(page, device, { knownGaps: KNOWN_GAPS, column: COLUMN[name], fullBleed: true });
    // phone: the overlay is modal, so the page's nav is aria-hidden behind it by design
    const bad = result.failures.filter((f) => !(name === "phone" && f.startsWith("phoneNav:")));
    const W = device.viewport.width;
    for (const slot of ["matrix-body", "matrix-dock"]) {
      const box = await page.locator(`[data-slot="${slot}"]`).boundingBox();
      if (!box || box.width < 1) bad.push(`workbench: ${slot} not rendered`);
      else if (box.x < 0 || box.x + box.width > W + 1) bad.push(`workbench: ${slot} spans ${box.x}..${box.x + box.width}, viewport ${W}`);
    }
    if (name !== "phone") {
      const dock = await page.locator('[data-slot="matrix-inspector"]').boundingBox();
      const body = await page.locator('[data-slot="matrix-body"]').boundingBox();
      if (body && dock && body.x + body.width > dock.x) bad.push("workbench: body runs under the docked inspector");
    }
    const file = `matrix-grid-workbench--${name}.jpg`;
    await page.screenshot({ path: path.join(OUT, file), type: "jpeg", quality: 70, scale: "css", fullPage: true });
    shots.push({ slug: "matrix-grid-workbench", name, file, problems: [...bad, ...result.knownGaps] });
    report(label, { failures: bad, knownGaps: result.knownGaps });
  } catch (e) {
    report(label, fail(e.message.split("\n")[0]));
  } finally {
    await ctx?.close();
  }
}

// transaction-document (contract "Acceptance gate"): each of the three demo
// documents at the triad and the sweep widths — the ledger never scrolls
// sideways, the long title shows in full, and on phone the nextStep primary
// stays in the viewport while the page scrolls.
for (const [radio, shot] of TD_VARIANTS) {
  for (const [name, device] of [...Object.entries(devices), ...widthSweep.map((d) => [`sweep ${d.viewport.width}`, d])]) {
    const label = `transaction-document ${radio} @ ${name}`;
    let ctx;
    try {
      let page;
      ({ ctx, page } = await open("transaction-document", device));
      await page.getByRole("radio", { name: radio }).click();
      await page.waitForTimeout(300); // ledger ResizeObserver settles
      const triad = name in devices;
      const result = await checkPageInvariants(page, device, { knownGaps: KNOWN_GAPS, column: triad ? columnFor("transaction-document", name) : undefined, fullBleed: false });
      const bad = [...result.failures];
      const wide = await page.$$eval('[data-slot="td-ledger"], [data-slot="td-ledger"] *', (els) =>
        els.filter((el) => ["auto", "scroll"].includes(getComputedStyle(el).overflowX) && el.scrollWidth > el.clientWidth + 1).map((el) => `<${el.tagName.toLowerCase()}> ${el.scrollWidth}>${el.clientWidth}`));
      for (const w of wide) bad.push(`ledger: scrolls sideways ${w}`);
      const title = await page.$eval(".db-content-column h1", (h) => {
        const s = getComputedStyle(h);
        return { cut: h.scrollWidth > h.clientWidth + 1 || h.scrollHeight > h.clientHeight + 1, ellipsis: s.textOverflow === "ellipsis" || s.webkitLineClamp !== "none" };
      });
      if (title.cut || title.ellipsis) bad.push("title: the long title is cut instead of shown in full");
      if (name === "phone") {
        const bar = page.locator('[data-slot="td-next-step-bar"] [data-slot="td-primary"]');
        // scroll the middle of the page into view, whichever box scrolls
        await page.$eval('[data-slot="td-facts"]', (el) => el.scrollIntoView({ block: "center" }));
        await page.waitForTimeout(300);
        const box = await bar.boundingBox();
        const H = device.viewport.height;
        if (!box) bad.push("phone: no pinned nextStep primary");
        else if (box.y < H / 2 || box.y + box.height > H + 1) bad.push(`phone: nextStep primary at ${Math.round(box.y)}..${Math.round(box.y + box.height)}px, want pinned to the bottom of ${H}px`);
        await page.$eval(".db-content-column h1", (el) => el.scrollIntoView());
      }
      if (triad) {
        const file = `${shot}--${name}.jpg`;
        await page.screenshot({ path: path.join(OUT, file), type: "jpeg", quality: 70, scale: "css", fullPage: true });
        shots.push({ slug: shot, name, file, problems: [...bad, ...result.knownGaps] });
      }
      report(label, { failures: bad, knownGaps: result.knownGaps });
    } catch (e) {
      report(label, fail(e.message.split("\n")[0]));
    } finally {
      await ctx?.close();
    }
  }
}

await browser.close();
server.close();

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const rows = [...PAGES, "analytics-dashboard-edit", "matrix-grid-inspector", "matrix-grid-workbench", ...TD_VARIANTS.map(([, shot]) => shot)].map((slug) => {
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
