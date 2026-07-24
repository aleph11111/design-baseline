import * as React from "react";
import { Overline, type OverlineTone } from "@/components/archetypes/overline-typed";

/**
 * overline-typed demo — a podcast episode shelf (domain deliberately far from any
 * source project: no finance/CRM/transcription/dashboard nouns). Types are defined
 * here FIRST, then fed to <Overline>; the primitive never sees a domain type, only its
 * generic children / tone / as props.
 *
 * Each card shows the two roles the fleet hand-rolls: a section kicker above a title,
 * and a status eyebrow whose tone is keyed off domain state — exactly the "typed" layer
 * my-finance-app and hk-crm re-invented.
 */

interface Episode {
  season: string;
  title: string;
  state: "new" | "playing" | "archived";
}

// Domain state → a baseline tone. This mapping lives in the DEMO, not the primitive —
// the primitive only knows the closed tone set, not what "archived" means.
const STATE_TONE: Record<Episode["state"], OverlineTone> = {
  new: "primary",
  playing: "foreground",
  archived: "muted",
};

const STATE_LABEL: Record<Episode["state"], string> = {
  new: "New drop",
  playing: "Now playing",
  archived: "Archived",
};

const EPISODES: Episode[] = [
  { season: "Season 3 · Ep 7", title: "The Cartographers' Dispute", state: "new" },
  { season: "Season 3 · Ep 6", title: "A Field Guide to Silence", state: "playing" },
  { season: "Season 2 · Ep 12", title: "Letters from the Lighthouse", state: "archived" },
];

export function OverlineTypedDemo(): React.ReactElement {
  return (
    <div className="mx-auto max-w-md space-y-6 px-6 py-8">
      <div className="space-y-1">
        {/* Overline as a heading kicker (as="h2"), muted base tone. */}
        <Overline as="h2">Latest episodes</Overline>
        <p className="text-sm text-muted-foreground">
          Each card's season kicker and status eyebrow are one <code>{"<Overline>"}</code>{" "}
          — the tone is chosen by the demo, not hand-typed as a class string.
        </p>
      </div>

      <ul className="space-y-3">
        {EPISODES.map((ep) => (
          <li
            key={ep.title}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            {/* Section kicker: the season, quiet muted base. */}
            <Overline className="mb-1">{ep.season}</Overline>
            <h3 className="text-base font-semibold tracking-tight">{ep.title}</h3>
            {/* Status eyebrow: tone keyed off domain state (the "typed" layer). */}
            <Overline tone={STATE_TONE[ep.state]} className="mt-2">
              {STATE_LABEL[ep.state]}
            </Overline>
          </li>
        ))}
      </ul>

      {/* An inverted overline for an accent-filled surface (the hk-crm solid-header case). */}
      <div className="rounded-lg bg-primary p-4">
        <Overline tone="inverted">Bonus feed</Overline>
        <p className="text-sm text-primary-foreground/80">
          On a solid accent surface, the muted base would vanish — <code>tone="inverted"</code>{" "}
          keeps the eyebrow legible.
        </p>
      </div>
    </div>
  );
}

OverlineTypedDemo.displayName = "OverlineTypedDemo";
