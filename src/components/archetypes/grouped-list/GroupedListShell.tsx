import * as React from "react";
import { StateView } from "@/components/ui/state-view";
import { resolveListState } from "@/components/archetypes/shared";
import {
  SurfaceHeaderSlot,
  type SurfaceHeaderSlotProps,
} from "@/components/layout/SurfaceHeaderSlot";
import { cn } from "@/lib/utils";

export type GroupedListShellProps = {
  /** Page-level toolbar slot. Rendered as a bare flex row above the sections region. */
  toolbar?: React.ReactNode;
  /** True while the initial fetch is in flight. */
  isLoading?: boolean;
  /** Fetch error; null/undefined when healthy. */
  error?: unknown;
  /** Called by the error panel's "Try again" button. */
  onRetry?: () => void;
  /** True when there are zero sections and zero ungrouped rows. */
  isEmpty?: boolean;
  /** Copy shown in the page-level empty state. */
  emptyMessage?: string;
  /** `<GroupedListSection>` instances. */
  children?: React.ReactNode;

  className?: string;
} & SurfaceHeaderSlotProps;

/**
 * Page-level wrapper for an Archetype K (grouped-list) page. Renders an
 * optional toolbar above a vertical stack of `<GroupedListSection>` children,
 * and handles the page-level loading, empty, and error planes.
 *
 * The inner table chrome is delegated to `<ListWithDetailShell>` inside each
 * `<GroupedListSection>`; this component does not render any table itself.
 */
export function GroupedListShell({
  toolbar,
  isLoading,
  error,
  onRetry,
  isEmpty,
  emptyMessage,
  children,
  kicker,
  title,
  headerActions,
  className,
}: GroupedListShellProps): React.ReactElement {
  const listState = resolveListState({ isLoading, error, isEmpty: isEmpty === true });
  const showLoading = listState === "loading";
  const showError = listState === "error";
  const showEmpty = listState === "empty";
  const showSections = listState === "content";

  return (
    <div className={cn("space-y-5", className)}>
      <SurfaceHeaderSlot
        kicker={kicker}
        title={title}
        headerActions={headerActions}
      />

      {/* Page-level toolbar: a bare flex row (no card chrome) — the same
          standalone-toolbar treatment as feed-inbox. The grouped sections below
          supply their own card boundaries. */}
      {toolbar && (
        <div className="flex flex-wrap items-center gap-3">{toolbar}</div>
      )}

      {showLoading && <StateView variant="loading" />}
      {showError && <StateView variant="error" error={error} onRetry={onRetry} />}
      {showEmpty && (
        <StateView variant="empty" message={emptyMessage ?? "No items yet"} />
      )}

      {showSections && <div className="space-y-5">{children}</div>}
    </div>
  );
}

GroupedListShell.displayName = "GroupedListShell";
