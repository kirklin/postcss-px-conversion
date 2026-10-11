import { describe, expect, it } from "vitest";
import { EXAMPLES } from "../src/lib/examples";
import { createOptions } from "../src/lib/options";
import { decodeState, encodeState, LinkError, stateFromExample } from "../src/lib/share";

async function encodeJson(value: unknown): Promise<string> {
  // A link made by hand, with the same compression the playground uses
  const stream = new Blob([JSON.stringify(value)]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

describe("share links", () => {
  it("bring back the same code and options", async () => {
    const state = {
      ...stateFromExample(EXAMPLES[0]),
      css: ".a { width: 10px; } /* 中文 */",
      options: createOptions({ viewportWidth: 750, selectorBlacklist: ["/^\\.x/"] }),
    };
    const text = await encodeState(state);

    expect(text).toMatch(/^[\w-]+$/);
    expect(await decodeState(text)).toEqual(state);
  });

  it("fill in options that older links leave out", async () => {
    const state = stateFromExample(EXAMPLES[0]);
    const text = await encodeJson({ ...state, options: { viewportWidth: 750 } });

    expect((await decodeState(text)).options).toEqual(createOptions({ viewportWidth: 750 }));
  });

  it("reject links that are broken or hold the wrong data", async () => {
    const state = stateFromExample(EXAMPLES[0]);
    const problem = (text: string) => decodeState(text).then(() => undefined, (error: unknown) => {
      expect(error).toBeInstanceOf(LinkError);
      return (error as LinkError).problem;
    });
    const valid = await encodeState(state);

    expect(await problem("not a link")).toEqual({ kind: "damaged" });
    expect(await problem("broken")).toEqual({ kind: "damaged" });
    expect(await problem(valid.slice(0, -8))).toEqual({ kind: "damaged" });
    expect(await problem(await encodeJson([]))).toEqual({ kind: "empty" });
    expect(await problem(await encodeJson({ ...state, options: { viewportWidth: "750" } }))).toEqual({ kind: "wrongType", key: "viewportWidth" });
    expect(await problem(await encodeJson({ ...state, css: 1 }))).toEqual({ kind: "wrongType", key: "css" });
    expect(await problem(await encodeJson({ ...state, example: "gone" }))).toEqual({ kind: "unknownExample", id: "gone" });
    await expect(decodeState(await encodeJson({ ...state, example: "gone" }))).rejects.toThrow("There is no example called \"gone\"");
  });
});
