import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MetricList, MetricRow } from "./MetricList";

afterEach(() => {
  cleanup();
});

const primary = <MetricRow label="Umsatz" value="1.234 €" emphasis />;
const secondary = <MetricRow label="Versand" value="12 €" />;

describe("MetricList", () => {
  it("renders no disclosure trigger without a `more` prop", () => {
    render(<MetricList>{primary}</MetricList>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("starts collapsed: `more` content hidden behind the moreLabel", () => {
    render(<MetricList more={secondary}>{primary}</MetricList>);
    expect(screen.getByRole("button").textContent).toContain("Show more");
    expect(screen.queryByText("Versand")).toBeNull();
  });

  it("toggles the label and the `more` content on click", () => {
    render(<MetricList more={secondary}>{primary}</MetricList>);
    const trigger = screen.getByRole("button");

    fireEvent.click(trigger);
    expect(trigger.textContent).toContain("Show less");
    expect(screen.getByText("Versand")).toBeTruthy();

    fireEvent.click(trigger);
    expect(trigger.textContent).toContain("Show more");
    expect(screen.queryByText("Versand")).toBeNull();
  });

  it("honours custom moreLabel/lessLabel across the toggle", () => {
    render(
      <MetricList
        more={secondary}
        moreLabel="Mehr anzeigen"
        lessLabel="Weniger anzeigen"
      >
        {primary}
      </MetricList>,
    );
    const trigger = screen.getByRole("button");

    expect(trigger.textContent).toContain("Mehr anzeigen");
    fireEvent.click(trigger);
    expect(trigger.textContent).toContain("Weniger anzeigen");
  });
});

describe("MetricRow emphasis", () => {
  const renderRow = (props: { emphasis?: boolean }) => {
    const { unmount } = render(
      <MetricRow label="Rohertrag" value="420 €" {...props} />,
    );
    const label = screen.getByText("Rohertrag").className;
    const value = screen.getByText("420 €").className;
    unmount();
    return { label, value };
  };

  it("renders the secondary tier by default", () => {
    const { label, value } = renderRow({});
    expect(label).toContain("text-muted-foreground");
    expect(value).toContain("text-[13px]");
    expect(value).toContain("text-foreground");
  });

  it("emphasis enlarges the value and un-mutes the label", () => {
    const { label, value } = renderRow({ emphasis: true });
    expect(label).not.toContain("text-muted-foreground");
    expect(value).toContain("text-base");
    expect(value).toContain("text-foreground");
  });

  // The figure never carries a brand tint: the deleted `accent` flag was
  // per-call-site discretion no contract keyed (ADR-0004), so every row's
  // value renders `text-foreground` whatever its tier.
  it("never tints the value with the brand token", () => {
    expect(renderRow({}).value).not.toContain("text-primary");
    expect(renderRow({ emphasis: true }).value).not.toContain("text-primary");
  });
});
