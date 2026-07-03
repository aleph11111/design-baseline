import * as React from "react";
import {
  Bell,
  CreditCard,
  KeyRound,
  MonitorSmartphone,
  ReceiptText,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  SectionNavShell,
  type NavItem,
  type SectionNavGroup,
} from "design-baseline";

// Router-free render prop — a real app passes its router's `<NavLink>` here
// and its `<Outlet />` as `children`; this demo stands in with a plain `<a>`
// and a fixed "current" pathname (no interactivity needed for a still shot).
const renderLink = (item: NavItem, children: React.ReactNode) => (
  <a href={item.path}>{children}</a>
);

// Grouped account-settings nav — the two-level structure: app shell nav
// (elsewhere) → section nav (here) → page content (the child slot).
export function Grouped() {
  const groups: SectionNavGroup[] = [
    {
      label: "Profile",
      items: [{ title: "General", path: "/account/general", icon: User }],
    },
    {
      label: "Security",
      items: [
        { title: "Password", path: "/account/password", icon: KeyRound },
        { title: "Two-Factor", path: "/account/two-factor", icon: ShieldCheck },
        { title: "Sessions", path: "/account/sessions", icon: MonitorSmartphone },
      ],
    },
    // An ungrouped run — exercises the optional `label` on SectionNavGroup.
    { items: [{ title: "Notifications", path: "/account/notifications", icon: Bell }] },
  ];
  return (
    <div className="h-[480px] overflow-hidden rounded-lg border bg-card">
      <SectionNavShell
        groups={groups}
        pathname="/account/two-factor"
        renderLink={renderLink}
        ariaLabel="Account settings"
      >
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Two-Factor</h1>
          <p className="text-muted-foreground">Add a second step when signing in.</p>
        </div>
      </SectionNavShell>
    </div>
  );
}

// A single group plus an ungrouped item — the billing section, showing a
// leaner nav than the Grouped cell above.
export function SingleGroup() {
  const groups: SectionNavGroup[] = [
    {
      label: "Billing",
      items: [
        { title: "Subscription", path: "/billing/subscription", icon: CreditCard },
        { title: "Invoices", path: "/billing/invoices", icon: ReceiptText },
      ],
    },
  ];
  return (
    <div className="h-[360px] overflow-hidden rounded-lg border bg-card">
      <SectionNavShell
        groups={groups}
        pathname="/billing/subscription"
        renderLink={renderLink}
        ariaLabel="Billing settings"
      >
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground">Your current plan and renewal date.</p>
        </div>
      </SectionNavShell>
    </div>
  );
}
