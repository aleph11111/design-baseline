import * as React from "react";
import { Label, RadioGroup, RadioGroupItem, SectionCard } from "design-baseline";

// A shipping-method picker — each option is a Radio + label + description
// row, one selected by default.
export function ShippingMethod() {
  return (
    <div className="max-w-md">
      <SectionCard title="Shipping method">
        <RadioGroup defaultValue="express">
          <div className="flex items-start gap-2.5">
            <RadioGroupItem value="standard" id="rg-standard" className="mt-0.5" />
            <Label htmlFor="rg-standard" className="font-normal">
              <span className="block font-medium text-foreground">Standard</span>
              <span className="block text-sm text-muted-foreground">Arrives in 3–5 business days · Free</span>
            </Label>
          </div>
          <div className="flex items-start gap-2.5">
            <RadioGroupItem value="express" id="rg-express" className="mt-0.5" />
            <Label htmlFor="rg-express" className="font-normal">
              <span className="block font-medium text-foreground">Express</span>
              <span className="block text-sm text-muted-foreground">Arrives in 1–2 business days · €8.00</span>
            </Label>
          </div>
          <div className="flex items-start gap-2.5">
            <RadioGroupItem value="overnight" id="rg-overnight" className="mt-0.5" />
            <Label htmlFor="rg-overnight" className="font-normal">
              <span className="block font-medium text-foreground">Overnight</span>
              <span className="block text-sm text-muted-foreground">Arrives next business day · €19.00</span>
            </Label>
          </div>
        </RadioGroup>
      </SectionCard>
    </div>
  );
}

// A plan picker with one option disabled — the state axis that matters most
// for radios (an unavailable choice inside a live group).
export function PlanTiers() {
  return (
    <div className="max-w-md">
      <SectionCard title="Choose a plan">
        <RadioGroup defaultValue="pro">
          <div className="flex items-center gap-2.5">
            <RadioGroupItem value="free" id="rg-free" />
            <Label htmlFor="rg-free" className="font-normal">Free — 1 project, community support</Label>
          </div>
          <div className="flex items-center gap-2.5">
            <RadioGroupItem value="pro" id="rg-pro" />
            <Label htmlFor="rg-pro" className="font-normal">Pro — unlimited projects, priority support</Label>
          </div>
          <div className="flex items-center gap-2.5">
            <RadioGroupItem value="enterprise" id="rg-enterprise" disabled />
            <Label htmlFor="rg-enterprise" className="font-normal opacity-70">
              Enterprise — contact sales
            </Label>
          </div>
        </RadioGroup>
      </SectionCard>
    </div>
  );
}
