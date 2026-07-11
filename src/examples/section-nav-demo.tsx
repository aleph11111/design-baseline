import * as React from "react";
import {
  Bell,
  CreditCard,
  Image as ImageIcon,
  KeyRound,
  MonitorSmartphone,
  ReceiptText,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import {
  SectionNavShell,
  type NavItem,
  type SectionNavGroup,
} from "@/components/layout";

// ---------------------------------------------------------------------------
// Demo domain — types FIRST, zero reference to any source project.
// A SaaS "Account settings" section: nothing inventory/order/LEGO-shaped.
// ---------------------------------------------------------------------------

interface AccountSection {
  path: string;
  title: string;
  body: string;
}

const SECTIONS: AccountSection[] = [
  { path: "/account/general", title: "General", body: "Display name, language, and timezone." },
  { path: "/account/avatar", title: "Avatar", body: "Upload or remove your profile picture." },
  { path: "/account/password", title: "Password", body: "Change the password used to sign in." },
  { path: "/account/two-factor", title: "Two-Factor", body: "Add a second step when signing in." },
  { path: "/account/sessions", title: "Active Sessions", body: "Devices currently signed in." },
  { path: "/account/subscription", title: "Subscription", body: "Your current plan and renewal date." },
  { path: "/account/invoices", title: "Invoices", body: "Download past billing statements." },
  { path: "/account/payment-methods", title: "Payment Methods", body: "Cards on file for billing." },
  { path: "/account/notifications", title: "Notifications", body: "Choose which emails you receive." },
];

// Nav config is consumer-owned (route + label + icon) — the primitive ships none.
const NAV_GROUPS: SectionNavGroup[] = [
  {
    label: "Profile",
    items: [
      { title: "General", path: "/account/general", icon: User },
      { title: "Avatar", path: "/account/avatar", icon: ImageIcon },
    ],
  },
  {
    label: "Security",
    items: [
      { title: "Password", path: "/account/password", icon: KeyRound },
      { title: "Two-Factor", path: "/account/two-factor", icon: ShieldCheck },
      { title: "Active Sessions", path: "/account/sessions", icon: MonitorSmartphone },
    ],
  },
  {
    label: "Billing",
    items: [
      { title: "Subscription", path: "/account/subscription", icon: CreditCard },
      { title: "Invoices", path: "/account/invoices", icon: ReceiptText },
      { title: "Payment Methods", path: "/account/payment-methods", icon: Wallet },
    ],
  },
  // An ungrouped run — exercises the optional `label` on SectionNavGroup.
  {
    items: [{ title: "Notifications", path: "/account/notifications", icon: Bell }],
  },
];

/**
 * Second consumer for `<SectionNavShell>`. Router-free on purpose: a plain
 * `<a>`-style render-prop and local pathname state stand in for a real router,
 * so this demo compiles with no routing dependency. A real app passes its
 * router's `<NavLink>` to `renderLink` and its `<Outlet />` as `children`.
 */
export function SectionNavDemo(): React.ReactElement {
  const [pathname, setPathname] = React.useState("/account/general");
  const active: AccountSection = SECTIONS.find((s) => s.path === pathname) ?? SECTIONS[0]!;

  const renderLink = (item: NavItem, children: React.ReactNode): React.ReactNode => (
    <a
      href={item.path}
      onClick={(e) => {
        e.preventDefault();
        setPathname(item.path);
      }}
    >
      {children}
    </a>
  );

  return (
    <div className="h-full min-h-[30rem]">
      <SectionNavShell groups={NAV_GROUPS} pathname={pathname} renderLink={renderLink} ariaLabel="Account settings">
        {/* In a routed app this content is the router's <Outlet /> — typically a
            <SettingsPageShell> from the tabbed-settings archetype. */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{active.title}</h1>
          <p className="text-muted-foreground">{active.body}</p>
        </div>
      </SectionNavShell>
    </div>
  );
}
