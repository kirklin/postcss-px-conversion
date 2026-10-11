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

  it("matches standard properties in any case and custom properties exactly", () => {
    expect(convert(".a { WIDTH: 15px; --Gap: 15px }", { allowedProperties: ["width", "--gap"] })).toBe(
      ".a { WIDTH: 4vw; --Gap: 15px }",
    );
  });
});

describe("selectors", () => {
  it("leaves rules matching selectorBlacklist, including rules nested in them", () => {
    const css = ".ignore .a { width: 15px } .skip-b { width: 15px } .ok { width: 15px } .ignore { .child { width: 15px } }";
    expect(convert(css, { selectorBlacklist: [".ignore", /^\.skip-/g] })).toBe(
      ".ignore .a { width: 15px } .skip-b { width: 15px } .ok { width: 4vw } .ignore { .child { width: 15px } }",
    );
  });

  it("only converts rules matching selectorWhitelist when it is not empty", () => {
    const css = ".only { width: 15px } .other { width: 15px } .only { .child { width: 15px } }";
    expect(convert(css, { selectorWhitelist: [".only"] })).toBe(
      ".only { width: 4vw } .other { width: 15px } .only { .child { width: 4vw } }",
    );
  });

  it("tests a global regular expression from the start every time", () => {
    const css = ".skip-a { width: 15px } .skip-b { width: 15px }";
    expect(convert(css, { selectorBlacklist: [/^\.skip-/g] })).toBe(css);
    expect(convert(css, { selectorWhitelist: [/^\.skip-/g] })).toBe(".skip-a { width: 4vw } .skip-b { width: 4vw }");
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

  it("tests a global regular expression from the start every time", () => {
    const css = ".a { width: 15px; height: 15px }";
    expect(convert(css, { excludeFiles: [/node_modules/g] }, "/project/node_modules/lib/index.css")).toBe(css);
    expect(convert(css, { includeFiles: [/pages/g] }, "/project/src/pages/index.css")).toBe(".a { width: 4vw; height: 4vw }");
  });

  it("checks each declaration against the file it came from", () => {
    const root = postcss.parse(".a { width: 15px }", { from: "/project/src/a.css" });
    root.append(postcss.parse(".b { width: 15px }", { from: "/project/node_modules/b.css" }).nodes);
    const output = postcss([postcssPxConversion({ excludeFiles: [/node_modules/] })]).process(root, { from: undefined }).css;
    expect(output).toBe(".a { width: 4vw }.b { width: 15px }");
  });
});

describe("at-rules", () => {
  it("leaves rules inside @media and @container unless allowMediaQuery is set", () => {
    const css = "@media (min-width: 768px) { .a { width: 15px } } @container (min-width: 400px) { .b { width: 15px } } .c { @media (hover: hover) { width: 15px } }";
    expect(convert(css)).toBe(css);
    expect(convert(css, { allowMediaQuery: true })).toBe(
      "@media (min-width: 768px) { .a { width: 4vw } } @container (min-width: 400px) { .b { width: 4vw } } .c { @media (hover: hover) { width: 4vw } }",
    );
  });

  it("converts rules inside @layer, @supports and @scope", () => {
    expect(convert("@layer utilities { .a { width: 15px } } @supports (display: grid) { .b { width: 15px } } @scope (.card) { .c { width: 15px } }")).toBe(
      "@layer utilities { .a { width: 4vw } } @supports (display: grid) { .b { width: 4vw } } @scope (.card) { .c { width: 4vw } }",
    );
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

  it("applies allowedProperties to keyframes", () => {
    const css = "@keyframes move { to { left: 15px } }";
    expect(convert(css, { allowedProperties: ["width"] })).toBe(css);
  });

  it("applies file lists, @media and ignore comments to keyframes", () => {
    const css = "@keyframes move { to { left: 15px } }";
    expect(convert(css, { excludeFiles: [/styles/] })).toBe(css);
    const inMedia = "@media (min-width: 768px) { @keyframes move { to { left: 15px } } }";
    expect(convert(inMedia)).toBe(inMedia);
    expect(convert("@keyframes move { to { /* px-conversion-ignore-next */ left: 15px } }")).toBe(css);
  });

  it("leaves descriptors of @page, @property and @font-face", () => {
    const css = "@page { margin: 15px } @property --gap { syntax: \"<length>\"; inherits: false; initial-value: 15px } @font-face { font-family: A; src: url(a.woff2) }";
    expect(convert(css)).toBe(css);
  });

  it("converts declarations of @position-try", () => {
    expect(convert("@position-try --below { top: anchor(bottom); margin-top: 15px }")).toBe(
      "@position-try --below { top: anchor(bottom); margin-top: 4vw }",
    );
  });

  it("never converts at-rule params", () => {
    expect(convert("@media (min-width: 768px) { .a { width: 15px } }", { allowMediaQuery: true })).toBe(
      "@media (min-width: 768px) { .a { width: 4vw } }",
    );
  });
});
