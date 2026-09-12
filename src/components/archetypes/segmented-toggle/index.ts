"use client";
// Archetype Sg — segmented-toggle. The molecule already lives in the `ui/` layer
// (`ui/segmented-control.tsx`, a Radix radio-group); this archetype re-exports the
// canonical primitive rather than duplicating it, and adds the contract + demo. One
// source of truth — the export below IS the binding (the archetype's page-shape
// contract: docs/archetypes/segmented-toggle.md).
export {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentedOption,
} from "../../ui/segmented-control";
