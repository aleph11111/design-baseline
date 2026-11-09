import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { TransactionDocumentDemo } from "../../../examples/transaction-document-demo";
import { TransactionDocumentShell, type TransactionDocumentShellProps } from "./TransactionDocumentShell";
import { fitColumns, parseFigure, type LedgerColumn } from "./ledger";

afterEach(cleanup);

const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`) as HTMLElement;
const isPrimary = (el: Element) => /\bbg-primary\b/.test(el.className);
// header actions: every button outside the surface body, the id's copy button and the demo control
const headerButtons = () =>
  screen.getAllByRole("button").filter((b) => !slot("td-body").contains(b) && !slot("td-id").contains(b));
const variant = (name: string) => fireEvent.click(screen.getByRole("radio", { name }));

describe("TransactionDocumentShell — the demo", () => {
  it("places identity, nextStep, ledger, facts and history", () => {
    render(<TransactionDocumentDemo />);
    expect(slot("td-id").textContent).toContain("SO-2026-0412");
    expect(slot("td-chain")).toBeTruthy();
    for (const s of ["td-next-step", "td-ledger", "td-facts", "td-history"]) expect(slot(s)).toBeTruthy();
    // history starts collapsed
    expect(screen.getByRole("button", { name: "History" }).getAttribute("aria-expanded")).toBe("false");
  });

  it("renders the one primary in nextStep; the 9-action header shows 0 primary, 2 secondary and ⋯", () => {
    render(<TransactionDocumentDemo />);
    const all = screen.getAllByRole("button").concat(screen.queryAllByRole("link"));
    const primaries = all.filter(isPrimary);
    expect(primaries).toHaveLength(1);
    expect(slot("td-next-step").contains(primaries[0]!)).toBe(true);
    expect(primaries[0]!.textContent).toBe("Mark as shipped");
    const inHeader = headerButtons();
    expect(inHeader.filter(isPrimary)).toHaveLength(0);
    expect(inHeader.map((b) => b.textContent || b.getAttribute("aria-label"))).toEqual(
      expect.arrayContaining(["Print packing slip", "Email customer"]),
    );
    expect(screen.queryByRole("button", { name: "Download PDF" })).toBeNull(); // spilled into ⋯
  });

  it("declares ledger columns per document type; the sales order is locked, the offer editable", () => {
    render(<TransactionDocumentDemo />);
    const heads = () => within(slot("td-ledger")).getAllByRole("columnheader").map((h) => h.textContent);
    expect(heads()).toEqual(["Item", "Charged", "Cost", "Profit", "Margin"]);
    expect(within(slot("td-ledger")).queryAllByRole("textbox")).toHaveLength(0);
    const lock = within(slot("td-ledger")).getByText(/Lines come from BrickLink/);
    expect(within(lock.closest("[data-slot=td-lock]") as HTMLElement).getByRole("link", { name: "Open in BrickLink" })).toBeTruthy();

    variant("Offer");
    expect(heads()).toEqual(["Item", "Their ask", "Market", "Max", "Our offer", "Profit"]);
    const ours = screen.getByRole("textbox", { name: "Our offer Ninjago City" }) as HTMLInputElement;
    expect(ours.value).toBe("195,00");
    fireEvent.change(ours, { target: { value: "200" } });
    fireEvent.blur(ours);
    // profit follows: market 289 − 200
    expect(within(ours.closest("tr")!).getByText("89,00 €")).toBeTruthy();
  });

  it("purchase order renders its own columns and side effects", () => {
    render(<TransactionDocumentDemo />);
    variant("Purchase order");
    expect(within(slot("td-ledger")).getAllByRole("columnheader").map((h) => h.textContent)).toEqual([
      "Item",
      "Cost",
      "Expected market value",
      "Expected margin",
    ]);
    expect(slot("td-side-effects").querySelectorAll("[data-state=failed]")).toHaveLength(1);
  });
});

const base: TransactionDocumentShellProps = {
  title: "Doc",
  identity: { id: "X-1", status: "Open" },
  nextStep: { title: "Do it", primary: { label: "Go", onSelect: () => {} } },
  ledger: { columns: [{ key: "a", label: "A", kind: "currency", priority: 1 }], rows: [] },
  facts: [],
};

describe("TransactionDocumentShell — rules", () => {
  it("demotes a header primary an untyped caller passes", () => {
    const actions = { primary: { label: "Sneaky", onSelect: () => {} } } as TransactionDocumentShellProps["actions"];
    render(<TransactionDocumentShell {...base} actions={actions} />);
    expect(isPrimary(screen.getByRole("button", { name: "Sneaky" }))).toBe(false);
  });

  it("a locked nextStep shows its reason and no primary", () => {
    const onSelect = vi.fn();
    render(<TransactionDocumentShell {...base} locks={{ nextStep: { reason: "Blocked by payment", wayOut: { label: "Fix", onSelect } } }} />);
    expect(screen.queryByRole("button", { name: "Go" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Fix" }));
    expect(onSelect).toHaveBeenCalled();
  });

  it("a fact lock replaces its Change link", () => {
    render(
      <TransactionDocumentShell
        {...base}
        facts={[
          { label: "Address", value: "Here", change: { label: "Change", href: "#" }, lock: { reason: "Label printed" } },
          { label: "Total", value: 12.5, kind: "currency" },
        ]}
      />,
    );
    expect(screen.queryByRole("link", { name: "Change" })).toBeNull();
    expect(screen.getByText("Label printed")).toBeTruthy();
    expect(screen.getByText("12,50 €")).toBeTruthy();
  });
});

describe("fitColumns", () => {
  const cols: LedgerColumn[] = [
    { key: "charged", label: "C", kind: "currency", priority: 1 },
    { key: "cost", label: "K", kind: "currency", priority: 2 },
    { key: "margin", label: "M", kind: "percent", priority: 3 },
  ];
  it("keeps every column inline when there is room", () => {
    expect(fitColumns(cols, 1000).overflow).toEqual([]);
  });
  it("moves lowest priority first, keeps declaration order, never empties the row", () => {
    expect(fitColumns(cols, 400).inline.map((c) => c.key)).toEqual(["charged", "cost"]);
    expect(fitColumns(cols, 300).overflow.map((c) => c.key)).toEqual(["cost", "margin"]);
    expect(fitColumns(cols, 0).inline.map((c) => c.key)).toEqual(["charged"]);
  });
});

describe("parseFigure", () => {
  it("reads locale input", () => {
    expect(parseFigure("1.234,5", "de-DE")).toBe(1234.5);
    expect(parseFigure("1,234.5", "en-US")).toBe(1234.5);
    expect(parseFigure("12 €", "de-DE")).toBe(12);
    expect(parseFigure("", "de-DE")).toBeNull();
    expect(parseFigure("abc", "de-DE")).toBeNaN();
  });
});
