import type { Options } from "../src/types";
import postcss from "postcss";
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
    [{ unitType: "p x" }, "unitType must be a CSS unit such as \"px\" or \"vw\", received p x"],
    [{ viewportWidth: 0 }, "viewportWidth must be a number greater than 0, received 0"],
    [{ viewportWidth: "375" as unknown as number }, "viewportWidth must be a number greater than 0, received 375"],
    [{ rootValue: Number.NaN }, "rootValue must be a number greater than 0, received NaN"],
    [{ unitPrecision: 1.5 }, "unitPrecision must be a whole number of 0 or more, received 1.5"],
    [{ minPixelValue: Number.NaN }, "minPixelValue must be a number, received NaN"],
    [{ allowedProperties: "width" as unknown as string[] }, "allowedProperties must be an array of strings"],
    [{ selectorBlacklist: [1] as unknown as string[] }, "selectorBlacklist must be an array of strings and regular expressions"],
    [{ excludeFiles: /node_modules/ as unknown as RegExp[] }, "excludeFiles must be an array of strings and regular expressions"],
    [{ replaceRules: "false" as unknown as boolean }, "replaceRules must be true or false, received false"],
    [{ enableLandscape: true, landscapeViewportWidth: -1 }, "landscapeViewportWidth must be a number greater than 0, received -1"],
    [{ viewportWidthComment: "" }, "viewportWidthComment must be a non-empty string"],
  ])("rejects %o", (options, message) => {
    expect(() => postcssPxConversion(options)).toThrow(`[postcss-px-conversion] ${message}`);
  });

  it("only checks landscape options when landscape is enabled", () => {
    expect(() => postcssPxConversion({ landscapeUnit: "px", landscapeViewportWidth: 0 })).not.toThrow();
  });

  it("works when PostCSS calls the creator itself", () => {
    expect(postcss([postcssPxConversion]).process(".a { width: 75px }", { from: undefined }).css).toBe(".a { width: 20vw }");
  });
});
