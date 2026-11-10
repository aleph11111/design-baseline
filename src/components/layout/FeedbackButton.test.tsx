import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FeedbackButton } from "./FeedbackButton";
import { formatFeedbackMail, type FeedbackPayload } from "./feedback";

afterEach(cleanup);

const base: FeedbackPayload = {
  text: "Button broken\nsecond line",
  appName: "Shop",
  version: "1.2.3",
  route: "https://x/y",
  userId: "u1",
  userRole: "admin",
  userAgent: "UA",
  consoleErrors: [],
  timestamp: "2026-11-10T00:00:00.000Z",
};

describe("formatFeedbackMail", () => {
  it("formats subject from first line and puts text before context", () => {
    const { subject, body } = formatFeedbackMail(base);
    expect(subject).toBe("[feedback] Shop: Button broken");
    expect(body.indexOf("second line")).toBeLessThan(body.indexOf("App: Shop"));
    for (const l of ["Version: 1.2.3", "Route: https://x/y", "User: u1", "Role: admin", "User agent: UA", "Time: 2026-11-10T00:00:00.000Z", "(none)"])
      expect(body).toContain(l);
  });
  it("caps long first line and trims leading blank lines", () => {
    const { subject } = formatFeedbackMail({ ...base, text: `\n  ${"a".repeat(200)}` });
    expect(subject.length).toBeLessThanOrEqual("[feedback] Shop: ".length + 80);
    expect(subject.endsWith("…")).toBe(true);
  });
  it("lists console errors", () => {
    expect(formatFeedbackMail({ ...base, consoleErrors: ["boom"] }).body).toContain("  - boom");
  });
});

describe("FeedbackButton", () => {
  const props = { appName: "Shop", version: "1", userId: "u", userRole: "r" };
  it("submits payload and closes; error keeps dialog and text", async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValueOnce(undefined);
    render(<FeedbackButton {...props} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
    const ta = screen.getByLabelText("Your feedback") as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: "hello" } });
    fireEvent.keyDown(ta, { key: "Enter", ctrlKey: true });
    await screen.findByRole("alert");
    expect(ta.value).toBe("hello");
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onSubmit.mock.calls[1]?.[0]).toMatchObject({ text: "hello", appName: "Shop" });
  });
});
