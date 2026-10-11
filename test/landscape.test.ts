import postcss from "postcss";
import { describe, expect, it } from "vitest";
import postcssPxConversion from "../src";
import { convert, normalize } from "./utils";

const landscape = { enableLandscape: true } as const;

describe("landscape", () => {
  it("adds a landscape block with the values converted by landscapeViewportWidth", () => {
    expect(normalize(convert(".a { width: 71px; color: red } .b { color: blue }", landscape))).toBe(normalize(
      ".a { width: 18.93333vw; color: red } .b { color: blue } @media (orientation: landscape) { .a { width: 12.5vw } }",
    ));
  });

  it("does not copy a nested rule on its own", () => {
    const css = "@media print { .a { .b { width: 71px } } }";
    expect(convert(css, landscape)).toBe(css);
  });

  it("starts over for every file", () => {
    const processor = postcss([postcssPxConversion(landscape)]);
    processor.process(".a { width: 71px }", { from: "/project/a.css" }).toString();
    expect(normalize(processor.process(".b { width: 71px }", { from: "/project/b.css" }).css)).toBe(normalize(
      ".b { width: 18.93333vw } @media (orientation: landscape) { .b { width: 12.5vw } }",
    ));
  });
});
