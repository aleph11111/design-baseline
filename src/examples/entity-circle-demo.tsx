import * as React from "react";
import { EntityAvatar } from "@/components/archetypes/entity-circle";

/**
 * entity-circle demo — a jazz quartet roster (domain deliberately far from the
 * source projects: no users, speakers, projects, contacts, or inventory). Types
 * are defined here first, then fed to EntityAvatar; the primitive only ever sees
 * a `name` (+ optional `src`), never a domain type.
 */

interface Player {
  id: string;
  name: string;
  instrument: string;
  /** Some players have a headshot; others fall back to derived initials. */
  photo?: string;
}

const QUARTET: Player[] = [
  { id: "p1", name: "Miles Davis", instrument: "Trumpet" },
  { id: "p2", name: "Bill Evans", instrument: "Piano", photo: "https://example.invalid/bill.jpg" },
  { id: "p3", name: "Paul Chambers", instrument: "Double bass" },
  { id: "p4", name: "Philly Joe Jones", instrument: "Drums" },
];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="border-b px-4 py-2 text-sm font-medium text-foreground">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function EntityCircleDemo(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Kind of Blue — session roster</h1>
        <p className="text-sm text-muted-foreground">
          <code>EntityAvatar</code> derives initials from each player's name and falls back to
          them when a headshot is missing or fails to load.
        </p>
      </div>

      {/* Roster rows — initials fallback (Bill Evans has a photo src that won't resolve). */}
      <Panel title="Personnel">
        <ul className="space-y-3">
          {QUARTET.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              <EntityAvatar name={p.name} src={p.photo} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.instrument}</p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Sizes — the same entity at each step of the scale. */}
      <Panel title="Sizes (xs · sm · md)">
        <div className="flex items-center gap-4">
          <EntityAvatar name="Miles Davis" size="xs" />
          <EntityAvatar name="Miles Davis" size="sm" />
          <EntityAvatar name="Miles Davis" size="md" />
        </div>
      </Panel>

      {/* Tone is keyed to the entity's identity role (contract L7): every roster
          entity is neutral; the brand fill is reserved for the signed-in entity —
          the same person, different role, same derived value. */}
      <Panel title="Tone (keyed to identity role)">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <EntityAvatar name="Cannonball Adderley" size="md" />
            <span className="text-xs text-muted-foreground">roster member — neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <EntityAvatar name="Cannonball Adderley" tone="primary" size="md" />
            <span className="text-xs text-muted-foreground">signed-in identity — brand fill</span>
          </div>
        </div>
      </Panel>

      {/* Inline byline — sm avatar sitting in a line of text. */}
      <Panel title="Inline byline">
        <p className="flex items-center gap-2 text-sm">
          <EntityAvatar name="Bill Evans" size="xs" />
          <span>Liner notes by <span className="font-medium">Bill Evans</span></span>
        </p>
      </Panel>
    </div>
  );
}

EntityCircleDemo.displayName = "EntityCircleDemo";
