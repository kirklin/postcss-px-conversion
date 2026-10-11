import type { Options } from "../src/types";
import { describe, expect, it } from "vitest";
import postcssPxConversion from "../src";
import { convert } from "./utils";

describe("replaceRules", () => {
  it("adds the converted declaration after the original when false", () => {
    expect(convert(".a { width: 15px; height: 15px }", { replaceRules: false })).toBe(
      ".a { width: 15px; width: 4vw; height: 15px; height: 4vw }",
    );
  });

  it("adds the converted declaration in keyframes too", () => {
    expect(convert("@keyframes move { to { left: 15px } }", { replaceRules: false })).toBe(
      "@keyframes move { to { left: 15px; left: 4vw } }",
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
  it("uses the defaults for options set to undefined", () => {
    expect(convert(".a { width: 15px }", { viewportWidth: undefined, viewportUnit: undefined })).toBe(".a { width: 4vw }");
  });

  it.each<[Partial<Options>, string]>([
    [{ unitType: "px", viewportUnit: "px" }, "viewportUnit is \"px\", the same unit as unitType"],
    [{ unitType: "em", viewportUnit: "px" }, "viewportUnit \"px\" needs unitType \"rem\"; em has no fixed size in px"],
    [{ unitType: "rem", fontViewportUnit: "rem" }, "fontViewportUnit is \"rem\", the same unit as unitType"],
    [{ unitType: "em", viewportUnit: "rem" }, "viewportUnit \"rem\" needs unitType \"px\""],
    [{ enableLandscape: true, landscapeUnit: "px" }, "landscapeUnit is \"px\", the same unit as unitType"],
  ])("rejects %o", (options, message) => {
    expect(() => postcssPxConversion(options)).toThrow(`[postcss-px-conversion] ${message}`);
  });

  it("only checks landscapeUnit when landscape is enabled", () => {
    expect(() => postcssPxConversion({ landscapeUnit: "px" })).not.toThrow();
  });
});
