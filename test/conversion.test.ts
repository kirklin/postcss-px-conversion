import { describe, expect, it } from "vitest";
import { roundNumberToPrecision } from "../src/utils";
import { convert } from "./utils";

describe("px to viewport units", () => {
  it("divides by viewportWidth and multiplies by 100", () => {
    expect(convert(".a { width: 75px; height: 375px; margin: 10px 20px }")).toBe(
      ".a { width: 20vw; height: 100vw; margin: 2.66667vw 5.33333vw }",
    );
  });

  it("uses fontViewportUnit for properties whose name contains font", () => {
    expect(convert(".a { font-size: 15px; line-height: 15px; --font-gap: 15px }", { fontViewportUnit: "vmin" })).toBe(
      ".a { font-size: 4vmin; line-height: 4vw; --font-gap: 4vmin }",
    );
  });

  it("keeps values up to minPixelValue", () => {
    expect(convert(".a { border: 1px solid; width: 0.5px; height: 2px; top: 0px }")).toBe(
      ".a { border: 1px solid; width: 0.5px; height: 0.53333vw; top: 0px }",
    );
    expect(convert(".a { border: 1px solid }", { minPixelValue: 0 })).toBe(".a { border: 0.26667vw solid }");
  });

  it("rounds to unitPrecision and writes 0 without a unit", () => {
    expect(convert(".a { width: 10px }", { unitPrecision: 2 })).toBe(".a { width: 2.67vw }");
    expect(convert(".a { width: 10px }", { unitPrecision: 0 })).toBe(".a { width: 3vw }");
    expect(convert(".a { width: 1.5px }", { unitPrecision: 0, viewportWidth: 1000 })).toBe(".a { width: 0 }");
  });

  it("keeps signs, decimals, exponents and upper-case units", () => {
    expect(convert(".a { margin: -15px +15px .75e2px 15PX }")).toBe(".a { margin: -4vw +4vw 20vw 4vw }");
  });

  it("converts numbers inside functions and var() fallbacks", () => {
    expect(convert(".a { width: calc(100% - 15px); transform: translate(-15px, 15px); height: var(--h, 15px) }")).toBe(
      ".a { width: calc(100% - 4vw); transform: translate(-4vw, 4vw); height: var(--h, 4vw) }",
    );
  });

  it("leaves strings, url() and names that only contain a number with the unit", () => {
    const css = ".a { content: \"15px\"; background: url(icon-15px.png); width: var(--gap-15px); grid-area: a15px }";
    expect(convert(css)).toBe(css);
  });

  it("reads to the end of strings that contain escaped quotes", () => {
    const css = String.raw`.a { content: "a\"15px"; quotes: '\'15px' }`;
    expect(convert(css)).toBe(css);
  });

  it("converts custom properties", () => {
    expect(convert(":root { --gap: 15px }")).toBe(":root { --gap: 4vw }");
  });

  it("keeps !important", () => {
    expect(convert(".a { width: 15px !important }")).toBe(".a { width: 4vw !important }");
  });

  it("accepts units the types do not list", () => {
    expect(convert(".a { width: 15px; font-size: 15px }", { viewportUnit: "svw", fontViewportUnit: "dvh" })).toBe(
      ".a { width: 4svw; font-size: 4dvh }",
    );
  });

  it("measures viewportWidth in unitType", () => {
    expect(convert(".a { width: 1rem }", { unitType: "rem", viewportWidth: 375 / 16, minPixelValue: 0 })).toBe(
      ".a { width: 4.26667vw }",
    );
  });
});

describe("px and rem through rootValue", () => {
  it("converts rem to px through rootValue", () => {
    const options = { unitType: "rem", viewportUnit: "px", fontViewportUnit: "px", minPixelValue: 0 } as const;
    expect(convert(".a { padding: 0.25rem 1rem; font-size: 0.875rem; margin: -1.5rem }", options)).toBe(
      ".a { padding: 4px 16px; font-size: 14px; margin: -24px }",
    );
    expect(convert(".a { padding: 1rem }", { ...options, rootValue: 10 })).toBe(".a { padding: 10px }");
  });

  it("compares minPixelValue with the value in unitType", () => {
    expect(convert(".a { padding: 0.25rem 1rem 1.5rem }", { unitType: "rem", viewportUnit: "px" })).toBe(
      ".a { padding: 0.25rem 1rem 24px }",
    );
  });

  it("converts px to rem through rootValue", () => {
    expect(convert(".a { width: 24px; height: 1px; margin: 2px }", { viewportUnit: "rem" })).toBe(
      ".a { width: 1.5rem; height: 1px; margin: 0.125rem }",
    );
  });
});

describe("roundNumberToPrecision", () => {
  it("rounds half up in decimal", () => {
    expect(roundNumberToPrecision(1.005, 2)).toBe(1.01);
    expect(roundNumberToPrecision(1.255, 2)).toBe(1.26);
    expect(roundNumberToPrecision(2.666666, 5)).toBe(2.66667);
    expect(roundNumberToPrecision(-1.005, 2)).toBe(-1.01);
  });

  it("handles numbers JavaScript prints with an exponent", () => {
    expect(roundNumberToPrecision(1e-7, 5)).toBe(0);
    expect(roundNumberToPrecision(1.5e-5, 5)).toBe(0.00002);
    expect(roundNumberToPrecision(1e21, 2)).toBe(1e21);
  });

  it("is used for converted values", () => {
    const options = { unitType: "rem", viewportUnit: "px", rootValue: 1, unitPrecision: 2, minPixelValue: 0 } as const;
    expect(convert(".a { width: 1.005rem }", options)).toBe(".a { width: 1.01px }");
  });
});
