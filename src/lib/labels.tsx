"use client";
import * as React from "react";

/**
 * Every user-visible default string a baseline component renders on its own.
 * Resolution order at a call site: per-call prop → provider value → English
 * default. Without a provider the English preset renders (back-compat).
 */
export type BaselineLabels = {
  // StateView / ErrorBoundary / ListStateView
  loading: string;
  errorTitle: string;
  errorFallback: string;
  errorUnexpected: string;
  empty: string;
  filteredEmpty: string;
  retry: string;
  // Search
  search: string;
  searchPlaceholder: string;
  clearSearch: string;
  noResults: string;
  // Dialogs / sheets / forms
  confirm: string;
  cancel: string;
  close: string;
  edit: string;
  create: string;
  save: string;
  saving: string;
  creating: string;
  discardPrompt: string;
  crudLoadError: string;
  crudCreateError: string;
  crudUpdateError: string;
  crudDeleteError: string;
  // Navigation / chrome
  back: string;
  next: string;
  previous: string;
  more: string;
  bottomNav: string;
  openMoreMenu: string;
  toggleSidebar: string;
  pagination: string;
  goToPrevious: string;
  goToNext: string;
  morePages: string;
  section: string;
  view: string;
  filter: string;
  reset: string;
  done: string;
  showMore: string;
  showLess: string;
  // Account
  userMenu: string;
  signOut: string;
  // Theme
  toggleTheme: string;
  light: string;
  dark: string;
  system: string;
  // Fields
  chooseFile: string;
  removeFile: (name: string) => string;
  colour: string;
  hexColour: string;
  hexValue: (label: string) => string;
  months: readonly string[];
  // Tables / lists
  rowActions: string;
  /** `sr-only` label of the page header's `⋯` overflow-menu trigger. */
  headerActions: string;
  selectAll: string;
  selectRow: string;
  selectRowNamed: (name: string | number) => string;
  selectedCount: (count: number) => string;
  deleteSelected: (count: number) => string;
  addNew: string;
  unread: string;
  reportColumns: readonly [string, string, string, string];
  // Layout editing (analytics-dashboard edit mode)
  rename: string;
  configureNamed: (name: string) => string;
  removeNamed: (name: string) => string;
  moveEarlier: (name: string) => string;
  moveLater: (name: string) => string;
  // Print
  printHint: string;
  printAction: string;
  // Structure builder
  structureNew: string;
  structureClone: string;
  structureHistory: string;
  structureTree: string;
  structureEmpty: string;
  structureMoveHint: string;
  structureMoved: (label: string, position: number, parent: string | null) => string;
  structurePlace: (label: string) => string;
  unsavedChanges: string;
  coverageComplete: string;
  coverageUnplaced: (count: number) => string;
  coverageDuplicates: (count: number) => string;
  // Transaction document
  copyId: (id: string) => string;
  idCopied: string;
  documentChain: string;
  nextStep: string;
  runningAlongside: string;
  sideEffectDone: string;
  sideEffectPending: string;
  sideEffectFailed: string;
  ledger: string;
  ledgerItem: string;
  facts: string;
  history: string;
  locked: string;
  // Wizard / progress
  commitImport: string;
  importing: string;
  completed: string;
  current: string;
  upcoming: string;
};

export const labelsEn: BaselineLabels = {
  loading: "Loading…",
  errorTitle: "Something went wrong",
  errorFallback: "Something went wrong.",
  errorUnexpected: "An unexpected error occurred",
  empty: "No items yet",
  filteredEmpty: "No matches. Try clearing filters.",
  retry: "Try again",
  search: "Search",
  searchPlaceholder: "Search…",
  clearSearch: "Clear search",
  noResults: "No results.",
  confirm: "Confirm",
  cancel: "Cancel",
  close: "Close",
  edit: "Edit",
  create: "Create",
  save: "Save",
  saving: "Saving…",
  creating: "Creating…",
  discardPrompt: "Discard changes?",
  crudLoadError: "Could not load. Please try again.",
  crudCreateError: "Could not create. Please try again.",
  crudUpdateError: "Could not save. Please try again.",
  crudDeleteError: "Could not delete. Please try again.",
  back: "Back",
  next: "Next",
  previous: "Previous",
  more: "More",
  bottomNav: "Bottom navigation",
  openMoreMenu: "Open more menu",
  toggleSidebar: "Toggle Sidebar",
  pagination: "pagination",
  goToPrevious: "Go to previous page",
  goToNext: "Go to next page",
  morePages: "More pages",
  section: "Section",
  view: "View",
  filter: "Filter",
  reset: "Reset",
  done: "Done",
  showMore: "Show more",
  showLess: "Show less",
  userMenu: "Account menu",
  signOut: "Sign out",
  toggleTheme: "Toggle color scheme",
  light: "Light",
  dark: "Dark",
  system: "System",
  chooseFile: "Choose file…",
  removeFile: (name) => `Remove ${name}`,
  colour: "Colour",
  hexColour: "Hex colour value",
  hexValue: (label) => `${label} hex value`,
  months: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  rowActions: "Row actions",
  headerActions: "More actions",
  selectAll: "Select all rows",
  selectRow: "Select row",
  selectRowNamed: (name) => `Select row: ${name}`,
  selectedCount: (count) => `${count} selected`,
  deleteSelected: (count) => `Delete ${count} selected`,
  addNew: "Add new",
  unread: "Unread",
  reportColumns: ["Position", "Qty", "Unit", "Sum"],
  rename: "Rename",
  configureNamed: (name) => `Configure ${name}`,
  removeNamed: (name) => `Remove ${name}`,
  moveEarlier: (name) => `Move ${name} earlier`,
  moveLater: (name) => `Move ${name} later`,
  printHint: "Print view — choose “Save as PDF” in the print dialog.",
  printAction: "Print / Save as PDF",
  structureNew: "New",
  structureClone: "Clone",
  structureHistory: "Version history",
  structureTree: "Structure",
  structureEmpty: "No structure yet",
  structureMoveHint: "Alt + arrow keys move the selected line: up / down reorders, right indents, left outdents.",
  structureMoved: (label, position, parent) =>
    `Moved ${label} to position ${position}${parent ? ` in ${parent}` : " at the top level"}`,
  structurePlace: (label) => `Place ${label} in the selected line`,
  unsavedChanges: "Unsaved changes",
  coverageComplete: "Everything is placed",
  coverageUnplaced: (count) => `${count} not placed`,
  coverageDuplicates: (count) => `${count} placed twice`,
  copyId: (id) => `Copy ${id}`,
  idCopied: "Copied",
  documentChain: "Related documents",
  nextStep: "Next step",
  runningAlongside: "Running alongside",
  sideEffectDone: "done",
  sideEffectPending: "pending",
  sideEffectFailed: "failed",
  ledger: "Lines",
  ledgerItem: "Item",
  facts: "Details",
  history: "History",
  locked: "Locked",
  commitImport: "Commit import",
  importing: "Importing…",
  completed: "completed",
  current: "current",
  upcoming: "upcoming",
};

export const labelsDe: BaselineLabels = {
  loading: "Wird geladen…",
  errorTitle: "Ein Fehler ist aufgetreten",
  errorFallback: "Ein Fehler ist aufgetreten.",
  errorUnexpected: "Ein unerwarteter Fehler ist aufgetreten",
  empty: "Noch keine Einträge",
  filteredEmpty: "Keine Treffer. Filter zurücksetzen.",
  retry: "Erneut versuchen",
  search: "Suchen",
  searchPlaceholder: "Suchen…",
  clearSearch: "Suche löschen",
  noResults: "Keine Treffer.",
  confirm: "Bestätigen",
  cancel: "Abbrechen",
  close: "Schließen",
  edit: "Bearbeiten",
  create: "Erstellen",
  save: "Speichern",
  saving: "Wird gespeichert…",
  creating: "Wird erstellt…",
  discardPrompt: "Änderungen verwerfen?",
  crudLoadError: "Laden fehlgeschlagen. Bitte erneut versuchen.",
  crudCreateError: "Erstellen fehlgeschlagen. Bitte erneut versuchen.",
  crudUpdateError: "Speichern fehlgeschlagen. Bitte erneut versuchen.",
  crudDeleteError: "Löschen fehlgeschlagen. Bitte erneut versuchen.",
  back: "Zurück",
  next: "Weiter",
  previous: "Zurück",
  more: "Mehr",
  bottomNav: "Untere Navigation",
  openMoreMenu: "Weitere Optionen öffnen",
  toggleSidebar: "Seitenleiste umschalten",
  pagination: "Seitennavigation",
  goToPrevious: "Zur vorherigen Seite",
  goToNext: "Zur nächsten Seite",
  morePages: "Weitere Seiten",
  section: "Abschnitt",
  view: "Ansicht",
  filter: "Filtern",
  reset: "Zurücksetzen",
  done: "Fertig",
  showMore: "Mehr anzeigen",
  showLess: "Weniger anzeigen",
  userMenu: "Kontomenü",
  signOut: "Abmelden",
  toggleTheme: "Farbschema umschalten",
  light: "Hell",
  dark: "Dunkel",
  system: "System",
  chooseFile: "Datei auswählen…",
  removeFile: (name) => `${name} entfernen`,
  colour: "Farbe",
  hexColour: "Hex-Farbwert",
  hexValue: (label) => `${label} Hex-Wert`,
  months: [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ],
  rowActions: "Zeilenaktionen",
  headerActions: "Weitere Aktionen",
  selectAll: "Alle Zeilen auswählen",
  selectRow: "Zeile auswählen",
  selectRowNamed: (name) => `Zeile auswählen: ${name}`,
  selectedCount: (count) => `${count} ausgewählt`,
  deleteSelected: (count) => `${count} ausgewählte löschen`,
  addNew: "Neu hinzufügen",
  unread: "Ungelesen",
  reportColumns: ["Position", "Menge", "Einheit", "Summe"],
  rename: "Umbenennen",
  configureNamed: (name) => `${name} konfigurieren`,
  removeNamed: (name) => `${name} entfernen`,
  moveEarlier: (name) => `${name} nach vorne verschieben`,
  moveLater: (name) => `${name} nach hinten verschieben`,
  printHint: "Druckansicht — im Druckdialog „Als PDF speichern“ wählen.",
  printAction: "Drucken / Als PDF speichern",
  structureNew: "Neu",
  structureClone: "Klonen",
  structureHistory: "Versionsverlauf",
  structureTree: "Struktur",
  structureEmpty: "Noch keine Struktur",
  structureMoveHint: "Alt + Pfeiltasten verschieben die gewählte Zeile: hoch / runter ordnet um, rechts rückt ein, links rückt aus.",
  structureMoved: (label, position, parent) =>
    `${label} verschoben an Position ${position}${parent ? ` in ${parent}` : " auf oberster Ebene"}`,
  structurePlace: (label) => `${label} in die gewählte Zeile einfügen`,
  unsavedChanges: "Ungespeicherte Änderungen",
  coverageComplete: "Alles ist zugeordnet",
  coverageUnplaced: (count) => `${count} nicht zugeordnet`,
  coverageDuplicates: (count) => `${count} doppelt zugeordnet`,
  copyId: (id) => `${id} kopieren`,
  idCopied: "Kopiert",
  documentChain: "Zugehörige Belege",
  nextStep: "Nächster Schritt",
  runningAlongside: "Läuft automatisch mit",
  sideEffectDone: "erledigt",
  sideEffectPending: "ausstehend",
  sideEffectFailed: "fehlgeschlagen",
  ledger: "Positionen",
  ledgerItem: "Artikel",
  facts: "Angaben",
  history: "Verlauf",
  locked: "Gesperrt",
  commitImport: "Import abschließen",
  importing: "Wird importiert…",
  completed: "abgeschlossen",
  current: "aktuell",
  upcoming: "ausstehend",
};

const BaselineLabelsContext = React.createContext<BaselineLabels>(labelsEn);

/**
 * Root provider for the baseline's default strings. `labels` is merged over the
 * English preset, so a partial override (or `labelsDe`) is enough. Per-call
 * props on a component still win over the provider. Memoized on the `labels`
 * identity — pass a stable object (a preset or module constant), not an inline literal.
 */
export function BaselineLabelsProvider({
  labels,
  children,
}: {
  labels: Partial<BaselineLabels>;
  children: React.ReactNode;
}): React.ReactElement {
  const parent = React.useContext(BaselineLabelsContext);
  const value = React.useMemo(() => {
    const merged: BaselineLabels = { ...parent };
    // `??` per key: an explicit `undefined` must not erase a default.
    for (const k of Object.keys(labels) as (keyof BaselineLabels)[]) {
      (merged as Record<string, unknown>)[k] = labels[k] ?? parent[k];
    }
    return merged;
  }, [parent, labels]);
  return <BaselineLabelsContext.Provider value={value}>{children}</BaselineLabelsContext.Provider>;
}

const subscribeLang = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => mo.disconnect();
};
const readLang = () => document.documentElement.lang;
const serverLang = () => "";

/**
 * The active default strings. A mounted provider wins; with none, a page whose
 * `<html lang>` starts with `de` gets `labelsDe`; otherwise English. The lang
 * is read after hydration (server snapshot is empty), so SSR markup stays English.
 */
export function useLabels(): BaselineLabels {
  const ctx = React.useContext(BaselineLabelsContext);
  const lang = React.useSyncExternalStore(subscribeLang, readLang, serverLang);
  // The provider always merges into a fresh object, so the context default
  // (`labelsEn` itself) means "no provider mounted".
  if (ctx !== labelsEn) return ctx;
  return lang.toLowerCase().startsWith("de") ? labelsDe : labelsEn;
}

/** For class components: `static contextType = BaselineLabelsContext`. */
export { BaselineLabelsContext };
