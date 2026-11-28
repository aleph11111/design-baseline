// Real-browser check of every `kind: page` archetype at the device triad
// (desk27 / laptop14 / phone, src/testing/devices.mjs; docs/STYLE.md "The
// device triad"), plus every page at the real laptop-window widthSweep
// (invariants only). Asserts layout invariants that need no image baseline, keeps
// AppShell's wide-desk column steps (ADR-0007 amendment 2026-09-29; this
// absorbed check-desk-width.mjs), and writes a contact sheet of every page at
// the three devices for operator review.
// Run: npm run check:viewports  (builds gallery-dist first, uses local Chrome).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CHROME, serveDir, launchChrome } from "./lib/serve-gallery.mjs";
import { devices, widthSweep, laptop14Window } from "../src/testing/devices.mjs";
import { checkPageInvariants } from "../src/testing/invariants.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "gallery-dist");
const OUT = path.join(ROOT, "viewport-report");
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
const SWEEP_GAPS = {};
// Page-scoped findings with a ticket, keyed slug → { code: ticket slug }, at
// every width of that page only (triad, sweep, variants) — never donor-wide,
// so the same code still fails on every other page.
const PAGE_GAPS = {
  // transaction-document's contract wraps the long document title in full at
  // every width; headingLines (v0.71.0) caps any h1 at 2 lines. The demo's
  // long title is 3-4 lines everywhere. Which rule wins is decided in the ticket.
  // textClip's widened nested-holder scope (v0.76.0) also catches the phone
  // next-step panel: its side-effect line paints ~37px past the overflow-hidden
  // clip edge — genuinely cut-off text, no scroller, no ellipsis. The ticket
  // fixes the panel and removes the textClip gap so the code re-asserts;
  // page-scoped, so textClip still fails on every other page.
  "transaction-document": { headingLines: "transaction-document-title-vs-heading-lines", textClip: "invariants-textclip-phone-demos" },
  // duplicateFact (v0.72.0) fires on the two money-dense reference demos BY
  // DESIGN: detail-overview restates the order's headline figures (gross
  // profit, margin) in the rail summary, the financial breakdown AND the
  // nested stat strip, and print-statement's deterministic seasonal model
  // renders the same line's off-season value across several month cells. The
  // check is a loose heuristic and cannot tell "intended restatement" from
  // "accidental duplication" yet — the ticket settles it per demo; neither
  // downgrades the code at the triad for any OTHER page.
  "detail-overview": { duplicateFact: "duplicatefact-reference-demo-duplicates" },
  "print-statement": { duplicateFact: "duplicatefact-reference-demo-duplicates" },
};
const pageGaps = (slug) => PAGE_GAPS[slug] ?? {};
const sweepGaps = (slug, w) => {
  const prefix = `${slug}@${w}:`;
  return Object.fromEntries(Object.entries(SWEEP_GAPS).filter(([k]) => k.startsWith(prefix)).map(([k, t]) => [k.slice(prefix.length), t]));
};

const gallery = await serveDir(DIST);
const base = `${gallery.url}/#/a/`;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const browser = await launchChrome();
// transaction-document's five demo documents (demo selector option → contact-sheet slug). "Shipped, no scan"
// is the realistic 2-line warning-state order the Total-row fold is measured at the 1133px laptop window.
// It is not a strip option — the default view (and its pixel baseline) is the strip's four options — so it
// loads from the page hash (`#/a/transaction-document?variant=shipped`; the gallery's HashRouter keeps it
// there) and the loop navigates by URL instead of clicking the strip.
const TD_VARIANTS = [["Sales order", "transaction-document-order"], ["Shipped, no scan", "transaction-document-shipped", "?variant=shipped"], ["Offer", "transaction-document-offer"], ["Purchase order", "transaction-document-purchase"], ["Compact locks", "transaction-document-compact"]];
const failures = [];
const total = PAGES.length * (Object.keys(devices).length + widthSweep.length) + STEPS.length + 1 + 3 * Object.keys(devices).length + TD_VARIANTS.length * (Object.keys(devices).length + widthSweep.length) + Object.keys(devices).length + 2; // + the container-query layout cases + the print-media check + analytics-dashboard edit mode + matrix-grid inspector + matrix-grid workbench + transaction-document variants + grouped-list work queue
let n = 0;
const report = (label, { failures: bad, knownGaps: warn }) => {
  n++;
  const lines = [...bad, ...warn];
  console.log(`[${new Date().toTimeString().slice(0, 8)}] ${n}/${total} ${bad.length ? "FAIL" : warn.length ? "warn" : "ok  "} ${label}${lines.length ? `\n      - ${lines.join("\n      - ")}` : ""}`);
  if (bad.length) failures.push(label);
};
const fail = (message) => ({ failures: [message], knownGaps: [] });
console.log(`viewports check: ${PAGES.length} pages x (${Object.keys(devices).length} devices + ${widthSweep.length} sweep widths ${widthSweep.map((d) => d.viewport.width).join("/")}) + ${STEPS.length} column steps against ${DIST} (Chrome: ${CHROME})`);

const open = async (slug, device, query = "") => {
  const ctx = await browser.newContext(device);
  const page = await ctx.newPage();
  await page.goto(base + slug + query); // query lands in the hash (HashRouter): `#/a/slug?variant=…`
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
      const result = await checkPageInvariants(page, device, { knownGaps: { ...KNOWN_GAPS, ...pageGaps(slug) }, column: columnFor(slug, name), fullBleed: FULL_BLEED.includes(slug) });
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
      report(label, await checkPageInvariants(page, device, { knownGaps: { ...pageGaps(slug), ...sweepGaps(slug, w) }, fullBleed: FULL_BLEED.includes(slug) }));
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

// Container-query layout (viewport-breakpoints-container-query-audit): inside
// AppShell the column is narrower than the viewport. At the 1133px laptop
// window the content column is ~780px — below @4xl (896px) — so the KPI strip
// and the widget grid keep their narrow layout; on laptop14 (wide column) they
// show the wide one. The paired-period split keys on its own card/container
// width too (dashboard-period-pair-container-query): a pair card narrower than
// @4xl (896px) stays a stacked month-over-YTD even on a wide viewport; in the
// wide column (cards ~1104–1640px) it splits at @4xl. The edit-mode assignment
// list (dashboard-assignment-list-container-query) steps with the widget grid
// off the LIST's own @container — 1 col while its box is under @4xl (896px), 3
// from @5xl (1024px); the box is the page column minus the card's padding+2·1px
// border, so ~738px in the 1133 window's ~780px column, ~1102px in laptop14's.
const CQ_CASES = [
  { name: "sweep 1133 (~780px column)", device: widthSweep.find((d) => d.viewport.width === 1133), strip: 1, grid: 1, pair: 1, build: 1, rail: false, pane: "none", assign: 1 },
  { name: "laptop14 (wide column)", device: devices.laptop14, strip: 4, grid: 3, pair: 2, build: 3, rail: true, pane: "block", assign: 3 },
];
for (const c of CQ_CASES) {
  const label = `container-query layout @ ${c.name}`;
  let ctx, st;
  try {
    let page;
    ({ ctx, page } = await open("analytics-dashboard", c.device));
    const cols = (sel) => page.$eval(sel, (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    const bad = [];
    const strip = await cols('[class*="@4xl:divide-x"]');
    const grid = await cols('[class*="@4xl:grid-cols-2"]');
    if (strip !== c.strip) bad.push(`KPI strip has ${strip} column(s), want ${c.strip}`);
    if (grid !== c.grid) bad.push(`widget grid has ${grid} column(s), want ${c.grid}`);
    // the paired-period split keys on ITS card's width (the @container -my-4 wrapper carries
    // both the gutter-cancel and the container the split queries), so a pair card narrower than
    // @4xl (896px) stacks month over YTD even on a wide viewport. Select via that wrapper's
    // split grid: it is the only @container that also carries the -my-4 gutter-cancel.
    const pair = await page.$eval('[class*="@container"][class*="-my-4"]', (wrap) => getComputedStyle(wrap.firstElementChild).gridTemplateColumns.split(" ").length);
    if (pair !== c.pair) bad.push(`period-pair split has ${pair} column(s), want ${c.pair}`);
    // the edit-mode assignment list keys its columns on the LIST's own @container (its own
    // `data-slot` box — the widget grid carries the SAME @4xl/@5xl classes, so a shared
    // class selector would measure the grid, not the list), not the viewport: 1 col while
    // its box is under @4xl (896px), 2/3 from there like the widget grid.
    await page.getByRole("button", { name: "Edit layout" }).click();
    await page.waitForSelector('[data-slot="dashboard-widget-edit"]', { timeout: 5000 });
    const assign = await cols('[data-slot="dashboard-assignment-list"]');
    if (assign !== c.assign) bad.push(`assignment list has ${assign} column(s), want ${c.assign}`);
    // detail-overview: the 300px rail stacks label over value at every width.
    await page.goto(base + "detail-overview");
    await page.waitForSelector('[class*="@sm:flex-row"]', { timeout: 10000 });
    // every row follows ITS list's width: a list under 384px (@sm; the 300px rail) stacks, a wider one is a row.
    const rows = await page.$$eval('[class*="@sm:flex-row"]', (els) =>
      els.map((el) => ({ w: Math.round(el.closest('[class*="@container"]').getBoundingClientRect().width), dir: getComputedStyle(el).flexDirection })));
    const wrong = rows.filter((r) => (r.w < 384) !== (r.dir === "column"));
    if (wrong.length) bad.push(`detail-overview key-value rows ignore their list width: ${JSON.stringify(wrong.slice(0, 3))}`);
    // the 300px rail only exists in a wide column (>= @4xl); in the narrow one the summary is full width and its rows sit side by side
    if (c.rail && !rows.some((r) => r.w < 384 && r.dir === "column")) bad.push("detail-overview: no stacked row found in the 300px rail");
    if (!c.rail && rows.some((r) => r.w < 384)) bad.push("detail-overview: a rail-width list in the narrow column");
    // structure-builder: tree/palette split collapses in the narrow column.
    await page.goto(base + "structure-builder");
    await page.waitForSelector('[class*="@4xl:grid-cols-3"]', { timeout: 10000 });
    const build = await cols('[class*="@4xl:grid-cols-3"]');
    if (build !== c.build) bad.push(`structure-builder split has ${build} column(s), want ${c.build}`);
    // settings-table: the edit pane is a container query too (no editing surface gap: the demo's dialog follows the same width).
    st = await open("settings-table", c.device);
    const paneSel = '[class*="w-1/2"][class*="@4xl:border-l"]';
    await st.page.waitForSelector(paneSel, { state: "attached", timeout: 10000 });
    const { pane, w } = await st.page.$eval(paneSel, (el) => ({ pane: getComputedStyle(el).display, w: Math.round(el.closest('[class*="@container"]').getBoundingClientRect().width) }));
    if (pane !== c.pane) bad.push(`settings-table edit pane display is "${pane}" in a ${w}px container, want ${c.pane}`);
    report(label, { failures: bad, knownGaps: [] });
  } catch (e) {
    report(label, fail(e.message.split("\n")[0]));
  } finally {
    await st?.ctx.close();
    await ctx?.close();
  }
}

// matrix-grid's inspector (contract Layer 6 "Inspector slot", ADR-0018): the
// standard edge overlay over a dimmed backdrop on every device, with
// list-with-detail's geometry (ADR-0010: floor 28rem, ceiling 100vw - 4rem,
// full-screen on phone); the grid keeps its closed width and is inert behind
// the backdrop; nothing inside the panel scrolls sideways.
for (const [name, device] of Object.entries(devices)) {
  const label = `matrix-grid inspector @ ${name}`;
  let ctx;
  try {
    let page;
    ({ ctx, page } = await open("matrix-grid", device));
    await page.getByRole("radio", { name: "inspector" }).click();
    const gridClosed = await page.locator('[data-slot="matrix-scroll"]').boundingBox();
    await page.locator("td[data-filled]").first().click();
    const dock = page.locator('[data-slot="matrix-inspector"]');
    await dock.waitFor({ timeout: 5000 });
    await dock.getByRole("button", { name: "Monthly attendance" }).click();
    await page.waitForTimeout(600); // sheet slide-in / collapsible settle
    const result = await checkPageInvariants(page, device, { knownGaps: KNOWN_GAPS, column: COLUMN[name], fullBleed: true });
    // the overlay is modal, so the page's nav is aria-hidden behind it by design
    const bad = result.failures.filter((f) => !(name === "phone" && f.startsWith("phoneNav:")));
    const box = await dock.boundingBox();
    const W = device.viewport.width;
    if (!(await page.locator("[data-state=open][class*='bg-black']").count())) bad.push("inspector: no dimmed backdrop");
    if (Math.abs(box.x + box.width - W) > 1) bad.push(`inspector: right edge at ${box.x + box.width}px, want the viewport edge ${W}px`);
    if (name === "phone") {
      if (Math.abs(box.width - W) > 1) bad.push(`inspector: ${box.width}px wide on phone, want full-screen ${W}px`);
    } else {
      const rem = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
      if (box.width < 28 * rem - 1 || box.width > W - 4 * rem + 1)
        bad.push(`inspector: ${box.width}px wide, want ${28 * rem}..${W - 4 * rem}px (list-with-detail geometry)`);
      const gridOpen = await page.locator('[data-slot="matrix-scroll"]').boundingBox();
      if (Math.abs(gridOpen.width - gridClosed.width) > 1)
        bad.push(`inspector: grid ${gridClosed.width}px wide closed, ${gridOpen.width}px open — it must not narrow`);
      // the grid is inert: a point on a grid cell left of the overlay hits the backdrop
      const cell = await page.locator("tbody tr:nth-child(3) td").first().boundingBox();
      const hit = await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y)?.closest("td"), [cell.x + 4, cell.y + 4]);
      if (cell.x + 4 < box.x && hit) bad.push("inspector: a grid cell is still clickable behind the backdrop");
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
// with the inspector overlay open (ADR-0018), the read-only preview matrix in `body` and the
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
// The 1133×739 (laptop14Window) Total-row fold assertion must actually run; the
// post-loop guard after this block fails the check if no device with that exact
// viewport was measured (widthSweep losing its 1133×739 entry must not pass).
let foldMeasured = false;
for (const [radio, shot, query] of TD_VARIANTS) {
  for (const [name, device] of [...Object.entries(devices), ...widthSweep.map((d) => [`sweep ${d.viewport.width}`, d])]) {
    const label = `transaction-document ${radio} @ ${name}`;
    let ctx;
    try {
      let page;
      ({ ctx, page } = await open("transaction-document", device, query));
      if (!query) await page.getByRole("radio", { name: radio }).click(); // the shipped variant loads from the URL hash, not the strip
      await page.waitForTimeout(300); // ledger ResizeObserver settles
      const triad = name in devices;
      // Sweep-width passes honor the per-width sweep gaps (a variant's sweep is
      // a sweep finding too); the triad passes take donor-wide KNOWN_GAPS plus the
      // page's own PAGE_GAPS, so only the named sweep width softens beyond those.
      const knownGaps = { ...KNOWN_GAPS, ...pageGaps("transaction-document"), ...(triad ? {} : sweepGaps("transaction-document", device.viewport.width)) };
      const result = await checkPageInvariants(page, device, { knownGaps, column: triad ? columnFor("transaction-document", name) : undefined, fullBleed: false });
      const bad = [...result.failures];
      const wide = await page.$$eval('[data-slot="td-ledger"], [data-slot="td-ledger"] *', (els) =>
        els.filter((el) => ["auto", "scroll"].includes(getComputedStyle(el).overflowX) && el.scrollWidth > el.clientWidth + 1).map((el) => `<${el.tagName.toLowerCase()}> ${el.scrollWidth}>${el.clientWidth}`));
      for (const w of wide) bad.push(`ledger: scrolls sideways ${w}`);
      // identity.progress: one line at laptop-window widths and wider (the header actions no longer squeeze it); a phone may wrap
      if (["laptop14", "desk27", "sweep 1133", "sweep 1280"].includes(name)) {
        const prog = await page.$eval('[data-slot="td-progress"]', (ol) => ({ h: ol.getBoundingClientRect().height, li: ol.querySelector("li").getBoundingClientRect().height })).catch(() => null);
        if (!prog && radio === "Sales order") bad.push("progress: the sales order demo has no progress line to measure");
        if (prog && prog.h > prog.li + 2) bad.push(`progress: wraps to several lines (${Math.round(prog.h)}px, one line is ${Math.round(prog.li)}px)`);
      }
      // The realistic 2-line warning-state order (contract "Acceptance gate"): its ledger Total
      // row ends at most 739px down at the 1133x739 laptop window (the consumer's
      // /orders/:id shipped-no-scan case). The document column is fixed at 896px on every
      // desktop device, so the height is the same at laptop14; 739 is the fold that fails.
      if (radio === "Shipped, no scan") {
        const totalBottom = await page.$eval('[data-slot="td-ledger"] tfoot tr', (el) => Math.round(el.getBoundingClientRect().bottom + window.scrollY));
        // The 1133x739 laptop window is the fold the consumer's /orders/:id case
        // runs into. Keyed on the device viewport, not the label string: the
        // assertion must still fire if a sweep entry is renamed, and the guard
        // below fails the run if no device with this exact viewport ever ran.
        const isFoldWindow = device.viewport.width === laptop14Window.viewport.width && device.viewport.height === laptop14Window.viewport.height;
        if (isFoldWindow) {
          foldMeasured = true;
          console.log(`  shipped order Total row bottom @ ${device.viewport.width}x${device.viewport.height}: ${totalBottom}px (fold 739px)`);
          if (totalBottom > 739) bad.push(`shipped order: the Total row ends at ${totalBottom}px, below the ${device.viewport.height}px laptop14Window fold`);
        } else if (name === "laptop14") {
          console.log(`  shipped order Total row bottom @ ${device.viewport.width} (laptop14): ${totalBottom}px`);
        }
        // The warning next step keeps its single failed side effect inline with the shipment
        // line: a direct child of the description wrapper that also holds the
        // nextStep title. That wrapper is the only element holding the <h2>, so
        // this stays true for inline and fails if a regression re-blocks the side
        // effect into its own padded "Running alongside" block at the panel's
        // bottom (where its parent holds no <h2>), even if an unrelated
        // .space-y-1 ancestor sits somewhere higher in the tree.
        const sideInline = await page.$eval('[data-slot="td-next-step"]', (panel) => {
          const side = panel.querySelector('[data-slot="td-side-effects"]');
          return !!side && side.parentElement !== null && !!side.parentElement.querySelector(":scope > h2");
        });
        if (!sideInline) bad.push('shipped order: the failed side effect is a padded block, not inline with the shipment line');
      }
      // compact row locks vs the default sentences on the same 2-line document: the compact Total ends above the
      // laptop14 fold and at least 20px higher than with the switch off (the sentences saved)
      if (radio === "Compact locks") {
        const lockSentences = () => page.locator('[data-slot="td-ledger"] [data-slot="td-lock"]').count();
        const totalBottom = () => page.$eval('[data-slot="td-ledger"] tfoot', (el) => Math.round(el.getBoundingClientRect().bottom + window.scrollY));
        if (await lockSentences()) bad.push("ledger: lock sentences or a column-lock note row, want compact lock icons");
        // one line per locked cell: the lock sits inline left of the figure, so the locked cell is one text line (stacked it was two)
        const rowH = await page.$$eval('[data-slot="td-ledger"] tbody tr', (trs) => trs.map((tr) => Math.round(tr.getBoundingClientRect().height)));
        const cellH = await page.$$eval('[data-slot="td-lock-compact"]', (els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));
        if (name === "laptop14") console.log(`  compact locks tbody row heights @ laptop14: ${rowH.join("/")}px, locked cell lines ${cellH.join("/")}px`);
        // a locked row is as tall as its label cell alone (name + subline + padding): the lock adds no height. With a subline that is
        // 69px (stacked locks made it 77px); a single-line label row is about 56px.
        const lockAdds = await page.$$eval('[data-slot="td-ledger"] tbody tr', (trs) => trs.map((tr) => { const td = tr.firstElementChild, cs = getComputedStyle(td); const inner = [...td.children].reduce((h, c) => h + c.getBoundingClientRect().height, 0); return Math.round(tr.getBoundingClientRect().height - (inner + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom))); }));
        if (name === "laptop14" && (lockAdds.some((d) => d > 2) || rowH.some((h) => h > 72))) bad.push(`ledger: locked row ${rowH.join("/")}px is taller than its label cell (excess ${lockAdds.join("/")}px)`);
        if (cellH.some((h) => h > (name === "phone" ? 48 : 28))) bad.push(`ledger: locked cell ${cellH.join("/")}px high, want one line`);
        const inline = await page.$$eval('[data-slot="td-lock-compact"]', (els) => els.every((el) => { const b = el.querySelector("button").getBoundingClientRect(), t = el.getBoundingClientRect(); return Math.abs((b.top + b.bottom) / 2 - (t.top + t.bottom) / 2) < 4 && b.height <= t.height + 1; }));
        if (!inline) bad.push("ledger: compact lock not inline beside its figure");
        // the column lock is a header action on the slot's title line (a lock button inside the ledger card's header), reachable by name
        const headerLock = await page.locator('[data-slot="td-ledger"] >> role=button[name=/Locked: Expected market value/]').count();
        if (!headerLock) bad.push("ledger: no column-lock icon in the ledger header");
        if (name === "laptop14") {
          const compactBottom = await totalBottom();
          await page.getByRole("switch", { name: "Compact locks" }).click();
          await page.waitForTimeout(300);
          const fullBottom = await totalBottom();
          if ((await lockSentences()) !== 3) bad.push("ledger: switch off should show the default 3 lock sentences (2 cells + the column)");
          console.log(`  compact locks Total bottom @ laptop14: ${compactBottom}px, full sentences ${fullBottom}px (fold 739px)`);
          if (compactBottom >= 734) bad.push(`ledger: Total ends at ${compactBottom}px, not above the 734px v0.51.0 value`);
          if (compactBottom > 739) bad.push(`ledger: Total ends at ${compactBottom}px, below the 739px laptop14 fold`);
          if (compactBottom > fullBottom - 20) bad.push(`ledger: compact Total ${compactBottom}px saves under 20px against the full ${fullBottom}px`);
          await page.getByRole("switch", { name: "Compact locks" }).click();
        }
      }
      const title = await page.$eval(".db-content-column h1", (h) => {
        const s = getComputedStyle(h);
        return { cut: h.scrollWidth > h.clientWidth + 1 || h.scrollHeight > h.clientHeight + 1, ellipsis: s.textOverflow === "ellipsis" || s.webkitLineClamp !== "none" };
      });
      if (title.cut || title.ellipsis) bad.push("title: the long title is cut instead of shown in full");
      // <main> top inset is 16px on document-column pages at every width (AppShell has-[.db-document-column]:pt-4)
      const pt = await page.$eval("main", (m) => getComputedStyle(m).paddingTop);
      if (pt !== "16px") bad.push(`document column: <main> top inset ${pt}, want 16px`);
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
// Fold-gate guard (acceptance criterion 1): the 1133×739 Total-row fold assertion
// must have actually run. It is keyed on the device viewport, so widthSweep losing
// its 1133×739 entry — or the "Shipped, no scan" case (loaded by URL, never through
// the strip) never being reached — fails the run instead of passing with the fold
// check silently skipped.
if (!foldMeasured) {
  failures.push("transaction-document fold gate @ laptop14Window");
  console.log(`[FAIL] transaction-document fold gate @ laptop14Window\n      - the 1133×739 laptop-window fold was never measured (widthSweep lost its 1133×739 entry or the \"Shipped, no scan\" case was skipped) — the fold gate cannot pass having compared nothing`);
}

// grouped-list work-queue variant (contract "Work-queue variant"): at the
// triad, Open rows measure 44px and archive (Completed / All) rows 38px —
// single line, so a wrapped cell would show as a taller row.
for (const [name, device] of Object.entries(devices)) {
  const label = `grouped-list work queue @ ${name}`;
  let ctx;
  try {
    let page;
    ({ ctx, page } = await open("grouped-list", device));
    await page.getByRole("radio", { name: "Work queue" }).click();
    await page.waitForSelector('[data-slot="work-queue-pipeline"]');
    const result = await checkPageInvariants(page, device, { knownGaps: KNOWN_GAPS, column: columnFor("grouped-list", name), fullBleed: false });
    const bad = [...result.failures];
    const heights = () => page.$$eval('[data-slot="work-queue-group"] tbody tr', (trs) => trs.map((tr) => Math.round(tr.getBoundingClientRect().height)));
    const expectRows = async (view, want) => {
      const got = await heights();
      if (got.length === 0) bad.push(`${view}: no rows`);
      const off = got.filter((h) => h !== want);
      if (off.length) bad.push(`${view}: rows ${[...new Set(off)].join("/")}px, want ${want}px`);
    };
    await expectRows("Open", 44);
    const file = `grouped-list-work-queue--${name}.jpg`;
    await page.screenshot({ path: path.join(OUT, file), type: "jpeg", quality: 70, scale: "css", fullPage: true });
    for (const view of ["Completed", "All"]) {
      await page.getByRole("radio", { name: new RegExp(`^${view} `) }).click();
      await page.waitForTimeout(200);
      await expectRows(view, 38);
    }
    shots.push({ slug: "grouped-list-work-queue", name, file, problems: [...bad, ...result.knownGaps] });
    report(label, { failures: bad, knownGaps: result.knownGaps });
  } catch (e) {
    report(label, fail(e.message.split("\n")[0]));
  } finally {
    await ctx?.close();
  }
}

await browser.close();
gallery.close();

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const rows = [...PAGES, "analytics-dashboard-edit", "matrix-grid-inspector", "matrix-grid-workbench", ...TD_VARIANTS.map(([, shot]) => shot), "grouped-list-work-queue"].map((slug) => {
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
