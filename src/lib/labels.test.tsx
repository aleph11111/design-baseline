import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BaselineLabelsProvider, labelsDe } from "./labels";
import { StateView } from "../components/ui/state-view";
import { ErrorBoundary } from "../components/ui/error-boundary";
import { SearchInput } from "../components/ui/search-input";
import { ConfirmationDialog } from "../components/ui/confirmation-dialog";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { WizardStepper } from "../components/archetypes/import-wizard";

afterEach(cleanup);

const de = (ui: React.ReactElement) =>
  render(<BaselineLabelsProvider labels={labelsDe}>{ui}</BaselineLabelsProvider>);

function Boom(): React.ReactElement {
  throw new Error("");
}

describe("BaselineLabelsProvider — de preset", () => {
  it("StateView renders German loading / error / empty / retry", () => {
    de(<StateView variant="loading" />);
    expect(screen.getByText("Wird geladen…")).toBeTruthy();
    cleanup();
    de(<StateView variant="error" error={1} onRetry={() => {}} />);
    expect(screen.getByText("Ein Fehler ist aufgetreten")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeTruthy();
    cleanup();
    de(<StateView variant="empty" />);
    expect(screen.getByText("Noch keine Einträge")).toBeTruthy();
  });

  it("ErrorBoundary (class component) reads the provider", () => {
    const spy = console.error;
    console.error = () => {};
    de(<ErrorBoundary><Boom /></ErrorBoundary>);
    console.error = spy;
    expect(screen.getByText("Ein Fehler ist aufgetreten")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeTruthy();
  });

  it("SearchInput, ConfirmationDialog, Dialog close, WizardStepper", () => {
    de(<SearchInput value="q" clearable />);
    expect(screen.getByRole("searchbox", { name: "Suchen" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Suche löschen" })).toBeTruthy();
    cleanup();
    de(<ConfirmationDialog isOpen onClose={() => {}} onConfirm={() => {}} title="t" description="d" />);
    expect(screen.getByRole("button", { name: "Bestätigen" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Abbrechen" })).toBeTruthy();
    cleanup();
    de(
      <Dialog open>
        <DialogContent><DialogTitle>t</DialogTitle><DialogDescription>d</DialogDescription></DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Schließen" })).toBeTruthy();
    cleanup();
    de(<WizardStepper steps={[{ key: "a", label: "A" }, { key: "b", label: "B" }]} current={1} />);
    expect(screen.getByText("(abgeschlossen)")).toBeTruthy();
    expect(screen.getByText("(aktuell)")).toBeTruthy();
  });
});

describe("override precedence", () => {
  it("omitting the provider renders the English default", () => {
    render(<StateView variant="error" error={1} onRetry={() => {}} />);
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });

  it("a per-call prop beats the preset", () => {
    de(<StateView variant="error" error={1} onRetry={() => {}} retryLabel="Nochmal" labels={{ error: "Hoppla" }} />);
    expect(screen.getByRole("button", { name: "Nochmal" })).toBeTruthy();
    expect(screen.getByText("Hoppla")).toBeTruthy();
    cleanup();
    de(<ConfirmationDialog isOpen onClose={() => {}} onConfirm={() => {}} title="t" description="d" confirmText="Ja" cancelText="Nein" />);
    expect(screen.getByRole("button", { name: "Ja" })).toBeTruthy();
    cleanup();
    de(<SearchInput clearable value="q" clearLabel="Weg" />);
    expect(screen.getByRole("button", { name: "Weg" })).toBeTruthy();
    cleanup();
    de(<WizardStepper steps={[{ key: "a", label: "A" }]} current={0} stateLabels={{ current: "jetzt" }} />);
    expect(screen.getByText("(jetzt)")).toBeTruthy();
  });

  it("ErrorBoundary props beat the preset", () => {
    const spy = console.error;
    console.error = () => {};
    de(<ErrorBoundary title="Mist" description="kaputt" retryLabel="Noch mal"><Boom /></ErrorBoundary>);
    console.error = spy;
    expect(screen.getByText("Mist")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Noch mal" })).toBeTruthy();
  });
});
