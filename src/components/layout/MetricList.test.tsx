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

describe("MetricRow emphasis/accent", () => {
  const renderRow = (props: { emphasis?: boolean; accent?: boolean }) => {
    const { unmount } = render(
      <MetricRow label="Rohertrag" value="420 €" {...props} />,
    );
    const label = screen.getByText("Rohertrag").className;
    const value = screen.getByText("420 €").className;
    unmount();
    return { label, value };
  };

  it("applies neither treatment by default", () => {
    const { label, value } = renderRow({});
    expect(label).toContain("text-muted-foreground");
    expect(value).toContain("text-[13px]");
    expect(value).toContain("text-foreground");
    expect(value).not.toContain("text-primary");
  });

  it("emphasis alone enlarges the value without tinting it", () => {
    const { label, value } = renderRow({ emphasis: true });
    expect(label).not.toContain("text-muted-foreground");
    expect(value).toContain("text-base");
    expect(value).toContain("text-foreground");
    expect(value).not.toContain("text-primary");
  });

  it("accent alone tints the value without enlarging it", () => {
    const { label, value } = renderRow({ accent: true });
    expect(label).toContain("text-muted-foreground");
    expect(value).toContain("text-[13px]");
    expect(value).toContain("text-primary");
    expect(value).not.toContain("text-foreground");
  });

  it("emphasis and accent compose", () => {
    const { label, value } = renderRow({ emphasis: true, accent: true });
    expect(label).not.toContain("text-muted-foreground");
    expect(value).toContain("text-base");
    expect(value).toContain("text-primary");
    expect(value).not.toContain("text-foreground");
  });
});
