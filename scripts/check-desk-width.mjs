// Real-browser check for AppShell's wide-desk content-column steps (ADR-0007,
// amendment 2026-09-29). jsdom can't evaluate container queries, so
// AppShell.test.tsx only sees the class hooks; this measures the built gallery.
// Run: npm run check:desk-width  (builds gallery-dist first, uses local Chrome).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../gallery-dist");
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json" };
const FULL_BLEED = ["matrix-grid", "list-with-detail", "kanban-board", "calendar"];

const server = http.createServer((req, res) => {
  const p = path.join(DIST, req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(DIST) || !fs.existsSync(p) || !fs.statSync(p).isFile()) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": MIME[path.extname(p)] ?? "application/octet-stream" }).end(fs.readFileSync(p));
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/#/a/`;

const browser = await chromium.launch({ executablePath: CHROME });
const failures = [];
let n = 0;
const total = 4 + 1 + FULL_BLEED.length;
const report = (label, ok, detail) => {
  n++;
  console.log(`[${new Date().toTimeString().slice(0, 8)}] ${n}/${total} ${ok ? "ok  " : "FAIL"} ${label}: ${detail}`);
  if (!ok) failures.push(label);
};
console.log(`desk-width check: ${total} measurements against ${DIST} (Chrome: ${CHROME})`);

const open = async (slug, width, { collapse = false, fullBleed = false } = {}) => {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(base + slug);
  await page.waitForSelector(".db-content-column");
  // demos are lazy: wait for the shell root, or the column is measured before it mounts
  if (fullBleed) await page.waitForSelector(".db-full-bleed", { timeout: 5000 });
  if (collapse) {
    await page.keyboard.press("Control+b");
    // fail loudly if the toggle didn't collapse, or 1920 would be measured expanded
    await page.waitForSelector('[data-state="collapsed"]', { timeout: 5000 });
    await page.waitForTimeout(400); // sidebar width transition
  }
  return page;
};
const colStyle = (page) =>
  page.$eval(".db-content-column", (el) => ({ w: Math.round(el.getBoundingClientRect().width), max: getComputedStyle(el).maxWidth }));

const STEPS = [
  { label: "1512", width: 1512, want: 1144 },
  { label: "1903 (1920 minus scrollbar)", width: 1903, want: 1440 },
  { label: "1920 sidebar collapsed", width: 1920, want: 1440, collapse: true },
  { label: "2560", width: 2560, want: 1680 },
];
for (const s of STEPS) {
  try {
    const page = await open("form-page", s.width, s);
    const { w } = await colStyle(page);
    report(`column @ ${s.label}`, w === s.want, `${w}px, want ${s.want}px`);
    await page.close();
  } catch (e) {
    report(`column @ ${s.label}`, false, e.message.split("\n")[0]);
  }
}

try {
  const page = await open("matrix-grid", 1512, { fullBleed: true });
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  report("matrix-grid page scrollWidth @ 1512", sw === 1512, `${sw}px, want 1512px`);
  await page.close();
} catch (e) {
  report("matrix-grid page scrollWidth @ 1512", false, e.message.split("\n")[0]);
}

for (const slug of FULL_BLEED) {
  try {
    const p = await open(slug, 1512, { fullBleed: true });
    const { max } = await colStyle(p);
    report(`${slug} column max-width`, max === "none", max);
    await p.close();
  } catch (e) {
    report(`${slug} column max-width`, false, e.message.split("\n")[0]);
  }
}

await browser.close();
server.close();
console.log(failures.length ? `FAILED: ${failures.length}/${total}` : `PASSED: ${total}/${total}`);
process.exit(failures.length ? 1 : 0);
