export type ListStatePhase = "loading" | "error" | "empty" | "content";

export type ResolveListStateInput = {
  /** True while the fetch backing the list is in flight. */
  isLoading?: boolean;
  /** Fetch error; null/undefined when healthy. */
  error?: unknown;
  /** True when there is no data to show once loading/error are resolved. */
  isEmpty: boolean;
};

/**
 * Shared loading -> error -> empty -> content precedence used by every
 * list-shaped archetype shell: loading wins over error, error wins over
 * empty, empty wins over content.
 */
export function resolveListState({
  isLoading,
  error,
  isEmpty,
}: ResolveListStateInput): ListStatePhase {
  if (isLoading === true) return "loading";
  if (error != null) return "error";
  if (isEmpty) return "empty";
  return "content";
}
