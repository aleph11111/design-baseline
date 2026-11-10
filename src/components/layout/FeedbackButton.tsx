"use client";
import * as React from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useLabels } from "../../lib/labels";
import { getConsoleErrors, type FeedbackPayload } from "./feedback";

export type FeedbackButtonLabels = {
  open: string;
  title: string;
  description: string;
  field: string;
  submit: string;
  sending: string;
  error: string;
};

const DEFAULT_LABELS: FeedbackButtonLabels = {
  open: "Send feedback",
  title: "Send feedback",
  description: "Tell us what happened or what you need. Page and browser details are attached.",
  field: "Your feedback",
  submit: "Send",
  sending: "Sending…",
  error: "Could not send feedback. Please try again.",
};

export type FeedbackButtonProps = {
  appName: string;
  version: string;
  userId: string;
  userRole: string;
  /** App-supplied transport. The component never sends anything itself. Reject to show an error. */
  onSubmit: (payload: FeedbackPayload) => Promise<void>;
  labels?: Partial<FeedbackButtonLabels>;
  className?: string;
};

/** Floating feedback button + dialog. Call `installConsoleErrorBuffer()` once at app startup. */
export function FeedbackButton({
  appName,
  version,
  userId,
  userRole,
  onSubmit,
  labels,
  className,
}: FeedbackButtonProps) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const base = useLabels();
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const submit = async () => {
    if (pending || !text.trim()) return;
    setPending(true);
    setFailed(false);
    try {
      await onSubmit({
        text,
        appName,
        version,
        userId,
        userRole,
        route: window.location.href,
        userAgent: navigator.userAgent,
        consoleErrors: getConsoleErrors(),
        timestamp: new Date().toISOString(),
      });
      setText("");
      setOpen(false);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          aria-label={L.open}
          className={className ?? "fixed bottom-4 right-4 z-40 h-11 w-11 rounded-full shadow-lg"}
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          document.getElementById(`${id}-text`)?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{L.title}</DialogTitle>
          <DialogDescription>{L.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor={`${id}-text`}>{L.field}</Label>
          <Textarea
            id={`${id}-text`}
            value={text}
            rows={6}
            disabled={pending}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                void submit();
              }
            }}
          />
          {failed && (
            <p role="alert" className="text-sm text-destructive">
              {L.error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={pending} onClick={() => setOpen(false)}>
            {base.cancel}
          </Button>
          <Button disabled={pending || !text.trim()} onClick={() => void submit()}>
            {pending ? L.sending : L.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
