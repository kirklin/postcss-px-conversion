import { describe, expect, it } from "vitest";
import { convert } from "./utils";

describe("replaceRules", () => {
  it("adds the converted declaration after the original when false", () => {
    expect(convert(".a { width: 15px; height: 15px }", { replaceRules: false })).toBe(
      ".a { width: 15px; width: 4vw; height: 15px; height: 4vw }",
    );
  });

  it("does not add a declaration that is already there", () => {
    const css = ".a { width: 15px; width: 4vw }";
    expect(convert(css, { replaceRules: false })).toBe(css);
  });

  it("replaces the value even when the converted declaration is already there", () => {
    expect(convert(".a { width: 4vw; width: 15px }")).toBe(".a { width: 4vw; width: 4vw }");
  });
});

describe("options", () => {
  it("lets an option set to undefined replace the default", () => {
    expect(convert(".a { width: 15px }", { viewportWidth: undefined })).toBe(".a { width: 15px }");
  });
});
