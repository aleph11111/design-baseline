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

/** The open intersection: the row (line) and the column it was opened from. */
export type MatrixSelection = { rowId: string; columnKey: string };

/**
 * The selection-driven, non-modal inspector (matrix-grid contract, Layer 6
 * "Inspector slot"). The shell owns layout and navigation only — never saving:
 * a draft-with-apply body and a per-field autosave body are both conformant.
 */
export type MatrixInspectorProps = {
  /** The open selection; `null` = closed. Controlled by the consumer. */
  selection: MatrixSelection | null;
  /** Applies a switch (or a close, `null`) once the guard allowed it. */
  onSelectionChange: (next: MatrixSelection | null) => void;
  /**
   * Line-switch guard, asked before every switch: a grid click, prev / next,
   * close and Escape. Return (or resolve) `false` to block — selection and
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

type DockProps = Omit<MatrixInspectorProps, "selection" | "onSelectionChange" | "onBeforeSelect"> & {
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

function NavButtons({ onClose, onPrev, onNext }: Pick<DockProps, "onClose" | "onPrev" | "onNext">) {
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

/** Desk / laptop: a sticky ~480px column beside the grid. No backdrop, the grid stays live. */
export function MatrixInspectorDock({ title, description, footer, children, ...nav }: DockProps) {
  return (
    <aside
      data-slot="matrix-inspector"
      aria-label={typeof title === "string" ? title : undefined}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          nav.onClose();
        }
      }}
      className="sticky top-4 flex max-h-[calc(100svh-2rem)] w-[480px] max-w-[50%] shrink-0 flex-col overflow-x-hidden rounded-lg border bg-background shadow-sm"
    >
      <header className="flex items-start gap-2 border-b px-5 py-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <NavButtons {...nav} />
      </header>
      <div className="min-w-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">{children}</div>
      {footer && <footer className="flex justify-end gap-2 border-t px-5 py-3">{footer}</footer>}
    </aside>
  );
}

/** Phone: the existing full-screen overlay. */
export function MatrixInspectorSheet({ title, description, footer, children, ...nav }: DockProps) {
  return (
    <Sheet open onOpenChange={(open) => !open && nav.onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        data-slot="matrix-inspector"
        {...(description ? {} : { "aria-describedby": undefined })}
        className="flex w-full flex-col gap-0 overflow-x-hidden p-0 sm:max-w-none"
      >
        <SheetHeader className="flex-row items-start gap-2 space-y-0 border-b px-4 py-3 text-left">
          <div className="min-w-0 flex-1 space-y-0.5">
            <SheetTitle className="truncate text-base">{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </div>
          <NavButtons {...nav} />
        </SheetHeader>
        <div className="min-w-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t px-4 py-3">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}
