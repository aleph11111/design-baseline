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
const TAP = 44;
// Invariants that fail donor-wide for a known, ticketed reason. Each still runs
// and prints on every run and in the contact sheet, as a warning naming its
// ticket; delete the entry when the ticket ships so the invariant fails again.
const KNOWN_GAPS = {
  // touch density is an app opt-in (STYLE.md "App touch density"), so phones
  // keep the 36px default step outside the filter sheet
  tapTargets: "phone-tap-targets-touch-density-default",
};

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
const gapOf = (p) => KNOWN_GAPS[p.split(":")[0]];
const report = (label, problems) => {
  n++;
  const ok = problems.every(gapOf);
  const lines = problems.map((p) => (gapOf(p) ? `known gap (${gapOf(p)}): ${p}` : p));
  console.log(`[${new Date().toTimeString().slice(0, 8)}] ${n}/${total} ${ok ? (problems.length ? "warn" : "ok  ") : "FAIL"} ${label}${lines.length ? `\n      - ${lines.join("\n      - ")}` : ""}`);
  if (!ok) failures.push(label);
};
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

// Everything here runs in the page; it returns one problem string per breach.
const measure = (page, { mobile, column, fullBleed }) =>
  page.evaluate(({ mobile, column, fullBleed, TAP }) => {
    const problems = [];
    const W = window.innerWidth;
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const s = getComputedStyle(el);
      return s.visibility !== "hidden" && s.display !== "none" && !el.closest("[aria-hidden=true],[inert]");
    };
    const describe = (el) => {
      const label = el.getAttribute("aria-label") || el.textContent.trim().replace(/\s+/g, " ").slice(0, 40);
      return `<${el.tagName.toLowerCase()}${label ? ` "${label}"` : ""}>`;
    };

    const sw = document.documentElement.scrollWidth;
    if (sw > W) problems.push(`page scrolls sideways: scrollWidth ${sw}px > ${W}px`);

    // An element past the viewport edge that no scroll container holds, and
    // no ancestor clips back inside the viewport, is cut off for the user.
    const clipped = [];
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.right <= W + 1 && r.left >= -1) continue;
      if (!visible(el)) continue;
      let lo = -Infinity, hi = Infinity, scrolls = false;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const ox = getComputedStyle(a).overflowX;
        if (ox === "auto" || ox === "scroll") { scrolls = true; break; }
        if (ox === "hidden" || ox === "clip") {
          const ar = a.getBoundingClientRect();
          lo = Math.max(lo, ar.left);
          hi = Math.min(hi, ar.right);
        }
      }
      if (scrolls) continue;
      if (Math.min(r.right, hi) > W + 1 || Math.max(r.left, lo) < -1) {
        // report the outermost offender only, not every child inside it
        if (!clipped.some((c) => c.contains(el))) clipped.push(el);
      }
    }
    for (const el of clipped.slice(0, 5)) {
      const r = el.getBoundingClientRect();
      problems.push(`${describe(el)} cut off at the viewport edge (${Math.round(r.left)}..${Math.round(r.right)}px of ${W}px)`);
    }

    const marked = !!document.querySelector(".db-full-bleed");
    if (fullBleed && !marked) problems.push("full-bleed archetype lost its .db-full-bleed marker");
    if (!fullBleed && marked) problems.push("carries .db-full-bleed but is not in the full-bleed set (ADR-0007)");
    const col = document.querySelector(".db-content-column");
    if (column && col) {
      const w = Math.round(col.getBoundingClientRect().width);
      const max = getComputedStyle(col).maxWidth;
      if (fullBleed ? max !== "none" : w !== column)
        problems.push(fullBleed ? `full-bleed column max-width ${max}, want none` : `content column ${w}px, want ${column}px`);
    }

    const bands = [...document.querySelectorAll("[data-toolbar-band],[data-slot=settings-table-band]")].filter(visible);
    for (const band of bands) {
      if (!mobile) {
        const tops = [...band.querySelectorAll("button,input,select,[role=combobox],[role=radiogroup]")]
          .filter(visible)
          .map((el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; });
        if (tops.length && Math.min(...tops.map((t) => t.bottom)) <= Math.max(...tops.map((t) => t.top)))
          problems.push("desktop toolbar wraps onto more than one row");
      } else if ([...band.querySelectorAll("[data-joined-label]")].some(visible)) {
        problems.push("phone toolbar shows filter fields inline instead of in the filter sheet");
      }
    }

    if (mobile) {
      const bottomNav = [...document.querySelectorAll("nav")].some((nav) => visible(nav) && getComputedStyle(nav).position === "fixed");
      const trigger = [...document.querySelectorAll("[data-sidebar=trigger]")].some(visible);
      const desktopSidebar = [...document.querySelectorAll("[data-sidebar=sidebar]:not([data-mobile])")].some(visible);
      if (!bottomNav && !trigger) problems.push("phone has no navigation: neither a BottomNav nor a sidebar trigger");
      if (desktopSidebar) problems.push("phone shows the desktop sidebar instead of the sidebar sheet");

      const small = [];
      for (const el of document.querySelectorAll("button,a[href],input:not([type=hidden]),select,textarea,[role=button],[role=tab],[role=checkbox],[role=radio],[role=switch],[role=combobox],[role=menuitem]")) {
        if (!visible(el) || el.closest("[role=dialog]")) continue;
        // a link inside running text is exempt (WCAG 2.5.8 inline exception)
        if (el.tagName === "A" && getComputedStyle(el).display === "inline") continue;
        // a control wrapped in its own larger hit area (a label) counts at that size
        const hit = el.closest("label") ?? el;
        const r = hit.getBoundingClientRect();
        if (r.height < TAP - 0.5 || r.width < TAP - 0.5) small.push(`${describe(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
      if (small.length) problems.push(`tapTargets: ${small.length} tap target(s) under ${TAP}px: ${small.slice(0, 6).join(", ")}${small.length > 6 ? ", ..." : ""}`);
    }
    return [...new Set(problems)];
  }, { mobile, column, fullBleed, TAP });

const shots = [];
for (const slug of PAGES) {
  for (const [name, device] of Object.entries(devices)) {
    const label = `${slug} @ ${name}`;
    let ctx;
    try {
      let page;
      ({ ctx, page } = await open(slug, device));
      const problems = await measure(page, { mobile: device.isMobile, column: COLUMN[name], fullBleed: FULL_BLEED.includes(slug) });
      const file = `${slug}--${name}.jpg`;
      await page.screenshot({ path: path.join(OUT, file), type: "jpeg", quality: 70, scale: "css" });
      shots.push({ slug, name, file, problems });
      report(label, problems);
    } catch (e) {
      report(label, [e.message.split("\n")[0]]);
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
    report(label, w === s.want ? [] : [`${w}px, want ${s.want}px`]);
  } catch (e) {
    report(label, [e.message.split("\n")[0]]);
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
