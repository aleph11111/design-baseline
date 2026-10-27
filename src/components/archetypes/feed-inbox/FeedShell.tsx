import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { PageFrame, type PageShellFrameProps } from "../../layout/PageFrame";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { useLabels } from "../../../lib/labels";

export type FeedBodyProps = {
  /**
   * Time-grouped content: a stack of `<SectionCard title="Today" flush>` blocks,
   * each holding `<FeedItem>`s separated by `divide-y`. Omit groups for a flat feed.
   */
  children: React.ReactNode;
  /** Shown (centered, muted) when there are no items — pass for the empty state. */
  empty?: React.ReactNode;
};

/**
 * The feed body without a page frame: the time-grouped stack (or flat items)
 * and the empty state, in their one content block. For composing the feed
 * inside another surface — a popover / Sheet launched from a header bell —
 * where a page title and a raised page surface would be wrong (ADR-0008: the
 * shell owns the page frame, the body owns the content). Mirrors
 * `ListWithDetailBody` — exported from the archetype barrel.
 */
export function FeedBody({
  children,
  empty,
}: FeedBodyProps): React.ReactElement {
  return <div className="space-y-5 p-5">{empty ?? children}</div>;
}

FeedBody.displayName = "FeedBody";

export type FeedShellProps = FeedBodyProps & PageShellFrameProps;

/**
 * FeedShell — the page (ADR-0008) for a feed/inbox (H) surface: a chronological
 * stream of events with read state and filters — distinct from list-with-detail
 * (a sortable table of records). `title` is required and renders once, as the
 * page title, through `PageFrame`; `toolbar` holds the filter chips / tabs,
 * `count` the unread or result count, `actions` the page verbs
 * ("Mark all read"). Groups reuse `<SectionCard>` (flattened inside the
 * frame); rows are `<FeedItem>`. The frameless body lives in `FeedBody` for
 * the overlay / popover surface.
 */
export function FeedShell({
  children,
  empty,
  ...frame
}: FeedShellProps): React.ReactElement {
  return (
    <PageFrame {...frame}>
      <FeedBody empty={empty}>{children}</FeedBody>
    </PageFrame>
  );
}

FeedShell.displayName = "FeedShell";

/** Nearest vertically scrolling ancestor — the window or `main`, whichever the host app scrolls. */
function scrollerOf(el: HTMLElement): HTMLElement {
  for (let p = el.parentElement; p; p = p.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(p).overflowY) && p.scrollHeight > p.clientHeight) return p;
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
}

type NarrowSnapshot = { scroller: HTMLElement; top: number; row: HTMLElement | null };

export type FeedMasterDetailShellProps = PageShellFrameProps & {
  /** The list pane: the time-grouped stack of `<FeedItem>`s (mark the open one
   *  `selected`). Rendered through `FeedBody`. */
  children: React.ReactNode;
  /** The selected item's detail. Pass nothing (`null`) when no item is
   *  selected — selection state is consumer-owned. */
  detail?: React.ReactNode;
  /** Fills the detail pane when nothing is selected (on an `md`-wide surface;
   *  narrower, the list shows instead). Pass a `<StateView variant="empty">`. */
  emptyDetail: React.ReactNode;
  /** Clears the selection. On a narrow surface the shell renders a Back
   *  control above the detail that calls it, returning to the list. */
  onBack: () => void;
  /** Shown instead of both panes when the feed has no items at all. */
  empty?: React.ReactNode;
};

/**
 * FeedMasterDetailShell — the master-detail form of the feed/inbox (H) page:
 * the feed list beside the selected item's detail, both inside the one page
 * surface (ADR-0008). Same frame slots as `FeedShell` (`title`, `toolbar`,
 * `count`, `actions`, ...). Once the surface is `md` wide the panes sit side
 * by side and scroll independently; narrower, one column shows — the list, or
 * the selected detail with a Back control that calls `onBack`.
 */
export function FeedMasterDetailShell({
  children,
  detail,
  emptyDetail,
  onBack,
  empty,
  ...frame
}: FeedMasterDetailShellProps): React.ReactElement {
  const L = useLabels();
  const selected = detail != null && detail !== false;
  const splitRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const detailRef = React.useRef<HTMLDivElement>(null);
  const wasSelected = React.useRef(false);
  const snapshot = React.useRef<NarrowSnapshot | null>(null);

  // Below @3xl the list is display:none while an item is open, so the page
  // scroll is clamped and the focused row unmounts from the tab order. Keep the
  // list's scroll and the opened row, put both back when the selection clears.
  if (selected && !wasSelected.current && splitRef.current) {
    // Render phase on purpose: the DOM still shows the list, so scrollTop is not yet clamped.
    const scroller = scrollerOf(splitRef.current);
    const active = document.activeElement;
    snapshot.current = {
      scroller,
      top: scroller.scrollTop,
      row: active instanceof HTMLElement && listRef.current?.contains(active) ? active : null,
    };
  }
  React.useLayoutEffect(() => {
    const was = wasSelected.current;
    wasSelected.current = selected;
    const snap = snapshot.current;
    // A hidden list has no offsetParent: that is the narrow single-column state.
    const narrow = listRef.current?.offsetParent === null;
    if (selected && !was && narrow) {
      if (snap) snap.row ??= listRef.current?.querySelector<HTMLElement>('[aria-current="true"]') ?? null;
      detailRef.current?.scrollIntoView?.({ block: "start" });
    } else if (!selected && was && snap) {
      snapshot.current = null;
      snap.scroller.scrollTop = snap.top;
      if (snap.row?.isConnected) snap.row.focus({ preventScroll: true });
    }
  }, [selected]);

  return (
    <PageFrame {...frame}>
      {empty != null && empty !== false ? (
        <FeedBody empty={empty}>{children}</FeedBody>
      ) : (
        // The split keys off the surface's own width (a container query at the
        // md step, 48rem), not the viewport: beside an open sidebar a md-wide
        // viewport leaves the surface too narrow for two panes.
        <div className="@container">
          <div ref={splitRef} data-slot="feed-split" className="flex @3xl:h-[calc(100svh-12rem)] @3xl:min-h-96">
            <div
              ref={listRef}
              data-slot="feed-list"
              className={cn(
                "min-w-0 flex-1 @3xl:w-96 @3xl:flex-none @3xl:overflow-y-auto @3xl:border-r",
                selected && "@max-3xl:hidden",
              )}
            >
              <FeedBody>{children}</FeedBody>
            </div>
            <div
              ref={detailRef}
              data-slot="feed-detail"
              className={cn("min-w-0 flex-1 @3xl:overflow-y-auto", !selected && "@max-3xl:hidden")}
            >
              {selected ? (
                <>
                  <div className="border-b px-4 py-2 @3xl:hidden">
                    <Button variant="ghost" size="sm" onClick={onBack}>
                      <ArrowLeft className="h-4 w-4" />
                      {L.back}
                    </Button>
                  </div>
                  {detail}
                </>
              ) : (
                <div className="grid h-full place-items-center p-5">{emptyDetail}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageFrame>
  );
}

FeedMasterDetailShell.displayName = "FeedMasterDetailShell";
