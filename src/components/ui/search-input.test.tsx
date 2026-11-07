import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SearchInput } from "./search-input";
import { ControlDensityProvider } from "./toolbar-band";

afterEach(cleanup);

const box = () => screen.getByRole("searchbox");

describe("SearchInput inputSize under touch density", () => {
  it("lifts explicit sm to h-11", () => {
    render(
      <ControlDensityProvider density="touch">
        <SearchInput inputSize="sm" />
      </ControlDensityProvider>
    );
    expect(box().className).toContain("h-11");
  });
  it("keeps sm at h-8 without touch", () => {
    render(<SearchInput inputSize="sm" />);
    expect(box().className).toContain("h-8");
  });
});
