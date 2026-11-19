"use client";
import * as React from "react"

import { cn } from "../../lib/utils"
import { useCompactDensity as useCompact } from "./toolbar-band"
import { ScrollCue } from "../archetypes/shared/ScrollCue"

/** An unprefixed vertical padding utility (`p-0`, `py-4`, `pt-1`, …) in a consumer className. */
const VERTICAL_PADDING = /(^|\s)p[ytb]?-\S+/

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
  const compact = useCompact()
  return (
    // The shared horizontal-overflow cue: a right-edge fade while columns lie
    // past the edge (phone), none when the table fits.
    <ScrollCue className="w-full" scrollClassName="relative w-full">
      <table
        ref={ref}
        className={cn("w-full caption-bottom", compact ? "text-[13px]" : "text-sm", className)}
        {...props}
      />
    </ScrollCue>
  )
})
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      useCompact() ? "h-9 px-3" : "h-12 px-4",
      "text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    // a row control (the 32px ⋯ trigger, a 36px cell input) sets the row height, so its cell drops to py-0.5 (~37–41px rows);
    // skipped when the consumer sets vertical padding — the `:has()` selector would otherwise out-rank its utility
    className={cn(
      useCompact() ? cn("px-3 py-2", !VERTICAL_PADDING.test(className ?? "") && "[&:has(button,input)]:py-0.5") : "p-4",
      "align-middle [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
