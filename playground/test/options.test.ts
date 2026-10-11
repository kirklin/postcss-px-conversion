import { describe, expect, it } from "vitest";
import { DEFAULT_OPTIONS } from "../../src/constants";
import { configSnippet, createOptions, DEFAULT_PLAYGROUND_OPTIONS, isDefault, toPattern, toPluginOptions, unsupportedTarget } from "../src/lib/options";

describe("options", () => {
  it("start from the plugin defaults", () => {
    expect(DEFAULT_PLAYGROUND_OPTIONS).toEqual(DEFAULT_OPTIONS);
  });

  it("give every call its own lists", () => {
    const options = createOptions();
    options.allowedProperties.push("width");

    expect(createOptions().allowedProperties).toEqual(["*"]);
  });

  it("read entries written as /pattern/flags as regular expressions", () => {
    expect(toPattern("/^\\.legacy/i")).toEqual(/^\.legacy/i);
    expect(toPattern(".legacy")).toBe(".legacy");
    expect(toPluginOptions(createOptions({ selectorBlacklist: ["/^\\.a/", ".b"] })).selectorBlacklist).toEqual([/^\.a/, ".b"]);
    expect(() => toPattern("/(/")).toThrow(SyntaxError);
  });

  it("tell which options differ from the defaults", () => {
    expect(isDefault("viewportWidth", 375)).toBe(true);
    expect(isDefault("viewportWidth", 750)).toBe(false);
    expect(isDefault("allowedProperties", ["*"])).toBe(true);
    expect(isDefault("allowedProperties", ["width"])).toBe(false);
  });

  it("write a config with only the changed options", () => {
    expect(configSnippet(createOptions())).toBe(`// postcss.config.mjs
import postcssPxConversion from "postcss-px-conversion";

export default {
  plugins: [
    postcssPxConversion(),
  ],
};
`);
    expect(configSnippet(createOptions({ viewportWidth: 750, allowMediaQuery: true, selectorBlacklist: ["/^\\.ignore/", ".legacy"] }))).toBe(`// postcss.config.mjs
import postcssPxConversion from "postcss-px-conversion";

export default {
  plugins: [
    postcssPxConversion({
      viewportWidth: 750,
      selectorBlacklist: [/^\\.ignore/, ".legacy"],
      allowMediaQuery: true,
    }),
  ],
};
`);
  });

  it("know which target units the plugin rejects", () => {
    expect(unsupportedTarget("px", "vw")).toBeUndefined();
    expect(unsupportedTarget("px", "rem")).toBeUndefined();
    expect(unsupportedTarget("px", "px")).toBe("same");
    expect(unsupportedTarget("rem", "px")).toBeUndefined();
    expect(unsupportedTarget("rem", "rem")).toBe("same");
    expect(unsupportedTarget("vw", "px")).toBe("px");
    expect(unsupportedTarget("vw", "rem")).toBe("rem");
  });
});
