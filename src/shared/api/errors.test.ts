import { describe, expect, it } from "vitest";

import { parseApiError } from "./errors";

describe("parseApiError", () => {
  it("reads the API error message", () => {
    expect(parseApiError({ error: { message: "Permission denied" } }, "fallback")).toBe("Permission denied");
  });

  it("falls back when the body is not an error", () => {
    expect(parseApiError(null, "fallback")).toBe("fallback");
  });
});
