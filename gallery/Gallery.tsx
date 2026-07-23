import * as React from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  BarChart3,
  Bell,
  Box,
  FileText,
  LayoutDashboard,
  Loader,
  Settings,
  TextCursorInput,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";
import {
  AppHeader,
  AppShell,
  AppSidebar,
  ThemeToggle,
  type NavGroup,
  type NavItem,
} from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { ARCHETYPES, findArchetype, type ArchetypeEntry } from "./registry";
import { LAYOUT_PRIMS, findLayoutPrim, type LayoutPrim } from "./layout-demos";

const REPO = "https://_/"; // spec links are repo-relative; shown as text, not navigated

// Safe lucide icons (all proven to resolve via the existing demos).
const ICON_BY_SLUG: Record<string, LucideIcon> = {
  "list-with-detail": FileText,
  "form-page": FileText,
  "detail-overview": FileText,
  "settings-table": Settings,
  "crud-dialog": Box,
  "grouped-list": FileText,
  "matrix-grid": BarChart3,
  "tabbed-settings": Settings,
  "analytics-dashboard": BarChart3,
  "import-wizard": UploadCloud,
  "feed-inbox": Bell,
  "kanban-board": LayoutDashboard,
  "skeleton-loader": Loader,
  "field": TextCursorInput,
};

function toNavItem(a: ArchetypeEntry): NavItem {
  return { title: a.displayName, path: `/a/${a.slug}`, icon: ICON_BY_SLUG[a.slug] ?? FileText };
}

const PAGES = ARCHETYPES.filter((a) => a.kind === "page");
const DIALOGS = ARCHETYPES.filter((a) => a.kind === "dialog");
const COMPONENTS = ARCHETYPES.filter((a) => a.kind === "component");

const NAV_GROUPS: NavGroup[] = [
  { label: "Page archetypes", items: PAGES.map(toNavItem) },
  ...(DIALOGS.length
    ? [{ label: "Dialog archetypes", items: DIALOGS.map(toNavItem) }]
    : []),
  ...(COMPONENTS.length
    ? [{ label: "Component archetypes", items: COMPONENTS.map(toNavItem) }]
    : []),
  {
    label: "Layout & molecules",
    items: LAYOUT_PRIMS.map((p) => ({
      title: p.displayName,
      path: `/l/${p.slug}`,
      icon: Box,
    })),
  },
];

const TOP_ITEMS: NavItem[] = [
  { title: "Overview", path: "/", icon: LayoutDashboard },
];

// ---------------------------------------------------------------------------

function ArchetypeInfoBar({ a }: { a: ArchetypeEntry }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold tracking-tight text-foreground">
          {a.displayName}
        </h1>
        <Badge variant="secondary">Archetype {a.key}</Badge>
        <Badge variant="outline">v{a.version}</Badge>
      </div>
      <code className="text-xs text-muted-foreground">{a.spec}</code>
    </div>
  );
}

function ArchetypePage() {
  const { slug } = useParams();
  const a = findArchetype(slug);
  if (!a) return <Navigate to="/" replace />;
  const Demo = a.Demo;
  return (
    // The info bar lives in the header slot (full-bleed); AppShell's <main>
    // owns the inset, so the demo renders directly — exactly like a real page.
    <React.Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading demo…</div>
      }
    >
      <Demo />
    </React.Suspense>
  );
}

function LayoutPrimInfoBar({ p }: { p: LayoutPrim }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold tracking-tight text-foreground">
          {p.displayName}
        </h1>
        <Badge variant="outline">Layout primitive</Badge>
      </div>
      <code className="text-xs text-muted-foreground">@/components/layout</code>
    </div>
  );
}

function LayoutPrimPage() {
  const { slug } = useParams();
  const p = findLayoutPrim(slug);
  if (!p) return <Navigate to="/" replace />;
  const Demo = p.Demo;
  return <Demo />;
}

function Overview() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">design-baseline</h1>
        <p className="text-sm text-muted-foreground">
          The fleet's shared design language: shadcn/ui + Tailwind 4 tokens, a
          sidebar-and-header shell, and a set of page-shape{" "}
          <strong className="font-medium text-foreground">archetypes</strong>.
          Each archetype below is rendered from its real reference primitives —
          this is exactly what a project gets when it adopts the baseline.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ARCHETYPES.map((a) => (
          <Link
            key={a.slug}
            to={`/a/${a.slug}`}
            className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                {a.displayName}
              </span>
              <Badge variant="secondary">{a.key}</Badge>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {a.kind} · v{a.version}
            </div>
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Vocabulary is pinned in <code>docs/TAXONOMY.md</code>. This gallery is a
        donor-dev harness — it is not shipped to target projects.
      </p>
    </div>
  );
}

export function Gallery(): React.ReactElement {
  const { pathname } = useLocation();
  const active = ARCHETYPES.find((a) => pathname === `/a/${a.slug}`);
  const activePrim = LAYOUT_PRIMS.find((p) => pathname === `/l/${p.slug}`);
  const title = active?.displayName ?? activePrim?.displayName ?? "design-baseline";

  return (
    <AppShell
      sidebar={
        <AppSidebar
          appName="design-baseline"
          brand={
            <div className="rounded-md bg-primary p-1 text-primary-foreground">
              <Box className="h-6 w-6" />
            </div>
          }
          topItems={TOP_ITEMS}
          groups={NAV_GROUPS}
          pathname={pathname}
          renderLink={(item, children) => <Link to={item.path}>{children}</Link>}
        />
      }
      header={
        <>
          <AppHeader title={title} right={<ThemeToggle />} />
          {active && <ArchetypeInfoBar a={active} />}
          {activePrim && <LayoutPrimInfoBar p={activePrim} />}
        </>
      }
    >
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/a/:slug" element={<ArchetypePage />} />
        <Route path="/l/:slug" element={<LayoutPrimPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
