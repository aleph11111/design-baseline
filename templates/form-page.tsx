// Scaffolded by `design-baseline new-page form-page __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/form-page.md
// Fields go through the consumer's form-field primitives (contract "Forbidden":
// no bare inputs); initial data is loaded before this page renders.
import { useForm } from "react-hook-form";
import {
  FormPageShell,
  FormPageActions,
  useFormPageState,
  type FormPageMode,
} from "design-baseline/archetypes/form-page";

export type __Name__Values = { name: string };

// TODO: replace with the page's real save call.
async function save__Name__(_values: __Name__Values): Promise<void> {}

export function __Name__Page({
  mode = "create",
  initial = { name: "" },
}: {
  mode?: FormPageMode;
  initial?: __Name__Values;
}) {
  const form = useForm<__Name__Values>({ defaultValues: initial });
  const state = useFormPageState({ mode, isDirty: form.formState.isDirty });
  const rootError = form.formState.errors.root?.message;

  const onSubmit = form.handleSubmit(async (values) => {
    state.beginSubmit();
    try {
      await save__Name__(values);
      // TODO: success toast + navigate (contract Layer 7).
    } catch (error) {
      // Never swallow: map field errors with form.setError(<field>, …), the rest here.
      form.setError("root", {
        message: error instanceof Error ? error.message : "Could not save",
      });
    } finally {
      state.endSubmit();
    }
  });

  return (
    <FormPageShell title={state.isCreate ? "New __Name__" : "Edit __Name__"}>
      <form onSubmit={onSubmit}>
        {/* TODO: form fields */}
        {rootError && (
          <div role="alert" className="bg-destructive/10 p-4 rounded text-sm text-destructive">
            {rootError}
          </div>
        )}
        {/* No onPrimary: the primary button is type="submit" and submits this form. */}
        <FormPageActions
          mode={state.mode}
          isSubmitting={state.isSubmitting}
          onSecondary={() => void state.requestDiscard()}
        />
      </form>
    </FormPageShell>
  );
}
