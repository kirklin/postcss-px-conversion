import { createRequire } from "node:module";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

type PostcssPxConversion = typeof import("../src").default;

const require = createRequire(import.meta.url);

describe("built package", () => {
  it("exports the plugin creator as module.exports for require()", () => {
    const plugin = require("../dist/index.cjs") as PostcssPxConversion;
    expect(typeof plugin).toBe("function");
    expect(plugin.postcss).toBe(true);
    expect(postcss([plugin({ viewportWidth: 750 })]).process(".a { width: 75px }", { from: undefined }).css).toBe(".a { width: 10vw }");
  });

  it("exports the plugin creator as the default export for import", async () => {
    // A computed specifier, so type checking does not need the build output.
    const entry = new URL("../dist/index.mjs", import.meta.url).href;
    const { default: plugin } = await import(entry) as { default: PostcssPxConversion };
    expect(plugin.postcss).toBe(true);
    expect(postcss([plugin({ viewportWidth: 750 })]).process(".a { width: 75px }", { from: undefined }).css).toBe(".a { width: 10vw }");
  });

  it("works when PostCSS calls the creator itself", () => {
    const plugin = require("../dist/index.cjs") as PostcssPxConversion;
    expect(postcss([plugin]).process(".a { width: 75px }", { from: undefined }).css).toBe(".a { width: 20vw }");
  });
});
