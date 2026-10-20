import { describe, expect, it } from "vitest";

import { formatInr } from "./format";

describe("formatInr", () => {
  it("formats a decimal string as rupees", () => {
    expect(formatInr("199.00")).toContain("199");
  });

  it("returns an empty string for a missing price", () => {
    expect(formatInr(null)).toBe("");
  });
});
