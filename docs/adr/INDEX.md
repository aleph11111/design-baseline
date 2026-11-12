# ADR Index

Architecture Decision Records for design-baseline. One file per decision:
`docs/adr/<NNNN>-<slug>.md`. Add a row here when you add an ADR.

| # | Title | Status |
|---|-------|--------|
| [0001](0001-grandfather-authored-report-calendar.md) | Grandfather the baseline-authored `report` and `calendar` archetypes | Accepted |
| [0002](0002-adopt-baseline-upstream-methodology.md) | Adopt the baseline-upstream methodology docs (selection, placement, stack, adoption) | Accepted (lint mechanism superseded by 0003) |
| [0003](0003-adherence-lint-zero-dep-scanner.md) | Adherence lint ships as a zero-dep scanner, not an oxlint config | Accepted |
| [0004](0004-appearance-locality-derived-vs-inherited.md) | Appearance locality: global or fixed in the component; per-call-site only when derived | Accepted |
| [0005](0005-adoption-quality-scan-zero-dep-donor-script.md) | The adoptionQuality (Axis-C) scan ships as a zero-dep donor script, not a consumer-local scanner | Accepted |
| [0006](0006-consumer-measured-use-client-leaves.md) | "use client" is consumer-measured per leaf, not barrel-only — with `verify-exports` invariant 7 | Accepted |
| [0007](0007-fleet-house-look-fixed-vs-brand-roles.md) | The fleet house look: donor-fixed roles vs brand-overridable roles | Accepted (§3 superseded by 0015) |
| [0008](0008-one-page-frame-slot-owned-placement.md) | One page frame, slot-owned placement — one title, one untitled frame, fixed slots | Accepted (§3 superseded by 0015) |
| [0009](0009-figures-in-the-house-sans.md) | Figures in the house sans: Inter, tabular, regular weight; mono for code only | Accepted |
| [0010](0010-detail-overlay-sizes-to-content.md) | The list-with-detail overlay sizes to its content; a detail that cannot fit gets its own route | Accepted |
| [0011](0011-analytics-dashboard-edit-mode.md) | An editable dashboard tile layout is an edit mode of analytics-dashboard, not a new archetype | Accepted |
| [0012](0012-structure-builder-page-archetype.md) | The report-structure builder is its own `kind: page` archetype (structure-builder, Sb) | Accepted |
| [0013](0013-matrix-grid-workbench-body-dock.md) | A planning workbench is matrix-grid with `body` and `dock` slots, not a new archetype | Accepted |
| [0014](0014-transaction-document-page-archetype.md) | Transaction documents are their own `kind: page` archetype (transaction-document, Td) | Accepted |
| [0015](0015-page-body-section-card-stack.md) | The page body is one frame or a stack of raised section cards; one bordered chrome on every raised surface | Accepted |
