import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { StatTileRow } from "./StatTileRow";
import { StatTile } from "./StatTile";

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
});
