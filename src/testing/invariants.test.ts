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

  it("headingLines: a document-column page's h1 (the document title, wraps in full by design) is exempt", async () => {
    document.body.innerHTML = "<div class='db-content-column'><div class='db-document-column'><h1 style='line-height:40px'>A long document title that wraps</h1></div></div>";
    const h = document.querySelector("h1")!;
    box(h, 0, 0, 300, 120); // 3 lines
    const f = await runCheck();
    expect(f).not.toEqual(expect.arrayContaining([expect.stringMatching(/^headingLines/)]));
    // the same h1 OUTSIDE a document column still fails
    document.body.innerHTML = "<div class='db-content-column'><h1 style='line-height:40px'>A long page title that wraps</h1></div>";
    const h2 = document.querySelector("h1")!;
    box(h2, 0, 0, 300, 120);
    expect(await runCheck()).toEqual(expect.arrayContaining([expect.stringMatching(/^headingLines/)]));
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
    // legacy utility: clip rect(0,0,0,0)
    srOnly("clip:rect(0,0,0,0)");
    expect(await runCheck()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^textClip/)]));
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

  it("knownGaps: each new code downgrades to a warning naming its ticket", async () => {
    // The downgrade slicing is code-independent (`p.slice(0, p.indexOf(":"))`), but
    // this proves each NEW code's key is a valid `InvariantCode` that round-trips to
    // the same prefix the real `measure` emits — a typo'd key would stay a failure.
    const stub = (problems: string[]) => ({ evaluate: async () => problems as never });
    for (const [code, full] of [
      ["nestedOverflow", "nestedOverflow: <div> scrolls sideways (200px in a 100px box, no data-scroll-region)"],
      ["textClip", "textClip: <p> is cut off by overflow (text 200px > box 100px)"],
      ["headingLines", "headingLines: <h1> wraps onto more than 2 lines (125px of text, 80px is two)"],
      ["textOverlap", "textOverlap: <p> and <span> overlap"],
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
