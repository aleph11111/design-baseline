// Real-browser check that AppHeader cannot widen the page on phones. jsdom does
// no layout, so Header.test.tsx only sees the class contract; this measures the
// built gallery at 430px and 360px. Run: npm run check:app-header-phone.
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

const server = http.createServer((req, res) => {
  const p = path.join(DIST, req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(DIST) || !fs.existsSync(p) || !fs.statSync(p).isFile()) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": MIME[path.extname(p)] ?? "application/octet-stream" }).end(fs.readFileSync(p));
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/#/l/app-header-phone`;

const browser = await chromium.launch({ executablePath: CHROME });
const widths = [430, 360];
console.log(`app-header-phone check: ${widths.length} viewports against ${DIST} (Chrome: ${CHROME})`);
const failures = [];
let n = 0;
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(base);
  await page.waitForSelector('[data-testid="app-header-phone-demo"] header');
  const m = await page.evaluate(() => {
    const h = document.querySelector('[data-testid="app-header-phone-demo"] header');
    return {
      doc: document.documentElement.scrollWidth,
      win: window.innerWidth,
      headerScroll: h.scrollWidth,
      headerClient: h.clientWidth,
    };
  });
  // Document width is asserted at 430px (the ticket's viewport); at 360px the
  // gallery's own info-bar <code> already overflows, unrelated to the header,
  // so only the header and its demo frame are held to the viewport there.
  const ok = (width !== 430 || m.doc <= m.win) && m.headerScroll <= m.headerClient && m.headerClient <= width;
  n++;
  console.log(`[${new Date().toTimeString().slice(0, 8)}] ${n}/${widths.length} ${ok ? "ok  " : "FAIL"} ${width}px: document ${m.doc}/${m.win}, header ${m.headerScroll}/${m.headerClient}`);
  if (!ok) failures.push(width);
  await page.close();
}
await browser.close();
server.close();
console.log(failures.length ? `FAILED at: ${failures.join(", ")}` : "all viewports ok");
process.exit(failures.length ? 1 : 0);
