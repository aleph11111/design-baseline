import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { SectionCard } from "./SectionCard";

afterEach(() => {
  cleanup();
});

/** The single `<section>` SectionCard renders — the branch-selection witness. */
function sectionOf(container: HTMLElement): HTMLElement {
  const section = container.querySelector("section");
  expect(section).not.toBeNull();
  return section as HTMLElement;
}

describe("SectionCard — chrome=true (default)", () => {
  it("renders the bordered, rounded card surface", () => {
    const { container } = render(
      <SectionCard title="Details">
        <p>body</p>
      </SectionCard>,
    );

    const section = sectionOf(container);
    expect(section.className).toContain("rounded-lg");
    expect(section.className).toContain("border");
    expect(section.className).toContain("bg-card");
  });

  it("renders a ruled title bar when title is set", () => {
    const { container, getByText } = render(
      <SectionCard title="Details" description="A clarifier">
        <p>body</p>
      </SectionCard>,
    );

    const bar = sectionOf(container).firstElementChild as HTMLElement;
    expect(bar.className).toContain("border-b");
    expect(bar.contains(getByText("Details"))).toBe(true);
    expect(bar.contains(getByText("A clarifier"))).toBe(true);
  });

  it("renders a ruled title bar when only header is set", () => {
    const { container, getByText } = render(
      <SectionCard header={<span>Custom header</span>}>
        <p>body</p>
      </SectionCard>,
    );

    const bar = sectionOf(container).firstElementChild as HTMLElement;
    expect(bar.className).toContain("border-b");
    expect(bar.contains(getByText("Custom header"))).toBe(true);
  });

  it("renders no title bar when neither title nor header is set", () => {
    const { container } = render(
      <SectionCard>
        <p>body</p>
      </SectionCard>,
    );

    const section = sectionOf(container);
    expect(section.children).toHaveLength(1);
    expect(section.querySelector("h2")).toBeNull();
    expect(
      (section.firstElementChild as HTMLElement).className,
    ).not.toContain("border-b");
  });

  it("applies the muted surface for tone='muted'", () => {
    const { container } = render(
      <SectionCard title="Details" tone="muted">
        <p>body</p>
      </SectionCard>,
    );

    const section = sectionOf(container);
    expect(section.className).toContain("bg-muted/40");
    expect(section.className).not.toContain("bg-card");
  });
});

describe("SectionCard — chrome=false", () => {
  it("renders a flat section with no card chrome", () => {
    const { container } = render(
      <SectionCard title="Details" chrome={false}>
        <p>body</p>
      </SectionCard>,
    );

    const section = sectionOf(container);
    expect(section.className).toContain("py-4");
    expect(section.className).not.toContain("rounded-lg");
    expect(section.className).not.toContain("border");
    expect(section.className).not.toContain("bg-card");
  });

  it("renders the bar as a plain gutter-padded overline, not a ruled bar", () => {
    const { container, getByText } = render(
      <SectionCard title="Details" chrome={false}>
        <p>body</p>
      </SectionCard>,
    );

    const bar = sectionOf(container).firstElementChild as HTMLElement;
    expect(bar.className).toContain("px-5");
    expect(bar.className).not.toContain("border-b");
    expect(bar.contains(getByText("Details"))).toBe(true);
  });

  it("renders no bar when neither title nor header is set", () => {
    const { container } = render(
      <SectionCard chrome={false}>
        <p>body</p>
      </SectionCard>,
    );

    const section = sectionOf(container);
    expect(section.children).toHaveLength(1);
    expect(section.querySelector("h2")).toBeNull();
  });

  // Documents current behaviour: `tone` is read only in the chrome=true branch.
  // If this ever starts failing, the change should be deliberate.
  it("ignores tone entirely", () => {
    const { container: defaultTone } = render(
      <SectionCard title="Details" chrome={false}>
        <p>body</p>
      </SectionCard>,
    );
    const { container: mutedTone } = render(
      <SectionCard title="Details" chrome={false} tone="muted">
        <p>body</p>
      </SectionCard>,
    );

    expect(mutedTone.innerHTML).toBe(defaultTone.innerHTML);
  });
});

describe("SectionCard — header/title precedence", () => {
  it("renders header and drops title when both are provided (chrome=true)", () => {
    const { container, getByText, queryByText } = render(
      <SectionCard title="Ignored title" header={<span>Custom header</span>}>
        <p>body</p>
      </SectionCard>,
    );

    const bar = sectionOf(container).firstElementChild as HTMLElement;
    expect(bar.contains(getByText("Custom header"))).toBe(true);
    expect(queryByText("Ignored title")).toBeNull();
  });

  it("renders header and drops title when both are provided (chrome=false)", () => {
    const { getByText, queryByText } = render(
      <SectionCard
        title="Ignored title"
        header={<span>Custom header</span>}
        chrome={false}
      >
        <p>body</p>
      </SectionCard>,
    );

    expect(getByText("Custom header")).toBeTruthy();
    expect(queryByText("Ignored title")).toBeNull();
  });
});

describe("SectionCard — flush", () => {
  it("wraps content in padding by default (chrome=true)", () => {
    const { container, getByText } = render(
      <SectionCard title="Details">
        <p>body</p>
      </SectionCard>,
    );

    const body = sectionOf(container).children[1] as HTMLElement;
    expect(body.className).toContain("px-5");
    expect(body.className).toContain("py-4");
    expect(body.contains(getByText("body"))).toBe(true);
  });

  it("renders content flush to the section edges when flush is set", () => {
    const { container, getByText } = render(
      <SectionCard title="Details" flush>
        <p>body</p>
      </SectionCard>,
    );

    const body = sectionOf(container).children[1] as HTMLElement;
    expect(body).toBe(getByText("body"));
  });

  it("wraps content in gutter padding by default (chrome=false)", () => {
    const { container, getByText } = render(
      <SectionCard title="Details" chrome={false}>
        <p>body</p>
      </SectionCard>,
    );

    const body = sectionOf(container).children[1] as HTMLElement;
    expect(body.className).toContain("px-5");
    expect(body.contains(getByText("body"))).toBe(true);
  });

  it("renders content flush when flush is set (chrome=false)", () => {
    const { container, getByText } = render(
      <SectionCard title="Details" chrome={false} flush>
        <p>body</p>
      </SectionCard>,
    );

    const body = sectionOf(container).children[1] as HTMLElement;
    expect(body).toBe(getByText("body"));
  });
});
