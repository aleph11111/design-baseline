import * as React from "react";
import { Overline } from "@/components/archetypes/overline-typed";

/**
 * overline-typed demo — a podcast episode shelf (domain deliberately far from any
 * source project: no finance/CRM/transcription/dashboard nouns).
 *
 * v2: `<Overline>` carries the base signature — color included — and has no
 * `tone` prop. The demo shows the fixed look (default), a layout-only className
 * (spacing), and the contract's one-off channel: a single `text-*` color class at
 * a single site. On the accent surface below the recolor is a `text-primary-foreground`
 * one-off at the site, exactly the shape a surface contract's binding takes —
 * the molecule itself stays on the base signature.
 */

interface Episode {
  season: string;
  title: string;
  state: "new" | "archived";
}

const EPISODES: Episode[] = [
  { season: "Season 3 · Ep 7", title: "The Cartographers' Dispute", state: "new" },
  { season: "Season 2 · Ep 12", title: "Letters from the Lighthouse", state: "archived" },
];

export function OverlineTypedDemo(): React.ReactElement {
  return (
    <div className="mx-auto max-w-md space-y-6 px-6 py-8">
      <div className="space-y-1">
        {/* Overline as a heading kicker (as="h2"): the fixed base signature. */}
        <Overline as="h2">Latest episodes</Overline>
        <p className="text-sm text-muted-foreground">
          Every kicker below is one <code>{"<Overline>"}</code> on the fixed base
          signature — the color is part of the signature, so there is nothing per-site
          to choose (L7, v2).
        </p>
      </div>

      <ul className="space-y-3">
        {EPISODES.map((ep) => (
          <li
            key={ep.title}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            {/* Section kicker: spacing rides the className passthrough; the color does not. */}
            <Overline className="mb-1">{ep.season}</Overline>
            <h3 className="text-base font-semibold tracking-tight">{ep.title}</h3>
          </li>
        ))}
      </ul>

      {/* The one-off channel: a single site recolors the eyebrow to a brand color. */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <Overline className="mb-1 text-primary">New drop</Overline>
        <p className="text-sm text-muted-foreground">
          A *single* site that needs a color the base signature does not cover passes one{" "}
          <code>text-*</code> class through the passthrough — a per-category set of
          recolors belongs to a badge or a local fork, not to this label.
        </p>
      </div>

      {/* On an accent-filled surface the recolor is the surface's job, not the
          molecule's: the site passes the surface's own color class. */}
      <div className="rounded-lg bg-primary p-4">
        <Overline className="text-primary-foreground/80">Bonus feed</Overline>
        <p className="text-sm text-primary-foreground/80">
          On a solid accent surface the neutrals vanish — the site supplies the surface's
          own color class, the shape a surface contract's binding takes.
        </p>
      </div>
    </div>
  );
}

OverlineTypedDemo.displayName = "OverlineTypedDemo";
