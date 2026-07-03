import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "design-baseline";

// Single-open FAQ accordion — the common support-page shape. One item
// starts expanded (defaultValue) so the card shows both states at once.
export function FaqSingle() {
  return (
    <Accordion type="single" defaultValue="item-2" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>What plans are available?</AccordionTrigger>
        <AccordionContent>
          We offer Starter, Team, and Enterprise plans. Each plan can be billed
          monthly or annually, and you can upgrade at any time.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
        <AccordionContent>
          Go to Settings → Billing and select "Cancel plan." Your workspace
          stays active until the end of the current billing period.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Do you offer refunds?</AccordionTrigger>
        <AccordionContent>
          Yes — reach out to support within 14 days of your purchase and
          we'll issue a full refund, no questions asked.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// Multiple-open sections — a settings-page grouping where several
// sections can stay expanded simultaneously.
export function MultipleSections() {
  return (
    <Accordion
      type="multiple"
      defaultValue={["profile", "notifications"]}
      className="w-full max-w-md"
    >
      <AccordionItem value="profile">
        <AccordionTrigger>Profile</AccordionTrigger>
        <AccordionContent>
          Update your name, avatar, and the email address used for account
          notifications.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="notifications">
        <AccordionTrigger>Notifications</AccordionTrigger>
        <AccordionContent>
          Choose which updates are sent by email versus in-app, and mute
          weekly digest summaries.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="security">
        <AccordionTrigger>Security</AccordionTrigger>
        <AccordionContent>
          Manage two-factor authentication and review devices currently
          signed in to your account.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
