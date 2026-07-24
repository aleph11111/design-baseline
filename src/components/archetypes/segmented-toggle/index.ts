// Archetype Sg — segmented-toggle. The molecule already lives in the `ui/` layer
// (`ui/segmented-control.tsx`, a Radix radio-group); this archetype re-exports the
// canonical primitive rather than duplicating it, and adds the contract + demo. One
// source of truth — see docs/archetypes/segmented-toggle.baseline.md.
export {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentedOption,
} from "@/components/ui/segmented-control";
