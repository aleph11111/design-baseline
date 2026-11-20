/**
 * The edge-overlay geometry every side surface shares (ADR-0010): full-screen
 * below `sm`; from `sm` up `min-content` wide, clamped between a 28rem floor
 * and a ceiling of the viewport minus a 4rem gutter. Used on `SheetContent`
 * by list-with-detail's detail overlay and matrix-grid's inspector (ADR-0018).
 */
export const DETAIL_OVERLAY_CLASS =
  "flex w-full flex-col gap-0 p-0 sm:w-min sm:min-w-md sm:max-w-[calc(100vw-4rem)]";
