import postcss from "postcss";
import { describe, expect, it } from "vitest";
import postcssPxConversion from "../src";
import { convert } from "./utils";

describe("properties", () => {
  const css = ".a { width: 15px; margin-top: 15px; scroll-margin-top: 15px; border-width: 15px }";

  it("converts the properties allowedProperties lists", () => {
    expect(convert(css, { allowedProperties: ["width"] })).toBe(
      ".a { width: 4vw; margin-top: 15px; scroll-margin-top: 15px; border-width: 15px }",
    );
    expect(convert(css, { allowedProperties: ["margin*"] })).toBe(
      ".a { width: 15px; margin-top: 4vw; scroll-margin-top: 15px; border-width: 15px }",
    );
    expect(convert(css, { allowedProperties: ["*-top"] })).toBe(
      ".a { width: 15px; margin-top: 4vw; scroll-margin-top: 4vw; border-width: 15px }",
    );
    expect(convert(css, { allowedProperties: ["*margin*"] })).toBe(
      ".a { width: 15px; margin-top: 4vw; scroll-margin-top: 4vw; border-width: 15px }",
    );
  });

  it("leaves properties negated in allowedProperties", () => {
    expect(convert(css, { allowedProperties: ["*", "!margin*", "!*width"] })).toBe(
      ".a { width: 15px; margin-top: 15px; scroll-margin-top: 4vw; border-width: 15px }",
    );
  });

  it("reads the whole prefix of a negated pattern", () => {
    expect(convert(".a { margin: 15px; margix: 15px }", { allowedProperties: ["*", "!margin*"] })).toBe(
      ".a { margin: 15px; margix: 4vw }",
    );
  });

  it("leaves properties listed in excludedProperties", () => {
    expect(convert(css, { excludedProperties: ["border*", "scroll-margin-top"] })).toBe(
      ".a { width: 4vw; margin-top: 4vw; scroll-margin-top: 15px; border-width: 15px }",
    );
  });

  it("converts nothing when allowedProperties only negates", () => {
    expect(convert(css, { allowedProperties: ["!width"] })).toBe(css);
  });

  it("matches property names exactly as written", () => {
    expect(convert(".a { WIDTH: 15px; --Gap: 15px }", { allowedProperties: ["width", "--gap"] })).toBe(
      ".a { WIDTH: 15px; --Gap: 15px }",
    );
  });
});

describe("selectors", () => {
  it("leaves rules matching selectorBlacklist but converts rules nested in them", () => {
    const css = ".ignore .a { width: 15px } .skip-b { width: 15px } .ok { width: 15px } .ignore { .child { width: 15px } }";
    expect(convert(css, { selectorBlacklist: [".ignore", /^\.skip-/g] })).toBe(
      ".ignore .a { width: 15px } .skip-b { width: 15px } .ok { width: 4vw } .ignore { .child { width: 4vw } }",
    );
  });

  it("only converts rules matching selectorWhitelist when it is not empty", () => {
    const css = ".only { width: 15px } .other { width: 15px } .only { .child { width: 15px } }";
    expect(convert(css, { selectorWhitelist: [".only"] })).toBe(
      ".only { width: 4vw } .other { width: 15px } .only { .child { width: 4vw } }",
    );
  });

  it("lets selectorBlacklist win over selectorWhitelist", () => {
    expect(convert(".convert-ignore { width: 15px }", { selectorWhitelist: ["convert"], selectorBlacklist: ["ignore"] })).toBe(
      ".convert-ignore { width: 15px }",
    );
  });

  it("does not apply selector lists to keyframes", () => {
    expect(convert("@keyframes move { 50% { transform: translateX(15px) } }", { selectorWhitelist: [".only"] })).toBe(
      "@keyframes move { 50% { transform: translateX(4vw) } }",
    );
  });
});

describe("files", () => {
  const css = ".a { width: 15px }";

  it("leaves files matching excludeFiles", () => {
    expect(convert(css, { excludeFiles: [/node_modules/] }, "/project/node_modules/lib/index.css")).toBe(css);
    expect(convert(css, { excludeFiles: ["legacy"] }, "/project/src/legacy.css")).toBe(css);
    expect(convert(css, { excludeFiles: [/node_modules/] })).toBe(".a { width: 4vw }");
  });

  it("only converts files matching includeFiles when it is not empty", () => {
    expect(convert(css, { includeFiles: [/\/pages\//] }, "/project/src/pages/index.css")).toBe(".a { width: 4vw }");
    expect(convert(css, { includeFiles: [/\/pages\//] }, "/project/src/components/button.css")).toBe(css);
    expect(convert(css, { includeFiles: [/\/pages\//] }, undefined)).toBe(css);
  });

  it("checks each rule against the file it came from", () => {
    const root = postcss.parse(".a { width: 15px }", { from: "/project/src/a.css" });
    root.append(postcss.parse(".b { width: 15px }", { from: "/project/node_modules/b.css" }).nodes);
    const output = postcss([postcssPxConversion({ excludeFiles: [/node_modules/] })]).process(root, { from: undefined }).css;
    expect(output).toBe(".a { width: 4vw }.b { width: 15px }");
  });
});

describe("at-rules", () => {
  it("leaves rules inside at-rules with params unless allowMediaQuery is set, but converts @media nested in a rule", () => {
    const css = "@media (min-width: 768px) { .a { width: 15px } } @container (min-width: 400px) { .b { width: 15px } } .c { @media (hover: hover) { width: 15px } }";
    expect(convert(css)).toBe(
      "@media (min-width: 768px) { .a { width: 15px } } @container (min-width: 400px) { .b { width: 15px } } .c { @media (hover: hover) { width: 4vw } }",
    );
    expect(convert(css, { allowMediaQuery: true })).toBe(
      "@media (min-width: 768px) { .a { width: 4vw } } @container (min-width: 400px) { .b { width: 4vw } } .c { @media (hover: hover) { width: 4vw } }",
    );
  });

  it("leaves rules inside @layer, @supports and @scope", () => {
    const css = "@layer utilities { .a { width: 15px } } @supports (display: grid) { .b { width: 15px } } @scope (.card) { .c { width: 15px } }";
    expect(convert(css)).toBe(css);
  });

  it("leaves @media inside @layer the way it leaves any @media", () => {
    const css = "@layer utilities { @media (min-width: 768px) { .a { width: 15px } } }";
    expect(convert(css)).toBe(css);
  });

  it("converts keyframes", () => {
    expect(convert("@keyframes move { from { left: 0px } to { left: 15px } }")).toBe(
      "@keyframes move { from { left: 0px } to { left: 4vw } }",
    );
  });

  it("converts keyframes regardless of allowedProperties", () => {
    expect(convert("@keyframes move { to { left: 15px } }", { allowedProperties: ["width"] })).toBe(
      "@keyframes move { to { left: 4vw } }",
    );
  });

  it("leaves descriptors of @page, @property and @font-face", () => {
    const css = "@page { margin: 15px } @property --gap { syntax: \"<length>\"; inherits: false; initial-value: 15px } @font-face { font-family: A; src: url(a.woff2) }";
    expect(convert(css)).toBe(css);
  });

  it("leaves declarations of @position-try", () => {
    const css = "@position-try --below { top: anchor(bottom); margin-top: 15px }";
    expect(convert(css)).toBe(css);
  });

  it("never converts at-rule params", () => {
    expect(convert("@media (min-width: 768px) { .a { width: 15px } }", { allowMediaQuery: true })).toBe(
      "@media (min-width: 768px) { .a { width: 4vw } }",
    );
  });
});
