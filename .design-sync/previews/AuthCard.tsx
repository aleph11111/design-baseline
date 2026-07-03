import * as React from "react";
import { AuthCard, Button, Input, Label } from "design-baseline";
import { KeyRound, ShieldAlert } from "lucide-react";

// The canonical sign-in screen — centered card, realistic email/password form.
export function SignIn() {
  return (
    <AuthCard
      title="Sign in"
      description="Welcome back — enter your credentials to continue."
      icon={KeyRound}
      footer={
        <span className="text-muted-foreground">
          No account?{" "}
          <a className="font-medium text-primary hover:underline" href="#">
            Request access
          </a>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <Label htmlFor="auth-email">Email</Label>
          <Input id="auth-email" type="email" placeholder="name@company.com" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="auth-pw">Password</Label>
            <a className="text-xs text-muted-foreground hover:text-foreground" href="#">
              Forgot?
            </a>
          </div>
          <Input id="auth-pw" type="password" placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}

// Access-wall variant — no form, just a message + a single action.
export function NotAuthorized() {
  return (
    <AuthCard
      title="Not authorized"
      description="Your account doesn't have access to the Finance workspace."
      icon={ShieldAlert}
      footer={<span className="text-muted-foreground">Wrong account? Sign out and try again.</span>}
    >
      <Button variant="outline" className="w-full">
        Request access
      </Button>
    </AuthCard>
  );
}
