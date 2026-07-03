import * as React from "react";
import { Package } from "lucide-react";
import { Badge, Button, PageHeader } from "design-baseline";

// The canonical page title block — title only, no icon/badges/actions.
export function TitleAndSubtitle() {
  return (
    <PageHeader title="Customers" subtitle="Everyone who's bought at least once." />
  );
}

// Full row: decorative icon, status badges beside the title, and a right-
// aligned actions cluster — the detail-overview header shape.
export function IconBadgesActions() {
  return (
    <PageHeader
      title="Order #1042"
      subtitle="Acme Corp · 8 Nov 2024"
      icon={Package}
      badges={
        <>
          <Badge variant="success">Paid</Badge>
          <Badge variant="warning">Packing</Badge>
        </>
      }
      actions={
        <>
          <Button variant="outline" size="sm">Export</Button>
          <Button size="sm">Mark as shipped</Button>
        </>
      }
    />
  );
}

// Leaf page with a back affordance and no actions — the form-page shape.
export function BackLink() {
  return (
    <PageHeader title="New customer" backHref="#" backLabel="Back to customers" />
  );
}
