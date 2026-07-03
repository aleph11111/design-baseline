import * as React from "react";
import { ConfirmationDialog } from "design-baseline";

// ConfirmationDialog wraps AlertDialog behind an isOpen/onClose/onConfirm
// contract — shown open with the destructive variant, the common
// row-actions "Delete this?" composition.
export function Open() {
  return (
    <ConfirmationDialog
      isOpen
      onClose={() => {}}
      onConfirm={() => {}}
      title="Delete workout log?"
      description="This permanently removes the entry from your training history. This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
    />
  );
}
