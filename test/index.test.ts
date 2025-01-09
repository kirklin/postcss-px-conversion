import { describe, expect, it } from "vitest";
import { DEFAULT_OPTIONS } from "../src/constants";
import { shouldExcludeSelector } from "../src/utils";

describe("selector whitelist and blacklist", () => {
  it("should handle empty whitelist and blacklist", () => {
    const options = { ...DEFAULT_OPTIONS };
    expect(shouldExcludeSelector(options, ".test")).toBe(false);
  });

  it("should exclude selectors in blacklist", () => {
    const options = {
      ...DEFAULT_OPTIONS,
      selectorBlacklist: ["ignore", /^\.ignore-/],
    };
    expect(shouldExcludeSelector(options, ".ignore-this")).toBe(true);
    expect(shouldExcludeSelector(options, "button.ignore")).toBe(true);
    expect(shouldExcludeSelector(options, ".normal")).toBe(false);
  });

  it("should only include selectors in whitelist when specified", () => {
    const options = {
      ...DEFAULT_OPTIONS,
      selectorWhitelist: ["convert", /^\.convert-/],
    };
    expect(shouldExcludeSelector(options, ".convert-this")).toBe(false);
    expect(shouldExcludeSelector(options, "button.convert")).toBe(false);
    expect(shouldExcludeSelector(options, ".normal")).toBe(true);
  });

  it("should handle both whitelist and blacklist", () => {
    const options = {
      ...DEFAULT_OPTIONS,
      selectorBlacklist: ["ignore", /^\.ignore-/],
      selectorWhitelist: ["convert", /^\.convert-/],
    };
    // Blacklist takes precedence
    expect(shouldExcludeSelector(options, ".ignore-convert")).toBe(true);
    // Then check whitelist
    expect(shouldExcludeSelector(options, ".convert-this")).toBe(false);
    expect(shouldExcludeSelector(options, ".normal")).toBe(true);
  });

  it("should handle regex patterns correctly", () => {
    const options = {
      ...DEFAULT_OPTIONS,
      selectorWhitelist: [/^\.prefix-/, /suffix$/],
    };
    expect(shouldExcludeSelector(options, ".prefix-test")).toBe(false);
    expect(shouldExcludeSelector(options, ".test-suffix")).toBe(false);
    expect(shouldExcludeSelector(options, ".normal")).toBe(true);
  });
});
