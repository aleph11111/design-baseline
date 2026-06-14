import * as React from "react";
import { StateView } from "@/components/ui/state-view";
import { cn } from "@/lib/utils";

export type GroupedListShellProps = {
  /** Page-level toolbar slot. Rendered as a single card bar above the sections region. */
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
};

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
  className,
}: GroupedListShellProps): React.ReactElement {
  const showLoading = isLoading === true;
  const showError = !showLoading && error != null;
  const showEmpty = !showLoading && !showError && isEmpty === true;
  const showSections = !showLoading && !showError && !showEmpty;

  return (
    <div className={cn("space-y-6", className)}>
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

      {showSections && <div className="space-y-8">{children}</div>}
    </div>
  );
}

GroupedListShell.displayName = "GroupedListShell";
