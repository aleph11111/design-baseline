// The layout invariants every page meets at the device triad (STYLE.md "The
// device triad"), as a Playwright helper. The donor's check:viewports and every
// consumer's Playwright suite call this one implementation; never port it.
// Zero-dependency: it only calls `page.evaluate`.
//
//   import { devices } from "design-baseline/testing/devices";
//   import { assertPageInvariants } from "design-baseline/testing/invariants";
//   await assertPageInvariants(page, devices.phone);

/** Minimum phone tap target, CSS px (the 44pt rule, STYLE.md "App touch density"). */
export const TAP_TARGET_MIN = 44;

// Runs in the page. Returns one "<code>: <message>" string per breach.
function measure({ mobile, column, fullBleed, tap }) {
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
  if (sw > W) problems.push(`overflow: page scrolls sideways, scrollWidth ${sw}px > ${W}px`);

  // An element past the viewport edge that no scroll container holds, and no
  // ancestor clips back inside the viewport, is cut off for the user.
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
    problems.push(`clipped: ${describe(el)} cut off at the viewport edge (${Math.round(r.left)}..${Math.round(r.right)}px of ${W}px)`);
  }

  if (fullBleed !== undefined) {
    const marked = !!document.querySelector(".db-full-bleed");
    if (fullBleed && !marked) problems.push("fullBleed: full-bleed archetype lost its .db-full-bleed marker");
    if (!fullBleed && marked) problems.push("fullBleed: carries .db-full-bleed but is not in the full-bleed set (ADR-0007)");
  }
  const col = document.querySelector(".db-content-column");
  if (column && col) {
    const w = Math.round(col.getBoundingClientRect().width);
    const max = getComputedStyle(col).maxWidth;
    if (fullBleed ? max !== "none" : w !== column)
      problems.push(fullBleed ? `column: full-bleed column max-width ${max}, want none` : `column: content column ${w}px, want ${column}px`);
  }

  const bands = [...document.querySelectorAll("[data-toolbar-band],[data-slot=settings-table-band]")].filter(visible);
  for (const band of bands) {
    if (!mobile) {
      const tops = [...band.querySelectorAll("button,input,select,[role=combobox],[role=radiogroup]")]
        .filter(visible)
        .map((el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; });
      if (tops.length && Math.min(...tops.map((t) => t.bottom)) <= Math.max(...tops.map((t) => t.top)))
        problems.push("toolbarRows: desktop toolbar wraps onto more than one row");
    } else if ([...band.querySelectorAll("[data-joined-label]")].some(visible)) {
      problems.push("phoneToolbar: phone toolbar shows filter fields inline instead of in the filter sheet");
    }
  }

  if (mobile) {
    const bottomNav = [...document.querySelectorAll("nav")].some((nav) => visible(nav) && getComputedStyle(nav).position === "fixed");
    const trigger = [...document.querySelectorAll("[data-sidebar=trigger]")].some(visible);
    const desktopSidebar = [...document.querySelectorAll("[data-sidebar=sidebar]:not([data-mobile])")].some(visible);
    if (!bottomNav && !trigger) problems.push("phoneNav: phone has no navigation, neither a BottomNav nor a sidebar trigger");
    if (desktopSidebar) problems.push("phoneNav: phone shows the desktop sidebar instead of the sidebar sheet");

    const TARGETS = "button,a[href],input:not([type=hidden]),select,textarea,[role=button],[role=tab],[role=checkbox],[role=radio],[role=switch],[role=combobox],[role=menuitem]";
    const small = [];
    const stolen = [];
    for (const el of document.querySelectorAll(TARGETS)) {
      if (!visible(el) || el.closest("[role=dialog]")) continue;
      // A tap inside a target's visible box must reach that target: a
      // neighbour's hit area (a TOUCH_TARGET_CLASS overhang) must not cover its
      // edges. Probed 1px inside each edge, clipped to viewport and overflow ancestors.
      const b = el.getBoundingClientRect();
      let [x0, y0, x1, y1] = [Math.max(b.left, 0), Math.max(b.top, 0), Math.min(b.right, W), Math.min(b.bottom, window.innerHeight)];
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).overflow === "visible") continue;
        const ar = a.getBoundingClientRect();
        [x0, y0, x1, y1] = [Math.max(x0, ar.left), Math.max(y0, ar.top), Math.min(x1, ar.right), Math.min(y1, ar.bottom)];
      }
      if (x1 - x0 > 2 && y1 - y0 > 2) {
        const [cx, cy] = [(x0 + x1) / 2, (y0 + y1) / 2];
        for (const [x, y] of [[x0 + 1, cy], [x1 - 1, cy], [cx, y0 + 1], [cx, y1 - 1]]) {
          const other = document.elementFromPoint(x, y)?.closest(TARGETS);
          if (other && other !== el && !el.contains(other) && !other.contains(el)) {
            stolen.push(`${describe(el)} edge tap reaches ${describe(other)}`);
            break;
          }
        }
      }
      // a link inside running text is exempt (WCAG 2.5.8 inline exception)
      if (el.tagName === "A" && getComputedStyle(el).display === "inline") continue;
      // a control wrapped in its own larger hit area (a label) counts at that size
      const r = el.getBoundingClientRect();
      const lr = el.closest("label")?.getBoundingClientRect() ?? r;
      let w = Math.max(r.width, lr.width), h = Math.max(r.height, lr.height);
      // TOUCH_TARGET_CLASS: an absolutely positioned ::after is the hit area around a smaller box
      const after = getComputedStyle(el, "::after");
      if (after.content !== "none" && after.position === "absolute") {
        w = Math.max(w, parseFloat(after.width) || 0);
        h = Math.max(h, parseFloat(after.height) || 0);
      }
      if (h < tap - 0.5 || w < tap - 0.5) small.push(`${describe(el)} ${Math.round(w)}x${Math.round(h)}`);
    }
    if (small.length) problems.push(`tapTargets: ${small.length} tap target(s) under ${tap}px: ${small.slice(0, 6).join(", ")}${small.length > 6 ? ", ..." : ""}`);
    if (stolen.length) problems.push(`tapOverlap: ${stolen.length} target(s) whose edge tap reaches a neighbour: ${stolen.slice(0, 4).join(", ")}${stolen.length > 4 ? ", ..." : ""}`);
  }
  return [...new Set(problems)];
}

/**
 * Measures the page as it is now. `device` is a triad device (its `isMobile`
 * picks the phone checks). `options.knownGaps` maps a problem code to the
 * ticket slug that will fix it; those problems come back in `knownGaps`, not
 * `failures`. `column` / `fullBleed` are AppShell column checks, skipped when absent.
 */
export async function checkPageInvariants(page, device, { knownGaps = {}, column, fullBleed } = {}) {
  const problems = await page.evaluate(measure, { mobile: !!device.isMobile, column, fullBleed, tap: TAP_TARGET_MIN });
  const result = { failures: [], knownGaps: [] };
  for (const p of problems) {
    const ticket = knownGaps[p.slice(0, p.indexOf(":"))];
    if (ticket) result.knownGaps.push(`known gap (${ticket}): ${p}`);
    else result.failures.push(p);
  }
  return result;
}

/** `checkPageInvariants`, throwing one error that lists every failure. Returns the known gaps. */
export async function assertPageInvariants(page, device, options) {
  const { failures, knownGaps } = await checkPageInvariants(page, device, options);
  if (failures.length) throw new Error(`page invariants failed:\n  - ${failures.join("\n  - ")}`);
  return knownGaps;
}
