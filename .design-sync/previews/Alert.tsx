import * as React from "react";
import { AlertTriangle, Terminal } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "design-baseline";

// Default variant — neutral, informational.
export function Default() {
  return (
    <div className="max-w-md">
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>
          You can add components and dependencies to your app using the CLI.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Destructive variant — a failed action with real consequence copy.
export function Destructive() {
  return (
    <div className="max-w-md">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>
          Your card was declined. Update your billing details to avoid
          service interruption.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Stacked in context — both variants inside one settings panel, the way a
// form page surfaces a save confirmation followed by a validation error.
export function StackedInPanel() {
  return (
    <div className="max-w-md space-y-3">
      <Alert variant="success">
        <AlertTitle>Changes saved</AlertTitle>
        <AlertDescription>
          Your notification preferences were updated.
        </AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Email not verified</AlertTitle>
        <AlertDescription>
          Confirm your email address to receive billing alerts.
        </AlertDescription>
      </Alert>
    </div>
  );
}
