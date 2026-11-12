"use client";
import * as React from "react";
import { ListFilter, SlidersHorizontal } from "lucide-react";
import { ToolbarBandContext, ToolbarSizeContext, useControlSize } from "../ui/toolbar-band";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useIsMobile } from "../../hooks/use-mobile";
import { cn } from "../../lib/utils";
import { useLabels } from "../../lib/labels";

/**
 * The toolbar band — one owner of the ruled band chrome and its inner layout.
 * Internal (not barrel-exported, like `SurfaceFrame`): `PageFrame` and
 * `SettingsTableBody` render it; consumers reach it through them.
 */

/** Copy of the mobile filter sheet. English defaults; override per page. */
export type FilterLabels = { filter?: string; done?: string; reset?: string };

/** Most scoping fields the desktop toolbar band renders inline; the rest go
 *  into the filter sheet (STYLE.md "Toolbar field labels"). */
export const MAX_INLINE_FIELDS = 4;

/** `cond && <X />` yields `false`: an absent slot, not an empty band. */
export const has = (slot: React.ReactNode): boolean => slot != null && slot !== false;

/** The ruled band chrome — the only spelling of `border-b px-4 py-3`. */
export function BandChrome({
  children,
  className,
  slot,
}: {
  children: React.ReactNode;
  className?: string;
  /** Optional `data-slot` for a shell that names its band. */
  slot?: string;
}): React.ReactElement {
  return (
    <div data-toolbar-band="" data-slot={slot} className={cn("border-b px-4 py-3", className)}>
      {children}
    </div>
  );
}

export type ToolbarBandProps = {
  toolbar?: React.ReactNode;
  viewSwitch?: React.ReactNode;
  filterCount?: number;
  filterSummary?: React.ReactNode;
  onResetFilters?: () => void;
  filterLabels?: FilterLabels;
  count?: React.ReactNode;
  /** Shell-owned actions (bulk, add) in the right-hand cluster, after the count. */
  trailing?: React.ReactNode;
  viewOptions?: React.ReactNode;
  /** Label of the view-options trigger; defaults to the baseline "View" copy. */
  viewOptionsLabel?: string;
};

/** The band's inner layout: desktop row or, below `md`, the filter-sheet row. */
export function ToolbarBand({
  toolbar,
  viewSwitch,
  filterCount,
  filterSummary,
  onResetFilters,
  filterLabels,
  count,
  trailing,
  viewOptions,
  viewOptionsLabel: viewOptionsLabelProp,
}: ToolbarBandProps): React.ReactElement {
  const isMobile = useIsMobile();
  const L = useLabels();
  const viewOptionsLabel = viewOptionsLabelProp ?? L.view;

  if (isMobile) {
    return (
      <MobileBand
        toolbar={has(toolbar) ? toolbar : null}
        viewSwitch={has(viewSwitch) ? viewSwitch : null}
        filterCount={filterCount}
        filterSummary={filterSummary}
        onResetFilters={onResetFilters}
        labels={filterLabels}
        count={has(count) ? count : null}
        trailing={has(trailing) ? trailing : null}
        viewOptions={has(viewOptions) ? viewOptions : null}
        viewOptionsLabel={viewOptionsLabel}
      />
    );
  }

  // Desktop: one row of at most MAX_INLINE_FIELDS scoping fields; the rest
  // collapse into the same filter sheet the phone band uses.
  const fields = flattenFields(toolbar);
  const inlineFields = fields.slice(0, MAX_INLINE_FIELDS);
  const overflowFields = fields.slice(MAX_INLINE_FIELDS);
  return (
    <div className="flex flex-nowrap items-center justify-between gap-x-4">
      {/* p-1/-m-1: room for the 4px focus ring + offset, which overflow-x clips. */}
      <div className="-m-1 flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-x-auto p-1">
        <ToolbarBandContext.Provider value={true}>
          {has(viewSwitch) && (
            // max-w-full + overflow-x-auto: a switch wider than the band scrolls in its own
            // box instead of being cut at the card edge. shrink-0: crowded inline fields
            // must not squeeze it; the band scrolls instead. p-1/-m-1 keeps the focus ring unclipped.
            <div data-view-switch="" className="-m-1 max-w-full shrink-0 overflow-x-auto p-1">
              {viewSwitch}
            </div>
          )}
          {inlineFields}
        </ToolbarBandContext.Provider>
        {overflowFields.length > 0 && (
          <FilterSheet
            filterCount={filterCount}
            onResetFilters={onResetFilters}
            labels={filterLabels}
          >
            {overflowFields}
          </FilterSheet>
        )}
      </div>
      {has(count) || has(trailing) || has(viewOptions) ? (
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {has(count) && <span className="text-sm text-muted-foreground">{count}</span>}
          {has(trailing) && trailing}
          {has(viewOptions) && <ViewOptionsMenu label={viewOptionsLabel}>{viewOptions}</ViewOptionsMenu>}
        </div>
      ) : null}
    </div>
  );
}

/** The one "View" menu — labelled button on desktop, icon button below `md`. */
function ViewOptionsMenu({
  label,
  iconOnly,
  children,
}: {
  label: string;
  iconOnly?: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  const touch = useControlSize() === "lg";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {iconOnly ? (
          <Button
            variant="outline"
            size={touch ? "icon-lg" : "icon"}
            className="ml-auto shrink-0"
            aria-label={label}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline">
            <SlidersHorizontal className="h-4 w-4" />
            {label}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The top-level toolbar fields, looking through fragments. */
function flattenFields(node: React.ReactNode, prefix = ""): React.ReactNode[] {
  return React.Children.toArray(node).flatMap((child) => {
    const key = `${prefix}${React.isValidElement(child) ? child.key : ""}`;
    if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment) {
      return flattenFields(child.props.children, `${key}/`);
    }
    return [prefix && React.isValidElement(child) ? React.cloneElement(child, { key: `${prefix}${child.key}` }) : child];
  });
}

/**
 * The Filter button and its bottom sheet. Below `md` it holds every `toolbar`
 * filter; on desktop only the fields past `MAX_INLINE_FIELDS`. Each filter is
 * still a joined-label row (the band context), at the `lg` touch step with one
 * shared label column.
 */
function FilterSheet({
  children,
  filterCount,
  onResetFilters,
  labels,
}: {
  children: React.ReactNode;
  filterCount?: number;
  onResetFilters?: () => void;
  labels?: FilterLabels;
}): React.ReactElement {
  const L = useLabels();
  const filterLabel = labels?.filter ?? L.filter;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="shrink-0">
          <ListFilter className="h-4 w-4" />
          {filterLabel}
          {filterCount ? (
            <span
              data-filter-count=""
              className="rounded-full bg-primary px-1.5 text-xs tabular-nums text-primary-foreground"
            >
              {filterCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        aria-describedby={undefined}
        className="flex max-h-[85svh] flex-col overflow-y-auto rounded-t-xl"
      >
        <SheetHeader className="text-left">
          <SheetTitle>{filterLabel}</SheetTitle>
        </SheetHeader>
        {/* Back inside the band (the sheet ended it), at the touch step;
            every joined label shares one column so the boxes line up.
            An app's own flex wrapper (div/form/fieldset, any depth) stacks too;
            the joined trigger is a button, so it is never matched. */}
        <ToolbarBandContext.Provider value={true}>
          <ToolbarSizeContext.Provider value="lg">
            <div
              data-filter-sheet=""
              className="flex flex-col gap-3 [&_[data-joined-label]]:w-[130px] [&_[data-joined-label]]:max-w-none [&_[data-joined-label]]:shrink-0! [&_[data-joined-label]_.truncate]:line-clamp-2 [&_[data-joined-label]_.truncate]:min-w-0 [&_[data-joined-label]_.truncate]:whitespace-normal! [&_[data-joined-label]_.truncate]:[overflow-wrap:anywhere] [&_button:has([data-joined-label])]:grid-cols-[130px_minmax(0,1fr)_auto]! [&_[role=radiogroup]:has(>[data-joined-label])]:justify-start! [&>*]:w-full! [&_:is(div,form,fieldset).flex]:flex-col [&_:is(div,form,fieldset).flex]:items-stretch [&_:is(div,form,fieldset).flex]:gap-3 [&_:is(div,form,fieldset).flex>*]:w-full!"
            >
              {children}
            </div>
          </ToolbarSizeContext.Provider>
        </ToolbarBandContext.Provider>
        <SheetFooter className="flex-row gap-2 sm:space-x-0">
          {onResetFilters && (
            <Button variant="ghost" size="lg" className="px-4" onClick={onResetFilters}>
              {labels?.reset ?? L.reset}
            </Button>
          )}
          <SheetClose asChild>
            <Button size="lg" className="ml-auto">
              {labels?.done ?? L.done}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/**
 * The band below `md`: the view switch (if any) on its own sideways-scrolling
 * line, then one row — a Filter button carrying the set-filter count, the
 * truncated filter summary, the result count, shell actions, and the View menu
 * as an icon. The `toolbar` filters live in a bottom sheet, each still a
 * joined-label row (the band context), at the `lg` touch step with one shared
 * label column.
 */
function MobileBand({
  toolbar,
  viewSwitch,
  filterCount,
  filterSummary,
  onResetFilters,
  labels,
  count,
  trailing,
  viewOptions,
  viewOptionsLabel,
}: {
  toolbar: React.ReactNode;
  viewSwitch: React.ReactNode;
  filterCount?: number;
  filterSummary?: React.ReactNode;
  onResetFilters?: () => void;
  labels?: FilterLabels;
  count: React.ReactNode;
  trailing: React.ReactNode;
  viewOptions: React.ReactNode;
  viewOptionsLabel: string;
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-2">
      {viewSwitch && (
        <div data-view-switch="" className="-mx-4 overflow-x-auto px-4">
          <ToolbarBandContext.Provider value={true}>{viewSwitch}</ToolbarBandContext.Provider>
        </div>
      )}
      <div className="flex items-center gap-2">
        {toolbar && (
          <FilterSheet filterCount={filterCount} onResetFilters={onResetFilters} labels={labels}>
            {toolbar}
          </FilterSheet>
        )}
        {has(filterSummary) && (
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {filterSummary}
          </span>
        )}
        {count != null && (
          <span className="ml-auto shrink-0 text-sm text-muted-foreground">{count}</span>
        )}
        {trailing != null && <div className="ml-auto flex shrink-0 items-center gap-2">{trailing}</div>}
        {viewOptions && (
          <ViewOptionsMenu label={viewOptionsLabel} iconOnly>
            {viewOptions}
          </ViewOptionsMenu>
        )}
      </div>
    </div>
  );
}
