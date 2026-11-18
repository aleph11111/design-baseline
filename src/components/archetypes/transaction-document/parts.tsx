"use client";
import * as React from "react";
import { Check, Copy, Lock as LockIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { useLabels } from "../../../lib/labels";
import type { LinkAction, Lock } from "./ledger";

export type RenderLink = (href: string, children: React.ReactNode) => React.ReactElement;

/** The page's router link adaptor, set once by the shell. */
export const RenderLinkContext = React.createContext<RenderLink>((href, children) => <a href={href}>{children}</a>);

/** A link the shell renders inline in text: a route (`href`) or a handler. */
export function ActionLink({ action }: { action: LinkAction }): React.ReactElement {
  const renderLink = React.useContext(RenderLinkContext);
  if (action.href != null) {
    // A real inline anchor inside running text (the WCAG 2.5.8 inline
    // exception): a button-style hit area would overlap the next link when a
    // chain wraps on a phone. Styled like the link button below.
    return (
      <span onClick={action.onSelect} className="text-primary underline-offset-4 [&>a:hover]:underline [&>a]:inline">
        {renderLink(action.href, action.label)}
      </span>
    );
  }
  return (
    <Button type="button" variant="link" size="inline" className="h-auto p-0" onClick={action.onSelect}>
      {action.label}
    </Button>
  );
}

/**
 * The one lock treatment: a lock icon, why the slot or field can't change
 * here, and the way out. `field` names a locked single field.
 */
export function LockNote({ lock, field }: { lock: Lock; field?: string }): React.ReactElement {
  const L = useLabels();
  return (
    <p data-slot="td-lock" className="flex items-start gap-1.5 text-sm text-muted-foreground">
      <LockIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>
        <span className="sr-only">{L.locked}: </span>
        {field ? <span className="font-medium text-foreground">{field}: </span> : null}
        {lock.reason}
        {lock.wayOut ? (
          <>
            {" "}
            <ActionLink action={lock.wayOut} />
          </>
        ) : null}
      </span>
    </p>
  );
}

/**
 * A lock as a lock icon: the reason and way out open in a popover from it
 * (keyboard and touch reachable); the reason also reads aloud without opening.
 * `field` names the locked cell or column.
 */
export function LockPopover({ lock, field }: { lock: Lock; field: string }): React.ReactElement {
  const L = useLabels();
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className="inline-flex size-6 max-md:size-11 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <LockIcon aria-hidden className="size-4" />
        <span className="sr-only">
          {L.locked}: {field}: {lock.reason}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 text-left text-sm font-normal">
        <p>{lock.reason}</p>
        {lock.wayOut ? (
          <p className="mt-1">
            <ActionLink action={lock.wayOut} />
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

/** The document id: never wraps, with a copy button. `textless`: copy button only, for a title that already shows the id. */
export function DocumentId({ id, textless }: { id: string; textless?: boolean }): React.ReactElement {
  const L = useLabels();
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <span data-slot="td-id" className="inline-flex items-center gap-1 whitespace-nowrap font-mono text-sm text-muted-foreground">
      {textless ? null : id}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={copied ? L.idCopied : L.copyId(id)}
        onClick={() => {
          // "Copied" only once the write succeeded: no clipboard (plain HTTP)
          // or a denied write leaves the button as it was.
          navigator.clipboard?.writeText(id).then(() => setCopied(true), () => {});
        }}
      >
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      </Button>
    </span>
  );
}
