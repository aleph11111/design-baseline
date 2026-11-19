import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { TransactionDocumentDemo } from "../../../examples/transaction-document-demo";
import { TransactionDocumentShell, type TransactionDocumentShellProps } from "./TransactionDocumentShell";
import { fitColumns, parseFigure, type LedgerColumn } from "./ledger";

const mobile = vi.hoisted(() => ({ on: false }));
vi.mock("../../../hooks/use-mobile", () => ({ useIsMobile: () => mobile.on }));

afterEach(() => {
  cleanup();
  mobile.on = false;
});

const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`) as HTMLElement;
const body = () => document.querySelector('[data-page-body="stack"]') as HTMLElement;
const isPrimary = (el: Element) => /\bbg-primary\b/.test(el.className);
// header actions: every button outside the surface body, the id's copy button and the demo control
const headerButtons = () =>
  screen.getAllByRole("button").filter((b) => !body().contains(b) && !slot("td-id").contains(b));
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
    expect(primaries[0]!.textContent).toBe("Refresh tracking");
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
    expect(heads()).toEqual(["Item", "Charged", "Cost"]);
    // Total, then the one Profit result line with its sub-line; no em-dash column
    const result = slot("td-ledger-result");
    expect(result.getAttribute("data-tone")).toBe("positive");
    expect(within(result).getByText("Profit")).toBeTruthy();
    expect(result.textContent).toMatch(/293,91\s€/);
    expect(result.textContent).toMatch(/25,9\s%\smargin · target 20 %/);
    expect(slot("td-ledger").querySelector("table")!.textContent).not.toContain("—");
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
      "Row actions",
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
  it("title equal to identity.id shows the number once and keeps the copy button", () => {
    render(<TransactionDocumentShell {...base} title="X-1" />);
    expect(document.body.textContent?.match(/X-1/g)).toHaveLength(1);
    expect(slot("td-id").textContent).toBe("");
    expect(slot("td-id").querySelector("button")).toBeTruthy();
  });

  it("title different from identity.id still shows the id chip text", () => {
    render(<TransactionDocumentShell {...base} />);
    expect(slot("td-id").textContent).toContain("X-1");
  });

  it("marks only the current chain entry as current", () => {
    render(<TransactionDocumentDemo />);
    variant("Offer");
    const current = slot("td-chain").querySelectorAll("[aria-current=page]");
    expect([...current].map((e) => e.textContent)).toEqual(["Valuation"]);
  });

  it("says Copied only after the clipboard write succeeds", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<TransactionDocumentShell {...base} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy X-1" }));
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByRole("button", { name: "Copy X-1" })).toBeTruthy();
    writeText.mockResolvedValue(undefined);
    fireEvent.click(screen.getByRole("button", { name: "Copy X-1" }));
    expect(await screen.findByRole("button", { name: "Copied" })).toBeTruthy();
  });

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

describe("TransactionDocumentShell — mockup fidelity", () => {
  it("marks the document column; AppShell owns the one width bound", () => {
    const { container } = render(<TransactionDocumentShell {...base} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/\bdb-document-column\b/);
    expect(root.className).not.toMatch(/\bmax-w-/);
  });

  it("phone: the sticky primary bar sits in the stack body, outside every card", () => {
    mobile.on = true;
    render(<TransactionDocumentShell {...base} />);
    const bar = slot("td-next-step-bar");
    expect(bar.parentElement).toBe(body());
    expect(bar.className).toMatch(/\bsticky\b/);
    expect(bar.closest("section")).toBeNull();
  });

  it("renders a stack body: one bordered card per slot, history included", () => {
    render(<TransactionDocumentShell {...base} history={<p>Placed</p>} />);
    const cards = [...body().children] as HTMLElement[];
    expect(cards.map((c) => c.getAttribute("data-slot"))).toEqual(["td-next-step", "td-ledger", "td-facts", "td-history"]);
    for (const c of cards) expect(c.className.split(" ")).toEqual(expect.arrayContaining(["border", "rounded-lg"]));
    // titled cards keep their region names
    expect(screen.getByRole("region", { name: "Lines" })).toBe(slot("td-ledger"));
  });

  it("nextStep.tone warning renders the warning surface; omitted renders the neutral panel", () => {
    render(<TransactionDocumentShell {...base} nextStep={{ title: "Do it", tone: "warning" }} />);
    expect(slot("td-next-step").getAttribute("data-tone")).toBe("warning");
    expect(slot("td-next-step").className).toMatch(/\bbg-status-warning-bg\b/);
    cleanup();
    render(<TransactionDocumentShell {...base} />);
    expect(slot("td-next-step").getAttribute("data-tone")).toBe("default");
    expect(slot("td-next-step").className).toMatch(/bg-muted\/30/);
  });

  it("nextStep.step supplies the tone and default title — the same WorkflowStep a work-queue group reads", () => {
    const step = { key: "shipped", label: "Shipped, no delivery scan", tone: "danger" as const, phase: "open" as const };
    render(<TransactionDocumentShell {...base} nextStep={{ step }} />);
    expect(slot("td-next-step").getAttribute("data-tone")).toBe("danger");
    expect(screen.getByRole("heading", { level: 2, name: /Shipped, no delivery scan$/ })).toBeTruthy();
    cleanup();
    render(<TransactionDocumentShell {...base} nextStep={{ step, title: "Chase the carrier" }} />);
    expect(slot("td-next-step").getAttribute("data-tone")).toBe("danger");
    expect(screen.getByRole("heading", { level: 2, name: /Chase the carrier$/ })).toBeTruthy();
  });

  it("identity.progress renders an ordered list, current step bold; omitted renders nothing", () => {
    render(
      <TransactionDocumentShell
        {...base}
        identity={{ ...base.identity, progress: [{ label: "Paid", state: "done" }, { label: "Packed", state: "current" }, { label: "Delivered", state: "pending" }] }}
      />,
    );
    const list = screen.getByRole("list", { name: "Progress" });
    expect(list.tagName).toBe("OL");
    const current = list.querySelector("[aria-current=step]") as HTMLElement;
    expect(current.textContent).toContain("Packed");
    expect(current.className).toMatch(/\bfont-semibold\b/);
    expect(list.textContent).toContain("Paid (done)");
    cleanup();
    render(<TransactionDocumentShell {...base} />);
    expect(slot("td-progress")).toBeNull();
  });

  it("a progress step carries an optional date after its label; no date renders none", () => {
    render(
      <TransactionDocumentShell
        {...base}
        identity={{ ...base.identity, progress: [{ label: "Placed", state: "done", date: new Date(2026, 9, 30) }, { label: "Paid", state: "current" }] }}
      />,
    );
    const list = screen.getByRole("list", { name: "Progress" });
    expect(list.querySelector("li")!.textContent).toContain("Placed 30.10.");
    expect(list.querySelectorAll('[data-slot="td-progress-date"]')).toHaveLength(1);
  });

  it("primary and secondary next-step actions share one row; a locked next step hides both", () => {
    const nextStep = { ...base.nextStep, secondary: [{ label: "Replacement label", onSelect: () => {} }] };
    render(<TransactionDocumentShell {...base} nextStep={nextStep} />);
    const row = slot("td-next-step-actions");
    expect(within(row).getByRole("button", { name: "Go" })).toBeTruthy();
    expect(within(row).getByRole("button", { name: "Replacement label" })).toBeTruthy();
    expect(row.className).toMatch(/\bflex-wrap\b/);
    cleanup();
    const three = ["A", "B", "C"].map((label) => ({ label, onSelect: () => {} }));
    render(<TransactionDocumentShell {...base} nextStep={{ ...base.nextStep, secondary: three }} />);
    expect(slot("td-next-step-actions").querySelectorAll('[data-slot="td-secondary"]')).toHaveLength(2);
    cleanup();
    render(<TransactionDocumentShell {...base} nextStep={nextStep} locks={{ nextStep: { reason: "No" } }} />);
    expect(slot("td-next-step-actions")).toBeNull();
  });

  it("side effects render as one inline line, each state kept", () => {
    render(
      <TransactionDocumentShell
        {...base}
        nextStep={{ ...base.nextStep, sideEffects: [{ label: "A", state: "done", link: { label: "Open", href: "#" } }, { label: "B", state: "pending" }, { label: "C", state: "failed" }] }}
      />,
    );
    const line = slot("td-side-effects");
    expect(line.querySelector("ul")!.className).toMatch(/\binline\b/);
    expect(line.querySelectorAll("li")).toHaveLength(3);
    expect(line.textContent).toContain("C (failed)");
    expect(within(line).getByRole("link", { name: "Open" })).toBeTruthy();
  });

  it("a toned panel with only failed effects renders them inside the description column", () => {
    render(
      <TransactionDocumentShell
        {...base}
        nextStep={{ title: "Next", tone: "warning", sideEffects: [{ label: "C", state: "failed" }] }}
      />,
    );
    const line = slot("td-side-effects");
    expect(line.parentElement!.className).toMatch(/\bmin-w-0\b/);
    expect(line.textContent).toContain("C (failed)");
    cleanup();
    render(<TransactionDocumentShell {...base} nextStep={{ title: "Next", tone: "warning", sideEffects: [{ label: "C", state: "failed" }, { label: "D", state: "pending" }] }} />);
    expect(slot("td-side-effects").parentElement!.className).not.toMatch(/\bmin-w-0\b/);
  });

  it("a fact group renders its title, items and subline beside flat facts; flat facts render unchanged", () => {
    render(
      <TransactionDocumentShell
        {...base}
        facts={[
          { label: "Seller", value: "Jana" },
          { title: "Ship to", items: ["Max", "Street 1"], subline: "max@example.com", change: { label: "Change", href: "#" } },
        ]}
      />,
    );
    expect(slot("td-fact").textContent).toBe("SellerJana");
    const group = slot("td-fact-group");
    expect(group.querySelector("dt")!.textContent).toBe("Ship to");
    expect([...group.querySelectorAll("dd")].map((d) => d.textContent)).toEqual(["Max", "Street 1", "max@example.com", "Change"]);
  });

  it("the header uses the document title step (24px h1)", () => {
    render(<TransactionDocumentShell {...base} />);
    expect(screen.getByRole("heading", { level: 1 }).className).toMatch(/\btext-2xl\b/);
  });

  it("a negative result is toned negative (derived from the sign)", () => {
    render(<TransactionDocumentShell {...base} ledger={{ ...base.ledger, result: { label: "Loss", value: -5, kind: "currency" } }} />);
    expect(slot("td-ledger-result").getAttribute("data-tone")).toBe("negative");
  });
});

describe("TransactionDocumentShell — row locks, add and remove", () => {
  const cols: LedgerColumn[] = [{ key: "cost", label: "Cost", kind: "currency", priority: 1, editable: true }];
  const rows = [
    { id: "item", label: "Set", values: { cost: 10 }, locks: { cost: { reason: "Cost comes from the stock lot.", wayOut: { label: "Open lot", href: "#" } } }, removable: false },
    { id: "fee", label: "Fee", values: { cost: 5 } },
  ];

  it("compactRowLocks pulls the ledger body up 12px, except under a ledger lock note; default is unchanged", () => {
    const body = () => slot("td-ledger").querySelector("[data-slot=td-ledger-table]")!.parentElement!;
    const ledger = { columns: cols, rows };
    render(<TransactionDocumentShell {...base} ledger={ledger} />);
    expect(body().className).not.toContain("-mt-3");
    cleanup();
    render(<TransactionDocumentShell {...base} ledger={{ ...ledger, compactRowLocks: true }} />);
    expect(body().className).toContain("sm:-mt-3");
    expect(body().className).not.toMatch(/(^|\s)-mt-3/);
    cleanup();
    render(<TransactionDocumentShell {...base} ledger={{ ...ledger, compactRowLocks: true }} locks={{ ledger: { reason: "Closed" } }} />);
    expect(body().className).not.toContain("-mt-3");
  });

  it("a row lock makes one cell read-only with its reason; other rows stay editable", () => {
    const onCellChange = vi.fn();
    render(<TransactionDocumentShell {...base} ledger={{ columns: cols, rows, onCellChange }} />);
    expect(screen.queryByRole("textbox", { name: "Cost Set" })).toBeNull();
    const note = screen.getByText(/Cost comes from the stock lot/).closest("[data-slot=td-lock]") as HTMLElement;
    expect(note.textContent).toContain("Cost:");
    expect(within(note).getByRole("link", { name: "Open lot" })).toBeTruthy();
    const fee = screen.getByRole("textbox", { name: "Cost Fee" });
    fireEvent.change(fee, { target: { value: "7" } });
    fireEvent.keyDown(fee, { key: "Enter" });
    expect(onCellChange).toHaveBeenCalledWith("fee", "cost", 7);
    expect(onCellChange).toHaveBeenCalledTimes(1);
  });

  it("compactRowLocks: ledger header row is compact; default header is unchanged", () => {
    const { container, rerender } = render(<TransactionDocumentShell {...base} ledger={{ columns: cols, rows, onCellChange: vi.fn() }} />);
    const th = () => container.querySelector("[data-slot=td-ledger-table] thead th") as HTMLElement;
    expect(th().className).toContain("h-9");
    expect(th().className).not.toContain("sm:h-6");
    rerender(<TransactionDocumentShell {...base} ledger={{ columns: cols, rows, onCellChange: vi.fn(), compactRowLocks: true }} />);
    expect(th().className).toContain("sm:h-6");
  });

  it("compactRowLocks: lock icon in the cell, reason and way out in a popover, still read-only", async () => {
    const onCellChange = vi.fn();
    render(<TransactionDocumentShell {...base} ledger={{ columns: cols, rows, onCellChange, compactRowLocks: true }} />);
    expect(slot("td-lock")).toBeNull();
    expect(screen.queryByRole("textbox", { name: "Cost Set" })).toBeNull();
    const trigger = screen.getByRole("button", { name: /Locked: Cost Set: Cost comes from the stock lot/ });
    expect(screen.queryByRole("link", { name: "Open lot" })).toBeNull();
    expect(trigger.tagName).toBe("BUTTON"); // a native button: Enter and Space open it
    trigger.focus();
    fireEvent.click(trigger); // what Enter/Space on a focused button dispatches
    const wayOut = await screen.findByRole("link", { name: "Open lot" });
    wayOut.focus();
    expect(wayOut.tabIndex).toBeGreaterThanOrEqual(0);
    expect(document.activeElement).toBe(wayOut); // reachable by keyboard
    expect(onCellChange).not.toHaveBeenCalled();
    // the unlocked row is unaffected
    expect(screen.getByRole("textbox", { name: "Cost Fee" })).toBeTruthy();
  });

  it("compactRowLocks: a column lock moves from a note row above the table into the ledger header", async () => {
    const lock = { reason: "Prices come from BrickLink.", wayOut: { label: "Open in BrickLink", href: "#" } };
    const columns = cols.map((c) => (c.key === "cost" ? { ...c, lock } : c));
    const onCellChange = vi.fn();
    render(<TransactionDocumentShell {...base} ledger={{ columns, rows, onCellChange }} />);
    expect(within(slot("td-ledger")).getByText(/Prices come from BrickLink/).closest("[data-slot=td-lock]")).toBeTruthy(); // default: the note row
    cleanup();
    render(<TransactionDocumentShell {...base} ledger={{ columns, rows, onCellChange, compactRowLocks: true }} />);
    expect(slot("td-lock")).toBeNull();
    const trigger = within(slot("td-ledger")).getByRole("button", { name: /Locked: Cost: Prices come from BrickLink/ });
    expect(slot("td-ledger").querySelector("h2")!.parentElement!.parentElement!.contains(trigger)).toBe(true); // on the title line
    fireEvent.click(trigger);
    expect(await screen.findByRole("link", { name: "Open in BrickLink" })).toBeTruthy();
    expect(screen.getAllByText("Prices come from BrickLink.").length).toBeGreaterThan(0);
    expect(screen.getByText("Cost", { selector: "p" })).toBeTruthy(); // the popover names its column
  });

  it("compact lock sits inline left of its figure on one line", () => {
    render(<TransactionDocumentShell {...base} ledger={{ columns: cols, rows, onCellChange: vi.fn(), compactRowLocks: true }} />);
    const cell = slot("td-ledger").querySelector("[data-slot=td-lock-compact]") as HTMLElement;
    expect(cell.className).not.toMatch(/flex-wrap/);
    expect(cell.firstElementChild!.tagName).toBe("BUTTON");
  });

  it("identity.progress renders under the header, not inside the header subtitle", () => {
    render(<TransactionDocumentShell {...base} identity={{ ...base.identity, summary: "A summary", progress: [{ label: "Paid", state: "done" }] }} />);
    expect(slot("td-progress").closest("[data-slot=heading-subtitle]")).toBeNull();
    expect(slot("td-summary").closest("[data-slot=heading-subtitle]")).toBeTruthy();
  });

  it("adds and removes lines inside the ledger; removable:false keeps a line", () => {
    const onAddRow = vi.fn();
    const onRemoveRow = vi.fn();
    render(<TransactionDocumentShell {...base} ledger={{ columns: cols, rows, onAddRow, addRowLabel: "Add cost", onRemoveRow }} />);
    fireEvent.click(within(slot("td-ledger")).getByRole("button", { name: "Add cost" }));
    expect(onAddRow).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Remove Set" })).toBeNull();
    fireEvent.click(within(slot("td-ledger")).getByRole("button", { name: "Remove Fee" }));
    expect(onRemoveRow).toHaveBeenCalledWith("fee");
  });

  it("a locked ledger hides add and remove", () => {
    render(
      <TransactionDocumentShell {...base} ledger={{ columns: cols, rows, onAddRow: () => {}, onRemoveRow: () => {} }} locks={{ ledger: { reason: "Synced" } }} />,
    );
    expect(within(slot("td-ledger")).queryAllByRole("button")).toHaveLength(0);
  });

  it("without locks, onAddRow or onRemoveRow the ledger renders unchanged", () => {
    render(<TransactionDocumentShell {...base} ledger={{ columns: cols, rows: [{ id: "x", label: "X", values: { cost: 1 } }] }} />);
    expect(within(slot("td-ledger")).queryAllByRole("button")).toHaveLength(0);
    expect(within(slot("td-ledger")).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Item", "Cost"]);
    expect(slot("td-lock")).toBeNull();
  });

  it("the purchase-order demo locks one cost cell and adds/removes lines", () => {
    render(<TransactionDocumentDemo />);
    variant("Purchase order");
    expect(screen.queryByRole("textbox", { name: "Cost Assembly Square" })).toBeNull();
    expect(screen.getByRole("textbox", { name: "Cost Ninjago City" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add cost" }));
    expect(screen.getByRole("textbox", { name: "Cost Extra cost" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove Extra cost" }));
    expect(screen.queryByRole("textbox", { name: "Cost Extra cost" })).toBeNull();
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
    expect(parseFigure("195.5", "de-DE")).toBe(195.5); // a dot meant as the decimal point
    expect(parseFigure("1.234.567,5", "de-DE")).toBe(1234567.5);
    expect(parseFigure("1.234", "de-DE")).toBe(1234);
    expect(parseFigure("195,5", "en-US")).toBe(195.5);
  });
});
