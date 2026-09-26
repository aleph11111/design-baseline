// Scaffolded by `design-baseline new-page tabbed-settings __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/tabbed-settings.md
import { SettingsPageShell } from "design-baseline/archetypes/tabbed-settings";
import { StateView } from "@/components/ui/state-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <SettingsPageShell title="__Name__">
      {isLoading ? (
        <StateView variant="loading" />
      ) : error != null ? (
        <StateView variant="error" error={error} onRetry={refetch} />
      ) : settings == null ? (
        <StateView variant="empty" message="No __Name__ settings yet" />
      ) : (
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>
          <TabsContent value="general">{/* TODO: settings form for this tab */}</TabsContent>
        </Tabs>
      )}
    </SettingsPageShell>
  );
}
