import postcss from "postcss";
import { describe, expect, it } from "vitest";
import postcssPxConversion from "../src";
import { convert } from "./utils";

describe("per-file width comments", () => {
  it("uses the whole number written in a viewport-width comment", () => {
    expect(convert("/* viewport-width: 750 */ .a { width: 75px }")).toBe("/* viewport-width: 750 */ .a { width: 10vw }");
    expect(convert("/* viewport-width: 187.5 */ .a { width: 75px }")).toBe("/* viewport-width: 187.5 */ .a { width: 40.10695vw }");
  });

  it("reads the comment set by viewportWidthComment", () => {
    expect(convert("/* design-width 750 */ .a { width: 75px }", { viewportWidthComment: "design-width" })).toBe(
      "/* design-width 750 */ .a { width: 10vw }",
    );
  });

  it("ignores the comment when enablePerFileConfig is false", () => {
    expect(convert("/* viewport-width: 750 */ .a { width: 75px }", { enablePerFileConfig: false })).toBe(
      "/* viewport-width: 750 */ .a { width: 20vw }",
    );
  });

  it("applies each comment to the file it was written in", () => {
    const root = postcss.parse("/* viewport-width: 750 */ .a { width: 75px }", { from: "/project/src/desktop.css" });
    root.append(postcss.parse(" .b { width: 75px }", { from: "/project/src/mobile.css" }).nodes);
    const output = postcss([postcssPxConversion({})]).process(root, { from: undefined }).css;
    expect(output).toBe("/* viewport-width: 750 */ .a { width: 10vw } .b { width: 20vw }");
  });

  it("falls back to viewportWidth for a width of 0", () => {
    expect(convert("/* viewport-width: 0 */ .a { width: 75px }")).toBe("/* viewport-width: 0 */ .a { width: 20vw }");
  });
});

describe("viewportWidth functions", () => {
  it("receives the file path", () => {
    const options = { viewportWidth: (file: string) => file.includes("desktop") ? 1500 : 375 };
    expect(convert(".a { width: 75px }", options, "/project/src/desktop.css")).toBe(".a { width: 5vw }");
    expect(convert(".a { width: 75px }", options, "/project/src/mobile.css")).toBe(".a { width: 20vw }");
  });

  it("leaves the declaration when the function returns undefined or 0", () => {
    expect(convert(".a { width: 75px }", { viewportWidth: () => undefined })).toBe(".a { width: 75px }");
    expect(convert(".a { width: 75px }", { viewportWidth: () => 0 })).toBe(".a { width: 75px }");
  });

  it("is overridden by a per-file comment", () => {
    expect(convert("/* viewport-width: 750 */ .a { width: 75px }", { viewportWidth: () => 375 })).toBe(
      "/* viewport-width: 750 */ .a { width: 10vw }",
    );
  });
});

describe("ignore comments", () => {
  it("leaves the declaration after px-conversion-ignore-next and removes the comment", () => {
    expect(convert(".a { /* px-conversion-ignore-next */ width: 15px; height: 15px }")).toBe(".a { width: 15px; height: 4vw }");
  });

  it("leaves the declaration before px-conversion-ignore-prev on the same line", () => {
    expect(convert(".a { width: 15px; /* px-conversion-ignore-prev */ height: 15px }")).toBe(".a { width: 15px; height: 4vw }");
  });

  it("warns about px-conversion-ignore-prev on a line of its own and converts the declaration", () => {
    const result = postcss([postcssPxConversion({})]).process(".a {\n  width: 15px;\n  /* px-conversion-ignore-prev */\n}", { from: undefined });
    expect(result.css).toBe(".a {\n  width: 4vw;\n  /* px-conversion-ignore-prev */\n}");
    expect(result.warnings().map(warning => warning.text)).toEqual([
      "Unexpected comment /* px-conversion-ignore-prev */ must be after declaration at the same line.",
    ]);
  });

  it("applies to declarations in nested rules", () => {
    expect(convert(".a { width: 15px; .b { /* px-conversion-ignore-next */ height: 15px } }")).toBe(".a { width: 4vw; .b { height: 15px } }");
  });

  it("keeps the comment when the declaration has nothing to convert", () => {
    const css = ".a { /* px-conversion-ignore-next */ color: red }";
    expect(convert(css)).toBe(css);
  });
});
