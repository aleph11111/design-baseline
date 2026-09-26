// Scaffolded by `design-baseline new-page detail-overview __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/detail-overview.md
// Loading, error and not-found belong to the route (contract Layer 7), not to
// this page: render this component only once the entity has resolved.
import {
  DetailOverviewShell,
  DetailSection,
  KeyValueList,
  KeyValueRow,
} from "design-baseline/archetypes/detail-overview";

export type __Name__Entity = { id: string; name: string };

export function __Name__Page({ entity }: { entity: __Name__Entity }) {
  return (
    <DetailOverviewShell
      title={entity.name}
      content={
        <DetailSection title="Details">
          <KeyValueList>
            <KeyValueRow label="ID" value={entity.id} />
          </KeyValueList>
        </DetailSection>
      }
    />
  );
}
