"use client";
import * as React from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../ui/sheet";
import { useLabels } from "../../../lib/labels";
import { cn } from "../../../lib/utils";
import { DETAIL_OVERLAY_CLASS } from "../shared/detailOverlay";

/** The open intersection: the row (line) and the column it was opened from. */
export type MatrixSelection = { rowId: string; columnKey: string };

/**
 * The selection-driven inspector (matrix-grid contract, Layer 6 "Inspector
 * slot"), rendered as the edge overlay. The shell owns layout and navigation only — never saving:
 * a draft-with-apply body and a per-field autosave body are both conformant.
 */
export type MatrixInspectorProps = {
  /** The open selection; `null` = closed. Controlled by the consumer. */
  selection: MatrixSelection | null;
  /** Applies a switch (or a close, `null`) once the guard allowed it. */
  onSelectionChange: (next: MatrixSelection | null) => void;
  /**
   * Line-switch guard, asked before every switch: a grid click, prev / next,
   * close, Escape and a backdrop click. Return (or resolve) `false` to block — selection and
   * inspector then stay unchanged. Omitted: every switch is immediate.
   */
  onBeforeSelect?: (
    next: MatrixSelection | null,
    current: MatrixSelection | null,
  ) => boolean | Promise<boolean>;
  /** Inspector heading (e.g. the line label). */
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional footer row — e.g. an apply button for a draft-with-apply body. */
  footer?: React.ReactNode;
  /** The body: tab-free, never scrolling sideways. */
  children: React.ReactNode;
};

type PanelProps = Omit<MatrixInspectorProps, "selection" | "onSelectionChange" | "onBeforeSelect"> & {
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

function NavButtons({ onClose, onPrev, onNext }: Pick<PanelProps, "onClose" | "onPrev" | "onNext">) {
  const L = useLabels();
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button variant="outline" size="icon" aria-label={L.previous} disabled={!onPrev} onClick={onPrev}>
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" aria-label={L.next} disabled={!onNext} onClick={onNext}>
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label={L.close} onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

/**
 * The inspector panel: the standard edge overlay over a dimmed backdrop on
 * every viewport, with list-with-detail's geometry (ADR-0010, ADR-0018). The
 * grid is inert behind the backdrop; a backdrop click or Escape closes through
 * the shell's guard. A body popup (Select, Popover) handles its own Escape.
 */
export function MatrixInspectorSheet({ title, description, footer, children, ...nav }: PanelProps) {
  return (
    <Sheet open onOpenChange={(open) => !open && nav.onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        data-slot="matrix-inspector"
        {...(description ? {} : { "aria-describedby": undefined })}
        className={cn(DETAIL_OVERLAY_CLASS, "overflow-x-hidden")}
      >
        <SheetHeader className="flex-row items-start gap-2 space-y-0 border-b px-5 py-3 text-left">
          {/* contain:inline-size — a long title truncates instead of widening the overlay. */}
          <div className="min-w-0 flex-1 space-y-0.5 [contain:inline-size]">
            <SheetTitle className="truncate text-base">{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </div>
          <NavButtons {...nav} />
        </SheetHeader>
        <div className="min-w-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t px-5 py-3">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}
