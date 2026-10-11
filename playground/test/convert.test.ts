import postcss from "postcss";
import { describe, expect, it } from "vitest";
import postcssPxConversion from "../../src/index";
import { convert } from "../src/lib/convert";
import { createOptions, toPluginOptions } from "../src/lib/options";

const FILE = "src/style.css";

function run(input: string, overrides: Parameters<typeof createOptions>[0] = {}) {
  const options = toPluginOptions(createOptions(overrides));
  const result = convert(input, options, FILE);
  const marked = result.converted.map(value => [value.before, value.after, result.css.slice(value.from, value.to)]);
  return { result, marked, expected: postcss([postcssPxConversion(options)]).process(input, { from: FILE }).css };
}

describe("convert", () => {
  it("returns the plugin output and marks each converted number where it is", () => {
    const { result, marked, expected } = run(".card {\n  width: 320px;\n  padding: 12px 24px;\n  border: 1px solid;\n}\n");

    expect(result.css).toBe(expected);
    expect(marked).toEqual([
      ["320px", "85.33333vw", "85.33333vw"],
      ["12px", "3.2vw", "3.2vw"],
      ["24px", "6.4vw", "6.4vw"],
    ]);
  });

  it("marks negative numbers with their sign and results of zero without a unit", () => {
    const { marked } = run(".a { margin: -10px 1px 0 4px; }", { minPixelValue: 0, unitPrecision: 0 });

    expect(marked).toEqual([
      ["-10px", "-3vw", "-3vw"],
      ["1px", "0", "0"],
      ["4px", "1vw", "1vw"],
    ]);
  });

  it("leaves numbers in names, strings and functions unmarked", () => {
    const { marked } = run(".a { gap: var(--space-10px); content: \"10px\"; transform: translate3d(10px, 0, 0); }");

    expect(marked).toEqual([["10px", "2.66667vw", "2.66667vw"]]);
  });

  it("marks the declarations copied into the landscape media query", () => {
    const { result, marked, expected } = run(".banner { width: 71px; }", { enableLandscape: true });

    expect(result.css).toBe(expected);
    expect(marked).toEqual([
      ["71px", "18.93333vw", "18.93333vw"],
      ["71px", "12.5vw", "12.5vw"],
    ]);
  });

  it("marks only the added declaration when replaceRules is off", () => {
    const { result, marked } = run(".a { width: 75px; }", { replaceRules: false });

    expect(result.css).toBe(".a { width: 75px; width: 20vw; }");
    expect(marked).toEqual([["75px", "20vw", "20vw"]]);
  });

  it("finds values that sit after comments and an important flag", () => {
    const { result, marked, expected } = run(".a {\n  width /* size */ : 150px !important;\n}");

    expect(result.css).toBe(expected);
    expect(marked).toEqual([["150px", "40vw", "40vw"]]);
  });

  it("reports the width a comment sets for the file", () => {
    expect(run("/* viewport-width: 750 */\n.a { width: 75px; }").result.fileWidth).toBe(750);
    expect(run(".a { width: 75px; }").result.fileWidth).toBeUndefined();
    expect(run("/* viewport-width: 750 */\n.a { width: 75px; }", { enablePerFileConfig: false }).result.fileWidth).toBeUndefined();
  });

  it("passes on the plugin warnings", () => {
    const { result } = run(".a {\n  width: 10px;\n  /* px-conversion-ignore-prev */\n}");

    expect(result.warnings).toEqual(["Unexpected comment /* px-conversion-ignore-prev */ must be after declaration at the same line."]);
  });

  it("throws the errors of the plugin and of the CSS parser", () => {
    expect(() => run(".a { width: 10px; }", { viewportWidth: 0 })).toThrow("viewportWidth must be a number greater than 0");
    expect(() => run(".a { width: 10px; }", { viewportUnit: "px" })).toThrow("the same unit as unitType");
    expect(() => run(".a { width: 10px; }", { unitType: "em", viewportUnit: "px" })).toThrow("needs unitType \"rem\"");
    expect(() => run(".a { width: 10px;")).toThrow("1:1: Unclosed block");
  });
});
