import { describe, expect, it } from "vitest";

import { parseHealth } from "./client";

describe("parseHealth", () => {
  it("accepts a health payload", () => {
    expect(parseHealth({ status: "ok", database: "ok", version: "0.1.0" })).toEqual({
      status: "ok",
      database: "ok",
      version: "0.1.0",
    });
  });

  it("rejects a payload missing version", () => {
    expect(() => parseHealth({ status: "ok", database: "ok" })).toThrow(/Invalid health response/);
  });

  it("rejects non-objects", () => {
    expect(() => parseHealth(null)).toThrow(/Invalid health response/);
  });
});
