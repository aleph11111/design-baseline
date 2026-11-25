// Real-browser check of the crud-dialog Two-pane demo body at the device triad
// (desk27 / laptop14 / phone — read from the `design-baseline/testing/devices`
// export, never a copy; docs/STYLE.md "The device triad").
//
// Guards the two-pane shape of `src/examples/crud-dialog-demo.tsx` (inputs
// left, a live computed preview right, a `@container` query) that derives the
// `CrudDialogSheet` `xl` width step (54rem, `WIDTH_MAP` in
// `src/components/archetypes/crud-dialog/CrudDialogSheet.tsx`). That no-
// truncation guarantee was previously verified only by an uncommitted ad hoc
// Chrome script, so a regression of the `xl` step or the container query would
// pass CI. `check:viewports` covers `kind: page` only and `check-detail-sheet`
// covers only list-with-detail; jsdom has no layout.
//
// Build choice: the PRODUCTION `gallery-dist` from `npm run gallery:build`, the
// same build `check:viewports` and the `check` CI job already make. The
// assertions are plain layout measurements (`getBoundingClientRect`, the
// sheet's rendered px width, the panes' geometry, `scrollWidth <= clientWidth`)
// — none need the dev-only overflow warnings that `check:detail-sheet` reads —
// so the check reuses the `check` job's build instead of a second dev build.
//
// Run: npm run check:crud-dialog-demo  (run after `gallery:build`; local Chrome).
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CHROME, serveDir, launchChrome } from "./lib/serve-gallery.mjs";
import { devices } from "../src/testing/devices.mjs";

// One line per device: assert the sheet's rendered width and the two-pane
// layout (side-by-side on the desktops, stacked on phone), plus that no element
// inside the preview pane is truncated or extends past the pane's box.
// `want` is the expected sheet width in px: 54rem = 864 on the desktops (the
// `xl` step, under `maxWidth: 100vw`); the full viewport width on phone (the
// sheet drops the inline width and is `w-full` there).
const CASES = [
  { name: "desk27", device: devices.desk27, want: 864, stacked: false },
  { name: "laptop14", device: devices.laptop14, want: 864, stacked: false },
  { name: "phone", device: devices.phone, want: devices.phone.viewport.width, stacked: true },
];

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../gallery-dist");
const gallery = await serveDir(DIST);
const url = `${gallery.url}/#/a/crud-dialog`;

const browser = await launchChrome();
const failures = [];
const total = CASES.length;
let n = 0;
const report = (label, ok, detail) => {
  n++;
  console.log(`[${new Date().toTimeString().slice(0, 8)}] ${n}/${total} ${ok ? "PASS" : "FAIL"} ${label}: ${detail}`);
  if (!ok) failures.push(label);
};
console.log(`crud-dialog demo check: ${total} devices (two-pane) against ${DIST} (Chrome: ${CHROME})`);

for (const c of CASES) {
  const label = `two-pane @ ${c.name}`;
  let ctx;
  try {
    ctx = await browser.newContext(c.device);
    const page = await ctx.newPage();
    await page.goto(url);
    // The demo lazy-loads; wait for its own h1 inside the content column.
    await page.waitForSelector(".db-content-column h1", { timeout: 10000 });
    await page.waitForLoadState("networkidle");
    // Switch the body to the two-pane shape, then open a create-mode dialog —
    // create mode renders the form + the live preview immediately (no fetch),
    // so the preview pane has content to measure right away.
    await page.getByRole("radio", { name: "Two-pane" }).click();
    await page.getByRole("button", { name: "Log workout" }).click();
    const dialog = page.locator('[role="dialog"]').first();
    await dialog.waitFor();
    await page.waitForTimeout(650); // slide-in animation + the @container query

    const m = await dialog.evaluate((el) => {
      const preview = el.querySelector('section[aria-label="Preview"]');
      if (!preview) return { err: "preview pane not found" };
      const grid = preview.parentElement; // `.grid gap-6 @2xl:grid-cols-2`
      const input = grid.firstElementChild; // the inputs column
      if (!input) return { err: "input pane not found" };
      const iR = input.getBoundingClientRect();
      const pR = preview.getBoundingClientRect();
      const paneRight = pR.right;
      // Truncated: the element's own content overflows its box (a horizontal
      // scroller). Past-box: the element extends beyond the preview's right
      // edge (the pane is narrower than its content and overflows visibly).
      const truncated = [];
      const pastBox = [];
      // Only leaf text elements: a container's scrollWidth grows when its
      // children overflow, but the truncated thing is the text — name it, not
      // the wrapper (an element's direct text node, excluding descendant text).
      for (const e of preview.querySelectorAll("*")) {
        const own = [...e.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim()).map((n) => n.textContent.trim()).join(" ");
        if (!own) continue;
        const name = `${e.tagName.toLowerCase()} "${own.replace(/\s+/g, " ").slice(0, 40)}"`;
        if (e.scrollWidth > e.clientWidth + 1) truncated.push(name);
        if (e.getBoundingClientRect().right > paneRight + 1) pastBox.push(name);
      }
      return {
        err: null,
        w: Math.round(el.getBoundingClientRect().width),
        paneRight: Math.round(paneRight),
        // Side by side: both columns start at the same top and the input ends
        // where the preview begins. Stacked: the preview sits below the input.
        sideBySide: Math.abs(iR.top - pR.top) < 8 && iR.right <= pR.left + 8,
        stacked: pR.top >= iR.bottom - 8,
        truncated,
        pastBox,
      };
    });
    if (m.err) throw new Error(m.err);
    const layoutOk = c.stacked ? m.stacked : m.sideBySide;
    const truncOk = m.truncated.length === 0 && m.pastBox.length === 0;
    const ok = m.w === c.want && layoutOk && truncOk;
    const wantLabel = c.name === "phone" ? "full viewport" : `54rem = ${c.want}px`;
    report(label, ok, `sheet ${m.w}px (want ${wantLabel}), ${c.stacked ? (m.stacked ? "stacked" : "NOT stacked") : m.sideBySide ? "side-by-side" : "NOT side-by-side"}, ${m.truncated.length} truncated + ${m.pastBox.length} past-pane element(s)${m.truncated.length || m.pastBox.length ? ` — ${[...m.truncated, ...m.pastBox].slice(0, 3).join(", ")}${(m.truncated.length + m.pastBox.length) > 3 ? "…" : ""}` : ""}`);
    await page.close();
  } catch (e) {
    report(label, false, e.message.split("\n")[0]);
  } finally {
    await ctx?.close().catch(() => {});
  }
}

await browser.close();
gallery.close();
console.log(failures.length ? `FAILED: ${failures.length}/${total}` : `PASSED: ${total}/${total}`);
process.exit(failures.length ? 1 : 0);
