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
