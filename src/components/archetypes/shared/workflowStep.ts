/**
 * The one workflow-state model a work queue and a transaction document share
 * (grouped-list work-queue variant, transaction-document `nextStep.step`):
 * the list groups by it and the detail page's next-step panel takes it as
 * `nextStep.step`, reading its tone (and, by default, its label) from it — so
 * a status declared once in the consumer reads the same on both pages.
 */

/**
 * Attention tone of a workflow step: a routine step → `default`; a problem the
 * user must resolve → `warning`; a failed or blocked state → `danger`; the
 * work is complete → `success`.
 */
export type WorkflowTone = "default" | "warning" | "danger" | "success";

/** One step of a document workflow (To pay › To pick › To pack › Shipped › Delivered). */
export type WorkflowStep<Key extends string = string> = {
  /** Stable key; the consumer's status value. */
  key: Key;
  /** What has to happen next, as a group title ("To pack"). */
  label: string;
  /** Attention tone; omitted → `default`. */
  tone?: WorkflowTone;
  /** `open` steps are the work queue; `completed` steps are the archive. */
  phase: "open" | "completed";
};
