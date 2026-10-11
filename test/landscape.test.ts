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

  it("uses landscapeUnit and a landscapeViewportWidth function", () => {
    const options = { ...landscape, landscapeUnit: "vh", landscapeViewportWidth: () => 710 };
    expect(normalize(convert(".a { width: 71px }", options))).toBe(normalize(
      ".a { width: 18.93333vw } @media (orientation: landscape) { .a { width: 10vh } }",
    ));
  });

  it("passes the at-rules around the copied rule to a landscapeViewportWidth function", () => {
    const contexts: postcssPxConversion.ConversionContext[] = [];
    convert("@layer base { .a { width: 71px; @media (hover: hover) { height: 71px } } }", {
      ...landscape,
      allowMediaQuery: true,
      landscapeViewportWidth: (_file, context) => {
        contexts.push(context);
        return 568;
      },
    });
    expect(contexts).toEqual([
      { property: "width", selector: ".a", atRules: [{ name: "layer", params: "base" }] },
      { property: "height", selector: ".a", atRules: [{ name: "layer", params: "base" }, { name: "media", params: "(hover: hover)" }] },
    ]);
  });

  it("keeps the block inside the cascade layer of its rules", () => {
    expect(normalize(convert("@layer utilities { .a { width: 71px } } .b { width: 71px }", landscape))).toBe(normalize(
      "@layer utilities { .a { width: 18.93333vw } @media (orientation: landscape) { .a { width: 12.5vw } } } .b { width: 18.93333vw } @media (orientation: landscape) { .b { width: 12.5vw } }",
    ));
  });

  it("does not copy rules inside at-rules other than @layer", () => {
    const css = "@supports (display: grid) { .a { width: 71px } } @starting-style { .b { width: 71px } } @keyframes move { to { left: 71px } }";
    expect(convert(css, landscape)).toBe(
      "@supports (display: grid) { .a { width: 18.93333vw } } @starting-style { .b { width: 18.93333vw } } @keyframes move { to { left: 18.93333vw } }",
    );
  });

  it("keeps nested rules in the copy", () => {
    expect(normalize(convert(".a { width: 71px; &:hover { width: 142px; color: red } }", landscape))).toBe(normalize(
      ".a { width: 18.93333vw; &:hover { width: 37.86667vw; color: red } } @media (orientation: landscape) { .a { width: 12.5vw; &:hover { width: 25vw } } }",
    ));
  });

  it("checks nested rules in the copy the same way as for conversion", () => {
    expect(normalize(convert(".a { width: 71px; @media (hover: hover) { height: 71px } }", landscape))).toBe(normalize(
      ".a { width: 18.93333vw; @media (hover: hover) { height: 71px } } @media (orientation: landscape) { .a { width: 12.5vw } }",
    ));
    expect(normalize(convert(".a { width: 71px; .skip { height: 71px } }", { ...landscape, selectorBlacklist: [".skip"] }))).toBe(normalize(
      ".a { width: 18.93333vw; .skip { height: 71px } } @media (orientation: landscape) { .a { width: 12.5vw } }",
    ));
    expect(normalize(convert(".other { .only { width: 71px } }", { ...landscape, selectorWhitelist: [".only"] }))).toBe(normalize(
      ".other { .only { width: 18.93333vw } } @media (orientation: landscape) { .other { .only { width: 12.5vw } } }",
    ));
  });

  it("leaves at-rules without a block out of the copy", () => {
    expect(normalize(convert(".a { @apply p-4; width: 71px } .b { @apply p-4 }", landscape))).toBe(normalize(
      ".a { @apply p-4; width: 18.93333vw } .b { @apply p-4 } @media (orientation: landscape) { .a { width: 12.5vw } }",
    ));
  });

  it("copies only declarations that change", () => {
    expect(normalize(convert(".a { border: 1px solid; width: 71px } .b { border: 1px solid }", landscape))).toBe(normalize(
      ".a { border: 1px solid; width: 18.93333vw } .b { border: 1px solid } @media (orientation: landscape) { .a { width: 12.5vw } }",
    ));
  });

  it("respects ignore comments, selector lists and property lists", () => {
    const css = ".a { /* px-conversion-ignore-next */ width: 71px; height: 71px; margin: 71px } .skip { width: 71px }";
    const options = { ...landscape, selectorBlacklist: [".skip"], excludedProperties: ["margin"] };
    expect(normalize(convert(css, options))).toBe(normalize(
      ".a { width: 71px; height: 18.93333vw; margin: 71px } .skip { width: 71px } @media (orientation: landscape) { .a { height: 12.5vw } }",
    ));
  });

  it("applies an ignore comment only to the declaration right after it", () => {
    expect(normalize(convert(".a { /* px-conversion-ignore-next */ color: red; width: 71px }", landscape))).toBe(normalize(
      ".a { /* px-conversion-ignore-next */ color: red; width: 18.93333vw } @media (orientation: landscape) { .a { width: 12.5vw } }",
    ));
  });

  it("does not add a block when nothing changes", () => {
    expect(convert(".a { color: red }", landscape)).toBe(".a { color: red }");
    expect(convert(".a { border: 1px solid }", landscape)).toBe(".a { border: 1px solid }");
  });

  it("does not copy a nested rule on its own", () => {
    const css = "@media print { .a { .b { width: 71px } } }";
    expect(convert(css, landscape)).toBe(css);
  });

  it("converts rules in a landscape media query with the landscape settings", () => {
    const options = { ...landscape, allowMediaQuery: true };
    expect(convert("@media (orientation: landscape) { .a { width: 71px } }", options)).toBe(
      "@media (orientation: landscape) { .a { width: 12.5vw } }",
    );
    expect(convert("@media (orientation: landscape) { .a { .b { width: 71px } } }", options)).toBe(
      "@media (orientation: landscape) { .a { .b { width: 12.5vw } } }",
    );
    expect(convert("@supports (--mode: landscape) { .a { width: 71px } }", options)).toBe(
      "@supports (--mode: landscape) { .a { width: 18.93333vw } }",
    );
  });

  it("starts over for every file", () => {
    const processor = postcss([postcssPxConversion(landscape)]);
    processor.process(".a { width: 71px }", { from: "/project/a.css" }).toString();
    expect(normalize(processor.process(".b { width: 71px }", { from: "/project/b.css" }).css)).toBe(normalize(
      ".b { width: 18.93333vw } @media (orientation: landscape) { .b { width: 12.5vw } }",
    ));
  });
});
