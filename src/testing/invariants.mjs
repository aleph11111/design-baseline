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
function measure({ mobile, column, fullBleed, tap, vw }) {
  const problems = [];
  // The device width, not window.innerWidth: mobile emulation grows the layout
  // viewport to fit overflowing content, so innerWidth would hide the overflow.
  const W = vw;
  // clipped to (≈) zero area by `clip-path`/`clip` — Tailwind's `.sr-only` is a 1px
  // box + `clip-path: inset(50%)` (or legacy `clip: rect(0,0,0,0)`): screen-reader
  // text hidden from the page. Its `overflow:hidden` is the hiding, not "cut-off
  // text", so it is not visible to the user.
  const zeroClipped = (el) => {
    const s = getComputedStyle(el);
    const inset = s.clipPath.match(/^inset\(([^)]+)\)$/i);
    if (inset) {
      // Each side as a percent of the box it cuts (top/bottom of the height,
      // right/left of the width): `%` as given, `px` against the element's own
      // box, any other unit (calc, em, `round` radius) counts as no cut — a
      // px inset must never be read as a percent and hide a visible element.
      const box = el.getBoundingClientRect();
      const pct = (tok, dim) =>
        tok.endsWith("%") ? parseFloat(tok) : tok.endsWith("px") && dim > 0 ? (parseFloat(tok) / dim) * 100 : 0;
      let t = inset[1].trim().split(/\s+round\s/)[0].trim().split(/\s+/); // top [right] [bottom|left] [left]
      if (t.length === 1) t = [t[0], t[0], t[0], t[0]];
      else if (t.length === 2) t = [t[0], t[1], t[0], t[1]];
      else if (t.length === 3) t = [t[0], t[1], t[2], t[1]];
      const v = [pct(t[0], box.height), pct(t[1], box.width), pct(t[2], box.height), pct(t[3], box.width)];
      if (v[0] + v[2] >= 99.5 || v[1] + v[3] >= 99.5) return true; // a dimension collapses to zero
    }
    if (/^rect\(\s*0[^,]+,\s*0[^,]+,\s*0[^,]+,\s*0[^,]+\s*\)$/.test(String(s.clip).replace(/\s+/g, ""))) return true;
    return false;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const s = getComputedStyle(el);
    return s.visibility !== "hidden" && s.display !== "none" && !zeroClipped(el) && !el.closest("[aria-hidden=true],[inert]");
  };
  const describe = (el) => {
    const label = el.getAttribute("aria-label") || el.textContent.trim().replace(/\s+/g, " ").slice(0, 40);
    return `<${el.tagName.toLowerCase()}${label ? ` "${label}"` : ""}>`;
  };
  // an element's own text box: it carries a non-whitespace text node directly
  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  // The overlay LAYER an element belongs to: the nearest position:fixed|sticky
  // ancestor (an AppHeader, a BottomNav, a sticky action bar, a floating feedback
  // button) or the nearest dialog/menu/tooltip/popover, or the element itself when
  // it carries that position — or no layer (plain page text). Text in one layer
  // legitimately sits over page text, so a box collides only with text in ITS OWN
  // layer; a box over text in a different layer (or over plain page text) is
  // intended chrome, not a collision. Two boxes INSIDE one chrome bar, though, can
  // still collide, and that stays checked. Memoized per element so the check stays
  // O(page) rather than O(page²).
  const OVERLAY_SEL = '[role="dialog"],[role="tooltip"],[role="menu"],[data-radix-popper-content-wrapper]';
  const overlayRootMemo = new WeakMap(); // el → overlay-layer root element, or null
  const overlayRoot = (el) => {
    const cached = overlayRootMemo.get(el);
    if (cached !== undefined) return cached;
    const parent = el.parentElement;
    const root =
      el.matches(OVERLAY_SEL) || ["fixed", "sticky"].includes(getComputedStyle(el).position)
        ? el
        : (parent ? overlayRoot(parent) : null);
    overlayRootMemo.set(el, root);
    return root;
  };

  if (window.innerWidth > W) problems.push(`overflow: layout viewport grew to ${window.innerWidth}px past the ${W}px device width`);
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

  // A visible horizontal scroller whose content is wider than its box is a
  // nested overflow — the page scrolls inside `main`, not the container, so the
  // viewport-edge checks above never see it. Intended scrollers (wide tables,
  // matrices, code blocks) opt out with `data-scroll-region` on the scroller or
  // an ancestor; report the outermost offender, as `clipped` does.
  const nested = [];
  for (const el of document.body.querySelectorAll("*")) {
    // no overlay exemption: the ticket's only opt-out is data-scroll-region
    if (!visible(el)) continue;
    const s = getComputedStyle(el);
    if (s.overflowX !== "auto" && s.overflowX !== "scroll") continue;
    if (el.scrollWidth <= el.clientWidth + 1) continue;
    let marked = false;
    for (let a = el; a && a !== document.body; a = a.parentElement) if (a.hasAttribute("data-scroll-region")) { marked = true; break; }
    if (marked) continue;
    if (!nested.some((c) => c.contains(el))) nested.push(el);
  }
  for (const el of nested.slice(0, 5))
    problems.push(`nestedOverflow: ${describe(el)} scrolls sideways (${Math.round(el.scrollWidth)}px in a ${Math.round(el.clientWidth)}px box, no data-scroll-region)`);

  // Cut-off text: a text-bearing box that clips HORIZONTALLY (the axis
  // scrollWidth/clientWidth measure) wider than it is. An intentional ellipsis
  // (`text-overflow: ellipsis`, the `truncate` surface) is a design choice, not
  // a bug, so it is exempt; `pre`/`textarea`/`[role=dialog]` are excluded as in
  // `scrollCue`. `overflowX` is the horizontal axis, but jsdom does not expand
  // the `overflow` shorthand into it (`overflow:hidden` reports overflowX
  // "visible"), so the shorthand's first token (also the x-axis) is read too.
  // In a real browser the two always agree, so this only covers the jsdom unit
  // surface — it can't add findings on the `check:viewports` (Chrome) path.
  for (const el of document.body.querySelectorAll("*")) {
    if (!visible(el) || !ownText(el) || el.closest("[role=dialog],pre,textarea")) continue;
    const s = getComputedStyle(el);
    const oxTok = s.overflow.trim().split(/\s+/)[0];
    if (s.overflowX !== "hidden" && s.overflowX !== "clip" && oxTok !== "hidden" && oxTok !== "clip") continue;
    if (el.scrollWidth <= el.clientWidth + 1) continue;
    if (s.textOverflow === "ellipsis") continue;
    problems.push(`textClip: ${describe(el)} is cut off by overflow (text ${el.scrollWidth}px > box ${el.clientWidth}px)`);
  }

  // A page heading that wraps onto a third line is a layout failure — the title
  // line is the page's first thing read. Content height exceeds 2 rendered
  // line-heights (not the box: padding/borders don't count).
  const px = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  for (const h of document.body.querySelectorAll("h1")) {
    if (!visible(h)) continue;
    const s = getComputedStyle(h);
    const lh = s.lineHeight === "normal" ? px(s.fontSize) * 1.2 : px(s.lineHeight);
    if (!lh || !isFinite(lh)) continue;
    const box = h.getBoundingClientRect();
    const contentH = box.height - px(s.paddingTop) - px(s.paddingBottom) - px(s.borderTopWidth) - px(s.borderBottomWidth);
    if (contentH > lh * 2 + 1)
      problems.push(`headingLines: ${describe(h)} wraps onto more than 2 lines (${Math.round(contentH)}px of text, ${Math.round(lh * 2)}px is two)`);
  }

  // A page title squeezed below its longest word — the header actions steal
  // the title block's width (HEADING_ROW_CLASSES.actions re-gaining `shrink-0`
  // or losing its width cap), so the title's line boxes run wider than the
  // block and the browser breaks a token MID-TOKEN (SO-2026-00053 splitting in
  // the ~780px column). A squeezed title re-wraps, so the box alone and the
  // text's own scrollWidth/rects both re-lay-out and neither sees the break —
  // the token's NATURAL width is measured instead: one hidden, max-content
  // probe per title word at the heading's own font (family/size/weight/
  // stretch/spacing, text-transform applied). A word wider than the heading
  // box cannot sit on any line: it wraps mid-token.
  // Guarded exactly on HeadingRow's `data-slot="heading-row-title"` marker —
  // h1 rung (PageHeader, every shell through PageFrame) and the
  // NestedPageHeading h2 rung: one check, every heading row, by construction.
  // No other h1/h2 is guarded: SectionHeading and detail-panel headings
  // legitimately narrow and wrap at word boundaries. Non-mobile only: a
  // stacked row gives the title the full width, so it cannot be squeezed (a
  // mid-token line there is text-wrap, not layout).
  if (!mobile) {
    const wordWidth = (word, source) => {
      const s = getComputedStyle(source);
      const probe = document.createElement("div");
      probe.textContent = s.textTransform === "uppercase" ? word.toUpperCase() : word;
      probe.style.cssText =
        `position:fixed;left:0;top:0;visibility:hidden;z-index:-1;white-space:nowrap;` +
        `font-family:${s.fontFamily};font-size:${s.fontSize};font-weight:${s.fontWeight};` +
        `font-style:${s.fontStyle};font-stretch:${s.fontStretch};letter-spacing:${s.letterSpacing};direction:${s.direction}`;
      document.body.appendChild(probe);
      const width = probe.getBoundingClientRect().width;
      probe.remove();
      return width;
    };
    const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
    for (const h of document.querySelectorAll('[data-slot="heading-row-title"] > h1, [data-slot="heading-row-title"] > h2')) {
      if (!visible(h)) continue;
      const s = getComputedStyle(h);
      const contentW = h.getBoundingClientRect().width - num(s.paddingLeft) - num(s.paddingRight);
      if (contentW < 2) continue;
      let worst = 0, worstWord = "";
      const seen = new Set();
      const walk = (node) => {
        for (const c of node.childNodes) {
          if (c.nodeType === 3) {
            for (const word of c.textContent.split(/\s+/)) {
              if (!word || seen.has(word)) continue;
              seen.add(word);
              const tw = wordWidth(word, h);
              if (tw > worst) { worst = tw; worstWord = word; }
            }
          } else if (c.nodeType === 1) walk(c);
        }
      };
      walk(h);
      if (worst > contentW + 2)
        problems.push(`titleSqueeze: ${describe(h)} squeezed to ${Math.round(contentW)}px, longest word ${Math.round(worst)}px ("${worstWord.slice(0, 24)}") — wraps mid-token`);
    }
  }

  // Two visible text boxes that sit on top of each other — a real overlap is a
  // bug (a label printed over a value). Excludes ancestor/descendant pairs and
  // cross-layer overlays: a box in one chrome layer (a sticky bar, a fixed
  // header, a dialog) sits over page text by design, so it is reported only
  // against other text IN ITS OWN layer — text in a different layer (or plain
  // page text) is the intended overlap. Intersects the PAINTED line fragments
  // (`getClientRects`), not the element box: a wrapping element's box is the
  // union of its lines, which intersects line neighbours even when the glyphs
  // don't touch. `getClientRects` returns UNCLIPPED geometry though — a
  // truncated link's boxes, or cells scrolled off the right of a scroller,
  // extend past the ancestor that hides them — so fragments are clipped to
  // the elements' overflow ancestors; a clip that removes every fragment
  // leaves nothing painted, and that must NOT fall back to the unclipped box.
  const CLIP_AXIS = new Set(["hidden", "clip"]); // hides text past its box
  const SCROLL_AXIS = new Set(["auto", "scroll"]); // paints only inside its box
  const axisVals = (s) => {
    // jsdom does not expand the `overflow` shorthand into the longhands (see
    // the textClip check above) — an unexpanded longhand stays at "visible",
    // so the shorthand's tokens (first x, second y; one token is both) carry.
    const t = s.overflow ? s.overflow.trim().split(/\s+/) : ["", ""];
    const pick = (long, tok) => (long && long !== "visible" ? long : tok !== "visible" ? tok : "visible");
    return { x: pick(s.overflowX, t[0]), y: pick(s.overflowY, t.length === 1 ? t[0] : t[1]) };
  };
  const clipSide = (el, other) => {
    // The area an element's text is painted in, RELATIVE TO `other`. A
    // hidden|clip ancestor always cuts: text past its box is not painted (a
    // box holding both is a shared clip — a common clip keeps relative
    // geometry intact). An auto|scroll ancestor cuts only when it holds one
    // side: two boxes inside the same scroller (the page's own <main>
    // included) scroll together, so their relative placement is real anywhere
    // — including below the visible box; a box past a NESTED scroller's edge
    // is painted relative to nothing (scrolled away / clipped) and must not
    // overlap text outside the scroller.
    const r = { left: -Infinity, top: -Infinity, right: Infinity, bottom: Infinity };
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const v = axisVals(getComputedStyle(a));
      const hx = CLIP_AXIS.has(v.x), sx = SCROLL_AXIS.has(v.x);
      const hy = CLIP_AXIS.has(v.y), sy = SCROLL_AXIS.has(v.y);
      if (!hx && !sx && !hy && !sy) continue;
      const onlyOne = !a.contains(other);
      const cutX = hx || (sx && onlyOne);
      const cutY = hy || (sy && onlyOne);
      if (!cutX && !cutY) continue;
      const ar = a.getBoundingClientRect();
      if (cutX) { r.left = Math.max(r.left, ar.left); r.right = Math.min(r.right, ar.right); }
      if (cutY) { r.top = Math.max(r.top, ar.top); r.bottom = Math.min(r.bottom, ar.bottom); }
    }
    return r;
  };
  const fragments = (el, other) => {
    const c = clipSide(el, other);
    const rs = [...el.getClientRects()];
    // `getClientRects` is empty only where there is no layout at all (jsdom):
    // then the box stands in for the fragments, clipped the same way. With
    // real layout an empty clipped result means nothing is painted — it must
    // NOT fall back to the unclipped box, or hidden text overlaps again.
    const src = rs.length ? rs : [el.getBoundingClientRect()];
    const out = [];
    for (const r of src) {
      const l = Math.max(r.left, c.left), t = Math.max(r.top, c.top);
      const rt = Math.min(r.right, c.right), b = Math.min(r.bottom, c.bottom);
      if (rt - l > 1 && b - t > 1) out.push({ left: l, top: t, right: rt, bottom: b });
    }
    return out;
  };
  const boxes = [...document.body.querySelectorAll("*")]
    .filter((el) => visible(el) && ownText(el))
    .map((el) => ({ el, layer: overlayRoot(el), rect: el.getBoundingClientRect() }));
  // Painted fragments lie inside the element's bounding box, so two boxes that
  // do not intersect can never overlap — the cheap test runs before the
  // ancestor walks in fragments(), keeping table-heavy pages fast.
  const boxesMeet = (p, q) =>
    Math.min(p.right, q.right) - Math.max(p.left, q.left) > 1 &&
    Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 1;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      // same overlay layer (both plain page text, or the same chrome bar): a real
      // collision is possible. Different layers (chrome over page, or two chrome
      // bars): an intended overlay, not a bug.
      if (a.layer !== b.layer || !boxesMeet(a.rect, b.rect)) continue;
      // fragments are pair-specific: a scroller both boxes share must not cut
      const fa = fragments(a.el, b.el);
      const fb = fragments(b.el, a.el);
      let hit = false;
      for (const la of fa) for (const lb of fb) {
        const w = Math.min(la.right, lb.right) - Math.max(la.left, lb.left);
        const h = Math.min(la.bottom, lb.bottom) - Math.max(la.top, lb.top);
        if (w > 1 && h > 1) { hit = true; break; }
      }
      if (hit) {
        problems.push(`textOverlap: ${describe(a.el)} and ${describe(b.el)} overlap`);
        break; // one report per element — outermost / first, not every pair
      }
    }
  }

  // A formatted money or percent FACT rendered more than twice in main is a
  // duplicate fact — the same number sitting in three places (rail + table +
  // total row) is a layout smell, not content. Scans the main content region:
  // `<main>` (AppShell's canonical owner), falling back to `document.body` when
  // none exists (off-app AuthCard pages). Each element contributes only its OWN
  // text (direct child text nodes, never element.textContent), so a figure
  // nested in a value (<strong> inside a label row) is counted once — not
  // again by the wrapper — and a zero-box .sr-only figure under a visible
  // parent is not read through it. Heuristic limits (documented per the
  // ticket, kept loose on purpose):
  //   - only formatted money (digits + thousands/decimal separator + currency
  //     symbol or 3-letter code) and percent (digits + %) are counted. A bare
  //     number, a plain ID (SO-2026-0412), an address line (20457 Hamburg), a
  //     tracking number, or a date are never matched — no false positives on
  //     the house formats, but a fact written as a bare number is missed.
  //   - the symbol/code is read only AFTER the number, so the en-US
  //     prefix form `$1,234.50` is never matched.
  //   - the 3-letter code also matches plain words after a number
  //     (`5 DHL`, `10 PCS`) — a documented false positive, cheap to keep.
  //   - a figure split across two elements (digits and symbol in sibling
  //     spans) is not matched, since a token is read from one element's own
  //     text; the house format always emits one string into one node.
  //   - locale-tolerant: both `1,234.50 €` and `1.234,50 €` count, and the
  //     NBSP/figure-space a real `Intl` emits before a symbol or `%` is
  //     normalised to one space, so the two spellings of the same fact agree.
  //   - a label/value repeat (a column label and its total row share one token)
  //     renders twice and passes — only the > 2× case is a finding.
  const FACT_MONEY =
    /(?<![\d.,\u2212-])([\u2212-]?\d{1,3}(?:\.\d{3})*(?:[.,]\d{1,2})?|[\u2212-]?\d{1,3}(?:,\d{3})*\.\d{1,2}|[\u2212-]?\d+(?:[.,]\d{1,2})?)[ ]*(?:[\u20AC\u00A3$\u00A5]|\b[A-Z]{3}\b)/gu;
  const FACT_PCT = /(?<![\d.,\u2212-])([\u2212-]?\d+(?:[.,]\d+)?)[ ]*%/gu;
  const normWs = (s) => s.replace(/[\u00A0\u2007\u202F]/g, " ").replace(/\s+/g, " ").trim();
  const ownTextOf = (el) => {
    let s = "";
    for (const n of el.childNodes) if (n.nodeType === 3) s += n.textContent;
    return s;
  };
  const factRoot = document.querySelector("main") || document.body;
  const factCounts = new Map();
  for (const el of factRoot.querySelectorAll("*")) {
    if (!visible(el) || !ownText(el)) continue;
    const t = normWs(ownTextOf(el));
    for (const re of [FACT_MONEY, FACT_PCT]) {
      for (const m of t.matchAll(re)) {
        const tok = normWs(m[0]);
        factCounts.set(tok, (factCounts.get(tok) ?? 0) + 1);
      }
    }
  }
  // one report per offending token (not per occurrence), so a page can't drown
  // the report in repeats of the same fact; past five offenders a cap line
  // stands in for the rest (the tapTargets pattern)
  const factOffenders = [...factCounts].filter(([, n]) => n > 2);
  for (const [tok, n] of factOffenders.slice(0, 5)) {
    problems.push(`duplicateFact: "${tok}" rendered ${n} times in main`);
  }
  if (factOffenders.length > 5) problems.push(`duplicateFact: ${factOffenders.length - 5} more repeated fact(s) not listed`);

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
    // A centered off-app screen (sign-in, 404) renders AuthCard without AppShell: no nav by design.
    // AppShell's content column marks an in-app page: an AuthCard inside it keeps the check.
    const authCard = !!document.querySelector("[data-slot=auth-card]") && !document.querySelector(".db-content-column");
    if (!bottomNav && !trigger && !authCard) problems.push("phoneNav: phone has no navigation, neither a BottomNav nor a sidebar trigger");
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
      // the nearest sticky/fixed ancestor-or-self, if any
      const pinned = (n) => {
        for (let a = n; a && a !== document.body; a = a.parentElement) if (["sticky", "fixed"].includes(getComputedStyle(a).position)) return a;
        return null;
      };
      if (x1 - x0 > 2 && y1 - y0 > 2) {
        const [cx, cy] = [(x0 + x1) / 2, (y0 + y1) / 2];
        for (const [x, y] of [[x0 + 1, cy], [x1 - 1, cy], [cx, y0 + 1], [cx, y1 - 1]]) {
          const other = document.elementFromPoint(x, y)?.closest(TARGETS);
          // A BOTTOM-pinned bar (sticky/fixed, `bottom` set) over content the
          // page can still scroll clear of it occludes, it does not steal:
          // exempt only when the remaining scroll lifts the target's bottom
          // above the bar's top. The bar must start below the target's top or
          // cover the target's visible part (clipped to the viewport) wholly; a bar whose lower edge leaves the target's
          // bottom showing, a top-pinned bar (`bottom: auto`), or a target
          // covered at every scroll position still fails.
          const pin = other && !pinned(el) ? pinned(other) : null;
          const pr = pin?.getBoundingClientRect();
          if (pin && getComputedStyle(pin).bottom !== "auto" && (pr.top > b.top || pr.bottom >= y1)) {
            const need = b.bottom - pr.top;
            const room = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
            if (room >= need) continue;
          }
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
  // A table's label (first text) column never squeezes below ~6ch — the
  // value columns yield by scroll, not by eating the label. A figure table's
  // label is its header's first cell; an HTML table's is the first cell with
  // text in its first body row (a leading checkbox / icon column is skipped).
  const ch6 = (c) => 6 * 0.6 * parseFloat(getComputedStyle(c).fontSize);
  for (const h of document.querySelectorAll('[data-slot="figure-table-header"]')) {
    const c = h.firstElementChild;
    if (!c || !visible(c)) continue;
    const w = c.getBoundingClientRect().width;
    if (w < ch6(c)) problems.push(`figureTable: label column ${Math.round(w)}px, under ~6ch (${Math.round(ch6(c))}px)`);
  }
  for (const t of document.querySelectorAll("table")) {
    if (!visible(t) || t.closest("[role=dialog]")) continue;
    const row = t.tBodies[0]?.rows[0] ?? t.rows[0];
    const c = row && [...row.cells].find((x) => visible(x) && x.textContent.trim());
    if (!c) continue;
    const w = c.getBoundingClientRect().width;
    if (w < ch6(c)) problems.push(`tableColumn: first column ${describe(c)} ${Math.round(w)}px, under ~6ch (${Math.round(ch6(c))}px)`);
  }
  // A horizontal scroller with content past its right edge shows the shared
  // right-edge cue (ScrollCue, `data-slot="scroll-cue"`) — overlay scrollbars
  // otherwise crop a table or strip silently. Checked unscrolled, as loaded.
  for (const el of document.body.querySelectorAll("*")) {
    if (el.closest("[role=dialog],pre,textarea") || !visible(el)) continue;
    const ox = getComputedStyle(el).overflowX;
    if (ox !== "auto" && ox !== "scroll") continue;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) continue;
    if (el.parentElement?.querySelector(':scope > [data-slot="scroll-cue"]')) continue;
    problems.push(`scrollCue: ${describe(el)} clips ${el.scrollWidth - el.clientWidth}px sideways with no scroll cue (shared ScrollCue)`);
  }
  return [...new Set(problems)];
}

/**
 * Measures the page as it is now. `device` is a triad device (its `isMobile`
 * picks the phone checks, its `viewport.width` is the width measured against). `options.knownGaps` maps a problem code to the
 * ticket slug that will fix it; those problems come back in `knownGaps`, not
 * `failures`. `column` / `fullBleed` are AppShell column checks, skipped when absent.
 */
export async function checkPageInvariants(page, device, { knownGaps = {}, column, fullBleed } = {}) {
  const problems = await page.evaluate(measure, { mobile: !!device.isMobile, column, fullBleed, tap: TAP_TARGET_MIN, vw: device.viewport.width });
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
