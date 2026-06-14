/**
 * detail-overview-demo.tsx
 *
 * Sandbox demo for the C (detail-overview) archetype.
 * Domain: personal board-game collection — far from CRM/MSP nouns (no
 * companies, contacts, opportunities, devices, services, deal positions).
 *
 * Exercises:
 *   - DetailOverviewShell v2.0 named slots — all five filled, in the canonical
 *     order the shell enforces: header → summary → stats → content →
 *     references (master data → aggregates → transactional data).
 *     `width="md"` (the record-page default), default `space-y-5` rhythm.
 *   - DetailOverviewHeader (Mode A — standalone): title, subtitle linking
 *     "back" to a parent collection, right-aligned actions row.
 *   - DetailSection (ledger design) as the bounded surface for every non-stat
 *     zone: overline title bars, `flush` ruled-list content, graded surfaces
 *     (`tone="muted"` on Resources). No naked sections.
 *   - KeyValueList/KeyValueRow ruled master-data rows: right-aligned values,
 *     a chip-strip row (categorical master data), a `block` row for notes.
 *   - StatTileRow as ONE unified strip with internal dividers, 3 cells.
 *   - An "embedded read-only list" stand-in (no real RecordTable in baseline
 *     yet — represented by a simple ul inside a section).
 *
 * Types are defined LOCALLY here with zero reference to any source project's
 * domain. If the primitives required board-game-shaped types to be reshaped,
 * the primitives are leaking source assumptions and must be fixed.
 */

import * as React from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DetailOverviewShell,
  DetailOverviewHeader,
  DetailSection,
  StatTileRow,
  StatTile,
  KeyValueList,
  KeyValueRow,
} from "@/components/archetypes/detail-overview";

// ---------------------------------------------------------------------------
// Domain — board-game collection entry
// ---------------------------------------------------------------------------

type Mechanic =
  | "worker-placement"
  | "deck-building"
  | "area-control"
  | "engine-building"
  | "drafting"
  | "auction";

type PlaySession = {
  id: string;
  playedOn: string;          // ISO date
  durationMinutes: number;
  playerCount: number;
  winner: string;
};

type BoardGameEntry = {
  id: string;
  title: string;
  designer: string;
  publisher: string;
  yearPublished: number;
  minPlayers: number;
  maxPlayers: number;
  meanDurationMinutes: number;
  weight: number;            // 1.0–5.0 (BGG complexity)
  acquiredOn: string;        // ISO date
  acquiredFor: number;       // local currency, minor units
  rating: 1 | 2 | 3 | 4 | 5;
  shelfLocation: string;
  mechanics: Mechanic[];
  sessions: PlaySession[];
  notes: string | null;
};

const MECHANIC_LABELS: Record<Mechanic, string> = {
  "worker-placement": "Worker placement",
  "deck-building": "Deck building",
  "area-control": "Area control",
  "engine-building": "Engine building",
  drafting: "Drafting",
  auction: "Auction",
};

// ---------------------------------------------------------------------------
// Local formatters (pre-format values; primitives never format)
// ---------------------------------------------------------------------------

function fmtCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function fmtPlayerRange(min: number, max: number): string {
  return min === max ? `${min}` : `${min}–${max}`;
}

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const SAMPLE_ENTRY: BoardGameEntry = {
  id: "bg-0042",
  title: "Brass: Birmingham",
  designer: "Gavin Birnie & Matt Tolman",
  publisher: "Roxley Games",
  yearPublished: 2018,
  minPlayers: 2,
  maxPlayers: 4,
  meanDurationMinutes: 145,
  weight: 3.9,
  acquiredOn: "2024-11-08",
  acquiredFor: 65,
  rating: 5,
  shelfLocation: "Living room — top shelf, slot 3",
  mechanics: ["engine-building", "area-control", "auction"],
  sessions: [
    {
      id: "s-3",
      playedOn: "2026-04-12",
      durationMinutes: 168,
      playerCount: 4,
      winner: "Priya",
    },
    {
      id: "s-2",
      playedOn: "2026-02-28",
      durationMinutes: 142,
      playerCount: 3,
      winner: "Sam",
    },
    {
      id: "s-1",
      playedOn: "2025-12-30",
      durationMinutes: 155,
      playerCount: 4,
      winner: "Christoph",
    },
  ],
  notes:
    "Heavy on iron-canal-route planning early game; rail era is much faster. " +
    "Pair with the recommended player aids — the symbology takes one play to learn.",
};

// ---------------------------------------------------------------------------
// Demo page
// ---------------------------------------------------------------------------

export function DetailOverviewDemo(): React.ReactElement {
  const entry = SAMPLE_ENTRY;
  // Editability variant (inline-edit): a section whose body swaps a read-only
  // value for an editable control in place — the same DetailSection, no new prop.
  const [editingNotes, setEditingNotes] = React.useState(false);
  const [notes, setNotes] = React.useState(SAMPLE_ENTRY.notes ?? "");
  const totalPlays = entry.sessions.length;
  const lastPlayed = entry.sessions[0]?.playedOn ?? null;
  const avgDuration =
    totalPlays > 0
      ? Math.round(
          entry.sessions.reduce((sum, s) => sum + s.durationMinutes, 0) /
            totalPlays,
        )
      : null;

  return (
    <DetailOverviewShell
      width="md"
      header={
        <DetailOverviewHeader
          title={entry.title}
          subtitle={
            <>
              <span>{entry.designer}</span>
              <span className="mx-2 text-border">·</span>
              <span>
                {entry.publisher}, {entry.yearPublished}
              </span>
            </>
          }
          actions={
            <>
              <Button variant="outline" size="sm">
                Log a play
              </Button>
              <Button size="sm">Edit</Button>
            </>
          }
        />
      }
      summary={
        <DetailSection
          title="Details"
          flush
          actions={
            <Button variant="ghost" size="sm" className="-my-1.5 h-7 text-xs">
              Find similar
            </Button>
          }
        >
          <KeyValueList>
            <KeyValueRow
              label="Players"
              value={fmtPlayerRange(entry.minPlayers, entry.maxPlayers)}
            />
            <KeyValueRow
              label="Shelf location"
              value={entry.shelfLocation}
            />
            <KeyValueRow
              label="Acquired"
              value={fmtDate(entry.acquiredOn)}
            />
            <KeyValueRow
              label="Paid"
              value={fmtCurrency(entry.acquiredFor)}
            />
            <KeyValueRow
              label="Mechanics"
              value={
                <span className="flex flex-wrap justify-end gap-1.5">
                  {entry.mechanics.map((m) => (
                    <Badge key={m} variant="secondary">
                      {MECHANIC_LABELS[m]}
                    </Badge>
                  ))}
                </span>
              }
            />
            {/* Notes moved to an inline-edit section in the content slot below to
                demonstrate the editability variant — see "Notes" there. */}
          </KeyValueList>
        </DetailSection>
      }
      stats={
        <StatTileRow columns={3}>
          <StatTile
            label="Plays logged"
            value={totalPlays}
            hint={lastPlayed ? `Last on ${fmtDate(lastPlayed)}` : "Never played"}
          />
          <StatTile
            label="Mean session"
            value={avgDuration != null ? fmtDuration(avgDuration) : "—"}
            hint={`Box says ${fmtDuration(entry.meanDurationMinutes)}`}
          />
          <StatTile
            label="Your rating"
            value={
              <span className="inline-flex items-center gap-1">
                {entry.rating}
                <Star className="h-5 w-5 fill-current text-amber-500" />
              </span>
            }
            hint={`Weight ${entry.weight.toFixed(1)} / 5`}
          />
        </StatTileRow>
      }
      content={
        <>
          {entry.sessions.length === 0 ? (
            <DetailSection title="Recent plays">
              <p className="text-sm text-muted-foreground">
                No plays logged yet.
              </p>
            </DetailSection>
          ) : (
            <DetailSection title="Recent plays" flush>
              <ul className="divide-y divide-border">
                {entry.sessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-6 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {fmtDate(s.playedOn)}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {s.playerCount} players ·{" "}
                        {fmtDuration(s.durationMinutes)}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm text-muted-foreground">
                      Winner:{" "}
                      <span className="font-medium text-foreground">
                        {s.winner}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}

          {/* Editability variant — inline-edit (read-only value ↔ in-place editor). */}
          <DetailSection
            title="Notes"
            actions={
              editingNotes ? (
                <Button
                  size="sm"
                  className="-my-1.5 h-7 text-xs"
                  onClick={() => setEditingNotes(false)}
                >
                  Save
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="-my-1.5 h-7 text-xs"
                  onClick={() => setEditingNotes(true)}
                >
                  Edit
                </Button>
              )
            }
          >
            {editingNotes ? (
              <Textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            ) : (
              <p className="text-sm leading-relaxed text-foreground">{notes}</p>
            )}
          </DetailSection>
        </>
      }
      references={
        <DetailSection title="Resources" tone="muted" flush>
          <ul className="divide-y divide-border/60">
            <li className="px-5 py-2.5">
              <a
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                href="#"
              >
                Rulebook (PDF)
              </a>
            </li>
            <li className="px-5 py-2.5">
              <a
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                href="#"
              >
                BoardGameGeek entry
              </a>
            </li>
          </ul>
        </DetailSection>
      }
    />
  );
}

DetailOverviewDemo.displayName = "DetailOverviewDemo";
