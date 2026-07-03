import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "design-baseline";

// Default toast, open — composed statically (no trigger needed) since the
// radix primitive accepts `open` directly. `static` position on the toast
// and viewport keeps it in-flow inside the card rather than pinned to the
// real viewport corner.
export function Default() {
  return (
    <ToastProvider swipeDirection="right">
      <Toast open className="static w-80">
        <div className="grid gap-1">
          <ToastTitle>Changes saved</ToastTitle>
          <ToastDescription>
            Your project settings were updated successfully.
          </ToastDescription>
        </div>
      </Toast>
      <ToastViewport className="static flex-col p-0" />
    </ToastProvider>
  );
}

// Destructive variant with an action button — the error/undo shape.
export function DestructiveWithAction() {
  return (
    <ToastProvider swipeDirection="right">
      <Toast open variant="destructive" className="static w-80">
        <div className="grid gap-1">
          <ToastTitle>Upload failed</ToastTitle>
          <ToastDescription>
            The file exceeded the 25MB size limit.
          </ToastDescription>
        </div>
        <ToastAction altText="Try again">Try again</ToastAction>
      </Toast>
      <ToastViewport className="static flex-col p-0" />
    </ToastProvider>
  );
}
