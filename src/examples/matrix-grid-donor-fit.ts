// Type-only verification that the hk-crm donor's data shapes compose
// <MatrixGridShell> without touching the donor's bespoke <MatrixGrid> source.
// This file is not exported anywhere; it exists purely so `tsc --noEmit`
// breaks if the shell's public contract drifts away from the original donor.
//
// Mirrors the donor's local types from hk-crm:
//   src/lib/matrix.ts            (Matrix, MatrixCell, MatrixColumn, MatrixRow)
//   src/db/queries/matrix.ts     (assignmentLookup shape)
//   src/components/matrix-grid.tsx (the existing bespoke primitive props)

import type {
  MatrixGridShellProps,
  MatrixColumn,
  MatrixRow,
} from "@/components/archetypes/matrix-grid";

// ---- Donor data shapes (copied from hk-crm, kept frozen here) -------------

interface DonorMatrixCell {
  filled: boolean;
  menge: number | null;
  assignmentCount: number;
}

interface DonorMatrixColumn {
  group: string;
  service: string;
  key: string;
}

interface DonorMatrixRow {
  companyId: string;
  companyName: string;
  cells: Record<string, DonorMatrixCell>;
}

interface DonorMatrix {
  columns: DonorMatrixColumn[];
  rows: DonorMatrixRow[];
}

// ---- Adapter sketch -------------------------------------------------------
// The trial migration replaces `<MatrixGrid>` with `<MatrixGridShell<DonorMatrixCell>>`.
// Donor types map cleanly onto the generic contract; the lookup map stays a
// project extension (documented in the spec's "Migration notes").

declare const donorMatrix: DonorMatrix;
declare const assignmentLookup: Record<string, string[]>;
declare function donorOnCellClick(
  assignmentIds: string[],
  cellKey: string,
): void;
declare function donorCellStyle(
  key: string,
  cell: DonorMatrixCell,
): { className: string; tooltip?: string };

const columns: MatrixColumn[] = donorMatrix.columns.map((c) => ({
  key: c.key,
  label: c.service,
  group: c.group,
}));

const rows: MatrixRow<DonorMatrixCell>[] = donorMatrix.rows.map((r) => ({
  id: r.companyId,
  label: r.companyName,
  cells: r.cells,
}));

// Single source of truth: the shape that would be passed to <MatrixGridShell>.
// If the shell's contract drifts in a way that no longer accepts the donor
// shape, this assignment will fail to typecheck.
export const _trialMigrationProps: MatrixGridShellProps<DonorMatrixCell> = {
  columns,
  rows,
  rowHeaderLabel: "Unternehmen",
  isFilled: (cell) => cell?.filled === true,
  renderCell: ({ cell }) => (cell?.menge !== null ? cell?.menge : null),
  cellStyle: ({ row, column, cell }) => {
    const lookupKey = `${row.id}::${column.label}`;
    return donorCellStyle(lookupKey, cell ?? { filled: false, menge: null, assignmentCount: 0 });
  },
  onCellClick: ({ row, column }) => {
    const lookupKey = `${row.id}::${column.label}`;
    const ids = assignmentLookup[lookupKey] ?? [];
    donorOnCellClick(ids, lookupKey);
  },
};
