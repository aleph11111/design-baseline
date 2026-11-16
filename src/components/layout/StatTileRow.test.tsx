import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { StatTileRow } from "./StatTileRow";
import { StatTile } from "./StatTile";
import { SurfaceFrame } from "./SurfaceFrame";

describe("StatTileRow", () => {
  it("derives the column count from all children, including a hidden conditional tile", () => {
    const { container } = render(
      <StatTileRow>
        <StatTile label="A" value="1" />
        <StatTile label="B" value="2" />
        <StatTile label="C" value="3" />
        <StatTile label="D" value="4" />
      </StatTileRow>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("sm:grid-cols-4");
  });

  it("derives the visible tile count, not the child-slot count, when a conditional tile is hidden", () => {
    const showD = false;
    const { container } = render(
      <StatTileRow>
        <StatTile label="A" value="1" />
        <StatTile label="B" value="2" />
        {showD && <StatTile label="D" value="4" />}
      </StatTileRow>,
    );
    const className = (container.firstChild as HTMLElement).className;
    expect(className).toContain("sm:grid-cols-2");
    expect(className).not.toContain("sm:grid-cols-4");
  });

  it("is bordered on the canvas and drops border and fill when nested (ADR-0015)", () => {
    const tiles = [<StatTile key="a" label="A" value="1" />, <StatTile key="b" label="B" value="2" />];
    const top = render(<StatTileRow>{tiles}</StatTileRow>);
    expect((top.container.firstChild as HTMLElement).className.split(" ")).toContain("border");
    const nested = render(
      <SurfaceFrame>
        <StatTileRow>{tiles}</StatTileRow>
      </SurfaceFrame>,
    );
    const row = nested.container.firstElementChild?.firstElementChild as HTMLElement;
    expect(row.className.split(" ")).not.toContain("border");
    expect(row.className).not.toContain("bg-surface-raised");
  });
});
