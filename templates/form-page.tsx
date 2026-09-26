// Scaffolded by `design-baseline new-page form-page __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/form-page.md
// Fields go through the consumer's form-field primitives (contract "Forbidden":
// no bare inputs); initial data is loaded before this page renders.
import {
  FormPageShell,
  FormPageActions,
  useFormPageState,
  type FormPageMode,
} from "design-baseline/archetypes/form-page";

export function __Name__Page({ mode = "create" }: { mode?: FormPageMode }) {
  const state = useFormPageState({ mode });

  async function submit() {
    state.beginSubmit();
    try {
      // TODO: save, and surface a failure on the form rather than swallowing it.
    } finally {
      state.endSubmit();
    }
  }

  return (
    <FormPageShell title={state.isCreate ? "New __Name__" : "Edit __Name__"}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {/* TODO: form fields */}
        <FormPageActions
          mode={state.mode}
          onPrimary={() => void submit()}
          isSubmitting={state.isSubmitting}
          onSecondary={() => void state.requestDiscard()}
        />
      </form>
    </FormPageShell>
  );
}
