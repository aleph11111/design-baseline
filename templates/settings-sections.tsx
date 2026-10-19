// Scaffolded by `design-baseline new-page settings-sections __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/settings-sections.md
import {
  SettingsSection,
  SettingsSectionsShell,
} from "design-baseline/archetypes/settings-sections";
import { StateView } from "@/components/ui/state-view";

type __Name__Settings = { id: string };

// TODO: replace with the page's real data hook.
function use__Name__Settings(): {
  settings: __Name__Settings | null;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
} {
  return { settings: null, isLoading: false, error: null, refetch: () => {} };
}

export function __Name__Page() {
  const { settings, isLoading, error, refetch } = use__Name__Settings();

  const general =
    isLoading ? (
      <StateView variant="loading" />
    ) : error != null ? (
      <StateView variant="error" error={error} onRetry={refetch} />
    ) : settings == null ? (
      <StateView variant="empty" message="No __Name__ settings yet" />
    ) : (
      <>{/* TODO: this section's fields */}</>
    );

  return (
    <SettingsSectionsShell title="__Name__">
      {/* TODO: wire onSave to this section's mutation. */}
      <SettingsSection title="General" onSave={() => {}}>
        {general}
      </SettingsSection>
    </SettingsSectionsShell>
  );
}
