// Scaffolded by `design-baseline new-page transaction-document __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/transaction-document.md
// Loading, error and not-found belong to the route: render this component only
// once the document has resolved. Declare the ledger columns for this
// document type once; the primary action lives in nextStep, never the header.
import {
  TransactionDocumentShell,
  type LedgerColumn,
  type LedgerRow,
} from "design-baseline/archetypes/transaction-document";

export type __Name__Document = { id: string; title: string; status: string; lines: LedgerRow[] };

const COLUMNS: LedgerColumn[] = [
  { key: "amount", label: "Amount", kind: "currency", priority: 1 },
];

export function __Name__Page({ doc }: { doc: __Name__Document }) {
  return (
    <TransactionDocumentShell
      title={doc.title}
      identity={{ id: doc.id, status: doc.status }}
      nextStep={{ title: "Next step" }}
      ledger={{ columns: COLUMNS, rows: doc.lines }}
      facts={[]}
    />
  );
}
