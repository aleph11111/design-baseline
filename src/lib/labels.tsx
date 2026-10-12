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
  selectAll: string;
  selectRow: string;
  selectRowNamed: (name: string | number) => string;
  selectedCount: (count: number) => string;
  deleteSelected: (count: number) => string;
  addNew: string;
  unread: string;
  reportColumns: readonly [string, string, string, string];
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
  selectAll: "Select all rows",
  selectRow: "Select row",
  selectRowNamed: (name) => `Select row: ${name}`,
  selectedCount: (count) => `${count} selected`,
  deleteSelected: (count) => `Delete ${count} selected`,
  addNew: "Add new",
  unread: "Unread",
  reportColumns: ["Position", "Qty", "Unit", "Sum"],
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
  selectAll: "Alle Zeilen auswählen",
  selectRow: "Zeile auswählen",
  selectRowNamed: (name) => `Zeile auswählen: ${name}`,
  selectedCount: (count) => `${count} ausgewählt`,
  deleteSelected: (count) => `${count} ausgewählte löschen`,
  addNew: "Neu hinzufügen",
  unread: "Ungelesen",
  reportColumns: ["Position", "Menge", "Einheit", "Summe"],
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
