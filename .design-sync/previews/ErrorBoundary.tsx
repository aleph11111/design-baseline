import { ErrorBoundary } from "design-baseline";

// Happy path — children render straight through untouched.
export function Children() {
  return (
    <ErrorBoundary>
      <div className="w-80 rounded-md border p-4">
        <h4 className="text-sm font-semibold">Account overview</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything is wired up correctly, so the boundary simply renders
          its children without intervening.
        </p>
      </div>
    </ErrorBoundary>
  );
}

// Component that throws during render, so the boundary's own default
// fallback UI (Alert + retry button) is what's on screen.
function Explode(): JSX.Element {
  throw new Error("Failed to load account overview");
}

export function DefaultFallback() {
  return (
    <div className="max-w-md">
      <ErrorBoundary>
        <Explode />
      </ErrorBoundary>
    </div>
  );
}

// Custom fallback — the `fallback` prop swaps in caller-supplied content
// instead of the built-in Alert.
export function CustomFallback() {
  return (
    <div className="max-w-md">
      <ErrorBoundary
        fallback={
          <div className="rounded-md border border-dashed p-6 text-center">
            <p className="text-sm font-medium">This widget couldn't load.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try refreshing the dashboard, or contact support if this keeps
              happening.
            </p>
          </div>
        }
      >
        <Explode />
      </ErrorBoundary>
    </div>
  );
}
