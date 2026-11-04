"use client";
import * as React from "react";
import { CircleCheck, CircleAlert, Copy, History, Plus } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { StateView } from "../../ui/state-view";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet";
import { PageFrame, type PageShellFrameProps } from "../../layout/PageFrame";
import { useLabels } from "../../../lib/labels";

/** The coverage check: how many palette items are not placed in the tree yet,
 *  and (when the consumer can tell) how many are placed more than once. */
export type StructureCoverage = { unplaced: number; duplicates?: number };

export type StructureBuilderShellProps = Omit<PageShellFrameProps, "viewSwitch"> & {
  /** The template list: the control that picks which structure is edited
   *  (a select over the saved structures). It switches what the page shows,
   *  so it renders first in the toolbar band and stays visible below `md`,
   *  followed by New / Clone. `toolbar` stays free for scoping controls. */
  templates?: React.ReactNode;
  /** The editable line tree — a `StructureTree`, or the consumer's own tree
   *  that meets the contract's keyboard rule. */
  children: React.ReactNode;
  /** Heading of the palette aside (e.g. "Unplaced accounts"). */
  paletteTitle: React.ReactNode;
  /** The palette: the items that can be placed into the tree. Each item is
   *  draggable onto the tree and has a keyboard "place" action. */
  palette: React.ReactNode;
  /** The coverage check, rendered above the palette. Omitted = no check. */
  coverage?: StructureCoverage;
  /** Creates a new structure — the "New" action beside the template list. */
  onCreate?: () => void;
  /** Clones the current structure — the "Clone" action beside the template list. */
  onClone?: () => void;
  /** The version-history panel content. When set, the header shows a
   *  "History" action that opens it in a side sheet. */
  history?: React.ReactNode;
  /** Called when the history sheet opens or closes (e.g. to fetch versions). */
  onHistoryOpenChange?: (open: boolean) => void;
  /**
   * Deferred-bulk-save variant: the header's primary Save action. Omit it for
   * the immediate-reorder variant, where every move persists on its own.
   */
  onSave?: () => void;
  /** Unsaved edits exist: shows the unsaved-changes badge and enables Save. */
  dirty?: boolean;
  /** A save is in flight: Save shows its busy label and is disabled. */
  saving?: boolean;
  /** While true, a loading state replaces the builder body. */
  isLoading?: boolean;
  /** When set, an error state replaces the builder body. Wins over `isLoading`. */
  error?: unknown;
  /** Adds a retry button to the error state. */
  onRetry?: () => void;
  /** No structure exists yet: the empty state replaces the body, with "New" as its action. */
  isEmpty?: boolean;
  /** Copy of the empty state. */
  emptyMessage?: React.ReactNode;
};

/**
 * StructureBuilderShell — the structure-builder (Sb) page
 * (docs/archetypes/structure-builder.md): edits a hierarchical structure (a
 * report's line tree) against a palette of items to place. Through the one
 * page frame (ADR-0008): template list + New / Clone as the band's view switch,
 * History + Save in the header, the unsaved badge beside the title; the body
 * is the tree, with the coverage check and the palette in an aside (beside it
 * from `lg`, below it under). Persistence, the unsaved-changes navigation
 * guard and the API stay with the page.
 */
export function StructureBuilderShell({
  children,
  paletteTitle,
  palette,
  coverage,
  onCreate,
  onClone,
  history,
  onHistoryOpenChange,
  onSave,
  dirty = false,
  saving = false,
  isLoading = false,
  error,
  onRetry,
  isEmpty = false,
  emptyMessage,
  templates,
  actions,
  badges,
  ...frame
}: StructureBuilderShellProps): React.ReactElement {
  const L = useLabels();
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const openHistory = (open: boolean) => {
    setHistoryOpen(open);
    onHistoryOpenChange?.(open);
  };
  const ready = error == null && !isLoading && !isEmpty;

  const create = onCreate ? (
    <Button type="button" variant="outline" size="sm" onClick={onCreate}>
      <Plus aria-hidden />
      {L.structureNew}
    </Button>
  ) : null;

  const viewSwitch =
    templates || onCreate || onClone ? (
      <div className="flex flex-wrap items-center gap-2">
        {templates}
        {isEmpty ? null : create}
        {onClone && ready ? (
          <Button type="button" variant="outline" size="sm" onClick={onClone}>
            <Copy aria-hidden />
            {L.structureClone}
          </Button>
        ) : null}
      </div>
    ) : undefined;

  const headerActions =
    history || actions || onSave ? (
      <>
        {history && ready ? (
          <Button type="button" variant="outline" onClick={() => openHistory(true)}>
            <History aria-hidden />
            {L.structureHistory}
          </Button>
        ) : null}
        {actions}
        {onSave && ready ? (
          <Button type="button" onClick={onSave} disabled={!dirty || saving}>
            {saving ? L.saving : L.save}
          </Button>
        ) : null}
      </>
    ) : undefined;

  const headerBadges =
    badges || (dirty && ready) ? (
      <>
        {badges}
        {dirty && ready ? <Badge variant="outline">{L.unsavedChanges}</Badge> : null}
      </>
    ) : undefined;

  let body: React.ReactNode;
  if (error != null) body = <StateView variant="error" error={error} onRetry={onRetry} />;
  else if (isLoading) body = <StateView variant="loading" />;
  else if (isEmpty) body = <StateView variant="empty" title={emptyMessage ?? L.structureEmpty} action={create} />;
  else
    body = (
      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-3">
        <section aria-label={L.structureTree} className="min-w-0 lg:col-span-2">
          {children}
        </section>
        <aside className="min-w-0 space-y-3 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
          <h2 className="text-sm font-medium">{paletteTitle}</h2>
          {coverage ? <CoverageLine coverage={coverage} /> : null}
          {palette}
        </aside>
      </div>
    );

  return (
    <PageFrame {...frame} viewSwitch={viewSwitch} actions={headerActions} badges={headerBadges}>
      {body}
      {history ? (
        <Sheet open={historyOpen} onOpenChange={openHistory}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>{L.structureHistory}</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{history}</div>
          </SheetContent>
        </Sheet>
      ) : null}
    </PageFrame>
  );
}

StructureBuilderShell.displayName = "StructureBuilderShell";

function CoverageLine({ coverage }: { coverage: StructureCoverage }): React.ReactElement {
  const L = useLabels();
  const { unplaced, duplicates = 0 } = coverage;
  const complete = unplaced === 0 && duplicates === 0;
  const parts = [
    unplaced > 0 ? L.coverageUnplaced(unplaced) : null,
    duplicates > 0 ? L.coverageDuplicates(duplicates) : null,
  ].filter(Boolean);
  const Icon = complete ? CircleCheck : CircleAlert;
  return (
    <p data-slot="structure-coverage" role="status" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon aria-hidden className={complete ? "size-4 text-success" : "size-4 text-warning"} />
      {complete ? L.coverageComplete : parts.join(" · ")}
    </p>
  );
}
