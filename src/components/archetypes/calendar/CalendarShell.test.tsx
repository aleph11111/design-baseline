import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CalendarShell } from "./CalendarShell";

afterEach(() => {
  cleanup();
});

const days = [{ id: "mon", dow: "Mo", date: "22", events: [] }];

describe("CalendarShell", () => {
  it("renders the title once, as the page h1, with no on-surface title", () => {
    const { container } = render(<CalendarShell title="Room schedule" days={days} />);

    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]?.textContent).toBe("Room schedule");
    expect(screen.getAllByText("Room schedule")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
  });

  it("puts period navigation in the toolbar band and the create action in the header", () => {
    render(
      <CalendarShell
        title="Room schedule"
        toolbar={<button>Today</button>}
        actions={<button>New event</button>}
        days={days}
      />,
    );

    const band = screen.getByText("Today").closest(".border-b") as HTMLElement;
    expect(band).not.toBeNull();
    expect(band.contains(screen.getByText("New event"))).toBe(false);
  });
});
