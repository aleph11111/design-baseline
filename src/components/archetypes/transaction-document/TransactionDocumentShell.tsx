"use client";
import * as React from "react";
import { ChevronDown, CircleAlert, CircleCheck, Clock } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible";
import { PageFrame, type PageFrameProps } from "../../layout/PageFrame";
import { SectionCard } from "../../layout/SectionCard";
import { useDocumentColumnClass } from "../../layout/surface";
import type { HeaderAction, HeaderActions } from "../../layout/HeaderActions";
import { useIsMobile } from "../../../hooks/use-mobile";
import { formatFigure, type FigureKind } from "../../../lib/format";
import { useLabels } from "../../../lib/labels";
import { cn } from "../../../lib/utils";
import type { LedgerColumn, LedgerResult, LedgerRow, LinkAction, Lock } from "./ledger";
import { LedgerTable, lockedColumns } from "./LedgerTable";
import type { WorkflowStep, WorkflowTone } from "../shared/workflowStep";
import { ActionLink, DocumentId, LockNote, LockPopover, RenderLinkContext, type RenderLink } from "./parts";

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
  /**
   * Where the document stands in its own lifecycle, as one quiet ordered line
   * under the summary (Placed · Paid · Packed · Label created · Carrier scan ·
   * Delivered). Exactly one step should be `current`. A step may carry the
   * date it was reached ("Placed 30.10."); that date is then its one home —
   * not repeated in facts.
   */
  progress?: TransactionProgressStep[];
};

/** One lifecycle step of `identity.progress`. */
export type TransactionProgressStep = {
  label: string;
  state: "done" | "current" | "pending";
  /** When the step was reached; rendered after the label (a `Date` as day.month in the page locale). Omitted → no date. */
  date?: Date | string;
};

/** An automatic side effect of the current state ("invoice created on payment"). */
export type SideEffect = { label: string; state: "done" | "pending" | "failed"; link?: LinkAction };

/**
 * The next-step panel's surface, keyed to the state (contract "Next step"):
 * a routine step → `default`; a problem the user must resolve → `warning`;
 * a failed or blocked state → `danger`; the document is complete → `success`.
 * The same type as a work-queue group's tone (`WorkflowStep.tone`), so the
 * list group and the document's next step read one step model.
 */
export type TransactionNextStepTone = WorkflowTone;

/** The state-keyed next-step panel — the only home of the primary action. */
export type TransactionNextStep = {
  description?: React.ReactNode;
  /** The document's one primary action. */
  primary?: HeaderAction;
  /** At most two state-specific secondary actions beside the primary
   *  ("Replacement label"); they wrap below the text on narrow widths. */
  secondary?: HeaderAction[];
  /** The automatic side effects running alongside this state. */
  sideEffects?: SideEffect[];
} & (
  | {
      /**
       * The document's current workflow step — the same `WorkflowStep` its
       * work-queue list groups by. The panel's tone is the step's tone and the
       * title defaults to the step's label, so list group and next step never
       * drift. A panel keyed to a step takes no tone of its own.
       */
      step: WorkflowStep;
      /** What happens next ("Ship the order"); default: the step's label. */
      title?: string;
      tone?: never;
    }
  | {
      step?: undefined;
      /** What happens next, for the current state ("Ship the order"). */
      title: string;
      /**
       * The panel's surface, keyed to the state (see `TransactionNextStepTone`).
       * On `warning` / `danger` the title states the problem ("No carrier scan 8
       * days after the label was created"). Omitted → `default`, the routine step.
       */
      tone?: TransactionNextStepTone;
    }
);

/** The one money table. Columns are declared per document type. */
export type TransactionLedger = {
  columns: LedgerColumn[];
  rows: LedgerRow[];
  totals?: LedgerRow[];
  /** The one result line after the totals (a sales order's Profit with its margin). */
  result?: LedgerResult;
  /** Editable mode: `editable` columns become inputs, committing through here. */
  onCellChange?: (rowId: string, columnKey: string, value: number | null) => void;
  /** Add a line from inside the ledger (never from the header menu). */
  onAddRow?: () => void;
  /** The add control's label ("Add cost"); default "Add line". */
  addRowLabel?: string;
  /** Remove a line from inside the ledger; rows opt out with `removable: false`. */
  onRemoveRow?: (rowId: string) => void;
  /**
   * Compact locks; default off. Row cell locks show as a lock icon beside the
   * figure (reason and way out in a popover) instead of a sentence under the
   * line, and column locks move into the ledger's header as lock icons
   * (the same popover) instead of a note row above the table.
   */
  compactRowLocks?: boolean;
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

/**
 * Several related facts read as one block (Ship to: name, address, then a
 * quiet sub-line with the email). Sits beside flat facts in `facts`.
 */
export type TransactionFactGroup = {
  title: string;
  /** The block's lines, one per entry. */
  items: React.ReactNode[];
  /** One quiet line under the items. */
  subline?: React.ReactNode;
  change?: LinkAction;
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
  facts: (TransactionFact | TransactionFactGroup)[];
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

const NEXT_STEP_TONE = {
  default: "bg-muted/30",
  warning: "bg-status-warning-bg text-status-warning-fg",
  danger: "bg-status-danger-bg text-status-danger-fg",
  success: "bg-status-success-bg text-status-success-fg",
} as const;

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
  const documentColumn = useDocumentColumnClass();
  const primary = locks.nextStep ? undefined : nextStep.primary;
  const secondary = locks.nextStep ? [] : (nextStep.secondary ?? []).slice(0, 2); // contract: at most two
  const tone = (nextStep.step ? nextStep.step.tone : nextStep.tone) ?? "default";
  const nextTitle = nextStep.title ?? nextStep.step?.label;
  const toned = tone !== "default";
  // The header never renders a primary: a stray one (the type forbids it, an
  // untyped caller may still pass it) is demoted to the first secondary.
  const header = actions as HeaderActions | undefined;
  const headerActions: HeaderActions | undefined = header
    ? { secondary: [...(header.primary ? [header.primary] : []), ...(header.secondary ?? [])], menu: header.menu, renderLink }
    : undefined;

  const badges = (
    <>
      <DocumentId id={identity.id} textless={title === identity.id} />
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

  // Compact: the column locks ride the ledger's header line, not a note row above the table.
  const columnLocks = ledger.compactRowLocks
    ? lockedColumns(ledger.columns, !!ledger.onCellChange, !!locks.ledger).map((c) => <LockPopover key={c.key} lock={c.lock!} field={c.label} />)
    : undefined;

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
        className={documentColumn}
        body="stack"
        titleStep="document"
      >
        {/* Full width under the header, not in the subtitle column the header actions squeeze. */}
        {identity.progress?.length ? <Progress steps={identity.progress} locale={locale} /> : null}
        <SectionCard
          data-slot="td-next-step"
          aria-labelledby={`${id}-next`}
          data-tone={tone}
          className={NEXT_STEP_TONE[tone]}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="min-w-0 flex-[1_1_22rem] space-y-1">
                <h2 id={`${id}-next`} className="text-base font-semibold">
                  <span className="sr-only">{L.nextStep}: </span>
                  {nextTitle}
                </h2>
                {nextStep.description ? <div className={cn("text-sm", !toned && "text-muted-foreground")}>{nextStep.description}</div> : null}
              </div>
              {(!isMobile && primaryButton) || secondary.length ? (
                <div data-slot="td-next-step-actions" className="flex flex-wrap gap-2">
                  {!isMobile ? primaryButton : null}
                  {secondary.map((a) => (
                    <ActionButton key={a.label} action={a} renderLink={renderLink ?? link} variant="outline" slot="td-secondary" />
                  ))}
                </div>
              ) : null}
            </div>
            {locks.nextStep ? <LockNote lock={locks.nextStep} /> : null}
            {nextStep.sideEffects?.length ? <SideEffects items={nextStep.sideEffects} toned={toned} /> : null}
          </div>
        </SectionCard>

        <Slot name="td-ledger" title={L.ledger} lock={locks.ledger} actions={columnLocks}>
          <LedgerTable
            columns={ledger.columns}
            rows={ledger.rows}
            totals={ledger.totals}
            result={ledger.result}
            onCellChange={ledger.onCellChange}
            onAddRow={ledger.onAddRow}
            addRowLabel={ledger.addRowLabel}
            onRemoveRow={ledger.onRemoveRow}
            compactRowLocks={ledger.compactRowLocks}
            columnLocksInHeader={ledger.compactRowLocks}
            locked={!!locks.ledger}
            locale={locale}
          />
        </Slot>

        <Slot name="td-facts" title={L.facts} lock={locks.facts}>
          <dl className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-x-6 gap-y-4">
            {facts.map((f) => (
              <div key={"title" in f ? f.title : f.label} data-slot={"title" in f ? "td-fact-group" : "td-fact"} className="min-w-0">
                {"title" in f ? (
                  <>
                    <dt className="text-xs text-muted-foreground">{f.title}</dt>
                    {f.items.map((item, i) => (
                      <dd key={i} className="break-words text-sm">{item}</dd>
                    ))}
                    {f.subline ? <dd className="break-words text-sm text-muted-foreground">{f.subline}</dd> : null}
                  </>
                ) : (
                  <>
                    <dt className="text-xs text-muted-foreground">{f.label}</dt>
                    <dd className="break-words text-sm">{formatFact(f, locale)}</dd>
                  </>
                )}
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
          <SectionCard data-slot="td-history">
            <Collapsible>
              <h2 className="text-sm font-semibold">
                <CollapsibleTrigger className="group flex w-full items-center justify-between text-left">
                  {L.history}
                  <ChevronDown aria-hidden className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
              </h2>
              <CollapsibleContent className="pt-3">{history}</CollapsibleContent>
            </Collapsible>
          </SectionCard>
        ) : null}

        {isMobile && primaryButton ? (
          // Phone: the primary action stays pinned to the bottom while the page
          // scrolls (sticky inside the stack body, outside every card;
          // FormPageActions precedent).
          <div data-slot="td-next-step-bar" className="sticky bottom-0 z-10 border-t bg-background/95 p-3 backdrop-blur [&>*]:w-full">
            {primaryButton}
          </div>
        ) : null}
      </PageFrame>
    </RenderLinkContext.Provider>
  );
}

TransactionDocumentShell.displayName = "TransactionDocumentShell";

/** One titled section card; the lock note leads its body. */
function Slot({ name, title, lock, actions, children }: { name: string; title: string; lock?: Lock; actions?: React.ReactNode[]; children: React.ReactNode }) {
  return (
    <SectionCard data-slot={name} title={title} aria-label={title} actions={actions?.length ? <span className="-my-1.5 flex items-center">{actions}</span> : undefined} className="min-w-0">
      <div className="space-y-3">
        {lock ? <LockNote lock={lock} /> : null}
        {children}
      </div>
    </SectionCard>
  );
}

const PROGRESS_MARK = { done: "●", current: "●", pending: "○" } as const;
const PROGRESS_TONE = { done: "text-success", current: "text-primary", pending: "text-muted-foreground/60" } as const;

function Progress({ steps, locale }: { steps: TransactionProgressStep[]; locale: string }) {
  const L = useLabels();
  const stateLabel = { done: L.sideEffectDone, pending: L.sideEffectPending };
  return (
    <ol aria-label={L.documentProgress} data-slot="td-progress" className="-mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground md:-mt-3.5">
      {steps.map((s, i) => (
        <li
          key={i} // positional: two steps may share a label (a re-pack)
          data-state={s.state}
          aria-current={s.state === "current" ? "step" : undefined}
          className={s.state === "current" ? "font-semibold text-foreground" : undefined}
        >
          <span aria-hidden className={cn("mr-1", PROGRESS_TONE[s.state])}>{PROGRESS_MARK[s.state]}</span>
          {s.label}
          {s.date ? <span data-slot="td-progress-date"> {formatStepDate(s.date, locale)}</span> : null}
          {s.state !== "current" ? <span className="sr-only"> ({stateLabel[s.state]})</span> : null}
        </li>
      ))}
    </ol>
  );
}

function PrimaryButton({ action, renderLink }: { action: HeaderAction; renderLink: RenderLink }) {
  return <ActionButton action={action} renderLink={renderLink} slot="td-primary" />;
}

function ActionButton({
  action,
  renderLink,
  slot,
  variant,
}: {
  action: HeaderAction;
  renderLink: RenderLink;
  slot: string;
  variant?: "outline";
}) {
  const Icon = action.icon;
  const content = (
    <>
      {Icon ? <Icon className="size-4" /> : null}
      {action.label}
    </>
  );
  return action.href != null && !action.disabled ? (
    <Button asChild variant={variant} data-slot={slot} onClick={action.onSelect}>
      {renderLink(action.href, content)}
    </Button>
  ) : (
    <Button type="button" variant={variant} data-slot={slot} disabled={action.disabled} onClick={action.onSelect}>
      {content}
    </Button>
  );
}

const SIDE_EFFECT_ICON = { done: CircleCheck, pending: Clock, failed: CircleAlert } as const;
const SIDE_EFFECT_TONE = { done: "text-success", pending: "text-muted-foreground", failed: "text-destructive" } as const;

function SideEffects({ items, toned }: { items: SideEffect[]; toned: boolean }) {
  const L = useLabels();
  const stateLabel = { done: L.sideEffectDone, pending: L.sideEffectPending, failed: L.sideEffectFailed };
  return (
    <div data-slot="td-side-effects" className="text-xs leading-5">
      <span className={cn("mr-4", !toned && "text-muted-foreground")}>{L.runningAlongside}:</span>
      <ul className="inline">
        {items.map((s) => {
          const Icon = SIDE_EFFECT_ICON[s.state];
          return (
            <li key={s.label} data-state={s.state} className="mr-4 inline-flex items-baseline gap-1">
              <Icon aria-hidden className={cn("size-3.5 shrink-0 self-center", SIDE_EFFECT_TONE[s.state])} />
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

function formatStepDate(d: Date | string, locale: string): string {
  return d instanceof Date ? new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit" }).format(d) : d;
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
