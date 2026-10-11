import { describe, expect, it } from "vitest";
import { convert } from "../src/lib/convert";
import { exampleById, EXAMPLES } from "../src/lib/examples";
import { DEFAULT_PLAYGROUND_OPTIONS, toPluginOptions } from "../src/lib/options";
import { stateFromExample } from "../src/lib/share";

describe("examples", () => {
  it("have their own ids and only known options", () => {
    expect(new Set(EXAMPLES.map(example => example.id)).size).toBe(EXAMPLES.length);
    for (const example of EXAMPLES) {
      expect(Object.keys(example.options).filter(key => !(key in DEFAULT_PLAYGROUND_OPTIONS))).toEqual([]);
      expect(exampleById(example.id)).toBe(example);
    }
    expect(() => exampleById("gone")).toThrow("There is no example called \"gone\"");
  });

  it.each(EXAMPLES.map(example => [example.id, example] as const))("%s converts without warnings", (_, example) => {
    const state = stateFromExample(example);
    const result = convert(state.css, toPluginOptions(state.options), state.file);

    expect(result.converted.length).toBeGreaterThan(0);
    expect(result.warnings).toEqual([]);
  });

  it("show what each one is about in its output", () => {
    const output = (id: string) => {
      const state = stateFromExample(exampleById(id));
      return convert(state.css, toPluginOptions(state.options), state.file).css;
    };

    expect(output("mobile")).toContain("width: 8.53333vw;");
    expect(output("media-queries")).toMatch(/@media \(min-width: 600px\) \{\n {2}\.gallery \{\n {4}grid-template-columns: repeat\(2, 1fr\);\n {4}gap: 4.26667vw;/);
    expect(output("landscape")).toContain("@media (orientation: landscape)");
    expect(output("width-comment")).toContain("padding: 5.33333vw;");
    expect(output("left-alone")).toContain("font-size: 20px;");
    expect(output("left-alone")).toContain("height: 48px;");
    expect(output("rem-to-px")).toContain("padding: 16px;");
    expect(output("rem-to-px")).toContain("@media (width >= 40rem)");
    expect(output("mini-program")).toContain("width: 192rpx;");
  });
});
