"use client";
import * as React from "react";
import { ChevronDown, CircleAlert, CircleCheck, Clock } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible";
import { PageFrame, type PageFrameProps } from "../../layout/PageFrame";
import type { HeaderAction, HeaderActions } from "../../layout/HeaderActions";
import { useIsMobile } from "../../../hooks/use-mobile";
import { formatFigure, type FigureKind } from "../../../lib/format";
import { useLabels } from "../../../lib/labels";
import { cn } from "../../../lib/utils";
import type { LedgerColumn, LedgerRow, LinkAction, Lock } from "./ledger";
import { LedgerTable } from "./LedgerTable";
import { ActionLink, DocumentId, LockNote, RenderLinkContext, type RenderLink } from "./parts";

/** The document's identity: who it is and where it stands. */
export type TransactionIdentity = {
  /** The document number. Never wraps; carries a copy button. */
  id: string;
  /** The one status (e.g. "Paid", "Valuation"). */
  status: string;
  /** At most one attention flag (e.g. "Address unverified"). */
  attention?: string;
  /** One sentence saying what this document is. */
  summary?: React.ReactNode;
  /**
   * The document chain: related documents in order (Lead › Valuation › Offer ›
   * Purchase order). Mark this document `current`; an entry with a link is an
   * existing document, one without is a step that doesn't exist yet.
   */
  chain?: { label: string; href?: string; onSelect?: () => void; current?: boolean }[];
};

/** An automatic side effect of the current state ("invoice created on payment"). */
export type SideEffect = { label: string; state: "done" | "pending" | "failed"; link?: LinkAction };

/** The state-keyed next-step panel — the only home of the primary action. */
export type TransactionNextStep = {
  /** What happens next, for the current state ("Ship the order"). */
  title: string;
  description?: React.ReactNode;
  /** The document's one primary action. */
  primary?: HeaderAction;
  /** The automatic side effects running alongside this state. */
  sideEffects?: SideEffect[];
};

/** The one money table. Columns are declared per document type. */
export type TransactionLedger = {
  columns: LedgerColumn[];
  rows: LedgerRow[];
  totals?: LedgerRow[];
  /** Editable mode: `editable` columns become inputs, committing through here. */
  onCellChange?: (rowId: string, columnKey: string, value: number | null) => void;
  /** Add a line from inside the ledger (never from the header menu). */
  onAddRow?: () => void;
  /** The add control's label ("Add cost"); default "Add line". */
  addRowLabel?: string;
  /** Remove a line from inside the ledger; rows opt out with `removable: false`. */
  onRemoveRow?: (rowId: string) => void;
};

/** One typed fact. `kind` picks the formatting; default `text`. */
export type TransactionFact = {
  label: string;
  value: string | number | Date | null | undefined;
  kind?: FigureKind | "date" | "text";
  /** The fact's own Change link. */
  change?: LinkAction;
  /** Field lock: shown instead of `change`. */
  lock?: Lock;
};

export type TransactionDocumentShellProps = Pick<PageFrameProps, "title" | "backHref" | "backLabel" | "renderBackLink"> & {
  /**
   * Header actions: no primary (the primary action lives in `nextStep`), at
   * most two secondary inline; the rest goes behind the frame's `⋯` menu.
   */
  actions?: Omit<HeaderActions, "primary" | "renderLink">;
  identity: TransactionIdentity;
  nextStep: TransactionNextStep;
  ledger: TransactionLedger;
  facts: TransactionFact[];
  /** The document's history; collapsed by default. */
  history?: React.ReactNode;
  /** Slot locks: why the slot can't change here, and the way out. */
  locks?: { nextStep?: Lock; ledger?: Lock; facts?: Lock };
  /** Formats every figure and date. */
  locale?: string;
  /** Router link adaptor for every link the shell renders (chain, way-outs,
   *  Change links, header actions). Defaults to a plain `<a>`. */
  renderLink?: RenderLink;
};

const NONE = "—";

/**
 * TransactionDocumentShell — the transaction-document (Td) page
 * (docs/archetypes/transaction-document.md): a sales order, offer or purchase
 * order. The shell places five typed slots — identity in the header, then
 * next step, ledger, facts and history in the frame's surface — so every fact
 * has exactly one home. There is no free content slot.
 */
export function TransactionDocumentShell({
  title,
  backHref,
  backLabel,
  renderBackLink,
  actions,
  identity,
  nextStep,
  ledger,
  facts,
  history,
  locks = {},
  locale = "de-DE",
  renderLink,
}: TransactionDocumentShellProps): React.ReactElement {
  const L = useLabels();
  const isMobile = useIsMobile();
  const link = React.useContext(RenderLinkContext);
  const id = React.useId();
  const primary = locks.nextStep ? undefined : nextStep.primary;
  // The header never renders a primary: a stray one (the type forbids it, an
  // untyped caller may still pass it) is demoted to the first secondary.
  const header = actions as HeaderActions | undefined;
  const headerActions: HeaderActions | undefined = header
    ? { secondary: [...(header.primary ? [header.primary] : []), ...(header.secondary ?? [])], menu: header.menu, renderLink }
    : undefined;

  const badges = (
    <>
      <DocumentId id={identity.id} />
      <Badge variant="secondary">{identity.status}</Badge>
      {identity.attention ? <Badge variant="warning">{identity.attention}</Badge> : null}
    </>
  );
  const subtitle =
    identity.summary || identity.chain?.length ? (
      <div className="space-y-1 text-sm">
        {identity.summary ? <p data-slot="td-summary">{identity.summary}</p> : null}
        {identity.chain?.length ? (
          <nav aria-label={L.documentChain} data-slot="td-chain">
            <ol className="flex flex-wrap items-center gap-x-1.5">
              {identity.chain.map((d, i) => (
                <li key={i} className="flex items-center gap-x-1.5">
                  {i > 0 ? <span aria-hidden>›</span> : null}
                  {d.current ? (
                    <span aria-current="page" className="font-medium text-foreground">{d.label}</span>
                  ) : d.href || d.onSelect ? (
                    <ActionLink action={d} />
                  ) : (
                    <span>{d.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
      </div>
    ) : undefined;

  const primaryButton = primary ? <PrimaryButton action={primary} renderLink={renderLink ?? link} /> : null;

  return (
    <RenderLinkContext.Provider value={renderLink ?? link}>
      <PageFrame
        title={title}
        backHref={backHref}
        backLabel={backLabel}
        renderBackLink={renderBackLink}
        badges={badges}
        subtitle={subtitle}
        actions={headerActions}
      >
        <div data-slot="td-body" className="divide-y divide-border">
          <section data-slot="td-next-step" aria-labelledby={`${id}-next`} className="space-y-3 bg-muted/30 p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{L.nextStep}</p>
                <h2 id={`${id}-next`} className="text-base font-semibold">{nextStep.title}</h2>
                {nextStep.description ? <div className="text-sm text-muted-foreground">{nextStep.description}</div> : null}
              </div>
              {!isMobile ? primaryButton : null}
            </div>
            {locks.nextStep ? <LockNote lock={locks.nextStep} /> : null}
            {nextStep.sideEffects?.length ? <SideEffects items={nextStep.sideEffects} /> : null}
          </section>

          <Slot name="td-ledger" title={L.ledger} lock={locks.ledger}>
            <LedgerTable
              columns={ledger.columns}
              rows={ledger.rows}
              totals={ledger.totals}
              onCellChange={ledger.onCellChange}
              onAddRow={ledger.onAddRow}
              addRowLabel={ledger.addRowLabel}
              onRemoveRow={ledger.onRemoveRow}
              locked={!!locks.ledger}
              locale={locale}
            />
          </Slot>

          <Slot name="td-facts" title={L.facts} lock={locks.facts}>
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-x-6 gap-y-4">
              {facts.map((f) => (
                <div key={f.label} data-slot="td-fact" className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="break-words text-sm">{formatFact(f, locale)}</dd>
                  {f.lock ? (
                    <dd className="mt-1"><LockNote lock={f.lock} /></dd>
                  ) : f.change && !locks.facts ? (
                    <dd className="mt-1 text-sm"><ActionLink action={f.change} /></dd>
                  ) : null}
                </div>
              ))}
            </dl>
          </Slot>

          {history ? (
            <Collapsible data-slot="td-history" className="p-4 md:p-5">
              <h2 className="text-sm font-semibold">
                <CollapsibleTrigger className="group flex w-full items-center justify-between text-left">
                  {L.history}
                  <ChevronDown aria-hidden className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
              </h2>
              <CollapsibleContent className="pt-3">{history}</CollapsibleContent>
            </Collapsible>
          ) : null}

          {isMobile && primaryButton ? (
            // Phone: the primary action stays pinned to the bottom while the page
            // scrolls (sticky inside the body, FormPageActions precedent).
            <div data-slot="td-next-step-bar" className="sticky bottom-0 z-10 border-t bg-background/95 p-3 backdrop-blur [&>*]:w-full">
              {primaryButton}
            </div>
          ) : null}
        </div>
      </PageFrame>
    </RenderLinkContext.Provider>
  );
}

TransactionDocumentShell.displayName = "TransactionDocumentShell";

function Slot({ name, title, lock, children }: { name: string; title: string; lock?: Lock; children: React.ReactNode }) {
  const id = React.useId();
  return (
    <section data-slot={name} aria-labelledby={id} className="min-w-0 space-y-3 p-4 md:p-5">
      <h2 id={id} className="text-sm font-semibold">{title}</h2>
      {lock ? <LockNote lock={lock} /> : null}
      {children}
    </section>
  );
}

function PrimaryButton({ action, renderLink }: { action: HeaderAction; renderLink: RenderLink }) {
  const Icon = action.icon;
  const content = (
    <>
      {Icon ? <Icon className="size-4" /> : null}
      {action.label}
    </>
  );
  return action.href != null && !action.disabled ? (
    <Button asChild data-slot="td-primary" onClick={action.onSelect}>
      {renderLink(action.href, content)}
    </Button>
  ) : (
    <Button type="button" data-slot="td-primary" disabled={action.disabled} onClick={action.onSelect}>
      {content}
    </Button>
  );
}

const SIDE_EFFECT_ICON = { done: CircleCheck, pending: Clock, failed: CircleAlert } as const;
const SIDE_EFFECT_TONE = { done: "text-success", pending: "text-muted-foreground", failed: "text-destructive" } as const;

function SideEffects({ items }: { items: SideEffect[] }) {
  const L = useLabels();
  const stateLabel = { done: L.sideEffectDone, pending: L.sideEffectPending, failed: L.sideEffectFailed };
  return (
    <div data-slot="td-side-effects" className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{L.runningAlongside}</p>
      <ul className="space-y-1">
        {items.map((s) => {
          const Icon = SIDE_EFFECT_ICON[s.state];
          return (
            <li key={s.label} data-state={s.state} className="flex items-start gap-1.5 text-sm">
              <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", SIDE_EFFECT_TONE[s.state])} />
              <span>
                {s.label}
                <span className="sr-only"> ({stateLabel[s.state]})</span>
                {s.link ? (
                  <>
                    {" · "}
                    <ActionLink action={s.link} />
                  </>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function formatFact(f: TransactionFact, locale: string): string {
  const v = f.value;
  if (v == null || v === "") return NONE;
  if (v instanceof Date) return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(v);
  if (typeof v === "number" && f.kind && f.kind !== "text" && f.kind !== "date") return formatFigure(v, f.kind, { locale });
  if (f.kind === "date" && typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(d);
  }
  return String(v);
}
