// Scaffolded by `design-baseline new-page grouped-list __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/grouped-list.md
import {
  GroupedListShell,
  GroupedListSection,
  type GroupedListSectionProps,
} from "design-baseline/archetypes/grouped-list";

type __Name__Row = { id: string; name: string };
type __Name__Group = { id: string; title: string; rows: __Name__Row[] };

// TODO: replace with the page's real data hook.
function use__Name__Groups(): {
  groups: __Name__Group[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
} {
  return { groups: [], isLoading: false, error: null, refetch: () => {} };
}

const columns: GroupedListSectionProps<__Name__Row>["columns"] = [
  { key: "name", header: "Name", cell: (row) => row.name },
];

export function __Name__Page() {
  const { groups, isLoading, error, refetch } = use__Name__Groups();

  return (
    <GroupedListShell
      title="__Name__"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      isEmpty={groups.length === 0 && error == null}
      emptyMessage="No __Name__ yet"
    >
      {groups.map((group) => (
        <GroupedListSection
          key={group.id}
          title={group.title}
          rows={group.rows}
          columns={columns}
          getRowId={(row) => row.id}
        />
      ))}
    </GroupedListShell>
  );
}
