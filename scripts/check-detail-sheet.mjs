// Real-browser check for list-with-detail's content-sized detail overlay
// (ADR-0010). jsdom has no layout, so ListWithDetailShell.test.tsx only sees the
// class hooks and a stubbed overflow; this measures a development build of the
// gallery (development, so the dev-only overflow warning is live).
// Run: npm run check:detail-sheet  (builds gallery-dist-dev first, uses local Chrome).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../gallery-dist-dev");
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json" };

const server = http.createServer((req, res) => {
  const p = path.join(DIST, req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(DIST) || !fs.existsSync(p) || !fs.statSync(p).isFile()) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": MIME[path.extname(p)] ?? "application/octet-stream" }).end(fs.readFileSync(p));
});
await new Promise((r) => server.listen(0, r));
const url = `http://localhost:${server.address().port}/#/a/list-with-detail`;

const browser = await chromium.launch({ executablePath: CHROME });
const failures = [];
let n = 0;
const CASES = [
  // panel = the shell's page title; row = the identifier text to click (a table cell or an action row)
  { label: "7-column table @ 1280", width: 1280, panel: "Episode archive", row: "Riverbed", want: (w) => w > 448 && w < 1216, wantText: "> 448px, < ceiling 1216px", scrollFree: true, warns: false },
  { label: "summary detail @ 1280", width: 1280, panel: "Podcast Library", row: "Riverbed", want: (w) => w === 448, wantText: "448px (floor)", scrollFree: true, warns: false },
  { label: "over-ceiling table @ 1280", width: 1280, panel: "Episode archive", row: "Three Things", want: (w) => w === 1216, wantText: "1216px (ceiling)", scrollFree: false, warns: true },
  { label: "7-column table @ 390", width: 390, panel: "Episode archive", row: "Riverbed", want: (w) => w === 390, wantText: "390px (full-screen)", scrollFree: false, warns: false },
  // Free text (ADR-0010 amendment): a marked description column wraps, so the
  // sheet stays under the ceiling; unmarked, it reaches it and the warning
  // names FreeTextCell before the route escalation.
  { label: "free-text table, marked @ 1280", width: 1280, panel: "Materialanforderungen", row: "MA-2041", want: (w) => w > 448 && w < 1216, wantText: "> 448px, < ceiling 1216px", scrollFree: true, warns: false, wraps: true },
  { label: "free-text table, unmarked @ 1280", width: 1280, panel: "Materialanforderungen", row: "MA-2042", want: (w) => w === 1216, wantText: "1216px (ceiling)", scrollFree: false, warns: true, warnText: "FreeTextCell" },
  { label: "free-text table, marked @ 390", width: 390, panel: "Materialanforderungen", row: "MA-2041", want: (w) => w === 390, wantText: "390px (full-screen)", scrollFree: false, warns: false },
];
const total = CASES.length;
const report = (label, ok, detail) => {
  n++;
  console.log(`[${new Date().toTimeString().slice(0, 8)}] ${n}/${total} ${ok ? "ok  " : "FAIL"} ${label}: ${detail}`);
  if (!ok) failures.push(label);
};
console.log(`detail-sheet check: ${total} cases against ${DIST} (Chrome: ${CHROME})`);

for (const c of CASES) {
  try {
    const page = await browser.newPage({ viewport: { width: c.width, height: 900 } });
    const warnings = [];
    page.on("console", (m) => m.type() === "warning" && m.text().includes("[list-with-detail]") && warnings.push(m.text()));
    await page.goto(url);
    const section = page.locator("section").filter({ has: page.getByRole("heading", { name: c.panel, exact: true }) });
    await section.getByText(c.row, { exact: true }).first().click();
    const dialog = page.locator('[role="dialog"]').first();
    await dialog.waitFor();
    await page.waitForTimeout(700); // slide-in animation + the guard's rAF
    const m = await dialog.evaluate((el) => {
      const scrollers = [...el.querySelectorAll("*")].filter((e) => /auto|scroll/.test(getComputedStyle(e).overflowX));
      return {
        w: Math.round(el.getBoundingClientRect().width),
        // the title is contained so it can't widen the sheet — it must still show
        title: Math.round(el.querySelector("h2")?.getBoundingClientRect().width ?? 0),
        sideways: scrollers.filter((e) => e.scrollWidth > e.clientWidth + 1).length,
        // free-text cells that wrap onto more than one line; every other cell
        // must stay on one line
        wrapped: [...el.querySelectorAll("td[data-free-text] > div")].filter(
          (d) => d.getBoundingClientRect().height > 1.5 * parseFloat(getComputedStyle(d).lineHeight),
        ).length,
        multiline: [...el.querySelectorAll("td:not([data-free-text])")].filter(
          (td) => td.firstChild && getComputedStyle(td).whiteSpace !== "nowrap",
        ).length,
      };
    });
    const wrapOk = !c.wraps || (m.wrapped > 0 && m.multiline === 0);
    const warnOk = warnings.length === (c.warns ? 1 : 0) && (!c.warnText || warnings.every((t) => t.includes(c.warnText)));
    const ok = c.want(m.w) && m.title > 0 && (!c.scrollFree || m.sideways === 0) && warnOk && wrapOk;
    report(c.label, ok, `${m.w}px (want ${c.wantText}), title ${m.title}px, ${m.sideways} sideways scroller(s), ${warnings.length} warning(s) (want ${c.warns ? 1 : 0}${c.warnText ? ` naming ${c.warnText}` : ""})${c.wraps ? `, ${m.wrapped} wrapped free-text cell(s), ${m.multiline} wrapping non-free-text cell(s)` : ""}`);
    await page.close();
  } catch (e) {
    report(c.label, false, e.message.split("\n")[0]);
  }
}

await browser.close();
server.close();
console.log(failures.length ? `FAILED: ${failures.length}/${total}` : `PASSED: ${total}/${total}`);
process.exit(failures.length ? 1 : 0);
