import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { JoinedLabelText } from "./toolbar-band";

afterEach(cleanup);

describe("JoinedLabelText", () => {
  it("sets title to the text for string children", () => {
    render(<JoinedLabelText>Konsolidierungsgruppe</JoinedLabelText>);
    expect(screen.getByText("Konsolidierungsgruppe").getAttribute("title")).toBe("Konsolidierungsgruppe");
  });

  it("sets no title for ReactNode children", () => {
    render(
      <JoinedLabelText>
        <b>Scenario</b>
      </JoinedLabelText>,
    );
    expect(screen.getByText("Scenario").parentElement?.hasAttribute("title")).toBe(false);
  });
});
