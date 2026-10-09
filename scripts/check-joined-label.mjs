// Real-browser check: a joined toolbar label yields (ellipsis) before the
// control value truncates. jsdom can't measure layout. Run: npm run check:joined-label
// (builds gallery-dist first, uses local Chrome). Fails if JOINED_LABEL_CLASS is shrink-0 again.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../gallery-dist");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json" };

const server = http.createServer((req, res) => {
  const p = path.join(DIST, req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(DIST) || !fs.existsSync(p) || !fs.statSync(p).isFile()) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": MIME[path.extname(p)] ?? "application/octet-stream" }).end(fs.readFileSync(p));
});
await new Promise((r) => server.listen(0, r));
const url = `http://localhost:${server.address().port}/#/l/page-frame`;

const browser = await chromium.launch({ executablePath: CHROME });
const failures = [];
let n = 0;
const total = 3;
const report = (label, ok, detail) => {
  n++;
  console.log(`[${new Date().toTimeString().slice(0, 8)}] ${n}/${total} ${ok ? "ok  " : "FAIL"} ${label}: ${detail}`);
  if (!ok) failures.push(label);
};
console.log(`joined-label check: ${total} widths against ${DIST} (Chrome: ${CHROME})`);

// Per joined control (select trigger, segmented radiogroup, native field row): label
// text truncated, value (the last non-icon child: select value / last segment / input
// cell) whole and inside the control root. The 1440px run is the revert-sensitive one:
// the sheet at 430px pins its own label column, so it only guards the fixed 130px.
const measure = (root) =>
  [...root.querySelectorAll("[data-joined-label]")].map((label) => {
    const trigger = label.parentElement;
    const value = [...trigger.children].filter((c) => c !== label && c.tagName.toLowerCase() !== "svg").pop();
    const text = label.firstElementChild;
    const t = trigger.getBoundingClientRect();
    const v = value.getBoundingClientRect();
    return {
      labelW: Math.round(label.getBoundingClientRect().width),
      labelTruncated: text.scrollWidth > text.clientWidth,
      valueWhole: value.scrollWidth <= value.clientWidth + 1 && value.scrollHeight <= value.clientHeight + 1 && v.right <= t.right + 1,
    };
  });

const run = async (width, openSheet, allowFloor = false) => {
  const label = `${width}px`;
  try {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(url);
    const band = page.locator('[data-testid="crowded-band"]');
    await band.waitFor({ timeout: 5000 });
    if (openSheet) {
      await band.getByRole("button", { name: /filter/i }).first().click();
      await page.waitForSelector('[role="dialog"] [data-joined-label]', { timeout: 5000 });
    }
    const all = await page.evaluate(
      `(${measure})(document.querySelector(${JSON.stringify(openSheet ? '[role="dialog"]' : '[data-testid="crowded-band"]')}))`,
    );
    const rows = all;
    const expected = 4; // select, select, segmented control, native field
    if (rows.length !== expected) throw new Error(`expected ${expected} joined controls, found ${rows.length}`);
    // At 1440/430 every label is crowded enough to truncate; at the narrow desktop width
    // the labels may already sit at their floor, so only "value whole" is asserted there.
    const bad = rows.filter((r) => !r.valueWhole);
    // crowded for real: at least one label must have given way (else the demo proves nothing)
    if (!allowFloor && !rows.some((r) => r.labelTruncated)) bad.push({ error: "no label truncated — demo not crowded" });
    // sheet column must stay the fixed 130px on every row
    const widthOk = !openSheet || rows.every((r) => r.labelW === 130);
    // a narrow desktop band must scroll rather than clip: scrollWidth >= clientWidth always holds,
    // so the value-whole assertion above is the real check; record the band's scroll state.
    report(`joined labels @ ${label}`, bad.length === 0 && widthOk, JSON.stringify(rows));
    await page.close();
  } catch (e) {
    report(`joined labels @ ${label}`, false, e.message.split("\n")[0]);
  }
};
await run(1440, false);
await run(430, true);
await run(900, false, true);

await browser.close();
server.close();
console.log(failures.length ? `FAILED: ${failures.length}/${total}` : `PASSED: ${total}/${total}`);
process.exit(failures.length ? 1 : 0);
