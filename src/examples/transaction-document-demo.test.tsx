import { afterEach, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { TransactionDocumentDemo } from "./transaction-document-demo";
import { checkPageInvariants } from "design-baseline/testing/invariants";
import { devices } from "design-baseline/testing/devices";

// jsdom lacks matchMedia; stub a desktop match (same stub the other demo tests set).
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;

afterEach(cleanup);

// jsdom has no layout: `measure` reads getBoundingClientRect everywhere. Give
// every element a distinct, stacked, non-zero box so the duplicateFact scan's
// `visible` gate passes on the demo's real rendered text (not a vacuous
// zero-box skip), while the stacked geometry keeps the layout checks idle.
const stackBoxes = () => {
  let i = 0;
  for (const el of document.body.querySelectorAll("*")) {
    el.getBoundingClientRect = () => {
      const top = i * 24;
      const r = { left: 0, top, width: 200, height: 20, right: 200, bottom: top + 20, x: 0, y: top, toJSON: () => r };
      return r as unknown as DOMRect;
    };
    i++;
  }
};
const dupFactFailures = async () => {
  const { failures } = await checkPageInvariants(
    { evaluate: async (fn, a) => ((fn as (a: unknown) => unknown)(a) as never) },
    devices.laptop14,
  );
  return failures.filter((f: string) => f.startsWith("duplicateFact"));
};

// The shipped transaction-document demo is the ticket's passing case: a fact
// restated in at most two surfaces (label + total row) must never fail
// duplicateFact. The demo renders the shell without a <main> (the gallery's
// AppShell supplies one), so the scan's body fallback is exercised here — the
// same path its dedicated invariants test covers.
it("the shipped transaction-document demo passes duplicateFact", async () => {
  render(<TransactionDocumentDemo />);
  stackBoxes();
  // Guard against a vacuous pass: the page must contain at least one figure
  // in the house form the scan's FACT patterns can actually count — a de-DE
  // money figure (digit group, comma decimal, NBSP + symbol) or percent
  // (digit group, NBSP + %). Any digits at all would not do: an order ID or
  // a date would let a render regression pass while the check counts nothing.
  const text = document.body.textContent;
  expect(
    /\b\d{1,3}(?:\.\d{3})*,\d{2}[\s\u00A0]€/.test(text) || /\b\d+(?:\.\d{3})*,\d+[\s\u00A0]%/.test(text),
  ).toBe(true);
  expect(await dupFactFailures()).toEqual([]);
});
