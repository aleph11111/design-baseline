import { describe, expect, it } from "vitest";
// through the package's own export, as a consumer imports it
import { assertPageInvariants, checkPageInvariants } from "design-baseline/testing/invariants";
import { devices } from "design-baseline/testing/devices";

// The in-page measurement needs real layout (check:viewports runs it in
// Chrome); here a page stub returns fixed problems to test the gap logic.
const page = (problems: string[]) => ({ evaluate: async () => problems as never });

describe("page invariants", () => {
  it("passes the device's phone flag into the measurement", async () => {
    let arg: { mobile: boolean; tap: number } | undefined;
    await checkPageInvariants({ evaluate: async (_fn, a) => { arg = a as never; return [] as never; } }, devices.phone);
    expect(arg).toMatchObject({ mobile: true, tap: 44 });
  });

  it("throws listing every failure", async () => {
    await expect(assertPageInvariants(page(["overflow: x", "tapTargets: y"]), devices.phone)).rejects.toThrow(
      /overflow: x[\s\S]*tapTargets: y/,
    );
  });

  it("downgrades a known-gap code to a warning naming its ticket", async () => {
    const warnings = await assertPageInvariants(page(["tapTargets: y"]), devices.phone, {
      knownGaps: { tapTargets: "some-ticket" },
    });
    expect(warnings).toEqual(["known gap (some-ticket): tapTargets: y"]);
    await expect(
      assertPageInvariants(page(["tapTargets: y", "overflow: x"]), devices.phone, { knownGaps: { tapTargets: "t" } }),
    ).rejects.toThrow(/overflow: x/);
  });

  it("overflow: a layout viewport grown past the phone width (mobile emulation) fails; scrollWidth is measured against the device width", async () => {
    // Emulation grows innerWidth to fit a 418px element, so scrollWidth == innerWidth: only the device width exposes it.
    document.body.innerHTML = "<main></main>";
    const set = (o: object, k: string, v: number) => Object.defineProperty(o, k, { configurable: true, value: v });
    set(window, "innerWidth", 418);
    set(document.documentElement, "scrollWidth", 418);
    const run = () => assertPageInvariants({ evaluate: async (fn, a) => (fn as (a: unknown) => unknown)(a) as never }, devices.phone);
    try {
      await expect(run()).rejects.toThrow(/overflow: layout viewport grew to 418px past the 390px[\s\S]*overflow: page scrolls sideways, scrollWidth 418px > 390px/);
    } finally {
      // drop the own properties so jsdom's prototype getters come back for later tests
      delete (window as { innerWidth?: number }).innerWidth;
      delete (document.documentElement as { scrollWidth?: number }).scrollWidth;
    }
  });

  it("phoneNav: AuthCard page is exempt from no-navigation, an app page is not", async () => {
    // jsdom has no layout, so `visible` is false everywhere: this exercises only the marker branch.
    const run = (html: string) => {
      document.body.innerHTML = html;
      return checkPageInvariants({ evaluate: async (fn, a) => (fn as (a: unknown) => unknown)(a) as never }, devices.phone);
    };
    expect((await run('<div data-slot="auth-card"></div>')).failures.filter((f: string) => f.startsWith("phoneNav"))).toEqual([]);
    expect((await run('<div class="db-content-column"><div data-slot="auth-card"></div></div>')).failures).toEqual(
      expect.arrayContaining([expect.stringMatching(/^phoneNav: phone has no navigation/)]),
    );
    expect((await run("<main></main>")).failures).toEqual(expect.arrayContaining([expect.stringMatching(/^phoneNav: phone has no navigation/)]));
  });

  it("tapOverlap: a bottom-pinned bar over scrollable content is exempt; a top-pinned bar or a non-scrolling page still fails", async () => {
    // jsdom has no layout: stub the geometry the probe reads. Wrappers say
    // overflow:visible so the probe is not clipped to their (zero) rects.
    const rect = (top: number, h: number) => ({ top, bottom: top + h, left: 0, right: 390, width: 390, height: h, x: 0, y: top, toJSON() {} }) as DOMRect;
    const run = async (pin: string, barTop: number, room: number, targetTop = 700, barH = 60, targetH = 60) => {
      document.body.innerHTML =
        `<div class="db-content-column" style="overflow:visible"><nav style="position:fixed"></nav><button id="t">Target</button><div id="pin" style="overflow:visible;${pin}"><button id="bar">Bar</button></div></div>`;
      const t = document.getElementById("t")!, bar = document.getElementById("bar")!;
      t.getBoundingClientRect = () => rect(targetTop, targetH);
      bar.getBoundingClientRect = () => rect(barTop, 60);
      document.getElementById("pin")!.getBoundingClientRect = () => rect(barTop, barH);
      document.querySelector("nav")!.getBoundingClientRect = () => rect(0, 0);
      document.elementFromPoint = (_x: number, y: number) => (y >= barTop && y <= barTop + barH ? bar : t);
      Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 844 + room });
      Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
      const { failures } = await checkPageInvariants({ evaluate: async (fn, a) => (fn as (a: unknown) => unknown)(a) as never }, devices.phone);
      return failures.filter((f: string) => f.startsWith("tapOverlap"));
    };
    const bottomBar = "position:sticky;bottom:0";
    expect(await run(bottomBar, 740, 200)).toEqual([]); // Td's sticky bar: the page scrolls the target clear
    expect(await run("position:fixed;bottom:0", 740, 0)).toHaveLength(1); // (b) bottom nav on a non-scrolling page
    expect(await run("position:sticky;top:0", 740, 200)).toHaveLength(1); // (a) top-pinned sticky header over a button
    expect(await run(bottomBar, 660, 200)).toHaveLength(1); // a bar above the target's top
    expect(await run(bottomBar, 775, 200, 789, 69, 44)).toEqual([]); // target wholly under the bar, scrollable clear
    expect(await run(bottomBar, 775, 0, 789, 69, 44)).toHaveLength(1); // ...but not on a page that cannot scroll
    expect(await run(bottomBar, 775, 200, 810, 69, 44)).toEqual([]); // visible part under the bar, rest below the viewport
  });

  // jsdom has no layout: run the real `measure` against a fixed DOM and stub the
  // geometry each check reads. `runCheck` runs `measure` in-page, as a consumer does.
  const runCheck = (): Promise<string[]> =>
    checkPageInvariants(
      { evaluate: async (fn, a) => ((fn as (a: unknown) => unknown)(a)) as never },
      devices.laptop14,
    ).then((r) => r.failures);
  const box = (el: Element, l: number, top: number, w: number, h: number, right?: number) => {
    const rect = () => {
      const rr = { left: l, top, width: w, height: h, right: right ?? l + w, bottom: top + h, x: l, y: top };
      const obj = { ...rr, toJSON: () => rr };
      return obj as unknown as DOMRect;
    };
    el.getBoundingClientRect = rect;
  };
  // jsdom has no Range geometry API — `textNodeRange` in the implementation
  // reads the painted per-line rects via `document.createRange().
  // getClientRects()` per own text node, which is absent here. To make the
  // unit surface exercise THAT path (not the element's `getClientRects`
  // fallback, which the pre-fragment-change code also read rect-by-rect), the
  // stub has two halves:
  //   `__box` on an element → its `getClientRects()` returns that single
  //     border box (a real browser's block-element `getClientRects` is a
  //     single border box, so this is the correct stub for the element side);
  //   the patched `Range.prototype.getClientRects` reads `__rangeLines` from
  //     the Range's `startContainer.parentElement` (the element the text node
  //     belongs to) → the per-line painted rects.
  // A test that asserted on the element `getClientRects` side alone would pass
  // on code without the Range change, so the Range half is the one that proves
  // the fix. Restore is idempotent and must run in a `finally`.
  const rectify = (l: [number, number, number, number][]) =>
    l.map(([left, top, w, h]) => {
      const r = { left, top, width: w, height: h, right: left + w, bottom: top + h, x: left, y: top, toJSON() {} };
      return r as unknown as DOMRect;
    });
  const stubRangeRects = (): (() => void) => {
    const elProto = Element.prototype.getClientRects;
    Element.prototype.getClientRects = function (this: Element) {
      const b = (this as unknown as { __box?: [number, number, number, number] }).__box;
      if (b) return rectify([b]) as unknown as DOMRectList;
      return elProto.call(this);
    };
    // The implementation reads the bare global `Range` (not `document.Range`,
    // which is not a standard property), so the patch has to land on
    // `globalThis.Range.prototype` — and be removed again (jsdom's own
    // prototype has no `getClientRects`).
    const rangeProto = (globalThis as unknown as { Range?: { prototype: { getClientRects?: unknown } } }).Range?.prototype;
    let rangeRestored = false;
    if (rangeProto && typeof rangeProto.getClientRects !== "function") {
      rangeProto.getClientRects = function (this: { startContainer: Node }) {
        const node = this.startContainer;
        const parent = node.parentElement as unknown as { __rangeLines?: [number, number, number, number][] } | null;
        const lines = parent?.__rangeLines;
        if (lines) return rectify(lines) as unknown as DOMRectList;
        return [] as unknown as DOMRectList;
      };
      rangeRestored = true;
    }
    return () => {
      Element.prototype.getClientRects = elProto;
      if (rangeRestored && rangeProto) delete (rangeProto as { getClientRects?: unknown }).getClientRects;
    };
  };

  // jsdom has no text metrics: the titleSqueeze check's hidden word-probe
  // divs (`visibility:hidden`, created per word) have no rect — stub a natural
  // width per word so the check's measurement path is exercised.
  const stubWordWidths = (widths: Record<string, number>): (() => void) => {
    const proto = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function (this: Element) {
      if (this instanceof HTMLDivElement && this.style.visibility === "hidden") {
        const w = widths[(this.textContent ?? "").trim()] ?? 0;
        const r = { left: 0, top: 0, width: w, height: 20, right: w, bottom: 20, x: 0, y: 0, toJSON() {} };
        return r as unknown as DOMRect;
      }
      return proto.call(this);
    };
    return () => {
      Element.prototype.getBoundingClientRect = proto;
    };
  };
  const scroller = () => {
    const s = document.createElement("div");
    s.style.overflowX = "auto";
    box(s, 0, 0, 100, 50);
    Object.defineProperty(s, "scrollWidth", { configurable: true, value: 200 });
    Object.defineProperty(s, "clientWidth", { configurable: true, value: 100 });
    return s;
  };

  it("nestedOverflow: an overflow-x scroller wider than its box fails; data-scroll-region (self or ancestor) exempts; content that fits passes", async () => {
    document.body.innerHTML = "<div class='db-content-column'></div>";
    const col = document.querySelector(".db-content-column")!;
    const unmarked = scroller();
    col.appendChild(unmarked);
    let f = await runCheck();
    expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^nestedOverflow:.*scrolls sideways/)]));
    // content that fits: scrollWidth == clientWidth → no finding
    Object.defineProperty(unmarked, "scrollWidth", { configurable: true, value: 100 });
    f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^nestedOverflow/)]));
    // intended: a wide table opts out with the marker on the scroller
    Object.defineProperty(unmarked, "scrollWidth", { configurable: true, value: 200 });
    unmarked.setAttribute("data-scroll-region", "");
    f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^nestedOverflow/)]));

    // opt out via an ANCESTOR marker, scroller unmarked
    document.body.innerHTML = "<div class='db-content-column'></div>";
    const col2 = document.querySelector(".db-content-column")!;
    const wrap = document.createElement("div");
    wrap.setAttribute("data-scroll-region", "");
    const s2 = scroller();
    wrap.appendChild(s2);
    col2.appendChild(wrap);
    f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^nestedOverflow/)]));
  });

  it("textClip: a text box clipped by overflow:hidden fails; intentional ellipsis and content that fits pass", async () => {
    const clipped = () => {
      document.body.innerHTML = "<p></p>";
      const p = document.querySelector("p")!;
      p.textContent = "long";
      p.style.overflow = "hidden";
      box(p, 0, 0, 100, 20);
      Object.defineProperty(p, "scrollWidth", { configurable: true, value: 200 });
      Object.defineProperty(p, "clientWidth", { configurable: true, value: 100 });
      return p;
    };
    let p = clipped();
    let f = await runCheck();
    expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^textClip:.*cut off by overflow/)]));
    // intentional ellipsis (the `truncate` surface) is exempt
    p = clipped();
    p.style.textOverflow = "ellipsis";
    f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textClip:.*cut off/)]));
    // content that fits is not clipped
    p = clipped();
    Object.defineProperty(p, "scrollWidth", { configurable: true, value: 100 });
    f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textClip/)]));
    // HORIZONTAL-ONLY clipping: `overflow-x: hidden` with the vertical axis free
    // (the computed `overflow` shorthand reads "hidden auto", so this case can
    // only be caught by reading `overflowX` — the axis scrollWidth measures)
    document.body.innerHTML = "<p></p>";
    p = document.querySelector("p")!;
    p.textContent = "wide";
    p.style.overflowX = "hidden";
    p.style.overflowY = "auto";
    box(p, 0, 0, 100, 20);
    Object.defineProperty(p, "scrollWidth", { configurable: true, value: 200 });
    Object.defineProperty(p, "clientWidth", { configurable: true, value: 100 });
    f = await runCheck();
    expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^textClip:.*cut off by overflow/)]));
  });

  it("textClip: the clipping box is the offender when the text sits in a nested element — a <button class=overflow-hidden><span> wider than the button fails", async () => {
    const nested = (wide: boolean) => {
      // the button has NO direct text node; the label lives in the span — the
      // pre-fix shape the check missed entirely (ownText(button) === false).
      // The class names the shape (the tailwind utility); the inline style
      // carries it, since jsdom has no stylesheet to resolve the class.
      document.body.innerHTML = "<button class='overflow-hidden'></button>";
      const btn = document.querySelector("button")!;
      btn.style.overflow = "hidden";
      const span = document.createElement("span");
      span.textContent = "a very long label";
      btn.appendChild(span);
      box(btn, 0, 0, 100, 44);
      Object.defineProperty(btn, "scrollWidth", { configurable: true, value: wide ? 240 : 100 });
      Object.defineProperty(btn, "clientWidth", { configurable: true, value: 100 });
      return btn;
    };
    nested(true);
    let f = await runCheck();
    expect(f).toEqual(
      expect.arrayContaining([expect.stringMatching(/^textClip: <button "a very long label"> is cut off by overflow/)]),
    );
    // a fitting label: the box is as wide as its content — not a clip
    nested(false);
    f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textClip/)]));
  });

  it("textClip: a nested textClip offender inside an already-reported clipped container is not listed separately (outermost only)", async () => {
    // the container clips; the nested button clips its own span — both trip
    // the new nested-ownText gate, and the contains-dedupe keeps one line
    document.body.innerHTML = "<div style='overflow:hidden'></div>";
    const outer = document.querySelector("div")!;
    const btn = document.createElement("button");
    btn.style.overflow = "hidden";
    const span = document.createElement("span");
    span.textContent = "inner label";
    btn.appendChild(span);
    outer.appendChild(btn);
    box(outer, 0, 0, 100, 60);
    box(btn, 10, 10, 80, 40);
    for (const el of [outer, btn]) {
      Object.defineProperty(el, "scrollWidth", { configurable: true, value: 200 });
      Object.defineProperty(el, "clientWidth", { configurable: true, value: 100 });
    }
    const f = (await runCheck()).filter((s) => s.startsWith("textClip"));
    expect(f).toHaveLength(1);
    expect(f[0]).toContain("<div"); // the outermost offender describes, the nested button doesn't
  });

  it("textClip: a clipping box whose text is inside designated horizontal scrollers still reports — the scroller-vs-clip distinction is settled per page, not by box geometry", async () => {
    // The import-wizard phone shape: a card (overflow:clip) holds the step
    // strip scroller (overflow-x:auto, marked data-scroll-region, wider than
    // its own box). A real browser's geometry is ambiguous here — the
    // scroller's BORDER box can sit inside the card while the card still
    // reports the scroller's overflow as its scrollWidth — so `textClip`
    // reports it and the scroller-vs-clip call is settled per page (a
    // check:viewports page gap), not by a box-level exemption. This pins the
    // report so a later accidental exemption or a marker-based skip would
    // read as a regression here.
    document.body.innerHTML = "<div class='card'></div>";
    const card = document.querySelector("div")!;
    card.style.overflow = "clip";
    const sc = document.createElement("div");
    sc.style.overflowX = "auto";
    sc.setAttribute("data-scroll-region", "");
    const label = document.createElement("span");
    label.textContent = "1 Upload 2 Map columns (upcoming)";
    sc.appendChild(label);
    card.appendChild(sc);
    box(card, 0, 0, 356, 120);
    Object.defineProperty(card, "scrollWidth", { configurable: true, value: 487 });
    Object.defineProperty(card, "clientWidth", { configurable: true, value: 356 });
    const f = await runCheck();
    expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^textClip: <div .*cut off by overflow/)]));
  });

  it("headingLines: an h1 taller than 2 line-heights fails; a 2-line h1 passes", async () => {
    const heading = (lines: number) => {
      document.body.innerHTML = "<h1 style='line-height:40px'>Title</h1>";
      const h = document.querySelector("h1")!;
      box(h, 0, 0, 300, lines * 40);
      return h;
    };
    heading(1);
    let f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^headingLines/)])); // one line
    heading(2);
    f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^headingLines/)])); // exactly two
    heading(3);
    f = await runCheck();
    expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^headingLines:.*more than 2 lines/)]));
  });

  it("headingLines: a document-column page's h1 is not exempt — a 3-line title there fails too", async () => {
    document.body.innerHTML = "<div class='db-content-column'><div class='db-document-column'><h1 style='line-height:40px'>A long document title that wraps</h1></div></div>";
    box(document.querySelector("h1")!, 0, 0, 300, 120); // 3 lines
    expect(await runCheck()).toEqual(expect.arrayContaining([expect.stringMatching(/^headingLines/)]));
  });

  it("titleSqueeze: a page title squeezed below its longest word fails — the check measures each word's natural width, because a squeezed title re-wraps and the box alone can't see the mid-token break", async () => {
    // The check guards exactly HeadingRow's marker: the title/badges row that
    // both ladder rungs stamp. (HeadingRow shape: the heading is a direct
    // child of the marked row.)
    const heading = (tag: "h1" | "h2", marked = true) => {
      const slot = marked ? ` data-slot="heading-row-title"` : "";
      document.body.innerHTML = `<div${slot}><${tag}>SO-2026-00053</${tag}></div>`;
      const h = document.querySelector(tag)!;
      box(h, 0, 0, 120, 44); // a 120px box
      return h;
    };
    // desktop, h1 rung: the title's single 150px word no longer fits the
    // 120px box, so the browser breaks it mid-token
    const restore1 = stubWordWidths({ "SO-2026-00053": 150 });
    try {
      heading("h1");
      expect(await runCheck()).toEqual(expect.arrayContaining([expect.stringMatching(/^titleSqueeze: <h1.*wraps mid-token/)]));
      // the NestedPageHeading h2 rung is guarded by the same one check — the
      // marker, not the heading's class — so a scale change cannot silently
      // drop the nested rung's coverage
      heading("h2");
      expect(await runCheck()).toEqual(expect.arrayContaining([expect.stringMatching(/^titleSqueeze: <h2.*wraps mid-token/)]));
      // a heading WITHOUT the marker (a SectionHeading, a detail-panel
      // title, any hand-rolled row) is not a heading-row rung: no finding
      heading("h1", false);
      expect(await runCheck()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^titleSqueeze/)]));
      heading("h1");
    } finally {
      restore1();
    }
    // a word that fits the box is not squeezed
    const restore2 = stubWordWidths({ "SO-2026-00053": 110 });
    try {
      expect(await runCheck()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^titleSqueeze/)]));
    } finally {
      restore2();
    }
  });

  it("titleSqueeze: a phone row stacks — the title has the full width, so a squeezed box there is not a squeeze", async () => {
    document.body.innerHTML = '<div data-slot="heading-row-title"><h1>SO-2026-00053</h1></div>';
    box(document.querySelector("h1")!, 0, 0, 120, 44);
    const restore = stubWordWidths({ "SO-2026-00053": 150 });
    try {
      const { failures } = await checkPageInvariants(
        { evaluate: async (fn, a) => ((fn as (a: unknown) => unknown)(a)) as never },
        devices.phone,
      );
      expect(failures).not.toEqual(expect.arrayContaining([expect.stringMatching(/^titleSqueeze/)]));
    } finally {
      restore();
    }
  });

  it("duplicateFact: one money token three times fails naming the token; twice and distinct tokens pass", async () => {
    const fixture = (tokens: string[]) => {
      document.body.innerHTML = `<main>${tokens.map((t) => `<p>${t}</p>`).join("")}</main>`;
      // jsdom has no layout: stub a distinct stacked box per paragraph so the
      // check's `visible` gate passes and the textOverlap pairing sees no overlap.
      document.querySelectorAll("main p").forEach((p, i) => box(p, 0, i * 24, 120, 20));
    };
    fixture(["1.234,56 €", "1.234,56 €", "1.234,56 €", "19,00 €"]);
    let f = await runCheck();
    expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^duplicateFact: "1\.234,56 €" rendered 3 times in main/)]));
    // the same token twice passes (label + total row share one fact)
    fixture(["1.234,56 €", "1.234,56 €"]);
    f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^duplicateFact/)]));
    // a distinct token each time passes
    fixture(["1.234,56 €", "2.345,67 €", "3.456,78 €"]);
    f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^duplicateFact/)]));
  });

  it("duplicateFact: a nested label/value figure is counted once per surface, so twice nested passes and thrice fails", async () => {
    // the common label/value shape: the figure sits in a <strong> value inside
    // a <p> that carries its own label text — each surface is one rendered
    // figure, so the wrapper must not count it a second time.
    const nestedFixture = (n: number, label: (i: number) => string) => {
      document.body.innerHTML = "<main></main>";
      const m = document.querySelector("main")!;
      for (let i = 0; i < n; i++) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = "1.234,56 €";
        p.append(label(i) + " ", strong);
        m.appendChild(p);
        box(p, 0, i * 40, 160, 20); // stacked, no overlap
        box(strong, 40, i * 40, 120, 20);
      }
    };
    nestedFixture(2, (i) => `Line ${i}`);
    let f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^duplicateFact/)])); // two surfaces, one figure each
    nestedFixture(3, (i) => `Line ${i}`);
    f = await runCheck();
    expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^duplicateFact: "1\.234,56 €" rendered 3 times in main/)]));
  });

  it("duplicateFact: both locale forms, the NBSP before the symbol, and the percent form are counted", async () => {
    const fixture = (tokens: string[]) => {
      document.body.innerHTML = `<main>${tokens.map((t) => `<p>${t}</p>`).join("")}</main>`;
      document.querySelectorAll("main p").forEach((p, i) => box(p, 0, i * 24, 120, 20));
    };
    // the en-US form (comma thousands, period decimal) is matched, not only the de-DE one
    fixture(["1,234.50 €", "1,234.50 €", "1,234.50 €"]);
    let f = await runCheck();
    expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^duplicateFact: "1,234\.50 €" rendered 3 times in main/)]));
    // an NBSP (U+00A0, what a real `Intl` de-DE emits between figure and symbol)
    // normalises to one space: same token as the space-variant, still counted
    fixture(["1.234,56\u00A0€", "1.234,56\u00A0€", "1.234,56 €"]);
    f = await runCheck();
    expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^duplicateFact: "1\.234,56 €" rendered 3 times in main/)]));
    // a percent fact repeated three times fails too
    fixture(["47,3 %", "47,3 %", "47,3 %"]);
    f = await runCheck();
    expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^duplicateFact: "47,3 %" rendered 3 times in main/)]));
  });

  it("duplicateFact: without a <main> the body is scanned; without a repeated token it passes", async () => {
    document.body.innerHTML = '<p>1.234,56 €</p><p>1.234,56 €</p><p>1.234,56 €</p>';
    document.querySelectorAll("p").forEach((p, i) => box(p, 0, i * 24, 120, 20));
    let f = await runCheck();
    expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^duplicateFact: "1\.234,56 €" rendered 3 times in main/)]));
    document.body.innerHTML = "<main><p>1.234,56 €</p></main>";
    box(document.querySelector("p")!, 0, 0, 120, 20);
    f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^duplicateFact/)]));
  });

  it("zeroClipped: a px clip-path inset is measured against the element's box, never read as a percent", async () => {
    const clippedText = (clip: string, w: number, h: number) => {
      document.body.innerHTML = "<p></p>";
      const p = document.querySelector("p")!;
      p.textContent = "clipped";
      p.setAttribute("style", `position:absolute;overflow:hidden;${clip}`);
      box(p, 0, 0, w, h);
      Object.defineProperty(p, "scrollWidth", { configurable: true, value: w * 2 });
      Object.defineProperty(p, "clientWidth", { configurable: true, value: w });
    };
    // 60px of a 300x200 box per side leaves a visible middle: the element is still checked
    clippedText("clip-path:inset(60px)", 300, 200);
    expect(await runCheck()).toEqual(expect.arrayContaining([expect.stringMatching(/^textClip/)]));
    // 50px top + bottom of a 200px-tall box leaves 100px visible: still checked
    clippedText("clip-path:inset(50px 0 50px 0)", 300, 200);
    expect(await runCheck()).toEqual(expect.arrayContaining([expect.stringMatching(/^textClip/)]));
    // 120px bottom of a 200px-tall box leaves 80px visible: still checked
    clippedText("clip-path:inset(0 0 120px 0)", 300, 200);
    expect(await runCheck()).toEqual(expect.arrayContaining([expect.stringMatching(/^textClip/)]));
    // 50px top + bottom of a 100px-tall box collapses it: hidden, not checked
    clippedText("clip-path:inset(50px 0)", 300, 100);
    expect(await runCheck()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textClip/)]));
    // 100px top + bottom of a 200px-tall box collapses it: hidden, not checked
    clippedText("clip-path:inset(100px 0)", 300, 200);
    expect(await runCheck()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textClip/)]));
  });

  it("textClip: a zero-clipped (sr-only) label — clip-path: inset(50%) or clip: rect(0,0,0,0) — is not cut-off text", async () => {
    const srOnly = (clip: string) => {
      document.body.innerHTML = "<p></p>";
      const p = document.querySelector("p")!;
      p.textContent = "sr only label";
      p.setAttribute("style", `position:absolute;width:1px;height:1px;overflow:hidden;${clip}`);
      // 1x1 visible rect (jsdom reports the zero-clip box as 0, so give it explicit size) so
      // the width gate passes and the clip gate is what must exclude it.
      box(p, 0, 0, 1, 1);
      Object.defineProperty(p, "scrollWidth", { configurable: true, value: 100 });
      Object.defineProperty(p, "clientWidth", { configurable: true, value: 1 });
      return p;
    };
    // modern utility: clip-path inset(50%)
    srOnly("clip-path:inset(50%)");
    expect(await runCheck()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textClip/)]));
    // legacy utility: clip rect(0px, 0px, 0px, 0px) — normalized unit form
    srOnly("clip:rect(0px, 0px, 0px, 0px)");
    expect(await runCheck()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textClip/)]));
    // legacy utility: bare-zero clip — jsdom re-serializes `rect(0,0,0,0)` to
    // `rect(0px, 0px, 0px, 0px)` in the COMPUTED style, so the raw form a
    // non-normalizing engine would return is served directly. Without the
    // stub this case runs the same input as the `0px` case above and would
    // even pass against the old unit-requiring pattern — the parse under test
    // is that a unit after the 0 is not required.
    const srOnlyRaw = async (clip: string, raw: string): Promise<string[]> => {
      const p = srOnly(clip);
      const real = window.getComputedStyle;
      let clipHits = 0;
      window.getComputedStyle = ((el: Element, pseudo?: string | null) => {
        const s = real(el, pseudo);
        if (el !== p) return s;
        return new Proxy(s, {
          get: (o, k) => {
            if (k === "clip") { clipHits++; return raw; }
            return (o as unknown as Record<PropertyKey, unknown>)[k];
          },
        });
      }) as typeof real;
      try {
        // Await INSIDE the try: the real getComputedStyle is only restored once
        // the measurement has completed, so the raw form is served no matter
        // where an await lands in the check's own path.
        const failures = await runCheck();
        // The raw stub must have been actually read, or this case runs the
        // normalized 0px input — a unit-requiring parse would pass both.
        expect(clipHits).toBeGreaterThan(0);
        return failures;
      } finally {
        window.getComputedStyle = real;
      }
    };
    expect(await srOnlyRaw("clip:rect(0,0,0,0)", "rect(0,0,0,0)")).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^textClip/)]),
    );
    expect(await srOnlyRaw("clip:rect(0, 0, 0, 0)", "rect(0, 0, 0, 0)")).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^textClip/)]),
    );
    // and a real clipped text (no zero-clip, no ellipsis) still fails the check
    document.body.innerHTML = "<p></p>";
    const p = document.querySelector("p")!;
    p.textContent = "clipped";
    p.setAttribute("style", "position:absolute;overflow:hidden");
    box(p, 0, 0, 100, 20);
    Object.defineProperty(p, "scrollWidth", { configurable: true, value: 200 });
    Object.defineProperty(p, "clientWidth", { configurable: true, value: 100 });
    expect(await runCheck()).toEqual(expect.arrayContaining([expect.stringMatching(/^textClip/)]));
  });

  it("textOverlap: two overlapping text boxes fail; disjoint, contained, and overlay-passed boxes don't", async () => {
    const twoBox = (overlap: boolean) => {
      document.body.innerHTML = "<div class='db-content-column'></div>";
      const col = document.querySelector(".db-content-column")!;
      const a = document.createElement("span"); a.textContent = "A";
      const b = document.createElement("span"); b.textContent = "B";
      col.append(a, b);
      box(a, 0, 0, 100, 40);
      box(b, overlap ? 50 : 101, 0, 100, 40);
      return { a, b };
    };
    twoBox(true);
    let f = await runCheck();
    expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap:.*overlap/)]));
    twoBox(false);
    f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap/)]));

    // a box inside its own container is containment, not overlap
    document.body.innerHTML = "<div class='db-content-column'></div>";
    const inner = document.createElement("div");
    const outer = document.createElement("div");
    outer.textContent = "outer";
    outer.appendChild(inner);
    inner.textContent = "inner";
    document.querySelector(".db-content-column")!.appendChild(outer);
    box(outer, 0, 0, 200, 100);
    box(inner, 10, 10, 80, 40);
    f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap/)]));
  });

  it("textOverlap: a wrapping block holder's LINE frag (Range path) keeps a neighbour in the line gap clear, while a glyph-level collision still fails", async () => {
    // The check reads the painted lines per text node (Range geometry), NOT
    // the element's getClientRects. A real browser reports a BLOCK element's
    // getClientRects as its single border box (0..400 x 0..100 here) — whose
    // multi-line bounds intersect any neighbour inside them even when the
    // glyph lines do not touch. So the fixture stubs BOTH sides: the element
    // `getClientRects` returns the single border box (correct for a block
    // element), and `Range.prototype.getClientRects` returns the per-line
    // painted rects keyed to the text node's parent. Case (a) is the
    // discriminator: with per-line rects the gap-band neighbour is clear,
    // while pre-change code (element border box) would report it — a test that
    // only stubbed the element side would pass without the Range change.
    const setLines = (el: unknown, lines: number[][]) => {
      (el as { __rangeLines?: number[][] }).__rangeLines = lines;
    };
    const setBox = (el: unknown, r: number[]) => {
      (el as { __box?: number[] }).__box = r;
    };
    const fixture = (nbTop: number) => {
      document.body.innerHTML = "<div class='db-content-column'><p></p><span></span></div>";
      const p = document.querySelector("p")!;
      const nb = document.querySelector("span")!;
      p.textContent = "first line second line";
      nb.textContent = "neighbour";
      box(p, 0, 0, 400, 100);
      setBox(p, [0, 0, 400, 100]); // element border box (pre-change fragments source)
      setLines(p, [
        [0, 0, 400, 40], // painted line 1: y 0..40
        [0, 60, 400, 40], // painted line 2: y 60..100
      ]);
      box(nb, 0, nbTop, 120, 18);
      setBox(nb, [0, nbTop, 120, 18]); // inline span: element box = its painted line (no per-line Range)
    };
    const restore = stubRangeRects();
    try {
      fixture(40); // the line-gap band (y 40..58)
      let f = await runCheck();
      expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap/)])); // per-line rects: gap is clear
      fixture(62); // over line 2's band (y 62..80)
      f = await runCheck();
      expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap:.*overlap/)])); // glyph collision
    } finally {
      restore();
    }
  });

  it("textOverlap: the per-line geometry holds for INLINE holders too (Range line boxes, not the element box)", async () => {
    // Two spans whose element boxes MEET wholesale (0..400 x 0..100 each) so
    // boxesMeet passes; the discriminator is whether per-line painted rects
    // (Range path) are used instead of the element boxes. Line 1 only at
    // y 0..40 vs y 60..100 → clear; then line 2 at y 30..70 over line 1 →
    // collision. Pre-change code (element boxes) would report overlap in both
    // cases; per-line rects report only the second.
    const setBox = (el: unknown, r: number[]) => {
      (el as { __box?: number[] }).__box = r;
    };
    const setLines = (el: unknown, lines: number[][]) => {
      (el as { __rangeLines?: number[][] }).__rangeLines = lines;
    };
    document.body.innerHTML = "<div class='db-content-column'><span></span><span></span></div>";
    const a = document.querySelectorAll("span")[0]!;
    const b = document.querySelectorAll("span")[1]!;
    a.textContent = "a";
    b.textContent = "b";
    box(a, 0, 0, 400, 100);
    box(b, 0, 0, 400, 100); // element boxes meet wholesale (400x100 ∩ 400x100)
    setBox(a, [0, 0, 400, 100]);
    setBox(b, [0, 0, 400, 100]);
    setLines(a, [[0, 0, 400, 40]]); // a line 1: y 0..40
    const restore = stubRangeRects();
    try {
      setLines(b, [[0, 60, 400, 40]]); // b line 1: y 60..100 → clear
      let f = await runCheck();
      expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap/)]));
      setLines(b, [[0, 30, 400, 40]]); // b line 2: y 30..70 over a line 1 → collision
      f = await runCheck();
      expect(f).toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap:.*overlap/)]));
    } finally {
      restore();
    }
  });

  it("textOverlap: text in a position:fixed overlay (e.g. a BottomNav) over page text is exempt", async () => {
    // (a) the fixed element is the ANCESTOR (a BottomNav wrapper): the text lives
    // in a child. body 0..400y and nav 380..424y genuinely intersect — so a
    // deleted exemption would be caught here (the rects must actually overlap).
    document.body.innerHTML = "<div class='db-content-column'><p>body</p></div><div style='position:fixed'><p>nav</p></div>";
    const body = document.querySelector(".db-content-column p")!;
    const nav = document.querySelector("div[style] p")!;
    box(body, 0, 0, 390, 400);
    box(nav, 0, 380, 390, 44); // 20px overlap over the bottom of the body text
    expect(await runCheck()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap/)]));

    // (b) the fixed element ITSELF carries the text (a fixed Feedback button):
    // its own `position` must exempt it, not just a fixed ancestor. body 0..390x
    // and fb 300..580 x 300..344y intersect (90 x 44px) — a real overlap that the
    // exemption must explain.
    document.body.innerHTML = "<div class='db-content-column'><p>body</p></div><div id='fb' style='position:fixed'>Feedback</div>";
    const body2 = document.querySelector(".db-content-column p")!;
    const fb = document.getElementById("fb")!;
    box(body2, 0, 0, 390, 400);
    box(fb, 300, 300, 280, 44); // overlap at x 300..390, y 300..344
    expect(await runCheck()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap/)]));
  });

  it("textOverlap: two overlapping text boxes INSIDE one sticky bar are a real collision, not an exempted overlay", async () => {
    // The overlay exemption is layered: a box collides only with text in its OWN
    // overlay layer. Two spans in the same position:sticky parent share one layer,
    // so their overlap is a real bug — not intended chrome. This is the case the
    // per-element overlay drop (pre-layering) missed.
    document.body.innerHTML = "<div class='db-content-column'><p>page</p></div><div style='position:sticky'><span id='a'>Label</span><span id='b'>Value</span></div>";
    const pageEl = document.querySelector(".db-content-column p")!;
    const a = document.getElementById("a")!;
    const b = document.getElementById("b")!;
    box(pageEl, 0, 0, 390, 200);
    box(a, 0, 800, 120, 44); // sits inside the sticky bar
    box(b, 60, 800, 120, 44); // overlaps a at x 60..120 (60px wide, 44px tall)
    expect(await runCheck()).toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap:.*overlap/)]));
    // the same two spans NOT overlapping do not report
    box(a, 0, 800, 120, 44);
    box(b, 140, 800, 120, 44);
    expect(await runCheck()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap/)]));
  });

  it("textOverlap: a scroller both boxes share must not hide overlaps below its visible box", async () => {
    // The page scrolls inside its overflow:auto container (AppShell `main`):
    // two boxes inside it scroll TOGETHER, so an overlap below the scroller's
    // visible box is still a real collision. A scroller that holds only one
    // side still cuts (covered by the "scrolled-off" test — the span overruns
    // its own cell into the sibling outside the cell).
    document.body.innerHTML =
      "<div class='db-content-column'><div id='pane' style='overflow:auto'><span id='a'>A</span><span id='b'>B</span></div></div>";
    const pane = document.getElementById("pane")!;
    const a = document.getElementById("a")!;
    const b = document.getElementById("b")!;
    box(pane, 0, 0, 390, 500); // the visible scroller box: top 500px
    box(a, 0, 900, 120, 44); // below the fold, inside the scroller's content
    box(b, 60, 900, 120, 44); // overlaps a at x 60..120, y 900..944
    expect(await runCheck()).toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap:.*overlap/)]));
  });

  it("textOverlap: text a clipping ancestor hides is not painted, so it never overlaps a neighbour", async () => {
    // getClientRects returns UNCLIPPED geometry: the truncating link's fragment
    // runs its full natural width (..300) past its overflow:hidden cell (..200)
    // into the badge's band (210..310). The cell paints nothing there, so the
    // clipped fragment is empty and no overlap exists.
    const cellFixture = (clipStyle: string) => {
      document.body.innerHTML =
        "<div class='db-content-column'><div id='cell' style='" + clipStyle + "'><span id='long'>A very long customer name</span></div><span id='badge'>Sh</span></div>";
      const cell = document.getElementById("cell")!;
      const long = document.getElementById("long")!;
      const badge = document.getElementById("badge")!;
      box(cell, 0, 0, 200, 44); // paints 0..200
      box(long, 0, 0, 300, 44); // unclipped geometry overruns the cell
      box(badge, 210, 0, 100, 44); // 210..310: under the unclipped long span, never under the painted part
      return { long, badge };
    };
    cellFixture("overflow:hidden");
    expect(await runCheck()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap/)]));
    // a scroller clips just like a hidden box (the donor table pattern)
    cellFixture("overflow:auto");
    expect(await runCheck()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap/)]));
    // but text PAINTED inside the visible band still collides: move the badge so
    // its band (150..250) intersects the long span's painted part (0..200)
    document.body.innerHTML =
      "<div class='db-content-column'><div id='cell' style='overflow:hidden'><span id='long'>A very long customer name</span></div><span id='badge'>Sh</span></div>";
    const cell = document.getElementById("cell")!;
    const long = document.getElementById("long")!;
    const badge = document.getElementById("badge")!;
    box(cell, 0, 0, 200, 44);
    box(long, 0, 0, 300, 44);
    box(badge, 150, 0, 100, 44);
    expect(await runCheck()).toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap:.*overlap/)]));

    // a span FULLY clipped — not a sliver (0..300 in 0..200) but wholly past the
    // clip edge (210..310 in 0..200) — has NO painted fragment, so an empty
    // fragment list must not fall back to the unclipped box. A neighbour at the
    // span's natural band (210..310) does NOT overlap.
    document.body.innerHTML =
      "<div class='db-content-column'><div id='cell2' style='overflow:hidden'><span id='gone'>Off screen</span></div><span id='rail'>Rail</span></div>";
    const cell2 = document.getElementById("cell2")!;
    const gone = document.getElementById("gone")!;
    const rail = document.getElementById("rail")!;
    box(cell2, 0, 0, 200, 44); // paints 0..200
    box(gone, 210, 0, 100, 44); // natural band 210..310, entirely past the clip edge
    box(rail, 210, 0, 100, 44); // under the gone span's unclipped band, never the painted one
    expect(await runCheck()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textOverlap/)]));
  });

  it("textClip: past five offenders only five lines; a clipped element inside another is not listed separately", async () => {
    document.body.innerHTML = "<div class='db-content-column'></div>";
    const col = document.querySelector(".db-content-column")!;
    // seven disjoint clipped boxes (no overlap, so textOverlap stays idle)
    for (let i = 0; i < 7; i++) {
      const p = document.createElement("p");
      p.textContent = `clip ${i}`;
      p.style.overflow = "hidden";
      box(p, 0, i * 30, 100, 20);
      Object.defineProperty(p, "scrollWidth", { configurable: true, value: 200 });
      Object.defineProperty(p, "clientWidth", { configurable: true, value: 100 });
      col.appendChild(p);
    }
    let f = (await runCheck()).filter((s) => s.startsWith("textClip"));
    expect(f).toHaveLength(5);
    // a clipped child inside a clipped parent: the outermost offender only
    document.body.innerHTML = "<div class='db-content-column'></div>";
    const col2 = document.querySelector(".db-content-column")!;
    const outer = document.createElement("div");
    outer.style.overflow = "hidden";
    outer.appendChild(document.createTextNode("outer text "));
    const inner = document.createElement("span");
    inner.textContent = "inner";
    inner.style.overflow = "hidden";
    outer.appendChild(inner);
    col2.appendChild(outer);
    box(outer, 0, 0, 100, 20);
    box(inner, 20, 5, 60, 10);
    for (const el of [outer, inner]) {
      Object.defineProperty(el, "scrollWidth", { configurable: true, value: 200 });
      Object.defineProperty(el, "clientWidth", { configurable: true, value: 100 });
    }
    f = (await runCheck()).filter((s) => s.startsWith("textClip"));
    expect(f).toHaveLength(1);
    expect(f[0]).toContain("<div"); // the outermost offender describes, the nested span doesn't
  });

  it("textOverlap: past five overlapping pairs only five lines; each box in at most one reported pair; later checks still run", async () => {
    document.body.innerHTML = "<div class='db-content-column'></div>";
    const col = document.querySelector(".db-content-column")!;
    // seven disjoint overlapping pairs (spans in DOM order a0 b0 a1 b1 …)
    for (let i = 0; i < 7; i++) {
      for (const [label, x] of [["A" + i, 0], ["B" + i, 50]] as const) {
        const s = document.createElement("span");
        s.textContent = label;
        box(s, x, i * 60, 100, 40);
        col.appendChild(s);
      }
    }
    // one clipped paragraph BELOW all the pairs: the line proves the checks
    // AFTER the overlap scan still run (an early-return cap would drop it).
    const p = document.createElement("p");
    p.textContent = "clip";
    p.style.overflow = "hidden";
    box(p, 0, 500, 100, 20);
    Object.defineProperty(p, "scrollWidth", { configurable: true, value: 200 });
    Object.defineProperty(p, "clientWidth", { configurable: true, value: 100 });
    col.appendChild(p);
    const f = await runCheck();
    const overlaps = f.filter((s) => s.startsWith("textOverlap"));
    expect(overlaps).toHaveLength(5);
    // no element appears in more than one reported pair
    const labels = overlaps.flatMap((line) => [...line.matchAll(/"([^"]+)"/g)].map((m) => m[1]));
    expect(new Set(labels).size).toBe(labels.length);
    // and the scan's cap ends at the pairs named by the first boxes in the
    // document (scan order, not arbitrary)
    expect(overlaps[0]).toContain('"A0"');
    expect(overlaps[0]).toContain('"B0"');
    expect(f.filter((s) => s.startsWith("textClip"))).toHaveLength(1); // post-scan checks ran
  });

  it("every per-element check caps at five outermost offenders (headingLines, tableColumn, scrollCue)", async () => {
    // headingLines: seven 3-line h1s → five lines
    document.body.innerHTML = "<div class='db-content-column'></div>";
    const col = document.querySelector(".db-content-column")!;
    for (let i = 0; i < 7; i++) {
      const h = document.createElement("h1");
      h.textContent = `Title ${i}`;
      h.style.lineHeight = "40px";
      box(h, 0, i * 140, 300, 120);
      col.appendChild(h);
    }
    let f = (await runCheck()).filter((s) => s.startsWith("headingLines"));
    expect(f).toHaveLength(5);
    // tableColumn: seven tables whose first text cell is narrow → five lines
    document.body.innerHTML = "<div class='db-content-column'></div>";
    const col2 = document.querySelector(".db-content-column")!;
    for (let i = 0; i < 7; i++) {
      const t = document.createElement("table");
      // distinct label text: identical offenders would collapse in the final
      // `[...new Set(problems)]` message dedupe
      t.innerHTML = `<tbody><tr><td>Label ${i}</td><td>x</td></tr></tbody>`;
      col2.appendChild(t);
      box(t, 0, i * 50, 300, 40);
      const c = t.querySelector("td")!;
      c.style.fontSize = "16px"; // jsdom does not compute the initial font size
      box(c, 0, i * 50, 44, 20); // 44px < 6ch of 16px (57.6px)
    }
    f = (await runCheck()).filter((s) => s.startsWith("tableColumn"));
    expect(f).toHaveLength(5);
    // scrollCue: six uncued scrollers → five lines (nestedOverflow sees the
    // same six and caps itself too — the audit cap is per code)
    document.body.innerHTML = "<div class='db-content-column'></div>";
    const col3 = document.querySelector(".db-content-column")!;
    for (let i = 0; i < 6; i++) {
      const s = scroller();
      s.textContent = `sc ${i}`; // distinct: identical lines would Set-dedupe
      box(s, 0, i * 60, 100, 50);
      col3.appendChild(s);
    }
    f = (await runCheck()).filter((s) => s.startsWith("scrollCue"));
    expect(f).toHaveLength(5);
    // a scroller nested inside an already-reported one is not listed separately
    document.body.innerHTML = "<div class='db-content-column'></div>";
    const outer = scroller();
    const inner = scroller();
    outer.appendChild(inner);
    document.querySelector(".db-content-column")!.appendChild(outer);
    box(outer, 0, 0, 100, 50);
    box(inner, 5, 5, 90, 40);
    f = (await runCheck()).filter((s) => s.startsWith("scrollCue"));
    expect(f).toHaveLength(1); // the outermost offender only
  });

  it("knownGaps: each new code downgrades to a warning naming its ticket", async () => {
    // The downgrade slicing is code-independent (`p.slice(0, p.indexOf(":"))`), but
    // this proves each NEW code's key is a valid `InvariantCode` that round-trips to
    // the same prefix the real `measure` emits — a typo'd key would stay a failure.
    const stub = (problems: string[]) => ({ evaluate: async () => problems as never });
    for (const [code, full] of [
      ["nestedOverflow", "nestedOverflow: <div> scrolls sideways (200px in a 100px box, no data-scroll-region)"],
      ["textClip", "textClip: <p> is cut off by overflow (text 200px > box 100px)"],
      ["headingLines", "headingLines: <h1> wraps onto more than 2 lines (125px of text, 80px is two)"],
      ["titleSqueeze", 'titleSqueeze: <h1 "SO-2026-00053"> squeezed to 162px, longest word 224px ("SO-2026-00053") — wraps mid-token'],
      ["textOverlap", "textOverlap: <p> and <span> overlap"],
      ["duplicateFact", 'duplicateFact: "1.234,56 €" rendered 3 times in main'],
    ] as const) {
      const warnings = await assertPageInvariants(stub([full]) as never, devices.laptop14, {
        knownGaps: { [code]: "the-ticket" } as never,
      });
      expect(warnings).toEqual([`known gap (the-ticket): ${full}`]);
      // no downgrade → it stays a failure
      await expect(assertPageInvariants(stub([full]) as never, devices.laptop14, {} as never)).rejects.toThrow(
        new RegExp(`^page invariants failed:\\s*- ${code}: .*$`, "s"),
      );
    }
  });
});
