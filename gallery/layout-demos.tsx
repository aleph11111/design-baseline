/**
 * Gallery-local demos for the shared LAYOUT primitives (chrome that isn't a page
 * archetype). Lets the gallery show them for visual-consistency review, the same
 * way archetype demos do. Gallery-only — not part of the shipped baseline.
 */

import * as React from "react";
import { Box, Plus, Settings } from "lucide-react";
import {
  AuthCard,
  PageHeader,
  SectionCard,
  SectionHeading,
  StatTile,
  StatTileRow,
} from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type LayoutPrim = {
  slug: string;
  displayName: string;
  Demo: React.ComponentType;
};

/** Small labelled wrapper so several variants of one primitive stack clearly. */
function Variant({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function PageHeaderDemo() {
  return (
    <div className="space-y-8 px-6 py-6">
      <Variant label="Title + subtitle">
        <PageHeader title="Customers" subtitle="Everyone who's bought at least once." />
      </Variant>
      <Variant label="Icon + subtitle + actions">
        <PageHeader
          title="Order #1042"
          subtitle="Acme Corp · 8 Nov 2024"
          icon={Box}
          actions={
            <>
              <Button variant="outline" size="sm">Export</Button>
              <Button size="sm">Edit</Button>
            </>
          }
        />
      </Variant>
      <Variant label="With back link">
        <PageHeader title="New contact" backHref="#" backLabel="Back to contacts" />
      </Variant>
    </div>
  );
}

function SectionHeadingDemo() {
  return (
    <div className="space-y-8 px-6 py-6">
      <Variant label="Title only">
        <SectionHeading title="Details" />
      </Variant>
      <Variant label="Title + description">
        <SectionHeading title="Recent activity" description="Across all channels this week." />
      </Variant>
      <Variant label="Title + actions">
        <SectionHeading
          title="Resources"
          actions={<Button variant="ghost" size="sm" className="-my-1.5 h-7 text-xs">Add</Button>}
        />
      </Variant>
    </div>
  );
}

function SectionCardDemo() {
  return (
    <div className="max-w-2xl space-y-8 px-6 py-6">
      <Variant label="Default tone · padded body">
        <SectionCard title="Summary">
          <p className="text-sm text-muted-foreground">
            Free-form padded content lives here.
          </p>
        </SectionCard>
      </Variant>
      <Variant label="Flush body · ruled rows">
        <SectionCard title="Attributes" flush>
          <div className="divide-y divide-border text-sm">
            <div className="flex justify-between px-5 py-2.5"><span className="text-muted-foreground">Status</span><span className="font-medium">Active</span></div>
            <div className="flex justify-between px-5 py-2.5"><span className="text-muted-foreground">Owner</span><span className="font-medium">Ada Reyes</span></div>
          </div>
        </SectionCard>
      </Variant>
      <Variant label="Muted tone + actions">
        <SectionCard
          title="Links"
          tone="muted"
          actions={<Badge variant="secondary">2</Badge>}
        >
          <p className="text-sm text-muted-foreground">Lightest surface — for reference panels.</p>
        </SectionCard>
      </Variant>
    </div>
  );
}

function StatTilesDemo() {
  return (
    <div className="max-w-3xl space-y-8 px-6 py-6">
      <Variant label="3 columns">
        <StatTileRow columns={3}>
          <StatTile label="Revenue" value="€58.9k" hint="vs last month" />
          <StatTile label="Orders" value="812" hint="paid + fulfilled" />
          <StatTile label="Avg order" value="€72" />
        </StatTileRow>
      </Variant>
      <Variant label="4 columns">
        <StatTileRow columns={4}>
          <StatTile label="Plays" value="142" />
          <StatTile label="Mean session" value="2h 35m" />
          <StatTile label="Rating" value="5" />
          <StatTile label="Weight" value="3.9" hint="/ 5" />
        </StatTileRow>
      </Variant>
    </div>
  );
}

function AuthCardDemo() {
  return (
    <AuthCard
      title="Sign in"
      description="Welcome back — enter your credentials."
      icon={Settings}
      footer={<a className="text-primary hover:underline" href="#">Forgot password?</a>}
    >
      <div className="space-y-3">
        <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Email" />
        <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Password" type="password" />
        <Button className="w-full">Sign in</Button>
      </div>
    </AuthCard>
  );
}

export const LAYOUT_PRIMS: LayoutPrim[] = [
  { slug: "page-header", displayName: "PageHeader", Demo: PageHeaderDemo },
  { slug: "section-heading", displayName: "SectionHeading", Demo: SectionHeadingDemo },
  { slug: "section-card", displayName: "SectionCard", Demo: SectionCardDemo },
  { slug: "stat-tiles", displayName: "StatTileRow / StatTile", Demo: StatTilesDemo },
  { slug: "auth-card", displayName: "AuthCard", Demo: AuthCardDemo },
];

export function findLayoutPrim(slug: string | undefined): LayoutPrim | undefined {
  return LAYOUT_PRIMS.find((p) => p.slug === slug);
}
