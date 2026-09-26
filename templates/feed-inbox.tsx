// Scaffolded by `design-baseline new-page feed-inbox __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/feed-inbox.md
import { FeedShell, FeedItem } from "design-baseline/archetypes/feed-inbox";
import { StateView } from "@/components/ui/state-view";

type __Name__Item = { id: string; title: string; unread: boolean };

// TODO: replace with the page's real data hook.
function use__Name__Items(): {
  items: __Name__Item[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
} {
  return { items: [], isLoading: false, error: null, refetch: () => {} };
}

export function __Name__Page() {
  const { items, isLoading, error, refetch } = use__Name__Items();

  return (
    <FeedShell
      title="__Name__"
      empty={
        !isLoading && !error && items.length === 0 ? (
          <StateView variant="empty" message="Nothing here" />
        ) : undefined
      }
    >
      {/* The feed's row shape is known ahead of the fetch, so a skeleton may
          replace the text loader via StateView's `loadingSkeleton`. */}
      {isLoading && <StateView variant="loading" />}
      {!isLoading && error != null && (
        <StateView variant="error" error={error} onRetry={refetch} />
      )}
      {!isLoading &&
        error == null &&
        items.map((item) => (
          <FeedItem key={item.id} title={item.title} unread={item.unread} />
        ))}
    </FeedShell>
  );
}
