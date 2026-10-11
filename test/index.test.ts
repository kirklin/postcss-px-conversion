import { describe, expect, it } from "vitest";
import { DEFAULT_OPTIONS } from "../src/constants";
import { shouldExcludeSelectors } from "../src/utils";

describe("selector whitelist and blacklist", () => {
  it("should handle empty whitelist and blacklist", () => {
    const options = { ...DEFAULT_OPTIONS };
    expect(shouldExcludeSelectors(options, [".test"])).toBe(false);
  });

  it("should exclude selectors in blacklist", () => {
    const options = {
      ...DEFAULT_OPTIONS,
      selectorBlacklist: ["ignore", /^\.ignore-/],
    };
    expect(shouldExcludeSelectors(options, [".ignore-this"])).toBe(true);
    expect(shouldExcludeSelectors(options, ["button.ignore"])).toBe(true);
    expect(shouldExcludeSelectors(options, [".normal"])).toBe(false);
  });

  it("should only include selectors in whitelist when specified", () => {
    const options = {
      ...DEFAULT_OPTIONS,
      selectorWhitelist: ["convert", /^\.convert-/],
    };
    expect(shouldExcludeSelectors(options, [".convert-this"])).toBe(false);
    expect(shouldExcludeSelectors(options, ["button.convert"])).toBe(false);
    expect(shouldExcludeSelectors(options, [".normal"])).toBe(true);
  });

  it("should handle both whitelist and blacklist", () => {
    const options = {
      ...DEFAULT_OPTIONS,
      selectorBlacklist: ["ignore", /^\.ignore-/],
      selectorWhitelist: ["convert", /^\.convert-/],
    };
    // Blacklist takes precedence
    expect(shouldExcludeSelectors(options, [".ignore-convert"])).toBe(true);
    // Then check whitelist
    expect(shouldExcludeSelectors(options, [".convert-this"])).toBe(false);
    expect(shouldExcludeSelectors(options, [".normal"])).toBe(true);
  });

  it("should handle regex patterns correctly", () => {
    const options = {
      ...DEFAULT_OPTIONS,
      selectorWhitelist: [/^\.prefix-/, /suffix$/],
    };
    expect(shouldExcludeSelectors(options, [".prefix-test"])).toBe(false);
    expect(shouldExcludeSelectors(options, [".test-suffix"])).toBe(false);
    expect(shouldExcludeSelectors(options, [".normal"])).toBe(true);
  });

  it("should check every selector around a declaration", () => {
    const options = {
      ...DEFAULT_OPTIONS,
      selectorBlacklist: ["ignore"],
      selectorWhitelist: ["convert"],
    };
    expect(shouldExcludeSelectors(options, [".child", ".convert"])).toBe(false);
    expect(shouldExcludeSelectors(options, [".convert", ".ignore"])).toBe(true);
    expect(shouldExcludeSelectors(options, [".child", ".normal"])).toBe(true);
  });
});
