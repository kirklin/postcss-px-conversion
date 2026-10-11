import { describe, expect, it } from "vitest";
import { convert } from "./utils";

describe("landscape", () => {
  it("fails with PostCSS 8", () => {
    expect(() => convert(".a { width: 71px }", { enableLandscape: true })).toThrow("AtRule is not a constructor");
  });
});
